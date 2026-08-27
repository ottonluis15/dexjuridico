import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  FolderKanban, 
  Clock, 
  Users, 
  UserCheck, 
  DollarSign, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  LogOut,
  ChevronRight,
  Scale
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export type TabType = 
  | 'dashboard'
  | 'lawyer-workbench'
  | 'cases'
  | 'deadlines'
  | 'clients'
  | 'lawyers'
  | 'financial'
  | 'documents'
  | 'ai-assistant'
  | 'lgpd';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen
}) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { stats, userCases, userDeadlines, clients, documents } = useData();

  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      adminOnly: false,
    },
    {
      id: 'lawyer-workbench' as TabType,
      label: 'Área do Advogado',
      icon: Briefcase,
      badge: stats.upcomingDeadlinesCount > 0 ? `${stats.upcomingDeadlinesCount}` : null,
      badgeColor: 'bg-brand-500/20 text-brand-300 border border-brand-500/30',
      adminOnly: false,
    },
    {
      id: 'cases' as TabType,
      label: 'Processos',
      icon: FolderKanban,
      badge: `${userCases.length}`,
      badgeColor: 'bg-slate-800 text-slate-300',
      adminOnly: false,
    },
    {
      id: 'deadlines' as TabType,
      label: 'Prazos & Audiências',
      icon: Clock,
      badge: stats.overdueDeadlinesCount > 0 ? `⚠️ ${stats.overdueDeadlinesCount}` : `${userDeadlines.filter(d => d.status === 'PENDING').length}`,
      badgeColor: stats.overdueDeadlinesCount > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold' : 'bg-slate-800 text-slate-300',
      adminOnly: false,
    },
    {
      id: 'clients' as TabType,
      label: 'Clientes',
      icon: Users,
      badge: `${clients.length}`,
      badgeColor: 'bg-slate-800 text-slate-300',
      adminOnly: false,
    },
    {
      id: 'lawyers' as TabType,
      label: 'Advogados & Equipe',
      icon: UserCheck,
      badge: null,
      adminOnly: false,
    },
    {
      id: 'financial' as TabType,
      label: 'Financeiro & Honorários',
      icon: DollarSign,
      badge: stats.pendingFinancialAmount > 0 ? 'Pendente' : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      adminOnly: false,
    },
    {
      id: 'documents' as TabType,
      label: 'Documentos',
      icon: FileText,
      badge: `${documents.length}`,
      badgeColor: 'bg-slate-800 text-slate-300',
      adminOnly: false,
    },
    {
      id: 'ai-assistant' as TabType,
      label: 'Dex AI — Assistente',
      icon: Sparkles,
      badge: 'IA 2.0',
      badgeColor: 'bg-gradient-to-r from-cyan-500/30 to-brand-500/30 text-cyan-200 border border-cyan-400/40 animate-pulse-subtle font-semibold',
      adminOnly: false,
      isSpecial: true,
    },
    {
      id: 'lgpd' as TabType,
      label: 'Segurança & LGPD',
      icon: ShieldCheck,
      badge: 'Ativo',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      adminOnly: false,
    }
  ];

  return (
    <>
      {/* Backdrop para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Logo */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-navy-900 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 border border-brand-400/30">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white">DEX</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Legal AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Gestão Jurídica Inteligente</p>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navegação Principal
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? item.isSpecial
                      ? 'bg-gradient-to-r from-brand-600/30 to-cyan-600/30 text-white border border-cyan-500/40 shadow-lg shadow-cyan-950/40'
                      : 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                    : item.isSpecial
                    ? 'text-cyan-300 hover:bg-slate-800/60 hover:text-white border border-cyan-500/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : item.isSpecial ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Card & LGPD info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 space-y-2">
          {currentUser && (
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-lg object-cover border border-slate-600 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {currentUser.role === 'ADMIN' ? '👑 Sócia / Administradora' : `⚖️ OAB ${currentUser.oab || 'Ativa'}`}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sair do sistema"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between px-2 pt-1 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              LGPD Protegido
            </span>
            <span className="text-slate-400">v1.2.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
