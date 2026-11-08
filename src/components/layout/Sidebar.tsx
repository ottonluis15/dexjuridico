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
  Building2,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DexLogo } from '../common/DexLogo';

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
  | 'plans'
  | 'landing';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface NavItem {
  id: TabType;
  label: string;
  badge?: string | number | null;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen
}) => {
  const { currentUser, isAdmin, isAppAdmin, logout } = useAuth();
  const { userCases, personalCases, userDeadlines } = useData();

  const urgentDeadlinesCount = userDeadlines.filter(
    d => (d.priority === 'CRITICAL' || d.priority === 'HIGH') && d.status !== 'COMPLETED'
  ).length;

  // Seções fieis ao Anexo 4: Principal, Gestão, Sistema
  const sections: NavSection[] = [
    {
      title: 'Principal',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
        },
        ...(isAdmin ? [
          {
            id: 'lawyer-workbench' as TabType,
            label: 'Minha Bancada',
            badge: personalCases.length > 0 ? personalCases.length : null,
          }
        ] : [
          {
            id: 'lawyer-workbench' as TabType,
            label: 'Minha Área de Trabalho',
            badge: personalCases.length > 0 ? personalCases.length : null,
          }
        ]),
        {
          id: 'ai-assistant',
          label: 'Assistente de IA', // Especificação: usar "Assistente de IA"
        },
        {
          id: 'cases',
          label: 'Processos',
          badge: userCases.length > 0 ? userCases.length : null,
        },
        {
          id: 'clients',
          label: 'Clientes',
        },
        {
          id: 'documents',
          label: 'Modelos',
        },
      ]
    },
    {
      title: 'Gestão',
      items: [
        {
          id: 'financial',
          label: 'Financeiro',
        },
        {
          id: 'deadlines',
          label: 'Agenda',
          badge: urgentDeadlinesCount > 0 ? urgentDeadlinesCount : null,
        },
        ...(isAdmin ? [{
          id: 'lawyers' as TabType,
          label: 'Equipe',
        }] : []),
        {
          id: 'team-wall',
          label: 'Mural da equipe',
        },
        {
          id: 'reports',
          label: 'Relatórios',
        },
      ]
    },
    {
      title: 'Sistema',
      items: [
        {
          id: 'notifications',
          label: 'Notificações',
        },
        ...(isAppAdmin ? [{
          id: 'settings' as TabType,
          label: 'Configurações',
        }] : []),
        {
          id: 'lgpd',
          label: 'Conformidade LGPD',
        },
        {
          id: 'plans' as TabType,
          label: 'Planos & Assinatura',
        },
        {
          id: 'landing',
          label: 'Página Web',
        },
      ]
    }
  ];

  const userName = currentUser?.name || 'Advogado Dex';
  const userRole = currentUser?.role === 'ADMIN' ? 'Administrador' : 'Advogado';

  return (
    <>
      {/* Backdrop para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-dex-navy-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container (Teal mais claro: #5A97A5, fiel ao Anexo 4) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#5A97A5] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } border-r border-[#4A808E]/60 select-none`}
      >
        {/* Topo: Logo & Fechar no Mobile */}
        <div>
          <div className="pt-6 pb-4 px-6 flex items-center justify-between">
            <DexLogo variant="white" size="md" />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/80 hover:text-white lg:hidden rounded-lg hover:bg-white/10 cursor-pointer"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grupos de Navegação com Título Sublinhado (Anexo 4) */}
          <nav aria-label="Menu Principal" className="px-4 py-2 space-y-5 overflow-y-auto max-h-[calc(100vh-170px)] custom-scrollbar">
            {sections.map((section) => (
              <div key={section.title} className="space-y-1.5">
                {/* Título do grupo com linha sublinhada delicada */}
                <div className="px-3 pb-1">
                  <span className="text-xs font-serif font-bold text-white tracking-wide border-b border-white/60 pb-0.5 inline-block">
                    {section.title}
                  </span>
                </div>

                {/* Itens do grupo */}
                <div className="space-y-1 pt-1">
                  {section.items.map((item) => {
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsOpen(false);
                        }}
                        aria-current={isActive ? 'page' : undefined}
                        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-full text-xs font-serif transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#162B37] text-white font-bold shadow-md' // Pill escura com texto branco (Anexo 4)
                            : 'text-white/90 hover:text-white hover:bg-white/15 font-medium'
                        }`}
                      >
                        <span className="truncate">{item.label}</span>

                        {item.badge !== undefined && item.badge !== null && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-dex-coral text-white'
                              : 'bg-white/20 text-white'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Rodapé da Sidebar: Bloco do Usuário (Anexo 4) */}
        <div className="p-4 border-t border-white/20 bg-[#4F8B98]/60">
          <button
            onClick={() => {
              setActiveTab('profile');
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-white/15 transition-all text-left cursor-pointer group"
          >
            {/* Avatar circular */}
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover border border-white/50 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#EAE0DA] text-dex-navy-950 font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                {(userName[0] || 'A').toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate font-serif">
                {userName}
              </div>
              <div className="text-[11px] text-white/80 truncate">
                {userRole}
              </div>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
