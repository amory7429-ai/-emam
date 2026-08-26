// Quran data bootstrap: one-time fetch → IndexedDB → offline read
// Fetches all 114 surahs' ayah text from Quran.com API v4
// Stores in IndexedDB for offline access

import { dbPut, dbPutMany, dbGet, dbGetByIndex, dbCount } from './indexed-db';
import { SURAH_META } from '@/lib/data/surahs';

const BOOTSTRAP_META_ID = 'quran-bootstrap-status';

export interface BootstrapStatus {
  complete: boolean;
  totalVerses: number;
  lastUpdated: string;
  surahsCompleted: number[];
}

// Check if Quran is already bootstrapped
export async function isQuranBootstrapped(): Promise<boolean> {
  try {
    const status = await dbGet<{ id: string; value: BootstrapStatus }>('quranMeta', BOOTSTRAP_META_ID);
    return status?.value?.complete === true;
  } catch {
    return false;
  }
}

// Get bootstrap status
export async function getBootstrapStatus(): Promise<BootstrapStatus | null> {
  try {
    const status = await dbGet<{ id: string; value: BootstrapStatus }>('quranMeta', BOOTSTRAP_META_ID);
    return status?.value || null;
  } catch {
    return null;
  }
}

// Save bootstrap status
async function saveBootstrapStatus(status: BootstrapStatus): Promise<void> {
  await dbPut('quranMeta', { id: BOOTSTRAP_META_ID, value: status });
}

// Fetch verses for a single surah from API
async function fetchSurahVerses(surahNumber: number) {
  const fields = 'text_uthmani,juz_number,hizb_number,page_number,ruku_number,manzil_number,sajdah_number';
  const res = await fetch(
    `https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?fields=${fields}&per_page=10000`
  );
  if (!res.ok) throw new Error(`API error ${res.status} for surah ${surahNumber}`);
  const data = await res.json();
  return data.verses;
}

// Bootstrap all Quran data (online, one-time)
export async function bootstrapQuran(
  onProgress?: (surah: number, total: number) => void
): Promise<void> {
  const existing = await getBootstrapStatus();
  if (existing?.complete) return;

  const completedSurahs = new Set(existing?.surahsCompleted || []);
  let totalVerses = existing?.totalVerses || 0;

  // Process surahs in batches to avoid overwhelming the API
  for (let surah = 1; surah <= 114; surah++) {
    if (completedSurahs.has(surah)) {
      onProgress?.(surah, 114);
      continue;
    }

    try {
      const verses = await fetchSurahVerses(surah);

      const verseRecords = verses.map((v: any) => ({
        verseKey: v.verse_key,
        surahNumber: surah,
        verseNumber: v.verse_number,
        textUthmani: v.text_uthmani,
        juz: v.juz_number,
        hizb: v.hizb_number,
        page: v.page_number,
        ruku: v.ruku_number,
        manzil: v.manzil_number || 0,
        sajdahNumber: v.sajdah_number,
      }));

      await dbPutMany('quranVerses', verseRecords);
      totalVerses += verses.length;
      completedSurahs.add(surah);

      // Save progress after each surah
      await saveBootstrapStatus({
        complete: false,
        totalVerses,
        lastUpdated: new Date().toISOString(),
        surahsCompleted: Array.from(completedSurahs),
      });

      onProgress?.(surah, 114);

      // Small delay between requests to be polite to the API
      if (surah < 114) {
        await new Promise(r => setTimeout(r, 100));
      }
    } catch {
      // Continue with next surah
    }
  }

  // Mark as complete
  await saveBootstrapStatus({
    complete: true,
    totalVerses,
    lastUpdated: new Date().toISOString(),
    surahsCompleted: Array.from(completedSurahs),
  });
}

// Get verses for a surah from IndexedDB
export async function getOfflineVerses(surahNumber: number) {
  try {
    const verses = await dbGetByIndex<any>('quranVerses', 'bySurah', surahNumber);
    return verses.sort((a, b) => a.verseNumber - b.verseNumber);
  } catch {
    return null;
  }
}

// Get a single verse from IndexedDB
export async function getOfflineVerse(verseKey: string) {
  try {
    return await dbGet<any>('quranVerses', verseKey);
  } catch {
    return null;
  }
}

// Get count of cached verses
export async function getCachedVerseCount(): Promise<number> {
  try {
    return await dbCount('quranVerses');
  } catch {
    return 0;
  }
}
