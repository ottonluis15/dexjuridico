/**
 * Validadores Forenses Compartilhados (Dex Jurídico - Tarefa 2)
 * Validação rigorosa tanto no cliente (feedback visual) quanto no servidor (API).
 */

import { BRAZILIAN_STATES, unmaskDigits, unmaskAlphanumeric } from './masks';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validação de CPF (Algoritmo Oficial Módulo 11)
 */
export function validateCPF(cpf: string | null | undefined): ValidationResult {
  if (!cpf) return { isValid: false, error: 'O CPF é obrigatório.' };
  const clean = unmaskDigits(cpf);

  if (clean.length !== 11) {
    return { isValid: false, error: 'O CPF deve conter exatamente 11 dígitos.' };
  }

  // Rejeita sequências repetidas conhecidas (111.111.111-11, etc.)
  if (/^(\d)\1{10}$/.test(clean)) {
    return { isValid: false, error: 'CPF inválido.' };
  }

  // 1º Dígito Verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) {
    return { isValid: false, error: 'CPF com dígito verificador inválido.' };
  }

  // 2º Dígito Verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) {
    return { isValid: false, error: 'CPF com dígito verificador inválido.' };
  }

  return { isValid: true };
}

/**
 * Validação Oficial de CNPJ (Numérico Tradicional e Alfanumérico da Receita Federal - Julho/2026)
 * Algoritmo oficial RFB:
 * - 12 primeiros caracteres alfanuméricos (0-9 ou A-Z)
 * - 2 últimos caracteres estritamente numéricos (dígitos verificadores)
 * - Letras possuem valor ASCII - 48 (A=17, B=18... Z=42)
 * - Módulo 11 com pesos clássicos
 */
export function validateCNPJ(cnpj: string | null | undefined): ValidationResult {
  if (!cnpj) return { isValid: false, error: 'O CNPJ é obrigatório.' };
  const clean = unmaskAlphanumeric(cnpj);

  if (clean.length !== 14) {
    return { isValid: false, error: 'O CNPJ deve conter exatamente 14 caracteres.' };
  }

  // Rejeita sequências repetidas
  if (/^([A-Z0-9])\1{13}$/.test(clean)) {
    return { isValid: false, error: 'CNPJ inválido.' };
  }

  // Os 2 últimos caracteres DEVEM ser numéricos
  if (!/^[0-9]{2}$/.test(clean.slice(12, 14))) {
    return { isValid: false, error: 'Os dois dígitos verificadores do CNPJ devem ser numéricos.' };
  }

  // Função auxiliar para mapear valor do caractere (ASCII - 48)
  const getCharValue = (char: string): number => {
    const code = char.charCodeAt(0);
    // Dígito 0-9: code 48-57 -> 0 a 9
    // Letra A-Z: code 65-90 -> 17 a 42
    return code - 48;
  };

  // 1º Dígito Verificador (pesos: 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2)
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum1 = 0;
  for (let i = 0; i < 12; i++) {
    sum1 += getCharValue(clean[i]) * weights1[i];
  }
  const rest1 = sum1 % 11;
  const dv1 = rest1 < 2 ? 0 : 11 - rest1;

  if (dv1 !== parseInt(clean.charAt(12), 10)) {
    return { isValid: false, error: 'CNPJ com primeiro dígito verificador inválido.' };
  }

  // 2º Dígito Verificador (pesos: 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2)
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum2 = 0;
  for (let i = 0; i < 13; i++) {
    sum2 += getCharValue(clean[i]) * weights2[i];
  }
  const rest2 = sum2 % 11;
  const dv2 = rest2 < 2 ? 0 : 11 - rest2;

  if (dv2 !== parseInt(clean.charAt(13), 10)) {
    return { isValid: false, error: 'CNPJ com segundo dígito verificador inválido.' };
  }

  return { isValid: true };
}

/**
 * Validação combinada CPF ou CNPJ
 */
