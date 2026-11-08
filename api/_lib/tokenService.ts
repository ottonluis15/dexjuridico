// Gerenciamento Criptográfico de Tokens de Autenticação — Dex Jurídico
// Suporte a Ambiente Serverless (Node.js runtime)
// Tokens são gerados com crypto.randomBytes(32) e armazenados APENAS como hash SHA-256

import crypto from 'crypto';

export type TokenType = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'INVITE_VERIFICATION' | 'CHANGE_EMAIL';

export interface AuthTokenRecord {
  id: string;
  userId: string;
  email: string;
  tokenHash: string;
  type: TokenType;
  expiresAt: string; // ISO String
  usedAt?: string | null;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Armazenamento em memória com limpeza automática para fallback serverless
const memoryTokens: Map<string, AuthTokenRecord> = new Map();

// Rate limiting em memória por IP/Email
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap: Map<string, RateLimitEntry> = new Map();

/**
 * Aplica rate limit básico
 */
export function checkRateLimit(key: string, maxAttempts: number = 5, windowMinutes: number = 60): { allowed: boolean; waitMinutes: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowMinutes * 60 * 1000
    });
    return { allowed: true, waitMinutes: 0 };
  }

  if (entry.count >= maxAttempts) {
    const waitMinutes = Math.ceil((entry.resetAt - now) / (60 * 1000));
    return { allowed: false, waitMinutes };
  }

  entry.count += 1;
  return { allowed: true, waitMinutes: 0 };
}

/**
 * Gera um token aleatório criptograficamente seguro e seu respectivo hash SHA-256
 */
export function generateSecureToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
}

/**
 * Gera o hash SHA-256 do token cru
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
}

/**
 * Compara dois hashes de forma segura contra ataques de timing
 */
export function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'hex');
    const bufB = Buffer.from(b, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Cria e persiste um registro de token
 */
export async function createTokenRecord(params: {
  userId: string;
  email: string;
  type: TokenType;
  expiresInHours?: number;
  metadata?: Record<string, any>;
}): Promise<{ rawToken: string; tokenRecord: AuthTokenRecord }> {
  const { rawToken, tokenHash } = generateSecureToken();
  const hours = params.expiresInHours || (params.type === 'PASSWORD_RESET' ? 1 : 24);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();

  const tokenRecord: AuthTokenRecord = {
    id: `tok_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    userId: params.userId,
    email: params.email.trim().toLowerCase(),
    tokenHash,
    type: params.type,
    expiresAt,
    usedAt: null,
    metadata: params.metadata,
    createdAt: now.toISOString()
  };

  // Se houver conexão com Supabase no backend
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      // Invalida tokens anteriores do mesmo tipo para o mesmo usuário
      await fetch(`${supabaseUrl}/rest/v1/dex_auth_tokens?userId=eq.${encodeURIComponent(params.userId)}&type=eq.${encodeURIComponent(params.type)}&usedAt=is.null`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ usedAt: new Date().toISOString() })
      });

      // Insere o novo token
      await fetch(`${supabaseUrl}/rest/v1/dex_auth_tokens`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(tokenRecord)
      });
    } catch (e) {
      console.warn('[TokenService] Erro ao sincronizar token no Supabase:', e);
    }
  }

  // Grava também no mapa em memória do servidor
  memoryTokens.set(tokenRecord.id, tokenRecord);

  return { rawToken, tokenRecord };
}

/**
 * Valida e consome um token recebido
 */
export async function verifyAndConsumeToken(params: {
  rawToken: string;
  expectedType: TokenType;
}): Promise<{ valid: boolean; tokenRecord?: AuthTokenRecord; error?: string }> {
  if (!params.rawToken || params.rawToken.length < 16) {
    return { valid: false, error: 'Token inválido ou mal formatado.' };
  }

  const incomingHash = hashToken(params.rawToken);
  const now = new Date();

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  let record: AuthTokenRecord | null = null;

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/dex_auth_tokens?tokenHash=eq.${encodeURIComponent(incomingHash)}&type=eq.${encodeURIComponent(params.expectedType)}&select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      if (res.ok) {
        const list: AuthTokenRecord[] = await res.json();
        if (list && list.length > 0) {
          record = list[0];
        }
      }
    } catch (e) {
      console.warn('[TokenService] Erro ao consultar Supabase:', e);
    }
  }

  // Fallback em memória
  if (!record) {
    for (const item of memoryTokens.values()) {
      if (item.type === params.expectedType && timingSafeCompare(item.tokenHash, incomingHash)) {
        record = item;
        break;
      }
    }
  }

  if (!record) {
    return { valid: false, error: 'Link de confirmação inválido ou não encontrado.' };
  }

  if (record.usedAt) {
    return { valid: false, error: 'Este link já foi utilizado anteriormente.' };
  }

  if (new Date(record.expiresAt) < now) {
    return { valid: false, error: 'Este link expirou. Por favor, solicite um novo envio.' };
  }

  // Marca como usado (uso único)
  const usedAt = now.toISOString();
  record.usedAt = usedAt;

  if (supabaseUrl && supabaseKey) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/dex_auth_tokens?id=eq.${encodeURIComponent(record.id)}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ usedAt })
      });
    } catch (e) {
      console.warn('[TokenService] Erro ao marcar token como usado no Supabase:', e);
    }
  }

  return { valid: true, tokenRecord: record };
}

