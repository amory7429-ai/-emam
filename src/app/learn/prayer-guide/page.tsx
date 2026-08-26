'use client';

import { useState } from 'react';
import { PRAYER_GUIDE_STEPS } from '@/lib/data/prayer-guide';
import { PRAYER_Rakats, PRAYER_TIMINGS_NOTES } from '@/lib/data/prayer-guide';
import { BottomNav } from '@/components/ui/BottomNav';

const prayerTimes = [
  { name: 'الفجر', rakats: PRAYER_Rakats.fajr, time: 'من طلوع الفجر الصادق إلى طلوع الشمس' },
  { name: 'الظهر', rakats: PRAYER_Rakats.dhuhr, time: 'من زوال الشمس إلى أن يصير ظل كل شيء مثله' },
  { name: 'العصر', rakats: PRAYER_Rakats.asr, time: 'من أن يصير ظل كل شيء مثله إلى اصفرار الشمس' },
  { name: 'المغرب', rakats: PRAYER_Rakats.maghrib, time: 'من غروب الشمس إلى غيبوبة الشفق الأحمر' },
  { name: 'العشاء', rakats: PRAYER_Rakats.isha, time: 'من غيبوبة الشفق الأحمر إلى نصف الليل' },
];

export default function PrayerGuidePage() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-abyss pb-24">
      <header className="pt-10 pb-6 px-4 text-center">
        <h1 className="text-3xl font-bold text-gold font-amiri">كيف تصلي كما صلى النبي ﷺ</h1>
        <p className="text-ivory/60 mt-2 text-sm font-amiri">حديث: &quot;صلوا كما رأيتموني أصلي&quot; - رواه البخاري (7246)</p>
      </header>

      <div className="px-4 max-w-lg mx-auto space-y-8">
        {/* Prayer Times */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-ivory font-amiri">أوقات الصلاة</h2>
          <div className="grid grid-cols-5 gap-2">
            {prayerTimes.map((prayer) => (
              <div key={prayer.name} className="p-3 rounded-xl bg-emerald-dark/30 border border-emerald/15 text-center">
                <p className="text-gold font-bold font-amiri text-lg">{prayer.name}</p>
                <p className="text-ivory/60 text-xs mt-1">{prayer.rakats} ركعات</p>
              </div>
            ))}
          </div>
        </section>

        {/* Prayer Steps */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-ivory font-amiri">خطوات الصلاة</h2>
          {PRAYER_GUIDE_STEPS.map((step) => (
            <div
              key={step.id}
              className="rounded-xl bg-emerald-dark/20 border border-emerald/10 overflow-hidden"
            >
              <button
                onClick={() => setExpandedStep(expandedStep === step.stepNumber ? null : step.stepNumber)}
                className="w-full p-4 text-right flex items-center gap-3 hover:bg-emerald-dark/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                  <span className="text-gold font-bold">{step.stepNumber}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-ivory font-amiri">{step.title}</h3>
                  <p className="text-ivory/60 text-sm line-clamp-1 mt-1">{step.description}</p>
                </div>
                <span className="text-ivory/40 text-xl">{expandedStep === step.stepNumber ? '▾' : '▸'}</span>
              </button>

              {expandedStep === step.stepNumber && (
                <div className="px-4 pb-4 space-y-3 border-t border-emerald/10">
                  <div className="mt-3 p-3 rounded-lg bg-emerald-dark/30">
                    <p className="text-ivory/80 font-amiri leading-relaxed">{step.description}</p>
                  </div>

                  {step.notes && step.notes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-ivory/60 text-sm font-bold">ملاحظات:</p>
                      {step.notes.map((note, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-gold mt-1">•</span>
                          <p className="text-ivory/60 text-sm">{note}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {step.hasIllustration && (
                    <div className="mt-3 p-3 rounded-lg bg-emerald-dark/20 border border-emerald/10">
                      <p className="text-ivory/50 text-xs italic">{step.illustrationDescription}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold/80">{step.sourceName}</span>
                    {step.verified && (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald/20 text-emerald-400">✓ موثق</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
      <BottomNav />
    </main>
  );
}
