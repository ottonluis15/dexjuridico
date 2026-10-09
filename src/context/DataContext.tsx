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
  TemplateDocument 
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
  auditLogs: AuditLog[];
  toasts: ToastNotification[];

  // Dados filtrados por perfil e escritório
  userCases: LegalCase[];
  userDeadlines: Deadline[];
  userClients: Client[];
  userFinancial: FinancialEntry[];
  userDocuments: DocumentItem[];
  userTemplates: TemplateDocument[];

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

  // Operações de Advogados
  addLawyer: (lawyer: Omit<Lawyer, 'id'>) => Lawyer;
  updateLawyer: (id: string, updates: Partial<Lawyer>) => void;
  deleteLawyer: (id: string) => void;

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
  const [lawyers, setLawyers] = useState<Lawyer[]>(() => storageService.getLawyers());
  const [cases, setCases] = useState<LegalCase[]>(() => storageService.getCases());
  const [deadlines, setDeadlines] = useState<Deadline[]>(() => storageService.getDeadlines());
  const [financial, setFinancial] = useState<FinancialEntry[]>(() => storageService.getFinancial());
  const [documents, setDocuments] = useState<DocumentItem[]>(() => storageService.getDocuments());
  const [templates, setTemplates] = useState<TemplateDocument[]>(() => storageService.getTemplates());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storageService.getAuditLogs());
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [pendingAiDraft, setPendingAiDraft] = useState<{ analysis: AIAnalysisResult; rawPrompt: string } | null>(null);

  // Recarregar dados quando o usuário muda (login/logout)
  useEffect(() => {
    setClients(storageService.getClients());
    setLawyers(storageService.getLawyers());
    setCases(storageService.getCases());
    setDeadlines(storageService.getDeadlines());
    setFinancial(storageService.getFinancial());
    setDocuments(storageService.getDocuments());
    setTemplates(storageService.getTemplates());
    setAuditLogs(storageService.getAuditLogs());

    // Se o Supabase estiver configurado, busca dados atualizados na nuvem
    if (isSupabaseConfigured()) {
      Promise.all([
        supabaseService.fetchClients(),
        supabaseService.fetchLawyers(),
        supabaseService.fetchCases(),
        supabaseService.fetchDeadlines(),
        supabaseService.fetchFinancial(),
        supabaseService.fetchDocuments(),
        supabaseService.fetchTemplates()
      ]).then(([c, l, cs, d, f, docs, tpls]) => {
        if (c && c.length > 0) { setClients(c); storageService.saveClients(c); }
        if (l && l.length > 0) { setLawyers(l); storageService.saveLawyers(l); }
        if (cs && cs.length > 0) { setCases(cs); storageService.saveCases(cs); }
        if (d && d.length > 0) { setDeadlines(d); storageService.saveDeadlines(d); }
        if (f && f.length > 0) { setFinancial(f); storageService.saveFinancial(f); }
        if (docs && docs.length > 0) { setDocuments(docs); storageService.saveDocuments(docs); }
        if (tpls && tpls.length > 0) { setTemplates(tpls); storageService.saveTemplates(tpls); }
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
    if (!currentUser) return [];
    if (isAdmin) {
      return clients.filter(c => !currentUser.officeId || c.officeId === currentUser.officeId);
    }
    if (!currentLawyer) return [];
    const myCaseClientIds = new Set(userCases.map(c => c.clientId));
    return clients.filter(c => c.linkedLawyerId === currentLawyer.id || myCaseClientIds.has(c.id));
  }, [clients, userCases, isAdmin, currentUser, currentLawyer]);

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

  // Modelos visíveis para o usuário logado
  const userTemplates = useMemo(() => {
    return storageService.getTemplatesForUser(currentUser);
  }, [templates, currentUser]);

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

  // CRUD Clientes
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: `cli_${Date.now()}`,
      createdAt: new Date().toISOString().substring(0, 10),
      officeId: currentUser?.officeId
    };
    const updated = [newClient, ...clients];
    setClients(updated);
    storageService.saveClients(updated);

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
    const updated = clients.map(c => c.id === id ? { ...c, ...updates } : c);
    setClients(updated);
    storageService.saveClients(updated);

    if (isSupabaseConfigured()) {
      const c = updated.find(x => x.id === id);
      if (c) supabaseService.upsertClient(c).catch(console.warn);
    }

    showToast('Dados do cliente atualizados com sucesso.', 'success');
  };

  const deleteClient = (id: string) => {
    const target = clients.find(c => c.id === id);
    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    storageService.saveClients(updated);

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
        details: `Exclusão permanente de cadastro de cliente.`,
        ipAddress: '187.54.12.90',
        officeId: currentUser?.officeId
      });
      setAuditLogs(storageService.getAuditLogs());
    }
    showToast('Cliente removido.', 'info');
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

  const deleteLawyer = (id: string) => {
    const target = lawyers.find(l => l.id === id);
    const updated = lawyers.filter(l => l.id !== id);
    setLawyers(updated);
    storageService.saveLawyers(updated);

    if (isSupabaseConfigured()) {
      // Deletar ou inativar no Supabase se configurado
      const client = getSupabaseClient();
      if (client) client.from('dex_lawyers').delete().eq('id', id).then();
    }

    if (target) {
      storageService.addAuditLog({
        userId: currentUser?.id || 'sys',
        userName: currentUser?.name || 'Sistema',
        userRole: currentUser?.role || 'ADMIN',
        action: 'EXCLUSAO_ADVOGADO',
        entity: `Advogado: ${target.name}`,
        details: `Remoção de advogado do corpo jurídico.`,
        ipAddress: '187.54.12.90',
        officeId: currentUser?.officeId
      });
      setAuditLogs(storageService.getAuditLogs());
    }
    showToast('Advogado desvinculado.', 'info');
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
        clients,
        lawyers,
        cases,
        deadlines,
        financial,
        documents,
        templates,
        auditLogs,
        toasts,
        userCases,
        userDeadlines,
        userClients,
        userFinancial,
        userDocuments,
        userTemplates,
        stats,
        addClient,
        updateClient,
        deleteClient,
        addLawyer,
        updateLawyer,
        deleteLawyer,
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
