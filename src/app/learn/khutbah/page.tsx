'use client';

import { useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';

const khutbahSteps = [
  { id: 1, title: '准备工作', desc: 'حدد الموضوع والجمهور المستهدف', icon: '📝' },
  { id: 2, title: 'البحث', desc: 'اجمع الأحاديث والأدلة من المصادر المعتمدة', icon: '📚' },
  { id: 3, title: 'التنظيم', desc: 'رتب الخطبة مقدمة وعرض وخاتمة', icon: '📋' },
  { id: 4, title: 'التمرين', desc: 'تدرّب على النطق والصوت والوقت', icon: '🎤' },
  { id: 5, title: 'الadia', desc: 'ادعُ الله أن ينفع الناس بالخطبة', icon: '🤲' },
];

const khutbahTips = [
  'ابدأ بحمد الله والثناء عليه',
  'صلِّ على النبي ﷺ في الخطبة',
  'اجعل الخطبة قصيرة مفيدة (15-20 دقيقة)',
  'استخدم أمثلة واقعية',
  'اختم بدعاء أو مناسبة',
];

export default function KhutbahPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-abyss pb-24">
      <header className="pt-10 pb-6 px-4 text-center">
        <h1 className="text-3xl font-bold text-gold font-amiri">كيف تحضر خطبة</h1>
        <p className="text-ivory/60 mt-2 text-sm">دليل متكامل لإعداد الخطبة</p>
      </header>

      <div className="px-4 max-w-lg mx-auto space-y-6">
        <section>
          <h2 className="text-xl font-bold text-ivory font-amiri mb-4">خطوات الإعداد</h2>
          <div className="space-y-3">
            {khutbahSteps.map((step) => (
              <div
                key={step.id}
                className="p-4 rounded-2xl bg-emerald-dark/30 border border-emerald/15 cursor-pointer hover:border-gold/30 transition-all"
                onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{step.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-ivory font-amiri">{step.title}</h3>
                    <p className="text-ivory/60 text-sm">{step.desc}</p>
                  </div>
                </div>
                {activeStep === step.id && (
                  <div className="mt-3 pt-3 border-t border-emerald/10">
                    <p className="text-ivory/70 text-sm">اتبع هذه الخطوات في إعداد خطبتك بعناية و تدبيرها خدمة لله تعالى</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ivory font-amiri mb-4">نصائح مهمة</h2>
          <div className="p-4 rounded-2xl bg-emerald-dark/30 border border-emerald/15">
            <ul className="space-y-2">
              {khutbahTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gold mt-1">✓</span>
                  <span className="text-ivory/70 text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ivory font-amiri mb-4">هيكل الخطبة النموذجي</h2>
          <div className="p-4 rounded-2xl bg-emerald-dark/30 border border-emerald/15 space-y-3">
            <div className="p-3 bg-gold/10 rounded-xl">
              <h3 className="text-gold font-bold">المقدمة</h3>
              <p className="text-ivory/70 text-sm">الحمد لله، الصلاة والسلام على رسول الله، ثم الخطبة</p>
            </div>
            <div className="p-3 bg-emerald/10 rounded-xl">
              <h3 className="text-ivory font-bold">العرض</h3>
              <p className="text-ivory/70 text-sm">الموضوع الرئيسي مع الأدلة والأمثلة</p>
            </div>
            <div className="p-3 bg-gold/10 rounded-xl">
              <h3 className="text-gold font-bold">الخاتمة</h3>
              <p className="text-ivory/70 text-sm">تقوية الإيمان، الدعاء، الصلاة على النبي ﷺ</p>
            </div>
          </div>
        </section>
      </div>
      <BottomNav />
    </main>
  );
}
