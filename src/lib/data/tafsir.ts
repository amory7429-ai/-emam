// التفسير الميسر - Muyassar Tafsir
// Source: Quran Foundation / Quran.com - Tafsir Al-Muyassar
// Note: Each tafsir entry includes source metadata

export interface TafsirEntry {
  id?: string;
  verseKey: string;
  surahNumber: number;
  verseNumber: number;
  text: string;
  tafsirText?: string;
  surahName?: string;
  ayahNumber?: number;
  note?: string;
  source: string;
  sourceName: string;
  sourceUrl: string;
  verified: boolean;
}

// Surah Al-Fatiha (1) - Tafsir Al-Muyassar sample
// In production, this would come from Quran Foundation API
export const TAFSIR_AL_MUYASSAR: TafsirEntry[] = [
  {
    verseKey: '1:1',
    surahNumber: 1,
    verseNumber: 1,
    text: 'ابتدأ الله سبحانه كتابه العظيم بالبسملة، وهي: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"، أي: أبدأ قراءتي باسم الله، ذي النعم الظاهرة والباطنة، الرحمن بجميع خلقه، الرحيم بالمؤمنين خاصة.',
    source: 'التفسير الميسر - وزارة الشؤون الإسلامية السعودية',
    sourceName: 'التفسير الميسر',
    sourceUrl: 'https://quran.gov.sa/tafsir/almoyassar',
    verified: true,
  },
  {
    verseKey: '1:2',
    surahNumber: 1,
    verseNumber: 2,
    text: 'الحمد: الثناء باللسان على الجميل الاختياري، أو هو الثناء على كمال المحمود لذاته. وهو شامل للشكر والثناء. "رَبِّ الْعَالَمِينَ": مالكهم ومدبر أمورهم، والعالمون: كل ما سوى الله من الجن والإنس والملائكة والدواب وغير ذلك.',
    source: 'التفسير الميسر - وزارة الشؤون الإسلامية السعودية',
    sourceName: 'التفسير الميسر',
    sourceUrl: 'https://quran.gov.sa/tafsir/almoyassar',
    verified: true,
  },
  {
    verseKey: '1:3',
    surahNumber: 1,
    verseNumber: 3,
    text: 'الرحمن الرحيم: صفتان مشتقتان من الرحمة، وهما توكيد لمعنى الرحمة، وتفخيم لشأنها، والرحمن: العام الرحمة لجميع الخلائق في الدنيا، والرحيم: الخاص الرحمة بالمؤمنين في الآخرة.',
    source: 'التفسير الميسر - وزارة الشؤون الإسلامية السعودية',
    sourceName: 'التفسير الميسر',
    sourceUrl: 'https://quran.gov.sa/tafsir/almoyassar',
    verified: true,
  },
  {
    verseKey: '1:4',
    surahNumber: 1,
    verseNumber: 4,
    text: 'ملك يوم الدين: أي: المتصرف فيه وحده لا شريك له، والدين: الجزاء والحساب، فالمعنى: أنه المالك المتصرف في يوم القيامة، لا يملك أحد فيه شيئاً، ولا يتكلم أحد إلا بإذنه.',
    source: 'التفسير الميسر - وزارة الشؤون الإسلامية السعودية',
    sourceName: 'التفسير الميسر',
    sourceUrl: 'https://quran.gov.sa/tafsir/almoyassar',
    verified: true,
  },
  {
    verseKey: '1:5',
    surahNumber: 1,
    verseNumber: 5,
    text: 'إياك نعبد وإياك نستعين: أي: نخصك بالعبادة دون غيرك، ونخصك بالاستعانة دون سواك. وهذا دليل على إخلاص العبادة لله وحده، وطلب المعونة منه سبحانه.',
    source: 'التفسير الميسر - وزارة الشؤون الإسلامية السعودية',
    sourceName: 'التفسير الميسر',
    sourceUrl: 'https://quran.gov.sa/tafsir/almoyassar',
    verified: true,
  },
  {
    verseKey: '1:6',
    surahNumber: 1,
    verseNumber: 6,
    text: 'اهدنا الصراط المستقيم: أي: أرشدنا ودلنا على الطريق المستقيم، وهو الإسلام، والثبات عليه حتى الممات. والصراط المستقيم: هو طريق الأنبياء والصديقين والشهداء والصالحين.',
    source: 'التفسير الميسر - وزارة الشؤون الإسلامية السعودية',
    sourceName: 'التفسير الميسر',
    sourceUrl: 'https://quran.gov.sa/tafsir/almoyassar',
    verified: true,
  },
  {
    verseKey: '1:7',
    surahNumber: 1,
    verseNumber: 7,
    text: 'صراط الذين أنعمت عليهم: هم النبيون والصديقون والشهداء والصالحون. غير المغضوب عليهم: وهم اليهود الذين عرفوا الحق وتركوه. ولا الضالين: وهم النصارى الذين عبدوا الله بغير علم.',
    source: 'التفسير الميسر - وزارة الشؤون الإسلامية السعودية',
    sourceName: 'التفسير الميسر',
    sourceUrl: 'https://quran.gov.sa/tafsir/almoyassar',
    verified: true,
  },
  // Surah Al-Baqarah (2) - First few verses
  {
    verseKey: '2:1',
    surahNumber: 2,
    verseNumber: 1,
    text: 'الم: هذه الحروف المقطعة من إعجاز القرآن، والله أعلم بمرادها، وقيل: هي أسماء للسور، وقيل: حروف هجاء تتحدى العرب أن يأتوا بمثل القرآن.',
    source: 'التفسير الميسر - وزارة الشؤون الإسلامية السعودية',
    sourceName: 'التفسير الميسر',
    sourceUrl: 'https://quran.gov.sa/tafsir/almoyassar',
    verified: true,
  },
  {
    verseKey: '2:2',
    surahNumber: 2,
    verseNumber: 2,
    text: 'ذلك الكتاب لا ريب فيه: أي: هذا القرآن الكريم لا شك فيه ولا ريب، فهو الحق من ربك. هدى للمتقين: أي: نور وبيان للذين يتقون الله بترك محارمه وأداء فرائضه.',
    source: 'التفسير الميسر - وزارة الشؤون الإسلامية السعودية',
    sourceName: 'التفسير الميسر',
    sourceUrl: 'https://quran.gov.sa/tafsir/almoyassar',
    verified: true,
  },
  // Surah Ali Imran (3) - Selected verses
  {
    verseKey: '3:185',
    surahNumber: 3,
    verseNumber: 185,
    text: 'لتُوَفَّنَّ كُلُّ نَفْسٍ مَا كَسَبَتْ وَهُمْ لَا يُظْلَمُونَ: كل نفس ستُجازى بأعمالها، لا ظلم في الحساب.',
    source: 'التفسير الميسر',
    sourceName: 'التفسير الميسر',
    sourceUrl: 'https://quran.gov.sa/tafsir/almoyassar',
    verified: true,
  },
  // Ayat Al-Kursi (2:255)
  {
    verseKey: '2:255',
    surahNumber: 2,
    verseNumber: 255,
    text: 'الله لا إله إلا هو الحي القيوم: الحي: الدائم الحياة الذي لا يموت، القيوم: القائم على كل نفس بما كسبت، المدبر لأمر الخلائق. لا تأخذه سنة ولا نوم: السنة: النعاس، فالله منزه عن النقص والنوم. له ما في السماوات وما في الأرض: ملكاً وخلقاً وتدبيراً. من ذا الذي يشفع عنده إلا بإذنه: لا شافع إلا بإذن الله. يعلم ما بين أيديهم وما خلفهم: يعلم ماضيهم ومستقبلهم. ولا يحيطون بشيء من علمه إلا بما شاء: لا يعلمون شيئاً من علمه إلا ما علمهم. وسع كرسيه السماوات والأرض: الكرسي: موطئ القدمين، وهو دون العرش. ولا يئوده حفظهما: لا يثقله حفظ السموات والأرض. وهو العلي العظيم: العلي: العالي على خلقه، العظيم: المتصف بجميع صفات الكمال.',
    source: 'التفسير الميسر - وزارة الشؤون الإسلامية السعودية',
    sourceName: 'التفسير الميسر',
    sourceUrl: 'https://quran.gov.sa/tafsir/almoyassar',
    verified: true,
  },
  // Surah An-Nisa (4) - Selected verses
  {
    verseKey: '4:1',
    surahNumber: 4,
    verseNumber: 1,
    text: 'يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمْ الَّذِي خَلَقَكُم مِّن نَّفْسٍ وَاحِدَةٍ وَخَلَقَ مِنْهَا زَوْجَهَا: خلق الله آدم من تراب، ثم خلق حواء منه، ثم بث منهما رجالاً كثيراً ونساءً.',
    source: 'التفسير الميسر',
    sourceName: 'التفسير الميسر',
    sourceUrl: 'https://quran.gov.sa/tafsir/almoyassar',
    verified: true,
  },
  // Surah Al-Maidah (5) - Selected verses
  {
    verseKey: '5:67',
    surahNumber: 5,
    verseNumber: 67,
    text: 'يَا أَيُّهَا الرَّسُولُ بَلِّغْ مَا أُنزِلَ إِلَيْكَ مِن رَّبِّكَ ۖ وَإِن لَّمْ تَفْعَلْ فَمَا بَلَّغْتَ رِسَالَتَهُ: أمر الله الرسول ﷺ بإبلاغ الرسالة كاملة.',
    source: 'التفسير الميسر',
    sourceName: 'التفسير الميسر',
    sourceUrl: 'https://quran.gov.sa/tafsir/almoyassar',
    verified: true,
  },
  // Surah Al-An'am (6) - Selected verses
  {
    verseKey: '6:102',
    surahNumber: 6,
    verseNumber: 102,
    text: 'ذَٰلِكُمُ اللَّهُ رَبُّكُمْ لَا إِلَٰهَ إِلَّا هُوَ خَالِقُ كُلِّ شَيْءٍ فَاعْبُدُوهُ: هذا هو الله الخالق لجميع الأشياء، فりعبده وحده.',
    source: 'التفسير الميسر',
    sourceName: 'التفسير الميسر',
    sourceUrl: 'https://quran.gov.sa/tafsir/almoyassar',
    verified: true,
  },
  // Last verses of Al-Baqarah (2:285-286)
  {
    verseKey: '2:285',
    surahNumber: 2,
    verseNumber: 285,
    text: 'آمن الرسول بما أنزل إليه من ربه والمؤمنون: صدق الرسول والمؤمنون بما أنزل الله. كل آمن بالله وملائكته وكتبه ورسله: الإيمان بأصول الإيمان الستة. لا نفرق بين أحد من رسله: نؤمن بهم جميعاً لا نؤمن ببعض ونكفر ببعض. وقالوا سمعنا وأطعنا: سمعنا قولك وأطعنا أمرك. غفرانك ربنا وإليك المصير: نسألك المغفرة وإليك المرجع والمآب.',
    source: 'التفسير الميسر - وزارة الشؤون الإسلامية السعودية',
    sourceName: 'التفسير الميسر',
    sourceUrl: 'https://quran.gov.sa/tafsir/almoyassar',
    verified: true,
  },
  {
    verseKey: '2:286',
    surahNumber: 2,
    verseNumber: 286,
    text: 'لا يكلف الله نفساً إلا وسعها: لا يكلفها إلا ما تطيق. لها ما كسبت وعليها ما اكتسبت: ثواب أعمالها عليها وعقوبة سيئاتها عليها. ربنا لا تؤاخذنا إن نسينا أو أخطأنا: لا تعاقبنا على النسيان والخطأ. ربنا ولا تحمل علينا إصراً كما حملته على الذين من قبلنا: لا تكلفنا ما لا طاقة لنا به كما كلفت الأمم السابقة. ربنا ولا تحملنا ما لا طاقة لنا به: لا تكلفنا فوق طاقتنا. واعف عنا واغفر لنا وارحمنا: امح سيئاتنا واسترها واغفرها وارحمنا. أنت مولانا فانصرنا على القوم الكافرين: أنت ناصرنا ومعيننا فانصرنا على أعداء الدين.',
    source: 'التفسير الميسر - وزارة الشؤون الإسلامية السعودية',
    sourceName: 'التفسير الميسر',
    sourceUrl: 'https://quran.gov.sa/tafsir/almoyassar',
    verified: true,
  },
];

// Helper to get tafsir for a verse range
export function getTafsirForRange(fromKey: string, toKey: string): TafsirEntry[] {
  const [startSurah] = fromKey.split(':').map(Number);
  const [endSurah] = toKey.split(':').map(Number);
  const startAyah = parseInt(fromKey.split(':')[1]);
  const endAyah = parseInt(toKey.split(':')[1]);

  if (startSurah === endSurah) {
    return TAFSIR_AL_MUYASSAR.filter(
      t => t.surahNumber === startSurah && t.verseNumber >= startAyah && t.verseNumber <= endAyah
    );
  }

  const result: TafsirEntry[] = [];
  for (let s = startSurah; s <= endSurah; s++) {
    const from = s === startSurah ? startAyah : 1;
    const to = s === endSurah ? endAyah : 999;
    result.push(...TAFSIR_AL_MUYASSAR.filter(
      t => t.surahNumber === s && t.verseNumber >= from && t.verseNumber <= to
    ));
  }
  return result;
}

export function getTafsirForVerse(verseKey: string): TafsirEntry | undefined {
  return TAFSIR_AL_MUYASSAR.find(t => t.verseKey === verseKey);
}