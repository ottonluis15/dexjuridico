import React, { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';

// Pilha global de modais abertos para que ESC feche apenas o modal do topo
// e o scroll do body só seja restaurado quando todos os modais fecharem.
const openModalStack: symbol[] = [];

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  icon?: React.ReactNode;
  zIndexClass?: string;
  drawerOnMobile?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl',
  icon,
  zIndexClass = 'z-50',
  drawerOnMobile = false
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const modalToken = Symbol('dex-modal');
    openModalStack.push(modalToken);
    previousActiveElement.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';

    // Focar o primeiro elemento interativo dentro do modal
    const timer = setTimeout(() => {
      if (!dialogRef.current) return;
      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        dialogRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Apenas o modal no topo da pilha responde a ESC e Tab
      if (openModalStack[openModalStack.length - 1] !== modalToken) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      // Armadilha de Foco (Focus Trap) para Tab / Shift+Tab
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      const idx = openModalStack.lastIndexOf(modalToken);
      if (idx !== -1) {
        openModalStack.splice(idx, 1);
      }
      if (openModalStack.length === 0) {
        document.body.style.overflow = 'unset';
      }
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement.current && document.body.contains(previousActiveElement.current)) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div
      className={`fixed inset-0 ${zIndexClass} flex ${
        drawerOnMobile ? 'items-end sm:items-center justify-center p-0 sm:p-4' : 'items-center justify-center p-4'
      } overflow-y-auto`}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-dex-navy-950/75 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
        aria-hidden="true"
      />

      {/* Dialog Container */}
      <div 
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-[#162B37] border border-[#214154] ${
          drawerOnMobile
            ? 'rounded-t-[28px] sm:rounded-[28px] mt-12 sm:my-8 max-h-[92dvh] sm:max-h-none pb-[env(safe-area-inset-bottom)] sm:pb-0'
            : 'rounded-[28px] my-8'
        } shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none outline-none text-white flex flex-col`}
        onClick={e => e.stopPropagation()}
      >
        {/* Alça visual de drawer no mobile */}
        {drawerOnMobile && (
          <div className="sm:hidden flex justify-center pt-2.5 pb-0.5 bg-[#1A3342]/70" aria-hidden="true">
            <span className="w-10 h-1 rounded-full bg-white/25" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-[#214154]/70 bg-[#1A3342]/70 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0" aria-hidden="true">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h3 id={titleId} className="text-base sm:text-lg font-display font-bold text-white tracking-tight truncate">
                {title}
              </h3>
              {subtitle && <p className="text-xs text-[#A6C5CD] font-serif mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EAE0DA] hover:bg-white text-dex-navy-950 flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 shrink-0 ml-2"
            aria-label="Fechar janela"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 max-h-[78dvh] sm:max-h-[80vh] overflow-y-auto custom-scrollbar font-serif">
          {children}
        </div>
      </div>
    </div>
  );
};
