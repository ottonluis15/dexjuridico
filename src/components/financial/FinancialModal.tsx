import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Upload, FileText, Image as ImageIcon, Trash2, Paperclip, AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { FinancialEntry, FinancialType, FinancialStatus, PaymentMethod } from '../../types';
import { useData } from '../../context/DataContext';

interface FinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: FinancialEntry | null;
  initialEntry?: FinancialEntry | null;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

function sanitizeFileName(fileName: string): string {
  const parts = fileName.split('.');
  const ext = parts.length > 1 ? `.${parts.pop()?.toLowerCase()}` : '';
  const base = parts.join('.').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  return `${base || 'comprovante'}${ext}`;
}

export const FinancialModal: React.FC<FinancialModalProps> = ({
  isOpen,
  onClose,
  entryToEdit,
  initialEntry
}) => {
  const activeEntry = entryToEdit || initialEntry || null;
  const { clients, cases, lawyers, addFinancial, updateFinancial } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<FinancialType>('HONORARIOS_INICIAIS');
  const [clientId, setClientId] = useState('');
  const [caseId, setCaseId] = useState('');
  const [amount, setAmount] = useState<string>('2500');
  const [dueDate, setDueDate] = useState(new Date().toISOString().substring(0, 10));
  const [paymentDate, setPaymentDate] = useState('');
  const [status, setStatus] = useState<FinancialStatus>('PENDENTE');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [description, setDescription] = useState('');

  // Comprovante
  const [hasReceipt, setHasReceipt] = useState(false);
  const [receiptName, setReceiptName] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (activeEntry) {
      setTitle(activeEntry.title);
      setType(activeEntry.type);
      setClientId(activeEntry.clientId);
      setCaseId(activeEntry.caseId || '');
      setAmount(activeEntry.amount.toString());
      setDueDate(activeEntry.dueDate);
      setPaymentDate(activeEntry.paymentDate || '');
      setStatus(activeEntry.status);
      setPaymentMethod(activeEntry.paymentMethod);
      setDescription(activeEntry.description || '');
      setHasReceipt(!!activeEntry.hasReceipt);
      setReceiptName(activeEntry.receiptName || '');
      setReceiptUrl(activeEntry.receiptUrl || '');
      setFileError(null);
    } else {
      setTitle('');
      setType('HONORARIOS_INICIAIS');
      setClientId(clients[0]?.id || '');
      setCaseId(cases[0]?.id || '');
      setAmount('2500');
      setDueDate(new Date().toISOString().substring(0, 10));
      setPaymentDate('');
      setStatus('PENDENTE');
      setPaymentMethod('PIX');
      setDescription('');
      setHasReceipt(false);
      setReceiptName('');
      setReceiptUrl('');
      setFileError(null);
    }
  }, [activeEntry, isOpen, clients, cases]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setFileError('Arquivo muito grande. O limite máximo é de 10 MB.');
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setFileError('Tipo de arquivo não permitido. Use PDF, JPG, PNG ou WEBP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptUrl(reader.result as string);
      setReceiptName(sanitizeFileName(file.name));
      setHasReceipt(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !clientId || !amount || !dueDate) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    const payload = {
      title: title.trim(),
      type,
      clientId,
      caseId: caseId || undefined,
      amount: parseFloat(amount) || 0,
      dueDate,
      paymentDate: status === 'PAGO' ? (paymentDate || dueDate) : undefined,
      status,
      paymentMethod,
      description: description.trim(),
      hasReceipt,
      receiptName: hasReceipt ? receiptName : undefined,
      receiptUrl: hasReceipt ? receiptUrl : undefined,
    };

    if (activeEntry) {
      updateFinancial(activeEntry.id, payload);
    } else {
      addFinancial(payload);
    }

    onClose();
  };

  const isRevenue = type !== 'DESPESA' && type !== 'CUSTAS';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activeEntry ? 'Editar Lançamento Financeiro' : 'Novo Lançamento Financeiro'}
      subtitle={activeEntry ? 'Atualize os dados de honorários ou custas' : 'Registre receitas, honorários contratuais ou despesas do escritório'}
      maxWidth="3xl"
      icon={<DollarSign className="w-5 h-5 text-dex-coral" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo (Receita vs Despesa) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setType('HONORARIOS_INICIAIS')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isRevenue
                ? 'bg-[#48BB78] text-white shadow'
                : 'bg-white/10 text-[#C2D6DC] hover:text-white'
            }`}
          >
            Receita / Honorários (+)
          </button>
          <button
            type="button"
            onClick={() => setType('DESPESA')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              !isRevenue
                ? 'bg-dex-coral text-white shadow'
                : 'bg-white/10 text-[#C2D6DC] hover:text-white'
            }`}
          >
            Despesa / Custas (-)
          </button>
        </div>

        {/* Linha 1: Título e Categoria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Título do Lançamento*
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Honorários Contratuais - Parcela 1/3"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Tipo de Lançamento*
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as FinancialType)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            >
              <option value="HONORARIOS_INICIAIS">Honorários Iniciais</option>
              <option value="HONORARIOS_EXITO">Honorários de Êxito</option>
              <option value="MENSALIDADE">Mensalidade / Partido</option>
              <option value="CUSTAS">Custas Judiciais / Emolumentos</option>
              <option value="DESPESA">Despesas Administrativas</option>
            </select>
          </div>
        </div>

        {/* Linha 2: Cliente e Processo Vinculado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Cliente Vinculado*
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
              Processo Vinculado (Opcional)
            </label>
            <select
              value={caseId}
              onChange={e => setCaseId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            >
              <option value="">Sem vínculo direto</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>{c.caseNumber} - {c.actionType}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Linha 3: Valor, Vencimento e Método */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Valor Nominal (R$)*
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Data de Vencimento*
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
              Forma de Pagamento
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            >
              <option value="PIX">PIX</option>
              <option value="BOLETO">Boleto Bancário</option>
              <option value="TRANSFERENCIA">Transferência / TED</option>
              <option value="CARTAO">Cartão de Crédito</option>
              <option value="DINHEIRO">Espécie / Dinheiro</option>
            </select>
          </div>
        </div>

        {/* Linha 4: Status do Pagamento */}
        <div className="space-y-1">
          <label className="block text-xs italic font-serif text-[#C2D6DC]">
            Status do Lançamento
          </label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as FinancialStatus)}
            className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
          >
            <option value="PENDENTE">A Vencer / Em Aberto</option>
            <option value="PAGO">Liquidado / Pago</option>
            <option value="ATRASADO">Inadimplente / Em Atraso</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>

        {/* Comprovante de Pagamento */}
        <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
          <label className="block text-xs italic font-serif text-[#C2D6DC]">
            Comprovante / Recibo Anexo (PDF, JPG, PNG)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileUpload}
            className="hidden"
          />

          {hasReceipt ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/10 text-xs text-white">
              <div className="flex items-center gap-2 truncate">
                <Paperclip className="w-4 h-4 text-dex-coral shrink-0" />
                <span className="truncate">{receiptName}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setHasReceipt(false);
                  setReceiptUrl('');
                  setReceiptName('');
                }}
                className="p-1 hover:text-dex-coral text-[#A6C5CD] cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-xl border border-dashed border-white/20 hover:border-white/40 text-xs text-[#A6C5CD] hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Anexar Comprovante / Recibo</span>
            </button>
          )}
          {fileError && <p className="text-xs text-dex-coral">{fileError}</p>}
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
            {activeEntry ? 'Salvar Lançamento' : 'Registrar Lançamento'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
