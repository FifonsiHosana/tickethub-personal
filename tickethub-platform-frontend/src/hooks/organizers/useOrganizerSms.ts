import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSmsHistory,
  sendSms,
  getCreditWallet,
  buyCredits,
  verifyCreditPurchase,
  getCreditTransactions,
  type SmsHistoryItem,
  type SendSmsPayload,
  type CreditPurchasePayload,
  type CreditTransactionRecord,
} from '@/utils/services/organizers/sms.service';

export const smsKeys = {
  all: ['organizer-sms'] as const,
  history: () => [...smsKeys.all, 'history'] as const,
  balance: () => [...smsKeys.all, 'balance'] as const,
  transactions: () => [...smsKeys.all, 'transactions'] as const,
};

export function useSmsHistory() {
  return useQuery({
    queryKey: smsKeys.history(),
    queryFn: getSmsHistory,
  });
}

export function useCreditWallet() {
  return useQuery({
    queryKey: smsKeys.balance(),
    queryFn: getCreditWallet,
  });
}

export function useCreditTransactions() {
  return useQuery({
    queryKey: smsKeys.transactions(),
    queryFn: getCreditTransactions,
  });
}

export function useSendSms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendSmsPayload) => sendSms(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsKeys.history() });
      queryClient.invalidateQueries({ queryKey: smsKeys.balance() });
      queryClient.invalidateQueries({ queryKey: smsKeys.transactions() });
    },
  });
}

export function useBuyCredits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreditPurchasePayload) => buyCredits(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsKeys.balance() });
      queryClient.invalidateQueries({ queryKey: smsKeys.transactions() });
    },
  });
}

export function useVerifyCreditPurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reference: string) => verifyCreditPurchase(reference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsKeys.balance() });
      queryClient.invalidateQueries({ queryKey: smsKeys.transactions() });
    },
  });
}

export type { SmsHistoryItem, SendSmsPayload, CreditPurchasePayload, CreditTransactionRecord };