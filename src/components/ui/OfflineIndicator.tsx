'use client';

import { useState, useEffect } from 'react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!showOffline) return;
    const timer = setTimeout(() => setShowOffline(false), 5000);
    return () => clearTimeout(timer);
  }, [showOffline]);

  if (isOnline) return null;

  return (
    <div
      className="fixed top-0 inset-x-0 z-50 bg-quran-gold/90 text-quran-bg text-center text-xs py-1.5 px-4 font-medium backdrop-blur-sm transition-all"
      role="alert"
      aria-live="assertive"
    >
      ● بدون اتصال — التطبيق يعمل بشكل محدود
    </div>
  );
}
