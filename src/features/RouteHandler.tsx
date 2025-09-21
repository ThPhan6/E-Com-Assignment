import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { PATH } from "../lib/route";

export default function RouteHandler() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // If user is not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to={PATH.LOGIN} replace />;
  }

  // If user is authenticated but on invalid route, redirect to products
  return <Navigate to={PATH.PRODUCTS} replace />;
}
