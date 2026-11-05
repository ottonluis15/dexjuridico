import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Deadline, DeadlineType, DeadlinePriority, DeadlineStatus } from '../../types';
import { useData } from '../../context/DataContext';

interface DeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  deadlineToEdit?: Deadline | null;
  initialDeadline?: Deadline | null;
  defaultCaseId?: string;
}

export const DeadlineModal: React.FC<DeadlineModalProps> = ({
  isOpen,
  onClose,
  deadlineToEdit,
  initialDeadline,
  defaultCaseId
}) => {
  const activeDeadline = deadlineToEdit || initialDeadline || null;
  const { cases, lawyers, addDeadline, updateDeadline } = useData();

  const [caseId, setCaseId] = useState(defaultCaseId || '');
  const [lawyerId, setLawyerId] = useState('');
  const [type, setType] = useState<DeadlineType>('Petição Inicial');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().substring(0, 10));
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState<DeadlinePriority>('HIGH');
  const [status, setStatus] = useState<DeadlineStatus>('PENDING');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (activeDeadline) {
      setCaseId(activeDeadline.caseId);
      setLawyerId(activeDeadline.lawyerId);
      setType(activeDeadline.type);
      setDescription(activeDeadline.description);
      setDueDate(activeDeadline.dueDate);
      setDueTime(activeDeadline.dueTime || '23:59');
      setPriority(activeDeadline.priority);
      setStatus(activeDeadline.status);
      setNotes(activeDeadline.notes || '');
    } else {
      setCaseId(defaultCaseId || cases[0]?.id || '');
      setLawyerId(lawyers[0]?.id || '');
      setType('Petição Inicial');
      setDescription('');
      setDueDate(new Date().toISOString().substring(0, 10));
      setDueTime('23:59');
      setPriority('HIGH');
      setStatus('PENDING');
      setNotes('');
    }
  }, [activeDeadline, defaultCaseId, isOpen, cases, lawyers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!caseId || !lawyerId || !description.trim() || !dueDate) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    const payload = {
      caseId,
      lawyerId,
      type,
      description: description.trim(),
      dueDate,
      dueTime,
      priority,
      status,
      notes: notes.trim()
    };

    if (activeDeadline) {
      updateDeadline(activeDeadline.id, payload);
    } else {
      addDeadline(payload);
    }

    onClose();
  };

  const deadlineTypes: DeadlineType[] = [
    'Petição Inicial',
    'Contestação',
    'Réplica',
    'Recurso / Apelação',
    'Audiência de Conciliação',
    'Audiência de Instrução',
    'Manifestação',
    'Quesitos Periciais',
    'Cumprimento de Sentença',
    'Outros'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activeDeadline ? 'Editar Prazo Processual' : 'Agendar Novo Prazo / Audiência'}
      subtitle={activeDeadline ? 'Atualize o vencimento ou prioridade' : 'Cadastre um novo compromisso com alerta no dashboard'}
      maxWidth="2xl"
      icon={<Clock className="w-5 h-5 text-dex-coral" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Linha 1: Processo Vinculado e Advogado Responsável */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Processo Vinculado (CNJ)*
            </label>
            <select
              required
              value={caseId}
              onChange={e => setCaseId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            >
              {cases.map(c => (
                <option key={c.id} value={c.id}>{c.caseNumber} - {c.actionType}</option>
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

        {/* Linha 2: Tipo de Ato e Prioridade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Tipo de Ato Processual*
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as DeadlineType)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            >
              {deadlineTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Nível de Gravidade / Prioridade*
            </label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as DeadlinePriority)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            >
              <option value="CRITICAL">Crítica (Prazo Fatal / Revelia / Perempção)</option>
              <option value="HIGH">Alta (Urgência Iminente)</option>
              <option value="MEDIUM">Média (Rotina Forense)</option>
              <option value="NORMAL">Normal (Diligência Ordinária)</option>
            </select>
          </div>
        </div>

        {/* Linha 3: Data Fatal e Horário Limite */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Data Fatal de Vencimento*
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Horário Limite do Protocolo
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>
        </div>

        {/* Linha 4: Descrição do Prazo */}
        <div className="space-y-1">
          <label className="block text-xs italic font-serif text-[#C2D6DC]">
            Descrição do Compromisso*
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Protocolar razões de Apelação c/ pedido de efeito suspensivo"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
          />
        </div>

        {/* Observações */}
        <div className="space-y-1">
          <label className="block text-xs italic font-serif text-[#C2D6DC]">
            Observações e Instruções da Peça
          </label>
          <textarea
            rows={2}
            placeholder="Instruções para o advogado, pontos a destacar..."
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
            className="px-6 py-2.5 rounded-xl bg-dex-coral hover:bg-dex-coral-hover text-white text-xs font-bold shadow transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            {activeDeadline ? 'Salvar Prazo' : 'Agendar Prazo'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
