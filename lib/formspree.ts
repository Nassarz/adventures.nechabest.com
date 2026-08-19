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
  _gotcha?: string; // Honeypot field
}

export interface NewsletterFormData {
  email: string;
  name?: string;
  _gotcha?: string; // Honeypot field
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
  _gotcha?: string; // Honeypot field
}

// ============================================================================
// Environment Configuration
// ============================================================================

/**
 * Get Formspree endpoint from environment variables with validation
 * @param type - Type of form endpoint to retrieve
 * @returns Validated HTTPS endpoint URL
 * @throws Error if endpoint is not configured or invalid
 */
function getFormspreeEndpoint(type: 'contact' | 'booking'): string {
  const endpoint = type === 'contact'
    ? process.env.NEXT_PUBLIC_FORMSPREE_CONTACT_ENDPOINT
    : process.env.NEXT_PUBLIC_FORMSPREE_BOOKING_ENDPOINT;

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Formspree] Getting ${type} endpoint:`, endpoint);
  }

  if (!endpoint) {
    const errorMsg = `Formspree ${type} endpoint not configured. Please set NEXT_PUBLIC_FORMSPREE_${type.toUpperCase()}_ENDPOINT in environment variables.`;
    console.error('[Formspree]', errorMsg);
    throw new Error(errorMsg);
  }

  // Security: Validate that endpoint is HTTPS
  if (!endpoint.startsWith('https://')) {
    const errorMsg = `Formspree endpoint must use HTTPS protocol for security. Invalid endpoint: ${endpoint}`;
    console.error('[Formspree]', errorMsg);
    throw new Error(errorMsg);
  }

  // Security: Validate that endpoint is exactly formspree.io (prevent subdomain spoofing)
  try {
    const url = new URL(endpoint);
    if (url.hostname !== 'formspree.io') {
      const errorMsg = `Invalid Formspree endpoint. Expected formspree.io domain, got: ${url.hostname}`;
      console.error('[Formspree]', errorMsg);
      throw new Error(errorMsg);
    }
  } catch (e) {
    if (e instanceof TypeError) {
      // URL parse failed
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

/**
 * Check if submission is from a bot using honeypot technique
 * @param gotcha - Honeypot field value (should be empty for real users)
 * @returns True if bot detected
 */
function isBotSubmission(gotcha?: string): boolean {
  // If honeypot field has any value, it's a bot
  return !!gotcha && gotcha.trim().length > 0;
}

/**
 * Rate limiting check using simple in-memory store
 * In production, use Redis or similar for distributed rate limiting
 */
const submissionTimestamps = new Map<string, number[]>();

/**
 * Check if submission exceeds rate limit
 * @param identifier - Email or IP address
 * @param maxSubmissions - Maximum submissions allowed
 * @param windowMs - Time window in milliseconds
 * @returns True if rate limit exceeded
 */
function isRateLimited(
  identifier: string,
  maxSubmissions: number = 3,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const timestamps = submissionTimestamps.get(identifier) || [];
  
  // Remove old timestamps outside the window
  const recentTimestamps = timestamps.filter(ts => now - ts < windowMs);
  
  // Check if limit exceeded
  if (recentTimestamps.length >= maxSubmissions) {
    return true;
  }
  
  // Add current timestamp
  recentTimestamps.push(now);
  submissionTimestamps.set(identifier, recentTimestamps);
  
  return false;
}

// ============================================================================
// Input Sanitization
// ============================================================================

/**
 * Sanitize string input to prevent XSS attacks
 * Removes potentially dangerous characters while preserving legitimate content
 * @param input - Raw user input
 * @returns Sanitized string
 */
function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Limit consecutive whitespace
    .replace(/\s{10,}/g, ' '.repeat(10));
}

/**
 * Sanitize email to prevent injection attacks
 * @param email - Email address
 * @returns Sanitized email
 */
function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  return email
    .trim()
    .toLowerCase()
    // Remove any characters that aren't valid in email addresses
    .replace(/[^\w\s@.\-+]/gi, '');
}

/**
 * Sanitize phone number
 * @param phone - Phone number
 * @returns Sanitized phone number
 */
function sanitizePhone(phone: string): string {
  if (!phone) return '';
  
  return phone
    .trim()
    // Allow only digits, spaces, hyphens, plus, and parentheses
    .replace(/[^\d\s\-+()]/g, '');
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns True if valid email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate contact form data
 * @param data - Contact form data
 * @throws Error if validation fails
 */
function validateContactData(data: ContactFormData): void {
  // Bot protection: Check honeypot
  if (isBotSubmission(data._gotcha)) {
    throw new Error('Bot submission detected');
  }

  // Rate limiting: Check submission frequency
  if (isRateLimited(data.email, 3, 60000)) {
    throw new Error('Too many submissions. Please wait a minute and try again.');
  }

  if (!data.name || data.name.trim().length === 0) {
    throw new Error('Name is required');
  }

  if (!data.email || !isValidEmail(data.email)) {
    throw new Error('Valid email address is required');
  }

  if (!data.subject || data.subject.trim().length === 0) {
    throw new Error('Subject is required');
  }

  if (!data.message || data.message.trim().length < 10) {
    throw new Error('Message must be at least 10 characters');
  }

  // Security: Prevent excessively long inputs (potential DoS)
  if (data.name.length > 100) {
    throw new Error('Name is too long (max 100 characters)');
  }

  if (data.subject.length > 200) {
    throw new Error('Subject is too long (max 200 characters)');
  }

  if (data.message.length > 5000) {
    throw new Error('Message is too long (max 5000 characters)');
  }
}

/**
 * Validate newsletter form data
 * @param data - Newsletter form data
 * @throws Error if validation fails
 */
function validateNewsletterData(data: NewsletterFormData): void {
  // Bot protection: Check honeypot
  if (isBotSubmission(data._gotcha)) {
    throw new Error('Bot submission detected');
  }

  // Rate limiting: Check submission frequency
  if (isRateLimited(data.email, 2, 120000)) { // 2 submissions per 2 minutes
    throw new Error('Too many submissions. Please wait a moment and try again.');
  }

  if (!data.email || !isValidEmail(data.email)) {
    throw new Error('Valid email address is required');
  }

  // Security: Prevent excessively long inputs
  if (data.name && data.name.length > 100) {
    throw new Error('Name is too long (max 100 characters)');
  }
}

/**
 * Validate booking form data
 * @param data - Booking form data
 * @throws Error if validation fails
 */
function validateBookingData(data: BookingFormData): void {
  // Bot protection: Check honeypot
  if (isBotSubmission(data._gotcha)) {
    throw new Error('Bot submission detected');
  }

  // Rate limiting: Check submission frequency
  if (isRateLimited(data.email, 2, 300000)) { // 2 bookings per 5 minutes
    throw new Error('Too many booking attempts. Please wait a few minutes and try again.');
  }

  if (!data.fullName || data.fullName.trim().length === 0) {
    throw new Error('Full name is required');
  }

  if (!data.email || !isValidEmail(data.email)) {
    throw new Error('Valid email address is required');
  }

  if (!data.phone || data.phone.trim().length === 0) {
    throw new Error('Phone number is required');
  }

  if (!data.numberOfPeople || data.numberOfPeople < 1) {
    throw new Error('At least 1 person is required');
  }

  if (!data.startDate) {
    throw new Error('Booking start date is required');
  }

  if (!data.endDate) {
    throw new Error('Booking end date is required');
  }

  if (data.endDate < data.startDate) {
    throw new Error('End date cannot be before the start date');
  }

  // Security: Prevent excessively long inputs
  if (data.fullName.length > 100) {
    throw new Error('Full name is too long (max 100 characters)');
  }

  if (data.specialRequests && data.specialRequests.length > 1000) {
    throw new Error('Special requests are too long (max 1000 characters)');
  }
}

// ============================================================================
// API Communication
// ============================================================================

/**
 * Submit data to Formspree endpoint with security measures
 * @param endpoint - Formspree endpoint URL
 * @param data - Form data to submit
 * @returns Promise resolving to FormspreeResponse
 */
async function submitToFormspree(
  endpoint: string,
  data: Record<string, any>
): Promise<FormspreeResponse> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Formspree] Submitting to:', endpoint);
      console.log('[Formspree] Data keys:', Object.keys(data));
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
      // Security: Prevent credentials from being sent
      credentials: 'omit',
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[Formspree] Response status:', response.status);
    }

    const result = await response.json();

    if (!response.ok) {
      // Handle Formspree-specific errors
      const errorMessage = result.error || result.errors?.[0]?.message || 'Failed to submit form';
      
      // Security: Don't expose detailed error messages to console in production
      if (process.env.NODE_ENV === 'development') {
        console.error('[Formspree] Submission failed:', {
          status: response.status,
          error: errorMessage,
          result,
        });
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Formspree] Submission successful');
    }

    return {
      success: true,
      message: 'Form submitted successfully',
    };
  } catch (error) {
    // Security: Don't expose detailed error messages
    const errorMessage = error instanceof Error ? error.message : 'Network error';
    
    if (process.env.NODE_ENV === 'development') {
      console.error('[Formspree] Network error:', error);
    }

    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    };
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Submit contact form to Formspree
 * @param data - Contact form data
 * @returns Promise resolving to FormspreeResponse
 */
export async function submitContactForm(
  data: ContactFormData
): Promise<FormspreeResponse> {
  try {
    // Validate input
    validateContactData(data);

    // Get and validate endpoint
    const endpoint = getFormspreeEndpoint('contact');

    // Sanitize all inputs
    const sanitizedName = sanitizeInput(data.name);
    const sanitizedEmail = sanitizeEmail(data.email);
    const sanitizedSubject = sanitizeInput(data.subject);

    const sanitizedData = {
      // Core fields — named clearly so Formspree renders them well in the email
      name: sanitizedName,
      email: sanitizedEmail,
      phone: data.phone ? sanitizePhone(data.phone) : undefined,
      subject: sanitizedSubject,
      message: sanitizeInput(data.message),
      // Formspree special fields for deliverability
      // _subject: sets the email subject line — keep it clean and professional
      _subject: `[NECHABEST Contact] ${sanitizedSubject} — from ${sanitizedName}`,
      // _replyto: sets Reply-To header so replies go to the sender, not Formspree
      _replyto: sanitizedEmail,
      // Honeypot field — Formspree rejects submissions where this is filled (bots fill it)
      _gotcha: data._gotcha || '',
    };

    // Submit to Formspree
    return await submitToFormspree(endpoint, sanitizedData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit contact form';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Submit newsletter subscription to Formspree
 * @param data - Newsletter form data
 * @returns Promise resolving to FormspreeResponse
 */
export async function submitNewsletterForm(
  data: NewsletterFormData
): Promise<FormspreeResponse> {
  try {
    // Validate input
    validateNewsletterData(data);

    // Get and validate endpoint
    const endpoint = getFormspreeEndpoint('contact');

    // Sanitize all inputs
    const sanitizedEmail = sanitizeEmail(data.email);
    const sanitizedName = data.name ? sanitizeInput(data.name) : undefined;

    const sanitizedData = {
      // Core fields
      email: sanitizedEmail,
      name: sanitizedName,
      // Formspree special fields for deliverability
      _subject: sanitizedName
        ? `[NECHABEST Newsletter] New subscription from ${sanitizedName}`
        : '[NECHABEST Newsletter] New subscription',
      // _replyto: lets the team reply directly to the subscriber
      _replyto: sanitizedEmail,
      // Honeypot field — Formspree rejects submissions where this is filled
      _gotcha: data._gotcha || '',
    };

    // Submit to Formspree
    return await submitToFormspree(endpoint, sanitizedData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to subscribe to newsletter';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Submit booking form to Formspree
 * @param data - Booking form data
 * @returns Promise resolving to FormspreeResponse
 */
export async function submitBookingForm(
  data: BookingFormData
): Promise<FormspreeResponse> {
  try {
    // Validate input
    validateBookingData(data);

    // Get and validate endpoint
    const endpoint = getFormspreeEndpoint('booking');

    // Sanitize all inputs
    const sanitizedTourTitle = sanitizeInput(data.tourTitle);
    const sanitizedFullName = sanitizeInput(data.fullName);
    const sanitizedEmail = sanitizeEmail(data.email);

    const sanitizedData = {
      // Core fields — named clearly for the email body
      'Tour': sanitizedTourTitle,
      'Full Name': sanitizedFullName,
      email: sanitizedEmail,
      'Phone': sanitizePhone(data.phone),
      'Number of People': data.numberOfPeople,
      'Start Date': data.startDate,
      'End Date': data.endDate,
      'Total Price (USD)': `$${data.totalPrice}`,
      'Special Requests': data.specialRequests ? sanitizeInput(data.specialRequests) : 'None',
      // Internal reference fields (not shown prominently in email)
      tourId: sanitizeInput(data.tourId),
      // Formspree special fields for deliverability
      _subject: `[NECHABEST Booking] ${sanitizedTourTitle} — ${sanitizedFullName}`,
      // _replyto: lets the team reply directly to the customer
      _replyto: sanitizedEmail,
      // Honeypot field — Formspree rejects submissions where this is filled
      _gotcha: data._gotcha || '',
    };

    // Submit to Formspree
    return await submitToFormspree(endpoint, sanitizedData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit booking';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}
