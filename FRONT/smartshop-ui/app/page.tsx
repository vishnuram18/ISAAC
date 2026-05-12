import { fetchProducts } from "../services/api";
import { Product } from "../types";
import AddToCartButton from "../components/AddToCartButton";
import HeaderAuth from "../components/HeaderAuth";
import SearchBar from "../components/SearchBar";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products: Product[] = await (
    q
      ? fetch(
          `${process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:8080/api"}/products/search?q=${encodeURIComponent(q)}`,
          { cache: "no-store" }
        ).then((r) => r.json())
      : fetchProducts()
  );

  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="flex justify-between items-center mb-6 border-b pb-5">
        <h1 className="text-3xl font-extrabold text-blue-600">Isaac SmartShop</h1>
        <HeaderAuth />
      </header>

      <div className="mb-8">
        <SearchBar initialQuery={q ?? ""} />
      </div>

      {q && (
        <p className="text-sm text-gray-500 mb-4">
          {products.length} result{products.length !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
        </p>
      )}

      {products.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No products found.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((p) => (
          <div key={p.id} className="border rounded-2xl p-5 shadow-sm hover:shadow-xl transition-shadow bg-white">
            <div className="h-40 bg-gray-100 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 font-bold text-sm">No Image</span>
              )}
            </div>
            <h2 className="text-xl font-bold">{p.name}</h2>
            <p className="text-gray-500 text-sm mt-2 line-clamp-2">{p.description}</p>
            <p className="text-xs text-gray-400 mt-1">
              {p.stockQuantity > 0 ? `In stock: ${p.stockQuantity}` : "Out of stock"}
            </p>
            <div className="flex justify-between items-end mt-6">
              <span className="text-2xl font-black text-gray-800">${p.price}</span>
              <AddToCartButton product={p} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
