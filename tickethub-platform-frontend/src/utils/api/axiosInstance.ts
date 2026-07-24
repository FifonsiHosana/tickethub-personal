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

// Auth Token attachment interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getItem("auth_token") as string | null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Auth token removal interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // clear auth + redirect
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");

      window.location.href = "/";
    }

    return Promise.reject(error);
  },
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
  },
);

// Error handling Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const statusCode = error.response?.status ?? 500;
    const message =
      error.response?.data?.message ?? error.message ?? "Something went wrong";

    return Promise.reject(new ApiError(message, statusCode));
  },
);
