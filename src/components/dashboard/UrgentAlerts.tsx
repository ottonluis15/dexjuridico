import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { PriorityBadge } from '../common/Badge';

export const UrgentAlerts: React.FC<{ onNavigateToDeadlines: () => void }> = ({ onNavigateToDeadlines }) => {
  const { userDeadlines, toggleDeadlineStatus, cases } = useData();

  const today = new Date().toISOString().substring(0, 10);
  
  // Prazos vencidos ou que vencem hoje/amanhã
  const urgentList = userDeadlines.filter(d => {
    if (d.status === 'COMPLETED') return false;
    const isOverdue = d.status === 'OVERDUE' || d.dueDate < today;
    const isToday = d.dueDate === today;
    const isTomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().substring(0, 10) === d.dueDate;
    return isOverdue || isToday || isTomorrow || d.priority === 'CRITICAL';
  });

  if (urgentList.length === 0) return null;

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-slate-900/80 border border-rose-900/60 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Atenção: Prazos Fatais e Iminentes ({urgentList.length})
            </h3>
            <p className="text-xs text-rose-200/80 font-medium">
              Atos processuais com vencimento hoje, em atraso ou de prioridade crítica
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToDeadlines}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900/80 px-3 py-1.5 rounded-xl border border-rose-800/60 transition-colors self-start sm:self-auto"
        >
          Ver todos os prazos
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {urgentList.slice(0, 4).map(deadline => {
          const linkedCase = cases.find(c => c.id === deadline.caseId);
          const isOverdue = deadline.status === 'OVERDUE' || deadline.dueDate < today;
          const isToday = deadline.dueDate === today;

          return (
            <div
              key={deadline.id}
              className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 transition-all ${
                isOverdue
                  ? 'bg-rose-950/60 border-rose-800/80 text-rose-100'
                  : isToday
                  ? 'bg-amber-950/40 border-amber-800/70 text-amber-100'
                  : 'bg-slate-800/70 border-slate-700/70 text-slate-200'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isOverdue ? 'bg-rose-600 text-white' : isToday ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-200'
                  }`}>
                    {isOverdue ? '⚠️ Vencido' : isToday ? '⏳ Vence Hoje' : '📅 Amanhã'}
                  </span>
                  <PriorityBadge priority={deadline.priority} />
                </div>

                <h4 className="text-xs font-bold text-white truncate mt-1">
                  {deadline.type}
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">
                  {deadline.description}
                </p>

                {linkedCase && (
                  <p className="text-[10px] text-slate-400 mt-2 truncate font-mono">
                    Proc: {linkedCase.caseNumber}
                  </p>
                )}
              </div>

              <button
                onClick={() => toggleDeadlineStatus(deadline.id)}
                title="Dar baixa e marcar como concluído"
                className="p-2 text-emerald-400 hover:text-white bg-slate-900/60 hover:bg-emerald-600 rounded-xl border border-emerald-500/30 transition-colors shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
