import axios, { AxiosError } from "axios";
import { env } from "@/config/env";
import { getItem } from "../storage/localStorage";
import { toast } from "sonner";
import type { ApiErrorResponse } from "@/types/apiError";

export const axiosInstance = axios.create({
  baseURL: `${env.apiBaseUrl}/api`,
});

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

function getSessionAuthToken(): string | null {
  try {
    const raw = sessionStorage.getItem("auth_token");
    return raw ? (JSON.parse(raw) as string) : null;
  } catch {
    return null;
  }
}

// Auth Token attachment interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      (getItem("auth_token") as string | null) ?? getSessionAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Auth token removal interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 only means "session expired" when the request actually sent a
    // token. Auth-flow requests (login, signup, verify-otp, resend-otp)
    // never attach one, so their 401s pass through to the caller's own
    // error handling instead of redirecting.
    const wasAuthenticated = !!error.config?.headers?.Authorization;

if (error.response?.status === 401 && wasAuthenticated) {
      // clear auth + redirect (from both persistent and session scopes)
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("user_role");
      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_user");
      sessionStorage.removeItem("user_role");

      toast.error("Your session has expired. Please login again");

      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

// server unreachable interceptor, a.k.a network error
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && !error.response) {
      error.message = "The server is unreachable. Please check your network";
      toast.error(error.message);
    }

    return Promise.reject(error);
  }
);

// Error handling Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const statusCode = error.response?.status ?? 500;
    const message =
      error.response?.data?.message ?? error.message ?? "Something went wrong";

    return Promise.reject(new ApiError(message, statusCode));
  }
);
