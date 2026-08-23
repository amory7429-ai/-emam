'use client';

import Link from 'next/link';

const prayers = [
  { id: 'fajr', name: 'الفجر', time: ' sunrise', rakahs: 2, color: 'from-blue-900/30 to-indigo-900/20' },
  { id: 'dhuhr', name: 'الظهر', time: 'midday', rakahs: 4, color: 'from-amber-900/30 to-orange-900/20' },
  { id: 'asr', name: 'العصر', time: 'afternoon', rakahs: 4, color: 'from-orange-900/30 to-red-900/20' },
  { id: 'maghrib', name: 'المغرب', time: 'sunset', rakahs: 3, color: 'from-red-900/30 to-purple-900/20' },
  { id: 'isha', name: 'العشاء', time: 'night', rakahs: 4, color: 'from-purple-900/30 to-slate-900/20' },
];

export function PrayerCards() {
  return (
    <div className="grid grid-cols-5 gap-2 md:gap-3">
      {prayers.map((prayer) => (
        <Link
          key={prayer.id}
          href={`/quick?prayer=${prayer.id}`}
          className={`glass rounded-xl p-3 md:p-4 text-center hover:bg-white/8 active:scale-95 transition-all duration-200 bg-gradient-to-b ${prayer.color}`}
        >
          <div className="font-amiri text-base md:text-lg font-bold text-quran-ivory mb-1">
            {prayer.name}
          </div>
          <div className="text-[10px] md:text-xs text-quran-ivory-muted">
            {prayer.rakahs} ركعات
          </div>
        </Link>
      ))}
    </div>
  );
}
