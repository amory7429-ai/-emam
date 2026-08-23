// Verified types based on actual API responses
// Source: Quran.com API v4 + Al Quran Cloud API
// Verification date: 2026-08-23

export interface Surah {
  id: number;               // 1-114
  nameSimple: string;       // "Al-Fatihah"
  nameComplex: string;      // "Al-Faatihah"
  nameArabic: string;       // Arabic name
  versesCount: number;      // Total verses
  revelationPlace: string;  // "makkah" | "madinah"
  revelationOrder: number;
  bismillahPre: boolean;
  pages: [number, number];  // [start, end] mushaf pages
}

export interface Verse {
  id: number;               // Global verse ID (1-6236)
  verseKey: string;         // "2:255"
  surahNumber: number;      // 2
  verseNumber: number;      // 255
  textUthmani: string;      // Uthmani script
  textUthmaniTajweed?: string; // Tajweed color-coded (optional)
  juz: number;              // 1-30
  hizb: number;             // 1-60
  rubElHizb: number;        // 1-240
  page: number;             // 1-604
  ruku: number;             // 1-556
  manzil: number;           // 1-7
  sajdahNumber: number | null;
}

export interface Juz {
  number: number;           // 1-30
  startVerseKey: string;    // "1:1"
  endVerseKey: string;      // "2:141"
  startSurah: number;
  endSurah: number;
  totalVerses: number;
}

export interface Passage {
  id: string;               // "2:255-257"
  surahNumber: number;
  surahName: string;
  ayahStart: number;
  ayahEnd: number;
  juz: number;
  hizb: number;
  pageStart: number;
  pageEnd: number;
  verseCount: number;
  estimatedSeconds: number; // Based on ~4-5 words/sec for Arabic
  textUthmani: string;      // Full concatenated text
  textUthmaniTajweed?: string;
}

export interface AudioSource {
  verseKey: string;         // "1:1"
  reciterName: string;      // "Mishary Rashid Al Afasy"
  reciterId: number;        // 7
  url: string;              // Full URL to mp3
  relativePath: string;     // "Alafasy/mp3/001001.mp3"
  format: string;           // "mp3"
}

export interface AudioConfig {
  baseUrl: string;          // "https://verses.quran.foundation"
  reciterPath: string;      // "Alafasy/mp3"
  reciterId: number;        // 7
  reciterName: string;      // "Mishari Rashid al-`Afasy"
}

// Verified audio configuration
export const ALAFASY_AUDIO: AudioConfig = {
  baseUrl: "https://verses.quran.foundation",
  reciterPath: "Alafasy/mp3",
  reciterId: 7,
  reciterName: "Mishari Rashid al-`Afasy",
};

// API Response types (for internal use)
export interface QuranComChaptersResponse {
  chapters: Array<{
    id: number;
    revelation_place: string;
    revelation_order: number;
    bismillah_pre: boolean;
    name_simple: string;
    name_complex: string;
    name_arabic: string;
    verses_count: number;
    pages: [number, number];
    translated_name: { language_name: string; name: string };
  }>;
}

export interface QuranComVerseResponse {
  verses: Array<{
    id: number;
    verse_number: number;
    verse_key: string;
    hizb_number: number;
    rub_el_hizb_number: number;
    ruku_number: number;
    manzil_number: number;
    sajdah_number: number | null;
    text_uthmani: string;
    text_uthmani_tajweed?: string;
    page_number: number;
    juz_number: number;
  }>;
  pagination: {
    per_page: number;
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
  };
}

export interface QuranComAudioResponse {
  audio_files: Array<{
    verse_key: string;
    url: string;             // Relative: "Alafasy/mp3/001001.mp3"
  }>;
}

export interface AlQuranCloudSurahResponse {
  code: number;
  status: string;
  data: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
    ayahs: Array<{
      number: number;
      text: string;
      numberInSurah: number;
      juz: number;
      manzil: number;
      page: number;
      ruku: number;
      hizbQuarter: number;
      sajda: boolean;
    }>;
    edition: {
      identifier: string;
      language: string;
      name: string;
      englishName: string;
      format: string;
      type: string;
      direction: string;
    };
  };
}

export interface AlQuranCloudJuzResponse {
  code: number;
  status: string;
  data: {
    number: number;
    ayahs: Array<{
      number: number;
      text: string;
      numberInSurah: number;
      surah: {
        number: number;
        name: string;
        englishName: string;
        numberOfAyahs: number;
      };
      juz: number;
      manzil: number;
      page: number;
      ruku: number;
      hizbQuarter: number;
      sajda: boolean;
    }>;
    edition: {
      identifier: string;
      language: string;
      name: string;
      englishName: string;
      format: string;
      type: string;
      direction: string;
    };
  };
}
