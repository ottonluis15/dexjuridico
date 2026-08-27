import React from 'react';
import { FolderKanban, ArrowRight, User, Scale } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { CaseStatusBadge } from '../common/Badge';

export const RecentCases: React.FC<{ onNavigate: () => void; onSelectCase: (caseId: string) => void }> = ({ 
  onNavigate,
  onSelectCase 
}) => {
  const { userCases, clients, lawyers } = useData();

  const recentList = [...userCases]
    .sort((a, b) => b.distributionDate.localeCompare(a.distributionDate))
    .slice(0, 5);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Processos em Andamento</h3>
            <p className="text-xs text-slate-400">Demandas ativas distribuídas</p>
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
        {recentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FolderKanban className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs text-slate-400">Nenhum processo cadastrado ainda.</p>
          </div>
        ) : (
          recentList.map(caseItem => {
            const client = clients.find(c => c.id === caseItem.clientId);
            const lawyer = lawyers.find(l => l.id === caseItem.lawyerId);

            return (
              <div
                key={caseItem.id}
                onClick={() => onSelectCase(caseItem.id)}
                className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 transition-all cursor-pointer group flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono font-bold text-brand-300 bg-brand-950/80 border border-brand-800/50 px-2 py-0.5 rounded">
                      {caseItem.caseNumber}
                    </span>
                    <CaseStatusBadge status={caseItem.status} />
                  </div>

                  <h4 className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors truncate">
                    {caseItem.actionType}
                  </h4>

                  <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 truncate">
                      <User className="w-3 h-3 text-slate-400" />
                      {client?.name || 'Cliente'}
                    </span>
                    <span className="font-semibold text-slate-300 shrink-0">
                      {formatCurrency(caseItem.value)}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">Área:</span>
                  <span className="text-[11px] font-semibold text-slate-200">{caseItem.legalArea}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
