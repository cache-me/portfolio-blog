"use client";

import { useCallback, useRef, useState } from "react";
import { orpcClient } from "@/lib/client";

// ── Types ──────────────────────────────────────────────────────────────────────

export type UploadState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "uploading"; progress: number }
  | { status: "confirming" }
  | { status: "done"; url: string; id: string }
  | { status: "error"; message: string };

export type UseUploadOptions = {
  resourceType?: string;
  resourceId?: string;
  bucket?: string;
  onSuccess?: (result: { id: string; url: string }) => void;
  onError?: (message: string) => void;
};

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useUpload(options: UseUploadOptions = {}) {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setState({ status: "requesting" });

      // ── Step 1: request presigned URL ──
      let presignData: {
        id: string;
        presignedUrl: string;
        storagePath: string;
        expiresIn: number;
      };

      try {
        presignData = await orpcClient.file.requestPresignedUrl({
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          resourceType: options.resourceType,
          resourceId: options.resourceId,
          bucket: options.bucket,
        });
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to request upload URL";
        setState({ status: "error", message: msg });
        options.onError?.(msg);
        return null;
      }

      // ── Step 2: PUT file directly to Supabase S3 ──
      try {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhrRef.current = xhr;

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded / e.total) * 100);
              setState({ status: "uploading", progress });
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.onabort = () => reject(new Error("Upload cancelled"));

          xhr.open("PUT", presignData.presignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });
      } catch (err: unknown) {
        // Mark the record as failed in the DB
        try {
          await orpcClient.file.fail({ id: presignData.id });
        } catch {
          // best-effort
        }

        const msg = err instanceof Error ? err.message : "Upload failed";
        setState({ status: "error", message: msg });
        options.onError?.(msg);
        return null;
      }

      // ── Step 3: confirm upload ──
      setState({ status: "confirming" });

      try {
        const confirmed = await orpcClient.file.confirm({
          id: presignData.id,
        });
        const result = { id: confirmed.id, url: confirmed.publicUrl! };
        setState({ status: "done", url: result.url, id: result.id });
        options.onSuccess?.(result);
        return result;
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to confirm upload";
        setState({ status: "error", message: msg });
        options.onError?.(msg);
        return null;
      }
    },
    [options],
  );

  const cancel = useCallback(() => {
    xhrRef.current?.abort();
    setState({ status: "idle" });
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, upload, cancel, reset };
}
