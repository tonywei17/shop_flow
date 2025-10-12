import Link from "next/link";
import { getProduct } from "@enterprise/db";

function formatPrice(cents?: number | null) {
  const value = typeof cents === "number" ? cents : 0;
  return (value / 100).toLocaleString("ja-JP", { style: "currency", currency: "JPY" });
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Product</h1>
        <div style={{ color: "#6b7280" }}>Product not found in Supabase.</div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/" style={{ display: "inline-block", marginBottom: 16 }}>
        &larr; Back
      </Link>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <div
            style={{
              width: "100%",
              height: 360,
              borderRadius: 8,
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
              fontSize: 14,
            }}
          >
            No image
          </div>
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>{product.title}</h1>
          {product.description && <p style={{ color: "#374151", marginTop: 12 }}>{product.description}</p>}
          <dl style={{ marginTop: 16, display: "grid", gap: 12 }}>
            <div>
              <dt style={{ color: "#6b7280", fontSize: 12 }}>SKU</dt>
              <dd style={{ fontSize: 16, fontWeight: 600 }}>{product.sku}</dd>
            </div>
            <div>
              <dt style={{ color: "#6b7280", fontSize: 12 }}>Price</dt>
              <dd style={{ fontSize: 16, fontWeight: 600 }}>{formatPrice(product.price_retail_cents ?? 0)}</dd>
            </div>
            <div>
              <dt style={{ color: "#6b7280", fontSize: 12 }}>Stock</dt>
              <dd style={{ fontSize: 16 }}>{product.stock ?? 0}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
