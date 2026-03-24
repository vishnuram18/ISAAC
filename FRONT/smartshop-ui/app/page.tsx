// Remove the @ or the .. - since they are neighbors, use this:
import { fetchProducts } from "../services/api";
import AddToCartButton from "../components/AddToCartButton";
export default async function Home() {
  const products = await fetchProducts();

  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="flex justify-between items-center mb-10 border-b pb-5">
        <h1 className="text-3xl font-extrabold text-blue-600">Isaac SmartShop</h1>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition">
          Login
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((p: any) => (
          <div key={p.id} className="border rounded-2xl p-5 shadow-sm hover:shadow-xl transition-shadow bg-white">
            <div className="h-40 bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
               <span className="text-gray-400 font-bold text-lg">Product Image</span>
            </div>
            <h2 className="text-xl font-bold">{p.name}</h2>
            <p className="text-gray-500 text-sm mt-2">{p.description}</p>
            <div className="flex justify-between items-center mt-6">
              <span className="text-2xl font-black text-gray-800">${p.price}</span>
              <AddToCartButton productId={p.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}