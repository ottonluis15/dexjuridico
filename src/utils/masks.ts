/**
 * Utilitários Forenses de Máscaras e Formatação (Dex Jurídico - Tarefa 2)
 * Desenvolvido sem dependências externas pesadas, com alta performance e tolerância a dados legados.
 */

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;

export type BrazilianState = typeof BRAZILIAN_STATES[number];

/**
 * Remove qualquer caractere que não seja dígito numérico (0-9)
 */
export function unmaskDigits(val: string | null | undefined): string {
  if (!val) return '';
  return String(val).replace(/\D/g, '');
}

/**
 * Remove qualquer caractere que não seja alfanumérico (A-Z, 0-9), convertendo para maiúsculas
 */
export function unmaskAlphanumeric(val: string | null | undefined): string {
  if (!val) return '';
  return String(val).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/**
 * Máscara de CPF: 000.000.000-00 (máx 11 dígitos)
 */
export function maskCPF(val: string | null | undefined): string {
  const digits = unmaskDigits(val).slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

/**
 * Máscara de CNPJ: 00.000.000/0000-00 (máx 14 caracteres alfanuméricos)
 * Suporta o formato tradicional numérico e o formato oficial Alfanumérico da Receita Federal (julho/2026 em diante)
 */
export function maskCNPJ(val: string | null | undefined): string {
  const clean = unmaskAlphanumeric(val).slice(0, 14);
  if (!clean) return '';
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`;
  if (clean.length <= 8) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
  if (clean.length <= 12) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`;
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12, 14)}`;
}

/**
 * Máscara Dinâmica CPF ou CNPJ (usada em Clientes)
 * Se explícito for 'PF', força CPF (11 dígitos). Se 'PJ', força CNPJ (14 caracteres).
 * Sem tipo explícito, alterna dinamicamente conforme a quantidade digitada.
 */
export function maskCPFOrCNPJ(val: string | null | undefined, explicitType?: 'PF' | 'PJ'): string {
  if (explicitType === 'PF') return maskCPF(val);
  if (explicitType === 'PJ') return maskCNPJ(val);

  const clean = unmaskAlphanumeric(val);
  // Se contiver letras, é garantidamente CNPJ Alfanumérico
  if (/[A-Z]/.test(clean)) {
    return maskCNPJ(val);
  }
  // Se tiver mais de 11 dígitos, formata como CNPJ
  const digits = unmaskDigits(val);
  if (digits.length > 11) {
    return maskCNPJ(val);
  }
  return maskCPF(val);
}

/**
 * Máscara de Telefone com DDD:
 * Fixo: (00) 0000-0000 (10 dígitos)
 * Celular: (00) 00000-0000 (11 dígitos)
 * Normaliza colagens com +55
 */
export function maskPhone(val: string | null | undefined): string {
  if (!val) return '';
  let digits = unmaskDigits(val);
  // Remove prefixo DDI +55 se houver
  if (digits.startsWith('55') && digits.length > 11) {
    digits = digits.slice(2);
  }
  digits = digits.slice(0, 11);

  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Máscara de CEP: 00000-000 (8 dígitos)
 */
export function maskCEP(val: string | null | undefined): string {
  const digits = unmaskDigits(val).slice(0, 8);
  if (!digits) return '';
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

/**
 * Máscara de OAB: número + UF maiúscula (ex: 123456/SP ou 123.456/SP)
 * Formato padrão unificado do Dex: NNNNNN/UF
 */
export function maskOAB(val: string | null | undefined): string {
  if (!val) return '';
  const clean = String(val).toUpperCase().replace(/[^0-9A-Z]/g, '');
  if (!clean) return '';

  // Separa a parte numérica do estado (letras no final)
  const match = clean.match(/^([0-9]{1,8})([A-Z]{0,2})/);
  if (!match) return clean.slice(0, 10);

  const numPart = match[1];
  const ufPart = match[2];

  if (ufPart) {
    return `${numPart}/${ufPart}`;
  }
  return numPart;
}

/**
 * Normaliza número de OAB para gravação e unicidade forense: NNNNNN/UF
 */
export function normalizeOAB(val: string | null | undefined): string {
  if (!val) return '';
  const clean = String(val).trim().toUpperCase();
  const match = clean.match(/([0-9]+)\D*([A-Z]{2})/);
  if (match) {
    return `${match[1]}/${match[2]}`;
  }
  return clean.replace(/\s+/g, '');
}

/**
 * Máscara de Processo no Padrão CNJ: 0000000-00.0000.0.00.0000 (20 dígitos)
 */
export function maskCNJ(val: string | null | undefined): string {
  const digits = unmaskDigits(val).slice(0, 20);
  if (!digits) return '';
  if (digits.length <= 7) return digits;
  if (digits.length <= 9) return `${digits.slice(0, 7)}-${digits.slice(7)}`;
  if (digits.length <= 13) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9)}`;
  if (digits.length <= 14) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13)}`;
  if (digits.length <= 16) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14)}`;
  return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14, 16)}.${digits.slice(16, 20)}`;
}

/**
 * Máscara Monetária em Reais: R$ 1.234,56 (digitação dos centavos da direita para a esquerda)
 */
export function maskCurrency(val: string | number | null | undefined): string {
  if (val === null || val === undefined || val === '') return '';
  
  let cents: number;
  if (typeof val === 'number') {
    cents = Math.round(val * 100);
  } else {
    const digits = unmaskDigits(val);
    cents = parseInt(digits || '0', 10);
  }

  const formatted = (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return formatted;
}

/**
 * Converte valor monetário formatado para centavos inteiros (ex: 'R$ 1.250,50' -> 125050)
 */
export function unmaskCurrencyToCents(val: string | null | undefined): number {
  if (!val) return 0;
  const digits = unmaskDigits(val);
  return parseInt(digits || '0', 10);
}

/**
 * Converte valor monetário para número decimal exato com 2 casas
 */
export function unmaskCurrencyToFloat(val: string | null | undefined): number {
  return unmaskCurrencyToCents(val) / 100;
}

/**
 * Máscara de Data BR: dd/mm/aaaa
 */
export function maskDate(val: string | null | undefined): string {
  const digits = unmaskDigits(val).slice(0, 8);
  if (!digits) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

/**
 * Máscara de Hora: 00:00 (00:00 a 23:59)
 */
export function maskTime(val: string | null | undefined): string {
  const digits = unmaskDigits(val).slice(0, 4);
  if (!digits) return '';
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

/**
 * Converte data ISO (AAAA-MM-DD) para formato legível brasileiro (DD/MM/AAAA)
 */
export function isoDateToBR(isoStr: string | null | undefined): string {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoStr;
}

/**
 * Converte data BR (DD/MM/AAAA) para formato ISO (AAAA-MM-DD)
 */
export function brDateToISO(brStr: string | null | undefined): string {
  if (!brStr) return '';
  const parts = brStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return brStr;
}

/**
 * Formata qualquer valor salvo no banco (com ou sem pontuação) para a exibição correta na UI
 */
export function formatDisplay(val: string | null | undefined, type: 'cpf' | 'cnpj' | 'cpf_cnpj' | 'cpf_or_cnpj' | 'phone' | 'cep' | 'oab' | 'cnj' | 'currency' | 'date'): string {
  if (!val) return '';
  switch (type) {
    case 'cpf':
      return maskCPF(val);
    case 'cnpj':
      return maskCNPJ(val);
    case 'cpf_cnpj':
    case 'cpf_or_cnpj':
      return maskCPFOrCNPJ(val);
    case 'phone':
      return maskPhone(val);
    case 'cep':
      return maskCEP(val);
    case 'oab':
      return maskOAB(val);
    case 'cnj':
      return maskCNJ(val);
    case 'currency':
      return maskCurrency(val);
    case 'date':
      return val.includes('-') ? isoDateToBR(val) : maskDate(val);
    default:
      return String(val);
  }
}
