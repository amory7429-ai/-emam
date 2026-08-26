// Quran.com API v4 Provider
// Verified: https://api.quran.com/api/v4
// No authentication required for public endpoints

import type { Verse, VerseWithWords, VerseWord, Reciter } from './types';

const BASE_URL = 'https://api.quran.com/api/v4';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Quran.com API error: ${res.status}`);
  return res.json();
}

const VERSE_FIELDS = 'text_uthmani,juz_number,hizb_number,page_number,ruku_number,rub_el_hizb_number,manzil_number,sajdah_number';

export async function fetchVersesBySurah(surahNumber: number): Promise<Verse[]> {
  const data = await fetchJson<{ verses: any[] }>(
    `${BASE_URL}/verses/by_chapter/${surahNumber}?fields=${VERSE_FIELDS}&per_page=10000`
  );
  return data.verses.map(mapVerse);
}

export async function fetchVersesWithWords(surahNumber: number): Promise<VerseWithWords[]> {
  const data = await fetchJson<{ verses: any[] }>(
    `${BASE_URL}/verses/by_chapter/${surahNumber}?fields=${VERSE_FIELDS},image_url,image_width&words=true&per_page=10000`
  );
  return data.verses.map(mapVerseWithWords);
}

export async function fetchVerseRangeWithWords(fromKey: string, toKey: string): Promise<VerseWithWords[]> {
  const [startSurah] = fromKey.split(':').map(Number);
  const [endSurah] = toKey.split(':').map(Number);
  const startAyah = parseInt(fromKey.split(':')[1]);
  const endAyah = parseInt(toKey.split(':')[1]);

  if (startSurah === endSurah) {
    const data = await fetchJson<{ verses: any[] }>(
      `${BASE_URL}/verses/by_chapter/${startSurah}?fields=${VERSE_FIELDS},image_url,image_width&words=true&per_page=10000`
    );
    return data.verses
      .map(mapVerseWithWords)
      .filter(v => v.verseNumber >= startAyah && v.verseNumber <= endAyah);
  }

  const allVerses: VerseWithWords[] = [];
  for (let s = startSurah; s <= endSurah; s++) {
    const data = await fetchJson<{ verses: any[] }>(
      `${BASE_URL}/verses/by_chapter/${s}?fields=${VERSE_FIELDS},image_url,image_width&words=true&per_page=10000`
    );
    const from = s === startSurah ? startAyah : 1;
    const to = s === endSurah ? endAyah : 999;
    allVerses.push(...data.verses.map(mapVerseWithWords).filter(v => v.verseNumber >= from && v.verseNumber <= to));
  }
  return allVerses;
}

export async function fetchVerseByKey(verseKey: string): Promise<Verse> {
  const data = await fetchJson<{ verse: any }>(
    `${BASE_URL}/verses/by_key/${verseKey}?fields=${VERSE_FIELDS}`
  );
  return mapVerse(data.verse);
}

export async function fetchVerseRange(fromKey: string, toKey: string): Promise<Verse[]> {
  const [startSurah] = fromKey.split(':').map(Number);
  const [endSurah] = toKey.split(':').map(Number);
  const startAyah = parseInt(fromKey.split(':')[1]);
  const endAyah = parseInt(toKey.split(':')[1]);

  if (startSurah === endSurah) {
    const data = await fetchJson<{ verses: any[] }>(
      `${BASE_URL}/verses/by_chapter/${startSurah}?fields=${VERSE_FIELDS},image_url,image_width&per_page=10000`
    );
    return data.verses.map(mapVerse).filter(v => v.verseNumber >= startAyah && v.verseNumber <= endAyah);
  }

  const allVerses: Verse[] = [];
  for (let s = startSurah; s <= endSurah; s++) {
    const data = await fetchJson<{ verses: any[] }>(
      `${BASE_URL}/verses/by_chapter/${s}?fields=${VERSE_FIELDS},image_url,image_width&per_page=10000`
    );
    const from = s === startSurah ? startAyah : 1;
    const to = s === endSurah ? endAyah : 999;
    allVerses.push(...data.verses.map(mapVerse).filter(v => v.verseNumber >= from && v.verseNumber <= to));
  }
  return allVerses;
}

export async function fetchTajweedVerses(surahNumber: number): Promise<Verse[]> {
  const data = await fetchJson<{ verses: any[] }>(
    `${BASE_URL}/verses/by_chapter/${surahNumber}?fields=text_uthmani_tajweed&per_page=10000`
  );
  return data.verses.map((v: any) => ({
    id: v.id,
    verseKey: v.verse_key,
    surahNumber,
    verseNumber: v.verse_number,
    textUthmani: '',
    textUthmaniTajweed: v.text_uthmani_tajweed,
    juz: v.juz_number,
    hizb: v.hizb_number,
    rubElHizb: v.rub_el_hizb_number || 0,
    page: v.page_number,
    ruku: v.ruku_number,
    manzil: v.manzil_number || 0,
    sajdahNumber: v.sajdah_number,
  }));
}

/** Build audio URL from API response based on reciter's URL pattern */
function buildAudioUrl(reciter: Reciter, relativeUrl: string): string {
  if (reciter.urlPattern === 'quranicaudio-protocol-relative') {
    // URLs like "//mirrors.quranicaudio.com/..." need https: prefix
    return relativeUrl.startsWith('//') ? `https:${relativeUrl}` : `https://${relativeUrl}`;
  }
  // quran-foundation pattern: "Alafasy/mp3/..." or "Minshawi/Murattal/mp3/..."
  return `${reciter.audioBaseUrl}/${relativeUrl}`;
}

