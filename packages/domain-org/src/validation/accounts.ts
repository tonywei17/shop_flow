/**
 * @enterprise/domain-org - Account Validation
 *
 * Zod schemas for validating account-related data.
 */

import { z } from "zod";

/**
 * Schema for creating or updating an admin account
 */
export const accountUpsertSchema = z.object({
  mode: z.enum(["create", "edit"]).optional().default("create"),
  id: z.string().min(1).optional(),
  account_id: z.string().min(1),
  display_name: z.string().min(1),
  email: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().optional(),
  status: z.union([z.boolean(), z.string()]).optional(),
  department_id: z.string().nullable().optional(),
  department_name: z.string().optional(),
  role_id: z.string().nullable().optional(),
  role_code: z.string().optional(),
  account_scope: z.string().optional(),
});

export type AccountUpsertInput = z.infer<typeof accountUpsertSchema>;

/**
 * Schema for account login credentials
 */
export const accountLoginSchema = z.object({
  account_id: z.string().min(1, "アカウントIDを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export type AccountLoginInput = z.infer<typeof accountLoginSchema>;

/**
 * Schema for password change
 */
export const passwordChangeSchema = z
  .object({
    current_password: z.string().min(1, "現在のパスワードを入力してください"),
    new_password: z.string().min(8, "パスワードは8文字以上で入力してください"),
    confirm_password: z.string().min(1, "確認用パスワードを入力してください"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "パスワードが一致しません",
    path: ["confirm_password"],
  });

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
