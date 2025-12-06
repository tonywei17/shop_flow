import type { ReactElement } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@enterprise/db";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { Package, ArrowLeft, ShoppingCart, Minus, Plus } from "lucide-react";
import { AddToCartButton } from "./add-to-cart-button";

type PriceType = "hq" | "branch" | "classroom" | "retail";

function getProductPrice(product: any, priceType: PriceType): number {
  switch (priceType) {
    case "hq":
      return product.price_hq ?? product.price_retail ?? 0;
    case "branch":
      return product.price_branch ?? product.price_retail ?? 0;
    case "classroom":
      return product.price_classroom ?? product.price_retail ?? 0;
    default:
      return product.price_retail ?? 0;
  }
}

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps): Promise<ReactElement> {
  const { id } = await params;
  const user = await getCurrentUser();
  const priceType: PriceType = user?.priceType ?? "retail";

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const price = getProductPrice(product, priceType);
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="container px-4 py-8 md:px-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          商品一覧に戻る
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Image */}
        <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
          <Package className="h-24 w-24 text-muted-foreground" />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{product.code}</p>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-bold">{formatPrice(price)}</span>
            {product.is_taxable && (
              <span className="text-sm text-muted-foreground">
                (税込 {formatPrice(Math.floor(price * (1 + (product.tax_rate || 10) / 100)))})
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <Badge variant="destructive">在庫切れ</Badge>
            ) : product.stock <= (product.stock_alert_threshold || 10) ? (
              <Badge variant="secondary">残りわずか（{product.stock}点）</Badge>
            ) : (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                在庫あり
              </Badge>
            )}
          </div>

          <Separator />

          {/* Description */}
          {product.description && (
            <div>
              <h2 className="font-semibold mb-2">商品説明</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {/* Add to Cart */}
          <div className="space-y-4">
            <AddToCartButton
              product={{
                id: product.id,
                code: product.code,
                name: product.name,
                price,
                taxRate: product.tax_rate || 10,
                stock: product.stock,
                minQuantity: product.min_order_quantity || 1,
                maxQuantity: product.max_order_quantity,
              }}
              disabled={isOutOfStock}
            />
          </div>

          <Separator />

          {/* Product Details */}
          <div className="space-y-3">
            <h2 className="font-semibold">商品詳細</h2>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">商品コード</dt>
              <dd>{product.code}</dd>
              {product.order_unit && (
                <>
                  <dt className="text-muted-foreground">販売単位</dt>
                  <dd>{product.order_unit}</dd>
                </>
              )}
              {product.min_order_quantity && product.min_order_quantity > 1 && (
                <>
                  <dt className="text-muted-foreground">最小注文数</dt>
                  <dd>{product.min_order_quantity}</dd>
                </>
              )}
              {product.max_order_quantity && (
                <>
                  <dt className="text-muted-foreground">最大注文数</dt>
                  <dd>{product.max_order_quantity}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
