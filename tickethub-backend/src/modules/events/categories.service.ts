import { db } from '@/db/client.js';
import { category } from '@/db/schema/index.js';
import { asc, eq } from 'drizzle-orm';
import type { CategoryResponse } from './events.types.js';

class CategoriesService {
  async getCategories(): Promise<CategoryResponse[]> {
    return await db
      .select({
        id: category.id,
        name: category.name,
      })
      .from(category)
      .orderBy(asc(category.name));
  }

  async createCategory(name: string): Promise<CategoryResponse> {
    const trimmed = name.trim();

    const [existing] = await db
      .select({
        id: category.id,
        name: category.name,
      })
      .from(category)
      .where(eq(category.name, trimmed))
      .limit(1);

    if (existing) {
      return existing;
    }

    const [created] = await db
      .insert(category)
      .values({ name: trimmed })
      .$returningId();

    if (!created?.id) {
      throw new Error('Category creation failed');
    }

    return {
      id: created.id,
      name: trimmed,
    };
  }
}

export default new CategoriesService();
