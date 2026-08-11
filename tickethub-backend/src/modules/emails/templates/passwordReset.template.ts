export function buildPasswordResetEmail(resetLink: string): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = 'Reset your TicketHub password';

  const text = `We received a request to reset your TicketHub account password.\n\nFollow this link to choose a new one:\n${resetLink}\n\nThis link expires in 60 minutes. If you did not request this, you can safely ignore this email.`;

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Reset your TicketHub password</title>
</head>
<body style="
    margin:0;
    padding:40px;
    background:#f3f4f6;
    font-family:Arial,Helvetica,sans-serif;
">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr>
          <td style="padding:32px 32px 8px;">
            <h1 style="margin:0;color:#111827;font-size:20px;font-weight:700;">
              Reset your password
            </h1>
            <p style="margin:12px 0 0;line-height:1.7;color:#555;font-size:14px;">
              We received a request to reset your TicketHub account password.
              Click the button below to choose a new one.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;text-align:center;">
            <a
              href="${resetLink}"
              style="
                display:inline-block;
                padding:12px 28px;
                background:#16a34a;
                color:#ffffff;
                text-decoration:none;
                border-radius:16px;
                font-size:14px;
                font-weight:600;
              "
            >
              Reset your password
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 24px;">
            <p style="margin:0;line-height:1.7;color:#9ca3af;font-size:12px;">
              This link expires in 60 minutes. If you did not request a password
              reset, you can safely ignore this email.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
`;

  return { subject, text, html };
}