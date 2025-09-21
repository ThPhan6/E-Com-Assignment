import { z } from "zod";

export const checkoutSchema = z
  .object({
    // Shipping fields
    firstName: z
      .string()
      .min(2, "Full name must be at least 2 characters long")
      .max(100, "Full name must be less than 100 characters"),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters long")
      .max(100, "Last name must be less than 100 characters"),
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

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
