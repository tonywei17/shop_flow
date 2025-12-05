"use client";

import * as React from "react";
import Image from "next/image";
import type { ProductImage } from "@enterprise/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Upload,
  X,
  MoreVertical,
  Star,
  Trash2,
  GripVertical,
  ImageIcon,
  Loader2,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// 类型定义
// ============================================================

type ProductImageManagerProps = {
  productId: string;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in bytes
};

// ============================================================
// 组件
// ============================================================

export function ProductImageManager({
  productId,
  images,
  onImagesChange,
  maxImages = 10,
  maxFileSize = 5 * 1024 * 1024, // 5MB
}: ProductImageManagerProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [imageToDelete, setImageToDelete] = React.useState<ProductImage | null>(null);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [imageToEdit, setImageToEdit] = React.useState<ProductImage | null>(null);
  const [editAltText, setEditAltText] = React.useState("");

  const canUpload = images.length < maxImages;

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // 重置 input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // 验证文件大小
    if (file.size > maxFileSize) {
      setUploadError(`ファイルサイズは${Math.round(maxFileSize / 1024 / 1024)}MB以下にしてください`);
      return;
    }

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("許可されていないファイル形式です。JPEG、PNG、WebP、GIF のみ対応しています。");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("product_id", productId);

      const response = await fetch("/api/internal/products/images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "アップロードに失敗しました");
      }

      const { image } = await response.json();
      onImagesChange([...images, image]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "アップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  // 处理删除
  const handleDelete = async () => {
    if (!imageToDelete) return;

    try {
      const response = await fetch(`/api/internal/products/images?id=${imageToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "削除に失敗しました");
      }

      onImagesChange(images.filter((img) => img.id !== imageToDelete.id));
    } catch (error) {
      alert(error instanceof Error ? error.message : "削除に失敗しました");
    } finally {
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  // 处理设置主图
  const handleSetPrimary = async (imageId: string) => {
    try {
      const response = await fetch("/api/internal/products/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_primary", image_id: imageId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "設定に失敗しました");
      }

      // 更新本地状态
      onImagesChange(
        images.map((img) => ({
          ...img,
          is_primary: img.id === imageId,
        }))
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "設定に失敗しました");
    }
  };

  // 处理更新 alt text
  const handleUpdateAltText = async () => {
    if (!imageToEdit) return;

    try {
      const response = await fetch("/api/internal/products/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_alt",
          image_id: imageToEdit.id,
          alt_text: editAltText,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "更新に失敗しました");
      }

      onImagesChange(
        images.map((img) =>
          img.id === imageToEdit.id ? { ...img, alt_text: editAltText } : img
        )
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "更新に失敗しました");
    } finally {
      setEditDialogOpen(false);
      setImageToEdit(null);
      setEditAltText("");
    }
  };

  // 拖拽处理
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = async () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newImages = [...images];
      const [draggedImage] = newImages.splice(draggedIndex, 1);
      newImages.splice(dragOverIndex, 0, draggedImage);

      // 更新本地状态
      onImagesChange(newImages);

      // 保存到服务器
      try {
        const response = await fetch("/api/internal/products/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reorder",
            product_id: productId,
            image_ids: newImages.map((img) => img.id),
          }),
        });

        if (!response.ok) {
          console.error("Failed to save image order");
        }
      } catch (error) {
        console.error("Failed to save image order:", error);
      }
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>商品画像</Label>
        <span className="text-xs text-muted-foreground">
          {images.length} / {maxImages} 枚
        </span>
      </div>

      {uploadError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {uploadError}
          <button
            onClick={() => setUploadError(null)}
            className="ml-2 underline"
          >
            閉じる
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {/* 图片列表 */}
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-lg border bg-muted",
              draggedIndex === index && "opacity-50",
              dragOverIndex === index && "ring-2 ring-primary"
            )}
          >
            <Image
              src={image.url}
              alt={image.alt_text || "商品画像"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
            />

            {/* 主图标记 */}
            {image.is_primary && (
              <div className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                メイン
              </div>
            )}

            {/* 拖拽手柄 */}
            <div className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab opacity-0 transition-opacity group-hover:opacity-100">
              <div className="rounded bg-black/50 p-1">
                <GripVertical className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* 操作菜单 */}
            <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7 bg-black/50 text-white hover:bg-black/70"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!image.is_primary && (
                    <DropdownMenuItem onClick={() => handleSetPrimary(image.id)}>
                      <Star className="mr-2 h-4 w-4" />
                      メイン画像に設定
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      setImageToEdit(image);
                      setEditAltText(image.alt_text || "");
                      setEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    代替テキストを編集
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      setImageToDelete(image);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}

        {/* 上传按钮 */}
        {canUpload && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 text-muted-foreground transition-colors hover:border-primary hover:bg-muted hover:text-primary",
              isUploading && "cursor-not-allowed opacity-50"
            )}
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <Upload className="h-8 w-8" />
                <span className="text-xs">アップロード</span>
              </>
            )}
          </button>
        )}

        {/* 空状态 */}
        {images.length === 0 && !canUpload && (
          <div className="col-span-full flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 opacity-50" />
            <p className="text-sm">画像がありません</p>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        ドラッグ&ドロップで順序を変更できます。最大{maxImages}枚、各{Math.round(maxFileSize / 1024 / 1024)}MBまで。
        JPEG、PNG、WebP、GIF に対応。
      </p>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>画像を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 编辑 alt text 对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>代替テキストを編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="alt-text">代替テキスト</Label>
              <Input
                id="alt-text"
                value={editAltText}
                onChange={(e) => setEditAltText(e.target.value)}
                placeholder="画像の説明を入力"
              />
              <p className="text-xs text-muted-foreground">
                画像が表示できない場合や、スクリーンリーダーで読み上げられるテキストです。
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleUpdateAltText}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
