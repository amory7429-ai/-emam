'use client';

import { useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { DhikrCounter } from '@/components/ui/DhikrCounter';
import { ADHKAR_SABAH, ADHKAR_MASA } from '@/lib/data/adhkar-morning-evening';

type Category = 'morning' | 'evening';

export default function AdhkarPage() {
  const [category, setCategory] = useState<Category>('morning');
  const adhkar = category === 'morning' ? ADHKAR_SABAH : ADHKAR_MASA;

  return (
    <main className="min-h-screen bg-abyss pb-24">
      <header className="pt-10 pb-6 px-4 text-center">
        <h1 className="text-3xl font-bold text-gold font-amiri">أذكار الصباح والمساء</h1>
        <p className="text-ivory/60 mt-2 text-sm">موثقة من السنة النبوية</p>
      </header>

      <div className="px-4 max-w-lg mx-auto space-y-4">
        {/* Category Toggle */}
        <div className="flex gap-2 bg-emerald-dark/30 p-1 rounded-xl">
          <button
            onClick={() => setCategory('morning')}
            className={`flex-1 py-3 rounded-lg text-center font-amiri font-bold transition-colors ${
              category === 'morning' 
                ? 'bg-gold text-emerald-dark' 
                : 'text-ivory/70 hover:text-ivory'
            }`}
          >
            أذكار الصباح
          </button>
          <button
            onClick={() => setCategory('evening')}
            className={`flex-1 py-3 rounded-lg text-center font-amiri font-bold transition-colors ${
              category === 'evening' 
                ? 'bg-gold text-emerald-dark' 
                : 'text-ivory/70 hover:text-ivory'
            }`}
          >
            أذكار المساء
          </button>
        </div>

        {/* Adhkar List */}
        <div className="space-y-3">
          {adhkar.map(dhikr => (
            <div key={dhikr.id} className="p-4 rounded-xl bg-emerald-dark/20 border border-emerald/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-ivory font-amiri">{dhikr.title}</h3>
                <div className="flex items-center gap-2">
                  {dhikr.repetition > 1 && (
                    <span className="px-2 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold">
                      {dhikr.repetition} مرات
                    </span>
                  )}
                  {dhikr.verified && (
                    <span className="px-2 py-1 rounded-full bg-emerald/20 text-emerald-400 text-xs">✓ موثق</span>
                  )}
                </div>
              </div>
              <p className="text-ivory/80 font-amiri content-text leading-relaxed whitespace-pre-line">{dhikr.text}</p>
              {dhikr.note && (
                <p className="text-ivory/50 text-sm mt-3 italic">{dhikr.note}</p>
              )}
              <div className="flex items-center gap-2 mt-3 mb-1">
                <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold/80">{dhikr.sourceName}</span>
                <span className="text-xs text-ivory/40">{dhikr.source}</span>
              </div>

              {/* Counter */}
              {dhikr.repetition > 1 && (
                <DhikrCounter
                  dhikrId={dhikr.id}
                  target={dhikr.repetition}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
