import { z } from "zod";

export const registerUserValidator = z.object({
  email: z.string({required_error:"email required"}).trim().email("Not a valid email"),
  fullName: z.string({required_error:"fullName required"}).trim(),
  password: z.string({required_error:"password required"}).trim().min(8, "Password must have 8 characters"),
});

export const loginUserValidator = z.object({
  email: z.string({required_error:"Email required"}).trim().email(),
  password: z.string({required_error:"Password required"}).trim(),
});

export const changePasswordValidator = z.object({
  password: z.string({required_error:"Password required"}).trim(),
  newPassword: z.string({required_error:"New Password required"}).trim(),
});

export const updateUSerDetailValidator = z.object({
  fullName: z.string({required_error:"FullName required"}).trim(),
});

export const profilePageValidator = z.object({
  userName: z.string().trim(),
});
