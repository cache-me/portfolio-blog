"use client";

import { useCallback, useRef } from "react";
import { CheckCircle2, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUpload, type UseUploadOptions } from "@/hooks/use-upload";

type FileUploadProps = UseUploadOptions & {
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  hint?: string;
  className?: string;
  onUploadComplete?: (result: { id: string; url: string }) => void;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileUpload({
  accept,
  maxSizeMB = 10,
  label = "Click to upload or drag and drop",
  hint,
  className,
  onUploadComplete,
  ...uploadOptions
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { state, upload, cancel, reset } = useUpload({
    ...uploadOptions,
    onSuccess: onUploadComplete,
  });

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File is too large. Maximum size is ${maxSizeMB} MB.`);
        return;
      }
      await upload(file);
    },
    [upload, maxSizeMB],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault();

  const isIdle = state.status === "idle";
  const isBusy =
    state.status === "requesting" ||
    state.status === "uploading" ||
    state.status === "confirming";

  return (
    <div className={cn("w-full space-y-2", className)}>
      {(isIdle || state.status === "error") && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors cursor-pointer",
            "hover:border-primary/60 hover:bg-muted/30",
            state.status === "error"
              ? "border-destructive/60 bg-destructive/5"
              : "border-muted-foreground/25 bg-muted/10",
          )}
        >
          <div className="rounded-full bg-muted p-3">
            <Upload className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">{label}</p>
            {hint && (
              <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
            )}
            {state.status === "error" && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {state.message}
              </p>
            )}
          </div>
        </div>
      )}

      {isBusy && (
        <div className="rounded-lg border bg-muted/20 px-4 py-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Loader2 className="size-4 text-muted-foreground shrink-0 animate-spin" />
              <span className="text-sm text-muted-foreground truncate">
                {state.status === "requesting" && "Preparing upload…"}
                {state.status === "uploading" &&
                  `Uploading… ${state.progress}%`}
                {state.status === "confirming" && "Finalising…"}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              onClick={cancel}
            >
              <X className="size-3.5" />
            </Button>
          </div>
          {state.status === "uploading" && (
            <Progress value={state.progress} className="h-1.5" />
          )}
        </div>
      )}

      {state.status === "done" && (
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-emerald-500/5 border-emerald-200 dark:border-emerald-800 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <a
              href={state.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-emerald-700 dark:text-emerald-400 truncate hover:underline"
            >
              {state.url.split("/").pop()}
            </a>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={reset}
            title="Upload another file"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleInputChange}
      />
    </div>
  );
}
