import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../service/auth.api";
import { useAuthStore } from "../store/useAuthStore";
import { PATH } from "../lib/route";

export const useLogin = () => {
  const [username, setUsername] = useState("emilys");
  const [password, setPassword] = useState("emilyspass");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { setTokens, setUser, isAuthenticated } = useAuthStore();

  // Check if user is already authenticated on mount
  useEffect(() => {
    if (isAuthenticated()) {
      navigate(PATH.PRODUCTS);
    }
  }, [isAuthenticated, navigate]);

  const loginHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call login API
      const response = await authApi.login({
        username: username.trim(),
        password: password.trim(),
        expiresInMins: 60, // 1 hour token expiry
      });

      if (response.status === 200 && response.data) {
        const { accessToken, refreshToken } = response.data;

        // Store tokens in auth store
        setTokens(accessToken, refreshToken);

        // Fetch user profile
        try {
          const userResponse = await authApi.me();
          if (userResponse.status === 200 && userResponse.data) {
            setUser(userResponse.data);
          }
        } catch (userError) {
          console.warn("Failed to fetch user profile:", userError);
          // Continue with login even if user profile fetch fails
        }

        // Navigate to products page
        navigate(PATH.PRODUCTS);
      } else {
        setError("Invalid username or password");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as { message?: string })?.message ||
        "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    loading,
    error,
    loginHandler,
  };
};
