'use client';

import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChunkErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a chunk loading error
    if (
      error.message.includes('Loading chunk') ||
      error.message.includes('dynamic import')
    ) {
      return { hasError: true, error };
    }
    throw error;
  }

  componentDidCatch(error: Error) {
    // Log chunk loading errors
    if (error.message.includes('Loading chunk')) {
      console.warn('Chunk loading error detected:', error);
      // Reload page after a short delay to fetch fresh chunks
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Loading Resources...
            </h1>
            <p className="text-gray-600">
              Updating application resources. Please wait...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-gray-900 rounded-full"></div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
