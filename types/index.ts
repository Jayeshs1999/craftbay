export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "buyer" | "seller" | "admin";
  isSeller: boolean;
  sellerProfile?: SellerProfile;
  addresses?: Address[];
  wishlist?: string[];
}

export interface SellerProfile {
  shopName: string;
  shopDesc?: string;
  shopBanner?: string;
  shopCity: string;
  shopState: string;
  pickupPincode: string;
  rating: number;
  totalSales: number;
  isVerified: boolean;
}

export interface ProductImage {
  url: string;
  publicId?: string;
  isMain: boolean;
}

export interface ProductVariant {
  name: string;
  value: string;
  additionalPrice: number;
  stock: number;
}

export interface Review {
  _id: string;
  user: { _id: string; name: string; avatar?: string };
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  seller: { _id: string; name: string; sellerProfile?: SellerProfile };
  name: string;
  slug: string;
  description: string;
  shortDesc?: string;
  images: ProductImage[];
  price: number;
  comparePrice?: number;
  currency: string;
  stock: number;
  sku?: string;
  variants: ProductVariant[];
  category: string;
  subCategory?: string;
  tags: string[];
  handmade: boolean;
  freeShipping: boolean;
  shippingCharge: number;
  reviews: Review[];
  rating: number;
  numReviews: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: string;
}

export interface Address {
  _id?: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export type DeliveryMode = "platform" | "self_ship" | "pickup";
export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled" | "return_requested" | "returned";
export type PaymentMethod = "razorpay" | "cod";

export interface OrderItem {
  product: string | Product;
  seller: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  variant?: string;
}

export interface Order {
  _id: string;
  buyer: string | User;
  items: OrderItem[];
  shippingAddress: Address;
  itemsTotal: number;
  shippingCharge: number;
  platformFee: number;
  discount: number;
  totalAmount: number;
  deliveryMode: DeliveryMode;
  estimatedDelivery?: string;
  trackingNumber?: string;
  courier?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: OrderStatus;
  statusHistory: { status: string; note?: string; updatedBy: string; timestamp: string }[];
  createdAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  [key: string]: T[] | number;
  page: number;
  pages: number;
  total: number;
}
