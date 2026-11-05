import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const UpcomingDeadlinesCard: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const { userDeadlines, toggleDeadlineStatus, cases } = useData();

  const activeDeadlines = userDeadlines
    .filter(d => d.status !== 'COMPLETED')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-[#F4665C] bg-[#F4665C]/15 border-[#F4665C]/40';
      case 'HIGH':
        return 'text-[#C48A5C] bg-[#C48A5C]/15 border-[#C48A5C]/40';
      default:
        return 'text-[#4A808E] bg-[#4A808E]/15 border-[#4A808E]/40';
    }
  };

  return (
    <div className="bg-[#162B37] rounded-[24px] p-6 shadow-xl border border-[#214154]/40 flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Cabeçalho do Card (Anexo 4) */}
        <div className="flex items-center justify-between pb-3 border-b border-[#214154]/60">
          <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-tight">
            Próximos prazos
          </h3>
          <button
            onClick={onNavigate}
            className="text-xs text-[#A6C5CD] hover:text-white font-serif transition-colors cursor-pointer"
          >
            Ver agenda
          </button>
        </div>

        {/* Lista de Prazos */}
        <div className="space-y-3">
          {activeDeadlines.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#A6C5CD] font-serif">
              Nenhum prazo pendente na pauta.
            </div>
          ) : (
            activeDeadlines.map((deadline) => {
              const linkedCase = cases.find(c => c.id === deadline.caseId);

              return (
                <div
                  key={deadline.id}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between gap-3 border border-white/5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityStyle(deadline.priority)}`}>
                        {deadline.priority === 'CRITICAL' ? 'FATAL' : deadline.type}
                      </span>
                      <span className="text-xs font-serif font-bold text-[#F4665C]">
                        {formatDateBR(deadline.dueDate)}
                      </span>
                    </div>

                    <p className="text-xs text-white font-serif truncate">
                      {deadline.description}
                    </p>

                    {linkedCase && (
                      <span className="text-[10px] text-[#A6C5CD] font-mono truncate block mt-0.5">
                        {linkedCase.caseNumber}
                      </span>
                    )}
                  </div>

                  {/* Botão de Concluir com 1 Clique */}
                  <button
                    onClick={() => toggleDeadlineStatus(deadline.id)}
                    title="Marcar como cumprido"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-emerald-500 hover:text-white text-[#A6C5CD] flex items-center justify-center transition-all cursor-pointer shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#214154]/60 text-right">
        <button
          onClick={onNavigate}
          className="text-xs text-dex-coral hover:underline font-serif font-semibold inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Acessar pauta completa</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

