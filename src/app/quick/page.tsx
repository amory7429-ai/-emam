'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';
import { GlassCard } from '@/components/ui/GlassCard';
import { PassagePlayer } from '@/components/quran/PassagePlayer';
import { SequentialPlayer } from '@/components/quran/SequentialPlayer';
import { SURAH_META } from '@/lib/data/surahs';
import { useUsageStore } from '@/stores/usage-store';
import { toArabicNumber } from '@/lib/utils/arabic';

interface Passage {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahStart: number;
  ayahEnd: number;
  juz: number;
}

// Each juz: [startSurahId, startAyah, endSurahId, endAyah]
const JUZ_RANGES: Record<number, [number, number, number, number]> = {
  1:  [1, 1, 2, 141],
  2:  [2, 142, 2, 252],
  3:  [2, 253, 3, 92],
  4:  [3, 93, 4, 23],
  5:  [4, 24, 4, 147],
  6:  [4, 148, 5, 81],
  7:  [5, 82, 6, 110],
  8:  [6, 111, 7, 87],
  9:  [7, 88, 8, 75],
  10: [8, 1, 9, 92],
  11: [9, 93, 11, 5],
  12: [11, 6, 12, 52],
  13: [12, 53, 14, 52],
  14: [15, 1, 16, 128],
  15: [17, 1, 18, 74],
  16: [18, 75, 20, 135],
  17: [21, 1, 22, 78],
  18: [23, 1, 25, 20],
  19: [25, 21, 27, 55],
  20: [27, 56, 29, 45],
  21: [29, 46, 33, 30],
  22: [33, 31, 36, 27],
  23: [36, 28, 39, 31],
  24: [39, 32, 41, 46],
  25: [41, 47, 45, 37],
  26: [46, 1, 51, 60],
  27: [52, 1, 57, 29],
  28: [58, 1, 66, 12],
  29: [67, 1, 77, 50],
  30: [78, 1, 114, 6],
};

const LEVELS = [
  { id: 'short' as const, name: 'تحضير قصير', desc: 'مختصر: 5 آيات', emoji: '⚡' },
  { id: 'medium' as const, name: 'تحضير متوسط', desc: 'متوسط: 8 آيات', emoji: '📖' },
  { id: 'long' as const, name: 'تحضير طويل', desc: 'طويل: 12 آيات', emoji: '📚' },
];

export default function QuickPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-quran-ivory-muted">جارٍ التحميل...</p></div>}>
      <QuickPageInner />
    </Suspense>
  );
}

