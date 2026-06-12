"use client";

import { X } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { FileUploadInput } from "@/components/files/FileUploadInput";
import { FilePreview } from "@/components/files/FilePreview";
import type { UploadedFile } from "@/hooks/useFileUpload";

export type { UploadedFile };

interface FileUploadProps {
  accept: "image" | "file";
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
}

export function FileUpload({ accept, value, onChange }: FileUploadProps) {
  const { uploading, progress, error, previewUrl, handleUpload, clearPreview } = useFileUpload();
  const isImage = accept === "image";

  async function onFile(file: File) {
    const result = await handleUpload(file, isImage);
    if (result) onChange(result);
  }

  function clear() {
    onChange(null);
    clearPreview();
  }

  if (value) {
    return (
      <div className="relative">
        <FilePreview
          fileUrl={value.key}
          fileName={value.fileName}
          fileSize={value.fileSize}
          previewUrl={previewUrl}
          isImage={isImage}
        />
        <button
          onClick={clear}
          className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label="Remove file"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <FileUploadInput
      accept={accept}
      uploading={uploading}
      progress={progress}
      error={error}
      onFile={onFile}
    />
  );
}
