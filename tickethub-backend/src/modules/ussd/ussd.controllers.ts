import type { Request, Response } from 'express';
import { getCategories, handleUssd } from './ussd.services.js';
import { clearSession } from './session.service.js';

export const ussdController = async (req: Request, res: Response) => {
  const { USERID, USERDATA, MSISDN, MSGTYPE, NETWORK, SESSIONID } = req.body;

  const phoneNumber = MSISDN;
  const TelcoProvider = (NETWORK ?? '').toLowerCase();
  const text = String(USERDATA ?? '');

  // Nalo: MSGTYPE true = new session (USERDATA is the dial string),
  // false = reply in an existing session (USERDATA is the user's input)
  const isFirstRequest = MSGTYPE === true || MSGTYPE === 'true';

  // Nalo notifies you of a timeout as plain text. It isn't user input.
  if (text === 'Session timeout') {
    await clearSession(SESSIONID); // whatever your session service exposes
    return res
      .status(200)
      .json({ USERID, MSISDN, USERDATA: '', MSGTYPE: false });
  }

  const response = await handleUssd(
    SESSIONID,
    text,
    phoneNumber,
    TelcoProvider,
    USERID,
    isFirstRequest,
  );

  res.status(200).json(response);
};

export const testQuery = async (req: Request, res: Response) => {
  try {
    const response = await getCategories('0');
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
};
