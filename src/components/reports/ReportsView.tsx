import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  FolderKanban, 
  Users, 
  CheckCircle2, 
  Download, 
  Calendar, 
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

export const ReportsView: React.FC = () => {
  const { userCases, userFinancial, lawyers, clients, showToast } = useData();
  const { currentUser } = useAuth();

  const [selectedPeriod, setSelectedPeriod] = useState<'ALL' | '2026' | '2025' | 'LAST_30_DAYS'>('2026');
  const [selectedReportType, setSelectedReportType] = useState<'geral' | 'processos' | 'financeiro' | 'equipe'>('geral');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingXLSX, setIsExportingXLSX] = useState(false);

  // Filtragem por escritório do usuário atual
  const officeName = currentUser?.officeName || 'Escritório Dex Jurídico';
  const officeLawyers = lawyers.filter(l => !currentUser?.officeId || l.officeId === currentUser.officeId);
  const officeClients = clients.filter(c => !currentUser?.officeId || c.officeId === currentUser.officeId);

  // Filtragem por período
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

  // Group cases by legal area
  const areaCounts = filteredCases.reduce((acc, c) => {
    acc[c.legalArea] = (acc[c.legalArea] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalReceived = filteredFinancial
    .filter(f => f.status === 'PAGO')
    .reduce((acc, f) => acc + f.amount, 0);

  const totalPending = filteredFinancial
    .filter(f => f.status === 'PENDENTE' || f.status === 'ATRASADO')
    .reduce((acc, f) => acc + f.amount, 0);

  const totalCaseValue = filteredCases.reduce((acc, c) => acc + (c.value || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-400" />
            Relatórios & Inteligência Jurídica
          </h2>
          <p className="text-xs text-slate-400">
            Métricas de desempenho, taxa de êxito, distribuição processual e saúde financeira de {officeName}
          </p>
        </div>

        {/* Botões de Ação de Exportação Real */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors shadow-sm"
            title="Exportar documento oficial em PDF"
          >
            {isExportingPDF ? (
              <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
            ) : (
              <FileText className="w-4 h-4 text-rose-400" />
            )}
            <span>{isExportingPDF ? 'Gerando PDF...' : 'Exportar PDF'}</span>
          </button>

          <button
            onClick={handleExportXLSX}
            disabled={isExportingXLSX}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
            title="Exportar planilha completa em XLSX"
          >
            {isExportingXLSX ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            )}
            <span>{isExportingXLSX ? 'Gerando XLS...' : 'Exportar XLS'}</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Filter className="w-4 h-4 text-brand-400" />
          <span>Filtros do Relatório:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tipo de Relatório */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Tipo:</span>
            <select
              value={selectedReportType}
              onChange={e => setSelectedReportType(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="geral">Geral Executivo (Consolidado)</option>
              <option value="processos">Processos & Casos</option>
              <option value="financeiro">Financeiro & Honorários</option>
              <option value="equipe">Produtividade da Equipe</option>
            </select>
          </div>

          {/* Período */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Período:</span>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="2026">Exercício 2026 (Atual)</option>
              <option value="2025">Exercício 2025</option>
              <option value="LAST_30_DAYS">Últimos 30 Dias</option>
              <option value="ALL">Todo o Histórico</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top Financial & Case Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Honorários Recebidos</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-white mt-2">
            R$ {totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            <span>{filteredFinancial.filter(f => f.status === 'PAGO').length} liquidações</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Honorários a Receber</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-white mt-2">
            R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {filteredFinancial.filter(f => f.status === 'PENDENTE' || f.status === 'ATRASADO').length} pendências no período
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Taxa de Êxito Estimada</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-white mt-2">87.5%</p>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-cyan-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>Acordos e sentenças favoráveis</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Valor Total da Carteira</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-white mt-2">
            R$ {totalCaseValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">{filteredCases.length} processos no período</span>
        </div>
      </div>

      {/* Distribution Grids */}
      {filteredCases.length === 0 && filteredFinancial.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
          <AlertCircle className="w-8 h-8 mx-auto text-amber-400 mb-2" />
          <p className="text-sm font-semibold text-white">Nenhum dado encontrado para o período selecionado</p>
          <p className="text-xs text-slate-400 mt-1">Altere o filtro de período acima para visualizar outros exercícios.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution by Area */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand-400" />
              Distribuição por Área do Direito ({filteredCases.length} processos)
            </h3>

            <div className="space-y-3 pt-2">
              {Object.keys(areaCounts).length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhum processo nesta seleção.</p>
              ) : (
                Object.entries(areaCounts).map(([area, count]) => {
                  const pct = Math.round((count / (filteredCases.length || 1)) * 100);
                  return (
                    <div key={area} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300 font-medium">
                        <span>{area}</span>
                        <span className="text-slate-400">{count} processos ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full transition-all duration-500"
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
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Produtividade & Alocação por Advogado
            </h3>

            <div className="space-y-3 pt-2">
              {officeLawyers.map((lawyer) => {
                const lawyerCases = filteredCases.filter(c => c.lawyerId === lawyer.id);
                const lawyerValue = lawyerCases.reduce((acc, c) => acc + (c.value || 0), 0);

                return (
                  <div key={lawyer.id} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#C69255] text-white flex items-center justify-center font-bold text-xs">
                        {lawyer.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{lawyer.name}</p>
                        <p className="text-[10px] text-slate-400">{lawyer.roleTitle}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold text-white">{lawyerCases.length} processos</p>
                      <p className="text-[10px] text-brand-300">R$ {(lawyerValue / 1000).toFixed(0)}k sob gestão</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
