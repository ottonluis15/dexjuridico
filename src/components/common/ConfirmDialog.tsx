import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  confirmText,
  cancelLabel = 'Cancelar',
  variant = 'danger',
  isDestructive
}) => {
  if (!isOpen) return null;

  const resolvedConfirm = confirmText || confirmLabel || 'Confirmar';
  const isDanger = isDestructive || variant === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dex-navy-950/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-dex-navy-900 border border-white/10 rounded-[28px] p-6 shadow-2xl space-y-5 text-white font-serif"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-dex-coral/20 border border-dex-coral/30 flex items-center justify-center text-dex-coral shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-serif font-bold text-white tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-serif">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-serif rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 text-xs font-serif font-bold rounded-xl shadow-lg transition-all ${
              isDanger
                ? 'bg-dex-coral hover:bg-dex-coral/90 text-white'
                : 'bg-dex-slate hover:bg-slate-700 text-white'
            }`}
          >
            {resolvedConfirm}
          </button>
        </div>
      </div>
    </div>
  );
};
