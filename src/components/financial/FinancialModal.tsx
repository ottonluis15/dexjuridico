import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Upload, FileText, Image as ImageIcon, Trash2, Paperclip, AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { FinancialEntry, FinancialType, FinancialStatus, PaymentMethod } from '../../types';
import { useData } from '../../context/DataContext';

interface FinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: FinancialEntry | null;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

function sanitizeFileName(fileName: string): string {
  const parts = fileName.split('.');
  const ext = parts.length > 1 ? `.${parts.pop()?.toLowerCase()}` : '';
  const base = parts.join('.').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  return `${base || 'comprovante'}${ext}`;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const FinancialModal: React.FC<FinancialModalProps> = ({
  isOpen,
  onClose,
  entryToEdit
}) => {
  const { clients, cases, lawyers, addFinancial, updateFinancial } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Comprovante
  const [hasReceipt, setHasReceipt] = useState(false);
  const [receiptName, setReceiptName] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [receiptType, setReceiptType] = useState<string>('');
  const [receiptSize, setReceiptSize] = useState<number>(0);
  const [fileError, setFileError] = useState<string | null>(null);

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
      setReceiptUrl(entryToEdit.receiptUrl || '');
      setReceiptType(entryToEdit.receiptType || '');
      setReceiptSize(entryToEdit.receiptSize || 0);
      setFileError(null);
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
      setReceiptUrl('');
      setReceiptType('');
      setReceiptSize(0);
      setFileError(null);
    }
  }, [entryToEdit, isOpen, clients, cases, lawyers]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de tamanho
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`O arquivo excede o limite máximo de 10 MB (${formatFileSize(file.size)}).`);
      return;
    }

    // Validação de tipo MIME e extensão
    const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const isValidMime = ALLOWED_MIME_TYPES.includes(file.type);
    const isValidExt = ALLOWED_EXTENSIONS.includes(ext);

    if (!isValidMime && !isValidExt) {
      setFileError('Formato inválido. Envie apenas arquivos PDF, JPG, PNG ou WEBP.');
      return;
    }

    const sanitized = sanitizeFileName(file.name);
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      setReceiptUrl(result);
      setReceiptName(sanitized);
      setReceiptType(file.type || 'application/octet-stream');
      setReceiptSize(file.size);
      setHasReceipt(true);
      setFileError(null);
    };

    reader.onerror = () => {
      setFileError('Erro ao ler o arquivo selecionado. Tente novamente.');
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveReceipt = () => {
    setHasReceipt(false);
    setReceiptName('');
    setReceiptUrl('');
    setReceiptType('');
    setReceiptSize(0);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
      hasReceipt: hasReceipt && !!receiptName,
      receiptName: hasReceipt && receiptName ? receiptName : undefined,
      receiptUrl: hasReceipt && receiptUrl ? receiptUrl : undefined,
      receiptType: hasReceipt && receiptType ? receiptType : undefined,
      receiptSize: hasReceipt && receiptSize ? receiptSize : undefined,
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
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-emerald-400" />
              Comprovante de Pagamento / Recibo
            </span>
            <span className="text-[10px] text-slate-400 font-mono">PDF, JPG, PNG, WEBP (Máx. 10 MB)</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {hasReceipt && (receiptUrl || receiptName) ? (
            <div className="flex items-center justify-between p-3 bg-slate-800/90 border border-emerald-500/30 rounded-xl">
              <div className="flex items-center gap-3 overflow-hidden">
                {receiptType.startsWith('image/') || receiptName.match(/\.(png|jpe?g|webp)$/i) ? (
                  receiptUrl ? (
                    <img
                      src={receiptUrl}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded-lg border border-slate-700 bg-slate-900"
                    />
                  ) : (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )
                ) : (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate max-w-[280px]" title={receiptName}>
                    {receiptName}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {receiptSize ? formatFileSize(receiptSize) : 'Comprovante anexado'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Substituir
                </button>
                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  title="Remover comprovante"
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-800/30 hover:bg-slate-800/60 transition-all rounded-xl p-4 text-center cursor-pointer group"
            >
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 mx-auto mb-1.5 transition-colors" />
              <p className="text-xs text-slate-300 font-medium">
                Clique para selecionar o comprovante do computador
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Formatos aceitos: PDF, JPG, PNG ou WEBP até 10 MB
              </p>
            </div>
          )}

          {fileError && (
            <div className="flex items-center gap-2 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{fileError}</span>
            </div>
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
