// Serviço Especializado de Exportação Financeira (XLSX / CSV) — Dex Jurídico
// Proteção contra Formula Injection (OWASP)
// Compatível com Excel brasileiro (números reais, formato monetário R$, separador ';' e UTF-8 BOM)

import * as XLSX from 'xlsx';
import { FinancialEntry, Client, LegalCase, Lawyer, User } from '../types';

export interface FinancialExportOptions {
  entries: FinancialEntry[];
  clients: Client[];
  cases: LegalCase[];
  lawyers: Lawyer[];
  currentUser?: User | null;
  periodLabel?: string;
  format?: 'xlsx' | 'csv';
}

/**
 * Sanitiza valores de texto para proteção contra injeção de fórmulas no Excel (OWASP CSV/Formula Injection)
 * Previne execução de comandos caso o valor comece com '=', '+', '-', '@', tab ou carriage return.
 */
export function sanitizeCell<T>(val: T): T {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (
      trimmed.startsWith('=') ||
      trimmed.startsWith('+') ||
      trimmed.startsWith('-') ||
      trimmed.startsWith('@') ||
      trimmed.startsWith('\t') ||
      trimmed.startsWith('\r')
    ) {
      // Precede com apóstrofo para forçar o Excel a tratar como texto literal
      return `'${val}` as unknown as T;
    }
  }
  return val;
}

/**
 * Converte data ISO AAAA-MM-DD para DD/MM/AAAA
 */
function formatDateBR(dateStr?: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Extrai mês/ano no formato MM/AAAA
 */
function getMonthYear(dateStr?: string): string {
  if (!dateStr) return 'Sem Data';
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    return `${parts[1]}/${parts[0]}`;
  }
  return 'Outros';
}

