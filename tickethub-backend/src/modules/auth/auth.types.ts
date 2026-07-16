import { roles } from '@/db/schema/index.js';

export type Roles = typeof roles.$inferSelect;
