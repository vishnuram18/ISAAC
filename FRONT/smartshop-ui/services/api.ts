// services/api.ts
const GATEWAY_URL = "http://localhost:8080/api";

export const fetchProducts = async () => {
  const response = await fetch(`${GATEWAY_URL}/products/all`);
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
};

export const registerUser = async (username: string, email: string, password: string) => {
  const response = await fetch(`${GATEWAY_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, role: "USER" }),
  });
  if (!response.ok) throw new Error("Registration failed");
  return response.json();
};

export const loginUser = async (username: string, password: string) => {
  const response = await fetch(`${GATEWAY_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error("Invalid credentials");
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