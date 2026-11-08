// Vercel Serverless Function: POST /api/auth/verify-email
// Valida o token e confirma o e-mail do usuário

import { verifyAndConsumeToken } from '../_lib/tokenService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido.' });
  }

  try {
    const { token } = req.body || {};

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, error: 'Token de confirmação não fornecido.' });
    }

    // Tenta validar como EMAIL_VERIFICATION, INVITE_VERIFICATION ou CHANGE_EMAIL
    let verification = await verifyAndConsumeToken({
      rawToken: token,
      expectedType: 'EMAIL_VERIFICATION'
    });

    if (!verification.valid) {
      verification = await verifyAndConsumeToken({
        rawToken: token,
        expectedType: 'INVITE_VERIFICATION'
      });
    }

    if (!verification.valid) {
      verification = await verifyAndConsumeToken({
        rawToken: token,
        expectedType: 'CHANGE_EMAIL'
      });
    }

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        error: verification.error || 'Link de confirmação inválido ou expirado.'
      });
    }

    const { tokenRecord } = verification;
    const isChangeEmail = tokenRecord?.type === 'CHANGE_EMAIL';
    const newEmail = tokenRecord?.metadata?.newEmail || tokenRecord?.email;

    // Atualiza o usuário no Supabase se configurado
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && tokenRecord?.userId) {
      try {
        const updatePayload: Record<string, any> = {
          isEmailConfirmed: true,
          status: 'ACTIVE'
        };

        if (isChangeEmail && newEmail) {
          updatePayload.email = newEmail.toLowerCase().trim();
          updatePayload.pendingEmail = null;
        }

        await fetch(`${supabaseUrl}/rest/v1/dex_users?id=eq.${encodeURIComponent(tokenRecord.userId)}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(updatePayload)
        });
      } catch (e) {
        console.warn('[API Verify Email] Erro ao atualizar Supabase:', e);
      }
    }

    return res.status(200).json({
      success: true,
      message: isChangeEmail ? 'Novo e-mail confirmado com sucesso!' : 'E-mail confirmado com sucesso!',
      email: newEmail,
      userId: tokenRecord?.userId
    });
  } catch (error: any) {
    console.error('[API Verify Email] Erro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao validar confirmação de e-mail.'
    });
  }
}

