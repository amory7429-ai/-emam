import Link from 'next/link';
import { PrayerCards } from '@/components/home/PrayerCards';
import { QuickPrepare } from '@/components/home/QuickPrepare';
import { BottomNav } from '@/components/ui/BottomNav';

export default function HomePage() {
  return (
    <main className="min-h-screen pb-24">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-quran-emerald/20 to-transparent pointer-events-none" />
        <div className="relative px-6 pt-16 pb-12 text-center">
          <h1 className="font-amiri text-5xl md:text-6xl font-bold text-quran-ivory mb-4 animate-fade-in">
            رفيق الإمام
          </h1>
          <p className="text-quran-ivory-muted text-lg mb-10 animate-slide-up">
            اختيارات قرآنية جاهزة لكل صلاة
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
            <Link
              href="/quick"
              className="glass-strong rounded-2xl px-8 py-4 text-lg font-semibold text-quran-gold hover:bg-white/10 transition-all duration-300 min-w-[200px] text-center"
            >
              حضّر لي ركعتين
            </Link>
            <Link
              href="/quran"
              className="glass rounded-xl px-6 py-3 text-quran-ivory-muted hover:text-quran-ivory hover:bg-white/5 transition-all duration-300 text-center"
            >
              تصفح القرآن
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6 mb-8">
        <h2 className="font-amiri text-2xl font-bold text-quran-ivory mb-6 px-2">
          الصلاة القادمة
        </h2>
        <PrayerCards />
      </section>

      <section className="px-4 md:px-6 mb-8">
        <QuickPrepare />
      </section>

      <section className="px-4 md:px-6 mb-8">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-amiri text-xl font-bold text-quran-ivory mb-4">
            الأقسام
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/prepare"
              className="glass rounded-xl p-4 text-center hover:bg-white/5 transition-all"
            >
              <div className="text-2xl mb-2">🕌</div>
              <div className="text-sm text-quran-ivory-muted">تحضير الإمام</div>
            </Link>
            <Link
              href="/adhkar"
              className="glass rounded-xl p-4 text-center hover:bg-white/5 transition-all"
            >
              <div className="text-2xl mb-2">📿</div>
              <div className="text-sm text-quran-ivory-muted">الأذكار بعد الصلاة</div>
            </Link>
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