export function validateCPFOrCNPJ(doc: string | null | undefined, explicitType?: 'PF' | 'PJ'): ValidationResult & { type?: 'CPF' | 'CNPJ' } {
  if (!doc) return { isValid: false, error: 'Informe o CPF ou CNPJ.' };

  const clean = unmaskAlphanumeric(doc);
  const digits = unmaskDigits(doc);

  if (explicitType === 'PF' || (!explicitType && !/[A-Z]/.test(clean) && digits.length <= 11)) {
    const res = validateCPF(doc);
    return { ...res, type: 'CPF' };
  } else {
    const res = validateCNPJ(doc);
    return { ...res, type: 'CNPJ' };
  }
}

// Lista oficial de DDDs válidos no Brasil (Anatel)
const VALID_DDDS = new Set([
  '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
  '21', '22', '24',                                     // RJ
  '27', '28',                                           // ES
  '31', '32', '33', '34', '35', '37', '38',             // MG
  '41', '42', '43', '44', '45', '46',                   // PR
  '47', '48', '49',                                     // SC
  '51', '53', '54', '55',                               // RS
  '61',                                                 // DF
  '62', '64',                                           // GO
  '63',                                                 // TO
  '65', '66',                                           // MT
  '67',                                                 // MS
  '68',                                                 // AC
  '69',                                                 // RO
  '71', '73', '74', '75', '77',                         // BA
  '79',                                                 // SE
  '81', '87',                                           // PE
  '82',                                                 // AL
  '83',                                                 // PB
  '84',                                                 // RN
  '85', '88',                                           // CE
  '86', '89',                                           // PI
  '91', '93', '94',                                     // PA
  '92', '97',                                           // AM
  '95',                                                 // RR
  '96',                                                 // AP
  '98', '99'                                            // MA
]);

/**
 * Validação de Telefone / Celular com DDD
 */
export function validatePhone(phone: string | null | undefined): ValidationResult {
  if (!phone) return { isValid: false, error: 'O telefone é obrigatório.' };
  let digits = unmaskDigits(phone);
  if (digits.startsWith('55') && digits.length > 11) {
    digits = digits.slice(2);
  }

  if (digits.length < 10 || digits.length > 11) {
    return { isValid: false, error: 'Informe o telefone completo com DDD (10 ou 11 dígitos).' };
  }

  const ddd = digits.slice(0, 2);
  if (!VALID_DDDS.has(ddd)) {
    return { isValid: false, error: `DDD (${ddd}) inválido.` };
  }

  // Celular com 11 dígitos deve iniciar com 9
  if (digits.length === 11 && digits.charAt(2) !== '9') {
    return { isValid: false, error: 'Celular com 11 dígitos deve iniciar com 9 após o DDD.' };
  }

  // Rejeita repetições
  if (/^(\d)\1{9,10}$/.test(digits)) {
    return { isValid: false, error: 'Número de telefone inválido.' };
  }

  return { isValid: true };
}

/**
 * Validação de CEP
 */
export function validateCEP(cep: string | null | undefined): ValidationResult {
  if (!cep) return { isValid: false, error: 'O CEP é obrigatório.' };
  const digits = unmaskDigits(cep);

  if (digits.length !== 8) {
    return { isValid: false, error: 'O CEP deve conter 8 dígitos (ex: 01000-000).' };
  }

  return { isValid: true };
}

/**
 * Validação de Inscrição na OAB
 * Formato esperado: NNNNNN/UF (ex: 123456/SP)
 */
export function validateOAB(oab: string | null | undefined): ValidationResult {
  if (!oab) return { isValid: false, error: 'O número de inscrição na OAB é obrigatório.' };
  const clean = oab.trim().toUpperCase();

  const match = clean.match(/^([0-9]{1,8})\/([A-Z]{2})$/);
  if (!match) {
    return { isValid: false, error: 'Formato de OAB inválido. Use número/UF (Ex: 123456/SP).' };
  }

  const uf = match[2];
  if (!BRAZILIAN_STATES.includes(uf as any)) {
    return { isValid: false, error: `UF da OAB (${uf}) não reconhecida.` };
  }

  const num = parseInt(match[1], 10);
  if (num <= 0) {
    return { isValid: false, error: 'Número da OAB deve ser maior que zero.' };
  }

  return { isValid: true };
}

/**
 * Validação de Número de Processo Padrão CNJ (Resolução CNJ nº 65/2008 - Módulo 97 base 10)
 * Formato: NNNNNNN-DD.AAAA.J.TR.OOOO (20 dígitos)
 */
