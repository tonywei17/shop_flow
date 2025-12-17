import { z } from "zod";

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
