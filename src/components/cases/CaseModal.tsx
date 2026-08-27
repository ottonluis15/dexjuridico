import React, { useState, useEffect } from 'react';
import { FolderPlus, Scale, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { LegalCase, LegalArea, CaseStatus } from '../../types';
import { useData } from '../../context/DataContext';

interface CaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseToEdit?: LegalCase | null;
}

export const CaseModal: React.FC<CaseModalProps> = ({
  isOpen,
  onClose,
  caseToEdit
}) => {
  const { clients, lawyers, addCase, updateCase, pendingAiDraft, clearPendingAiDraft } = useData();

  const [caseNumber, setCaseNumber] = useState('');
  const [court, setCourt] = useState('');
  const [clientId, setClientId] = useState('');
  const [lawyerId, setLawyerId] = useState('');
  const [legalArea, setLegalArea] = useState<LegalArea>('Cível');
  const [actionType, setActionType] = useState('');
  const [status, setStatus] = useState<CaseStatus>('INICIAL');
  const [value, setValue] = useState<string>('0');
  const [distributionDate, setDistributionDate] = useState(new Date().toISOString().substring(0, 10));
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  // Pre-fill form when editing or when coming from Dex AI
  useEffect(() => {
    if (caseToEdit) {
      setCaseNumber(caseToEdit.caseNumber);
      setCourt(caseToEdit.court);
      setClientId(caseToEdit.clientId);
      setLawyerId(caseToEdit.lawyerId);
      setLegalArea(caseToEdit.legalArea);
      setActionType(caseToEdit.actionType);
      setStatus(caseToEdit.status);
      setValue(caseToEdit.value.toString());
      setDistributionDate(caseToEdit.distributionDate);
      setDescription(caseToEdit.description);
      setNotes(caseToEdit.notes || '');
    } else if (pendingAiDraft) {
      // Pre-fill from Dex AI analysis!
      const randomCNJ = `10${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(10 + Math.random() * 89)}.2024.8.26.0100`;
      setCaseNumber(randomCNJ);
      setLegalArea(pendingAiDraft.analysis.suggestedLegalArea);
      setActionType(pendingAiDraft.analysis.suggestedActionType);
      setValue((pendingAiDraft.analysis.estimatedValue || 50000).toString());
      setDescription(pendingAiDraft.analysis.factsSummary);
      setNotes(`[Triagem Dex AI]\nEnquadramento: ${pendingAiDraft.analysis.legalFraming}\n\nPerguntas pendentes:\n- ${pendingAiDraft.analysis.clarificationQuestions.join('\n- ')}`);
      setCourt('Foro Central da Comarca da Capital / SP');
      if (clients.length > 0) setClientId(clients[0].id);
      if (lawyers.length > 0) setLawyerId(lawyers[0].id);
    } else {
      // Clean form
      setCaseNumber('');
      setCourt('');
      setClientId(clients[0]?.id || '');
      setLawyerId(lawyers[0]?.id || '');
      setLegalArea('Cível');
      setActionType('');
      setStatus('INICIAL');
      setValue('50000');
      setDistributionDate(new Date().toISOString().substring(0, 10));
      setDescription('');
      setNotes('');
    }
  }, [caseToEdit, pendingAiDraft, isOpen, clients, lawyers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!caseNumber.trim() || !clientId || !lawyerId || !actionType.trim()) {
      alert('Por favor, preencha os campos obrigatórios (*).');
      return;
    }

    const payload = {
      caseNumber: caseNumber.trim(),
      court: court.trim() || 'Vara Cível / Especializada',
      clientId,
      lawyerId,
      legalArea,
      actionType: actionType.trim(),
      status,
      value: parseFloat(value) || 0,
      distributionDate,
      description: description.trim(),
      notes: notes.trim()
    };

    if (caseToEdit) {
      updateCase(caseToEdit.id, payload);
    } else {
      addCase(payload);
      if (pendingAiDraft) {
        clearPendingAiDraft();
      }
    }

    onClose();
  };

  const legalAreas: LegalArea[] = [
    'Trabalhista',
    'Cível',
    'Tributário',
    'Família e Sucessões',
    'Penal',
    'Empresarial',
    'Previdenciário',
    'Consumidor',
    'Imobiliário'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={caseToEdit ? 'Editar Processo' : 'Novo Processo'}
      subtitle={caseToEdit ? `Alterando processo nº ${caseToEdit.caseNumber}` : 'Cadastro de nova demanda judicial ou contenciosa'}
      maxWidth="3xl"
      icon={<FolderPlus className="w-5 h-5 text-brand-400" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {pendingAiDraft && !caseToEdit && (
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Campos pré-preenchidos a partir da análise do <strong>Dex AI</strong>. Revise antes de salvar.</span>
            </div>
            <button
              type="button"
              onClick={clearPendingAiDraft}
              className="text-cyan-400 hover:text-white underline text-[11px] shrink-0"
            >
              Descartar pré-preenchimento
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Número do Processo (CNJ) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Número do Processo (CNJ) *
            </label>
            <input
              type="text"
              required
              placeholder="0000000-00.0000.0.00.0000"
              value={caseNumber}
              onChange={e => setCaseNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          {/* Tribunal / Vara */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tribunal / Vara / Foro
            </label>
            <input
              type="text"
              placeholder="Ex: 32ª Vara Cível do Foro Central de São Paulo"
              value={court}
              onChange={e => setCourt(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          {/* Cliente Vinculado */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cliente Vinculado *
            </label>
            <select
              required
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="" disabled>Selecione o cliente...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.type} - {client.document})
                </option>
              ))}
            </select>
          </div>

          {/* Advogado Responsável */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Advogado Responsável *
            </label>
            <select
              required
              value={lawyerId}
              onChange={e => setLawyerId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="" disabled>Selecione o advogado...</option>
              {lawyers.map(lawyer => (
                <option key={lawyer.id} value={lawyer.id}>
                  {lawyer.name} (OAB: {lawyer.oab})
                </option>
              ))}
            </select>
          </div>

          {/* Área Jurídica */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Área Jurídica *
            </label>
            <select
              value={legalArea}
              onChange={e => setLegalArea(e.target.value as LegalArea)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              {legalAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          {/* Tipo de Ação */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tipo de Ação / Peça *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Reclamatória Trabalhista, Cobrança, Divórcio"
              value={actionType}
              onChange={e => setActionType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          {/* Fase / Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Fase Processual / Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as CaseStatus)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="INICIAL">Fase Inicial</option>
              <option value="INSTRUCAO">Instrução Probatória</option>
              <option value="SENTENCA">Fase de Sentença</option>
              <option value="RECURSAL">Grau Recursal</option>
              <option value="EXECUCAO">Execução de Sentença</option>
              <option value="ACORDO">Acordo Homologado</option>
              <option value="ARQUIVADO">Arquivado</option>
            </select>
          </div>

          {/* Valor da Causa */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Valor da Causa (R$)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={value}
              onChange={e => setValue(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>
        </div>

        {/* Data de Distribuição */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Data de Distribuição
          </label>
          <input
            type="date"
            value={distributionDate}
            onChange={e => setDistributionDate(e.target.value)}
            className="w-full sm:w-1/2 px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>

        {/* Descrição dos Fatos */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Descrição dos Fatos / Objeto da Ação
          </label>
          <textarea
            rows={3}
            placeholder="Resumo dos fatos, pretensão jurídica e pedidos principais..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>

        {/* Observações Internas */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Anotações Estratégicas e Observações Internas
          </label>
          <textarea
            rows={2}
            placeholder="Estratégia processual, instruções confidenciais..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all"
          >
            {caseToEdit ? 'Salvar Alterações' : 'Cadastrar Processo'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
