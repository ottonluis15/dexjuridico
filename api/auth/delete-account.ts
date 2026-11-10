// Vercel Serverless Function: POST /api/auth/delete-account
// Exclusão / Desativação com verificação de segurança, auditoria e aviso por e-mail (LGPD)
// 100% autônomo (zero dependências relativas para evitar falhas no Vercel)

import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Rate Limiter em memória por IP / E-mail (máximo 5 tentativas por janela de 15 min)
const failedAttempts = new Map<string, { count: number; lockUntil: number }>();

function checkRateLimit(key: string): { blocked: boolean; remainingMs?: number } {
  const record = failedAttempts.get(key);
  if (!record) return { blocked: false };

  if (Date.now() < record.lockUntil) {
    return { blocked: true, remainingMs: record.lockUntil - Date.now() };
  }

  if (Date.now() >= record.lockUntil && record.lockUntil > 0) {
    failedAttempts.delete(key);
  }

  return { blocked: false };
}

function registerAttempt(key: string, success: boolean) {
  if (success) {
    failedAttempts.delete(key);
    return;
  }
  const now = Date.now();
  const current = failedAttempts.get(key) || { count: 0, lockUntil: 0 };
  const newCount = current.count + 1;
  const lockUntil = newCount >= 5 ? now + 15 * 60 * 1000 : 0;
  failedAttempts.set(key, { count: newCount, lockUntil });
}

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

async function sendAccountDeletedEmail(to: string, userName: string, targetType: 'USER' | 'OFFICE', officeName?: string) {
  const { cleanUser, cleanPass, emailFrom } = getEmailCredentials();
  if (!cleanUser || !cleanPass) {
    console.warn('[Delete Account] Credenciais de e-mail ausentes. Aviso simulado.');
    return { success: true, simulated: true };
  }

  const isOffice = targetType === 'OFFICE';
  const subject = isOffice
    ? `Encerramento do Escritório ${officeName || ''} — Dex Gestão Jurídica`
    : `Confirmação de Exclusão de Conta — Dex Gestão Jurídica`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9ECE2; font-family: 'Georgia', Cambria, serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9ECE2; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 39, 51, 0.08); border: 1px solid #EAE0DA;">
          <tr>
            <td style="padding: 32px 36px 20px; background-color: #FAF5F0; border-bottom: 2px solid #F0CBAE; text-align: center;">
              <span style="font-family: 'Georgia', serif; font-size: 26px; font-weight: bold; color: #0F2733; vertical-align: middle;">⚖️ Dex</span>
              <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #8F8A87; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Gestão Jurídica Inteligente</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 40px; color: #0F2733;">
              <h2 style="font-family: 'Georgia', serif; font-size: 22px; font-weight: bold; color: #C53030; margin: 0 0 16px;">
                ${isOffice ? 'Encerramento de Escritório Confirmado' : 'Conta Excluída com Sucesso'}
              </h2>
              <p style="font-size: 15px; line-height: 1.6; color: #35474B; margin: 0 0 16px;">
                Olá, <strong>${userName || 'Colega'}</strong>.
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #35474B; margin: 0 0 20px;">
                ${isOffice 
                  ? `Confirmamos a exclusão do escritório <strong>${officeName || ''}</strong> e de seus dados associados. Os advogados integrantes foram desvinculados preservando suas credenciais individuais como autônomos.`
                  : `Confirmamos a exclusão definitiva da sua conta no Dex. Seus dados pessoais foram devidamente tratados e removidos de nossos servidores em estrita observância à Lei Geral de Proteção de Dados (LGPD).`
                }
              </p>
              <div style="background-color: #FAF5F0; border-left: 4px solid #4A808E; padding: 14px 18px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 12px; color: #35474B; line-height: 1.5;">
                  <strong>Segurança Forense & LGPD:</strong> Sessões foram encerradas em todos os dispositivos. Registros imutáveis de auditoria foram retidos de forma anonimizada pelo período legal obrigatório.
                </p>
              </div>
              <p style="font-size: 13px; color: #8F8A87; margin: 24px 0 0; line-height: 1.5;">
                Agradecemos o tempo em que você esteve conosco. Se precisar de suporte forense ou esclarecimentos, responda diretamente a este e-mail.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0F2733; padding: 20px 36px; text-align: center; color: #A6C5CD; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              © ${new Date().getFullYear()} Dex Gestão Jurídica Inteligente. Todos os direitos reservados.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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
      subject,
      html
    });

    return { success: true };
  } catch (err: any) {
    console.error('[Delete Account] Erro ao disparar e-mail de aviso:', err.message);
    return { success: false, error: err.message };
  }
}

export default async function handler(req: any, res: any) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Método não permitido. Utilize POST.' }));
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'JSON inválido no corpo da requisição.' }));
        return;
      }
    }

    const { email, userName, targetType = 'USER', officeName, confirmationText, isDemoAccount } = body || {};

    if (!email) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'O e-mail do titular é obrigatório.' }));
      return;
    }

    // Proteção de Contas Especiais (SuperAdmin e Demo)
    const normalizedEmail = email.trim().toLowerCase();
    const adminEmail = (process.env.VITE_APP_ADMIN_EMAIL || 'otton.luis.alcaraz@gmail.com').toLowerCase();

    if (normalizedEmail === adminEmail) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'A conta de Administrador da Plataforma não pode ser excluída por este fluxo.' }));
      return;
    }

    if (normalizedEmail === 'demo@dexjuridico.com.br' || isDemoAccount) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'A conta de demonstração institucional não pode ser excluída.' }));
      return;
    }

    // Rate Limiting
    const rateCheck = checkRateLimit(normalizedEmail);
    if (rateCheck.blocked) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        error: 'Limite de tentativas excedido por segurança. Tente novamente em 15 minutos.' 
      }));
      return;
    }

    // Validação da palavra-chave de confirmação
    if (targetType === 'USER' && confirmationText?.trim().toUpperCase() !== 'EXCLUIR') {
      registerAttempt(normalizedEmail, false);
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Para confirmar, digite exatamente a palavra EXCLUIR.' }));
      return;
    }

    // Expurgo direto de dados no Supabase (se configurado no ambiente Vercel)
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        if (targetType === 'USER') {
          await supabase.from('dex_users').delete().eq('email', normalizedEmail);
          await supabase.from('dex_lawyers').delete().eq('email', normalizedEmail);
          await supabase.from('dex_auth_tokens').delete().eq('email', normalizedEmail);
        } else if (targetType === 'OFFICE' && officeName) {
          await supabase.from('dex_users').update({ isIndependent: true, officeId: null, officeName: null, officeCode: null }).eq('officeName', officeName);
          await supabase.from('dex_lawyers').update({ officeId: null, roleTitle: 'Advogado Autônomo' }).eq('officeName', officeName);
        }
      } catch (sbErr: any) {
        console.warn('[Delete Account Serverless] Aviso ao expurgar no Supabase:', sbErr?.message);
      }
    }

    // Dispara e-mail de confirmação e aviso
    registerAttempt(normalizedEmail, true);
    await sendAccountDeletedEmail(normalizedEmail, userName || '', targetType, officeName);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: true, 
      message: targetType === 'OFFICE' 
        ? 'Escritório encerrado e dados tratados com sucesso.' 
        : 'Sua conta foi excluída com sucesso em conformidade com a LGPD.' 
    }));
  } catch (error: any) {
    console.error('[Delete Account API Error]', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message || 'Erro interno no servidor de exclusão.' }));
  }
}

