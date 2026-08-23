'use client';

import { useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { GlassCard } from '@/components/ui/GlassCard';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { SURAH_META } from '@/lib/data/surahs';
import { getAlafasyAudioUrl } from '@/lib/quran/quran-foundation';

export default function PreparePage() {
  const [prayer, setPrayer] = useState('fajr');
  const [juz, setJuz] = useState<number | null>(null);
  const [surah, setSurah] = useState<number | null>(null);
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [result, setResult] = useState<{ rakah1: string; rakah2: string } | null>(null);

  const prayers = [
    { id: 'fajr', name: 'الفجر', rakahs: 2 },
    { id: 'dhuhr', name: 'الظهر', rakahs: 4 },
    { id: 'asr', name: 'العصر', rakahs: 4 },
    { id: 'maghrib', name: 'المغرب', rakahs: 3 },
    { id: 'isha', name: 'العشاء', rakahs: 4 },
  ];

  const lengths = [
    { id: 'short' as const, label: 'قصير', desc: '3-5 آيات' },
    { id: 'medium' as const, label: 'متوسط', desc: '7-12 آية' },
    { id: 'long' as const, label: 'طويل', desc: '15+ آية' },
  ];

  const filteredSurahs = juz
    ? SURAH_META.filter((s) => s.juzStart === juz)
    : SURAH_META;

  const handleGenerate = () => {
    const targetSurah = surah || (juz ? SURAH_META.find((s) => s.juzStart === juz)?.id : 1) || 1;
    const meta = SURAH_META.find((s) => s.id === targetSurah);
    if (!meta) return;

    const passLen = length === 'short' ? 4 : length === 'medium' ? 8 : 15;
    const maxStart = Math.max(1, meta.ayahs - passLen * 2);

    const r1Start = Math.floor(Math.random() * (maxStart - 1)) + 1;
    const r1End = Math.min(r1Start + passLen - 1, meta.ayahs);

    const r2Start = Math.min(r1End + 2, meta.ayahs - passLen + 1);
    const r2End = Math.min(r2Start + passLen - 1, meta.ayahs);

    setResult({
      rakah1: `${targetSurah}:${r1Start}-${r1End}`,
      rakah2: `${targetSurah}:${r2Start}-${r2End}`,
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
            {prayers.map((p) => (
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
                onClick={() => setJuz(juz === i + 1 ? null : i + 1)}
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
            {lengths.map((l) => (
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
            {filteredSurahs.map((s) => (
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
          <div className="space-y-3 animate-slide-up">
            <GlassCard strong className="p-5">
              <span className="bg-quran-emerald text-quran-gold text-xs font-bold px-3 py-1 rounded-full">
                الركعة الأولى
              </span>
              <p className="font-amiri text-lg text-quran-ivory mt-3">
                {result.rakah1}
              </p>
              <AudioPlayer
                url={getAlafasyAudioUrl(result.rakah1.split('-')[0])}
                label="تشغيل"
                className="mt-3"
              />
            </GlassCard>
            <GlassCard strong className="p-5">
              <span className="bg-quran-emerald text-quran-gold text-xs font-bold px-3 py-1 rounded-full">
                الركعة الثانية
              </span>
              <p className="font-amiri text-lg text-quran-ivory mt-3">
                {result.rakah2}
              </p>
              <AudioPlayer
                url={getAlafasyAudioUrl(result.rakah2.split('-')[0])}
                label="تشغيل"
                className="mt-3"
              />
            </GlassCard>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
