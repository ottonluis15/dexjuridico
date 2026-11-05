import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  showCrow?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  showCrow = true,
}) => {
  return (
    <div className="relative flex flex-col items-center justify-center p-12 text-center border border-dashed border-[#214154] rounded-[24px] bg-[#162B37]/60 overflow-hidden font-serif">
      {/* Toque discreto com pena ou corvo em marca d'água suave (Regra 5) */}
      {showCrow && (
        <div className="absolute right-4 bottom-2 opacity-15 pointer-events-none select-none">
          <img
            src="/img/corvo1.png"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            width="120"
            height="120"
            className="w-24 h-auto"
          />
        </div>
      )}

      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-4 shadow-sm relative z-10">
        <Icon className="w-7 h-7 stroke-[1.8]" />
      </div>

      <h4 className="text-base font-display font-bold text-white relative z-10">
        {title}
      </h4>

      <p className="text-xs text-[#A6C5CD] max-w-sm mt-1 mb-5 relative z-10 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-dex-navy-950 hover:bg-[#0A1A22] text-white text-xs font-semibold rounded-xl transition-all shadow-md hover:scale-105 active:scale-95 relative z-10 cursor-pointer border border-white/20"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
