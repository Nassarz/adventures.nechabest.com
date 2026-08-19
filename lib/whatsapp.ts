/**
 * WhatsApp integration helpers for Nechabest.
 * All booking / campaign / enquiry messages are routed to this single number.
 */

// Business WhatsApp number in international format (no "+", no spaces)
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '256756310029';

/**
 * Build a wa.me deep link with a pre-filled, URL-encoded message.
 */
export function buildWhatsAppLink(message: string, number: string = WHATSAPP_NUMBER): string {
  const clean = number.replace(/[^\d]/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

/**
 * Default greeting message used by the floating WhatsApp button.
 */
export function defaultWhatsAppMessage(): string {
  return [
    'Hello Nechabest Sustainable Initiatives 👋',
    '',
    'I would like to know more about your eco-tourism adventures and sustainable projects.',
    '',
    'Could you please share more details?',
  ].join('\n');
}

/**
 * Build the full booking summary message sent to WhatsApp.
 */
export function buildBookingWhatsAppMessage(payload: {
  tourTitle: string;
  fullName: string;
  email: string;
  phone: string;
  numberOfPeople: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  specialRequests?: string;
}): string {
  const lines = [
    '🦜 *NEW TOUR BOOKING — NECHABEST ADVENTURES*',
    '',
    `*Tour:* ${payload.tourTitle}`,
    `*Full Name:* ${payload.fullName}`,
    `*Email:* ${payload.email}`,
    `*Phone:* ${payload.phone}`,
    `*Number of People:* ${payload.numberOfPeople}`,
    `*Start Date:* ${payload.startDate}`,
    `*End Date:* ${payload.endDate}`,
    `*Estimated Total:* $${payload.totalPrice}`,
    '',
    `*Special Requests:* ${payload.specialRequests || 'None'}`,
    '',
    'Please confirm my booking and share the payment details. Thank you!',
  ];
  return lines.join('\n');
}