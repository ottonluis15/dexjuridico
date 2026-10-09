import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { 
  User, 
  Client, 
  Lawyer, 
  LegalCase, 
  Deadline, 
  FinancialEntry, 
  DocumentItem, 
  TemplateDocument,
  AuditLog 
} from '../types';

export const supabaseService = {
  /**
   * Sincroniza e busca todos os usuários no Supabase
   */
  async fetchUsers(): Promise<User[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client.from('dex_users').select('*');
      if (error) {
        console.warn('Supabase fetchUsers error:', error.message);
        return null;
      }
      return (data as User[]) || [];
    } catch {
      return null;
    }
  },

  /**
   * Salva ou atualiza um usuário no Supabase
   */
  async upsertUser(user: User): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client.from('dex_users').upsert([user], { onConflict: 'id' });
      if (error) {
        console.warn('Supabase upsertUser error:', error.message);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Sincroniza em lote todos os usuários locais para o Supabase
   */
  async syncAllUsers(users: User[]): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || users.length === 0) return false;

    try {
      const { error } = await client.from('dex_users').upsert(users, { onConflict: 'id' });
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Busca clientes no Supabase
   */
  async fetchClients(): Promise<Client[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client.from('dex_clients').select('*');
      if (error) return null;
      return (data as Client[]) || [];
    } catch {
      return null;
    }
  },

  async upsertClient(clientItem: Client): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client.from('dex_clients').upsert([clientItem], { onConflict: 'id' });
      return !error;
    } catch {
      return false;
    }
  },

  async deleteClient(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client.from('dex_clients').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Busca advogados no Supabase
   */
  async fetchLawyers(): Promise<Lawyer[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client.from('dex_lawyers').select('*');
      if (error) return null;
      return (data as Lawyer[]) || [];
    } catch {
      return null;
    }
  },

  async upsertLawyer(lawyer: Lawyer): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client.from('dex_lawyers').upsert([lawyer], { onConflict: 'id' });
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Busca processos no Supabase
   */
  async fetchCases(): Promise<LegalCase[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client.from('dex_cases').select('*');
      if (error) return null;
      return (data as LegalCase[]) || [];
    } catch {
      return null;
    }
  },

  async upsertCase(caseItem: LegalCase): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client.from('dex_cases').upsert([caseItem], { onConflict: 'id' });
      return !error;
    } catch {
      return false;
    }
  },

  async deleteCase(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client.from('dex_cases').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Busca prazos no Supabase
   */
  async fetchDeadlines(): Promise<Deadline[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client.from('dex_deadlines').select('*');
      if (error) return null;
      return (data as Deadline[]) || [];
    } catch {
      return null;
    }
  },

  async upsertDeadline(deadline: Deadline): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client.from('dex_deadlines').upsert([deadline], { onConflict: 'id' });
      return !error;
    } catch {
      return false;
    }
  },

  async deleteDeadline(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client.from('dex_deadlines').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Busca lançamentos financeiros no Supabase
   */
  async fetchFinancial(): Promise<FinancialEntry[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client.from('dex_financial').select('*');
      if (error) return null;
      return (data as FinancialEntry[]) || [];
    } catch {
      return null;
    }
  },

  async upsertFinancial(entry: FinancialEntry): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client.from('dex_financial').upsert([entry], { onConflict: 'id' });
      return !error;
    } catch {
      return false;
    }
  },

  async deleteFinancial(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client.from('dex_financial').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Busca documentos e modelos no Supabase
   */
  async fetchDocuments(): Promise<DocumentItem[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client.from('dex_documents').select('*');
      if (error) return null;
      return (data as DocumentItem[]) || [];
    } catch {
      return null;
    }
  },

  async upsertDocument(doc: DocumentItem): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client.from('dex_documents').upsert([doc], { onConflict: 'id' });
      return !error;
    } catch {
      return false;
    }
  },

  async fetchTemplates(): Promise<TemplateDocument[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client.from('dex_templates').select('*');
      if (error) return null;
      return (data as TemplateDocument[]) || [];
    } catch {
      return null;
    }
  },

  async upsertTemplate(tpl: TemplateDocument): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client.from('dex_templates').upsert([tpl], { onConflict: 'id' });
      return !error;
    } catch {
      return false;
    }
  },

  async deleteTemplate(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client.from('dex_templates').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Envia todos os dados locais para a nuvem de uma só vez (migração inicial)
   */
  async pushAllLocalDataToSupabase(localData: {
    users: User[];
    clients: Client[];
    lawyers: Lawyer[];
    cases: LegalCase[];
    deadlines: Deadline[];
    financial: FinancialEntry[];
    documents: DocumentItem[];
    templates: TemplateDocument[];
  }): Promise<{ success: boolean; message: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase não está configurado.' };
    }

    try {
      if (localData.users.length > 0) {
        await client.from('dex_users').upsert(localData.users, { onConflict: 'id' });
      }
      if (localData.clients.length > 0) {
        await client.from('dex_clients').upsert(localData.clients, { onConflict: 'id' });
      }
      if (localData.lawyers.length > 0) {
        await client.from('dex_lawyers').upsert(localData.lawyers, { onConflict: 'id' });
      }
      if (localData.cases.length > 0) {
        await client.from('dex_cases').upsert(localData.cases, { onConflict: 'id' });
      }
      if (localData.deadlines.length > 0) {
        await client.from('dex_deadlines').upsert(localData.deadlines, { onConflict: 'id' });
      }
      if (localData.financial.length > 0) {
        await client.from('dex_financial').upsert(localData.financial, { onConflict: 'id' });
      }
      if (localData.documents.length > 0) {
        await client.from('dex_documents').upsert(localData.documents, { onConflict: 'id' });
      }
      if (localData.templates.length > 0) {
        await client.from('dex_templates').upsert(localData.templates, { onConflict: 'id' });
      }

      return { success: true, message: 'Todos os dados locais foram sincronizados com a nuvem com sucesso!' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Falha ao sincronizar dados com o Supabase.' };
    }
  }
};
