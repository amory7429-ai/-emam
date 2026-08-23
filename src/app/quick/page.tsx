'use client';

import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { GlassCard } from '@/components/ui/GlassCard';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { SURAH_META } from '@/lib/data/surahs';
import { getAlafasyAudioUrl } from '@/lib/quran/quran-foundation';
import { useUsageStore } from '@/stores/usage-store';

interface Passage {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahStart: number;
  ayahEnd: number;
  text: string;
  juz: number;
}

export default function QuickPage() {
  const [step, setStep] = useState<'choose-juz' | 'loading' | 'result'>('choose-juz');
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [rakah1, setRakah1] = useState<Passage | null>(null);
  const [rakah2, setRakah2] = useState<Passage | null>(null);
  const [usedThisMonth, setUsedThisMonth] = useState(0);
  const { records, addRecord, isUsedThisMonth, load } = useUsageStore();

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const monthKey = new Date().toISOString().slice(0, 7);
    setUsedThisMonth(records.filter((r) => r.monthKey === monthKey).length);
  }, [records]);

  const getCurrentMonthKey = () => new Date().toISOString().slice(0, 7);

  const juzData = Array.from({ length: 30 }, (_, i) => {
    const juzNum = i + 1;
    const startSurah = getJuzStartSurah(juzNum);
    const endSurah = getJuzEndSurah(juzNum);
    const startMeta = SURAH_META.find((s) => s.id === startSurah);
    const endMeta = SURAH_META.find((s) => s.id === endSurah);
    return {
      number: juzNum,
      startName: startMeta?.nameArabic || '',
      endName: endMeta?.nameArabic || '',
    };
  });

  function getJuzStartSurah(juz: number): number {
    const map: Record<number, number> = {
      1: 1, 2: 2, 3: 2, 4: 3, 5: 4, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8,
      11: 9, 12: 10, 13: 12, 14: 15, 15: 17, 16: 18, 17: 21, 18: 23,
      19: 25, 20: 27, 21: 29, 22: 30, 23: 33, 24: 35, 25: 39, 26: 41,
      27: 46, 28: 51, 29: 58, 30: 67,
    };
    return map[juz] || 1;
  }

  function getJuzEndSurah(juz: number): number {
    const map: Record<number, number> = {
      1: 2, 2: 2, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7, 9: 8, 10: 9,
      11: 11, 12: 12, 13: 14, 14: 16, 15: 17, 16: 20, 17: 22, 18: 24,
      19: 26, 20: 28, 21: 29, 22: 32, 23: 34, 24: 38, 25: 40, 26: 45,
      27: 50, 28: 57, 29: 66, 30: 114,
    };
    return map[juz] || 114;
  }

  const generatePassages = async (juz: number) => {
    setStep('loading');
    const monthKey = getCurrentMonthKey();

    try {
      const startSurah = getJuzStartSurah(juz);
      const endSurah = getJuzEndSurah(juz);

      const candidates: Passage[] = [];
      const monthKey = getCurrentMonthKey();

      for (let s = startSurah; s <= endSurah; s++) {
        const meta = SURAH_META.find((sm) => sm.id === s);
        if (!meta) continue;

        const maxAyah = meta.ayahs;
        const passageLength = Math.min(8, maxAyah);

        for (let start = 1; start <= maxAyah - passageLength + 1; start += passageLength) {
          const end = Math.min(start + passageLength - 1, maxAyah);
          const passageId = `${s}:${start}-${end}`;

          if (!isUsedThisMonth(monthKey, passageId)) {
            candidates.push({
              id: passageId,
              surahNumber: s,
              surahName: meta.nameArabic,
              ayahStart: start,
              ayahEnd: end,
              text: `${meta.nameArabic} ${start}-${end}`,
              juz,
            });
          }
        }
      }

      if (candidates.length < 2) {
        alert('اكتملت اختيارات هذا الجزء لهذا الشهر. اختر جزءًا آخر.');
        setStep('choose-juz');
        return;
      }

      const shuffled = candidates.sort(() => Math.random() - 0.5);
      const selected1 = shuffled[0];
      const selected2 = shuffled.find((c) => c.id !== selected1.id) || shuffled[1];

      setRakah1(selected1);
      setRakah2(selected2);

      const now = new Date();
      addRecord({ monthKey, date: now.toISOString(), prayer: 'quick', passageId: selected1.id, rakah: 1 });
      addRecord({ monthKey, date: now.toISOString(), prayer: 'quick', passageId: selected2.id, rakah: 2 });

      setStep('result');
    } catch (err) {
      console.error(err);
      setStep('choose-juz');
    }
  };

  const formatAyahRange = (p: Passage) => {
    return `${p.surahName} (${p.ayahStart}-${p.ayahEnd})`;
  };

  return (
    <main className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="font-amiri text-xl font-bold text-quran-ivory">
            مش محضّر؟
          </h1>
          <p className="text-sm text-quran-ivory-muted">
            اختَر جزءًا وسنجهز لك مشهدين للصلاة
          </p>
          {usedThisMonth > 0 && (
            <p className="text-xs text-quran-olive mt-1">
              هذا الشهر: {usedThisMonth} مقاطع مستخدمة
            </p>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {step === 'choose-juz' && (
          <div className="animate-fade-in">
            <h2 className="font-amiri text-lg font-bold text-quran-ivory mb-4">
              اختر الجزء
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {juzData.map((juz) => (
                <GlassCard
                  key={juz.number}
                  onClick={() => {
                    setSelectedJuz(juz.number);
                    generatePassages(juz.number);
                  }}
                  className="p-3 text-center"
                >
                  <div className="font-amiri text-lg font-bold text-quran-gold">
                    الجزء {toArabicNumber(juz.number)}
                  </div>
                  <div className="text-[10px] text-quran-ivory-muted mt-1">
                    {juz.startName} — {juz.endName}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-4xl mb-4 animate-pulse">🕌</div>
            <p className="text-quran-ivory-muted">جارٍ التحضير...</p>
          </div>
        )}

        {step === 'result' && rakah1 && rakah2 && (
          <div className="space-y-4 animate-slide-up">
            <div className="text-center mb-6">
              <h2 className="font-amiri text-lg font-bold text-quran-gold">
                الجزء {toArabicNumber(selectedJuz || 1)}
              </h2>
            </div>

            <GlassCard strong className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-quran-emerald text-quran-gold text-xs font-bold px-3 py-1 rounded-full">
                  الركعة الأولى
                </span>
              </div>
              <h3 className="font-amiri text-xl font-bold text-quran-ivory mb-2">
                {formatAyahRange(rakah1)}
              </h3>
              <p className="text-sm text-quran-ivory-muted mb-4">
                الجزء {toArabicNumber(rakah1.juz)}
              </p>
              <AudioPlayer
                url={getAlafasyAudioUrl(`${rakah1.ayahStart}`)}
                label="تشغيل"
              />
            </GlassCard>

            <GlassCard strong className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-quran-emerald text-quran-gold text-xs font-bold px-3 py-1 rounded-full">
                  الركعة الثانية
                </span>
              </div>
              <h3 className="font-amiri text-xl font-bold text-quran-ivory mb-2">
                {formatAyahRange(rakah2)}
              </h3>
              <p className="text-sm text-quran-ivory-muted mb-4">
                الجزء {toArabicNumber(rakah2.juz)}
              </p>
              <AudioPlayer
                url={getAlafasyAudioUrl(`${rakah2.ayahStart}`)}
                label="تشغيل"
              />
            </GlassCard>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('choose-juz')}
                className="flex-1 glass rounded-xl py-3 text-quran-ivory-muted hover:text-quran-ivory transition-colors text-sm"
              >
                اختيار جزء آخر
              </button>
              <button
                onClick={() => selectedJuz && generatePassages(selectedJuz)}
                className="flex-1 bg-quran-emerald rounded-xl py-3 text-quran-ivory font-semibold hover:bg-quran-emerald-light transition-colors text-sm"
              >
                اختيار آخر
              </button>
            </div>
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