export function validateCNJ(cnj: string | null | undefined, allowAlternative = true): ValidationResult & { isAlternative?: boolean } {
  if (!cnj) return { isValid: false, error: 'O número do processo é obrigatório.' };
  const digits = unmaskDigits(cnj);

  if (digits.length !== 20) {
    if (allowAlternative && digits.length >= 10) {
      // Formato alternativo ou legado aceito sem bloquear
      return { isValid: true, isAlternative: true };
    }
    return { 
      isValid: false, 
      error: 'Número do processo CNJ deve conter 20 dígitos (0000000-00.0000.0.00.0000).' 
    };
  }

  // Divisão das partes do CNJ:
  // NNNNNNN (7) - DD (2) . AAAA (4) . J (1) . TR (2) . OOOO (4)
  const n = digits.slice(0, 7);
  const dv = parseInt(digits.slice(7, 9), 10);
  const a = digits.slice(9, 13);
  const j = digits.slice(13, 14);
  const tr = digits.slice(14, 16);
  const o = digits.slice(16, 20);

  // Módulo 97 por blocos para não estourar a precisão inteira de 64 bits do JS
  // P1: NNNNNNN % 97
  const p1 = parseInt(n, 10) % 97;
  // P2: (P1 * 10^7 + AAAA * 10^3 + J * 10^2 + TR) % 97
  const p2String = `${p1}${a}${j}${tr}`;
  const p2 = parseInt(p2String, 10) % 97;
  // P3: (P2 * 10^6 + OOOO * 10^2) % 97
  const p3String = `${p2}${o}00`;
  const p3 = parseInt(p3String, 10) % 97;

  const expectedDV = 98 - (p3 % 97);

  if (dv !== expectedDV) {
    if (allowAlternative) {
      return { isValid: true, isAlternative: true };
    }
    return { isValid: false, error: `Dígito verificador do CNJ incorreto (esperado ${String(expectedDV).padStart(2, '0')}).` };
  }

  return { isValid: true };
}

/**
 * Validação de E-mail
 */
export function validateEmail(email: string | null | undefined): ValidationResult {
  if (!email) return { isValid: false, error: 'O e-mail é obrigatório.' };
  const clean = email.trim().toLowerCase();

  // Expressão regular RFC 5322 simplificada e robusta
  const regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
  if (!regex.test(clean)) {
    return { isValid: false, error: 'Informe um endereço de e-mail válido (ex: contato@escritorio.adv.br).' };
  }

  return { isValid: true };
}

/**
 * Validação de Data Real (DD/MM/AAAA ou AAAA-MM-DD)
 */
export function validateDate(dateStr: string | null | undefined): ValidationResult {
  if (!dateStr) return { isValid: false, error: 'A data é obrigatória.' };

  let day: number, month: number, year: number;

  if (dateStr.includes('-')) {
    const parts = dateStr.split('-').map(Number);
    if (parts.length !== 3) return { isValid: false, error: 'Formato de data inválido.' };
    [year, month, day] = parts;
  } else if (dateStr.includes('/')) {
    const parts = dateStr.split('/').map(Number);
    if (parts.length !== 3) return { isValid: false, error: 'Formato de data inválido.' };
    [day, month, year] = parts;
  } else {
    return { isValid: false, error: 'Data deve estar no formato DD/MM/AAAA.' };
  }

  if (year < 1900 || year > 2100) {
    return { isValid: false, error: 'Ano fora do intervalo permitido.' };
  }
  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Mês deve estar entre 1 e 12.' };
  }

  // Quantidade de dias no mês (com ano bissexto)
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return { isValid: false, error: `Dia inválido para o mês informado (máximo ${daysInMonth} dias).` };
  }

  return { isValid: true };
}

/**
 * Validação de Hora (HH:mm)
 */
export function validateTime(timeStr: string | null | undefined): ValidationResult {
  if (!timeStr) return { isValid: false, error: 'O horário é obrigatório.' };
  const parts = timeStr.split(':').map(Number);
  if (parts.length !== 2) return { isValid: false, error: 'Horário deve estar no formato HH:mm.' };

  const [hours, minutes] = parts;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return { isValid: false, error: 'Horário deve estar entre 00:00 e 23:59.' };
  }

  return { isValid: true };
}
