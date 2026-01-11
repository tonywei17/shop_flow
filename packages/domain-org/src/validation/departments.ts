/**
 * @enterprise/domain-org - Department Validation
 *
 * Zod schemas for validating department-related data.
 */

import { z } from "zod";

/**
 * Schema for creating or updating a department
 */
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

/**
 * Department types
 */
export const departmentTypeSchema = z.enum([
  "headquarters", // 本部
  "branch", // 支局
  "classroom", // 教室
  "partner", // パートナー
]);

export type DepartmentType = z.infer<typeof departmentTypeSchema>;

/**
 * Department status
 */
export const departmentStatusSchema = z.enum(["active", "inactive", "pending"]);

export type DepartmentStatus = z.infer<typeof departmentStatusSchema>;
