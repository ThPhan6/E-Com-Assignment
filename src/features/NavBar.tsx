import React from "react";
import { useLogin } from "../hooks/useLogin";
import { PATH } from "../lib/route";

const NavBar: React.FC = () => {
  const { user, logout } = useLogin();

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href={PATH.PRODUCTS} className="text-xl font-bold text-gray-800">
              E-COM
            </a>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  Welcome, {user.firstName} {user.lastName}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
