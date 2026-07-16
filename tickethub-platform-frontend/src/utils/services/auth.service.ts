import { axiosInstance } from "../api/axiosInstance";

export type AuthRegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type AuthLoginPayload = {
  email: string;
  password: string;
};

export const signInWithEmailAndPassword = async (payload: AuthLoginPayload) => {
  const response = await axiosInstance.post("api/auth/login", payload);
  return response;
};

export const signUpWithEmailAndPassword = async (
  payload: AuthRegisterPayload,
) => {
  const response = await axiosInstance.post("/auth/register", payload);
  return response;
};

export const getUserRoles = async () => {
  const response = await axiosInstance.get("/auth/roles");
  return response;
};
