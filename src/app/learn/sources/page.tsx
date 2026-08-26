'use client';

import { BottomNav } from '@/components/ui/BottomNav';

const sources = [
  {
    name: 'القرآن الكريم',
    type: 'نص',
    url: 'https://quran.com',
    description: 'المصادر الأساسية للقرآن الكريم من موقع القرآن الكريم',
    verified: true,
  },
  {
    name: 'التفسير الميسر',
    type: 'تفسير',
    url: 'https://quran.gov.sa',
    description: 'التفسير الميسر من وزارة الشؤون الإسلامية السعودية',
    verified: true,
  },
  {
    name: 'الأحاديث النبوية',
    type: 'حديث',
    url: 'https://sunnah.com',
    description: 'منصة الحديث النبوي الشريف - مصادر موثقة من البخاري ومسلم',
    verified: true,
  },
  {
    name: 'الأذكار والابتهالات',
    type: 'ذكر',
    url: 'https://adb.org.sa',
    description: 'دار الإفتاء العامة بالمملكة العربية السعودية',
    verified: true,
  },
  {
    name: 'الفقه الإسلامي',
    type: 'فقه',
    url: 'https://fiqhacademy.org',
    description: 'مجمع الفقه الإسلامي الدولي',
    verified: true,
  },
  {
    name: 'السيرة النبوية',
    type: 'سيرة',
    url: 'https://islamport.com',
    description: 'مصادر السيرة النبوية الموثقة',
    verified: true,
  },
];

const notes = [
  'جميع النصوص القرآنية من موقع القرآن الكريم (quran.com)',
  'الأحاديث النبوية موثقة من مصادرها الأصلية',
  'التفسير من التفسير الميسر المعتمد',
  'الأذكار من مصادرها النبوية المعتمدة',
  'يجب التحقق من صحة المحتوى قبل النشر',
];

export default function SourcesPage() {
  return (
    <main className="min-h-screen bg-abyss pb-24">
      <header className="pt-10 pb-6 px-4 text-center">
        <h1 className="text-3xl font-bold text-gold font-amiri">مصادر المحتوى</h1>
        <p className="text-ivory/60 mt-2 text-sm">مصادر ومراجع المحتوى الديني</p>
      </header>

      <div className="px-4 max-w-lg mx-auto space-y-6">
        <section>
          <div className="space-y-3">
            {sources.map((source, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-emerald-dark/30 border border-emerald/15"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-ivory font-amiri">{source.name}</h3>
                    <p className="text-ivory/60 text-sm mt-1">{source.description}</p>
                    <span className="inline-block mt-2 text-xs text-gold bg-gold/10 px-2 py-1 rounded-full">
                      {source.type}
                    </span>
                  </div>
                  {source.verified && (
                    <span className="text-emerald text-xs bg-emerald/10 px-2 py-1 rounded-full">
                      موثق
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ivory font-amiri mb-4">ملاحظات</h2>
          <div className="p-4 rounded-2xl bg-emerald-dark/30 border border-emerald/15">
            <ul className="space-y-2">
              {notes.map((note, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gold mt-1">•</span>
                  <span className="text-ivory/70 text-sm">{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
      <BottomNav />
    </main>
  );
}
