'use client';

import { useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { GlassCard } from '@/components/ui/GlassCard';
import { ADHKAR_AFTER_SALAH } from '@/lib/data/adhkar';

export default function AdhkarPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  return (
    <main className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="font-amiri text-xl font-bold text-quran-ivory">
            الأذكار بعد الصلاة
          </h1>
          <p className="text-sm text-quran-ivory-muted mt-1">
            من أحاديث الكتب الستة الصحيحة
          </p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {ADHKAR_AFTER_SALAH.map((dhikr) => (
          <GlassCard key={dhikr.id} strong className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="text-xs text-quran-olive bg-white/5 px-2 py-1 rounded">
                {dhikr.source}
              </span>
              {dhikr.repetition > 1 && (
                <span className="text-xs text-quran-gold bg-quran-gold/10 px-2 py-1 rounded font-bold">
                  {dhikr.repetition} مرات
                </span>
              )}
            </div>
            <p className="font-amiri text-xl leading-loose text-quran-ivory mb-4 text-right">
              {dhikr.text}
            </p>
            {dhikr.note && (
              <p className="text-xs text-quran-ivory-muted mb-3">💡 {dhikr.note}</p>
            )}
            <button
              onClick={() => handleCopy(dhikr.text, dhikr.id)}
              className="w-full glass rounded-xl py-2.5 text-sm text-quran-ivory-muted hover:text-quran-ivory hover:bg-white/5 transition-all"
            >
              {copiedId === dhikr.id ? '✓ تم النسخ' : '📋 نسخ'}
            </button>
          </GlassCard>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
