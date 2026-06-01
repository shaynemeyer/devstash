"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Check } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import { createItem } from "@/actions/items";
import { CodeEditor } from "@/components/ui/CodeEditor";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { FileUpload } from "@/components/ui/FileUpload";
import type { UploadedFile } from "@/components/ui/FileUpload";
import type { ItemTypeWithCount } from "@/lib/db/items";

const CREATABLE_TYPES = ["Snippet", "Prompt", "Command", "Note", "Link", "File", "Image"];
const CONTENT_TYPES = ["Snippet", "Prompt", "Command", "Note"];
const LANGUAGE_TYPES = ["Snippet", "Command"];
const CODE_TYPES = ["Snippet", "Command"];
const MARKDOWN_TYPES = ["Note", "Prompt"];
const FILE_TYPES = ["File", "Image"];

interface CreateItemDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTypes: ItemTypeWithCount[];
  defaultTypeId?: string;
}

export function CreateItemDrawer({ open, onOpenChange, itemTypes, defaultTypeId }: CreateItemDrawerProps) {
  const router = useRouter();
  const types = itemTypes.filter((t) => CREATABLE_TYPES.includes(t.name));

  const [selectedTypeId, setSelectedTypeId] = useState<string>(defaultTypeId ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedType = types.find((t) => t.id === selectedTypeId);
  const showContent = selectedType ? CONTENT_TYPES.includes(selectedType.name) : false;
  const showLanguage = selectedType ? LANGUAGE_TYPES.includes(selectedType.name) : false;
  const showUrl = selectedType?.name === "Link";
  const showFileUpload = selectedType ? FILE_TYPES.includes(selectedType.name) : false;
  const useCodeEditor = selectedType ? CODE_TYPES.includes(selectedType.name) : false;
  const useMarkdownEditor = selectedType ? MARKDOWN_TYPES.includes(selectedType.name) : false;
  const Icon = selectedType ? getIcon(selectedType.icon) : null;

  function reset() {
    setSelectedTypeId(defaultTypeId ?? "");
    setTitle("");
    setDescription("");
    setContent("");
    setUrl("");
    setLanguage("");
    setTagsInput("");
    setUploadedFile(null);
  }

  function handleOpenChange(val: boolean) {
    if (!val) reset();
    onOpenChange(val);
  }

  async function save() {
    if (!selectedType) return;
    setSaving(true);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await createItem({
      typeId: selectedType.id,
      typeName: selectedType.name,
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

    if (!result.success) {
      toast.error(result.error ?? "Failed to create item");
      return;
    }

    toast.success("Item created");
    handleOpenChange(false);
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-border gap-3">
            <div className="flex items-center gap-3 pr-8">
              {Icon && selectedType ? (
                <div
                  className="size-9 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: selectedType.color + "22" }}
                >
                  <Icon className="size-4" style={{ color: selectedType.color }} />
                </div>
              ) : (
                <div className="size-9 rounded-md bg-muted shrink-0" />
              )}
              <input
                className="flex-1 text-base font-semibold bg-transparent border-b border-border focus:outline-none focus:border-primary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Item title"
                autoFocus
              />
            </div>
            {/* Type selector */}
            <div className="flex flex-wrap gap-1.5">
              {types.map((t) => {
                const TIcon = getIcon(t.icon);
                const active = t.id === selectedTypeId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTypeId(t.id)}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium transition-colors"
                    style={
                      active
                        ? { backgroundColor: t.color + "33", color: t.color }
                        : { backgroundColor: "transparent", color: "var(--muted-foreground)" }
                    }
                  >
                    <TIcon className="size-3" />
                    {t.name}
                  </button>
                );
              })}
            </div>
          </SheetHeader>

          {/* Action bar */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground"
              onClick={() => handleOpenChange(false)}
            >
              <X className="size-3.5" />
              Cancel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-primary"
              onClick={save}
              disabled={saving || !title.trim() || !selectedTypeId || (showFileUpload && !uploadedFile)}
            >
              <Check className="size-3.5" />
              {saving ? "Saving…" : "Create"}
            </Button>
          </div>

          {/* Form body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
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

            {showContent && (
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
            )}

            {showLanguage && (
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

            {showUrl && (
              <section>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  URL <span className="text-destructive">*</span>
                </p>
                <input
                  className="w-full rounded-md bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://"
                  type="url"
                />
              </section>
            )}

            {showFileUpload && (
              <section>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  File <span className="text-destructive">*</span>
                </p>
                <FileUpload
                  accept={selectedType?.name === "Image" ? "image" : "file"}
                  value={uploadedFile}
                  onChange={setUploadedFile}
                />
              </section>
            )}

            <section>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                Tags
              </p>
              <input
                className="w-full rounded-md bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="react, hooks, typescript"
              />
              <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
            </section>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
