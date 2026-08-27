import { 
  Client, 
  Lawyer, 
  LegalCase, 
  Deadline, 
  FinancialEntry, 
  DocumentItem, 
  AuditLog, 
  User 
} from '../types';
import { 
  INITIAL_CLIENTS, 
  INITIAL_LAWYERS, 
  INITIAL_CASES, 
  INITIAL_DEADLINES, 
  INITIAL_FINANCIAL, 
  INITIAL_DOCUMENTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_USERS 
} from '../mock/initialData';

const STORAGE_KEYS = {
  CLIENTS: 'dex_clients',
  LAWYERS: 'dex_lawyers',
  CASES: 'dex_cases',
  DEADLINES: 'dex_deadlines',
  FINANCIAL: 'dex_financial',
  DOCUMENTS: 'dex_documents',
  AUDIT_LOGS: 'dex_audit_logs',
  CURRENT_USER: 'dex_current_user',
  API_SETTINGS: 'dex_api_settings'
};

export const storageService = {
  // Inicialização com dados padrão caso o storage esteja vazio
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LAWYERS)) {
      localStorage.setItem(STORAGE_KEYS.LAWYERS, JSON.stringify(INITIAL_LAWYERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CASES)) {
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DEADLINES)) {
      localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(INITIAL_DEADLINES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FINANCIAL)) {
      localStorage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify(INITIAL_FINANCIAL));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_DOCUMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    }
  },

  // Reset para estado inicial
  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
    localStorage.setItem(STORAGE_KEYS.LAWYERS, JSON.stringify(INITIAL_LAWYERS));
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
    localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(INITIAL_DEADLINES));
    localStorage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify(INITIAL_FINANCIAL));
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_DOCUMENTS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
  },

  // Clientes
  getClients(): Client[] {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return data ? JSON.parse(data) : INITIAL_CLIENTS;
  },
  saveClients(clients: Client[]) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  },

  // Advogados
  getLawyers(): Lawyer[] {
    const data = localStorage.getItem(STORAGE_KEYS.LAWYERS);
    return data ? JSON.parse(data) : INITIAL_LAWYERS;
  },
  saveLawyers(lawyers: Lawyer[]) {
    localStorage.setItem(STORAGE_KEYS.LAWYERS, JSON.stringify(lawyers));
  },

  // Processos
  getCases(): LegalCase[] {
    const data = localStorage.getItem(STORAGE_KEYS.CASES);
    return data ? JSON.parse(data) : INITIAL_CASES;
  },
  saveCases(cases: LegalCase[]) {
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
  },

  // Prazos
  getDeadlines(): Deadline[] {
    const data = localStorage.getItem(STORAGE_KEYS.DEADLINES);
    return data ? JSON.parse(data) : INITIAL_DEADLINES;
  },
  saveDeadlines(deadlines: Deadline[]) {
    localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(deadlines));
  },

  // Financeiro
  getFinancial(): FinancialEntry[] {
    const data = localStorage.getItem(STORAGE_KEYS.FINANCIAL);
    return data ? JSON.parse(data) : INITIAL_FINANCIAL;
  },
  saveFinancial(entries: FinancialEntry[]) {
    localStorage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify(entries));
  },

  // Documentos
  getDocuments(): DocumentItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return data ? JSON.parse(data) : INITIAL_DOCUMENTS;
  },
  saveDocuments(docs: DocumentItem[]) {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  },

  // Logs de Auditoria LGPD
  getAuditLogs(): AuditLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
  },
  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const current = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    const updated = [newLog, ...current].slice(0, 100); // Manter os 100 mais recentes
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
    return newLog;
  },

  // Usuário Atual / Sessão
  getCurrentUser(): User {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : INITIAL_USERS[0];
  },
  saveCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Configurações de API Externa (opcional)
  getApiSettings() {
    const data = localStorage.getItem(STORAGE_KEYS.API_SETTINGS);
    return data ? JSON.parse(data) : { provider: 'simulated', apiKey: '', model: 'claude-3-5-sonnet' };
  },
  saveApiSettings(settings: { provider: string; apiKey: string; model: string }) {
    localStorage.setItem(STORAGE_KEYS.API_SETTINGS, JSON.stringify(settings));
  }
};
