import { axiosInstance } from "../api/axiosInstance";

export type AuthRegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  roleId?: number;
  inviteToken?: string;
};

export type AuthLoginPayload = {
  email: string;
  password: string;
};

export type OtpPayload = {
  email: string;
  otp: string;
};

export type ResendOtpPayload = {
  email: string;
};

export const signInWithEmailAndPassword = async (payload: AuthLoginPayload) => {
  const response = await axiosInstance.post("/auth/login", payload);
  return response;
};

export const signUpWithEmailAndPassword = async (
  payload: AuthRegisterPayload,
) => {
  const response = await axiosInstance.post("/auth/register", payload);
  return response;
};

export const verifyOtp = async (payload: OtpPayload) => {
  const response = await axiosInstance.post("/auth/verify-otp", payload);
  return response;
};

export const resendOtp = async (payload: ResendOtpPayload) => {
  const response = await axiosInstance.post("/auth/resend-otp", payload);
  return response;
};

export const getUserRoles = async () => {
  const response = await axiosInstance.get("/auth/roles");
  return response;
};
