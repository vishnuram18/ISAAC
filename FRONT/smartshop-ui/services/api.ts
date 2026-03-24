// services/api.ts
const GATEWAY_URL = "http://localhost:8080/api";

export const fetchProducts = async () => {
  const response = await fetch(`${GATEWAY_URL}/products/all`);
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
};

export const placeOrder = async (orderData: { productId: number; quantity: number }) => {
  const response = await fetch(`${GATEWAY_URL}/orders/place`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  if (!response.ok) throw new Error("Order failed");
  return response.json();
};