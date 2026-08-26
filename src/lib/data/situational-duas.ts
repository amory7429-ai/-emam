// أذكار دخول وخروج الخلاء والمسجد
// Sources: Sahih Al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Sunan Al-Tirmidhi, Hisn al-Muslim

export interface SituationalDhikr {
  id: string;
  category: 'bathroom-enter' | 'bathroom-exit' | 'mosque-enter' | 'mosque-exit' | 'sleep' | 'wake';
  title: string;
  text: string;
  transliteration?: string;
  source: string;
  sourceName: string;
  sourceUrl?: string;
  repetition?: number;
  note?: string;
  verified: boolean;
}

export const BATHROOM_DUAS: SituationalDhikr[] = [
  {
    id: 'bathroom-enter',
    category: 'bathroom-enter',
    title: 'دعاء دخول الخلاء',
    text: 'بِسْمِ اللَّهِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبْثِ وَالْخَبَائِثِ',
    transliteration: 'Bismillah, Allahumma inni a\'udhu bika min al-khubthi wal-khaba\'ith',
    source: 'رواه البخاري (142) ومسلم (375)',
    sourceName: 'متفق عليه',
    sourceUrl: 'https://sunnah.com/bukhari:142',
    note: 'يُقال عند دخول الخلاء، ويستحب قول "بسم الله" أولاً',
    verified: true,
  },
  {
    id: 'bathroom-exit',
    category: 'bathroom-exit',
    title: 'دعاء الخروج من الخلاء',
    text: 'غُفْرَانَكَ، الْحَمْدُ لِلَّهِ الَّذِي أَذْهَبَ عَنِّي الْأَذَى وَعَافَانِي',
    transliteration: 'Ghufranak, alhamdulillahilladhi adh-haba \'anni al-adha wa \'afani',
    source: 'رواه ابن ماجه (345) والترمذي (7) والنسائي (29)',
    sourceName: 'سنن ابن ماجه، سنن الترمذي، سنن النسائي',
    sourceUrl: 'https://sunnah.com/ibnmajah:345',
    note: 'يُقال عند الخروج من الخلاء',
    verified: true,
  },
];

export const MOSQUE_DUAS: SituationalDhikr[] = [
  {
    id: 'mosque-enter',
    category: 'mosque-enter',
    title: 'دعاء دخول المسجد',
    text: 'بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    transliteration: 'Bismillah, was-salatu was-salamu \'ala rasulillah, Allahumma iftah li abwaba rahmatik',
    source: 'رواه مسلم (713) وأبو داود (465) وابن ماجه (771)',
    sourceName: 'صحيح مسلم، سنن أبي داود، سنن ابن ماجه',
    sourceUrl: 'https://sunnah.com/muslim:713',
    note: 'يُقال عند دخول المسجد، ويستحب تقديم الرجل اليمنى',
    verified: true,
  },
  {
    id: 'mosque-exit',
    category: 'mosque-exit',
    title: 'دعاء الخروج من المسجد',
    text: 'بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    transliteration: 'Bismillah, was-salatu was-salamu \'ala rasulillah, Allahumma inni as\'aluka min fadlik',
    source: 'رواه مسلم (713) وأبو داود (466) وابن ماجه (772)',
    sourceName: 'صحيح مسلم، سنن أبي داود، سنن ابن ماجه',
    sourceUrl: 'https://sunnah.com/muslim:713',
    note: 'يُقال عند الخروج من المسجد، ويستحب تقديم الرجل اليسرى',
    verified: true,
  },
];

export const SLEEP_WAKE_DUAS: SituationalDhikr[] = [
  {
    id: 'sleep-1',
    category: 'sleep',
    title: 'دعاء النوم (1)',
    text: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ',
    transliteration: 'Bismika rabbi wada\'tu janbi, wa bika arfa\'uhu...',
    source: 'رواه البخاري (6324) ومسلم (2713)',
    sourceName: 'متفق عليه',
    sourceUrl: 'https://sunnah.com/bukhari:6324',
    note: 'يُقال عند إرادة النوم',
    verified: true,
  },
  {
    id: 'sleep-2',
    category: 'sleep',
    title: 'آية الكرسي قبل النوم',
    text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...',
    source: 'رواه البخاري (282) ومسلم (2698)',
    sourceName: 'متفق عليه',
    note: 'من قرأها عند النوم حفظه الله حتى يصبح',
    verified: true,
  },
  {
    id: 'sleep-3',
    category: 'sleep',
    title: 'سورة الإخلاص والمعوذتين والنفث والمسح',
    text: 'قُلْ هُوَ اللَّهُ أَحَدٌ... قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ... قُلْ أَعُوذُ بِرَبِّ النَّاسِ...',
    source: 'رواه البخاري (5017) ومسلم (2713)',
    sourceName: 'متفق عليه',
    note: 'تُقرأ ثلاث مرات، ثم ينفث في يديه ويمسح بهما جسده',
    verified: true,
  },
  {
    id: 'sleep-4',
    category: 'sleep',
    title: 'اللهم قني عذابك يوم تبعث عبادك',
    text: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
    source: 'رواه أبو داود (5074) والترمذي (3395)',
    sourceName: 'سنن أبي داود، سنن الترمذي',
    repetition: 3,
    note: 'تُقال ثلاث مرات عند النوم',
    verified: true,
  },
  {
    id: 'wake-1',
    category: 'wake',
    title: 'دعاء الاستيقاظ من النوم',
    text: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: 'Alhamdulillahilladhi ahyana ba\'da ma amatana wa ilayhin-nushur',
    source: 'رواه البخاري (6312) ومسلم (2711)',
    sourceName: 'متفق عليه',
    sourceUrl: 'https://sunnah.com/bukhari:6312',
    note: 'يُقال عند الاستيقاظ من النوم',
    verified: true,
  },
  {
    id: 'wake-2',
    category: 'wake',
    title: 'لا إله إلا الله وحده لا شريك له (عند الاستيقاظ)',
    text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    source: 'رواه البخاري (6313)',
    sourceName: 'صحيح البخاري',
    note: 'من قالها حين يستيقظ من نومه غفرت ذنوبه',
    verified: true,
  },
];

export const ALL_SITUATIONAL_DUAS = [
  ...BATHROOM_DUAS,
  ...MOSQUE_DUAS,
  ...SLEEP_WAKE_DUAS,
];

export function getDuasByCategory(category: SituationalDhikr['category']): SituationalDhikr[] {
  return ALL_SITUATIONAL_DUAS.filter(d => d.category === category);
}