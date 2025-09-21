import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { authApi } from "../service/auth.api";
import { PATH } from "../lib/route";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, setUser, isAuthenticated, clearTokens, accessToken } =
    useAuthStore();
  const navigate = useNavigate();
  const hasFetchedUser = useRef(false); // prevent multiple fetches

  useEffect(() => {
    // If user exists but token expired → logout
    if (user && !isAuthenticated()) {
      clearTokens();
      navigate(PATH.LOGIN, { replace: true });
      return;
    }

    // Prevent fetch after logout
    if (!user && !hasFetchedUser.current && accessToken) {
      hasFetchedUser.current = true;

      const fetchUser = async () => {
        try {
          const res = await authApi.me();
          if (res?.data) {
            setUser(res.data);
          } else {
            navigate(PATH.ERROR_403, { replace: true });
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_e) {
          navigate(PATH.ERROR_403, { replace: true });
        }
      };

      fetchUser();
    }
  }, [user, accessToken, setUser, isAuthenticated, clearTokens, navigate]);

  return children;
}
