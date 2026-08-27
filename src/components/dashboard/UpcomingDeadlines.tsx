import React from 'react';
import { Clock, CheckCircle2, Calendar, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { PriorityBadge, DeadlineStatusBadge } from '../common/Badge';

export const UpcomingDeadlines: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const { userDeadlines, toggleDeadlineStatus, cases, lawyers } = useData();

  const activeDeadlines = userDeadlines
    .filter(d => d.status !== 'COMPLETED')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Prazos & Audiências da Pauta</h3>
            <p className="text-xs text-slate-400">Próximos compromissos cronológicos</p>
          </div>
        </div>

        <button
          onClick={onNavigate}
          className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
        >
          Ver todos
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 mt-4 space-y-3">
        {activeDeadlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mb-2" />
            <p className="text-xs font-semibold text-slate-300">Pauta em dia!</p>
            <p className="text-[11px] text-slate-400">Nenhum prazo pendente para os próximos dias.</p>
          </div>
        ) : (
          activeDeadlines.map(deadline => {
            const linkedCase = cases.find(c => c.id === deadline.caseId);
            const lawyer = lawyers.find(l => l.id === deadline.lawyerId);

            return (
              <div
                key={deadline.id}
                className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 transition-colors flex items-start justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <DeadlineStatusBadge status={deadline.status} dueDate={deadline.dueDate} />
                    <PriorityBadge priority={deadline.priority} />
                  </div>

                  <h4 className="text-xs font-bold text-white truncate">
                    {deadline.type}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {deadline.description}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-mono">
                    <span>📅 {deadline.dueDate} {deadline.dueTime && `às ${deadline.dueTime}`}</span>
                    {lawyer && <span className="truncate">👤 {lawyer.name.split(' ')[0]}</span>}
                  </div>
                </div>

                <button
                  onClick={() => toggleDeadlineStatus(deadline.id)}
                  title="Concluir prazo"
                  className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 rounded-xl transition-colors shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
