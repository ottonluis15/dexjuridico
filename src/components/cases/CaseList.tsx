import React, { useState } from 'react';
import { 
  FolderKanban, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Scale, 
  Calendar,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { LegalCase, LegalArea } from '../../types';
import { CaseStatusBadge } from '../common/Badge';
import { CaseModal } from './CaseModal';
import { CaseDetailModal } from './CaseDetailModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { InternalPageLayout, SummaryCardItem } from '../layout/InternalPageLayout';

export const CaseList: React.FC = () => {
  const { userCases, clients, lawyers, deleteCase, pendingAiDraft, clearPendingAiDraft } = useData();
  const { isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedLawyer, setSelectedLawyer] = useState<string>('ALL');

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null);
  const [viewingCase, setViewingCase] = useState<LegalCase | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<LegalCase | null>(null);

  // Abrir automaticamente caso haja rascunho pendente da IA
  React.useEffect(() => {
    if (pendingAiDraft) {
      setIsNewModalOpen(true);
    }
  }, [pendingAiDraft]);

  // Filtragem
  const cleanS = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const digitsS = search.replace(/\D/g, '');

  const filteredCases = userCases.filter(c => {
    const client = clients.find(cl => cl.id === c.clientId);
    const numDigits = (c.caseNumber || '').replace(/\D/g, '');
    const numNorm = (c.caseNumber || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const actionNorm = (c.actionType || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const courtNorm = (c.court || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const clientNameNorm = client ? (client.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';

    const matchesSearch = !cleanS || (
      numNorm.includes(cleanS) ||
      (digitsS.length >= 3 && numDigits.includes(digitsS)) ||
      actionNorm.includes(cleanS) ||
      courtNorm.includes(cleanS) ||
      clientNameNorm.includes(cleanS)
    );

    const matchesArea = selectedArea === 'ALL' || c.legalArea === selectedArea;
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    const matchesLawyer = selectedLawyer === 'ALL' || c.lawyerId === selectedLawyer;

    return matchesSearch && matchesArea && matchesStatus && matchesLawyer;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const totalValue = userCases.reduce((acc, c) => acc + (c.value || 0), 0);

  const legalAreas: LegalArea[] = [
    'Trabalhista',
    'Cível',
    'Tributário',
    'Família e Sucessões',
    'Penal',
    'Empresarial',
    'Previdenciário',
    'Consumidor',
    'Imobiliário'
  ];

  // 4 Cards de Resumo para a Linha 1 (Anexo 5)
  const summaryCards: SummaryCardItem[] = [
    {
      label: 'Processos Ativos',
      value: userCases.filter(c => c.status !== 'ARQUIVADO').length,
      icon: <Scale className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#F9D9C3]',
      iconTextColor: 'text-[#C48A5C]',
    },
    {
      label: 'Fase Recursal',
      value: userCases.filter(c => c.status === 'RECURSAL').length,
      icon: <Sparkles className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#E0D7F5]',
      iconTextColor: 'text-[#6B46C1]',
    },
    {
      label: 'Em Instrução',
      value: userCases.filter(c => c.status === 'INSTRUCAO').length,
      icon: <Calendar className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#CBEBD8]',
      iconTextColor: 'text-[#2B8255]',
    },
    {
      label: 'Valor da Carteira',
      value: formatCurrency(totalValue),
      icon: <DollarSign className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#FDF0CD]',
      iconTextColor: 'text-[#B7791F]',
    },
  ];

  return (
    <InternalPageLayout
      summaryCards={summaryCards}
      headerTitle="Gestão de Processos"
      headerSubtitle={`${filteredCases.length} ${filteredCases.length === 1 ? 'processo encontrado' : 'processos encontrados'}`}
      headerFilters={
        <>
          {/* Busca */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por CNJ, Ação ou Cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>

          {/* Filtro de Área */}
          <select
            value={selectedArea}
            onChange={e => setSelectedArea(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
          >
            <option value="ALL" className="bg-[#162B37] text-white">Todas as Áreas</option>
            {legalAreas.map(area => (
              <option key={area} value={area} className="bg-[#162B37] text-white">{area}</option>
            ))}
          </select>

          {/* Filtro de Status */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
          >
            <option value="ALL" className="bg-[#162B37] text-white">Todos os Status</option>
            <option value="EM_ANDAMENTO" className="bg-[#162B37] text-white">Em Andamento</option>
            <option value="AGUARDANDO_AUDIENCIA" className="bg-[#162B37] text-white">Aguardando Audiência</option>
            <option value="RECURSO" className="bg-[#162B37] text-white">Em Recurso</option>
            <option value="JULGADO" className="bg-[#162B37] text-white">Sentenciado</option>
            <option value="CONCLUSO" className="bg-[#162B37] text-white">Concluso</option>
            <option value="ARQUIVADO" className="bg-[#162B37] text-white">Arquivado</option>
          </select>

          {/* Filtro de Advogado */}
          {lawyers.length > 0 && (
            <select
              value={selectedLawyer}
              onChange={e => setSelectedLawyer(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            >
              <option value="ALL" className="bg-[#162B37] text-white">Todos os Advogados</option>
              {lawyers.map(l => (
                <option key={l.id} value={l.id} className="bg-[#162B37] text-white">{l.name}</option>
              ))}
            </select>
          )}
        </>
      }
      headerActions={
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-dex-coral hover:bg-dex-coral-hover text-white text-xs font-semibold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 font-serif"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Processo</span>
        </button>
      }
    >
      {/* Banner de Rascunho da IA se houver */}
      {pendingAiDraft && (
        <div className="mb-6 p-4 rounded-2xl bg-[#1B3442] border border-dex-coral/50 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-dex-coral/20 text-dex-coral flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-display">
                Rascunho do Dex AI pronto para virar Processo!
              </h4>
              <p className="text-xs text-[#C2D6DC] mt-0.5">
                Ação: <strong className="text-white">{pendingAiDraft.analysis.suggestedActionType}</strong> • Área: {pendingAiDraft.analysis.suggestedLegalArea}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2 bg-dex-coral hover:bg-dex-coral-hover text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer"
            >
              Revisar e Salvar
            </button>
            <button
              onClick={clearPendingAiDraft}
              className="px-3 py-2 text-[#A6C5CD] hover:text-white text-xs transition-colors cursor-pointer"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      {/* Tabela de Processos */}
      {filteredCases.length === 0 ? (
        <EmptyState
          title="Nenhum processo encontrado"
          description="Tente ajustar os filtros ou cadastre um novo processo para a banca."
          icon={FolderKanban}
          actionLabel="Cadastrar Processo"
          onAction={() => setIsNewModalOpen(true)}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white">
            <thead className="bg-[#1A3342] text-[#A6C5CD] font-semibold border-b border-[#214154]">
              <tr>
                <th className="py-3.5 px-4 font-serif">Processo (CNJ) / Ação</th>
                <th className="py-3.5 px-4 font-serif">Cliente</th>
                <th className="py-3.5 px-4 font-serif">Área / Fase</th>
                <th className="py-3.5 px-4 font-serif">Responsável</th>
                <th className="py-3.5 px-4 font-serif">Valor da Causa</th>
                <th className="py-3.5 px-4 font-serif text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#214154]/50">
              {filteredCases.map(caseItem => {
                const client = clients.find(cl => cl.id === caseItem.clientId);
                const lawyer = lawyers.find(l => l.id === caseItem.lawyerId);

                return (
                  <tr
                    key={caseItem.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-white text-xs">
                        {caseItem.caseNumber}
                      </div>
                      <div className="text-[11px] text-[#A6C5CD] truncate max-w-xs mt-0.5">
                        {caseItem.actionType}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">
                        {client ? client.name : 'Cliente não vinculado'}
                      </div>
                      <div className="text-[11px] text-[#A6C5CD]">
                        {client?.document || '-'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="mb-1">
                        <CaseStatusBadge status={caseItem.status} />
                      </div>
                      <span className="text-[10px] text-[#A6C5CD]">
                        {caseItem.legalArea}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">
                        {lawyer ? lawyer.name : 'Não atribuído'}
                      </div>
                      <div className="text-[10px] text-[#A6C5CD]">
                        {lawyer?.oab || '-'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-white">
                      {caseItem.value ? formatCurrency(caseItem.value) : 'R$ 0,00'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingCase(caseItem)}
                          title="Visualizar detalhes"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-[#A6C5CD] hover:text-white transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingCase(caseItem)}
                          title="Editar processo"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-[#A6C5CD] hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCaseToDelete(caseItem)}
                          title="Excluir processo"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-dex-coral/20 text-[#A6C5CD] hover:text-dex-coral transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modais de Processo */}
      <CaseModal
        isOpen={isNewModalOpen || !!editingCase}
        onClose={() => {
          setIsNewModalOpen(false);
          setEditingCase(null);
        }}
        initialCase={editingCase || undefined}
      />

      {viewingCase && (
        <CaseDetailModal
          caseItem={viewingCase}
          isOpen={!!viewingCase}
          onClose={() => setViewingCase(null)}
          onEdit={() => {
            const c = viewingCase;
            setViewingCase(null);
            setEditingCase(c);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!caseToDelete}
        onClose={() => setCaseToDelete(null)}
        onConfirm={() => {
          if (caseToDelete) {
            deleteCase(caseToDelete.id);
            setCaseToDelete(null);
          }
        }}
        title="Excluir Processo"
        message={`Deseja realmente remover o processo "${caseToDelete?.caseNumber}"? Esta ação removerá os vínculos e prazos associados.`}
        confirmLabel="Sim, excluir processo"
      />
    </InternalPageLayout>
  );
};
