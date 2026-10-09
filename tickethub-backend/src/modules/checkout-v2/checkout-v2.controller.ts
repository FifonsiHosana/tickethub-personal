import type { NextFunction, Request, Response } from 'express';
import checkoutV2Service from './checkout-v2.service.js';
import type { CheckoutV2Input } from './checkout-v2.schema.js';

class CheckoutV2Controller {
  async initiate(req: Request<{}, {}, CheckoutV2Input>, res: Response, next: NextFunction) {
    try {
      const data = await checkoutV2Service.initiateCheckout(
        req.body,
        req.user?.id ?? null,
      );
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export default new CheckoutV2Controller();
