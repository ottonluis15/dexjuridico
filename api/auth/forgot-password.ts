// Vercel Serverless Function: POST /api/auth/forgot-password
// Solicitação de redefinição de senha com proteção contra enumeração de contas
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
  const senderAddress = cleanUser || 'confirm.dex@gmail.com';
  const emailFrom = `"Dex Jurídico" <${senderAddress}>`;

  return { cleanUser, cleanPass, senderAddress, emailFrom };
}

async function sendResetEmail(to: string, resetUrl: string, userName: string) {
  const { cleanUser, cleanPass, senderAddress, emailFrom } = getEmailCredentials();

  if (!cleanUser || !cleanPass) {
    console.warn('[Forgot Password] SMTP_USER ou SMTP_PASS ausentes no ambiente. Simulação ativada.');
    return { success: true, simulated: true };
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinição de Senha — Dex Gestão Jurídica</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9ECE2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
    Solicitação de recuperação de credencial no Dex. Redefina sua senha com segurança.
  </div>
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9ECE2; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 24px rgba(15, 39, 51, 0.06); border: 1px solid #EAE0DA;">
          <tr>
            <td style="padding: 28px 32px 20px; background-color: #FAF5F0; border-bottom: 2px solid #F0CBAE; text-align: center;">
              <span style="font-family: 'Georgia', serif; font-size: 26px; font-weight: bold; color: #0F2733; vertical-align: middle;">⚖️ Dex</span>
              <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #8F8A87;">Gestão Jurídica Inteligente</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 24px; text-align: left;">
              <h1 style="margin: 0 0 16px; font-family: 'Georgia', serif; font-size: 21px; font-weight: bold; color: #0F2733;">Recuperação de Acesso Forense</h1>
              <p style="margin: 0 0 14px; font-size: 15px; line-height: 1.5; color: #35474B; font-weight: 600;">Olá, ${userName || 'Colega Advogado'}.</p>
              <p style="margin: 0 0 14px; font-size: 15px; line-height: 1.5; color: #35474B;">Recebemos uma solicitação para redefinir a credencial de acesso da sua conta no Dex.</p>
              <p style="margin: 0 0 14px; font-size: 15px; line-height: 1.5; color: #35474B;">Se foi você quem solicitou, clique no botão abaixo para criar sua nova senha com segurança:</p>
              
              <div style="text-align: center; margin: 28px 0 20px;">
                <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #0F2733; color: #FFFFFF; font-family: 'Georgia', serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(15, 39, 51, 0.2);">
                  Redefinir minha senha
                </a>
              </div>

              <div style="padding: 12px 16px; background-color: #F9ECE2; border-radius: 8px; margin: 20px 0; border: 1px solid #EAE0DA; font-size: 13px; color: #6D6865; line-height: 1.4;">
                Por segurança institucional, este link expira em 45 minutos para uso único.
              </div>

              <p style="margin: 20px 0 0; font-size: 12px; color: #8F8A87; border-top: 1px solid #EAE0DA; padding-top: 14px; line-height: 1.4;">
                Se você não solicitou a alteração, ignore este e-mail. Sua senha atual permanecerá segura e inalterada.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px 24px; background-color: #FAF5F0; border-top: 1px solid #EAE0DA; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #8F8A87;">Dex — Sistema de Advocacia e Gestão Jurídica com IA</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `DEX — GESTÃO JURÍDICA INTELIGENTE\nRecuperação de Acesso Forense\n\nOlá, ${userName || 'Colega Advogado'}.\nRecebemos uma solicitação para redefinir a credencial da sua conta no Dex.\nPara prosseguir, acesse o link abaixo:\n${resetUrl}\n\nVálido por 45 minutos. Se não foi você quem solicitou, ignore esta mensagem.`;

  const mailOptions = {
    from: emailFrom,
    to,
    replyTo: senderAddress,
    subject: 'Redefinição de Senha — Dex Gestão Jurídica',
    headers: {
      'X-Priority': '3',
      'X-MSMail-Priority': 'Normal',
      'Importance': 'Normal'
    },
    html,
    text
  };

  // Tenta porta 465 (SSL) com fallback para 587 (STARTTLS)
  try {
    const transporter465 = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: cleanUser, pass: cleanPass },
      connectionTimeout: 5000,
      tls: { rejectUnauthorized: false }
    });
    const info = await transporter465.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (err465: any) {
    console.warn('[Forgot Password] Porta 465 falhou, tentando porta 587...', err465?.message);
    const transporter587 = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: cleanUser, pass: cleanPass },
      connectionTimeout: 5000,
      tls: { rejectUnauthorized: false }
    });
    const info = await transporter587.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, error: 'Método não permitido.' }));
  }

  try {
    const { email, origin } = req.body || {};

    if (!email || typeof email !== 'string') {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, error: 'E-mail não fornecido.' }));
    }

    const cleanEmail = email.trim().toLowerCase();

    // Não permitir redefinição na conta demo
    if (cleanEmail === 'demo@dexjuridico.adv.br') {
      res.statusCode = 200;
      return res.end(JSON.stringify({
        success: true,
        message: 'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha em instantes.'
      }));
    }

    // Busca usuário no Supabase se configurado
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    let targetUserId = `usr_${cleanEmail}`;
    let userName = 'Colega Advogado';

    if (supabaseUrl && supabaseKey) {
      try {
        const uRes = await fetch(`${supabaseUrl}/rest/v1/dex_users?email=eq.${encodeURIComponent(cleanEmail)}&select=id,name,isDemo`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        if (uRes.ok) {
          const list: any = await uRes.json();
          if (Array.isArray(list) && list.length > 0) {
            if (list[0].isDemo) {
              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                message: 'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha em instantes.'
              }));
            }
            targetUserId = list[0].id;
            userName = list[0].name || userName;
          }
        }
      } catch (e) {
        console.warn('[API Forgot Password] Erro ao consultar Supabase:', e);
      }
    }

    // Cria token com validade de 45 minutos (hash SHA-256)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 45 * 60 * 1000).toISOString();

    if (supabaseUrl && supabaseKey) {
      try {
        // Invalida tokens anteriores
        await fetch(`${supabaseUrl}/rest/v1/dex_auth_tokens?userId=eq.${encodeURIComponent(targetUserId)}&type=eq.PASSWORD_RESET&usedAt=is.null`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ usedAt: now.toISOString() })
        });

        // Insere novo token
        await fetch(`${supabaseUrl}/rest/v1/dex_auth_tokens`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            id: `tok_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
            userId: targetUserId,
            email: cleanEmail,
            tokenHash,
            type: 'PASSWORD_RESET',
            expiresAt,
            usedAt: null,
            metadata: { name: userName },
            createdAt: now.toISOString()
          })
        });
      } catch (e) {
        console.warn('[API Forgot Password] Erro ao salvar token no Supabase:', e);
      }
    }

    const host = req?.headers?.host || req?.headers?.['x-forwarded-host'];
    const proto = req?.headers?.['x-forwarded-proto'] || 'https';
    const baseUrl = origin || process.env.APP_URL || (host ? `${proto}://${host}` : 'https://dexjuridico.adv.br');
    const resetUrl = `${baseUrl}?reset_token=${rawToken}&email=${encodeURIComponent(cleanEmail)}`;

    // Dispara o e-mail com timeout seguro
    const sendResult = await sendResetEmail(cleanEmail, resetUrl, userName);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({
      success: true,
      message: 'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha em instantes.',
      simulated: sendResult.simulated,
      actionUrl: process.env.NODE_ENV !== 'production' ? resetUrl : undefined
    }));
  } catch (error: any) {
    console.error('[API Forgot Password] Erro inesperado:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({
      success: false,
      error: 'Erro interno ao processar recuperação de senha: ' + (error?.message || 'Erro no servidor')
    }));
  }
}
