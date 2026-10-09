export interface CheckoutLine {
  eventTicketId: number;
  quantity: number;
  unitPrice: number;
  eventName: string;
  ticketName: string;
  configId: number;
}

export interface CheckoutTotals {
  subtotal: number;
  feeAmount: number;
  totalAmount: number;
  totalQuantity: number;
}

export const TICKET_FEE_AMOUNT = 10;

export function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateTotals(lines: CheckoutLine[]): CheckoutTotals {
  const subtotal = round2(
    lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
  );
  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);
  const feeAmount = round2(TICKET_FEE_AMOUNT * totalQuantity);
  return { subtotal, feeAmount, totalAmount: round2(subtotal + feeAmount), totalQuantity };
}

export function toPesewas(value: number) {
  return Math.round(round2(value) * 100);
}
