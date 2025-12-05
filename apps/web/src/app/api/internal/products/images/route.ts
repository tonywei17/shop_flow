import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  listProductImages,
  createProductImage,
  updateProductImage,
  deleteProductImage,
  updateProductImagesOrder,
  setProductImageAsPrimary,
} from "@enterprise/db";

// Supabase Storage 配置
const BUCKET_NAME = "product-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES_PER_PRODUCT = 10;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// 创建 Supabase 客户端
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseKey);
}

// GET - 获取商品图片列表
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("product_id");

  if (!productId) {
    return NextResponse.json({ error: "Missing product_id" }, { status: 400 });
  }

  try {
    const images = await listProductImages(productId);
    return NextResponse.json({ images });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - 上传图片或更新顺序
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // 处理 JSON 请求（更新顺序、设置主图）
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const action = body.action;

      if (action === "reorder") {
        const { product_id, image_ids } = body;
        if (!product_id || !Array.isArray(image_ids)) {
          return NextResponse.json({ error: "Invalid reorder payload" }, { status: 400 });
        }
        await updateProductImagesOrder(product_id, image_ids);
        return NextResponse.json({ ok: true });
      }

      if (action === "set_primary") {
        const { image_id } = body;
        if (!image_id) {
          return NextResponse.json({ error: "Missing image_id" }, { status: 400 });
        }
        await setProductImageAsPrimary(image_id);
        return NextResponse.json({ ok: true });
      }

      if (action === "update_alt") {
        const { image_id, alt_text } = body;
        if (!image_id) {
          return NextResponse.json({ error: "Missing image_id" }, { status: 400 });
        }
        const updated = await updateProductImage(image_id, { alt_text });
        return NextResponse.json({ image: updated });
      }

      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    // 处理文件上传
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const productId = formData.get("product_id") as string | null;

    if (!file || !productId) {
      return NextResponse.json({ error: "Missing file or product_id" }, { status: 400 });
    }

    // 验证文件类型
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "許可されていないファイル形式です。JPEG、PNG、WebP、GIF のみ対応しています。" },
        { status: 400 }
      );
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "ファイルサイズは5MB以下にしてください" },
        { status: 400 }
      );
    }

    // 检查当前图片数量
    const existingImages = await listProductImages(productId);
    if (existingImages.length >= MAX_IMAGES_PER_PRODUCT) {
      return NextResponse.json(
        { error: `最大${MAX_IMAGES_PER_PRODUCT}枚までアップロードできます` },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const storagePath = `${productId}/${timestamp}-${randomStr}.${ext}`;

    // 上传到 Supabase Storage
    const supabase = getSupabaseClient();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "ファイルのアップロードに失敗しました" },
        { status: 500 }
      );
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // 保存到数据库
    const image = await createProductImage({
      product_id: productId,
      url: publicUrl,
      storage_path: storagePath,
      file_size: file.size,
      mime_type: file.type,
      alt_text: file.name,
    });

    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    console.error("Image upload error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - 删除图片
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageId = searchParams.get("id");

  if (!imageId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    // 删除数据库记录并获取 storage_path
    const { storage_path } = await deleteProductImage(imageId);

    // 如果有 storage_path，从 Storage 中删除文件
    if (storage_path) {
      const supabase = getSupabaseClient();
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([storage_path]);

      if (deleteError) {
        console.error("Storage delete error:", deleteError);
        // 不阻止响应，因为数据库记录已删除
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
