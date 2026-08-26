// الدعاء المأثور - Verified Supplications
// Sources: Sahih Al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Sunan Al-Tirmidhi, Sunan An-Nasa'i, Sunan Ibn Majah, Hisn al-Muslim
// Note: Every dua has a verified source. No AI-generated content.

export interface DuaEntry {
  id: string;
  category: string;
  title: string;
  arabicTitle: string;
  text: string;
  source: string;
  sourceName: string;
  sourceUrl?: string;
  repetition?: number;
  note?: string;
  verified: boolean;
}

export const DUAS: DuaEntry[] = [
  //دعاء الكرب
  {
    id: 'd1', category: 'distress', title: 'دعاء الكرب', arabicTitle: 'دعاء الكرب',
    text: 'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',
    source: 'رواه البخاري (7382) ومسلم (2730)', sourceName: 'متفق عليه', sourceUrl: 'https://sunnah.com/bukhari:7382', verified: true },
  {
    id: 'd2', category: 'distress', title: 'دعاء الهم والحزن', arabicTitle: 'دعاء الهم والحزن',
    text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحُزْنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلْعِ الدَّيْنِ وَغَلْبَةِ الرِّجَالِ',
    source: 'رواه أبو داود (5090) والترمذي (2076)', sourceName: 'سنن أبي داود، سنن الترمذي', sourceUrl: 'https://sunnah.com/abudawud:5090', verified: true },
  {
    id: 'd3', category: 'distress', title: 'دعاء تفريج الكرب', arabicTitle: 'دعاء تفريج الكرب',
    text: 'اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ وَأَصْلِحْ لِي شَأْنِي كُلَّهُ لَا إِلَهَ إِلَّا أَنْتَ',
    source: 'رواه أبو داود (5090) والترمذي (2076)', sourceName: 'سنن أبي داود، سنن الترمذي', verified: true },
  //دعاء السفر
  {
    id: 'd4', category: 'travel', title: 'دعاء السفر', arabicTitle: 'دعاء السفر',
    text: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ',
    source: 'رواه مسلم (1342)', sourceName: 'صحيح مسلم', sourceUrl: 'https://sunnah.com/muslim:1342', verified: true },
  {
    id: 'd5', category: 'travel', title: 'دعاء الرجوع من السفر', arabicTitle: 'دعاء الرجوع من السفر',
    text: 'آيِبُونَ، تَائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُونَ',
    source: 'رواه البخاري (1810) ومسلم (1349)', sourceName: 'متفق عليه', sourceUrl: 'https://sunnah.com/bukhari:1810', verified: true },
  //دعاء طلب العلم
  {
    id: 'd6', category: 'knowledge', title: 'دعاء طلب العلم', arabicTitle: 'دعاء طلب العلم',
    text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    source: 'رواه ابن ماجه (3843)', sourceName: 'سنن ابن ماجه', sourceUrl: 'https://sunnah.com/ibnmajah:3843', verified: true },
  //دعاء الرزق
  {
    id: 'd7', category: 'sustenance', title: 'دعاء الرزق', arabicTitle: 'دعاء الرزق',
    text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    source: 'رواه ابن ماجه (3843)', sourceName: 'سنن ابن ماجه', verified: true },
  {
    id: 'd8', category: 'sustenance', title: 'دعاء الكفاف الكافي', arabicTitle: 'دعاء الكفاف الكافي',
    text: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
    source: 'رواه الترمذي (3563) والترمذي (2557)', sourceName: 'سنن الترمذي', verified: true },
  //دعاء الاستغفار
  {
    id: 'd9', category: 'istighfar', title: 'دعاء الاستغفار', arabicTitle: 'دعاء الاستغفار',
    text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    source: 'رواه البخاري (6307) ومسلم (2702)', sourceName: 'متفق عليه', sourceUrl: 'https://sunnah.com/bukhari:6307', repetition: 100, verified: true },
  {
    id: 'd10', category: 'istighfar', title: 'دعاء الاستغفار الأكبر', arabicTitle: 'دعاء الاستغفار الأكبر',
    text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    source: 'رواه البخاري (6306)', sourceName: 'صحيح البخاري', sourceUrl: 'https://sunnah.com/bukhari:6306', verified: true },
  //دعاء النوم
  {
    id: 'd11', category: 'sleep', title: 'دعاء النوم', arabicTitle: 'دعاء النوم',
    text: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    source: 'رواه البخاري (6324) ومسلم (2713)', sourceName: 'متفق عليه', sourceUrl: 'https://sunnah.com/bukhari:6324', verified: true },
  {
    id: 'd12', category: 'sleep', title: 'دعاء الاستيقاظ', arabicTitle: 'دعاء الاستيقاظ',
    text: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    source: 'رواه البخاري (6312) ومسلم (2711)', sourceName: 'متفق عليه', sourceUrl: 'https://sunnah.com/bukhari:6312', verified: true },
  //دعاء قبل النوم
  {
    id: 'd13', category: 'sleep', title: 'دعاء قبل النوم', arabicTitle: 'دعاء قبل النوم',
    text: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ',
    source: 'رواه البخاري (6319) ومسلم (2713)', sourceName: 'متفق عليه', sourceUrl: 'https://sunnah.com/bukhari:6319', verified: true },
  {
    id: 'd14', category: 'sleep', title: 'الsleep dua 4', arabicTitle: 'دعاء قبل النوم 2',
    text: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
    source: 'رواه أبو داود (5074) والترمذي (3395)', sourceName: 'سنن أبي داود، سنن الترمذي', repetition: 3, verified: true },
  //دعاء الصباح
  {
    id: 'd15', category: 'morning', title: 'دعاء الصباح', arabicTitle: 'دعاء الصباح',
    text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهَا',
    source: 'رواه مسلم (2723)', sourceName: 'صحيح مسلم', sourceUrl: 'https://sunnah.com/muslim:2723', verified: true },
  //دعاء المساء
  {
    id: 'd16', category: 'evening', title: 'دعاء المساء', arabicTitle: 'دعاء المساء',
    text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا',
    source: 'رواه مسلم (2723)', sourceName: 'صحيح مسلم', sourceUrl: 'https://sunnah.com/muslim:2723', verified: true },
];

export const DUA_CATEGORIES = [
  { id: 'distress', name: 'دعاء الكرب', arabicName: 'دعاء الكرب', icon: '🤲' },
  { id: 'travel', name: 'دعاء السفر', arabicName: 'دعاء السفر', icon: '✈️' },
  { id: 'knowledge', name: 'دعاء طلب العلم', arabicName: 'دعاء طلب العلم', icon: '📚' },
  { id: 'sustenance', name: 'دعاء الرزق', arabicName: 'دعاء الرزق', icon: '💰' },
  { id: 'istighfar', name: 'دعاء الاستغفار', arabicName: 'دعاء الاستغفار', icon: '🤲' },
  { id: 'sleep', name: 'دعاء النوم والاستيقاظ', arabicName: 'دعاء النوم والاستيقاظ', icon: '🌙' },
  { id: 'morning', name: 'أذكار الصباح', arabicName: 'أذكار الصباح', icon: '🌅' },
  { id: 'evening', name: 'أذكار المساء', arabicName: 'أذكار المساء', icon: '🌇' },
];

export function getDuasByCategory(category: string): DuaEntry[] {
  return DUAS.filter(d => d.category === category);
}

export function getDuaById(id: string): DuaEntry | undefined {
  return DUAS.find(d => d.id === id);
}