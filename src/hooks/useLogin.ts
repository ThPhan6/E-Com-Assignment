import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { authApi } from "../service/auth.api";
import { PATH } from "../lib/route";
import { throttle } from "lodash";

export const useLogin = () => {
  const [username, setUsername] = useState("michaelw");
  const [password, setPassword] = useState("michaelwpass");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { accessToken, isTokenExpiring, setTokens } = useAuthStore();

  // Check if user already has valid token and redirect
  useEffect(() => {
    if (accessToken && !isTokenExpiring()) {
      navigate(PATH.PRODUCTS);
    }
  }, [accessToken, isTokenExpiring, navigate]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await authApi.login({
        username,
        password,
        expiresInMins: 1, // 1 min
      });

      setTokens(res.data.accessToken, res.data.refreshToken);

      navigate(PATH.PRODUCTS);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitThrottled = useCallback(
    throttle(() => {
      handleSubmit();
    }, 1000),
    [username, password]
  );

  const loginHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmitThrottled();
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    error,
    loading,
    loginHandler,
  };
};
