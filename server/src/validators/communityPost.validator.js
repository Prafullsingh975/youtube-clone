import zod from "zod";

export const createCommunityPost = zod.object({
  content: zod.string({ required_error: "Content is required" }).trim(),
});

export const updateCommunityPost = zod.object({
  content: zod.string({ required_error: "Content is required" }).trim(),
  id: zod.string({ required_error: "post id is required" }).trim(),
});
