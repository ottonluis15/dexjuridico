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
  AIAnalysisResult 
} from '../types';
import { storageService } from '../services/storageService';
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
  auditLogs: AuditLog[];
  toasts: ToastNotification[];

  // Dados filtrados por perfil de usuário
  userCases: LegalCase[];
  userDeadlines: Deadline[];
  userClients: Client[];
  userFinancial: FinancialEntry[];
  userDocuments: DocumentItem[];

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

  // Utilitários de UI e IA
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  prefillCaseFromAI: (analysis: AIAnalysisResult, rawPrompt: string) => void;
  pendingAiDraft: { analysis: AIAnalysisResult; rawPrompt: string } | null;
  clearPendingAiDraft: () => void;
  resetAllData: () => void;
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
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storageService.getAuditLogs());
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [pendingAiDraft, setPendingAiDraft] = useState<{ analysis: AIAnalysisResult; rawPrompt: string } | null>(null);

  // Mapear o advogado correspondente ao usuário logado
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

  // Filtragem de dados com base no perfil RBAC
  const userCases = useMemo(() => {
    if (isAdmin || !currentLawyer) return cases;
    return cases.filter(c => c.lawyerId === currentLawyer.id);
  }, [cases, isAdmin, currentLawyer]);

  const userDeadlines = useMemo(() => {
    if (isAdmin || !currentLawyer) return deadlines;
    // O advogado vê prazos dos seus processos ou atribuídos a ele
    const myCaseIds = new Set(cases.filter(c => c.lawyerId === currentLawyer.id).map(c => c.id));
    return deadlines.filter(d => d.lawyerId === currentLawyer.id || myCaseIds.has(d.caseId));
  }, [deadlines, cases, isAdmin, currentLawyer]);

  const userClients = useMemo(() => {
    if (isAdmin || !currentLawyer) return clients;
    const myCaseClientIds = new Set(cases.filter(c => c.lawyerId === currentLawyer.id).map(c => c.clientId));
    return clients.filter(c => c.linkedLawyerId === currentLawyer.id || myCaseClientIds.has(c.id));
  }, [clients, cases, isAdmin, currentLawyer]);

  const userFinancial = useMemo(() => {
    if (isAdmin) return financial;
    if (!currentLawyer) return [];
    // Advogado vê apenas registros vinculados aos seus processos
    const myCaseIds = new Set(cases.filter(c => c.lawyerId === currentLawyer.id).map(c => c.id));
    return financial.filter(f => (f.caseId && myCaseIds.has(f.caseId)) || f.lawyerId === currentLawyer.id);
  }, [financial, cases, isAdmin, currentLawyer]);

  const userDocuments = useMemo(() => {
    if (isAdmin || !currentLawyer) return documents;
    const myCaseIds = new Set(cases.filter(c => c.lawyerId === currentLawyer.id).map(c => c.id));
    return documents.filter(d => (d.caseId && myCaseIds.has(d.caseId)) || d.uploadedByLawyerId === currentLawyer.id);
  }, [documents, cases, isAdmin, currentLawyer]);

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
    };
    const updated = [newClient, ...clients];
    setClients(updated);
    storageService.saveClients(updated);

    storageService.addAuditLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistema',
      userRole: currentUser?.role || 'LAWYER',
      action: 'CRIACAO_CLIENTE',
      entity: `Cliente: ${newClient.name}`,
      details: `Novo cliente cadastrado com documento ${newClient.document}.`,
      ipAddress: '187.54.12.90'
    });
    setAuditLogs(storageService.getAuditLogs());
    showToast(`Cliente ${newClient.name} cadastrado com sucesso!`, 'success');
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    const updated = clients.map(c => c.id === id ? { ...c, ...updates } : c);
    setClients(updated);
    storageService.saveClients(updated);
    showToast('Dados do cliente atualizados com sucesso.', 'success');
  };

  const deleteClient = (id: string) => {
    const target = clients.find(c => c.id === id);
    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    storageService.saveClients(updated);

    if (target) {
      storageService.addAuditLog({
        userId: currentUser?.id || 'sys',
        userName: currentUser?.name || 'Sistema',
        userRole: currentUser?.role || 'LAWYER',
        action: 'EXCLUSAO_CLIENTE',
        entity: `Cliente: ${target.name}`,
        details: `Exclusão de cliente e dados cadastrais associados.`,
        ipAddress: '187.54.12.90'
      });
      setAuditLogs(storageService.getAuditLogs());
    }
    showToast('Cliente removido do sistema.', 'info');
  };

  // CRUD Advogados
  const addLawyer = (lawyerData: Omit<Lawyer, 'id'>): Lawyer => {
    const newLawyer: Lawyer = {
      ...lawyerData,
      id: `law_${Date.now()}`
    };
    const updated = [...lawyers, newLawyer];
    setLawyers(updated);
    storageService.saveLawyers(updated);
    showToast(`Advogado(a) ${newLawyer.name} cadastrado(a)!`, 'success');
    return newLawyer;
  };

  const updateLawyer = (id: string, updates: Partial<Lawyer>) => {
    const updated = lawyers.map(l => l.id === id ? { ...l, ...updates } : l);
    setLawyers(updated);
    storageService.saveLawyers(updated);
    showToast('Cadastro de advogado atualizado.', 'success');
  };

  const deleteLawyer = (id: string) => {
    const updated = lawyers.filter(l => l.id !== id);
    setLawyers(updated);
    storageService.saveLawyers(updated);
    showToast('Advogado removido da equipe.', 'info');
  };

  // CRUD Processos
  const addCase = (caseData: Omit<LegalCase, 'id' | 'updatedAt'>): LegalCase => {
    const newCase: LegalCase = {
      ...caseData,
      id: `case_${Date.now()}`,
      updatedAt: new Date().toISOString().substring(0, 10)
    };
    const updated = [newCase, ...cases];
    setCases(updated);
    storageService.saveCases(updated);

    storageService.addAuditLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistema',
      userRole: currentUser?.role || 'LAWYER',
      action: 'CRIACAO_PROCESSO',
      entity: `Processo nº ${newCase.caseNumber}`,
      details: `Distribuição de ação: ${newCase.actionType} na área ${newCase.legalArea}.`,
      ipAddress: '187.54.12.90'
    });
    setAuditLogs(storageService.getAuditLogs());
    showToast(`Processo ${newCase.caseNumber} criado com sucesso!`, 'success');
    return newCase;
  };

  const updateCase = (id: string, updates: Partial<LegalCase>) => {
    const updated = cases.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString().substring(0, 10) } : c);
    setCases(updated);
    storageService.saveCases(updated);
    showToast('Processo atualizado com sucesso.', 'success');
  };

  const deleteCase = (id: string) => {
    const target = cases.find(c => c.id === id);
    const updated = cases.filter(c => c.id !== id);
    setCases(updated);
    storageService.saveCases(updated);

    if (target) {
      storageService.addAuditLog({
        userId: currentUser?.id || 'sys',
        userName: currentUser?.name || 'Sistema',
        userRole: currentUser?.role || 'LAWYER',
        action: 'EXCLUSAO_PROCESSO',
        entity: `Processo nº ${target.caseNumber}`,
        details: `Exclusão definitiva de processo.`,
        ipAddress: '187.54.12.90'
      });
      setAuditLogs(storageService.getAuditLogs());
    }
    showToast('Processo excluído.', 'info');
  };

  // CRUD Prazos
  const addDeadline = (deadlineData: Omit<Deadline, 'id'>): Deadline => {
    const newDeadline: Deadline = {
      ...deadlineData,
      id: `ded_${Date.now()}`
    };
    const updated = [newDeadline, ...deadlines];
    setDeadlines(updated);
    storageService.saveDeadlines(updated);

    storageService.addAuditLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistema',
      userRole: currentUser?.role || 'LAWYER',
      action: 'CRIACAO_PRAZO',
      entity: `Prazo: ${newDeadline.type}`,
      details: `Vencimento fatal fixado para ${newDeadline.dueDate}.`,
      ipAddress: '187.54.12.90'
    });
    setAuditLogs(storageService.getAuditLogs());
    showToast(`Prazo para ${newDeadline.dueDate} cadastrado!`, 'success');
    return newDeadline;
  };

  const updateDeadline = (id: string, updates: Partial<Deadline>) => {
    const updated = deadlines.map(d => d.id === id ? { ...d, ...updates } : d);
    setDeadlines(updated);
    storageService.saveDeadlines(updated);
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

    storageService.addAuditLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistema',
      userRole: currentUser?.role || 'LAWYER',
      action: newStatus === 'COMPLETED' ? 'BAIXA_PRAZO' : 'REABERTURA_PRAZO',
      entity: `Prazo: ${target.type}`,
      details: `Status alterado para ${newStatus === 'COMPLETED' ? 'Concluído' : 'Pendente'}.`,
      ipAddress: '187.54.12.90'
    });
    setAuditLogs(storageService.getAuditLogs());
    showToast(newStatus === 'COMPLETED' ? 'Prazo concluído e baixado!' : 'Prazo reaberto.', 'info');
  };

  const deleteDeadline = (id: string) => {
    const updated = deadlines.filter(d => d.id !== id);
    setDeadlines(updated);
    storageService.saveDeadlines(updated);
    showToast('Prazo removido da pauta.', 'info');
  };

  // CRUD Financeiro
  const addFinancial = (entryData: Omit<FinancialEntry, 'id'>): FinancialEntry => {
    const newEntry: FinancialEntry = {
      ...entryData,
      id: `fin_${Date.now()}`
    };
    const updated = [newEntry, ...financial];
    setFinancial(updated);
    storageService.saveFinancial(updated);

    storageService.addAuditLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistema',
      userRole: currentUser?.role || 'ADMIN',
      action: 'LANCAMENTO_FINANCEIRO',
      entity: `Financeiro: ${newEntry.title}`,
      details: `Lançamento de R$ ${newEntry.amount.toFixed(2)} com vencimento em ${newEntry.dueDate}.`,
      ipAddress: '187.54.12.90'
    });
    setAuditLogs(storageService.getAuditLogs());
    showToast('Lançamento financeiro registrado.', 'success');
    return newEntry;
  };

  const updateFinancial = (id: string, updates: Partial<FinancialEntry>) => {
    const updated = financial.map(f => f.id === id ? { ...f, ...updates } : f);
    setFinancial(updated);
    storageService.saveFinancial(updated);
    showToast('Registro financeiro atualizado.', 'success');
  };

  const deleteFinancial = (id: string) => {
    const updated = financial.filter(f => f.id !== id);
    setFinancial(updated);
    storageService.saveFinancial(updated);
    showToast('Registro financeiro removido.', 'info');
  };

  // CRUD Documentos
  const addDocument = (docData: Omit<DocumentItem, 'id' | 'createdAt'>): DocumentItem => {
    const newDoc: DocumentItem = {
      ...docData,
      id: `doc_${Date.now()}`,
      createdAt: new Date().toISOString().substring(0, 10)
    };
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    storageService.saveDocuments(updated);

    storageService.addAuditLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistema',
      userRole: currentUser?.role || 'LAWYER',
      action: 'UPLOAD_DOCUMENTO',
      entity: `Documento: ${newDoc.name}`,
      details: `Upload de arquivo (${(newDoc.fileSize / 1024).toFixed(1)} KB) na categoria ${newDoc.category}.`,
      ipAddress: '187.54.12.90'
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
        ipAddress: '187.54.12.90'
      });
      setAuditLogs(storageService.getAuditLogs());
    }
    showToast('Documento excluído.', 'info');
  };

  // Integração com Dex AI
  const prefillCaseFromAI = (analysis: AIAnalysisResult, rawPrompt: string) => {
    setPendingAiDraft({ analysis, rawPrompt });
    showToast('Ficha técnica gerada pela IA vinculada para abertura de processo!', 'success');
  };

  const clearPendingAiDraft = () => {
    setPendingAiDraft(null);
  };

  // Reset total dos dados (para demonstrações)
  const resetAllData = () => {
    storageService.resetToDefaults();
    setClients(storageService.getClients());
    setLawyers(storageService.getLawyers());
    setCases(storageService.getCases());
    setDeadlines(storageService.getDeadlines());
    setFinancial(storageService.getFinancial());
    setDocuments(storageService.getDocuments());
    setAuditLogs(storageService.getAuditLogs());
    showToast('Base de dados restaurada para o padrão inicial.', 'info');
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
        auditLogs,
        toasts,
        userCases,
        userDeadlines,
        userClients,
        userFinancial,
        userDocuments,
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
        showToast,
        removeToast,
        prefillCaseFromAI,
        pendingAiDraft,
        clearPendingAiDraft,
        resetAllData
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
