import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  PieChart, 
  Scale, 
  Award, 
  ArrowUpRight, 
  Filter, 
  Loader2, 
  FileSpreadsheet, 
  FileText, 
  AlertCircle 
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { exportReportToPDF, exportReportToXLSX } from '../../services/reportExportService';
import { InternalPageLayout } from '../layout/InternalPageLayout';

export const ReportsView: React.FC = () => {
  const { userCases, userFinancial, lawyers, clients, showToast } = useData();
  const { currentUser } = useAuth();

  const [selectedPeriod, setSelectedPeriod] = useState<'ALL' | '2026' | '2025' | 'LAST_30_DAYS'>('2026');
  const [selectedReportType, setSelectedReportType] = useState<'geral' | 'processos' | 'financeiro' | 'equipe'>('geral');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingXLSX, setIsExportingXLSX] = useState(false);

  const officeName = currentUser?.officeName || 'Escritório Dex Jurídico';
  const officeLawyers = lawyers.filter(l => !currentUser?.officeId || l.officeId === currentUser.officeId);
  const officeClients = clients.filter(c => !currentUser?.officeId || c.officeId === currentUser.officeId);

  const filteredCases = userCases.filter(c => {
    if (selectedPeriod === 'ALL') return true;
    if (selectedPeriod === '2026') return c.distributionDate?.startsWith('2026');
    if (selectedPeriod === '2025') return c.distributionDate?.startsWith('2025');
    if (selectedPeriod === 'LAST_30_DAYS') {
      if (!c.distributionDate) return true;
      const d = new Date(c.distributionDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return d >= thirtyDaysAgo;
    }
    return true;
  });

  const filteredFinancial = userFinancial.filter(f => {
    if (selectedPeriod === 'ALL') return true;
    if (selectedPeriod === '2026') return f.dueDate?.startsWith('2026');
    if (selectedPeriod === '2025') return f.dueDate?.startsWith('2025');
    if (selectedPeriod === 'LAST_30_DAYS') {
      if (!f.dueDate) return true;
      const d = new Date(f.dueDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return d >= thirtyDaysAgo;
    }
    return true;
  });

  const periodLabels: Record<string, string> = {
    ALL: 'Histórico Completo',
    '2026': 'Ano de 2026 (Exercício Atual)',
    '2025': 'Ano de 2025 (Exercício Anterior)',
    LAST_30_DAYS: 'Últimos 30 Dias'
  };

  const handleExportPDF = async () => {
    if (filteredCases.length === 0 && filteredFinancial.length === 0) {
      showToast('Aviso: Nenhum dado encontrado para o período selecionado.', 'warning');
    }

    setIsExportingPDF(true);
    try {
      await exportReportToPDF({
        officeName,
        reportType: selectedReportType,
        periodLabel: periodLabels[selectedPeriod],
        cases: filteredCases,
        financial: filteredFinancial,
        lawyers: officeLawyers,
        clients: officeClients,
        currentUser
      });
      showToast('Relatório PDF gerado e baixado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao gerar relatório em PDF. Tente novamente.', 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportXLSX = async () => {
    if (filteredCases.length === 0 && filteredFinancial.length === 0) {
      showToast('Aviso: Nenhum dado encontrado para o período selecionado.', 'warning');
    }

    setIsExportingXLSX(true);
    try {
      await exportReportToXLSX({
        officeName,
        reportType: selectedReportType,
        periodLabel: periodLabels[selectedPeriod],
        cases: filteredCases,
        financial: filteredFinancial,
        lawyers: officeLawyers,
        clients: officeClients,
        currentUser
      });
      showToast('Planilha XLS baixada com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao exportar planilha XLS. Tente novamente.', 'error');
    } finally {
      setIsExportingXLSX(false);
    }
  };

  const totalReceived = filteredFinancial
    .filter(f => f.status === 'PAGO')
    .reduce((acc, f) => acc + f.amount, 0);

  const totalPending = filteredFinancial
    .filter(f => f.status === 'PENDENTE' || f.status === 'ATRASADO')
    .reduce((acc, f) => acc + f.amount, 0);

  const totalCaseValue = filteredCases.reduce((acc, c) => acc + (c.value || 0), 0);

  const areaCounts = filteredCases.reduce((acc, c) => {
    acc[c.legalArea] = (acc[c.legalArea] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const kpis = [
    {
      title: 'Honorários Recebidos',
      value: `R$ ${(totalReceived / 1000).toFixed(1)}k`,
      icon: TrendingUp,
      iconTileColor: 'mint' as const
    },
    {
      title: 'Honorários a Receber',
      value: `R$ ${(totalPending / 1000).toFixed(1)}k`,
      icon: DollarSign,
      iconTileColor: 'peach' as const
    },
    {
      title: 'Taxa de Êxito',
      value: '87.5%',
      icon: Award,
      iconTileColor: 'purple' as const
    },
    {
      title: 'Valor Total da Carteira',
      value: `R$ ${(totalCaseValue / 1000).toFixed(1)}k`,
      icon: Scale,
      iconTileColor: 'cream' as const
    }
  ];

  return (
    <InternalPageLayout
      title="Relatórios & Indicadores"
      subtitle={`Métricas de desempenho, distribuição processual e saúde financeira de ${officeName}`}
      kpis={kpis}
      filters={[
        { label: 'Exercício 2026', active: selectedPeriod === '2026', onClick: () => setSelectedPeriod('2026') },
        { label: 'Exercício 2025', active: selectedPeriod === '2025', onClick: () => setSelectedPeriod('2025') },
        { label: 'Últimos 30 dias', active: selectedPeriod === 'LAST_30_DAYS', onClick: () => setSelectedPeriod('LAST_30_DAYS') },
        { label: 'Histórico Completo', active: selectedPeriod === 'ALL', onClick: () => setSelectedPeriod('ALL') }
      ]}
    >
      <div className="space-y-6">
        {/* Export Toolbar */}
        <div className="p-5 rounded-[20px] bg-dex-navy-800 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-serif text-[#8F8A87]">Tipo de Relatório:</span>
            <select
              value={selectedReportType}
              onChange={e => setSelectedReportType(e.target.value as any)}
              className="px-3.5 py-2 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
            >
              <option value="geral">Geral Executivo (Consolidado)</option>
              <option value="processos">Processos & Casos</option>
              <option value="financeiro">Financeiro & Honorários</option>
              <option value="equipe">Produtividade da Equipe</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-dex-coral hover:bg-dex-coral/90 disabled:opacity-50 text-white text-xs font-serif font-bold rounded-xl shadow-lg transition-all"
            >
              {isExportingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span>{isExportingPDF ? 'Gerando...' : 'Exportar PDF'}</span>
            </button>

            <button
              onClick={handleExportXLSX}
              disabled={isExportingXLSX}
              className="flex items-center gap-2 px-4 py-2.5 bg-dex-slate hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-serif font-bold rounded-xl shadow-lg transition-all"
            >
              {isExportingXLSX ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              <span>{isExportingXLSX ? 'Gerando...' : 'Exportar XLS'}</span>
            </button>
          </div>
        </div>

        {/* Detailed Distribution Grids */}
        {filteredCases.length === 0 && filteredFinancial.length === 0 ? (
          <div className="p-12 text-center bg-dex-navy-800 rounded-[24px] border border-white/5 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-dex-coral mb-2" />
            <h4 className="font-serif text-base font-bold text-white">Nenhum dado encontrado para o período selecionado</h4>
            <p className="text-xs text-[#8F8A87] font-serif">Altere o filtro de período acima para visualizar outros exercícios.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribution by Area */}
            <div className="p-6 md:p-8 rounded-[24px] bg-dex-navy-800 border border-white/5 shadow-xl space-y-4">
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-dex-peach" />
                Distribuição por Área do Direito ({filteredCases.length} processos)
              </h3>

              <div className="space-y-4 pt-2">
                {Object.keys(areaCounts).length === 0 ? (
                  <p className="text-xs text-[#8F8A87] font-serif italic">Nenhum processo nesta seleção.</p>
                ) : (
                  Object.entries(areaCounts).map(([area, count]) => {
                    const pct = Math.round((count / (filteredCases.length || 1)) * 100);
                    return (
                      <div key={area} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-serif">
                          <span className="text-slate-200">{area}</span>
                          <span className="text-[#8F8A87]">{count} processos ({pct}%)</span>
                        </div>
                        <div className="h-2.5 w-full bg-dex-navy-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-dex-coral rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Productivity by Lawyer */}
            <div className="p-6 md:p-8 rounded-[24px] bg-dex-navy-800 border border-white/5 shadow-xl space-y-4">
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-dex-coral" />
                Produtividade & Alocação por Advogado
              </h3>

              <div className="space-y-3 pt-2">
                {officeLawyers.map((lawyer) => {
                  const lawyerCases = filteredCases.filter(c => c.lawyerId === lawyer.id);
                  const lawyerValue = lawyerCases.reduce((acc, c) => acc + (c.value || 0), 0);

                  return (
                    <div key={lawyer.id} className="p-3.5 rounded-xl bg-dex-navy-950/60 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-dex-coral text-white flex items-center justify-center font-serif font-bold text-xs">
                          {lawyer.name[0]}
                        </div>
                        <div>
                          <p className="font-serif text-xs font-bold text-white">{lawyer.name}</p>
                          <p className="text-[10px] text-[#8F8A87] font-serif">{lawyer.roleTitle}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-serif text-xs font-semibold text-white">{lawyerCases.length} processos</p>
                        <p className="text-[10px] text-dex-peach font-serif">R$ {(lawyerValue / 1000).toFixed(0)}k sob gestão</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </InternalPageLayout>
  );
};
