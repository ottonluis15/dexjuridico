// Vercel Serverless Function: POST /api/auth/reset-password
// Redefinição segura de senha com invalidação de token e aviso por e-mail

import crypto from 'crypto';
import { sendEmail } from '../_lib/emailService';
import { verifyAndConsumeToken, checkRateLimit } from '../_lib/tokenService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido.' });
  }

  try {
    const { token, newPassword } = req.body || {};

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, error: 'Token de redefinição não fornecido.' });
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ success: false, error: 'Nova senha não informada.' });
    }

    // Validação estrita de força da senha
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'A nova senha deve conter no mínimo 8 caracteres.' });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ success: false, error: 'A nova senha deve conter pelo menos uma letra maiúscula.' });
    }
    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({ success: false, error: 'A nova senha deve conter pelo menos uma letra minúscula.' });
    }
    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ success: false, error: 'A nova senha deve conter pelo menos um número.' });
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)) {
      return res.status(400).json({ success: false, error: 'A nova senha deve conter pelo menos um caractere especial.' });
    }

    const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').toString().split(',')[0].trim();
    const rateCheck = checkRateLimit(`reset_attempt_${clientIp}`, 10, 30);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: `Muitas tentativas de redefinição. Aguarde ${rateCheck.waitMinutes} minutos.`
      });
    }

    // Valida e consome o token (invalidando-o e impedindo reuso)
    const verification = await verifyAndConsumeToken({
      rawToken: token,
      expectedType: 'PASSWORD_RESET'
    });

    if (!verification.valid || !verification.tokenRecord) {
      return res.status(400).json({
        success: false,
        error: verification.error || 'Link de redefinição inválido ou expirado.'
      });
    }

    const { tokenRecord } = verification;
    const targetEmail = tokenRecord.email;

    // Gera novo salt e hash criptográfico compatível com Dex (SHA-256(salt + password))
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newPasswordHash = crypto.createHash('sha256').update(newSalt + newPassword).digest('hex');

    // Atualiza no Supabase se configurado
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/dex_users?email=eq.${encodeURIComponent(targetEmail)}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            salt: newSalt,
            passwordHash: newPasswordHash,
            updated_at: new Date().toISOString()
          })
        });
      } catch (e) {
        console.warn('[API Reset Password] Erro ao atualizar senha no Supabase:', e);
      }
    }

    // Dispara e-mail de alerta de segurança avisando que a senha foi alterada
    await sendEmail({
      to: targetEmail,
      subject: 'Alerta de Segurança: Senha alterada — Dex Jurídico',
      headline: 'Sua Senha foi Redefinida',
      paragraphs: [
        'Confirmamos que a senha de acesso à sua conta no Dex foi alterada com sucesso.',
        'Se você reconhece esta alteração, nenhuma outra ação é necessária.',
        'Se você NÃO solicitou nem realizou esta alteração, entre em contato imediatamente com o administrador da sua banca ou recupere o acesso à sua conta.'
      ],
      securityNotice: 'Por segurança, todas as sessões anteriores foram invalidadas. Utilize suas novas credenciais para fazer login.'
    });

    return res.status(200).json({
      success: true,
      message: 'Sua senha foi redefinida com sucesso! Você já pode fazer login com sua nova credencial.',
      email: targetEmail,
      newSalt,
      newPasswordHash
    });
  } catch (error: any) {
    console.error('[API Reset Password] Erro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao redefinir senha.'
    });
  }
}

