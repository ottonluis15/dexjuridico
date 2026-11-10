import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  AlertCircle, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Briefcase, 
  FileText, 
  Bot, 
  CheckCircle2, 
  ArrowRight,
  Info,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DEX_PLANS, PlanId, SubscriptionPeriod, getPlanById, PlanDefinition } from '../../config/plans';

export const PlansView: React.FC = () => {
  const { currentUser, changeSubscription, cancelSubscription } = useAuth();
  const { limitsUsage, showToast } = useData();

  const [period, setPeriod] = useState<SubscriptionPeriod>(
    (currentUser?.subscriptionPeriod as SubscriptionPeriod) || 'MONTHLY'
  );

  // Estados do Modal de Checkout Simulado
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanDefinition | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cardHolder, setCardHolder] = useState(currentUser?.name || '');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('•••');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downgradeWarning, setDowngradeWarning] = useState<string | null>(null);

  // Estados do Modal de Cancelamento
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCanceling, setIsCanceling] = useState(false);

  const currentPlanDef = getPlanById(currentUser?.subscriptionPlan);
  const currentStatus = currentUser?.subscriptionStatus || 'ACTIVE';

  // Permissões
  const isAssociateLawyer = currentUser?.role === 'LAWYER' && !currentUser?.isIndependent;
  const isDemo = !!currentUser?.isDemo;
  const canModifySubscription = !isAssociateLawyer && !isDemo;

  const handleOpenBillingPortal = async () => {
    try {
      const res = await fetch('/api/payment/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: currentUser?.stripeCustomerId,
          returnUrl: window.location.href
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }
      showToast('Portal de faturamento disponível para gerenciar cartões e faturas.', 'info');
    } catch {
      showToast('Erro ao redirecionar para o portal de faturamento.', 'error');
    }
  };

  // Iniciar fluxo de checkout
  const handleOpenCheckout = (plan: PlanDefinition) => {
    if (!canModifySubscription) {
      if (isAssociateLawyer) {
        showToast('Apenas o sócio titular ou administrador pode alterar o plano do escritório.', 'warning');
      } else if (isDemo) {
        showToast('A conta de demonstração não permite alteração de planos.', 'warning');
      }
      return;
    }

    // Verificar se é downgrade com excesso de uso
    const exceeds: string[] = [];
    if (limitsUsage.clients.current > plan.limits.maxClients) {
      exceeds.push(`Clientes: você tem ${limitsUsage.clients.current} e o plano permite até ${plan.limits.maxClients}`);
    }
    if (limitsUsage.cases.current > plan.limits.maxActiveCases) {
      exceeds.push(`Processos ativos: você tem ${limitsUsage.cases.current} e o plano permite até ${plan.limits.maxActiveCases}`);
    }
    if (limitsUsage.lawyers.current > plan.limits.maxLawyers) {
      exceeds.push(`Advogados: sua banca possui ${limitsUsage.lawyers.current} e o plano permite até ${plan.limits.maxLawyers}`);
    }
    if (limitsUsage.templates.current > plan.limits.maxTemplates) {
      exceeds.push(`Modelos: você tem ${limitsUsage.templates.current} e o plano permite até ${plan.limits.maxTemplates}`);
    }

    if (exceeds.length > 0) {
      setDowngradeWarning(
        `Atenção: Seu uso atual excede os limites do plano ${plan.name} (${exceeds.join('; ')}). Seus dados existentes serão integralmente preservados, porém novas criações ficarão bloqueadas até adequação.`
      );
    } else {
      setDowngradeWarning(null);
    }

    setSelectedPlanForCheckout(plan);
    setIsCheckoutOpen(true);
  };

  // Confirmar pagamento simulado
  const handleConfirmSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForCheckout) return;

    setIsProcessing(true);
    try {
      const res = await changeSubscription(
        selectedPlanForCheckout.id,
        period,
        {
          holderName: cardHolder,
          cardNumberMasked: cardNumber,
          expiry: cardExpiry
        }
      );

      if (res.success) {
        showToast(res.message, 'success');
        setIsCheckoutOpen(false);
      } else {
        showToast(res.error || res.message, 'error');
      }
    } catch {
      showToast('Erro ao processar assinatura simulada.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirmar cancelamento
  const handleConfirmCancellation = async () => {
    setIsCanceling(true);
    try {
      const res = await cancelSubscription(cancelReason);
      if (res.success) {
        showToast(res.message, 'info');
        setIsCancelModalOpen(false);
      } else {
        showToast(res.error || res.message, 'error');
      }
    } catch {
      showToast('Erro ao cancelar assinatura.', 'error');
    } finally {
      setIsCanceling(false);
    }
  };

  // Função para cor de progresso
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-[#F4665C]'; // Coral / Limite
    if (percentage >= 80) return 'bg-amber-500'; // Aviso
    return 'bg-[#4A808E]'; // Teal Dex
  };

  return (
    <div className="space-y-10 pb-16 animate-fadeIn text-dex-navy-950 dark:text-[#F9ECE2]">
      {/* CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#D8C3B5]/60 dark:border-[#214154] pb-6">
        <div>
          <div className="flex items-center gap-2 text-dex-teal-700 dark:text-[#67A4B2] mb-1">
            <CreditCard className="w-5 h-5 text-[#4A808E]" />
            <span className="text-xs font-semibold tracking-wider uppercase">Planos & Assinatura</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-dex-navy-950 dark:text-white">
            Gerenciamento de Plano e Capacidade
          </h1>
          <p className="text-sm text-dex-navy-700/80 dark:text-[#A7BAC5] mt-1">
            Transparência total nos limites da sua banca e autonomia para evoluir conforme seu crescimento.
          </p>
        </div>

        {/* ALERTA DE PERMISSÃO / AMBIENTE */}
        {isAssociateLawyer && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-dex-peach-100/70 dark:bg-[#162B37] border border-[#D8C3B5] dark:border-[#214154] text-xs text-dex-navy-800 dark:text-[#C5D2D9]">
            <Info className="w-4 h-4 text-[#4A808E] flex-shrink-0" />
            <span>Acesso em modo visualização. Apenas o sócio administrador pode alterar o plano.</span>
          </div>
        )}
        {isDemo && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Conta de demonstração. Alterações de plano estão desabilitadas.</span>
          </div>
        )}
      </div>

      {/* PAINEL DE STATUS ATUAL E CONSUMO DE RECURSOS */}
      <div className="bg-[#FAF3ED] dark:bg-[#162B37] border border-[#D8C3B5] dark:border-[#214154] rounded-2xl p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#D8C3B5]/60 dark:border-[#214154]">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-dex-teal-800 dark:text-[#82B3C0] bg-[#4A808E]/15 dark:bg-[#4A808E]/30 px-2.5 py-1 rounded-full">
                {currentPlanDef.badge || 'Plano em Vigor'}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                currentStatus === 'ACTIVE' 
                  ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : currentStatus === 'TRIAL'
                  ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  : 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800'
              }`}>
                {currentStatus === 'ACTIVE' ? 'Assinatura Ativa' : currentStatus === 'TRIAL' ? 'Período de Teste' : 'Assinatura Cancelada'}
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-serif font-bold text-dex-navy-950 dark:text-white mt-2">
              {currentPlanDef.name}
            </h2>
            <p className="text-sm text-dex-navy-700/80 dark:text-[#A7BAC5] mt-1 max-w-2xl">
              {currentPlanDef.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2 bg-[#F0CBAE]/30 dark:bg-[#0F2733]/70 p-4 rounded-xl border border-[#D8C3B5]/60 dark:border-[#214154]">
            <div className="text-xs text-dex-navy-700 dark:text-[#82B3C0] uppercase font-medium">Ciclo de Faturamento</div>
            <div className="text-xl font-bold font-serif text-dex-navy-950 dark:text-white">
              {currentUser?.subscriptionPeriod === 'YEARLY' ? 'Faturamento Anual' : 'Faturamento Mensal'}
            </div>
            {currentStatus === 'ACTIVE' && canModifySubscription && (
              <div className="flex flex-col sm:flex-row gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={handleOpenBillingPortal}
                  className="text-xs text-dex-slate-dark dark:text-[#A6C5CD] hover:text-dex-navy-950 dark:hover:text-white underline cursor-pointer flex items-center gap-1 font-medium"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Forma de pagamento & Faturas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="text-xs text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 underline cursor-pointer"
                >
                  Cancelar assinatura
                </button>
              </div>
            )}
          </div>
        </div>

        {/* METROS DE CONSUMO EM TEMPO REAL */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-dex-navy-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#4A808E]" />
              Consumo de Recursos do Plano Atual
            </h3>
            <span className="text-xs text-dex-navy-600 dark:text-[#82B3C0]">Atualizado em tempo real</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Clientes */}
            <div className="bg-white/80 dark:bg-[#0F2733]/80 p-4 rounded-xl border border-[#D8C3B5]/70 dark:border-[#214154] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-dex-navy-700 dark:text-[#C5D2D9] mb-1">
                <span className="font-semibold flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#4A808E]" /> Clientes
                </span>
                <span className="font-bold">{limitsUsage.clients.current} / {limitsUsage.clients.max}</span>
              </div>
              <div className="w-full bg-[#E5D7CB] dark:bg-[#214154] rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(limitsUsage.clients.percentage)}`}
                  style={{ width: `${limitsUsage.clients.percentage}%` }}
                />
              </div>
              <div className="text-[11px] text-right text-dex-navy-600 dark:text-[#82B3C0] mt-1.5 font-medium">
                {limitsUsage.clients.percentage}% utilizado
              </div>
            </div>

            {/* Processos Ativos */}
            <div className="bg-white/80 dark:bg-[#0F2733]/80 p-4 rounded-xl border border-[#D8C3B5]/70 dark:border-[#214154] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-dex-navy-700 dark:text-[#C5D2D9] mb-1">
                <span className="font-semibold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#4A808E]" /> Processos Ativos
                </span>
                <span className="font-bold">{limitsUsage.cases.current} / {limitsUsage.cases.max}</span>
              </div>
              <div className="w-full bg-[#E5D7CB] dark:bg-[#214154] rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(limitsUsage.cases.percentage)}`}
                  style={{ width: `${limitsUsage.cases.percentage}%` }}
                />
              </div>
              <div className="text-[11px] text-right text-dex-navy-600 dark:text-[#82B3C0] mt-1.5 font-medium">
                {limitsUsage.cases.percentage}% utilizado
              </div>
            </div>

            {/* Advogados na Equipe */}
            <div className="bg-white/80 dark:bg-[#0F2733]/80 p-4 rounded-xl border border-[#D8C3B5]/70 dark:border-[#214154] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-dex-navy-700 dark:text-[#C5D2D9] mb-1">
                <span className="font-semibold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#4A808E]" /> Advogados
                </span>
                <span className="font-bold">{limitsUsage.lawyers.current} / {limitsUsage.lawyers.max}</span>
              </div>
              <div className="w-full bg-[#E5D7CB] dark:bg-[#214154] rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(limitsUsage.lawyers.percentage)}`}
                  style={{ width: `${limitsUsage.lawyers.percentage}%` }}
                />
              </div>
              <div className="text-[11px] text-right text-dex-navy-600 dark:text-[#82B3C0] mt-1.5 font-medium">
                {limitsUsage.lawyers.percentage}% utilizado
              </div>
            </div>

            {/* Modelos Jurídicos */}
            <div className="bg-white/80 dark:bg-[#0F2733]/80 p-4 rounded-xl border border-[#D8C3B5]/70 dark:border-[#214154] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-dex-navy-700 dark:text-[#C5D2D9] mb-1">
                <span className="font-semibold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#4A808E]" /> Modelos
                </span>
                <span className="font-bold">{limitsUsage.templates.current} / {limitsUsage.templates.max}</span>
              </div>
              <div className="w-full bg-[#E5D7CB] dark:bg-[#214154] rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(limitsUsage.templates.percentage)}`}
                  style={{ width: `${limitsUsage.templates.percentage}%` }}
                />
              </div>
              <div className="text-[11px] text-right text-dex-navy-600 dark:text-[#82B3C0] mt-1.5 font-medium">
                {limitsUsage.templates.percentage}% utilizado
              </div>
            </div>

            {/* IA no Mês */}
            <div className="bg-white/80 dark:bg-[#0F2733]/80 p-4 rounded-xl border border-[#D8C3B5]/70 dark:border-[#214154] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-dex-navy-700 dark:text-[#C5D2D9] mb-1">
                <span className="font-semibold flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-[#4A808E]" /> IA no Mês
                </span>
                <span className="font-bold">{limitsUsage.aiRequests.current} / {limitsUsage.aiRequests.max}</span>
              </div>
              <div className="w-full bg-[#E5D7CB] dark:bg-[#214154] rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(limitsUsage.aiRequests.percentage)}`}
                  style={{ width: `${limitsUsage.aiRequests.percentage}%` }}
                />
              </div>
              <div className="text-[11px] text-right text-dex-navy-600 dark:text-[#82B3C0] mt-1.5 font-medium">
                {limitsUsage.aiRequests.percentage}% utilizado
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SELETOR DE PERIODICIDADE (MENSAL / ANUAL) */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-dex-navy-950 dark:text-white">
            Escolha o Plano Ideal para Sua Advocacia
          </h2>
          <p className="text-sm text-dex-navy-700/80 dark:text-[#A7BAC5] mt-1">
            Flexibilidade para mudar a qualquer instante. Todos os planos contam com a inteligência artificial do Dex.
          </p>
        </div>

        <div className="inline-flex items-center p-1.5 bg-[#FAF3ED] dark:bg-[#162B37] rounded-xl border border-[#D8C3B5] dark:border-[#214154]">
          <button
            type="button"
            onClick={() => setPeriod('MONTHLY')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              period === 'MONTHLY'
                ? 'bg-[#0F2733] dark:bg-[#4A808E] text-[#F9ECE2] text-white shadow-sm'
                : 'text-dex-navy-800 dark:text-[#C5D2D9] hover:text-dex-navy-950 dark:hover:text-white'
            }`}
          >
            Faturamento Mensal
          </button>
          <button
            type="button"
            onClick={() => setPeriod('YEARLY')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              period === 'YEARLY'
                ? 'bg-[#0F2733] dark:bg-[#4A808E] text-[#F9ECE2] text-white shadow-sm'
                : 'text-dex-navy-800 dark:text-[#C5D2D9] hover:text-dex-navy-950 dark:hover:text-white'
            }`}
          >
            <span>Faturamento Anual</span>
            <span className="bg-[#4A808E] text-[#F9ECE2] text-[10px] font-bold px-2 py-0.5 rounded-full">
              Economize ~20%
            </span>
          </button>
        </div>
      </div>

      {/* GRID DE CARDS DE COMPARAÇÃO DE PLANOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(Object.keys(DEX_PLANS) as PlanId[]).map((planId) => {
          const plan = DEX_PLANS[planId];
          const isCurrent = currentPlanDef.id === plan.id;
          const displayPrice = period === 'YEARLY' ? plan.yearlyPricePerMonth : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 ${
                plan.isPopular
                  ? 'bg-[#FAF3ED] dark:bg-[#162B37] border-2 border-[#4A808E] shadow-lg ring-1 ring-[#4A808E]/30'
                  : isCurrent
                  ? 'bg-[#FAF3ED] dark:bg-[#162B37] border-2 border-[#0F2733] dark:border-[#4A808E] shadow-md'
                  : 'bg-[#FAF3ED]/80 dark:bg-[#162B37]/80 border border-[#D8C3B5] dark:border-[#214154] hover:border-[#4A808E]/70 shadow-xs'
              }`}
            >
              {/* Selo Popular / Atual */}
              {plan.isPopular && !isCurrent && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#4A808E] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Mais Recomendado
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0F2733] dark:bg-[#4A808E] text-[#F9ECE2] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Seu Plano Atual
                </div>
              )}

              <div>
                <div className="text-xs font-semibold text-[#4A808E] dark:text-[#82B3C0] uppercase tracking-wider">
                  {plan.targetAudience}
                </div>
                <h3 className="text-2xl font-serif font-bold text-dex-navy-950 dark:text-white mt-1">
                  {plan.name}
                </h3>
                <p className="text-xs text-dex-navy-700/80 dark:text-[#A7BAC5] mt-2 min-h-[36px]">
                  {plan.description}
                </p>

                {/* Preço */}
                <div className="mt-5 pb-5 border-b border-[#D8C3B5]/60 dark:border-[#214154]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-semibold text-dex-navy-600 dark:text-[#82B3C0]">R$</span>
                    <span className="text-4xl font-serif font-bold text-dex-navy-950 dark:text-white">
                      {displayPrice}
                    </span>
                    <span className="text-xs text-dex-navy-600 dark:text-[#82B3C0]">/mês</span>
                  </div>
                  <div className="text-[11px] text-dex-navy-600 dark:text-[#82B3C0] mt-1">
                    {period === 'YEARLY' && plan.monthlyPrice > 0
                      ? `Faturado anualmente (R$ ${plan.yearlyPricePerMonth * 12}/ano)`
                      : plan.monthlyPrice === 0
                      ? 'Avaliação inicial sem cobrança'
                      : 'Faturamento mensal recorrente'}
                  </div>
                </div>

                {/* Lista de Recursos */}
                <div className="mt-5 space-y-2.5">
                  <div className="text-xs font-bold text-dex-navy-900 dark:text-white uppercase tracking-wider">
                    Limites & Capacidades:
                  </div>
                  <ul className="space-y-2 text-xs text-dex-navy-800 dark:text-[#C5D2D9]">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#4A808E] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Botão de Ação */}
              <div className="mt-8 pt-4">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#E5D7CB] dark:bg-[#214154] text-dex-navy-700 dark:text-[#C5D2D9] cursor-not-allowed text-center"
                  >
                    Plano Ativo
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenCheckout(plan)}
                    disabled={!canModifySubscription}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      plan.isPopular
                        ? 'bg-[#0F2733] hover:bg-[#162B37] dark:bg-[#4A808E] dark:hover:bg-[#3d6a76] text-[#F9ECE2] text-white shadow-sm'
                        : 'bg-[#4A808E] hover:bg-[#3d6a76] text-white shadow-sm'
                    } ${!canModifySubscription ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span>{plan.monthlyPrice > currentPlanDef.monthlyPrice ? 'Fazer Upgrade' : 'Mudar para este Plano'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* NOTA DE SEGURANÇA E AMBIENTE DEMO */}
      <div className="p-4 rounded-xl bg-dex-peach-100/40 dark:bg-[#162B37] border border-[#D8C3B5] dark:border-[#214154] flex items-start gap-3 text-xs text-dex-navy-800 dark:text-[#C5D2D9]">
        <ShieldCheck className="w-5 h-5 text-[#4A808E] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Ambiente de Demonstração e Transparência Dex:</span> Nenhuma cobrança monetária real é efetuada no sistema. Você pode testar livremente a transição de planos e a aplicação imediata dos novos limites de advogados, clientes, processos e consultas de IA.
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE CHECKOUT SIMULADO */}
      {/* ========================================================================= */}
      {isCheckoutOpen && selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dex-navy-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FAF3ED] dark:bg-[#162B37] border border-[#D8C3B5] dark:border-[#214154] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slideUp text-dex-navy-950 dark:text-[#F9ECE2]">
            {/* Topo do Modal */}
            <div className="px-6 py-5 bg-[#F0CBAE]/30 dark:bg-[#0F2733]/60 border-b border-[#D8C3B5] dark:border-[#214154] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#4A808E]" />
                <h3 className="text-lg font-serif font-bold text-dex-navy-950 dark:text-white">
                  Assinatura Simulada — {selectedPlanForCheckout.name}
                </h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 text-dex-navy-700 dark:text-[#C5D2D9] hover:text-dex-navy-950 dark:hover:text-white rounded-lg hover:bg-white/20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Aviso Obrigatório de Demonstração (apenas para conta demo) */}
            {isDemo && (
              <div className="px-6 pt-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Ambiente de demonstração: nenhuma cobrança será realizada.</strong>
                    Não insira dados reais de cartão de crédito. Utilize os valores simulados preenchidos automaticamente.
                  </div>
                </div>
              </div>
            )}

            {/* Aviso de Downgrade se houver excesso */}
            {downgradeWarning && (
              <div className="px-6 pt-3">
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-xl flex items-start gap-2.5 text-xs text-red-900 dark:text-red-200">
                  <AlertCircle className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>{downgradeWarning}</div>
                </div>
              </div>
            )}

            {/* Formulário de Pagamento Simulado */}
            <form onSubmit={handleConfirmSubscription} className="p-6 space-y-4">
              {/* Resumo do Pedido */}
              <div className="p-4 bg-white/70 dark:bg-[#0F2733]/70 border border-[#D8C3B5] dark:border-[#214154] rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-dex-navy-700 dark:text-[#C5D2D9]">
                  <span>Plano Selecionado:</span>
                  <span className="font-bold text-dex-navy-950 dark:text-white">{selectedPlanForCheckout.name}</span>
                </div>
                <div className="flex justify-between text-dex-navy-700 dark:text-[#C5D2D9]">
                  <span>Ciclo de Cobrança:</span>
                  <span className="font-bold text-dex-navy-950 dark:text-white">
                    {period === 'YEARLY' ? 'Anual (20% desconto)' : 'Mensal'}
                  </span>
                </div>
                <div className="flex justify-between text-dex-navy-950 dark:text-white pt-2 border-t border-[#D8C3B5]/60 dark:border-[#214154] text-sm font-bold">
                  <span>Valor Total:</span>
                  <span className="text-dex-navy-950 dark:text-white font-serif text-base">
                    {period === 'YEARLY'
                      ? `R$ ${(selectedPlanForCheckout.yearlyPricePerMonth * 12).toLocaleString('pt-BR')},00 /ano`
                      : `R$ ${selectedPlanForCheckout.monthlyPrice.toLocaleString('pt-BR')},00 /mês`}
                  </span>
                </div>
              </div>

              {/* Campos do Cartão Fictício */}
              <div>
                <label className="block text-xs font-semibold text-dex-navy-900 dark:text-[#E2ECF0] mb-1">
                  Nome no Cartão (Fictício)
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-white/90 dark:bg-[#0F2733] border border-[#D8C3B5] dark:border-[#214154] text-sm text-dex-navy-950 dark:text-[#F9ECE2] focus:outline-none focus:ring-2 focus:ring-[#4A808E]"
                  placeholder="Nome Completo do Titular"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dex-navy-900 dark:text-[#E2ECF0] mb-1">
                  Número do Cartão Simulado
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-white/90 dark:bg-[#0F2733] border border-[#D8C3B5] dark:border-[#214154] text-sm font-mono text-dex-navy-950 dark:text-[#F9ECE2] focus:outline-none focus:ring-2 focus:ring-[#4A808E]"
                  placeholder="•••• •••• •••• 4242"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dex-navy-900 dark:text-[#E2ECF0] mb-1">
                    Validade (MM/AA)
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-white/90 dark:bg-[#0F2733] border border-[#D8C3B5] dark:border-[#214154] text-sm font-mono text-dex-navy-950 dark:text-[#F9ECE2] focus:outline-none focus:ring-2 focus:ring-[#4A808E]"
                    placeholder="12/28"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dex-navy-900 dark:text-[#E2ECF0] mb-1">
                    CVV Simulado
                  </label>
                  <input
                    type="text"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-white/90 dark:bg-[#0F2733] border border-[#D8C3B5] dark:border-[#214154] text-sm font-mono text-dex-navy-950 dark:text-[#F9ECE2] focus:outline-none focus:ring-2 focus:ring-[#4A808E]"
                    placeholder="•••"
                  />
                </div>
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#D8C3B5]/60 dark:border-[#214154]">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-dex-navy-700 dark:text-[#C5D2D9] hover:text-dex-navy-950 dark:hover:text-white cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0F2733] hover:bg-[#162B37] dark:bg-[#4A808E] dark:hover:bg-[#3d6a76] text-[#F9ECE2] text-white shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#F9ECE2] border-t-transparent rounded-full animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Confirmar Assinatura Simulada</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO DE CANCELAMENTO */}
      {/* ========================================================================= */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dex-navy-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FAF3ED] dark:bg-[#162B37] border border-[#D8C3B5] dark:border-[#214154] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-slideUp text-dex-navy-950 dark:text-[#F9ECE2]">
            <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-serif font-bold text-dex-navy-950 dark:text-white">
                Cancelar Assinatura?
              </h3>
            </div>

            <p className="text-xs text-dex-navy-800 dark:text-[#C5D2D9] leading-relaxed">
              Tem certeza de que deseja cancelar sua assinatura? Todos os seus dados, clientes, processos e documentos serão <strong>preservados integralmente</strong>. Você continuará com acesso aos recursos até o fim do período já faturado.
            </p>

            <div>
              <label className="block text-xs font-semibold text-dex-navy-900 dark:text-[#E2ECF0] mb-1">
                Motivo do cancelamento (opcional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Conte-nos como podemos melhorar o Dex..."
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0F2733] border border-[#D8C3B5] dark:border-[#214154] text-xs text-dex-navy-950 dark:text-[#F9ECE2] focus:outline-none focus:ring-2 focus:ring-[#4A808E]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCanceling}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-dex-navy-700 dark:text-[#C5D2D9] hover:text-dex-navy-950 dark:hover:text-white cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmCancellation}
                disabled={isCanceling}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-700 hover:bg-red-800 text-white cursor-pointer disabled:opacity-50"
              >
                {isCanceling ? 'Cancelando...' : 'Confirmar Cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

