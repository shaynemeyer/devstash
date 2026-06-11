"use client";

import { Tag, FolderOpen, Calendar } from "lucide-react";
import { CodeEditor } from "@/components/ui/CodeEditor";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { FileUpload } from "@/components/ui/FileUpload";
import { FilePreview } from "@/components/ui/FilePreview";
import { CollectionSelector } from "@/components/items/CollectionSelector";
import { LanguageSelect } from "@/components/items/LanguageSelect";
import { SuggestTagsButton } from "@/components/items/SuggestTagsButton";
import { GenerateDescriptionButton } from "@/components/items/GenerateDescriptionButton";
import type { UploadedFile } from "@/hooks/useFileUpload";
import type { ItemDetail } from "@/lib/db/items";

const CONTENT_TYPES = ["snippet", "prompt", "command", "note"];
const LANGUAGE_TYPES = ["snippet", "command"];
const CODE_TYPES = ["snippet", "command"];
const MARKDOWN_TYPES = ["note", "prompt"];
const FILE_UPLOAD_TYPES = ["file", "image"];

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
  collections: { id: string; name: string }[];
  collectionIds: string[];
  onCollectionIdsChange: (ids: string[]) => void;
  isPro: boolean;
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
  collections,
  collectionIds,
  onCollectionIdsChange,
  isPro,
}: ItemDrawerContentProps) {
  const typeName = item.typeName.toLowerCase();
  const showContent = CONTENT_TYPES.includes(typeName);
  const showLanguage = LANGUAGE_TYPES.includes(typeName);
  const showUrl = typeName === "link";
  const showFileSection = FILE_UPLOAD_TYPES.includes(typeName);
  const useCodeEditor = CODE_TYPES.includes(typeName);
  const useMarkdownEditor = MARKDOWN_TYPES.includes(typeName);

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
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Description
            </p>
            <GenerateDescriptionButton
              title={item.title}
              content={content}
              itemType={typeName}
              isPro={isPro}
              onGenerated={onDescriptionChange}
            />
          </div>
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

      {/* Language — edit mode, above content */}
      {editMode && showLanguage && (
        <section>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            Language
          </p>
          <LanguageSelect value={language} onChange={onLanguageChange} />
        </section>
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
              accept={typeName === "image" ? "image" : "file"}
              value={uploadedFile}
              onChange={onUploadedFileChange}
            />
          </section>
        ) : item.fileUrl ? (
          <section>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              File
            </p>
            <FilePreview
              fileUrl={item.fileUrl}
              fileName={item.fileName}
              fileSize={item.fileSize}
              isImage={typeName === "image"}
              showDownload
            />
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
          <SuggestTagsButton
            title={item.title}
            content={content}
            isPro={isPro}
            onAcceptTag={(tag) => {
              const existing = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
              if (!existing.includes(tag)) {
                onTagsInputChange(existing.length > 0 ? `${tagsInput.trim()}, ${tag}` : tag);
              }
            }}
          />
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

      {/* Collections — edit mode selector */}
      {editMode && (
        <CollectionSelector
          collections={collections}
          selected={collectionIds}
          onChange={onCollectionIdsChange}
        />
      )}

      {/* Collections — view mode */}
      {!editMode && item.collections.length > 0 && (
        <section>
          <div className="flex items-center gap-1.5 mb-1.5">
            <FolderOpen className="size-3 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Collections
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {item.collections.map((col) => (
              <span key={col.id} className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                {col.name}
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
