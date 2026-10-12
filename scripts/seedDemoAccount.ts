/**
 * Script de Seed e Redefinição da Conta de Demonstração (Item 5)
 * 
 * Permite criar ou restaurar a conta de demonstração exclusiva do Dex Jurídico.
 * A conta possui a flag `isDemo: true`, está estritamente isolada em ambiente sandbox
 * ('off_demo_sandbox') e com limite de 5 requisições de IA por hora.
 * 
 * Execução:
 * npx ts-node scripts/seedDemoAccount.ts
 * ou acionado via importação.
 */

import { User, Lawyer, Client, LegalCase } from '../src/types';

export const DEMO_CONFIG = {
  EMAIL: process.env.VITE_DEMO_EMAIL || 'demo@dexjuridico.adv.br',
  PASSWORD: process.env.VITE_DEMO_PASSWORD || 'DemoDex2026!',
  SALT: 'a1b2c3d4e5f60718',
  HASH: '7ec23d5cbd8c1ff9db5abecfc8c289e6330ef637f917e6a3480bcbf812553d55',
  OFFICE_ID: 'off_demo_sandbox',
  OFFICE_NAME: 'Demonstração Comercial Dex',
  OFFICE_CODE: 'DEMO-001'
};

export const DEMO_USER: User = {
  id: 'usr_demo_apresentacao',
  name: 'Demonstração Dex',
  email: DEMO_CONFIG.EMAIL.toLowerCase(),
  role: 'ADMIN',
  isSuperAdmin: false,
  isDemo: true,
  oab: '000.000/DEMO',
  phone: '(11) 99999-0000',
  specialties: ['Direito Geral', 'Casos de Demonstração'],
  status: 'ACTIVE',
  officeId: DEMO_CONFIG.OFFICE_ID,
  officeName: DEMO_CONFIG.OFFICE_NAME,
  officeCode: DEMO_CONFIG.OFFICE_CODE,
  isIndependent: false,
  salt: DEMO_CONFIG.SALT,
  passwordHash: DEMO_CONFIG.HASH,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'
};

export const DEMO_LAWYER: Lawyer = {
  id: 'law_demo_apresentacao',
  userId: DEMO_USER.id,
  name: DEMO_USER.name,
  email: DEMO_USER.email,
  phone: DEMO_USER.phone || '',
  oab: DEMO_USER.oab || '',
  specialties: DEMO_USER.specialties || ['Direito Geral'],
  status: 'ACTIVE',
  roleTitle: 'Apresentação Comercial Dex',
  assignedCasesCount: 1,
  officeId: DEMO_CONFIG.OFFICE_ID,
  avatarUrl: DEMO_USER.avatarUrl
};

export const DEMO_CLIENT: Client = {
  id: 'cli_demo_sandbox',
  name: 'Exemplo Sandbox Demonstração Ltda',
  type: 'PJ',
  document: '00.000.000/0001-00',
  email: 'contato@exemplodemo.com.br',
  phone: '(11) 99999-0000',
  address: {
    street: 'Av. Demonstração',
    number: '100',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-000'
  },
  notes: 'Cliente fictício isolado em ambiente sandbox para apresentação do Dex.',
  createdAt: new Date().toISOString().substring(0, 10),
  status: 'ACTIVE',
  linkedLawyerId: DEMO_LAWYER.id,
  officeId: DEMO_CONFIG.OFFICE_ID
};

export const DEMO_CASE: LegalCase = {
  id: 'case_demo_sandbox',
  caseNumber: '1000000-00.2026.8.26.0100',
  court: '1ª Vara Cível do Foro Central da Capital / SP',
  clientId: DEMO_CLIENT.id,
  lawyerId: DEMO_LAWYER.id,
  legalArea: 'Cível',
  actionType: 'Ação de Demonstração Interativa',
  status: 'EM_ANDAMENTO',
  value: 50000.00,
  distributionDate: new Date().toISOString().substring(0, 10),
  description: 'Processo demonstrativo isolado em ambiente sandbox comercial.',
  notes: 'Dados puramente ilustrativos para apresentação do sistema a potenciais clientes.',
  updatedAt: new Date().toISOString().substring(0, 10),
  officeId: DEMO_CONFIG.OFFICE_ID
};

export function resetDemoAccountLocalStorage() {
  if (typeof localStorage === 'undefined') return;

  // 1. Reseta usuários garantindo a presença da conta demo
  const rawUsers = localStorage.getItem('dex_users');
  let users: User[] = rawUsers ? JSON.parse(rawUsers) : [];
  users = users.filter(u => u.id !== DEMO_USER.id && u.email !== DEMO_USER.email);
  users.push(DEMO_USER);
  localStorage.setItem('dex_users', JSON.stringify(users));

  // 2. Reseta rate limit do assistente
  localStorage.removeItem('dex_demo_ai_rate_limit');

  console.log('Conta demo redefinida com sucesso no armazenamento local.');
}
