import { z } from "zod";

export const GenerateAutoTagsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
});

export type GenerateAutoTagsInput = z.infer<typeof GenerateAutoTagsSchema>;

export const GenerateDescriptionSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  itemType: z.string().min(1, "Item type is required"),
});

export type GenerateDescriptionInput = z.infer<typeof GenerateDescriptionSchema>;

export const ExplainCodeSchema = z.object({
  content: z.string().min(1, "Content is required"),
  language: z.string().optional(),
  itemType: z.string().min(1, "Item type is required"),
});

export type ExplainCodeInput = z.infer<typeof ExplainCodeSchema>;
