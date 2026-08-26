'use client';

import { useState } from 'react';
import TafsirView from '@/components/quran/TafsirView';
import { BottomNav } from '@/components/ui/BottomNav';

const SURAH_LIST = [
  { id: 1, name: 'الفاتحة' },
  { id: 2, name: 'البقرة' },
  { id: 3, name: 'آل عمران' },
  { id: 4, name: 'النساء' },
  { id: 5, name: 'المائدة' },
  { id: 6, name: 'الأنعام' },
  { id: 7, name: 'الأعراف' },
  { id: 36, name: 'يس' },
  { id: 55, name: 'الرحمن' },
  { id: 67, name: 'الملك' },
];

export default function TafsirPage() {
  const [selectedSurah, setSelectedSurah] = useState<number>(1);

  return (
    <main className="min-h-screen bg-abyss pb-24">
      <header className="pt-10 pb-6 px-4 text-center">
        <h1 className="text-3xl font-bold text-gold font-amiri">التفسير الميسر</h1>
        <p className="text-ivory/60 mt-2 text-sm">تفسير مبسط للقرآن الكريم</p>
      </header>

      <div className="px-4 max-w-lg mx-auto space-y-4">
        {/* Surah Selection */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {SURAH_LIST.map(surah => (
            <button
              key={surah.id}
              onClick={() => setSelectedSurah(surah.id)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedSurah === surah.id 
                  ? 'bg-gold text-emerald-dark font-bold' 
                  : 'bg-emerald-dark/30 text-ivory/70 border border-emerald/20'
              }`}
            >
              {surah.name}
            </button>
          ))}
        </div>

        {/* Tafsir Content */}
        <TafsirView surahNumber={selectedSurah} />
      </div>
      <BottomNav />
    </main>
  );
}
