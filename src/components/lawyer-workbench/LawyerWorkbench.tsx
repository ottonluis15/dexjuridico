import React, { useState } from 'react';
import { 
  Clock, 
  FolderKanban, 
  CheckCircle2, 
  Calendar, 
  Sparkles, 
  Plus, 
  Building2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { PriorityBadge, DeadlineStatusBadge, CaseStatusBadge } from '../common/Badge';
import { CaseDetailModal } from '../cases/CaseDetailModal';
import { DeadlineModal } from '../deadlines/DeadlineModal';
import { CaseModal } from '../cases/CaseModal';
import { LegalCase } from '../../types';
import { DecorativeBars } from '../common/DecorativeBars';

export const LawyerWorkbench: React.FC<{ 
  onNavigateToAI: () => void;
  onNavigateToOffice?: () => void;
}> = ({ onNavigateToAI, onNavigateToOffice }) => {
  const { currentUser, isAdmin } = useAuth();
  const { personalCases, personalDeadlines, toggleDeadlineStatus, clients } = useData();

  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [isNewDeadlineOpen, setIsNewDeadlineOpen] = useState(false);
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);

  const today = new Date().toISOString().substring(0, 10);
  const todayDeadlines = personalDeadlines.filter(d => d.dueDate === today && d.status !== 'COMPLETED');
  const pendingDeadlines = personalDeadlines.filter(d => d.status === 'PENDING').slice(0, 6);
  const activeCases = personalCases.filter(c => c.status !== 'ARQUIVADO');

  return (
    <div className="space-y-6">
      {/* Lawyer Header Banner */}
      <div className="p-6 md:p-8 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5 relative z-10">
          <img
            src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120'}
            alt={currentUser?.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-dex-coral shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-dex-coral/20 text-dex-coral border border-dex-coral/30">
                Área de Trabalho Individual
              </span>
              <span className="text-xs text-[#8F8A87] font-serif">OAB {currentUser?.oab || 'Ativa'}</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
              Bancada de {currentUser?.name}
            </h2>
            <p className="text-xs text-[#8F8A87] font-serif">
              Especialidades: {currentUser?.specialties?.join(' • ') || 'Contencioso Geral'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap relative z-10">
          {isAdmin && onNavigateToOffice && (
            <button
              onClick={onNavigateToOffice}
              className="flex items-center gap-2 px-4 py-2.5 bg-dex-navy-800 hover:bg-dex-navy-700 text-dex-beige text-xs font-serif rounded-xl border border-white/10 transition-all"
            >
              <Building2 className="w-4 h-4 text-dex-peach" />
              <span>Gestão do Escritório</span>
            </button>
          )}
          <button
            onClick={onNavigateToAI}
            className="flex items-center gap-2 px-4 py-2.5 bg-dex-slate hover:bg-slate-700 text-white text-xs font-serif font-bold rounded-xl shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4 text-dex-coral" />
            <span>Triagem com IA</span>
          </button>
          <button
            onClick={() => setIsNewDeadlineOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-dex-coral hover:bg-dex-coral/90 text-white text-xs font-serif font-bold rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Prazo</span>
          </button>
        </div>

        {/* Subtle crow background watermark */}
        <img
          src="/img/corvo1.png"
          alt=""
          aria-hidden="true"
          className="absolute right-0 bottom-0 w-32 opacity-10 pointer-events-none -mr-4 -mb-6"
        />
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-serif text-[#8F8A87]">Prazos de Hoje</span>
            <p className="font-serif text-2xl font-bold text-dex-coral mt-1">{todayDeadlines.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-dex-kpi-peach text-dex-navy-950 flex items-center justify-center shadow-md">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-serif text-[#8F8A87]">Processos sob sua Guarda</span>
            <p className="font-serif text-2xl font-bold text-white mt-1">{activeCases.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-dex-kpi-mint text-dex-navy-950 flex items-center justify-center shadow-md">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-serif text-[#8F8A87]">Total de Prazos Pendentes</span>
            <p className="font-serif text-2xl font-bold text-dex-peach mt-1">
              {personalDeadlines.filter(d => d.status === 'PENDING').length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-dex-kpi-purple text-dex-navy-950 flex items-center justify-center shadow-md">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: My Deadlines & My Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Upcoming Deadlines */}
        <div className="p-6 md:p-8 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-dex-coral" />
              Sua Pauta de Prazos Próximos
            </h3>
            <span className="text-xs font-serif text-[#8F8A87]">{pendingDeadlines.length} pendentes</span>
          </div>

          <div className="space-y-3">
            {pendingDeadlines.length === 0 ? (
              <p className="text-xs font-serif text-[#8F8A87] text-center py-10">
                Nenhum prazo pendente na sua pauta! Tudo em dia.
              </p>
            ) : (
              pendingDeadlines.map(d => (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl bg-dex-navy-800 hover:bg-dex-navy-700/80 border border-white/5 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <DeadlineStatusBadge status={d.status} dueDate={d.dueDate} />
                      <PriorityBadge priority={d.priority} />
                    </div>
                    <h4 className="font-serif text-xs font-bold text-white truncate">{d.type}</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">{d.description}</p>
                    <p className="text-[11px] text-[#8F8A87] mt-1.5 font-serif">
                      📅 Vencimento: <strong className="text-white">{d.dueDate} {d.dueTime && `às ${d.dueTime}`}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => toggleDeadlineStatus(d.id)}
                    title="Concluir e dar baixa"
                    className="p-2 text-[#8F8A87] hover:text-dex-chart-green hover:bg-dex-navy-900 rounded-xl transition-colors shrink-0"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Lawsuits */}
        <div className="p-6 md:p-8 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-dex-peach" />
              Seus Processos sob Condução
            </h3>
            <button
              onClick={() => setIsNewCaseOpen(true)}
              className="text-xs font-serif font-bold text-dex-coral hover:underline"
            >
              + Novo Processo
            </button>
          </div>

          <div className="space-y-3">
            {activeCases.length === 0 ? (
              <p className="text-xs font-serif text-[#8F8A87] text-center py-10">
                Nenhum processo ativo atribuído a você no momento.
              </p>
            ) : (
              activeCases.slice(0, 5).map(c => {
                const client = clients.find(cl => cl.id === c.clientId);

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className="p-4 rounded-2xl bg-dex-navy-800 hover:bg-dex-navy-700/80 border border-white/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-mono font-bold text-dex-peach bg-dex-navy-950 px-2 py-0.5 rounded border border-white/5">
                        {c.caseNumber}
                      </span>
                      <CaseStatusBadge status={c.status} />
                    </div>

                    <h4 className="font-serif text-xs font-bold text-white group-hover:text-dex-coral transition-colors truncate">
                      {c.actionType}
                    </h4>

                    <div className="flex items-center justify-between mt-2 text-[11px] text-[#8F8A87] font-serif">
                      <span className="truncate">Cliente: <strong className="text-slate-200">{client?.name}</strong></span>
                      <span className="shrink-0">{c.legalArea}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      {selectedCase && (
        <CaseDetailModal
          caseItem={selectedCase}
          isOpen={!!selectedCase}
          onClose={() => setSelectedCase(null)}
        />
      )}

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
