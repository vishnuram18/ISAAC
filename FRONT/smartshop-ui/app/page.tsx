import { fetchProducts, searchProducts } from "../services/api";
import { Product } from "../types";
import AddToCartButton from "../components/AddToCartButton";
import SearchBar from "../components/SearchBar";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products: Product[] = await (q ? searchProducts(q) : fetchProducts());

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* Hero search section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
          Discover <span className="grad-text">Amazing Products</span>
        </h1>
        <p className="text-slate-400 text-lg mb-8">Shop the best deals from verified sellers</p>
        <div className="flex justify-center">
          <SearchBar initialQuery={q ?? ""} />
        </div>
        {q && (
          <p className="text-slate-400 text-sm mt-4">
            {products.length} result{products.length !== 1 ? "s" : ""} for &ldquo;<span className="text-white font-medium">{q}</span>&rdquo;
          </p>
        )}
      </div>

      {/* Empty state */}
      {products.length === 0 && (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">🔍</p>
          <p className="text-xl font-semibold text-white">No products found</p>
          <p className="text-slate-400 mt-2">Try a different search term</p>
        </div>
      )}

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="glass group flex flex-col overflow-hidden hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            {/* Image */}
            <div className="h-44 overflow-hidden bg-white/5 flex items-center justify-center relative">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <span className="text-4xl">📦</span>
                  <span className="text-xs">No Image</span>
                </div>
              )}
              {/* Stock badge */}
              <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
                p.stockQuantity > 0
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}>
                {p.stockQuantity > 0 ? "In Stock" : "Sold Out"}
              </span>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
              <h2 className="font-bold text-white text-lg leading-tight mb-1 line-clamp-1">{p.name}</h2>
              {p.description && (
                <p className="text-slate-400 text-sm line-clamp-2 mb-3">{p.description}</p>
              )}
              {p.sellerUsername && (
                <p className="text-xs text-slate-500 mb-3">by <span className="text-slate-400">{p.sellerUsername}</span></p>
              )}
              <div className="mt-auto flex items-end justify-between gap-2 pt-3 border-t border-white/8">
                <div>
                  <p className="text-2xl font-black text-white">
                    ${Number(p.price).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">{p.stockQuantity} units left</p>
                </div>
                <AddToCartButton product={p} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
