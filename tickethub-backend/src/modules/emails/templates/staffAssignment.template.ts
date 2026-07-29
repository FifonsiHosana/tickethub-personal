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

export function buildStaffAssignmentHtml(
  eventName: string,
  eventDate: string,
  dashboardUrl: string,
): string {
  const dateStr = `${formatDate(eventDate)} at ${formatTime(eventDate)}`;

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Staff Assignment</title>
</head>
<body style="
    margin:0;
    padding:40px;
    background:#f5f7fb;
    font-family:Arial, Helvetica, sans-serif;
">
<table
    width="600"
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

<h1 style="margin:0;color:#111827;font-size:24px;">
  You've Been Assigned as Event Staff
</h1>

<p style="margin-top:20px;font-size:16px;color:#555;line-height:1.6;">
  You have been assigned as event staff for
  <strong style="color:#111827;">${eventName}</strong>.
</p>

<table style="margin-top:24px;width:100%;border-collapse:collapse;">
  <tr>
    <td style="padding:12px 16px;background:#f9fafb;border-radius:8px 8px 0 0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">
      Event
    </td>
    <td style="padding:12px 16px;background:#f9fafb;border-radius:8px 8px 0 0;font-size:14px;color:#111827;font-weight:600;">
      ${eventName}
    </td>
  </tr>
  <tr>
    <td style="padding:12px 16px;border-top:1px solid #e5e7eb;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">
      Date & Time
    </td>
    <td style="padding:12px 16px;border-top:1px solid #e5e7eb;font-size:14px;color:#111827;font-weight:500;">
      ${dateStr}
    </td>
  </tr>
</table>

<div style="margin-top:32px;">
  <a href="${dashboardUrl}"
     style="
        display:inline-block;
        padding:14px 32px;
        background:#2563eb;
        color:white;
        text-decoration:none;
        border-radius:8px;
        font-size:15px;
        font-weight:600;
     ">
     Go to Dashboard
  </a>
</div>

<p style="margin-top:32px;font-size:13px;color:#777;line-height:1.6;">
  From your dashboard you can view the attendee list and check in
  tickets at the event.
</p>

<hr style="margin-top:32px;border:none;border-top:1px solid #eee;" />

<p style="margin-top:24px;font-size:12px;color:#aaa;text-align:center;">
  &copy; ${new Date().getFullYear()} TicketHub
</p>

</td>
</tr>
</table>
</body>
</html>`;
}
