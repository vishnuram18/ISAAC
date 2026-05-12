export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
}

export interface Order {
  id: number;
  userId: number | null;
  username: string;
  productId: number;
  quantity: number;
  totalPrice: number;
  status: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
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

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
}
