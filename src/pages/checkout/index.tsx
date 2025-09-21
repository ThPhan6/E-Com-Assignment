import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CheckoutFormStep from "../../components/checkout/CheckoutFormStep";
import { useAuthStore } from "../../store/useAuthStore";
import {
  useCartStore,
  getProductFromUserCartItems,
  selectorTotalPrice,
} from "../../store/useCartStore";
import type {
  ShippingInfo,
  PaymentInfo,
  OrderProduct,
} from "../../types/checkout";
import { PATH } from "../../lib/route";
import { useOrderStore } from "../../store/useOrderStore";
import { ApiErrorHandler, retryOperation } from "../../utils/apiErrorHandler";
import { userApi } from "../../service/user.api";
import { cartApi } from "../../service/cart.api";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuthStore();
  const { userCarts } = useCartStore();
  const { setLastOrder } = useOrderStore();
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [hasShownReloadWarning, setHasShownReloadWarning] = useState(false);

  const productCart = getProductFromUserCartItems(userCarts);
  const cartItems = Object.values(productCart);
  const totalPrice = selectorTotalPrice(userCarts);

  // Check for page reload and show warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "You will lose your checkout information if you leave this page. Are you sure?";
      return e.returnValue;
    };

    // Add warning for page reload/close
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Show alert if user navigated here without proper flow (e.g., direct URL access or refresh)
    const isDirectAccess =
      !window.history.state || window.performance.navigation.type === 1; // 1 = reload
    if (isDirectAccess && !hasShownReloadWarning) {
      setHasShownReloadWarning(true);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasShownReloadWarning]);

  // Redirect if not authenticated or no valid token
  useEffect(() => {
    if (!user || !accessToken) {
      toast.error("Please log in to access checkout");
      navigate(PATH.LOGIN);
    }
  }, [user, accessToken, navigate]);

  // Show warning but don't redirect if cart is empty (could be due to reload)
  useEffect(() => {
    if (user && accessToken && cartItems.length === 0) {
      // Don't redirect immediately - give user a chance to understand what happened
      const timer = setTimeout(() => {
        navigate(PATH.PRODUCTS);
      }, 100); // 100ms delay

      return () => clearTimeout(timer);
    }
  }, [cartItems.length, user, accessToken, navigate]);

  // Handle direct checkout
  const handleDirectCheckout = async (
    shippingData: ShippingInfo,
    paymentData: PaymentInfo
  ) => {
    if (!user || !accessToken) {
      toast.error(
        "Authentication required. Please log in to complete your order."
      );
      navigate(PATH.LOGIN);
      return;
    }

    setIsProcessingOrder(true);
    const loadingToast = ApiErrorHandler.showLoading(
      "Processing your order..."
    );

    try {
      // Prepare order data
      const orderProducts: OrderProduct[] = cartItems.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity || 1,
        thumbnail: item.thumbnail,
      }));

      const orderData = {
        shippingInfo: shippingData,
        paymentInfo: paymentData,
        products: orderProducts,
        totalPrice,
        orderDate: new Date().toISOString(),
        orderId: `ORD-${Date.now()}`,
      };

      // Double-check authentication before API calls
      const currentAuthState = useAuthStore.getState();
      if (!currentAuthState.user || !currentAuthState.accessToken) {
        toast.error("Authentication session expired. Please log in again.");
        navigate(PATH.LOGIN);
        return;
      }

      // Step 1: Update user information with retry
      try {
        await retryOperation(
          () =>
            userApi.updateUser(user.id, {
              address: {
                city: shippingData.city,
                state: shippingData.state,
                country: shippingData.country,
                address: shippingData.address,
                postalCode: shippingData.postalCode,
              },
              phone: shippingData.phone,
            }),
          3,
          1000
        );
      } catch (error) {
        ApiErrorHandler.showError(error, "update user information");
      }

      // Step 2: Clear cart with retry
      try {
        await retryOperation(() => cartApi.clearCart(user.id), 3, 1000);
      } catch (error) {
        ApiErrorHandler.showError(error, "clear cart");
      }

      // Step 3: Clear local cart state
      useCartStore.getState().clearCart();

      // Step 4: Store order in local state
      setLastOrder(orderData);

      // Dismiss loading toast and show success
      ApiErrorHandler.dismissToast(loadingToast);
      ApiErrorHandler.showSuccess("Order placed successfully!");

      // Step 5: Redirect to confirmation page
      navigate(PATH.ORDER_CONFIRMATION);
    } catch (error) {
      console.error("Order placement failed:", error);
      ApiErrorHandler.dismissToast(loadingToast);
      ApiErrorHandler.showError(error, "place your order");
    } finally {
      setIsProcessingOrder(false);
    }
  };

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
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-md"
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
