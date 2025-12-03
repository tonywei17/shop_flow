import { z } from "zod";

export const roleCreateSchema = z.object({
  mode: z.enum(["create", "edit"]).optional().default("create"),
  id: z.string().min(1).optional(),
  role_id: z.union([z.number(), z.string()]).optional(),
  code: z.string().min(1),
  name: z.string().min(1),
  data_scope: z.string().optional(),
  status: z.string().optional(),
  description: z.string().optional().nullable(),
  feature_permissions: z.array(z.string()).optional(),
});

export type RoleCreateInput = z.infer<typeof roleCreateSchema>;
