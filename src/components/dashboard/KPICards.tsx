import React from 'react';
import { 
  Clock, 
  AlertCircle, 
  FolderKanban, 
  DollarSign, 
  FileText, 
  TrendingUp,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export const KPICards: React.FC<{ onNavigate: (tab: any) => void }> = ({ onNavigate }) => {
  const { stats, userFinancial } = useData();
  const { isAdmin } = useAuth();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const cards = [
    {
      id: 'urgent',
      title: 'Prazos Vencidos',
      value: stats.overdueDeadlinesCount,
      subtitle: stats.overdueDeadlinesCount > 0 ? 'Requer atenção imediata!' : 'Nenhum prazo atrasado',
      icon: ShieldAlert,
      color: stats.overdueDeadlinesCount > 0 ? 'text-rose-400' : 'text-slate-400',
      bgColor: stats.overdueDeadlinesCount > 0 ? 'bg-rose-950/40 border-rose-900/60' : 'bg-slate-900/80 border-slate-800/80',
      actionTab: 'deadlines',
      highlight: stats.overdueDeadlinesCount > 0
    },
    {
      id: 'upcoming',
      title: 'Prazos Próximos',
      value: stats.upcomingDeadlinesCount,
      subtitle: `${stats.criticalDeadlines.length} em prioridade crítica`,
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-slate-900/80 border-slate-800/80',
      actionTab: 'deadlines'
    },
    {
      id: 'cases',
      title: 'Processos Ativos',
      value: stats.activeCasesCount,
      subtitle: 'Em tramitação regular',
      icon: FolderKanban,
      color: 'text-brand-400',
      bgColor: 'bg-slate-900/80 border-slate-800/80',
      actionTab: 'cases'
    },
    {
      id: 'financial',
      title: 'Honorários a Receber',
      value: formatCurrency(stats.pendingFinancialAmount),
      subtitle: `${userFinancial.filter(f => f.status === 'PENDENTE').length} faturas pendentes`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-slate-900/80 border-slate-800/80',
      actionTab: 'financial',
      isTextValue: true
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onNavigate(card.actionTab)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-xl ${card.bgColor}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl bg-slate-800/70 border border-slate-700/50 ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div className={`font-extrabold tracking-tight ${card.isTextValue ? 'text-xl text-white' : 'text-3xl text-white'}`}>
                {card.value}
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </div>

            <p className={`text-xs mt-2 font-medium ${card.highlight ? 'text-rose-300 font-semibold' : 'text-slate-400'}`}>
              {card.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
};
