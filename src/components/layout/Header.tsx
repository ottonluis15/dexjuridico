import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Sparkles, 
  Plus, 
  UserCheck, 
  ShieldAlert, 
  ChevronDown, 
  Clock, 
  CheckCircle2,
  FolderPlus,
  UserPlus,
  LogOut,
  User as UserIcon,
  Building2,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { TabType } from './Sidebar';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenMobileMenu: () => void;
  onOpenNewCaseModal: () => void;
  onOpenNewDeadlineModal: () => void;
  onOpenNewClientModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
  onOpenNewCaseModal,
  onOpenNewDeadlineModal,
  onOpenNewClientModal
}) => {
  const { currentUser, availableUsers, isAdmin, logout } = useAuth();
  const { stats, userDeadlines, toggleDeadlineStatus } = useData();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (quickRef.current && !quickRef.current.contains(event.target as Node)) {
        setIsQuickActionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const titles: Record<TabType, { title: string; subtitle: string }> = {
    dashboard: { title: 'Painel Geral', subtitle: 'Visão executiva e operacional do escritório' },
    'lawyer-workbench': { title: 'Área do Advogado', subtitle: 'Pauta diária, audiências e processos sob sua condução' },
    cases: { title: 'Gestão de Processos', subtitle: 'Controle de distribuição, peças, fases e andamentos CNJ' },
    deadlines: { title: 'Agenda & Prazos', subtitle: 'Controle de prazos fatais e compromissos com alerta de urgência' },
    clients: { title: 'Carteira de Clientes', subtitle: 'Cadastro unificado de pessoas físicas e jurídicas' },
    lawyers: { title: 'Corpo Jurídico & Equipe', subtitle: 'Gestão de sócios, associados e áreas de atuação' },
    financial: { title: 'Controle Financeiro & Honorários', subtitle: 'Gestão de honorários contratuais, êxito e despesas' },
    documents: { title: 'Modelos de Documentos', subtitle: 'Minutas de petições, contratos e repositório funcional' },
    'ai-assistant': { title: 'Dex AI — Assistente Jurídico', subtitle: 'Triagem inteligente, resumo fático e teses jurisprudenciais' },
    'team-wall': { title: 'Mural da Equipe', subtitle: 'Comunicados internos, avisos e alinhamentos da banca' },
    reports: { title: 'Relatórios & Inteligência Jurídica', subtitle: 'Métricas de desempenho, taxa de êxito e produtividade' },
    notifications: { title: 'Central de Notificações', subtitle: 'Alertas de prazos, movimentações e comunicados' },
    settings: { title: 'Configurações do Sistema', subtitle: 'Preferências, perfil, segurança e governança' },
    lgpd: { title: 'Conformidade & Governança LGPD', subtitle: 'Inventário de dados, registro de acessos e segurança da informação' },
    landing: { title: 'Página de Apresentação', subtitle: 'Visão pública e institucional da plataforma DEX' },
  };

  const currentInfo = titles[activeTab] || { title: 'Dex', subtitle: 'Sistema Jurídico' };
  const urgentCount = stats.overdueDeadlinesCount + stats.criticalDeadlines.length;

  const userInitial = (currentUser?.name?.[0] || 'A').toUpperCase();

  // Advogados vinculados (somente se for escritório e não incluir ele mesmo na lista de membros)
  const linkedLawyers = isAdmin 
    ? availableUsers.filter(u => u.id !== currentUser?.id)
    : [];

  return (
    <header className="sticky top-0 z-30 h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Esquerda: Toggle Mobile & Título da Página */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 lg:hidden cursor-pointer"
          aria-label="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-lg lg:text-xl font-bold text-white tracking-tight truncate">
            {currentInfo.title}
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block truncate">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Direita: Ações Rápidas & Menu de Perfil */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Botão de Ação Rápida */}
        <div className="relative" ref={quickRef}>
          <button
            onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
            className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Nova Ação</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {isQuickActionOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Cadastros Rápidos
              </div>
              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  onOpenNewCaseModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-xl transition-colors text-left cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-brand-400" />
                Novo Processo
              </button>
              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  onOpenNewDeadlineModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-xl transition-colors text-left cursor-pointer"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                Novo Prazo / Audiência
              </button>
              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  onOpenNewClientModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-xl transition-colors text-left cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                Novo Cliente
              </button>
              <div className="my-1 border-t border-slate-800" />
              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setActiveTab('ai-assistant');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-950/40 rounded-xl transition-colors text-left cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Triagem com Dex AI
              </button>
            </div>
          )}
        </div>

        {/* Notificações */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/60 transition-colors cursor-pointer"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {urgentCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
                {urgentCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Alertas de Prazos ({urgentCount})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    setActiveTab('deadlines');
                  }}
                  className="text-[11px] text-brand-400 hover:underline cursor-pointer"
                >
                  Ver todos
                </button>
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                {userDeadlines.filter(d => d.status !== 'COMPLETED').length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Nenhum prazo pendente no momento!</p>
                ) : (
                  userDeadlines
                    .filter(d => d.status !== 'COMPLETED')
                    .slice(0, 5)
                    .map(d => {
                      const isOverdue = d.status === 'OVERDUE' || d.dueDate < new Date().toISOString().substring(0, 10);
                      return (
                        <div
                          key={d.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-2 ${
                            isOverdue
                              ? 'bg-rose-950/30 border-rose-900/60 text-rose-200'
                              : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              {isOverdue ? (
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              )}
                              <span className="font-semibold truncate">{d.type}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">{d.description}</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Vencimento: <strong className="text-white">{d.dueDate} {d.dueTime && `às ${d.dueTime}`}</strong>
                            </p>
                          </div>
                          <button
                            onClick={() => toggleDeadlineStatus(d.id)}
                            title="Dar baixa"
                            className="p-1.5 text-emerald-400 hover:bg-emerald-950/50 rounded-lg shrink-0 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Menu de Perfil Seguro do Usuário Logado (Tarefa 1 & 5) */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
          >
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover border border-slate-600"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#C69255] to-amber-700 text-white flex items-center justify-center font-bold text-xs border border-amber-500/40 shadow-sm">
                {userInitial}
              </div>
            )}
            <div className="hidden md:block text-left min-w-0">
              <p className="text-xs font-semibold text-white leading-tight truncate max-w-[150px]">
                {currentUser?.name || 'Usuário'}
              </p>
              <span className="text-[10px] text-slate-400 truncate block">
                {currentUser?.role === 'ADMIN' ? 'Escritório / Titular' : (currentUser?.isIndependent ? 'Advogado Autônomo' : 'Advogado Associado')}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              {/* Cabeçalho do Perfil Atual */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 mb-2 flex items-center gap-3">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-11 h-11 rounded-xl object-cover border border-brand-400/40"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-[#C69255] text-white flex items-center justify-center font-bold text-base shadow-sm">
                    {userInitial}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                      OAB: {currentUser?.oab || 'Regular'}
                    </span>
                    {currentUser?.officeCode && (
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40" title="Código de vínculo do escritório">
                        Cód: {currentUser.officeCode}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Se for Escritório, listar apenas os advogados vinculados à sua banca */}
              {isAdmin && (
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between px-2 pb-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-brand-400" />
                      Advogados Vinculados ({linkedLawyers.length})
                    </span>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setActiveTab('lawyers');
                      }}
                      className="text-[10px] text-brand-400 hover:underline cursor-pointer"
                    >
                      Gerenciar
                    </button>
                  </div>

                  {linkedLawyers.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic px-2 py-1">
                      Nenhum advogado associado ainda. Cadastre novos membros na aba Equipe.
                    </p>
                  ) : (
                    <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                      {linkedLawyers.map(lawyerUser => (
                        <div
                          key={lawyerUser.id}
                          className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/30 text-slate-300 text-xs"
                        >
                          {lawyerUser.avatarUrl ? (
                            <img
                              src={lawyerUser.avatarUrl}
                              alt={lawyerUser.name}
                              className="w-6 h-6 rounded-md object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-md bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center">
                              {lawyerUser.name[0]}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold text-white truncate">{lawyerUser.name}</p>
                            <p className="text-[10px] text-slate-400 truncate font-mono">OAB: {lawyerUser.oab}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Ações do Usuário */}
              <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setActiveTab('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-cyan-400" />
                  <span>Meu Perfil & Foto</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
