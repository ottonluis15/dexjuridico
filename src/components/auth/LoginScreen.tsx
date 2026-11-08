import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  X,
  Lock,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { DexLogo } from '../common/DexLogo';

interface LoginScreenProps {
  onNavigateToRegister?: () => void;
  onNavigateToLanding?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onNavigateToLanding
}) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal de Redefinição de Senha
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetStatus, setResetStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);
    const clean = resetEmail.trim().toLowerCase();
    if (!clean || !resetPassword.trim()) {
      setResetStatus({ success: false, message: 'Preencha o e-mail e a nova senha.' });
      return;
    }
    if (resetPassword.length < 6) {
      setResetStatus({ success: false, message: 'A senha deve conter no mínimo 6 caracteres.' });
      return;
    }

    setIsResetting(true);
    try {
      const ok = await storageService.resetUserPassword(clean, resetPassword);
      if (ok) {
        setResetStatus({ success: true, message: 'Senha atualizada com sucesso! Você já pode entrar com a nova senha.' });
        setEmail(clean);
        setPassword(resetPassword);
        setTimeout(() => {
          setShowResetModal(false);
          setResetStatus(null);
        }, 1800);
      } else {
        setResetStatus({ success: false, message: 'Nenhuma conta encontrada com este e-mail para redefinir.' });
      }
    } catch {
      setResetStatus({ success: false, message: 'Erro ao redefinir a senha. Tente novamente.' });
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail && !cleanPassword) {
      setError('Por favor, informe seu e-mail e a senha de acesso.');
      return;
    }

    if (!cleanEmail) {
      setError('Por favor, informe seu e-mail institucional.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Por favor, informe um endereço de e-mail válido (exemplo: usuario@escritorio.adv.br).');
      return;
    }

    if (!cleanPassword) {
      setError('Por favor, informe sua senha de acesso.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(cleanEmail, cleanPassword);
      if (!res.success) {
        setError(res.error || 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.');
      }
    } catch {
      setError('Ocorreu um erro ao processar o login. Tente novamente em instantes.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dex-cream flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8 relative font-serif text-dex-navy-950 overflow-x-hidden selection:bg-dex-coral selection:text-white">
      {/* Navegação Superior */}
      <div className="max-w-[960px] w-full mx-auto mb-4 flex items-center justify-between px-2 relative z-10">
        {onNavigateToLanding && (
          <button
            onClick={onNavigateToLanding}
            className="flex items-center gap-1.5 text-xs text-dex-support hover:text-dex-navy-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao início</span>
          </button>
        )}
      </div>

      {/* CONTAINER FLEX: COLUNA DE PENAS ESQUERDA + CARD CENTRAL + COLUNA DE PENAS DIREITA */}
      <div className="w-full max-w-[1340px] mx-auto flex flex-col sm:flex-row items-center sm:items-stretch justify-center gap-4 md:gap-6 lg:gap-8">
        {/* Penas do Topo no Mobile (< sm) */}
        <div className="flex sm:hidden w-full justify-between items-center px-2 pointer-events-none select-none">
          <img
            src="/img/pena2.png"
            alt=""
            aria-hidden="true"
            width="120"
            height="150"
            className="w-16 h-auto drop-shadow-md animate-feather-drift"
          />
          <img
            src="/img/pena5.png"
            alt=""
            aria-hidden="true"
            width="120"
            height="170"
            className="w-16 h-auto drop-shadow-md animate-feather-drift"
          />
        </div>

        {/* COLUNA LATERAL ESQUERDA DE PENAS (Fica exatamente ao lado esquerdo do conteúdo) */}
        <div className="hidden sm:flex flex-col justify-between items-center py-10 shrink-0 pointer-events-none select-none">
          <img
            src="/img/pena2.png"
            alt=""
            aria-hidden="true"
            width="180"
            height="220"
            className="w-20 md:w-28 lg:w-36 h-auto drop-shadow-md animate-feather-drift mt-8"
          />
          <img
            src="/img/pena4.png"
            alt=""
            aria-hidden="true"
            width="190"
            height="190"
            className="w-20 md:w-28 lg:w-36 h-auto drop-shadow-md mb-2"
          />
        </div>

        {/* CARD PRINCIPAL PÊSSEGO (Estilo Anexo 3) */}
        <div className="flex-1 max-w-[960px] w-full bg-dex-peach rounded-[28px] sm:rounded-[36px] shadow-2xl p-6 sm:p-10 lg:p-12 relative z-10 border border-[#D5B093]/70">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* COLUNA ESQUERDA: Logo, Textos e Ilustração */}
          <div className="lg:col-span-5 flex flex-col justify-between items-center lg:items-start text-center lg:text-left border-b lg:border-b-0 lg:border-r border-[#35474B]/40 pb-8 lg:pb-0 lg:pr-8">
            <div className="space-y-4 w-full flex flex-col items-center lg:items-start">
              <DexLogo variant="dark" size="lg" />
              <p className="text-xs sm:text-sm text-dex-navy-950/80 italic font-serif">
                Sistema de Advocacia
              </p>

              <div className="pt-2">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-dex-navy-950 leading-tight">
                  Acesse sua conta
                </h1>
                <p className="text-xs sm:text-sm text-dex-support italic mt-1">
                  Entre com suas credenciais forenses
                </p>
              </div>

              <div className="w-3/4 lg:w-full h-[1px] bg-[#35474B]/40 my-3" />
            </div>

            {/* Ilustração Mobile: corvo3.png (usado no mobile como solicitado) */}
            <div className="block lg:hidden w-full flex justify-center pt-2 pb-1 pointer-events-none">
              <img
                src="/img/corvo3.png"
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                width="180"
                height="180"
                className="w-28 sm:w-36 h-auto drop-shadow-md select-none"
              />
            </div>

            {/* Ilustração Desktop: corvo2.png grande encostando na divisória (Fiel ao Anexo 3) */}
            <div className="hidden lg:flex w-full flex-1 items-end justify-end pointer-events-none -mr-8 mt-4 relative overflow-visible">
              <img
                src="/img/corvo2.png"
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                width="380"
                height="380"
                style={{ transform: 'translateX(25%)' }}
                className="w-[300px] xl:w-[340px] max-w-none h-auto drop-shadow-md select-none"
              />
            </div>
          </div>

          {/* COLUNA DIREITA: Formulário e Acessos Rápidos */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div className="text-center">
              <span className="text-xs sm:text-sm italic font-serif text-dex-navy-950/90 font-medium">
                Credenciais de acesso
              </span>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-dex-coral/20 border border-dex-coral/60 text-dex-navy-950 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* E-mail */}
              <div className="space-y-1">
                <label className="block text-xs italic font-serif text-dex-navy-950">
                  E-mail institucional
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@escritorio.adv.br"
                  className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark transition-all"
                />
              </div>

              {/* Senha */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs italic font-serif text-dex-navy-950">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-dex-support hover:text-dex-navy-950 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha de acesso"
                  className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark transition-all"
                />
              </div>

              {/* Link Recuperar Senha */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email.trim() || 'otton.luis.alcaraz@gmail.com');
                    setResetPassword('');
                    setResetStatus(null);
                    setShowResetModal(true);
                  }}
                  className="text-xs text-dex-terracotta hover:underline italic cursor-pointer"
                >
                  Esqueceu ou deseja redefinir a senha?
                </button>
              </div>

              {/* Botão Entrar no Sistema */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-dex-slate-dark hover:bg-dex-slate-darkHover text-white text-sm font-semibold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Validando credenciais...</span>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Link Criar Escritório */}
              {onNavigateToRegister && (
                <div className="text-center text-xs text-dex-navy-950 pt-1">
                  <span>Não tem conta? </span>
                  <button
                    type="button"
                    onClick={onNavigateToRegister}
                    className="text-dex-terracotta hover:underline font-semibold cursor-pointer italic"
                  >
                    Criar escritório
                  </button>
                </div>
              )}
            </form>

            {/* ACESSOS RÁPIDOS DEMO / TESTES */}
            <div className="pt-4 border-t border-[#35474B]/30 space-y-2">
              <div className="text-center">
                <span className="text-[11px] font-semibold text-dex-navy-950/80">
                  Acessos Rápidos da Banca (Senha: <span className="font-mono text-dex-terracotta font-bold">Admin123!</span>):
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@dexjuridico.adv.br');
                    setPassword('Admin123!');
                    setError(null);
                  }}
                  className="p-2 rounded-xl bg-dex-input/80 hover:bg-dex-input text-left transition-colors cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-dex-navy-950 truncate">
                    ⚖️ Dra. Helena (Sócia Admin)
                  </div>
                  <div className="text-[9px] text-dex-support truncate">
                    admin@dexjuridico.adv.br
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('otton.luis.alcaraz@gmail.com');
                    setPassword('Admin123!');
                    setError(null);
                  }}
                  className="p-2 rounded-xl bg-dex-input/80 hover:bg-dex-input text-left transition-colors cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-dex-navy-950 truncate">
                    🛡️ Dr. Otton (App Admin)
                  </div>
                  <div className="text-[9px] text-dex-support truncate">
                    otton.luis.alcaraz@gmail.com
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('lucas.mendes@dexjuridico.adv.br');
                    setPassword('Admin123!');
                    setError(null);
                  }}
                  className="p-1.5 rounded-lg bg-dex-input/60 hover:bg-dex-input text-left transition-colors cursor-pointer"
                >
                  <div className="text-[10px] font-bold text-dex-navy-950 truncate">Dr. Lucas</div>
                  <div className="text-[9px] text-dex-support truncate">Trabalhista</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('camila.rocha@dexjuridico.adv.br');
                    setPassword('Admin123!');
                    setError(null);
                  }}
                  className="p-1.5 rounded-lg bg-dex-input/60 hover:bg-dex-input text-left transition-colors cursor-pointer"
                >
                  <div className="text-[10px] font-bold text-dex-navy-950 truncate">Dra. Camila</div>
                  <div className="text-[9px] text-dex-support truncate">Tributário</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('juliana.matsuoka@dexjuridico.adv.br');
                    setPassword('Admin123!');
                    setError(null);
                  }}
                  className="p-1.5 rounded-lg bg-dex-input/60 hover:bg-dex-input text-left transition-colors cursor-pointer"
                >
                  <div className="text-[10px] font-bold text-dex-navy-950 truncate">Dra. Juliana</div>
                  <div className="text-[9px] text-dex-support truncate">Digital / LGPD</div>
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* COLUNA LATERAL DIREITA DE PENAS (Fica exatamente ao lado direito do conteúdo) */}
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

      {/* MODAL REDEFINIR SENHA */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-dex-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dex-peach rounded-[28px] max-w-md w-full p-6 sm:p-8 border border-dex-border shadow-2xl relative">
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute top-5 right-5 p-1.5 text-dex-support hover:text-dex-navy-950 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-display font-bold text-dex-navy-950 mb-1">
              Redefinir Senha
            </h3>
            <p className="text-xs text-dex-support mb-4 italic">
              Informe seu e-mail cadastrado e a nova senha desejada.
            </p>

            {resetStatus && (
              <div className={`p-3 rounded-xl text-xs mb-4 ${
                resetStatus.success
                  ? 'bg-emerald-500/20 text-emerald-900 border border-emerald-500/40'
                  : 'bg-dex-coral/20 text-dex-navy-950 border border-dex-coral/40'
              }`}>
                {resetStatus.message}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs italic font-serif text-dex-navy-950">
                  E-mail cadastrado
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-slate-dark"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs italic font-serif text-dex-navy-950">
                  Nova senha (mínimo 6 dígitos)
                </label>
                <input
                  type="password"
                  required
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-slate-dark"
                />
              </div>

              <button
                type="submit"
                disabled={isResetting}
                className="w-full py-2.5 bg-dex-slate-dark hover:bg-dex-slate-darkHover text-white text-xs font-semibold rounded-xl shadow transition-all cursor-pointer"
              >
                {isResetting ? 'Atualizando senha...' : 'Salvar nova senha'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
