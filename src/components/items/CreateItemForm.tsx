"use client";

import { CodeEditor } from "@/components/ui/CodeEditor";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { FileUpload } from "@/components/ui/FileUpload";
import type { UploadedFile } from "@/components/ui/FileUpload";
import type { ItemTypeWithCount } from "@/lib/db/items";

const CONTENT_TYPES = ["Snippet", "Prompt", "Command", "Note"];
const LANGUAGE_TYPES = ["Snippet", "Command"];
const CODE_TYPES = ["Snippet", "Command"];
const MARKDOWN_TYPES = ["Note", "Prompt"];
const FILE_TYPES = ["File", "Image"];

interface FormFields {
  description: string;
  setDescription: (v: string) => void;
  content: string;
  setContent: (v: string) => void;
  url: string;
  setUrl: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
  tagsInput: string;
  setTagsInput: (v: string) => void;
  uploadedFile: UploadedFile | null;
  setUploadedFile: (f: UploadedFile | null) => void;
}

interface CreateItemFormProps {
  selectedType: ItemTypeWithCount | undefined;
  fields: FormFields;
}

export function CreateItemForm({ selectedType, fields }: CreateItemFormProps) {
  const { description, setDescription, content, setContent, url, setUrl, language, setLanguage, tagsInput, setTagsInput, uploadedFile, setUploadedFile } = fields;

  const showContent = selectedType ? CONTENT_TYPES.includes(selectedType.name) : false;
  const showLanguage = selectedType ? LANGUAGE_TYPES.includes(selectedType.name) : false;
  const showUrl = selectedType?.name === "Link";
  const showFileUpload = selectedType ? FILE_TYPES.includes(selectedType.name) : false;
  const useCodeEditor = selectedType ? CODE_TYPES.includes(selectedType.name) : false;
  const useMarkdownEditor = selectedType ? MARKDOWN_TYPES.includes(selectedType.name) : false;

  return (
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
            <CodeEditor value={content} onChange={setContent} language={language || "plaintext"} />
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
  );
}
