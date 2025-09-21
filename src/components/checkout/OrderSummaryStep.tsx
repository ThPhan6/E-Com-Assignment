import { useState } from "react";
import {
  CreditCardIcon,
  TruckIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import type {
  ShippingInfo,
  PaymentInfo,
  OrderProduct,
} from "../../types/checkout";

interface OrderSummaryStepProps {
  shippingInfo: ShippingInfo;
  paymentInfo: PaymentInfo;
  products: OrderProduct[];
  totalPrice: number;
  onConfirm: () => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

export default function OrderSummaryStep({
  shippingInfo,
  paymentInfo,
  products,
  totalPrice,
  onConfirm,
  onBack,
  isLoading,
}: OrderSummaryStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentMethodIcon = () => {
    switch (paymentInfo.method) {
      case "Credit Card":
        return <CreditCardIcon className="h-5 w-5" />;
      default:
        return <CreditCardIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Review Your Order
        </h2>
        <p className="text-gray-600 mb-8">
          Please review your order details before confirming your purchase.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Details */}
        <div className="space-y-6">
          {/* Shipping Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <TruckIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Shipping Information
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">
                {shippingInfo.fullName}
              </p>
              <p className="text-gray-600">{shippingInfo.email}</p>
              <p className="text-gray-600">{shippingInfo.phone}</p>
              <div className="flex items-start mt-3">
                <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-900">{shippingInfo.address}</p>
                  <p className="text-gray-600">
                    Postal Code: {shippingInfo.postalCode}
                  </p>
                  {shippingInfo.deliveryNotes && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-500">
                        Delivery Notes:
                      </p>
                      <p className="text-sm text-gray-700">
                        {shippingInfo.deliveryNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              {getPaymentMethodIcon()}
              <h3 className="text-lg font-semibold text-gray-900 ml-2">
                Payment Method
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{paymentInfo.method}</p>
              {paymentInfo.method === "Credit Card" &&
                paymentInfo.creditCard && (
                  <div className="space-y-1">
                    <p className="text-gray-600">
                      Card ending in{" "}
                      {paymentInfo.creditCard.cardNumber.slice(-4)}
                    </p>
                    <p className="text-gray-600">
                      Expires: {paymentInfo.creditCard.expiry}
                    </p>
                  </div>
                )}
              {paymentInfo.method === "PayPal" && (
                <p className="text-gray-600">
                  You will be redirected to PayPal to complete payment
                </p>
              )}
              {paymentInfo.method === "COD" && (
                <p className="text-gray-600">
                  Payment will be collected upon delivery
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Order Items ({products.length} items)
          </h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {products.map((product) => (
              <div key={product.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-xs text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {product.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Qty: {product.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${(product.price * product.quantity).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    ${product.price.toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          <div className="border-t mt-6 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">
                Total:
              </span>
              <span className="text-xl font-bold text-blue-600">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Including all taxes and fees
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Ready to Complete Your Order?
          </h3>
          <p className="text-gray-600 mb-4">
            Review the information above and click "Place Order" to complete
            your purchase.
          </p>
          <div className="flex items-center justify-center space-x-2 text-lg font-semibold text-green-700">
            <span>Total: ${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting || isLoading}
          className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back to Information
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting || isLoading}
          className="flex-1 sm:flex-auto px-8 py-4 bg-green-600 text-white font-semibold text-lg rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform transition-all duration-200 hover:scale-105"
        >
          {isSubmitting || isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              Processing Order...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="text-xl mr-2">🛒</span>
              {`Place Order - $${totalPrice.toFixed(2)}`}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
