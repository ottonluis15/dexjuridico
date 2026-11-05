import React from 'react';
import { FolderKanban, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { CaseStatusBadge } from '../common/Badge';

export const RecentCases: React.FC<{ onNavigate: () => void; onSelectCase: (caseId: string) => void }> = ({ 
  onNavigate,
  onSelectCase 
}) => {
  const { userCases, clients } = useData();

  const recentList = [...userCases]
    .sort((a, b) => b.distributionDate.localeCompare(a.distributionDate))
    .slice(0, 5);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="p-6 rounded-[24px] bg-dex-navy-900 border border-white/5 flex flex-col h-full shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-dex-coral/20 text-dex-coral flex items-center justify-center">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-white">Processos em Andamento</h3>
            <p className="text-xs text-[#8F8A87] font-serif">Demandas ativas distribuídas</p>
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
        {recentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FolderKanban className="w-8 h-8 text-[#8F8A87] mb-2" />
            <p className="text-xs text-[#8F8A87] font-serif">Nenhum processo cadastrado ainda.</p>
          </div>
        ) : (
          recentList.map(caseItem => {
            const client = clients.find(c => c.id === caseItem.clientId);

            return (
              <div
                key={caseItem.id}
                onClick={() => onSelectCase(caseItem.id)}
                className="p-3.5 rounded-2xl bg-dex-navy-800 hover:bg-dex-navy-700/80 border border-white/5 transition-all cursor-pointer group flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono font-bold text-dex-peach bg-dex-navy-950 border border-white/5 px-2 py-0.5 rounded">
                      {caseItem.caseNumber}
                    </span>
                    <CaseStatusBadge status={caseItem.status} />
                  </div>

                  <h4 className="font-serif text-xs font-bold text-white group-hover:text-dex-coral transition-colors truncate">
                    {caseItem.actionType}
                  </h4>

                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#8F8A87] font-serif">
                    <span className="truncate">Cliente: <strong className="text-slate-200">{client?.name || '-'}</strong></span>
                  </div>
                </div>

                <span className="font-serif text-xs font-bold text-white shrink-0">
                  {formatCurrency(caseItem.value || 0)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
