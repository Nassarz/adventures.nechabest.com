/**
 * Formspree Integration Service
 *
 * This module provides secure email notification functionality via Formspree API.
 * All endpoints are read from environment variables and validated before use.
 *
 * Security Features:
 * - HTTPS-only communication
 * - Input sanitization
 * - No sensitive data logging
 * - Rate limiting awareness
 * - CORS handling
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface FormspreeResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  _gotcha?: string;
}

export interface NewsletterFormData {
  email: string;
  name?: string;
  _gotcha?: string;
}

export interface BookingFormData {
  tourId: string;
  tourTitle: string;
  fullName: string;
  email: string;
  phone: string;
  numberOfPeople: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  specialRequests?: string;
  _gotcha?: string;
}

// ============================================================================
// Environment Configuration
// ============================================================================

function getFormspreeEndpoint(type: 'contact' | 'booking'): string {
  const endpoint = type === 'contact'
    ? process.env.NEXT_PUBLIC_FORMSPREE_CONTACT_ENDPOINT
    : process.env.NEXT_PUBLIC_FORMSPREE_BOOKING_ENDPOINT;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Formspree] Getting ${type} endpoint:`, endpoint);
  }

  if (!endpoint) {
    const errorMsg = `Formspree ${type} endpoint not configured. Please set NEXT_PUBLIC_FORMSPREE_${type.toUpperCase()}_ENDPOINT in environment variables.`;
    console.error('[Formspree]', errorMsg);
    throw new Error(errorMsg);
  }

  if (!endpoint.startsWith('https://')) {
    const errorMsg = `Formspree endpoint must use HTTPS protocol for security. Invalid endpoint: ${endpoint}`;
    console.error('[Formspree]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const url = new URL(endpoint);
    if (url.hostname !== 'formspree.io') {
      const errorMsg = `Invalid Formspree endpoint. Expected formspree.io domain, got: ${url.hostname}`;
      console.error('[Formspree]', errorMsg);
      throw new Error(errorMsg);
    }
  } catch (e) {
    if (e instanceof TypeError) {
      const errorMsg = `Invalid Formspree endpoint URL format.`;
      console.error('[Formspree]', errorMsg);
      throw new Error(errorMsg);
    }
    throw e;
  }

  return endpoint;
}

// ============================================================================
// Bot Protection
// ============================================================================

function isBotSubmission(gotcha?: string): boolean {
  return !!gotcha && gotcha.trim().length > 0;
}

const submissionTimestamps = new Map<string, number[]>();

function isRateLimited(
  identifier: string,
  maxSubmissions: number = 3,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const timestamps = submissionTimestamps.get(identifier) || [];
  const recentTimestamps = timestamps.filter(ts => now - ts < windowMs);
  if (recentTimestamps.length >= maxSubmissions) return true;
  recentTimestamps.push(now);
  submissionTimestamps.set(identifier, recentTimestamps);
  return false;
}

// ============================================================================
// Input Sanitization
// ============================================================================

function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/\0/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\s{10,}/g, ' '.repeat(10));
}

function sanitizeEmail(email: string): string {
  if (!email) return '';
  return email.trim().toLowerCase().replace(/[^\w\s@.\-+]/gi, '');
}

function sanitizePhone(phone: string): string {
  if (!phone) return '';
  return phone.trim().replace(/[^\d\s\-+()]/g, '');
}

// ============================================================================
// Validation
// ============================================================================

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateBookingData(data: BookingFormData): void {
  if (isBotSubmission(data._gotcha)) throw new Error('Bot submission detected');
  if (isRateLimited(data.email, 2, 300000)) throw new Error('Too many booking attempts. Please wait a few minutes and try again.');
  if (!data.fullName || data.fullName.trim().length === 0) throw new Error('Full name is required');
  if (!data.email || !isValidEmail(data.email)) throw new Error('Valid email address is required');
  if (!data.phone || data.phone.trim().length === 0) throw new Error('Phone number is required');
  if (!data.numberOfPeople || data.numberOfPeople < 1) throw new Error('At least 1 person is required');
  if (!data.startDate) throw new Error('Booking start date is required');
  if (!data.endDate) throw new Error('Booking end date is required');
  if (data.endDate < data.startDate) throw new Error('End date cannot be before the start date');
  if (data.fullName.length > 100) throw new Error('Full name is too long (max 100 characters)');
  if (data.specialRequests && data.specialRequests.length > 1000) throw new Error('Special requests are too long (max 1000 characters)');
}

// ============================================================================
// API Communication
// ============================================================================

async function submitToFormspree(
  endpoint: string,
  data: Record<string, any>
): Promise<FormspreeResponse> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Formspree] Submitting to:', endpoint);
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'omit',
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result.error || result.errors?.[0]?.message || 'Failed to submit form';
      return { success: false, error: errorMessage };
    }

    return { success: true, message: 'Form submitted successfully' };
  } catch (error) {
    return { success: false, error: 'Network error. Please check your connection and try again.' };
  }
}

// ============================================================================
// Public API
// ============================================================================

export async function submitBookingForm(
  data: BookingFormData
): Promise<FormspreeResponse> {
  try {
    validateBookingData(data);
    const endpoint = getFormspreeEndpoint('booking');

    const sanitizedTourTitle = sanitizeInput(data.tourTitle);
    const sanitizedFullName = sanitizeInput(data.fullName);
    const sanitizedEmail = sanitizeEmail(data.email);

    const sanitizedData = {
      'Tour': sanitizedTourTitle,
      'Full Name': sanitizedFullName,
      email: sanitizedEmail,
      'Phone': sanitizePhone(data.phone),
      'Number of People': data.numberOfPeople,
      'Start Date': data.startDate,
      'End Date': data.endDate,
      'Total Price (USD)': `$${data.totalPrice}`,
      'Special Requests': data.specialRequests ? sanitizeInput(data.specialRequests) : 'None',
      tourId: sanitizeInput(data.tourId),
      _subject: `[NECHABEST Booking] ${sanitizedTourTitle} — ${sanitizedFullName}`,
      _replyto: sanitizedEmail,
      _gotcha: data._gotcha || '',
    };

    return await submitToFormspree(endpoint, sanitizedData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit booking';
    return { success: false, error: errorMessage };
  }
}
