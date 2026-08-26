'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PrayerCards } from '@/components/home/PrayerCards';
import { QuickPrepare } from '@/components/home/QuickPrepare';
import { BottomNav } from '@/components/ui/BottomNav';
import { InstallPrompt } from '@/components/ui/InstallPrompt';
import { getPrayerTimes, type PrayerTimesResult } from '@/lib/prayer/prayer-times';
import { useAuth } from '@/lib/firebase/auth-context';

export default function HomePage() {
  const [prayerData, setPrayerData] = useState<PrayerTimesResult | null>(null);
  const [countdown, setCountdown] = useState('');
  const { user, profile } = useAuth();

  useEffect(() => {
    getPrayerTimes().then(setPrayerData);
  }, []);

  // Live countdown timer — updates every second
  useEffect(() => {
    if (!prayerData?.nextPrayer?.time) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = prayerData.nextPrayer.time.getTime() - now.getTime();
      if (diff <= 0) {
        // Prayer time reached — refetch
        getPrayerTimes(true).then(setPrayerData);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [prayerData?.nextPrayer?.time]);

  return (
    <main className="min-h-screen pb-24">
      {/* Cinematic Hero */}
      <section className="relative h-[40vh] sm:h-[45vh] min-h-[280px] max-h-[380px] overflow-hidden flex items-end">
        {/* Background Image */}
        <img
          src="https://i.ibb.co/ZpjJFK0r/pexels-a-darmel-8164535.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '50% 30%' }}
          fetchPriority="high"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-quran-bg/40 via-transparent to-quran-bg" />
        <div className="absolute inset-0 bg-gradient-to-t from-quran-bg via-quran-bg/60 to-transparent" />

        {/* Content over image */}
        <div className="relative z-10 px-4 sm:px-6 pb-5 sm:pb-7 w-full">
          <div className="max-w-lg mx-auto">
            <h1 className="font-amiri text-3xl sm:text-4xl font-bold text-white mb-1 drop-shadow-lg">
              {user && profile?.displayName
                ? `مرحباً ${profile.displayName.split(' ')[0]}`
                : 'رفيق الإمام'}
            </h1>
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed drop-shadow">
              {user && profile
                ? 'تَقَرَّبْ إلى الله'
                : 'رفيقك اليومي للقرآن والصلاة والحفظ'}
            </p>
            {prayerData?.hijriDate && (
              <p className="text-quran-gold/90 text-[11px] sm:text-xs mt-1.5 font-medium drop-shadow">
                {prayerData.hijriDate}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content below hero */}
      <section className="px-4 sm:px-6 -mt-2">
        <div className="max-w-lg mx-auto">
          {/* Next Prayer Highlight */}
          {prayerData && (
            <div className="glass-strong rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6 border border-quran-gold/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-quran-ivory-muted mb-0.5">الصلاة القادمة</p>
                  <p className="font-amiri text-xl sm:text-2xl font-bold text-quran-gold">
                    {prayerData.nextPrayerName}
                  </p>
                  {prayerData.nextPrayer.time.getDate() !== new Date().getDate() && (
                    <p className="text-[10px] text-quran-gold/60 mt-0.5">غدًا</p>
                  )}
                </div>
                <div className="text-left">
                  <p className="font-amiri text-lg sm:text-xl font-bold text-quran-ivory">
                    {prayerData.nextPrayer.time.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="font-mono text-sm text-quran-gold/90 font-bold tracking-wider">
                    {countdown || prayerData.timeToNext}
                  </p>
                </div>
              </div>
              {/* Previous prayer */}
              {prayerData.currentPrayer && (
                <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-[11px]">
                  <span className="text-quran-olive">الصلاة الماضية: {prayerData.currentPrayer.nameArabic}</span>
                  <span className="text-quran-olive">
                    {prayerData.currentPrayer.time.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
            <Link
              href="/quran"
              className="flex-1 min-h-[48px] sm:min-h-[52px] bg-gradient-to-l from-quran-gold to-quran-gold/80 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-bold text-quran-bg hover:from-quran-gold/90 hover:to-quran-gold/70 transition-all duration-300 text-center shadow-lg shadow-quran-gold/20"
            >
              احفظ القرآن
            </Link>
            <InstallPrompt variant="hero" />
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 mb-6">
        <InstallPrompt />
      </section>

      {/* Prayer Times */}
      <section className="px-4 sm:px-6 mb-8">
        <h2 className="font-amiri text-xl sm:text-2xl font-bold text-quran-ivory mb-4 sm:mb-6 px-2">
          أوقات الصلاة
        </h2>
        <PrayerCards />
      </section>

      {/* Quick Actions Grid */}
      <section className="px-4 sm:px-6 mb-8">
        <h2 className="font-amiri text-lg sm:text-xl font-bold text-quran-ivory mb-4 px-2">
          أقسام سريعة
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Link
            href="/quran"
            className="glass rounded-xl p-3 sm:p-4 text-center hover:bg-white/5 transition-all active:scale-[0.98]"
          >
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">📖</div>
            <div className="text-xs sm:text-sm text-quran-ivory-muted">احفظ القرآن</div>
          </Link>
          <Link
            href="/adhkar"
            className="glass rounded-xl p-3 sm:p-4 text-center hover:bg-white/5 transition-all active:scale-[0.98]"
          >
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">📿</div>
            <div className="text-xs sm:text-sm text-quran-ivory-muted">الأذكار بعد الصلاة</div>
          </Link>
          <Link
            href="/hadith"
            className="glass rounded-xl p-3 sm:p-4 text-center hover:bg-white/5 transition-all active:scale-[0.98]"
          >
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">📚</div>
            <div className="text-xs sm:text-sm text-quran-ivory-muted">الأربعون النووية</div>
          </Link>
          <Link
            href="/more"
            className="glass rounded-xl p-3 sm:p-4 text-center hover:bg-white/5 transition-all active:scale-[0.98]"
          >
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">⋯</div>
            <div className="text-xs sm:text-sm text-quran-ivory-muted">المزيد</div>
          </Link>
        </div>
      </section>

      <section className="px-4 sm:px-6 mb-8">
        <QuickPrepare />
      </section>

      <BottomNav />
    </main>
  );
}
