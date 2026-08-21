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
import { getEventTickets, getTicketHoldersPhoneNumbers } from '@/utils/services/organizers/tickets.service';
import type { TicketResponse } from '@/utils/services/organizers/tickets.service';

export const smsKeys = {
  all: ['organizer-sms'] as const,
  history: () => [...smsKeys.all, 'history'] as const,
  balance: () => [...smsKeys.all, 'balance'] as const,
  transactions: () => [...smsKeys.all, 'transactions'] as const,
  eventTickets: (eventId: number) => [...smsKeys.all, 'event-tickets', eventId] as const,
  ticketHoldersPhones: (eventId: number, groupIds: number[]) => [...smsKeys.all, 'ticket-holders-phones', eventId, groupIds] as const,
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

export function useEventTickets(eventId: number | null) {
  return useQuery({
    queryKey: smsKeys.eventTickets(eventId ?? 0),
    queryFn: () => getEventTickets(eventId!),
    enabled: !!eventId,
  });
}

export function useTicketHoldersPhoneNumbers(eventId: number | null, groupIds: number[] = []) {
  return useQuery({
    queryKey: smsKeys.ticketHoldersPhones(eventId ?? 0, groupIds),
    queryFn: () => getTicketHoldersPhoneNumbers(eventId!, groupIds),
    enabled: !!eventId,
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

export type { SmsHistoryItem, SendSmsPayload, CreditPurchasePayload, CreditTransactionRecord, TicketResponse };