/** Fetch audio for a single verse (fast — filters after fetch) */
export async function fetchAudioForVerse(
  verseKey: string,
  reciter: Reciter
): Promise<{ verseKey: string; url: string } | null> {
  const [surahNum, ayahNum] = verseKey.split(':').map(Number);
  const data = await fetchJson<{ audio_files: any[] }>(
    `${BASE_URL}/recitations/${reciter.id}/by_chapter/${surahNum}?per_page=10000`
  );
  const match = data.audio_files.find((a: any) => a.verse_key === verseKey);
  if (!match) return null;
  return { verseKey, url: buildAudioUrl(reciter, match.url) };
}

/** Fetch audio files for a verse range using a specific reciter */
export async function fetchAudioByRange(
  fromKey: string,
  toKey: string,
  reciter: Reciter
): Promise<{ verseKey: string; url: string }[]> {
  const [startSurah] = fromKey.split(':').map(Number);
  const [endSurah] = toKey.split(':').map(Number);
  const startAyah = parseInt(fromKey.split(':')[1]);
  const endAyah = parseInt(toKey.split(':')[1]);

  const recitationId = reciter.id;

  if (startSurah === endSurah) {
    const data = await fetchJson<{ audio_files: any[] }>(
      `${BASE_URL}/recitations/${recitationId}/by_chapter/${startSurah}?per_page=10000`
    );
    return data.audio_files
      .map((a: any) => ({ verseKey: a.verse_key, url: buildAudioUrl(reciter, a.url) }))
      .filter(a => {
        const ayah = parseInt(a.verseKey.split(':')[1]);
        return ayah >= startAyah && ayah <= endAyah;
      });
  }

  const allAudio: { verseKey: string; url: string }[] = [];
  for (let s = startSurah; s <= endSurah; s++) {
    const data = await fetchJson<{ audio_files: any[] }>(
      `${BASE_URL}/recitations/${recitationId}/by_chapter/${s}?per_page=10000`
    );
    const from = s === startSurah ? startAyah : 1;
    const to = s === endSurah ? endAyah : 999;
    allAudio.push(
      ...data.audio_files
        .map((a: any) => ({ verseKey: a.verse_key, url: buildAudioUrl(reciter, a.url) }))
        .filter(a => {
          const ayah = parseInt(a.verseKey.split(':')[1]);
          return ayah >= from && ayah <= to;
        })
    );
  }
  return allAudio;
}

