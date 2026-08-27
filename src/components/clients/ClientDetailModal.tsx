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
  ExternalLink
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
      icon={<Users className="w-5 h-5 text-emerald-400" />}
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-white font-mono">
                {client.document}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                client.status === 'ACTIVE'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : client.status === 'PROSPECT'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {client.status === 'ACTIVE' ? 'Ativo' : client.status === 'PROSPECT' ? 'Prospect' : 'Inativo'}
              </span>
            </div>
            <p className="text-xs text-slate-400">Cliente desde: {client.createdAt}</p>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp
            </a>

            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Editar
              </button>
            )}
          </div>
        </div>

        {/* Contact & Address Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              Contatos & Relacionamento
            </h4>
            <p className="text-xs text-slate-200"><strong>E-mail:</strong> {client.email}</p>
            <p className="text-xs text-slate-200"><strong>Telefone:</strong> {client.phone}</p>
            {lawyer && (
              <p className="text-xs text-slate-200">
                <strong>Advogado Titular:</strong> {lawyer.name} ({lawyer.oab})
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Endereço Cadastral
            </h4>
            <p className="text-xs text-slate-200">
              {client.address.street}, {client.address.number} {client.address.complement && `(${client.address.complement})`}
            </p>
            <p className="text-xs text-slate-400">
              {client.address.neighborhood} - {client.address.city}/{client.address.state} • CEP: {client.address.zipCode}
            </p>
          </div>
        </div>

        {/* Observações */}
        {client.notes && (
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400 mb-1">Observações do Cliente</h4>
            <p className="text-xs text-slate-200 leading-relaxed">{client.notes}</p>
          </div>
        )}

        {/* Linked Lawsuits */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-brand-400" />
              Processos Vinculados ({clientCases.length})
            </h4>
            <span className="text-xs text-slate-400">
              Causa Total: <strong className="text-emerald-400">{formatCurrency(totalValue)}</strong>
            </span>
          </div>

          {clientCases.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
              Nenhum processo vinculado a este cliente no momento.
            </p>
          ) : (
            <div className="space-y-2">
              {clientCases.map(c => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-brand-300 block">{c.caseNumber}</span>
                    <span className="text-xs font-semibold text-white">{c.actionType}</span>
                    <p className="text-[10px] text-slate-400">{c.legalArea} • {c.court}</p>
                  </div>
                  <div className="text-right">
                    <CaseStatusBadge status={c.status} />
                    <span className="text-xs font-bold text-slate-200 block mt-1">{formatCurrency(c.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
