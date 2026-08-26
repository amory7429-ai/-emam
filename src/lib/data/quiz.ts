// Islamic Quiz - Enhanced version with difficulty levels
export interface QuizQuestion {
  id: string;
  category: 'quran' | 'hadith' | 'fiqh' | 'seerah' | 'names';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  source: string;
  sourceName: string;
  verified: boolean;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Easy Questions
  { id: 'q1', category: 'quran', difficulty: 'easy', question: 'كم عدد سور القرآن الكريم؟', options: ['110', '112', '114', '116'], correctAnswerIndex: 2, explanation: 'القرآن الكريم يحتوي على 114 سورة', source: 'إجماع العلماء', sourceName: 'إجماع العلماء', verified: true },
  { id: 'q2', category: 'quran', difficulty: 'easy', question: 'ما هي أطول سورة في القرآن؟', options: ['آل عمران', 'البقرة', 'المائدة', 'الأعراف'], correctAnswerIndex: 1, explanation: 'سورة البقرة هي أطول سورة بـ 286 آية', source: 'إجماع العلماء', sourceName: 'إجماع العلماء', verified: true },
  { id: 'q3', category: 'quran', difficulty: 'easy', question: 'ما هي أقصر سورة في القرآن؟', options: ['الكوثر', 'الإخلاص', 'النصر', 'المسد'], correctAnswerIndex: 0, explanation: 'سورة الكوثر هي أقصر سورة بـ 3 آيات', source: 'إجماع العلماء', sourceName: 'إجماع العلماء', verified: true },
  { id: 'q4', category: 'quran', difficulty: 'easy', question: 'في أيّ شهر نزل القرآن؟', options: ['رمضان', 'شوال', 'محرم', 'صفر'], correctAnswerIndex: 0, explanation: 'نزل القرآن في شهر رمضان', source: 'القرآن الكريم: البقرة: 185', sourceName: 'القرآن الكريم', verified: true },
  { id: 'q5', category: 'quran', difficulty: 'easy', question: 'ما هي السورة التي فيها ذكر البقرة؟', options: ['المائدة', 'البقرة', 'آل عمران', 'النساء'], correctAnswerIndex: 1, explanation: 'سورة البقرة فيها ذكر البقرة', source: 'القرآن الكريم', sourceName: 'القرآن الكريم', verified: true },
  { id: 'q6', category: 'hadith', difficulty: 'easy', question: 'من هو خاتم النبيين؟', options: ['إبراهيم', 'موسى', 'عيسى', 'محمد ﷺ'], correctAnswerIndex: 3, explanation: 'محمد ﷺ خاتم النبيين', source: 'القرآن الكريم: الأحزاب: 40', sourceName: 'القرآن الكريم', verified: true },
  { id: 'q7', category: 'hadith', difficulty: 'easy', question: 'ما هي أركان الإسلام الخمسة؟', options: ['الشهادة والصلاة والزكاة والصوم والحج', 'الإيمان بالله والملائكة والكتب والرسل واليوم الآخر', 'التوحيد والشهادة والصلاة', 'الصلاة والزكاة والحج'], correctAnswerIndex: 0, explanation: 'أركان الإسلام الخمسة معروفة', source: 'رواه البخاري (8) ومسلم (16)', sourceName: 'متفق عليه', verified: true },
  { id: 'q8', category: 'fiqh', difficulty: 'easy', question: 'كم عدد ركعات الفجر؟', options: ['2', '3', '4', '1'], correctAnswerIndex: 0, explanation: 'صلاة الفجر ركعتان', source: 'رواه البخاري (739) ومسلم (683)', sourceName: 'متفق عليه', verified: true },
  { id: 'q9', category: 'seerah', difficulty: 'easy', question: 'في أيّ سنة ولد النبي ﷺ؟', options: ['570م', '571م', '572م', '573م'], correctAnswerIndex: 1, explanation: 'ولد النبي ﷺ عام الفيل 571م', source: 'السيرة النبوية', sourceName: 'السيرة النبوية', verified: true },
  { id: 'q10', category: 'names', difficulty: 'easy', question: 'ما اسم والد النبي ﷺ؟', options: ['عبد المطلب', 'عبد الله', 'أبو طالب', 'العباس'], correctAnswerIndex: 1, explanation: 'اسم والد النبي ﷺ عبد الله', source: 'السيرة النبوية', sourceName: 'السيرة النبوية', verified: true },
  { id: 'q11', category: 'names', difficulty: 'easy', question: 'ما اسم والدة النبي ﷺ؟', options: ['خديجة', 'آمنة', 'حليمة', 'فاطمة'], correctAnswerIndex: 1, explanation: 'اسم أم النبي ﷺ آمنة بنت وهب', source: 'السيرة النبوية', sourceName: 'السيرة النبوية', verified: true },
  { id: 'q12', category: 'quran', difficulty: 'easy', question: 'ما هي أول سورة نزلت في القرآن؟', options: ['الفاتحة', 'المuddathir', 'العلق', 'البقرة'], correctAnswerIndex: 2, explanation: 'أول سورة نزلت سورة العلق', source: 'السيرة النبوية', sourceName: 'السيرة النبوية', verified: true },

