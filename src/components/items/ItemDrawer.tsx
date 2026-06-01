"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Pin, Copy, Pencil, Trash2, Calendar, FolderOpen, Tag, X, Check, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import { updateItem, deleteItem } from "@/actions/items";
import { CodeEditor } from "@/components/ui/CodeEditor";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { FileUpload } from "@/components/ui/FileUpload";
import type { UploadedFile } from "@/components/ui/FileUpload";
import type { ItemDetail } from "@/lib/db/items";

const CONTENT_TYPES = ["Snippet", "Prompt", "Command", "Note"];
const LANGUAGE_TYPES = ["Snippet", "Command"];
const CODE_TYPES = ["Snippet", "Command"];
const MARKDOWN_TYPES = ["Note", "Prompt"];
const FILE_UPLOAD_TYPES = ["File", "Image"];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ItemDrawerProps {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemDrawer({ itemId, open, onOpenChange }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !itemId) return;
    setLoading(true);
    setItem(null);
    fetch(`/api/items/${itemId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setItem(data))
      .finally(() => setLoading(false));
  }, [open, itemId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        {loading && <DrawerSkeleton />}
        {!loading && item && (
          <DrawerBody item={item} onItemChange={setItem} onClose={() => onOpenChange(false)} />
        )}
      </SheetContent>
    </Sheet>
  );
}

function DrawerBody({
  item,
  onItemChange,
  onClose,
}: {
  item: ItemDetail;
  onItemChange: (item: ItemDetail) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const Icon = getIcon(item.typeIcon);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [content, setContent] = useState(item.content ?? "");
  const [url, setUrl] = useState(item.url ?? "");
  const [language, setLanguage] = useState(item.language ?? "");
  const [tagsInput, setTagsInput] = useState(item.tags.join(", "));
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(
    item.fileUrl ? { key: item.fileUrl, fileName: item.fileName ?? "", fileSize: item.fileSize ?? 0, mimeType: "" } : null
  );

  useEffect(() => {
    setEditMode(false);
    setTitle(item.title);
    setDescription(item.description ?? "");
    setContent(item.content ?? "");
    setUrl(item.url ?? "");
    setLanguage(item.language ?? "");
    setTagsInput(item.tags.join(", "));
    setUploadedFile(
      item.fileUrl ? { key: item.fileUrl, fileName: item.fileName ?? "", fileSize: item.fileSize ?? 0, mimeType: "" } : null
    );
  }, [item.id]);

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

  function enterEdit() {
    setTitle(item.title);
    setDescription(item.description ?? "");
    setContent(item.content ?? "");
    setUrl(item.url ?? "");
    setLanguage(item.language ?? "");
    setTagsInput(item.tags.join(", "));
    setUploadedFile(
      item.fileUrl ? { key: item.fileUrl, fileName: item.fileName ?? "", fileSize: item.fileSize ?? 0, mimeType: "" } : null
    );
    setEditMode(true);
  }

  function cancelEdit() {
    setEditMode(false);
  }

  async function save() {
    setSaving(true);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await updateItem(item.id, {
      title: title.trim(),
      description: description.trim() || null,
      content: content || null,
      url: url.trim() || null,
      language: language.trim() || null,
      tags,
      fileUrl: uploadedFile?.key ?? null,
      fileName: uploadedFile?.fileName ?? null,
      fileSize: uploadedFile?.fileSize ?? null,
    });

    setSaving(false);

    if (!result.success || !result.data) {
      toast.error(result.error ?? "Failed to save");
      return;
    }

    onItemChange(result.data);
    setEditMode(false);
    toast.success("Item saved");
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteItem(item.id);
    setDeleting(false);
    if (!result.success) {
      toast.error(result.error ?? "Failed to delete item");
      return;
    }
    toast.success("Item deleted");
    onClose();
    router.refresh();
  }

  function copyContent() {
    const text = item.content ?? item.url ?? item.fileUrl ?? item.title;
    navigator.clipboard.writeText(text ?? "");
  }

  const showContent = CONTENT_TYPES.includes(item.typeName);
  const showLanguage = LANGUAGE_TYPES.includes(item.typeName);
  const showUrl = item.typeName === "Link";
  const showFileSection = FILE_UPLOAD_TYPES.includes(item.typeName);
  const useCodeEditor = CODE_TYPES.includes(item.typeName);
  const useMarkdownEditor = MARKDOWN_TYPES.includes(item.typeName);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <SheetHeader className="px-5 pt-5 pb-4 border-b border-border gap-3">
        <div className="flex items-center gap-3 pr-8">
          <div
            className="size-9 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: item.typeColor + "22" }}
          >
            <Icon className="size-4" style={{ color: item.typeColor }} />
          </div>
          {editMode ? (
            <input
              className="flex-1 text-base font-semibold bg-transparent border-b border-border focus:outline-none focus:border-primary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              autoFocus
            />
          ) : (
            <SheetTitle className="text-base font-semibold leading-tight">{item.title}</SheetTitle>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded-md font-medium"
            style={{ backgroundColor: item.typeColor + "22", color: item.typeColor }}
          >
            {item.typeName}
          </span>
          {!editMode && item.language && (
            <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-muted text-muted-foreground">
              {item.language}
            </span>
          )}
        </div>
      </SheetHeader>

      {/* Action bar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border">
        {editMode ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground"
              onClick={cancelEdit}
            >
              <X className="size-3.5" />
              Cancel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-primary"
              onClick={save}
              disabled={saving || !title.trim()}
            >
              <Check className="size-3.5" />
              {saving ? "Saving…" : "Save"}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1.5 text-xs ${item.isFavorite ? "text-amber-400" : "text-muted-foreground"}`}
            >
              <Star className={`size-3.5 ${item.isFavorite ? "fill-amber-400" : ""}`} />
              Favorite
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1.5 text-xs ${item.isPinned ? "text-foreground" : "text-muted-foreground"}`}
            >
              <Pin className="size-3.5" />
              Pin
            </Button>
            {!showFileSection && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground"
                onClick={copyContent}
              >
                <Copy className="size-3.5" />
                Copy
              </Button>
            )}
            {showFileSection && item.fileUrl && (
              <a
                href={`/api/files/${item.fileUrl}`}
                download={item.fileName ?? true}
                className="inline-flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors font-medium h-8"
              >
                <Download className="size-3.5" />
                Download
              </a>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground"
              onClick={enterEdit}
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
            <div className="flex-1" />
            <AlertDialog>
              <AlertDialogTrigger
                render={<Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" disabled={deleting} />}
              >
                <Trash2 className="size-3.5" />
                <span className="sr-only">Delete</span>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete item?</AlertDialogTitle>
                  <AlertDialogDescription>
                    &ldquo;{item.title}&rdquo; will be permanently deleted. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>

      {/* Body */}
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
              onChange={(e) => setDescription(e.target.value)}
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
              <CodeEditor
                value={content}
                onChange={setContent}
                language={language || "plaintext"}
              />
            ) : useMarkdownEditor ? (
              <MarkdownEditor value={content} onChange={setContent} />
            ) : (
              <textarea
                className="w-full rounded-lg bg-muted p-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
                <CodeEditor
                  value={item.content}
                  language={item.language || "plaintext"}
                  readOnly
                />
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
              onChange={(e) => setLanguage(e.target.value)}
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
              onChange={(e) => setUrl(e.target.value)}
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

        {/* File */}
        {showFileSection && (
          editMode ? (
            <section>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                File
              </p>
              <FileUpload
                accept={item.typeName === "Image" ? "image" : "file"}
                value={uploadedFile}
                onChange={setUploadedFile}
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
                        <span className="text-xs text-muted-foreground shrink-0">{formatBytes(item.fileSize)}</span>
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
          ) : null
        )}

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
              onChange={(e) => setTagsInput(e.target.value)}
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

        {/* Collections — display only */}
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

        {/* Dates — display only */}
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
    </div>
  );
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="px-5 pt-5 pb-4 border-b border-border space-y-3">
        <div className="flex items-center gap-3 pr-8">
          <div className="size-9 rounded-md bg-muted shrink-0" />
          <div className="h-5 bg-muted rounded w-48" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 bg-muted rounded w-16" />
          <div className="h-5 bg-muted rounded w-20" />
        </div>
      </div>
      <div className="flex gap-2 px-4 py-2 border-b border-border">
        {[80, 60, 64, 56].map((w) => (
          <div key={w} className="h-7 bg-muted rounded" style={{ width: w }} />
        ))}
      </div>
      <div className="px-5 py-4 space-y-5">
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-20" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-3/4" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-16" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
