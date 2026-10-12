import React, { useState } from 'react';
import { Scale, Lock, Mail, ArrowRight, ShieldCheck, ArrowLeft, Eye, EyeOff, KeyRound, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';

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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 -mt-32 -ml-32 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -mb-32 -mr-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-navy-900 text-white shadow-xl shadow-brand-500/25 border border-brand-400/30 mb-2">
            <Scale className="w-7 h-7" />
          </div>

          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">DEX</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Legal AI
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Plataforma de Gestão Jurídica Modularizada com Inteligência Artificial
          </p>
        </div>

        {/* Main Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-base font-bold text-white">Acesse sua Conta</h2>
            <p className="text-xs text-slate-400">
              Informe suas credenciais profissionais para entrar no sistema
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div 
                id="login-error"
                role="alert"
                className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs leading-relaxed animate-in fade-in"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-mail Institucional *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="username email"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'login-error' : undefined}
                  placeholder="usuario@escritorio.adv.br"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Senha de Acesso *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'login-error' : undefined}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email.trim() || 'otton.luis.alcaraz@gmail.com');
                    setResetPassword('');
                    setResetStatus(null);
                    setShowResetModal(true);
                  }}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Esqueceu ou deseja redefinir a senha?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validando credenciais...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-fill para testes e acesso em qualquer dispositivo / guia anônima */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-300">
                Acessos Rápidos da Banca (Senha única: <span className="text-cyan-400 font-mono">Admin123!</span>):
              </span>
            </div>

            {/* Administradores */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@dexjuridico.adv.br');
                  setPassword('Admin123!');
                  setError(null);
                }}
                className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-left transition-colors cursor-pointer group"
                title="Dra. Helena Moreira - Sócia Administradora"
              >
                <div className="text-[11px] font-bold text-white group-hover:text-cyan-300 truncate">
                  🛡️ Dra. Helena (Sócia Admin)
                </div>
                <div className="text-[9px] text-slate-400 truncate">
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
                className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-left transition-colors cursor-pointer group"
                title="Dr. Otton Luis - Sócio Fundador & Super Admin"
              >
                <div className="text-[11px] font-bold text-white group-hover:text-cyan-300 truncate">
                  ⚖️ Dr. Otton (Sócio & App Admin)
                </div>
                <div className="text-[9px] text-slate-400 truncate">
                  otton.luis.alcaraz@gmail.com
                </div>
              </button>
            </div>

            {/* Advogados Associados Especialistas */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                6 Especialistas da Banca & Autônomo:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('lucas.mendes@dexjuridico.adv.br');
                    setPassword('Admin123!');
                    setError(null);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/70 border border-slate-700/50 text-left transition-colors cursor-pointer"
                  title="Dr. Lucas Mendes - Direito do Trabalho"
                >
                  <div className="text-[10px] font-bold text-slate-200 truncate">💼 Dr. Lucas</div>
                  <div className="text-[9px] text-cyan-400 truncate">Trabalhista</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('camila.rocha@dexjuridico.adv.br');
                    setPassword('Admin123!');
                    setError(null);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/70 border border-slate-700/50 text-left transition-colors cursor-pointer"
                  title="Dra. Camila Rocha - Direito Tributário"
                >
                  <div className="text-[10px] font-bold text-slate-200 truncate">📊 Dra. Camila</div>
                  <div className="text-[9px] text-cyan-400 truncate">Tributário</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('rafael.silveira@dexjuridico.adv.br');
                    setPassword('Admin123!');
                    setError(null);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/70 border border-slate-700/50 text-left transition-colors cursor-pointer"
                  title="Dr. Rafael Silveira - Direito Empresarial"
                >
                  <div className="text-[10px] font-bold text-slate-200 truncate">🏢 Dr. Rafael</div>
                  <div className="text-[9px] text-cyan-400 truncate">Empresarial</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('juliana.matsuoka@dexjuridico.adv.br');
                    setPassword('Admin123!');
                    setError(null);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/70 border border-slate-700/50 text-left transition-colors cursor-pointer"
                  title="Dra. Juliana Matsuoka - Direito Digital & LGPD"
                >
                  <div className="text-[10px] font-bold text-slate-200 truncate">🔒 Dra. Juliana</div>
                  <div className="text-[9px] text-cyan-400 truncate">Digital / LGPD</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('gabriel.fontes@dexjuridico.adv.br');
                    setPassword('Admin123!');
                    setError(null);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/70 border border-slate-700/50 text-left transition-colors cursor-pointer"
                  title="Dr. Gabriel Fontes - Direito de Família e Sucessões"
                >
                  <div className="text-[10px] font-bold text-slate-200 truncate">👨‍👩‍👧 Dr. Gabriel</div>
                  <div className="text-[9px] text-cyan-400 truncate">Família/Sucessões</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('mariana.vasconcelos@dexjuridico.adv.br');
                    setPassword('Admin123!');
                    setError(null);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/70 border border-slate-700/50 text-left transition-colors cursor-pointer"
                  title="Dra. Mariana Vasconcelos - Direito Cível e Imobiliário"
                >
                  <div className="text-[10px] font-bold text-slate-200 truncate">🏠 Dra. Mariana</div>
                  <div className="text-[9px] text-cyan-400 truncate">Cível/Imobiliário</div>
                </button>
              </div>
            </div>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => {
                  setEmail('beatriz.albuquerque@dexjuridico.adv.br');
                  setPassword('Admin123!');
                  setError(null);
                }}
                className="text-[10px] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                title="Testar Perfil de Advogado Autônomo Independente"
              >
                👤 Ou testar com Advogada Autônoma (Dra. Beatriz Albuquerque)
              </button>
            </div>
          </div>

          {/* Cadastro Link */}
          {onNavigateToRegister && (
            <div className="pt-3 border-t border-slate-800 text-center">
              <span className="text-xs text-slate-400">Ainda não tem cadastro? </span>
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                Criar uma conta no DEX
              </button>
            </div>
          )}
        </div>

        {/* Back to Landing Page */}
        {onNavigateToLanding && (
          <div className="text-center">
            <button
              type="button"
              onClick={onNavigateToLanding}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para a Página Inicial</span>
            </button>
          </div>
        )}

        {/* Security & LGPD Footer */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ambiente Seguro com Criptografia e Conformidade LGPD</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Dex — Sistema de Gestão Jurídica Inteligente com IA
          </p>
        </div>
      </div>

      {/* Modal de Redefinição de Senha */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-modal-title"
            className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-5"
          >
            <button
              type="button"
              onClick={() => setShowResetModal(false)}
              aria-label="Fechar janela de redefinição de senha"
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400" aria-hidden="true">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 id="reset-modal-title" className="text-base font-bold text-white">Redefinir Senha de Acesso</h3>
                <p className="text-xs text-slate-400">Defina uma nova senha para sua conta</p>
              </div>
            </div>

            {resetStatus && (
              <div
                role="status"
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  resetStatus.success
                    ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-200'
                    : 'bg-rose-950/60 border border-rose-800 text-rose-200'
                }`}
              >
                {resetStatus.success && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" aria-hidden="true" />}
                <span>{resetStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-xs font-semibold text-slate-300 mb-1">
                  E-mail Institucional Cadastrado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
                  <input
                    id="reset-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="ex: otton.luis.alcaraz@gmail.com"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reset-password" className="block text-xs font-semibold text-slate-300 mb-1">
                  Nova Senha de Acesso (Mínimo 6 dígitos)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
                  <input
                    id="reset-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={resetPassword}
                    onChange={e => setResetPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isResetting ? 'Atualizando...' : 'Salvar Nova Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
