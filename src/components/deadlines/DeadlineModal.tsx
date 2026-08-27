import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Deadline, DeadlineType, DeadlinePriority, DeadlineStatus } from '../../types';
import { useData } from '../../context/DataContext';

interface DeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  deadlineToEdit?: Deadline | null;
  defaultCaseId?: string;
}

export const DeadlineModal: React.FC<DeadlineModalProps> = ({
  isOpen,
  onClose,
  deadlineToEdit,
  defaultCaseId
}) => {
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
    if (deadlineToEdit) {
      setCaseId(deadlineToEdit.caseId);
      setLawyerId(deadlineToEdit.lawyerId);
      setType(deadlineToEdit.type);
      setDescription(deadlineToEdit.description);
      setDueDate(deadlineToEdit.dueDate);
      setDueTime(deadlineToEdit.dueTime || '23:59');
      setPriority(deadlineToEdit.priority);
      setStatus(deadlineToEdit.status);
      setNotes(deadlineToEdit.notes || '');
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
  }, [deadlineToEdit, defaultCaseId, isOpen, cases, lawyers]);

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

    if (deadlineToEdit) {
      updateDeadline(deadlineToEdit.id, payload);
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
      title={deadlineToEdit ? 'Editar Prazo / Audiência' : 'Novo Prazo ou Audiência'}
      subtitle="Definição de prazo fatal ou ato processual vinculante"
      maxWidth="2xl"
      icon={<Clock className="w-5 h-5 text-amber-400" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Processo Vinculado */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Processo Vinculado *
          </label>
          <select
            required
            value={caseId}
            onChange={e => setCaseId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 font-mono"
          >
            <option value="" disabled>Selecione o processo...</option>
            {cases.map(c => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} - {c.actionType}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tipo de Ato */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tipo de Ato / Prazo *
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as DeadlineType)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              {deadlineTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Advogado Responsável */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Responsável pelo Cumprimento *
            </label>
            <select
              required
              value={lawyerId}
              onChange={e => setLawyerId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="" disabled>Selecione o advogado...</option>
              {lawyers.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.oab})</option>
              ))}
            </select>
          </div>

          {/* Data Fatal */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Data de Vencimento Fatal *
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          {/* Horário Limite */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Horário Limite (Tribunal)
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          {/* Nível de Prioridade */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nível de Urgência / Prioridade
            </label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as DeadlinePriority)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="CRITICAL">🚨 Crítico (Risco de Preclusão Fatal)</option>
              <option value="HIGH">⚠️ Alta (Urgente)</option>
              <option value="MEDIUM">⏳ Média</option>
              <option value="NORMAL">✅ Normal</option>
            </select>
          </div>

          {/* Situação */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Situação do Prazo
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as DeadlineStatus)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="PENDING">Pendente</option>
              <option value="COMPLETED">Concluído / Protocolado</option>
              <option value="OVERDUE">Vencido</option>
            </select>
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Descrição do Ato / Instruções *
          </label>
          <textarea
            required
            rows={3}
            placeholder="Descreva o ato a ser praticado (ex: protocolar manifestação aos quesitos periciais)..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>

        {/* Notas */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Observações / Links (ex: link de sala de audiência Zoom/Teams)
          </label>
          <input
            type="text"
            placeholder="Observações complementares..."
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
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition-all"
          >
            {deadlineToEdit ? 'Salvar Alterações' : 'Agendar Prazo'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
