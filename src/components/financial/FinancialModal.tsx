import React, { useState, useEffect } from 'react';
import { DollarSign, FileCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import { FinancialEntry, FinancialType, FinancialStatus, PaymentMethod } from '../../types';
import { useData } from '../../context/DataContext';

interface FinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: FinancialEntry | null;
}

export const FinancialModal: React.FC<FinancialModalProps> = ({
  isOpen,
  onClose,
  entryToEdit
}) => {
  const { clients, cases, lawyers, addFinancial, updateFinancial } = useData();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<FinancialType>('HONORARIOS_INICIAIS');
  const [clientId, setClientId] = useState('');
  const [caseId, setCaseId] = useState('');
  const [lawyerId, setLawyerId] = useState('');
  const [amount, setAmount] = useState<string>('1500');
  const [dueDate, setDueDate] = useState(new Date().toISOString().substring(0, 10));
  const [paymentDate, setPaymentDate] = useState('');
  const [status, setStatus] = useState<FinancialStatus>('PENDENTE');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [description, setDescription] = useState('');
  const [hasReceipt, setHasReceipt] = useState(false);
  const [receiptName, setReceiptName] = useState('');

  useEffect(() => {
    if (entryToEdit) {
      setTitle(entryToEdit.title);
      setType(entryToEdit.type);
      setClientId(entryToEdit.clientId);
      setCaseId(entryToEdit.caseId || '');
      setLawyerId(entryToEdit.lawyerId || '');
      setAmount(entryToEdit.amount.toString());
      setDueDate(entryToEdit.dueDate);
      setPaymentDate(entryToEdit.paymentDate || '');
      setStatus(entryToEdit.status);
      setPaymentMethod(entryToEdit.paymentMethod);
      setDescription(entryToEdit.description || '');
      setHasReceipt(!!entryToEdit.hasReceipt);
      setReceiptName(entryToEdit.receiptName || '');
    } else {
      setTitle('');
      setType('HONORARIOS_INICIAIS');
      setClientId(clients[0]?.id || '');
      setCaseId(cases[0]?.id || '');
      setLawyerId(lawyers[0]?.id || '');
      setAmount('2500');
      setDueDate(new Date().toISOString().substring(0, 10));
      setPaymentDate('');
      setStatus('PENDENTE');
      setPaymentMethod('PIX');
      setDescription('');
      setHasReceipt(false);
      setReceiptName('');
    }
  }, [entryToEdit, isOpen, clients, cases, lawyers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !clientId || !amount || !dueDate) {
      alert('Por favor, preencha os campos obrigatórios (*).');
      return;
    }

    const payload = {
      title: title.trim(),
      type,
      clientId,
      caseId: caseId || undefined,
      lawyerId: lawyerId || undefined,
      amount: parseFloat(amount) || 0,
      dueDate,
      paymentDate: status === 'PAGO' ? (paymentDate || new Date().toISOString().substring(0, 10)) : undefined,
      status,
      paymentMethod,
      description: description.trim(),
      hasReceipt,
      receiptName: hasReceipt ? (receiptName.trim() || 'comprovante_anexo.pdf') : undefined
    };

    if (entryToEdit) {
      updateFinancial(entryToEdit.id, payload);
    } else {
      addFinancial(payload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={entryToEdit ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}
      subtitle="Registro de honorários advocatícios, custas ou despesas processuais"
      maxWidth="2xl"
      icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título & Tipo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Título do Lançamento *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Honorários Iniciais - 1ª Parcela"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tipo de Entrada *
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as FinancialType)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="HONORARIOS_INICIAIS">Honorários Iniciais</option>
              <option value="HONORARIOS_EXITO">Honorários de Êxito</option>
              <option value="MENSALIDADE">Mensalidade (Retainer)</option>
              <option value="CUSTAS">Reembolso de Custas</option>
              <option value="DESPESA">Despesa Operacional</option>
            </select>
          </div>
        </div>

        {/* Cliente & Processo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cliente Pagador / Beneficiário *
            </label>
            <select
              required
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="" disabled>Selecione o cliente...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Processo Vinculado (Opcional)
            </label>
            <select
              value={caseId}
              onChange={e => setCaseId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
            >
              <option value="">Sem vínculo direto com processo</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>{c.caseNumber} ({c.actionType})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Valor, Vencimento, Status, Forma de Pagamento */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Valor (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-bold text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Data de Vencimento *
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Status *
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as FinancialStatus)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="PENDENTE">Pendente</option>
              <option value="PAGO">Pago</option>
              <option value="ATRASADO">Em Atraso</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Forma de Pagamento
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="PIX">PIX</option>
              <option value="BOLETO">Boleto Bancário</option>
              <option value="TRANSFERENCIA">Transferência / TED</option>
              <option value="CARTAO">Cartão de Crédito</option>
              <option value="DINHEIRO">Espécie</option>
            </select>
          </div>
        </div>

        {/* Comprovante */}
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hasReceipt}
              onChange={e => setHasReceipt(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500/40"
            />
            Anexar comprovante de pagamento / nota fiscal
          </label>
          {hasReceipt && (
            <input
              type="text"
              placeholder="Nome do arquivo (ex: comprovante_pix_liquidado.pdf)"
              value={receiptName}
              onChange={e => setReceiptName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
            />
          )}
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Observações / Descrição da Fatura
          </label>
          <textarea
            rows={2}
            placeholder="Detalhes adicionais sobre a contratação de honorários..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
          >
            {entryToEdit ? 'Salvar Alterações' : 'Registrar Lançamento'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
