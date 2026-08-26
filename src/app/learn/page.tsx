'use client';

import Link from 'next/link';
import { BottomNav } from '@/components/ui/BottomNav';

const features = [
  { title: 'أذكار الصباح والمساء', arabic: 'أذكار الصباح والمساء', desc: 'أذكار موثقة من السنة النبوية', href: '/learn/adhkar', icon: '🌅' },
  { title: 'الرقية الشرعية', arabic: 'الرقية الشرعية', desc: 'رقية بالقرآن والأدعية النبوية', href: '/learn/ruqyah', icon: '🤲' },
  { title: 'أذكار الحمام والمسجد', arabic: 'أذكار دخول الخلاء والمسجد', desc: 'أدعية موثقة لدخول وخروج الحمام والمسجد', href: '/learn/situational', icon: '🕌' },
  { title: 'التسبيح', arabic: 'عداد التسبيح', desc: 'سبحان الله، الحمد لله، الله أكبر', href: '/learn/tasbih', icon: '📿' },
  { title: 'الدعاء المأثور', arabic: 'الأدعية النبوية', desc: 'أدعية موثقة من السنة النبوية', href: '/learn/dua', icon: '🤲' },
  { title: 'كيف تصلي', arabic: 'دليل الصلاة', desc: 'كما صلى النبي ﷺ مع المرجع', href: '/learn/prayer-guide', icon: '🕌' },
  { title: 'اختبار', arabic: 'اختبار إسلامي', desc: 'اختبر معلوماتك في القرآن والحديث', href: '/learn/quiz', icon: '❓' },
  { title: 'قصص الأنبياء', arabic: 'قصص الأنبياء', desc: 'قصص موثقة من القرآن الكريم', href: '/learn/prophets', icon: '📜' },
  { title: 'تعلم الخطبة', arabic: 'كيف تحضر خطبة', desc: 'دليل متكامل لإعداد الخطبة', href: '/learn/khutbah', icon: '🎤' },
  { title: 'مصادر المحتوى', arabic: 'مصادر المحتوى', desc: 'مصادر ومراجع المحتوى الديني', href: '/learn/sources', icon: '📚' },
];

export default function LearnPage() {
  return (
    <main className="min-h-screen bg-abyss pb-24">
      <header className="pt-10 pb-6 px-4 text-center">
        <h1 className="text-3xl font-bold text-gold font-amiri">التعلم</h1>
        <p className="text-ivory/60 mt-2 text-sm">محتوى إسلامي موثق بالمرجع</p>
      </header>

      <div className="px-4 max-w-lg mx-auto grid grid-cols-2 gap-4">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="block p-5 rounded-2xl bg-emerald-dark/30 border border-emerald/15 
              hover:border-gold/30 hover:bg-emerald-dark/50 transition-all duration-200"
          >
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-ivory text-lg font-amiri">{f.arabic}</h3>
            <p className="text-ivory/50 text-xs mt-2">{f.desc}</p>
          </Link>
        ))}
      </div>
      <BottomNav />
    </main>
  );
}
