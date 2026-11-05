import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { KPICards } from './KPICards';
import { ProcessStatusChart } from './ProcessStatusChart';
import { RevenueExpensesChart } from './RevenueExpensesChart';
import { QuickTasksCard } from './QuickTasksCard';
import { MonthViewCard } from './MonthViewCard';
import { UpcomingDeadlinesCard } from './UpcomingDeadlinesCard';
import { CaseDetailModal } from '../cases/CaseDetailModal';
import { TabType } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: TabType) => void;
  onOpenNewCase: () => void;
  onOpenNewDeadline: () => void;
  onOpenNewClient: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewCase,
  onOpenNewDeadline,
  onOpenNewClient
}) => {
  const { cases } = useData();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const selectedCase = cases.find(c => c.id === selectedCaseId) || null;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* LINHA 1: 4 Cards de KPI em Azul-Marinho com Tiles Coloridos (Anexo 4) */}
      <KPICards onNavigate={onNavigate} />

      {/* LINHA 2: 2 Áreas Grandes (Processos por status e Receitas X Despesas) (Anexo 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
        <ProcessStatusChart onNavigate={() => onNavigate('cases')} />
        <RevenueExpensesChart onNavigate={() => onNavigate('financial')} />
      </div>

      {/* LINHA 3: 3 Cards Inferiores (Tarefas rápidas, Visão do mês, Próximos prazos) (Anexo 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
        <QuickTasksCard />
        <MonthViewCard />
        <UpcomingDeadlinesCard onNavigate={() => onNavigate('deadlines')} />
      </div>

      {/* Modal de Detalhe de Processo se selecionado */}
      {selectedCase && (
        <CaseDetailModal
          caseItem={selectedCase}
          isOpen={!!selectedCase}
          onClose={() => setSelectedCaseId(null)}
        />
      )}
    </div>
  );
};
