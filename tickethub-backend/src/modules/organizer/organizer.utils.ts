import { type Request } from 'express';
export function getOrganizerId(req: Request) {
  return req.user.id;
}

export function toKebabCase(text: string): string {
  return text
    .trim()
    .replace(/[^a-zA-Z0-9\s_-]/g, '') // Remove all special characters except spaces, hyphens, and underscores
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with a single hyphen
    .replace(/-+/g, '-') // Prevent multiple consecutive hyphens
    .toLowerCase();
}