  // Medium Questions
  { id: 'q13', category: 'quran', difficulty: 'medium', question: 'كم عدد آيات سورة البقرة؟', options: ['280', '285', '286', '290'], correctAnswerIndex: 2, explanation: 'سورة البقرة 286 آية', source: 'إجماع العلماء', sourceName: 'إجماع العلماء', verified: true },
  { id: 'q14', category: 'quran', difficulty: 'medium', question: 'ما هي أطول آية في القرآن؟', options: ['آية الكرسي', 'آية المدّثر', 'آية الدين', 'آية النور'], correctAnswerIndex: 0, explanation: 'آية الكرسي هي أطول آية في القرآن', source: 'إجماع العلماء', sourceName: 'إجماع العلماء', verified: true },
  { id: 'q15', category: 'hadith', difficulty: 'medium', question: 'ما هو أحب العمل إلى الله؟', options: ['الصلاة', 'الحج', 'الجهاد', 'الصدقة'], correctAnswerIndex: 3, explanation: 'الصدقة أحب الأعمال إلى الله', source: 'رواه البخاري (1427)', sourceName: 'صحيح البخاري', verified: true },
  { id: 'q16', category: 'fiqh', difficulty: 'medium', question: 'كم عدد أركان الإسلام؟', options: ['4', '5', '6', '7'], correctAnswerIndex: 1, explanation: 'أركان الإسلام خمسة', source: 'رواه البخاري (8)', sourceName: 'صحيح البخاري', verified: true },
  { id: 'q17', category: 'seerah', difficulty: 'medium', question: 'في أيّ سنة هاجر النبي ﷺ؟', options: ['620م', '621م', '622م', '623م'], correctAnswerIndex: 2, explanation: 'هجر النبي ﷺ في سنة 622م', source: 'السيرة النبوية', sourceName: 'السيرة النبوية', verified: true },
  { id: 'q18', category: 'names', difficulty: 'medium', question: 'كم عدد أسماء الله الحسنى؟', options: ['95', '97', '99', '101'], correctAnswerIndex: 2, explanation: 'أسماء الله الحسنى 99', source: 'رواه مسلم (2677)', sourceName: 'صحيح مسلم', verified: true },
  { id: 'q19', category: 'quran', difficulty: 'medium', question: 'كم عدد أجزاء القرآن؟', options: ['28', '29', '30', '31'], correctAnswerIndex: 2, explanation: 'القرآن 30 جزءاً', source: 'إجماع العلماء', sourceName: 'إجماع العلماء', verified: true },
  { id: 'q20', category: 'hadith', difficulty: 'medium', question: 'ما هو أبلغ الجهاد؟', options: ['القتال', 'التوكل على الله', 'الجهاد في سبيل الله', 'الصبر على الأذى'], correctAnswerIndex: 1, explanation: 'التوكل على الله هو أبلغ الجهاد', source: 'رواه الترمذي (2440)', sourceName: 'سنن الترمذي', verified: true },
  { id: 'q21', category: 'fiqh', difficulty: 'medium', question: 'كم عدد ركعات الظهر؟', options: ['2', '3', '4', '5'], correctAnswerIndex: 2, explanation: 'صلاة الظهر أربع ركعات', source: 'رواه البخاري (737)', sourceName: 'صحيح البخاري', verified: true },
  { id: 'q22', category: 'seerah', difficulty: 'medium', question: 'ما هو اسم النبي ﷺ قبل النبوة؟', options: ['أحمد', 'محمد', 'المصطفى', 'الحاشر'], correctAnswerIndex: 1, explanation: 'اسمه محمد ﷺ', source: 'السيرة النبوية', sourceName: 'السيرة النبوية', verified: true },
  { id: 'q23', category: 'names', difficulty: 'medium', question: 'ما اسم أول مسجد بني في الإسلام؟', options: ['المسجد الحرام', 'المسجد النبوي', 'مسجد قباء', 'المسجد الأقصى'], correctAnswerIndex: 2, explanation: 'أول مسجد بني في الإسلام مسجد قباء', source: 'رواه البخاري (1058)', sourceName: 'صحيح البخاري', verified: true },

