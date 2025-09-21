import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { PaymentInfo } from "../../types/checkout";

// Zod schema for payment form validation
const creditCardSchema = z.object({
  cardNumber: z
    .string()
    .regex(
      /^\d{4}-\d{4}-\d{4}-\d{4}$/,
      "Card number must be in format: 1234-5678-9012-3456"
    )
    .refine((val) => {
      const digits = val.replace(/-/g, "");
      return digits.length === 16 && /^\d+$/.test(digits);
    }, "Card number must contain exactly 16 digits"),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry must be in format: MM/YY")
    .refine((val) => {
      const [month, year] = val.split("/");
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      const expMonth = parseInt(month);
      const expYear = parseInt(year);

      if (
        expYear < currentYear ||
        (expYear === currentYear && expMonth < currentMonth)
      ) {
        return false;
      }
      return true;
    }, "Card has expired"),
  cvv: z
    .string()
    .regex(/^\d{3,4}$/, "CVV must be 3-4 digits")
    .min(3, "CVV must be at least 3 digits")
    .max(4, "CVV must be at most 4 digits"),
});

const paymentSchema = z
  .object({
    method: z.enum(["Credit Card", "PayPal", "COD"] as const),
    creditCard: z.union([creditCardSchema, z.undefined()]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method === "Credit Card") {
      if (!data.creditCard) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Credit card information is required",
          path: ["creditCard"],
        });
      }
    } else {
      if (data.creditCard) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Credit card information should not be provided for this payment method",
          path: ["creditCard"],
        });
      }
    }
  });

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  onSubmit: (data: PaymentInfo) => void;
  initialData?: Partial<PaymentInfo>;
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

export default function PaymentForm({
  onSubmit,
  initialData,
}: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: initialData?.method || "Credit Card",
      creditCard: initialData?.creditCard
        ? {
            cardNumber: initialData.creditCard.cardNumber,
            expiry: initialData.creditCard.expiry,
            cvv: initialData.creditCard.cvv,
          }
        : undefined,
    },
  });

  const selectedMethod = watch("method");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Payment Information
      </h2>

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
        {errors.method && (
          <p className="mt-1 text-sm text-red-600">{errors.method.message}</p>
        )}
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
              name="creditCard.cardNumber"
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
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.creditCard?.cardNumber
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="1234-5678-9012-3456"
                />
              )}
            />
            {errors.creditCard?.cardNumber && (
              <p className="mt-1 text-sm text-red-600">
                {errors.creditCard.cardNumber.message}
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
                name="creditCard.expiry"
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
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.creditCard?.expiry
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="MM/YY"
                  />
                )}
              />
              {errors.creditCard?.expiry && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.creditCard.expiry.message}
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
                name="creditCard.cvv"
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
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.creditCard?.cvv
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="123"
                  />
                )}
              />
              {errors.creditCard?.cvv && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.creditCard.cvv.message}
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
    </form>
  );
}
