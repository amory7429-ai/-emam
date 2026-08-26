'use client';

import { useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { PROPHETS, getProphetById } from '@/lib/data/prophets';

export default function ProphetsPage() {
  const [selectedProphet, setSelectedProphet] = useState<string | null>(null);
  const prophet = selectedProphet ? getProphetById(selectedProphet) : null;

  return (
    <main className="min-h-screen bg-abyss pb-24">
      <header className="pt-10 pb-6 px-4 text-center">
        <h1 className="text-3xl font-bold text-gold font-amiri">قصص الأنبياء</h1>
        <p className="text-ivory/60 mt-2 text-sm">قصص موثقة من القرآن الكريم</p>
      </header>

      <div className="px-4 max-w-lg mx-auto space-y-6">
        {selectedProphet ? (
          <div>
            <button
              onClick={() => setSelectedProphet(null)}
              className="text-gold text-sm mb-4 hover:underline"
            >
              ← العودة للقائمة
            </button>
            <div className="p-4 rounded-2xl bg-emerald-dark/30 border border-emerald/15">
              <h2 className="text-2xl font-bold text-gold font-amiri">{prophet?.arabicName}</h2>
              <p className="text-ivory/60 text-sm mt-2">{prophet?.title}</p>
              <div className="mt-4 p-3 bg-gold/10 rounded-xl">
                <p className="text-ivory/80 text-sm leading-relaxed">{prophet?.summary}</p>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-bold text-ivory mb-2">المرجع:</h3>
                <ul className="space-y-1">
                  {prophet?.quranicReferences.map((ref, i) => (
                    <li key={i} className="text-ivory/60 text-sm">• القرآن الكريم: {ref}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {PROPHETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProphet(p.id)}
                className="w-full p-4 rounded-2xl bg-emerald-dark/30 border border-emerald/15 
                  hover:border-gold/30 hover:bg-emerald-dark/50 transition-all text-right"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-ivory font-amiri">{p.arabicName}</h3>
                    <p className="text-ivory/60 text-sm">{p.title}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
