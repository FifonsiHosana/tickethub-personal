import config from '@/config/config.js';
import nodemailer from 'nodemailer';
import logger from '@/utils/logger/index.js';

export async function sendMail(
  to: string | string[],
  subject: string,
  text: string,
  html: string,
//   from?: string,
  cc?: string | string[],
) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.from_email,
      pass: config.email.gmail_app_password,
    },
  });

  const mailOptions = {
    from: config.email.from_email,
    to,
    subject,
    text,
    html,
    // replyTo: from,
    cc,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:' + JSON.stringify(info.response));
    logger.info(`Email sent: ${JSON.stringify(info.response)}`);
  } catch (error) {
    console.error('Error occured: ' + error);
    logger.error(`Error occured with email: ${error}`);
    throw error;
  }
}
