'use client';

import { useState } from 'react';
import { RUQYAH_QURAN, RUQYAH_DUAS, RUQYAH_INSTRUCTIONS } from '@/lib/data/rqyah';
import { BottomNav } from '@/components/ui/BottomNav';

type RuqyahCategory = 'quran' | 'dua' | 'instruction';

const categories: { id: RuqyahCategory; name: string }[] = [
  { id: 'quran', name: 'آيات قرآنية' },
  { id: 'dua', name: 'أدعية نبوية' },
  { id: 'instruction', name: 'كيفية الرقية' },
];

export default function RuqyahPage() {
  const [category, setCategory] = useState<RuqyahCategory>('quran');
  const entries = category === 'quran' ? RUQYAH_QURAN : category === 'dua' ? RUQYAH_DUAS : RUQYAH_INSTRUCTIONS;

  return (
    <main className="min-h-screen bg-abyss pb-24">
      <header className="pt-10 pb-6 px-4 text-center">
        <h1 className="text-3xl font-bold text-gold font-amiri">الرقية الشرعية</h1>
        <p className="text-ivory/60 mt-2 text-sm">رقية بالقرآن والأدعية النبوية الصحيحة</p>
      </header>

      <div className="px-4 max-w-lg mx-auto space-y-4">
        {/* Category Toggle */}
        <div className="flex gap-2 bg-emerald-dark/30 p-1 rounded-xl">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex-1 py-3 rounded-lg text-center font-amiri font-bold transition-colors ${
                category === cat.id 
                  ? 'bg-gold text-emerald-dark' 
                  : 'text-ivory/70 hover:text-ivory'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Entries */}
        <div className="space-y-3">
          {entries.map(entry => (
            <div key={entry.id} className="p-4 rounded-xl bg-emerald-dark/20 border border-emerald/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-ivory font-amiri">{entry.title}</h3>
                <div className="flex items-center gap-2">
                  {entry.repetition && entry.repetition > 1 && (
                    <span className="px-2 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold">
                      {entry.repetition} مرات
                    </span>
                  )}
                  {entry.verified && (
                    <span className="px-2 py-1 rounded-full bg-emerald/20 text-emerald-400 text-xs">✓ موثق</span>
                  )}
                </div>
              </div>
              <p className="text-ivory/80 font-amiri text-lg leading-relaxed whitespace-pre-line">{entry.text}</p>
              {entry.note && (
                <p className="text-ivory/50 text-sm mt-3 italic">{entry.note}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold/80">{entry.sourceName}</span>
                <span className="text-xs text-ivory/40">{entry.source}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
