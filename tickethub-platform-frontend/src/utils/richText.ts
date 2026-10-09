const EMPTY_RICH_TEXT_PATTERNS = new Set(["", "<p></p>", "<p><br></p>"]);

export function isEmptyRichText(html?: string | null) {
  if (!html) return true;

  const normalized = html
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, "")
    .toLowerCase();

  if (EMPTY_RICH_TEXT_PATTERNS.has(normalized)) return true;

  const textOnly = html
    .replace(/<br\s*\/?>(?=\s*<\/p>)/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();

  return textOnly.length === 0 && !/<p>\s*<\/p>/i.test(html);
}

export function richTextOrUndefined(html?: string | null) {
  return isEmptyRichText(html) ? undefined : html;
}

export function richTextOrNull(html?: string | null) {
  return isEmptyRichText(html) ? null : html;
}
