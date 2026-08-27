export type UserRole = 'ADMIN' | 'LAWYER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  oab?: string;
  phone?: string;
  specialties?: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

export type ClientType = 'PF' | 'PJ';
export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'PROSPECT';

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  document: string; // CPF ou CNPJ
  email: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  createdAt: string;
  status: ClientStatus;
  linkedLawyerId?: string;
}

export interface Lawyer {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  oab: string; // Ex: 184920/SP
  specialties: string[];
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  roleTitle: string; // Sócio Fundador, Advogado Associado, etc.
  assignedCasesCount?: number;
}

export type LegalArea = 
  | 'Trabalhista'
  | 'Cível'
  | 'Tributário'
  | 'Família e Sucessões'
  | 'Penal'
  | 'Empresarial'
  | 'Previdenciário'
  | 'Consumidor'
  | 'Imobiliário';

export type CaseStatus = 
  | 'INICIAL'
  | 'INSTRUCAO'
  | 'SENTENCA'
  | 'RECURSAL'
  | 'EXECUCAO'
  | 'ACORDO'
  | 'ARQUIVADO';

export interface LegalCase {
  id: string;
  caseNumber: string; // CNJ Format: 0000000-00.0000.0.00.0000
  court: string; // Ex: 3ª Vara Cível de São Paulo / TRT-2
  clientId: string;
  lawyerId: string;
  legalArea: LegalArea;
  actionType: string; // Ex: Reclamatória Trabalhista, Ação de Cobrança
  status: CaseStatus;
  value: number; // R$
  distributionDate: string;
  description: string;
  notes?: string;
  updatedAt: string;
}

export type DeadlinePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL';
export type DeadlineStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE';
export type DeadlineType = 
  | 'Petição Inicial'
  | 'Contestação'
  | 'Réplica'
  | 'Recurso / Apelação'
  | 'Audiência de Conciliação'
  | 'Audiência de Instrução'
  | 'Manifestação'
  | 'Quesitos Periciais'
  | 'Cumprimento de Sentença'
  | 'Outros';

export interface Deadline {
  id: string;
  caseId: string;
  lawyerId: string;
  type: DeadlineType;
  description: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: DeadlinePriority;
  status: DeadlineStatus;
  completedAt?: string;
  notes?: string;
}

export type FinancialType = 'HONORARIOS_INICIAIS' | 'HONORARIOS_EXITO' | 'MENSALIDADE' | 'CUSTAS' | 'DESPESA';
export type FinancialStatus = 'PAGO' | 'PENDENTE' | 'ATRASADO' | 'CANCELADO';
export type PaymentMethod = 'PIX' | 'BOLETO' | 'TRANSFERENCIA' | 'CARTAO' | 'DINHEIRO';

export interface FinancialEntry {
  id: string;
  type: FinancialType;
  title: string;
  description?: string;
  clientId: string;
  caseId?: string;
  lawyerId?: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: FinancialStatus;
  paymentMethod: PaymentMethod;
  hasReceipt?: boolean;
  receiptName?: string;
}

export type DocumentCategory = 
  | 'PROCURACAO'
  | 'CONTRATO_HONORARIOS'
  | 'PETICAO'
  | 'SENTENCA_DECISAO'
  | 'LAUDO_PERICIAL'
  | 'COMPROVANTE'
  | 'DOCUMENTO_PESSOAL'
  | 'OUTROS';

export interface DocumentItem {
  id: string;
  name: string;
  category: DocumentCategory;
  clientId?: string;
  caseId?: string;
  uploadedByLawyerId: string;
  fileSize: number; // in bytes
  fileType: string; // application/pdf, etc.
  createdAt: string;
  isConfidential: boolean;
}

export interface AIAnalysisResult {
  factsSummary: string;
  legalFraming: string;
  clarificationQuestions: string[];
  requiredDocuments: string[];
  urgencyLevel: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  urgencyReason: string;
  suggestedActionType: string;
  suggestedLegalArea: LegalArea;
  estimatedValue?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  details: string;
  ipAddress: string;
}
