const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

async function getProduct(id: string) {
  try {
    const headers: Record<string, string> = {};
    if (PUBLISHABLE_KEY) headers["x-publishable-api-key"] = PUBLISHABLE_KEY;
    const res = await fetch(`${MEDUSA_URL}/store/products/${id}`, { cache: "no-store", headers });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const data = await getProduct(params.id);
  const product = data?.product;

  if (!product) {
    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Product</h1>
        <div style={{ color: "#6b7280" }}>Product not found or Medusa backend is not reachable.</div>
      </div>
    );
  }

  return (
    <div>
      <a href="/" style={{ display: "inline-block", marginBottom: 16 }}>&larr; Back</a>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {product.thumbnail && (
            <img
              src={product.thumbnail}
              alt={product.title}
              style={{ width: "100%", height: 360, objectFit: "cover", borderRadius: 8 }}
            />
          )}
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>{product.title}</h1>
          {product.description && (
            <p style={{ color: "#374151", marginTop: 12 }}>{product.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
