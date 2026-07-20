import axios from "axios";
import { env } from "@/config/env";
import { getItem } from "../storage/localStorage";
import { toast } from "sonner";

export const axiosInstance = axios.create({
  baseURL: `${env.apiBaseUrl}/api`,
});

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
