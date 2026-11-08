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
  KeyRound, 
  Upload,
  Sun,
  Moon,
  Monitor,
  Palette
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { LGPDCompliance } from '../lgpd/LGPDCompliance';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  isSupabaseConfigured, 
  testSupabaseConnection 
} from '../../services/supabaseClient';
import { supabaseService } from '../../services/supabaseService';
import { storageService } from '../../services/storageService';
import { DecorativeBars } from '../common/DecorativeBars';

export const SettingsView: React.FC = () => {
  const { currentUser, isAdmin, updateProfilePhoto, updateProfileData } = useAuth();
  const { showToast } = useData();
  const { themeMode, setThemeMode, effectiveTheme } = useTheme();

  const [activeSubTab, setActiveSubTab] = useState<'database' | 'general' | 'profile' | 'appearance' | 'security' | 'integrations'>('database');

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
    if (currentUser?.isDemo) {
      showToast('Ação bloqueada: a conta de demonstração não pode alterar credenciais de banco de dados.', 'warning');
      return;
    }
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
    if (currentUser?.isDemo) {
      showToast('Ação bloqueada: a conta de demonstração não pode sincronizar dados com banco externo.', 'warning');
      return;
    }
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
    if (currentUser?.isDemo) {
      showToast('Ação bloqueada: a conta de demonstração não possui permissão para exportar dados.', 'warning');
      return;
    }
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
    if (currentUser?.isDemo) {
      showToast('Ação bloqueada: a conta de demonstração não possui permissão para importar dados.', 'warning');
      return;
    }
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
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <DecorativeBars className="mb-2" />
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            Configurações do Sistema
          </h2>
          <p className="text-xs text-[#8F8A87] font-serif mt-1">
            Painel administrativo reservado ao gerenciamento de integrações, nuvem, conformidade e perfil
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

      {/* Sub Tabs Pill Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-dex-navy-900 rounded-2xl border border-white/5">
        <button
          onClick={() => setActiveSubTab('database')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
            activeSubTab === 'database'
              ? 'bg-dex-coral text-white shadow-md'
              : 'text-[#8F8A87] hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Banco de Dados &amp; Nuvem</span>
        </button>

        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
            activeSubTab === 'profile'
              ? 'bg-dex-coral text-white shadow-md'
              : 'text-[#8F8A87] hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Meu Perfil &amp; Foto</span>
        </button>

        <button
          onClick={() => setActiveSubTab('appearance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
            activeSubTab === 'appearance'
              ? 'bg-dex-coral text-white shadow-md'
              : 'text-[#8F8A87] hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Aparência &amp; Tema</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveSubTab('general')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
              activeSubTab === 'general'
                ? 'bg-dex-coral text-white shadow-md'
                : 'text-[#8F8A87] hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Dados da Sociedade</span>
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
            activeSubTab === 'security'
              ? 'bg-dex-coral text-white shadow-md'
              : 'text-[#8F8A87] hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Segurança &amp; LGPD</span>
        </button>

        <button
          onClick={() => setActiveSubTab('integrations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
            activeSubTab === 'integrations'
              ? 'bg-dex-coral text-white shadow-md'
              : 'text-[#8F8A87] hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Integrações</span>
        </button>
      </div>

      {/* Tab: Aparência & Tema */}
      {activeSubTab === 'appearance' && (
        <div className="p-6 md:p-8 rounded-[24px] bg-dex-navy-900 border border-white/5 space-y-8 max-w-4xl">
          <div>
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-dex-coral" />
              <span>Personalização de Aparência e Tema</span>
            </h3>
            <p className="text-xs text-[#8F8A87] font-serif mt-1">
              Selecione o esquema visual que melhor se adapta à sua rotina forense, ambiente de trabalho ou iluminação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Modo Claro */}
            <div 
              onClick={() => setThemeMode('light')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                themeMode === 'light'
                  ? 'border-dex-coral bg-dex-navy-800 shadow-lg ring-1 ring-dex-coral/30'
                  : 'border-white/10 bg-dex-navy-950/60 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300">
                    <Sun className="w-5 h-5" />
                  </div>
                  {themeMode === 'light' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-dex-coral text-white px-2 py-0.5 rounded-full">
                      Ativo
                    </span>
                  )}
                </div>
                <h4 className="font-serif text-base font-bold text-white">Modo Claro</h4>
                <p className="text-xs text-[#8F8A87] mt-1.5 leading-relaxed">
                  Visual clássico e caloroso em tom creme (#F9ECE2), pêssego e azul-marinho. Ideal para salas bem iluminadas e leitura diurna.
                </p>
              </div>

              {/* Mini Preview Claro */}
              <div className="mt-5 p-3 rounded-xl bg-[#F9ECE2] border border-[#D8C3B5] space-y-1.5">
                <div className="h-2.5 w-16 bg-[#0F2733] rounded-sm" />
                <div className="h-1.5 w-28 bg-[#D8C3B5] rounded-sm" />
                <div className="flex gap-1.5 pt-1">
                  <div className="h-4 flex-1 bg-[#F0CBAE] rounded" />
                  <div className="h-4 flex-1 bg-[#DCE5E4] rounded" />
                </div>
              </div>
            </div>

            {/* Modo Escuro */}
            <div 
              onClick={() => setThemeMode('dark')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                themeMode === 'dark'
                  ? 'border-dex-coral bg-dex-navy-800 shadow-lg ring-1 ring-dex-coral/30'
                  : 'border-white/10 bg-dex-navy-950/60 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-[#4A808E]/20 text-[#82B3C0]">
                    <Moon className="w-5 h-5" />
                  </div>
                  {themeMode === 'dark' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-dex-coral text-white px-2 py-0.5 rounded-full">
                      Ativo
                    </span>
                  )}
                </div>
                <h4 className="font-serif text-base font-bold text-white">Modo Escuro (Padrão)</h4>
                <p className="text-xs text-[#8F8A87] mt-1.5 leading-relaxed">
                  Fundo azul-marinho profundo (#0A1922 / #162B37) com tipografia suave. Reduz a fadiga ocular em noites de elaboração de peças e prazos.
                </p>
              </div>

              {/* Mini Preview Escuro */}
              <div className="mt-5 p-3 rounded-xl bg-[#0A1922] border border-[#214154] space-y-1.5">
                <div className="h-2.5 w-16 bg-[#F9ECE2] rounded-sm" />
                <div className="h-1.5 w-28 bg-[#4A808E] rounded-sm" />
                <div className="flex gap-1.5 pt-1">
                  <div className="h-4 flex-1 bg-[#162B37] border border-[#214154] rounded" />
                  <div className="h-4 flex-1 bg-[#162B37] border border-[#214154] rounded" />
                </div>
              </div>
            </div>

            {/* Modo Automático */}
            <div 
              onClick={() => setThemeMode('system')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                themeMode === 'system'
                  ? 'border-dex-coral bg-dex-navy-800 shadow-lg ring-1 ring-dex-coral/30'
                  : 'border-white/10 bg-dex-navy-950/60 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
                    <Monitor className="w-5 h-5" />
                  </div>
                  {themeMode === 'system' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-dex-coral text-white px-2 py-0.5 rounded-full">
                      Ativo
                    </span>
                  )}
                </div>
                <h4 className="font-serif text-base font-bold text-white">Automático (Sistema)</h4>
                <p className="text-xs text-[#8F8A87] mt-1.5 leading-relaxed">
                  Acompanha dinamicamente a configuração do seu dispositivo (Windows, Mac, iOS ou Android). Atualmente detectado: <strong className="text-white">{effectiveTheme === 'dark' ? 'Escuro' : 'Claro'}</strong>.
                </p>
              </div>

              {/* Mini Preview Dividido */}
              <div className="mt-5 p-3 rounded-xl bg-gradient-to-r from-[#F9ECE2] to-[#0A1922] border border-[#D8C3B5] space-y-1.5 overflow-hidden">
                <div className="h-2.5 w-16 bg-[#0F2733] rounded-sm" />
                <div className="h-1.5 w-28 bg-white/60 rounded-sm" />
                <div className="flex gap-1.5 pt-1">
                  <div className="h-4 flex-1 bg-[#F0CBAE] rounded" />
                  <div className="h-4 flex-1 bg-[#162B37] border border-[#214154] rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Dica Forense / Impressão e PDF */}
          <div className="p-4 rounded-2xl bg-dex-navy-800 border border-white/5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-dex-teal flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#8F8A87] space-y-1">
              <strong className="text-white block font-semibold">Garantia de Padronização Processual para Impressão &amp; PDF:</strong>
              <p>
                Independentemente do tema ativo na sua tela, exportações de relatórios em PDF, planilhas financeiras (.xlsx / .csv) e impressões de minutas são renderizadas exclusivamente em fundo branco e fontes de alto contraste preto/cinza, atendendo aos padrões oficiais dos tribunais brasileiros.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Perfil & Foto */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="p-6 md:p-8 rounded-[24px] bg-dex-navy-900 border border-white/5 space-y-6 max-w-3xl">
          <div>
            <h3 className="font-serif text-base font-bold text-white">Meu Perfil Profissional</h3>
            <p className="text-xs text-[#8F8A87] font-serif mt-1">
              Personalize sua foto de identificação e seus dados cadastrais
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-dex-navy-800 border border-white/5 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative shrink-0">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt={userName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-dex-coral shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-dex-kpi-peach text-dex-navy-950 flex items-center justify-center font-serif font-bold text-2xl shadow-lg">
                  {userInitial}
                </div>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <div>
                <span className="font-serif text-xs font-bold text-white block">Foto do Perfil</span>
                <span className="text-[11px] text-[#8F8A87] block font-serif">
                  Formatos aceitos: JPG, PNG ou WEBP. Tamanho máximo de 2 MB.
                </span>
              </div>

              {photoError && (
                <div className="flex items-center gap-1.5 text-[11px] text-dex-coral font-serif">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{photoError}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-dex-slate hover:bg-slate-700 text-white text-xs font-serif font-bold rounded-xl cursor-pointer transition-colors shadow-sm">
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-dex-coral hover:bg-dex-coral/90 text-white text-xs font-serif font-bold rounded-xl transition-colors shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Foto</span>
                  </button>
                )}

                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-dex-navy-950 hover:bg-dex-navy-900 border border-white/5 text-[#8F8A87] hover:text-dex-coral text-xs font-serif rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover Foto</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-serif italic text-[#C2D6DC] block mb-1.5">Nome Completo *</label>
              <input
                type="text"
                required
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              />
            </div>

            <div>
              <label className="text-xs font-serif italic text-[#C2D6DC] block mb-1.5">E-mail Institucional</label>
              <input
                type="email"
                disabled
                value={userEmail}
                className="w-full px-3.5 py-2.5 bg-dex-navy-950 text-slate-400 font-serif rounded-xl text-xs border border-white/5 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-serif italic text-[#C2D6DC] block mb-1.5">Inscrição OAB / UF *</label>
              <input
                type="text"
                required
                value={userOab}
                onChange={e => setUserOab(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              />
            </div>

            <div>
              <label className="text-xs font-serif italic text-[#C2D6DC] block mb-1.5">Telefone / WhatsApp</label>
              <input
                type="text"
                value={userPhone}
                onChange={e => setUserPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-dex-coral hover:bg-dex-coral/90 text-white text-xs font-serif font-bold rounded-xl shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações do Perfil</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab: Dados da Sociedade */}
      {activeSubTab === 'general' && isAdmin && (
        <form onSubmit={handleSaveOffice} className="p-6 md:p-8 rounded-[24px] bg-dex-navy-900 border border-white/5 space-y-5 max-w-3xl">
          <h3 className="font-serif text-base font-bold text-white mb-2">Informações Institucionais do Escritório</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-serif italic text-[#C2D6DC] block mb-1.5">Razão Social / Nome da Banca</label>
              <input
                type="text"
                value={officeName}
                onChange={e => setOfficeName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              />
            </div>

            <div>
              <label className="text-xs font-serif italic text-[#C2D6DC] block mb-1.5">CNPJ da Sociedade</label>
              <input
                type="text"
                value={officeCnpj}
                onChange={e => setOfficeCnpj(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              />
            </div>

            <div>
              <label className="text-xs font-serif italic text-[#C2D6DC] block mb-1.5">Registro OAB Sociedade</label>
              <input
                type="text"
                value={officeOab}
                onChange={e => setOfficeOab(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              />
            </div>

            <div>
              <label className="text-xs font-serif italic text-[#C2D6DC] block mb-1.5">Telefone Comercial</label>
              <input
                type="text"
                value={officePhone}
                onChange={e => setOfficePhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-serif italic text-[#C2D6DC] block mb-1.5">Endereço Comercial</label>
              <input
                type="text"
                value={officeAddress}
                onChange={e => setOfficeAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-dex-coral hover:bg-dex-coral/90 text-white text-xs font-serif font-bold rounded-xl shadow-lg transition-all"
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
        <div className="p-6 md:p-8 rounded-[24px] bg-dex-navy-900 border border-white/5 space-y-5 max-w-3xl">
          <h3 className="font-serif text-base font-bold text-white mb-2">Conectividade &amp; Inteligência Artificial</h3>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-dex-navy-800 border border-white/5 flex items-center justify-between">
              <div>
                <p className="font-serif text-xs font-bold text-white">Motor Dex AI (Triagem Jurídica & Jurisprudência)</p>
                <p className="text-[11px] text-[#8F8A87] font-serif">Ativado para triagem fática, resumo de documentos e estruturação de petições.</p>
              </div>
              <span className="text-[10px] font-serif font-bold px-3 py-1 rounded-full bg-dex-kpi-mint text-dex-navy-950">
                Ativo
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-dex-navy-800 border border-white/5 flex items-center justify-between">
              <div>
                <p className="font-serif text-xs font-bold text-white">Integração CNJ / Tribunais (PJe, e-SAJ, Projudi)</p>
                <p className="text-[11px] text-[#8F8A87] font-serif">Sincronização de andamentos processuais e publicação de intimações.</p>
              </div>
              <span className="text-[10px] font-serif font-bold px-3 py-1 rounded-full bg-dex-kpi-peach text-dex-navy-950">
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
          <div className="p-6 md:p-8 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-dex-kpi-mint text-dex-navy-950 flex items-center justify-center shadow-md">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                    {isSupabaseConfigured()
                      ? 'Nuvem Conectada (Supabase / PostgreSQL)'
                      : 'Armazenamento Local (Navegador)'}
                  </h3>
                  <p className="text-xs text-[#8F8A87] font-serif">
                    {isSupabaseConfigured()
                      ? 'Cadastros e dados sincronizados em tempo real entre todos os dispositivos.'
                      : 'Os dados estão salvos apenas neste navegador. Para salvar globalmente, conecte o Supabase.'}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-serif font-bold px-3 py-1 rounded-full ${
                isSupabaseConfigured()
                  ? 'bg-dex-kpi-mint text-dex-navy-950'
                  : 'bg-dex-kpi-peach text-dex-navy-950'
              }`}>
                {isSupabaseConfigured() ? 'Online • Nuvem' : 'Modo Offline / Local'}
              </span>
            </div>

            {dbStatus && (
              <div className={`p-4 rounded-xl text-xs font-serif flex items-center gap-2 ${
                dbStatus.success
                  ? 'bg-dex-chart-green/20 border border-dex-chart-green/30 text-dex-beige'
                  : 'bg-dex-coral/20 border border-dex-coral/30 text-dex-coral'
              }`}>
                {dbStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-dex-chart-green" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-dex-coral" />
                )}
                <span>{dbStatus.message}</span>
              </div>
            )}
          </div>

          {/* Configuração Supabase */}
          <form onSubmit={handleTestAndSaveSupabase} className="p-6 md:p-8 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-2xl space-y-5">
            <div>
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-dex-coral" />
                Conectar Banco de Dados Supabase
              </h3>
              <p className="text-xs text-[#8F8A87] font-serif mt-1">
                Insira as credenciais do seu projeto Supabase para habilitar salvamento na nuvem.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                  URL do Projeto Supabase (Project URL)
                </label>
                <input
                  type="url"
                  placeholder="https://xyzabcdefg.supabase.co"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-mono rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
                />
              </div>

              <div>
                <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                  Chave Pública Anon (Anon Public Key)
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={e => setSupabaseKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-mono rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isTestingDb}
                className="py-2.5 px-6 bg-dex-coral hover:bg-dex-coral/90 text-white text-xs font-serif font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-60"
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
                  className="py-2.5 px-4 bg-dex-slate hover:bg-slate-700 text-white text-xs font-serif font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDb ? 'animate-spin' : ''}`} />
                  <span>{isSyncingDb ? 'Sincronizando...' : 'Enviar Dados Deste PC para o Supabase'}</span>
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-dex-navy-950 border border-white/5 space-y-2 text-xs text-slate-300 font-serif">
              <p className="font-bold text-white flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-dex-peach" />
                Como configurar no Vercel (Produção):
              </p>
              <ol className="list-decimal pl-4 space-y-1 text-[#8F8A87] text-[11px]">
                <li>Acesse o dashboard do seu projeto no <strong>Vercel</strong> &gt; <strong>Settings</strong> &gt; <strong>Environment Variables</strong>.</li>
                <li>Adicione <code className="text-dex-coral font-mono">VITE_SUPABASE_URL</code> com a URL do seu Supabase.</li>
                <li>Adicione <code className="text-dex-coral font-mono">VITE_SUPABASE_ANON_KEY</code> com a chave anon pública.</li>
                <li>O script de criação de tabelas está no arquivo <code className="text-dex-coral font-mono">supabase_schema.sql</code> na raiz do projeto.</li>
              </ol>
            </div>
          </form>

          {/* Backup e Exportação Manual */}
          <div className="p-6 md:p-8 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-xl space-y-4">
            <div>
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <FileDown className="w-4 h-4 text-dex-peach" />
                Backup Manual e Transferência Entre Computadores
              </h3>
              <p className="text-xs text-[#8F8A87] font-serif mt-1">
                Baixe todos os dados em um arquivo JSON para transferir entre dispositivos ou restaurar a qualquer momento.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportBackup}
                className="py-2.5 px-5 bg-dex-slate hover:bg-slate-700 text-white text-xs font-serif font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                Exportar Backup Completo (.JSON)
              </button>

              <label className="py-2.5 px-5 bg-dex-navy-800 hover:bg-dex-navy-700 text-dex-beige border border-white/10 text-xs font-serif font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-dex-coral" />
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
