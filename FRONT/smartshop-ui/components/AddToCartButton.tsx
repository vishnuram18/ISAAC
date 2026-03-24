"use client"; // MUST BE THE FIRST LINE
import { placeOrder } from "../services/api";

export default function AddToCartButton({ productId }: { productId: number }) {
  const handleOrder = async () => {
    try {
      // This calls your API
      await placeOrder({ productId, quantity: 1 });

      // ADD THIS LINE: It gives the user immediate confirmation
      alert("✅ Success! Item added to your order history.");

    } catch (error) {
      // This helps you if the backend is down
      alert("❌ Error: Could not place order. Is the Gateway running?");
      console.error(error);
    }
  };

  return (
    <button
      onClick={handleOrder} // Make sure this is linked
      className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition"
    >
      Add to Cart
    </button>
  );
}