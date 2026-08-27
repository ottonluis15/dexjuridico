import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger'
}) => {
  const buttonColors = {
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30',
    warning: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30',
    primary: 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-900/30'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="md"
      icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
    >
      <div className="space-y-5">
        <p className="text-sm text-slate-300 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl shadow-lg transition-all ${buttonColors[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
