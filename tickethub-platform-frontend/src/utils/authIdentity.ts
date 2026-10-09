const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmailIdentifier(value: string) {
  return EMAIL_RE.test(value.trim());
}

export function normalizeGhanaPhoneForDisplay(value: string) {
  const raw = value.trim();
  const digits = raw.replace(/\D/g, "");
  if (raw.startsWith("+233") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("233") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("223") && digits.length === 12) return `+233${digits.slice(3)}`;
  if (digits.startsWith("0") && digits.length === 10) return `+233${digits.slice(1)}`;
  if (digits.length === 9) return `+233${digits}`;
  return raw;
}

export function contactChannel(value: string): "email" | "phone" {
  return isEmailIdentifier(value) ? "email" : "phone";
}
