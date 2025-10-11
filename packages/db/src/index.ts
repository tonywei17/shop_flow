export const dbReady = true;
export type Id = string;
export { getSupabaseAdmin } from "./client";
export {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  adjustStock,
} from "./products";
