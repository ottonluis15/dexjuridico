import React, { useState } from 'react';
import { Sidebar, TabType } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../common/Toast';
import { useData } from '../../context/DataContext';
import { CaseModal } from '../cases/CaseModal';
import { DeadlineModal } from '../deadlines/DeadlineModal';
import { ClientModal } from '../clients/ClientModal';
import { CaseDetailModal } from '../cases/CaseDetailModal';
import { ClientDetailModal } from '../clients/ClientDetailModal';
import { AccessibilityPanel } from '../common/AccessibilityPanel';
import { LegalCase, Client } from '../../types';

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
  const [detailCase, setDetailCase] = useState<LegalCase | null>(null);
  const [detailClient, setDetailClient] = useState<Client | null>(null);

  const { toasts, removeToast } = useData();

  return (
    <div className="min-h-screen bg-[#4A808E] dark:bg-[#0A1922] text-white flex flex-col font-serif selection:bg-dex-coral selection:text-white antialiased transition-colors duration-200">
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
        {/* Topbar (#162B37, Anexo 4) com Busca Global Funcional */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewCaseModal={() => setIsCaseModalOpen(true)}
          onOpenNewDeadlineModal={() => setIsDeadlineModalOpen(true)}
          onOpenNewClientModal={() => setIsClientModalOpen(true)}
          onOpenCaseDetail={(c) => setDetailCase(c)}
          onOpenClientDetail={(cl) => setDetailClient(cl)}
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

      {/* Modais de Detalhe acionados pela Busca Global */}
      {detailCase && (
        <CaseDetailModal
          caseItem={detailCase}
          isOpen={!!detailCase}
          onClose={() => setDetailCase(null)}
        />
      )}
      {detailClient && (
        <ClientDetailModal
          client={detailClient}
          isOpen={!!detailClient}
          onClose={() => setDetailClient(null)}
        />
      )}
    </div>
  );
};
