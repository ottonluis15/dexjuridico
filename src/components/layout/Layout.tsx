import React, { useState } from 'react';
import { Sidebar, TabType } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../common/Toast';
import { useData } from '../../context/DataContext';
import { CaseModal } from '../cases/CaseModal';
import { DeadlineModal } from '../deadlines/DeadlineModal';
import { ClientModal } from '../clients/ClientModal';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen flex-1">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewCaseModal={() => setIsCaseModalOpen(true)}
          onOpenNewDeadlineModal={() => setIsDeadlineModalOpen(true)}
          onOpenNewClientModal={() => setIsClientModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {children}
        </main>
      </div>

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Global Quick Creation Modals */}
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
