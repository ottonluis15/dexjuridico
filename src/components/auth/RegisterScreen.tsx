import React, { useState } from 'react';
import { 
  ArrowLeft,
  ArrowRight,
  Building2,
  UserCheck,
  Check,
  CheckCircle2,
  CreditCard,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { DexLogo } from '../common/DexLogo';
import { AuthSwitchLink } from '../common/AuthSwitchLink';
import { PasswordInput } from '../common/PasswordInput';
import { PasswordRequirements } from '../common/PasswordRequirements';
import { validatePassword } from '../../utils/passwordPolicy';
import { DEX_PLANS, PlanId, SubscriptionPeriod, getPlanById } from '../../config/plans';

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
  const { isDark, toggleTheme } = useTheme();

  // Tipo de cadastro: Escritório vs Advogado Individual
  const [accountType, setAccountType] = useState<'OFFICE' | 'LAWYER'>('OFFICE');

  // Modalidade de Advogado (se for LAWYER)
  const [lawyerAffiliation, setLawyerAffiliation] = useState<'INDEPENDENT' | 'LINKED'>('INDEPENDENT');
  const [officeCodeOrEmail, setOfficeCodeOrEmail] = useState('');

  // Passo do assistente de cadastro (Passo 1: Escolha do Plano, Passo 2: Dados e Segurança)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Período de faturamento e Plano selecionado
  const [billingPeriod, setBillingPeriod] = useState<SubscriptionPeriod>('MONTHLY');
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('plano')?.toLowerCase() || '';
      if (p.includes('essencial') || p.includes('essential')) return 'ESSENTIAL';
      if (p.includes('profissional') || p.includes('professional')) return 'PROFESSIONAL';
      if (p.includes('escritorio') || p.includes('office')) return 'OFFICE';
      if (p.includes('gratis') || p.includes('trial')) return 'TRIAL';
    }
    return initialPlan.includes('Individual') || initialPlan.includes('Essencial') ? 'ESSENTIAL' : 'PROFESSIONAL';
  });

  // Dados do Escritório
  const [firmName, setFirmName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [primaryArea, setPrimaryArea] = useState('');
  const [address, setAddress] = useState('');

  // Dados do Administrador / Advogado
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [oab, setOab] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados de UI
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationCompletedEmail, setRegistrationCompletedEmail] = useState<string | null>(null);

  // Máscara amigável de CNPJ: 00.000.000/0000-00
  const handleCnpjChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 14);
    let formatted = raw;
    if (raw.length > 12) {
      formatted = raw.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})$/, '$1.$2.$3/$4-$5');
    } else if (raw.length > 8) {
      formatted = raw.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})$/, '$1.$2.$3/$4');
    } else if (raw.length > 5) {
      formatted = raw.replace(/^(\d{2})(\d{3})(\d{1,3})$/, '$1.$2.$3');
    } else if (raw.length > 2) {
      formatted = raw.replace(/^(\d{2})(\d{1,3})$/, '$1.$2');
    }
    setCnpj(formatted);
  };

  // Máscara amigável de Telefone: (00) 00000-0000
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 10) {
      formatted = raw.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (raw.length > 6) {
      formatted = raw.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (raw.length > 2) {
      formatted = raw.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    }
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações gerais
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (accountType === 'OFFICE' && !firmName.trim()) {
      setError('Informe o nome do escritório.');
      return;
    }

    if (accountType === 'LAWYER' && lawyerAffiliation === 'LINKED' && !officeCodeOrEmail.trim()) {
      setError('Informe o código ou e-mail do escritório ao qual deseja se vincular.');
      return;
    }

    const pwdValidation = validatePassword(password);
    if (!pwdValidation.isValid) {
      setError(pwdValidation.error || 'A senha não atende aos requisitos forenses de segurança.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await registerUser({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: accountType === 'OFFICE' ? 'ADMIN' : 'LAWYER',
        oab: oab.trim().toUpperCase() || 'OAB/PENDENTE',
        phone: phone.trim() || undefined,
        firmName: accountType === 'OFFICE' ? firmName.trim() : undefined,
        cnpj: accountType === 'OFFICE' ? cnpj.trim() : undefined,
        address: address.trim() || undefined,
        primaryArea: primaryArea.trim() || undefined,
        plan: accountType === 'LAWYER' && lawyerAffiliation === 'LINKED' ? 'OFFICE' : selectedPlanId,
        isIndependent: accountType === 'LAWYER' && lawyerAffiliation === 'INDEPENDENT',
        officeCodeOrEmail: accountType === 'LAWYER' && lawyerAffiliation === 'LINKED' ? officeCodeOrEmail.trim() : undefined
      });

      if (!res.success) {
        setError(res.error || 'Erro ao realizar cadastro.');
        setIsSubmitting(false);
        return;
      }

      setRegistrationCompletedEmail(email.trim().toLowerCase());
      setIsSubmitting(false);

      if (res.emailWarning) {
        showToast(`Cadastro criado, mas houve aviso no envio do e-mail: ${res.emailWarning}`, 'warning');
      } else {
        showToast(`Cadastro recebido! Enviamos um link de confirmação para o seu e-mail.`, 'success');
      }
    } catch {
      setError('Ocorreu um erro inesperado ao realizar o cadastro. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dex-cream dark:bg-[#0A1922] flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8 relative font-serif text-dex-navy-950 dark:text-[#F9ECE2] overflow-x-hidden selection:bg-dex-coral selection:text-white transition-colors duration-200">
      {/* Barra de Navegação Superior e Seletor de Tipo */}
      <div className="max-w-[980px] w-full mx-auto mb-4 flex items-center justify-between px-2 relative z-10 gap-3">
        <button
          onClick={onNavigateToLanding}
          className="flex items-center gap-1.5 text-xs text-dex-support dark:text-[#A6C5CD] hover:text-dex-navy-950 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao início</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Seletor Sutil: Escritório vs Advogado Individual */}
          <div role="group" aria-label="Tipo de conta" className="inline-flex items-center bg-[#E5D7CC] dark:bg-[#0F2733] p-1 rounded-full border border-dex-border/80 dark:border-[#214154]">
            <button
              type="button"
              onClick={() => setAccountType('OFFICE')}
              aria-pressed={accountType === 'OFFICE'}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                accountType === 'OFFICE'
                  ? 'bg-dex-navy-950 dark:bg-[#4A808E] text-white shadow-sm font-semibold'
                  : 'text-dex-navy-950/70 dark:text-white/70 hover:text-dex-navy-950 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Escritório</span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType('LAWYER')}
              aria-pressed={accountType === 'LAWYER'}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                accountType === 'LAWYER'
                  ? 'bg-dex-navy-950 dark:bg-[#4A808E] text-white shadow-sm font-semibold'
                  : 'text-dex-navy-950/70 dark:text-white/70 hover:text-dex-navy-950 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Advogado Individual</span>
            </button>
          </div>

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
      </div>

      {/* CONTAINER FLEX: COLUNA DE PENAS ESQUERDA + CARD CENTRAL + COLUNA DE PENAS DIREITA */}
      <div className="w-full max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center sm:items-stretch justify-center gap-4 md:gap-6 lg:gap-8">
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
            className="w-20 md:w-28 lg:w-36 h-auto drop-shadow-md animate-feather-drift mt-10 dex-illustration-glow"
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
        <div className="flex-1 max-w-[980px] w-full bg-dex-peach dark:bg-[#162B37] rounded-[28px] sm:rounded-[36px] shadow-2xl p-6 sm:p-10 lg:p-12 relative z-10 border border-[#D5B093]/70 dark:border-[#214154] transition-colors duration-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* COLUNA ESQUERDA: Logo, Textos e Corvo 2 (Anexo 3) */}
          <div className="lg:col-span-4 flex flex-col justify-between items-center lg:items-start text-center lg:text-left border-b lg:border-b-0 lg:border-r border-[#35474B]/40 dark:border-[#214154]/70 pb-8 lg:pb-0 lg:pr-8">
            <div className="space-y-4 w-full flex flex-col items-center lg:items-start">
              {/* Logo com Balança e Texto Dex */}
              <DexLogo variant={isDark ? "white" : "dark"} size="lg" />
              <p className="text-xs sm:text-sm text-dex-navy-950/80 dark:text-[#A6C5CD] italic font-serif">
                Sistema de Advocacia
              </p>

              {/* Título Principal */}
              <div className="pt-2">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-dex-navy-950 dark:text-[#F9ECE2] leading-tight">
                  {accountType === 'OFFICE' ? 'Crie seu escritório' : 'Cadastro Individual'}
                </h1>
                <p className="text-xs sm:text-sm text-dex-support dark:text-[#A6C5CD] italic mt-1">
                  Preencha os dados para começar
                </p>
              </div>

              {/* Linha horizontal decorativa */}
              <div className="w-3/4 lg:w-full h-[1px] bg-[#35474B]/40 dark:bg-[#214154]/70 my-3" />
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
                className="w-28 sm:w-36 h-auto drop-shadow-md select-none dex-illustration-glow"
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
                className="w-[280px] xl:w-[320px] max-w-none h-auto drop-shadow-md select-none dex-illustration-glow"
              />
            </div>
          </div>

          {/* COLUNA DIREITA: Formulário com Inputs Cinza-Azulado (Anexo 3) */}
          <div className="lg:col-span-8 flex flex-col justify-center">
            {registrationCompletedEmail ? (
              <div className="text-center py-8 space-y-6">
                <div className="w-16 h-16 rounded-full bg-dex-slate-dark/15 text-dex-slate-dark flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10 text-dex-slate-dark" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold font-display text-dex-navy-950">
                    Cadastro recebido com sucesso!
                  </h3>
                  <p className="text-sm text-dex-navy-950/80 leading-relaxed max-w-md mx-auto">
                    Enviamos um link de confirmação para o endereço <strong className="text-dex-navy-950">{registrationCompletedEmail}</strong>.
                  </p>
                  <p className="text-xs text-dex-support italic max-w-sm mx-auto">
                    {selectedPlanId !== 'TRIAL' 
                      ? 'Por segurança institucional, sua conta ficará pendente de ativação até a confirmação do e-mail. Em seguida, você terá acesso à finalização segura pelo Stripe.' 
                      : 'Por segurança institucional, sua conta de avaliação ficará pendente de ativação até a confirmação do e-mail (válido por 24 horas).'}
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="px-8 py-3 bg-dex-slate-dark hover:bg-dex-slate-darkHover text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Ir para Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRegistrationCompletedEmail(null);
                      setCurrentStep(1);
                    }}
                    className="text-xs text-dex-terracotta hover:underline font-semibold cursor-pointer italic"
                  >
                    Voltar ao formulário
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Indicador de Progresso do Assistente de Cadastro */}
                <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#35474B]/20 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-dex-slate-dark dark:bg-[#4A808E] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                      {currentStep}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-dex-navy-950 dark:text-[#F9ECE2]">
                      {currentStep === 1 ? 'Passo 1 de 2: Escolha o Plano da sua Advocacia' : 'Passo 2 de 2: Dados e Credenciais'}
                    </span>
                  </div>
                  {currentStep === 2 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-dex-terracotta dark:text-dex-coral-light hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Alterar plano</span>
                    </button>
                  )}
                </div>

                {error && (
                  <div className="mb-4 p-3.5 rounded-xl bg-dex-coral/20 border border-dex-coral/60 text-dex-navy-950 text-xs font-semibold">
                    {error}
                  </div>
                )}

                {/* PASSO 1: ESCOLHA DO PLANO */}
                {currentStep === 1 && (
                  <div className="space-y-5 animate-fadeIn">
                    {accountType === 'LAWYER' && lawyerAffiliation === 'LINKED' ? (
                      <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#0F2733]/70 border border-[#D5B093]/70 dark:border-[#214154] text-center space-y-3">
                        <UserCheck className="w-8 h-8 text-[#4A808E] mx-auto" />
                        <h4 className="text-base font-bold text-dex-navy-950 dark:text-white">
                          Vínculo a Escritório Existente
                        </h4>
                        <p className="text-xs text-dex-support dark:text-[#A6C5CD] max-w-md mx-auto leading-relaxed">
                          Como advogado associado, seu acesso e faturamento são cobertos integralmente pelo escritório titular. Você não precisa selecionar nenhum plano nem informar cartão de crédito.
                        </p>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="px-6 py-2.5 bg-dex-slate-dark hover:bg-dex-slate-darkHover text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                        >
                          Avançar para dados cadastrais →
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Seletor Ciclo de Cobrança: Mensal vs Anual */}
                        <div className="flex items-center justify-between bg-white/60 dark:bg-[#0F2733]/60 p-2 rounded-2xl border border-[#D5B093]/60 dark:border-[#214154]">
                          <span className="text-xs font-medium text-dex-navy-950/80 dark:text-[#A6C5CD] pl-2">
                            Ciclo de Faturamento:
                          </span>
                          <div className="inline-flex items-center bg-[#E5D7CC] dark:bg-[#1A3342] p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => setBillingPeriod('MONTHLY')}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                billingPeriod === 'MONTHLY'
                                  ? 'bg-dex-slate-dark text-white font-semibold shadow-xs'
                                  : 'text-dex-navy-950/70 dark:text-white/70 hover:text-dex-navy-950'
                              }`}
                            >
                              Mensal
                            </button>
                            <button
                              type="button"
                              onClick={() => setBillingPeriod('YEARLY')}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                billingPeriod === 'YEARLY'
                                  ? 'bg-dex-slate-dark text-white font-semibold shadow-xs'
                                  : 'text-dex-navy-950/70 dark:text-white/70 hover:text-dex-navy-950'
                              }`}
                            >
                              <span>Anual</span>
                              <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                                -20%
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Grade Compacta de Cards de Planos */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                          {(['TRIAL', 'ESSENTIAL', 'PROFESSIONAL', 'OFFICE'] as PlanId[]).map((pid) => {
                            const p = DEX_PLANS[pid];
                            const isSelected = selectedPlanId === pid;
                            const price = billingPeriod === 'YEARLY' ? p.yearlyPricePerMonth : p.monthlyPrice;

                            return (
                              <div
                                key={pid}
                                onClick={() => setSelectedPlanId(pid)}
                                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left relative ${
                                  isSelected
                                    ? 'bg-white dark:bg-[#1A3342] border-dex-slate-dark dark:border-[#4A808E] ring-2 ring-dex-slate-dark/30 shadow-md'
                                    : 'bg-white/50 dark:bg-[#0F2733]/50 border-[#D5B093]/60 dark:border-[#214154] hover:bg-white/80 dark:hover:bg-[#162B37]'
                                }`}
                              >
                                {p.badge && (
                                  <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-dex-peach dark:bg-[#214154] text-dex-navy-950 dark:text-[#A6C5CD] border border-black/5">
                                    {p.badge}
                                  </span>
                                )}

                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-dex-slate-dark dark:border-[#4A808E] bg-dex-slate-dark dark:bg-[#4A808E]' : 'border-gray-400'}`}>
                                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    <h5 className="text-sm font-bold text-dex-navy-950 dark:text-white">
                                      {p.name}
                                    </h5>
                                  </div>

                                  <div className="my-1.5">
                                    {price === 0 ? (
                                      <span className="text-lg font-bold text-dex-navy-950 dark:text-white">Grátis</span>
                                    ) : (
                                      <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-bold text-dex-navy-950 dark:text-white">R$ {price}</span>
                                        <span className="text-[10px] text-dex-support dark:text-[#A6C5CD]">/mês</span>
                                      </div>
                                    )}
                                  </div>

                                  <ul className="text-[11px] text-dex-support dark:text-[#A6C5CD] space-y-1 mb-2">
                                    <li className="flex items-center gap-1.5">
                                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span>Até {p.limits.maxActiveCases} processos ativos</span>
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span>Até {p.limits.maxClients} clientes na carteira</span>
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span>{p.limits.maxLawyers === 1 ? '1 Acesso profissional' : `Até ${p.limits.maxLawyers} advogados`}</span>
                                    </li>
                                  </ul>
                                </div>

                                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px]">
                                  <span className={`font-semibold ${isSelected ? 'text-dex-slate-dark dark:text-[#82B3C0]' : 'text-dex-support/70'}`}>
                                    {isSelected ? '✓ Selecionado' : 'Clique para escolher'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Botão para Avançar para Dados Cadastrais */}
                        <div className="pt-2 text-center space-y-3">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="w-full sm:w-auto min-w-[240px] px-8 py-3 bg-dex-slate-dark hover:bg-dex-slate-darkHover text-white text-sm font-semibold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 mx-auto"
                          >
                            <span>Continuar para Dados Cadastrais</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>

                          <AuthSwitchLink
                            prompt="Já tem conta?"
                            actionLabel="Fazer login"
                            onAction={onNavigateToLogin}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* PASSO 2: FORMULÁRIO DE DADOS CADASTRAIS & SEGURANÇA */}
                {currentStep === 2 && (
                  <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn">
                    {/* Chip de Resumo do Plano Selecionado */}
                    {!(accountType === 'LAWYER' && lawyerAffiliation === 'LINKED') && (
                      <div className="p-3 bg-white/70 dark:bg-[#0F2733]/70 rounded-xl border border-[#D5B093]/70 dark:border-[#214154] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#4A808E]" />
                          <span className="font-semibold text-dex-navy-950 dark:text-white">
                            Plano: {DEX_PLANS[selectedPlanId]?.name}
                          </span>
                          <span className="text-dex-support dark:text-[#A6C5CD]">
                            ({billingPeriod === 'YEARLY' ? 'Anual com -20%' : 'Mensal'})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-dex-terracotta dark:text-dex-coral-light hover:underline font-semibold cursor-pointer"
                        >
                          Trocar
                        </button>
                      </div>
                    )}
              {/* DADOS DO ESCRITÓRIO OU TIPO DE VÍNCULO */}
              {accountType === 'OFFICE' ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-xs sm:text-sm italic font-serif text-dex-navy-950/90 font-medium">
                      Dados do escritório
                    </span>
                  </div>

                  {/* Nome do escritório (Largura Total) */}
                  <div className="space-y-1">
                    <label className="block text-xs italic font-serif text-dex-navy-950">
                      Nome do escritório
                    </label>
                    <input
                      type="text"
                      required
                      value={firmName}
                      onChange={(e) => setFirmName(e.target.value)}
                      placeholder="Ex: Moreira & Associados Advocacia"
                      className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark transition-all"
                    />
                  </div>

                  {/* Cnpj e Telefone (Lado a Lado) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs italic font-serif text-dex-navy-950">
                        Cnpj
                      </label>
                      <input
                        type="text"
                        value={cnpj}
                        onChange={(e) => handleCnpjChange(e.target.value)}
                        placeholder="00.000.000/0000-00"
                        className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs italic font-serif text-dex-navy-950">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark transition-all"
                      />
                    </div>
                  </div>

                  {/* Área Principal e Endereço (Lado a Lado) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs italic font-serif text-dex-navy-950">
                        Área Principal
                      </label>
                      <input
                        type="text"
                        value={primaryArea}
                        onChange={(e) => setPrimaryArea(e.target.value)}
                        placeholder="Ex: Cível, Trabalhista, Tributário"
                        className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs italic font-serif text-dex-navy-950">
                        Endereço
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ex: Av. Paulista, 1500 - SP"
                        className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark transition-all"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-xs sm:text-sm italic font-serif text-dex-navy-950/90 font-medium">
                      Modalidade do Advogado
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLawyerAffiliation('INDEPENDENT')}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                        lawyerAffiliation === 'INDEPENDENT'
                          ? 'bg-dex-navy-950 text-white border-dex-navy-950 shadow'
                          : 'bg-dex-input text-dex-navy-950 border-transparent hover:bg-dex-beige'
                      }`}
                    >
                      Advogado Autônomo
                    </button>
                    <button
                      type="button"
                      onClick={() => setLawyerAffiliation('LINKED')}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                        lawyerAffiliation === 'LINKED'
                          ? 'bg-dex-navy-950 text-white border-dex-navy-950 shadow'
                          : 'bg-dex-input text-dex-navy-950 border-transparent hover:bg-dex-beige'
                      }`}
                    >
                      Vinculado a Escritório
                    </button>
                  </div>

                  {lawyerAffiliation === 'LINKED' && (
                    <div className="space-y-1 pt-1">
                      <label className="block text-xs italic font-serif text-dex-navy-950">
                        Código ou E-mail do Escritório
                      </label>
                      <input
                        type="text"
                        required
                        value={officeCodeOrEmail}
                        onChange={(e) => setOfficeCodeOrEmail(e.target.value)}
                        placeholder="admin@escritorio.adv.br ou código DEX-XXXX"
                        className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* SEPARADOR CENTRAL COM DADOS DO ADMINISTRADOR / ADVOGADO */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1 h-[1px] bg-[#35474B]/40" />
                <span className="text-xs sm:text-sm italic font-serif text-dex-navy-950/90 font-medium shrink-0">
                  {accountType === 'OFFICE' ? 'Dados do administrador' : 'Dados do profissional'}
                </span>
                <div className="flex-1 h-[1px] bg-[#35474B]/40" />
              </div>

              {/* Nome completo (Largura Total) */}
              <div className="space-y-1">
                <label className="block text-xs italic font-serif text-dex-navy-950">
                  Nome completo
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Dra. Helena Moreira"
                  className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark transition-all"
                />
              </div>

              {/* E-mail e OAB* (Lado a Lado) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="block text-xs italic font-serif text-dex-navy-950">
                    E-mail
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

                <div className="space-y-1">
                  <label className="block text-xs italic font-serif text-dex-navy-950">
                    OAB*
                  </label>
                  <input
                    type="text"
                    required
                    value={oab}
                    onChange={(e) => setOab(e.target.value)}
                    placeholder="Ex: SP 123.456"
                    className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark transition-all"
                  />
                </div>
              </div>

              {/* Senha e Confirmar senha (Lado a Lado) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="block text-xs italic font-serif text-dex-navy-950">
                    Senha
                  </label>
                  <PasswordInput
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs italic font-serif text-dex-navy-950">
                    Confirmar senha
                  </label>
                  <PasswordInput
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* Checklist Forense de Senha em Tempo Real (Tarefa 2) */}
              {(password.length > 0 || confirmPassword.length > 0) && (
                <PasswordRequirements
                  password={password}
                  confirmPassword={confirmPassword}
                  showMatchStatus={true}
                />
              )}

              {/* BOTÃO CRIAR ESCRITÓRIO (Slate Escuro - Anexo 3) */}
              <div className="pt-3 text-center space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto min-w-[220px] px-8 py-3 bg-dex-slate-dark hover:bg-dex-slate-darkHover text-white text-sm font-semibold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? 'Criando conta...' : (accountType === 'OFFICE' ? 'Criar escritório' : 'Criar minha conta')}
                </button>

                {/* LINK FAZER LOGIN */}
                <AuthSwitchLink
                  prompt="Já tem conta?"
                  actionLabel="Fazer login"
                  onAction={onNavigateToLogin}
                />
              </div>
            </form>
            )}
            </>
            )}
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
