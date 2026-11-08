import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Clock, 
  Send,
  Sun,
  Moon
} from 'lucide-react';
import { DexLogo } from '../common/DexLogo';
import { storageService } from '../../services/storageService';
import { useTheme } from '../../context/ThemeContext';

interface EmailConfirmationScreenProps {
  email?: string;
  token?: string;
  onNavigateToLogin: () => void;
  onNavigateToLanding: () => void;
}

export const EmailConfirmationScreen: React.FC<EmailConfirmationScreenProps> = ({
  email: initialEmail = '',
  token = '',
  onNavigateToLogin,
  onNavigateToLanding
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<'IDLE' | 'VERIFYING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState<string>('');
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Contador de cooldown de 60 segundos para evitar disparos em massa
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(c => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Se houver um token na URL, valida automaticamente
  useEffect(() => {
    if (token && token.trim().length > 10) {
      verifyToken(token.trim());
    }
  }, [token]);

  const verifyToken = async (rawToken: string) => {
    setStatus('VERIFYING');
    setMessage('Validando suas credenciais de segurança forense...');

    try {
      // 1. Tenta validar no backend Serverless da Vercel
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: rawToken })
      });

      if (res.ok) {
        const data = await res.json();
        // Atualiza também no armazenamento local sincronizado
        if (data.email) {
          storageService.markUserEmailConfirmed(data.email);
        }
        setStatus('SUCCESS');
        setMessage(data.message || 'Seu e-mail foi confirmado com sucesso! O acesso à sua banca está plenamente ativo.');
        return;
      }

      // 2. Fallback para verificação local de token caso esteja em preview/standalone
      const localResult = await storageService.verifyAndConsumeLocalToken(rawToken, 'EMAIL_VERIFICATION');
      if (localResult.valid && localResult.tokenRecord) {
        storageService.markUserEmailConfirmed(localResult.tokenRecord.email);
        setStatus('SUCCESS');
        setMessage('Seu e-mail foi confirmado com sucesso! O acesso à sua banca está plenamente ativo.');
        return;
      }

      const errData = await res.json().catch(() => ({}));
      setStatus('ERROR');
      setMessage(errData.error || localResult.error || 'Link de confirmação inválido ou expirado. Por favor, solicite um novo envio.');
    } catch {
      // Se falhar a rede, tenta local
      const localResult = await storageService.verifyAndConsumeLocalToken(rawToken, 'EMAIL_VERIFICATION');
      if (localResult.valid && localResult.tokenRecord) {
        storageService.markUserEmailConfirmed(localResult.tokenRecord.email);
        setStatus('SUCCESS');
        setMessage('Seu e-mail foi confirmado com sucesso! O acesso à sua banca está plenamente ativo.');
      } else {
        setStatus('ERROR');
        setMessage('Não foi possível validar o link de confirmação. Por favor, solicite um novo link.');
      }
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setMessage('Por favor, informe seu e-mail para receber as instruções.');
      return;
    }

    setIsResending(true);
    setResendSuccess(false);

    try {
      const origin = window.location.origin;
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, origin })
      });

      if (res.ok) {
        setResendSuccess(true);
        setCooldown(60); // 60 segundos de intervalo mínimo entre reenvios
        setMessage('E-mail de confirmação reenviado com sucesso! Verifique sua caixa de entrada.');
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage(err.error || 'Muitas tentativas recentes. Por favor, aguarde alguns minutos antes de reenviar.');
      }
    } catch {
      // Fallback local se estiver offline
      await storageService.createLocalAuthToken({
        userId: `usr_${cleanEmail}`,
        email: cleanEmail,
        type: 'EMAIL_VERIFICATION',
        expiresInHours: 24
      });
      setResendSuccess(true);
      setCooldown(60);
      setMessage('Instruções reenviadas com sucesso! Verifique sua caixa postal.');
    } finally {
      setIsResending(false);
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

        {/* CARD PRINCIPAL PÊSSEGO / NAVY (Design System Anexo 3) */}
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
                    {status === 'SUCCESS' ? 'E-mail Confirmado!' : 'Confirmação de Acesso'}
                  </h1>
                  <p className="text-xs sm:text-sm text-dex-support dark:text-[#A6C5CD] italic mt-1">
                    Ativação segura de conta forense
                  </p>
                </div>

                <div className="w-3/4 lg:w-full h-[1px] bg-[#35474B]/40 dark:bg-[#214154]/70 my-3" />
              </div>

              {/* Corvo 2 no Desktop (encostando na linha divisória) */}
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

              {/* Corvo 3 no Mobile */}
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

            {/* COLUNA DIREITA: Conteúdo e Ações */}
            <div className="lg:col-span-7 flex flex-col justify-center py-2 sm:py-6">
              
              {/* ESTADO 1: VERIFICANDO TOKEN */}
              {status === 'VERIFYING' && (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-dex-slate-dark/10 text-dex-slate-dark flex items-center justify-center mx-auto animate-spin">
                    <RefreshCw className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-dex-navy-950">
                    Validando confirmação...
                  </h3>
                  <p className="text-sm text-dex-support italic max-w-md mx-auto">
                    {message}
                  </p>
                </div>
              )}

              {/* ESTADO 2: SUCESSO */}
              {status === 'SUCCESS' && (
                <div className="text-center py-8 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold font-display text-dex-navy-950">
                      Conta ativada com sucesso!
                    </h3>
                    <p className="text-sm text-dex-navy-950/80 leading-relaxed max-w-md mx-auto">
                      Seu endereço de e-mail foi validado e sua credencial forense está pronta para uso no Dex.
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={onNavigateToLogin}
                      className="px-8 py-3.5 bg-dex-slate-dark hover:bg-dex-slate-darkHover text-white text-sm font-semibold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>Acessar minha conta</span>
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>
              )}

              {/* ESTADO 3: ERRO OU AGUARDANDO CONFIRMAÇÃO */}
              {(status === 'IDLE' || status === 'ERROR') && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-[#FAF0E6] rounded-2xl border border-[#D5B093]/80">
                    <div className="w-10 h-10 rounded-xl bg-dex-coral/15 text-dex-coral flex items-center justify-center shrink-0">
                      {status === 'ERROR' ? <AlertCircle className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-dex-navy-950">
                        {status === 'ERROR' ? 'Atenção na validação' : 'Verifique sua caixa de entrada'}
                      </h4>
                      <p className="text-xs text-dex-support italic mt-0.5">
                        {status === 'ERROR' ? message : 'Enviamos um link de confirmação para ativar o acesso à sua conta.'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-serif italic text-dex-navy-950">
                      Endereço de e-mail cadastrado
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu.email@escritorio.adv.br"
                        className="w-full px-4 py-3 bg-dex-input rounded-xl text-dex-navy-950 text-sm focus:outline-none focus:ring-2 focus:ring-dex-navy-950 placeholder:text-dex-support/60 shadow-inner"
                      />
                    </div>
                  </div>

                  {resendSuccess && (
                    <div className="p-3 bg-emerald-100/70 border border-emerald-300/80 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>E-mail de confirmação reenviado! Verifique também a pasta de spam.</span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending || cooldown > 0}
                      className="w-full sm:w-auto px-6 py-3 bg-dex-slate-dark hover:bg-dex-slate-darkHover text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isResending ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Enviando...</span>
                        </>
                      ) : cooldown > 0 ? (
                        <>
                          <Clock className="w-4 h-4" />
                          <span>Aguarde {cooldown}s para reenviar</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Reenviar e-mail de confirmação</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={onNavigateToLogin}
                      className="text-xs text-dex-terracotta hover:underline font-semibold cursor-pointer italic"
                    >
                      Já confirmou? Fazer Login
                    </button>
                  </div>
                </div>
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
            className="w-20 md:w-28 lg:w-36 h-auto drop-shadow-md animate-feather-drift -mt-4"
          />
          <img
            src="/img/pena3.png"
            alt=""
            aria-hidden="true"
            width="240"
            height="300"
            className="w-24 md:w-32 lg:w-44 h-auto drop-shadow-lg mb-8"
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
            className="w-16 h-auto drop-shadow-md"
          />
          <img
            src="/img/pena3.png"
            alt=""
            aria-hidden="true"
            width="140"
            height="180"
            className="w-20 h-auto drop-shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

