"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

interface FileUploadInputProps {
  accept: "image" | "file";
  uploading: boolean;
  progress: number;
  error: string | null;
  onFile: (file: File) => void;
}

const IMAGE_ACCEPT = ".png,.jpg,.jpeg,.gif,.webp,.svg";
const FILE_ACCEPT = ".pdf,.txt,.md,.json,.yaml,.yml,.xml,.csv,.toml,.ini";

export function FileUploadInput({ accept, uploading, progress, error, onFile }: FileUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const isImage = accept === "image";
  const acceptAttr = isImage ? IMAGE_ACCEPT : FILE_ACCEPT;

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    onFile(files[0]);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
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
                {isImage
                  ? "PNG, JPG, GIF, WebP, SVG up to 5 MB"
                  : "PDF, TXT, MD, JSON, YAML, XML, CSV, TOML up to 10 MB"}
              </p>
            </>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
