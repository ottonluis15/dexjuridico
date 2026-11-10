// Vercel Serverless Function: POST /api/auth/reset-password
// Redefinição segura de senha com validação de token, atualização em dex_users e alerta por e-mail
// 100% autônomo (zero dependências relativas para evitar falhas no Vercel)

import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

function getEmailCredentials() {
  const rawUser = 
    process.env.SMTP_USER || 
    process.env.EMAIL_USER || 
    process.env.GMAIL_USER || 
    process.env.MAIL_USER || 
    process.env.VITE_SMTP_USER || 
    '';

  const rawPass = 
    process.env.SMTP_PASS || 
    process.env.SMTP_PASSWORD || 
    process.env.EMAIL_PASS || 
    process.env.EMAIL_PASSWORD || 
    process.env.GMAIL_PASS || 
    process.env.GMAIL_PASSWORD || 
    process.env.GMAIL_APP_PASSWORD || 
    process.env.MAIL_PASS || 
    process.env.MAIL_PASSWORD || 
    process.env.VITE_SMTP_PASS || 
    '';

  const cleanUser = rawUser.trim().replace(/^["']|["']$/g, '');
  const cleanPass = rawPass.trim().replace(/\s+/g, '').replace(/^["']|["']$/g, '');
  const emailFrom = process.env.EMAIL_FROM || `Dex Jurídico <${cleanUser || 'confirm.dex@gmail.com'}>`;

  return { cleanUser, cleanPass, emailFrom };
}

async function sendSecurityAlertEmail(to: string) {
  const { cleanUser, cleanPass, emailFrom } = getEmailCredentials();
  if (!cleanUser || !cleanPass) return;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"></head>
<body style="font-family: Georgia, serif; padding: 24px; background-color: #F9ECE2;">
  <div style="max-width: 500px; margin: 0 auto; background: white; padding: 32px; border-radius: 16px; border: 1px solid #EAE0DA; box-shadow: 0 4px 12px rgba(15,39,51,0.06);">
    <h2 style="color: #0F2733; margin-top: 0;">⚖️ Dex Jurídico — Alerta de Segurança</h2>
    <p style="color: #35474B; font-size: 15px; line-height: 1.5;">Confirmamos que a senha de acesso à sua conta no Dex foi alterada com sucesso.</p>
    <p style="color: #35474B; font-size: 14px;">Se você realizou esta alteração, nenhuma outra ação é necessária.</p>
    <p style="color: #8F8A87; font-size: 12px; margin-top: 24px; border-top: 1px solid #EAE0DA; padding-top: 12px;">Se você NÃO solicitou esta alteração, entre em contato imediatamente com o suporte técnico para bloquear o acesso não autorizado.</p>
  </div>
</body>
</html>`;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: cleanUser, pass: cleanPass },
      connectionTimeout: 5000,
      tls: { rejectUnauthorized: false }
    });
    await transporter.sendMail({
      from: emailFrom,
      to,
      subject: 'Alerta de Segurança: Senha alterada — Dex Jurídico',
      html,
      text: 'Confirmamos que a senha da sua conta no Dex Jurídico foi alterada com sucesso.'
    });
  } catch (e: any) {
    console.warn('[Reset Password Alert] Erro ao enviar aviso por e-mail:', e?.message);
  }
}

function validateServerPassword(password: string): { isValid: boolean; error?: string } {
  if (typeof password !== 'string' || password.length < 8) {
    return { isValid: false, error: 'A senha deve conter no mínimo 8 caracteres.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'A senha deve conter pelo menos uma letra maiúscula (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'A senha deve conter pelo menos uma letra minúscula (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'A senha deve conter pelo menos um número (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { isValid: false, error: 'A senha deve conter pelo menos um caractere especial (!@#$%^&*...).' };
  }
  return { isValid: true };
}

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

    const { token, newPassword, email } = body || {};

    if (!token || typeof token !== 'string') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.end(JSON.stringify({ success: false, code: 'INVALID_TOKEN', error: 'Token de redefinição não fornecido.' }));
    }

    const pwdValidation = validateServerPassword(newPassword);
    if (!pwdValidation.isValid) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.end(JSON.stringify({ 
        success: false, 
        code: 'WEAK_PASSWORD', 
        error: pwdValidation.error 
      }));
    }

    const clientEmail = (email || '').trim().toLowerCase();
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    // Gera novo salt e hash criptográfico compatível com Dex (SHA-256(salt + password))
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newPasswordHash = crypto.createHash('sha256').update(newSalt + newPassword).digest('hex');

    let targetEmail = clientEmail;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: tokens, error: tokenErr } = await supabase
          .from('dex_auth_tokens')
          .select('*')
          .eq('tokenHash', tokenHash)
          .order('created_at', { ascending: false });

        if (tokenErr) {
          console.error('[API Reset Password] Erro ao buscar token:', tokenErr.message);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.end(JSON.stringify({ success: false, error: 'Erro no banco de dados ao verificar o token.' }));
        }

        if (!tokens || tokens.length === 0) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.end(JSON.stringify({ 
            success: false, 
            code: 'INVALID_TOKEN', 
            error: 'Link de redefinição inválido ou inexistente.' 
          }));
        }

        const record = tokens[0];
        const now = new Date();

        if (record.usedAt) {
          res.statusCode = 410;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.end(JSON.stringify({ 
            success: false, 
            code: 'ALREADY_USED', 
            error: 'Este link de redefinição de senha já foi utilizado anteriormente.' 
          }));
        }

        if (new Date(record.expiresAt) < now) {
          res.statusCode = 410;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.end(JSON.stringify({ 
            success: false, 
            code: 'EXPIRED_TOKEN', 
            error: 'Este link de redefinição expirou (validade de 24 horas). Solicite um novo link.' 
          }));
        }

        targetEmail = (record.email || clientEmail).trim().toLowerCase();
        const targetUserId = record.userId;

        // 1. Marca o token como consumido
        await supabase
          .from('dex_auth_tokens')
          .update({ usedAt: now.toISOString() })
          .eq('id', record.id);

        // 2. Atualiza a senha e confirma o e-mail em dex_users por email E por id
        const userUpdates = {
          salt: newSalt,
          passwordHash: newPasswordHash,
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

        console.log(`[API Reset Password] Senha redefinida no Supabase com sucesso para: ${targetEmail}`);
      } catch (sbErr: any) {
        console.error('[API Reset Password] Exceção Supabase:', sbErr?.message);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.end(JSON.stringify({ 
          success: false, 
          error: 'Falha ao atualizar nova senha no banco: ' + (sbErr?.message || 'Erro') 
        }));
      }
    }

    if (targetEmail) {
      sendSecurityAlertEmail(targetEmail).catch(console.warn);
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({
      success: true,
      message: 'Sua senha foi redefinida com sucesso! Você já pode fazer login com sua nova credencial.',
      email: targetEmail,
      newSalt,
      newPasswordHash
    }));
  } catch (error: any) {
    console.error('[API Reset Password] Erro inesperado:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({
      success: false,
      error: 'Erro interno ao redefinir senha.'
    }));
  }
}
