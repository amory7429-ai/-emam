// التسبيح - Tasbih Counter
// Sources: Sahih Al-Bukhari, Sahih Muslim, Hisn al-Muslim
// Note: These are verified adhkar with prescribed counts. No claims about specific rewards beyond what's in hadith.

export interface TasbihPreset {
  id: string;
  name: string;
  arabicName: string;
  text: string;
  defaultCount: number;
  source: string;
  sourceName: string;
  sourceUrl?: string;
  category: 'morning' | 'evening' | 'after_salah' | 'general' | 'sleep';
  verified: boolean;
}

export const TASBIH_PRESETS: TasbihPreset[] = [
  // Morning/Evening Adhkar
  {
    id: 'subhanallah-bihamdihi-100',
    name: 'Subhan Allah wa bihamdihi',
    arabicName: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
    text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    defaultCount: 100,
    source: 'رواه البخاري (6406) ومسلم (2691)',
    sourceName: 'متفق عليه',
    sourceUrl: 'https://sunnah.com/bukhari:6406',
    category: 'morning',
    verified: true,
  },
  {
    id: 'la-ilaha-illa-allah-100',
    name: 'La ilaha illa Allah',
    arabicName: 'لَا إِلَهَ إِلَّا اللَّهُ',
    text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    defaultCount: 100,
    source: 'رواه البخاري (3293) ومسلم (2691)',
    sourceName: 'متفق عليه',
    sourceUrl: 'https://sunnah.com/bukhari:3293',
    category: 'morning',
    verified: true,
  },
  {
    id: 'subhanallah-walhamdulillah-100',
    name: 'Subhan Allah, Alhamdulillah, La ilaha illa Allah, Allahu Akbar',
    arabicName: 'سُبْحَانَ اللهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ',
    text: 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ',
    defaultCount: 100,
    source: 'رواه مسلم (2691)',
    sourceName: 'صحيح مسلم',
    sourceUrl: 'https://sunnah.com/muslim:2691',
    category: 'morning',
    verified: true,
  },
  {
    id: 'la-hawla-wala-quwwata-100',
    name: 'La hawla wa la quwwata illa billah',
    arabicName: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    defaultCount: 100,
    source: 'رواه البخاري (7384) ومسلم (2704)',
    sourceName: 'متفق عليه',
    sourceUrl: 'https://sunnah.com/bukhari:7384',
    category: 'general',
    verified: true,
  },
  {
    id: 'astaghfirullah-100',
    name: 'Astaghfirullah',
    arabicName: 'أَسْتَغْفِرُ اللهَ',
    text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    defaultCount: 100,
    source: 'رواه البخاري (6307) ومسلم (2702)',
    sourceName: 'متفق عليه',
    sourceUrl: 'https://sunnah.com/bukhari:6307',
    category: 'general',
    verified: true,
  },
  {
    id: 'subhanallah-33-hamd-33-allahu-33',
    name: 'Tasbih Fatimah',
    arabicName: 'تَسْبِيحُ فَاطِمَةَ',
    text: 'سُبْحَانَ اللهِ (٣٣)، الْحَمْدُ لِلَّهِ (٣٣)، اللهُ أَكْبَرُ (٣٤)',
    defaultCount: 100,
    source: 'رواه البخاري (3113) ومسلم (2728)',
    sourceName: 'متفق عليه',
    sourceUrl: 'https://sunnah.com/bukhari:3113',
    category: 'after_salah',
    verified: true,
  },
  {
    id: 'subhanallah-10-hamd-10-allahu-10',
    name: 'After Salah Tasbih (10 each)',
    arabicName: 'تَسْبِيحُ مَا بَعْدَ الصَّلَاةِ',
    text: 'سُبْحَانَ اللهِ (١٠)، الْحَمْدُ لِلَّهِ (١٠)، اللهُ أَكْبَرُ (١٠)',
    defaultCount: 30,
    source: 'رواه الترمذي (3410) والنسائي (1348)',
    sourceName: 'سنن الترمذي، سنن النسائي',
    sourceUrl: 'https://sunnah.com/tirmidhi:3410',
    category: 'after_salah',
    verified: true,
  },
  {
    id: 'la-ilaha-illa-allah-wahdahu-10',
    name: 'La ilaha illa Allah wahdahu',
    arabicName: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ',
    text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    defaultCount: 10,
    source: 'رواه البخاري (3293) ومسلم (2691)',
    sourceName: 'متفق عليه',
    sourceUrl: 'https://sunnah.com/bukhari:3293',
    category: 'after_salah',
    verified: true,
  },
  {
    id: 'ayat-kursi',
    name: 'Ayat al-Kursi',
    arabicName: 'آيَةُ الْكُرْسِيِّ',
    text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...',
    defaultCount: 1,
    source: 'رواه البخاري (282) ومسلم (2698)',
    sourceName: 'متفق عليه',
    sourceUrl: 'https://sunnah.com/bukhari:282',
    category: 'sleep',
    verified: true,
  },
  {
    id: 'ikhlas-muawwidhatayn-3',
    name: 'Al-Ikhlas and Mu\'awwidhatayn',
    arabicName: 'الإِخْلَاصُ وَالْمُعَوِّذَتَانِ',
    text: 'قُلْ هُوَ اللَّهُ أَحَدٌ، قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    defaultCount: 3,
    source: 'رواه أبو داود (5082) والترمذي (3575)',
    sourceName: 'سنن أبي داود، سنن الترمذي',
    sourceUrl: 'https://sunnah.com/abudawud:5082',
    category: 'sleep',
    verified: true,
  },
  {
    id: 'sleep-dua-3',
    name: 'Allahumma qini adhabak',
    arabicName: 'اللَّهُمَّ قِنِي عَذَابَكَ',
    text: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
    defaultCount: 3,
    source: 'رواه أبو داود (5074) والترمذي (3395)',
    sourceName: 'سنن أبي داود، سنن الترمذي',
    sourceUrl: 'https://sunnah.com/abudawud:5074',
    category: 'sleep',
    verified: true,
  },
];

export const TASBIH_CATEGORIES = [
  { id: 'morning', name: 'أذكار الصباح', arabicName: 'أذكار الصباح' },
  { id: 'evening', name: 'أذكار المساء', arabicName: 'أذكار المساء' },
  { id: 'after_salah', name: 'بعد الصلاة', arabicName: 'بعد الصلاة' },
  { id: 'sleep', name: 'قبل النوم', arabicName: 'قبل النوم' },
  { id: 'general', name: 'عام', arabicName: 'عام' },
];

export interface TasbihSession {
  id: string;
  presetId: string;
  startTime: string;
  endTime?: string;
  targetCount: number;
  completedCount: number;
  completed: boolean;
}

export const TASBIH_STORAGE_KEY = 'rafiq-tasbih-sessions';

export function getTasbihPresetsByCategory(category: string): typeof TASBIH_PRESETS {
  return TASBIH_PRESETS.filter(p => p.category === category);
}

export function getTasbihPresetById(id: string): TasbihPreset | undefined {
  return TASBIH_PRESETS.find(p => p.id === id);
}