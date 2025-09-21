import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { authApi } from "../service/auth.api";
import { PATH } from "../lib/route";
import { throttle } from "lodash";
import { toast } from "react-hot-toast";

export const useLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { accessToken, isAuthenticated, setTokens } = useAuthStore();

  // Check if user already has valid token and redirect
  useEffect(() => {
    if (accessToken && isAuthenticated()) {
      navigate(PATH.PRODUCTS);
    }
  }, [accessToken, isAuthenticated, navigate]);

  const handleSubmit = async () => {
    if (!username || !password) {
      toast.error("Please enter a username and password");
      return;
    }

    setLoading(true);
    const res = await authApi.login({
      username,
      password,
      expiresInMins: 60,
    });

    if (res?.status !== 200) {
      setLoading(false);
      return;
    }

    setLoading(false);
    setTokens(res.data.accessToken, res.data.refreshToken);
    navigate(PATH.PRODUCTS);
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
    loading,
    loginHandler,
  };
};
