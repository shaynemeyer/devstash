"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { EditorPreferencesSchema, type EditorPreferences } from "@/lib/validations/settings";
import { requireAuth, parseInput, withAction } from "@/lib/action-utils";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function updateEditorPreferences(input: unknown): Promise<ActionResult> {
  return withAction(async () => {
    const { userId } = await requireAuth();
    const data = parseInput(EditorPreferencesSchema, input);
    await db.user.update({ where: { id: userId }, data: { editorPreferences: data } });
  });
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
