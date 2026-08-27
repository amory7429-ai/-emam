'use client';

import { useEffect } from 'react';
import { FloatingPlayer } from '@/components/ui/FloatingPlayer';
import { AuthProvider } from '@/lib/firebase/auth-context';
import { useSettingsStore } from '@/stores/settings-store';

const FONT_SIZE_MAP: Record<number, string> = {
  1: '14px',
  2: '16px',
  3: '18px',
  4: '20px',
  5: '22px',
};

export function Providers({ children }: { children: React.ReactNode }) {
  const fontSize = useSettingsStore((s) => s.settings.fontSize);

  useEffect(() => {
    const size = FONT_SIZE_MAP[fontSize] || '18px';
    document.documentElement.style.setProperty('--content-font-size', size);
  }, [fontSize]);

  return (
    <AuthProvider>
      {children}
      <FloatingPlayer />
    </AuthProvider>
  );
}
