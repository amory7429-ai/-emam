'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'الرئيسية', icon: '🏠' },
  { href: '/quran', label: 'القرآن', icon: '📖' },
  { href: '/quick', label: 'التحضير', icon: '⚡' },
  { href: '/adhkar', label: 'الأذكار', icon: '📿' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-strong border-t border-white/5">
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px] ${
                  isActive
                    ? 'bg-quran-emerald/30 text-quran-gold'
                    : 'text-quran-ivory-muted hover:text-quran-ivory'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
