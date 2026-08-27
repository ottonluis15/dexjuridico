import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Scale, 
  FolderKanban, 
  Edit, 
  Trash2,
  Award
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Lawyer } from '../../types';
import { LawyerModal } from './LawyerModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';

export const LawyerList: React.FC = () => {
  const { lawyers, cases, deleteLawyer } = useData();
  const { isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingLawyer, setEditingLawyer] = useState<Lawyer | null>(null);
  const [lawyerToDelete, setLawyerToDelete] = useState<Lawyer | null>(null);

  const filteredLawyers = lawyers.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.oab.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Corpo Jurídico & Advogados</h2>
          <p className="text-xs text-slate-400">
            Equipe técnica responsável pela condução e patrocínio das ações
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Novo Advogado
          </button>
        )}
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome, OAB ou especialidade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>
      </div>

      {/* Grid of Lawyers */}
      {filteredLawyers.length === 0 ? (
        <EmptyState
          title="Nenhum advogado encontrado"
          description="Nenhum membro do corpo jurídico corresponde à busca."
          icon={UserCheck}
          actionLabel={isAdmin ? 'Cadastrar Advogado' : undefined}
          onAction={isAdmin ? () => setIsNewModalOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLawyers.map(lawyer => {
            const activeCases = cases.filter(c => c.lawyerId === lawyer.id && c.status !== 'ARQUIVADO').length;

            return (
              <div
                key={lawyer.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600 to-slate-800 flex items-center justify-center text-white font-bold text-sm shadow-md border border-brand-400/30">
                        {lawyer.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight">{lawyer.name}</h3>
                        <p className="text-[11px] text-brand-300 font-mono mt-0.5">OAB: {lawyer.oab}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      lawyer.status === 'ACTIVE'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {lawyer.status === 'ACTIVE' ? 'Ativo' : 'Licenciado'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">{lawyer.roleTitle}</p>

                  <div className="space-y-1.5 mt-3 text-xs text-slate-400">
                    <p className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{lawyer.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{lawyer.phone}</span>
                    </p>
                  </div>

                  {/* Specialties tags */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {lawyer.specialties.map(spec => (
                      <span
                        key={spec}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/60"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-300 flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-brand-400" />
                    {activeCases} {activeCases === 1 ? 'processo ativo' : 'processos ativos'}
                  </span>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingLawyer(lawyer)}
                        title="Editar advogado"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setLawyerToDelete(lawyer)}
                        title="Excluir advogado"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <LawyerModal
        isOpen={isNewModalOpen || !!editingLawyer}
        onClose={() => {
          setIsNewModalOpen(false);
          setEditingLawyer(null);
        }}
        lawyerToEdit={editingLawyer}
      />

      {/* Delete confirmation */}
      {lawyerToDelete && (
        <ConfirmDialog
          isOpen={!!lawyerToDelete}
          onClose={() => setLawyerToDelete(null)}
          onConfirm={() => {
            if (lawyerToDelete) {
              deleteLawyer(lawyerToDelete.id);
              setLawyerToDelete(null);
            }
          }}
          title="Excluir Advogado"
          message={`Tem certeza que deseja remover ${lawyerToDelete.name} do corpo jurídico?`}
        />
      )}
    </div>
  );
};
