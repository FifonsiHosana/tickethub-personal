interface TicketPurchaseEmailData {
  orderId: number;
  total: number;
  items: {
    ticketIdentifier: string;
    ticketType: string;
    price: string;
    eventName: string;
    eventDate: string;
  }[];
}

export function buildPurchaseConfirmationEmail({
  orderId,
  total,
  items,
}: TicketPurchaseEmailData) {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px;border:1px solid #e5e7eb;">
          ${item.eventName}
        </td>

        <td style="padding:12px;border:1px solid #e5e7eb;">
          ${item.ticketType}
        </td>

        <td style="padding:12px;border:1px solid #e5e7eb;">
          ${new Date(item.eventDate).toLocaleString()}
        </td>

        <td style="padding:12px;border:1px solid #e5e7eb;text-align:center;">
          ${item.ticketIdentifier}
        </td>

        <td style="padding:12px;border:1px solid #e5e7eb;text-align:right;">
          GH₵ ${Number(item.price).toFixed(2)}
        </td>
      </tr>
    `,
    )
    .join('');

  return `
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
🎉 Payment Successful
</h1>

<p style="margin-top:18px;font-size:16px;color:#555;">
Thank you for purchasing your ticket(s)!
</p>

<p style="color:#555;">
Your order has been confirmed and your tickets are now reserved.
</p>

<hr style="margin:32px 0;border:none;border-top:1px solid #eee;" />

<h2 style="margin-bottom:20px;">
Order Summary
</h2>

<p>
<strong>Order ID:</strong>
#${orderId}
</p>

<p>
<strong>Total Paid:</strong>
GH₵ ${total.toFixed(2)}
</p>

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="
        border-collapse:collapse;
        margin-top:25px;
        font-size:14px;
    "
>

<thead>

<tr style="background:#f3f4f6;">

<th style="padding:14px;border:1px solid #e5e7eb;">
Event
</th>

<th style="padding:14px;border:1px solid #e5e7eb;">
Ticket
</th>

<th style="padding:14px;border:1px solid #e5e7eb;">
Date
</th>

<th style="padding:14px;border:1px solid #e5e7eb;">
Ticket ID
</th>

<th style="padding:14px;border:1px solid #e5e7eb;">
Price
</th>

</tr>

</thead>

<tbody>

${rows}

</tbody>

</table>

<div
style="
margin-top:40px;
padding:20px;
background:#f9fafb;
border-radius:8px;
">

<h3 style="margin-top:0;">
Important Information
</h3>

<ul
style="
padding-left:18px;
line-height:1.8;
color:#555;
">

<li>Please bring a valid ID to the venue.</li>

<li>Your ticket QR Code will be scanned at check-in.</li>

<li>Each Ticket ID can only be used once.</li>

<li>Do not share your Ticket ID with anyone.</li>

</ul>

</div>

<p
style="
margin-top:40px;
font-size:13px;
color:#777;
">

Need help?

Contact our support team if you have any questions regarding your booking.

</p>

<p
style="
margin-top:30px;
font-size:12px;
color:#aaa;
text-align:center;
">

© ${new Date().getFullYear()} TicketHub

</p>

</td>

</tr>

</table>

</body>

</html>
`;
}
