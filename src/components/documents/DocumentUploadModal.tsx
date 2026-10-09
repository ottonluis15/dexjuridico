import React, { useState } from 'react';
import { FileUp, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { TemplateCategory } from '../../types';
import { useData } from '../../context/DataContext';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose
}) => {
  const { addTemplate, showToast } = useData();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('PETICAO_INICIAL');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Extensões permitidas para modelos jurídicos
  const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.odt', '.txt'];
  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        setFileError(`Formato "${extension}" não suportado. Extensões permitidas: ${ALLOWED_EXTENSIONS.join(', ')}.`);
        setSelectedFile(null);
        return;
      }

      if (file.size > MAX_SIZE_BYTES) {
        setFileError(`O arquivo excede o limite máximo permitido de 10 MB (Tamanho atual: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      if (!title.trim()) {
        // Sugere o nome do arquivo limpo como título
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setTitle(nameWithoutExt.replace(/[-_]/g, ' '));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setFileError('Por favor, informe o título do modelo.');
      return;
    }

    if (!selectedFile) {
      setFileError('Por favor, selecione um arquivo do seu computador.');
      return;
    }

    setIsUploading(true);

    try {
      // Leitura e codificação em Data URL para persistência e download funcional
      const reader = new FileReader();
      reader.onload = () => {
        const fileData = reader.result as string;

        addTemplate({
          title: title.trim(),
          category,
          description: description.trim() || undefined,
          fileName: selectedFile.name,
          fileType: selectedFile.type || 'application/octet-stream',
          fileSize: selectedFile.size,
          fileData
        });

        setIsUploading(false);
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        setFileError(null);
      };

      reader.onerror = () => {
        setFileError('Falha ao processar o arquivo. Tente novamente.');
        setIsUploading(false);
      };

      reader.readAsDataURL(selectedFile);
    } catch {
      setFileError('Ocorreu um erro inesperado ao fazer upload.');
      setIsUploading(false);
    }
  };

  const categories: { label: string; value: TemplateCategory }[] = [
    { label: 'Petição Inicial', value: 'PETICAO_INICIAL' },
    { label: 'Contestação / Defesa', value: 'CONTESTACAO' },
    { label: 'Recurso / Apelação', value: 'RECURSO' },
    { label: 'Contrato de Honorários / Prestação', value: 'CONTRATO' },
    { label: 'Procuração Ad Judicia', value: 'PROCURACAO' },
    { label: 'Notificação Extrajudicial', value: 'NOTIFICACAO' },
    { label: 'Parecer Jurídico', value: 'PARECER' },
    { label: 'Outros Documentos', value: 'OUTROS' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Modelo Jurídico"
      subtitle="Envie minutas e peças processuais para a base do escritório"
      maxWidth="2xl"
      icon={<FileUp className="w-5 h-5 text-brand-400" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dropzone de Upload */}
        <div className="border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-2xl p-6 text-center bg-slate-800/40 transition-colors">
          <input
            type="file"
            id="templateFileInput"
            className="hidden"
            accept=".pdf,.doc,.docx,.odt,.txt"
            onChange={handleFileChange}
          />
          <label htmlFor="templateFileInput" className="cursor-pointer block">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto mb-3">
              <FileUp className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-white">
              {selectedFile ? selectedFile.name : 'Clique para selecionar arquivo do computador'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Formatos aceitos: PDF, DOC, DOCX, ODT e TXT (Tamanho máximo: 10 MB)
            </p>
            {selectedFile && (
              <span className="inline-flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {(selectedFile.size / 1024).toFixed(1)} KB carregados
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

        {/* Título do Modelo */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Título do Modelo *
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Petição Inicial - Reclamatória Trabalhista com Horas Extras"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Categoria da Peça / Documento *
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as TemplateCategory)}
            className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Descrição e Orientações de Uso (Opcional)
          </label>
          <textarea
            rows={3}
            placeholder="Ex: Utilizar preferencialmente em demandas que envolvam cargo de confiança e ausência de controle biométrico..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isUploading ? 'Processando envio...' : 'Salvar Modelo'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
