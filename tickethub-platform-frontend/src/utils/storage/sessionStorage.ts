export const GUEST_CHECKOUT_EMAIL_KEY = "guest_checkout_email";

export function setSessionItem(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // no-op
  }
}

export function getSessionItem(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function removeSessionItem(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // no-op
  }
}