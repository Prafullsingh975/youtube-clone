import { z } from "zod";

export const registerUserValidator = z.object({
  email: z.string().trim().email("Not a valid email"),
  fullName: z.string().trim(),
  password: z.string().trim().min(8, "Password must have 8 characters"),
});
