import React from 'react';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const UrgentAlerts: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const { userDeadlines } = useData();

  const urgentList = userDeadlines
    .filter(d => d.status !== 'COMPLETED' && (d.priority === 'CRITICAL' || d.priority === 'HIGH'))
    .slice(0, 3);

  if (urgentList.length === 0) return null;

  return (
    <div className="p-4 rounded-[20px] bg-dex-navy-900 border border-dex-coral/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-dex-coral/20 text-dex-coral flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-serif text-xs font-bold text-dex-coral uppercase tracking-wider">
            Atenção: {urgentList.length} Prazos Fatais ou Urgentes
          </h4>
          <p className="text-xs text-slate-300 font-serif">
            {urgentList[0].type}: {urgentList[0].description} (Vence em: {urgentList[0].dueDate})
          </p>
        </div>
      </div>

      <button
        onClick={onNavigate}
        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-dex-coral hover:bg-dex-coral/90 text-white text-xs font-serif font-bold rounded-xl transition-all self-start sm:self-auto"
      >
        <span>Ver Pauta</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
