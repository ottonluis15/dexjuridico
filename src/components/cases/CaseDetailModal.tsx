import React, { useState } from 'react';
import { 
  FolderKanban, 
  User, 
  Calendar, 
  DollarSign, 
  Scale, 
  Clock, 
  FileText, 
  CheckCircle2,
  FileCheck,
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
      icon={<FolderKanban className="w-5 h-5 text-dex-coral" />}
    >
      <div className="space-y-6">
        {/* Header Badges & Quick Stats */}
        <div className="p-4 rounded-2xl bg-[#1A3342] border border-[#214154] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-white bg-dex-navy-950 px-3 py-1 rounded-xl border border-white/10">
              {caseItem.caseNumber}
            </span>
            <CaseStatusBadge status={caseItem.status} />
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/15">
              {caseItem.legalArea}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 px-4 py-2 bg-dex-coral hover:bg-dex-coral-hover text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Editar Processo
              </button>
            )}
            <div className="text-right">
              <span className="text-[10px] text-[#A6C5CD] block">Valor da Causa:</span>
              <span className="text-base font-display font-bold text-white">{formatCurrency(caseItem.value)}</span>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex border-b border-[#214154] gap-2">
          <button
            onClick={() => setActiveSubTab('info')}
            className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'info'
                ? 'border-dex-coral text-white'
                : 'border-transparent text-[#A6C5CD] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Visão Geral & Fatos
          </button>
          <button
            onClick={() => setActiveSubTab('deadlines')}
            className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'deadlines'
                ? 'border-dex-coral text-white'
                : 'border-transparent text-[#A6C5CD] hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Prazos ({caseDeadlines.length})
          </button>
          <button
            onClick={() => setActiveSubTab('documents')}
            className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'documents'
                ? 'border-dex-coral text-white'
                : 'border-transparent text-[#A6C5CD] hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Documentos ({caseDocs.length})
          </button>
          <button
            onClick={() => setActiveSubTab('financial')}
            className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'financial'
                ? 'border-dex-coral text-white'
                : 'border-transparent text-[#A6C5CD] hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Financeiro ({caseFinancial.length})
          </button>
        </div>

        {/* Sub-tab 1: Informações Gerais */}
        {activeSubTab === 'info' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#1A3342]/70 border border-[#214154] space-y-1">
                <span className="text-[11px] text-[#A6C5CD] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-dex-coral" />
                  Cliente Outorgante
                </span>
                <p className="text-sm font-bold text-white">{client?.name || 'Não vinculado'}</p>
                <p className="text-xs text-[#C2D6DC]">{client?.document || '-'} • {client?.phone || '-'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1A3342]/70 border border-[#214154] space-y-1">
                <span className="text-[11px] text-[#A6C5CD] flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-dex-teal" />
                  Advogado Conducente
                </span>
                <p className="text-sm font-bold text-white">{lawyer?.name || 'Não atribuído'}</p>
                <p className="text-xs text-[#C2D6DC]">{lawyer?.oab || '-'} • {lawyer?.email || '-'}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1A3342]/70 border border-[#214154] space-y-1">
              <span className="text-[11px] text-[#A6C5CD] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#C48A5C]" />
                Juízo / Foro / Vara
              </span>
              <p className="text-xs text-white">{caseItem.court || 'Vara Cível / Especializada'}</p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A6C5CD]">
                Síntese dos Fatos
              </span>
              <div className="p-4 rounded-2xl bg-white/5 border border-[#214154] text-xs text-[#EAE0DA] leading-relaxed">
                {caseItem.description || 'Nenhuma síntese cadastrada para este processo.'}
              </div>
            </div>

            {caseItem.notes && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A6C5CD]">
                  Anotações da Banca & Triagem IA
                </span>
                <div className="p-4 rounded-2xl bg-white/5 border border-[#214154] text-xs text-[#EAE0DA] leading-relaxed whitespace-pre-line">
                  {caseItem.notes}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sub-tab 2: Prazos do Processo */}
        {activeSubTab === 'deadlines' && (
          <div className="space-y-3">
            {caseDeadlines.length === 0 ? (
              <p className="text-center py-8 text-xs text-[#A6C5CD]">
                Nenhum prazo cadastrado para este processo.
              </p>
            ) : (
              caseDeadlines.map(d => (
                <div
                  key={d.id}
                  className="p-3.5 rounded-2xl bg-[#1A3342] border border-[#214154] flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <DeadlineStatusBadge status={d.status} dueDate={d.dueDate} />
                      <PriorityBadge priority={d.priority} />
                      <span className="text-xs font-bold text-white">{d.dueDate}</span>
                    </div>
                    <p className="text-xs text-white">{d.description}</p>
                  </div>
                  <button
                    onClick={() => toggleDeadlineStatus(d.id)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-white text-[#A6C5CD] transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Sub-tab 3: Documentos */}
        {activeSubTab === 'documents' && (
          <div className="space-y-3">
            {caseDocs.length === 0 ? (
              <p className="text-center py-8 text-xs text-[#A6C5CD]">
                Nenhum documento anexado a este processo.
              </p>
            ) : (
              caseDocs.map(doc => (
                <div
                  key={doc.id}
                  className="p-3 rounded-2xl bg-[#1A3342] border border-[#214154] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-dex-coral" />
                    <div>
                      <p className="text-xs font-bold text-white">{doc.name}</p>
                      <span className="text-[10px] text-[#A6C5CD]">{doc.category}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Sub-tab 4: Financeiro */}
        {activeSubTab === 'financial' && (
          <div className="space-y-3">
            {caseFinancial.length === 0 ? (
              <p className="text-center py-8 text-xs text-[#A6C5CD]">
                Nenhum lançamento financeiro vinculado a este processo.
              </p>
            ) : (
              caseFinancial.map(f => (
                <div
                  key={f.id}
                  className="p-3.5 rounded-2xl bg-[#1A3342] border border-[#214154] flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FinancialStatusBadge status={f.status} />
                      <span className="text-xs text-[#A6C5CD]">{f.dueDate}</span>
                    </div>
                    <p className="text-xs font-bold text-white">{f.title}</p>
                  </div>
                  <span className={`text-sm font-bold ${f.type !== 'DESPESA' && f.type !== 'CUSTAS' ? 'text-[#48BB78]' : 'text-dex-coral'}`}>
                    {f.type !== 'DESPESA' && f.type !== 'CUSTAS' ? '+' : '-'} {formatCurrency(f.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
