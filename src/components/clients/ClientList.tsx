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
  UserCheck
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Client, ClientType, ClientStatus } from '../../types';
import { ClientModal } from './ClientModal';
import { ClientDetailModal } from './ClientDetailModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';

export const ClientList: React.FC = () => {
  const { clients, userCases, deleteClient } = useData();
  const { isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.document.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);

    const matchesType = selectedType === 'ALL' || c.type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Carteira de Clientes</h2>
          <p className="text-xs text-slate-400">
            {filteredClients.length} {filteredClients.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome, documento ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="ALL">Todos os Tipos (PF e PJ)</option>
            <option value="PF">Pessoa Física (PF)</option>
            <option value="PJ">Pessoa Jurídica (PJ)</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="ALL">Todos os Status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="PROSPECT">Prospects</option>
            <option value="INACTIVE">Inativos</option>
          </select>
        </div>
      </div>

      {/* Grid of Client Cards */}
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
                onClick={() => setViewingClient(client)}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {client.type}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      client.status === 'ACTIVE'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : client.status === 'PROSPECT'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {client.status === 'ACTIVE' ? 'Ativo' : client.status === 'PROSPECT' ? 'Prospect' : 'Inativo'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {client.name}
                  </h3>

                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    {client.document}
                  </p>

                  <div className="space-y-1.5 mt-3 text-xs text-slate-300">
                    <p className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{client.phone}</span>
                    </p>
                    <p className="flex items-center gap-2 truncate text-slate-400 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{client.address.city}/{client.address.state}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">
                    📂 {clientCasesCount} {clientCasesCount === 1 ? 'processo' : 'processos'}
                  </span>

                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="Chamar no WhatsApp"
                      className="p-1.5 text-emerald-400 hover:bg-emerald-950/40 rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => setEditingClient(client)}
                      title="Editar cliente"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setClientToDelete(client)}
                        title="Excluir cliente"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New / Edit Client Modal */}
      <ClientModal
        isOpen={isNewModalOpen || !!editingClient}
        onClose={() => {
          setIsNewModalOpen(false);
          setEditingClient(null);
        }}
        clientToEdit={editingClient}
      />

      {/* View Details Modal */}
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

      {/* Delete Confirmation Dialog */}
      {clientToDelete && (
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
          message={`Tem certeza que deseja remover o cliente "${clientToDelete.name}" (${clientToDelete.document})? Todos os dados cadastrais serão removidos.`}
        />
      )}
    </div>
  );
};
