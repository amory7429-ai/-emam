'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/ui/BottomNav';
import { GlassCard } from '@/components/ui/GlassCard';
import { SURAH_META } from '@/lib/data/surahs';
import { toArabicNumber } from '@/lib/utils/arabic';
import { InstallPrompt } from '@/components/ui/InstallPrompt';
import { ReciterSelector } from '@/components/quran/ReciterSelector';
import { isQuranBootstrapped, bootstrapQuran, getCachedVerseCount } from '@/lib/db/quran-bootstrap';

type JuzMode = 'list' | 'surahs';

// Juz-Surah mapping
const JUZ_SURAHS: Record<number, number[]> = {
  1: [1, 2], 2: [2], 3: [2], 4: [2, 3], 5: [3, 4], 6: [4, 5], 7: [5], 8: [5, 6],
  9: [6, 7], 10: [7], 11: [7, 8], 12: [8, 9], 13: [9, 10], 14: [10, 11], 15: [11, 12],
  16: [12, 13], 17: [13, 14], 18: [15, 16], 19: [16, 17], 20: [17, 18], 21: [18, 19, 20],
  22: [20, 21], 23: [21, 22, 23], 24: [23, 24], 25: [24, 25], 26: [25, 26, 27],
  27: [27, 28, 29], 28: [29, 30, 31, 32, 33], 29: [33, 34, 35, 36, 37, 38, 39],
  30: [39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114],
};

export default function QuranPage() {
  const [juzMode, setJuzMode] = useState<JuzMode>('list');
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [quranSaved, setQuranSaved] = useState<boolean | null>(null);
  const [savingQuran, setSavingQuran] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ surah: 0, total: 114 });

  useEffect(() => {
    isQuranBootstrapped().then(setQuranSaved);
  }, []);

  const getJuzSurahs = (juzNum: number) => {
    const surahIds = JUZ_SURAHS[juzNum] || [];
    return surahIds.map(id => SURAH_META.find(s => s.id === id)).filter(Boolean) as typeof SURAH_META;
  };

  const juzData = Array.from({ length: 30 }, (_, i) => {
    const juzNum = i + 1;
    const surahs = getJuzSurahs(juzNum);
    return {
      number: juzNum,
      surahs: surahs.map(s => s.nameArabic).join('، '),
    };
  });

  const handleJuzSelect = (juzNum: number) => {
    setSelectedJuz(juzNum);
    setJuzMode('surahs');
  };

  const handleBackToJuzList = () => {
    setJuzMode('list');
    setSelectedJuz(null);
  };

  const handleSaveQuran = async () => {
    setSavingQuran(true);
    try {
      await bootstrapQuran((surah, total) => {
        setSaveProgress({ surah, total });
      });
      setQuranSaved(true);
    } catch {
      // Silent catch
    } finally {
      setSavingQuran(false);
    }
  };

  return (
    <main className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-amiri text-xl font-bold text-quran-ivory">
              احفظ القرآن
            </h1>
            <InstallPrompt />
          </div>
          <p className="text-sm text-quran-ivory-muted mb-3">
            تصفّح القرآن حسب الأجزاء
          </p>

          {/* Reciter Selector */}
          <div className="mb-3">
            <ReciterSelector showLabel={true} />
          </div>

          {/* Offline Save */}
          {quranSaved === false && !savingQuran && (
            <button
              onClick={handleSaveQuran}
              className="w-full min-h-[44px] bg-quran-gold/10 border border-quran-gold/20 rounded-xl py-2.5 text-sm text-quran-gold hover:bg-quran-gold/20 transition-all mb-3"
            >
              💾 تنزيل نص القرآن للعمل بدون إنترنت
            </button>
          )}
          {savingQuran && (
            <div className="mb-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-quran-ivory-muted">جارٍ تنزيل القرآن...</span>
                <span className="text-quran-gold">{saveProgress.surah}/{saveProgress.total}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-quran-gold rounded-full transition-all"
                  style={{ width: `${(saveProgress.surah / saveProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
          {quranSaved === true && (
            <div className="flex items-center gap-2 text-xs text-quran-emerald-light mb-3 px-2">
              <span>✓</span>
              <span>القرآن متاح للعمل بدون إنترنت</span>
            </div>
          )}

          {/* Search */}
          {juzMode === 'list' && (
            <div className="text-xs text-quran-olive text-center">
              اختر الجزء لعرض سوره
            </div>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Juz List */}
        {juzMode === 'list' && (
          <div className="space-y-2">
            {juzData.map((juz) => (
              <GlassCard
                key={juz.number}
                onClick={() => handleJuzSelect(juz.number)}
                className="p-4 hover:bg-white/5 transition-all cursor-pointer"
              >
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
                  <div className="text-quran-olive text-sm">←</div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Surahs in Juz */}
        {juzMode === 'surahs' && selectedJuz && (
          <div className="animate-slide-up">
            <button
              onClick={handleBackToJuzList}
              className="mb-4 text-sm text-quran-ivory-muted hover:text-quran-ivory flex items-center gap-1"
            >
              ← الأجزاء
            </button>
            <div className="space-y-2">
              {getJuzSurahs(selectedJuz).map((surah) => (
                <Link
                  key={surah.id}
                  href={`/quran/${surah.id}`}
                  className="block p-4 rounded-xl glass hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-quran-emerald/50 flex items-center justify-center text-sm font-bold text-quran-gold">
                      {surah.id}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-amiri text-lg text-quran-ivory">
                          {surah.nameArabic}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          surah.revelation === 'مكي'
                            ? 'text-quran-gold bg-quran-gold/10'
                            : 'text-quran-emerald-light bg-quran-emerald/20'
                        }`}>
                          {surah.revelation}
                        </span>
                      </div>
                      <div className="text-xs text-quran-ivory-muted">
                        {surah.nameEnglish} — {surah.ayahs} آية
                      </div>
                    </div>
                    <div className="text-quran-olive text-sm">←</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
