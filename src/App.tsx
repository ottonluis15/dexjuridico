import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { TabType } from './components/layout/Sidebar';
import { LoginScreen } from './components/auth/LoginScreen';
import { RegisterScreen } from './components/auth/RegisterScreen';
import { EmailConfirmationScreen } from './components/auth/EmailConfirmationScreen';
import { ForgotPasswordScreen } from './components/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from './components/auth/ResetPasswordScreen';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { LawyerWorkbench } from './components/lawyer-workbench/LawyerWorkbench';
import { CaseList } from './components/cases/CaseList';
import { DeadlineList } from './components/deadlines/DeadlineList';
import { ClientList } from './components/clients/ClientList';
import { LawyerList } from './components/lawyers/LawyerList';
import { FinancialList } from './components/financial/FinancialList';
import { DocumentList } from './components/documents/DocumentList';
import { DexAIAssistant } from './components/ai-assistant/DexAIAssistant';
import { LGPDCompliance } from './components/lgpd/LGPDCompliance';
import { TeamWall } from './components/team-wall/TeamWall';
import { ReportsView } from './components/reports/ReportsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { SettingsView } from './components/settings/SettingsView';
import { UserProfileView } from './components/profile/UserProfileView';
import { PlansView } from './components/plans/PlansView';
import { PaymentReturnScreen } from './components/plans/PaymentReturnScreen';
import { CaseModal } from './components/cases/CaseModal';
import { DeadlineModal } from './components/deadlines/DeadlineModal';
import { ClientModal } from './components/clients/ClientModal';
import { ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const { isAuthenticated, isAdmin, isAppAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedPlanForRegister, setSelectedPlanForRegister] = useState<string>('Escritório Pro');

  // Gerenciamento de rotas amigáveis na URL (/ , /login , /cadastro , /app , /perfil)
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // Navegador interno sincronizado com o histórico do browser
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Hook para sincronizar com botões Voltar / Avançar do navegador
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Normalização do caminho da URL (minúsculas, sem barras extras)
  const normalizedPath = (currentPath || '/').toLowerCase().trim();
  const cleanPath = normalizedPath.length > 1 && normalizedPath.endsWith('/')
    ? normalizedPath.slice(0, -1)
    : normalizedPath;

  // 2. Hook de sincronização de rotas com abas ativas (/perfil, /configuracoes)
  // DEVE EXECUTAR NO TOPO, INCONDICIONALMENTE, PARA NÃO VIOLAR AS REGRAS DOS HOOKS DO REACT
  useEffect(() => {
    if (cleanPath === '/perfil' || cleanPath === '/profile') {
      setActiveTab('profile');
    } else if (cleanPath === '/configuracoes' || cleanPath === '/settings') {
      if (isAppAdmin) {
        setActiveTab('settings');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [cleanPath, isAppAdmin]);

  // 3. Hook de redirecionamento automático (login / logout)
  useEffect(() => {
    if (isAuthenticated) {
      if (cleanPath === '/login' || cleanPath === '/cadastro') {
        navigate('/app');
      }
    } else {
      const isProtectedRoute = 
        cleanPath.startsWith('/app') || 
        cleanPath.startsWith('/dashboard') || 
        cleanPath.startsWith('/perfil') || 
        cleanPath.startsWith('/profile') || 
        cleanPath.startsWith('/configuracoes') || 
        cleanPath.startsWith('/settings');
      if (isProtectedRoute) {
        navigate('/login');
      }
    }
  }, [isAuthenticated, cleanPath]);

  // Proteção de abas por perfil (RBAC):
  // 1. Se advogado tentar gerenciar equipe ou estiver na aba sem permissão, redireciona para a workbench
  // 2. Se usuário não for o admin do aplicativo (Dex Super Admin), bloqueia Configurações
  useEffect(() => {
    if (activeTab === 'lawyers' && !isAdmin) {
      setActiveTab('lawyer-workbench');
    }
    if (activeTab === 'settings' && !isAppAdmin) {
      setActiveTab('dashboard');
    }
  }, [activeTab, isAdmin, isAppAdmin]);

  const handleTabChange = (tab: TabType) => {
    if (tab === 'landing') {
      navigate('/');
      return;
    }
    if (tab === 'profile') {
      navigate('/perfil');
      setActiveTab('profile');
      return;
    }
    if (tab === 'lawyers' && !isAdmin) {
      setActiveTab('lawyer-workbench');
      return;
    }
    if (tab === 'settings' && !isAppAdmin) {
      setActiveTab('dashboard');
      return;
    }
    navigate('/app');
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={(tab) => handleTabChange(tab)}
            onOpenNewCase={() => setIsCaseModalOpen(true)}
            onOpenNewDeadline={() => setIsDeadlineModalOpen(true)}
            onOpenNewClient={() => setIsClientModalOpen(true)}
          />
        );
      case 'profile':
        return <UserProfileView />;
      case 'lawyer-workbench':
        return (
          <LawyerWorkbench 
            onNavigateToAI={() => handleTabChange('ai-assistant')} 
            onNavigateToOffice={() => handleTabChange('dashboard')} 
          />
        );
      case 'cases':
        return <CaseList />;
      case 'deadlines':
        return <DeadlineList />;
      case 'clients':
        return <ClientList />;
      case 'lawyers':
        // Apenas escritório pode gerenciar equipe
        return isAdmin ? (
          <LawyerList />
        ) : (
          <LawyerWorkbench 
            onNavigateToAI={() => handleTabChange('ai-assistant')} 
            onNavigateToOffice={() => handleTabChange('dashboard')} 
          />
        );
      case 'team-wall':
        return <TeamWall />;
      case 'reports':
        return <ReportsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        // Apenas o administrador da plataforma Dex pode acessar Configurações
        if (!isAppAdmin) {
          return (
            <div className="p-10 text-center max-w-lg mx-auto bg-dex-navy-900 rounded-[24px] border border-dex-coral/40 mt-12 space-y-4 shadow-2xl relative overflow-hidden">
              <div className="w-14 h-14 rounded-full bg-dex-coral/20 text-dex-coral mx-auto flex items-center justify-center">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">403 — Acesso Restrito</h3>
              <p className="text-xs text-slate-300 font-serif leading-relaxed">
                A área de Configurações do Sistema é reservada exclusivamente para o Administrador da Plataforma Dex (App Admin).
              </p>
              <button
                onClick={() => handleTabChange('dashboard')}
                className="px-6 py-2.5 bg-dex-coral hover:bg-dex-coral/90 text-white text-xs font-serif font-bold rounded-xl shadow-lg transition-all"
              >
                Voltar ao Dashboard
              </button>
            </div>
          );
        }
        return <SettingsView />;
      case 'financial':
        return <FinancialList />;
      case 'documents':
        // Aba Modelos & Documentos funcional
        return <DocumentList />;
      case 'ai-assistant':
        return <DexAIAssistant onNavigateToCases={() => handleTabChange('cases')} />;
      case 'lgpd':
        return <LGPDCompliance />;
      case 'plans':
        return <PlansView />;
      default:
        return (
          <DashboardView
            onNavigate={(tab) => handleTabChange(tab)}
            onOpenNewCase={() => setIsCaseModalOpen(true)}
            onOpenNewDeadline={() => setIsDeadlineModalOpen(true)}
            onOpenNewClient={() => setIsClientModalOpen(true)}
          />
        );
    }
  };

  // ROTA: Confirmação de E-mail (por token na URL ou rota /confirmar-email)
  const searchParams = new URLSearchParams(window.location.search);
  const verifyToken = searchParams.get('verify_token');
  const resetToken = searchParams.get('reset_token');
  const paramEmail = searchParams.get('email') || '';

  if (verifyToken || cleanPath === '/confirmar-email') {
    return (
      <EmailConfirmationScreen
        token={verifyToken || ''}
        email={paramEmail}
        onNavigateToLogin={() => navigate('/login')}
        onNavigateToLanding={() => navigate('/')}
      />
    );
  }

  // ROTA: Redefinição de Senha (por token na URL ou rota /redefinir-senha)
  if (resetToken || cleanPath === '/redefinir-senha') {
    return (
      <ResetPasswordScreen
        token={resetToken || ''}
        email={paramEmail}
        onNavigateToLogin={() => navigate('/login')}
        onNavigateToLanding={() => navigate('/')}
      />
    );
  }

  // ROTA: Retorno de Pagamento Stripe (/pagamento-sucesso, /pagamento-pendente, /pagamento-falha)
  if (cleanPath === '/pagamento-sucesso' || cleanPath === '/pagamento-pendente' || cleanPath === '/pagamento-falha') {
    const statusMap = {
      '/pagamento-sucesso': 'SUCCESS' as const,
      '/pagamento-pendente': 'PENDING' as const,
      '/pagamento-falha': 'CANCELED' as const,
    };
    return (
      <PaymentReturnScreen
        status={statusMap[cleanPath as keyof typeof statusMap] || 'SUCCESS'}
        onNavigateToApp={() => navigate('/app')}
        onNavigateToPlans={() => navigate('/planos')}
        onNavigateToLanding={() => navigate('/')}
      />
    );
  }

  // ROTA: Esqueci minha Senha (/esqueci-senha)
  if (cleanPath === '/esqueci-senha') {
    return (
      <ForgotPasswordScreen
        onNavigateToLogin={() => navigate('/login')}
        onNavigateToLanding={() => navigate('/')}
      />
    );
  }

  // ROTA: Planos e Assinatura ("/planos")
  if (cleanPath === '/planos') {
    if (isAuthenticated) {
      return (
        <Layout activeTab="plans" setActiveTab={handleTabChange}>
          <PlansView />
          <CaseModal isOpen={isCaseModalOpen} onClose={() => setIsCaseModalOpen(false)} />
          <DeadlineModal isOpen={isDeadlineModalOpen} onClose={() => setIsDeadlineModalOpen(false)} />
          <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} />
        </Layout>
      );
    }
  }

  // ROTA 1: Página Inicial / Landing Page ("/")
  if (cleanPath === '/' || cleanPath === '') {
    return (
      <LandingPage
        onNavigateToLogin={() => navigate('/login')}
        onNavigateToRegister={(plan) => {
          if (plan) setSelectedPlanForRegister(plan);
          navigate('/cadastro');
        }}
        onBackToApp={() => navigate('/app')}
        isLoggedIn={isAuthenticated}
      />
    );
  }

  // ROTA 2: Tela de Cadastro ("/cadastro")
  if (cleanPath === '/cadastro') {
    if (isAuthenticated) {
      return (
        <Layout activeTab={activeTab} setActiveTab={handleTabChange}>
          {renderContent()}
          <CaseModal isOpen={isCaseModalOpen} onClose={() => setIsCaseModalOpen(false)} />
          <DeadlineModal isOpen={isDeadlineModalOpen} onClose={() => setIsDeadlineModalOpen(false)} />
          <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} />
        </Layout>
      );
    }
    return (
      <RegisterScreen
        onNavigateToLogin={() => navigate('/login')}
        onNavigateToLanding={() => navigate('/')}
        initialPlan={selectedPlanForRegister}
      />
    );
  }

  // ROTA 3: Tela de Login ("/login")
  if (cleanPath === '/login') {
    if (isAuthenticated) {
      return (
        <Layout activeTab={activeTab} setActiveTab={handleTabChange}>
          {renderContent()}
          <CaseModal isOpen={isCaseModalOpen} onClose={() => setIsCaseModalOpen(false)} />
          <DeadlineModal isOpen={isDeadlineModalOpen} onClose={() => setIsDeadlineModalOpen(false)} />
          <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} />
        </Layout>
      );
    }
    return (
      <LoginScreen
        onNavigateToRegister={() => navigate('/cadastro')}
        onNavigateToLanding={() => navigate('/')}
        onNavigateToForgotPassword={() => navigate('/esqueci-senha')}
        onNavigateToConfirmEmail={(em) => navigate(em ? `/confirmar-email?email=${encodeURIComponent(em)}` : '/confirmar-email')}
      />
    );
  }

  // Se não estiver autenticado, qualquer outra rota renderiza a tela de login
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onNavigateToRegister={() => navigate('/cadastro')}
        onNavigateToLanding={() => navigate('/')}
        onNavigateToForgotPassword={() => navigate('/esqueci-senha')}
        onNavigateToConfirmEmail={(em) => navigate(em ? `/confirmar-email?email=${encodeURIComponent(em)}` : '/confirmar-email')}
      />
    );
  }

  // ROTA 4: Sistema / App Autenticado
  return (
    <Layout activeTab={activeTab} setActiveTab={handleTabChange}>
      {renderContent()}

      {/* Modais acionados pelo botão de nova ação rápida */}
      <CaseModal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
      />
      <DeadlineModal
        isOpen={isDeadlineModalOpen}
        onClose={() => setIsDeadlineModalOpen(false)}
      />
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
      />
    </Layout>
  );
};

export default App;
