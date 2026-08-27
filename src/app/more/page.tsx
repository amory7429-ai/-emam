'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';
import { GlassCard } from '@/components/ui/GlassCard';
import { useSettingsStore } from '@/stores/settings-store';
import { useReciterStore } from '@/stores/reciter-store';
import { useAuth } from '@/lib/firebase/auth-context';
import { AVAILABLE_RECITERS, type Reciter } from '@/lib/quran/types';

export default function MorePage() {
  const router = useRouter();
  const { settings, updateSettings } = useSettingsStore();
  const { getSelectedReciter, setReciter } = useReciterStore();
  const { user, profile, signOut } = useAuth();
  const currentReciter = getSelectedReciter();
  const [showReciterPicker, setShowReciterPicker] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <main className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="font-amiri text-xl font-bold text-quran-ivory">
            المزيد
          </h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Profile Section */}
        <GlassCard className="p-4">
          <h2 className="font-amiri text-lg font-bold text-quran-gold mb-3">
            الملف الشخصي
          </h2>
          {user && profile ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt="" className="w-12 h-12 rounded-full border-2 border-quran-gold/30" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-quran-emerald flex items-center justify-center text-xl text-quran-gold font-bold">
                    {profile.displayName?.[0] || profile.email?.[0] || '?'}
                  </div>
                )}
                <div>
                  <div className="font-amiri text-quran-ivory font-bold">{profile.displayName || 'مستخدم'}</div>
                  <div className="text-xs text-quran-ivory-muted">{profile.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full min-h-[44px] glass rounded-xl py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
              >
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">👤</div>
              <p className="text-sm text-quran-ivory-muted mb-3">سجّل دخولك لحفظ تقدمك عبر الأجهزة</p>
              <Link
                href="/auth"
                className="inline-block min-h-[40px] bg-quran-emerald rounded-xl px-6 py-2 text-sm font-bold text-quran-gold hover:bg-quran-emerald-light transition-all"
              >
                تسجيل الدخول
              </Link>
            </div>
          )}
        </GlassCard>

        {/* Prayer Settings */}
        <GlassCard className="p-4">
          <h2 className="font-amiri text-lg font-bold text-quran-gold mb-3">
            ⏰ إعدادات الصلاة
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-quran-ivory-muted">طريقة الحساب</span>
              <span className="text-quran-ivory font-medium">الهيئة المصرية العامة للمساحة</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-quran-ivory-muted">المدينة</span>
              <span className="text-quran-ivory font-medium">
                {settings.city || 'تلقائي (GPS)'}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Quran Settings */}
        <GlassCard className="p-4">
          <h2 className="font-amiri text-lg font-bold text-quran-gold mb-3">
            📖 إعدادات القرآن
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => setShowReciterPicker(!showReciterPicker)}
              className="w-full flex justify-between items-center text-sm py-1"
            >
              <span className="text-quran-ivory-muted">القارئ الافتراضي</span>
              <span className="text-quran-ivory font-medium">{currentReciter.nameArabic} ←</span>
            </button>

            {showReciterPicker && (
              <div className="grid grid-cols-2 gap-2 mt-2 animate-fade-in">
                {AVAILABLE_RECITERS.map((r: Reciter) => (
                  <button
                    key={r.id}
                    onClick={() => { setReciter(r.id); updateSettings({ defaultReciterId: r.id }); setShowReciterPicker(false); }}
                    className={`py-2 px-3 rounded-lg text-xs text-right transition-all ${
                      currentReciter.id === r.id
                        ? 'bg-quran-emerald text-quran-gold'
                        : 'glass text-quran-ivory-muted hover:bg-white/5'
                    }`}
                  >
                    {r.nameArabic}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-quran-ivory-muted">حجم الخط</span>
              <div className="flex gap-1">
                {['صغير', 'متوسط', 'كبير', 'كبير جداً', 'ضخم'].map((label, i) => (
                  <button
                    key={i + 1}
                    onClick={() => updateSettings({ fontSize: i + 1 })}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      settings.fontSize === i + 1 ? 'bg-quran-gold text-quran-bg' : 'glass text-quran-ivory-muted'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* App Sections */}
        <div className="space-y-2">
          <h3 className="font-amiri text-sm font-bold text-quran-olive px-2 mb-2">الأقسام</h3>

          <Link href="/hadith">
            <GlassCard className="p-4 flex items-center gap-4 hover:bg-white/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-quran-emerald/50 flex items-center justify-center text-2xl">
                📚
              </div>
              <div className="flex-1">
                <div className="font-amiri text-lg text-quran-ivory">الأربعون النووية</div>
                <div className="text-xs text-quran-ivory-muted">أربعون حديثاً نبوية شريفة للإمام النووي</div>
              </div>
              <div className="text-quran-olive text-sm">←</div>
            </GlassCard>
          </Link>

          <Link href="/learn">
            <GlassCard className="p-4 flex items-center gap-4 hover:bg-white/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-quran-emerald/50 flex items-center justify-center text-2xl">
                🎓
              </div>
              <div className="flex-1">
                <div className="font-amiri text-lg text-quran-ivory">التعلم الإسلامي</div>
                <div className="text-xs text-quran-ivory-muted">اختبار، قصص أنبياء، خطبة، رقية، تسبيح، تفسير</div>
              </div>
              <div className="text-quran-olive text-sm">←</div>
            </GlassCard>
          </Link>

          <Link href="/more/storage">
            <GlassCard className="p-4 flex items-center gap-4 hover:bg-white/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-quran-gold/20 flex items-center justify-center text-2xl">
                💾
              </div>
              <div className="flex-1">
                <div className="font-amiri text-lg text-quran-ivory">إدارة التخزين</div>
                <div className="text-xs text-quran-ivory-muted">تنزيل القرآن والتلاوات للعمل بدون إنترنت</div>
              </div>
              <div className="text-quran-olive text-sm">←</div>
            </GlassCard>
          </Link>
        </div>

        {/* About */}
        <GlassCard className="p-4">
          <h3 className="font-amiri text-lg font-bold text-quran-ivory mb-3">
            عن التطبيق
          </h3>
          <p className="text-sm text-quran-ivory-muted leading-relaxed mb-3">
            رفيق الإمام — مساعدك اليومي في إعداد الصلاة، تلاوة القرآن، الحفظ، والأذكار.
            مبني بعناية لخدمة إمام المسجد وطالب العلم.
          </p>
          <div className="flex justify-between text-xs text-quran-olive">
            <span>الإصدار 1.0.0</span>
            <span>rbn.buzz</span>
          </div>
        </GlassCard>
      </div>

      <BottomNav />
    </main>
  );
}
