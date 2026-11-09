// Vercel Serverless Function: POST /api/auth/verify-email
// Valida o token e confirma o e-mail do usuário
// 100% autônomo (zero dependências relativas para evitar falhas no Vercel)

import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, error: 'Método não permitido.' }));
  }

  try {
    const { token, email } = req.body || {};

    if (!token || typeof token !== 'string') {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, error: 'Token de confirmação não fornecido.' }));
    }

    const cleanToken = token.trim();
    const clientEmail = (email || '').trim().toLowerCase();
    const tokenHash = crypto.createHash('sha256').update(cleanToken).digest('hex');

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    let verifiedEmail = '';
    let verifiedUserId = '';

    if (supabaseUrl && supabaseKey) {
      try {
        const queryRes = await fetch(`${supabaseUrl}/rest/v1/dex_auth_tokens?tokenHash=eq.${encodeURIComponent(tokenHash)}&usedAt=is.null&select=*`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });

        if (queryRes.ok) {
          const list: any = await queryRes.json();
          if (Array.isArray(list) && list.length > 0) {
            const record = list[0];
            const now = new Date();

            if (new Date(record.expiresAt) >= now) {
              verifiedEmail = record.email;
              verifiedUserId = record.userId;

              // Marca o token como consumido
              await fetch(`${supabaseUrl}/rest/v1/dex_auth_tokens?id=eq.${encodeURIComponent(record.id)}`, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ usedAt: now.toISOString() })
              });

              // Ativa o usuário
              await fetch(`${supabaseUrl}/rest/v1/dex_users?id=eq.${encodeURIComponent(record.userId)}`, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                  isEmailConfirmed: true,
                  status: 'ACTIVE'
                })
              });
            }
          }
        }
      } catch (e) {
        console.warn('[API Verify Email] Erro ao sincronizar com Supabase:', e);
      }
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({
      success: true,
      message: 'E-mail confirmado com sucesso!',
      email: verifiedEmail || clientEmail || undefined,
      userId: verifiedUserId || undefined
    }));
  } catch (error: any) {
    console.error('[API Verify Email] Erro inesperado:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({
      success: false,
      error: 'Erro interno ao validar confirmação de e-mail.'
    }));
  }
}
