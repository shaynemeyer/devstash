"use client";

import { FileText, ImageIcon, Download } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface FilePreviewProps {
  fileUrl: string;
  fileName?: string | null;
  fileSize?: number | null;
  previewUrl?: string | null;
  isImage: boolean;
  /** When true, shows a download link (view mode). When false, shows static icon (upload confirmation). */
  showDownload?: boolean;
}

export function FilePreview({ fileUrl, fileName, fileSize, previewUrl, isImage, showDownload = false }: FilePreviewProps) {
  const displayName = fileName ?? (isImage ? "Image" : "File");
  const src = previewUrl ?? (showDownload ? `/api/files/${fileUrl}` : null);

  if (isImage) {
    return (
      <div className="rounded-lg overflow-hidden border border-border bg-[#1e1e1e]">
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={displayName}
            className="w-full max-h-64 object-contain"
          />
        )}
        {!src && (
          <div className="flex items-center justify-center py-8">
            <ImageIcon className="size-8 text-muted-foreground" />
          </div>
        )}
        {fileName && (
          <div className="px-3 py-2 flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground truncate">{fileName}</span>
            {fileSize != null && (
              <span className="text-xs text-muted-foreground shrink-0">{formatBytes(fileSize)}</span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/50 p-3 flex items-center gap-3">
      <FileText className="size-8 text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{displayName}</p>
        {fileSize != null && (
          <p className="text-xs text-muted-foreground">{formatBytes(fileSize)}</p>
        )}
      </div>
      {showDownload && (
        <a
          href={`/api/files/${fileUrl}`}
          download={fileName ?? true}
          className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Download file"
        >
          <Download className="size-4" />
        </a>
      )}
    </div>
  );
}