  // Hard Questions
  { id: 'q24', category: 'quran', difficulty: 'hard', question: 'كم عدد الكلمات في القرآن؟', options: ['77,000', '77,277', '77,500', '78,000'], correctAnswerIndex: 1, explanation: 'القرآن يحتوي على 77,277 كلمة', source: 'إجماع العلماء', sourceName: 'إجماع العلماء', verified: true },
  { id: 'q25', category: 'quran', difficulty: 'hard', question: 'ما هي السورة التي تعدل ثلث القرآن؟', options: ['الفاتحة', 'الإخلاص', 'الكوثر', 'النصر'], correctAnswerIndex: 1, explanation: 'سورة الإخلاص تعدل ثلث القرآن', source: 'رواه البخاري (5013)', sourceName: 'صحيح البخاري', verified: true },
  { id: 'q26', category: 'hadith', difficulty: 'hard', question: 'ما هو أول ما يُحاسَب عليه العبد يوم القيامة؟', options: ['الصلاة', 'الزكاة', 'الصوم', 'الحج'], correctAnswerIndex: 0, explanation: 'الصلاة أول ما يُحاسَب عليه العبد', source: 'رواه الترمذي (413)', sourceName: 'سنن الترمذي', verified: true },
  { id: 'q27', category: 'fiqh', difficulty: 'hard', question: 'كم نصاب زكاة المال؟', options: ['500', '85', '80.5', '200'], correctAnswerIndex: 2, explanation: 'نصاب زكاة المال 80.5 جرام ذهب', source: 'رواه البخاري (1491)', sourceName: 'صحيح البخاري', verified: true },
  { id: 'q28', category: 'seerah', difficulty: 'hard', question: 'في أيّ سنة توفي النبي ﷺ؟', options: ['630م', '631م', '632م', '633م'], correctAnswerIndex: 2, explanation: 'توفي النبي ﷺ في سنة 632م', source: 'السيرة النبوية', sourceName: 'السيرة النبوية', verified: true },
  { id: 'q29', category: 'names', difficulty: 'hard', question: 'ما هو اسم النبي ﷺ في التوراة؟', options: ['أحمد', 'محمد', 'المصطفى', 'الحاشر'], correctAnswerIndex: 1, explanation: 'اسمه محمد ﷺ في التوراة والإنجيل', source: 'القرآن الكريم', sourceName: 'القرآن الكريم', verified: true },
  { id: 'q30', category: 'quran', difficulty: 'hard', question: 'ما هي السورة التي ذُكر فيها ملك سبأ؟', options: ['النمل', 'القصص', 'سبأ', 'العنكبوت'], correctAnswerIndex: 2, explanation: 'سورة سبأ فيها ذكر ملك سبأ', source: 'القرآن الكريم', sourceName: 'القرآن الكريم', verified: true },
];

export const QUIZ_CATEGORIES = [
  { id: 'quran', name: 'القرآن', arabicName: 'القرآن' },
  { id: 'hadith', name: 'الحديث', arabicName: 'الحديث' },
  { id: 'fiqh', name: 'الفقه', arabicName: 'الفقه' },
  { id: 'seerah', name: 'السيرة', arabicName: 'السيرة' },
  { id: 'names', name: 'أسماء', arabicName: 'أسماء' },
];

export const DIFFICULTY_LEVELS = [
  { id: 'easy', name: 'سهل', color: 'emerald' },
  { id: 'medium', name: 'متوسط', color: 'gold' },
  { id: 'hard', name: 'صعب', color: 'red' },
];

export function getQuizByCategory(category: string): QuizQuestion[] {
  return QUIZ_QUESTIONS.filter(q => q.category === category);
}

export function getQuizByDifficulty(difficulty: string): QuizQuestion[] {
  return QUIZ_QUESTIONS.filter(q => q.difficulty === difficulty);
}

export function getQuizById(id: string): QuizQuestion | undefined {
  return QUIZ_QUESTIONS.find(q => q.id === id);
}

export function getQuizByCategoryAndDifficulty(category: string, difficulty: string): QuizQuestion[] {
  return QUIZ_QUESTIONS.filter(q => q.category === category && q.difficulty === difficulty);
}
