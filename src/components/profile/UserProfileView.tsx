import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Camera, 
  Trash2, 
  Save, 
  Check, 
  AlertCircle, 
  Mail, 
  Phone, 
  Building2, 
  Award,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DecorativeBars } from '../common/DecorativeBars';

export const UserProfileView: React.FC = () => {
  const { currentUser, updateProfilePhoto, updateProfileData } = useAuth();
  const { showToast } = useData();

  // Form states - Perfil do Usuário
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [userEmail] = useState(currentUser?.email || '');
  const [userOab, setUserOab] = useState(currentUser?.oab || '');
  const [userPhone, setUserPhone] = useState(currentUser?.phone || '');

  // Foto de Perfil
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(currentUser?.avatarUrl);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isPhotoChanged, setIsPhotoChanged] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUserName(currentUser.name);
      setUserOab(currentUser.oab || '');
      setUserPhone(currentUser.phone || '');
      setPhotoPreview(currentUser.avatarUrl);
    }
  }, [currentUser]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

      if (!validTypes.includes(file.type)) {
        setPhotoError('Formato inválido. Selecione um arquivo JPG, PNG ou WEBP.');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setPhotoError('A foto excede o limite máximo permitido de 2 MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
        setIsPhotoChanged(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    updateProfilePhoto(photoPreview);
    setIsPhotoChanged(false);
    showToast('Foto de perfil atualizada com sucesso!', 'success');
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(undefined);
    updateProfilePhoto(undefined);
    setIsPhotoChanged(false);
    showToast('Foto de perfil removida. O avatar padrão foi redefinido.', 'info');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      showToast('O nome não pode ficar em branco.', 'error');
      return;
    }

    updateProfileData({
      name: userName.trim(),
      oab: userOab.trim().toUpperCase(),
      phone: userPhone.trim()
    });

    if (isPhotoChanged) {
      updateProfilePhoto(photoPreview);
      setIsPhotoChanged(false);
    }

    showToast('Dados do perfil salvos com sucesso!', 'success');
  };

  const userInitial = (userName[0] || 'U').toUpperCase();

  const roleBadgeLabel = currentUser?.isSuperAdmin
    ? '👑 Administrador da Plataforma'
    : (currentUser?.role === 'ADMIN'
        ? '⚖️ Sócio / Administrador do Escritório'
        : (currentUser?.isIndependent ? '⚖️ Advogado Autônomo' : `⚖️ Advogado Associado • ${currentUser?.officeName || 'Escritório'}`));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <DecorativeBars className="mb-2" />
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            Meu Perfil e Foto
          </h2>
          <p className="text-xs text-[#8F8A87] font-serif mt-1">
            Gerencie sua foto de exibição, informações profissionais e dados de contato no Dex
          </p>
        </div>

        {/* Subtle crow background watermark */}
        <img
          src="/img/corvo1.png"
          alt=""
          aria-hidden="true"
          className="absolute right-0 bottom-0 w-32 opacity-10 pointer-events-none -mr-4 -mb-6"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Cartão de Foto & Avatar */}
        <div className="p-6 md:p-8 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-2xl space-y-6">
          <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-[#8F8A87]">
            Foto de Identificação
          </h3>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt={userName}
                  className="w-28 h-28 rounded-full object-cover border-2 border-dex-coral shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-dex-kpi-peach text-dex-navy-950 flex items-center justify-center font-serif font-bold text-3xl shadow-xl">
                  {userInitial}
                </div>
              )}

              <label 
                htmlFor="profile-photo-upload" 
                className="absolute bottom-0 right-0 p-2.5 rounded-full bg-dex-coral hover:bg-dex-coral/90 text-white cursor-pointer shadow-lg transition-transform hover:scale-105"
                title="Alterar foto de perfil"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="profile-photo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <p className="font-serif text-base font-bold text-white">{userName}</p>
              <p className="font-serif text-xs text-dex-peach mt-0.5">{roleBadgeLabel}</p>
              <p className="text-[11px] text-[#8F8A87] mt-1 font-serif">{userEmail}</p>
            </div>

            {photoError && (
              <div className="flex items-center gap-2 p-2 bg-dex-coral/20 border border-dex-coral/30 rounded-xl text-dex-coral text-xs text-left w-full font-serif">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{photoError}</span>
              </div>
            )}

            <div className="flex flex-col w-full gap-2 pt-3 border-t border-white/10">
              {isPhotoChanged && (
                <button
                  type="button"
                  onClick={handleSavePhoto}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-dex-coral hover:bg-dex-coral/90 text-white text-xs font-serif font-bold rounded-xl shadow-lg transition-all"
                >
                  <Check className="w-4 h-4" />
                  Salvar Nova Foto
                </button>
              )}

              {photoPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-dex-navy-800 hover:bg-dex-navy-700 text-[#8F8A87] hover:text-dex-coral text-xs font-serif rounded-xl border border-white/5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remover Foto
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Coluna 2: Formulário de Dados Cadastrais */}
        <div className="lg:col-span-2 p-6 md:p-8 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-2xl space-y-6">
          <div>
            <h3 className="font-serif text-base font-bold text-white">Informações Profissionais</h3>
            <p className="text-xs text-[#8F8A87] font-serif mt-1">
              Seus dados são visíveis aos membros da sua banca e são incluídos nos relatórios e publicações.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-serif italic text-[#C2D6DC] block mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
                />
              </div>

              <div>
                <label className="text-xs font-serif italic text-[#C2D6DC] block mb-1.5">
                  Número de Inscrição na OAB
                </label>
                <input
                  type="text"
                  placeholder="Ex: 245.890/SP"
                  value={userOab}
                  onChange={e => setUserOab(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-serif italic text-[#C2D6DC] block mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  E-mail Institucional (Identificador)
                </label>
                <input
                  type="email"
                  disabled
                  value={userEmail}
                  className="w-full px-3.5 py-2.5 bg-dex-navy-950 text-slate-400 font-serif rounded-xl text-xs border border-white/5 cursor-not-allowed"
                />
                <span className="text-[10px] text-[#8F8A87] mt-1 block font-serif">O e-mail de acesso não pode ser alterado diretamente.</span>
              </div>

              <div>
                <label className="text-xs font-serif italic text-[#C2D6DC] block mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Telefone / WhatsApp Profissional
                </label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={userPhone}
                  onChange={e => setUserPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-dex-coral hover:bg-dex-coral/90 text-white text-xs font-serif font-bold rounded-xl shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Informações</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
