import { generateQrCodeBuffer } from '@/modules/tickets/tickets.utils.js';
import config from '@/config/config.js';
import type { SendMailOptions } from 'nodemailer';

interface TicketItem {
  ticketIdentifier: string;
  ticketType: string;
  price: string;
  eventName: string;
  eventDate: string;
  venueName: string | null;
  qrCodeUrl: string;
}

interface TicketPurchaseEmailData {
  orderId: number;
  total: number;
  items: TicketItem[];
  accountCreated?: boolean;
  email?: string;
}

interface BuildResult {
  html: string;
  attachments: NonNullable<SendMailOptions['attachments']>;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export async function buildPurchaseConfirmationEmail({
  orderId,
  total,
  items,
  accountCreated = false,
  email,
}: TicketPurchaseEmailData): Promise<BuildResult> {
  const attachments: NonNullable<SendMailOptions['attachments']> = [];
  const ticketBlocks = await Promise.all(
    items.map(async (item) => {
      const { buffer, cid } = await generateQrCodeBuffer(item.ticketIdentifier);
      attachments.push({
        filename: `${item.ticketIdentifier}.png`,
        content: buffer,
        cid,
      });

      const dateStr = `${formatDate(item.eventDate)} at ${formatTime(item.eventDate)}`;

      return `
        <div style="
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 20px;
          background: #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        ">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 24px;" width="70%">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <h3 style="margin: 0 0 4px 0; font-size: 20px; color: #111827;">
                        ${item.eventName}
                      </h3>
                      <span style="
                        display: inline-block;
                        padding: 4px 12px;
                        background: #f3f4f6;
                        border-radius: 20px;
                        font-size: 12px;
                        color: #374151;
                        font-weight: 600;
                      ">
                        ${item.ticketType}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 12px; border-top: 1px dashed #e5e7eb;">
                      <table cellpadding="0" cellspacing="0" style="font-size: 13px; color: #6b7280;">
                        <tr>
                          <td style="padding: 4px 16px 4px 0; white-space: nowrap; color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                            Date
                          </td>
                          <td style="padding: 4px 0; color: #111827; font-weight: 500;">
                            ${dateStr}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 16px 4px 0; white-space: nowrap; color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                            Venue
                          </td>
                          <td style="padding: 4px 0; color: #111827; font-weight: 500;">
                            ${item.venueName ?? 'TBA'}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 16px 4px 0; white-space: nowrap; color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                            Ticket ID
                          </td>
                          <td style="padding: 4px 0; color: #6b7280; font-family: monospace; font-size: 12px;">
                            ${item.ticketIdentifier}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 16px 4px 0; white-space: nowrap; color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                            Price
                          </td>
                          <td style="padding: 4px 0; color: #059669; font-weight: 700; font-size: 15px;">
                            GH₵ ${Number(item.price).toFixed(2)}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
              <td style="
                padding: 24px;
                background: #f9fafb;
                text-align: center;
                vertical-align: middle;
                border-left: 2px dashed #e5e7eb;
              " width="30%">
                <img src="cid:${cid}" alt="QR Code" style="width: 130px; height: 130px; display: block; margin: 0 auto;" />
                <p style="margin: 8px 0 0; font-size: 10px; color: #9ca3af; letter-spacing: 0.5px;">
                  Scan for check-in
                </p>
              </td>
            </tr>
          </table>
        </div>
      `;
    }),
  );

  const accountSection =
    accountCreated && email
      ? `
<div style="
  margin-top:32px;
  padding:20px;
  background:#f0fdf4;
  border:1px solid #bbf7d0;
  border-radius:8px;
">
<h3 style="margin-top:0;font-size:14px;color:#111827;">
  Your TicketHub account
</h3>
<p style="margin:0 0 16px;line-height:1.7;color:#555;font-size:13px;">
  While checking out as a guest, we created a TicketHub account for you with
  this email address (<strong>${email}</strong>). Set a password to see your
  ticket history and manage your orders anytime.
</p>
<a
  href="${config.appUrl}/account/setup-password?email=${encodeURIComponent(email)}"
  style="
    display:inline-block;
    padding:12px 24px;
    background:#16a34a;
    color:#ffffff;
    text-decoration:none;
    border-radius:8px;
    font-size:14px;
    font-weight:600;
  "
>
  Set Up Your Password
</a>
</div>
`
      : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Ticket Purchase Confirmation</title>
</head>
<body style="
    margin:0;
    padding:40px;
    background:#f5f7fb;
    font-family:Arial, Helvetica, sans-serif;
">
<table
    width="700"
    align="center"
    cellpadding="0"
    cellspacing="0"
    style="
        background:white;
        border-radius:12px;
        overflow:hidden;
        box-shadow:0 4px 18px rgba(0,0,0,.08);
">
<tr>
<td style="padding:40px;">

<h1 style="margin:0;color:#16a34a;">
 Order Successful
</h1>

<p style="margin-top:18px;font-size:16px;color:#555;">
  Thank you for your purchase! Your tickets are attached below.
</p>

<hr style="margin:32px 0;border:none;border-top:1px solid #eee;" />

<h2 style="margin-bottom:24px;font-size:18px;color:#111827;">
  Your Tickets
</h2>

${ticketBlocks.join('')}

<hr style="margin:32px 0;border:none;border-top:1px solid #eee;" />

<div style="text-align:right;font-size:16px;color:#111827;">
  <strong>Order #${orderId}</strong>
  &mdash;
  <span style="color:#059669;font-size:20px;font-weight:700;">
    GH₵ ${total.toFixed(2)}
  </span>
</div>

<div style="
  margin-top:40px;
  padding:20px;
  background:#f9fafb;
  border-radius:8px;
">
<h3 style="margin-top:0;font-size:14px;color:#111827;">
  Important Information
</h3>
<ul style="padding-left:18px;line-height:1.8;color:#555;font-size:13px;">
  <li>Present the QR code at the venue for check-in.</li>
  <li>Each ticket can only be scanned once.</li>
  <li>Bring a valid ID matching the purchaser name.</li>
  <li>Do not share your QR code with others.</li>
</ul>
</div>

${accountSection}

<p style="margin-top:40px;font-size:13px;color:#777;">
  Need help? Contact our support team.
</p>

<p style="margin-top:30px;font-size:12px;color:#aaa;text-align:center;">
  &copy; ${new Date().getFullYear()} TicketHub
</p>

</td>
</tr>
</table>
</body>
</html>`;

  return { html, attachments };
}
