// This script handles dynamic chunk loading errors that can occur when deploying new versions
// It catches the "Loading chunk X failed" error and reloads the page to fetch fresh chunks

if (typeof window !== 'undefined') {
  // Handle chunk loading errors globally
  window.addEventListener('error', (event) => {
    const error = event.error;
    if (
      error &&
      typeof error.message === 'string' &&
      error.message.includes('Loading chunk')
    ) {
      console.warn('Chunk loading error detected, reloading page...', error);
      // Give a brief delay before reload to allow current script to finish
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });

  // Also handle rejected promises from dynamic imports
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (
      reason &&
      typeof reason.message === 'string' &&
      (reason.message.includes('Loading chunk') ||
        reason.message.includes('Failed to fetch'))
    ) {
      console.warn('Dynamic import error detected, reloading page...', reason);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });
}
