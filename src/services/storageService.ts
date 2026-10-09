import { 
  Client, 
  Lawyer, 
  LegalCase, 
  Deadline, 
  FinancialEntry, 
  DocumentItem, 
  AuditLog, 
  User,
  TemplateDocument 
} from '../types';
import { 
  INITIAL_CLIENTS, 
  INITIAL_LAWYERS, 
  INITIAL_CASES, 
  INITIAL_DEADLINES, 
  INITIAL_FINANCIAL, 
  INITIAL_DOCUMENTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_USERS,
  INITIAL_TEMPLATES 
} from '../mock/initialData';

const STORAGE_KEYS = {
  USERS: 'dex_users',
  CLIENTS: 'dex_clients',
  LAWYERS: 'dex_lawyers',
  CASES: 'dex_cases',
  DEADLINES: 'dex_deadlines',
  FINANCIAL: 'dex_financial',
  DOCUMENTS: 'dex_documents',
  TEMPLATES: 'dex_templates',
  AUDIT_LOGS: 'dex_audit_logs',
  CURRENT_USER: 'dex_current_user',
  API_SETTINGS: 'dex_api_settings'
};

export const storageService = {
  // Inicialização padrão segura
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
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
    if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
    // Sem usuário inicial forçado: se não tiver sessão, inicia null
  },

  // Reset para estado inicial limpo
  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CLIENTS);
    localStorage.removeItem(STORAGE_KEYS.LAWYERS);
    localStorage.removeItem(STORAGE_KEYS.CASES);
    localStorage.removeItem(STORAGE_KEYS.DEADLINES);
    localStorage.removeItem(STORAGE_KEYS.FINANCIAL);
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // Usuários do Sistema
  getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },
  saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },
  findUserByEmail(email: string): User | undefined {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  findOfficeByCodeOrEmail(identifier: string): User | undefined {
    const users = this.getUsers();
    const query = identifier.trim().toLowerCase();
    return users.find(u => 
      u.role === 'ADMIN' && (
        (u.officeCode && u.officeCode.toLowerCase() === query) ||
        u.email.toLowerCase() === query ||
        (u.officeName && u.officeName.toLowerCase() === query)
      )
    );
  },

  // Consulta de usuários com estrito isolamento por escritório
  getVisibleUsersForUser(currentUser: User | null): User[] {
    if (!currentUser) return [];
    const allUsers = this.getUsers();

    // Se o usuário for administrador de um escritório, vê a si mesmo e os advogados do seu escritório
    if (currentUser.role === 'ADMIN' && currentUser.officeId) {
      return allUsers.filter(u => 
        u.id === currentUser.id || u.officeId === currentUser.officeId
      );
    }

    // Se for advogado associado a um escritório, vê ele mesmo e os colegas do mesmo escritório
    if (currentUser.officeId) {
      return allUsers.filter(u => u.officeId === currentUser.officeId);
    }

    // Se for advogado autônomo, vê APENAS ele mesmo (zero vazamento de outros)
    return [currentUser];
  },

  updateUserPhoto(userId: string, photoUrl: string | undefined): boolean {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].avatarUrl = photoUrl;
      this.saveUsers(users);

      // Atualiza também no usuário logado se for o mesmo
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        current.avatarUrl = photoUrl;
        this.saveCurrentUser(current);
      }

      // Atualiza também na lista de advogados
      const lawyers = this.getLawyers();
      const lIndex = lawyers.findIndex(l => l.userId === userId);
      if (lIndex !== -1) {
        lawyers[lIndex].avatarUrl = photoUrl;
        this.saveLawyers(lawyers);
      }

      return true;
    }
    return false;
  },

  // Clientes
  getClients(): Client[] {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return data ? JSON.parse(data) : [];
  },
  saveClients(clients: Client[]) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  },

  // Advogados
  getLawyers(): Lawyer[] {
    const data = localStorage.getItem(STORAGE_KEYS.LAWYERS);
    return data ? JSON.parse(data) : [];
  },
  saveLawyers(lawyers: Lawyer[]) {
    localStorage.setItem(STORAGE_KEYS.LAWYERS, JSON.stringify(lawyers));
  },
  getLawyersForUser(currentUser: User | null): Lawyer[] {
    if (!currentUser) return [];
    const lawyers = this.getLawyers();

    if (currentUser.role === 'ADMIN' && currentUser.officeId) {
      return lawyers.filter(l => l.officeId === currentUser.officeId);
    }
    if (currentUser.officeId) {
      return lawyers.filter(l => l.officeId === currentUser.officeId);
    }
    // Advogado autônomo vê apenas a si mesmo
    return lawyers.filter(l => l.userId === currentUser.id);
  },

  // Processos
  getCases(): LegalCase[] {
    const data = localStorage.getItem(STORAGE_KEYS.CASES);
    return data ? JSON.parse(data) : [];
  },
  saveCases(cases: LegalCase[]) {
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
  },

  // Prazos
  getDeadlines(): Deadline[] {
    const data = localStorage.getItem(STORAGE_KEYS.DEADLINES);
    return data ? JSON.parse(data) : [];
  },
  saveDeadlines(deadlines: Deadline[]) {
    localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(deadlines));
  },

  // Financeiro
  getFinancial(): FinancialEntry[] {
    const data = localStorage.getItem(STORAGE_KEYS.FINANCIAL);
    return data ? JSON.parse(data) : [];
  },
  saveFinancial(entries: FinancialEntry[]) {
    localStorage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify(entries));
  },

  // Documentos
  getDocuments(): DocumentItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return data ? JSON.parse(data) : [];
  },
  saveDocuments(docs: DocumentItem[]) {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  },

  // Modelos Jurídicos (Aba Modelos)
  getTemplates(): TemplateDocument[] {
    const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return data ? JSON.parse(data) : INITIAL_TEMPLATES;
  },
  saveTemplates(templates: TemplateDocument[]) {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  },
  addTemplate(template: TemplateDocument): TemplateDocument {
    const templates = this.getTemplates();
    const updated = [template, ...templates];
    this.saveTemplates(updated);
    return template;
  },
  deleteTemplate(id: string): boolean {
    const templates = this.getTemplates();
    const updated = templates.filter(t => t.id !== id);
    this.saveTemplates(updated);
    return true;
  },
  getTemplatesForUser(currentUser: User | null): TemplateDocument[] {
    if (!currentUser) return [];
    const templates = this.getTemplates();

    if (currentUser.officeId) {
      // Escritório e advogados vinculados veem modelos do seu escritório e os modelos padrão
      return templates.filter(t => 
        !t.officeId || t.officeId === currentUser.officeId || t.uploadedByUserId === currentUser.id
      );
    }

    // Advogado autônomo vê os seus modelos e os modelos padrão do sistema
    return templates.filter(t => 
      !t.officeId || t.uploadedByUserId === currentUser.id
    );
  },

  // Logs de Auditoria LGPD
  getAuditLogs(): AuditLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return data ? JSON.parse(data) : [];
  },
  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const current = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    const updated = [newLog, ...current].slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
    return newLog;
  },

  // Usuário Atual / Sessão
  getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },
  saveCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Configurações de API Externa
  getApiSettings() {
    const data = localStorage.getItem(STORAGE_KEYS.API_SETTINGS);
    return data ? JSON.parse(data) : { provider: 'simulated', apiKey: '', model: 'claude-3-5-sonnet' };
  },
  saveApiSettings(settings: { provider: string; apiKey: string; model: string }) {
    localStorage.setItem(STORAGE_KEYS.API_SETTINGS, JSON.stringify(settings));
  }
};
