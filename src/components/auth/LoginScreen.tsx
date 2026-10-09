import React, { useState } from 'react';
import { Scale, Lock, Mail, ArrowRight, ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      setError('Por favor, informe seu e-mail institucional e a sua senha de acesso.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(cleanEmail, password);
      if (!res.success) {
        setError(res.error || 'Não foi possível autenticar. Verifique suas credenciais.');
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
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs leading-relaxed animate-in fade-in">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-mail Institucional *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="usuario@escritorio.adv.br"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Senha de Acesso *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-300">
                Acesso de Teste (Qualquer Computador / Anônima):
              </span>
              <span className="text-[10px] text-cyan-400 font-mono font-medium">Senha: Admin123!</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@dexjuridico.adv.br');
                  setPassword('Admin123!');
                  setError(null);
                }}
                className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-left transition-colors cursor-pointer group"
                title="Dra. Helena Moreira - Administradora do Escritório"
              >
                <div className="text-[11px] font-bold text-white group-hover:text-cyan-300">
                  🛡️ Helena (Admin)
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
                title="Dr. Otton Luis - Sócio e Administrador"
              >
                <div className="text-[11px] font-bold text-white group-hover:text-cyan-300">
                  ⚖️ Dr. Otton (Admin)
                </div>
                <div className="text-[9px] text-slate-400 truncate">
                  otton.luis.alcaraz@...
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('beatriz.albuquerque@dexjuridico.adv.br');
                  setPassword('Admin123!');
                  setError(null);
                }}
                className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-left transition-colors cursor-pointer group"
                title="Dra. Beatriz Albuquerque - Advogada Autônoma"
              >
                <div className="text-[11px] font-bold text-white group-hover:text-cyan-300">
                  💼 Beatriz (Autônoma)
                </div>
                <div className="text-[9px] text-slate-400 truncate">
                  beatriz.albuquerque@...
                </div>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              💡 Clique em um dos perfis acima para preencher automaticamente ou crie uma conta personalizada abaixo.
            </p>
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
    </div>
  );
};
