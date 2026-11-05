import React, { useState } from 'react';
import { 
  Bell, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FolderKanban,
  DollarSign
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { InternalPageLayout } from '../layout/InternalPageLayout';
import { PriorityBadge, DeadlineStatusBadge } from '../common/Badge';

export const NotificationsView: React.FC = () => {
  const { userDeadlines, toggleDeadlineStatus, showToast } = useData();
  const [filterType, setFilterType] = useState<'ALL' | 'URGENT' | 'COMPLETED'>('ALL');

  const pendingDeadlines = userDeadlines.filter(d => d.status !== 'COMPLETED');
  const completedDeadlines = userDeadlines.filter(d => d.status === 'COMPLETED');
  const urgentDeadlines = userDeadlines.filter(d => d.priority === 'CRITICAL' || d.priority === 'HIGH');
  const today = new Date().toISOString().substring(0, 10);
  const todayDeadlines = userDeadlines.filter(d => d.dueDate === today);

  const filteredItems = filterType === 'ALL'
    ? userDeadlines
    : filterType === 'URGENT'
    ? urgentDeadlines
    : completedDeadlines;

  const kpis = [
    {
      title: 'Total de Alertas',
      value: userDeadlines.length,
      icon: Bell,
      iconTileColor: 'peach' as const
    },
    {
      title: 'Prazos Críticos',
      value: urgentDeadlines.length,
      icon: AlertTriangle,
      iconTileColor: 'coral' as const
    },
    {
      title: 'Prazos de Hoje',
      value: todayDeadlines.length,
      icon: Clock,
      iconTileColor: 'mint' as const
    },
    {
      title: 'Concluídas / Baixadas',
      value: completedDeadlines.length,
      icon: CheckCircle2,
      iconTileColor: 'purple' as const
    }
  ];

  return (
    <InternalPageLayout
      title="Notificações & Alertas"
      subtitle="Avisos de prazos fatais, audiências agendadas, movimentações e comunicados"
      actionLabel="Marcar todas como lidas"
      onAction={() => showToast('Todas as notificações foram marcadas como lidas.', 'success')}
      kpis={kpis}
      filters={[
        { label: `Todas (${userDeadlines.length})`, active: filterType === 'ALL', onClick: () => setFilterType('ALL') },
        { label: `Urgentes (${urgentDeadlines.length})`, active: filterType === 'URGENT', onClick: () => setFilterType('URGENT') },
        { label: `Concluídas (${completedDeadlines.length})`, active: filterType === 'COMPLETED', onClick: () => setFilterType('COMPLETED') }
      ]}
    >
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-[24px] bg-dex-navy-800 border border-white/5 space-y-2">
            <Bell className="w-8 h-8 text-[#8F8A87] mx-auto mb-2" />
            <h4 className="font-serif text-base font-bold text-white">Nenhuma notificação encontrada</h4>
            <p className="text-xs text-[#8F8A87] font-serif">Você está em dia com todas as pendências.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isCompleted = item.status === 'COMPLETED';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-[20px] bg-dex-navy-800 border transition-all flex items-start justify-between gap-4 ${
                  isCompleted 
                    ? 'border-white/5 opacity-60' 
                    : item.priority === 'CRITICAL'
                    ? 'border-dex-coral/50 shadow-md'
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className={`p-2.5 rounded-2xl shrink-0 ${
                    item.priority === 'CRITICAL' || item.priority === 'HIGH'
                      ? 'bg-dex-coral/20 text-dex-coral'
                      : 'bg-dex-teal-500/20 text-dex-peach'
                  }`}>
                    <Clock className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <DeadlineStatusBadge status={item.status} dueDate={item.dueDate} />
                      <PriorityBadge priority={item.priority} />
                      <span className="text-[11px] font-mono text-dex-peach bg-dex-navy-950 px-2 py-0.5 rounded">
                        Processo #{item.caseId}
                      </span>
                    </div>

                    <h4 className="font-serif text-sm font-bold text-white truncate">
                      {item.type}: {item.description}
                    </h4>

                    <p className="text-xs text-[#8F8A87] font-serif mt-1">
                      Data limite fatal: <strong className="text-slate-200">{item.dueDate} {item.dueTime && `às ${item.dueTime}`}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleDeadlineStatus(item.id)}
                  title={isCompleted ? 'Reabrir prazo' : 'Marcar como concluído'}
                  className={`p-2 rounded-xl transition-colors shrink-0 ${
                    isCompleted
                      ? 'text-dex-chart-green bg-dex-navy-950 hover:bg-dex-navy-900'
                      : 'text-[#8F8A87] hover:text-dex-chart-green hover:bg-dex-navy-950'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </InternalPageLayout>
  );
};
