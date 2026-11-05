import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { LegalCase, FinancialEntry, Lawyer, Client, User } from '../types';

export interface ReportExportParams {
  officeName: string;
  reportType: 'geral' | 'processos' | 'financeiro' | 'equipe';
  periodLabel: string;
  cases: LegalCase[];
  financial: FinancialEntry[];
  lawyers: Lawyer[];
  clients: Client[];
  currentUser?: User | null;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

const formatDateBR = (dateStr?: string) => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const getNowDateString = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getNowDateTimeString = () => {
  const now = new Date();
  return now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Geração de PDF do Relatório com identidade visual Dex
 */
export async function exportReportToPDF(params: ReportExportParams): Promise<void> {
  const { officeName, reportType, periodLabel, cases, financial, lawyers, clients } = params;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const todayStr = getNowDateString();
  const generationTimeStr = getNowDateTimeString();

  // Cabeçalho Principal (Azul Marinho Dex: #0F2733)
  doc.setFillColor(15, 39, 51);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Nome do Escritório e Sistema
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(officeName.toUpperCase(), 14, 12);

  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(240, 203, 174); // Pêssego Dex (#F0CBAE)
  doc.text('DEX JURÍDICO — GESTÃO INTELIGENTE COM IA', 14, 18);

  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(220, 229, 228); // Cinza-azulado (#DCE5E4)
  doc.text(`Data: ${generationTimeStr} | Período: ${periodLabel}`, 14, 23);

  // Faixas decorativas (Coral #F4665C em cima, Teal #4A808E embaixo)
  doc.setFillColor(244, 102, 92);
  doc.rect(0, 28, pageWidth, 1.5, 'F');
  doc.setFillColor(74, 128, 142);
  doc.rect(0, 29.5, pageWidth, 1, 'F');

  let currentY = 38;

  // Título do Relatório
  const typeTitles: Record<string, string> = {
    geral: 'RELATÓRIO EXECUTIVO INTEGRADO',
    processos: 'RELATÓRIO DE PROCESSOS & CASOS',
    financeiro: 'RELATÓRIO FINANCEIRO & HONORÁRIOS',
    equipe: 'RELATÓRIO DE PRODUTIVIDADE DA EQUIPE'
  };

  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 39, 51);
  doc.text(typeTitles[reportType] || 'RELATÓRIO GERENCIAL', 14, currentY);
  currentY += 8;

  // Métricas Consolidadas / Resumo
  const totalReceived = financial.filter(f => f.status === 'PAGO').reduce((acc, f) => acc + f.amount, 0);
  const totalPending = financial.filter(f => f.status === 'PENDENTE' || f.status === 'ATRASADO').reduce((acc, f) => acc + f.amount, 0);
  const totalCaseValue = cases.reduce((acc, c) => acc + (c.value || 0), 0);

  // Cards de Resumo no PDF
  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    head: [['Processos Ativos', 'Valor da Carteira', 'Honorários Recebidos', 'A Receber / Pendente']],
    body: [[
      `${cases.length} casos`,
      formatCurrency(totalCaseValue),
      formatCurrency(totalReceived),
      formatCurrency(totalPending)
    ]],
    headStyles: {
      fillColor: [22, 43, 55], // #162B37 Navy
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      font: 'times',
      fontSize: 8.5,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      font: 'times',
      fontStyle: 'bold',
      halign: 'center',
      textColor: [15, 39, 51]
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // 1. Tabela de Processos
  if (reportType === 'geral' || reportType === 'processos') {
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 39, 51);
    doc.text('Distribuição de Processos Ativos', 14, currentY);
    currentY += 4;

    const processRows = cases.map(c => {
      const client = clients.find(cl => cl.id === c.clientId);
      const lawyer = lawyers.find(l => l.id === c.lawyerId);
      return [
        c.caseNumber,
        client?.name || '-',
        c.legalArea || '-',
        c.status || '-',
        lawyer?.name ? lawyer.name.split(' ')[0] + ' ' + (lawyer.name.split(' ')[1] || '') : '-',
        formatCurrency(c.value || 0)
      ];
    });

    autoTable(doc, {
      startY: currentY,
      theme: 'striped',
      head: [['Número do Processo', 'Cliente', 'Área', 'Fase / Status', 'Responsável', 'Valor']],
      body: processRows.length > 0 ? processRows : [['Nenhum processo encontrado no período', '', '', '', '', '']],
      headStyles: {
        fillColor: [22, 43, 55],
        textColor: [255, 255, 255],
        font: 'times',
        fontSize: 7.5,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 236, 226] // #F9ECE2 Cream
      },
      bodyStyles: {
        fontSize: 7.5,
        font: 'times',
        textColor: [15, 39, 51]
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 38 },
        1: { cellWidth: 42 },
        2: { cellWidth: 26 },
        3: { cellWidth: 24 },
        4: { cellWidth: 26 },
        5: { halign: 'right', cellWidth: 26 }
      },
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // 2. Tabela Financeira
  if (reportType === 'geral' || reportType === 'financeiro') {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 39, 51);
    doc.text('Demonstrativo de Lançamentos Financeiros', 14, currentY);
    currentY += 4;

    const financialRows = financial.map(f => {
      const client = clients.find(cl => cl.id === f.clientId);
      return [
        f.title,
        client?.name || '-',
        f.type.replace('_', ' '),
        formatDateBR(f.dueDate),
        f.status,
        f.paymentMethod,
        formatCurrency(f.amount)
      ];
    });

    autoTable(doc, {
      startY: currentY,
      theme: 'striped',
      head: [['Título / Descrição', 'Cliente', 'Tipo', 'Vencimento', 'Status', 'Forma', 'Valor']],
      body: financialRows.length > 0 ? financialRows : [['Nenhum lançamento financeiro registrado', '', '', '', '', '', '']],
      headStyles: {
        fillColor: [74, 128, 142], // #4A808E Teal
        textColor: [255, 255, 255],
        font: 'times',
        fontSize: 7.5,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 236, 226]
      },
      bodyStyles: {
        fontSize: 7.5,
        font: 'times',
        textColor: [15, 39, 51]
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 42 },
        1: { cellWidth: 36 },
        2: { cellWidth: 26 },
        3: { cellWidth: 20 },
        4: { cellWidth: 18 },
        5: { cellWidth: 18 },
        6: { halign: 'right', cellWidth: 22 }
      },
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // 3. Tabela de Equipe
  if (reportType === 'geral' || reportType === 'equipe') {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 39, 51);
    doc.text('Produtividade & Alocação por Advogado', 14, currentY);
    currentY += 4;

    const lawyerRows = lawyers.map(l => {
      const lawyerCases = cases.filter(c => c.lawyerId === l.id);
      const lawyerValue = lawyerCases.reduce((acc, c) => acc + (c.value || 0), 0);
      return [
        l.name,
        l.oab || '-',
        l.roleTitle || 'Advogado',
        `${lawyerCases.length} processos`,
        formatCurrency(lawyerValue)
      ];
    });

    autoTable(doc, {
      startY: currentY,
      theme: 'striped',
      head: [['Nome do Advogado', 'OAB', 'Cargo', 'Casos Atribuídos', 'Carteira sob Gestão']],
      body: lawyerRows.length > 0 ? lawyerRows : [['Nenhum advogado registrado', '', '', '', '']],
      headStyles: {
        fillColor: [22, 43, 55],
        textColor: [255, 255, 255],
        font: 'times',
        fontSize: 7.5,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 236, 226]
      },
      bodyStyles: {
        fontSize: 7.5,
        font: 'times',
        textColor: [15, 39, 51]
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 46 },
        1: { cellWidth: 28 },
        2: { cellWidth: 42 },
        3: { halign: 'center', cellWidth: 32 },
        4: { halign: 'right', cellWidth: 34 }
      },
      margin: { left: 14, right: 14 }
    });
  }

  // Rodapé em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(240, 203, 174);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(143, 138, 135);
    doc.text('Dex Jurídico — Relatório emitido sob estrita conformidade ética e sigilo profissional', 14, pageHeight - 7);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
  }

  const filename = `relatorio-${reportType}-${todayStr}.pdf`;
  doc.save(filename);
}

