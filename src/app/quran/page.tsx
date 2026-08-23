'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/ui/BottomNav';
import { GlassCard } from '@/components/ui/GlassCard';
import { SURAH_META } from '@/lib/data/surahs';

type Tab = 'juz' | 'surah';

export default function QuranPage() {
  const [tab, setTab] = useState<Tab>('surah');
  const [search, setSearch] = useState('');

  const filteredSurahs = SURAH_META.filter(
    (s) =>
      s.nameArabic.includes(search) ||
      s.nameEnglish.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toString() === search
  );

  const juzData = Array.from({ length: 30 }, (_, i) => {
    const juzNum = i + 1;
    const surahs = SURAH_META.filter((s) => s.juzStart === juzNum);
    return {
      number: juzNum,
      surahs: surahs.map((s) => s.nameArabic).join('، '),
    };
  });

  return (
    <main className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="font-amiri text-xl font-bold text-quran-ivory mb-3">
            القرآن الكريم
          </h1>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setTab('surah')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === 'surah'
                  ? 'bg-quran-emerald text-quran-gold'
                  : 'glass text-quran-ivory-muted'
              }`}
            >
              السور
            </button>
            <button
              onClick={() => setTab('juz')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === 'juz'
                  ? 'bg-quran-emerald text-quran-gold'
                  : 'glass text-quran-ivory-muted'
              }`}
            >
              الأجزاء
            </button>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن سورة..."
            className="w-full glass rounded-xl px-4 py-2.5 text-sm text-quran-ivory placeholder:text-quran-olive outline-none focus:ring-1 focus:ring-quran-gold/30"
          />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        {tab === 'surah' && (
          <div className="space-y-2">
            {filteredSurahs.map((surah) => (
              <Link key={surah.id} href={`/quran/${surah.id}`}>
                <GlassCard className="p-4 flex items-center gap-4 hover:bg-white/5 transition-all">
                  <div className="w-10 h-10 rounded-full bg-quran-emerald/50 flex items-center justify-center text-sm font-bold text-quran-gold">
                    {surah.id}
                  </div>
                  <div className="flex-1">
                    <div className="font-amiri text-lg text-quran-ivory">
                      {surah.nameArabic}
                    </div>
                    <div className="text-xs text-quran-ivory-muted">
                      {surah.nameEnglish} — {surah.ayahs} آية — {surah.revelation}
                    </div>
                  </div>
                  <div className="text-quran-olive text-sm">←</div>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}

        {tab === 'juz' && (
          <div className="space-y-2">
            {juzData.map((juz) => (
              <GlassCard key={juz.number} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-quran-emerald/50 flex items-center justify-center text-sm font-bold text-quran-gold">
                    {juz.number}
                  </div>
                  <div className="flex-1">
                    <div className="font-amiri text-lg text-quran-ivory">
                      الجزء {toArabicNumber(juz.number)}
                    </div>
                    <div className="text-xs text-quran-ivory-muted">
                      {juz.surahs}
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

function toArabicNumber(num: number): string {
  const arabicNums = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num
    .toString()
    .split('')
    .map((d) => arabicNums[parseInt(d)])
    .join('');
}
