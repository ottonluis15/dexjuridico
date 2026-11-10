import React, { useState, useRef, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  containerClassName?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({
  containerClassName = '',
  className = '',
  placeholder = 'Sua senha de acesso',
  onBlur,
  autoComplete = 'current-password',
  ...rest
}, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Se o foco mudou para dentro do próprio container (ex: clicou no botão de toggle), não oculta imediatamente
    if (containerRef.current && containerRef.current.contains(e.relatedTarget as Node)) {
      onBlur?.(e);
      return;
    }
    // Quando o usuário troca de campo, a senha volta a ficar oculta
    setIsVisible(false);
    onBlur?.(e);
  };

  const baseInputClass =
    'w-full px-4 pr-12 py-2.5 rounded-xl bg-dex-input dark:bg-[#0F2733] text-dex-navy-950 dark:text-[#F9ECE2] text-xs sm:text-sm placeholder:text-dex-support/70 dark:placeholder:text-white/40 border border-transparent dark:border-[#214154] focus:outline-none focus:ring-2 focus:ring-dex-coral transition-all';

  return (
    <div ref={containerRef} className={`relative w-full ${containerClassName}`.trim()}>
      <input
        ref={ref}
        type={isVisible ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onBlur={handleBlur}
        className={`${baseInputClass} ${className}`.trim()}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setIsVisible(prev => !prev)}
        aria-label={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={isVisible}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-dex-support hover:text-dex-navy-950 dark:text-[#A6C5CD] dark:hover:text-[#F9ECE2] focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral focus-visible:ring-offset-1 rounded-r-xl transition-colors cursor-pointer"
      >
        {isVisible ? (
          <Eye className="w-4 h-4" aria-hidden="true" />
        ) : (
          <EyeOff className="w-4 h-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;

