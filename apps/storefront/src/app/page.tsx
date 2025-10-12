import Link from "next/link";
import { listProducts } from "@enterprise/db";

function formatPrice(cents?: number | null) {
  const value = typeof cents === "number" ? cents : 0;
  return (value / 100).toLocaleString("ja-JP", { style: "currency", currency: "JPY" });
}

export default async function Home() {
  const { items } = await listProducts({ limit: 100 });
  const products = Array.isArray(items) ? items : [];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Products</h1>
      {products.length === 0 && (
        <div style={{ color: "#6b7280" }}>No products found in Supabase. Please add products from the dashboard.</div>
      )}
      <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {products.map((p: any) => (
          <li key={p.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
            <Link href={`/products/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{p.title}</div>
              <div style={{ color: "#374151", fontSize: 14 }}>{formatPrice(p.price_retail_cents ?? 0)}</div>
              <div style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>SKU: {p.sku}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
