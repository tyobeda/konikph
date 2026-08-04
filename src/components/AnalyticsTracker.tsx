'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/actions/analytics';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedRef = useRef<string>('');

  useEffect(() => {
    // Skip admin and API routes
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/api')) {
      return;
    }

    const query = searchParams?.toString();
    const fullPath = query ? `${pathname}?${query}` : pathname;

    // Prevent immediate duplicate tracking within the same session render
    if (lastTrackedRef.current === fullPath) {
      return;
    }
    lastTrackedRef.current = fullPath;

    const timer = setTimeout(() => {
      try {
        const referrer = typeof document !== 'undefined' ? document.referrer : '';
        trackPageView({
          path: fullPath,
          referrer: referrer || undefined,
        }).catch(() => {});
      } catch (e) {}
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
}
