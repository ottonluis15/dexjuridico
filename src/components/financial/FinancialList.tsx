import React, { useState } from 'react';
import { 
  DollarSign, 
  Search, 
  Plus, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Edit, 
  Download,
  Filter,
  TrendingUp,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { FinancialEntry, FinancialStatus, FinancialType } from '../../types';
import { FinancialStatusBadge } from '../common/Badge';
import { FinancialModal } from './FinancialModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';

export const FinancialList: React.FC = () => {
  const { userFinancial, clients, cases, deleteFinancial, updateFinancial } = useData();
  const { isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<FinancialEntry | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const filteredFinancial = userFinancial.filter(f => {
    const client = clients.find(c => c.id === f.clientId);
    const matchesSearch = 
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      (client && client.name.toLowerCase().includes(search.toLowerCase())) ||
      (f.description && f.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = selectedStatus === 'ALL' || f.status === selectedStatus;
    const matchesType = selectedType === 'ALL' || f.type === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // KPI Metrics
  const totalPaid = userFinancial
    .filter(f => f.status === 'PAGO')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalPending = userFinancial
    .filter(f => f.status === 'PENDENTE')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalOverdue = userFinancial
    .filter(f => f.status === 'ATRASADO')
    .reduce((sum, f) => sum + f.amount, 0);

  const handleMarkAsPaid = (entry: FinancialEntry) => {
    updateFinancial(entry.id, {
      status: 'PAGO',
      paymentDate: new Date().toISOString().substring(0, 10)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Financeiro & Honorários</h2>
          <p className="text-xs text-slate-400">
            {isAdmin 
              ? 'Gestão de faturamento, honorários contratuais, êxito e controle de custas' 
              : 'Visão restrita de honorários vinculados aos seus processos conduzidos'}
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Lançamento
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Honorários Recebidos</span>
            <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{formatCurrency(totalPaid)}</div>
          <p className="text-xs text-slate-400 mt-1">Liquidado no período</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">A Receber / Em Aberto</span>
            <div className="p-2 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/60">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400">{formatCurrency(totalPending)}</div>
          <p className="text-xs text-slate-400 mt-1">Faturas a vencer</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Valores em Atraso</span>
            <div className="p-2 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/60">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-400">{formatCurrency(totalOverdue)}</div>
          <p className="text-xs text-slate-400 mt-1">Cobranças vencidas</p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por descrição ou cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="ALL">Todos os Status</option>
            <option value="PENDENTE">Pendente</option>
            <option value="PAGO">Pago</option>
            <option value="ATRASADO">Em Atraso</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>

        <div>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="ALL">Todos os Tipos</option>
            <option value="HONORARIOS_INICIAIS">Honorários Iniciais</option>
            <option value="HONORARIOS_EXITO">Honorários de Êxito</option>
            <option value="MENSALIDADE">Mensalidades (Retainers)</option>
            <option value="CUSTAS">Custas Processuais</option>
            <option value="DESPESA">Despesas</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredFinancial.length === 0 ? (
        <EmptyState
          title="Nenhum lançamento financeiro"
          description="Nenhum registro corresponde aos filtros selecionados."
          icon={DollarSign}
          actionLabel="Novo Lançamento"
          onAction={() => setIsNewModalOpen(true)}
        />
      ) : (
        <div className="rounded-2xl border border-slate-800/80 overflow-hidden bg-slate-900/80 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Lançamento / Tipo</th>
                  <th className="py-3.5 px-4">Cliente / Processo</th>
                  <th className="py-3.5 px-4">Vencimento</th>
                  <th className="py-3.5 px-4">Valor</th>
                  <th className="py-3.5 px-4">Status & Pagamento</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredFinancial.map(entry => {
                  const client = clients.find(c => c.id === entry.clientId);
                  const linkedCase = cases.find(c => c.id === entry.caseId);

                  return (
                    <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Title & Type */}
                      <td className="py-4 px-4 min-w-[200px]">
                        <span className="font-bold text-white block">{entry.title}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {entry.type.replace('_', ' ')}
                        </span>
                        {entry.hasReceipt && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-brand-400 mt-1">
                            📎 {entry.receiptName}
                          </span>
                        )}
                      </td>

                      {/* Client / Case */}
                      <td className="py-4 px-4 min-w-[180px]">
                        <span className="font-semibold text-slate-200 block truncate">
                          {client?.name || 'Cliente'}
                        </span>
                        {linkedCase ? (
                          <span className="text-[10px] font-mono text-brand-300 block truncate">
                            Proc: {linkedCase.caseNumber}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Sem processo direto</span>
                        )}
                      </td>

                      {/* Due date */}
                      <td className="py-4 px-4 min-w-[130px]">
                        <span className="font-mono font-medium text-white block">
                          {entry.dueDate}
                        </span>
                        {entry.paymentDate && (
                          <span className="text-[10px] text-emerald-400 block">
                            Pago em: {entry.paymentDate}
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 min-w-[130px]">
                        <span className="font-extrabold text-sm text-white">
                          {formatCurrency(entry.amount)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 min-w-[160px]">
                        <div className="space-y-1">
                          <FinancialStatusBadge status={entry.status} />
                          <span className="text-[10px] text-slate-400 block">
                            Forma: {entry.paymentMethod}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {entry.status !== 'PAGO' && (
                            <button
                              onClick={() => handleMarkAsPaid(entry)}
                              title="Marcar como pago (Baixar fatura)"
                              className="p-1.5 text-emerald-400 hover:bg-emerald-950/40 rounded-lg transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setEditingEntry(entry)}
                            title="Editar lançamento"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEntryToDelete(entry)}
                            title="Excluir lançamento"
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <FinancialModal
        isOpen={isNewModalOpen || !!editingEntry}
        onClose={() => {
          setIsNewModalOpen(false);
          setEditingEntry(null);
        }}
        entryToEdit={editingEntry}
      />

      {/* Delete confirmation */}
      {entryToDelete && (
        <ConfirmDialog
          isOpen={!!entryToDelete}
          onClose={() => setEntryToDelete(null)}
          onConfirm={() => {
            if (entryToDelete) {
              deleteFinancial(entryToDelete.id);
              setEntryToDelete(null);
            }
          }}
          title="Excluir Lançamento Financeiro"
          message={`Tem certeza que deseja remover o lançamento "${entryToDelete.title}" no valor de ${formatCurrency(entryToDelete.amount)}?`}
        />
      )}
    </div>
  );
};
