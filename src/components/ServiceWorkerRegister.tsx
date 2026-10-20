'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register service worker in production builds
    // Explicitly check: process.env.NODE_ENV must be 'production'
    // This is set at build time and baked into the bundle
    
    if (process.env.NODE_ENV !== 'production') {
      // In development/preview: do NOT register
      console.debug('[SW] Disabled in development mode (NODE_ENV=' + process.env.NODE_ENV + ')');
      return;
    }

    // Production only - register the service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return null;
}