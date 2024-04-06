import { z } from "zod";

export const createCommentValidator = z.object({
  content: z.string({ required_error: "Content is required" }).trim(),
  video: z.string().trim(),
});

export const updateCommentValidation = z.object({
  content: z.string().trim(),
  id: z.string().trim(),
});
