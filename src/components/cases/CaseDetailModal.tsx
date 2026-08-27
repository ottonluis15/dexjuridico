import React, { useState } from 'react';
import { 
  FolderKanban, 
  User, 
  Calendar, 
  DollarSign, 
  Scale, 
  Clock, 
  FileText, 
  Plus, 
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  Building,
  Edit3
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { LegalCase } from '../../types';
import { useData } from '../../context/DataContext';
import { CaseStatusBadge, PriorityBadge, DeadlineStatusBadge, FinancialStatusBadge } from '../common/Badge';

interface CaseDetailModalProps {
  caseItem: LegalCase;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseItem,
  isOpen,
  onClose,
  onEdit
}) => {
  const { clients, lawyers, deadlines, financial, documents, toggleDeadlineStatus } = useData();
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'deadlines' | 'documents' | 'financial'>('info');

  const client = clients.find(c => c.id === caseItem.clientId);
  const lawyer = lawyers.find(l => l.id === caseItem.lawyerId);
  const caseDeadlines = deadlines.filter(d => d.caseId === caseItem.id);
  const caseDocs = documents.filter(d => d.caseId === caseItem.id);
  const caseFinancial = financial.filter(f => f.caseId === caseItem.id);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={caseItem.actionType}
      subtitle={`Processo CNJ: ${caseItem.caseNumber}`}
      maxWidth="4xl"
      icon={<FolderKanban className="w-5 h-5 text-brand-400" />}
    >
      <div className="space-y-6">
        {/* Header Badges & Quick Stats */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-white bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
              {caseItem.caseNumber}
            </span>
            <CaseStatusBadge status={caseItem.status} />
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {caseItem.legalArea}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Editar Processo
              </button>
            )}
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Valor da Causa:</span>
              <span className="text-sm font-bold text-emerald-400">{formatCurrency(caseItem.value)}</span>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveSubTab('info')}
            className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'info'
                ? 'border-brand-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Visão Geral & Fatos
          </button>
          <button
            onClick={() => setActiveSubTab('deadlines')}
            className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'deadlines'
                ? 'border-brand-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Prazos ({caseDeadlines.length})
          </button>
          <button
            onClick={() => setActiveSubTab('documents')}
            className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'documents'
                ? 'border-brand-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Documentos ({caseDocs.length})
          </button>
          <button
            onClick={() => setActiveSubTab('financial')}
            className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'financial'
                ? 'border-brand-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Financeiro ({caseFinancial.length})
          </button>
        </div>

        {/* Tab 1: Info */}
        {activeSubTab === 'info' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <User className="w-4 h-4 text-brand-400" />
                  Cliente Vinculado
                </div>
                <p className="text-sm font-bold text-white">{client?.name || 'Não identificado'}</p>
                <p className="text-xs text-slate-400">{client?.type}: {client?.document}</p>
                <p className="text-xs text-slate-400">{client?.phone} • {client?.email}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <Scale className="w-4 h-4 text-brand-400" />
                  Advogado Responsável
                </div>
                <p className="text-sm font-bold text-white">{lawyer?.name || 'Não identificado'}</p>
                <p className="text-xs text-slate-400">OAB: {lawyer?.oab}</p>
                <p className="text-xs text-slate-400">{lawyer?.roleTitle}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Building className="w-4 h-4 text-brand-400" />
                Juízo / Foro Competente
              </div>
              <p className="text-xs text-slate-200">{caseItem.court}</p>
              <p className="text-[11px] text-slate-400">Distribuído em: {caseItem.distributionDate}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-400">Resumo dos Fatos & Objeto da Ação</h4>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                {caseItem.description || 'Nenhum detalhe fático cadastrado.'}
              </p>
            </div>

            {caseItem.notes && (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-2">
                <h4 className="text-xs font-semibold text-amber-300">Anotações Internas & Estratégia</h4>
                <p className="text-xs text-amber-100 leading-relaxed whitespace-pre-line font-mono">
                  {caseItem.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Deadlines */}
        {activeSubTab === 'deadlines' && (
          <div className="space-y-3">
            {caseDeadlines.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Nenhum prazo cadastrado para este processo.</p>
            ) : (
              caseDeadlines.map(d => (
                <div key={d.id} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <DeadlineStatusBadge status={d.status} dueDate={d.dueDate} />
                      <PriorityBadge priority={d.priority} />
                    </div>
                    <h5 className="text-xs font-bold text-white">{d.type}</h5>
                    <p className="text-xs text-slate-300 mt-0.5">{d.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
                      Data fatal: <strong>{d.dueDate} {d.dueTime && `às ${d.dueTime}`}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => toggleDeadlineStatus(d.id)}
                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 rounded-xl transition-colors shrink-0"
                    title="Alternar conclusão"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Documents */}
        {activeSubTab === 'documents' && (
          <div className="space-y-3">
            {caseDocs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Nenhum documento anexado a este processo.</p>
            ) : (
              caseDocs.map(doc => (
                <div key={doc.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-400">{doc.category} • {(doc.fileSize / 1024).toFixed(1)} KB • {doc.createdAt}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Disponível</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Financial */}
        {activeSubTab === 'financial' && (
          <div className="space-y-3">
            {caseFinancial.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Nenhum lançamento financeiro vinculado a este processo.</p>
            ) : (
              caseFinancial.map(fin => (
                <div key={fin.id} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FinancialStatusBadge status={fin.status} />
                      <span className="text-xs font-semibold text-white">{fin.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Vencimento: {fin.dueDate} • Forma: {fin.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{formatCurrency(fin.amount)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
