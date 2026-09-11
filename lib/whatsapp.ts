export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '256756310029';

export function buildWhatsAppLink(message: string, number: string = WHATSAPP_NUMBER): string {
  const clean = number.replace(/[^\d]/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function defaultWhatsAppMessage(): string {
  return [
    'Hello Nechabest Sustainable Adventures! 👋',
    '',
    'I would like to know more about your adventures and safari packages.',
    '',
    'Could you please share more details?',
  ].join('\n');
}

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
