import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Trash2, 
  Eye, 
  MessageSquare,
  Building,
  UserCheck,
  Download
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Client, ClientType, ClientStatus } from '../../types';
import { ClientModal } from './ClientModal';
import { ClientDetailModal } from './ClientDetailModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { InternalPageLayout, SummaryCardItem } from '../layout/InternalPageLayout';

export const ClientList: React.FC = () => {
  const { userClients, userCases, deleteClient, exportClientsCsv } = useData();
  const { currentUser, isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const cleanS = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const digitsS = search.replace(/\D/g, '');

  const filteredClients = userClients.filter(c => {
    const clientNameNorm = (c.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const clientDocDigits = (c.document || '').replace(/\D/g, '');
    const clientPhoneDigits = (c.phone || '').replace(/\D/g, '');
    const clientEmail = (c.email || '').toLowerCase();

    const matchesSearch = !cleanS || (
      clientNameNorm.includes(cleanS) ||
      (digitsS.length >= 3 && clientDocDigits.includes(digitsS)) ||
      clientEmail.includes(cleanS) ||
      (digitsS.length >= 3 && clientPhoneDigits.includes(digitsS))
    );

    const matchesType = selectedType === 'ALL' || c.type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // 4 Cards de Resumo (Anexo 5) calculados estritamente sobre userClients isolados
  const summaryCards: SummaryCardItem[] = [
    {
      label: 'Carteira de Clientes',
      value: userClients.length,
      icon: <Users className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#CBEBD8]',
      iconTextColor: 'text-[#2B8255]',
    },
    {
      label: 'Pessoas Físicas (PF)',
      value: userClients.filter(c => c.type === 'PF').length,
      icon: <UserCheck className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#F9D9C3]',
      iconTextColor: 'text-[#C48A5C]',
    },
    {
      label: 'Pessoas Jurídicas (PJ)',
      value: userClients.filter(c => c.type === 'PJ').length,
      icon: <Building className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#E0D7F5]',
      iconTextColor: 'text-[#6B46C1]',
    },
    {
      label: 'Clientes Ativos',
      value: userClients.filter(c => c.status === 'ACTIVE').length,
      icon: <Users className="w-5 h-5 stroke-[2]" />,
      iconBgColor: 'bg-[#FDF0CD]',
      iconTextColor: 'text-[#B7791F]',
    },
  ];

  return (
    <InternalPageLayout
      summaryCards={summaryCards}
      headerTitle="Carteira de Clientes"
      headerSubtitle={`${filteredClients.length} ${filteredClients.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}`}
      headerFilters={
        <>
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nome, documento ou e-mail..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>

          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
          >
            <option value="ALL" className="bg-[#162B37] text-white">Todos os Tipos (PF e PJ)</option>
            <option value="PF" className="bg-[#162B37] text-white">Pessoa Física (PF)</option>
            <option value="PJ" className="bg-[#162B37] text-white">Pessoa Jurídica (PJ)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
          >
            <option value="ALL" className="bg-[#162B37] text-white">Todos os Status</option>
            <option value="ACTIVE" className="bg-[#162B37] text-white">Ativos</option>
            <option value="PROSPECT" className="bg-[#162B37] text-white">Prospects</option>
            <option value="INACTIVE" className="bg-[#162B37] text-white">Inativos</option>
          </select>
        </>
      }
      headerActions={
        <div className="flex items-center gap-2">
          <button
            onClick={exportClientsCsv}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/15 transition-all cursor-pointer font-serif"
            title="Exportar carteira em CSV"
          >
            <Download className="w-4 h-4 text-[#CBEBD8]" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-dex-coral hover:bg-dex-coral-hover text-white text-xs font-semibold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer font-serif"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Novo Cliente</span>
          </button>
        </div>
      }
    >
      {filteredClients.length === 0 ? (
        <EmptyState
          title="Nenhum cliente encontrado"
          description="Nenhum registro corresponde aos filtros pesquisados."
          icon={Users}
          actionLabel="Cadastrar Novo Cliente"
          onAction={() => setIsNewModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => {
            const clientCasesCount = userCases.filter(c => c.clientId === client.id).length;
            const cleanPhone = client.phone.replace(/\D/g, '');
            const whatsappUrl = `https://wa.me/55${cleanPhone}`;

            return (
              <div
                key={client.id}
                className="p-5 rounded-2xl bg-[#1A3342] border border-[#214154] hover:border-[#3D6C78] transition-all flex flex-col justify-between group shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 font-display font-bold">
                        {client.type === 'PJ' ? <Building className="w-5 h-5 text-dex-coral" /> : client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-display font-bold text-white truncate">
                          {client.name}
                        </h4>
                        <span className="text-[11px] text-[#A6C5CD] font-mono">
                          {client.document}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      client.status === 'ACTIVE'
                        ? 'bg-[#48BB78]/20 text-[#48BB78] border-[#48BB78]/40'
                        : client.status === 'PROSPECT'
                        ? 'bg-[#C48A5C]/20 text-[#C48A5C] border-[#C48A5C]/40'
                        : 'bg-white/10 text-[#C2D6DC] border-white/20'
                    }`}>
                      {client.status === 'ACTIVE' ? 'Ativo' : client.status === 'PROSPECT' ? 'Prospect' : 'Inativo'}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2 text-xs text-[#C2D6DC] border-t border-[#214154]/60">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-[#A6C5CD] shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#A6C5CD] shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                      {cleanPhone.length >= 10 && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#48BB78] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <MessageSquare className="w-3 h-3" />
                          WhatsApp
                        </a>
                      )}
                    </div>

                    {client.address && (
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#A6C5CD] shrink-0" />
                        <span className="truncate">
                          {typeof client.address === 'string' 
                            ? client.address 
                            : `${client.address.street}, ${client.address.number} - ${client.address.city}/${client.address.state}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#214154]/60 flex items-center justify-between">
                  <span className="text-xs text-[#A6C5CD]">
                    {clientCasesCount} {clientCasesCount === 1 ? 'processo' : 'processos'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingClient(client)}
                      title="Ver detalhes"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-[#A6C5CD] hover:text-white transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingClient(client)}
                      title="Editar"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-[#A6C5CD] hover:text-white transition-colors cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setClientToDelete(client)}
                      title="Excluir"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-dex-coral/20 text-[#A6C5CD] hover:text-dex-coral transition-colors cursor-pointer"
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

      {/* Modais */}
      <ClientModal
        isOpen={isNewModalOpen || !!editingClient}
        onClose={() => {
          setIsNewModalOpen(false);
          setEditingClient(null);
        }}
        initialClient={editingClient || undefined}
      />

      {viewingClient && (
        <ClientDetailModal
          client={viewingClient}
          isOpen={!!viewingClient}
          onClose={() => setViewingClient(null)}
          onEdit={() => {
            const cl = viewingClient;
            setViewingClient(null);
            setEditingClient(cl);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        onConfirm={() => {
          if (clientToDelete) {
            deleteClient(clientToDelete.id);
            setClientToDelete(null);
          }
        }}
        title="Excluir Cliente"
        message={`Deseja realmente remover o cliente "${clientToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, excluir cliente"
      />
    </InternalPageLayout>
  );
};
