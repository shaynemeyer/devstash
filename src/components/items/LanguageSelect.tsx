"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const LANGUAGES: { label: string; value: string }[] = [
  { label: "Plaintext", value: "plaintext" },
  { label: "Bash", value: "bash" },
  { label: "C", value: "c" },
  { label: "C++", value: "cpp" },
  { label: "C#", value: "csharp" },
  { label: "CSS", value: "css" },
  { label: "Dockerfile", value: "dockerfile" },
  { label: "Go", value: "go" },
  { label: "GraphQL", value: "graphql" },
  { label: "HTML", value: "html" },
  { label: "Java", value: "java" },
  { label: "JavaScript", value: "javascript" },
  { label: "JSON", value: "json" },
  { label: "Kotlin", value: "kotlin" },
  { label: "Markdown", value: "markdown" },
  { label: "PHP", value: "php" },
  { label: "Python", value: "python" },
  { label: "Ruby", value: "ruby" },
  { label: "Rust", value: "rust" },
  { label: "SQL", value: "sql" },
  { label: "Swift", value: "swift" },
  { label: "TOML", value: "toml" },
  { label: "TypeScript", value: "typescript" },
  { label: "XML", value: "xml" },
  { label: "YAML", value: "yaml" },
];

interface LanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function LanguageSelect({ value, onChange }: LanguageSelectProps) {
  return (
    <Select value={value || "plaintext"} onValueChange={(v) => onChange(v ?? "plaintext")}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent className="max-h-64 overflow-y-auto">
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
