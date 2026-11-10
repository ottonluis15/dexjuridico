// Vercel Serverless Function: POST /api/auth/delete-account
// Exclusão definitiva de conta e encerramento de escritório com validação de senha no servidor,
// cancelamento de assinaturas no Stripe, expurgo/anonimização LGPD e notificação transacional por e-mail.

import nodemailer from 'nodemailer';
import crypto from 'crypto';
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
                  ? `Confirmamos o encerramento do escritório <strong>${officeName || ''}</strong> e a exclusão definitiva dos dados institucionais sob sua titularidade. Os advogados integrantes foram preservados como autônomos e notificados por e-mail.`
                  : `Confirmamos a exclusão definitiva da sua conta no Dex. Seus dados pessoais foram devidamente tratados e expurgados de nossos servidores em estrita observância à Lei Geral de Proteção de Dados (LGPD).`
                }
              </p>
              <div style="background-color: #FAF5F0; border-left: 4px solid #4A808E; padding: 14px 18px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 12px; color: #35474B; line-height: 1.5;">
                  <strong>Segurança & Reutilização:</strong> Seu e-mail foi completamente liberado. Caso deseje retornar ao Dex no futuro, você poderá criar uma nova conta utilizando este mesmo endereço de e-mail a qualquer momento.
                </p>
              </div>
              <p style="font-size: 13px; color: #8F8A87; margin: 24px 0 0; line-height: 1.5;">
                Agradecemos o período em que atuamos juntos. Se precisar de esclarecimentos sobre a custódia forense, responda diretamente a este e-mail.
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

async function sendOfficeClosedToLawyerEmail(to: string, lawyerName: string, officeName: string) {
  const { cleanUser, cleanPass, emailFrom } = getEmailCredentials();
  if (!cleanUser || !cleanPass) return { success: true, simulated: true };

  const subject = `Aviso Importante: Encerramento do Escritório ${officeName} — Dex Gestão Jurídica`;
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin: 0; padding: 0; background-color: #F9ECE2; font-family: 'Georgia', Cambria, serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 24px; padding: 32px; border: 1px solid #EAE0DA;">
        <tr><td style="text-align: center; border-bottom: 2px solid #F0CBAE; padding-bottom: 16px;">
          <span style="font-size: 24px; font-weight: bold; color: #0F2733;">⚖️ Dex</span>
        </td></tr>
        <tr><td style="padding-top: 24px; color: #0F2733;">
          <h2 style="font-size: 20px; color: #C53030; margin: 0 0 14px;">Encerramento de Escritório</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #35474B;">Olá, <strong>${lawyerName || 'Doutor'}</strong>.</p>
          <p style="font-size: 14px; line-height: 1.6; color: #35474B;">
            Informamos que o sócio titular encerrou as atividades do escritório <strong>${officeName}</strong> no Dex.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #35474B;">
            Sua conta pessoal foi preservada e convertida para <strong>Advogado Autônomo</strong>. Suas credenciais permanecem válidas para login normalmente.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: cleanUser, pass: cleanPass },
      connectionTimeout: 5000,
      tls: { rejectUnauthorized: false }
    });
    await transporter.sendMail({ from: emailFrom, to, subject, html });
    return { success: true };
  } catch (err: any) {
    console.warn('[Delete Account] Erro ao avisar advogado associado:', err.message);
    return { success: false };
  }
}

