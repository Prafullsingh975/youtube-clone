import { z } from "zod";

export const registerUserValidator = z.object({
  email: z.string().trim().email("Not a valid email"),
  fullName: z.string().trim(),
  password: z.string().trim().min(8, "Password must have 8 characters"),
});

export const loginUserValidator = z.object({
  email: z.string().trim().email(),
  password: z.string().trim(),
});

export const changePasswordValidator = z.object({
  password: z.string().trim(),
  newPassword: z.string().trim(),
});

export const updateUSerDetailValidator = z.object({
  fullName: z.string().trim(),
});
