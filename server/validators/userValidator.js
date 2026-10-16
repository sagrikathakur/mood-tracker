import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address")
      .max(255, "Email is too long"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password cannot exceed 72 characters"),
    phone: z.string().optional().nullable(),
    role: z.string().optional(),
    rememberMe: z.boolean().optional(),
    // Bot Honeypot field (hidden from real users in CSS; bots fill it in automatically)
    hp_field: z.string().optional(),
  })
  .refine((data) => !data.hp_field || data.hp_field.trim() === "", {
    message: "Automated submission rejected",
    path: ["hp_field"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address")
    .max(255, "Email is too long"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(72, "Password exceeds max allowed length"),
  rememberMe: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty").max(100).optional(),
  phone: z.string().optional().nullable(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required").max(72).optional(),
  password: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .max(72, "Password cannot exceed 72 characters"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});