/**
 * Geração de XLSX do Relatório
 */
export async function exportReportToXLSX(params: ReportExportParams): Promise<void> {
  const { officeName, reportType, periodLabel, cases, financial, lawyers, clients } = params;
  const todayStr = getNowDateString();
  const generationTimeStr = getNowDateTimeString();

  const wb = XLSX.utils.book_new();

  // 1. Aba Resumo
  const totalReceived = financial.filter(f => f.status === 'PAGO').reduce((acc, f) => acc + f.amount, 0);
  const totalPending = financial.filter(f => f.status === 'PENDENTE' || f.status === 'ATRASADO').reduce((acc, f) => acc + f.amount, 0);
  const totalCaseValue = cases.reduce((acc, c) => acc + (c.value || 0), 0);

  const summaryData = [
    ['DEX JURÍDICO — RELATÓRIO EXECUTIVO'],
    ['Escritório:', officeName],
    ['Período:', periodLabel],
    ['Gerado em:', generationTimeStr],
    [''],
    ['INDICADOR', 'VALOR'],
    ['Total de Processos Ativos', cases.length],
    ['Valor Total da Carteira (R$)', totalCaseValue],
    ['Honorários Recebidos (R$)', totalReceived],
    ['Honorários a Receber / Pendentes (R$)', totalPending],
    ['Total de Clientes Ativos', clients.length],
    ['Total de Advogados na Equipe', lawyers.length]
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 38 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo Executivo');

  // 2. Aba Processos
  if (reportType === 'geral' || reportType === 'processos') {
    const processHeaders = ['Número do Processo', 'Cliente', 'Área do Direito', 'Tipo de Ação', 'Status', 'Responsável', 'Data Distribuição', 'Valor da Causa (R$)'];
    const processData = [
      processHeaders,
      ...cases.map(c => {
        const client = clients.find(cl => cl.id === c.clientId);
        const lawyer = lawyers.find(l => l.id === c.lawyerId);
        return [
          c.caseNumber,
          client?.name || '-',
          c.legalArea || '-',
          c.actionType || '-',
          c.status || '-',
          lawyer?.name || '-',
          formatDateBR(c.distributionDate),
          c.value || 0
        ];
      })
    ];

    const wsCases = XLSX.utils.aoa_to_sheet(processData);
    wsCases['!cols'] = [
      { wch: 28 },
      { wch: 32 },
      { wch: 20 },
      { wch: 24 },
      { wch: 18 },
      { wch: 26 },
      { wch: 18 },
      { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(wb, wsCases, 'Processos');
  }

  // 3. Aba Financeiro
  if (reportType === 'geral' || reportType === 'financeiro') {
    const financialHeaders = ['Título', 'Tipo', 'Cliente', 'Valor (R$)', 'Data Vencimento', 'Data Pagamento', 'Status', 'Forma de Pagamento', 'Comprovante'];
    const financialData = [
      financialHeaders,
      ...financial.map(f => {
        const client = clients.find(cl => cl.id === f.clientId);
        return [
          f.title,
          f.type.replace('_', ' '),
          client?.name || '-',
          f.amount || 0,
          formatDateBR(f.dueDate),
          formatDateBR(f.paymentDate),
          f.status,
          f.paymentMethod,
          f.hasReceipt ? (f.receiptName || 'Sim') : 'Não'
        ];
      })
    ];

    const wsFinancial = XLSX.utils.aoa_to_sheet(financialData);
    wsFinancial['!cols'] = [
      { wch: 34 },
      { wch: 22 },
      { wch: 30 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 18 },
      { wch: 24 }
    ];
    XLSX.utils.book_append_sheet(wb, wsFinancial, 'Financeiro');
  }

  // 4. Aba Equipe
  if (reportType === 'geral' || reportType === 'equipe') {
    const lawyerHeaders = ['Nome do Advogado', 'E-mail', 'Telefone', 'OAB', 'Cargo / Título', 'Processos Atribuídos', 'Carteira sob Gestão (R$)'];
    const lawyerData = [
      lawyerHeaders,
      ...lawyers.map(l => {
        const lawyerCases = cases.filter(c => c.lawyerId === l.id);
        const lawyerValue = lawyerCases.reduce((acc, c) => acc + (c.value || 0), 0);
        return [
          l.name,
          l.email,
          l.phone || '-',
          l.oab || '-',
          l.roleTitle || 'Advogado',
          lawyerCases.length,
          lawyerValue
        ];
      })
    ];

    const wsLawyers = XLSX.utils.aoa_to_sheet(lawyerData);
    wsLawyers['!cols'] = [
      { wch: 28 },
      { wch: 30 },
      { wch: 18 },
      { wch: 16 },
      { wch: 26 },
      { wch: 20 },
      { wch: 24 }
    ];
    XLSX.utils.book_append_sheet(wb, wsLawyers, 'Equipe');
  }

  const filename = `relatorio-${reportType}-${todayStr}.xlsx`;
  XLSX.writeFile(wb, filename);
}
