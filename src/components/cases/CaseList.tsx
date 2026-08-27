import React, { useState } from 'react';
import { 
  FolderKanban, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Scale, 
  User, 
  Calendar,
  DollarSign
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { LegalCase, LegalArea, CaseStatus } from '../../types';
import { CaseStatusBadge } from '../common/Badge';
import { CaseModal } from './CaseModal';
import { CaseDetailModal } from './CaseDetailModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';

export const CaseList: React.FC = () => {
  const { userCases, clients, lawyers, deleteCase } = useData();
  const { isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedLawyer, setSelectedLawyer] = useState<string>('ALL');

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null);
  const [viewingCase, setViewingCase] = useState<LegalCase | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<LegalCase | null>(null);

  // Filtragem
  const filteredCases = userCases.filter(c => {
    const client = clients.find(cl => cl.id === c.clientId);
    const matchesSearch = 
      c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.actionType.toLowerCase().includes(search.toLowerCase()) ||
      c.court.toLowerCase().includes(search.toLowerCase()) ||
      (client && client.name.toLowerCase().includes(search.toLowerCase()));

    const matchesArea = selectedArea === 'ALL' || c.legalArea === selectedArea;
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    const matchesLawyer = selectedLawyer === 'ALL' || c.lawyerId === selectedLawyer;

    return matchesSearch && matchesArea && matchesStatus && matchesLawyer;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

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

  return (
    <div className="space-y-6">
      {/* Header with Title and New Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Processos em Acompanhamento</h2>
          <p className="text-xs text-slate-400">
            {filteredCases.length} {filteredCases.length === 1 ? 'processo encontrado' : 'processos encontrados'}
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Processo
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por CNJ, Ação ou Cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          {/* Area Filter */}
          <div>
            <select
              value={selectedArea}
              onChange={e => setSelectedArea(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="ALL">Todas as Áreas</option>
              {legalAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="ALL">Todas as Fases</option>
              <option value="INICIAL">Fase Inicial</option>
              <option value="INSTRUCAO">Instrução</option>
              <option value="SENTENCA">Sentença</option>
              <option value="RECURSAL">Recursal</option>
              <option value="EXECUCAO">Execução</option>
              <option value="ACORDO">Acordo</option>
              <option value="ARQUIVADO">Arquivado</option>
            </select>
          </div>

          {/* Lawyer Filter (Admin) */}
          <div>
            <select
              value={selectedLawyer}
              onChange={e => setSelectedLawyer(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="ALL">Todos os Advogados</option>
              {lawyers.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cases Table / Cards */}
      {filteredCases.length === 0 ? (
        <EmptyState
          title="Nenhum processo encontrado"
          description="Tente ajustar os filtros de busca ou cadastre uma nova ação."
          icon={FolderKanban}
          actionLabel="Cadastrar Processo"
          onAction={() => setIsNewModalOpen(true)}
        />
      ) : (
        <div className="rounded-2xl border border-slate-800/80 overflow-hidden bg-slate-900/80 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Processo (CNJ) / Ação</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Área / Fase</th>
                  <th className="py-3.5 px-4">Responsável</th>
                  <th className="py-3.5 px-4">Valor da Causa</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCases.map(caseItem => {
                  const client = clients.find(c => c.id === caseItem.clientId);
                  const lawyer = lawyers.find(l => l.id === caseItem.lawyerId);

                  return (
                    <tr 
                      key={caseItem.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setViewingCase(caseItem)}
                    >
                      {/* CNJ & Action */}
                      <td className="py-4 px-4 min-w-[240px]">
                        <span className="font-mono font-bold text-brand-300 text-[11px] block">
                          {caseItem.caseNumber}
                        </span>
                        <span className="font-semibold text-white group-hover:text-brand-300 transition-colors text-xs line-clamp-1">
                          {caseItem.actionType}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {caseItem.court}
                        </span>
                      </td>

                      {/* Client */}
                      <td className="py-4 px-4 min-w-[160px]">
                        <span className="font-semibold text-slate-200 block truncate">
                          {client?.name || 'Não vinculado'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {client?.document}
                        </span>
                      </td>

                      {/* Area & Status */}
                      <td className="py-4 px-4 min-w-[160px]">
                        <div className="space-y-1">
                          <CaseStatusBadge status={caseItem.status} />
                          <span className="text-[10px] text-slate-400 block font-medium">
                            {caseItem.legalArea}
                          </span>
                        </div>
                      </td>

                      {/* Lawyer */}
                      <td className="py-4 px-4 min-w-[140px]">
                        <span className="text-slate-300 font-medium block truncate">
                          {lawyer?.name.split(' ')[0]} {lawyer?.name.split(' ').slice(-1)[0]}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {lawyer?.oab}
                        </span>
                      </td>

                      {/* Value */}
                      <td className="py-4 px-4 min-w-[120px]">
                        <span className="font-bold text-emerald-400">
                          {formatCurrency(caseItem.value)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Dist: {caseItem.distributionDate}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingCase(caseItem)}
                            title="Ver detalhes"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingCase(caseItem)}
                            title="Editar processo"
                            className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setCaseToDelete(caseItem)}
                              title="Excluir processo"
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New / Edit Case Modal */}
      <CaseModal
        isOpen={isNewModalOpen || !!editingCase}
        onClose={() => {
          setIsNewModalOpen(false);
          setEditingCase(null);
        }}
        caseToEdit={editingCase}
      />

      {/* View Detail Modal */}
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

      {/* Delete Confirmation */}
      {caseToDelete && (
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
          message={`Tem certeza que deseja excluir o processo nº ${caseToDelete?.caseNumber} (${caseToDelete?.actionType})? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir Definitivamente"
        />
      )}
    </div>
  );
};
