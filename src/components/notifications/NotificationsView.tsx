import React, { useState } from 'react';
import { 
  Bell, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Trash2, 
  Filter, 
  Calendar,
  AlertTriangle,
  FolderKanban,
  DollarSign
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const NotificationsView: React.FC = () => {
  const { userDeadlines, toggleDeadlineStatus, showToast } = useData();
  const [filterType, setFilterType] = useState<'ALL' | 'URGENT' | 'COMPLETED'>('ALL');

  const pendingDeadlines = userDeadlines.filter(d => d.status !== 'COMPLETED');
  const completedDeadlines = userDeadlines.filter(d => d.status === 'COMPLETED');

  const filteredItems = filterType === 'ALL'
    ? userDeadlines
    : filterType === 'URGENT'
    ? userDeadlines.filter(d => d.priority === 'CRITICAL' || d.priority === 'HIGH')
    : completedDeadlines;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-400" />
            Central de Notificações & Alertas
          </h2>
          <p className="text-xs text-slate-400">
            Avisos de prazos fatais, audiências agendadas, movimentações processuais e comunicados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              showToast('Todas as notificações foram marcadas como lidas.', 'success');
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Marcar todas como lidas
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'ALL'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Todas ({userDeadlines.length})
        </button>
        <button
          onClick={() => setFilterType('URGENT')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'URGENT'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Urgentes ({userDeadlines.filter(d => d.priority === 'CRITICAL' || d.priority === 'HIGH').length})
        </button>
        <button
          onClick={() => setFilterType('COMPLETED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'COMPLETED'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Concluídas ({completedDeadlines.length})
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
            <Bell className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-300">Nenhuma notificação encontrada</p>
            <p className="text-xs text-slate-500 mt-1">Você está em dia com todas as pendências.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isOverdue = item.status === 'OVERDUE' || (item.status === 'PENDING' && item.dueDate < new Date().toISOString().substring(0, 10));
            const isCompleted = item.status === 'COMPLETED';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  isOverdue
                    ? 'bg-rose-950/20 border-rose-900/50'
                    : isCompleted
                    ? 'bg-slate-900/40 border-slate-800 opacity-60'
                    : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    isOverdue
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {isOverdue ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{item.type}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.priority === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : item.priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{item.description}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Vencimento: <strong className="text-slate-200">{item.dueDate} {item.dueTime && `às ${item.dueTime}`}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleDeadlineStatus(item.id)}
                    title={isCompleted ? "Reabrir prazo" : "Concluir / Dar baixa"}
                    className={`p-2 rounded-xl text-xs font-semibold transition-colors ${
                      isCompleted
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isCompleted ? 'Reabrir' : 'Dar Baixa'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
