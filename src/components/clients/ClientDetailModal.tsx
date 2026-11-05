import React from 'react';
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  FolderKanban, 
  FileText, 
  DollarSign, 
  Calendar, 
  MessageSquare, 
  Edit3,
  Building
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Client } from '../../types';
import { useData } from '../../context/DataContext';
import { CaseStatusBadge } from '../common/Badge';

interface ClientDetailModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  isOpen,
  onClose,
  onEdit
}) => {
  const { cases, documents, financial, lawyers } = useData();

  const clientCases = cases.filter(c => c.clientId === client.id);
  const clientDocs = documents.filter(d => d.clientId === client.id);
  const clientFinancial = financial.filter(f => f.clientId === client.id);
  const lawyer = lawyers.find(l => l.id === client.linkedLawyerId);

  const cleanPhone = client.phone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/55${cleanPhone}`;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const totalValue = clientCases.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client.name}
      subtitle={`Ficha Cadastral do Cliente (${client.type})`}
      maxWidth="4xl"
      icon={<Users className="w-5 h-5 text-dex-coral" />}
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="p-5 rounded-2xl bg-[#1A3342] border border-[#214154] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-dex-navy-950 border border-white/10 text-white font-mono">
                {client.document}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                client.status === 'ACTIVE'
                  ? 'bg-[#48BB78]/20 text-[#48BB78] border-[#48BB78]/40'
                  : client.status === 'PROSPECT'
                  ? 'bg-[#C48A5C]/20 text-[#C48A5C] border-[#C48A5C]/40'
                  : 'bg-white/10 text-[#C2D6DC] border-white/20'
              }`}>
                {client.status === 'ACTIVE' ? 'Ativo' : client.status === 'PROSPECT' ? 'Prospect' : 'Inativo'}
              </span>
            </div>
            <p className="text-xs text-[#A6C5CD]">Cliente desde: {client.createdAt}</p>
          </div>

          <div className="flex items-center gap-2.5">
            {cleanPhone.length >= 10 && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#48BB78] hover:bg-[#3FA066] text-white text-xs font-semibold rounded-xl shadow transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}

            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-dex-coral hover:bg-dex-coral-hover text-white text-xs font-bold rounded-xl shadow transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Columns Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#1A3342]/70 border border-[#214154] space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A6C5CD]">
              Canais de Contato
            </h4>
            <div className="space-y-1.5 text-xs text-white">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-dex-coral" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-dex-coral" />
                <span>{client.phone}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1A3342]/70 border border-[#214154] space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A6C5CD]">
              Endereço Registrado
            </h4>
            <div className="text-xs text-white">
              <p>{client.address.street}, nº {client.address.number} {client.address.complement && `(${client.address.complement})`}</p>
              <p className="text-[#A6C5CD]">{client.address.neighborhood} • {client.address.city}/{client.address.state} • CEP {client.address.zipCode}</p>
            </div>
          </div>
        </div>

        {/* Processos Vinculados */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#214154] pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-dex-coral" />
              Processos da Carteira ({clientCases.length})
            </h4>
            <span className="text-xs text-[#A6C5CD]">Valor Total: {formatCurrency(totalValue)}</span>
          </div>

          {clientCases.length === 0 ? (
            <p className="text-xs text-[#A6C5CD] py-4 text-center">
              Nenhum processo ativo no momento para este cliente.
            </p>
          ) : (
            <div className="space-y-2">
              {clientCases.map(c => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-[#1A3342] border border-[#214154] flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CaseStatusBadge status={c.status} />
                      <span className="text-xs font-mono font-bold text-white">{c.caseNumber}</span>
                    </div>
                    <p className="text-xs text-white">{c.actionType}</p>
                  </div>
                  <span className="text-xs font-bold text-white">{formatCurrency(c.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
