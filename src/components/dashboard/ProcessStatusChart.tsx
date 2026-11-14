import React from 'react';
import { Feather, Scale } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const ProcessStatusChart: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const { userCases } = useData();

  const total = userCases.length;

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

      {total === 0 ? (
        <div className="mt-5 flex-1 flex flex-col items-center justify-center py-8 text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-[#A6C5CD]/60 mb-1">
            <Feather className="w-5 h-5 stroke-[1.5]" />
          </div>
          <p className="text-xs text-white/90 font-serif font-medium">
            Nenhum processo em andamento
          </p>
          <p className="text-[11px] text-[#A6C5CD]/70 font-serif max-w-xs leading-relaxed">
            Cadastre seu primeiro processo judicial para acompanhar a distribuição por fases processuais.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4 flex-1 flex flex-col justify-center">
          {Object.entries(statusCounts).map(([key, item]) => {
            const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
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
                      width: `${item.count > 0 ? Math.max(percent, 4) : 0}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
