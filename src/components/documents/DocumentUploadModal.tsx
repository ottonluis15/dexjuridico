import React, { useState } from 'react';
import { FileUp, FileText, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { Modal } from '../common/Modal';
import { DocumentCategory } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCaseId?: string;
  defaultClientId?: string;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  defaultCaseId,
  defaultClientId
}) => {
  const { clients, cases, addDocument } = useData();
  const { currentUser } = useAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('PETICAO');
  const [clientId, setClientId] = useState(defaultClientId || '');
  const [caseId, setCaseId] = useState(defaultCaseId || '');
  const [isConfidential, setIsConfidential] = useState(true);
  const [fileSize, setFileSize] = useState<number>(1450000); // 1.45 MB
  const [fileType, setFileType] = useState('application/pdf');
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null);

  const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'];
  const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        setFileError(`Formato "${extension}" não suportado. Extensões permitidas: ${ALLOWED_EXTENSIONS.join(', ')}.`);
        return;
      }

      if (file.size > MAX_SIZE_BYTES) {
        setFileError(`Arquivo excede o limite máximo permitido de 25MB (Tamanho: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
        return;
      }

      setSelectedFileObj(file);
      setName(file.name);
      setFileSize(file.size);
      setFileType(file.type || 'application/pdf');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Por favor, informe o nome do documento.');
      return;
    }

    addDocument({
      name: name.trim(),
      category,
      clientId: clientId || undefined,
      caseId: caseId || undefined,
      uploadedByLawyerId: currentUser?.id || 'usr_1',
      fileSize: fileSize || 1024 * 500,
      fileType,
      isConfidential
    });

    onClose();
  };

  const categories: { label: string; value: DocumentCategory }[] = [
    { label: 'Procuração Ad Judicia', value: 'PROCURACAO' },
    { label: 'Contrato de Honorários', value: 'CONTRATO_HONORARIOS' },
    { label: 'Petição / Recurso', value: 'PETICAO' },
    { label: 'Sentença / Decisão Judicial', value: 'SENTENCA_DECISAO' },
    { label: 'Laudo Pericial / Técnico', value: 'LAUDO_PERICIAL' },
    { label: 'Comprovante / Extrato', value: 'COMPROVANTE' },
    { label: 'Documento Pessoal (RG/CPF)', value: 'DOCUMENTO_PESSOAL' },
    { label: 'Outros Documentos', value: 'OUTROS' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload de Documento"
      subtitle="Armazenamento criptografado e vinculado ao processo/cliente"
      maxWidth="2xl"
      icon={<FileUp className="w-5 h-5 text-brand-400" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Upload Dropzone */}
        <div className="border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-2xl p-6 text-center bg-slate-800/40 transition-colors">
          <input
            type="file"
            id="fileInput"
            className="hidden"
            accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
            onChange={handleFileChange}
          />
          <label htmlFor="fileInput" className="cursor-pointer block">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto mb-3">
              <FileUp className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-white">
              {selectedFileObj ? selectedFileObj.name : 'Clique para selecionar arquivo do computador'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Extensões: PDF, DOCX, XLSX, PNG, JPG (Máx. 25MB)
            </p>
            {selectedFileObj && (
              <span className="inline-block mt-2 text-[10px] text-emerald-400 font-mono">
                ✓ {(selectedFileObj.size / 1024).toFixed(1)} KB carregados
              </span>
            )}
          </label>
        </div>

        {fileError && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        {/* Nome do Documento */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Nome do Arquivo / Título *
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Peticao_Inicial_Assinada.pdf"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Categoria */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Categoria do Documento *
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as DocumentCategory)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Processo Vinculado */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Processo Vinculado (Opcional)
            </label>
            <select
              value={caseId}
              onChange={e => setCaseId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 font-mono"
            >
              <option value="">Sem vínculo direto com processo</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>{c.caseNumber} - {c.actionType}</option>
              ))}
            </select>
          </div>

          {/* Cliente Vinculado */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cliente Vinculado (Opcional)
            </label>
            <select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="">Selecione o cliente titular...</option>
              {clients.map(cl => (
                <option key={cl.id} value={cl.id}>{cl.name}</option>
              ))}
            </select>
          </div>

          {/* Confidencialidade */}
          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isConfidential}
                onChange={e => setIsConfidential(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-brand-500 focus:ring-brand-500/40"
              />
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Documento sob Sigilo / Confidencial
            </label>
          </div>
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
            Enviar Documento
          </button>
        </div>
      </form>
    </Modal>
  );
};
