"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createCollection } from "@/actions/collections";

export function useCreateCollectionForm(onSuccess: () => void) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setName("");
    setDescription("");
  }

  async function save() {
    setSaving(true);

    const result = await createCollection({
      name: name.trim(),
      description: description.trim() || null,
    });

    setSaving(false);

    if (!result.success) {
      toast.error(result.error ?? "Failed to create collection");
      return;
    }

    toast.success("Collection created");
    onSuccess();
  }

  return {
    name,
    setName,
    description,
    setDescription,
    saving,
    reset,
    save,
  };
}
