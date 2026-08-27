import React, { useState, useEffect } from 'react';
import { UserCheck, Scale } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Lawyer } from '../../types';
import { useData } from '../../context/DataContext';

interface LawyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lawyerToEdit?: Lawyer | null;
}

export const LawyerModal: React.FC<LawyerModalProps> = ({
  isOpen,
  onClose,
  lawyerToEdit
}) => {
  const { addLawyer, updateLawyer } = useData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [oab, setOab] = useState('');
  const [roleTitle, setRoleTitle] = useState('Advogado Associado');
  const [specialtiesText, setSpecialtiesText] = useState('Direito Civil, Direito do Trabalho');
  const [status, setStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'>('ACTIVE');

  useEffect(() => {
    if (lawyerToEdit) {
      setName(lawyerToEdit.name);
      setEmail(lawyerToEdit.email);
      setPhone(lawyerToEdit.phone);
      setOab(lawyerToEdit.oab);
      setRoleTitle(lawyerToEdit.roleTitle);
      setSpecialtiesText(lawyerToEdit.specialties.join(', '));
      setStatus(lawyerToEdit.status);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setOab('');
      setRoleTitle('Advogado Associado');
      setSpecialtiesText('Direito Civil, Direito do Trabalho');
      setStatus('ACTIVE');
    }
  }, [lawyerToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !oab.trim()) {
      alert('Por favor, preencha os campos obrigatórios (*).');
      return;
    }

    const specialties = specialtiesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      userId: lawyerToEdit?.userId || `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      oab: oab.trim().toUpperCase(),
      roleTitle: roleTitle.trim(),
      specialties,
      status
    };

    if (lawyerToEdit) {
      updateLawyer(lawyerToEdit.id, payload);
    } else {
      addLawyer(payload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lawyerToEdit ? 'Editar Advogado' : 'Novo Advogado'}
      subtitle="Cadastro de membro do corpo jurídico e credencial OAB"
      maxWidth="2xl"
      icon={<UserCheck className="w-5 h-5 text-brand-400" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Dr. Fernando Vasconcelos"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Inscrição OAB (com UF) *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: 123.456/SP"
              value={oab}
              onChange={e => setOab(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              E-mail Institucional *
            </label>
            <input
              type="email"
              required
              placeholder="advogado@dexjuridico.adv.br"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Telefone / WhatsApp
            </label>
            <input
              type="text"
              placeholder="(11) 98765-4321"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cargo / Papel na Banca
            </label>
            <input
              type="text"
              placeholder="Ex: Sócio Fundador, Associado Sênior"
              value={roleTitle}
              onChange={e => setRoleTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Status Operacional
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="ACTIVE">Ativo / Regular</option>
              <option value="ON_LEAVE">Licenciado / Ausente</option>
              <option value="INACTIVE">Inativo</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Especialidades & Áreas de Atuação (separadas por vírgula)
          </label>
          <input
            type="text"
            placeholder="Ex: Direito do Trabalho, Contratos, Cível, Tributário"
            value={specialtiesText}
            onChange={e => setSpecialtiesText(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
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
            className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all"
          >
            {lawyerToEdit ? 'Salvar Alterações' : 'Cadastrar Advogado'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
