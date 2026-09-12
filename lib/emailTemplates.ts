const LOGO_URL = 'https://iili.io/ffrDkkN.png';
const LOGO_CID = 'nechabest-logo';

const SOCIAL_LINKS = [
  { name: 'Instagram', url: 'https://www.instagram.com/nechabest/', color: '#E4405F', letter: 'IG' },
  { name: 'Facebook', url: 'https://www.facebook.com/people/Nechabest-Sustainable-Initiatives/61576490034369/', color: '#1877F2', letter: 'FB' },
  { name: 'X', url: 'https://x.com/nechabest', color: '#000000', letter: 'X' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@nechabest', color: '#000000', letter: 'TT' },
  { name: 'WhatsApp', url: 'https://wa.me/256756310029?text=Hello%20Nechabest%20Sustainable%20Adventures!', color: '#25D366', letter: 'WA' },
];

function buildSocialIconsHtml(): string {
  const cells = SOCIAL_LINKS.map(s => {
    const href = s.name === 'WhatsApp'
      ? s.url
      : s.url.replace('https://', 'https://');
    return `
      <td align="center" style="padding: 6px;">
        <a href="${href}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: inline-block;" title="${s.name}">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background: ${s.color}; color: #ffffff; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; text-align: center; width: 42px; height: 42px; border-radius: 50%; mso-padding-alt: 0; line-height: 42px;">
                <a href="${href}" target="_blank" style="display: block; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: bold; line-height: 42px;">${s.letter}</a>
              </td>
            </tr>
          </table>
        </a>
      </td>`;
  }).join('');

  return `
    <p style="text-align: center; color: #718096; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 30px 0 14px 0;">Connect With Us</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 320px; margin: 0 auto;">
      <tr>
        ${cells}
      </tr>
    </table>
    <p style="text-align: center; color: #718096; font-size: 12px; margin: 14px 0 0 0;">
      Follow Nechabest for travel inspiration, community stories, and adventure updates.
    </p>`;
}

function buildFooter(): string {
  return `
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
    <p style="font-size: 11px; color: #718096; text-align: center; margin: 0;">
      This is an automated message from Nechabest Sustainable Adventures.<br />
      Kasangati Town Council, Wakiso District, Uganda
    </p>`;
}

export function buildBookingClientEmail(data: {
  fullName: string;
  tourTitle: string;
  parsedStart: Date;
  parsedEnd: Date | null;
  numberOfPeople: number;
  totalPrice: number;
  safeSpecialRequests: string;
}): string {
  const { fullName, tourTitle, parsedStart, parsedEnd, numberOfPeople, totalPrice, safeSpecialRequests } = data;

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${LOGO_URL}" alt="Nechabest Sustainable Adventures" width="180" style="display: block; margin: 0 auto 12px;" />
        <p style="color: #58b05c; font-size: 14px; font-weight: bold; margin: 5px 0 0 0;">Explore Uganda's Wild Side</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p>Dear <strong>${fullName}</strong>,</p>
      <p>Thank you for booking your adventure with Nechabest Sustainable Adventures! We have received your booking request.</p>
      <p><strong>Booking Summary:</strong></p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Tour Adventure:</td>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${tourTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Start Date:</td>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${parsedStart.toLocaleDateString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">End Date:</td>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${parsedEnd ? parsedEnd.toLocaleDateString() : 'Same day'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Number of People:</td>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${numberOfPeople}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Estimated Total:</td>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">$${totalPrice}</td>
        </tr>
        ${safeSpecialRequests ? `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Special Requests:</td>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${safeSpecialRequests}</td>
        </tr>` : ''}
      </table>
      <p>Our team will contact you within 24 hours to confirm your booking and coordinate payment and logistics.</p>
      ${buildSocialIconsHtml()}
      ${buildFooter()}
    </div>`;
}

export function buildBookingAdminEmail(data: {
  safeFullName: string;
  safeEmail: string;
  safePhone: string;
  safeTourTitle: string;
  parsedStart: Date;
  parsedEnd: Date | null;
  numberOfPeople: number;
  totalPrice: number;
  safeSpecialRequests: string;
}): string {
  const { safeFullName, safeEmail, safePhone, safeTourTitle, parsedStart, parsedEnd, numberOfPeople, totalPrice, safeSpecialRequests } = data;

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${LOGO_URL}" alt="Nechabest Sustainable Adventures" width="180" style="display: block; margin: 0 auto 12px;" />
      </div>
      <h2 style="color: #1a3c34; border-bottom: 2px solid #58b05c; padding-bottom: 8px; margin-top: 0;">New Booking Request Received</h2>
      <p>A new booking request has been submitted. Details below:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Client Name:</td>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${safeFullName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Client Email:</td>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${safeEmail}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Client Phone:</td>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${safePhone}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Tour Adventure:</td>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${safeTourTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Start Date:</td>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${parsedStart.toLocaleDateString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">End Date:</td>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${parsedEnd ? parsedEnd.toLocaleDateString() : 'Same day'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Number of People:</td>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${numberOfPeople}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Estimated Total:</td>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">$${totalPrice}</td>
        </tr>
        ${safeSpecialRequests ? `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #4a5568;">Special Requests:</td>
          <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${safeSpecialRequests}</td>
        </tr>` : ''}
      </table>
      ${buildFooter()}
    </div>`;
}

export function buildContactAdminEmail(data: {
  safeName: string;
  safeEmail: string;
  safeSubject: string;
  safeMessage: string;
}): string {
  const { safeName, safeEmail, safeSubject, safeMessage } = data;

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
      <div style="text-align:center;margin-bottom:20px;">
        <img src="${LOGO_URL}" alt="Nechabest Sustainable Adventures" width="180" style="display:block;margin:0 auto 12px;" />
      </div>
      <h2 style="color:#1A3C34;">New Contact Form Submission</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr>
          <td style="padding:8px;border-bottom:1px solid #edf2f7;font-weight:bold;color:#4a5568;">Name:</td>
          <td style="padding:8px;border-bottom:1px solid #edf2f7;color:#2d3748;">${safeName}</td>
        </tr>
        <tr>
          <td style="padding:8px;border-bottom:1px solid #edf2f7;font-weight:bold;color:#4a5568;">Email:</td>
          <td style="padding:8px;border-bottom:1px solid #edf2f7;color:#2d3748;">${safeEmail}</td>
        </tr>
        <tr>
          <td style="padding:8px;border-bottom:1px solid #edf2f7;font-weight:bold;color:#4a5568;">Subject:</td>
          <td style="padding:8px;border-bottom:1px solid #edf2f7;color:#2d3748;">${safeSubject}</td>
        </tr>
      </table>
      <p style="font-weight:bold;color:#4a5568;">Message:</p>
      <div style="background:#f7fafc;border:1px solid #edf2f7;border-radius:8px;padding:16px;font-style:italic;color:#2d3748;">${safeMessage}</div>
      ${buildSocialIconsHtml()}
      ${buildFooter()}
    </div>`;
}

export function buildContactReplyEmail(data: {
  safeName: string;
  safeSubject: string;
}): string {
  const { safeName, safeSubject } = data;

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
      <div style="text-align:center;margin-bottom:20px;">
        <img src="${LOGO_URL}" alt="Nechabest Sustainable Adventures" width="180" style="display:block;margin:0 auto 12px;" />
        <p style="color: #58b05c; font-size: 14px; font-weight: bold; margin: 5px 0 0 0;">Explore Uganda's Wild Side</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p>Hello <strong>${safeName}</strong>,</p>
      <p>Thank you for contacting us! We have received your inquiry regarding <strong>${safeSubject}</strong>.</p>
      <p>A member of our team will get back to you within 24 hours.</p>
      ${buildSocialIconsHtml()}
      ${buildFooter()}
    </div>`;
}

export { LOGO_URL, LOGO_CID };
