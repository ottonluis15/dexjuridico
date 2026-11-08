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
  ArrowDownLeft,
  FileSpreadsheet,
  Loader2,
  X
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
import { exportFinancialSheet } from '../../services/financialExportService';

export const FinancialList: React.FC = () => {
  const { userFinancial, clients, cases, lawyers, deleteFinancial, updateFinancial, showToast } = useData();
  const { isAdmin, currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<FinancialEntry | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<FinancialEntry | null>(null);

  // Estados do Modal de Exportação de Planilha
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [exportPeriod, setExportPeriod] = useState<'CURRENT_FILTER' | 'ALL' | 'THIS_MONTH' | 'THIS_YEAR'>('CURRENT_FILTER');
  const [isExporting, setIsExporting] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const cleanS = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  const filteredFinancial = userFinancial.filter(f => {
    const client = clients.find(c => c.id === f.clientId);
    const titleNorm = (f.title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const clientNameNorm = client ? (client.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
    const descNorm = (f.description || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const methodNorm = (f.paymentMethod || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const matchesSearch = !cleanS || (
      titleNorm.includes(cleanS) ||
      clientNameNorm.includes(cleanS) ||
      descNorm.includes(cleanS) ||
      methodNorm.includes(cleanS)
    );

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

  const handleExecuteExport = async () => {
    let targetEntries: FinancialEntry[] = [];
    let periodText = 'Filtro Atual da Tela';

    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentYearPrefix = `${now.getFullYear()}`;

    if (exportPeriod === 'CURRENT_FILTER') {
      targetEntries = filteredFinancial;
      periodText = `Filtro Aplicado (${filteredFinancial.length} registros)`;
    } else if (exportPeriod === 'ALL') {
      targetEntries = userFinancial;
      periodText = 'Todo o Histórico';
    } else if (exportPeriod === 'THIS_MONTH') {
      targetEntries = userFinancial.filter(f => (f.dueDate && f.dueDate.startsWith(currentMonthPrefix)) || (f.paymentDate && f.paymentDate.startsWith(currentMonthPrefix)));
      periodText = `Mês Atual (${currentMonthPrefix})`;
    } else if (exportPeriod === 'THIS_YEAR') {
      targetEntries = userFinancial.filter(f => (f.dueDate && f.dueDate.startsWith(currentYearPrefix)) || (f.paymentDate && f.paymentDate.startsWith(currentYearPrefix)));
      periodText = `Ano Atual (${currentYearPrefix})`;
    }

    if (targetEntries.length === 0) {
      showToast('Não há lançamentos financeiros no período selecionado para exportação.', 'warning');
      return;
    }

    setIsExporting(true);
    try {
      const res = await exportFinancialSheet({
        entries: targetEntries,
        clients,
        cases,
        lawyers,
        currentUser,
        periodLabel: periodText,
        format: exportFormat
      });

      showToast(`Planilha ${res.filename} exportada com sucesso!`, 'success');
      setIsExportModalOpen(false);
    } catch (err: any) {
      showToast(err?.message || 'Erro ao gerar o arquivo de planilha financeira.', 'error');
    } finally {
      setIsExporting(false);
    }
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#EAE0DA] hover:bg-white text-dex-navy-950 text-xs font-semibold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer font-serif"
            title="Exportar planilha financeira em formato XLSX ou CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-dex-slate-dark stroke-[2]" />
            <span>Exportar planilha</span>
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-dex-coral hover:bg-dex-coral-hover text-white text-xs font-semibold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer font-serif"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Novo Lançamento</span>
          </button>
        </div>
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

      {/* MODAL DE EXPORTAÇÃO DE PLANILHA (.XLSX / .CSV) */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-dex-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dex-peach rounded-[28px] max-w-lg w-full p-6 sm:p-8 border border-[#D5B093] shadow-2xl relative font-serif text-dex-navy-950">
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-dex-support hover:text-dex-navy-950 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-dex-slate-dark/15 text-dex-slate-dark flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-dex-slate-dark" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-dex-navy-950">
                  Exportar Planilha Financeira
                </h3>
                <p className="text-xs text-dex-support italic">
                  Gere relatórios tabulares em Excel ou CSV com total proteção contra injeção de fórmulas
                </p>
              </div>
            </div>

            <div className="space-y-4 my-6">
              {/* Formato de Arquivo */}
              <div className="space-y-1.5">
                <label className="block text-xs font-serif italic text-dex-navy-950 font-medium">
                  Formato do Arquivo
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExportFormat('xlsx')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      exportFormat === 'xlsx'
                        ? 'bg-dex-slate-dark text-white border-dex-slate-dark shadow-sm'
                        : 'bg-dex-input text-dex-navy-950 border-transparent hover:bg-white/80'
                    }`}
                  >
                    <div className="text-xs font-bold">Pasta de Trabalho Excel (.xlsx)</div>
                    <div className="text-[10px] opacity-80 mt-0.5">Abas "Lançamentos" e "Resumo" com fórmulas e cabeçalho congelado</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat('csv')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      exportFormat === 'csv'
                        ? 'bg-dex-slate-dark text-white border-dex-slate-dark shadow-sm'
                        : 'bg-dex-input text-dex-navy-950 border-transparent hover:bg-white/80'
                    }`}
                  >
                    <div className="text-xs font-bold">Arquivo CSV (.csv)</div>
                    <div className="text-[10px] opacity-80 mt-0.5">Compatível com Excel Brasil (UTF-8 com BOM e separador ;)</div>
                  </button>
                </div>
              </div>

              {/* Período / Escopo de Registros */}
              <div className="space-y-1.5">
                <label className="block text-xs font-serif italic text-dex-navy-950 font-medium">
                  Período / Seleção de Lançamentos
                </label>
                <select
                  value={exportPeriod}
                  onChange={(e) => setExportPeriod(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-slate-dark shadow-inner"
                >
                  <option value="CURRENT_FILTER">Filtro atual da tela ({filteredFinancial.length} registros)</option>
                  <option value="ALL">Todo o histórico do escritório ({userFinancial.length} registros)</option>
                  <option value="THIS_MONTH">Mês atual</option>
                  <option value="THIS_YEAR">Ano atual</option>
                </select>
              </div>

              {/* Nota de Segurança e Proteção de Fórmulas */}
              <div className="p-3 bg-[#FAF0E6] rounded-xl border border-[#D5B093]/70 text-[11px] text-dex-support italic">
                <strong>Proteção Forense:</strong> Os valores numéricos são exportados em formato monetário nativo R$ e todas as células de texto passam por sanitização contra injeção de fórmulas.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#35474B]/20">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 text-xs text-dex-support hover:text-dex-navy-950 cursor-pointer italic"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteExport}
                disabled={isExporting}
                className="px-6 py-2.5 bg-dex-slate-dark hover:bg-dex-slate-darkHover text-white text-xs font-semibold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gerando arquivo...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Baixar Planilha ({exportFormat.toUpperCase()})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
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
