import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import {
  useCartStore,
  getProductFromUserCartItems,
  selectorTotalPrice,
} from "../store/useCartStore";
import type { OrderProduct } from "../types/checkout";
import { PATH } from "../lib/route";
import { useOrderStore } from "../store/useOrderStore";
import { ApiErrorHandler, retryOperation } from "../utils/apiErrorHandler";
import { userApi } from "../service/user.api";
import { cartApi } from "../service/cart.api";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ShippingInfo, PaymentInfo } from "../types/checkout";

import {
  checkoutSchema,
  type CheckoutFormData,
} from "../pages/checkout/components/schema";
import { throttle } from "lodash";

export const useCheckout = () => {
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

  return {
    user,
    cartItems,
    totalPrice,
    isProcessingOrder,
    handleDirectCheckout,
  };
};

export const useCheckoutStep = (
  onDirectCheckout: (
    shippingData: ShippingInfo,
    paymentData: PaymentInfo
  ) => Promise<void>
) => {
  const [showModal, setShowModal] = useState(false);
  const user = useAuthStore((state) => state.user);

  const {
    register,
    watch,
    control,
    setValue,
    formState: { errors, dirtyFields, touchedFields },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      email: user?.email || "",
      postalCode: user?.address?.postalCode || "",
      address: user?.address?.address || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      country: user?.address?.country || "",
      stateCode: user?.address?.stateCode || "",
      deliveryNotes: "",
      method: "Credit Card",
      cardNumber: "",
      expiry: "",
      cvv: "",
    },
  });

  const selectedMethod = watch("method");

  const processConfirmOrder = async () => {
    if (!onDirectCheckout) return;

    const data = watch();

    // Manual validation for required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "phone",
      "email",
      "postalCode",
      "address",
      "country",
    ];
    const hasAllRequiredFields = requiredFields.every((field) => {
      const value = data[field as keyof CheckoutFormData];
      return value && value.toString().trim() !== "";
    });

    // Additional validation for credit card if selected
    const isCreditCardValid =
      data.method !== "Credit Card" ||
      (data.cardNumber && data.expiry && data.cvv);

    if (!hasAllRequiredFields || !isCreditCardValid) {
      return;
    }

    const shippingData: ShippingInfo = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      postalCode: data.postalCode,
      address: data.address,
      city: data.city || "",
      state: data.state || "",
      country: data.country,
      stateCode: data.stateCode,
      deliveryNotes: data.deliveryNotes,
    };

    const paymentData: PaymentInfo = {
      method: data.method,
      creditCard:
        data.method === "Credit Card"
          ? {
              cardNumber: data.cardNumber!,
              expiry: data.expiry!,
              cvv: data.cvv!,
            }
          : undefined,
    };

    setShowModal(false);
    await onDirectCheckout(shippingData, paymentData);
  };

  const handleConfirmOrderThrottled = useCallback(
    throttle(() => {
      processConfirmOrder();
    }, 1000),
    [watch()]
  );

  const handleConfirmOrder = () => {
    handleConfirmOrderThrottled();
  };

  // Helper function to show error only if field is dirty and touched
  const shouldShowError = (fieldName: keyof CheckoutFormData) => {
    return (
      dirtyFields[fieldName] && touchedFields[fieldName] && errors[fieldName]
    );
  };

  const isFormValid = () => {
    const data = watch();
    const requiredFields = [
      "firstName",
      "lastName",
      "phone",
      "email",
      "postalCode",
      "address",
      "country",
    ];
    const hasAllRequiredFields = requiredFields.every((field) => {
      const value = data[field as keyof typeof data];
      return value && value.toString().trim() !== "";
    });

    // Additional validation for credit card if selected
    const isCreditCardValid =
      data.method !== "Credit Card" ||
      (data.cardNumber && data.expiry && data.cvv);

    return hasAllRequiredFields && isCreditCardValid;
  };

  return {
    register,
    watch,
    control,
    setValue,
    errors,
    isFormValid,
    dirtyFields,
    touchedFields,
    shouldShowError,
    handleConfirmOrder,
    selectedMethod,
    showModal,
    setShowModal,
  };
};
