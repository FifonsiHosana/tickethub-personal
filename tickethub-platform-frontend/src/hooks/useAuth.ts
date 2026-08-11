import { useMutation, useQuery } from "@tanstack/react-query";
import {
  type AuthLoginPayload,
  type AuthRegisterPayload,
  type CompleteRegisterPayload,
  type ForgotPasswordPayload,
  type OtpPayload,
  type ResendOtpPayload,
  type ResetPasswordPayload,
  type SendOtpPayload,
  signInWithEmailAndPassword,
  signUpWithEmailAndPassword,
  verifyOtp,
  resendOtp,
  sendOtp,
  completeRegister,
  becomeOrganizer,
  getUserRoles,
  requestPasswordReset,
  resetPassword,
} from "@/utils/services/auth.service";
import { logger } from "@/utils/logger";

export const useSignInWithEmailAndPassword = () => {
  return useMutation({
    mutationFn: (payload: AuthLoginPayload) =>
      signInWithEmailAndPassword(payload),
    onSuccess: (data) => {
      logger.info("Sign In Success", data);
    },
    onError: (error) => {
      logger.error("Sign In Error", error);
    },
  });
};

export const useSignUpWithEmailAndPassword = () => {
  return useMutation({
    mutationFn: (payload: AuthRegisterPayload) =>
      signUpWithEmailAndPassword(payload),
    onSuccess: (data) => {
      logger.info("Sign In Success", data);
    },
    onError: (error) => {
      logger.error("Sign In Error", error);
    },
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: (payload: OtpPayload) => verifyOtp(payload),
  });
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: (payload: ResendOtpPayload) => resendOtp(payload),
  });
};

export const useSendOtp = () => {
  return useMutation({
    mutationFn: (payload: SendOtpPayload) => sendOtp(payload),
  });
};

export const useCompleteRegister = () => {
  return useMutation({
    mutationFn: (payload: CompleteRegisterPayload) =>
      completeRegister(payload),
  });
};

export const useBecomeOrganizer = () => {
  return useMutation({
    mutationFn: () => becomeOrganizer(),
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    staleTime: Infinity,
    queryFn: getUserRoles,
  });
};

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      requestPasswordReset(payload),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
  });
};
