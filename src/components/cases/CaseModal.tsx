import React, { useState, useEffect } from 'react';
import { FolderPlus, Scale, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { LegalCase, LegalArea, CaseStatus } from '../../types';
import { useData } from '../../context/DataContext';

interface CaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseToEdit?: LegalCase | null;
  initialCase?: LegalCase | null;
}

export const CaseModal: React.FC<CaseModalProps> = ({
  isOpen,
  onClose,
  caseToEdit,
  initialCase
}) => {
  const activeCase = caseToEdit || initialCase || null;
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
    if (activeCase) {
      setCaseNumber(activeCase.caseNumber);
      setCourt(activeCase.court);
      setClientId(activeCase.clientId);
      setLawyerId(activeCase.lawyerId);
      setLegalArea(activeCase.legalArea);
      setActionType(activeCase.actionType);
      setStatus(activeCase.status);
      setValue(activeCase.value.toString());
      setDistributionDate(activeCase.distributionDate);
      setDescription(activeCase.description);
      setNotes(activeCase.notes || '');
    } else if (pendingAiDraft) {
      const randomCNJ = `10${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(10 + Math.random() * 89)}.2026.8.26.0100`;
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
  }, [activeCase, pendingAiDraft, isOpen, clients, lawyers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!caseNumber.trim() || !clientId || !lawyerId || !actionType.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
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

    if (activeCase) {
      updateCase(activeCase.id, payload);
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
      title={activeCase ? 'Editar Processo Forense' : 'Distribuir Novo Processo'}
      subtitle={activeCase ? 'Atualize os dados e fases processuais' : 'Cadastre a ação no padrão CNJ do escritório'}
      maxWidth="3xl"
      icon={<FolderPlus className="w-5 h-5 text-dex-coral" />}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {pendingAiDraft && !activeCase && (
          <div className="p-3.5 rounded-2xl bg-white/10 border border-dex-coral/40 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-dex-coral shrink-0" />
            <span className="text-xs text-white leading-relaxed">
              Formulário pré-preenchido com base na triagem fática do <strong>Dex AI</strong>.
            </span>
          </div>
        )}

        {/* Linha 1: Número do Processo (CNJ) e Foro/Vara */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Número do Processo (CNJ)*
            </label>
            <input
              type="text"
              required
              placeholder="0000000-00.2026.8.26.0000"
              value={caseNumber}
              onChange={e => setCaseNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-coral font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Comarca / Vara / Foro
            </label>
            <input
              type="text"
              placeholder="Ex: 2ª Vara Cível de Curitiba/PR"
              value={court}
              onChange={e => setCourt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>
        </div>

        {/* Linha 2: Tipo de Ação e Área do Direito */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Classe / Tipo de Ação*
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Ação de Cobrança c/c Danos Morais"
              value={actionType}
              onChange={e => setActionType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Área do Direito*
            </label>
            <select
              value={legalArea}
              onChange={e => setLegalArea(e.target.value as LegalArea)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            >
              {legalAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Linha 3: Cliente e Advogado Responsável */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Cliente Outorgante*
            </label>
            <select
              required
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.document})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Advogado Responsável*
            </label>
            <select
              required
              value={lawyerId}
              onChange={e => setLawyerId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            >
              {lawyers.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.oab})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Linha 4: Fase Processual, Valor da Causa e Data de Distribuição */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Fase Processual*
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as CaseStatus)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            >
              <option value="INICIAL">Fase Inicial</option>
              <option value="INSTRUCAO">Instrução Probatória</option>
              <option value="SENTENCA">Sentenciado</option>
              <option value="RECURSAL">Fase Recursal</option>
              <option value="EXECUCAO">Execução / Cumprimento</option>
              <option value="ACORDO">Acordo</option>
              <option value="ARQUIVADO">Arquivado</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Valor da Causa (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={value}
              onChange={e => setValue(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Data de Distribuição
            </label>
            <input
              type="date"
              value={distributionDate}
              onChange={e => setDistributionDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>
        </div>

        {/* Linha 5: Síntese dos Fatos e Notas */}
        <div className="space-y-1">
          <label className="block text-xs italic font-serif text-[#C2D6DC]">
            Síntese dos Fatos / Resumo Inicial
          </label>
          <textarea
            rows={3}
            placeholder="Descreva resumidamente a demanda fática..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs italic font-serif text-[#C2D6DC]">
            Anotações Internas da Banca
          </label>
          <textarea
            rows={2}
            placeholder="Estratégia processual, testemunhas a arrolar, teses..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#214154]/70">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-dex-coral hover:bg-dex-coral-hover text-white text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            {activeCase ? 'Salvar Alterações' : 'Distribuir Processo'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
