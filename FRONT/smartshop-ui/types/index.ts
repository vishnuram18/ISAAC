export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
}

export interface Order {
  id: number;
  userId: number | null;
  productId: number;
  quantity: number;
  totalPrice: number;
  status: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}
