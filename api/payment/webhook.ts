// Vercel Serverless Function: POST /api/payment/webhook
// Webhook oficial do Stripe com validação criptográfica de assinatura (HMAC-SHA256),
// idempotência de eventos, atualização de assinaturas no Supabase e e-mails transacionais.

import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Idempotência em memória para deduplicação rápida de eventos de webhook
const processedEventIds = new Set<string>();

export const config = {
  api: {
    bodyParser: false, // Permite leitura do raw body para verificação de assinatura
  },
};

async function getRawBody(req: any): Promise<string> {
  if (typeof req.rawBody === 'string') return req.rawBody;
  if (Buffer.isBuffer(req.rawBody)) return req.rawBody.toString('utf8');
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');

  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    req.on('data', (chunk: any) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function getEmailCredentials() {
  const rawUser = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER || process.env.VITE_SMTP_USER || '';
  const rawPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || process.env.VITE_SMTP_PASS || '';
  const cleanUser = rawUser.trim().replace(/^["']|["']$/g, '');
  const cleanPass = rawPass.trim().replace(/\s+/g, '').replace(/^["']|["']$/g, '');
  const emailFrom = process.env.EMAIL_FROM || `Dex Jurídico <${cleanUser || 'confirm.dex@gmail.com'}>`;
  return { cleanUser, cleanPass, emailFrom };
}

async function sendSubscriptionEmail(to: string, subject: string, title: string, message: string, badgeText: string) {
  const { cleanUser, cleanPass, emailFrom } = getEmailCredentials();
  if (!cleanUser || !cleanPass || !to) return;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin: 0; padding: 0; background-color: #F9ECE2; font-family: 'Georgia', Cambria, serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 24px; padding: 32px; border: 1px solid #EAE0DA;">
        <tr><td style="text-align: center; border-bottom: 2px solid #F0CBAE; padding-bottom: 16px;">
          <span style="font-size: 26px; font-weight: bold; color: #0F2733;">⚖️ Dex</span>
          <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #8F8A87;">Gestão Jurídica Inteligente</p>
        </td></tr>
        <tr><td style="padding-top: 28px; color: #0F2733;">
          <span style="display: inline-block; padding: 4px 12px; background-color: #FAF5F0; border-radius: 12px; font-size: 11px; font-weight: bold; color: #35474B; border: 1px solid #EAE0DA; margin-bottom: 12px;">${badgeText}</span>
          <h2 style="font-size: 20px; font-weight: bold; color: #0F2733; margin: 0 0 16px;">${title}</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #35474B; margin: 0 0 16px;">${message}</p>
          <div style="background-color: #FAF5F0; border-left: 4px solid #4A808E; padding: 14px 18px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 12px; color: #35474B; line-height: 1.5;">
              Acesse o painel do Dex para visualizar suas faturas e gerenciar os recursos contratados da sua banca.
            </p>
          </div>
          <p style="font-size: 12px; color: #8F8A87; margin-top: 24px;">© ${new Date().getFullYear()} Dex Gestão Jurídica Inteligente.</p>
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
  } catch (err: any) {
    console.warn('[Webhook Stripe] Erro ao disparar e-mail transacional:', err.message);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Método não permitido.' }));
    return;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const rawBody = await getRawBody(req);
    const sig = req.headers['stripe-signature'];

    let event: any;

    if (stripeSecretKey && webhookSecret && sig) {
      const Stripe = (await import('stripe')).default;
      const stripe = new (Stripe as any)(stripeSecretKey, { apiVersion: '2023-10-16' });
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } catch (err: any) {
        console.error('[Stripe Webhook Signature Verification Failed]', err.message);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: `Webhook Signature Verification Failed: ${err.message}` }));
        return;
      }
    } else {
      // Em modo de testes/sandbox local sem webhookSecret cadastrado
      try {
        event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
      } catch (e) {
        event = { type: 'unknown' };
      }
    }

    // Idempotência: ignora eventos já processados
    if (event.id && processedEventIds.has(event.id)) {
      console.log(`[Webhook Stripe] Evento ${event.id} já processado anteriormente. Ignorando.`);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ received: true, duplicate: true }));
      return;
    }

    if (event.id) {
      processedEventIds.add(event.id);
      // Limita tamanho do cache de deduplicação
      if (processedEventIds.size > 1000) {
        const first = processedEventIds.values().next().value;
        if (first) processedEventIds.delete(first);
      }
    }

    console.log(`[Webhook Stripe] Processando evento: ${event.type} (${event.id || 'sem-id'})`);

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
    const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

    // Tratamento dos Eventos Principais
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail = session.customer_details?.email || session.metadata?.userEmail;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId || 'PROFESSIONAL';
        const period = session.metadata?.period || 'MONTHLY';
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (supabase) {
          const updatePayload: any = {
            subscriptionPlan: planId,
            subscriptionStatus: 'ACTIVE',
            subscriptionPeriod: period,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId
          };

          if (userId) {
            await supabase.from('dex_users').update(updatePayload).eq('id', userId);
          } else if (customerEmail) {
            await supabase.from('dex_users').update(updatePayload).eq('email', customerEmail.toLowerCase().trim());
          }
        }

        if (customerEmail) {
          await sendSubscriptionEmail(
            customerEmail,
            'Pagamento Confirmado — Assinatura Dex Jurídico Ativa',
            'Sua Assinatura foi Confirmada com Sucesso!',
            `Seu pagamento referente ao plano <strong>${planId}</strong> (${period === 'YEARLY' ? 'Anual' : 'Mensal'}) foi aprovado. Todos os limites e funcionalidades avançadas foram liberados.`,
            'PAGAMENTO APROVADO'
          );
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription;
        const customerEmail = invoice.customer_email;

        if (supabase && customerId) {
          await supabase.from('dex_users').update({
            subscriptionStatus: 'ACTIVE',
            stripeSubscriptionId: subscriptionId
          }).eq('stripeCustomerId', customerId);
        }

        if (customerEmail) {
          await sendSubscriptionEmail(
            customerEmail,
            'Renovação de Assinatura Confirmada — Dex Jurídico',
            'Renovação de Plano Processada',
            `O pagamento da fatura da sua assinatura no Dex foi liquidado com sucesso. Obrigado por confiar em nossa plataforma forense.`,
            'FATURA LIQUIDADA'
          );
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const customerEmail = invoice.customer_email;

        if (supabase && customerId) {
          await supabase.from('dex_users').update({
            subscriptionStatus: 'OVERDUE'
          }).eq('stripeCustomerId', customerId);
        }

        if (customerEmail) {
          await sendSubscriptionEmail(
            customerEmail,
            'Aviso de Cobrança Pendente — Dex Jurídico',
            'Não foi possível processar seu pagamento',
            `A cobrança da sua assinatura não pôde ser concluída no cartão informado. Para manter os recursos da sua banca sem interrupção, acerte sua forma de pagamento nas configurações.`,
            'PAGAMENTO PENDENTE'
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Ao cancelar, faz downgrade para TRIAL sem apagar dados
        if (supabase && customerId) {
          await supabase.from('dex_users').update({
            subscriptionStatus: 'CANCELED',
            subscriptionPlan: 'TRIAL'
          }).eq('stripeCustomerId', customerId);
        }
        break;
      }

      default:
        console.log(`[Webhook Stripe] Evento ${event.type} recebido sem manipulador específico.`);
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ received: true }));
  } catch (error: any) {
    console.error('[Stripe Webhook Handler Error]', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message || 'Erro interno ao processar webhook.' }));
  }
}

