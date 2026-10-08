import React, { useState } from 'react';
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
  const { isAuthenticated, login } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register'>('landing');
  const [selectedPlanForRegister, setSelectedPlanForRegister] = useState<string>('Escritório Pro');

  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // Se não estiver autenticado, controla navegação pública entre Landing, Login e Cadastro
  if (!isAuthenticated) {
    if (authView === 'landing') {
      return (
        <LandingPage
          onNavigateToLogin={() => setAuthView('login')}
          onNavigateToRegister={(plan) => {
            if (plan) setSelectedPlanForRegister(plan);
            setAuthView('register');
          }}
          onQuickDemo={() => login('helena.moreira@dexjuridico.adv.br')}
        />
      );
    }

    if (authView === 'register') {
      return (
        <RegisterScreen
          onNavigateToLogin={() => setAuthView('login')}
          onNavigateToLanding={() => setAuthView('landing')}
          initialPlan={selectedPlanForRegister}
        />
      );
    }

    return (
      <LoginScreen
        onNavigateToRegister={() => setAuthView('register')}
        onNavigateToLanding={() => setAuthView('landing')}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenNewCase={() => setIsCaseModalOpen(true)}
            onOpenNewDeadline={() => setIsDeadlineModalOpen(true)}
            onOpenNewClient={() => setIsClientModalOpen(true)}
          />
        );
      case 'lawyer-workbench':
        return <LawyerWorkbench onNavigateToAI={() => setActiveTab('ai-assistant')} />;
      case 'cases':
        return <CaseList />;
      case 'deadlines':
        return <DeadlineList />;
      case 'clients':
        return <ClientList />;
      case 'lawyers':
        return <LawyerList />;
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
        return <DocumentList />;
      case 'ai-assistant':
        return <DexAIAssistant onNavigateToCases={() => setActiveTab('cases')} />;
      case 'lgpd':
        return <LGPDCompliance />;
      case 'landing':
        return (
          <LandingPage
            onNavigateToLogin={() => {}}
            onNavigateToRegister={() => {}}
            onBackToApp={() => setActiveTab('dashboard')}
            isLoggedIn={true}
          />
        );
      default:
        return (
          <DashboardView
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenNewCase={() => setIsCaseModalOpen(true)}
            onOpenNewDeadline={() => setIsDeadlineModalOpen(true)}
            onOpenNewClient={() => setIsClientModalOpen(true)}
          />
        );
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}

      {/* Direct modals when triggered from dashboard buttons */}
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
