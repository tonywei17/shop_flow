import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@enterprise/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminAccountId = cookieStore.get("admin_account_id")?.value;

    if (!adminAccountId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if this is the env admin (cannot edit)
    const envAdminId = process.env.ADMIN_LOGIN_ID;
    if (envAdminId && adminAccountId === envAdminId) {
      return NextResponse.json(
        { error: "システム管理者のプロフィール画像は変更できません" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "ファイルが選択されていません" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "画像ファイルを選択してください" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ファイルサイズは5MB以下にしてください" },
        { status: 400 }
      );
    }

    const sb = getSupabaseAdmin();

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `avatars/${adminAccountId}/${Date.now()}.${ext}`;

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await sb.storage
      .from("public")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("[auth/avatar] Failed to upload file:", uploadError);
      // If storage bucket doesn't exist, save as base64 data URL instead
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;

      // Update account with data URL
      const { error: updateError } = await sb
        .from("admin_accounts")
        .update({
          avatar_url: dataUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("account_id", adminAccountId);

      if (updateError) {
        console.error("[auth/avatar] Failed to update account:", updateError);
        return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
      }

      return NextResponse.json({ avatarUrl: dataUrl });
    }

    // Get public URL
    const { data: urlData } = sb.storage.from("public").getPublicUrl(filename);
    const avatarUrl = urlData.publicUrl;

    // Update account with avatar URL
    const { error: updateError } = await sb
      .from("admin_accounts")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("account_id", adminAccountId);

    if (updateError) {
      console.error("[auth/avatar] Failed to update account:", updateError);
      return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ avatarUrl });
  } catch (error) {
    console.error("[auth/avatar] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
