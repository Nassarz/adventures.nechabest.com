# Implementation Plan: Formspree Integration

## Overview

This implementation plan breaks down the Formspree email service integration into discrete, actionable coding tasks. The integration adds email notification capabilities to three existing forms (Contact, Newsletter, Booking) while preserving all existing UI/UX elements. The implementation follows a phased approach: core service creation, individual form integrations, and comprehensive testing.

**Key Constraints:**
- NO UI changes - only modify form submission logic
- Maintain existing validation patterns
- Keep existing error/success message displays
- Preserve all existing styling and layouts
- For booking form: maintain MongoDB storage + add Formspree email

## Tasks

- [x] 1. Create Formspree service utility and environment configuration
  - Create `lib/formspree.ts` with TypeScript interfaces for all form data types
  - Implement `submitContactForm` function with fetch API and error handling
  - Implement `submitNewsletterForm` function with fetch API and error handling
  - Implement `submitBookingForm` function with fetch API and error handling
  - Add comprehensive error logging to console
  - Add environment variables to `.env.local`: `NEXT_PUBLIC_FORMSPREE_CONTACT_ENDPOINT` and `NEXT_PUBLIC_FORMSPREE_BOOKING_ENDPOINT`
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 11.1_

- [ ]* 1.1 Write unit tests for Formspree service utility
  - **Test Coverage: Contact form submission (success, API errors, network errors, required fields, headers)**
  - **Test Coverage: Newsletter form submission (success, optional name field, API errors, email validation)**
  - **Test Coverage: Booking form submission (success, all fields included, API errors, date formatting)**
  - **Test Coverage: Error handling (normalized error responses, console logging, no sensitive data exposure)**
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.4_

- [ ] 2. Integrate Contact Form with Formspree
  - [x] 2.1 Modify Contact Form submission handler
    - Import `submitContactForm` from `lib/formspree.ts` in `app/contact/page.tsx`
    - Update `handleSubmit` function to call `submitContactForm` with form data
    - Preserve existing validation logic (name, email, phone, subject, message)
    - Update error handling to display Formspree-specific errors
    - Maintain existing loading state management
    - Maintain existing success message display and form clearing
    - Ensure NO changes to UI components, styling, or layouts
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.7, 8.1, 8.2, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 2.2 Write integration tests for Contact Form
    - **Test Coverage: Validation errors for empty fields**
    - **Test Coverage: Loading state during submission**
    - **Test Coverage: Success message display and form clearing**
    - **Test Coverage: Error message display on submission failure**
    - **Test Coverage: Form data retention on failure**
    - _Requirements: 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 8.5, 9.1, 9.2, 9.3, 9.5, 9.6_

- [x] 3. Checkpoint - Verify Contact Form integration
  - Ensure all tests pass, manually test Contact Form submission, verify email delivery to Formspree endpoint, ask the user if questions arise.

- [ ] 4. Integrate Newsletter Form with Formspree
  - [x] 4.1 Modify Newsletter Form submission handler
    - Import `submitNewsletterForm` from `lib/formspree.ts` in `components/NewsletterModal.tsx`
    - Update `handleSubmit` function to call `submitNewsletterForm` with email and optional name
    - Preserve existing email validation logic
    - Update error handling to display Formspree-specific errors
    - Maintain existing loading state management
    - Maintain existing success animation and modal closing behavior
    - Ensure NO changes to modal UI, backdrop, input styling, or animations
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.3, 8.1, 8.2, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 4.2 Write integration tests for Newsletter Form
    - **Test Coverage: Email format validation**
    - **Test Coverage: Loading state during submission**
    - **Test Coverage: Success animation display**
    - **Test Coverage: Modal closing after successful subscription**
    - **Test Coverage: Error message display on failure**
    - _Requirements: 3.3, 3.4, 4.1, 4.2, 8.5, 9.1, 9.2, 9.3, 9.4, 9.6_

- [x] 5. Checkpoint - Verify Newsletter Form integration
  - Ensure all tests pass, manually test Newsletter Form submission, verify email delivery to Formspree endpoint, ask the user if questions arise.

