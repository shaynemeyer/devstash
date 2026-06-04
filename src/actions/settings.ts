"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { EditorPreferencesSchema, type EditorPreferences } from "@/lib/validations/settings";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function updateEditorPreferences(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = EditorPreferencesSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { editorPreferences: result.data },
  });

  return { success: true };
}

export async function getEditorPreferences(): Promise<EditorPreferences | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { editorPreferences: true },
  });

  if (!user?.editorPreferences) return null;

  const result = EditorPreferencesSchema.safeParse(user.editorPreferences);
  return result.success ? result.data : null;
}
