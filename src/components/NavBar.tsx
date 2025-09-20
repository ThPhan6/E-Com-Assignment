import { useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAuthStore } from "../store/useAuthStore";
import { PATH } from "../lib/route";

export default function NavBar() {
  const navigate = useNavigate();
  const { user, clearTokens } = useAuthStore();

  const handleLogout = () => {
    clearTokens();
    navigate(PATH.LOGIN);
  };

  if (!user) return null; // hide NavBar if not logged in

  return (
    <div className="w-full bg-gray-900 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <div
        onClick={() => navigate("/products")}
        className="text-lg font-semibold cursor-pointer"
      >
        🛒 MyShop
      </div>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center space-x-2 focus:outline-none">
            <img
              src={`https://i.pravatar.cc/40?u=${user.id}`}
              alt="avatar"
              className="w-8 h-8 rounded-full border-2 border-gray-600"
            />
            <span>{user?.username ?? ""}</span>
          </button>
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
  );
}