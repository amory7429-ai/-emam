// Al Quran Cloud API Provider (Fallback)
// Verified: https://api.alquran.cloud/v1
// No authentication required

import type { Verse } from './types';

const BASE_URL = 'https://api.alquran.cloud/v1';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Al Quran Cloud API error: ${res.status}`);
  return res.json();
}

export async function fetchCloudSurah(surahNumber: number): Promise<Verse[]> {
  const data = await fetchJson<{ data: { ayahs: any[] } }>(
    `${BASE_URL}/surah/${surahNumber}/quran-uthmani`
  );
  return data.data.ayahs.map((a) => ({
    id: a.number,
    verseKey: `${surahNumber}:${a.numberInSurah}`,
    surahNumber,
    verseNumber: a.numberInSurah,
    textUthmani: a.text,
    textUthmaniTajweed: undefined,
    juz: a.juz,
    hizb: Math.ceil(a.hizbQuarter / 4) || 1,
    rubElHizb: a.hizbQuarter,
    page: a.page,
    ruku: a.ruku,
    manzil: a.manzil,
    sajdahNumber: a.sajda ? 0 : null,
  }));
}

export async function fetchCloudJuz(juzNumber: number): Promise<Verse[]> {
  const data = await fetchJson<{ data: { ayahs: any[] } }>(
    `${BASE_URL}/juz/${juzNumber}/quran-uthmani`
  );
  return data.data.ayahs.map((a) => {
    const surahNum = a.surah?.number || parseInt(a.verse_key?.split(':')[0] || '1');
    return {
      id: a.number,
      verseKey: `${surahNum}:${a.numberInSurah}`,
      surahNumber: surahNum,
      verseNumber: a.numberInSurah,
      textUthmani: a.text,
      textUthmaniTajweed: undefined,
      juz: a.juz,
      hizb: Math.ceil(a.hizbQuarter / 4) || 1,
      rubElHizb: a.hizbQuarter,
      page: a.page,
      ruku: a.ruku,
      manzil: a.manzil,
      sajdahNumber: a.sajda ? 0 : null,
    };
  });
}
