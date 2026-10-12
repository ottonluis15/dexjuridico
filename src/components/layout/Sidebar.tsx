import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  Scale, 
  Users, 
  FileText, 
  DollarSign, 
  Calendar, 
  UserCircle, 
  MessageSquare, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut,
  Globe,
  Briefcase,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export type TabType = 
  | 'dashboard'
  | 'ai-assistant'
  | 'cases'
  | 'clients'
  | 'documents'
  | 'financial'
  | 'deadlines'
  | 'lawyers'
  | 'team-wall'
  | 'reports'
  | 'notifications'
  | 'settings'
  | 'profile'
  | 'lawyer-workbench'
  | 'lgpd'
  | 'landing';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface NavSection {
  title: string;
  items: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number | null;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen
}) => {
  const { currentUser, isAdmin, isAppAdmin, logout } = useAuth();
  const { userCases, personalCases } = useData();

  const sections: NavSection[] = [
    {
      title: 'PRINCIPAL',
      items: [
        ...(isAdmin ? [
          {
            id: 'dashboard' as TabType,
            label: 'Gestão do Escritório',
            icon: Building2,
          },
          {
            id: 'lawyer-workbench' as TabType,
            label: 'Minha Área Individual',
            icon: Briefcase,
            badge: personalCases.length > 0 ? personalCases.length : null,
          }
        ] : [
          {
            id: 'lawyer-workbench' as TabType,
            label: 'Minha Área de Trabalho',
            icon: Briefcase,
          },
          {
            id: 'dashboard' as TabType,
            label: 'Dashboard Geral',
            icon: LayoutDashboard,
          }
        ]),
        {
          id: 'ai-assistant' as TabType,
          label: 'Assistente de IA',
          icon: Bot,
        },
        {
          id: 'cases' as TabType,
          label: 'Processos',
          icon: Scale,
          badge: userCases.length,
        },
        {
          id: 'clients' as TabType,
          label: 'Clientes',
          icon: Users,
        },
        {
          id: 'documents' as TabType,
          label: 'Modelos',
          icon: FileText,
        },
      ]
    },
    {
      title: 'GESTÃO',
      items: [
        {
          id: 'financial',
          label: 'Financeiro',
          icon: DollarSign,
        },
        {
          id: 'deadlines',
          label: 'Agenda',
          icon: Calendar,
        },
        {
          id: 'lawyers',
          label: 'Equipe',
          icon: UserCircle,
        },
        {
          id: 'team-wall',
          label: 'Mural da Equipe',
          icon: MessageSquare,
        },
        {
          id: 'reports',
          label: 'Relatórios',
          icon: BarChart3,
        },
      ]
    },
    {
      title: 'SISTEMA',
      items: [
        {
          id: 'notifications',
          label: 'Notificações',
          icon: Bell,
        },
        ...(isAppAdmin ? [{
          id: 'settings' as TabType,
          label: 'Configurações',
          icon: Settings,
        }] : []),
        {
          id: 'landing',
          label: 'Página Inicial (Web)',
          icon: Globe,
        },
      ]
    }
  ];

  // Initial letter for the avatar
  const userName = currentUser?.name || 'ewewewew';
  const userInitial = (userName[0] || 'E').toUpperCase();
  const userRole = currentUser?.role === 'ADMIN' ? 'Administrador' : 'Advogado';

  return (
    <>
      {/* Backdrop para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-neutral-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Logo */}
        <div className="pt-7 pb-5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-[#C4975A]">
              <Scale className="w-8 h-8 stroke-[1.8]" />
            </div>
            <span className="font-serif text-3xl font-bold tracking-tight text-neutral-900">
              Dex
            </span>
          </div>
        </div>

        {/* Navigation items grouped by sections */}
        <nav aria-label="Menu Principal" className="flex-1 px-4 py-2 overflow-y-auto custom-scrollbar space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                {section.title}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsOpen(false);
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-medium transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-[#222222] text-white shadow-sm font-semibold'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/90'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                        isActive ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-800'
                      }`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge !== null && (
                      <span className="bg-[#C69255] text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-3.5 border-t border-neutral-200/70 bg-[#FAFAFA]/90 flex items-center justify-between gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile');
              setIsOpen(false);
            }}
            className={`flex items-center gap-3 min-w-0 flex-1 p-2 rounded-2xl transition-all cursor-pointer text-left group ${
              activeTab === 'profile'
                ? 'bg-[#222222] text-white shadow-sm ring-1 ring-neutral-800'
                : 'hover:bg-neutral-200/70'
            }`}
            title="Acessar Meu Perfil e Foto"
          >
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={`Foto de perfil de ${userName}`}
                className="w-10 h-10 rounded-full object-cover shrink-0 border border-neutral-300 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#C69255] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm" aria-hidden="true">
                {userInitial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-bold truncate leading-tight ${
                activeTab === 'profile' ? 'text-white' : 'text-neutral-800 group-hover:text-black'
              }`}>
                {userName}
              </p>
              <p className={`text-[11px] truncate leading-tight mt-0.5 ${
                activeTab === 'profile' ? 'text-neutral-300' : 'text-neutral-500'
              }`}>
                {userRole} • Meu Perfil
              </p>
            </div>
          </button>

          <button
            onClick={logout}
            title="Sair da conta"
            className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0 cursor-pointer"
            aria-label="Sair da conta"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </aside>
    </>
  );
};
