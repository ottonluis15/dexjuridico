import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { PasswordInput } from './PasswordInput';

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string, confirmationText: string) => Promise<{ success: boolean; error?: string }>;
  title: string;
  subtitle?: string;
  description: string | React.ReactNode;
  keywordRequired: string;
  keywordLabel?: React.ReactNode;
  requirePassword?: boolean;
  isOffice?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  description,
  keywordRequired,
  keywordLabel,
  requirePassword = true,
  isOffice = false,
}) => {
  const [password, setPassword] = useState('');
  const [confirmationInput, setConfirmationInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttemptsCount, setFailedAttemptsCount] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      setPassword('');
      setConfirmationInput('');
      setError(null);
      setIsSubmitting(false);

      // Foca no primeiro input
      const timer = setTimeout(() => {
        const input = modalRef.current?.querySelector('input');
        input?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isSubmitting) {
          e.preventDefault();
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const isKeywordMatching =
    confirmationInput.trim().toUpperCase() === keywordRequired.trim().toUpperCase();

  const isFormValid =
    isKeywordMatching && (!requirePassword || password.trim().length > 0) && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isKeywordMatching) {
      setError(`Digite exatamente "${keywordRequired}" para habilitar a exclusão.`);
      return;
    }
    if (requirePassword && !password) {
      setError('Por favor, informe sua senha de acesso atual.');
      return;
    }

    if (failedAttemptsCount >= 5) {
      setError('Limite de tentativas excedido por segurança. Aguarde 15 minutos.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await onConfirm(password, confirmationInput.trim());
      if (!res.success) {
        setFailedAttemptsCount(prev => prev + 1);
        setError(res.error || 'Não foi possível confirmar a exclusão. Verifique suas credenciais.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setFailedAttemptsCount(prev => prev + 1);
      setError(err.message || 'Erro inesperado ao processar exclusão.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 bg-dex-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-dex-cream dark:bg-[#0F2733] border-2 border-red-500/60 dark:border-red-500/80 rounded-[28px] p-6 sm:p-8 shadow-2xl relative font-serif text-dex-navy-950 dark:text-[#F9ECE2] max-h-[90vh] overflow-y-auto"
      >
        {/* Botão de Fechar */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Cancelar e fechar janela de exclusão"
          className="absolute right-5 top-5 w-10 h-10 rounded-full flex items-center justify-center text-dex-support hover:text-dex-navy-950 dark:hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho de Alerta Destrutivo */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h3
              id="delete-modal-title"
              className="text-xl sm:text-2xl font-display font-bold text-red-600 dark:text-red-400 leading-tight"
            >
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-dex-support dark:text-[#A6C5CD] italic mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Mensagem Descritiva dos Dados Afetados */}
        <div className="bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-xl p-4 mb-5 text-xs text-dex-navy-950 dark:text-[#F9ECE2] space-y-2 leading-relaxed">
          {typeof description === 'string' ? <p>{description}</p> : description}
          <div className="pt-2 border-t border-red-200/60 dark:border-red-900/40 flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-[11px] uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Atenção: Esta ação é definitiva e irreversível</span>
          </div>
        </div>

        {/* Mensagem de Erro com aria-live */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 p-3.5 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-xl text-red-800 dark:text-red-200 text-xs flex items-center gap-2 font-sans"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Confirmação por palavra-chave */}
          <div className="space-y-1">
            <label className="block text-xs font-serif italic text-dex-navy-950 dark:text-[#F9ECE2]">
              {keywordLabel || (
                <span>
                  Para confirmar, digite exatamente <strong className="font-mono text-red-600 dark:text-red-400">{keywordRequired}</strong>:
                </span>
              )}
            </label>
            <input
              type="text"
              required
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={keywordRequired}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input dark:bg-[#162B37] text-dex-navy-950 dark:text-[#F9ECE2] text-xs sm:text-sm font-mono border border-transparent dark:border-[#214154] focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>

          {/* Confirmação por senha atual */}
          {requirePassword && (
            <div className="space-y-1">
              <label className="block text-xs font-serif italic text-dex-navy-950 dark:text-[#F9ECE2]">
                Digite sua senha atual de acesso para autenticar:
              </label>
              <PasswordInput
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha atual"
                autoComplete="current-password"
              />
            </div>
          )}

          {/* Botões de Ação */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl border border-dex-border dark:border-[#214154] text-dex-navy-950 dark:text-[#F9ECE2] text-xs font-semibold hover:bg-dex-peach/50 dark:hover:bg-[#162B37] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!isFormValid}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processando exclusão...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{isOffice ? 'Excluir Escritório Definitivamente' : 'Excluir Minha Conta Definitivamente'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
