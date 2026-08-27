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
  CheckCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Deadline, DeadlinePriority } from '../../types';
import { PriorityBadge, DeadlineStatusBadge } from '../common/Badge';
import { DeadlineModal } from './DeadlineModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';

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
  
  // Next 7 days
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

    // Tabs filter
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
  const todayCount = userDeadlines.filter(d => (d.dueDate === today || d.dueDate === tomorrow) && d.status !== 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Pauta de Prazos & Audiências</h2>
          <p className="text-xs text-slate-400">
            Controle rigoroso de prazos processuais e compromissos judiciais
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Prazo / Audiência
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <button
          onClick={() => setActiveFilterTab('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeFilterTab === 'ALL'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Todos ({userDeadlines.length})
        </button>

        <button
          onClick={() => setActiveFilterTab('OVERDUE')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeFilterTab === 'OVERDUE'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : overdueCount > 0
              ? 'bg-rose-950/40 border border-rose-800 text-rose-300 hover:bg-rose-900/60'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Vencidos ({overdueCount})
        </button>

        <button
          onClick={() => setActiveFilterTab('TODAY')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeFilterTab === 'TODAY'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : todayCount > 0
              ? 'bg-amber-950/40 border border-amber-800 text-amber-300 hover:bg-amber-900/60'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Hoje & Amanhã ({todayCount})
        </button>

        <button
          onClick={() => setActiveFilterTab('WEEK')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeFilterTab === 'WEEK'
              ? 'bg-brand-600 text-white'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Próximos 7 Dias
        </button>

        <button
          onClick={() => setActiveFilterTab('COMPLETED')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeFilterTab === 'COMPLETED'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Concluídos
        </button>
      </div>

      {/* Search & Select Filters */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por ato, descrição ou processo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        <div>
          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="ALL">Todas as Prioridades</option>
            <option value="CRITICAL">Crítico</option>
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Média</option>
            <option value="NORMAL">Normal</option>
          </select>
        </div>

        <div>
          <select
            value={selectedLawyer}
            onChange={e => setSelectedLawyer(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="ALL">Todos os Advogados</option>
            {lawyers.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Deadlines List */}
      {filteredDeadlines.length === 0 ? (
        <EmptyState
          title="Nenhum prazo encontrado"
          description="Nenhum compromisso corresponde aos critérios e filtros selecionados."
          icon={Clock}
          actionLabel="Agendar Novo Prazo"
          onAction={() => setIsNewModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filteredDeadlines
            .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
            .map(deadline => {
              const linkedCase = cases.find(c => c.id === deadline.caseId);
              const lawyer = lawyers.find(l => l.id === deadline.lawyerId);
              const isOverdue = (deadline.status === 'OVERDUE' || deadline.dueDate < today) && deadline.status !== 'COMPLETED';
              const isCompleted = deadline.status === 'COMPLETED';

              return (
                <div
                  key={deadline.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCompleted
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-70'
                      : isOverdue
                      ? 'bg-rose-950/30 border-rose-900/60 shadow-lg'
                      : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleDeadlineStatus(deadline.id)}
                      title={isCompleted ? 'Reabrir prazo' : 'Concluir prazo'}
                      className={`mt-0.5 p-2 rounded-xl border transition-all shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <DeadlineStatusBadge status={deadline.status} dueDate={deadline.dueDate} />
                        <PriorityBadge priority={deadline.priority} />
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {deadline.type}
                        </span>
                      </div>

                      <h4 className={`text-sm font-bold ${isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                        {deadline.description}
                      </h4>

                      {linkedCase && (
                        <p className="text-xs text-brand-300 font-mono">
                          Proc. {linkedCase.caseNumber} • {linkedCase.actionType}
                        </p>
                      )}

                      {deadline.notes && (
                        <p className="text-[11px] text-slate-400 italic">
                          Obs: {deadline.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
                        <span className="font-mono">
                          📅 Vencimento: <strong className="text-white">{deadline.dueDate} {deadline.dueTime && `às ${deadline.dueTime}`}</strong>
                        </span>
                        {lawyer && (
                          <span>👤 Responsável: <strong>{lawyer.name}</strong></span>
                        )}
                        {deadline.completedAt && (
                          <span className="text-emerald-400">Baixa em: {deadline.completedAt}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => setEditingDeadline(deadline)}
                      title="Editar prazo"
                      className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeadlineToDelete(deadline)}
                      title="Excluir prazo"
                      className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-rose-950/30 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* New / Edit Deadline Modal */}
      <DeadlineModal
        isOpen={isNewModalOpen || !!editingDeadline}
        onClose={() => {
          setIsNewModalOpen(false);
          setEditingDeadline(null);
        }}
        deadlineToEdit={editingDeadline}
      />

      {/* Delete Confirmation */}
      {deadlineToDelete && (
        <ConfirmDialog
          isOpen={!!deadlineToDelete}
          onClose={() => setDeadlineToDelete(null)}
          onConfirm={() => {
            if (deadlineToDelete) {
              deleteDeadline(deadlineToDelete.id);
              setDeadlineToDelete(null);
            }
          }}
          title="Remover Prazo"
          message={`Deseja realmente remover o prazo "${deadlineToDelete.type}: ${deadlineToDelete.description}" da pauta?`}
        />
      )}
    </div>
  );
};
