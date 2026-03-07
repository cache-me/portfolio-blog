import { z } from "zod";

export const signUpInput = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

export const signInInput = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

export const socialSignInInput = z.object({
  provider: z.enum(["google", "facebook"]),
  callbackURL: z.string().url().optional(),
});

export const updateProfileInput = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().max(500).optional().nullable(),
  headline: z.string().max(200).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  website: z.string().url().optional().nullable(),
  image: z.string().url().optional().nullable(),
});

export const changePasswordInput = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const adminUpdateUserInput = z.object({
  userId: z.string().min(1),
  role: z.enum(["USER", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
});

export type SignUpInput = z.infer<typeof signUpInput>;
export type SignInInput = z.infer<typeof signInInput>;
export type SocialSignInInput = z.infer<typeof socialSignInInput>;
export type UpdateProfileInput = z.infer<typeof updateProfileInput>;
export type ChangePasswordInput = z.infer<typeof changePasswordInput>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserInput>;
