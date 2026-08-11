import { axiosInstance } from "../api/axiosInstance";
import type { User } from "@/types";

export type AuthRegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  roleId?: number;
  inviteToken?: string;
};

export type AuthRegisterResponse = {
  success: boolean;
  alreadyPending?: boolean;
  message: string;
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

export type SendOtpPayload = {
  email: string;
};

export type CompleteRegisterPayload = {
  email: string;
  otp: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roleName?: "attendee" | "organizer";
};

export type CompleteRegisterResponse = {
  token: string;
  user: User;
  roles: string[];
};

export type BecomeOrganizerResponse = {
  token: string;
  user: User;
  roles: string[];
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
};

export const signInWithEmailAndPassword = async (payload: AuthLoginPayload) => {
  const response = await axiosInstance.post("/auth/login", payload);
  return response;
};

export const signUpWithEmailAndPassword = async (
  payload: AuthRegisterPayload,
) => {
  const response = await axiosInstance.post<AuthRegisterResponse>(
    "/auth/register",
    payload,
  );
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

export const sendOtp = async (payload: SendOtpPayload) => {
  const response = await axiosInstance.post("/auth/send-otp", payload);
  return response;
};

export const completeRegister = async (payload: CompleteRegisterPayload) => {
  const response = await axiosInstance.post<CompleteRegisterResponse>(
    "/auth/complete-register",
    payload,
  );
  return response;
};

export const becomeOrganizer = async () => {
  const response = await axiosInstance.post<BecomeOrganizerResponse>(
    "/auth/become-organizer",
  );
  return response;
};

export const getUserRoles = async () => {
  const response = await axiosInstance.get("/auth/roles");
  return response;
};

export const requestPasswordReset = async (payload: ForgotPasswordPayload) => {
  const response = await axiosInstance.post("/auth/forgot-password", payload);
  return response;
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
  const response = await axiosInstance.post("/auth/reset-password", payload);
  return response;
};
