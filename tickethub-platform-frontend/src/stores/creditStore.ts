import { useSyncExternalStore } from "react";

const STORAGE_KEY = "tickethub.smsCredits";

type CreditState = {
  total: number; // total credits ever purchased
  used: number; // credits consumed by sent campaigns
};

const DEFAULT_STATE: CreditState = {
  total: 50000,
  used: 40000,
};

function loadState(): CreditState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<CreditState>;
    return {
      total: parsed.total ?? DEFAULT_STATE.total,
      used: parsed.used ?? DEFAULT_STATE.used,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

let state: CreditState = loadState();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): CreditState {
  return state;
}

export function useCredits() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getCreditSnapshot(): CreditState {
  return state;
}

// Update the credit state from the backend wallet response.
export function syncCreditsFromWallet(wallet: {
  totalCredit?: number | string;
  creditUsed?: number | string;
  creditLeft?: number | string;
} | null | undefined): void {
  if (!wallet) return;

  const total = Number(wallet.totalCredit ?? 0);
  const used = Number(wallet.creditUsed ?? 0);

  state = {
    total: Number.isFinite(total) ? total : 0,
    used: Number.isFinite(used) ? used : 0,
  };

  persist();
  emit();
}

// Add credits when a pack is purchased. This is one is under development
export function addCredits(amount: number): void {
  if (amount <= 0) return;

  state = { ...state, total: state.total + amount };
  persist();
  emit();
}
