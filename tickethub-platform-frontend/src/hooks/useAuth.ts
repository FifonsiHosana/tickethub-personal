import { useMutation, useQuery } from "@tanstack/react-query";
import {
  type AuthLoginPayload,
  type AuthRegisterPayload,
  signInWithEmailAndPassword,
  signUpWithEmailAndPassword,
  getUserRoles,
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

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    staleTime: Infinity,
    queryFn: getUserRoles,
  });
};
