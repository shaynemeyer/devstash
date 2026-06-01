"use client";

import {
  FileText,
  FileImage,
  FileCode,
  FileArchive,
  FileAudio,
  FileVideo,
  Download,
  File,
} from "lucide-react";
import { ItemWithMeta } from "@/lib/db/items";
import { formatBytes } from "@/lib/utils";

interface FileListRowProps {
  item: ItemWithMeta;
  onClick: () => void;
}

function getFileIcon(fileName: string | null) {
  if (!fileName) return <File className="size-5 text-muted-foreground" />;
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "avif"].includes(ext))
    return <FileImage className="size-5 text-pink-400" />;
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext))
    return <FileVideo className="size-5 text-blue-400" />;
  if (["mp3", "wav", "ogg", "flac", "aac"].includes(ext))
    return <FileAudio className="size-5 text-purple-400" />;
  if (["zip", "tar", "gz", "rar", "7z"].includes(ext))
    return <FileArchive className="size-5 text-amber-400" />;
  if (["ts", "tsx", "js", "jsx", "py", "go", "rs", "rb", "java", "c", "cpp", "json", "yaml", "yml", "toml"].includes(ext))
    return <FileCode className="size-5 text-emerald-400" />;
  if (["pdf", "doc", "docx", "txt", "md", "csv", "xlsx"].includes(ext))
    return <FileText className="size-5 text-sky-400" />;
  return <File className="size-5 text-muted-foreground" />;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function FileListRow({ item, onClick }: FileListRowProps) {
  const downloadUrl = item.fileUrl ? `/api/files/${item.fileUrl}` : null;

  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = item.fileName ?? item.title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
      onClick={onClick}
    >
      <div className="shrink-0">{getFileIcon(item.fileName)}</div>

      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <p className="text-sm font-medium text-foreground truncate flex-1">{item.fileName ?? item.title}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
          <span>{formatBytes(item.fileSize)}</span>
          <span>{formatDate(item.createdAt)}</span>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={!downloadUrl}
        className="shrink-0 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted disabled:pointer-events-none"
        title="Download"
      >
        <Download className="size-4 text-muted-foreground" />
      </button>
    </div>
  );
}
