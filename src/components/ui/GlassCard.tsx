interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', strong = false, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`${strong ? 'glass-strong' : 'glass'} rounded-2xl ${onClick ? 'cursor-pointer hover:bg-white/8 active:scale-[0.98] transition-all duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
