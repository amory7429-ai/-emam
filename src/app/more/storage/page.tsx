'use client';

import { useState, useEffect, useCallback } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { GlassCard } from '@/components/ui/GlassCard';
import { isQuranBootstrapped, getBootstrapStatus, bootstrapQuran, getCachedVerseCount } from '@/lib/db/quran-bootstrap';
import { getDownloadedSurahs, deleteAllAudio } from '@/lib/db/audio-cache';
import { getStorageEstimate, requestPersistentStorage, isPersistentStorage } from '@/lib/db/indexed-db';
import { useReciterStore } from '@/stores/reciter-store';
import { SURAH_META } from '@/lib/data/surahs';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function StoragePage() {
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [verseCount, setVerseCount] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageQuota, setStorageQuota] = useState(0);
  const [downloadedSurahs, setDownloadedSurahs] = useState<number[]>([]);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootstrapProgress, setBootstrapProgress] = useState({ surah: 0, total: 114 });
  const [persistent, setPersistent] = useState(false);
  const [persistentSupported, setPersistentSupported] = useState(true);
  const [loading, setLoading] = useState(true);
  const [bootstrapStatus, setBootstrapStatus] = useState<string | null>(null);

  const { getSelectedReciter } = useReciterStore();
  const currentReciter = getSelectedReciter();

  const loadData = useCallback(async () => {
    try {
      const [bootstrapped, verses, estimate, surahs, persistStatus] = await Promise.all([
        isQuranBootstrapped(),
        getCachedVerseCount(),
        getStorageEstimate(),
        getDownloadedSurahs(currentReciter.id),
        isPersistentStorage(),
      ]);
      setIsBootstrapped(bootstrapped);
      setVerseCount(verses);
      if (estimate) {
        setStorageUsed(estimate.used);
        setStorageQuota(estimate.quota);
      }
      setDownloadedSurahs(surahs);
      setPersistent(persistStatus);
      setPersistentSupported('storage' in navigator && 'persist' in navigator.storage);

      // Check if there's an ongoing bootstrap
      const status = await getBootstrapStatus();
      if (status) setBootstrapStatus(status.complete ? 'مكتمل' : 'جارٍ التنزيل...');
    } catch {
      // Silent catch
    } finally {
      setLoading(false);
    }
  }, [currentReciter.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBootstrap = async () => {
    setBootstrapping(true);
    try {
      await bootstrapQuran((surah, total) => {
        setBootstrapProgress({ surah, total });
      });
      setIsBootstrapped(true);
      const count = await getCachedVerseCount();
      setVerseCount(count);
    } catch {
      // Silent catch
    } finally {
      setBootstrapping(false);
    }
  };

  const handleDeleteAudio = async () => {
    if (!confirm('حذف جميع التلاوات المُنزّلة؟')) return;
    await deleteAllAudio();
    setDownloadedSurahs([]);
    await loadData();
  };

  const handleRequestPersistent = async () => {
    const result = await requestPersistentStorage();
    setPersistent(result);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center pb-24">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⚙️</div>
          <p className="text-quran-ivory-muted">جارٍ التحميل...</p>
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="font-amiri text-xl font-bold text-quran-ivory">
            إدارة التخزين
          </h1>
          <p className="text-sm text-quran-ivory-muted mt-1">
            إدارة البيانات المخزنة محليًا
          </p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Storage Overview */}
        <GlassCard strong className="p-4">
          <h2 className="font-amiri text-lg font-bold text-quran-ivory mb-3">
            ملخص التخزين
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-quran-ivory-muted">المساحة المستخدمة</span>
              <span className="text-quran-gold font-medium">{formatBytes(storageUsed)}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-quran-gold/60 rounded-full transition-all"
                style={{ width: storageQuota > 0 ? `${(storageUsed / storageQuota) * 100}%` : '0%' }}
              />
            </div>
            <div className="flex justify-between text-xs text-quran-olive">
              <span>{formatBytes(storageUsed)} مستخدمة</span>
              <span>{formatBytes(storageQuota)} متاحة</span>
            </div>
          </div>
        </GlassCard>

        {/* Quran Data */}
        <GlassCard strong className="p-4">
          <h2 className="font-amiri text-lg font-bold text-quran-ivory mb-3">
            📖 القرآن الكريم
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-quran-ivory-muted">حالة التنزيل</span>
              <span className={`font-medium ${isBootstrapped ? 'text-quran-emerald-light' : 'text-quran-gold'}`}>
                {isBootstrapped ? '✓ مكتمل' : 'غير مكتمل'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-quran-ivory-muted">عدد الآيات المخزنة</span>
              <span className="text-quran-gold font-medium">{verseCount.toLocaleString()}</span>
            </div>

            {!isBootstrapped && !bootstrapping && (
              <button
                onClick={handleBootstrap}
                className="w-full min-h-[48px] bg-gradient-to-l from-quran-gold to-quran-gold/80 rounded-xl py-3 text-sm font-bold text-quran-bg active:scale-95 transition-all"
              >
                تنزيل نص القرآن للعمل بدون إنترنت
              </button>
            )}

            {bootstrapping && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-quran-ivory-muted">جارٍ التنزيل...</span>
                  <span className="text-quran-gold">{bootstrapProgress.surah}/{bootstrapProgress.total}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-quran-gold rounded-full transition-all"
                    style={{ width: `${(bootstrapProgress.surah / bootstrapProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Audio Downloads */}
        <GlassCard strong className="p-4">
          <h2 className="font-amiri text-lg font-bold text-quran-ivory mb-3">
            🔊 التلاوات المُنزّلة
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-quran-ivory-muted">القارئ: {currentReciter.nameArabic}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-quran-ivory-muted">السور المُنزّلة</span>
              <span className="text-quran-gold font-medium">{downloadedSurahs.length}</span>
            </div>
            {downloadedSurahs.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {downloadedSurahs.map(s => {
                  const surah = SURAH_META.find(su => su.id === s);
                  return surah ? (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-quran-emerald/30 text-quran-emerald-light">
                      {surah.nameArabic}
                    </span>
                  ) : null;
                })}
              </div>
            )}
            {downloadedSurahs.length > 0 && (
              <button
                onClick={handleDeleteAudio}
                className="w-full min-h-[44px] glass rounded-xl py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
              >
                حذف جميع التلاوات
              </button>
            )}
          </div>
        </GlassCard>

        {/* Persistent Storage */}
        <GlassCard className="p-4">
          <h2 className="font-amiri text-lg font-bold text-quran-ivory mb-3">
            🔒 التخزين الدائم
          </h2>
          <div className="space-y-3">
            <p className="text-xs text-quran-ivory-muted leading-relaxed">
              التخزين الدائم يضمن عدم حذف البيانات حتى عند نقص مساحة الجهاز.
              قد يطلب منك المتصفح تأكيد هذا الإذن.
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-quran-ivory-muted">الحالة</span>
              <span className={`font-medium ${persistent ? 'text-quran-emerald-light' : 'text-quran-olive'}`}>
                {persistent ? '✓ مفعّل' : 'غير مفعّل'}
              </span>
            </div>
            {!persistentSupported && (
              <p className="text-[11px] text-quran-olive">
                متصفحك لا يدعم التخزين الدائم — البيانات محفوظة في التخزين العادي.
              </p>
            )}
            {persistentSupported && !persistent && (
              <button
                onClick={handleRequestPersistent}
                className="w-full min-h-[44px] bg-quran-emerald rounded-xl py-2.5 text-sm font-medium text-quran-gold hover:bg-quran-emerald-light transition-all active:scale-95"
              >
                تفعيل التخزين الدائم
              </button>
            )}
            {persistent && (
              <p className="text-[11px] text-quran-emerald-light">
                ✓ بياناتك محمية ولن تُحذف حتى عند نقص المساحة.
              </p>
            )}
          </div>
        </GlassCard>
      </div>

      <BottomNav />
    </main>
  );
}
