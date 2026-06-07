"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditorPreferences } from "@/contexts/EditorPreferencesContext";
import { updateEditorPreferences } from "@/actions/settings";
import type { EditorPreferences } from "@/lib/validations/settings";

const FONT_SIZES = [10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24];
const TAB_SIZES = [2, 4, 8];

export function EditorPreferencesForm() {
  const { preferences, setPreferences } = useEditorPreferences();
  const [, startTransition] = useTransition();

  function handleChange(updates: Partial<EditorPreferences>) {
    const next = { ...preferences, ...updates };
    setPreferences(next);
    startTransition(async () => {
      const result = await updateEditorPreferences(next);
      if (result.success) {
        toast.success("Editor preferences saved.");
      } else {
        toast.error(result.error ?? "Failed to save preferences.");
      }
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-5">
      <div className="flex items-center justify-between">
        <Label htmlFor="fontSize" className="text-sm font-medium text-foreground">
          Font size
        </Label>
        <Select
          value={String(preferences.fontSize)}
          onValueChange={(v) => handleChange({ fontSize: Number(v) })}
        >
          <SelectTrigger id="fontSize" className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="tabSize" className="text-sm font-medium text-foreground">
          Tab size
        </Label>
        <Select
          value={String(preferences.tabSize)}
          onValueChange={(v) => handleChange({ tabSize: Number(v) })}
        >
          <SelectTrigger id="tabSize" className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TAB_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} spaces
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="theme" className="text-sm font-medium text-foreground">
          Theme
        </Label>
        <Select
          value={preferences.theme}
          onValueChange={(v) => handleChange({ theme: v as EditorPreferences["theme"] })}
        >
          <SelectTrigger id="theme" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vs-dark">VS Dark</SelectItem>
            <SelectItem value="monokai">Monokai</SelectItem>
            <SelectItem value="github-dark">GitHub Dark</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="wordWrap" className="text-sm font-medium text-foreground">
          Word wrap
        </Label>
        <Switch
          id="wordWrap"
          checked={preferences.wordWrap}
          onCheckedChange={(checked) => handleChange({ wordWrap: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="minimap" className="text-sm font-medium text-foreground">
          Minimap
        </Label>
        <Switch
          id="minimap"
          checked={preferences.minimap}
          onCheckedChange={(checked) => handleChange({ minimap: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="lineNumbers" className="text-sm font-medium text-foreground">
          Line numbers
        </Label>
        <Switch
          id="lineNumbers"
          checked={preferences.lineNumbers}
          onCheckedChange={(checked) => handleChange({ lineNumbers: checked })}
        />
      </div>
    </div>
  );
}

