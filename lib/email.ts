import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || 'mail.nechabest.com';
const port = parseInt(process.env.SMTP_PORT || '465');
const secure = process.env.SMTP_SECURE === 'true' || port === 465;

// Transporter for Bookings (bookings@nechabest.com)
const bookingsTransporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user: process.env.SMTP_USER_BOOKINGS || 'bookings@nechabest.com',
    pass: process.env.SMTP_PASS_BOOKINGS || '@Nechabest256256',
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// Transporter for Info / Contact / Newsletter (info@nechabest.com)
const infoTransporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user: process.env.SMTP_USER_INFO || 'info@nechabest.com',
    pass: process.env.SMTP_PASS_INFO || '@Nechabest256256',
  },
  tls: {
    rejectUnauthorized: false
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

export async function sendEmail({ type, to, subject, html }: SendEmailArgs) {
  const isBookings = type === 'bookings';
  const transporter = isBookings ? bookingsTransporter : infoTransporter;
  const user = isBookings 
    ? (process.env.SMTP_USER_BOOKINGS || 'bookings@nechabest.com')
    : (process.env.SMTP_USER_INFO || 'info@nechabest.com');
  const fromName = isBookings ? 'Nechabest Bookings' : 'Nechabest Info';

  // Output logs in development
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
