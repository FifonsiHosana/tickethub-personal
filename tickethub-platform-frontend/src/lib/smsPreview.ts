// Shared helper to render an SMS template with sample {{variable}} values.
const SAMPLE_VARS: Record<string, string> = {
  first_name: "Sarah",
  event: "Accra Music Festival",
};

export function renderSmsPreview(text: string): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const value = SAMPLE_VARS[key.toLowerCase()];
    return value ? value : `{{${key}}}`;
  });
}

export function formatNow(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/// I will come back for.. meet later, after I have killed your brothers