function QuickPageInner() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'choose-level' | 'choose-juz' | 'result'>('choose-level');
  const [preparationLevel, setPreparationLevel] = useState<'short' | 'medium' | 'long'>('medium');
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [rakah1, setRakah1] = useState<Passage | null>(null);
  const [rakah2, setRakah2] = useState<Passage | null>(null);
  const [mode, setMode] = useState<'choose' | 'reading' | 'listening'>('choose');
  const [toast, setToast] = useState<string | null>(null);
  const { records, addRecord, isUsedThisMonth, load } = useUsageStore();

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const juzParam = searchParams.get('juz');
    if (juzParam) {
      const juzNum = parseInt(juzParam);
      if (juzNum >= 1 && juzNum <= 30) {
        setSelectedJuz(juzNum);
        generatePassages(juzNum);
      }
    }
  }, []);

  const monthKey = () => new Date().toISOString().slice(0, 7);
  const usedThisMonth = records.filter(r => r.monthKey === monthKey()).length;

  const juzData = Array.from({ length: 30 }, (_, i) => {
    const n = i + 1;
    const range = JUZ_RANGES[n];
    const sMeta = SURAH_META.find(s => s.id === range[0]);
    const eMeta = SURAH_META.find(s => s.id === range[2]);
    return { number: n, startName: sMeta?.nameArabic || '', endName: eMeta?.nameArabic || '' };
  });

  const generatePassages = (juz: number) => {
    const mk = monthKey();
    const [startSurah, startAyah, endSurah, endAyah] = JUZ_RANGES[juz];
    const candidates: Passage[] = [];

    const passageLengthMap = { short: 5, medium: 8, long: 12 };
    const passageLength = passageLengthMap[preparationLevel];

    for (let s = startSurah; s <= endSurah; s++) {
      const meta = SURAH_META.find(sm => sm.id === s);
      if (!meta) continue;

      const maxAyah = meta.ayahs;
      const ayahFrom = s === startSurah ? startAyah : 1;
      const ayahTo = s === endSurah ? endAyah : maxAyah;

      for (let start = ayahFrom; start <= ayahTo; start += passageLength) {
        const end = Math.min(start + passageLength - 1, ayahTo);
        const passageId = `${s}:${start}-${end}`;
        if (!isUsedThisMonth(mk, passageId)) {
          candidates.push({
            id: passageId,
            surahNumber: s,
            surahName: meta.nameArabic,
            ayahStart: start,
            ayahEnd: end,
            juz,
          });
        }
      }
    }

    if (candidates.length < 2) {
      setToast('اكتملت اختيارات هذا الجزء لهذا الشهر. اختر جزءًا آخر.');
      setTimeout(() => setToast(null), 4000);
      setStep('choose-juz');
      return;
    }

    candidates.sort((a, b) => a.surahNumber - b.surahNumber || a.ayahStart - b.ayahStart);

    let selected1 = candidates[0];
    let selected2: Passage | null = null;

    const sameSurah = candidates.filter(c => c.surahNumber === selected1.surahNumber && c.id !== selected1.id);
    if (sameSurah.length > 0) {
      selected2 = sameSurah[0];
    } else {
      const laterCandidates = candidates.filter(c => c.id !== selected1.id);
      if (laterCandidates.length > 0) {
        selected2 = laterCandidates[0];
      }
    }

    if (!selected2) {
      selected2 = candidates[1];
    }

    setRakah1(selected1);
    setRakah2(selected2);
    setMode('choose');

    const now = new Date().toISOString();
    addRecord({ monthKey: mk, date: now, prayer: 'quick', passageId: selected1.id, rakah: 1 });
    addRecord({ monthKey: mk, date: now, prayer: 'quick', passageId: selected2.id, rakah: 2 });

    setStep('result');
  };

  return (
    <main className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="font-amiri text-xl font-bold text-quran-ivory">
            مش محضّر؟
          </h1>
          <p className="text-sm text-quran-ivory-muted">
            اختَر مستوى التحضير ثم الجزء وسنجهز لك مشهدين للصلاة
          </p>
          {usedThisMonth > 0 && (
            <p className="text-xs text-quran-olive mt-1">
              هذا الشهر: {usedThisMonth} مقاطع مستخدمة
            </p>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {step === 'choose-level' && (
          <div className="animate-fade-in">
            <h2 className="font-amiri text-lg font-bold text-quran-ivory mb-4">
              اختر مستوى التحضير
            </h2>
            <div className="space-y-3">
              {LEVELS.map(level => (
                <GlassCard
                  key={level.id}
                  onClick={() => { setPreparationLevel(level.id); setStep('choose-juz'); }}
                  className={`p-4 cursor-pointer ${preparationLevel === level.id ? 'ring-2 ring-quran-gold' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{level.emoji}</span>
                    <div className="flex-1">
                      <div className="font-amiri text-lg font-bold text-quran-ivory">
                        {level.name}
                      </div>
                      <div className="text-sm text-quran-ivory-muted">
                        {level.desc}
                      </div>
                    </div>
                    {preparationLevel === level.id && (
                      <span className="text-quran-gold text-xl">✓</span>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {step === 'choose-juz' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setStep('choose-level')}
              className="mb-4 text-sm text-quran-ivory-muted hover:text-quran-ivory"
            >
              ← تغيير مستوى التحضير
            </button>
            <h2 className="font-amiri text-lg font-bold text-quran-ivory mb-4">
              اختر الجزء
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {juzData.map(juz => (
                <GlassCard
                  key={juz.number}
                  onClick={() => { setSelectedJuz(juz.number); generatePassages(juz.number); }}
                  className="p-3 text-center cursor-pointer"
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

        {step === 'result' && rakah1 && rakah2 && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center mb-2">
              <h2 className="font-amiri text-lg font-bold text-quran-gold">
                الجزء {toArabicNumber(selectedJuz || 1)}
              </h2>
            </div>

            {mode === 'choose' && (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-quran-emerald text-quran-gold text-xs font-bold px-3 py-1 rounded-full">
                      الركعة الأولى
                    </span>
                  </div>
                  <GlassCard strong className="p-4">
                    <div className="font-amiri text-lg font-bold text-quran-ivory mb-1">
                      سورة {rakah1.surahName}
                    </div>
                    <p className="text-sm text-quran-ivory-muted mb-4">
                      الآيات {toArabicNumber(rakah1.ayahStart)} — {toArabicNumber(rakah1.ayahEnd)}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMode('reading')}
                        className="flex-1 min-h-[44px] glass rounded-xl py-3 text-sm font-medium text-quran-ivory hover:bg-white/5 transition-all"
                      >
                        📖 قراءة المقطع
                      </button>
                      <button
                        onClick={() => setMode('listening')}
                        className="flex-1 min-h-[44px] bg-quran-emerald rounded-xl py-3 text-sm font-medium text-quran-gold hover:bg-quran-emerald-light transition-all"
                      >
                        🔊 استماع للمقطع
                      </button>
                    </div>
                  </GlassCard>
                </div>

                <div className="border-t border-white/5 pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-quran-emerald text-quran-gold text-xs font-bold px-3 py-1 rounded-full">
                      الركعة الثانية
                    </span>
                  </div>
                  <GlassCard strong className="p-4">
                    <div className="font-amiri text-lg font-bold text-quran-ivory mb-1">
                      سورة {rakah2.surahName}
                    </div>
                    <p className="text-sm text-quran-ivory-muted mb-4">
                      الآيات {toArabicNumber(rakah2.ayahStart)} — {toArabicNumber(rakah2.ayahEnd)}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMode('reading')}
                        className="flex-1 min-h-[44px] glass rounded-xl py-3 text-sm font-medium text-quran-ivory hover:bg-white/5 transition-all"
                      >
                        📖 قراءة المقطع
                      </button>
                      <button
                        onClick={() => setMode('listening')}
                        className="flex-1 min-h-[44px] bg-quran-emerald rounded-xl py-3 text-sm font-medium text-quran-gold hover:bg-quran-emerald-light transition-all"
                      >
                        🔊 استماع للمقطع
                      </button>
                    </div>
                  </GlassCard>
                </div>
              </>
            )}

{mode === 'reading' && (
              <div className="animate-slide-up">
                <button
                  onClick={() => setMode('choose')}
                  className="mb-4 text-sm text-quran-ivory-muted hover:text-quran-ivory"
                >
                  ← العودة لاختيار الطريقة
                </button>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-quran-emerald text-quran-gold text-xs font-bold px-3 py-1 rounded-full">
                        الركعة الأولى
                      </span>
                    </div>
                    <PassagePlayer
                      fromKey={`${rakah1.surahNumber}:${rakah1.ayahStart}`}
                      toKey={`${rakah1.surahNumber}:${rakah1.ayahEnd}`}
                      surahName={rakah1.surahName}
                      autoPlay={false}
                      disableAutoScroll={true}
                    />
                  </div>
                  <div className="border-t border-white/5 pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-quran-emerald text-quran-gold text-xs font-bold px-3 py-1 rounded-full">
                        الركعة الثانية
                      </span>
                    </div>
                    <PassagePlayer
                      fromKey={`${rakah2.surahNumber}:${rakah2.ayahStart}`}
                      toKey={`${rakah2.surahNumber}:${rakah2.ayahEnd}`}
                      surahName={rakah2.surahName}
                      autoPlay={false}
                      disableAutoScroll={true}
                    />
                  </div>
                </div>
              </div>
            )}

{mode === 'listening' && rakah1 && rakah2 && (
              <div className="animate-slide-up">
                <button
                  onClick={() => setMode('choose')}
                  className="mb-4 text-sm text-quran-ivory-muted hover:text-quran-ivory"
                >
                  ← العودة لاختيار الطريقة
                </button>
                <SequentialPlayer
                  rakah1={{ surahNumber: rakah1.surahNumber, surahName: rakah1.surahName, ayahStart: rakah1.ayahStart, ayahEnd: rakah1.ayahEnd }}
                  rakah2={{ surahNumber: rakah2.surahNumber, surahName: rakah2.surahName, ayahStart: rakah2.ayahStart, ayahEnd: rakah2.ayahEnd }}
                  autoPlay={true}
                />
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setStep('choose-level'); setMode('choose'); }}
                className="flex-1 glass rounded-xl py-3 text-quran-ivory-muted hover:text-quran-ivory transition-colors text-sm"
              >
                اختيار جزء آخر
              </button>
              <button
                onClick={() => { if (selectedJuz) generatePassages(selectedJuz); setMode('choose'); }}
                className="flex-1 bg-quran-emerald rounded-xl py-3 text-quran-ivory font-semibold hover:bg-quran-emerald-light transition-colors text-sm"
              >
                اختيار آخر
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-xl px-5 py-3 text-sm text-quran-ivory shadow-lg border border-white/10 animate-slide-up">
          {toast}
        </div>
      )}

      <BottomNav />
    </main>
  );
}
