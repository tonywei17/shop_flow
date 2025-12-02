import { z } from "zod";

export const accountItemUpsertSchema = z.object({
  mode: z.enum(["create", "edit"]).optional().default("create"),
  id: z.string().min(1).optional(),
  account_item_id: z.union([z.number(), z.string().min(1)]),
  name: z.string().min(1),
  status: z.string().optional(),
});

export type AccountItemUpsertInput = z.infer<typeof accountItemUpsertSchema>;

export const productCategoryUpsertSchema = z.object({
  mode: z.enum(["create", "edit"]).optional().default("create"),
  id: z.string().min(1).optional(),
  code: z.string().min(1),
  name: z.string().min(1),
  status: z.string().optional(),
});

export type ProductCategoryUpsertInput = z.infer<typeof productCategoryUpsertSchema>;

export const counterpartyUpsertSchema = z.object({
  mode: z.enum(["create", "edit"]).optional().default("create"),
  id: z.string().min(1).optional(),
  counterparty_id: z.union([z.number(), z.string().min(1)]),
  name: z.string().optional().nullable(),
  status: z.string().optional(),
});

export type CounterpartyUpsertInput = z.infer<typeof counterpartyUpsertSchema>;
