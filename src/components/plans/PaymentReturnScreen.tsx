import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, ArrowRight, ShieldCheck, CreditCard, RefreshCw } from 'lucide-react';
import { DexLogo } from '../common/DexLogo';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { PlanId, SubscriptionPeriod, getPlanById } from '../../config/plans';

interface PaymentReturnScreenProps {
  status?: 'SUCCESS' | 'PENDING' | 'CANCELED';
  onNavigateToApp: () => void;
  onNavigateToPlans: () => void;
  onNavigateToLanding: () => void;
}

export const PaymentReturnScreen: React.FC<PaymentReturnScreenProps> = ({
  status: initialStatus,
  onNavigateToApp,
  onNavigateToPlans,
  onNavigateToLanding
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useData();

  const [currentStatus, setCurrentStatus] = useState<'SUCCESS' | 'PENDING' | 'CANCELED'>(() => {
    if (initialStatus) return initialStatus;
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('canceled') === 'true') return 'CANCELED';
    if (searchParams.get('pending') === 'true') return 'PENDING';
    return 'SUCCESS';
  });

  const searchParams = new URLSearchParams(window.location.search);
  const planParam = (searchParams.get('plan') || currentUser?.subscriptionPlan || 'PROFESSIONAL').toUpperCase() as PlanId;
  const periodParam = (searchParams.get('period') || currentUser?.subscriptionPeriod || 'MONTHLY').toUpperCase() as SubscriptionPeriod;
  const sessionId = searchParams.get('session_id') || searchParams.get('sessionId') || '';

  const planDef = getPlanById(planParam);

  return (
    <div className="min-h-screen bg-dex-cream dark:bg-[#0A1922] flex items-center justify-center p-4 sm:p-6 transition-colors font-serif">
      <div className="w-full max-w-xl bg-dex-peach dark:bg-[#162B37] rounded-[28px] p-6 sm:p-10 border border-[#D5B093] dark:border-[#214154] shadow-2xl relative">
        {/* Topo com Logo e Selo Forense */}
        <div className="flex items-center justify-between pb-6 border-b border-dex-navy-950/10 dark:border-white/10">
          <DexLogo size="md" />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-dex-input/80 dark:bg-[#0F2733] border border-black/5 dark:border-white/10 text-[11px] font-sans font-semibold text-dex-navy-950 dark:text-[#A6C5CD]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Transação Segura Stripe</span>
          </div>
        </div>

        {/* Conteúdo Central Conforme o Status */}
        {currentStatus === 'SUCCESS' && (
          <div className="pt-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 mx-auto flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-dex-navy-950 dark:text-[#F9ECE2]">
                Pagamento Confirmado!
              </h2>
              <p className="text-sm text-dex-support dark:text-[#A6C5CD] max-w-md mx-auto">
                Sua assinatura do plano <strong>{planDef.name}</strong> está ativa. Todos os limites e funcionalidades avançadas foram liberados.
              </p>
            </div>

            {/* Cartão de Resumo do Pedido */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-[#0F2733]/70 border border-[#D5B093]/60 dark:border-[#214154] text-left space-y-3">
              <div className="flex items-center justify-between text-xs text-dex-navy-950 dark:text-[#F9ECE2] pb-2 border-b border-black/5 dark:border-white/5">
                <span className="text-dex-support dark:text-[#A6C5CD]">Plano Contratado:</span>
                <span className="font-bold">{planDef.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-dex-navy-950 dark:text-[#F9ECE2] pb-2 border-b border-black/5 dark:border-white/5">
                <span className="text-dex-support dark:text-[#A6C5CD]">Ciclo de Faturamento:</span>
                <span className="font-bold">{periodParam === 'YEARLY' ? 'Anual (Desconto aplicado)' : 'Mensal'}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-dex-navy-950 dark:text-[#F9ECE2]">
                <span className="text-dex-support dark:text-[#A6C5CD]">Status da Assinatura:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ativa
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onNavigateToApp}
                className="w-full sm:w-auto px-8 py-3.5 bg-dex-slate-dark hover:bg-dex-slate-darkHover text-white text-sm font-semibold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Acessar Meu Painel</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {currentStatus === 'PENDING' && (
          <div className="pt-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 mx-auto flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-dex-navy-950 dark:text-[#F9ECE2]">
                Pagamento em Processamento
              </h2>
              <p className="text-sm text-dex-support dark:text-[#A6C5CD] max-w-md mx-auto">
                Aguardando a compensação bancária do Pix ou Boleto pelo gateway Stripe.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 text-left">
              Assim que o banco confirmar a liquidação (geralmente instantâneo no Pix, ou até 2 dias úteis no boleto), seu plano será ativado automaticamente e um e-mail de confirmação será enviado.
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onNavigateToApp}
                className="w-full sm:w-auto px-8 py-3.5 bg-dex-slate-dark hover:bg-dex-slate-darkHover text-white text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Continuar para o Dex
              </button>
            </div>
          </div>
        )}

        {currentStatus === 'CANCELED' && (
          <div className="pt-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-700 mx-auto flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-dex-navy-950 dark:text-[#F9ECE2]">
                Pagamento Não Concluído
              </h2>
              <p className="text-sm text-dex-support dark:text-[#A6C5CD] max-w-md mx-auto">
                A operação de checkout foi interrompida ou cancelada. Nenhum valor foi debitado.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onNavigateToPlans}
                className="w-full sm:w-auto px-8 py-3 bg-dex-slate-dark hover:bg-dex-slate-darkHover text-white text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Tentar Novamente
              </button>
              <button
                type="button"
                onClick={onNavigateToApp}
                className="w-full sm:w-auto px-6 py-3 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-dex-navy-950 dark:text-[#F9ECE2] text-sm font-medium rounded-xl transition-all cursor-pointer"
              >
                Continuar no Teste Gratuito
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

