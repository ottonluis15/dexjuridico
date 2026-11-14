// Vercel Serverless Function: POST /api/auth/send-verification
// Envia e-mail de confirmação de cadastro ou reenvio de ativação com token criptográfico seguro
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
  const senderAddress = cleanUser || 'confirm.dex@gmail.com';
  const emailFrom = `"Dex Jurídico" <${senderAddress}>`;

  return { cleanUser, cleanPass, senderAddress, emailFrom };
}

async function sendVerificationEmail(to: string, confirmUrl: string, name?: string) {
  const { cleanUser, cleanPass, senderAddress, emailFrom } = getEmailCredentials();

  if (!cleanUser || !cleanPass) {
    console.warn('[Send Verification] SMTP_USER ou SMTP_PASS ausentes no ambiente. Simulação ativada.');
    return { success: true, simulated: true };
  }

  const greeting = name ? `Olá, ${name}.` : 'Olá.';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme seu e-mail — Dex Gestão Jurídica</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9ECE2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <!-- Preheader oculto para melhorar entregabilidade nos filtros do Gmail/Outlook -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
    Confirmação de acesso ao Dex — Sistema de Gestão Jurídica Inteligente. Ative sua conta em um clique.
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
              <h1 style="margin: 0 0 16px; font-family: 'Georgia', serif; font-size: 21px; font-weight: bold; color: #0F2733;">Confirmação de Acesso à sua Banca</h1>
              <p style="margin: 0 0 14px; font-size: 15px; line-height: 1.5; color: #35474B; font-weight: 600;">${greeting}</p>
              <p style="margin: 0 0 14px; font-size: 15px; line-height: 1.5; color: #35474B;">Seu cadastro no Dex foi iniciado com sucesso.</p>
              <p style="margin: 0 0 14px; font-size: 15px; line-height: 1.5; color: #35474B;">Para ativar sua conta e liberar o acesso com segurança à plataforma forense, clique no botão abaixo:</p>
              
              <div style="text-align: center; margin: 28px 0 20px;">
                <a href="${confirmUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #0F2733; color: #FFFFFF; font-family: 'Georgia', serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(15, 39, 51, 0.2);">
                  Confirmar meu e-mail
                </a>
              </div>

              <div style="padding: 12px 16px; background-color: #F9ECE2; border-radius: 8px; margin: 20px 0; border: 1px solid #EAE0DA; font-size: 13px; color: #6D6865; line-height: 1.4;">
                Este link institucional é válido por 24 horas para uso único e seguro.
              </div>

              <p style="margin: 20px 0 0; font-size: 12px; color: #8F8A87; border-top: 1px solid #EAE0DA; padding-top: 14px; line-height: 1.4;">
                Se não foi você quem solicitou este cadastro no Dex, por favor desconsidere este e-mail. Nenhuma ação será realizada na sua conta.
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

  const text = `DEX — GESTÃO JURÍDICA INTELIGENTE\nConfirmação de Acesso à sua Banca\n\n${greeting}\nSeu cadastro no Dex foi iniciado com sucesso.\nPara ativar sua conta com segurança, clique no link abaixo:\n${confirmUrl}\n\nEste link é válido por 24 horas. Se não solicitou, por favor desconsidere.`;

  const mailOptions = {
    from: emailFrom,
    to,
    replyTo: senderAddress,
    subject: 'Confirme seu e-mail — Dex Gestão Jurídica',
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
    console.warn('[Send Verification] Porta 465 falhou, tentando porta 587...', err465?.message);
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

    const { email, name, userId, origin } = body || {};

    if (!email || typeof email !== 'string') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.end(JSON.stringify({ success: false, error: 'E-mail não informado.' }));
    }

    const cleanEmail = email.trim().toLowerCase();
    let effectiveUserId = userId || `usr_${cleanEmail}`;
    let effectiveName = name || '';

    // Cria token seguro de uso único (válido por 24 horas)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Se o userId não veio ou é provisório, tenta achar o usuário real em dex_users
        if (!userId) {
          const { data: userRecords } = await supabase
            .from('dex_users')
            .select('id, name')
            .eq('email', cleanEmail)
            .limit(1);

          if (userRecords && userRecords.length > 0) {
            effectiveUserId = userRecords[0].id;
            if (!effectiveName) effectiveName = userRecords[0].name;
          }
        }

        // Invalida tokens anteriores não usados para este e-mail
        await supabase
          .from('dex_auth_tokens')
          .update({ usedAt: now.toISOString() })
          .eq('email', cleanEmail)
          .eq('type', 'EMAIL_VERIFICATION')
          .is('usedAt', null);

        // Insere o novo token
        await supabase
          .from('dex_auth_tokens')
          .insert([{
            id: `tok_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
            userId: effectiveUserId,
            email: cleanEmail,
            tokenHash,
            type: 'EMAIL_VERIFICATION',
            expiresAt,
            usedAt: null,
            metadata: { name: effectiveName || 'Usuário' },
            created_at: now.toISOString()
          }]);

        console.log(`[Send Verification] Token gerado no Supabase para ${cleanEmail}`);
      } catch (e: any) {
        console.warn('[API Send Verification] Erro ao sincronizar token no Supabase:', e?.message);
      }
    }

    // Constrói a URL de confirmação com rota dedicada /confirmar-email
    const host = req?.headers?.host || req?.headers?.['x-forwarded-host'];
    const proto = req?.headers?.['x-forwarded-proto'] || 'https';
    const baseUrl = origin || process.env.APP_URL || (host ? `${proto}://${host}` : 'https://dexjuridico.adv.br');
    const confirmUrl = `${baseUrl.replace(/\/+$/, '')}/confirmar-email?verify_token=${rawToken}&email=${encodeURIComponent(cleanEmail)}`;

    // Dispara o e-mail via Nodemailer
    const emailResult = await sendVerificationEmail(cleanEmail, confirmUrl, effectiveName);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({
      success: true,
      message: 'Se o e-mail for válido, enviamos as instruções de confirmação.',
      simulated: emailResult.simulated,
      actionUrl: process.env.NODE_ENV !== 'production' ? confirmUrl : undefined
    }));
  } catch (error: any) {
    console.error('[API Send Verification] Erro inesperado:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({
      success: false,
      error: 'Erro interno ao processar envio de confirmação: ' + (error?.message || 'Erro no servidor')
    }));
  }
}
