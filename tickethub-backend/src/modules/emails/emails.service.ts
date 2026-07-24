import config from '@/config/config.js';
import nodemailer from 'nodemailer';
import logger from '@/utils/logger/index.js';

export async function sendMail(
  to: string | string[],
  subject: string,
  text: string,
  html: string,
  cc?: string | string[],
  attachments?: nodemailer.SendMailOptions['attachments'],
) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.from_email,
      pass: config.email.gmail_app_password,
    },
  });

  const mailOptions: nodemailer.SendMailOptions = {
    from: config.email.from_email,
    to,
    subject,
    text,
    html,
    cc,
  };

  if (attachments && attachments.length > 0) {
    mailOptions.attachments = attachments;
  }

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
