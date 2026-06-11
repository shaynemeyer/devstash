"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateItem, deleteItem } from "@/actions/items";
import type { UploadedFile } from "@/components/ui/FileUpload";
import type { ItemDetail } from "@/lib/db/items";

function toUploadedFile(item: ItemDetail): UploadedFile | null {
  if (!item.fileUrl) return null;
  return { key: item.fileUrl, fileName: item.fileName ?? "", fileSize: item.fileSize ?? 0, mimeType: "" };
}

export function useItemEdit(
  item: ItemDetail,
  onItemChange: (item: ItemDetail) => void,
  onClose: () => void
) {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [content, setContent] = useState(item.content ?? "");
  const [url, setUrl] = useState(item.url ?? "");
  const [language, setLanguage] = useState(item.language ?? "");
  const [tagsInput, setTagsInput] = useState(item.tags.join(", "));
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(toUploadedFile(item));
  const [collectionIds, setCollectionIds] = useState<string[]>(item.collections.map((c) => c.id));

  function enterEdit() {
    setTitle(item.title);
    setDescription(item.description ?? "");
    setContent(item.content ?? "");
    setUrl(item.url ?? "");
    setLanguage(item.language ?? "");
    setTagsInput(item.tags.join(", "));
    setUploadedFile(toUploadedFile(item));
    setCollectionIds(item.collections.map((c) => c.id));
    setEditMode(true);
  }

  function applyOptimized(text: string) {
    setTitle(item.title);
    setDescription(item.description ?? "");
    setContent(text);
    setUrl(item.url ?? "");
    setLanguage(item.language ?? "");
    setTagsInput(item.tags.join(", "));
    setUploadedFile(toUploadedFile(item));
    setCollectionIds(item.collections.map((c) => c.id));
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
      collectionIds,
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

  return {
    editMode,
    saving,
    deleting,
    title,
    setTitle,
    description,
    setDescription,
    content,
    setContent,
    url,
    setUrl,
    language,
    setLanguage,
    tagsInput,
    setTagsInput,
    uploadedFile,
    setUploadedFile,
    collectionIds,
    setCollectionIds,
    enterEdit,
    applyOptimized,
    cancelEdit,
    save,
    handleDelete,
  };
}
