import type { Request, Response } from 'express';

import categoriesService from './categories.service.js';
import type { CreateCategoryInput } from './events.schema.js';

class CategoriesController {
  async listCategories(_: Request, res: Response) {
    const data = await categoriesService.getCategories();
    return res.json({ success: true, data });
  }

  async createCategory(req: Request<{}, {}, CreateCategoryInput>, res: Response) {
    const data = await categoriesService.createCategory(req.body.name);
    return res.status(201).json({ success: true, data });
  }
}

export default new CategoriesController();
