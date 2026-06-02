"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createItem } from "@/actions/items";
import type { UploadedFile } from "@/components/ui/FileUpload";
import type { ItemTypeWithCount } from "@/lib/db/items";

export function useCreateItemForm(onSuccess: () => void) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [saving, setSaving] = useState(false);

  function reset() {
    setTitle("");
    setDescription("");
    setContent("");
    setUrl("");
    setLanguage("");
    setTagsInput("");
    setUploadedFile(null);
  }

  async function save(selectedType: ItemTypeWithCount) {
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
    onSuccess();
  }

  return {
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
    saving,
    reset,
    save,
  };
}
