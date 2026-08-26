'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type InstallPhase =
  | 'idle'
  | 'native-ready'
  | 'installing'
  | 'installed'
  | 'dismissed'
  | 'ios-instructions'
  | 'android-instructions'
  | 'desktop-instructions';

function getPlatform() {
  if (typeof navigator === 'undefined') return { ios: false, android: false, chrome: false, edge: false, desktop: false };
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /Android/.test(ua);
  const edge = /Edg/.test(ua);
  const chrome = /Chrome/.test(ua) && !edge && !/OPR/.test(ua);
  const desktop = !ios && !android;
  return { ios, android, chrome, edge, desktop };
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

// ─── DISMISSED KEY ────────────────────────────────────────
const DISMISS_KEY = 'emam-install-dismissed';

function wasDismissed() {
  if (typeof window === 'undefined') return false;
  try {
    const val = sessionStorage.getItem(DISMISS_KEY);
    return val === '1';
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    sessionStorage.setItem(DISMISS_KEY, '1');
  } catch { /* noop */ }
}

// ═══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function InstallPrompt({ variant = 'card' }: { variant?: 'card' | 'hero' }) {
  const [phase, setPhase] = useState<InstallPhase>('idle');
  const [showSuccess, setShowSuccess] = useState(false);
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const mountedRef = useRef(true);

  // ── Init ──
  useEffect(() => {
    if (typeof window === 'undefined') return;
    mountedRef.current = true;

    if (isStandalone()) {
      setPhase('installed');
      return;
    }

    const { ios, android, chrome, edge, desktop } = getPlatform();

    // Listen for native install capability
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      if (!mountedRef.current) return;
      deferredRef.current = e as BeforeInstallPromptEvent;
      setPhase('native-ready');
    };

    const onInstalled = () => {
      if (!mountedRef.current) return;
      deferredRef.current = null;
      setPhase('installed');
      setShowSuccess(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    // If already dismissed this session, don't show anything
    if (wasDismissed()) {
      return () => {
        mountedRef.current = false;
        window.removeEventListener('beforeinstallprompt', onBeforeInstall);
        window.removeEventListener('appinstalled', onInstalled);
      };
    }

    // If native prompt hasn't fired yet, show platform fallback after a short delay
    if (!deferredRef.current) {
      const timer = setTimeout(() => {
        if (!mountedRef.current || deferredRef.current) return;
        if (ios) {
          setPhase('ios-instructions');
        } else if (android || chrome || edge) {
          // Android/Chrome: show manual instructions
          setPhase('android-instructions');
        } else if (desktop) {
          setPhase('desktop-instructions');
        }
      }, 2000);

      return () => {
        clearTimeout(timer);
        mountedRef.current = false;
        window.removeEventListener('beforeinstallprompt', onBeforeInstall);
        window.removeEventListener('appinstalled', onInstalled);
      };
    }

    return () => {
      mountedRef.current = false;
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // ── Handlers ──
  const handleInstall = useCallback(async () => {
    const prompt = deferredRef.current;
    if (!prompt) return;

    setPhase('installing');
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (!mountedRef.current) return;

      if (outcome === 'accepted') {
        setPhase('installed');
        setShowSuccess(true);
      } else {
        setPhase('native-ready');
      }
    } catch {
      if (mountedRef.current) setPhase('native-ready');
    } finally {
      deferredRef.current = null;
    }
  }, []);

  const handleDismiss = useCallback(() => {
    markDismissed();
    setPhase('dismissed');
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleInstall();
      }
    },
    [handleInstall],
  );

  // ── Don't render if installed or dismissed ──
  if (phase === 'installed' || phase === 'dismissed') {
    if (showSuccess && phase === 'installed') {
      return (
        <div className="animate-slide-up" role="status" aria-live="polite">
          <div className="flex items-center justify-center gap-2 py-3 text-sm text-quran-gold font-medium">
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>تم تثبيت رفيق الإمام بنجاح</span>
          </div>
        </div>
      );
    }
    return null;
  }

  // ── HERO variant: compact inline button ──
  if (variant === 'hero') {
    // Show native button in hero if available
    if (phase === 'native-ready' || phase === 'installing') {
      return (
        <button
          onClick={handleInstall}
          onKeyDown={handleKeyDown}
          disabled={phase === 'installing'}
          aria-label="تثبيت رفيق الإمام كتطبيق"
          aria-busy={phase === 'installing'}
          className="flex-1 min-h-[48px] sm:min-h-[52px] glass-strong rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3 sm:py-4 text-quran-ivory hover:text-quran-gold hover:bg-white/10 transition-all duration-300 text-center flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-quran-gold active:scale-[0.98]"
        >
          {phase === 'installing' ? (
            <span className="animate-pulse text-base sm:text-lg">جارٍ التثبيت...</span>
          ) : (
            <>
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span className="text-base sm:text-lg font-bold">ثبّت التطبيق</span>
            </>
          )}
        </button>
      );
    }

    // iOS: show a small info button that opens instructions
    if (phase === 'ios-instructions') {
      return (
        <button
          onClick={() => setPhase('ios-instructions')}
          aria-label="كيفية تثبيت التطبيق على iPhone"
          className="flex-1 min-h-[48px] sm:min-h-[52px] glass-strong rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3 sm:py-4 text-quran-ivory hover:text-quran-gold hover:bg-white/10 transition-all duration-300 text-center flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-quran-gold active:scale-[0.98]"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span className="text-base sm:text-lg font-bold">ثبّت التطبيق</span>
        </button>
      );
    }

    // Other states in hero: don't show button (will show card below instead)
    return null;
  }

  // ── CARD variant: full card (below hero) ──

  // 1. Native install ready
  if (phase === 'native-ready' || phase === 'installing') {
    return (
      <div className="rounded-2xl overflow-hidden animate-slide-up" role="region" aria-label="تثبيت التطبيق">
        <div className="glass-strong rounded-2xl p-4 sm:p-5 border border-quran-gold/15">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-quran-gold to-quran-gold/70 flex items-center justify-center text-xl shadow-lg shadow-quran-gold/20 flex-shrink-0" aria-hidden="true">
              📲
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-quran-ivory">حوّل رفيق الإمام إلى تطبيق على جهازك</h3>
              <p className="text-[11px] text-quran-ivory-muted">يعمل بدون إنترنت وفتح أسرع</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              onKeyDown={handleKeyDown}
              disabled={phase === 'installing'}
              aria-label="تثبيت رفيق الإمام كتطبيق على جهازك"
              aria-busy={phase === 'installing'}
              className="flex-1 min-h-[48px] bg-gradient-to-l from-quran-gold via-quran-gold to-quran-gold/85 rounded-xl px-5 py-3 text-sm font-bold text-quran-bg active:scale-[0.98] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-quran-gold transition-all duration-150 disabled:opacity-70 shadow-lg shadow-quran-gold/25 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-wait"
            >
              {phase === 'installing' ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>جارٍ التثبيت...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>تثبيت التطبيق</span>
                </>
              )}
            </button>
            <button
              onClick={handleDismiss}
              aria-label="ليس الآن"
              className="min-h-[48px] px-4 py-3 rounded-xl text-xs font-medium text-quran-ivory-muted hover:text-quran-ivory hover:bg-white/5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-quran-gold"
            >
              ليس الآن
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. iOS instructions
  if (phase === 'ios-instructions') {
    return (
      <div className="glass-strong rounded-2xl p-4 sm:p-5 border border-quran-gold/15 animate-slide-up" role="region" aria-label="إضافة التطبيق إلى الشاشة الرئيسية">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-quran-gold to-quran-gold/70 flex items-center justify-center text-xl shadow-lg shadow-quran-gold/20 flex-shrink-0" aria-hidden="true">
            📲
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-quran-ivory">أضف رفيق الإمام للشاشة الرئيسية</h3>
            <p className="text-[11px] text-quran-ivory-muted">للوصول السريع والعمل بدون إنترنت</p>
          </div>
        </div>
        <ol className="space-y-3 text-[11px] sm:text-xs text-quran-ivory-muted list-none mb-4">
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-quran-gold/15 flex items-center justify-center text-[10px] font-bold text-quran-gold flex-shrink-0 mt-0.5" aria-hidden="true">1</span>
            <span>اضغط أيقونة <strong className="text-quran-gold">المشاركة</strong> في أسفل الشاشة <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px] font-mono mx-0.5">⬆️</kbd></span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-quran-gold/15 flex items-center justify-center text-[10px] font-bold text-quran-gold flex-shrink-0 mt-0.5" aria-hidden="true">2</span>
            <span>مرر لأسفل واضغط <strong className="text-quran-gold">أضف إلى الشاشة الرئيسية</strong></span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-quran-gold/15 flex items-center justify-center text-[10px] font-bold text-quran-gold flex-shrink-0 mt-0.5" aria-hidden="true">3</span>
            <span>اضغط <strong className="text-quran-gold">إضافة</strong> في الأعلى لتأكيد</span>
          </li>
        </ol>
        <button
          onClick={handleDismiss}
          className="w-full min-h-[40px] rounded-xl text-xs font-medium text-quran-ivory-muted hover:text-quran-ivory hover:bg-white/5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-quran-gold"
        >
          فهمت، ليس الآن
        </button>
      </div>
    );
  }

  // 3. Android manual instructions (beforeinstallprompt didn't fire)
  if (phase === 'android-instructions') {
    return (
      <div className="glass-strong rounded-2xl p-4 sm:p-5 border border-quran-gold/15 animate-slide-up" role="region" aria-label="تثبيت التطبيق">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-quran-gold to-quran-gold/70 flex items-center justify-center text-xl shadow-lg shadow-quran-gold/20 flex-shrink-0" aria-hidden="true">
            📲
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-quran-ivory">ثبّت رفيق الإمام</h3>
            <p className="text-[11px] text-quran-ivory-muted">من قائمة المتصفح</p>
          </div>
        </div>
        <ol className="space-y-3 text-[11px] sm:text-xs text-quran-ivory-muted list-none mb-4">
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-quran-gold/15 flex items-center justify-center text-[10px] font-bold text-quran-gold flex-shrink-0 mt-0.5" aria-hidden="true">1</span>
            <span>اضغط أيقونة <strong className="text-quran-gold">النقاط الثلاث</strong> <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px] font-mono mx-0.5">⋮</kbd> في أعلى الشاشة</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-quran-gold/15 flex items-center justify-center text-[10px] font-bold text-quran-gold flex-shrink-0 mt-0.5" aria-hidden="true">2</span>
            <span>اختر <strong className="text-quran-gold">تثبيت التطبيق</strong> أو <strong className="text-quran-gold">إضافة إلى الشاشة الرئيسية</strong></span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-quran-gold/15 flex items-center justify-center text-[10px] font-bold text-quran-gold flex-shrink-0 mt-0.5" aria-hidden="true">3</span>
            <span>اضغط <strong className="text-quran-gold">تثبيت</strong> للتأكيد</span>
          </li>
        </ol>
        <button
          onClick={handleDismiss}
          className="w-full min-h-[40px] rounded-xl text-xs font-medium text-quran-ivory-muted hover:text-quran-ivory hover:bg-white/5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-quran-gold"
        >
          فهمت، ليس الآن
        </button>
      </div>
    );
  }

  // 4. Desktop instructions
  if (phase === 'desktop-instructions') {
    return (
      <div className="glass-strong rounded-2xl p-4 sm:p-5 border border-quran-gold/15 animate-slide-up" role="region" aria-label="تثبيت التطبيق">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-quran-gold to-quran-gold/70 flex items-center justify-center text-xl shadow-lg shadow-quran-gold/20 flex-shrink-0" aria-hidden="true">
            📲
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-quran-ivory">ثبّت رفيق الإمام على جهازك</h3>
            <p className="text-[11px] text-quran-ivory-muted">من شريط العنوان</p>
          </div>
        </div>
        <div className="space-y-2 text-[11px] sm:text-xs text-quran-ivory-muted mb-4">
          <div className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-quran-gold flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>اضغط أيقونة <strong className="text-quran-gold">التثبيت</strong> في شريط العنوان (الجانب الأيمن)</span>
          </div>
          <div className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-quran-gold flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            <span>أو اضغط <strong className="text-quran-gold">⋮</strong> ثم <strong className="text-quran-gold">تثبيت رفيق الإمام</strong></span>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="w-full min-h-[40px] rounded-xl text-xs font-medium text-quran-ivory-muted hover:text-quran-ivory hover:bg-white/5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-quran-gold"
        >
          فهمت، ليس الآن
        </button>
      </div>
    );
  }

  // idle / fallback — don't render
  return null;
}
