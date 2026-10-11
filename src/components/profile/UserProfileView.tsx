import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Camera, 
  Trash2, 
  Save, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Building2, 
  Award,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

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
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-brand-400" />
          Meu Perfil e Foto
        </h2>
        <p className="text-xs text-slate-400">
          Gerencie sua foto de exibição, informações profissionais e dados de contato no Dex
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Cartão de Foto & Avatar */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Foto de Identificação
          </h3>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt={userName}
                  className="w-28 h-28 rounded-full object-cover border-2 border-brand-500/50 shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-[#C69255] text-white flex items-center justify-center font-bold text-3xl shadow-xl border-2 border-[#C69255]/40">
                  {userInitial}
                </div>
              )}

              <label 
                htmlFor="profile-photo-upload" 
                className="absolute bottom-0 right-0 p-2.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white cursor-pointer shadow-lg transition-transform hover:scale-105"
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
              <p className="text-sm font-bold text-white">{userName}</p>
              <p className="text-xs text-brand-300 font-medium mt-0.5">{roleBadgeLabel}</p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">{userEmail}</p>
            </div>

            {photoError && (
              <div className="flex items-center gap-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-left w-full">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{photoError}</span>
              </div>
            )}

            <div className="flex flex-col w-full gap-2 pt-2 border-t border-slate-800">
              {isPhotoChanged && (
                <button
                  type="button"
                  onClick={handleSavePhoto}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Check className="w-4 h-4" />
                  Salvar Nova Foto
                </button>
              )}

              {photoPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 text-xs font-semibold rounded-xl border border-slate-700/60 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remover Foto
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Coluna 2: Formulário de Dados Cadastrais */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white">Informações Profissionais</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Seus dados são visíveis aos membros da sua banca e são incluídos nos relatórios e publicações.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Número de Inscrição na OAB
                </label>
                <input
                  type="text"
                  placeholder="Ex: 245.890/SP"
                  value={userOab}
                  onChange={e => setUserOab(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  E-mail Institucional (Identificador)
                </label>
                <input
                  type="email"
                  disabled
                  value={userEmail}
                  className="w-full px-3.5 py-2.5 bg-slate-800/40 border border-slate-800 rounded-xl text-xs text-slate-400 cursor-not-allowed font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">O e-mail de acesso não pode ser alterado diretamente.</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={userPhone}
                  onChange={e => setUserPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-400" />
                Vínculo Institucional
              </span>
              <p className="text-xs text-slate-300 font-medium">
                {currentUser?.officeName || 'Advocacia Individual / Autônoma'}
              </p>
              <p className="text-[11px] text-slate-400">
                Papel no sistema: <strong className="text-white">{roleBadgeLabel}</strong>
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all"
              >
                <Save className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
