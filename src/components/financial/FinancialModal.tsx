import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Upload, FileText, Image as ImageIcon, Trash2, Paperclip, AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { MaskedInput } from '../common/MaskedInput';
import { ClientCombobox } from '../clients/ClientCombobox';
import { FinancialEntry, FinancialType, FinancialStatus, PaymentMethod } from '../../types';
import { useData } from '../../context/DataContext';
import { maskCurrency, unmaskCurrencyToFloat } from '../../utils/masks';

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
  const { userClients, userCases, addFinancial, updateFinancial } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<FinancialType>('HONORARIOS_INICIAIS');
  const [clientId, setClientId] = useState('');
  const [caseId, setCaseId] = useState('');
  const [amount, setAmount] = useState<string>('R$ 0,00');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
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

  // Inicializa apenas ao abrir/trocar registro — NUNCA depende de userClients/userCases para preservar o formulário ao criar cliente
  useEffect(() => {
    if (!isOpen) return;
    if (activeEntry) {
      setTitle(activeEntry.title);
      setType(activeEntry.type);
      setClientId(activeEntry.clientId);
      setCaseId(activeEntry.caseId || '');
      setAmount(maskCurrency(activeEntry.amount));
      setDueDate(activeEntry.dueDate);
      setPaymentDate(activeEntry.paymentDate || '');
      setStatus(activeEntry.status);
      setPaymentMethod(activeEntry.paymentMethod);
      setDescription(activeEntry.description || '');
      setHasReceipt(!!activeEntry.hasReceipt);
      setReceiptName(activeEntry.receiptName || '');
      setReceiptUrl(activeEntry.receiptUrl || '');
    } else {
      setTitle('');
      setType('HONORARIOS_INICIAIS');
      setClientId(userClients[0]?.id || '');
      setCaseId(userCases[0]?.id || '');
      setAmount(maskCurrency(2500));
      setDueDate(new Date().toISOString().substring(0, 10));
      setPaymentDate('');
      setStatus('PENDENTE');
      setPaymentMethod('PIX');
      setDescription('');
      setHasReceipt(false);
      setReceiptName('');
      setReceiptUrl('');
    }
    setFileError(null);
    setAmountError(null);
    setClientError(null);
    setGeneralError(null);
  }, [activeEntry, isOpen]);

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
    setAmountError(null);
    setClientError(null);
    setGeneralError(null);

    const numericAmount = unmaskCurrencyToFloat(amount);
    if (numericAmount <= 0) {
      setAmountError('Informe um valor monetário positivo maior que zero.');
      return;
    }

    if (!clientId) {
      setClientError('Selecione um cliente vinculado ou adicione um novo cliente.');
      return;
    }

    if (!title.trim() || !dueDate) {
      setGeneralError('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    const payload = {
      title: title.trim(),
      type,
      clientId,
      caseId: caseId || undefined,
      amount: numericAmount,
      dueDate,
      paymentDate: status === 'PAGO' ? (paymentDate || dueDate) : undefined,
      status,
      paymentMethod,
      description: description.trim(),
      hasReceipt,
      receiptName: hasReceipt ? receiptName : undefined,
      receiptUrl: hasReceipt ? receiptUrl : undefined,
    };

    try {
      if (activeEntry) {
        updateFinancial(activeEntry.id, payload);
      } else {
        addFinancial(payload);
      }
      onClose();
    } catch (err: any) {
      setGeneralError(err?.message || 'Não foi possível salvar o lançamento financeiro.');
    }
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
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {generalError && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-500/20 border border-red-400/60 text-red-100 text-xs font-serif flex items-start gap-2.5"
          >
            <AlertTriangle className="w-4 h-4 text-red-300 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{generalError}</span>
          </div>
        )}
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
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-navy-950/50 focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
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

        {/* Linha 2: Cliente Vinculado (Combobox Pesquisável + Criar Novo Cliente) e Processo Vinculado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClientCombobox
            label="Cliente Vinculado"
            required
            value={clientId}
            onChange={(nextId) => {
              setClientId(nextId);
              if (clientError) setClientError(null);
            }}
            error={clientError}
            createContextNotice="O cliente será salvo na aba Clientes e já ficará vinculado a este lançamento financeiro (mesmo se você cancelar depois)."
          />

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
              {userCases.map(c => (
                <option key={c.id} value={c.id}>{c.caseNumber} - {c.actionType}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Linha 3: Valor, Vencimento e Método */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MaskedInput
            mask="currency"
            label="Valor Nominal (R$)"
            required
            value={amount}
            onChange={(formatted) => {
              setAmount(formatted);
              setAmountError(null);
            }}
            error={amountError}
            placeholder="R$ 0,00"
          />

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
