"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, X, FileText, ImageIcon } from "lucide-react";
import { formatBytes } from "@/lib/utils";

export interface UploadedFile {
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

interface FileUploadProps {
  accept: "image" | "file";
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
}

const IMAGE_ACCEPT = ".png,.jpg,.jpeg,.gif,.webp,.svg";
const FILE_ACCEPT = ".pdf,.txt,.md,.json,.yaml,.yml,.xml,.csv,.toml,.ini";

export function FileUpload({ accept, value, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const acceptAttr = accept === "image" ? IMAGE_ACCEPT : FILE_ACCEPT;
  const isImage = accept === "image";

  async function uploadFile(file: File) {
    setError(null);
    setUploading(true);
    setProgress(0);

    if (isImage && file.type.startsWith("image/") && file.type !== "image/svg+xml") {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    const result = await new Promise<UploadedFile | string>((resolve) => {
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText) as UploadedFile);
        } else {
          try {
            resolve((JSON.parse(xhr.responseText) as { error: string }).error);
          } catch {
            resolve("Upload failed");
          }
        }
      };
      xhr.onerror = () => resolve("Upload failed");
      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    });

    setUploading(false);

    if (typeof result === "string") {
      setError(result);
      setPreviewUrl(null);
      return;
    }

    onChange(result);
  }

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      uploadFile(files[0]);
    },
    [accept]
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function clear() {
    onChange(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (value) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-3">
        {previewUrl ? (
          <div className="relative mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={value.fileName}
              className="rounded-md max-h-48 w-full object-contain bg-[#1e1e1e]"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-2">
            {isImage ? (
              <ImageIcon className="size-8 text-muted-foreground shrink-0" />
            ) : (
              <FileText className="size-8 text-muted-foreground shrink-0" />
            )}
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{value.fileName}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(value.fileSize)}</p>
          </div>
          <button
            onClick={clear}
            className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Remove file"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div
        className={`relative rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptAttr}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <Upload className="size-8 text-muted-foreground mb-2" />
          {uploading ? (
            <div className="w-full max-w-xs space-y-1.5">
              <p className="text-sm text-muted-foreground">Uploading… {progress}%</p>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium">Drop {isImage ? "an image" : "a file"} here</p>
              <p className="text-xs text-muted-foreground mt-0.5">or click to browse</p>
              <p className="text-xs text-muted-foreground mt-2">
                {isImage ? "PNG, JPG, GIF, WebP, SVG up to 5 MB" : "PDF, TXT, MD, JSON, YAML, XML, CSV, TOML up to 10 MB"}
              </p>
            </>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
