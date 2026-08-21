import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import type { AudienceSelection } from '@/components/sections/Dashboard/Organizer/SMS/AudienceFilter';

export const CREDIT_PER_SMS = Number(import.meta.env.VITE_CREDIT_PER_SMS || 1);

export function audienceLabel(selection: AudienceSelection): string {
  if (selection.mode === 'import') return 'Imported contacts';
  if (selection.mode === 'custom')
    return `${selection.customPhones.length} custom number${selection.customPhones.length === 1 ? '' : 's'}`;
  if (selection.mode === 'event') {
    if (selection.allGroups) return 'All groups';
    if (selection.groupIds.length > 0)
      return `${selection.groupIds.length} group${selection.groupIds.length > 1 ? 's' : ''} selected`;
    return 'Event audience';
  }
  return '—';
}

export function normalizeRecipients(
  phones: string[],
): string[] {
  return Array.from(
    new Set(
      phones
        .map((value) => value?.toString().trim())
        .filter((value): value is string => Boolean(value) && value.length >= 8),
    ),
  );
}

export function calculateCreditUsage(
  recipientCount: number,
): number {
  return recipientCount * CREDIT_PER_SMS;
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export interface RecipientItem {
  name: string;
  phone: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending' | 'scheduled' | 'draft';
}

export interface CreditTransactionRecord {
  id: number;
  userId: number;
  reference: string;
  credits: string;
  type: 'purchase' | 'deduction' | string;
  createdAt: string | null;
}

export const recipientStatusConfig: Record<string, { label: string; className: string }> = {
  sent: { label: 'Sent', className: 'bg-emerald-100 text-emerald-700' },
  delivered: { label: 'Delivered', className: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Failed', className: 'bg-rose-100 text-rose-700' },
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  scheduled: { label: 'Scheduled', className: 'bg-sky-100 text-sky-700' },
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700' },
};

export function parseRecipients(raw: string | unknown[], defaultStatus: string): RecipientItem[] {
  let parsed: unknown = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = [raw];
    }
  }

  if (!Array.isArray(parsed)) return [];

  return parsed.map((item) => {
    if (typeof item === 'string') {
      return {
        name: 'Recipient',
        phone: item,
        status: (defaultStatus as 'sent' | 'delivered' | 'failed') || 'sent',
      };
    }
    return {
      name: item.name || 'Recipient',
      phone: item.phone || item.phoneNumber || '—',
      status: item.status || defaultStatus || 'sent',
    };
  });
}

export type TransactionStatus = 'completed' | 'pending' | 'failed';

export function deriveStatus(tx: { status?: string; type?: string; credits?: string | number }): TransactionStatus {
  if (typeof tx.status === 'string') {
    return tx.status as TransactionStatus;
  }
  return 'completed';
}

export const STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  completed: {
    label: 'Completed',
    icon: <CheckCircle2 className="size-3.5" />,
    className: 'bg-emerald-100 text-emerald-700',
  },
  pending: {
    label: 'Pending',
    icon: <Clock className="size-3.5" />,
    className: 'bg-amber-100 text-amber-700',
  },
  failed: {
    label: 'Failed',
    icon: <AlertCircle className="size-3.5" />,
    className: 'bg-rose-100 text-rose-700',
  },
};