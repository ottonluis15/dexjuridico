import React, { useState } from 'react';
import { 
  Clock, 
  Search, 
  Plus, 
  CheckCircle2, 
  Calendar, 
  Trash2, 
  Edit, 
  ShieldAlert, 
  Filter,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Deadline, DeadlinePriority } from '../../types';
import { PriorityBadge, DeadlineStatusBadge } from '../common/Badge';
import { DeadlineModal } from './DeadlineModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { InternalPageLayout, SummaryCardItem } from '../layout/InternalPageLayout';

type FilterTab = 'ALL' | 'OVERDUE' | 'TODAY' | 'WEEK' | 'COMPLETED';

export const DeadlineList: React.FC = () => {
  const { userDeadlines, cases, lawyers, toggleDeadlineStatus, deleteDeadline } = useData();
  const { isAdmin } = useAuth();

  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>('ALL');
  const [search, setSearch] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedLawyer, setSelectedLawyer] = useState<string>('ALL');

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [deadlineToDelete, setDeadlineToDelete] = useState<Deadline | null>(null);

  const today = new Date().toISOString().substring(0, 10);
  const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().substring(0, 10);
  const nextWeek = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().substring(0, 10);

  // Filtragem
  const filteredDeadlines = userDeadlines.filter(d => {
    const linkedCase = cases.find(c => c.id === d.caseId);
    const matchesSearch = 
      d.description.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase()) ||
      (linkedCase && linkedCase.caseNumber.includes(search));

    const matchesPriority = selectedPriority === 'ALL' || d.priority === selectedPriority;
    const matchesLawyer = selectedLawyer === 'ALL' || d.lawyerId === selectedLawyer;

    let matchesTab = true;
    if (activeFilterTab === 'OVERDUE') {
      matchesTab = (d.status === 'OVERDUE' || d.dueDate < today) && d.status !== 'COMPLETED';
    } else if (activeFilterTab === 'TODAY') {
      matchesTab = (d.dueDate === today || d.dueDate === tomorrow) && d.status !== 'COMPLETED';
    } else if (activeFilterTab === 'WEEK') {
      matchesTab = d.dueDate >= today && d.dueDate <= nextWeek && d.status !== 'COMPLETED';
    } else if (activeFilterTab === 'COMPLETED') {
      matchesTab = d.status === 'COMPLETED';
    }

    return matchesSearch && matchesPriority && matchesLawyer && matchesTab;
  });

  const overdueCount = userDeadlines.filter(d => (d.status === 'OVERDUE' || d.dueDate < today) && d.status !== 'COMPLETED').length;
  const criticalCount = userDeadlines.filter(d => d.priority === 'CRITICAL' && d.status !== 'COMPLETED').length;
  const weekCount = userDeadlines.filter(d => d.dueDate >= today && d.dueDate <= nextWeek && d.status !== 'COMPLETED').length;
  const completedCount = userDeadlines.filter(d => d.status === 'COMPLETED').length;

  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // 4 Cards de Resumo (Anexo 5)
  const summaryCards: SummaryCardItem[] = [
    {
      label: 'Prazos Fatais / Críticos',
      value: criticalCount,
      icon: <ShieldAlert className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#F9D9C3]',
      iconTextColor: 'text-dex-coral',
    },
    {
      label: 'Prazos nos Próximos 7 Dias',
      value: weekCount,
      icon: <Clock className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#CBEBD8]',
      iconTextColor: 'text-[#2B8255]',
    },
    {
      label: 'Compromissos Vencidos',
      value: overdueCount,
      icon: <AlertTriangle className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#E0D7F5]',
      iconTextColor: 'text-[#6B46C1]',
    },
    {
      label: 'Prazos Cumpridos',
      value: completedCount,
      icon: <CheckCircle2 className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#FDF0CD]',
      iconTextColor: 'text-[#B7791F]',
    },
  ];

  return (
    <InternalPageLayout
      summaryCards={summaryCards}
      headerTitle="Pauta de Prazos & Agenda"
      headerSubtitle={`${filteredDeadlines.length} ${filteredDeadlines.length === 1 ? 'compromisso listado' : 'compromissos listados'}`}
      headerFilters={
        <>
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por descrição, tipo ou processo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>

          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
          >
            <option value="ALL" className="bg-[#162B37] text-white">Todas as Prioridades</option>
            <option value="CRITICAL" className="bg-[#162B37] text-white">Crítica (Fatal)</option>
            <option value="HIGH" className="bg-[#162B37] text-white">Alta (Urgente)</option>
            <option value="MEDIUM" className="bg-[#162B37] text-white">Média</option>
            <option value="NORMAL" className="bg-[#162B37] text-white">Normal</option>
          </select>
        </>
      }
      headerActions={
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-dex-coral hover:bg-dex-coral-hover text-white text-xs font-semibold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer font-serif"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Prazo / Audiência</span>
        </button>
      }
    >
      {/* Pills de Filtragem Rápida */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-2 custom-scrollbar">
        <button
          onClick={() => setActiveFilterTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeFilterTab === 'ALL'
              ? 'bg-dex-navy-950 text-white shadow-md'
              : 'bg-white/5 text-[#A6C5CD] hover:text-white hover:bg-white/10'
          }`}
        >
          Todos ({userDeadlines.length})
        </button>

        <button
          onClick={() => setActiveFilterTab('OVERDUE')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilterTab === 'OVERDUE'
              ? 'bg-dex-coral text-white shadow-md'
              : overdueCount > 0
              ? 'bg-dex-coral/20 text-dex-coral border border-dex-coral/40'
              : 'bg-white/5 text-[#A6C5CD] hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Vencidos ({overdueCount})</span>
        </button>

        <button
          onClick={() => setActiveFilterTab('TODAY')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilterTab === 'TODAY'
              ? 'bg-dex-navy-950 text-white shadow-md'
              : 'bg-white/5 text-[#A6C5CD] hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Hoje & Amanhã</span>
        </button>

        <button
          onClick={() => setActiveFilterTab('WEEK')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeFilterTab === 'WEEK'
              ? 'bg-dex-navy-950 text-white shadow-md'
              : 'bg-white/5 text-[#A6C5CD] hover:text-white'
          }`}
        >
          Próximos 7 Dias
        </button>

        <button
          onClick={() => setActiveFilterTab('COMPLETED')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeFilterTab === 'COMPLETED'
              ? 'bg-dex-navy-950 text-white shadow-md'
              : 'bg-white/5 text-[#A6C5CD] hover:text-white'
          }`}
        >
          Cumpridos ({completedCount})
        </button>
      </div>

      {/* Lista de Prazos */}
      {filteredDeadlines.length === 0 ? (
        <EmptyState
          title="Nenhum prazo encontrado"
          description="A pauta está limpa ou nenhum registro corresponde aos filtros selecionados."
          icon={Clock}
          actionLabel="Agendar Novo Prazo"
          onAction={() => setIsNewModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filteredDeadlines.map(deadline => {
            const linkedCase = cases.find(c => c.id === deadline.caseId);
            const lawyer = lawyers.find(l => l.id === deadline.lawyerId);
            const isCompleted = deadline.status === 'COMPLETED';

            return (
              <div
                key={deadline.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'bg-white/5 border-white/10 opacity-70'
                    : 'bg-[#1A3342] border-[#214154] hover:border-[#3D6C78]'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <button
                    onClick={() => toggleDeadlineStatus(deadline.id)}
                    title={isCompleted ? 'Reabrir prazo' : 'Marcar como cumprido'}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5 ${
                      isCompleted
                        ? 'bg-[#48BB78] border-[#48BB78] text-white'
                        : 'border-white/30 hover:border-white text-transparent hover:text-white/40'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <DeadlineStatusBadge status={deadline.status} dueDate={deadline.dueDate} />
                      <PriorityBadge priority={deadline.priority} />
                      <span className="text-xs font-serif font-bold text-white">
                        Vencimento: {formatDateBR(deadline.dueDate)}
                      </span>
                    </div>

                    <h4 className={`text-sm font-display font-bold ${isCompleted ? 'line-through text-[#A6C5CD]' : 'text-white'}`}>
                      {deadline.type} — {deadline.description}
                    </h4>

                    <div className="flex items-center gap-3 mt-1 text-xs text-[#A6C5CD] flex-wrap">
                      {linkedCase && (
                        <span>Processo CNJ: <strong className="text-white font-mono">{linkedCase.caseNumber}</strong></span>
                      )}
                      {lawyer && (
                        <span>Responsável: <strong className="text-white">{lawyer.name}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => setEditingDeadline(deadline)}
                    title="Editar prazo"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-[#A6C5CD] hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeadlineToDelete(deadline)}
                    title="Excluir prazo"
                    className="p-2 rounded-xl bg-white/5 hover:bg-dex-coral/20 text-[#A6C5CD] hover:text-dex-coral transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modais */}
      <DeadlineModal
        isOpen={isNewModalOpen || !!editingDeadline}
        onClose={() => {
          setIsNewModalOpen(false);
          setEditingDeadline(null);
        }}
        initialDeadline={editingDeadline || undefined}
      />

      <ConfirmDialog
        isOpen={!!deadlineToDelete}
        onClose={() => setDeadlineToDelete(null)}
        onConfirm={() => {
          if (deadlineToDelete) {
            deleteDeadline(deadlineToDelete.id);
            setDeadlineToDelete(null);
          }
        }}
        title="Excluir Prazo"
        message={`Deseja realmente remover o prazo "${deadlineToDelete?.description}"? Esta ação removerá o alerta do dashboard.`}
        confirmLabel="Sim, excluir prazo"
      />
    </InternalPageLayout>
  );
};
