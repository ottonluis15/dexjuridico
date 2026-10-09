import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  SUPABASE_URL: 'dex_supabase_url',
  SUPABASE_KEY: 'dex_supabase_key',
};

/**
 * Obtém as credenciais do Supabase das variáveis de ambiente (VITE_) ou do localStorage
 */
export function getSupabaseCredentials(): { url: string; key: string } {
  const metaEnv = (import.meta as any).env || {};
  const envUrl = (metaEnv.VITE_SUPABASE_URL as string) || '';
  const envKey = (metaEnv.VITE_SUPABASE_ANON_KEY as string) || '';

  const storedUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || '';
  const storedKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || '';

  return {
    url: (envUrl || storedUrl).trim(),
    key: (envKey || storedKey).trim(),
  };
}

/**
 * Salva as credenciais no localStorage (para configuração direta pela interface)
 */
export function saveSupabaseCredentials(url: string, key: string) {
  if (url.trim()) {
    localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);
  }

  if (key.trim()) {
    localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.SUPABASE_KEY);
  }
}

let supabaseInstance: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

/**
 * Retorna o cliente Supabase se estiver configurado, ou null se não estiver
 */
export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key) {
    return null;
  }

  if (supabaseInstance && url === lastUrl && key === lastKey) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastUrl = url;
    lastKey = key;
    return supabaseInstance;
  } catch (error) {
    console.warn('Erro ao inicializar cliente Supabase:', error);
    return null;
  }
}

/**
 * Verifica se as credenciais do Supabase estão ativas
 */
export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('http'));
}

/**
 * Testa a conexão real com o Supabase
 */
export async function testSupabaseConnection(url?: string, key?: string): Promise<{ success: boolean; message: string }> {
  try {
    const creds = url && key ? { url: url.trim(), key: key.trim() } : getSupabaseCredentials();
    if (!creds.url || !creds.key) {
      return { success: false, message: 'URL ou Chave Anon do Supabase não informadas.' };
    }

    const testClient = createClient(creds.url, creds.key);
    // Tenta uma consulta simples na tabela dex_users
    const { error } = await testClient.from('dex_users').select('id').limit(1);

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "dex_users" does not exist') || error.code === '42P01') {
        return {
          success: true,
          message: 'Conectado ao Supabase com sucesso! (As tabelas ainda precisam ser criadas com o script SQL).'
        };
      }
      return { success: false, message: `Erro ao conectar: ${error.message}` };
    }

    return { success: true, message: 'Conexão com o Supabase estabelecida com sucesso e tabelas verificadas!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Falha ao conectar com o Supabase.' };
  }
}
