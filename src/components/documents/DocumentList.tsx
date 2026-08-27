import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  FileUp, 
  Download, 
  Trash2, 
  Lock, 
  FolderKanban, 
  User, 
  FileCheck,
  Eye
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { DocumentItem, DocumentCategory } from '../../types';
import { DocumentUploadModal } from './DocumentUploadModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';

export const DocumentList: React.FC = () => {
  const { userDocuments, cases, clients, deleteDocument, showToast } = useData();
  const { isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);

  const filteredDocs = userDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (doc: DocumentItem) => {
    showToast(`Iniciando download seguro de "${doc.name}"...`, 'info');
  };

  const categories: { label: string; value: DocumentCategory }[] = [
    { label: 'Procurações', value: 'PROCURACAO' },
    { label: 'Contratos de Honorários', value: 'CONTRATO_HONORARIOS' },
    { label: 'Petições & Recursos', value: 'PETICAO' },
    { label: 'Sentenças & Decisões', value: 'SENTENCA_DECISAO' },
    { label: 'Laudos Periciais', value: 'LAUDO_PERICIAL' },
    { label: 'Comprovantes', value: 'COMPROVANTE' },
    { label: 'Documentos Pessoais', value: 'DOCUMENTO_PESSOAL' },
    { label: 'Outros', value: 'OUTROS' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Repositório de Documentos</h2>
          <p className="text-xs text-slate-400">
            Arquivos digitalizados, peças processuais, contratos e laudos sob custódia segura
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto"
        >
          <FileUp className="w-4 h-4" />
          Enviar Documento
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar arquivo por nome..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          >
            <option value="ALL">Todas as Categorias</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Documents */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          title="Nenhum documento encontrado"
          description="Nenhum arquivo corresponde à busca ou categoria selecionada."
          icon={FileText}
          actionLabel="Fazer Upload de Documento"
          onAction={() => setIsUploadModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map(doc => {
            const linkedCase = cases.find(c => c.id === doc.caseId);
            const client = clients.find(cl => cl.id === doc.clientId);

            return (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-brand-300 border border-slate-700 truncate">
                      {doc.category.replace('_', ' ')}
                    </span>
                    {doc.isConfidential && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        Sigiloso
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate" title={doc.name}>
                        {doc.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {(doc.fileSize / 1024).toFixed(1)} KB • {doc.createdAt}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    {linkedCase && (
                      <p className="truncate font-mono text-brand-300">
                        Proc: {linkedCase.caseNumber}
                      </p>
                    )}
                    {client && (
                      <p className="truncate">
                        Cliente: <strong className="text-slate-300">{client.name}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Acesso Restrito</span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDownload(doc)}
                      title="Baixar arquivo"
                      className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDocToDelete(doc)}
                      title="Excluir documento"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* Delete confirmation */}
      {docToDelete && (
        <ConfirmDialog
          isOpen={!!docToDelete}
          onClose={() => setDocToDelete(null)}
          onConfirm={() => {
            if (docToDelete) {
              deleteDocument(docToDelete.id);
              setDocToDelete(null);
            }
          }}
          title="Excluir Documento"
          message={`Tem certeza que deseja excluir permanentemente o documento "${docToDelete.name}"?`}
        />
      )}
    </div>
  );
};
