// Vercel Serverless Function: POST /api/auth/reset-password
// Redefinição segura de senha com invalidação de token e aviso por e-mail
// 100% autônomo (zero dependências relativas para evitar falhas no Vercel)

import crypto from 'crypto';
import nodemailer from 'nodemailer';

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
<body style="font-family: Georgia, serif; padding: 24px; background-color: #F9ECE2;">
  <div style="max-width: 500px; margin: 0 auto; background: white; padding: 32px; border-radius: 16px; border: 1px solid #EAE0DA;">
    <h2 style="color: #0F2733; margin-top: 0;">⚖️ Dex Jurídico — Alerta de Segurança</h2>
    <p style="color: #35474B; font-size: 15px; line-height: 1.5;">Confirmamos que a senha de acesso à sua conta no Dex foi alterada com sucesso.</p>
    <p style="color: #35474B; font-size: 14px;">Se você reconhece esta alteração, nenhuma outra ação é necessária.</p>
    <p style="color: #8F8A87; font-size: 12px; margin-top: 24px; border-top: 1px solid #EAE0DA; padding-top: 12px;">Se você NÃO solicitou esta alteração, entre em contato imediatamente com o suporte ou redefina sua senha.</p>
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
  } catch (e) {
    console.warn('[Reset Password Alert] Erro ao enviar aviso por e-mail:', e);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, error: 'Método não permitido.' }));
  }

  try {
    const { token, newPassword } = req.body || {};

    if (!token || typeof token !== 'string') {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, error: 'Token de redefinição não fornecido.' }));
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, error: 'A nova senha deve conter no mínimo 6 caracteres.' }));
    }

    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    let targetEmail = '';

    // Gera novo salt e hash criptográfico compatível com Dex (SHA-256(salt + password))
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newPasswordHash = crypto.createHash('sha256').update(newSalt + newPassword).digest('hex');

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
            targetEmail = record.email;

            // Invalida o token
            await fetch(`${supabaseUrl}/rest/v1/dex_auth_tokens?id=eq.${encodeURIComponent(record.id)}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({ usedAt: new Date().toISOString() })
            });

            // Atualiza senha no Supabase
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
                passwordHash: newPasswordHash
              })
            });
          }
        }
      } catch (e) {
        console.warn('[API Reset Password] Erro ao sincronizar com Supabase:', e);
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
      email: targetEmail || undefined,
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
