'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';

export default function RouteTransition() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  useEffect(() => {
    if (prevPathname !== pathname) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(true);

      // Update prevPathname for next comparison
      setPrevPathname(pathname);

      // Show loading for 2 seconds
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [pathname, prevPathname]);

  return <LoadingSpinner isVisible={isLoading} />;
}
