import React, { useState } from 'react';
import { FileUp, FileText, AlertTriangle, CheckCircle2, Upload } from 'lucide-react';
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
        setFileError(`O arquivo excede o limite máximo permitido de 10 MB.`);
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      if (!title.trim()) {
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
        showToast(`Modelo "${selectedFile.name}" enviado com sucesso!`, 'success');
        onClose();
      };
      reader.readAsDataURL(selectedFile);
    } catch {
      setFileError('Erro ao processar o arquivo. Tente novamente.');
      setIsUploading(false);
    }
  };

  const categories: { label: string; value: TemplateCategory }[] = [
    { label: 'Petição Inicial', value: 'PETICAO_INICIAL' },
    { label: 'Contestação', value: 'CONTESTACAO' },
    { label: 'Recurso / Apelação', value: 'RECURSO' },
    { label: 'Contrato de Honorários', value: 'CONTRATO' },
    { label: 'Procuração Ad Judicia', value: 'PROCURACAO' },
    { label: 'Notificação Extrajudicial', value: 'NOTIFICACAO' },
    { label: 'Parecer Jurídico', value: 'PARECER' },
    { label: 'Outros Documentos', value: 'OUTROS' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enviar Modelo de Documento"
      subtitle="Disponibilize minutas institucionais padronizadas para toda a banca"
      maxWidth="2xl"
      icon={<FileUp className="w-5 h-5 text-dex-coral" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {fileError && (
          <div className="p-3 rounded-xl bg-dex-coral/20 border border-dex-coral/50 text-white text-xs">
            {fileError}
          </div>
        )}

        {/* Linha 1: Título e Categoria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Título do Modelo*
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Petição Inicial - Revisional de Contrato Bancário"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Categoria Jurídica*
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as TemplateCategory)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            >
              {categories.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Linha 2: Descrição */}
        <div className="space-y-1">
          <label className="block text-xs italic font-serif text-[#C2D6DC]">
            Descrição / Recomendações de Uso
          </label>
          <textarea
            rows={2}
            placeholder="Orientações sobre jurisprudência aplicável, teses ou preenchimento de variáveis..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
          />
        </div>

        {/* Upload de Arquivo */}
        <div className="space-y-2 p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
          <input
            type="file"
            id="template-file"
            accept=".pdf,.doc,.docx,.odt,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-dex-coral/20 text-dex-coral mx-auto flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-xs text-white font-medium">{selectedFile.name}</div>
              <span className="text-[11px] text-[#A6C5CD]">{(selectedFile.size / 1024).toFixed(1)} KB</span>
              <div>
                <label
                  htmlFor="template-file"
                  className="inline-block text-xs text-dex-coral hover:underline cursor-pointer"
                >
                  Substituir arquivo
                </label>
              </div>
            </div>
          ) : (
            <label
              htmlFor="template-file"
              className="cursor-pointer flex flex-col items-center justify-center gap-2 py-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-white">Clique para selecionar o arquivo</span>
              <span className="text-[11px] text-[#A6C5CD]">Formatos aceitos: PDF, Word (DOC/DOCX), ODT, TXT (até 10 MB)</span>
            </label>
          )}
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
            disabled={isUploading}
            className="px-6 py-2.5 rounded-xl bg-dex-coral hover:bg-dex-coral-hover text-white text-xs font-bold shadow transition-all hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {isUploading ? 'Enviando...' : 'Salvar Modelo'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
