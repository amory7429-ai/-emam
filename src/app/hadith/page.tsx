'use client';

import { useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { GlassCard } from '@/components/ui/GlassCard';
import { AL_ARBAIN_AL_NAWAWIYYAH } from '@/lib/data/hadith-nawawi';

export default function HadithPage() {
  const [currentId, setCurrentId] = useState(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showText, setShowText] = useState<Record<number, boolean>>({});

  const currentHadith = AL_ARBAIN_AL_NAWAWIYYAH.find(h => h.id === currentId);
  const totalHadith = AL_ARBAIN_AL_NAWAWIYYAH.length;

  const handleCopy = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const toggleText = (id: number) => {
    setShowText(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const nextHadith = () => {
    if (currentId < totalHadith) setCurrentId(currentId + 1);
  };

  const prevHadith = () => {
    if (currentId > 1) setCurrentId(currentId - 1);
  };

  return (
    <main className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="font-amiri text-xl font-bold text-quran-ivory">
            الأربعون النووية
          </h1>
          <p className="text-sm text-quran-ivory-muted mt-1">
            حديث رقم {currentId} من {totalHadith}
          </p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {currentHadith && (
          <div className="space-y-4">
            <GlassCard strong className="p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <span className="text-xs text-quran-olive bg-white/5 px-2 py-1 rounded">
                  {currentHadith.source}
                </span>
                <div className="flex items-center gap-2">
                  {!currentHadith.verified && (
                    <span className="text-[10px] text-orange-400 bg-orange-400/10 px-2 py-1 rounded">
                      يحتاج مراجعة
                    </span>
                  )}
                  <span className="text-xs text-quran-gold bg-quran-gold/10 px-2 py-1 rounded font-bold">
                    حديث رقم {currentHadith.id}
                  </span>
                </div>
              </div>
              
              <h2 className="font-amiri text-lg font-bold text-quran-gold mb-3">
                {currentHadith.title}
              </h2>
              
              {showText[currentHadith.id] !== false ? (
                <p className="font-amiri text-xl leading-loose text-quran-ivory text-right mb-4">
                  {currentHadith.textArabic}
                </p>
              ) : (
                <div className="text-center py-8">
                  <p className="text-quran-ivory-muted"> النص مخفي للحفظ</p>
                  <button
                    onClick={() => toggleText(currentHadith.id)}
                    className="mt-2 text-sm text-quran-gold hover:underline"
                  >
                    إظهار النص
                  </button>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(currentHadith.textArabic, currentHadith.id)}
                  className="flex-1 min-h-[44px] glass rounded-xl py-2.5 text-sm text-quran-ivory-muted hover:text-quran-ivory hover:bg-white/5 transition-all"
                >
                  {copiedId === currentHadith.id ? '✓ تم النسخ' : '📋 نسخ'}
                </button>
                <button
                  onClick={() => toggleText(currentHadith.id)}
                  className="flex-1 min-h-[44px] glass rounded-xl py-2.5 text-sm text-quran-ivory-muted hover:text-quran-ivory hover:bg-white/5 transition-all"
                >
                  {showText[currentHadith.id] !== false ? '🙈 إخفاء' : '👁 إظهار'}
                </button>
              </div>
            </GlassCard>

            <div className="flex gap-3">
              <button
                onClick={prevHadith}
                disabled={currentId <= 1}
                className="flex-1 min-h-[44px] glass rounded-xl py-3 text-sm text-quran-ivory-muted hover:text-quran-ivory transition-colors disabled:opacity-30"
              >
                → السابق
              </button>
              <button
                onClick={nextHadith}
                disabled={currentId >= totalHadith}
                className="flex-1 min-h-[44px] bg-quran-emerald rounded-xl py-3 text-sm font-medium text-quran-gold hover:bg-quran-emerald-light transition-colors disabled:opacity-30"
              >
                التالي ←
              </button>
            </div>

            <GlassCard className="p-4">
              <h3 className="text-sm font-bold text-quran-ivory mb-3">جميع الأحاديث</h3>
              <div className="grid grid-cols-5 gap-2">
                {AL_ARBAIN_AL_NAWAWIYYAH.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setCurrentId(h.id)}
                    className={`min-h-[44px] rounded-lg text-sm font-bold transition-all relative ${
                      h.id === currentId
                        ? 'bg-quran-gold/20 text-quran-gold border border-quran-gold/40'
                        : 'glass text-quran-ivory-muted hover:text-quran-ivory'
                    }`}
                  >
                    {h.id}
                    {!h.verified && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
