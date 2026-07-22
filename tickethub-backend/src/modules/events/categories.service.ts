import { db } from '@/db/client.js';
import { category } from '@/db/schema/index.js';
import { asc } from 'drizzle-orm';
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
}

export default new CategoriesService();
