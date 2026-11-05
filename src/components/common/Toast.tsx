import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastNotification } from '../../context/DataContext';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#48BB78] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-dex-coral shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#C48A5C] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#72ACBA] shrink-0" />
  };

  const borders = {
    success: 'border-[#48BB78]/40 bg-[#162B37] text-white',
    error: 'border-dex-coral/50 bg-[#162B37] text-white',
    warning: 'border-[#C48A5C]/50 bg-[#162B37] text-white',
    info: 'border-[#4A808E]/50 bg-[#162B37] text-white'
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none font-serif"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          role={toast.type === 'error' ? 'alert' : 'status'}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 ${borders[toast.type]}`}
        >
          {icons[toast.type]}
          <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
            {toast.message}
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            aria-label="Fechar notificação"
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-[#A6C5CD] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
