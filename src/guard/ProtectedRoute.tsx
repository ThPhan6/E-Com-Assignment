import { Navigate } from "react-router-dom";
import type { JSX } from "react";
import { useAuthStore } from "../store/useAuthStore";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
