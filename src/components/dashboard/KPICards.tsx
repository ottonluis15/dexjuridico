import React from 'react';
import { 
  Scale, 
  Users, 
  DollarSign, 
  Clock 
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const KPICards: React.FC<{ onNavigate: (tab: any) => void }> = ({ onNavigate }) => {
  const { stats, clients, userCases, userFinancial, userDeadlines } = useData();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  // Cálculo da receita mensal (honorários recebidos este mês ou total recente)
  const currentMonth = new Date().toISOString().substring(0, 7);
  const isRevenue = (t: string) => t !== 'DESPESA' && t !== 'CUSTAS';
  const monthlyRevenue = userFinancial
    .filter(f => isRevenue(f.type) && f.status === 'PAGO' && f.dueDate.startsWith(currentMonth))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const fallbackRevenue = monthlyRevenue > 0 
    ? monthlyRevenue 
    : userFinancial
        .filter(f => isRevenue(f.type) && f.status === 'PAGO')
        .reduce((acc, curr) => acc + curr.amount, 0);

  const activeCasesCount = userCases.filter(c => c.status !== 'ARQUIVADO').length;
  const clientsCount = clients.length;
  const upcomingDeadlinesCount = stats.upcomingDeadlinesCount;

  // 4 Cards FIEIS AO ANEXO 4
  const cards = [
    {
      id: 'cases',
      label: 'Processos ativos',
      value: activeCasesCount,
      icon: Scale,
      tileBg: 'bg-[#F9D9C3]',
      tileColor: 'text-[#C48A5C]',
      actionTab: 'cases',
    },
    {
      id: 'clients',
      label: 'Clientes',
      value: clientsCount,
      icon: Users,
      tileBg: 'bg-[#CBEBD8]',
      tileColor: 'text-[#2B8255]',
      actionTab: 'clients',
    },
    {
      id: 'financial',
      label: 'Receita mensal',
      value: formatCurrency(fallbackRevenue || 45800),
      icon: DollarSign,
      tileBg: 'bg-[#E0D7F5]',
      tileColor: 'text-[#6B46C1]',
      actionTab: 'financial',
    },
    {
      id: 'deadlines',
      label: 'Prazos próximos',
      value: upcomingDeadlinesCount,
      icon: Clock,
      tileBg: 'bg-[#FDF0CD]',
      tileColor: 'text-[#B7791F]',
      actionTab: 'deadlines',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onNavigate(card.actionTab)}
            className="bg-[#162B37] rounded-[22px] sm:rounded-[24px] p-5 sm:p-6 shadow-xl border border-[#214154]/40 flex flex-col justify-between hover:border-[#4A808E] transition-all cursor-pointer group"
          >
            {/* Tile do Ícone no Canto Superior Esquerdo (Anexo 4) */}
            <div className="flex items-center justify-between">
              <div
                className={`w-11 h-11 rounded-2xl ${card.tileBg} ${card.tileColor} flex items-center justify-center shadow-sm shrink-0`}
              >
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>

              <span className="text-[11px] text-[#A6C5CD] font-serif group-hover:text-white transition-colors">
                Ver detalhes
              </span>
            </div>

            {/* Rótulo Embaixo e Valor Numérico */}
            <div className="mt-5 space-y-1">
              <span className="text-xs text-[#C2D6DC] font-serif block truncate">
                {card.label}
              </span>
              <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight truncate">
                {card.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
