import React, { useState } from 'react';
import { Sidebar, TabType } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../common/Toast';
import { useData } from '../../context/DataContext';
import { CaseModal } from '../cases/CaseModal';
import { DeadlineModal } from '../deadlines/DeadlineModal';
import { ClientModal } from '../clients/ClientModal';
import { AccessibilityPanel } from '../common/AccessibilityPanel';

interface LayoutProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activeTab,
  setActiveTab,
  children
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const { toasts, removeToast } = useData();

  return (
    <div className="min-h-screen bg-[#4A808E] text-white flex flex-col font-serif selection:bg-dex-coral selection:text-white antialiased">
      {/* Skip Link para Acessibilidade por Teclado */}
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>

      {/* Sidebar (Teal #5A97A5, Anexo 4) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      {/* Área Principal Logada */}
      <div className="lg:pl-64 flex flex-col min-h-screen flex-1">
        {/* Topbar (#162B37, Anexo 4) */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewCaseModal={() => setIsCaseModalOpen(true)}
          onOpenNewDeadlineModal={() => setIsDeadlineModalOpen(true)}
          onOpenNewClientModal={() => setIsClientModalOpen(true)}
        />

        {/* Conteúdo da Página */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto focus:outline-none"
        >
          {children}
        </main>
      </div>

      {/* Painel de Acessibilidade Flutuante */}
      <AccessibilityPanel />

      {/* Toasts de Notificação */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Modais Globais de Ação Rápida */}
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
    </div>
  );
};
