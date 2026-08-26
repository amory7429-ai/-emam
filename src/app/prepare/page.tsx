'use client';

import { useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { GlassCard } from '@/components/ui/GlassCard';
import { PassagePlayer } from '@/components/quran/PassagePlayer';
import { SURAH_META } from '@/lib/data/surahs';
import { toArabicNumber } from '@/lib/utils/arabic';

const JUZ_SURAH_MAP: Record<number, number[]> = {
  1:[1], 2:[2], 3:[2], 4:[3], 5:[4], 6:[4,5], 7:[5,6], 8:[6,7], 9:[7,8], 10:[8,9],
  11:[9,10,11], 12:[10,11,12], 13:[12,13,14], 14:[15,16], 15:[17], 16:[18,19,20],
  17:[21,22], 18:[23,24,25], 19:[25,26,27], 20:[27,28], 21:[29], 22:[30,31,32],
  23:[33,34], 24:[35,36,37,38], 25:[39,40], 26:[41,42,43,44,45], 27:[46,47,48,49,50],
  28:[51,52,53,54,55,56,57], 29:[58,59,60,61,62,63,64,65,66], 30:[67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114],
};

interface GeneratedPassage {
  surahNumber: number;
  surahName: string;
  startAyah: number;
  endAyah: number;
}

export default function PreparePage() {
  const [prayer, setPrayer] = useState('fajr');
  const [juz, setJuz] = useState<number | null>(null);
  const [surah, setSurah] = useState<number | null>(null);
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [result, setResult] = useState<{ rakah1: GeneratedPassage; rakah2: GeneratedPassage } | null>(null);

  const prayers = [
    { id: 'fajr', name: 'الفجر' },
    { id: 'dhuhr', name: 'الظهر' },
    { id: 'asr', name: 'العصر' },
    { id: 'maghrib', name: 'المغرب' },
    { id: 'isha', name: 'العشاء' },
  ];

  const lengths = [
    { id: 'short' as const, label: 'قصير', desc: '3-5 آيات' },
    { id: 'medium' as const, label: 'متوسط', desc: '7-12 آية' },
    { id: 'long' as const, label: 'طويل', desc: '15+ آية' },
  ];

  const filteredSurahs = juz
    ? SURAH_META.filter(s => (JUZ_SURAH_MAP[juz] || []).includes(s.id))
    : SURAH_META;

  const handleGenerate = () => {
    const targetSurah = surah || (juz ? (JUZ_SURAH_MAP[juz] || [1])[0] : 1);
    const meta = SURAH_META.find(s => s.id === targetSurah);
    if (!meta) return;

    const passLen = length === 'short' ? 4 : length === 'medium' ? 8 : 15;
    const maxStart = Math.max(1, meta.ayahs - passLen * 2);

    const r1Start = Math.floor(Math.random() * (maxStart - 1)) + 1;
    const r1End = Math.min(r1Start + passLen - 1, meta.ayahs);

    const r2Start = Math.min(r1End + 2, Math.max(1, meta.ayahs - passLen + 1));
    const r2End = Math.min(r2Start + passLen - 1, meta.ayahs);

    setResult({
      rakah1: { surahNumber: targetSurah, surahName: meta.nameArabic, startAyah: r1Start, endAyah: r1End },
      rakah2: { surahNumber: targetSurah, surahName: meta.nameArabic, startAyah: r2Start, endAyah: r2End },
    });
  };

  return (
    <main className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="font-amiri text-xl font-bold text-quran-ivory">
            تحضير الإمام
          </h1>
          <p className="text-sm text-quran-ivory-muted mt-1">
            اختيارات مخصصة حسب الصلاة والجزء والمدة
          </p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-quran-gold mb-3">الصلاة</h3>
          <div className="grid grid-cols-5 gap-2">
            {prayers.map(p => (
              <button
                key={p.id}
                onClick={() => setPrayer(p.id)}
                className={`py-2 rounded-lg text-sm font-medium transition-all ${
                  prayer === p.id
                    ? 'bg-quran-emerald text-quran-gold'
                    : 'glass text-quran-ivory-muted hover:bg-white/5'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-quran-gold mb-3">الجزء (اختياري)</h3>
          <div className="grid grid-cols-6 gap-1.5 max-h-32 overflow-y-auto scrollbar-thin">
            {Array.from({ length: 30 }, (_, i) => (
              <button
                key={i}
                onClick={() => { setJuz(juz === i + 1 ? null : i + 1); setSurah(null); }}
                className={`py-1.5 rounded text-xs font-medium transition-all ${
                  juz === i + 1
                    ? 'bg-quran-emerald text-quran-gold'
                    : 'glass text-quran-ivory-muted hover:bg-white/5'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-quran-gold mb-3">المدة</h3>
          <div className="grid grid-cols-3 gap-2">
            {lengths.map(l => (
              <button
                key={l.id}
                onClick={() => setLength(l.id)}
                className={`py-3 rounded-lg text-center transition-all ${
                  length === l.id
                    ? 'bg-quran-emerald text-quran-gold'
                    : 'glass text-quran-ivory-muted hover:bg-white/5'
                }`}
              >
                <div className="text-sm font-bold">{l.label}</div>
                <div className="text-[10px] opacity-60">{l.desc}</div>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-quran-gold mb-3">السورة (اختياري)</h3>
          <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto scrollbar-thin">
            {filteredSurahs.map(s => (
              <button
                key={s.id}
                onClick={() => setSurah(surah === s.id ? null : s.id)}
                className={`py-2 rounded text-xs transition-all ${
                  surah === s.id
                    ? 'bg-quran-emerald text-quran-gold'
                    : 'glass text-quran-ivory-muted hover:bg-white/5'
                }`}
              >
                <div className="font-amiri text-sm">{s.nameArabic}</div>
              </button>
            ))}
          </div>
        </GlassCard>

        <button
          onClick={handleGenerate}
          className="w-full bg-quran-emerald hover:bg-quran-emerald-light text-quran-ivory font-semibold rounded-xl py-4 text-lg transition-all active:scale-95"
        >
          تحضير
        </button>

        {result && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-quran-emerald text-quran-gold text-xs font-bold px-3 py-1 rounded-full">
                  الركعة الأولى
                </span>
              </div>
              <PassagePlayer
                fromKey={`${result.rakah1.surahNumber}:${result.rakah1.startAyah}`}
                toKey={`${result.rakah1.surahNumber}:${result.rakah1.endAyah}`}
                surahName={result.rakah1.surahName}
              />
            </div>

            <div className="border-t border-white/5 pt-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-quran-emerald text-quran-gold text-xs font-bold px-3 py-1 rounded-full">
                  الركعة الثانية
                </span>
              </div>
              <PassagePlayer
                fromKey={`${result.rakah2.surahNumber}:${result.rakah2.startAyah}`}
                toKey={`${result.rakah2.surahNumber}:${result.rakah2.endAyah}`}
                surahName={result.rakah2.surahName}
              />
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
