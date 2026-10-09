import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building2, 
  User, 
  ShieldCheck, 
  Save, 
  Sliders,
  Camera,
  Trash2,
  Check,
  AlertCircle,
  Database,
  Cloud,
  RefreshCw,
  FileDown,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Upload
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { LGPDCompliance } from '../lgpd/LGPDCompliance';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  isSupabaseConfigured, 
  testSupabaseConnection 
} from '../../services/supabaseClient';
import { supabaseService } from '../../services/supabaseService';
import { storageService } from '../../services/storageService';

export const SettingsView: React.FC = () => {
  const { currentUser, isAdmin, updateProfilePhoto, updateProfileData } = useAuth();
  const { showToast } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'general' | 'profile' | 'security' | 'integrations' | 'database'>('profile');

  // Form states - Sociedade
  const [officeName, setOfficeName] = useState(currentUser?.officeName || 'Dex Sociedade de Advogados');
  const [officeCnpj, setOfficeCnpj] = useState('12.345.678/0001-90');
  const [officeOab, setOfficeOab] = useState(currentUser?.oab || 'OAB/SP 45.890');
  const [officePhone, setOfficePhone] = useState(currentUser?.phone || '(11) 3450-8000');
  const [officeAddress, setOfficeAddress] = useState('Av. Paulista, 1500 - São Paulo/SP');

  // Form states - Perfil do Usuário
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [userEmail] = useState(currentUser?.email || '');
  const [userOab, setUserOab] = useState(currentUser?.oab || '');
  const [userPhone, setUserPhone] = useState(currentUser?.phone || '');

  // Foto de Perfil
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(currentUser?.avatarUrl);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isPhotoChanged, setIsPhotoChanged] = useState(false);

  // Estados - Banco de Dados & Nuvem (Supabase)
  const initialCreds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCreds.url);
  const [supabaseKey, setSupabaseKey] = useState(initialCreds.key);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [isSyncingDb, setIsSyncingDb] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleTestAndSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setDbStatus(null);
    setIsTestingDb(true);

    try {
      const res = await testSupabaseConnection(supabaseUrl, supabaseKey);
      setDbStatus(res);
      if (res.success) {
        saveSupabaseCredentials(supabaseUrl, supabaseKey);
        showToast('Credenciais do Supabase validadas e salvas com sucesso!', 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      setDbStatus({ success: false, message: 'Erro ao validar conexão com o Supabase.' });
      showToast('Falha na conexão com o banco de dados.', 'error');
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleSyncLocalToSupabase = async () => {
    setIsSyncingDb(true);
    setDbStatus(null);
    try {
      const localData = {
        users: storageService.getUsers(),
        clients: storageService.getClients(),
        lawyers: storageService.getLawyers(),
        cases: storageService.getCases(),
        deadlines: storageService.getDeadlines(),
        financial: storageService.getFinancial(),
        documents: storageService.getDocuments(),
        templates: storageService.getTemplates()
      };

      const res = await supabaseService.pushAllLocalDataToSupabase(localData);
      setDbStatus(res);
      if (res.success) {
        showToast('Todos os dados locais foram enviados para o Supabase com sucesso!', 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      setDbStatus({ success: false, message: err?.message || 'Falha ao sincronizar dados.' });
      showToast('Erro na sincronização em lote.', 'error');
    } finally {
      setIsSyncingDb(false);
    }
  };

  const handleExportBackup = () => {
    const jsonStr = storageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_dex_juridico_${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup JSON exportado com sucesso!', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const success = storageService.importAllData(reader.result as string);
          if (success) {
            showToast('Backup importado com sucesso! Recarregando dados...', 'success');
            setTimeout(() => window.location.reload(), 1200);
          } else {
            showToast('Arquivo de backup inválido.', 'error');
          }
        } catch {
          showToast('Erro ao processar o arquivo de backup.', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setUserName(currentUser.name);
      setUserOab(currentUser.oab || '');
      setUserPhone(currentUser.phone || '');
      setPhotoPreview(currentUser.avatarUrl);
      if (currentUser.officeName) setOfficeName(currentUser.officeName);
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

  const handleSaveOffice = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin) {
      updateProfileData({
        officeName: officeName.trim()
      });
      showToast('Informações do escritório salvas com sucesso!', 'success');
    }
  };

  const userInitial = (userName[0] || 'U').toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-400" />
            Configurações do Sistema
          </h2>
          <p className="text-xs text-slate-400">
            Gerencie seu perfil profissional, foto, dados institucionais e conformidade LGPD
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'profile'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <User className="w-4 h-4" />
          Meu Perfil & Foto
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveSubTab('general')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'general'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Dados da Sociedade / Escritório
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('security')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'security'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Segurança & LGPD
        </button>

        <button
          onClick={() => setActiveSubTab('integrations')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'integrations'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Integrações & IA
        </button>

        <button
          onClick={() => setActiveSubTab('database')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'database'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Database className="w-4 h-4" />
          Banco de Dados & Nuvem
        </button>
      </div>

      {/* Tab: Perfil & Foto (Tarefa 5) */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-sm font-bold text-white">Meu Perfil Profissional</h3>
            <p className="text-xs text-slate-400">
              Personalize sua foto de identificação e seus dados cadastrais
            </p>
          </div>

          {/* Gerenciador de Foto de Perfil */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative shrink-0">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt={userName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-500 shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#C69255] text-white flex items-center justify-center font-bold text-2xl shadow-lg border border-amber-500/30">
                  {userInitial}
                </div>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <div>
                <span className="text-xs font-bold text-white block">Foto do Perfil</span>
                <span className="text-[11px] text-slate-400 block">
                  Formatos aceitos: JPG, PNG ou WEBP. Tamanho máximo de 2 MB.
                </span>
              </div>

              {photoError && (
                <div className="flex items-center gap-1.5 text-[11px] text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{photoError}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-sm">
                  <Camera className="w-3.5 h-3.5" />
                  <span>{photoPreview ? 'Trocar Foto' : 'Enviar Foto'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>

                {isPhotoChanged && (
                  <button
                    type="button"
                    onClick={handleSavePhoto}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Foto</span>
                  </button>
                )}

                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover Foto</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Dados Pessoais e Profissionais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Nome Completo *</label>
              <input
                type="text"
                required
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">E-mail Institucional</label>
              <input
                type="email"
                disabled
                value={userEmail}
                className="w-full px-3.5 py-2.5 bg-slate-800/40 border border-slate-800 rounded-xl text-xs text-slate-400 cursor-not-allowed"
                title="O e-mail é a chave de login e não pode ser alterado diretamente"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Inscrição OAB / UF *</label>
              <input
                type="text"
                required
                value={userOab}
                onChange={e => setUserOab(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white uppercase font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Telefone / WhatsApp</label>
              <input
                type="text"
                value={userPhone}
                onChange={e => setUserPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Perfil de Acesso & Vínculo</label>
              <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl text-xs text-slate-300 flex items-center justify-between">
                <span>
                  {currentUser?.role === 'ADMIN' 
                    ? `👑 Administrador da Banca • ${currentUser.officeName || 'Escritório'}` 
                    : (currentUser?.isIndependent ? '⚖️ Advogado Autônomo' : `⚖️ Advogado Associado • ${currentUser?.officeName || 'Escritório'}`)}
                </span>
                {currentUser?.officeCode && (
                  <span className="font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                    Código do Escritório: {currentUser.officeCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações do Perfil</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab: Dados da Sociedade (Somente Escritório) */}
      {activeSubTab === 'general' && isAdmin && (
        <form onSubmit={handleSaveOffice} className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 max-w-3xl">
          <h3 className="text-sm font-bold text-white mb-2">Informações Institucionais do Escritório</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Razão Social / Nome da Banca</label>
              <input
                type="text"
                value={officeName}
                onChange={e => setOfficeName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">CNPJ da Sociedade</label>
              <input
                type="text"
                value={officeCnpj}
                onChange={e => setOfficeCnpj(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Registro OAB Sociedade</label>
              <input
                type="text"
                value={officeOab}
                onChange={e => setOfficeOab(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Telefone Comercial</label>
              <input
                type="text"
                value={officePhone}
                onChange={e => setOfficePhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Endereço Comercial</label>
              <input
                type="text"
                value={officeAddress}
                onChange={e => setOfficeAddress(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Dados da Sociedade</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab: Segurança & LGPD */}
      {activeSubTab === 'security' && (
        <LGPDCompliance />
      )}

      {/* Tab: Integrações */}
      {activeSubTab === 'integrations' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 max-w-3xl">
          <h3 className="text-sm font-bold text-white mb-2">Conectividade & Inteligência Artificial</h3>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Motor Dex AI (Triagem Jurídica & Jurisprudência)</p>
                <p className="text-[11px] text-slate-400">Ativado para triagem fática, resumo de documentos e estruturação de petições.</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Ativo
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Integração CNJ / Tribunais (PJe, e-SAJ, Projudi)</p>
                <p className="text-[11px] text-slate-400">Sincronização de andamentos processuais e publicação de intimações.</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Conectado
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Banco de Dados & Nuvem (Supabase) */}
      {activeSubTab === 'database' && (
        <div className="space-y-6 max-w-3xl">
          {/* Status Geral */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  isSupabaseConfigured()
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {isSupabaseConfigured()
                      ? 'Nuvem Conectada (Supabase / PostgreSQL)'
                      : 'Armazenamento Local (Navegador)'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isSupabaseConfigured()
                      ? 'Cadastros e dados sincronizados em tempo real entre todos os dispositivos.'
                      : 'Os dados estão salvos apenas neste navegador. Para salvar globalmente, conecte o Supabase.'}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                isSupabaseConfigured()
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {isSupabaseConfigured() ? 'Online • Nuvem' : 'Modo Offline / Local'}
              </span>
            </div>

            {dbStatus && (
              <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                dbStatus.success
                  ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/60 border border-rose-800 text-rose-200'
              }`}>
                {dbStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{dbStatus.message}</span>
              </div>
            )}
          </div>

          {/* Configuração Supabase */}
          <form onSubmit={handleTestAndSaveSupabase} className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                Conectar Banco de Dados Supabase
              </h3>
              <p className="text-xs text-slate-400">
                Insira as credenciais do seu projeto Supabase para habilitar salvamento na nuvem.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  URL do Projeto Supabase (Project URL)
                </label>
                <input
                  type="url"
                  placeholder="https://xyzabcdefg.supabase.co"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Chave Pública Anon (Anon Public Key)
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={e => setSupabaseKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isTestingDb}
                className="py-2.5 px-5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isTestingDb ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Testando Conexão...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar e Conectar Supabase</span>
                  </>
                )}
              </button>

              {isSupabaseConfigured() && (
                <button
                  type="button"
                  onClick={handleSyncLocalToSupabase}
                  disabled={isSyncingDb}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncingDb ? 'animate-spin' : ''}`} />
                  <span>{isSyncingDb ? 'Sincronizando...' : 'Enviar Dados Deste PC para o Supabase'}</span>
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2 text-xs text-slate-300 leading-relaxed">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                Como configurar no Vercel (Produção):
              </p>
              <ol className="list-decimal pl-4 space-y-1 text-slate-400 text-[11px]">
                <li>Acesse o dashboard do seu projeto no <strong>Vercel</strong> &gt; <strong>Settings</strong> &gt; <strong>Environment Variables</strong>.</li>
                <li>Adicione <code className="text-cyan-300 font-mono">VITE_SUPABASE_URL</code> com a URL do seu Supabase.</li>
                <li>Adicione <code className="text-cyan-300 font-mono">VITE_SUPABASE_ANON_KEY</code> com a chave anon pública.</li>
                <li>O script de criação de tabelas está no arquivo <code className="text-cyan-300 font-mono">supabase_schema.sql</code> na raiz do projeto.</li>
              </ol>
            </div>
          </form>

          {/* Backup e Exportação Manual */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileDown className="w-4 h-4 text-emerald-400" />
                Backup Manual e Transferência Entre Computadores
              </h3>
              <p className="text-xs text-slate-400">
                Baixe todos os dados em um arquivo JSON para transferir entre dispositivos ou restaurar a qualquer momento.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportBackup}
                className="py-2.5 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                Exportar Backup Completo (.JSON)
              </button>

              <label className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-cyan-400" />
                Importar Arquivo de Backup (.JSON)
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
