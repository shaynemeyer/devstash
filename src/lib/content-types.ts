const CONTENT_TYPES = ["snippet", "prompt", "command", "note"];
const LANGUAGE_TYPES = ["snippet", "command"];
const CODE_TYPES = ["snippet", "command"];
const MARKDOWN_TYPES = ["note", "prompt"];
const FILE_UPLOAD_TYPES = ["file", "image"];

export type EditorType = "code" | "markdown" | "file" | "url" | "none";

export interface ShownFields {
  showContent: boolean;
  showLanguage: boolean;
  showUrl: boolean;
  showFileUpload: boolean;
  useCodeEditor: boolean;
  useMarkdownEditor: boolean;
}

export function getEditorType(typeName: string): EditorType {
  const name = typeName.toLowerCase();
  if (CODE_TYPES.includes(name)) return "code";
  if (MARKDOWN_TYPES.includes(name)) return "markdown";
  if (FILE_UPLOAD_TYPES.includes(name)) return "file";
  if (name === "link") return "url";
  return "none";
}

export function getShownFields(typeName: string): ShownFields {
  const name = typeName.toLowerCase();
  return {
    showContent: CONTENT_TYPES.includes(name),
    showLanguage: LANGUAGE_TYPES.includes(name),
    showUrl: name === "link",
    showFileUpload: FILE_UPLOAD_TYPES.includes(name),
    useCodeEditor: CODE_TYPES.includes(name),
    useMarkdownEditor: MARKDOWN_TYPES.includes(name),
  };
}
