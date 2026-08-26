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

const JUZ_START: Record<number, number> = {
  1:1, 2:2, 3:2, 4:3, 5:4, 6:4, 7:5, 8:6, 9:7, 10:8,
  11:9, 12:10, 13:12, 14:15, 15:17, 16:18, 17:21, 18:23,
  19:25, 20:27, 21:29, 22:30, 23:33, 24:35, 25:39, 26:41,
  27:46, 28:51, 29:58, 30:67,
};

const JUZ_END: Record<number, number> = {
  1:2, 2:2, 3:2, 4:3, 5:4, 6:5, 7:6, 8:7, 9:8, 10:9,
  11:11, 12:12, 13:14, 14:16, 15:17, 16:20, 17:22, 18:24,
  19:26, 20:28, 21:29, 22:32, 23:34, 24:38, 25:40, 26:45,
  27:50, 28:57, 29:66, 30:114,
};

export default function QuickPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-quran-ivory-muted">جارٍ التحميل...</p></div>}>
      <QuickPageInner />
    </Suspense>
  );
}

function QuickPageInner() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'choose-juz' | 'result'>('choose-juz');
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
    const sMeta = SURAH_META.find(s => s.id === JUZ_START[n]);
    const eMeta = SURAH_META.find(s => s.id === JUZ_END[n]);
    return { number: n, startName: sMeta?.nameArabic || '', endName: eMeta?.nameArabic || '' };
  });

  const generatePassages = (juz: number) => {
    const mk = monthKey();
    const startSurah = JUZ_START[juz];
    const endSurah = JUZ_END[juz];
    const candidates: Passage[] = [];

    for (let s = startSurah; s <= endSurah; s++) {
      const meta = SURAH_META.find(sm => sm.id === s);
      if (!meta) continue;

      const maxAyah = meta.ayahs;
      const passageLength = maxAyah <= 10 ? Math.min(5, maxAyah) : maxAyah <= 30 ? 8 : 12;

      for (let start = 1; start <= maxAyah - passageLength + 1; start += passageLength) {
        const end = Math.min(start + passageLength - 1, maxAyah);
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

    // Sort by Mushaf order: surah number first, then ayah position
    candidates.sort((a, b) => a.surahNumber - b.surahNumber || a.ayahStart - b.ayahStart);

    // Strategy: prefer same surah, then neighboring surahs in order
    let selected1 = candidates[0];
    let selected2: Passage | null = null;

    // Try same surah first
    const sameSurah = candidates.filter(c => c.surahNumber === selected1.surahNumber && c.id !== selected1.id);
    if (sameSurah.length > 0) {
      selected2 = sameSurah[0];
    } else {
      // Find next passage in Mushaf order (later or same position)
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
                onClick={() => { setStep('choose-juz'); setMode('choose'); }}
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
