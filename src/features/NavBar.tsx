import { useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Popover from "@radix-ui/react-popover";
import { useAuthStore } from "../store/useAuthStore";
import { selectorTotalItems, useCartStore } from "../store/useCartStore";
import { PATH } from "../lib/route";
import CartPopup from "./CartPopup";
import { NAV_BAR_HEIGHT } from "../lib/constant";
import { resetAllStores } from "../store/util";
import { hideLoading } from "../store/useLoadingStore";

export default function NavBar() {
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const clearTokens = useAuthStore((s) => s.clearTokens);

  const userCarts = useCartStore((s) => s.userCarts);
  const cartItemCount = selectorTotalItems(userCarts);

  const handleLogout = () => {
    clearTokens();
    resetAllStores();
    hideLoading();
    navigate(PATH.LOGIN, { replace: true });
  };

  if (!user) return null;

  return (
    <>
      <div
        className={`w-full bg-gray-900 text-white px-12 py-3 flex justify-between items-center shadow-md min-h-[${NAV_BAR_HEIGHT}px] fixed top-0 left-0 z-2`}
      >
        <div
          onClick={() => navigate(PATH.PRODUCTS)}
          className="text-lg font-semibold cursor-pointer"
        >
          🛒 E-COM
        </div>

        <div className="flex items-center space-x-4">
          {/* Cart Button with Popover */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="#000"
                  stroke="#0000075"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
                <div className="relative">
                  <span className="text-black">Cart</span>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-5 -right-7 bg-red-500 text-white text-xs rounded-full p-1 min-w-[36px] flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </div>
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="bg-white rounded-lg shadow-xl z-50 w-96 max-h-[80vh] overflow-hidden border border-gray-200"
                side="bottom"
                align="end"
                sideOffset={5}
              >
                <CartPopup />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {/* User Dropdown */}
          <div className="relative">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <div className="relative flex items-center space-x-2 cursor-pointer">
                  <img
                    src={`https://i.pravatar.cc/40?u=${user.id}`}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border-2 border-gray-600"
                  />
                  <span className="text-white capitalize">
                    {user?.username ?? ""}
                  </span>
                </div>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content
                className="bg-white text-black rounded-md shadow-lg p-2 min-w-[150px]"
                sideOffset={5}
              >
                <DropdownMenu.Item
                  className="cursor-pointer px-3 py-2 rounded hover:bg-gray-100"
                  onSelect={() => alert("Profile page coming soon 🚧")}
                >
                  Profile
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="cursor-pointer px-3 py-2 rounded hover:bg-gray-100"
                  onSelect={handleLogout}
                >
                  Logout
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </>
  );
}