/** Legacy function for backward compatibility - uses Alafasy (default) */
export async function fetchAudioByRangeLegacy(fromKey: string, toKey: string): Promise<{ verseKey: string; url: string }[]> {
  const { getDefaultReciter } = await import('./types');
  return fetchAudioByRange(fromKey, toKey, getDefaultReciter());
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

// ── Tafsir API ─────────────────────────────────────────────────

/** Tafsir Al-Muyassar resource ID in Quran.com API */
const TAFSIR_MUYASSAR_ID = 167;

export interface TafsirEntry {
  verseKey: string;
  surahNumber: number;
  verseNumber: number;
  text: string;
  source: string;
  sourceName: string;
  sourceUrl: string;
  verified: boolean;
}

/** Fetch tafsir for a specific verse from Quran.com API */
export async function fetchTafsirForVerse(verseKey: string): Promise<TafsirEntry | null> {
  try {
    const data = await fetchJson<{ tafsir: any }>(
      `${BASE_URL}/tafsirs/${TAFSIR_MUYASSAR_ID}/by_verse/${verseKey}`
    );
    if (!data.tafsir?.text) return null;
    const [surah, ayah] = verseKey.split(':').map(Number);
    return {
      verseKey,
      surahNumber: surah,
      verseNumber: ayah,
      text: data.tafsir.text.replace(/<[^>]*>/g, ''), // Strip HTML tags
      source: 'التفسير الميسر - وزارة الشؤون الإسلامية السعودية',
      sourceName: 'التفسير الميسر',
      sourceUrl: 'https://quran.gov.sa/tafsir/almoyassar',
      verified: true,
    };
  } catch {
    return null;
  }
}

/** Fetch tafsir for a verse range */
export async function fetchTafsirForRange(
  fromKey: string,
  toKey: string
): Promise<TafsirEntry[]> {
  const [startSurah] = fromKey.split(':').map(Number);
  const [endSurah] = toKey.split(':').map(Number);
  const startAyah = parseInt(fromKey.split(':')[1]);
  const endAyah = parseInt(toKey.split(':')[1]);

  const results: TafsirEntry[] = [];

  if (startSurah === endSurah) {
    for (let a = startAyah; a <= endAyah; a++) {
      const entry = await fetchTafsirForVerse(`${startSurah}:${a}`);
      if (entry) results.push(entry);
    }
  } else {
    for (let s = startSurah; s <= endSurah; s++) {
      const from = s === startSurah ? startAyah : 1;
      const to = s === endSurah ? endAyah : 999;
      for (let a = from; a <= to; a++) {
        const entry = await fetchTafsirForVerse(`${s}:${a}`);
        if (entry) results.push(entry);
      }
    }
  }

  return results;
}

/** Fetch all tafsir for a surah */
export async function fetchTafsirForSurah(surahNumber: number): Promise<TafsirEntry[]> {
  const results: TafsirEntry[] = [];
  // Get verse count from SURAH_META
  const { SURAH_META } = await import('../data/surahs');
  const surah = SURAH_META.find(s => s.id === surahNumber);
  if (!surah) return results;
  
  for (let a = 1; a <= surah.ayahs; a++) {
    const entry = await fetchTafsirForVerse(`${surahNumber}:${a}`);
    if (entry) results.push(entry);
  }
  return results;
}

function mapVerseWithWords(v: any): VerseWithWords {
  const base = mapVerse(v);
  const words: VerseWord[] = (v.words || [])
    .filter((w: any) => w.char_type_name === 'word')
    .map((w: any) => ({
      id: w.id,
      position: w.position,
      text: w.text,
      charTypeName: w.char_type_name,
      pageNumber: w.page_number,
      lineNumber: w.line_number,
      audioUrl: w.audio_url ? `https://verses.quran.foundation/${w.audio_url}` : null,
      translation: w.translation?.text,
      transliteration: w.transliteration?.text,
    }));

  const imageUrl = v.image_url
    ? (v.image_url.startsWith('//') ? `https:${v.image_url}` : v.image_url)
    : undefined;

  return {
    ...base,
    words,
    imageUrl,
    imageWidth: v.image_width,
  };
}
