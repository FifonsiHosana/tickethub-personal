import express from "express";
import { payWebhook } from "./ussd-payment.controllers.js";


const router = express.Router();
// router.post("/", testPayment);
router.post("/", payWebhook);

export default router;
