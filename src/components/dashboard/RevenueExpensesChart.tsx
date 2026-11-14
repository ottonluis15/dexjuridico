import React from 'react';
import { TrendingUp, Feather } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const RevenueExpensesChart: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const { userFinancial } = useData();

  const isRevenueType = (t: string) => 
    t === 'HONORARIOS_INICIAIS' || t === 'HONORARIOS_EXITO' || t === 'MENSALIDADE';

  // Obter os últimos 4 meses a partir do fuso horário de Brasília
  const now = new Date();
  const monthAbbr = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  const last4Months: { key: string; label: string }[] = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    const monthPad = String(monthIndex + 1).padStart(2, '0');
    last4Months.push({
      key: `${year}-${monthPad}`,
      label: monthAbbr[monthIndex]
    });
  }

  // Agregar valores reais por mês (em centavos inteiros para precisão)
  const monthsData = last4Months.map(m => {
    let recCents = 0;
    let despCents = 0;

    userFinancial.forEach(f => {
      if (f.status === 'PAGO') {
        const refDate = f.paymentDate || f.dueDate || '';
        if (refDate.startsWith(m.key)) {
          const cents = Math.round((f.amount || 0) * 100);
          if (isRevenueType(f.type)) {
            recCents += cents;
          } else {
            despCents += cents;
          }
        }
      }
    });

    return {
      month: m.label,
      receitasCents: recCents,
      despesasCents: despCents,
      receitas: recCents / 100,
      despesas: despCents / 100
    };
  });

  const totalReceitasCents = monthsData.reduce((acc, m) => acc + m.receitasCents, 0);
  const totalDespesasCents = monthsData.reduce((acc, m) => acc + m.despesasCents, 0);
  const saldoCents = totalReceitasCents - totalDespesasCents;

  const hasAnyMovement = monthsData.some(m => m.receitasCents > 0 || m.despesasCents > 0);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL', 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const maxVal = Math.max(
    ...monthsData.map(m => Math.max(m.receitas, m.despesas)),
    1000 // mínimo para cálculo relativo de altura
  );

  return (
    <div className="bg-[#162B37] rounded-[24px] p-6 shadow-xl border border-[#214154]/40 flex flex-col justify-between h-full">
      {/* Cabeçalho com Legenda Verde e Vermelha (Anexo 4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#214154]/60 gap-3">
        <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-tight">
          Receitas X Despesas
        </h3>

        {/* Legenda fiel ao Anexo 4: Verde (Receitas) e Vermelho Suave (Despesas) */}
        <div className="flex items-center gap-4 text-xs font-serif">
          <div className="flex items-center gap-2">
            <span className="w-5 h-2.5 rounded-full bg-[#48BB78]" />
            <span className="text-[#EAE0DA]">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-2.5 rounded-full bg-[#F56565]" />
            <span className="text-[#EAE0DA]">Despesas</span>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras Comparativo ou Estado Vazio */}
      {!hasAnyMovement ? (
        <div className="mt-6 flex-1 flex flex-col items-center justify-center py-8 text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-[#A6C5CD]/60 mb-1">
            <Feather className="w-5 h-5 stroke-[1.5]" />
          </div>
          <p className="text-xs text-white/90 font-serif font-medium">
            Nenhuma movimentação financeira no período
          </p>
          <p className="text-[11px] text-[#A6C5CD]/70 font-serif max-w-xs leading-relaxed">
            Cadastre honorários ou despesas no módulo Financeiro para visualizar o comparativo mensal.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex-1 flex items-end justify-between gap-4 sm:gap-8 px-2 sm:px-6 h-40 pb-2">
          {monthsData.map((m) => {
            const recHeight = m.receitas > 0 ? Math.round((m.receitas / maxVal) * 100) : 0;
            const despHeight = m.despesas > 0 ? Math.round((m.despesas / maxVal) * 100) : 0;

            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2 h-32">
                  {/* Barra de Receitas (Verde Suave) */}
                  <div
                    title={`Receitas ${m.month}: ${formatCurrency(m.receitas)}`}
                    className="w-4 sm:w-6 bg-[#48BB78] rounded-t-lg transition-all duration-500 hover:brightness-110"
                    style={{ height: `${Math.max(recHeight, m.receitas > 0 ? 8 : 0)}%` }}
                  />
                  {/* Barra de Despesas (Vermelho Suave) */}
                  <div
                    title={`Despesas ${m.month}: ${formatCurrency(m.despesas)}`}
                    className="w-4 sm:w-6 bg-[#F56565] rounded-t-lg transition-all duration-500 hover:brightness-110"
                    style={{ height: `${Math.max(despHeight, m.despesas > 0 ? 8 : 0)}%` }}
                  />
                </div>
                <span className="text-xs text-[#A6C5CD] font-serif font-medium">
                  {m.month}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Resumo Rodapé: Saldo Operacional em Centavos Exatos */}
      <div className="mt-4 pt-3 border-t border-[#214154]/60 flex items-center justify-between text-xs font-serif">
        <span className="text-[#A6C5CD]">Saldo Operacional Estimado</span>
        <span className={`font-display font-bold text-sm ${saldoCents >= 0 ? 'text-white' : 'text-dex-coral'}`}>
          {formatCurrency(saldoCents / 100)}
        </span>
      </div>
    </div>
  );
};
