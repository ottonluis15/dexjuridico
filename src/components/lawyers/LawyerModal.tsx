import React, { useState, useEffect } from 'react';
import { UserCheck, Scale, Lock, Camera, Trash2, AlertTriangle, Eye, EyeOff, UserPlus, Link2, Search } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Lawyer } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

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
  const { updateLawyer, linkExistingLawyer, showToast } = useData();
  const { addLawyerByOffice } = useAuth();

  const [creationMode, setCreationMode] = useState<'NEW' | 'LINK'>('NEW');
  const [existingIdentifier, setExistingIdentifier] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [oab, setOab] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleTitle, setRoleTitle] = useState('Advogado Associado');
  const [specialtiesText, setSpecialtiesText] = useState('Direito Civil, Direito do Trabalho');
  const [status, setStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'>('ACTIVE');
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lawyerToEdit) {
      setName(lawyerToEdit.name);
      setEmail(lawyerToEdit.email);
      setPhone(lawyerToEdit.phone);
      setOab(lawyerToEdit.oab);
      setRoleTitle(lawyerToEdit.roleTitle);
      setSpecialtiesText(lawyerToEdit.specialties.join(', '));
      setStatus(lawyerToEdit.status);
      setPhotoPreview(lawyerToEdit.avatarUrl);
      setPassword('');
      setCreationMode('NEW');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setOab('');
      setPassword('');
      setRoleTitle('Advogado Associado');
      setSpecialtiesText('Direito Civil, Direito do Trabalho');
      setStatus('ACTIVE');
      setPhotoPreview(undefined);
      setExistingIdentifier('');
      setCreationMode('NEW');
    }
    setPhotoError(null);
  }, [lawyerToEdit, isOpen]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

      if (!validTypes.includes(file.type)) {
        setPhotoError('Formato inválido. Aceitos apenas JPG, PNG e WEBP.');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setPhotoError('A foto não pode exceder 2 MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingIdentifier.trim()) {
      showToast('Informe o e-mail ou número de inscrição OAB do advogado.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = linkExistingLawyer(existingIdentifier.trim());
      if (res.success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !oab.trim()) {
      showToast('Por favor, preencha os campos obrigatórios (*).', 'error');
      return;
    }

    if (!lawyerToEdit && (!password || password.length < 6)) {
      showToast('A senha inicial de acesso do advogado deve conter no mínimo 6 caracteres.', 'error');
      return;
    }

    const specialties = specialtiesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    setIsSubmitting(true);

    try {
      if (lawyerToEdit) {
        updateLawyer(lawyerToEdit.id, {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          oab: oab.trim().toUpperCase(),
          roleTitle: roleTitle.trim(),
          specialties,
          status,
          avatarUrl: photoPreview
        });
        showToast('Dados do advogado atualizados com sucesso.', 'success');
        onClose();
      } else {
        const res = await addLawyerByOffice({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          oab: oab.trim().toUpperCase(),
          phone: phone.trim(),
          password,
          roleTitle: roleTitle.trim(),
          specialties,
          avatarUrl: photoPreview
        });

        if (!res.success) {
          showToast(res.error || 'Erro ao cadastrar advogado.', 'error');
          setIsSubmitting(false);
          return;
        }

        showToast(`Advogado ${name} cadastrado e vinculado ao escritório com sucesso!`, 'success');
        onClose();
      }
    } catch {
      showToast('Ocorreu um erro ao salvar.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lawyerToEdit ? 'Editar Advogado' : 'Membro da Equipe do Escritório'}
      subtitle="Gerencie os advogados e associados vinculados à sua banca"
      maxWidth="2xl"
      icon={<UserCheck className="w-5 h-5 text-brand-400" />}
    >
      {/* Seletor de Modalidade: Novo Cadastro vs Vincular Já Cadastrado */}
      {!lawyerToEdit && (
        <div className="flex rounded-xl bg-slate-800/80 p-1 mb-5 border border-slate-700/60">
          <button
            type="button"
            onClick={() => setCreationMode('NEW')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              creationMode === 'NEW'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Novo Advogado</span>
          </button>
          <button
            type="button"
            onClick={() => setCreationMode('LINK')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              creationMode === 'LINK'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Vincular por E-mail / OAB</span>
          </button>
        </div>
      )}

      {/* MODALIDADE 1: VINCULAR ADVOGADO EXISTENTE */}
      {!lawyerToEdit && creationMode === 'LINK' ? (
        <form onSubmit={handleLinkSubmit} className="space-y-4">
          <div className="p-4 rounded-2xl bg-brand-950/30 border border-brand-800/40 text-xs text-brand-200 leading-relaxed">
            Informe o <strong>e-mail institucional</strong> ou a <strong>inscrição na OAB</strong> de um advogado já cadastrado no DEX para vinculá-lo à equipe da sua banca.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              E-mail ou Inscrição OAB do Advogado *
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="Ex: advogado@exemplo.adv.br ou 184920/SP"
                value={existingIdentifier}
                onChange={e => setExistingIdentifier(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              O advogado será adicionado à lista de membros e passará a ter acesso compartilhado aos processos distribuídos à equipe.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Vinculando...</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Vincular à Equipe</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* MODALIDADE 2: CADASTRAR OU EDITAR ADVOGADO */
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Foto do Advogado (Opcional) */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="relative">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Foto"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/50 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-400">
                  <Camera className="w-6 h-6" />
                </div>
              )}
            </div>

            <div className="space-y-1 flex-1">
              <span className="text-xs font-semibold text-white block">Foto de Perfil (Opcional)</span>
              <span className="text-[11px] text-slate-400 block">JPG, PNG ou WEBP • Máx 2 MB</span>
              <div className="flex items-center gap-2 pt-1">
                <label className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                  Escolher Arquivo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(undefined)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Remover foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {photoError && <span className="text-[11px] text-rose-400 block">{photoError}</span>}
            </div>
          </div>

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
              placeholder="advogado@escritorio.adv.br"
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

          {/* Senha de Acesso (só para novo cadastro) */}
          {!lawyerToEdit && (
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Senha Inicial de Acesso do Advogado *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                O advogado usará este e-mail e senha para fazer login no sistema e acessar seus processos.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cargo / Papel na Banca
            </label>
            <input
              type="text"
              placeholder="Ex: Advogado Associado, Sócio"
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
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : (lawyerToEdit ? 'Salvar Alterações' : 'Cadastrar e Vincular')}
          </button>
        </div>
      </form>
      )}
    </Modal>
  );
};
