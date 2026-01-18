import { z } from "zod";

export const departmentUpsertSchema = z.object({
  mode: z.enum(["create", "edit"]).optional().default("create"),
  id: z.string().min(1).optional(),
  external_id: z.union([z.number(), z.string()]).optional().nullable(),
  parent_id: z.string().optional().nullable(),
  parent_external_id: z.union([z.number(), z.string()]).optional().nullable(),
  name: z.string().min(1),
  type: z.string().min(1),
  category: z.string().optional().nullable(),
  code: z.string().optional().nullable(),
  level: z.number().optional(),
  manager_name: z.string().optional().nullable(),
  phone_primary: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  prefecture: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  address_line1: z.string().optional().nullable(),
  address_line2: z.string().optional().nullable(),
  is_independent: z.boolean().optional(),
  allow_proxy_billing: z.boolean().optional(),
  commission_rate: z.number().optional().nullable(),
});

export type DepartmentUpsertInput = z.infer<typeof departmentUpsertSchema>;
