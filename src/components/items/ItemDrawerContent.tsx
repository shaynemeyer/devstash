"use client";

import { Tag, FolderOpen, Calendar, FileText, Download } from "lucide-react";
import { CodeEditor } from "@/components/ui/CodeEditor";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { FileUpload } from "@/components/ui/FileUpload";
import { formatBytes } from "@/lib/utils";
import type { UploadedFile } from "@/components/ui/FileUpload";
import type { ItemDetail } from "@/lib/db/items";

const CONTENT_TYPES = ["Snippet", "Prompt", "Command", "Note"];
const LANGUAGE_TYPES = ["Snippet", "Command"];
const CODE_TYPES = ["Snippet", "Command"];
const MARKDOWN_TYPES = ["Note", "Prompt"];
const FILE_UPLOAD_TYPES = ["File", "Image"];

interface ItemDrawerContentProps {
  item: ItemDetail;
  editMode: boolean;
  description: string;
  onDescriptionChange: (value: string) => void;
  content: string;
  onContentChange: (value: string) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  url: string;
  onUrlChange: (value: string) => void;
  tagsInput: string;
  onTagsInputChange: (value: string) => void;
  uploadedFile: UploadedFile | null;
  onUploadedFileChange: (value: UploadedFile | null) => void;
}

export function ItemDrawerContent({
  item,
  editMode,
  description,
  onDescriptionChange,
  content,
  onContentChange,
  language,
  onLanguageChange,
  url,
  onUrlChange,
  tagsInput,
  onTagsInputChange,
  uploadedFile,
  onUploadedFileChange,
}: ItemDrawerContentProps) {
  const showContent = CONTENT_TYPES.includes(item.typeName);
  const showLanguage = LANGUAGE_TYPES.includes(item.typeName);
  const showUrl = item.typeName === "Link";
  const showFileSection = FILE_UPLOAD_TYPES.includes(item.typeName);
  const useCodeEditor = CODE_TYPES.includes(item.typeName);
  const useMarkdownEditor = MARKDOWN_TYPES.includes(item.typeName);

  const created = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const updated = new Date(item.updatedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
      {/* Description */}
      {editMode ? (
        <section>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            Description
          </p>
          <textarea
            className="w-full rounded-md bg-muted p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            rows={3}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Optional description"
          />
        </section>
      ) : (
        item.description && (
          <section>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Description
            </p>
            <p className="text-sm text-foreground">{item.description}</p>
          </section>
        )
      )}

      {/* Content */}
      {editMode && showContent ? (
        <section>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            Content
          </p>
          {useCodeEditor ? (
            <CodeEditor value={content} onChange={onContentChange} language={language || "plaintext"} />
          ) : useMarkdownEditor ? (
            <MarkdownEditor value={content} onChange={onContentChange} />
          ) : (
            <textarea
              className="w-full rounded-lg bg-muted p-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              rows={8}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Content"
            />
          )}
        </section>
      ) : (
        !editMode && item.content && (
          <section>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Content
            </p>
            {useCodeEditor ? (
              <CodeEditor value={item.content} language={item.language || "plaintext"} readOnly />
            ) : useMarkdownEditor ? (
              <MarkdownEditor value={item.content} readOnly />
            ) : (
              <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                <code>{item.content}</code>
              </pre>
            )}
          </section>
        )
      )}

      {/* Language */}
      {editMode && showLanguage && (
        <section>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            Language
          </p>
          <input
            className="w-full rounded-md bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            placeholder="e.g. TypeScript"
          />
        </section>
      )}

      {/* URL */}
      {editMode && showUrl ? (
        <section>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            URL
          </p>
          <input
            className="w-full rounded-md bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://"
            type="url"
          />
        </section>
      ) : (
        !editMode && item.url && (
          <section>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              URL
            </p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline-offset-2 hover:underline break-all"
            >
              {item.url}
            </a>
          </section>
        )
      )}

      {/* File / Image */}
      {showFileSection &&
        (editMode ? (
          <section>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              File
            </p>
            <FileUpload
              accept={item.typeName === "Image" ? "image" : "file"}
              value={uploadedFile}
              onChange={onUploadedFileChange}
            />
          </section>
        ) : item.fileUrl ? (
          <section>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              File
            </p>
            {item.typeName === "Image" ? (
              <div className="rounded-lg overflow-hidden border border-border bg-[#1e1e1e]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/files/${item.fileUrl}`}
                  alt={item.fileName ?? item.title}
                  className="w-full max-h-64 object-contain"
                />
                {item.fileName && (
                  <div className="px-3 py-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground truncate">{item.fileName}</span>
                    {item.fileSize != null && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatBytes(item.fileSize)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/50 p-3 flex items-center gap-3">
                <FileText className="size-8 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.fileName ?? "File"}</p>
                  {item.fileSize != null && (
                    <p className="text-xs text-muted-foreground">{formatBytes(item.fileSize)}</p>
                  )}
                </div>
                <a
                  href={`/api/files/${item.fileUrl}`}
                  download={item.fileName ?? true}
                  className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Download file"
                >
                  <Download className="size-4" />
                </a>
              </div>
            )}
          </section>
        ) : null)}

      {/* Tags */}
      {editMode ? (
        <section>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Tag className="size-3 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tags</p>
          </div>
          <input
            className="w-full rounded-md bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={tagsInput}
            onChange={(e) => onTagsInputChange(e.target.value)}
            placeholder="react, hooks, typescript"
          />
          <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
        </section>
      ) : (
        item.tags.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Tag className="size-3 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tags</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: item.typeColor + "22", color: item.typeColor }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )
      )}

      {/* Collections */}
      {item.collections.length > 0 && (
        <section>
          <div className="flex items-center gap-1.5 mb-1.5">
            <FolderOpen className="size-3 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Collections
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {item.collections.map((col) => (
              <span key={col} className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                {col}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Dates */}
      <section>
        <div className="flex items-center gap-1.5 mb-2">
          <Calendar className="size-3 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Details</p>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Created</span>
            <span className="text-foreground">{created}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Updated</span>
            <span className="text-foreground">{updated}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
