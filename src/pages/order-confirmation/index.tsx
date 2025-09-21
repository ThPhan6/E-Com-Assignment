import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircleIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useOrderStore } from "../../store/useOrderStore";
import { PATH } from "../../lib/route";

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const { lastOrder } = useOrderStore();

  // Redirect if no order exists
  useEffect(() => {
    if (!lastOrder) {
      navigate(PATH.PRODUCTS);
    }
  }, [lastOrder, navigate]);

  if (!lastOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order confirmation...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 bg-green-100 rounded-full mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been successfully
            placed.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Order Details
            </h2>
          </div>

          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Order Information
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Order Number
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {lastOrder.orderId}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Order Date
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {formatDate(lastOrder.orderDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Payment Method
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {lastOrder.paymentInfo.method}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Shipping Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Shipping Information
                </h3>
                <div className="text-sm text-gray-900 space-y-1">
                  <p className="font-medium">
                    {lastOrder.shippingInfo.firstName}{" "}
                    {lastOrder.shippingInfo.lastName}
                  </p>
                  <p>{lastOrder.shippingInfo.address}</p>
                  <p>
                    {lastOrder.shippingInfo.city &&
                      lastOrder.shippingInfo.state && (
                        <>
                          {lastOrder.shippingInfo.city},{" "}
                          {lastOrder.shippingInfo.state}
                          {lastOrder.shippingInfo.stateCode &&
                            ` (${lastOrder.shippingInfo.stateCode})`}
                        </>
                      )}
                  </p>
                  <p>
                    {lastOrder.shippingInfo.country && (
                      <>{lastOrder.shippingInfo.country}</>
                    )}
                  </p>
                  <p>{lastOrder.shippingInfo.postalCode}</p>
                  <p>{lastOrder.shippingInfo.phone}</p>
                  <p>{lastOrder.shippingInfo.email}</p>
                  {lastOrder.shippingInfo.deliveryNotes && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-500">
                        Delivery Notes:
                      </p>
                      <p className="text-sm text-gray-900">
                        {lastOrder.shippingInfo.deliveryNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Order Items</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {lastOrder.products.map((product) => (
              <div key={product.id} className="px-6 py-4 flex items-center">
                <div className="flex-shrink-0">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                      <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {product.quantity} x ${product.price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${(product.price * product.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount:</span>
              <span>${lastOrder.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <button
            onClick={() => navigate(PATH.PRODUCTS)}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-black bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue Shopping
          </button>
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            What's Next?
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• You will receive an order confirmation email shortly</li>
            <li>
              • Order tracking information will be sent once your order ships
            </li>
            <li>• For any questions, please contact our customer service</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
