'use client';

import { useState, useEffect } from 'react';
import { fetchTafsirForSurah, fetchTafsirForRange } from '@/lib/quran/quran-foundation';
import type { TafsirEntry } from '@/lib/quran/quran-foundation';
import { TAFSIR_AL_MUYASSAR, getTafsirForRange as getLocalTafsir } from '@/lib/data/tafsir';
import type { TafsirEntry as LocalTafsirEntry } from '@/lib/data/tafsir';

interface TafsirViewProps {
  surahNumber: number;
  ayahRange?: [number, number];
}

export default function TafsirView({ surahNumber, ayahRange }: TafsirViewProps) {
  const [tafsirData, setTafsirData] = useState<(TafsirEntry | LocalTafsirEntry)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'api' | 'local' | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    async function loadTafsir() {
      setLoading(true);
      setError(null);
      
      try {
        // Try API first for full coverage
        if (ayahRange) {
          const fromKey = `${surahNumber}:${ayahRange[0]}`;
          const toKey = `${surahNumber}:${ayahRange[1]}`;
          const apiData = await fetchTafsirForRange(fromKey, toKey);
          if (!cancelled && apiData.length > 0) {
            setTafsirData(apiData);
            setDataSource('api');
            setLoading(false);
            return;
          }
        } else {
          // Fetch full surah tafsir
          const apiData = await fetchTafsirForSurah(surahNumber);
          if (!cancelled && apiData.length > 0) {
            setTafsirData(apiData);
            setDataSource('api');
            setLoading(false);
            return;
          }
        }
      } catch {
        // API failed, fall through to local
      }
      
      // Fall back to local data
      try {
        const fromKey = `${surahNumber}:${ayahRange?.[0] || 1}`;
        const toKey = `${surahNumber}:${ayahRange?.[1] || 999}`;
        const localData = getLocalTafsir(fromKey, toKey);
        if (!cancelled) {
          setTafsirData(localData);
          setDataSource('local');
        }
      } catch {
        if (!cancelled) setError('تعذر تحميل التفسير');
      }
      
      if (!cancelled) setLoading(false);
    }
    
    loadTafsir();
    return () => { cancelled = true; };
  }, [surahNumber, ayahRange]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
        <p className="text-ivory/60 text-sm mt-3">جارٍ تحميل التفسير...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-ivory/60">
        <p className="text-lg font-amiri">{error}</p>
      </div>
    );
  }

  if (tafsirData.length === 0) {
    return (
      <div className="p-6 text-center text-ivory/60">
        <p className="text-lg font-amiri">لا يوجد تفسير متاح لهذه الآيات حالياً</p>
        <p className="text-sm mt-2 text-ivory/40">سيتم إضافة التفسير قريباً إن شاء الله</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gold font-amiri">التفسير الميسر</h3>
        {dataSource && (
          <span className="text-[10px] px-2 py-1 rounded-full bg-emerald/20 text-emerald-400">
            {dataSource === 'api' ? '✓ من القرآن.كوم' : 'بيانات محلية'}
          </span>
        )}
      </div>
      {tafsirData.map((entry) => (
        <div
          key={entry.verseKey}
          className="p-4 rounded-xl bg-emerald-dark/20 border border-emerald/10 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-gold font-amiri text-lg font-bold">
              {entry.verseKey}
            </span>
          </div>

          <p className="text-ivory/90 font-amiri text-lg leading-relaxed">
            {entry.text}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold/80">
              {entry.sourceName}
            </span>
            {entry.verified && (
              <span className="text-xs px-2 py-1 rounded-full bg-emerald/20 text-emerald-400">
                ✓ موثق
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
