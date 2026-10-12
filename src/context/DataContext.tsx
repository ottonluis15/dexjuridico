import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Client, 
  Lawyer, 
  LegalCase, 
  Deadline, 
  DeadlineStatus,
  FinancialEntry, 
  DocumentItem, 
  AuditLog, 
  AIAnalysisResult,
  TemplateDocument,
  WallPost,
  WallPostCategory 
} from '../types';
import { storageService } from '../services/storageService';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured, getSupabaseClient } from '../services/supabaseClient';
import { useAuth } from './AuthContext';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface DataContextType {
  // Dados brutos
  clients: Client[];
  lawyers: Lawyer[];
  cases: LegalCase[];
  deadlines: Deadline[];
  financial: FinancialEntry[];
  documents: DocumentItem[];
  templates: TemplateDocument[];
  teamPosts: WallPost[];
  auditLogs: AuditLog[];
  toasts: ToastNotification[];

  // Dados filtrados por perfil e escritório
  userCases: LegalCase[];
  userDeadlines: Deadline[];
  userClients: Client[];
  userFinancial: FinancialEntry[];
  userDocuments: DocumentItem[];
  userTemplates: TemplateDocument[];
  userTeamPosts: WallPost[];

  // Área de trabalho individual (pessoal do usuário logado: sócio ou advogado)
  personalCases: LegalCase[];
  personalDeadlines: Deadline[];
  personalClients: Client[];

  // Estatísticas de Dashboard
  stats: {
    activeCasesCount: number;
    upcomingDeadlinesCount: number;
    overdueDeadlinesCount: number;
    pendingFinancialAmount: number;
    paidFinancialAmount: number;
    totalDocumentsCount: number;
    criticalDeadlines: Deadline[];
  };

  // Operações de Clientes
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  exportClientsCsv: () => void;

  // Operações de Advogados
  addLawyer: (lawyer: Omit<Lawyer, 'id'>) => Lawyer;
  updateLawyer: (id: string, updates: Partial<Lawyer>) => void;
  deleteLawyer: (id: string) => void;
  removeLawyerAffiliation: (id: string) => { success: boolean; message: string };
  linkExistingLawyer: (identifier: string) => { success: boolean; lawyer?: Lawyer; error?: string };

  // Operações de Processos
  addCase: (caseItem: Omit<LegalCase, 'id' | 'updatedAt'>) => LegalCase;
  updateCase: (id: string, updates: Partial<LegalCase>) => void;
  deleteCase: (id: string) => void;

  // Operações de Prazos
  addDeadline: (deadline: Omit<Deadline, 'id'>) => Deadline;
  updateDeadline: (id: string, updates: Partial<Deadline>) => void;
  toggleDeadlineStatus: (id: string) => void;
  deleteDeadline: (id: string) => void;

  // Operações Financeiras
  addFinancial: (entry: Omit<FinancialEntry, 'id'>) => FinancialEntry;
  updateFinancial: (id: string, updates: Partial<FinancialEntry>) => void;
  deleteFinancial: (id: string) => void;

  // Operações de Documentos
  addDocument: (doc: Omit<DocumentItem, 'id' | 'createdAt'>) => DocumentItem;
  deleteDocument: (id: string) => void;

  // Operações de Modelos (Aba Modelos Jurídicos)
  addTemplate: (templateData: {
    title: string;
    category: any;
    description?: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileData: string;
  }) => TemplateDocument;
  deleteTemplate: (id: string) => boolean;

  // Operações do Mural da Equipe
  addTeamPost: (postData: {
    title: string;
    content: string;
    category: WallPostCategory;
    isPinned?: boolean;
  }) => Promise<{ success: boolean; post?: WallPost; error?: string }>;
  deleteTeamPost: (postId: string) => Promise<{ success: boolean; error?: string }>;
  toggleLikePost: (postId: string) => Promise<{ success: boolean; liked?: boolean; count?: number; error?: string }>;

  // Utilitários de UI e IA
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  prefillCaseFromAI: (analysis: AIAnalysisResult, rawPrompt: string) => void;
  pendingAiDraft: { analysis: AIAnalysisResult; rawPrompt: string } | null;
  clearPendingAiDraft: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();

  const [clients, setClients] = useState<Client[]>(() => storageService.getClients());
  const [lawyers, setLawyers] = useState<Lawyer[]>(() => storageService.getLawyersForUser(currentUser));
  const [cases, setCases] = useState<LegalCase[]>(() => storageService.getCases());
  const [deadlines, setDeadlines] = useState<Deadline[]>(() => storageService.getDeadlines());
  const [financial, setFinancial] = useState<FinancialEntry[]>(() => storageService.getFinancial());
  const [documents, setDocuments] = useState<DocumentItem[]>(() => storageService.getDocuments());
  const [templates, setTemplates] = useState<TemplateDocument[]>(() => storageService.getTemplates());
  const [teamPosts, setTeamPosts] = useState<WallPost[]>(() => storageService.getTeamPosts(currentUser?.officeId, currentUser?.isIndependent, currentUser?.id));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storageService.getAuditLogs());
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [pendingAiDraft, setPendingAiDraft] = useState<{ analysis: AIAnalysisResult; rawPrompt: string } | null>(null);

  // Recarregar dados quando o usuário muda (login/logout)
  useEffect(() => {
    setClients(storageService.getClients());
    setLawyers(storageService.getLawyersForUser(currentUser));
    setCases(storageService.getCases());
    setDeadlines(storageService.getDeadlines());
    setFinancial(storageService.getFinancial());
    setDocuments(storageService.getDocuments());
    setTemplates(storageService.getTemplates());
    setTeamPosts(storageService.getTeamPosts(currentUser?.officeId, currentUser?.isIndependent, currentUser?.id));
    setAuditLogs(storageService.getAuditLogs());

    // Se o Supabase estiver configurado, busca dados atualizados na nuvem aplicando filtro de escritório no servidor
    if (isSupabaseConfigured()) {
      Promise.all([
        supabaseService.fetchClients(
          currentUser?.officeId, 
          currentUser?.isIndependent ? (currentUser?.id) : undefined
        ),
        supabaseService.fetchLawyers(currentUser?.officeId, currentUser?.id),
        supabaseService.fetchCases(),
        supabaseService.fetchDeadlines(),
        supabaseService.fetchFinancial(),
        supabaseService.fetchDocuments(),
        supabaseService.fetchTemplates(),
        supabaseService.fetchTeamPosts(currentUser?.officeId)
      ]).then(([c, l, cs, d, f, docs, tpls, posts]) => {
        if (c && c.length > 0) { setClients(c); storageService.saveClients(c); }
        if (l && l.length > 0) { 
          // Merge seguro de advogados no storage local
          const currentAll = storageService.getLawyers();
          const remoteIds = new Set(l.map(item => item.id));
          const mergedLawyers = [...l, ...currentAll.filter(item => !remoteIds.has(item.id))];
          storageService.saveLawyers(mergedLawyers);
          setLawyers(storageService.getLawyersForUser(currentUser)); 
        }
        if (cs && cs.length > 0) { setCases(cs); storageService.saveCases(cs); }
        if (d && d.length > 0) { setDeadlines(d); storageService.saveDeadlines(d); }
        if (f && f.length > 0) { setFinancial(f); storageService.saveFinancial(f); }
        if (docs && docs.length > 0) { setDocuments(docs); storageService.saveDocuments(docs); }
        if (tpls && tpls.length > 0) { setTemplates(tpls); storageService.saveTemplates(tpls); }
        if (posts && posts.length > 0) { setTeamPosts(posts); storageService.saveTeamPosts(posts); }
      }).catch(err => {
        console.warn('Erro ao carregar dados remotos do Supabase:', err);
      });
    }
  }, [currentUser]);

  // Mapear o perfil de advogado correspondente ao usuário logado
  const currentLawyer = useMemo(() => {
    if (!currentUser) return null;
    return lawyers.find(l => l.userId === currentUser.id) || null;
  }, [currentUser, lawyers]);

  // Sincronizar contagem de processos com os advogados
  useEffect(() => {
    setLawyers(prevLawyers => 
      prevLawyers.map(law => ({
        ...law,
        assignedCasesCount: cases.filter(c => c.lawyerId === law.id && c.status !== 'ARQUIVADO').length
      }))
    );
  }, [cases]);

  // Toast Helpers
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Filtragem de dados com base no isolamento de Escritório e Perfil RBAC
  const userCases = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) {
      // Escritório vê apenas os processos pertencentes à sua banca
      return cases.filter(c => !currentUser.officeId || c.officeId === currentUser.officeId);
    }
    if (!currentLawyer) return [];
    // Advogado vê apenas os processos atribuídos a ele
    return cases.filter(c => c.lawyerId === currentLawyer.id);
  }, [cases, isAdmin, currentUser, currentLawyer]);

  const userDeadlines = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) {
      return deadlines.filter(d => !currentUser.officeId || d.officeId === currentUser.officeId);
    }
    if (!currentLawyer) return [];
    const myCaseIds = new Set(userCases.map(c => c.id));
    return deadlines.filter(d => d.lawyerId === currentLawyer.id || myCaseIds.has(d.caseId));
  }, [deadlines, userCases, isAdmin, currentUser, currentLawyer]);

  const userClients = useMemo(() => {
    return storageService.getClientsForUser(currentUser, currentLawyer, userCases);
  }, [currentUser, currentLawyer, userCases, clients]);

  const userFinancial = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) {
      return financial.filter(f => !currentUser.officeId || f.officeId === currentUser.officeId);
    }
    if (!currentLawyer) return [];
    const myCaseIds = new Set(userCases.map(c => c.id));
    return financial.filter(f => (f.caseId && myCaseIds.has(f.caseId)) || f.lawyerId === currentLawyer.id);
  }, [financial, userCases, isAdmin, currentUser, currentLawyer]);

  const userDocuments = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) {
      return documents.filter(d => !currentUser.officeId || d.officeId === currentUser.officeId);
    }
    if (!currentLawyer) return [];
    const myCaseIds = new Set(userCases.map(c => c.id));
    return documents.filter(d => (d.caseId && myCaseIds.has(d.caseId)) || d.uploadedByLawyerId === currentLawyer.id);
  }, [documents, userCases, isAdmin, currentUser, currentLawyer]);

  // Área de trabalho individual: processos estritamente atribuídos ao profissional logado
  const personalCases = useMemo(() => {
    if (!currentUser || !currentLawyer) return [];
    return cases.filter(c => c.lawyerId === currentLawyer.id);
  }, [cases, currentUser, currentLawyer]);

  // Agenda e prazos estritamente da pauta pessoal do profissional logado
  const personalDeadlines = useMemo(() => {
    if (!currentUser || !currentLawyer) return [];
    const myCaseIds = new Set(personalCases.map(c => c.id));
    return deadlines.filter(d => d.lawyerId === currentLawyer.id || myCaseIds.has(d.caseId));
  }, [deadlines, personalCases, currentUser, currentLawyer]);

  // Clientes da carteira direta sob condução do profissional logado
  const personalClients = useMemo(() => {
    if (!currentUser || !currentLawyer) return [];
    const myCaseClientIds = new Set(personalCases.map(c => c.clientId));
    return clients.filter(c => c.linkedLawyerId === currentLawyer.id || myCaseClientIds.has(c.id));
  }, [clients, personalCases, currentUser, currentLawyer]);

  // Modelos visíveis para o usuário logado
  const userTemplates = useMemo(() => {
    return storageService.getTemplatesForUser(currentUser);
  }, [templates, currentUser]);

  // Publicações do Mural visíveis para o escritório (com soft delete filtrado)
  const userTeamPosts = useMemo(() => {
    if (!currentUser) return [];
    return teamPosts.filter(p => {
      if (p.deleted_at) return false;
      if (currentUser.isIndependent) {
        return p.authorId === currentUser.id || !p.officeId;
      }
      if (currentUser.officeId) {
        return p.officeId === currentUser.officeId;
      }
      return true;
    });
  }, [teamPosts, currentUser]);

  // Estatísticas do Dashboard
  const stats = useMemo(() => {
    const activeCases = userCases.filter(c => c.status !== 'ARQUIVADO');
    const pendingDeadlines = userDeadlines.filter(d => d.status === 'PENDING');
    const overdue = userDeadlines.filter(d => d.status === 'OVERDUE');
    const critical = userDeadlines.filter(d => d.status === 'PENDING' && (d.priority === 'CRITICAL' || d.dueDate <= new Date().toISOString().substring(0, 10)));
    
    const pendingFin = userFinancial
      .filter(f => f.status === 'PENDENTE' || f.status === 'ATRASADO')
      .reduce((sum, item) => sum + item.amount, 0);

    const paidFin = userFinancial
      .filter(f => f.status === 'PAGO')
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      activeCasesCount: activeCases.length,
      upcomingDeadlinesCount: pendingDeadlines.length,
      overdueDeadlinesCount: overdue.length,
      pendingFinancialAmount: pendingFin,
      paidFinancialAmount: paidFin,
      totalDocumentsCount: userDocuments.length,
      criticalDeadlines: critical
    };
  }, [userCases, userDeadlines, userFinancial, userDocuments]);

  // CRUD Clientes com Validação Rigorosa de Escritório / Proprietário (Item 6)
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const res = storageService.addClientForUser(clientData, currentUser, currentLawyer);
    if (res.status !== 200 || !res.client) {
      showToast(res.error || 'Erro ao cadastrar cliente.', 'error');
      throw new Error(res.error || 'Acesso negado');
    }
    const newClient = res.client;
    setClients(storageService.getClients());

    if (isSupabaseConfigured()) {
      supabaseService.upsertClient(newClient).catch(console.warn);
    }

    storageService.addAuditLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistema',
      userRole: currentUser?.role || 'LAWYER',
      action: 'CADASTRO_CLIENTE',
      entity: `Cliente: ${newClient.name}`,
      details: `Novo cliente cadastrado com documento ${newClient.document}.`,
      ipAddress: '187.54.12.90',
      officeId: currentUser?.officeId
    });
    setAuditLogs(storageService.getAuditLogs());
    showToast(`Cliente "${newClient.name}" cadastrado com sucesso!`, 'success');
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    const res = storageService.updateClientForUser(id, updates, currentUser, currentLawyer, userCases);
    if (res.status !== 200 || !res.client) {
      showToast(res.error || '403 Proibido: Você não possui autorização para alterar este cliente.', 'error');
      return;
    }
    setClients(storageService.getClients());

    if (isSupabaseConfigured()) {
      supabaseService.upsertClient(res.client).catch(console.warn);
    }

    showToast('Dados do cliente atualizados com sucesso.', 'success');
  };

  const deleteClient = (id: string) => {
    const target = clients.find(c => c.id === id);
    const res = storageService.deleteClientForUser(id, currentUser, currentLawyer, userCases);
    if (!res.success) {
      showToast(res.error || '403 Proibido: Você não possui autorização para excluir este cliente.', 'error');
      return;
    }
    setClients(storageService.getClients());

    if (isSupabaseConfigured()) {
      supabaseService.deleteClient(id).catch(console.warn);
    }

    if (target) {
      storageService.addAuditLog({
        userId: currentUser?.id || 'sys',
        userName: currentUser?.name || 'Sistema',
        userRole: currentUser?.role || 'LAWYER',
        action: 'EXCLUSAO_CLIENTE',
        entity: `Cliente: ${target.name}`,
        details: `Cliente removido da carteira.`,
        ipAddress: '187.54.12.90',
        officeId: currentUser?.officeId
      });
      setAuditLogs(storageService.getAuditLogs());
    }

    showToast('Cliente removido com sucesso.', 'info');
  };

  const exportClientsCsv = () => {
    const res = storageService.exportClientsCsvForUser(currentUser, currentLawyer, userCases);
    if (res.status !== 200) {
      showToast('403 Proibido: Você não possui autorização para exportar clientes.', 'error');
      return;
    }
    if (res.count === 0) {
      showToast('Nenhum cliente disponível para exportar na sua carteira.', 'warning');
      return;
    }
    const blob = new Blob([res.csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `clientes_${currentUser?.officeName ? 'escritorio' : 'autonomo'}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${res.count} clientes exportados com sucesso!`, 'success');
  };

  // CRUD Advogados
  const addLawyer = (lawyerData: Omit<Lawyer, 'id'>): Lawyer => {
    const newLawyer: Lawyer = {
      ...lawyerData,
      id: `law_${Date.now()}`,
      officeId: currentUser?.officeId
    };
    const updated = [newLawyer, ...lawyers];
    setLawyers(updated);
    storageService.saveLawyers(updated);

    if (isSupabaseConfigured()) {
      supabaseService.upsertLawyer(newLawyer).catch(console.warn);
    }

    storageService.addAuditLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistema',
      userRole: currentUser?.role || 'ADMIN',
      action: 'CADASTRO_ADVOGADO',
      entity: `Advogado: ${newLawyer.name}`,
      details: `Novo membro incluído no corpo jurídico com OAB ${newLawyer.oab}.`,
      ipAddress: '187.54.12.90',
      officeId: currentUser?.officeId
    });
    setAuditLogs(storageService.getAuditLogs());
    showToast(`Advogado ${newLawyer.name} cadastrado!`, 'success');
    return newLawyer;
  };

  const updateLawyer = (id: string, updates: Partial<Lawyer>) => {
    const updated = lawyers.map(l => l.id === id ? { ...l, ...updates } : l);
    setLawyers(updated);
    storageService.saveLawyers(updated);

    if (isSupabaseConfigured()) {
      const l = updated.find(x => x.id === id);
      if (l) supabaseService.upsertLawyer(l).catch(console.warn);
    }

    showToast('Registro do advogado atualizado.', 'success');
  };

  const removeLawyerAffiliation = (id: string): { success: boolean; message: string } => {
    const res = storageService.removeLawyerAffiliation(id);
    if (!res.success) {
      showToast(res.message, 'error');
      return res;
    }

    const updated = storageService.getLawyersForUser(currentUser);
    setLawyers(updated);

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        client.from('dex_lawyers').update({ officeId: null, roleTitle: 'Advogado Autônomo' }).eq('id', id).then();
      }
    }

    storageService.addAuditLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistema',
      userRole: currentUser?.role || 'ADMIN',
      action: 'DESVINCULACAO_ADVOGADO',
      entity: `Advogado ID: ${id}`,
      details: res.message,
      ipAddress: '187.54.12.90',
      officeId: currentUser?.officeId
    });
    setAuditLogs(storageService.getAuditLogs());

    showToast(res.message, 'success');
    return res;
  };

  const linkExistingLawyer = (identifier: string): { success: boolean; lawyer?: Lawyer; error?: string } => {
    if (!currentUser?.officeId) {
      const err = 'Apenas escritórios ativos podem vincular advogados à equipe.';
      showToast(err, 'error');
      return { success: false, error: err };
    }

    const res = storageService.linkExistingLawyerToOffice(
      identifier,
      currentUser.officeId,
      currentUser.officeName || 'Escritório'
    );

    if (!res.success) {
      showToast(res.error || 'Erro ao vincular advogado.', 'error');
      return res;
    }

    const updated = storageService.getLawyersForUser(currentUser);
    setLawyers(updated);

    if (res.lawyer && isSupabaseConfigured()) {
      supabaseService.upsertLawyer(res.lawyer).catch(console.warn);
    }

    storageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'VINCULO_ADVOGADO_EXISTENTE',
      entity: `Advogado: ${res.lawyer?.name}`,
      details: `Advogado ${res.lawyer?.name} vinculado com sucesso à equipe do escritório.`,
      ipAddress: '187.54.12.90',
      officeId: currentUser.officeId
    });
    setAuditLogs(storageService.getAuditLogs());

    showToast(`Advogado ${res.lawyer?.name} vinculado à equipe com sucesso!`, 'success');
    return res;
  };

  const deleteLawyer = (id: string) => {
    removeLawyerAffiliation(id);
  };

  // CRUD Processos
  const addCase = (caseData: Omit<LegalCase, 'id' | 'updatedAt'>): LegalCase => {
    const newCase: LegalCase = {
      ...caseData,
      id: `case_${Date.now()}`,
      updatedAt: new Date().toISOString().substring(0, 10),
      officeId: currentUser?.officeId
    };
    const updated = [newCase, ...cases];
    setCases(updated);
    storageService.saveCases(updated);

    if (isSupabaseConfigured()) {
      supabaseService.upsertCase(newCase).catch(console.warn);
    }

    storageService.addAuditLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistema',
      userRole: currentUser?.role || 'LAWYER',
      action: 'CADASTRO_PROCESSO',
      entity: `Processo nº ${newCase.caseNumber}`,
      details: `Distribuição de ação (${newCase.actionType}) no valor de R$ ${newCase.value.toFixed(2)}.`,
      ipAddress: '187.54.12.90',
      officeId: currentUser?.officeId
    });
    setAuditLogs(storageService.getAuditLogs());
    showToast(`Processo ${newCase.caseNumber} cadastrado com sucesso!`, 'success');
    return newCase;
  };

  const updateCase = (id: string, updates: Partial<LegalCase>) => {
    const updated = cases.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString().substring(0, 10) } : c);
    setCases(updated);
    storageService.saveCases(updated);

    if (isSupabaseConfigured()) {
      const cs = updated.find(x => x.id === id);
      if (cs) supabaseService.upsertCase(cs).catch(console.warn);
    }

    showToast('Processo atualizado com sucesso.', 'success');
  };

  const deleteCase = (id: string) => {
    const target = cases.find(c => c.id === id);
    const updated = cases.filter(c => c.id !== id);
    setCases(updated);
    storageService.saveCases(updated);

    if (isSupabaseConfigured()) {
      supabaseService.deleteCase(id).catch(console.warn);
    }

    if (target) {
      storageService.addAuditLog({
        userId: currentUser?.id || 'sys',
        userName: currentUser?.name || 'Sistema',
        userRole: currentUser?.role || 'LAWYER',
        action: 'EXCLUSAO_PROCESSO',
        entity: `Processo nº ${target.caseNumber}`,
        details: `Exclusão definitiva de processo.`,
        ipAddress: '187.54.12.90',
        officeId: currentUser?.officeId
      });
      setAuditLogs(storageService.getAuditLogs());
    }
    showToast('Processo excluído.', 'info');
  };

  // CRUD Prazos
  const addDeadline = (deadlineData: Omit<Deadline, 'id'>): Deadline => {
    const newDeadline: Deadline = {
      ...deadlineData,
      id: `ded_${Date.now()}`,
      officeId: currentUser?.officeId
    };
    const updated = [newDeadline, ...deadlines];
    setDeadlines(updated);
    storageService.saveDeadlines(updated);

    if (isSupabaseConfigured()) {
      supabaseService.upsertDeadline(newDeadline).catch(console.warn);
    }

    storageService.addAuditLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistema',
      userRole: currentUser?.role || 'LAWYER',
      action: 'CRIACAO_PRAZO',
      entity: `Prazo: ${newDeadline.type}`,
      details: `Vencimento fatal fixado para ${newDeadline.dueDate}.`,
      ipAddress: '187.54.12.90',
      officeId: currentUser?.officeId
    });
    setAuditLogs(storageService.getAuditLogs());
    showToast(`Prazo para ${newDeadline.dueDate} cadastrado!`, 'success');
    return newDeadline;
  };

  const updateDeadline = (id: string, updates: Partial<Deadline>) => {
    const updated = deadlines.map(d => d.id === id ? { ...d, ...updates } : d);
    setDeadlines(updated);
    storageService.saveDeadlines(updated);

    if (isSupabaseConfigured()) {
      const d = updated.find(x => x.id === id);
      if (d) supabaseService.upsertDeadline(d).catch(console.warn);
    }

    showToast('Prazo atualizado.', 'success');
  };

  const toggleDeadlineStatus = (id: string) => {
    const target = deadlines.find(d => d.id === id);
    if (!target) return;

    const newStatus: DeadlineStatus = target.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    const completedAt = newStatus === 'COMPLETED' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined;

    const updated: Deadline[] = deadlines.map(d => d.id === id ? { ...d, status: newStatus, completedAt } : d);
    setDeadlines(updated);
    storageService.saveDeadlines(updated);

    if (isSupabaseConfigured()) {
      const d = updated.find(x => x.id === id);
      if (d) supabaseService.upsertDeadline(d).catch(console.warn);
    }

    storageService.addAuditLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistema',
      userRole: currentUser?.role || 'LAWYER',
      action: newStatus === 'COMPLETED' ? 'BAIXA_PRAZO' : 'REABERTURA_PRAZO',
      entity: `Prazo: ${target.type}`,
      details: `Status alterado para ${newStatus === 'COMPLETED' ? 'Concluído' : 'Pendente'}.`,
      ipAddress: '187.54.12.90',
      officeId: currentUser?.officeId
    });
    setAuditLogs(storageService.getAuditLogs());
    showToast(newStatus === 'COMPLETED' ? 'Prazo concluído e baixado!' : 'Prazo reaberto.', 'info');
  };

  const deleteDeadline = (id: string) => {
    const updated = deadlines.filter(d => d.id !== id);
    setDeadlines(updated);
    storageService.saveDeadlines(updated);

    if (isSupabaseConfigured()) {
      supabaseService.deleteDeadline(id).catch(console.warn);
    }

    showToast('Prazo removido da pauta.', 'info');
  };

  // CRUD Financeiro
  const addFinancial = (entryData: Omit<FinancialEntry, 'id'>): FinancialEntry => {
    const newEntry: FinancialEntry = {
      ...entryData,
      id: `fin_${Date.now()}`,
      officeId: currentUser?.officeId
    };
    const updated = [newEntry, ...financial];
    setFinancial(updated);
    storageService.saveFinancial(updated);

    if (isSupabaseConfigured()) {
      supabaseService.upsertFinancial(newEntry).catch(console.warn);
    }

    storageService.addAuditLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistema',
      userRole: currentUser?.role || 'ADMIN',
      action: 'LANCAMENTO_FINANCEIRO',
      entity: `Financeiro: ${newEntry.title}`,
      details: `Lançamento de R$ ${newEntry.amount.toFixed(2)} com vencimento em ${newEntry.dueDate}.`,
      ipAddress: '187.54.12.90',
      officeId: currentUser?.officeId
    });
    setAuditLogs(storageService.getAuditLogs());
    showToast('Lançamento financeiro registrado.', 'success');
    return newEntry;
  };

  const updateFinancial = (id: string, updates: Partial<FinancialEntry>) => {
    const updated = financial.map(f => f.id === id ? { ...f, ...updates } : f);
    setFinancial(updated);
    storageService.saveFinancial(updated);

    if (isSupabaseConfigured()) {
      const f = updated.find(x => x.id === id);
      if (f) supabaseService.upsertFinancial(f).catch(console.warn);
    }

    showToast('Registro financeiro atualizado.', 'success');
  };

  const deleteFinancial = (id: string) => {
    const updated = financial.filter(f => f.id !== id);
    setFinancial(updated);
    storageService.saveFinancial(updated);

    if (isSupabaseConfigured()) {
      supabaseService.deleteFinancial(id).catch(console.warn);
    }

    showToast('Registro financeiro removido.', 'info');
  };

  // CRUD Documentos
  const addDocument = (docData: Omit<DocumentItem, 'id' | 'createdAt'>): DocumentItem => {
    const newDoc: DocumentItem = {
      ...docData,
      id: `doc_${Date.now()}`,
      createdAt: new Date().toISOString().substring(0, 10),
      officeId: currentUser?.officeId
    };
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    storageService.saveDocuments(updated);

    if (isSupabaseConfigured()) {
      supabaseService.upsertDocument(newDoc).catch(console.warn);
    }

    storageService.addAuditLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistema',
      userRole: currentUser?.role || 'LAWYER',
      action: 'UPLOAD_DOCUMENTO',
      entity: `Documento: ${newDoc.name}`,
      details: `Upload de arquivo (${(newDoc.fileSize / 1024).toFixed(1)} KB) na categoria ${newDoc.category}.`,
      ipAddress: '187.54.12.90',
      officeId: currentUser?.officeId
    });
    setAuditLogs(storageService.getAuditLogs());
    showToast(`Documento ${newDoc.name} enviado com sucesso!`, 'success');
    return newDoc;
  };

  const deleteDocument = (id: string) => {
    const target = documents.find(d => d.id === id);
    const updated = documents.filter(d => d.id !== id);
    setDocuments(updated);
    storageService.saveDocuments(updated);

    if (target) {
      storageService.addAuditLog({
        userId: currentUser?.id || 'sys',
        userName: currentUser?.name || 'Sistema',
        userRole: currentUser?.role || 'LAWYER',
        action: 'EXCLUSAO_DOCUMENTO',
        entity: `Documento: ${target.name}`,
        details: `Exclusão permanente de arquivo.`,
        ipAddress: '187.54.12.90',
        officeId: currentUser?.officeId
      });
      setAuditLogs(storageService.getAuditLogs());
    }
    showToast('Documento excluído.', 'info');
  };

  // CRUD Modelos (Aba Modelos Jurídicos)
  const addTemplate = (templateData: {
    title: string;
    category: any;
    description?: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileData: string;
  }): TemplateDocument => {
    const newTemplate: TemplateDocument = {
      id: `tpl_${Date.now()}`,
      title: templateData.title,
      category: templateData.category,
      description: templateData.description,
      fileName: templateData.fileName,
      fileType: templateData.fileType,
      fileSize: templateData.fileSize,
      fileData: templateData.fileData,
      uploadedByUserId: currentUser?.id || 'sys',
      uploadedByName: currentUser?.name || 'Usuário',
      officeId: currentUser?.officeId,
      createdAt: new Date().toISOString().substring(0, 10)
    };

    const added = storageService.addTemplate(newTemplate);
    setTemplates(storageService.getTemplates());

    if (isSupabaseConfigured()) {
      supabaseService.upsertTemplate(newTemplate).catch(console.warn);
    }

    storageService.addAuditLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistema',
      userRole: currentUser?.role || 'LAWYER',
      action: 'UPLOAD_MODELO',
      entity: `Modelo: ${newTemplate.title}`,
      details: `Upload de modelo jurídico (${newTemplate.fileName}) na categoria ${newTemplate.category}.`,
      ipAddress: '187.54.12.90',
      officeId: currentUser?.officeId
    });
    setAuditLogs(storageService.getAuditLogs());
    showToast(`Modelo "${newTemplate.title}" adicionado com sucesso!`, 'success');
    return added;
  };

  const deleteTemplate = (id: string): boolean => {
    const target = templates.find(t => t.id === id);
    if (!target) return false;

    // Apenas quem enviou ou o administrador/escritório pode excluir
    const canDelete = isAdmin || (currentUser && target.uploadedByUserId === currentUser.id);
    if (!canDelete) {
      showToast('Você não tem permissão para excluir este modelo.', 'error');
      return false;
    }

    storageService.deleteTemplate(id);
    setTemplates(storageService.getTemplates());

    if (isSupabaseConfigured()) {
      supabaseService.deleteTemplate(id).catch(console.warn);
    }

    storageService.addAuditLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistema',
      userRole: currentUser?.role || 'LAWYER',
      action: 'EXCLUSAO_MODELO',
      entity: `Modelo: ${target.title}`,
      details: `Exclusão permanente do modelo jurídico "${target.title}".`,
      ipAddress: '187.54.12.90',
      officeId: currentUser?.officeId
    });
    setAuditLogs(storageService.getAuditLogs());
    showToast(`Modelo "${target.title}" excluído.`, 'info');
    return true;
  };

  // Operações do Mural da Equipe
  const addTeamPost = async (postData: {
    title: string;
    content: string;
    category: WallPostCategory;
    isPinned?: boolean;
  }): Promise<{ success: boolean; post?: WallPost; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    try {
      const newPost: WallPost = {
        id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        authorId: currentUser.id,
        authorName: currentUser.name || 'Advogado Dex',
        authorRole: currentUser.role === 'ADMIN' 
          ? 'Sócio / Administrador' 
          : (currentUser.isIndependent ? 'Advogado Autônomo' : 'Advogado Associado'),
        authorInitial: (currentUser.name?.[0] || 'D').toUpperCase(),
        createdAt: 'Hoje às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        title: postData.title.trim(),
        content: postData.content.trim(),
        category: postData.category,
        isPinned: !!postData.isPinned,
        likes: 0,
        likedBy: [],
        commentsCount: 0,
        officeId: currentUser.isIndependent ? undefined : currentUser.officeId,
        officeName: currentUser.isIndependent 
          ? 'Advogado autônomo' 
          : (currentUser.officeName || 'Moreira & Alcaraz Advogados Associados'),
        officeLogoUrl: currentUser.avatarUrl,
        deleted_at: null,
        deleted_by: null
      };

      // 1. Salva localmente
      storageService.addTeamPost(newPost);
      setTeamPosts(prev => [newPost, ...prev]);

      // 2. Se Supabase configurado, salva na nuvem
      if (isSupabaseConfigured()) {
        supabaseService.upsertTeamPost(newPost).catch(err => {
          console.warn('Erro ao salvar publicação no Supabase:', err);
        });
      }

      return { success: true, post: newPost };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Falha ao salvar publicação.' };
    }
  };

  const deleteTeamPost = async (postId: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Usuário não autenticado.' };

    const target = teamPosts.find(p => p.id === postId);
    if (!target) return { success: false, error: 'Publicação não encontrada.' };

    if (target.authorId !== currentUser.id) {
      return { success: false, error: 'Apenas o autor pode excluir sua publicação.' };
    }

    try {
      // 1. Soft delete local
      storageService.softDeleteTeamPost(postId, currentUser.id);
      setTeamPosts(prev => prev.filter(p => p.id !== postId));

      // 2. Soft delete no Supabase
      if (isSupabaseConfigured()) {
        await supabaseService.softDeleteTeamPost(postId, currentUser.id);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erro ao excluir publicação.' };
    }
  };

  const toggleLikePost = async (postId: string): Promise<{ success: boolean; liked?: boolean; count?: number; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Usuário não autenticado.' };

    try {
      // 1. Local toggle
      const localResult = storageService.togglePostLike(postId, currentUser.id);
      setTeamPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const likedBy = p.likedBy || [];
          const hasLiked = likedBy.includes(currentUser.id);
          const newLikedBy = hasLiked ? likedBy.filter(id => id !== currentUser.id) : [...likedBy, currentUser.id];
          return {
            ...p,
            likedBy: newLikedBy,
            likes: newLikedBy.length
          };
        }
        return p;
      }));

      // 2. Nuvem
      if (isSupabaseConfigured()) {
        supabaseService.togglePostLike(postId, currentUser.id, currentUser.officeId).catch(console.warn);
      }

      return { success: true, liked: localResult.liked, count: localResult.count };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erro ao curtir publicação.' };
    }
  };

  // Integração com Dex AI
  const prefillCaseFromAI = (analysis: AIAnalysisResult, rawPrompt: string) => {
    setPendingAiDraft({ analysis, rawPrompt });
    showToast('Ficha técnica gerada pela IA vinculada para abertura de processo!', 'success');
  };

  const clearPendingAiDraft = () => {
    setPendingAiDraft(null);
  };

  return (
    <DataContext.Provider
      value={{
        clients: userClients,
        lawyers,
        cases,
        deadlines,
        financial,
        documents,
        templates,
        teamPosts,
        auditLogs,
        toasts,
        userCases,
        userDeadlines,
        userClients,
        userFinancial,
        userDocuments,
        userTemplates,
        userTeamPosts,
        personalCases,
        personalDeadlines,
        personalClients,
        stats,
        addClient,
        updateClient,
        deleteClient,
        exportClientsCsv,
        addLawyer,
        updateLawyer,
        deleteLawyer,
        removeLawyerAffiliation,
        linkExistingLawyer,
        addCase,
        updateCase,
        deleteCase,
        addDeadline,
        updateDeadline,
        toggleDeadlineStatus,
        deleteDeadline,
        addFinancial,
        updateFinancial,
        deleteFinancial,
        addDocument,
        deleteDocument,
        addTemplate,
        deleteTemplate,
        addTeamPost,
        deleteTeamPost,
        toggleLikePost,
        showToast,
        removeToast,
        prefillCaseFromAI,
        pendingAiDraft,
        clearPendingAiDraft
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
