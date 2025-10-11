const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

async function getProducts() {
  try {
    const headers: Record<string, string> = {};
    if (PUBLISHABLE_KEY) headers["x-publishable-api-key"] = PUBLISHABLE_KEY;
    const res = await fetch(`${MEDUSA_URL}/store/products`, { cache: "no-store", headers });
    if (!res.ok) return { products: [] };
    return res.json();
  } catch {
    return { products: [] };
  }
}

export default async function Home() {
  const data = await getProducts();
  const products = Array.isArray(data?.products) ? data.products : [];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Products</h1>
      {products.length === 0 && (
        <div style={{ color: "#6b7280" }}>
          No products. Ensure Medusa backend is running and set NEXT_PUBLIC_MEDUSA_BACKEND_URL.
        </div>
      )}
      <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {products.map((p: any) => (
          <li key={p.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
            <a href={`/products/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              {p.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.thumbnail} alt={p.title} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 6, marginBottom: 8 }} />
              ) : null}
              <div style={{ fontWeight: 600 }}>{p.title}</div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
