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

const LOGO_URL = 'https://iili.io/ffrDkkN.png';
const LOGO_CID = 'nechabest-logo';

let cachedLogoBuffer: Buffer | null = null;
let logoCacheTime = 0;
const LOGO_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

async function getLogoBuffer(): Promise<Buffer | null> {
  const now = Date.now();
  if (cachedLogoBuffer && now - logoCacheTime < LOGO_CACHE_TTL) {
    return cachedLogoBuffer;
  }
  try {
    const res = await fetch(LOGO_URL, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return cachedLogoBuffer;
    cachedLogoBuffer = Buffer.from(await res.arrayBuffer());
    logoCacheTime = now;
    console.log('[Email] Logo fetched:', cachedLogoBuffer.length, 'bytes');
    return cachedLogoBuffer;
  } catch (err) {
    console.error('[Email] Logo fetch error:', err instanceof Error ? err.message : err);
    return cachedLogoBuffer;
  }
}

export async function sendEmail({ type, to, subject, html }: SendEmailArgs) {
  const isBookings = type === 'bookings';
  const transporter = isBookings ? bookingsTransporter : infoTransporter;
  const user = isBookings
    ? (process.env.SMTP_USER_BOOKINGS ?? 'bookings@nechabest.com')
    : (process.env.SMTP_USER_INFO ?? 'info@nechabest.com');
  const fromName = 'Nechabest Sustainable Adventures';

  if (!process.env.SMTP_PASS_BOOKINGS || !process.env.SMTP_PASS_INFO) {
    console.error('[Email] SMTP credentials not configured. Email sending skipped.');
    return;
  }

  const logoBuffer = await getLogoBuffer();

  const mailOptions: nodemailer.SendMailOptions = {
    from: `"${fromName}" <${user}>`,
    to,
    subject,
    html,
  };

  if (logoBuffer) {
    mailOptions.attachments = [
      {
        filename: 'logo.png',
        content: logoBuffer,
        cid: LOGO_CID,
        contentType: 'image/png',
        contentDisposition: 'inline',
      },
    ];
  }

  await transporter.sendMail(mailOptions);
  console.log('[Email] Sent to', to);
}

export { LOGO_URL, LOGO_CID };
