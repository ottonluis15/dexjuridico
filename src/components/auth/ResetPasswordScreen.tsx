import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  XCircle,
  Sun,
  Moon
} from 'lucide-react';
import { DexLogo } from '../common/DexLogo';
import { AuthSwitchLink } from '../common/AuthSwitchLink';
import { PasswordInput } from '../common/PasswordInput';
import { storageService } from '../../services/storageService';
import { useTheme } from '../../context/ThemeContext';

interface ResetPasswordScreenProps {
  token: string;
  email?: string;
  onNavigateToLogin: () => void;
  onNavigateToLanding: () => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  token,
  email = '',
  onNavigateToLogin,
  onNavigateToLanding
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificações em tempo real dos requisitos de segurança forense
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const isPasswordStrong = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordStrong) {
      setError('A nova senha precisa atender a todos os requisitos de segurança listados abaixo.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A confirmação não coincide com a nova senha digitada.');
      return;
    }

    if (!token || token.trim().length < 10) {
      setError('Token de redefinição inválido ou expirado. Por favor, solicite um novo link.');
      return;
    }

    setIsSubmitting(true);
    const resolvedEmail = (email || '').trim().toLowerCase();

    try {
      // 1. Tenta redefinir via API Serverless
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          newPassword,
          email: resolvedEmail
        })
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const targetEmail = (data.email || resolvedEmail || '').trim().toLowerCase();
        // Atualiza senha no storage local sincronizado
        if (targetEmail) {
          await storageService.resetUserPassword(targetEmail, newPassword);
        }
        setIsSuccess(true);
        return;
      }

      // 2. Fallback para verificação local de contingência
      const localVerify = await storageService.verifyAndConsumeLocalToken(token.trim(), 'PASSWORD_RESET');
      const fallbackEmail = (localVerify.tokenRecord?.email || resolvedEmail || '').trim().toLowerCase();
      if (fallbackEmail) {
        await storageService.resetUserPassword(fallbackEmail, newPassword);
        setIsSuccess(true);
        return;
      }

      const errData = await res.json().catch(() => ({}));
      setError(errData.error || localVerify.error || 'Link expirado ou já utilizado. Por favor, solicite um novo link de redefinição.');
    } catch {
      // Fallback local se estiver offline
      const localVerify = await storageService.verifyAndConsumeLocalToken(token.trim(), 'PASSWORD_RESET');
      const fallbackEmail = (localVerify.tokenRecord?.email || resolvedEmail || '').trim().toLowerCase();
      if (fallbackEmail) {
        await storageService.resetUserPassword(fallbackEmail, newPassword);
        setIsSuccess(true);
      } else {
        setError('Ocorreu um erro ao validar a solicitação. Por favor, solicite um novo link.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dex-cream dark:bg-[#0A1922] flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8 relative font-serif text-dex-navy-950 dark:text-[#F9ECE2] overflow-x-hidden selection:bg-dex-coral selection:text-white transition-colors duration-200">
      {/* Navegação Superior */}
      <div className="max-w-[960px] w-full mx-auto mb-4 flex items-center justify-between px-2 relative z-10">
        <button
          onClick={onNavigateToLanding}
          className="flex items-center gap-1.5 text-xs text-dex-support dark:text-[#A6C5CD] hover:text-dex-navy-950 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao início</span>
        </button>

        {/* Botão Alternador de Tema */}
        <button
          type="button"
          onClick={toggleTheme}
          title={`Tema: ${isDark ? 'Escuro (clique para Claro)' : 'Claro (clique para Escuro)'}`}
          aria-label="Alternar tema claro e escuro"
          className="p-2 rounded-full bg-white/60 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-dex-navy-950 dark:text-[#F9ECE2] transition-all cursor-pointer shadow-xs"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-dex-navy-900" />}
        </button>
      </div>

      {/* CONTAINER FLEX: PENAS ESQUERDA + CARD CENTRAL + PENAS DIREITA */}
      <div className="w-full max-w-[1340px] mx-auto flex flex-col sm:flex-row items-center sm:items-stretch justify-center gap-4 md:gap-6 lg:gap-8">
        
        {/* Penas do Topo no Mobile (< sm) */}
        <div className="flex sm:hidden w-full justify-between items-center px-2 pointer-events-none select-none">
          <img
            src="/img/pena2.png"
            alt=""
            aria-hidden="true"
            width="120"
            height="150"
            className="w-16 h-auto drop-shadow-md animate-feather-drift dex-illustration-glow"
          />
          <img
            src="/img/pena5.png"
            alt=""
            aria-hidden="true"
            width="120"
            height="170"
            className="w-16 h-auto drop-shadow-md animate-feather-drift dex-illustration-glow"
          />
        </div>

        {/* COLUNA LATERAL ESQUERDA DE PENAS */}
        <div className="hidden sm:flex flex-col justify-between items-center py-10 shrink-0 pointer-events-none select-none">
          <img
            src="/img/pena2.png"
            alt=""
            aria-hidden="true"
            width="180"
            height="220"
            className="w-20 md:w-28 lg:w-36 h-auto drop-shadow-md animate-feather-drift mt-8 dex-illustration-glow"
          />
          <img
            src="/img/pena4.png"
            alt=""
            aria-hidden="true"
            width="190"
            height="190"
            className="w-20 md:w-28 lg:w-36 h-auto drop-shadow-md mb-2 dex-illustration-glow"
          />
        </div>

        {/* CARD PRINCIPAL PÊSSEGO / NAVY (Anexo 3) */}
        <div className="flex-1 max-w-[960px] w-full bg-dex-peach dark:bg-[#162B37] rounded-[28px] sm:rounded-[36px] shadow-2xl p-6 sm:p-10 lg:p-12 relative z-10 border border-[#D5B093]/70 dark:border-[#214154] transition-colors duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            
            {/* COLUNA ESQUERDA: Logo, Identidade e Corvo */}
            <div className="lg:col-span-5 flex flex-col justify-between items-center lg:items-start text-center lg:text-left border-b lg:border-b-0 lg:border-r border-[#35474B]/40 dark:border-[#214154]/70 pb-8 lg:pb-0 lg:pr-8">
              <div className="space-y-4 w-full flex flex-col items-center lg:items-start">
                <DexLogo variant={isDark ? "white" : "dark"} size="lg" />
                <p className="text-xs sm:text-sm text-dex-navy-950/80 dark:text-[#A6C5CD] italic font-serif">
                  Sistema de Advocacia
                </p>

                <div className="pt-2">
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-dex-navy-950 dark:text-[#F9ECE2] leading-tight">
                    Nova Senha
                  </h1>
                  <p className="text-xs sm:text-sm text-dex-support dark:text-[#A6C5CD] italic mt-1">
                    Defina sua nova credencial de segurança
                  </p>
                </div>

                <div className="w-3/4 lg:w-full h-[1px] bg-[#35474B]/40 dark:bg-[#214154]/70 my-3" />
              </div>

              {/* Corvo 2 Desktop */}
              <div className="hidden lg:flex w-full justify-end items-end pt-4 -mr-8 overflow-hidden pointer-events-none select-none">
                <img
                  src="/img/corvo2.png"
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                  width="380"
                  height="440"
                  className="w-[300px] xl:w-[340px] max-w-none h-auto drop-shadow-xl dex-illustration-glow"
                  style={{ transform: 'translateX(25%)' }}
                />
              </div>

              {/* Corvo 3 Mobile */}
              <div className="block lg:hidden w-full flex justify-center pt-2 pointer-events-none select-none">
                <img
                  src="/img/corvo3.png"
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                  width="180"
                  height="180"
                  className="w-28 sm:w-36 h-auto drop-shadow-lg dex-illustration-glow"
                />
              </div>
            </div>

            {/* COLUNA DIREITA: Formulário com Indicadores */}
            <div className="lg:col-span-7 flex flex-col justify-center py-2 sm:py-6">
              {isSuccess ? (
                <div className="text-center py-8 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold font-display text-dex-navy-950">
                      Senha alterada com sucesso!
                    </h3>
                    <p className="text-sm text-dex-navy-950/80 leading-relaxed max-w-md mx-auto">
                      Sua credencial foi atualizada e todas as sessões anteriores foram invalidadas por segurança. Você já pode fazer login.
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={onNavigateToLogin}
                      className="px-8 py-3.5 bg-dex-slate-dark hover:bg-dex-slate-darkHover text-white text-sm font-semibold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>Fazer Login agora</span>
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-100/80 border border-red-300 rounded-xl text-red-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-serif italic text-dex-navy-950">
                      Nova Senha
                    </label>
                    <PasswordInput
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-serif italic text-dex-navy-950">
                      Confirmar Nova Senha
                    </label>
                    <PasswordInput
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </div>

                  {/* INDICADOR VISUAL DE REQUISITOS DE SENHA */}
                  <div className="p-3.5 bg-[#FAF0E6] rounded-xl border border-[#D5B093]/70 space-y-2">
                    <p className="text-[11px] font-bold text-dex-navy-950 font-serif flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-dex-slate-dark" />
                      <span>Requisitos da Senha Forense:</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                      <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-semibold' : 'text-dex-support'}`}>
                        {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border border-dex-support/60 inline-block shrink-0" />}
                        <span>No mínimo 8 caracteres</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-700 font-semibold' : 'text-dex-support'}`}>
                        {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border border-dex-support/60 inline-block shrink-0" />}
                        <span>Letra maiúscula (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-700 font-semibold' : 'text-dex-support'}`}>
                        {hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border border-dex-support/60 inline-block shrink-0" />}
                        <span>Letra minúscula (a-z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-dex-support'}`}>
                        {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border border-dex-support/60 inline-block shrink-0" />}
                        <span>Pelo menos 1 número (0-9)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-700 font-semibold' : 'text-dex-support'}`}>
                        {hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border border-dex-support/60 inline-block shrink-0" />}
                        <span>Caractere especial (!@#$...)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-700 font-semibold' : 'text-dex-support'}`}>
                        {passwordsMatch ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border border-dex-support/60 inline-block shrink-0" />}
                        <span>Senhas coincidem</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting || !isPasswordStrong || !passwordsMatch}
                      className="w-full sm:w-auto px-8 py-3 bg-dex-slate-dark dark:bg-[#4A808E] hover:bg-dex-slate-darkHover dark:hover:bg-[#3d6a76] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Atualizando senha...</span>
                        </>
                      ) : (
                        <span>Salvar nova senha</span>
                      )}
                    </button>

                    <AuthSwitchLink
                      prompt="Lembrou a senha?"
                      actionLabel="Fazer login"
                      onAction={onNavigateToLogin}
                    />
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* COLUNA LATERAL DIREITA DE PENAS */}
        <div className="hidden sm:flex flex-col justify-between items-center py-6 shrink-0 pointer-events-none select-none">
          <img
            src="/img/pena5.png"
            alt=""
            aria-hidden="true"
            width="180"
            height="260"
            className="w-20 md:w-28 lg:w-36 h-auto drop-shadow-md animate-feather-drift -mt-4 dex-illustration-glow"
          />
          <img
            src="/img/pena3.png"
            alt=""
            aria-hidden="true"
            width="240"
            height="300"
            className="w-24 md:w-32 lg:w-44 h-auto drop-shadow-lg mb-8 dex-illustration-glow"
          />
        </div>

        {/* Penas de Baixo no Mobile (< sm) */}
        <div className="flex sm:hidden w-full justify-between items-center px-2 pointer-events-none select-none">
          <img
            src="/img/pena4.png"
            alt=""
            aria-hidden="true"
            width="120"
            height="120"
            className="w-16 h-auto drop-shadow-md dex-illustration-glow"
          />
          <img
            src="/img/pena3.png"
            alt=""
            aria-hidden="true"
            width="140"
            height="180"
            className="w-20 h-auto drop-shadow-lg dex-illustration-glow"
          />
        </div>
      </div>
    </div>
  );
};

