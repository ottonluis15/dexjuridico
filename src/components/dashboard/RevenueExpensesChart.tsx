import React from 'react';
import { useData } from '../../context/DataContext';

export const RevenueExpensesChart: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const { userFinancial } = useData();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const totalReceitas = userFinancial
    .filter(f => f.type !== 'DESPESA' && f.type !== 'CUSTAS' && f.status === 'PAGO')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalDespesas = userFinancial
    .filter(f => f.type === 'DESPESA' && f.status === 'PAGO')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Histórico dos últimos 4 meses
  const monthsData = [
    { month: 'Ago', receitas: 38000, despesas: 14000 },
    { month: 'Set', receitas: 45000, despesas: 16500 },
    { month: 'Out', receitas: 52000, despesas: 18200 },
    { 
      month: 'Nov', 
      receitas: totalReceitas > 0 ? totalReceitas : 64000, 
      despesas: totalDespesas > 0 ? totalDespesas : 21000 
    },
  ];

  const maxVal = Math.max(...monthsData.map(m => Math.max(m.receitas, m.despesas)), 70000);

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

      {/* Gráfico de Barras Comparativo */}
      <div className="mt-6 flex-1 flex items-end justify-between gap-4 sm:gap-8 px-2 sm:px-6 h-40 pb-2">
        {monthsData.map((m) => {
          const recHeight = Math.round((m.receitas / maxVal) * 100);
          const despHeight = Math.round((m.despesas / maxVal) * 100);

          return (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2 h-32">
                {/* Barra de Receitas (Verde Suave) */}
                <div
                  title={`Receitas ${m.month}: ${formatCurrency(m.receitas)}`}
                  className="w-4 sm:w-6 bg-[#48BB78] rounded-t-lg transition-all duration-500 hover:brightness-110"
                  style={{ height: `${Math.max(recHeight, 15)}%` }}
                />
                {/* Barra de Despesas (Vermelho Suave) */}
                <div
                  title={`Despesas ${m.month}: ${formatCurrency(m.despesas)}`}
                  className="w-4 sm:w-6 bg-[#F56565] rounded-t-lg transition-all duration-500 hover:brightness-110"
                  style={{ height: `${Math.max(despHeight, 10)}%` }}
                />
              </div>
              <span className="text-xs text-[#A6C5CD] font-serif font-medium">
                {m.month}
              </span>
            </div>
          );
        })}
      </div>

      {/* Resumo Rodapé */}
      <div className="mt-4 pt-3 border-t border-[#214154]/60 flex items-center justify-between text-xs font-serif">
        <span className="text-[#A6C5CD]">Saldo Operacional Estimado</span>
        <span className="font-display font-bold text-white text-sm">
          {formatCurrency(totalReceitas - totalDespesas || 43000)}
        </span>
      </div>
    </div>
  );
};
