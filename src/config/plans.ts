// Configuração Central de Planos e Limites — Dex Gestão Jurídica Inteligente
// Permite edição fácil de preços, nomes e limites de todos os planos do sistema.

export type PlanId = 'TRIAL' | 'ESSENTIAL' | 'PROFESSIONAL' | 'OFFICE';
export type SubscriptionPeriod = 'MONTHLY' | 'YEARLY';
export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'CANCELED' | 'EXPIRED';

export interface PlanLimits {
  maxLawyers: number; // Quantidade máxima de advogados vinculados
  maxClients: number; // Quantidade máxima de clientes na carteira
  maxActiveCases: number; // Processos ativos concomitantes
  maxTemplates: number; // Modelos de documentos jurídicos
  maxAiRequestsPerMonth: number; // Requisições mensais ao assistente de IA
  canExportSpreadsheets: boolean; // Exportação .xlsx e .csv
  canAccessReports: boolean; // Relatórios executivos e auditoria
  storageMb: number; // Espaço para comprovantes e documentos
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  badge?: string;
  targetAudience: string;
  description: string;
  monthlyPrice: number; // R$ por mês no plano mensal
  yearlyPricePerMonth: number; // R$ por mês no faturamento anual (com desconto)
  limits: PlanLimits;
  features: string[];
  isPopular?: boolean;
}

export const DEX_PLANS: Record<PlanId, PlanDefinition> = {
  TRIAL: {
    id: 'TRIAL',
    name: 'Teste Gratuito',
    badge: '14 Dias Grátis',
    targetAudience: 'Novos Cadastros & Avaliação',
    description: 'Experimente a tecnologia Dex sem compromisso para conhecer a gestão forense moderna.',
    monthlyPrice: 0,
    yearlyPricePerMonth: 0,
    limits: {
      maxLawyers: 1,
      maxClients: 15,
      maxActiveCases: 20,
      maxTemplates: 5,
      maxAiRequestsPerMonth: 25,
      canExportSpreadsheets: true,
      canAccessReports: true,
      storageMb: 100
    },
    features: [
      '1 Acesso profissional (Advogado/Titular)',
      'Até 15 clientes cadastrados',
      'Até 20 processos ativos',
      '25 consultas com IA forense/mês',
      'Até 5 modelos jurídicos na nuvem',
      'Exportação de planilhas financeiras',
      'Painel de prazos e alertas urgentes'
    ]
  },

  ESSENTIAL: {
    id: 'ESSENTIAL',
    name: 'Essencial Autônomo',
    badge: 'Advogado Individual',
    targetAudience: 'Advogados Autônomos e Jovens Profissionais',
    description: 'A solução sob medida para o advogado individual que busca autonomia e produtividade com IA.',
    monthlyPrice: 99,
    yearlyPricePerMonth: 79, // ~20% economia no anual
    limits: {
      maxLawyers: 1,
      maxClients: 80,
      maxActiveCases: 120,
      maxTemplates: 30,
      maxAiRequestsPerMonth: 150,
      canExportSpreadsheets: true,
      canAccessReports: true,
      storageMb: 1024 // 1 GB
    },
    features: [
      '1 Acesso individual exclusivo',
      'Até 80 clientes na carteira',
      'Até 120 processos em andamento',
      '150 requisições de IA forense/mês',
      'Transcrição de áudio de reuniões',
      '30 modelos de peças e contratos',
      'Exportação em Excel (.xlsx) e CSV',
      'Suporte técnico via WhatsApp'
    ]
  },

  PROFESSIONAL: {
    id: 'PROFESSIONAL',
    name: 'Profissional',
    badge: 'Mais Recomendado',
    targetAudience: 'Bancas em Expansão & Pequenas Sociedades',
    description: 'Estrutura completa para bancas com até 3 advogados, compartilhamento de processos e mural.',
    monthlyPrice: 229,
    yearlyPricePerMonth: 189,
    isPopular: true,
    limits: {
      maxLawyers: 3,
      maxClients: 350,
      maxActiveCases: 500,
      maxTemplates: 150,
      maxAiRequestsPerMonth: 500,
      canExportSpreadsheets: true,
      canAccessReports: true,
      storageMb: 5120 // 5 GB
    },
    features: [
      'Até 3 advogados na equipe vinculada',
      'Até 350 clientes cadastrados',
      'Até 500 processos ativos',
      '500 requisições de IA forense/mês',
      'Mural interno e comunicação de banca',
      '150 modelos institucionais compartilhados',
      'Exportação financeira completa e relatórios',
      'Backup diário e histórico de auditoria'
    ]
  },

  OFFICE: {
    id: 'OFFICE',
    name: 'Escritório Pro',
    badge: 'Banca Corporativa',
    targetAudience: 'Escritórios Médios & Grandes Sociedades',
    description: 'Capacidade corporativa com múltiplos advogados, processos ilimitados e suporte executivo.',
    monthlyPrice: 449,
    yearlyPricePerMonth: 379,
    limits: {
      maxLawyers: 15,
      maxClients: 2500,
      maxActiveCases: 5000,
      maxTemplates: 1000,
      maxAiRequestsPerMonth: 2000,
      canExportSpreadsheets: true,
      canAccessReports: true,
      storageMb: 20480 // 20 GB
    },
    features: [
      'Até 15 advogados na equipe',
      'Até 2.500 clientes na carteira',
      'Processos em escala (até 5.000 ativos)',
      '2.000 requisições de IA forense/mês',
      'Mural corporativo com curtidas e comunicados',
      'Armazenamento corporativo de comprovantes',
      'Módulo de auditoria forense completo (LGPD)',
      'Suporte prioritário e onboarding dedicado'
    ]
  }
};

/**
 * Retorna o plano padrão para novos cadastros (Escritório começa em período de teste de 14 dias ou no plano selecionado)
 */
export function getDefaultPlanForNewUser(role: 'ADMIN' | 'LAWYER', isIndependent?: boolean): PlanId {
  if (role === 'LAWYER' && isIndependent) {
    return 'ESSENTIAL';
  }
  return 'PROFESSIONAL';
}

/**
 * Retorna a definição do plano pelo ID
 */
export function getPlanById(planId?: string): PlanDefinition {
  if (planId && planId in DEX_PLANS) {
    return DEX_PLANS[planId as PlanId];
  }
  // Mapeamento amigável para nomes legados
  if (planId === 'Escritório Pro') return DEX_PLANS.OFFICE;
  if (planId === 'Profissional') return DEX_PLANS.PROFESSIONAL;
  if (planId === 'Essencial' || planId === 'Advogado Individual') return DEX_PLANS.ESSENTIAL;
  return DEX_PLANS.PROFESSIONAL;
}

