import { getSupabaseAdmin } from "./client";

// ============================================================
// 商品图片管理 - 类型定义
// ============================================================

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  storage_path: string | null;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  file_size: number | null;
  mime_type: string | null;
  created_at: string | null;
};

export type CreateProductImageInput = {
  product_id: string;
  url: string;
  storage_path?: string | null;
  alt_text?: string | null;
  display_order?: number;
  is_primary?: boolean;
  file_size?: number | null;
  mime_type?: string | null;
};

export type UpdateProductImageInput = {
  url?: string;
  storage_path?: string | null;
  alt_text?: string | null;
  display_order?: number;
  is_primary?: boolean;
};

// ============================================================
// 商品图片管理 - 数据库操作
// ============================================================

const MAX_IMAGES_PER_PRODUCT = 10;

export async function listProductImages(productId: string): Promise<ProductImage[]> {
  const sb = getSupabaseAdmin();
  
  const { data, error } = await sb
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("display_order", { ascending: true });

  if (error) throw error;

  return (data ?? []) as ProductImage[];
}

export async function getProductImage(id: string): Promise<ProductImage | null> {
  const sb = getSupabaseAdmin();
  
  const { data, error } = await sb
    .from("product_images")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  
  return data as ProductImage | null;
}

export async function createProductImage(input: CreateProductImageInput): Promise<ProductImage> {
  const sb = getSupabaseAdmin();

  // 检查当前图片数量
  const { count, error: countError } = await sb
    .from("product_images")
    .select("*", { count: "exact", head: true })
    .eq("product_id", input.product_id);

  if (countError) throw countError;
  
  if ((count ?? 0) >= MAX_IMAGES_PER_PRODUCT) {
    throw new Error(`最大${MAX_IMAGES_PER_PRODUCT}枚までアップロードできます`);
  }

  // 获取下一个 display_order
  const { data: maxOrderData } = await sb
    .from("product_images")
    .select("display_order")
    .eq("product_id", input.product_id)
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrderData?.display_order ?? -1) + 1;

  // 如果是第一张图片，设为主图
  const isPrimary = input.is_primary ?? (count === 0);

  const payload = {
    product_id: input.product_id,
    url: input.url,
    storage_path: input.storage_path ?? null,
    alt_text: input.alt_text ?? null,
    display_order: input.display_order ?? nextOrder,
    is_primary: isPrimary,
    file_size: input.file_size ?? null,
    mime_type: input.mime_type ?? null,
  };

  const { data, error } = await sb
    .from("product_images")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;

  return data as ProductImage;
}

export async function updateProductImage(id: string, input: UpdateProductImageInput): Promise<ProductImage> {
  const sb = getSupabaseAdmin();

  const payload: Record<string, unknown> = {};
  
  if (input.url !== undefined) payload.url = input.url;
  if (input.storage_path !== undefined) payload.storage_path = input.storage_path;
  if (input.alt_text !== undefined) payload.alt_text = input.alt_text;
  if (input.display_order !== undefined) payload.display_order = input.display_order;
  if (input.is_primary !== undefined) payload.is_primary = input.is_primary;

  const { data, error } = await sb
    .from("product_images")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  return data as ProductImage;
}

export async function deleteProductImage(id: string): Promise<{ storage_path: string | null }> {
  const sb = getSupabaseAdmin();

  // 先获取图片信息以返回 storage_path
  const { data: image, error: getError } = await sb
    .from("product_images")
    .select("storage_path, product_id, is_primary")
    .eq("id", id)
    .single();

  if (getError) throw getError;

  // 删除记录
  const { error } = await sb
    .from("product_images")
    .delete()
    .eq("id", id);

  if (error) throw error;

  // 如果删除的是主图，将第一张图片设为主图
  if (image?.is_primary) {
    const { data: firstImage } = await sb
      .from("product_images")
      .select("id")
      .eq("product_id", image.product_id)
      .order("display_order", { ascending: true })
      .limit(1)
      .single();

    if (firstImage) {
      await sb
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", firstImage.id);
    }
  }

  return { storage_path: image?.storage_path ?? null };
}

export async function updateProductImagesOrder(
  productId: string,
  imageIds: string[]
): Promise<void> {
  const sb = getSupabaseAdmin();

  // 批量更新顺序
  const updates = imageIds.map((id, index) => ({
    id,
    display_order: index,
  }));

  for (const update of updates) {
    const { error } = await sb
      .from("product_images")
      .update({ display_order: update.display_order })
      .eq("id", update.id)
      .eq("product_id", productId);

    if (error) throw error;
  }
}

export async function setProductImageAsPrimary(id: string): Promise<void> {
  const sb = getSupabaseAdmin();

  // 获取图片的 product_id
  const { data: image, error: getError } = await sb
    .from("product_images")
    .select("product_id")
    .eq("id", id)
    .single();

  if (getError) throw getError;
  if (!image) throw new Error("Image not found");

  // 先将所有图片设为非主图
  const { error: resetError } = await sb
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", image.product_id);

  if (resetError) throw resetError;

  // 设置指定图片为主图
  const { error } = await sb
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", id);

  if (error) throw error;
}
