import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  FileUp, 
  Download, 
  Trash2, 
  Calendar,
  User,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { TemplateDocument, TemplateCategory } from '../../types';
import { DocumentUploadModal } from './DocumentUploadModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';

export const DocumentList: React.FC = () => {
  const { userTemplates, deleteTemplate, showToast } = useData();
  const { currentUser, isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<TemplateDocument | null>(null);

  // Filtragem
  const filteredTemplates = userTemplates.filter(tpl => {
    const matchesSearch = 
      tpl.title.toLowerCase().includes(search.toLowerCase()) ||
      (tpl.description && tpl.description.toLowerCase().includes(search.toLowerCase())) ||
      tpl.fileName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || tpl.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Download real do arquivo original
  const handleDownload = (tpl: TemplateDocument) => {
    try {
      const link = document.createElement('a');
      link.href = tpl.fileData;
      link.download = tpl.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Download do modelo "${tpl.fileName}" concluído com sucesso!`, 'success');
    } catch {
      showToast('Erro ao realizar o download do arquivo.', 'error');
    }
  };

  const categories: { label: string; value: TemplateCategory }[] = [
    { label: 'Petições Iniciais', value: 'PETICAO_INICIAL' },
    { label: 'Contestações', value: 'CONTESTACAO' },
    { label: 'Recursos & Apelações', value: 'RECURSO' },
    { label: 'Contratos de Honorários', value: 'CONTRATO' },
    { label: 'Procurações', value: 'PROCURACAO' },
    { label: 'Notificações Extrajudiciais', value: 'NOTIFICACAO' },
    { label: 'Pareceres Jurídicos', value: 'PARECER' },
    { label: 'Outros Modelos', value: 'OUTROS' },
  ];

  const getCategoryBadgeLabel = (cat: TemplateCategory) => {
    switch (cat) {
      case 'PETICAO_INICIAL': return 'Petição Inicial';
      case 'CONTESTACAO': return 'Contestação';
      case 'RECURSO': return 'Recurso';
      case 'CONTRATO': return 'Contrato';
      case 'PROCURACAO': return 'Procuração';
      case 'NOTIFICACAO': return 'Notificação';
      case 'PARECER': return 'Parecer';
      default: return 'Outros';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Modelos de Documentos Jurídicos</h2>
          <p className="text-xs text-slate-400">
            Repositório de minutas padronizadas, petições, contratos e procurações da sua banca
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto cursor-pointer"
        >
          <FileUp className="w-4 h-4" />
          <span>Enviar Novo Modelo</span>
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar modelo por título, descrição ou arquivo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>

        <div className="relative">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 cursor-pointer"
          >
            <option value="ALL">Todas as Categorias de Modelos</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Modelos */}
      {filteredTemplates.length === 0 ? (
        <EmptyState
          title="Nenhum modelo encontrado"
          description="Nenhum arquivo corresponde à busca ou categoria selecionada."
          icon={FileText}
          actionLabel="Enviar Novo Modelo"
          onAction={() => setIsUploadModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(tpl => {
            const canDelete = isAdmin || (currentUser && tpl.uploadedByUserId === currentUser.id);

            return (
              <div
                key={tpl.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-brand-300 border border-slate-700 truncate">
                      {getCategoryBadgeLabel(tpl.category)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {formatFileSize(tpl.fileSize)}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white leading-snug line-clamp-2" title={tpl.title}>
                        {tpl.title}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate" title={tpl.fileName}>
                        {tpl.fileName}
                      </p>
                    </div>
                  </div>

                  {tpl.description && (
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {tpl.description}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      <span className="truncate max-w-[120px]">{tpl.uploadedByName}</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{tpl.createdAt}</span>
                    </span>
                  </div>
                </div>

                {/* Ações: Download & Exclusão */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDownload(tpl)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 hover:text-white border border-brand-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    title={`Baixar ${tpl.fileName}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Arquivo</span>
                  </button>

                  {canDelete && (
                    <button
                      onClick={() => setTemplateToDelete(tpl)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-900/40"
                      title="Excluir modelo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Upload */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* Modal de Confirmação de Exclusão */}
      {templateToDelete && (
        <ConfirmDialog
          isOpen={!!templateToDelete}
          onClose={() => setTemplateToDelete(null)}
          onConfirm={() => {
            if (templateToDelete) {
              deleteTemplate(templateToDelete.id);
              setTemplateToDelete(null);
            }
          }}
          title="Excluir Modelo Jurídico"
          message={`Tem certeza que deseja remover o modelo "${templateToDelete.title}"? Esta ação não pode ser desfeita.`}
        />
      )}
    </div>
  );
};
