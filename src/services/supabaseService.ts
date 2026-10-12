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
  AuditLog,
  WallPost 
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
   * Salva ou atualiza um usuário no Supabase com resiliência de schema
   */
  async upsertUser(user: User): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const payload: Record<string, any> = {
        id: user.id,
        name: user.name,
        email: user.email.trim().toLowerCase(),
        role: user.role,
        oab: user.oab || null,
        phone: user.phone || null,
        specialties: user.specialties || [],
        status: user.status || 'ACTIVE',
        officeId: user.officeId || null,
        officeName: user.officeName || null,
        officeCode: user.officeCode || null,
        isIndependent: !!user.isIndependent,
        isSuperAdmin: !!user.isSuperAdmin,
        avatarUrl: user.avatarUrl || null,
        passwordHash: user.passwordHash || null,
        salt: user.salt || null
      };

      if (user.cnpj) payload.cnpj = user.cnpj;
      if (user.address) payload.address = user.address;
      if (user.primaryArea) payload.primaryArea = user.primaryArea;

      const { error } = await client.from('dex_users').upsert([payload], { onConflict: 'id' });
      if (error) {
        // Se falhou por coluna desconhecida no PostgREST, tenta com payload estrito do schema base
        if (error.message.includes('column') || error.code === 'PGRST204' || error.code === '42703') {
          const strictPayload = {
            id: user.id,
            name: user.name,
            email: user.email.trim().toLowerCase(),
            role: user.role,
            oab: user.oab || null,
            phone: user.phone || null,
            specialties: user.specialties || [],
            status: user.status || 'ACTIVE',
            officeId: user.officeId || null,
            officeName: user.officeName || null,
            officeCode: user.officeCode || null,
            isIndependent: !!user.isIndependent,
            isSuperAdmin: !!user.isSuperAdmin,
            avatarUrl: user.avatarUrl || null,
            passwordHash: user.passwordHash || null,
            salt: user.salt || null
          };
          const retry = await client.from('dex_users').upsert([strictPayload], { onConflict: 'id' });
          return !retry.error;
        }
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
   * Busca clientes no Supabase com isolamento rigoroso por escritório ou advogado autônomo
   */
  async fetchClients(officeId?: string, lawyerId?: string): Promise<Client[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      let query = client.from('dex_clients').select('*');
      if (officeId) {
        query = query.eq('officeId', officeId);
      } else if (lawyerId) {
        query = query.eq('linkedLawyerId', lawyerId);
      } else {
        // Sem escritório nem advogado autônomo, não retorna clientes
        return [];
      }
      const { data, error } = await query;
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
   * Busca advogados no Supabase com filtro de consulta por escritório ou autônomo
   */
  async fetchLawyers(officeId?: string, userId?: string): Promise<Lawyer[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      let query = client.from('dex_lawyers').select('*');
      if (officeId) {
        query = query.eq('officeId', officeId);
      } else if (userId) {
        query = query.eq('userId', userId);
      }
      const { data, error } = await query;
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
  },

  /**
   * Busca publicações ativas do Mural da Equipe (onde deleted_at IS NULL)
   */
  async fetchTeamPosts(officeId?: string): Promise<WallPost[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      let query = client.from('dex_team_posts').select('*').is('deleted_at', null).order('created_at', { ascending: false });
      
      if (officeId) {
        query = query.or(`officeId.eq.${officeId},officeId.is.null`);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase fetchTeamPosts error:', error.message);
        return null;
      }

      // Buscar curtidas associadas para preencher likedBy
      const posts = (data as WallPost[]) || [];
      if (posts.length > 0) {
        try {
          const postIds = posts.map(p => p.id);
          const { data: likesData } = await client
            .from('dex_team_post_likes')
            .select('postId, userId')
            .in('postId', postIds);

          if (likesData && likesData.length > 0) {
            const likesByPost: Record<string, string[]> = {};
            likesData.forEach((l: any) => {
              if (!likesByPost[l.postId]) likesByPost[l.postId] = [];
              likesByPost[l.postId].push(l.userId);
            });

            posts.forEach(p => {
              p.likedBy = likesByPost[p.id] || [];
              p.likes = p.likedBy.length;
            });
          }
        } catch {
          // Se a tabela de curtidas ainda não existir, segue com as curtidas do post
        }
      }

      return posts;
    } catch {
      return null;
    }
  },

  /**
   * Salva ou atualiza uma publicação do Mural no Supabase
   */
  async upsertTeamPost(post: WallPost): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const payload: any = {
        id: post.id,
        authorId: post.authorId,
        authorName: post.authorName,
        authorRole: post.authorRole,
        authorInitial: post.authorInitial,
        createdAt: post.createdAt,
        title: post.title,
        content: post.content,
        category: post.category,
        isPinned: !!post.isPinned,
        likes: post.likes || 0,
        commentsCount: post.commentsCount || 0,
        officeId: post.officeId,
        deleted_at: post.deleted_at || null,
        deleted_by: post.deleted_by || null
      };

      const { error } = await client.from('dex_team_posts').upsert([payload], { onConflict: 'id' });
      if (error) {
        console.warn('Supabase upsertTeamPost error:', error.message);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Realiza Soft Delete da publicação garantindo que apenas o autor possa excluir
   */
  async softDeleteTeamPost(postId: string, userId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client
        .from('dex_team_posts')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: userId
        })
        .eq('id', postId)
        .eq('authorId', userId);

      if (error) {
        console.warn('Supabase softDeleteTeamPost error:', error.message);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Alterna curtida (1 curtida por perfil por publicação)
   */
  async togglePostLike(postId: string, userId: string, officeId?: string): Promise<{ liked: boolean; count: number } | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      // 1. Verifica se o usuário já curtiu
      const { data: existingLike } = await client
        .from('dex_team_post_likes')
        .select('id')
        .eq('postId', postId)
        .eq('userId', userId)
        .maybeSingle();

      let liked = false;
      if (existingLike) {
        // Remover curtida
        await client.from('dex_team_post_likes').delete().eq('id', existingLike.id);
        liked = false;
      } else {
        // Adicionar curtida (garantido por unique constraint)
        const newLikeId = `like_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await client.from('dex_team_post_likes').insert([{
          id: newLikeId,
          postId,
          userId,
          officeId
        }]);
        liked = true;
      }

      // 2. Obter contagem atualizada e salvar no post
      const { count } = await client
        .from('dex_team_post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('postId', postId);

      const finalCount = count || 0;
      await client.from('dex_team_posts').update({ likes: finalCount }).eq('id', postId);

      return { liked, count: finalCount };
    } catch {
      return null;
    }
  }
};
