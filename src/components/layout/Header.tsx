import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Maximize2, 
  Minimize2, 
  Sun, 
  Moon, 
  Bell, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { TabType } from './Sidebar';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenMobileMenu: () => void;
  onOpenNewCaseModal?: () => void;
  onOpenNewDeadlineModal?: () => void;
  onOpenNewClientModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
}) => {
  const { currentUser, logout } = useAuth();
  const { userDeadlines } = useData();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');

  // Título amigável da aba atual
  const tabTitles: Record<TabType, string> = {
    dashboard: 'Dashboard',
    'ai-assistant': 'Assistente de IA',
    cases: 'Processos',
    clients: 'Clientes',
    documents: 'Modelos',
    financial: 'Financeiro',
    deadlines: 'Agenda & Prazos',
    lawyers: 'Equipe',
    'team-wall': 'Mural da equipe',
    reports: 'Relatórios',
    notifications: 'Notificações',
    settings: 'Configurações',
    profile: 'Meu Perfil',
    'lawyer-workbench': 'Minha Bancada',
    lgpd: 'Conformidade LGPD',
    landing: 'Página Web',
  };

  const currentTitle = tabTitles[activeTab] || 'Dashboard';

  // Saudação variando conforme a hora do dia (Anexo 4)
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Bom dia! Como estão os andamentos?';
    } else if (hour >= 12 && hour < 18) {
      return 'Boa tarde! Como estão os andamentos?';
    } else {
      return 'Boa noite! Como estão os andamentos?';
    }
  };

  // Alternar tela cheia
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // Alternar tema
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('theme-light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('theme-light');
      }
      return next;
    });
  };

  const urgentCount = userDeadlines.filter(
    d => (d.priority === 'CRITICAL' || d.priority === 'HIGH') && d.status !== 'COMPLETED'
  ).length;

  return (
    <div className="w-full pt-4 pb-2 px-4 sm:px-6 lg:px-8">
      {/* Topbar: Barra arredondada em azul-marinho escuro (#162B37) fiel ao Anexo 4 & 5 */}
      <header className="w-full bg-[#162B37] rounded-[24px] sm:rounded-[28px] px-4 sm:px-6 py-3.5 shadow-xl border border-[#214154]/50 flex items-center justify-between gap-4">
        
        {/* Esquerda: Botão Mobile & Título com Saudação */}
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 text-white/80 hover:text-white rounded-full bg-white/10 lg:hidden cursor-pointer shrink-0"
            aria-label="Abrir menu lateral"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 min-w-0">
            <h1 className="text-lg sm:text-xl font-display font-bold text-white tracking-tight truncate">
              {currentTitle}
            </h1>
            <span className="text-xs text-[#EAE0DA]/90 font-serif hidden md:inline truncate">
              {getGreeting()}
            </span>
          </div>
        </div>

        {/* Centro: Campo de Busca com Lupa */}
        <div className="hidden sm:flex items-center flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-white/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Buscar processos, Clientes..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-white/10 text-white placeholder:text-white/60 text-xs font-serif border border-white/15 focus:outline-none focus:ring-2 focus:ring-dex-coral transition-all"
            />
          </div>
        </div>

        {/* Direita: 4 Botões Circulares Claros com Ícones (Anexo 4) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* 1. Tela Cheia */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            aria-label="Alternar tela cheia"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EAE0DA] hover:bg-white text-dex-navy-950 flex items-center justify-center shadow transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* 2. Alternador de Tema (Sol / Lua) */}
          <button
            type="button"
            onClick={toggleTheme}
            title="Alternar tema"
            aria-label="Alternar tema claro ou escuro"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EAE0DA] hover:bg-white text-dex-navy-950 flex items-center justify-center shadow transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* 3. Notificações */}
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            title="Notificações"
            aria-label="Ver notificações"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EAE0DA] hover:bg-white text-dex-navy-950 flex items-center justify-center shadow transition-all hover:scale-105 active:scale-95 cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            {urgentCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-dex-coral text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow">
                {urgentCount}
              </span>
            )}
          </button>

          {/* 4. Sair / Logout */}
          <button
            type="button"
            onClick={logout}
            title="Sair do sistema"
            aria-label="Sair da conta"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EAE0DA] hover:bg-white text-dex-navy-950 flex items-center justify-center shadow transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>
    </div>
  );
};
