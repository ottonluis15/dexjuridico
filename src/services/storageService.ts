import { 
  Client, 
  Lawyer, 
  LegalCase, 
  Deadline, 
  FinancialEntry, 
  DocumentItem, 
  AuditLog, 
  User,
  TemplateDocument,
  WallPost 
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
  INITIAL_TEMPLATES,
  INITIAL_TEAM_POSTS,
  PRIMARY_OFFICE_ID 
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
  TEAM_POSTS: 'dex_team_posts',
  AUDIT_LOGS: 'dex_audit_logs',
  CURRENT_USER: 'dex_current_user',
  API_SETTINGS: 'dex_api_settings',
  DATA_VERSION: 'dex_seed_version_v3'
};

const CURRENT_SEED_VERSION = 'v3_moreira_alcaraz_6lawyers_15cases';

export const storageService = {
  // Inicialização padrão segura e auto-recuperável
  init() {
    try {
      const storedVersion = localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
      const isOutdated = storedVersion !== CURRENT_SEED_VERSION;

      const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!rawUsers || rawUsers === '[]' || rawUsers === 'null') {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      } else {
        try {
          const users: User[] = JSON.parse(rawUsers);
          let changed = false;
          // Preserva todos os usuários cadastrados e assegura que as contas padrão do seed existam
          for (const initUser of INITIAL_USERS) {
            if (!users.some(u => u.email.trim().toLowerCase() === initUser.email.trim().toLowerCase())) {
              users.push(initUser);
              changed = true;
            }
          }
          users.forEach(u => {
            if (u.id === 'usr_admin_otton' && !u.isSuperAdmin) {
              u.isSuperAdmin = true;
              changed = true;
            }
          });
          if (changed || isOutdated) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
          }
        } catch {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
        }
      }

      const rawClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (!rawClients || rawClients === '[]' || rawClients === 'null') {
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
      } else {
        try {
          const storedClients: Client[] = JSON.parse(rawClients);
          let changed = false;
          for (const initClient of INITIAL_CLIENTS) {
            if (!storedClients.some(c => c.id === initClient.id)) {
              storedClients.push(initClient);
              changed = true;
            }
          }
          if (changed) {
            localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(storedClients));
          }
        } catch {
          localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
        }
      }
      this.migrateClientsOwnerBinding();

      const rawLawyers = localStorage.getItem(STORAGE_KEYS.LAWYERS);
      if (isOutdated || !rawLawyers || rawLawyers === '[]' || rawLawyers === 'null') {
        localStorage.setItem(STORAGE_KEYS.LAWYERS, JSON.stringify(INITIAL_LAWYERS));
      }

      const rawCases = localStorage.getItem(STORAGE_KEYS.CASES);
      if (isOutdated || !rawCases || rawCases === '[]' || rawCases === 'null') {
        localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
      }

      const rawDeadlines = localStorage.getItem(STORAGE_KEYS.DEADLINES);
      if (isOutdated || !rawDeadlines || rawDeadlines === '[]' || rawDeadlines === 'null') {
        localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(INITIAL_DEADLINES));
      }

      const rawFinancial = localStorage.getItem(STORAGE_KEYS.FINANCIAL);
      if (isOutdated || !rawFinancial || rawFinancial === '[]' || rawFinancial === 'null') {
        localStorage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify(INITIAL_FINANCIAL));
      }

      const rawDocs = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (isOutdated || !rawDocs || rawDocs === '[]' || rawDocs === 'null') {
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_DOCUMENTS));
      }

      const rawTemplates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      if (isOutdated || !rawTemplates || rawTemplates === '[]' || rawTemplates === 'null') {
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
      }

      const rawTeamPosts = localStorage.getItem(STORAGE_KEYS.TEAM_POSTS);
      if (!rawTeamPosts || rawTeamPosts === '[]' || rawTeamPosts === 'null') {
        localStorage.setItem(STORAGE_KEYS.TEAM_POSTS, JSON.stringify(INITIAL_TEAM_POSTS));
      } else {
        try {
          const storedPosts: WallPost[] = JSON.parse(rawTeamPosts);
          let changed = false;
          for (const initPost of INITIAL_TEAM_POSTS) {
            if (!storedPosts.some(p => p.id === initPost.id)) {
              storedPosts.push(initPost);
              changed = true;
            }
          }
          if (changed) {
            localStorage.setItem(STORAGE_KEYS.TEAM_POSTS, JSON.stringify(storedPosts));
          }
        } catch {
          localStorage.setItem(STORAGE_KEYS.TEAM_POSTS, JSON.stringify(INITIAL_TEAM_POSTS));
        }
      }
      this.migrateTeamPostsOffice();

      const rawAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (!rawAudit) {
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      }

      // Atualiza versão do seed
      localStorage.setItem(STORAGE_KEYS.DATA_VERSION, CURRENT_SEED_VERSION);

      // Preserva sessão ativa com dados atualizados se for um dos usuários padrão
      const rawCurrent = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (rawCurrent) {
        try {
          const curr = JSON.parse(rawCurrent);
          const matched = INITIAL_USERS.find(u => u.email.toLowerCase() === curr.email?.toLowerCase());
          if (matched) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(matched));
          }
        } catch {}
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
    localStorage.setItem(STORAGE_KEYS.TEAM_POSTS, JSON.stringify(INITIAL_TEAM_POSTS));
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
  exportAllData(currentUser?: User | null): string {
    if (currentUser?.isDemo) {
      return '';
    }
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
    const found = users.find(u => (u.email || '').trim().toLowerCase() === query);
    if (found) return found;

    // Contingência direta nos usuários iniciais caso não esteja no storage
    const fallback = INITIAL_USERS.find(u => (u.email || '').trim().toLowerCase() === query);
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

  // Migração de vínculo de proprietário para clientes legados (Item 6)
  migrateClientsOwnerBinding(): { migratedCount: number } {
    const clients = this.getClients();
    const lawyers = this.getLawyers();
    let migratedCount = 0;

    const updated = clients.map(c => {
      let changed = false;
      let newOfficeId = c.officeId;
      let newLinkedLawyerId = c.linkedLawyerId;

      if (!newOfficeId && !newLinkedLawyerId) {
        newOfficeId = PRIMARY_OFFICE_ID;
        changed = true;
      } else if (!newOfficeId && newLinkedLawyerId) {
        const lawyer = lawyers.find(l => l.id === newLinkedLawyerId);
        if (lawyer && lawyer.officeId) {
          newOfficeId = lawyer.officeId;
          changed = true;
        }
      }

      if (changed) {
        migratedCount++;
        return { ...c, officeId: newOfficeId, linkedLawyerId: newLinkedLawyerId };
      }
      return c;
    });

    if (migratedCount > 0) {
      this.saveClients(updated);
    }
    return { migratedCount };
  },

  // Busca de clientes com isolamento estrito por escritório / advogado (Item 6)
  getClientsForUser(
    currentUser: User | null,
    currentLawyer?: Lawyer | null,
    userCases?: LegalCase[]
  ): Client[] {
    if (!currentUser) return [];
    const all = this.getClients();

    // Dono/sócio: vê SOMENTE clientes do seu escritório
    if (currentUser.role === 'ADMIN' && currentUser.officeId) {
      return all.filter(c => c.officeId === currentUser.officeId);
    }

    // Advogado autônomo: vê SOMENTE os clientes cadastrados por ele (vinculados a ele)
    if (currentUser.isIndependent || !currentUser.officeId) {
      const myId = currentLawyer?.id || currentUser.id;
      return all.filter(c => c.linkedLawyerId === myId || c.linkedLawyerId === currentUser.id);
    }

    // Advogado associado/vinculado:
    // Vê os clientes do seu escritório que lhe foram atribuídos
    if (currentUser.officeId) {
      const myLawyerId = currentLawyer?.id || currentUser.id;
      const myCaseClientIds = new Set((userCases || []).map(cs => cs.clientId));
      return all.filter(c => 
        c.officeId === currentUser.officeId && 
        (c.linkedLawyerId === myLawyerId || myCaseClientIds.has(c.id))
      );
    }

    return [];
  },

  // Validação de acesso a cliente individual (403/404)
  getClientById(
    id: string,
    currentUser: User | null,
    currentLawyer?: Lawyer | null,
    userCases?: LegalCase[]
  ): { client: Client | null; status: 200 | 403 | 404 } {
    const all = this.getClients();
    const client = all.find(c => c.id === id);
    if (!client) {
      return { client: null, status: 404 };
    }
    const userClients = this.getClientsForUser(currentUser, currentLawyer, userCases);
    const hasAccess = userClients.some(c => c.id === id);
    if (!hasAccess) {
      return { client: null, status: 403 };
    }
    return { client, status: 200 };
  },

  // Cadastro de cliente com vinculação automática e validação
  addClientForUser(
    clientData: Omit<Client, 'id' | 'createdAt'>,
    currentUser: User | null,
    currentLawyer?: Lawyer | null
  ): { client?: Client; error?: string; status: 200 | 403 } {
    if (!currentUser) {
      return { error: 'Usuário não autenticado', status: 403 };
    }
    const all = this.getClients();
    const newClient: Client = {
      ...clientData,
      id: `cli_${Date.now()}`,
      createdAt: new Date().toISOString().substring(0, 10),
      officeId: currentUser.isIndependent ? undefined : currentUser.officeId,
      linkedLawyerId: currentUser.isIndependent 
        ? (currentLawyer?.id || currentUser.id)
        : (clientData.linkedLawyerId || currentLawyer?.id)
    };
    this.saveClients([newClient, ...all]);
    return { client: newClient, status: 200 };
  },

  // Edição com validação estrita de permissão (403/404)
  updateClientForUser(
    id: string,
    updates: Partial<Client>,
    currentUser: User | null,
    currentLawyer?: Lawyer | null,
    userCases?: LegalCase[]
  ): { client?: Client; error?: string; status: 200 | 403 | 404 } {
    const { client, status } = this.getClientById(id, currentUser, currentLawyer, userCases);
    if (status !== 200 || !client) {
      return { error: status === 404 ? 'Cliente não encontrado' : 'Acesso negado: cliente pertence a outro escritório', status };
    }
    const all = this.getClients();
    const updatedClient: Client = {
      ...client,
      ...updates,
      officeId: client.officeId, // Não permite alterar escritório de dono
      linkedLawyerId: currentUser?.isIndependent ? client.linkedLawyerId : (updates.linkedLawyerId || client.linkedLawyerId)
    };
    const updated = all.map(c => c.id === id ? updatedClient : c);
    this.saveClients(updated);
    return { client: updatedClient, status: 200 };
  },

  // Exclusão com validação estrita (403/404)
  deleteClientForUser(
    id: string,
    currentUser: User | null,
    currentLawyer?: Lawyer | null,
    userCases?: LegalCase[]
  ): { success: boolean; error?: string; status: 200 | 403 | 404 } {
    const { client, status } = this.getClientById(id, currentUser, currentLawyer, userCases);
    if (status !== 200 || !client) {
      return { success: false, error: status === 404 ? 'Cliente não encontrado' : 'Acesso negado: cliente pertence a outro escritório', status };
    }
    if (!currentUser?.isIndependent && currentUser?.role !== 'ADMIN') {
      return { success: false, error: 'Apenas sócios administradores ou o advogado autônomo responsável podem excluir clientes', status: 403 };
    }
    const all = this.getClients();
    this.saveClients(all.filter(c => c.id !== id));
    return { success: true, status: 200 };
  },

  // Exportação CSV restrita à carteira do usuário (Item 6)
  exportClientsCsvForUser(
    currentUser: User | null,
    currentLawyer?: Lawyer | null,
    userCases?: LegalCase[]
  ): { csv: string; count: number; status: 200 | 403 } {
    if (!currentUser) {
      return { csv: '', count: 0, status: 403 };
    }
    // Conta de demonstração não pode exportar dados (Item 5)
    if (currentUser.isDemo) {
      return { csv: '', count: 0, status: 403 };
    }
    const authorizedClients = this.getClientsForUser(currentUser, currentLawyer, userCases);
    const headers = ['ID', 'Nome', 'Tipo', 'Documento', 'Email', 'Telefone', 'Cidade', 'Estado', 'Status', 'DataCadastro'];
    const rows = authorizedClients.map(c => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      c.type,
      `"${c.document}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.address.city}"`,
      `"${c.address.state}"`,
      c.status,
      c.createdAt
    ]);
    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    return { csv: csvContent, count: authorizedClients.length, status: 200 };
  },

  // Controle de cota de uso do Assistente de IA para Conta Demo (Item 5)
  checkDemoAiRateLimit(): { allowed: boolean; remaining: number; resetMinutes: number } {
    const KEY = 'dex_demo_ai_rate_limit';
    const MAX_REQUESTS_PER_HOUR = 5;
    try {
      const raw = localStorage.getItem(KEY);
      const now = Date.now();
      let data: { count: number; firstRequestTime: number } = raw 
        ? JSON.parse(raw) 
        : { count: 0, firstRequestTime: now };

      const ONE_HOUR = 60 * 60 * 1000;
      if (now - data.firstRequestTime > ONE_HOUR) {
        data = { count: 1, firstRequestTime: now };
        localStorage.setItem(KEY, JSON.stringify(data));
        return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR - 1, resetMinutes: 60 };
      }

      if (data.count >= MAX_REQUESTS_PER_HOUR) {
        const resetMinutes = Math.max(1, Math.ceil((data.firstRequestTime + ONE_HOUR - now) / (60 * 1000)));
        return { allowed: false, remaining: 0, resetMinutes };
      }

      data.count++;
      localStorage.setItem(KEY, JSON.stringify(data));
      return { 
        allowed: true, 
        remaining: MAX_REQUESTS_PER_HOUR - data.count, 
        resetMinutes: Math.max(1, Math.ceil((data.firstRequestTime + ONE_HOUR - now) / (60 * 1000))) 
      };
    } catch {
      return { allowed: true, remaining: 5, resetMinutes: 60 };
    }
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

  removeLawyerAffiliation(lawyerId: string): { success: boolean; message: string } {
    const lawyers = this.getLawyers();
    const lIdx = lawyers.findIndex(l => l.id === lawyerId);
    if (lIdx === -1) {
      return { success: false, message: 'Advogado não encontrado no sistema.' };
    }

    const lawyer = lawyers[lIdx];
    const users = this.getUsers();
    const uIdx = users.findIndex(u => u.id === lawyer.userId || (u.email && u.email.toLowerCase() === lawyer.email.toLowerCase()));

    // Protege contra desvincular o próprio sócio fundador / admin
    if (uIdx !== -1 && users[uIdx].role === 'ADMIN') {
      return { success: false, message: 'Não é permitido remover o vínculo do sócio administrador titular.' };
    }

    // Desvincula no registro de advogado (sem apagar a conta)
    lawyers[lIdx] = {
      ...lawyer,
      officeId: undefined,
      roleTitle: 'Advogado Autônomo'
    };
    this.saveLawyers(lawyers);

    // Desvincula na conta de usuário (mantém a conta ativa com perfil independente)
    if (uIdx !== -1) {
      users[uIdx] = {
        ...users[uIdx],
        officeId: undefined,
        officeName: undefined,
        officeCode: undefined,
        isIndependent: true
      };
      this.saveUsers(users);
    }

    return { 
      success: true, 
      message: `Vínculo com o advogado ${lawyer.name} removido com sucesso. A conta pessoal foi preservada como advogado autônomo.` 
    };
  },

  linkExistingLawyerToOffice(identifier: string, officeId: string, officeName: string): { success: boolean; lawyer?: Lawyer; error?: string } {
    const clean = identifier.trim().toLowerCase();
    const cleanOab = identifier.trim().toUpperCase();
    const users = this.getUsers();
    const lawyers = this.getLawyers();

    // Localiza usuário por e-mail ou OAB
    const targetUser = users.find(u => 
      (u.email || '').trim().toLowerCase() === clean ||
      (u.oab || '').trim().toUpperCase() === cleanOab
    );

    if (!targetUser) {
      return { success: false, error: 'Nenhum advogado encontrado com este e-mail ou inscrição na OAB.' };
    }

    if (targetUser.officeId === officeId) {
      return { success: false, error: `O advogado ${targetUser.name} já faz parte da equipe deste escritório.` };
    }

    if (targetUser.officeId && targetUser.officeId !== officeId) {
      return { success: false, error: `O advogado ${targetUser.name} já está vinculado ao escritório "${targetUser.officeName || 'outro escritório'}". Ele precisa desvincular-se previamente.` };
    }

    // Vincula o usuário ao escritório
    targetUser.officeId = officeId;
    targetUser.officeName = officeName;
    targetUser.isIndependent = false;
    this.saveUsers(users);

    // Atualiza ou cria o registro Lawyer
    let targetLawyer = lawyers.find(l => l.userId === targetUser.id || (l.email && l.email.toLowerCase() === targetUser.email.toLowerCase()));
    if (targetLawyer) {
      targetLawyer.officeId = officeId;
      targetLawyer.roleTitle = `Associado • ${officeName}`;
    } else {
      targetLawyer = {
        id: `law_${Date.now()}`,
        userId: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        phone: targetUser.phone || '',
        oab: targetUser.oab || '',
        specialties: targetUser.specialties || ['Direito Civil'],
        status: 'ACTIVE',
        roleTitle: `Associado • ${officeName}`,
        assignedCasesCount: 0,
        officeId: officeId,
        avatarUrl: targetUser.avatarUrl
      };
      lawyers.push(targetLawyer);
    }
    this.saveLawyers(lawyers);

    return { success: true, lawyer: targetLawyer };
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
  },

  // Publicações do Mural da Equipe com isolamento rigoroso por escritório (Item 4)
  getTeamPosts(officeId?: string, isIndependent?: boolean, userId?: string): WallPost[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEAM_POSTS);
      if (!data) return [];
      const posts: WallPost[] = JSON.parse(data);
      return posts.filter(p => {
        if (p.deleted_at) return false;
        if (isIndependent) {
          // Advogado autônomo: vê publicações próprias ou sem vínculo corporativo
          return p.authorId === userId || !p.officeId;
        }
        if (officeId) {
          // Escritório: vê apenas publicações pertencentes à sua banca
          return p.officeId === officeId;
        }
        return true;
      });
    } catch {
      return [];
    }
  },

  // Migração para derivar escritório ou status autônomo para publicações legadas (Item 4)
  migrateTeamPostsOffice(): { migratedCount: number } {
    const raw = this.getAllRawTeamPosts();
    const users = this.getUsers();
    const lawyers = this.getLawyers();
    let migratedCount = 0;

    const updated = raw.map(post => {
      let changed = false;
      let officeId = post.officeId;
      let officeName = post.officeName;

      if (!officeName) {
        const authorUser = users.find(u => u.id === post.authorId);
        if (authorUser) {
          if (authorUser.isIndependent) {
            officeName = 'Advogado autônomo';
            officeId = undefined;
          } else {
            officeName = authorUser.officeName || 'Moreira & Alcaraz Advogados Associados';
            officeId = authorUser.officeId || PRIMARY_OFFICE_ID;
          }
          changed = true;
        } else {
          const authorLawyer = lawyers.find(l => l.userId === post.authorId || l.id === post.authorId);
          if (authorLawyer) {
            if (authorLawyer.officeId) {
              officeId = authorLawyer.officeId;
              officeName = 'Moreira & Alcaraz Advogados Associados';
            } else {
              officeName = 'Advogado autônomo';
            }
            changed = true;
          } else {
            officeId = PRIMARY_OFFICE_ID;
            officeName = 'Moreira & Alcaraz Advogados Associados';
            changed = true;
          }
        }
      }

      if (changed) {
        migratedCount++;
        return { ...post, officeId, officeName };
      }
      return post;
    });

    if (migratedCount > 0) {
      this.saveTeamPosts(updated);
    }
    return { migratedCount };
  },

  getAllRawTeamPosts(): WallPost[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEAM_POSTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTeamPosts(posts: WallPost[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TEAM_POSTS, JSON.stringify(posts));
    } catch (e) {
      console.warn('Erro ao salvar publicações no localStorage:', e);
    }
  },

  addTeamPost(post: WallPost): WallPost {
    const raw = this.getAllRawTeamPosts();
    const updated = [post, ...raw];
    this.saveTeamPosts(updated);
    return post;
  },

  softDeleteTeamPost(postId: string, userId: string): boolean {
    const raw = this.getAllRawTeamPosts();
    const idx = raw.findIndex(p => p.id === postId);
    if (idx === -1) return false;
    
    // Verifica se o usuário que está apagando é o autor
    if (raw[idx].authorId && raw[idx].authorId !== userId) {
      return false;
    }

    raw[idx] = {
      ...raw[idx],
      deleted_at: new Date().toISOString(),
      deleted_by: userId
    };
    this.saveTeamPosts(raw);
    return true;
  },

  togglePostLike(postId: string, userId: string): { liked: boolean; count: number } {
    const raw = this.getAllRawTeamPosts();
    const idx = raw.findIndex(p => p.id === postId);
    if (idx === -1) return { liked: false, count: 0 };

    const post = raw[idx];
    const likedBy = post.likedBy || [];
    const hasLiked = likedBy.includes(userId);

    let updatedLikedBy: string[];
    if (hasLiked) {
      updatedLikedBy = likedBy.filter(id => id !== userId);
    } else {
      updatedLikedBy = [...likedBy, userId];
    }

    raw[idx] = {
      ...post,
      likedBy: updatedLikedBy,
      likes: updatedLikedBy.length
    };

    this.saveTeamPosts(raw);
    return {
      liked: !hasLiked,
      count: updatedLikedBy.length
    };
  }
};
