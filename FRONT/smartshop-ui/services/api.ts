const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:8080/api";

function getAuthHeader(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? res.statusText);
  }
  return res.json();
}

export const fetchProducts = async () => {
  const res = await fetch(`${GATEWAY_URL}/products/all`);
  return handleResponse(res);
};

export const login = async (username: string, password: string) => {
  const res = await fetch(`${GATEWAY_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
};

export const register = async (username: string, password: string, email: string) => {
  const res = await fetch(`${GATEWAY_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email }),
  });
  return handleResponse(res);
};

export const placeOrder = async (orderData: { productId: number; quantity: number }) => {
  const res = await fetch(`${GATEWAY_URL}/orders/place`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(orderData),
  });
  return handleResponse(res);
};
