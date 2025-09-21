import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ShippingInfo } from "../../types/checkout";

// Zod schema for shipping form validation
const shippingSchema = z.object({
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
    .max(100, "City must be less than 100 characters"),
  state: z
    .string()
    .min(2, "State must be at least 2 characters long")
    .max(100, "State must be less than 100 characters"),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters long")
    .max(100, "Country must be less than 100 characters"),
  stateCode: z.string().optional(),
  deliveryNotes: z
    .string()
    .max(500, "Delivery notes must be less than 500 characters")
    .optional(),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

interface ShippingFormProps {
  onSubmit: (data: ShippingInfo) => void;
  initialData?: Partial<ShippingInfo>;
}

export default function ShippingForm({
  onSubmit,
  initialData,
}: ShippingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      postalCode: initialData?.postalCode || "",
      address: initialData?.address || "",
      deliveryNotes: initialData?.deliveryNotes || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              errors.fullName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your full name"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.fullName.message}
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
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="123456789"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
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
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="example@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

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
              errors.postalCode ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="12345"
          />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-red-600">
              {errors.postalCode.message}
            </p>
          )}
        </div>

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
              errors.address ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="123 Main Street, Apartment 4B"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">
              {errors.address.message}
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
              errors.deliveryNotes ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Leave delivery instructions..."
          />
          {errors.deliveryNotes && (
            <p className="mt-1 text-sm text-red-600">
              {errors.deliveryNotes.message}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
