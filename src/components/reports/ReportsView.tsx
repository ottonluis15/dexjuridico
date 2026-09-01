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
  ArrowDownRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const ReportsView: React.FC = () => {
  const { cases, clients, financial, lawyers, stats, showToast } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('2026');

  const handleExport = (type: string) => {
    showToast(`Gerando relatório executivo em formato ${type}...`, 'info');
  };

  // Group cases by legal area
  const areaCounts = cases.reduce((acc, c) => {
    acc[c.legalArea] = (acc[c.legalArea] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group cases by status
  const statusCounts = cases.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalReceived = financial
    .filter(f => f.status === 'PAGO')
    .reduce((acc, f) => acc + f.amount, 0);

  const totalPending = financial
    .filter(f => f.status === 'PENDENTE' || f.status === 'ATRASADO')
    .reduce((acc, f) => acc + f.amount, 0);

  const totalCaseValue = cases.reduce((acc, c) => acc + (c.value || 0), 0);

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
            Métricas de desempenho, taxa de êxito, distribuição processual e saúde financeira
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('PDF')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
          <button
            onClick={() => handleExport('Excel')}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            Exportar XLS
          </button>
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
            <span>+18.4% vs mês anterior</span>
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
          <span className="text-[10px] text-slate-400 mt-1 block">Previsão para os próx. 45 dias</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Taxa de Êxito Global</span>
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
          <span className="text-[10px] text-slate-400 mt-1 block">{cases.length} processos ativos</span>
        </div>
      </div>

      {/* Distribution Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution by Area */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-brand-400" />
            Distribuição por Área do Direito
          </h3>

          <div className="space-y-3 pt-2">
            {Object.entries(areaCounts).map(([area, count]) => {
              const pct = Math.round((count / (cases.length || 1)) * 100);
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
            })}
          </div>
        </div>

        {/* Productivity by Lawyer */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Produtividade & Alocação por Advogado
          </h3>

          <div className="space-y-3 pt-2">
            {lawyers.map((lawyer) => {
              const lawyerCases = cases.filter(c => c.lawyerId === lawyer.id);
              const lawyerValue = lawyerCases.reduce((acc, c) => acc + c.value, 0);

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
    </div>
  );
};
