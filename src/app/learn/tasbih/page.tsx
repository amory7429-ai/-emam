'use client';

import { useState } from 'react';
import TasbihCounter from '@/components/tasbih/TasbihCounter';
import { TASBIH_PRESETS, TASBIH_CATEGORIES, getTasbihPresetsByCategory } from '@/lib/data/tasbih';
import { BottomNav } from '@/components/ui/BottomNav';

export default function TasbihPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('after_salah');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const presets = getTasbihPresetsByCategory(selectedCategory);
  const activePreset = TASBIH_PRESETS.find(p => p.id === selectedPreset);

  return (
    <main className="min-h-screen bg-abyss pb-24">
      <header className="pt-10 pb-6 px-4 text-center">
        <h1 className="text-3xl font-bold text-gold font-amiri">عداد التسبيح</h1>
        <p className="text-ivory/60 mt-2 text-sm">سبحان الله والحمد لله والله أكبر</p>
      </header>

      <div className="px-4 max-w-lg mx-auto space-y-6">
        {/* Category Selection */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {TASBIH_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setSelectedPreset(null); }}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === cat.id 
                  ? 'bg-gold text-emerald-dark font-bold' 
                  : 'bg-emerald-dark/30 text-ivory/70 border border-emerald/20'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Preset Selection */}
        {selectedPreset === null && (
          <div className="space-y-3">
            {presets.map(preset => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset.id)}
                className="w-full p-4 rounded-xl bg-emerald-dark/30 border border-emerald/15 
                  text-right hover:bg-emerald-dark/50 hover:border-gold/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-ivory font-amiri">{preset.arabicName}</h3>
                    <p className="text-ivory/50 text-xs mt-1">{preset.source}</p>
                  </div>
                  <div className="text-gold text-2xl">{'>'}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Tasbih Counter */}
        {selectedPreset && activePreset && (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedPreset(null)}
              className="text-gold/80 text-sm hover:text-gold"
            >
              ← العودة للقائمة
            </button>
            
            <div className="p-4 rounded-xl bg-emerald-dark/20 border border-emerald/10">
              <h3 className="text-lg font-bold text-ivory font-amiri text-center">{activePreset.arabicName}</h3>
              <p className="text-ivory/60 text-sm text-center mt-2">{activePreset.text}</p>
              <p className="text-ivory/40 text-xs text-center mt-2">{activePreset.source}</p>
            </div>

            <TasbihCounter
              initialCount={0}
              label={activePreset.arabicName}
            />
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
