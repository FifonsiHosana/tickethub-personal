import { TelcoProviders } from "../ussd/ussd.types";
import {
  initiatePayment,
  paymentComplete,
  verifyPaystackSignature,
} from "./ussd-payment.service";
import { Request, Response } from "express";
import { PaystackPaymentFields } from "./ussd-payment.types";

export const testPayment = async (req: Request, res: Response) => {
  try {
    const fields = {
      amount: 30000,
      email: "donaldfifonsi@gmail.com",
      currency: "GHS",
      mobile_money: {
        phone: "233551234987",
        provider: "mtn" as TelcoProviders,
      },
    } as PaystackPaymentFields;
    await initiatePayment(fields);
    console.log("pay success");
  } catch (error) {
    throw error;
  }
};

declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

export const payWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-paystack-signature"];

    if (!verifyPaystackSignature(req.rawBody, signature)) {
      console.log("You can't do that");
      return;
    }

    paymentComplete(req.body);

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    throw error;
  }
};
