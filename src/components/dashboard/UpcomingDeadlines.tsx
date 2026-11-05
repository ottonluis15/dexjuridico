import React from 'react';
import { Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { DeadlineStatusBadge, PriorityBadge } from '../common/Badge';

export const UpcomingDeadlines: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const { userDeadlines, toggleDeadlineStatus } = useData();

  const pendingDeadlines = userDeadlines
    .filter(d => d.status !== 'COMPLETED')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  return (
    <div className="p-6 rounded-[24px] bg-dex-navy-900 border border-white/5 flex flex-col h-full shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-dex-coral/20 text-dex-coral flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-white">Próximos Prazos</h3>
            <p className="text-xs text-[#8F8A87] font-serif">Pauta processual imediata</p>
          </div>
        </div>

        <button
          onClick={onNavigate}
          className="text-xs font-serif font-bold text-dex-coral hover:underline flex items-center gap-1 transition-colors"
        >
          Ver todos
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 mt-4 space-y-3">
        {pendingDeadlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Clock className="w-8 h-8 text-[#8F8A87] mb-2" />
            <p className="text-xs text-[#8F8A87] font-serif">Nenhum prazo pendente no momento.</p>
          </div>
        ) : (
          pendingDeadlines.map(d => (
            <div
              key={d.id}
              className="p-3.5 rounded-2xl bg-dex-navy-800 hover:bg-dex-navy-700/80 border border-white/5 transition-all flex items-start justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <DeadlineStatusBadge status={d.status} dueDate={d.dueDate} />
                  <PriorityBadge priority={d.priority} />
                </div>

                <h4 className="font-serif text-xs font-bold text-white truncate">
                  {d.type}: {d.description}
                </h4>

                <p className="text-[11px] text-[#8F8A87] font-serif mt-1">
                  Vencimento: <strong className="text-slate-200">{d.dueDate} {d.dueTime && `às ${d.dueTime}`}</strong>
                </p>
              </div>

              <button
                onClick={() => toggleDeadlineStatus(d.id)}
                title="Concluir prazo"
                className="p-1.5 text-[#8F8A87] hover:text-dex-chart-green hover:bg-dex-navy-950 rounded-lg transition-colors shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
