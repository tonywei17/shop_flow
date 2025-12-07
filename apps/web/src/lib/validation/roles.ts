import { z } from "zod";

export const dataScopeTypeSchema = z.enum(["all", "self_and_descendants", "self_only", "custom"]);

export const roleCreateSchema = z.object({
  mode: z.enum(["create", "edit"]).optional().default("create"),
  id: z.string().min(1).optional(),
  role_id: z.union([z.number(), z.string()]).optional(),
  code: z.string().min(1),
  name: z.string().min(1),
  data_scope: z.string().optional(),
  data_scope_type: dataScopeTypeSchema.optional().default("all"),
  allowed_department_ids: z.array(z.string()).optional().default([]),
  status: z.string().optional(),
  description: z.string().optional().nullable(),
  feature_permissions: z.array(z.string()).optional(),
  badge_color: z.string().optional().nullable(),
});

export type RoleCreateInput = z.infer<typeof roleCreateSchema>;
export type DataScopeType = z.infer<typeof dataScopeTypeSchema>;
