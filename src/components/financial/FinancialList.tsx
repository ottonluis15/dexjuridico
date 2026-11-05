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
  Eye,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { FinancialEntry, FinancialStatus, FinancialType } from '../../types';
import { FinancialStatusBadge } from '../common/Badge';
import { FinancialModal } from './FinancialModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';
import { InternalPageLayout, SummaryCardItem } from '../layout/InternalPageLayout';

export const FinancialList: React.FC = () => {
  const { userFinancial, clients, cases, deleteFinancial, updateFinancial } = useData();
  const { isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<FinancialEntry | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<FinancialEntry | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
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

  const isRevenueType = (t: string) => t !== 'DESPESA' && t !== 'CUSTAS';

  const totalPaid = userFinancial
    .filter(f => isRevenueType(f.type) && f.status === 'PAGO')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalPending = userFinancial
    .filter(f => isRevenueType(f.type) && f.status === 'PENDENTE')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalOverdue = userFinancial
    .filter(f => f.status === 'ATRASADO')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpenses = userFinancial
    .filter(f => (f.type === 'DESPESA' || f.type === 'CUSTAS') && f.status === 'PAGO')
    .reduce((sum, f) => sum + f.amount, 0);

  const handleDownloadReceipt = (entry: FinancialEntry) => {
    if (!entry.receiptUrl) {
      alert('Este comprovante possui apenas o nome de registro. Edite o lançamento para anexar um novo arquivo físico.');
      return;
    }
    const link = document.createElement('a');
    link.href = entry.receiptUrl;
    link.download = entry.receiptName || 'comprovante.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMarkAsPaid = (entry: FinancialEntry) => {
    updateFinancial(entry.id, {
      status: 'PAGO',
      paymentDate: new Date().toISOString().substring(0, 10)
    });
  };

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
      label: 'Honorários Recebidos',
      value: formatCurrency(totalPaid),
      icon: <CheckCircle2 className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#CBEBD8]',
      iconTextColor: 'text-[#2B8255]',
    },
    {
      label: 'A Receber / Em Aberto',
      value: formatCurrency(totalPending),
      icon: <Clock className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#F9D9C3]',
      iconTextColor: 'text-[#C48A5C]',
    },
    {
      label: 'Valores em Atraso',
      value: formatCurrency(totalOverdue),
      icon: <AlertCircle className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#E0D7F5]',
      iconTextColor: 'text-dex-coral',
    },
    {
      label: 'Despesas Pagas',
      value: formatCurrency(totalExpenses),
      icon: <DollarSign className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#FDF0CD]',
      iconTextColor: 'text-[#B7791F]',
    },
  ];

  return (
    <InternalPageLayout
      summaryCards={summaryCards}
      headerTitle="Controle Financeiro & Honorários"
      headerSubtitle={`${filteredFinancial.length} ${filteredFinancial.length === 1 ? 'lançamento localizado' : 'lançamentos localizados'}`}
      headerFilters={
        <>
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por título, cliente ou nota..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>

          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
          >
            <option value="ALL" className="bg-[#162B37] text-white">Todos os Tipos</option>
            <option value="RECEITA" className="bg-[#162B37] text-white">Receitas / Honorários</option>
            <option value="DESPESA" className="bg-[#162B37] text-white">Despesas / Custas</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
          >
            <option value="ALL" className="bg-[#162B37] text-white">Todos os Status</option>
            <option value="PAGO" className="bg-[#162B37] text-white">Liquidado</option>
            <option value="PENDENTE" className="bg-[#162B37] text-white">A Vencer</option>
            <option value="ATRASADO" className="bg-[#162B37] text-white">Inadimplente</option>
            <option value="CANCELADO" className="bg-[#162B37] text-white">Cancelado</option>
          </select>
        </>
      }
      headerActions={
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-dex-coral hover:bg-dex-coral-hover text-white text-xs font-semibold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer font-serif"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Lançamento</span>
        </button>
      }
    >
      {filteredFinancial.length === 0 ? (
        <EmptyState
          title="Nenhum lançamento encontrado"
          description="Nenhum registro financeiro corresponde aos filtros aplicados."
          icon={DollarSign}
          actionLabel="Registrar Lançamento"
          onAction={() => setIsNewModalOpen(true)}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white">
            <thead className="bg-[#1A3342] text-[#A6C5CD] font-semibold border-b border-[#214154]">
              <tr>
                <th className="py-3.5 px-4 font-serif">Título / Descrição</th>
                <th className="py-3.5 px-4 font-serif">Cliente / Processo</th>
                <th className="py-3.5 px-4 font-serif">Status</th>
                <th className="py-3.5 px-4 font-serif">Vencimento</th>
                <th className="py-3.5 px-4 font-serif text-right">Valor</th>
                <th className="py-3.5 px-4 font-serif text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#214154]/50">
              {filteredFinancial.map(entry => {
                const client = clients.find(c => c.id === entry.clientId);
                const linkedCase = cases.find(c => c.id === entry.caseId);
                const isPaid = entry.status === 'PAGO';

                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {isRevenueType(entry.type) ? (
                          <span className="p-1 rounded-md bg-[#48BB78]/20 text-[#48BB78]">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1 rounded-md bg-dex-coral/20 text-dex-coral">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <div>
                          <div className="font-bold text-white text-xs">{entry.title}</div>
                          <div className="text-[11px] text-[#A6C5CD]">{entry.type.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">{client ? client.name : '-'}</div>
                      {linkedCase && (
                        <div className="text-[10px] text-[#A6C5CD] font-mono">{linkedCase.caseNumber}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <FinancialStatusBadge status={entry.status} />
                    </td>

                    <td className="py-3.5 px-4 text-xs font-serif text-white">
                      {formatDateBR(entry.dueDate)}
                    </td>

                    <td className={`py-3.5 px-4 text-right font-display font-bold text-sm ${
                      isRevenueType(entry.type) ? 'text-[#48BB78]' : 'text-dex-coral'
                    }`}>
                      {isRevenueType(entry.type) ? '+' : '-'} {formatCurrency(entry.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!isPaid && (
                          <button
                            onClick={() => handleMarkAsPaid(entry)}
                            title="Marcar como Liquidado"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500 hover:text-white text-[#A6C5CD] transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {entry.receiptUrl && (
                          <button
                            onClick={() => setViewingReceipt(entry)}
                            title="Ver Comprovante"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-[#A6C5CD] hover:text-white transition-colors cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setEditingEntry(entry)}
                          title="Editar"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-[#A6C5CD] hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEntryToDelete(entry)}
                          title="Excluir"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-dex-coral/20 text-[#A6C5CD] hover:text-dex-coral transition-colors cursor-pointer"
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
      )}

      {/* Modais */}
      <FinancialModal
        isOpen={isNewModalOpen || !!editingEntry}
        onClose={() => {
          setIsNewModalOpen(false);
          setEditingEntry(null);
        }}
        initialEntry={editingEntry || undefined}
      />

      {/* Modal Visualizar Comprovante */}
      {viewingReceipt && (
        <Modal
          isOpen={!!viewingReceipt}
          onClose={() => setViewingReceipt(null)}
          title="Comprovante de Lançamento"
          subtitle={viewingReceipt.title}
          maxWidth="lg"
        >
          <div className="space-y-4 text-center">
            {viewingReceipt.receiptUrl?.startsWith('data:image') ? (
              <img
                src={viewingReceipt.receiptUrl}
                alt="Comprovante"
                className="max-h-96 mx-auto rounded-2xl border border-white/20 shadow-md"
              />
            ) : (
              <div className="p-8 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                <FileText className="w-12 h-12 mx-auto text-dex-coral" />
                <p className="text-xs text-white">{viewingReceipt.receiptName || 'Arquivo anexado'}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => handleDownloadReceipt(viewingReceipt)}
                className="px-4 py-2 bg-dex-coral hover:bg-dex-coral-hover text-white text-xs font-semibold rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Arquivo</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={() => {
          if (entryToDelete) {
            deleteFinancial(entryToDelete.id);
            setEntryToDelete(null);
          }
        }}
        title="Excluir Lançamento"
        message={`Deseja remover o lançamento "${entryToDelete?.title}" de ${entryToDelete ? formatCurrency(entryToDelete.amount) : ''}?`}
        confirmLabel="Sim, excluir lançamento"
      />
    </InternalPageLayout>
  );
};
