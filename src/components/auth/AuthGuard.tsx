// Auth Guard — protects routes that require authentication
// Shows loading during auth initialization, redirects to login if unauthenticated

'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (initialized && !loading && !user) {
      // Redirect to login with return path
      router.replace(`/auth?from=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, initialized, router, pathname]);

  // Show loading while auth initializes
  if (!initialized || loading) {
    return (
      fallback || (
        <main className="min-h-screen flex items-center justify-center pb-24">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">⏳</div>
            <p className="text-quran-ivory-muted">جارٍ التحميل...</p>
          </div>
        </main>
      )
    );
  }

  // Don't render children if not authenticated
  if (!user) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