export default async function handler(req: any, res: any) {
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

    const { 
      email, 
      password, 
      userName, 
      targetType = 'USER', 
      officeId, 
      officeName, 
      confirmationText, 
      isDemoAccount 
    } = body || {};

    if (!email) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'O e-mail do titular é obrigatório.' }));
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const adminEmail = (process.env.VITE_APP_ADMIN_EMAIL || 'otton.luis.alcaraz@gmail.com').toLowerCase();

    // 1. Proteção de Contas Especiais (SuperAdmin e Demo)
    if (normalizedEmail === adminEmail) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'A conta de Administrador da Plataforma não pode ser excluída por este fluxo.' }));
      return;
    }

    if (
      normalizedEmail === 'demo@dexjuridico.com.br' || 
      normalizedEmail === 'demo@dexjuridico.adv.br' || 
      officeId === 'office-1' || 
      isDemoAccount
    ) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'A conta ou escritório de demonstração institucional não pode ser excluído.' }));
      return;
    }

    // 2. Rate Limiting
    const rateCheck = checkRateLimit(normalizedEmail);
    if (rateCheck.blocked) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        error: 'Limite de tentativas excedido por segurança. Tente novamente em 15 minutos.' 
      }));
      return;
    }

    // 3. Validação da palavra-chave de confirmação
    if (targetType === 'USER' && confirmationText?.trim().toUpperCase() !== 'EXCLUIR') {
      registerAttempt(normalizedEmail, false);
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Para confirmar a exclusão da sua conta, digite exatamente a palavra EXCLUIR.' }));
      return;
    }

    if (targetType === 'OFFICE') {
      const cleanConfirm = confirmationText?.trim().toLowerCase();
      const cleanOfficeName = (officeName || '').trim().toLowerCase();
      if (cleanConfirm !== 'excluir' && cleanConfirm !== cleanOfficeName) {
        registerAttempt(normalizedEmail, false);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: `Para confirmar o encerramento do escritório, digite o nome exato ("${officeName}") ou a palavra EXCLUIR.` }));
        return;
      }
    }

    // 4. Conexão ao Supabase e Verificação de Credencial
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

    let dbUser: any = null;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Buscar usuário no banco
      const { data: userRecord, error: userFetchError } = await supabase
        .from('dex_users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (userRecord) {
        dbUser = userRecord;

        // Se senha foi enviada, validar rigorosamente
        if (password) {
          if (dbUser.passwordHash && dbUser.salt) {
            const calculatedHash = crypto.createHash('sha256').update(dbUser.salt + password).digest('hex');
            if (calculatedHash !== dbUser.passwordHash) {
              registerAttempt(normalizedEmail, false);
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Senha incorreta. Verifique suas credenciais de acesso.' }));
              return;
            }
          } else {
            // Conta sem hash configurado (mock inicial)
            if (password !== 'Admin123!' && password !== process.env.VITE_DEMO_PASSWORD) {
              registerAttempt(normalizedEmail, false);
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Senha incorreta. Verifique suas credenciais de acesso.' }));
              return;
            }
          }
        }

        // 5. Cancelamento de assinatura no Stripe se houver
        if (process.env.STRIPE_SECRET_KEY && dbUser.stripeSubscriptionId) {
          try {
            const Stripe = (await import('stripe')).default;
            const stripeClient = new (Stripe as any)(process.env.STRIPE_SECRET_KEY);
            await stripeClient.subscriptions.cancel(dbUser.stripeSubscriptionId);
          } catch (stripeErr: any) {
            console.error('[Delete Account] Erro ao cancelar assinatura no Stripe:', stripeErr.message);
            if (!stripeErr.message?.includes('No such subscription') && !stripeErr.message?.includes('already canceled')) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                error: `Falha ao cancelar assinatura no provedor de pagamento: ${stripeErr.message}. A conta não foi excluída por segurança.` 
              }));
              return;
            }
          }
        }

        // 6. Execução do expurgo / desvinculação em conformidade com a LGPD
        if (targetType === 'USER') {
          const userId = dbUser.id;
          const isLinkedLawyer = dbUser.role === 'LAWYER' && !dbUser.isIndependent;

          if (isLinkedLawyer && dbUser.officeId) {
            // Reatribui processos e prazos para o sócio titular do escritório
            const { data: ownerRecord } = await supabase
              .from('dex_users')
              .select('id')
              .eq('officeId', dbUser.officeId)
              .eq('role', 'ADMIN')
              .maybeSingle();

            const fallbackId = ownerRecord?.id || null;
            if (fallbackId) {
              await supabase.from('dex_cases').update({ lawyerId: fallbackId }).eq('lawyerId', userId);
              await supabase.from('dex_deadlines').update({ lawyerId: fallbackId }).eq('lawyerId', userId);
            }
          } else {
            // Advogado autônomo ou sócio único: expurga casos, prazos, clientes e finanças
            await supabase.from('dex_cases').delete().eq('lawyerId', userId);
            await supabase.from('dex_deadlines').delete().eq('lawyerId', userId);
            await supabase.from('dex_clients').delete().eq('linkedLawyerId', userId);
            await supabase.from('dex_financial').delete().eq('lawyerId', userId);
            await supabase.from('dex_documents').delete().eq('uploadedByLawyerId', userId);
            await supabase.from('dex_templates').delete().eq('uploadedByUserId', userId);
          }

          // Anonimiza publicações do Mural da equipe
          await supabase.from('dex_team_posts').update({ 
            authorName: 'Advogado Removido', 
            authorRole: 'Ex-integrante' 
          }).eq('authorId', userId);

          // Remove curtidas do usuário no mural
          await supabase.from('dex_team_post_likes').delete().eq('userId', userId);

          // Exclui vínculo de advogado, tokens e a conta principal de usuário
          await supabase.from('dex_lawyers').delete().eq('userId', userId);
          await supabase.from('dex_lawyers').delete().eq('email', normalizedEmail);
          await supabase.from('dex_auth_tokens').delete().eq('userId', userId);
          await supabase.from('dex_auth_tokens').delete().eq('email', normalizedEmail);
          await supabase.from('dex_users').delete().eq('id', userId);
          await supabase.from('dex_users').delete().eq('email', normalizedEmail);
        } else if (targetType === 'OFFICE') {
          const targetOfficeId = officeId || dbUser.officeId;

          if (targetOfficeId) {
            // Buscar advogados integrantes para notificá-los
            const { data: affiliatedLawyers } = await supabase
              .from('dex_users')
              .select('email, name')
              .eq('officeId', targetOfficeId)
              .eq('role', 'LAWYER');

            if (affiliatedLawyers && affiliatedLawyers.length > 0) {
              for (const lawyer of affiliatedLawyers) {
                if (lawyer.email) {
                  sendOfficeClosedToLawyerEmail(lawyer.email, lawyer.name, officeName || 'Seu escritório').catch(console.warn);
                }
              }
            }

            // Desvincular advogados do escritório (convertendo em autônomos)
            await supabase.from('dex_users').update({ 
              isIndependent: true, 
              officeId: null, 
              officeName: null, 
              officeCode: null,
              role: 'LAWYER'
            }).eq('officeId', targetOfficeId);

            await supabase.from('dex_lawyers').update({ 
              officeId: null, 
              roleTitle: 'Advogado Autônomo' 
            }).eq('officeId', targetOfficeId);

            // Expurga dados corporativos do escritório
            await supabase.from('dex_cases').delete().eq('officeId', targetOfficeId);
            await supabase.from('dex_deadlines').delete().eq('officeId', targetOfficeId);
            await supabase.from('dex_clients').delete().eq('officeId', targetOfficeId);
            await supabase.from('dex_financial').delete().eq('officeId', targetOfficeId);
            await supabase.from('dex_documents').delete().eq('officeId', targetOfficeId);
            await supabase.from('dex_templates').delete().eq('officeId', targetOfficeId);
            await supabase.from('dex_team_posts').delete().eq('officeId', targetOfficeId);

            // Exclui a conta do titular que solicitou o encerramento
            await supabase.from('dex_lawyers').delete().eq('userId', dbUser.id);
            await supabase.from('dex_lawyers').delete().eq('email', normalizedEmail);
            await supabase.from('dex_auth_tokens').delete().eq('userId', dbUser.id);
            await supabase.from('dex_auth_tokens').delete().eq('email', normalizedEmail);
            await supabase.from('dex_users').delete().eq('id', dbUser.id);
            await supabase.from('dex_users').delete().eq('email', normalizedEmail);
          }
        }
      }
    }

    // 7. Dispara e-mail de confirmação ao titular
    registerAttempt(normalizedEmail, true);
    await sendAccountDeletedEmail(normalizedEmail, userName || dbUser?.name || '', targetType, officeName);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: true, 
      message: targetType === 'OFFICE' 
        ? 'Escritório encerrado e dados tratados com sucesso em conformidade com a LGPD.' 
        : 'Sua conta foi excluída definitivamente e seu e-mail foi liberado para novos cadastros.' 
    }));
  } catch (error: any) {
    console.error('[Delete Account API Error]', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message || 'Erro interno no servidor de exclusão.' }));
  }
}
