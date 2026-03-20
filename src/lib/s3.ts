import { S3Client } from "@aws-sdk/client-s3";

export function createS3Client(): S3Client {
  const endpoint = process.env.SUPABASE_S3_ENDPOINT;
  const region = process.env.SUPABASE_S3_REGION ?? "ap-northeast-1";
  const accessKeyId = process.env.SUPABASE_S3_ACCESS_KEY;
  const secretAccessKey = process.env.SUPABASE_S3_SECRET_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing Supabase S3 env vars: SUPABASE_S3_ENDPOINT, SUPABASE_S3_ACCESS_KEY, SUPABASE_S3_SECRET_KEY",
    );
  }

  return new S3Client({
    forcePathStyle: true,
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

let _client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!_client) _client = createS3Client();
  return _client;
}
