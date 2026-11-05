import React from 'react';
import { useData } from '../../context/DataContext';
import { CaseStatus } from '../../types';

export const ProcessStatusChart: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const { userCases } = useData();

  const total = userCases.length || 1;

  // Contagem por status
  const statusCounts: Record<string, { label: string; count: number; color: string }> = {
    'INICIAL': { 
      label: 'Fase Inicial', 
      count: userCases.filter(c => c.status === 'INICIAL').length,
      color: '#4A808E' 
    },
    'INSTRUCAO': { 
      label: 'Instrução', 
      count: userCases.filter(c => c.status === 'INSTRUCAO').length,
      color: '#C48A5C' 
    },
    'RECURSAL': { 
      label: 'Fase Recursal', 
      count: userCases.filter(c => c.status === 'RECURSAL').length,
      color: '#6B46C1' 
    },
    'SENTENCA': { 
      label: 'Sentenciado', 
      count: userCases.filter(c => c.status === 'SENTENCA').length,
      color: '#38A169' 
    },
    'EXECUCAO': { 
      label: 'Execução / Cumprimento', 
      count: userCases.filter(c => c.status === 'EXECUCAO').length,
      color: '#F4665C' 
    },
  };

  return (
    <div className="bg-[#162B37] rounded-[24px] p-6 shadow-xl border border-[#214154]/40 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3 border-b border-[#214154]/60">
        <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-tight">
          Processos por status
        </h3>
        <button
          onClick={onNavigate}
          className="text-xs text-[#A6C5CD] hover:text-white font-serif transition-colors cursor-pointer"
        >
          Ver todos ({userCases.length})
        </button>
      </div>

      <div className="mt-5 space-y-4 flex-1 flex flex-col justify-center">
        {Object.entries(statusCounts).map(([key, item]) => {
          const percent = Math.round((item.count / total) * 100);
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-serif">
                <span className="text-[#EAE0DA]">{item.label}</span>
                <span className="text-[#A6C5CD] font-medium">
                  {item.count} ({percent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(percent, 4)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
