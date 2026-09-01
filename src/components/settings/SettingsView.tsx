import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  User, 
  ShieldCheck, 
  Bell, 
  Save, 
  Key, 
  Database,
  Lock,
  Globe,
  Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { LGPDCompliance } from '../lgpd/LGPDCompliance';

export const SettingsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'general' | 'profile' | 'security' | 'integrations'>('general');

  // Form states
  const [officeName, setOfficeName] = useState('Dex Sociedade de Advogados');
  const [officeCnpj, setOfficeCnpj] = useState('12.345.678/0001-90');
  const [officeOab, setOfficeOab] = useState('OAB/SP 45.890');
  const [officePhone, setOfficePhone] = useState('(11) 3450-8000');
  const [officeAddress, setOfficeAddress] = useState('Av. Paulista, 1500 - São Paulo/SP');

  const [userName, setUserName] = useState(currentUser?.name || 'ewewewew');
  const [userEmail, setUserEmail] = useState(currentUser?.email || 'admin@dexjuridico.adv.br');
  const [userOab, setUserOab] = useState(currentUser?.oab || '184.920/SP');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Configurações salvas com sucesso!', 'success');
  };

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
            Gerencie dados do escritório, perfil profissional, segurança, governança LGPD e integrações
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          Salvar Alterações
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('general')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'general'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Dados da Sociedade
        </button>

        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'profile'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <User className="w-4 h-4" />
          Perfil & Credenciais
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
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
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'integrations'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Integrações & IA
        </button>
      </div>

      {/* Tab Content */}
      {activeSubTab === 'general' && (
        <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 max-w-3xl">
          <h3 className="text-sm font-bold text-white mb-4">Informações Institucionais do Escritório</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Razão Social / Nome Fantasia</label>
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
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Telefone de Contato</label>
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
        </form>
      )}

      {activeSubTab === 'profile' && (
        <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 max-w-3xl">
          <h3 className="text-sm font-bold text-white mb-4">Dados do Usuário Atual</h3>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-[#C69255] text-white flex items-center justify-center font-bold text-xl shadow-md">
              {(userName[0] || 'E').toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{userName}</p>
              <p className="text-xs text-slate-400">{currentUser?.role === 'ADMIN' ? 'Administrador' : 'Advogado Associado'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Nome Completo</label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">E-mail Profissional</label>
              <input
                type="email"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Número da OAB</label>
              <input
                type="text"
                value={userOab}
                onChange={e => setUserOab(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
          </div>
        </form>
      )}

      {activeSubTab === 'security' && (
        <LGPDCompliance />
      )}

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
    </div>
  );
};
