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
  Users,
  Award,
  ShieldCheck,
  Copy,
  Check,
  Building2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Lawyer } from '../../types';
import { LawyerModal } from './LawyerModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { InternalPageLayout } from '../layout/InternalPageLayout';

export const LawyerList: React.FC = () => {
  const { lawyers, cases, deleteLawyer } = useData();
  const { isAdmin, currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingLawyer, setEditingLawyer] = useState<Lawyer | null>(null);
  const [lawyerToDelete, setLawyerToDelete] = useState<Lawyer | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const officeCode = currentUser?.officeCode || (currentUser?.officeId === 'off_dex_principal' || !currentUser?.isIndependent ? 'DEX-1001' : undefined);

  const handleCopyCode = () => {
    if (!officeCode) return;
    navigator.clipboard.writeText(officeCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Isolamento estrito por escritório
  const officeLawyers = React.useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.isIndependent) {
      return lawyers.filter(l => l.userId === currentUser.id);
    }
    return lawyers.filter(l => !currentUser.officeId || l.officeId === currentUser.officeId);
  }, [lawyers, currentUser]);

  const cleanS = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  const filteredLawyers = officeLawyers.filter(l => {
    const nameNorm = (l.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const oabNorm = (l.oab || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const emailNorm = (l.email || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const roleNorm = (l.roleTitle || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const specsNorm = (l.specialties || []).map(s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')).join(' ');

    return !cleanS || (
      nameNorm.includes(cleanS) ||
      oabNorm.includes(cleanS) ||
      emailNorm.includes(cleanS) ||
      roleNorm.includes(cleanS) ||
      specsNorm.includes(cleanS)
    );
  });

  const totalLawyers = officeLawyers.length;
  const partnersCount = officeLawyers.filter(l => l.roleTitle?.toLowerCase().includes('sócio') || l.roleTitle?.toLowerCase().includes('titular')).length;
  const associatesCount = totalLawyers - partnersCount;
  const activeCasesTotal = cases.filter(c => (!currentUser?.officeId || c.officeId === currentUser.officeId) && c.status !== 'ARQUIVADO').length;

  const kpis = [
    {
      title: 'Total de Advogados',
      value: totalLawyers,
      icon: Users,
      iconTileColor: 'peach' as const
    },
    {
      title: 'Sócios & Titulares',
      value: partnersCount,
      icon: Award,
      iconTileColor: 'mint' as const
    },
    {
      title: 'Advogados Associados',
      value: associatesCount,
      icon: UserCheck,
      iconTileColor: 'purple' as const
    },
    {
      title: 'Processos Ativos',
      value: activeCasesTotal,
      icon: FolderKanban,
      iconTileColor: 'cream' as const
    }
  ];

  return (
    <>
      <InternalPageLayout
        title="Equipe de Advogados"
        subtitle="Corpo jurídico e profissionais vinculados ao escritório"
        actionLabel={isAdmin ? "Adicionar Advogado" : undefined}
        onAction={isAdmin ? () => setIsNewModalOpen(true) : undefined}
        kpis={kpis}
        searchPlaceholder="Buscar por nome, OAB ou especialidade..."
        searchValue={search}
        onSearchChange={setSearch}
      >
        {isAdmin && officeCode && !currentUser?.isIndependent && (
          <div className="mb-6 p-4 rounded-[20px] bg-dex-navy-850 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-serif">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-dex-coral/15 text-dex-coral flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Código de Vínculo da Banca: <span className="font-mono text-dex-peach tracking-wider text-sm">{officeCode}</span>
                </p>
                <p className="text-[11px] text-[#8F8A87]">
                  Novos advogados podem criar conta usando este código ou o e-mail da banca (<span className="text-dex-peach">{currentUser?.email}</span>) para se vincular.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-dex-navy-900 hover:bg-dex-navy-950 text-dex-peach hover:text-white text-xs border border-white/10 transition-all shrink-0 self-start sm:self-auto"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Código Copiado!' : 'Copiar Código DEX'}</span>
            </button>
          </div>
        )}

        {filteredLawyers.length === 0 ? (
          <EmptyState
            title="Nenhum advogado encontrado"
            description="Nenhum membro do corpo jurídico corresponde aos critérios de busca."
            icon={UserCheck}
            actionLabel={isAdmin ? 'Adicionar Advogado' : undefined}
            onAction={isAdmin ? () => setIsNewModalOpen(true) : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLawyers.map(lawyer => {
              const activeCasesCount = cases.filter(c => c.lawyerId === lawyer.id && c.status !== 'ARQUIVADO').length;
              const isSelf = currentUser && (currentUser.id === lawyer.userId || currentUser.email.toLowerCase() === lawyer.email.toLowerCase());

              return (
                <div
                  key={lawyer.id}
                  className="p-6 rounded-[24px] bg-dex-navy-800 border border-white/5 hover:border-dex-coral/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        {lawyer.avatarUrl ? (
                          <img
                            src={lawyer.avatarUrl}
                            alt={lawyer.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-dex-coral"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-dex-kpi-peach text-dex-navy-950 font-serif font-bold text-lg flex items-center justify-center">
                            {lawyer.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-serif text-sm font-bold text-white line-clamp-1">{lawyer.name}</h4>
                          <span className="text-[11px] font-mono text-dex-peach font-bold">OAB {lawyer.oab}</span>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingLawyer(lawyer)}
                            className="p-1.5 text-[#8F8A87] hover:text-white rounded-lg transition-colors"
                            title="Editar Advogado"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {!isSelf && (
                            <button
                              onClick={() => setLawyerToDelete(lawyer)}
                              className="p-1.5 text-[#8F8A87] hover:text-dex-coral rounded-lg transition-colors"
                              title="Remover Advogado"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-xs font-serif text-slate-300">
                      <div className="flex items-center gap-2 text-[11px] text-[#8F8A87]">
                        <Award className="w-3.5 h-3.5 text-dex-coral shrink-0" />
                        <span>{lawyer.roleTitle || 'Advogado Associado'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#8F8A87]">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{lawyer.email}</span>
                      </div>
                      {lawyer.phone && (
                        <div className="flex items-center gap-2 text-[11px] text-[#8F8A87]">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>{lawyer.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-1.5">
                      {lawyer.specialties.map((spec, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-serif px-2.5 py-0.5 rounded-full bg-dex-navy-950 text-dex-beige border border-white/5"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-serif">
                    <span className="text-[#8F8A87]">Casos em condução:</span>
                    <span className="font-bold text-dex-peach">{activeCasesCount} processos</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </InternalPageLayout>

      {/* Modais */}
      <LawyerModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      {editingLawyer && (
        <LawyerModal
          isOpen={!!editingLawyer}
          onClose={() => setEditingLawyer(null)}
          lawyerToEdit={editingLawyer}
        />
      )}

      <ConfirmDialog
        isOpen={!!lawyerToDelete}
        onClose={() => setLawyerToDelete(null)}
        onConfirm={() => {
          if (lawyerToDelete) {
            deleteLawyer(lawyerToDelete.id);
            setLawyerToDelete(null);
          }
        }}
        title="Remover Advogado da Equipe"
        message={`Tem certeza que deseja desvincular ${lawyerToDelete?.name} do escritório? Os processos vinculados continuarão registrados no sistema.`}
        confirmText="Sim, desvincular"
        isDestructive
      />
    </>
  );
};
