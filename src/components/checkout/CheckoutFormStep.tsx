import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import type { ShippingInfo, PaymentInfo } from "../../types/checkout";
import CountryStateSelector from "./CountryStateSelector";

// Combined Zod schema for step 1 (shipping + payment)
const combinedSchema = z
  .object({
    // Shipping fields
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters long")
      .max(100, "Full name must be less than 100 characters"),
    phone: z
      .string()
      .regex(/^\d{9,11}$/, "Phone number must be 9-11 digits")
      .min(9, "Phone number must be at least 9 digits")
      .max(11, "Phone number must be at most 11 digits"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .max(100, "Email must be less than 100 characters"),
    postalCode: z
      .string()
      .regex(/^\d+$/, "Postal code must contain only numbers")
      .min(5, "Postal code must be at least 5 digits")
      .max(10, "Postal code must be at most 10 digits"),
    address: z
      .string()
      .min(5, "Address must be at least 5 characters long")
      .max(200, "Address must be less than 200 characters"),
    city: z
      .string()
      .min(2, "City must be at least 2 characters long")
      .max(100, "City must be less than 100 characters")
      .optional()
      .or(z.literal("")),
    state: z
      .string()
      .min(2, "State must be at least 2 characters long")
      .max(100, "State must be less than 100 characters")
      .optional()
      .or(z.literal("")),
    country: z
      .string()
      .min(2, "Country must be at least 2 characters long")
      .max(100, "Country must be less than 100 characters"),
    stateCode: z.string().optional(),
    deliveryNotes: z
      .string()
      .max(500, "Delivery notes must be less than 500 characters")
      .optional(),
    // Payment fields
    method: z.enum(["Credit Card", "PayPal", "COD"] as const),
    cardNumber: z.string().optional(),
    expiry: z.string().optional(),
    cvv: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method === "Credit Card") {
      if (
        !data.cardNumber ||
        !data.cardNumber.match(/^\d{4}-\d{4}-\d{4}-\d{4}$/)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Card number must be in format: 1234-5678-9012-3456",
          path: ["cardNumber"],
        });
      }
      if (!data.expiry || !data.expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Expiry must be in format: MM/YY",
          path: ["expiry"],
        });
      } else {
        // Check if card is expired
        const [month, year] = data.expiry.split("/");
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        const expMonth = parseInt(month);
        const expYear = parseInt(year);

        if (
          expYear < currentYear ||
          (expYear === currentYear && expMonth < currentMonth)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Card has expired",
            path: ["expiry"],
          });
        }
      }
      if (!data.cvv || !data.cvv.match(/^\d{3,4}$/)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CVV must be 3-4 digits",
          path: ["cvv"],
        });
      }
    }
  });

type CombinedFormData = z.infer<typeof combinedSchema>;

interface CheckoutFormStepProps {
  onDirectCheckout: (
    shippingData: ShippingInfo,
    paymentData: PaymentInfo
  ) => Promise<void>;
  initialShipping?: Partial<ShippingInfo>;
  initialPayment?: Partial<PaymentInfo>;
  isProcessingOrder?: boolean;
  totalPrice: number;
}

// Helper function to format card number
const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1-");
  return formatted.slice(0, 19); // Limit to 19 characters (16 digits + 3 dashes)
};

// Helper function to format expiry
const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 2) {
    return digits.slice(0, 2) + "/" + digits.slice(2, 4);
  }
  return digits;
};

