import type { ReactElement } from "react";
import Link from "next/link";
import { listProducts, listProductCategories } from "@enterprise/db";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Package } from "lucide-react";
import { SearchBar } from "./search-bar";

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

type SearchParams = {
  q?: string;
  category?: string;
  page?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<ReactElement> {
  const params = await searchParams;
  const user = await getCurrentUser();
  const priceType: PriceType = user?.priceType ?? "retail";

  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 12;
  const offset = (page - 1) * limit;

  let products: any[] = [];
  let totalCount = 0;
  let categories: any[] = [];

  try {
    const [productsResult, categoriesResult] = await Promise.all([
      listProducts({
        limit,
        offset,
        search: params.q,
        category_id: params.category,
        is_active: true,
        sortKey: "display_order",
        sortOrder: "asc",
      }),
      listProductCategories({ limit: 100 }),
    ]);
    products = productsResult.products;
    totalCount = productsResult.count;
    categories = categoriesResult.items;
  } catch (error) {
    console.error("Failed to load products", error);
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="container px-4 py-8 md:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">商品一覧</h1>
        <p className="text-muted-foreground mt-2">
          {totalCount > 0 ? `${totalCount}件の商品` : "商品がありません"}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <SearchBar defaultValue={params.q} category={params.category} />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <Link href="/products">
            <Button
              variant={!params.category ? "default" : "outline"}
              size="sm"
            >
              すべて
            </Button>
          </Link>
          {categories.map((category: any) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}${params.q ? `&q=${params.q}` : ""}`}
            >
              <Button
                variant={params.category === category.id ? "default" : "outline"}
                size="sm"
              >
                {category.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">商品が見つかりません</h2>
          <p className="text-muted-foreground mb-4">
            検索条件を変更してお試しください
          </p>
          <Link href="/products">
            <Button variant="outline">すべての商品を見る</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product: any) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">{product.code}</p>
                      <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                      {product.category_name && (
                        <Badge variant="secondary" className="text-xs">
                          {product.category_name}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-lg font-bold">
                        {formatPrice(getProductPrice(product, priceType))}
                      </span>
                      {product.stock <= 0 && (
                        <Badge variant="destructive">在庫切れ</Badge>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && (
                <Link
                  href={`/products?page=${page - 1}${params.q ? `&q=${params.q}` : ""}${params.category ? `&category=${params.category}` : ""}`}
                >
                  <Button variant="outline">前へ</Button>
                </Link>
              )}
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                {page} / {totalPages} ページ
              </span>
              {page < totalPages && (
                <Link
                  href={`/products?page=${page + 1}${params.q ? `&q=${params.q}` : ""}${params.category ? `&category=${params.category}` : ""}`}
                >
                  <Button variant="outline">次へ</Button>
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
