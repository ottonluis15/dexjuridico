import React from 'react';
import { 
  Scale, 
  Users, 
  DollarSign, 
  Clock 
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const KPICards: React.FC<{ onNavigate: (tab: any) => void }> = ({ onNavigate }) => {
  const { stats, userClients, userCases, userFinancial } = useData();

  // Limites do mês corrente no fuso horário oficial de Brasília (America/Sao_Paulo)
  const currentMonthBrasilia = (() => {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit'
      });
      return formatter.format(new Date()).substring(0, 7);
    } catch {
      return new Date().toISOString().substring(0, 7);
    }
  })();

  const isRevenueType = (t: string) => 
    t === 'HONORARIOS_INICIAIS' || t === 'HONORARIOS_EXITO' || t === 'MENSALIDADE';

  // Receita mensal real: soma estrita em centavos inteiros (evita imprecisão de float)
  // Critério: lançamentos de receita ('HONORARIOS_INICIAIS', 'HONORARIOS_EXITO', 'MENSALIDADE')
  // com status liquidado 'PAGO' e competência/recebimento no mês corrente de Brasília.
  const monthlyRevenueCents = userFinancial.reduce((acc, curr) => {
    if (isRevenueType(curr.type) && curr.status === 'PAGO') {
      const refDate = curr.paymentDate || curr.dueDate || '';
      if (refDate.substring(0, 7) === currentMonthBrasilia) {
        return acc + Math.round((curr.amount || 0) * 100);
      }
    }
    return acc;
  }, 0);

  const formatCurrencyExact = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL', 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const activeCasesCount = userCases.filter(c => c.status !== 'ARQUIVADO').length;
  const clientsCount = userClients.length;
  const upcomingDeadlinesCount = stats.upcomingDeadlinesCount;

  // 4 Cards FIEIS AO ANEXO 4 (Conta nova começa estritamente zerada)
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
      value: formatCurrencyExact(monthlyRevenueCents),
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
