import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Search, 
  Maximize2, 
  Minimize2, 
  Sun, 
  Moon, 
  Monitor,
  Check,
  Bell, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { TabType } from './Sidebar';
import { GlobalSearch } from './GlobalSearch';
import { LegalCase, Client } from '../../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenMobileMenu: () => void;
  onOpenNewCaseModal?: () => void;
  onOpenNewDeadlineModal?: () => void;
  onOpenNewClientModal?: () => void;
  onOpenCaseDetail?: (caseItem: LegalCase) => void;
  onOpenClientDetail?: (client: Client) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
  onOpenCaseDetail,
  onOpenClientDetail
}) => {
  const { currentUser, logout } = useAuth();
  const { userDeadlines } = useData();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const { themeMode, effectiveTheme, setThemeMode, isDark } = useTheme();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Fechar menu de tema ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    if (isThemeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isThemeMenuOpen]);

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
    plans: 'Planos & Assinatura',
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

        {/* Centro: Campo de Busca Global Funcional (Processos, Clientes, Modelos, Finanças, Equipe, Mural) */}
        <div className="flex items-center flex-1 max-w-md mx-2">
          <GlobalSearch
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onOpenCaseDetail={onOpenCaseDetail}
            onOpenClientDetail={onOpenClientDetail}
          />
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

          {/* 2. Seletor de Tema (Claro, Escuro, Automático) - Item 6 */}
          <div className="relative" ref={themeMenuRef}>
            <button
              type="button"
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              title={`Tema: ${themeMode === 'system' ? 'Automático (Sistema)' : isDark ? 'Escuro' : 'Claro'}`}
              aria-label="Selecionar modo de tema"
              aria-expanded={isThemeMenuOpen}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EAE0DA] hover:bg-white text-dex-navy-950 flex items-center justify-center shadow transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              {themeMode === 'system' ? (
                <Monitor className="w-4 h-4" />
              ) : isDark ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>

            {/* Menu Popover de Seleção de Tema */}
            {isThemeMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#FAF3ED] dark:bg-[#162B37] border border-[#D8C3B5] dark:border-[#214154] rounded-2xl shadow-xl p-1.5 z-50 text-xs font-serif animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] text-dex-navy-700 dark:text-[#A6C5CD] border-b border-[#D8C3B5]/50 dark:border-[#214154]/50 mb-1">
                  Aparência
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setThemeMode('light');
                    setIsThemeMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    themeMode === 'light'
                      ? 'bg-[#4A808E] text-white font-bold'
                      : 'text-dex-navy-950 dark:text-[#F9ECE2] hover:bg-[#F0CBAE]/40 dark:hover:bg-[#1F3A4B]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    <span>Claro</span>
                  </span>
                  {themeMode === 'light' && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setThemeMode('dark');
                    setIsThemeMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    themeMode === 'dark'
                      ? 'bg-[#4A808E] text-white font-bold'
                      : 'text-dex-navy-950 dark:text-[#F9ECE2] hover:bg-[#F0CBAE]/40 dark:hover:bg-[#1F3A4B]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    <span>Escuro</span>
                  </span>
                  {themeMode === 'dark' && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setThemeMode('system');
                    setIsThemeMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    themeMode === 'system'
                      ? 'bg-[#4A808E] text-white font-bold'
                      : 'text-dex-navy-950 dark:text-[#F9ECE2] hover:bg-[#F0CBAE]/40 dark:hover:bg-[#1F3A4B]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    <span>Automático</span>
                  </span>
                  {themeMode === 'system' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

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
