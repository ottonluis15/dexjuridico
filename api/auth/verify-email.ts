// Vercel Serverless Function: POST /api/auth/verify-email
// Valida o token e ativa o e-mail do usuário no banco com respostas precisas de segurança (LGPD/OWASP)
// 100% autônomo (zero dependências relativas para evitar falhas no Vercel)

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ success: false, error: 'Método não permitido. Utilize POST.' }));
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.end(JSON.stringify({ success: false, error: 'JSON inválido no corpo da requisição.' }));
      }
    }

    const { token, email } = body || {};

    if (!token || typeof token !== 'string') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.end(JSON.stringify({ 
        success: false, 
        code: 'INVALID_TOKEN', 
        error: 'Token de confirmação não fornecido.' 
      }));
    }

    const cleanToken = token.trim();
    const clientEmail = (email || '').trim().toLowerCase();
    const tokenHash = crypto.createHash('sha256').update(cleanToken).digest('hex');

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Busca o token pelo hash na tabela dex_auth_tokens
        const { data: tokens, error: tokenErr } = await supabase
          .from('dex_auth_tokens')
          .select('*')
          .eq('tokenHash', tokenHash)
          .order('created_at', { ascending: false });

        if (tokenErr) {
          console.error('[API Verify Email] Erro ao consultar dex_auth_tokens:', tokenErr.message);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.end(JSON.stringify({ 
            success: false, 
            error: 'Erro no banco de dados ao verificar o token.' 
          }));
        }

        if (!tokens || tokens.length === 0) {
          console.warn('[API Verify Email] Token não encontrado no banco.');
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.end(JSON.stringify({ 
            success: false, 
            code: 'INVALID_TOKEN', 
            error: 'Link de confirmação inválido ou inexistente.' 
          }));
        }

        const tokenRecord = tokens[0];
        const now = new Date();

        // 1. Verifica se já foi consumido
        if (tokenRecord.usedAt) {
          console.warn(`[API Verify Email] Token já utilizado em: ${tokenRecord.usedAt}`);
          res.statusCode = 410;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.end(JSON.stringify({ 
            success: false, 
            code: 'ALREADY_USED', 
            error: 'Este link de confirmação já foi utilizado anteriormente. Sua conta já pode estar ativa.' 
          }));
        }

        // 2. Verifica se expirou
        if (new Date(tokenRecord.expiresAt) < now) {
          console.warn(`[API Verify Email] Token expirado em: ${tokenRecord.expiresAt}`);
          res.statusCode = 410;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.end(JSON.stringify({ 
            success: false, 
            code: 'EXPIRED_TOKEN', 
            error: 'Este link de confirmação expirou (validade de 24 horas). Por favor, solicite um novo link.' 
          }));
        }

        const targetEmail = (tokenRecord.email || clientEmail).trim().toLowerCase();
        const targetUserId = tokenRecord.userId;

        // 3. Marca o token como consumido
        await supabase
          .from('dex_auth_tokens')
          .update({ usedAt: now.toISOString() })
          .eq('id', tokenRecord.id);

        // 4. Ativa o usuário em dex_users por email E por id
        const userUpdates = {
          isEmailConfirmed: true,
          status: 'ACTIVE'
        };

        if (targetEmail) {
          await supabase
            .from('dex_users')
            .update(userUpdates)
            .eq('email', targetEmail);
        }

        if (targetUserId) {
          await supabase
            .from('dex_users')
            .update(userUpdates)
            .eq('id', targetUserId);
        }

        console.log(`[API Verify Email] Usuário ativado com sucesso: ${targetEmail}`);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.end(JSON.stringify({
          success: true,
          message: 'E-mail confirmado com sucesso! Sua conta está ativada.',
          email: targetEmail,
          userId: targetUserId
        }));
      } catch (sbErr: any) {
        console.error('[API Verify Email] Exceção Supabase:', sbErr?.message);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.end(JSON.stringify({
          success: false,
          error: 'Falha ao ativar o usuário no banco de dados: ' + (sbErr?.message || 'Erro de rede')
        }));
      }
    }

    // Modo Standalone/Desenvolvimento sem Supabase conectado
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({
      success: true,
      message: 'E-mail confirmado com sucesso (modo local)!',
      email: clientEmail
    }));
  } catch (error: any) {
    console.error('[API Verify Email] Erro inesperado:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({
      success: false,
      error: 'Erro interno no servidor de confirmação.'
    }));
  }
}
