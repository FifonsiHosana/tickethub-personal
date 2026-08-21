import type { Request, Response } from "express";
import { getCategories, handleUssd } from "./ussd.services.js";

export const ussdController = async (req: Request, res: Response) => {
  const { USERID, USERDATA, MSISDN, MSGTYPE, NETWORK, SESSIONID } = req.body;
  // const { sessionId, phoneNumber, networkCode, serviceCode, text } = req.body;
  console.log(req.body);

  const phoneNumber = MSISDN;

  const TelcoProvider = NETWORK.toLowerCase();

  const text = () => {
    if (MSGTYPE === true) {
      return "";
    } else {
      return USERDATA;
    }
  };
  console.log(text);

  const response = await handleUssd(
    SESSIONID,
    text(),
    phoneNumber,
    TelcoProvider,
    USERID,
    MSGTYPE,
  );

  res.set("Content-Type", "text/plain");
  res.status(200).json(response);
};

export const testQuery = async (req: Request, res: Response) => {
  try {
    const response = await getCategories("0");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
};
