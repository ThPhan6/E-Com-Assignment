/** Shipping Info for Checkout */
export interface ShippingInfo {
  firstName: string; // Required, min length 2
  lastName: string; // Required, min length 2
  phone: string; // Required, 9-11 digits
  email: string; // Required, valid email
  postalCode: string; // Required, numeric
  address: string; // Required, min length 5
  city: string; // Required, min length 2
  state: string; // Required, min length 2
  country: string; // Required, min length 2
  stateCode?: string; // Optional state code (e.g., CA, NY)
  deliveryNotes?: string; // Optional notes
}

/** Payment Methods */
export type PaymentMethod = "Credit Card" | "PayPal" | "COD";

/** Credit Card Info */
export interface CreditCardInfo {
  cardNumber: string; // Auto-format 1234-5678-9012-3456
  expiry: string; // MM/YY
  cvv: string; // 3-4 digits
}

/** Payment Info for Checkout */
export interface PaymentInfo {
  method: PaymentMethod;
  creditCard?: CreditCardInfo; // Only if method === 'Credit Card'
}

/** Product in Cart for Order Summary */
export interface OrderProduct {
  id: number;
  title: string;
  price: number;
  quantity: number;
  thumbnail?: string;
}

/** Full Order */
export interface Order {
  shippingInfo: ShippingInfo;
  paymentInfo: PaymentInfo;
  products: OrderProduct[]; // Products in the cart
  totalPrice: number; // Calculated total
  orderDate: string; // ISO string
  orderId?: string; // Optional unique order ID
}

/** Checkout Form Data */
export interface CheckoutFormData {
  shippingInfo: ShippingInfo;
  paymentInfo: PaymentInfo;
}
