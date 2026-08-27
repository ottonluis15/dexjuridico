import React, { useState } from 'react';
import { 
  Briefcase, 
  Clock, 
  FolderKanban, 
  CheckCircle2, 
  Calendar, 
  Sparkles, 
  Plus, 
  AlertTriangle,
  ArrowRight,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { PriorityBadge, DeadlineStatusBadge, CaseStatusBadge } from '../common/Badge';
import { CaseDetailModal } from '../cases/CaseDetailModal';
import { DeadlineModal } from '../deadlines/DeadlineModal';
import { CaseModal } from '../cases/CaseModal';
import { LegalCase } from '../../types';

export const LawyerWorkbench: React.FC<{ onNavigateToAI: () => void }> = ({ onNavigateToAI }) => {
  const { currentUser } = useAuth();
  const { userCases, userDeadlines, toggleDeadlineStatus, clients } = useData();

  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [isNewDeadlineOpen, setIsNewDeadlineOpen] = useState(false);
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);

  const today = new Date().toISOString().substring(0, 10);
  const todayDeadlines = userDeadlines.filter(d => d.dueDate === today && d.status !== 'COMPLETED');
  const pendingDeadlines = userDeadlines.filter(d => d.status === 'PENDING').slice(0, 6);
  const activeCases = userCases.filter(c => c.status !== 'ARQUIVADO');

  return (
    <div className="space-y-6">
      {/* Lawyer Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950/30 to-slate-900 border border-slate-800/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120'}
            alt={currentUser?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/40 shadow-lg shadow-brand-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Área de Trabalho Individual
              </span>
              <span className="text-xs text-slate-400 font-mono">OAB {currentUser?.oab || 'Ativa'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              Bancada de {currentUser?.name}
            </h2>
            <p className="text-xs text-slate-300">
              Especialidades: {currentUser?.specialties?.join(' • ') || 'Contencioso Geral'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToAI}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-cyan-950/40 border border-cyan-400/30 transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Triagem com IA</span>
          </button>
          <button
            onClick={() => setIsNewDeadlineOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-2xl shadow-lg shadow-amber-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Prazo</span>
          </button>
        </div>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Prazos de Hoje</span>
            <p className="text-xl font-bold text-amber-400 mt-0.5">{todayDeadlines.length}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/50">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Processos sob sua Guarda</span>
            <p className="text-xl font-bold text-brand-400 mt-0.5">{activeCases.length}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-brand-950/60 text-brand-400 border border-brand-800/50">
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total de Prazos Pendentes</span>
            <p className="text-xl font-bold text-white mt-0.5">
              {userDeadlines.filter(d => d.status === 'PENDING').length}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: My Deadlines & My Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Upcoming Deadlines */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Sua Pauta de Prazos Próximos
            </h3>
            <span className="text-xs text-slate-400">{pendingDeadlines.length} pendentes</span>
          </div>

          <div className="space-y-3">
            {pendingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Nenhum prazo pendente na sua pauta!</p>
            ) : (
              pendingDeadlines.map(d => (
                <div
                  key={d.id}
                  className="p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <DeadlineStatusBadge status={d.status} dueDate={d.dueDate} />
                      <PriorityBadge priority={d.priority} />
                    </div>
                    <h4 className="text-xs font-bold text-white truncate">{d.type}</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">{d.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
                      📅 Vencimento: <strong>{d.dueDate} {d.dueTime && `às ${d.dueTime}`}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => toggleDeadlineStatus(d.id)}
                    title="Concluir e dar baixa"
                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 rounded-xl transition-colors shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Lawsuits */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-brand-400" />
              Seus Processos sob Condução
            </h3>
            <button
              onClick={() => setIsNewCaseOpen(true)}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
            >
              + Novo Processo
            </button>
          </div>

          <div className="space-y-3">
            {activeCases.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Nenhum processo ativo atribuído a você.</p>
            ) : (
              activeCases.slice(0, 5).map(c => {
                const client = clients.find(cl => cl.id === c.clientId);

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className="p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-mono font-bold text-brand-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                        {c.caseNumber}
                      </span>
                      <CaseStatusBadge status={c.status} />
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors truncate mt-1">
                      {c.actionType}
                    </h4>

                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                      <span className="truncate">Cliente: <strong className="text-slate-300">{client?.name}</strong></span>
                      <span className="shrink-0">{c.legalArea}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Selected Case Modal */}
      {selectedCase && (
        <CaseDetailModal
          caseItem={selectedCase}
          isOpen={!!selectedCase}
          onClose={() => setSelectedCase(null)}
        />
      )}

      {/* Quick Modals */}
      <DeadlineModal
        isOpen={isNewDeadlineOpen}
        onClose={() => setIsNewDeadlineOpen(false)}
      />
      <CaseModal
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
      />
    </div>
  );
};
