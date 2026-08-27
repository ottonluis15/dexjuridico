import React, { useState } from 'react';
import { 
  Sparkles, 
  FolderPlus, 
  Clock, 
  UserPlus, 
  FileText, 
  DollarSign, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { KPICards } from './KPICards';
import { UrgentAlerts } from './UrgentAlerts';
import { UpcomingDeadlines } from './UpcomingDeadlines';
import { RecentCases } from './RecentCases';
import { CaseDetailModal } from '../cases/CaseDetailModal';
import { TabType } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: TabType) => void;
  onOpenNewCase: () => void;
  onOpenNewDeadline: () => void;
  onOpenNewClient: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewCase,
  onOpenNewDeadline,
  onOpenNewClient
}) => {
  const { currentUser, isAdmin } = useAuth();
  const { stats, cases, financial } = useData();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const selectedCase = cases.find(c => c.id === selectedCaseId) || null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border border-slate-800/80 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              {isAdmin ? '👑 Painel Executivo' : '⚖️ Painel Operacional do Advogado'}
            </span>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Olá, {currentUser?.name}
          </h2>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
            {isAdmin 
              ? 'Você está visualizando a visão global de todos os processos, advogados e saúde financeira da banca.' 
              : 'Acompanhe seus prazos iminentes, audiências e processos sob sua condução direta.'}
          </p>
        </div>

        {/* AI Quick Callout Action */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('ai-assistant')}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-cyan-950/50 border border-cyan-400/30 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Triagem com Dex AI</span>
          </button>

          <button
            onClick={onOpenNewCase}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-2xl border border-slate-700/60 transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-brand-400" />
            <span>Distribuir Processo</span>
          </button>
        </div>

        {/* Background glow shape */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Urgent Deadlines Banner */}
      <UrgentAlerts onNavigateToDeadlines={() => onNavigate('deadlines')} />

      {/* KPI Cards Grid */}
      <KPICards onNavigate={onNavigate} />

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingDeadlines onNavigate={() => onNavigate('deadlines')} />
        <RecentCases 
          onNavigate={() => onNavigate('cases')} 
          onSelectCase={(id) => setSelectedCaseId(id)}
        />
      </div>

      {/* Selected Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal
          caseItem={selectedCase}
          isOpen={!!selectedCase}
          onClose={() => setSelectedCaseId(null)}
        />
      )}
    </div>
  );
};
