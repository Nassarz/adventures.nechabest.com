'use client';

import { useEffect } from 'react';
import '../lib/chunkErrorHandler';

/**
 * Initialize chunk error handling on the client
 * This component ensures global error listeners are set up
 * for handling dynamic chunk loading failures
 */
export function ChunkErrorHandler() {
  useEffect(() => {
    // Error handling is set up via chunkErrorHandler.ts
    // This is just to ensure it runs on mount
    console.debug('Chunk error handler initialized');
  }, []);

  return null;
}
