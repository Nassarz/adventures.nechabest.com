import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const portRaw = process.env.SMTP_PORT;
const port = portRaw ? parseInt(portRaw, 10) : 465;
const secure = process.env.SMTP_SECURE === 'true' || port === 465;
const rejectUnauthorized = process.env.SMTP_TLS_INSECURE !== 'true';

const bookingsTransporter = nodemailer.createTransport({
  host: host || 'mail.nechabest.com',
  port,
  secure,
  auth: {
    user: process.env.SMTP_USER_BOOKINGS,
    pass: process.env.SMTP_PASS_BOOKINGS,
  },
  tls: { rejectUnauthorized },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

const infoTransporter = nodemailer.createTransport({
  host: host || 'mail.nechabest.com',
  port,
  secure,
  auth: {
    user: process.env.SMTP_USER_INFO,
    pass: process.env.SMTP_PASS_INFO,
  },
  tls: { rejectUnauthorized },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

interface SendEmailArgs {
  type: 'bookings' | 'info';
  to: string;
  subject: string;
  html: string;
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function fetchLogoAsDataUrl(): Promise<string | null> {
  try {
    const res = await fetch('https://iili.io/ffrDkkN.png');
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    return `data:image/png;base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}

export async function sendEmail({ type, to, subject, html }: SendEmailArgs) {
  const isBookings = type === 'bookings';
  const transporter = isBookings ? bookingsTransporter : infoTransporter;
  const user = isBookings
    ? (process.env.SMTP_USER_BOOKINGS ?? 'bookings@nechabest.com')
    : (process.env.SMTP_USER_INFO ?? 'info@nechabest.com');
  const fromName = isBookings ? 'Nechabest Sustainable Adventures' : 'Nechabest Sustainable Adventures';

  if (!process.env.SMTP_PASS_BOOKINGS || !process.env.SMTP_PASS_INFO) {
    console.error('[Email] SMTP credentials not configured. Email sending skipped.');
    return;
  }

  // Fetch logo and embed as CID for email client compatibility
  const logoDataUrl = await fetchLogoAsDataUrl();
  const logoBuffer = logoDataUrl ? Buffer.from(logoDataUrl.split(',')[1], 'base64') : null;

  // Replace hosted logo URL with CID reference in HTML
  const cid = 'nechabest-logo';
  const processedHtml = logoBuffer
    ? html.replace(/https:\/\/iili\.io\/ffrDkkN\.png/g, `cid:${cid}`)
    : html;

  const mailOptions: nodemailer.SendMailOptions = {
    from: `"${fromName}" <${user}>`,
    to,
    subject,
    html: processedHtml,
    list: {
      unsubscribe: `mailto:info@nechabest.com?subject=Unsubscribe`,
    },
  };

  // Attach logo as CID if available
  if (logoBuffer) {
    mailOptions.attachments = [
      {
        filename: 'nechabest-logo.png',
        content: logoBuffer,
        cid,
        contentType: 'image/png',
      },
    ];
  }

  await transporter.sendMail(mailOptions);
}
