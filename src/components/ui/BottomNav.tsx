'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'الرئيسية', icon: '🏠', ariaLabel: 'الصفحة الرئيسية' },
  { href: '/quran', label: 'القرآن', icon: '📖', ariaLabel: 'القرآن الكريم' },
  { href: '/quick', label: 'التحضير', icon: '🕌', ariaLabel: 'تحضير الصلاة' },
  { href: '/learn', label: 'التعلم', icon: '📚', ariaLabel: 'التعلم الإسلامي' },
  { href: '/adhkar', label: 'الأذكار', icon: '📿', ariaLabel: 'أذكار المسلم' },
  { href: '/more', label: 'المزيد', icon: '⋯', ariaLabel: 'المزيد من الأقسام' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      role="navigation"
      aria-label="التنقل الرئيسي"
    >
      <div className="glass-strong border-t border-white/5">
        <div
          className="max-w-lg mx-auto flex items-center justify-around px-2"
          style={{ paddingTop: '0.5rem', paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.ariaLabel}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px] min-h-[44px] ${
                  isActive
                    ? 'bg-quran-emerald/30 text-quran-gold'
                    : 'text-quran-ivory-muted hover:text-quran-ivory'
                }`}
              >
                <span className="text-xl" aria-hidden="true">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
