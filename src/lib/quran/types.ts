// Quran.com API v4 types
// Verified against live API responses and Quran Foundation documentation (2026-08-24)

export interface Surah {
  id: number;
  nameSimple: string;
  nameComplex: string;
  nameArabic: string;
  versesCount: number;
  revelationPlace: string;
  revelationOrder: number;
  bismillahPre: boolean;
  pages: [number, number];
}

export interface Verse {
  id: number;
  verseKey: string;
  surahNumber: number;
  verseNumber: number;
  textUthmani: string;
  textUthmaniTajweed?: string;
  juz: number;
  hizb: number;
  rubElHizb: number;
  page: number;
  ruku: number;
  manzil: number;
  sajdahNumber: number | null;
}

export interface VerseWord {
  id: number;
  position: number;
  text: string;
  charTypeName: string;
  pageNumber: number;
  lineNumber: number;
  audioUrl: string | null;
  translation?: string;
  transliteration?: string;
}

export interface VerseWithWords extends Verse {
  words: VerseWord[];
  imageUrl?: string;
  imageWidth?: number;
}

export interface PassageRange {
  surahNumber: number;
  surahName: string;
  startAyah: number;
  endAyah: number;
}

export interface WordTiming {
  verseKey: string;
  wordIndex: number;
  startMs: number;
  endMs: number;
  isEstimate: boolean;
}

export interface Juz {
  number: number;
  startVerseKey: string;
  endVerseKey: string;
  startSurah: number;
  endSurah: number;
  totalVerses: number;
}

export interface AudioSource {
  verseKey: string;
  reciterName: string;
  reciterId: number;
  url: string;
  relativePath: string;
  format: string;
}

export interface AudioConfig {
  baseUrl: string;
  reciterPath: string;
  reciterId: number;
  reciterName: string;
}

/** Reciter with Ayah-by-Ayah audio verified from Quran Foundation API */
export interface Reciter {
  id: number;
  name: string;
  nameArabic: string;
  style?: string;
  audioBaseUrl: string;
  urlPattern: 'quran-foundation' | 'quranicaudio-protocol-relative';
  verified: boolean;
}

/**
 * Available reciters with Ayah-by-Ayah audio (verified from API 2026-08-24)
 * 
 * User requested 12 reciters. API verification results:
 * ✓ Alafasy (7) - Available
 * ✓ Husary Murattal (6) - Available  
 * ✓ Minshawi Murattal (9) - Available
 * ✗ Ali Al-Banna - NOT available in Ayah-by-Ayah API → Replaced with Husary Muallim (12)
 * ✗ Yasser Al-Dosari - NOT available in Ayah-by-Ayah API → Replaced with Sudais (3)
 * ✗ Maher Al-Muaiqly - NOT available in Ayah-by-Ayah API → Replaced with Rifai (5)
 * ✗ Mahmoud Ali Al-Banna - NOT available in Ayah-by-Ayah API → Replaced with Tablawi (11)
 * ✓ AbdulBaset AbdulSamad Murattal (2) - Available
 * ✓ Saud Ash-Shuraym (10) - Available
 * ✗ Saad Al-Ghamdi - NOT available in Ayah-by-Ayah API → Replaced with AbdulBaset Mujawwad (1)
 * ✓ Abu Bakr Ash-Shatri (4) - Available
 * ✗ Mohamed Ayoub - NOT available in Ayah-by-Ayah API → Replaced with Minshawi Mujawwad (8)
 */
export const AVAILABLE_RECITERS: Reciter[] = [
  {
    id: 7,
    name: 'Mishari Rashid al-Afasy',
    nameArabic: 'مشاري راشد العفاسي',
    audioBaseUrl: 'https://verses.quran.foundation',
    urlPattern: 'quran-foundation',
    verified: true,
  },
  {
    id: 6,
    name: 'Mahmoud Khalil Al-Husary',
    nameArabic: 'محمود خليل الحصري',
    style: 'Murattal',
    audioBaseUrl: 'https://mirrors.quranicaudio.com',
    urlPattern: 'quranicaudio-protocol-relative',
    verified: true,
  },
  {
    id: 9,
    name: 'Mohamed Siddiq Al-Minshawi',
    nameArabic: 'محمد صديق المنشاوي',
    style: 'Murattal',
    audioBaseUrl: 'https://verses.quran.foundation',
    urlPattern: 'quran-foundation',
    verified: true,
  },
  {
    id: 12,
    name: 'Mahmoud Khalil Al-Husary',
    nameArabic: 'محمود خليل الحصري',
    style: 'Muallim',
    audioBaseUrl: 'https://mirrors.quranicaudio.com',
    urlPattern: 'quranicaudio-protocol-relative',
    verified: true,
  },
  {
    id: 3,
    name: 'Abdur-Rahman as-Sudais',
    nameArabic: 'عبد الرحمن السديس',
    audioBaseUrl: 'https://verses.quran.foundation',
    urlPattern: 'quran-foundation',
    verified: true,
  },
  {
    id: 5,
    name: 'Hani ar-Rifai',
    nameArabic: 'هاني الرفاعي',
    audioBaseUrl: 'https://verses.quran.foundation',
    urlPattern: 'quran-foundation',
    verified: true,
  },
  {
    id: 11,
    name: 'Mohamed al-Tablawi',
    nameArabic: 'محمد الطبلاوي',
    audioBaseUrl: 'https://mirrors.quranicaudio.com',
    urlPattern: 'quranicaudio-protocol-relative',
    verified: true,
  },
  {
    id: 2,
    name: 'AbdulBaset AbdulSamad',
    nameArabic: 'عبد الباسط عبد الصمد',
    style: 'Murattal',
    audioBaseUrl: 'https://verses.quran.foundation',
    urlPattern: 'quran-foundation',
    verified: true,
  },
  {
    id: 10,
    name: "Sa'ud ash-Shuraym",
    nameArabic: 'سعود الشريم',
    audioBaseUrl: 'https://verses.quran.foundation',
    urlPattern: 'quran-foundation',
    verified: true,
  },
  {
    id: 1,
    name: 'AbdulBaset AbdulSamad',
    nameArabic: 'عبد الباسط عبد الصمد',
    style: 'Mujawwad',
    audioBaseUrl: 'https://verses.quran.foundation',
    urlPattern: 'quran-foundation',
    verified: true,
  },
  {
    id: 4,
    name: 'Abu Bakr al-Shatri',
    nameArabic: 'أبو بكر الشاطري',
    audioBaseUrl: 'https://verses.quran.foundation',
    urlPattern: 'quran-foundation',
    verified: true,
  },
  {
    id: 8,
    name: 'Mohamed Siddiq Al-Minshawi',
    nameArabic: 'محمد صديق المنشاوي',
    style: 'Mujawwad',
    audioBaseUrl: 'https://verses.quran.foundation',
    urlPattern: 'quran-foundation',
    verified: true,
  },
];

export const DEFAULT_RECITER_ID = 7;

export function getReciterById(id: number): Reciter | undefined {
  return AVAILABLE_RECITERS.find(r => r.id === id);
}

export function getDefaultReciter(): Reciter {
  return getReciterById(DEFAULT_RECITER_ID)!;
}

export const ALAFASY_AUDIO: AudioConfig = {
  baseUrl: "https://verses.quran.foundation",
  reciterPath: "Alafasy/mp3",
  reciterId: 7,
  reciterName: "Mishari Rashid al-`Afasy",
};
