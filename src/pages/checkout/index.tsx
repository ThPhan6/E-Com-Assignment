import CheckoutFormStep from "./components/CheckoutFormStep";
import { useCheckout } from "../../hooks/useCheckout";
import { LazyImage } from "../../components/Image";

export default function CheckoutPage() {
  const {
    user,
    cartItems,
    totalPrice,
    isProcessingOrder,
    handleDirectCheckout,
  } = useCheckout();

  // Show loading or redirect if conditions not met
  if (!user || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">
            Complete your purchase by filling out the form below
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Checkout Form */}
          <div className="space-y-8">
            <CheckoutFormStep
              onDirectCheckout={handleDirectCheckout}
              isProcessingOrder={isProcessingOrder}
              totalPrice={totalPrice}
            />
          </div>

          {/* Right side - Order Summary (sticky) */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <LazyImage
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-16 h-16 object-contain rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${(item.price * (item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t mt-6 pt-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="uppercase font-bold">Total:</span>
                  <span className="text-blue-600">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Order Info */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm font-medium text-green-900">
                    Ready to complete your order?
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Fill out the form and click "Place Order Now"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
