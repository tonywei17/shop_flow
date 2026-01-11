/**
 * @enterprise/domain-org - Role Validation
 *
 * Zod schemas for validating role-related data.
 */

import { z } from "zod";

/**
 * Data scope type enum
 */
export const dataScopeTypeSchema = z.enum([
  "all", // All data
  "self_and_descendants", // Own department and descendants
  "self_only", // Own data only
  "custom", // Custom department selection
]);

export type DataScopeType = z.infer<typeof dataScopeTypeSchema>;

/**
 * Default price type for role-based pricing
 */
export const priceTypeSchema = z.enum([
  "hq", // Headquarters price
  "branch", // Branch price
  "classroom", // Classroom price
  "retail", // Retail/general price
]);

export type PriceType = z.infer<typeof priceTypeSchema>;

/**
 * Schema for creating or updating a role
 */
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
  can_access_storefront: z.boolean().optional().default(false),
  default_price_type: priceTypeSchema.optional().default("retail"),
});

export type RoleCreateInput = z.infer<typeof roleCreateSchema>;

/**
 * Schema for feature permission assignment
 */
export const featurePermissionSchema = z.object({
  role_id: z.string().min(1),
  feature_ids: z.array(z.string()),
});

export type FeaturePermissionInput = z.infer<typeof featurePermissionSchema>;
