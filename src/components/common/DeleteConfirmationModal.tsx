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
        className="w-full max-w-lg bg-dex-peach dark:bg-[#162B37] border border-rose-300/80 dark:border-rose-900/70 rounded-[28px] p-6 sm:p-8 shadow-2xl relative font-serif text-dex-navy-950 dark:text-[#F9ECE2] max-h-[90vh] overflow-y-auto transition-colors"
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
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-300/70 dark:border-rose-800/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h3
              id="delete-modal-title"
              className="text-xl sm:text-2xl font-display font-bold text-rose-600 dark:text-rose-400 leading-tight"
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
        <div className="bg-rose-500/5 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 mb-5 text-xs text-dex-navy-950 dark:text-[#F9ECE2] space-y-3 leading-relaxed">
          {typeof description === 'string' ? <p>{description}</p> : description}
          
          <ul className="space-y-1.5 pt-2 border-t border-rose-200/60 dark:border-rose-900/40 text-[11px] text-dex-support dark:text-[#A6C5CD]">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>Sessões e credenciais de login serão encerradas imediatamente.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>Dados pessoais e registros operacionais serão expurgados ou anonimizados.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>Assinaturas ativas no Stripe serão canceladas sem novas cobranças.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>Seu endereço de e-mail será liberado para novos cadastros.</span>
            </li>
          </ul>

          <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40 flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-[11px] uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Ação definitiva: os dados excluídos não poderão ser recuperados</span>
          </div>
        </div>

        {/* Mensagem de Erro com aria-live */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 p-3.5 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2 font-sans"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Confirmação por palavra-chave */}
          <div className="space-y-1">
            <label className="block text-xs font-serif italic text-dex-navy-950 dark:text-[#F9ECE2]">
              {keywordLabel || (
                <span>
                  Para autorizar, digite exatamente a palavra <strong className="font-mono text-rose-600 dark:text-rose-400">{keywordRequired}</strong>:
                </span>
              )}
            </label>
            <input
              type="text"
              required
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={keywordRequired}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input dark:bg-[#0F2733] text-dex-navy-950 dark:text-[#F9ECE2] text-xs sm:text-sm font-mono border border-transparent dark:border-[#214154] focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
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
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl border-2 border-dex-navy-950/20 dark:border-white/20 bg-white/50 dark:bg-transparent text-dex-navy-950 dark:text-[#F9ECE2] text-xs font-bold hover:bg-white dark:hover:bg-white/10 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-40 disabled:cursor-not-allowed ${
                isFormValid 
                  ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white' 
                  : 'border border-rose-400/50 text-rose-600 dark:text-rose-400 bg-transparent'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processando exclusão...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{isOffice ? 'Excluir Escritório' : 'Excluir Minha Conta'}</span>
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
