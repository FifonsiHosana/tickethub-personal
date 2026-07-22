import type { Request, Response } from 'express';

import categoriesService from './categories.service.js';

class CategoriesController {
  async listCategories(_: Request, res: Response) {
    const data = await categoriesService.getCategories();
    return res.json({ success: true, data });
  }
}

export default new CategoriesController();
