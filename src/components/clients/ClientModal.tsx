import React, { useState, useEffect } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Client, ClientType, ClientStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: Client | null;
  initialClient?: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  clientToEdit,
  initialClient
}) => {
  const activeClient = clientToEdit || initialClient || null;
  const { addClient, updateClient, lawyers } = useData();
  const { currentUser } = useAuth();

  const [name, setName] = useState('');
  const [type, setType] = useState<ClientType>('PF');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [zipCode, setZipCode] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ClientStatus>('ACTIVE');
  const [linkedLawyerId, setLinkedLawyerId] = useState('');

  useEffect(() => {
    if (activeClient) {
      setName(activeClient.name);
      setType(activeClient.type);
      setDocument(activeClient.document);
      setEmail(activeClient.email);
      setPhone(activeClient.phone);
      setStreet(activeClient.address.street);
      setNumber(activeClient.address.number);
      setComplement(activeClient.address.complement || '');
      setNeighborhood(activeClient.address.neighborhood);
      setCity(activeClient.address.city);
      setState(activeClient.address.state);
      setZipCode(activeClient.address.zipCode);
      setNotes(activeClient.notes || '');
      setStatus(activeClient.status);
      setLinkedLawyerId(activeClient.linkedLawyerId || '');
    } else {
      setName('');
      setType('PF');
      setDocument('');
      setEmail('');
      setPhone('');
      setStreet('');
      setNumber('');
      setComplement('');
      setNeighborhood('');
      setCity('São Paulo');
      setState('SP');
      setZipCode('');
      setNotes('');
      setStatus('ACTIVE');
      setLinkedLawyerId(lawyers[0]?.id || '');
    }
  }, [activeClient, isOpen, lawyers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !document.trim() || !email.trim() || !phone.trim()) {
      alert('Por favor, preencha todos os dados obrigatórios (*).');
      return;
    }

    const payload = {
      name: name.trim(),
      type,
      document: document.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: {
        street: street.trim() || 'Rua Principal',
        number: number.trim() || 'S/N',
        complement: complement.trim(),
        neighborhood: neighborhood.trim() || 'Centro',
        city: city.trim() || 'São Paulo',
        state: state.trim() || 'SP',
        zipCode: zipCode.trim() || '01000-000'
      },
      notes: notes.trim(),
      status,
      linkedLawyerId: linkedLawyerId || undefined
    };

    if (activeClient) {
      updateClient(activeClient.id, payload);
    } else {
      addClient(payload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activeClient ? 'Editar Cadastro do Cliente' : 'Cadastrar Novo Cliente'}
      subtitle={activeClient ? 'Atualize as informações cadastrais e contatos' : 'Preencha os dados civis ou societários'}
      maxWidth="3xl"
      icon={<UserPlus className="w-5 h-5 text-dex-coral" />}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tipo de Cliente (PF vs PJ) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setType('PF')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              type === 'PF'
                ? 'bg-dex-coral text-white shadow'
                : 'bg-white/10 text-[#C2D6DC] hover:text-white'
            }`}
          >
            Pessoa Física (CPF)
          </button>
          <button
            type="button"
            onClick={() => setType('PJ')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              type === 'PJ'
                ? 'bg-dex-coral text-white shadow'
                : 'bg-white/10 text-[#C2D6DC] hover:text-white'
            }`}
          >
            Pessoa Jurídica (CNPJ)
          </button>
        </div>

        {/* Linha 1: Nome / Razão Social e CPF/CNPJ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              {type === 'PF' ? 'Nome Completo*' : 'Razão Social / Nome Empresarial*'}
            </label>
            <input
              type="text"
              required
              placeholder={type === 'PF' ? 'Ex: Carlos Alberto da Silva' : 'Ex: Metalúrgica Progresso S/A'}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              {type === 'PF' ? 'CPF*' : 'CNPJ*'}
            </label>
            <input
              type="text"
              required
              placeholder={type === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
              value={document}
              onChange={e => setDocument(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-coral font-mono"
            />
          </div>
        </div>

        {/* Linha 2: E-mail e Telefone / WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              E-mail de Contato*
            </label>
            <input
              type="email"
              required
              placeholder="cliente@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Telefone / Celular (WhatsApp)*
            </label>
            <input
              type="tel"
              required
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>
        </div>

        {/* Linha 3: Endereço (Logradouro, Número, Cidade e UF) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Logradouro (Rua, Av, Travessa)
            </label>
            <input
              type="text"
              placeholder="Ex: Av. Rio Branco"
              value={street}
              onChange={e => setStreet(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Número / Sala
            </label>
            <input
              type="text"
              placeholder="Ex: 120, Sala 4"
              value={number}
              onChange={e => setNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>
        </div>

        {/* Linha 4: Advogado Responsável e Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Advogado da Banca Responsável
            </label>
            <select
              value={linkedLawyerId}
              onChange={e => setLinkedLawyerId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            >
              <option value="">Sem advogado específico</option>
              {lawyers.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.oab})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Status na Carteira
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as ClientStatus)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            >
              <option value="ACTIVE">Ativo com Processos</option>
              <option value="PROSPECT">Prospect / Em Negociação</option>
              <option value="INACTIVE">Inativo / Encerrado</option>
            </select>
          </div>
        </div>

        {/* Anotações */}
        <div className="space-y-1">
          <label className="block text-xs italic font-serif text-[#C2D6DC]">
            Observações Gerais & Histórico do Cliente
          </label>
          <textarea
            rows={2}
            placeholder="Informações adicionais, indicações, observações..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#214154]/70">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-dex-coral hover:bg-dex-coral-hover text-white text-xs font-bold shadow transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            {activeClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