- [ ] 6. Integrate Booking Form with Formspree (Dual Submission)
  - [x] 6.1 Modify Booking Form submission handler for dual submission
    - Import `submitBookingForm` from `lib/formspree.ts` in `app/booking/page.tsx`
    - Update `handleSubmit` function to execute parallel submissions using `Promise.allSettled`
    - First submission: Call `submitBookingForm` with all booking data
    - Second submission: Call existing `/api/bookings` endpoint for MongoDB storage
    - Preserve existing validation logic for all 3 steps (tour selection, personal info, review)
    - Implement comprehensive error handling for 4 scenarios: both succeed, Formspree fails, MongoDB fails, both fail
    - Display appropriate error messages for each failure scenario
    - Maintain existing loading state management
    - Maintain existing confirmation page (Step 4) display on full success
    - Ensure NO changes to UI components, step indicator, form inputs, or styling
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.10, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [ ]* 6.2 Write integration tests for Booking Form dual submission
    - **Test Coverage: Validation for all 3 steps before submission**
    - **Test Coverage: Loading state during submission**
    - **Test Coverage: Dual submission execution (Formspree + MongoDB)**
    - **Test Coverage: Confirmation display on full success**
    - **Test Coverage: Appropriate error messages for partial failures (Formspree fails, MongoDB succeeds)**
    - **Test Coverage: Appropriate error messages for partial failures (MongoDB fails, Formspree succeeds)**
    - **Test Coverage: Error message for complete failure (both fail)**
    - _Requirements: 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 8.3, 8.5, 9.1, 9.2, 9.3, 9.6, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [x] 7. Checkpoint - Verify Booking Form integration
  - Ensure all tests pass, manually test Booking Form submission through all 3 steps, verify both email delivery and MongoDB record creation, test partial failure scenarios, ask the user if questions arise.

- [x] 8. Final verification and manual testing
  - [x] 8.1 Perform comprehensive manual testing
    - Test Contact Form: submit with all fields, verify email received, test validation errors, test network error handling
    - Test Newsletter Form: submit with valid email, test with/without name, verify email received, test validation errors
    - Test Booking Form: complete all 3 steps, verify both email and MongoDB record, test all validation rules, test partial failure scenarios
    - Verify all loading states display correctly during submissions
    - Verify all success messages display correctly after submissions
    - Verify all error messages display correctly on failures
    - Verify all forms clear data after successful submission
    - Verify all forms retain data after failed submission for retry
    - Verify NO UI changes occurred (compare with original implementation)
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 3.3, 3.4, 3.5, 3.6, 5.4, 5.5, 5.6, 5.7, 8.1, 8.2, 8.3, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 10.6_

  - [x] 8.2 Verify accessibility compliance
    - Verify all forms maintain existing ARIA labels
    - Verify error messages are announced to screen readers
    - Verify keyboard navigation works correctly (Tab order, Enter key submission)
    - Verify forms work correctly on mobile and desktop screen sizes
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.7_

  - [x] 8.3 Verify security and data handling
    - Verify all Formspree requests use HTTPS
    - Verify no sensitive data is logged to console
    - Verify user input is sanitized in error/success messages
    - Verify no sensitive data is stored in localStorage or sessionStorage
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 9. Final checkpoint - Complete integration verification
  - Ensure all manual tests pass, verify email delivery for all forms, verify MongoDB storage for bookings, confirm NO UI changes occurred, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- The implementation preserves 100% of existing UI/UX - only form submission logic is modified
- Booking form implements dual submission (Formspree + MongoDB) with comprehensive error handling
- All forms maintain existing validation, loading states, and user feedback mechanisms
- Testing strategy focuses on integration tests and manual verification due to external service dependency

## Implementation Notes

### Formspree Endpoints

- **Contact & Newsletter Forms**: `https://formspree.io/f/xvglkroe`
- **Booking Form**: `https://formspree.io/f/xpwbpdee`

### Key Technical Decisions

1. **Fetch API**: Use native fetch for HTTP requests (no external dependencies)
2. **Parallel Submissions**: Use `Promise.allSettled` for booking form dual submission
3. **Error Handling**: Comprehensive handling for all failure scenarios with user-friendly messages
4. **TypeScript**: Maintain strong typing with interfaces for all form data
5. **Environment Variables**: Use `NEXT_PUBLIC_` prefix for client-side access to Formspree endpoints

### Partial Failure Handling (Booking Form)

| Scenario | User Message | Technical Action |
|----------|-------------|------------------|
| Both succeed | "Booking Confirmed!" (Step 4) | Show confirmation page |
| Formspree fails, MongoDB succeeds | "Booking saved but email notification failed. We will contact you shortly." | Log error, show partial success |
| MongoDB fails, Formspree succeeds | "Email sent but failed to save booking. Please contact us directly." | Log error, show partial success |
| Both fail | "Failed to submit booking. Please try again or contact us directly." | Log both errors, keep form data |
