// Quran.com API v4 Provider
// Verified: https://api.quran.com/api/v4
// No authentication required

import type { Surah, Verse, AudioSource } from './types';

const BASE_URL = 'https://api.quran.com/api/v4';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Quran.com API error: ${res.status}`);
  return res.json();
}

export async function fetchAllSurahs(): Promise<Surah[]> {
  const data = await fetchJson<{ chapters: any[] }>(`${BASE_URL}/chapters`);
  return data.chapters.map((c) => ({
    id: c.id,
    nameSimple: c.name_simple,
    nameComplex: c.name_complex,
    nameArabic: c.name_arabic,
    versesCount: c.verses_count,
    revelationPlace: c.revelation_place,
    revelationOrder: c.revelation_order,
    bismillahPre: c.bismillah_pre,
    pages: c.pages,
  }));
}

export async function fetchVersesBySurah(surahNumber: number): Promise<Verse[]> {
  const data = await fetchJson<{ verses: any[]; pagination: any }>(
    `${BASE_URL}/verses/by_chapter/${surahNumber}?fields=text_uthmani,juz_number,hizb_number,page_number,ruku_number,rub_el_hizb_number,manzil_number,sajdah_number&per_page=10000`
  );
  return data.verses.map(mapVerse);
}

export async function fetchVerseByKey(verseKey: string): Promise<Verse> {
  const data = await fetchJson<{ verse: any }>(
    `${BASE_URL}/verses/by_key/${verseKey}?fields=text_uthmani,juz_number,hizb_number,page_number,ruku_number,rub_el_hizb_number,manzil_number,sajdah_number`
  );
  return mapVerse(data.verse);
}

export async function fetchVersesByJuz(juzNumber: number): Promise<Verse[]> {
  const data = await fetchJson<{ verses: any[]; pagination: any }>(
    `${BASE_URL}/verses/by_juz/${juzNumber}?fields=text_uthmani,juz_number,hizb_number,page_number,ruku_number,rub_el_hizb_number&per_page=10000`
  );
  return data.verses.map(mapVerse);
}

export async function fetchVerseRange(startKey: string, endKey: string): Promise<Verse[]> {
  const [startSurah, startAyah] = startKey.split(':').map(Number);
  const [endSurah, endAyah] = endKey.split(':').map(Number);

  const verses: Verse[] = [];
  for (let s = startSurah; s <= endSurah; s++) {
    const from = s === startSurah ? startAyah : 1;
    const to = s === endSurah ? endAyah : 999;
    const surahVerses = await fetchVersesBySurah(s);
    verses.push(
      ...surahVerses.filter((v) => v.verseNumber >= from && v.verseNumber <= to)
    );
  }
  return verses;
}

export async function fetchTajweedVerses(surahNumber: number): Promise<Verse[]> {
  const data = await fetchJson<{ verses: any[]; pagination: any }>(
    `${BASE_URL}/verses/by_chapter/${surahNumber}?fields=text_uthmani_tajweed&per_page=10000`
  );
  return data.verses.map((v: any) => ({
    id: v.id,
    verseKey: v.verse_key,
    surahNumber: surahNumber,
    verseNumber: v.verse_number,
    textUthmani: '',
    textUthmaniTajweed: v.text_uthmani_tajweed,
    juz: v.juz_number,
    hizb: v.hizb_number,
    rubElHizb: v.rub_el_hizb_number,
    page: v.page_number,
    ruku: v.ruku_number,
    manzil: v.manzil_number,
    sajdahNumber: v.sajdah_number,
  }));
}

export async function fetchAlafasyAudio(surahNumber: number): Promise<AudioSource[]> {
  const data = await fetchJson<{ audio_files: any[] }>(
    `${BASE_URL}/recitations/7/by_chapter/${surahNumber}`
  );
  return data.audio_files.map((a: any) => ({
    verseKey: a.verse_key,
    reciterName: 'Mishari Rashid al-`Afasy',
    reciterId: 7,
    url: `https://verses.quran.foundation/${a.url}`,
    relativePath: a.url,
    format: 'mp3',
  }));
}

export function getAlafasyAudioUrl(verseKey: string): string {
  const [surah, ayah] = verseKey.split(':').map(Number);
  const surahStr = surah.toString().padStart(3, '0');
  const ayahStr = ayah.toString().padStart(3, '0');
  return `https://verses.quran.foundation/Alafasy/mp3/${surahStr}${ayahStr}.mp3`;
}

function mapVerse(v: any): Verse {
  return {
    id: v.id,
    verseKey: v.verse_key,
    surahNumber: parseInt(v.verse_key.split(':')[0]),
    verseNumber: v.verse_number,
    textUthmani: v.text_uthmani,
    textUthmaniTajweed: v.text_uthmani_tajweed,
    juz: v.juz_number,
    hizb: v.hizb_number,
    rubElHizb: v.rub_el_hizb_number || 0,
    page: v.page_number,
    ruku: v.ruku_number,
    manzil: v.manzil_number || 0,
    sajdahNumber: v.sajdah_number,
  };
}
