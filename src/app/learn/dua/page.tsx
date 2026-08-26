'use client';

import { useState } from 'react';
import { DUAS, DUA_CATEGORIES, getDuasByCategory } from '@/lib/data/dua';
import { BottomNav } from '@/components/ui/BottomNav';

export default function DuaPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('distress');
  const duas = getDuasByCategory(selectedCategory);

  return (
    <main className="min-h-screen bg-abyss pb-24">
      <header className="pt-10 pb-6 px-4 text-center">
        <h1 className="text-3xl font-bold text-gold font-amiri">الدعاء المأثور</h1>
        <p className="text-ivory/60 mt-2 text-sm">أدعية نبوية موثقة</p>
      </header>

      <div className="px-4 max-w-lg mx-auto space-y-4">
        {/* Category Selection */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {DUA_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === cat.id 
                  ? 'bg-gold text-emerald-dark font-bold' 
                  : 'bg-emerald-dark/30 text-ivory/70 border border-emerald/20'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Duas List */}
        <div className="space-y-3">
          {duas.length === 0 ? (
            <div className="p-6 text-center text-ivory/60">
              <p className="font-amiri">سيتم إضافة الأدعية قريباً إن شاء الله</p>
            </div>
          ) : (
            duas.map(dua => (
              <div key={dua.id} className="p-4 rounded-xl bg-emerald-dark/20 border border-emerald/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-ivory font-amiri">{dua.title}</h3>
                  <div className="flex items-center gap-2">
                    {dua.repetition && dua.repetition > 1 && (
                      <span className="px-2 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold">
                        {dua.repetition} مرات
                      </span>
                    )}
                    {dua.verified && (
                      <span className="px-2 py-1 rounded-full bg-emerald/20 text-emerald-400 text-xs">✓ موثق</span>
                    )}
                  </div>
                </div>
                <p className="text-ivory/80 font-amiri text-lg leading-relaxed whitespace-pre-line">{dua.text}</p>
                {dua.note && (
                  <p className="text-ivory/50 text-sm mt-3 italic">{dua.note}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold/80">{dua.sourceName}</span>
                  <span className="text-xs text-ivory/40">{dua.source}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
