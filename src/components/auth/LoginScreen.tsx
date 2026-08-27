import React, { useState } from 'react';
import { Scale, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login, availableUsers } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Por favor, informe seu e-mail institucional e senha.');
      return;
    }

    const success = login(email.trim());
    if (!success) {
      setError('Credenciais não reconhecidas. Utilize um dos botões de acesso rápido abaixo para demonstração.');
    }
  };

  const handleQuickLogin = (userEmail: string) => {
    login(userEmail);
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
          {/* Quick Access Simulation Buttons */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
              Acesso Rápido para Demonstração (RBAC)
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Admin Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('helena.moreira@dexjuridico.adv.br')}
                className="p-3 rounded-2xl bg-gradient-to-r from-brand-950/60 to-slate-800/80 hover:from-brand-900/60 hover:to-slate-700/80 border border-brand-500/40 text-left transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120"
                    alt="Dra. Helena"
                    className="w-10 h-10 rounded-xl object-cover border border-brand-400/40"
                  />
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors block">
                      Entrar como Administradora
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Dra. Helena Moreira (Sócia • Visão Total)
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-400 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Lawyer Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('lucas.mendes@dexjuridico.adv.br')}
                className="p-3 rounded-2xl bg-gradient-to-r from-slate-800/60 to-slate-800/80 hover:from-slate-700/60 hover:to-slate-700/80 border border-slate-700 text-left transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=120"
                    alt="Dr. Lucas"
                    className="w-10 h-10 rounded-xl object-cover border border-slate-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors block">
                      Entrar como Advogado Associado
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Dr. Lucas Mendes (Visão Filtrada de Casos)
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-800" />
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ou autentique com senha</span>
            <div className="flex-1 border-t border-slate-800" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-mail Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="usuario@dexjuridico.adv.br"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Acessar o Dex</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Security & LGPD Footer */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ambiente Seguro com Criptografia e Conformidade LGPD</span>
          </div>
          <p className="text-[11px] text-slate-400">
            TCC • Dex — Sistema de Gestão Jurídica Modularizado com IA
          </p>
        </div>
      </div>
    </div>
  );
};
