import * as Popover from "@radix-ui/react-popover";
import { LazyImage } from "../components/Image";
import ConfirmationModal from "../components/ConfirmationModal";
import { useCartPopup } from "../hooks/useCartPopup";

export default function CartPopup() {
  const {
    cartItems,
    totalPrice,
    accessToken,
    showClearModal,
    setShowClearModal,
    handleQuantityChange,
    handleRemoveItem,
    handleClearCart,
    handleConfirmClearCart,
    handleCheckout,
  } = useCartPopup();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Shopping Cart</h3>
        <Popover.Close className="text-gray-400 hover:text-gray-600">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Popover.Close>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
            />
          </svg>
          <p className="text-gray-500 text-lg">Your cart is empty</p>
          <p className="text-gray-400 text-sm">
            Add some products to get started!
          </p>
        </div>
      ) : (
        <>
          <div className="max-h-96 overflow-y-auto space-y-4 mb-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between space-x-3 p-3 bg-gray-50 rounded-lg"
                title={item.title}
              >
                <div className="flex-1">
                  <LazyImage
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-16 h-16 object-contain rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate-2">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-500">${item.price}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() =>
                      handleQuantityChange(
                        item.id,
                        Math.max(0, (item.quantity ?? 0) - 1)
                      )
                    }
                    className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleQuantityChange(
                        item.id,
                        Math.max(0, (item.quantity ?? 0) + 1)
                      )
                    }
                    className="px-2 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600"
                    disabled={
                      !accessToken || (item.quantity ?? 0) + 1 > item.stock
                    }
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  disabled={!accessToken}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">
                Total: ${totalPrice.toFixed(2)}
              </span>
              <button
                onClick={handleClearCart}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Clear Cart
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full bg-green-500 hover:bg-green-600 text-black py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}

      <ConfirmationModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleConfirmClearCart}
        title="Clear Cart"
        description="Are you sure you want to remove all items from your cart? This action cannot be undone."
        confirmText="Clear Cart"
        cancelText="Cancel"
      />
    </div>
  );
}
