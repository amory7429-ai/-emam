'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const SW_PATH = '/sw.js';
    let updateInterval: ReturnType<typeof setInterval> | null = null;

    navigator.serviceWorker
      .register(SW_PATH, { scope: '/' })
      .then((registration) => {
        // Check for updates periodically (every 60 minutes)
        updateInterval = setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);

        // Listen for a new service worker taking control
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              // New version is active
            }
          });
        });
      })
      .catch(() => {
        // Registration failed — silently ignore
      });

    return () => {
      if (updateInterval !== null) {
        clearInterval(updateInterval);
      }
    };
  }, []);

  return null;
}
