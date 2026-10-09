import React, { useState } from 'react';
import { 
  Scale, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  Phone, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft,
  Eye,
  EyeOff,
  Star,
  Briefcase,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onNavigateToLanding: () => void;
  initialPlan?: string;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onNavigateToLanding,
  initialPlan = 'Escritório Pro'
}) => {
  const { registerUser } = useAuth();
  const { showToast } = useData();

  // Tipo de cadastro: Escritório vs Advogado Individual
  const [accountType, setAccountType] = useState<'OFFICE' | 'LAWYER'>('OFFICE');

  // Se for advogado, modalidade: Autônomo vs Vinculado a Escritório
  const [lawyerAffiliation, setLawyerAffiliation] = useState<'INDEPENDENT' | 'LINKED'>('INDEPENDENT');
  const [officeCodeOrEmail, setOfficeCodeOrEmail] = useState('');

  // Campos de Escritório
  const [firmName, setFirmName] = useState('');

  // Campos Comuns
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [oab, setOab] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper de força da senha
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const pwdScore = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações gerais
    if (!fullName.trim() || !email.trim() || !oab.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios marcados com (*).');
      return;
    }

    if (accountType === 'OFFICE' && !firmName.trim()) {
      setError('Informe o nome ou razão social do seu escritório de advocacia.');
      return;
    }

    if (accountType === 'LAWYER' && lawyerAffiliation === 'LINKED' && !officeCodeOrEmail.trim()) {
      setError('Informe o código ou e-mail institucional do escritório ao qual deseja se vincular.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    if (!agreeTerms) {
      setError('Você deve concordar com os termos de sigilo profissional e conformidade LGPD.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await registerUser({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: accountType === 'OFFICE' ? 'ADMIN' : 'LAWYER',
        oab: oab.trim().toUpperCase(),
        phone: phone.trim() || undefined,
        firmName: accountType === 'OFFICE' ? firmName.trim() : undefined,
        plan: accountType === 'OFFICE' ? selectedPlan : 'Advogado Individual',
        isIndependent: accountType === 'LAWYER' && lawyerAffiliation === 'INDEPENDENT',
        officeCodeOrEmail: accountType === 'LAWYER' && lawyerAffiliation === 'LINKED' ? officeCodeOrEmail.trim() : undefined
      });

      if (!res.success) {
        setError(res.error || 'Erro ao realizar cadastro.');
        setIsSubmitting(false);
        return;
      }

      showToast(`Bem-vindo(a) ao DEX, Dr(a). ${fullName.split(' ')[0]}! Conta criada com sucesso.`, 'success');
    } catch {
      setError('Ocorreu um erro inesperado ao realizar o cadastro. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  const plans = [
    {
      id: 'Advogado Individual',
      name: 'Individual',
      price: 'R$ 89/mês',
      desc: '1 Advogado • Processos ilimitados'
    },
    {
      id: 'Escritório Pro',
      name: 'Escritório Pro',
      price: 'R$ 199/mês',
      desc: 'Até 5 Advogados • Dex AI Ilimitado'
    },
    {
      id: 'Banca Corporativa',
      name: 'Corporativo',
      price: 'R$ 499/mês',
      desc: 'Equipe Ilimitada • Gestão Avançada'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 -mt-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-32 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar for Back Navigation */}
      <div className="max-w-4xl w-full mx-auto px-4 mb-6 flex items-center justify-between">
        <button
          onClick={onNavigateToLanding}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Página Inicial</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Já tem uma conta?</span>
          <button
            onClick={onNavigateToLogin}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            Fazer Login
          </button>
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto px-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-10 backdrop-blur-xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-brand-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Scale className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">Criar Conta no DEX Jurídico</h1>
              </div>
              <p className="text-xs text-slate-400">
                Plataforma com IA para gestão de processos, prazos e controle de honorários.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4" />
              <span>Sem cartão de crédito • 14 dias grátis</span>
            </div>
          </div>

          {/* Seleção do Tipo de Conta: Escritório vs Advogado */}
          <div className="pt-6 pb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Selecione o seu perfil de cadastro:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType('OFFICE')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                  accountType === 'OFFICE'
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-950/50'
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 text-slate-300'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${accountType === 'OFFICE' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Escritório de Advocacia</span>
                    {accountType === 'OFFICE' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Titular ou sócio administrador. Permite cadastrar e gerenciar equipe de advogados.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAccountType('LAWYER')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                  accountType === 'LAWYER'
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-950/50'
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 text-slate-300'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${accountType === 'LAWYER' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Advogado Individual</span>
                    {accountType === 'LAWYER' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Advogado autônomo ou associado buscando vínculo com um escritório parceiro.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Sub-opção se for Advogado: Autônomo vs Vinculado */}
          {accountType === 'LAWYER' && (
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3 mt-2 animate-in fade-in">
              <span className="text-xs font-bold text-slate-300 block">Como você atuará no sistema?</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="lawyerAffiliation"
                    checked={lawyerAffiliation === 'INDEPENDENT'}
                    onChange={() => setLawyerAffiliation('INDEPENDENT')}
                    className="text-cyan-500"
                  />
                  <div>
                    <span className="font-semibold text-white block">Advogado Autônomo</span>
                    <span className="text-[10px] text-slate-400">Atuação independente, sem vínculo com bancas</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="lawyerAffiliation"
                    checked={lawyerAffiliation === 'LINKED'}
                    onChange={() => setLawyerAffiliation('LINKED')}
                    className="text-cyan-500"
                  />
                  <div>
                    <span className="font-semibold text-white block">Vincular a Escritório</span>
                    <span className="text-[10px] text-slate-400">Informar código ou e-mail de um escritório cadastrado</span>
                  </div>
                </label>
              </div>

              {lawyerAffiliation === 'LINKED' && (
                <div className="pt-2 animate-in fade-in">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Código do Escritório ou E-mail da Banca *
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: DEX-4819 ou contato@moreira.adv.br"
                      value={officeCodeOrEmail}
                      onChange={e => setOfficeCodeOrEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Peça o código exclusivo de identificação ao sócio titular do seu escritório.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs animate-in fade-in">
                {error}
              </div>
            )}

            {/* Section 1: Identificação */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                1. Identificação Profissional
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nome do Escritório (se for escritório) */}
                {accountType === 'OFFICE' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nome do Escritório / Razão Social *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Moreira & Associados Advocacia"
                      value={firmName}
                      onChange={e => setFirmName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                )}

                {/* Nome do Advogado */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dra. Helena Moreira"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>

                {/* Inscrição OAB */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Inscrição OAB com UF *
                  </label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: 184.920/SP"
                      value={oab}
                      onChange={e => setOab(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 uppercase"
                    />
                  </div>
                </div>

                {/* Telefone / WhatsApp */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    WhatsApp Comercial / Celular
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      placeholder="(11) 98765-4321"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Credenciais */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                2. Credenciais de Acesso (Criptografadas)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* E-mail */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    E-mail Institucional *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="contato@seudominio.adv.br"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Senha de Acesso *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
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
                  {/* Strength Bar */}
                  {password && (
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3, 4].map(level => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            pwdScore >= level ? 'bg-cyan-400' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirmação de Senha */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Repita sua senha"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Plano (se for Escritório) */}
            {accountType === 'OFFICE' && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Star className="w-4 h-4 text-cyan-400" />
                  3. Plano para Avaliação (14 dias grátis)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {plans.map(p => {
                    const isSelected = selectedPlan === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlan(p.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-950/50 scale-[1.02]'
                            : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{p.name}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400 block">{p.price}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{p.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Termos e Conformidade */}
            <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-500/30 mt-0.5 cursor-pointer"
                />
                <span className="text-slate-300 leading-relaxed">
                  Declaro ser profissional habilitado e concordo com os{' '}
                  <strong className="text-white">Termos de Uso</strong> e{' '}
                  <strong className="text-white">Política de Privacidade</strong> em conformidade com o Provimento OAB nº 205/2021 e a LGPD (Lei 13.709/2018).
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-brand-600 to-brand-500 hover:from-cyan-400 hover:to-brand-400 text-white font-bold text-sm shadow-xl shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processando seu cadastro com segurança...</span>
                  </>
                ) : (
                  <>
                    <span>Concluir Cadastro & Entrar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Security Note */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ambiente seguro com criptografia e isolamento de dados LGPD</span>
          </div>
        </div>
      </div>
    </div>
  );
};
