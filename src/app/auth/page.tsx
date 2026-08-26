'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/auth-context';

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-quran-ivory-muted">جارٍ التحميل...</p></div>}>
      <AuthPageInner />
    </Suspense>
  );
}

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, initialized, error, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, clearError } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [validationError, setValidationError] = useState('');

  const from = searchParams.get('from') || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (initialized && !loading && user) {
      router.replace(from);
    }
  }, [user, loading, initialized, router, from]);

  if (loading || !initialized) {
    return (
      <main className="min-h-screen flex items-center justify-center pb-24">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-quran-ivory-muted">جارٍ التحميل...</p>
        </div>
      </main>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  const validateForm = (): boolean => {
    setValidationError('');
    clearError();

    if (!email.trim()) {
      setValidationError('البريد الإلكتروني مطلوب.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('البريد الإلكتروني غير صالح.');
      return false;
    }
    if (mode === 'reset') return true;
    if (!password) {
      setValidationError('كلمة المرور مطلوبة.');
      return false;
    }
    if (password.length < 6) {
      setValidationError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return false;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setValidationError('كلمتا المرور غير متطابقتين.');
      return false;
    }
    return true;
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setValidationError('');
    clearError();
    try {
      await signInWithGoogle();
      router.replace(from);
    } catch {
      // Error handled by auth context
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoadingEmail(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      router.replace(from);
    } catch {
      // Error handled by auth context
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoadingReset(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch {
      // Error handled by auth context
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <main className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="font-amiri text-xl font-bold text-quran-ivory">
            {mode === 'login' ? 'تسجيل الدخول' : mode === 'signup' ? 'إنشاء حساب' : 'إعادة تعيين كلمة المرور'}
          </h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Error display */}
        {(error || validationError) && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error || validationError}
          </div>
        )}

        {/* Reset sent */}
        {resetSent && mode === 'reset' && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
            ✓ تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.
          </div>
        )}

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loadingGoogle}
          className="w-full min-h-[52px] glass rounded-xl py-4 text-sm font-bold text-quran-ivory hover:bg-white/5 transition-all active:scale-95 flex items-center justify-center gap-3 mb-4 disabled:opacity-50"
        >
          {loadingGoogle ? (
            <span className="animate-pulse">جاري تسجيل الدخول عبر Google...</span>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              متابعة مع Google
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-quran-olive">أو</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Email Form */}
        {mode === 'reset' ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm text-quran-ivory-muted mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
                className="w-full min-h-[48px] glass rounded-xl px-4 py-3 text-sm text-quran-ivory placeholder:text-quran-olive focus:outline-none focus:ring-2 focus:ring-quran-gold/30"
                dir="ltr"
                autoComplete="email"
              />
            </div>
            <button
              type="submit"
              disabled={loadingReset}
              className="w-full min-h-[48px] bg-gradient-to-l from-quran-gold to-quran-gold/80 rounded-xl py-3 text-sm font-bold text-quran-bg hover:from-quran-gold/90 hover:to-quran-gold/70 transition-all active:scale-95 disabled:opacity-50"
            >
              {loadingReset ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-quran-ivory-muted mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
                className="w-full min-h-[48px] glass rounded-xl px-4 py-3 text-sm text-quran-ivory placeholder:text-quran-olive focus:outline-none focus:ring-2 focus:ring-quran-gold/30"
                dir="ltr"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm text-quran-ivory-muted mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full min-h-[48px] glass rounded-xl px-4 py-3 text-sm text-quran-ivory placeholder:text-quran-olive focus:outline-none focus:ring-2 focus:ring-quran-gold/30"
                dir="ltr"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
            {mode === 'signup' && (
              <div>
                <label className="block text-sm text-quran-ivory-muted mb-2">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                  className="w-full min-h-[48px] glass rounded-xl px-4 py-3 text-sm text-quran-ivory placeholder:text-quran-olive focus:outline-none focus:ring-2 focus:ring-quran-gold/30"
                  dir="ltr"
                  autoComplete="new-password"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loadingEmail}
              className="w-full min-h-[48px] bg-gradient-to-l from-quran-gold to-quran-gold/80 rounded-xl py-3 text-sm font-bold text-quran-bg hover:from-quran-gold/90 hover:to-quran-gold/70 transition-all active:scale-95 disabled:opacity-50"
            >
              {loadingEmail
                ? 'جاري تسجيل الدخول...'
                : mode === 'login'
                ? 'تسجيل الدخول'
                : 'إنشاء حساب'}
            </button>
          </form>
        )}

        {/* Mode switches */}
        <div className="mt-6 space-y-3 text-center">
          {mode === 'login' && (
            <>
              <button
                onClick={() => { setMode('reset'); clearError(); setValidationError(''); }}
                className="text-xs text-quran-gold hover:text-quran-gold/80 transition-colors"
              >
                نسيت كلمة المرور؟
              </button>
              <p className="text-sm text-quran-ivory-muted">
                ليس لديك حساب؟{' '}
                <button
                  onClick={() => { setMode('signup'); clearError(); setValidationError(''); }}
                  className="text-quran-gold font-bold hover:text-quran-gold/80 transition-colors"
                >
                  إنشاء حساب
                </button>
              </p>
            </>
          )}
          {mode === 'signup' && (
            <p className="text-sm text-quran-ivory-muted">
              لديك حساب بالفعل؟{' '}
              <button
                onClick={() => { setMode('login'); clearError(); setValidationError(''); }}
                className="text-quran-gold font-bold hover:text-quran-gold/80 transition-colors"
              >
                تسجيل الدخول
              </button>
            </p>
          )}
          {mode === 'reset' && (
            <p className="text-sm text-quran-ivory-muted">
              <button
                onClick={() => { setMode('login'); clearError(); setValidationError(''); }}
                className="text-quran-gold font-bold hover:text-quran-gold/80 transition-colors"
              >
                العودة لتسجيل الدخول
              </button>
            </p>
          )}
        </div>

        {/* Guest access */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-quran-olive hover:text-quran-ivory-muted transition-colors"
          >
            التصفح كزائر ← العودة للرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
