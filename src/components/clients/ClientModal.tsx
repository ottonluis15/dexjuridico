import React, { useState, useEffect } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Client, ClientType, ClientStatus } from '../../types';
import { useData } from '../../context/DataContext';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  clientToEdit
}) => {
  const { addClient, updateClient, lawyers } = useData();

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
    if (clientToEdit) {
      setName(clientToEdit.name);
      setType(clientToEdit.type);
      setDocument(clientToEdit.document);
      setEmail(clientToEdit.email);
      setPhone(clientToEdit.phone);
      setStreet(clientToEdit.address.street);
      setNumber(clientToEdit.address.number);
      setComplement(clientToEdit.address.complement || '');
      setNeighborhood(clientToEdit.address.neighborhood);
      setCity(clientToEdit.address.city);
      setState(clientToEdit.address.state);
      setZipCode(clientToEdit.address.zipCode);
      setNotes(clientToEdit.notes || '');
      setStatus(clientToEdit.status);
      setLinkedLawyerId(clientToEdit.linkedLawyerId || '');
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
  }, [clientToEdit, isOpen, lawyers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !document.trim() || !email.trim() || !phone.trim()) {
      alert('Por favor, preencha os dados de identificação obrigatórios (*).');
      return;
    }

    const payload = {
      name: name.trim(),
      type,
      document: document.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: {
        street: street.trim() || 'Logradouro não informado',
        number: number.trim() || 'S/N',
        complement: complement.trim(),
        neighborhood: neighborhood.trim() || 'Centro',
        city: city.trim() || 'São Paulo',
        state: state.trim() || 'SP',
        zipCode: zipCode.trim() || '00000-000'
      },
      notes: notes.trim(),
      status,
      linkedLawyerId: linkedLawyerId || undefined
    };

    if (clientToEdit) {
      updateClient(clientToEdit.id, payload);
    } else {
      addClient(payload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={clientToEdit ? 'Editar Cliente' : 'Novo Cliente'}
      subtitle="Cadastro de cliente pessoa física ou jurídica no escritório"
      maxWidth="3xl"
      icon={<UserPlus className="w-5 h-5 text-emerald-400" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo & Nome */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tipo de Pessoa *
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as ClientType)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="PF">Pessoa Física (CPF)</option>
              <option value="PJ">Pessoa Jurídica (CNPJ)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {type === 'PF' ? 'Nome Completo *' : 'Razão Social / Nome Fantasia *'}
            </label>
            <input
              type="text"
              required
              placeholder={type === 'PF' ? 'Ex: Carlos Eduardo Silveira' : 'Ex: TechVanguard Soluções Digitais Ltda'}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        {/* Documento, Email, Telefone */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {type === 'PF' ? 'CPF *' : 'CNPJ *'}
            </label>
            <input
              type="text"
              required
              placeholder={type === 'PF' ? '000.000.000-00' : '00.000.000/0001-00'}
              value={document}
              onChange={e => setDocument(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              E-mail de Contato *
            </label>
            <input
              type="email"
              required
              placeholder="cliente@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Telefone / WhatsApp *
            </label>
            <input
              type="text"
              required
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        {/* Endereço */}
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
          <p className="text-xs font-bold text-slate-300">Endereço Residencial / Comercial</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-slate-400 mb-1">Logradouro / Rua</label>
              <input
                type="text"
                placeholder="Ex: Av. Paulista"
                value={street}
                onChange={e => setStreet(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Número</label>
              <input
                type="text"
                placeholder="1000"
                value={number}
                onChange={e => setNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Complemento</label>
              <input
                type="text"
                placeholder="Apto 42 / Bloco B"
                value={complement}
                onChange={e => setComplement(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Bairro</label>
              <input
                type="text"
                placeholder="Bela Vista"
                value={neighborhood}
                onChange={e => setNeighborhood(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Cidade / UF</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="São Paulo"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="SP"
                  maxLength={2}
                  value={state}
                  onChange={e => setState(e.target.value.toUpperCase())}
                  className="w-14 px-2 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-center text-white focus:outline-none uppercase"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">CEP</label>
              <input
                type="text"
                placeholder="01310-100"
                value={zipCode}
                onChange={e => setZipCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Advogado Responsável & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Advogado de Relacionamento
            </label>
            <select
              value={linkedLawyerId}
              onChange={e => setLinkedLawyerId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Nenhum específico</option>
              {lawyers.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.roleTitle})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Status do Cliente
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as ClientStatus)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="ACTIVE">Ativo (Com demandas)</option>
              <option value="PROSPECT">Prospect / Em Negociação</option>
              <option value="INACTIVE">Inativo</option>
            </select>
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Notas & Observações do Cliente
          </label>
          <textarea
            rows={2}
            placeholder="Informações relevantes sobre perfil, histórico de atendimento..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
          >
            {clientToEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
