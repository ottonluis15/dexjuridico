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
  Lock,
  ShieldAlert,
  AlertTriangle,
  Copy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { DecorativeBars } from '../common/DecorativeBars';
import { PasswordInput } from '../common/PasswordInput';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';

export const UserProfileView: React.FC = () => {
  const { currentUser, updateProfilePhoto, updateProfileData, requestEmailChange, changePassword, deleteMyAccount } = useAuth();
  const { showToast } = useData();

  // Form states - Perfil do Usuário
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [userEmail, setUserEmail] = useState(currentUser?.email || '');
  const [newEmailInput, setNewEmailInput] = useState('');
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [userOab, setUserOab] = useState(currentUser?.oab || '');
  const [userPhone, setUserPhone] = useState(currentUser?.phone || '');

  // Estados para alteração de senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Estados para exclusão de conta (Zona de Perigo)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [copiedOfficeCode, setCopiedOfficeCode] = useState(false);

  const resolvedOfficeCode = currentUser?.officeCode || (currentUser?.officeId === 'off_dex_principal' || !currentUser?.isIndependent ? 'DEX-1001' : undefined);

  const handleCopyOfficeCode = () => {
    if (!resolvedOfficeCode) return;
    navigator.clipboard.writeText(resolvedOfficeCode);
    setCopiedOfficeCode(true);
    showToast('Código DEX copiado para a área de transferência!', 'success');
    setTimeout(() => setCopiedOfficeCode(false), 2500);
  };

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Por favor, informe a senha atual.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('A nova senha deve ter no mínimo 8 caracteres.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('A confirmação da nova senha não coincide.', 'error');
      return;
    }
    setIsUpdatingPassword(true);
    const res = await changePassword(currentPassword, newPassword);
    setIsUpdatingPassword(false);
    if (res.success) {
      showToast('Senha alterada com sucesso!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      showToast(res.error || 'Erro ao alterar a senha.', 'error');
    }
  };

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

            {resolvedOfficeCode && !currentUser?.isIndependent && (
              <div className="mt-3 flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-dex-navy-800 border border-dex-peach/30 w-full shadow-inner">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8F8A87] font-serif">Código DEX do Escritório</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-dex-peach tracking-widest">{resolvedOfficeCode}</span>
                  <button
                    type="button"
                    onClick={handleCopyOfficeCode}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-dex-peach hover:text-white transition-colors"
                    title="Copiar Código DEX"
                    aria-label="Copiar Código DEX do escritório"
                  >
                    {copiedOfficeCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-[#8F8A87] text-center font-serif leading-tight">
                  Código para novos advogados se vincularem à sua banca
                </span>
              </div>
            )}

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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-serif italic text-[#C2D6DC] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    E-mail Institucional
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewEmailInput('');
                      setShowEmailChangeModal(true);
                    }}
                    className="text-[11px] text-dex-coral hover:underline font-serif cursor-pointer"
                  >
                    Alterar e-mail
                  </button>
                </div>
                <input
                  type="email"
                  disabled
                  value={userEmail}
                  className="w-full px-3.5 py-2.5 bg-dex-navy-950 text-slate-300 font-serif rounded-xl text-xs border border-white/5 cursor-not-allowed"
                />
                {currentUser?.pendingEmail ? (
                  <div className="mt-1.5 p-2 rounded-lg bg-dex-coral/15 border border-dex-coral/30 text-[11px] text-dex-coral font-serif">
                    <strong>Confirmação pendente:</strong> enviamos um link para <u>{currentUser.pendingEmail}</u>. A troca só será efetivada após a confirmação.
                  </div>
                ) : (
                  <span className="text-[10px] text-[#8F8A87] mt-1 block font-serif">
                    A alteração de e-mail exige confirmação por link enviado ao novo endereço.
                  </span>
                )}
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

            {resolvedOfficeCode && !currentUser?.isIndependent && (
              <div className="p-4 rounded-xl bg-dex-navy-950/80 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-dex-peach/15 text-dex-peach flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-serif font-bold text-white">
                      {currentUser?.officeName || 'Moreira & Associados Advocacia'}
                    </p>
                    <p className="text-[11px] text-[#8F8A87] font-serif">
                      Código de vínculo: <strong className="text-dex-peach font-mono">{resolvedOfficeCode}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyOfficeCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dex-navy-800 hover:bg-dex-navy-700 text-dex-peach hover:text-white text-xs font-serif border border-white/10 transition-colors"
                >
                  {copiedOfficeCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedOfficeCode ? 'Código Copiado!' : 'Copiar Código DEX'}</span>
                </button>
              </div>
            )}

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

      {/* CARD: SEGURANÇA E ALTERAÇÃO DE SENHA */}
      <div className="bg-dex-navy-900 border border-white/5 rounded-[24px] p-6 sm:p-8 shadow-2xl relative overflow-hidden font-serif">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-dex-teal/20 text-dex-teal flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-white">Segurança e Credencial</h3>
            <p className="text-xs text-[#C2D6DC] italic">Altere sua senha de acesso com validação forense e criptografia de ponta a ponta.</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
              Senha Atual
            </label>
            <PasswordInput
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Digite sua senha atual"
              autoComplete="current-password"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                Nova Senha
              </label>
              <PasswordInput
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                Confirmar Nova Senha
              </label>
              <PasswordInput
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repita a nova senha"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-6 py-2.5 bg-dex-slate-dark hover:bg-dex-slate-darkHover text-white text-xs font-serif font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{isUpdatingPassword ? 'Atualizando...' : 'Atualizar Senha'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ZONA DE PERIGO: EXCLUSÃO DE CONTA (LGPD) */}
      <div className="bg-red-500/5 dark:bg-red-950/20 border-2 border-red-500/40 dark:border-red-500/60 rounded-[24px] p-6 sm:p-8 shadow-xl relative overflow-hidden font-serif">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm uppercase tracking-wider">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>Zona de Perigo • Exclusão de Conta</span>
            </div>
            <h4 className="text-lg font-serif font-bold text-dex-navy-950 dark:text-white">
              Excluir minha conta definitivamente
            </h4>
            <p className="text-xs text-dex-support dark:text-[#A6C5CD] leading-relaxed">
              {currentUser?.role === 'ADMIN' && !currentUser.isIndependent ? (
                <span>
                  Como sócio administrador titular, a exclusão da sua conta pessoal exige a prévia transferência de titularidade ou a exclusão do escritório inteiro em Configurações.
                </span>
              ) : currentUser?.role === 'LAWYER' && !currentUser.isIndependent ? (
                <span>
                  Sua conta pessoal será permanentemente excluída e suas credenciais revogadas. Os processos e dados institucionais que você cadastrou permanecerão custodiados com o escritório.
                </span>
              ) : (
                <span>
                  Sua conta e todos os dados associados (clientes, processos, prazos e finanças) serão permanentemente expurgados em estrita observância à LGPD.
                </span>
              )}
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setShowDeleteAccountModal(true)}
              className="min-h-[44px] px-6 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir minha conta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Reforçado de Confirmação de Exclusão de Conta */}
      <DeleteConfirmationModal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        title="Excluir Minha Conta"
        subtitle={currentUser?.email}
        description={
          currentUser?.role === 'ADMIN' && !currentUser.isIndependent ? (
            <p>
              Você é o titular de <strong>{currentUser.officeName || 'seu escritório'}</strong>. Para excluir sua conta pessoal, transfira a titularidade para outro sócio ou encerre o escritório na aba de configurações.
            </p>
          ) : currentUser?.role === 'LAWYER' && !currentUser.isIndependent ? (
            <p>
              Você está prestes a excluir sua conta pessoal do Dex. Suas credenciais de acesso serão revogadas e todas as sessões encerradas. Os processos e clientes vinculados permanecerão sob custódia do escritório <strong>{currentUser.officeName}</strong>.
            </p>
          ) : (
            <p>
              Você está prestes a excluir definitivamente sua conta de advogado autônomo. Todos os seus clientes, processos, prazos, registros financeiros e arquivos serão apagados.
            </p>
          )
        }
        keywordRequired="EXCLUIR"
        keywordLabel={
          <span>
            Para autorizar o expurgo forense, digite a palavra <strong className="font-mono text-red-600 dark:text-red-400">EXCLUIR</strong>:
          </span>
        }
        onConfirm={async (pwd, kw) => {
          return await deleteMyAccount(pwd, kw);
        }}
      />

      {/* Modal de Alteração de E-mail com Confirmação Obrigatória */}
      {showEmailChangeModal && (
        <div className="fixed inset-0 z-50 bg-dex-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dex-peach rounded-[28px] max-w-md w-full p-6 sm:p-8 border border-[#D5B093] shadow-2xl relative font-serif text-dex-navy-950">
            <h3 className="text-xl font-display font-bold text-dex-navy-950 mb-1">
              Alterar E-mail Institucional
            </h3>
            <p className="text-xs text-dex-support mb-4 italic">
              Por segurança, um link de confirmação será enviado ao novo endereço antes da efetivação da troca.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const clean = newEmailInput.trim().toLowerCase();
                if (!clean || clean === userEmail.toLowerCase()) {
                  showToast('O novo e-mail deve ser diferente do e-mail atual.', 'error');
                  return;
                }
                setIsChangingEmail(true);
                const res = await requestEmailChange(clean);
                setIsChangingEmail(false);
                if (res.success) {
                  showToast(res.message || 'Confirmação enviada para o novo e-mail!', 'success');
                  setShowEmailChangeModal(false);
                } else {
                  showToast(res.error || 'Erro ao solicitar alteração de e-mail.', 'error');
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="block text-xs italic font-serif text-dex-navy-950">
                  Novo endereço de e-mail
                </label>
                <input
                  type="email"
                  required
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  placeholder="novo.email@escritorio.adv.br"
                  className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-slate-dark"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailChangeModal(false)}
                  className="px-4 py-2 text-xs text-dex-support hover:text-dex-navy-950 cursor-pointer italic"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isChangingEmail}
                  className="px-5 py-2.5 bg-dex-slate-dark hover:bg-dex-slate-darkHover text-white text-xs font-semibold rounded-xl shadow cursor-pointer disabled:opacity-60"
                >
                  {isChangingEmail ? 'Enviando...' : 'Enviar confirmação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
