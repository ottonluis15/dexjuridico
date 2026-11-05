import React from 'react';

interface DexLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  subtitle?: string;
  variant?: 'dark' | 'light' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const DexLogo: React.FC<DexLogoProps> = ({
  className = '',
  iconClassName = '',
  textClassName = '',
  subtitle,
  variant = 'dark',
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl',
  };

  const variantColors = {
    dark: 'text-dex-navy-950',
    light: 'text-dex-cream',
    white: 'text-white',
  };

  const colorClass = variantColors[variant];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* SVG Balança da Justiça com traço fino e elegante idêntico às referências */}
      <svg
        className={`${iconSizes[size]} shrink-0 stroke-current ${colorClass} ${iconClassName}`}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Pilar central */}
        <line x1="16" y1="4" x2="16" y2="28" strokeWidth="1.8" strokeLinecap="round" />
        {/* Base */}
        <line x1="10" y1="28" x2="22" y2="28" strokeWidth="2" strokeLinecap="round" />
        {/* Barra superior horizontal */}
        <line x1="4" y1="9" x2="28" y2="9" strokeWidth="1.8" strokeLinecap="round" />
        {/* Prato esquerdo */}
        <line x1="4" y1="9" x2="8" y2="17" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="12" y1="9" x2="8" y2="17" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M5 17C5 19 11 19 11 17L5 17Z" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Prato direito */}
        <line x1="20" y1="9" x2="24" y2="17" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="28" y1="9" x2="24" y2="17" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M21 17C21 19 27 19 27 17L21 17Z" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Cúpula / topo */}
        <circle cx="16" cy="4" r="1.5" fill="currentColor" />
      </svg>

      <div className="flex flex-col leading-none">
        <span
          className={`font-display font-bold tracking-tight ${colorClass} ${textSizes[size]} ${textClassName}`}
        >
          Dex
        </span>
        {subtitle && (
          <span className="text-[11px] sm:text-xs text-dex-support tracking-normal mt-0.5 italic">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

