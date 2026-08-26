'use client';

import { FloatingPlayer } from '@/components/ui/FloatingPlayer';
import { AuthProvider } from '@/lib/firebase/auth-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <FloatingPlayer />
    </AuthProvider>
  );
}