/**
 * Gera um slug limpo para o nome do arquivo
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'escritorio';
}

export async function exportFinancialSheet(options: FinancialExportOptions): Promise<{ success: boolean; filename: string }> {
  const {
    entries,
    clients,
    cases,
    lawyers,
    currentUser,
    periodLabel = 'Todos os Lançamentos',
    format = 'xlsx'
  } = options;

  if (!entries || entries.length === 0) {
    throw new Error('Não há lançamentos financeiros para exportar com os filtros selecionados.');
  }

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateSuffix = `${yyyy}-${mm}-${dd}`;

  const officeSlug = slugify(currentUser?.officeName || currentUser?.name || 'dex-juridico');
  const baseFilename = `financeiro-${officeSlug}-${dateSuffix}`;

  // Se o usuário solicitou CSV (UTF-8 com BOM e separador ';')
  if (format === 'csv') {
    const csvHeaders = [
      'Data Vencimento',
      'Data Pagamento',
      'Titulo / Descricao',
      'Categoria',
      'Tipo',
      'Cliente Vinculado',
      'Processo Vinculado',
      'Valor (R$)',
      'Status',
      'Forma de Pagamento',
      'Comprovante',
      'Responsavel'
    ];

    const csvRows = entries.map(f => {
      const client = clients.find(c => c.id === f.clientId);
      const caseItem = cases.find(c => c.id === f.caseId);
      const lawyer = lawyers.find(l => l.id === f.lawyerId);

      const fields = [
        formatDateBR(f.dueDate),
        formatDateBR(f.paymentDate),
        sanitizeCell(f.title || f.description || 'Lançamento'),
        sanitizeCell(f.type?.replace('_', ' ') || 'Honorários'),
        f.type === 'DESPESA' || f.type === 'CUSTAS' ? 'Despesa' : 'Receita',
        sanitizeCell(client?.name || '-'),
        sanitizeCell(caseItem?.caseNumber || '-'),
        (Number(f.amount) || 0).toFixed(2).replace('.', ','),
        f.status,
        sanitizeCell(f.paymentMethod || 'Não informado'),
        f.hasReceipt ? (f.receiptName ? sanitizeCell(f.receiptName) : 'Sim') : 'Não',
        sanitizeCell(lawyer?.name || '-')
      ];

      // Escapa aspas e junta com ';'
      return fields.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';');
    });

    const csvContent = '\uFEFF' + [csvHeaders.join(';'), ...csvRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseFilename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, filename: `${baseFilename}.csv` };
  }

  // GERAÇÃO DE EXCEL (.XLSX) COM DUAS ABAS: "Lançamentos" e "Resumo"
  const wb = XLSX.utils.book_new();

  // 1. ABA LANÇAMENTOS
  const headers = [
    'Data de Vencimento',
    'Data de Pagamento',
    'Descrição / Título',
    'Categoria',
    'Tipo',
    'Cliente Vinculado',
    'Processo Vinculado',
    'Valor (R$)',
    'Status',
    'Forma de Pagamento',
    'Comprovante Anexado',
    'Responsável'
  ];

  const dataRows: any[][] = entries.map(f => {
    const client = clients.find(c => c.id === f.clientId);
    const caseItem = cases.find(c => c.id === f.caseId);
    const lawyer = lawyers.find(l => l.id === f.lawyerId);

    const isExpense = f.type === 'DESPESA' || f.type === 'CUSTAS';

    return [
      formatDateBR(f.dueDate),
      formatDateBR(f.paymentDate),
      sanitizeCell(f.title || f.description || 'Lançamento'),
      sanitizeCell(f.type?.replace('_', ' ') || 'Honorários'),
      isExpense ? 'Despesa' : 'Receita',
      sanitizeCell(client?.name || '-'),
      sanitizeCell(caseItem?.caseNumber || '-'),
      Number(f.amount) || 0, // Número real para fórmulas e somas no Excel
      f.status,
      sanitizeCell(f.paymentMethod || 'A Combinar'),
      f.hasReceipt ? (f.receiptName ? sanitizeCell(f.receiptName) : 'Sim') : 'Não',
      sanitizeCell(lawyer?.name || '-')
    ];
  });

  const wsEntries = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

  // Formatação de coluna monetária para R$
  const range = XLSX.utils.decode_range(wsEntries['!ref'] || 'A1');
  for (let R = 1; R <= range.e.r; ++R) {
    const cellAddress = XLSX.utils.encode_cell({ r: R, c: 7 }); // Coluna 7 = Valor (R$)
    if (wsEntries[cellAddress]) {
      wsEntries[cellAddress].t = 'n';
      wsEntries[cellAddress].z = '"R$" #,##0.00';
    }
  }

  // Larguras adequadas de colunas
  wsEntries['!cols'] = [
    { wch: 18 }, // Vencimento
    { wch: 18 }, // Pagamento
    { wch: 36 }, // Descrição
    { wch: 22 }, // Categoria
    { wch: 14 }, // Tipo
    { wch: 30 }, // Cliente
    { wch: 26 }, // Processo
    { wch: 18 }, // Valor
    { wch: 14 }, // Status
    { wch: 20 }, // Forma Pagamento
    { wch: 24 }, // Comprovante
    { wch: 26 }  // Responsável
  ];

  // Congelar linha de cabeçalho
  wsEntries['!freeze'] = { xSplit: 0, ySplit: 1 };

  // Filtro automático na linha de cabeçalho
  wsEntries['!autofilter'] = { ref: wsEntries['!ref'] || 'A1:L1' };

  XLSX.utils.book_append_sheet(wb, wsEntries, 'Lançamentos');

  // 2. ABA RESUMO (Totais de Receitas, Despesas e Saldo, por Mês e por Categoria)
  let totalReceitas = 0;
  let totalDespesas = 0;
  let totalReceitasPagas = 0;
  let totalDespesasPagas = 0;

  const porMes: Record<string, { receitas: number; despesas: number }> = {};
  const porCategoria: Record<string, { total: number; count: number; tipo: string }> = {};

  entries.forEach(f => {
    const val = Number(f.amount) || 0;
    const isExpense = f.type === 'DESPESA' || f.type === 'CUSTAS';
    const mes = getMonthYear(f.paymentDate || f.dueDate);
    const cat = f.type?.replace('_', ' ') || 'Geral';

    if (isExpense) {
      totalDespesas += val;
      if (f.status === 'PAGO') totalDespesasPagas += val;
    } else {
      totalReceitas += val;
      if (f.status === 'PAGO') totalReceitasPagas += val;
    }

    if (!porMes[mes]) porMes[mes] = { receitas: 0, despesas: 0 };
    if (isExpense) {
      porMes[mes].despesas += val;
    } else {
      porMes[mes].receitas += val;
    }

    if (!porCategoria[cat]) porCategoria[cat] = { total: 0, count: 0, tipo: isExpense ? 'Despesa' : 'Receita' };
    porCategoria[cat].total += val;
    porCategoria[cat].count += 1;
  });

  const saldoGeral = totalReceitas - totalDespesas;
  const saldoRealizado = totalReceitasPagas - totalDespesasPagas;

  const summaryAoa: any[][] = [
    ['DEX JURÍDICO — RELATÓRIO FINANCEIRO CONSOLIDADO'],
    ['Escritório:', sanitizeCell(currentUser?.officeName || currentUser?.name || 'Banca Dex')],
    ['Período Filtrado:', periodLabel],
    ['Gerado em:', `${today.toLocaleDateString('pt-BR')} às ${today.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`],
    [''],
    ['TOTAIS GERAIS DA SELEÇÃO', 'VALOR (R$)'],
    ['Total Previsto de Receitas', totalReceitas],
    ['Total Previsto de Despesas', totalDespesas],
    ['Saldo Líquido Previsto', saldoGeral],
    ['Receitas Efetivamente Pagas', totalReceitasPagas],
    ['Despesas Efetivamente Pagas', totalDespesasPagas],
    ['Saldo Realizado em Caixa', saldoRealizado],
    [''],
    ['DETALHAMENTO POR MÊS', 'RECEITAS (R$)', 'DESPESAS (R$)', 'SALDO DO MÊS (R$)']
  ];

  Object.entries(porMes)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([mes, vals]) => {
      summaryAoa.push([
        mes,
        vals.receitas,
        vals.despesas,
        vals.receitas - vals.despesas
      ]);
    });

  summaryAoa.push(['']);
  summaryAoa.push(['DETALHAMENTO POR CATEGORIA', 'TIPO', 'QTD LANÇAMENTOS', 'TOTAL (R$)']);

  Object.entries(porCategoria).forEach(([cat, data]) => {
    summaryAoa.push([
      cat,
      data.tipo,
      data.count,
      data.total
    ]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryAoa);

  // Formatação de moedas na aba de resumo
  wsSummary['!cols'] = [
    { wch: 34 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 }
  ];

  // Aplicar formato R$ nas linhas de valores
  const summaryRange = XLSX.utils.decode_range(wsSummary['!ref'] || 'A1');
  for (let R = 5; R <= summaryRange.e.r; ++R) {
    for (let C = 1; C <= 3; ++C) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (wsSummary[addr] && typeof wsSummary[addr].v === 'number') {
        wsSummary[addr].t = 'n';
        wsSummary[addr].z = '"R$" #,##0.00';
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');

  // Grava o arquivo físico
  const finalFilename = `${baseFilename}.xlsx`;
  XLSX.writeFile(wb, finalFilename);

  return { success: true, filename: finalFilename };
}
