import { z } from "zod";

export const CreateItemSchema = z.object({
  typeId: z.string().min(1, "Type is required"),
  typeName: z.enum(["Snippet", "Prompt", "Command", "Note", "Link", "File", "Image"]),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  language: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  fileUrl: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSize: z.number().int().nonnegative().nullable().optional(),
  collectionIds: z.array(z.string()).default([]),
}).superRefine((data, ctx) => {
  if (data.typeName === "Link" && !data.url?.trim()) {
    ctx.addIssue({ code: "custom", message: "URL is required for links", path: ["url"] });
  }
  if (data.url?.trim()) {
    try { new URL(data.url.trim()); } catch {
      ctx.addIssue({ code: "custom", message: "Must be a valid URL", path: ["url"] });
    }
  }
  if ((data.typeName === "File" || data.typeName === "Image") && !data.fileUrl) {
    ctx.addIssue({ code: "custom", message: "A file is required", path: ["fileUrl"] });
  }
});


export const UpdateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z
    .string()
    .refine((v) => { try { new URL(v); return true; } catch { return false; } }, { message: "Must be a valid URL" })
    .nullable()
    .optional(),
  language: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  fileUrl: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSize: z.number().int().nonnegative().nullable().optional(),
  collectionIds: z.array(z.string()).default([]),
});

