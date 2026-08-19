import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const portRaw = process.env.SMTP_PORT;
const port = portRaw ? parseInt(portRaw, 10) : 465;
const secure = process.env.SMTP_SECURE === 'true' || port === 465;

// SMTP TLS certificate verification. Defaults to secure (certificates validated).
// Set SMTP_TLS_INSECURE=true ONLY if the mail server uses a self-signed cert.
const rejectUnauthorized = process.env.SMTP_TLS_INSECURE !== 'true';

// Guard: fail loudly at startup if required email env vars are missing
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[Email] Missing required environment variable: ${name}`);
  }
  return value;
}

// Transporter for Bookings (bookings@nechabest.com)
const bookingsTransporter = nodemailer.createTransport({
  host: host || 'mail.nechabest.com',
  port,
  secure,
  auth: {
    user: process.env.SMTP_USER_BOOKINGS,
    pass: process.env.SMTP_PASS_BOOKINGS,
  },
  tls: {
    rejectUnauthorized,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// Transporter for Info / Contact / Newsletter (info@nechabest.com)
const infoTransporter = nodemailer.createTransport({
  host: host || 'mail.nechabest.com',
  port,
  secure,
  auth: {
    user: process.env.SMTP_USER_INFO,
    pass: process.env.SMTP_PASS_INFO,
  },
  tls: {
    rejectUnauthorized,
  },
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

/**
 * Escape user-supplied strings before inserting into HTML email templates.
 * Prevents XSS and HTML-injection attacks via email content.
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendEmail({ type, to, subject, html }: SendEmailArgs) {
  const isBookings = type === 'bookings';
  const transporter = isBookings ? bookingsTransporter : infoTransporter;
  const user = isBookings
    ? (process.env.SMTP_USER_BOOKINGS ?? 'bookings@nechabest.com')
    : (process.env.SMTP_USER_INFO ?? 'info@nechabest.com');
  const fromName = isBookings ? 'Nechabest Bookings' : 'Nechabest Info';

  if (!process.env.SMTP_PASS_BOOKINGS || !process.env.SMTP_PASS_INFO) {
    console.error('[Email] SMTP credentials are not configured via environment variables. Email sending skipped.');
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Email Service] Sending email via ${type} (Account: ${user}) to ${to}...`);
  }

  await transporter.sendMail({
    from: `"${fromName}" <${user}>`,
    to,
    subject,
    html,
  });
}

