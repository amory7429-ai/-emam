'use client';

import Link from 'next/link';

export function QuickPrepare() {
  return (
    <div className="glass-strong rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-quran-gold/60 to-transparent" />
      <div className="text-center">
        <h2 className="font-amiri text-2xl font-bold text-quran-ivory mb-2">
          مش محضّر؟
        </h2>
        <p className="text-quran-ivory-muted text-sm mb-6">
          اختَر جزءًا وسنجهز لك مشهدين للصلاة
        </p>
        <Link
          href="/quick"
          className="inline-flex items-center gap-2 bg-quran-emerald hover:bg-quran-emerald-light text-quran-ivory font-semibold rounded-xl px-8 py-4 text-lg transition-all duration-300 active:scale-95"
        >
          <span>🕌</span>
          <span>حضّر لي مشهدين</span>
        </Link>
      </div>
    </div>
  );
}
