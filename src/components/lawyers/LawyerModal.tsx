import React, { useState, useEffect } from 'react';
import { UserCheck, Camera, Trash2, UserPlus, Link2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { PasswordInput } from '../common/PasswordInput';
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
        showToast('Advogado vinculado com sucesso à equipe!', 'success');
        onClose();
      } else {
        showToast(res.error || 'Advogado não encontrado no sistema.', 'error');
      }
    } catch {
      showToast('Erro ao vincular advogado.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !oab.trim()) {
      showToast('Preencha os campos obrigatórios (*).', 'warning');
      return;
    }

    const specialties = specialtiesText
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    setIsSubmitting(true);

    try {
      if (lawyerToEdit) {
        updateLawyer(lawyerToEdit.id, {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          oab: oab.trim().toUpperCase(),
          roleTitle: roleTitle.trim(),
          specialties: specialties.length > 0 ? specialties : ['Geral'],
          status,
          avatarUrl: photoPreview
        });
        showToast('Dados do advogado atualizados com sucesso!', 'success');
        onClose();
      } else {
        const res = await addLawyerByOffice({
          name: name.trim(),
          email: email.trim(),
          oab: oab.trim().toUpperCase(),
          phone: phone.trim(),
          password: password || 'Dex@2026',
          roleTitle: roleTitle.trim(),
          specialties: specialties.length > 0 ? specialties : ['Geral'],
          avatarUrl: photoPreview
        });

        if (res.success) {
          showToast('Advogado adicionado à equipe com sucesso!', 'success');
          onClose();
        } else {
          showToast(res.error || 'Erro ao cadastrar advogado.', 'error');
        }
      }
    } catch {
      showToast('Erro inesperado ao salvar advogado.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lawyerToEdit ? 'Editar Dados do Advogado' : 'Adicionar Membro à Equipe'}
      subtitle={lawyerToEdit ? 'Atualize as informações cadastrais do profissional' : 'Cadastre um novo advogado ou vincule um já existente'}
      maxWidth="2xl"
      icon={<UserCheck className="w-5 h-5 text-dex-coral" />}
    >
      {!lawyerToEdit && (
        <div className="flex items-center gap-2 p-1 bg-dex-navy-950 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setCreationMode('NEW')}
            className={`flex-1 py-2 text-xs font-serif font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              creationMode === 'NEW'
                ? 'bg-dex-coral text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Cadastrar Novo</span>
          </button>
          <button
            type="button"
            onClick={() => setCreationMode('LINK')}
            className={`flex-1 py-2 text-xs font-serif font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              creationMode === 'LINK'
                ? 'bg-dex-coral text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Vincular Existente</span>
          </button>
        </div>
      )}

      {creationMode === 'LINK' && !lawyerToEdit ? (
        <form onSubmit={handleLinkSubmit} className="space-y-4">
          <div className="p-4 rounded-xl bg-dex-navy-950 border border-dex-teal-500/20 text-xs text-slate-300 leading-relaxed font-serif">
            Digite o e-mail ou número de inscrição na OAB do advogado para vinculá-lo imediatamente ao seu escritório.
          </div>

          <div>
            <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
              E-mail ou OAB do Advogado *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: advogado@exemplo.adv.br ou SP123456"
              value={existingIdentifier}
              onChange={e => setExistingIdentifier(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs text-slate-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-dex-coral hover:bg-dex-coral/90 disabled:opacity-50 text-white text-xs font-serif font-bold rounded-xl shadow-lg transition-all"
            >
              {isSubmitting ? 'Vinculando...' : 'Vincular ao Escritório'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Preview & Upload */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-dex-navy-950 border border-white/5">
            <div className="relative">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Prévia"
                  className="w-14 h-14 rounded-full object-cover border-2 border-dex-coral"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-dex-kpi-peach text-dex-navy-950 font-serif font-bold text-xl flex items-center justify-center">
                  {name ? name.charAt(0) : <UserCheck className="w-6 h-6" />}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dex-slate hover:bg-slate-700 text-white text-xs font-serif rounded-xl cursor-pointer transition-colors">
                <Camera className="w-3.5 h-3.5" />
                <span>Escolher Foto</span>
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
                  className="text-xs text-dex-coral hover:underline ml-3 font-serif"
                >
                  Remover
                </button>
              )}
              {photoError && <p className="text-[11px] text-dex-coral font-serif">{photoError}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              />
            </div>

            <div>
              <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                Número OAB *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: SP 123.456"
                value={oab}
                onChange={e => setOab(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              />
            </div>

            <div>
              <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                E-mail Profissional *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              />
            </div>

            <div>
              <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              />
            </div>

            <div>
              <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                Cargo / Função
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={e => setRoleTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              />
            </div>

            <div>
              <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              >
                <option value="ACTIVE">Ativo</option>
                <option value="ON_LEAVE">Licença</option>
                <option value="INACTIVE">Inativo</option>
              </select>
            </div>

            {!lawyerToEdit && (
              <div className="md:col-span-2">
                <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                  Senha Provisória de Acesso
                </label>
                <PasswordInput
                  placeholder="Deixe em branco para gerar aleatória"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                Especialidades (separadas por vírgula)
              </label>
              <input
                type="text"
                value={specialtiesText}
                onChange={e => setSpecialtiesText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs text-slate-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-dex-coral hover:bg-dex-coral/90 disabled:opacity-50 text-white text-xs font-serif font-bold rounded-xl shadow-lg transition-all"
            >
              {isSubmitting ? 'Salvando...' : lawyerToEdit ? 'Salvar Alterações' : 'Cadastrar Advogado'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
