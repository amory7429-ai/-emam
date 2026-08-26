'use client';

import { useState, useEffect } from 'react';
import { getPrayerTimes, formatTime, type PrayerTime } from '@/lib/prayer/prayer-times';
import Link from 'next/link';

export function PrayerCards() {
  const [data, setData] = useState<{
    times: PrayerTime[];
    nextPrayerName: string;
    timeToNext: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPrayerTimes().then((result) => {
      if (!cancelled && result) {
        setData({
          times: result.times.filter((p) => p.rakahs > 0),
          nextPrayerName: result.nextPrayerName,
          timeToNext: result.timeToNext,
        });
      }
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-5 gap-2 md:gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="glass rounded-xl p-3 md:p-4 text-center animate-pulse">
            <div className="h-4 bg-white/10 rounded w-10 mx-auto mb-1" />
            <div className="h-3 bg-white/5 rounded w-8 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const activePrayers = data.times.filter((p) => p.rakahs > 0);

  return (
    <div>
      <div className="grid grid-cols-5 gap-2 md:gap-3">
        {activePrayers.map((prayer) => {
          const isNext = prayer.nameArabic === data.nextPrayerName;
          return (
            <Link
              key={prayer.name}
              href={`/quick?prayer=${prayer.name.toLowerCase()}`}
              className={`rounded-xl p-3 md:p-4 text-center transition-all duration-200 ${
                isNext
                  ? 'bg-quran-gold/15 border border-quran-gold/30 text-quran-gold'
                  : 'glass hover:bg-white/8 active:scale-95'
              }`}
            >
              <div className={`font-amiri text-base md:text-lg font-bold mb-1 ${isNext ? 'text-quran-gold' : 'text-quran-ivory'}`}>
                {prayer.nameArabic}
              </div>
              <div className={`text-[10px] md:text-xs ${isNext ? 'text-quran-gold/80' : 'text-quran-ivory-muted'}`}>
                {formatTime(prayer.time)}
              </div>
              {isNext && (
                <div className="text-[9px] text-quran-gold/70 mt-1">
                  {data.timeToNext}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
