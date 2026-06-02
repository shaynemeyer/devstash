"use client";

import { useEffect, useState } from "react";

export interface UploadedFile {
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

interface UseFileUploadResult {
  uploading: boolean;
  progress: number;
  error: string | null;
  previewUrl: string | null;
  handleUpload: (file: File, isImage: boolean) => Promise<UploadedFile | null>;
  clearPreview: () => void;
}

export function useFileUpload(): UseFileUploadResult {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function clearPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setProgress(0);
  }

  async function handleUpload(file: File, isImage: boolean): Promise<UploadedFile | null> {
    setError(null);
    setUploading(true);
    setProgress(0);

    if (isImage && file.type.startsWith("image/") && file.type !== "image/svg+xml") {
      setPreviewUrl(URL.createObjectURL(file));
    }

    const formData = new FormData();
    formData.append("file", file);

    const result = await new Promise<UploadedFile | string>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
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
      return null;
    }

    return result;
  }

  return { uploading, progress, error, previewUrl, handleUpload, clearPreview };
}
