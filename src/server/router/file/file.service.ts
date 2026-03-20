import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { DB } from "@/server/db";
import {
  ALLOWED_MIME_TYPES,
  ALL_ALLOWED_MIME_TYPES,
  MAX_FILE_SIZES,
  type ConfirmUploadInput,
  type DeleteUploadInput,
  type ListUploadsInput,
  type RequestUploadInput,
} from "./file.input";
import { upload, uploadTypeEnum } from "@/db/schema/file";
import { getS3Client } from "@/lib/s3";

type UploadType = (typeof uploadTypeEnum.enumValues)[number];

const PRESIGN_EXPIRES_IN = 60 * 5; // 5 minutes

function detectType(mimeType: string): UploadType {
  for (const [type, mimes] of Object.entries(ALLOWED_MIME_TYPES)) {
    if ((mimes as readonly string[]).includes(mimeType)) {
      return type as UploadType;
    }
  }
  return "OTHER";
}

function buildStoragePath(fileName: string, id: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "bin";
  const safe = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");
  return `uploads/${id}/${safe}`;
}

function buildPublicUrl(bucket: string, storagePath: string): string {
  const base = process.env.SUPABASE_S3_ENDPOINT?.replace("/storage/v1/s3", "");
  return `${base}/storage/v1/object/public/${bucket}/${storagePath}`;
}

export class UploadService {
  constructor(private db: DB) {}

  async requestPresignedUrl(input: RequestUploadInput, userId: string) {
    const { fileName, mimeType, size, resourceType, resourceId } = input;
    const bucket =
      input.bucket ?? process.env.UPLOAD_DEFAULT_BUCKET ?? "uploads";

    if (!ALL_ALLOWED_MIME_TYPES.includes(mimeType as never)) {
      throw new Error(`VALIDATION: Unsupported file type: ${mimeType}`);
    }

    const type = detectType(mimeType);
    const maxSize = MAX_FILE_SIZES[type];
    if (size > maxSize) {
      const mb = (maxSize / 1024 / 1024).toFixed(0);
      throw new Error(
        `VALIDATION: File exceeds maximum size of ${mb} MB for type ${type}`,
      );
    }

    const id = nanoid();
    const storagePath = buildStoragePath(fileName, id);

    const [record] = await this.db
      .insert(upload)
      .values({
        id,
        fileName,
        mimeType,
        size,
        type,
        status: "PENDING",
        storagePath,
        bucket,
        uploadedById: userId,
        resourceType: resourceType ?? null,
        resourceId: resourceId ?? null,
      })
      .returning();

    const s3 = getS3Client();
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: storagePath,
      ContentType: mimeType,
      ContentLength: size,
    });

    const presignedUrl = await getSignedUrl(s3, command, {
      expiresIn: PRESIGN_EXPIRES_IN,
    });

    return {
      id: record.id,
      presignedUrl,
      storagePath,
      expiresIn: PRESIGN_EXPIRES_IN,
    };
  }

  async confirmUpload(input: ConfirmUploadInput, userId: string) {
    const [record] = await this.db
      .select()
      .from(upload)
      .where(and(eq(upload.id, input.id), eq(upload.uploadedById, userId)))
      .limit(1);

    if (!record) throw new Error("NOT_FOUND: Upload record not found");
    if (record.status !== "PENDING") {
      throw new Error(`VALIDATION: Upload is already ${record.status}`);
    }

    const publicUrl = buildPublicUrl(record.bucket, record.storagePath);

    const [updated] = await this.db
      .update(upload)
      .set({ status: "UPLOADED", publicUrl, updatedAt: new Date() })
      .where(eq(upload.id, input.id))
      .returning();

    return updated;
  }

  async failUpload(id: string, userId: string) {
    const [record] = await this.db
      .select()
      .from(upload)
      .where(and(eq(upload.id, id), eq(upload.uploadedById, userId)))
      .limit(1);

    if (!record) throw new Error("NOT_FOUND: Upload record not found");

    await this.db
      .update(upload)
      .set({ status: "FAILED", updatedAt: new Date() })
      .where(eq(upload.id, id));

    return { success: true };
  }

  async deleteUpload(
    input: DeleteUploadInput,
    userId: string,
    isAdmin = false,
  ) {
    const conditions = isAdmin
      ? [eq(upload.id, input.id)]
      : [eq(upload.id, input.id), eq(upload.uploadedById, userId)];

    const [record] = await this.db
      .select()
      .from(upload)
      .where(and(...conditions))
      .limit(1);

    if (!record) throw new Error("NOT_FOUND: Upload record not found");

    try {
      const s3 = getS3Client();
      await s3.send(
        new DeleteObjectCommand({
          Bucket: record.bucket,
          Key: record.storagePath,
        }),
      );
    } catch (err) {
      console.error("[UploadService] S3 delete failed:", err);
    }

    await this.db
      .update(upload)
      .set({ status: "DELETED", updatedAt: new Date() })
      .where(eq(upload.id, input.id));

    return { success: true };
  }

  async getById(id: string) {
    const [record] = await this.db
      .select()
      .from(upload)
      .where(eq(upload.id, id))
      .limit(1);
    if (!record) throw new Error("NOT_FOUND: Upload not found");
    return record;
  }

  async list(input: ListUploadsInput, userId: string, isAdmin = false) {
    const limit = input.limit ?? 20;
    const offset = ((input.page ?? 1) - 1) * limit;

    const conditions = [
      !isAdmin ? eq(upload.uploadedById, userId) : undefined,
      eq(upload.status, input.status ?? "UPLOADED"),
      input.type ? eq(upload.type, input.type) : undefined,
      input.resourceType
        ? eq(upload.resourceType, input.resourceType)
        : undefined,
      input.resourceId ? eq(upload.resourceId, input.resourceId) : undefined,
    ].filter(Boolean) as ReturnType<typeof eq>[];

    return this.db
      .select()
      .from(upload)
      .where(and(...conditions))
      .orderBy(desc(upload.createdAt))
      .limit(limit)
      .offset(offset);
  }
}