export default function CheckoutFormStep({
  onDirectCheckout,
  initialShipping,
  initialPayment,
  isProcessingOrder = false,
  totalPrice,
}: CheckoutFormStepProps) {
  const [showModal, setShowModal] = useState(false);
  const {
    register,
    watch,
    control,
    setValue,
    formState: { errors, isValid, dirtyFields, touchedFields },
  } = useForm<CombinedFormData>({
    resolver: zodResolver(combinedSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      fullName: initialShipping?.fullName || "",
      phone: initialShipping?.phone || "",
      email: initialShipping?.email || "",
      postalCode: initialShipping?.postalCode || "",
      address: initialShipping?.address || "",
      city: initialShipping?.city || "",
      state: initialShipping?.state || "",
      country: initialShipping?.country || "",
      stateCode: initialShipping?.stateCode || "",
      deliveryNotes: initialShipping?.deliveryNotes || "",
      method: initialPayment?.method || "Credit Card",
      cardNumber: initialPayment?.creditCard?.cardNumber || "",
      expiry: initialPayment?.creditCard?.expiry || "",
      cvv: initialPayment?.creditCard?.cvv || "",
    },
  });

  const selectedMethod = watch("method");

  const handleConfirmOrder = async () => {
    if (!isValid || !onDirectCheckout) return;

    const data = watch();
    const shippingData: ShippingInfo = {
      fullName: data.fullName,
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

  // Helper function to show error only if field is dirty and touched
  const shouldShowError = (fieldName: keyof CombinedFormData) => {
    return (
      dirtyFields[fieldName] && touchedFields[fieldName] && errors[fieldName]
    );
  };

  return (
    <div className="space-y-8">
      {/* Shipping Information Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Shipping Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name *
            </label>
            <input
              id="fullName"
              type="text"
              {...register("fullName")}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                shouldShowError("fullName")
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter your full name"
            />
            {shouldShowError("fullName") && (
              <p className="mt-1 text-sm text-red-600">
                {errors.fullName?.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number *
            </label>
            <input
              id="phone"
              type="tel"
              {...register("phone")}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                shouldShowError("phone") ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="123456789"
            />
            {shouldShowError("phone") && (
              <p className="mt-1 text-sm text-red-600">
                {errors.phone?.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                shouldShowError("email") ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="example@email.com"
            />
            {shouldShowError("email") && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email?.message}
              </p>
            )}
          </div>

          {/* Country and State Selector */}
          <div className="md:col-span-2">
            <CountryStateSelector
              onCountryChange={(countryName) => {
                setValue("country", countryName, { shouldValidate: true });
                setValue("state", "", { shouldValidate: true });
                setValue("stateCode", "", { shouldValidate: true });
                setValue("city", "", { shouldValidate: true });
              }}
              onStateChange={(stateName, stateCode) => {
                setValue("state", stateName, { shouldValidate: true });
                setValue("stateCode", stateCode, { shouldValidate: true });
                setValue("city", "", { shouldValidate: true });
              }}
              onCityChange={(cityName) => {
                setValue("city", cityName, { shouldValidate: true });
              }}
              errors={{
                country: shouldShowError("country")
                  ? errors.country?.message
                  : undefined,
                state: shouldShowError("state")
                  ? errors.state?.message
                  : undefined,
                city: shouldShowError("city")
                  ? errors.city?.message
                  : undefined,
              }}
            />
          </div>

          {/* Postal Code Field */}
          <div>
            <label
              htmlFor="postalCode"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Postal Code *
            </label>
            <input
              id="postalCode"
              type="text"
              {...register("postalCode")}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                shouldShowError("postalCode")
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="12345"
            />
            {shouldShowError("postalCode") && (
              <p className="mt-1 text-sm text-red-600">
                {errors.postalCode?.message}
              </p>
            )}
          </div>

          {/* State Code Field (Optional) */}
          <div>
            <label
              htmlFor="stateCode"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              State Code (Optional)
            </label>
            <input
              id="stateCode"
              type="text"
              {...register("stateCode")}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                shouldShowError("stateCode")
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="NY"
              maxLength={10}
            />
            {shouldShowError("stateCode") && (
              <p className="mt-1 text-sm text-red-600">
                {errors.stateCode?.message}
              </p>
            )}
          </div>

          {/* Street Address Field */}
          <div className="md:col-span-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Street Address *
            </label>
            <input
              id="address"
              type="text"
              {...register("address")}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                shouldShowError("address")
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="123 Main Street, Apartment 4B"
            />
            {shouldShowError("address") && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address?.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="deliveryNotes"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Delivery Notes (Optional)
            </label>
            <textarea
              id="deliveryNotes"
              {...register("deliveryNotes")}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                shouldShowError("deliveryNotes")
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Leave delivery instructions..."
            />
            {shouldShowError("deliveryNotes") && (
              <p className="mt-1 text-sm text-red-600">
                {errors.deliveryNotes?.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Information Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Payment Information
        </h2>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="method"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Payment Method *
            </label>
            <select
              id="method"
              {...register("method")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Credit Card">Credit Card</option>
              <option value="PayPal">PayPal</option>
              <option value="COD">Cash on Delivery</option>
            </select>
          </div>

          {selectedMethod === "Credit Card" && (
            <div className="space-y-4 border-t pt-6">
              <div>
                <label
                  htmlFor="cardNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Card Number *
                </label>
                <Controller
                  name="cardNumber"
                  control={control}
                  render={({ field }) => (
                    <input
                      id="cardNumber"
                      type="text"
                      value={field.value || ""}
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value);
                        field.onChange(formatted);
                      }}
                      onBlur={field.onBlur}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        shouldShowError("cardNumber")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="1234-5678-9012-3456"
                    />
                  )}
                />
                {shouldShowError("cardNumber") && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.cardNumber?.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="expiry"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Expiry Date *
                  </label>
                  <Controller
                    name="expiry"
                    control={control}
                    render={({ field }) => (
                      <input
                        id="expiry"
                        type="text"
                        value={field.value || ""}
                        onChange={(e) => {
                          const formatted = formatExpiry(e.target.value);
                          field.onChange(formatted);
                        }}
                        onBlur={field.onBlur}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          shouldShowError("expiry")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="MM/YY"
                      />
                    )}
                  />
                  {shouldShowError("expiry") && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.expiry?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="cvv"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    CVV *
                  </label>
                  <Controller
                    name="cvv"
                    control={control}
                    render={({ field }) => (
                      <input
                        id="cvv"
                        type="text"
                        value={field.value || ""}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          field.onChange(digits.slice(0, 4));
                        }}
                        onBlur={field.onBlur}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          shouldShowError("cvv")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="123"
                      />
                    )}
                  />
                  {shouldShowError("cvv") && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.cvv?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedMethod !== "Credit Card" && (
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-800">
                {selectedMethod === "PayPal"
                  ? "You will be redirected to PayPal to complete your payment."
                  : "Payment will be collected upon delivery."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Button */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        disabled={!isValid || isProcessingOrder}
        className={`w-full px-8 py-4 rounded-md font-semibold text-black text-lg ${
          isValid && !isProcessingOrder
            ? "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-lg transform transition-all duration-200 hover:scale-105"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {isProcessingOrder ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
            Processing Order...
          </div>
        ) : isValid ? (
          <div className="flex items-center justify-center">
            <span className="text-xl mr-2">🛒</span>
            Place Order Now
          </div>
        ) : (
          "Complete Form to Place Order"
        )}
      </button>

      {/* Simple Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white-500 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Confirm Order
            </h2>

            <div className="text-center mb-6">
              <p className="text-gray-600 mb-2">Total Amount</p>
              <p className="text-3xl font-bold text-green-600">
                ${totalPrice.toFixed(2)}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={isProcessingOrder}
                className="flex-1 px-4 py-2 bg-green-600 text-black font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isProcessingOrder ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
