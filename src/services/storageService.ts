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
import { cryptoService } from './cryptoService';

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
  // Inicialização padrão segura e auto-recuperável
  init() {
    try {
      const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!rawUsers || rawUsers === '[]' || rawUsers === 'null') {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      }

      const rawClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (!rawClients || rawClients === '[]' || rawClients === 'null') {
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
      }

      const rawLawyers = localStorage.getItem(STORAGE_KEYS.LAWYERS);
      if (!rawLawyers || rawLawyers === '[]' || rawLawyers === 'null') {
        localStorage.setItem(STORAGE_KEYS.LAWYERS, JSON.stringify(INITIAL_LAWYERS));
      }

      const rawCases = localStorage.getItem(STORAGE_KEYS.CASES);
      if (!rawCases || rawCases === '[]' || rawCases === 'null') {
        localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
      }

      const rawDeadlines = localStorage.getItem(STORAGE_KEYS.DEADLINES);
      if (!rawDeadlines || rawDeadlines === '[]' || rawDeadlines === 'null') {
        localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(INITIAL_DEADLINES));
      }

      const rawFinancial = localStorage.getItem(STORAGE_KEYS.FINANCIAL);
      if (!rawFinancial || rawFinancial === '[]' || rawFinancial === 'null') {
        localStorage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify(INITIAL_FINANCIAL));
      }

      const rawDocs = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (!rawDocs || rawDocs === '[]' || rawDocs === 'null') {
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_DOCUMENTS));
      }

      const rawTemplates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      if (!rawTemplates || rawTemplates === '[]' || rawTemplates === 'null') {
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
      }

      const rawAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (!rawAudit) {
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      }
    } catch {
      // Ignora falhas de storage restrito
    }
  },

  // Reset para estado inicial limpo com as contas padrão
  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
    localStorage.setItem(STORAGE_KEYS.LAWYERS, JSON.stringify(INITIAL_LAWYERS));
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
    localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(INITIAL_DEADLINES));
    localStorage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify(INITIAL_FINANCIAL));
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_DOCUMENTS));
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // Usuários do Sistema
  getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    let users: User[] = [];
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          users = parsed;
        }
      } catch {
        users = [];
      }
    }

    if (users.length === 0) {
      users = [...INITIAL_USERS];
      this.saveUsers(users);
      return users;
    }

    // Auto-recuperação: se as contas padrão não estiverem no array, adiciona-as
    let updated = false;
    for (const initUser of INITIAL_USERS) {
      if (!users.some(u => u.email.toLowerCase() === initUser.email.toLowerCase())) {
        users.push(initUser);
        updated = true;
      }
    }
    if (updated) {
      this.saveUsers(users);
    }

    return users;
  },

  saveUsers(users: User[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch {
      // Falha silenciosa de cota ou storage bloqueado
    }
  },

  async resetUserPassword(email: string, newPassword: string): Promise<boolean> {
    const query = email.trim().toLowerCase();
    const users = this.getUsers();
    let index = users.findIndex(u => u.email.toLowerCase() === query);

    // Se não estiver no storage, busca nos usuários padrão
    if (index === -1) {
      const initUser = INITIAL_USERS.find(u => u.email.toLowerCase() === query);
      if (initUser) {
        users.push({ ...initUser });
        index = users.length - 1;
      }
    }

    if (index !== -1) {
      const salt = cryptoService.generateSalt();
      const passwordHash = await cryptoService.hashPassword(newPassword, salt);
      users[index].salt = salt;
      users[index].passwordHash = passwordHash;
      this.saveUsers(users);
      return true;
    }
    return false;
  },

  // Exportação e Importação de Dados entre dispositivos
  exportAllData(): string {
    const backup = {
      users: this.getUsers(),
      clients: this.getClients(),
      lawyers: this.getLawyers(),
      cases: this.getCases(),
      deadlines: this.getDeadlines(),
      financial: this.getFinancial(),
      documents: this.getDocuments(),
      templates: this.getTemplates(),
      version: '1.0',
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(backup, null, 2);
  },

  importAllData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.users)) this.saveUsers(data.users);
      if (Array.isArray(data.clients)) this.saveClients(data.clients);
      if (Array.isArray(data.lawyers)) this.saveLawyers(data.lawyers);
      if (Array.isArray(data.cases)) this.saveCases(data.cases);
      if (Array.isArray(data.deadlines)) this.saveDeadlines(data.deadlines);
      if (Array.isArray(data.financial)) this.saveFinancial(data.financial);
      if (Array.isArray(data.documents)) this.saveDocuments(data.documents);
      if (Array.isArray(data.templates)) this.saveTemplates(data.templates);
      return true;
    } catch {
      return false;
    }
  },

  findUserByEmail(email: string): User | undefined {
    const query = email.trim().toLowerCase();
    const users = this.getUsers();
    const found = users.find(u => u.email.toLowerCase() === query);
    if (found) return found;

    // Contingência direta nos usuários iniciais caso não esteja no storage
    const fallback = INITIAL_USERS.find(u => u.email.toLowerCase() === query);
    if (fallback) {
      const merged = [...users, fallback];
      this.saveUsers(merged);
      return fallback;
    }
    return undefined;
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
    if (!data) return INITIAL_CLIENTS;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  },
  saveClients(clients: Client[]) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  },

  // Advogados
  getLawyers(): Lawyer[] {
    const data = localStorage.getItem(STORAGE_KEYS.LAWYERS);
    if (!data) return INITIAL_LAWYERS;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_LAWYERS;
    } catch {
      return INITIAL_LAWYERS;
    }
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
    if (!data) return INITIAL_CASES;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CASES;
    } catch {
      return INITIAL_CASES;
    }
  },
  saveCases(cases: LegalCase[]) {
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
  },

  // Prazos
  getDeadlines(): Deadline[] {
    const data = localStorage.getItem(STORAGE_KEYS.DEADLINES);
    if (!data) return INITIAL_DEADLINES;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEADLINES;
    } catch {
      return INITIAL_DEADLINES;
    }
  },
  saveDeadlines(deadlines: Deadline[]) {
    localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(deadlines));
  },

  // Financeiro
  getFinancial(): FinancialEntry[] {
    const data = localStorage.getItem(STORAGE_KEYS.FINANCIAL);
    if (!data) return INITIAL_FINANCIAL;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FINANCIAL;
    } catch {
      return INITIAL_FINANCIAL;
    }
  },
  saveFinancial(entries: FinancialEntry[]) {
    localStorage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify(entries));
  },

  // Documentos
  getDocuments(): DocumentItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (!data) return INITIAL_DOCUMENTS;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DOCUMENTS;
    } catch {
      return INITIAL_DOCUMENTS;
    }
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
