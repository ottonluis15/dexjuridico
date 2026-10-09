import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { TabType } from './components/layout/Sidebar';
import { LoginScreen } from './components/auth/LoginScreen';
import { RegisterScreen } from './components/auth/RegisterScreen';
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
import { CaseModal } from './components/cases/CaseModal';
import { DeadlineModal } from './components/deadlines/DeadlineModal';
import { ClientModal } from './components/clients/ClientModal';

export const App: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedPlanForRegister, setSelectedPlanForRegister] = useState<string>('Escritório Pro');

  // Gerenciamento de rotas amigáveis na URL (/ , /login , /cadastro , /app)
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
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Redirecionamento automático se usuário logar ou deslogar
  useEffect(() => {
    if (isAuthenticated) {
      // Se autenticado e estava nas telas de login/cadastro, redireciona para o sistema
      if (currentPath === '/login' || currentPath === '/cadastro') {
        navigate('/app');
      }
    } else {
      // Se não autenticado e tentou acessar rota protegida do sistema, vai para login
      if (currentPath.startsWith('/app') || currentPath.startsWith('/dashboard')) {
        navigate('/login');
      }
    }
  }, [isAuthenticated, currentPath]);

  // ROTA 1: Página Inicial / Landing Page ("/")
  if (currentPath === '/' || currentPath === '') {
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
  if (currentPath === '/cadastro') {
    if (isAuthenticated) {
      navigate('/app');
      return null;
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
  if (currentPath === '/login') {
    if (isAuthenticated) {
      navigate('/app');
      return null;
    }
    return (
      <LoginScreen
        onNavigateToRegister={() => navigate('/cadastro')}
        onNavigateToLanding={() => navigate('/')}
      />
    );
  }

  // ROTA 4: Sistema / Dashboard ("/app" ou rotas internas)
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onNavigateToRegister={() => navigate('/cadastro')}
        onNavigateToLanding={() => navigate('/')}
      />
    );
  }

  // Proteção de abas por perfil (RBAC):
  // Se advogado tentar abrir a aba exclusiva de administração da banca, redireciona para a workbench
  const handleTabChange = (tab: TabType) => {
    if (tab === 'landing') {
      navigate('/');
      return;
    }
    if (tab === 'lawyers' && !isAdmin) {
      setActiveTab('lawyer-workbench');
      return;
    }
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
      case 'lawyer-workbench':
        return <LawyerWorkbench onNavigateToAI={() => handleTabChange('ai-assistant')} />;
      case 'cases':
        return <CaseList />;
      case 'deadlines':
        return <DeadlineList />;
      case 'clients':
        return <ClientList />;
      case 'lawyers':
        // Apenas escritório pode gerenciar equipe
        return isAdmin ? <LawyerList /> : <LawyerWorkbench onNavigateToAI={() => handleTabChange('ai-assistant')} />;
      case 'team-wall':
        return <TeamWall />;
      case 'reports':
        return <ReportsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
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
