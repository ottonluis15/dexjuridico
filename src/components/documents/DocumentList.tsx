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
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { TemplateDocument, TemplateCategory } from '../../types';
import { DocumentUploadModal } from './DocumentUploadModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { InternalPageLayout, SummaryCardItem } from '../layout/InternalPageLayout';

export const DocumentList: React.FC = () => {
  const { userTemplates, deleteTemplate, showToast } = useData();
  const { currentUser, isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<TemplateDocument | null>(null);

  // Filtragem
  const cleanS = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  const filteredTemplates = userTemplates.filter(tpl => {
    const titleNorm = (tpl.title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const descNorm = (tpl.description || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const fileNorm = (tpl.fileName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const catNorm = (tpl.category || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const matchesSearch = !cleanS || (
      titleNorm.includes(cleanS) ||
      descNorm.includes(cleanS) ||
      fileNorm.includes(cleanS) ||
      catNorm.includes(cleanS)
    );
    const matchesCategory = selectedCategory === 'ALL' || tpl.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  // 4 Cards de Resumo (Anexo 5)
  const summaryCards: SummaryCardItem[] = [
    {
      label: 'Total de Modelos',
      value: userTemplates.length,
      icon: <FileText className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#CBEBD8]',
      iconTextColor: 'text-[#2B8255]',
    },
    {
      label: 'Petições Iniciais',
      value: userTemplates.filter(t => t.category === 'PETICAO_INICIAL').length,
      icon: <FolderOpen className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#F9D9C3]',
      iconTextColor: 'text-[#C48A5C]',
    },
    {
      label: 'Contratos & Procurações',
      value: userTemplates.filter(t => t.category === 'CONTRATO' || t.category === 'PROCURACAO').length,
      icon: <FileText className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#E0D7F5]',
      iconTextColor: 'text-[#6B46C1]',
    },
    {
      label: 'Recursos Forenses',
      value: userTemplates.filter(t => t.category === 'RECURSO').length,
      icon: <FileText className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#FDF0CD]',
      iconTextColor: 'text-[#B7791F]',
    },
  ];

  return (
    <InternalPageLayout
      summaryCards={summaryCards}
      headerTitle="Modelos de Documentos"
      headerSubtitle={`${filteredTemplates.length} ${filteredTemplates.length === 1 ? 'modelo disponível' : 'modelos disponíveis'}`}
      headerFilters={
        <>
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por título, descrição ou arquivo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
          >
            <option value="ALL" className="bg-[#162B37] text-white">Todas as Categorias</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value} className="bg-[#162B37] text-white">{cat.label}</option>
            ))}
          </select>
        </>
      }
      headerActions={
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-dex-coral hover:bg-dex-coral-hover text-white text-xs font-semibold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer font-serif"
        >
          <FileUp className="w-4 h-4 stroke-[2.5]" />
          <span>Enviar Novo Modelo</span>
        </button>
      }
    >
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
          {filteredTemplates.map(tpl => (
            <div
              key={tpl.id}
              className="p-5 rounded-2xl bg-[#1A3342] border border-[#214154] hover:border-[#3D6C78] transition-all flex flex-col justify-between group shadow"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-dex-coral shrink-0">
                      <FileText className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-display font-bold text-white truncate">
                        {tpl.title}
                      </h4>
                      <span className="text-[11px] text-[#A6C5CD] font-mono">
                        {tpl.fileName}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4A808E]/25 text-[#72ACBA] border border-[#4A808E]/40 shrink-0">
                    {getCategoryBadgeLabel(tpl.category)}
                  </span>
                </div>

                <p className="text-xs text-[#C2D6DC] leading-relaxed line-clamp-2">
                  {tpl.description || 'Modelo padrão da banca de advogados.'}
                </p>

                <div className="pt-2 flex items-center justify-between text-[11px] text-[#A6C5CD] border-t border-[#214154]/60">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {tpl.createdAt}
                  </span>
                  <span>{formatFileSize(tpl.fileSize)}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#214154]/60 flex items-center justify-between">
                <span className="text-xs text-[#A6C5CD]">
                  Por: {tpl.uploadedByName}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(tpl)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar</span>
                  </button>

                  <button
                    onClick={() => setTemplateToDelete(tpl)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-dex-coral/20 text-[#A6C5CD] hover:text-dex-coral transition-colors cursor-pointer"
                    title="Excluir modelo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modais */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <ConfirmDialog
        isOpen={!!templateToDelete}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={() => {
          if (templateToDelete) {
            deleteTemplate(templateToDelete.id);
            setTemplateToDelete(null);
          }
        }}
        title="Excluir Modelo de Documento"
        message={`Deseja realmente remover o modelo "${templateToDelete?.title}"?`}
        confirmLabel="Sim, excluir modelo"
      />
    </InternalPageLayout>
  );
};
