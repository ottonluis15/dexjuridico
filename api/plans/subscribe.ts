import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

// Vercel Serverless Function: Assinatura ou Alteração de Plano (Simulada / Sandboxed)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuração CORS segura
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const { 
      planId, 
      planName, 
      period = 'MONTHLY', 
      amount = 0, 
      user,
      cardHolder,
      lastDigits 
    } = req.body || {};

    if (!planId || !user || !user.email) {
      return res.status(400).json({ error: 'Parâmetros incompletos para processar a assinatura.' });
    }

    // Regra de Autorização RBAC:
    // Apenas Administradores/Sócios ou Advogados Autônomos podem alterar planos.
    if (user.role === 'LAWYER' && !user.isIndependent) {
      return res.status(403).json({ 
        error: 'Acesso negado. Apenas o sócio administrador do escritório possui permissão para alterar o plano.' 
      });
    }

    // A conta de demonstração não pode alterar planos
    if (user.isDemo) {
      return res.status(403).json({ 
        error: 'A conta de demonstração não permite alterações no plano de assinatura.' 
      });
    }

    const txId = `tx_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const endDate = new Date(now);
    if (period === 'YEARLY') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setDate(endDate.getDate() + 30);
    }

    // Disparar e-mail transacional de confirmação de assinatura via sendEmail
    const periodLabel = period === 'YEARLY' ? 'Anual' : 'Mensal';
    const formattedAmount = Number(amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formattedRenewal = endDate.toLocaleDateString('pt-BR');

    try {
      const rawUser = process.env.SMTP_USER || process.env.EMAIL_USER || '';
      const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';
      const cleanUser = rawUser.trim().replace(/^["']|["']$/g, '');
      const cleanPass = rawPass.trim().replace(/\s+/g, '').replace(/^["']|["']$/g, '');

      if (cleanUser && cleanPass) {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user: cleanUser, pass: cleanPass },
          connectionTimeout: 5000,
          tls: { rejectUnauthorized: false }
        });

        await transporter.sendMail({
          from: process.env.EMAIL_FROM || `Dex Jurídico <${cleanUser}>`,
          to: user.email,
          subject: `Confirmação de Assinatura — Plano ${planName || planId} [Dex]`,
          html: `
            <div style="background-color: #F9ECE2; border-radius: 8px; padding: 24px; border: 1px solid #D8C3B5; margin: 20px 0; font-family: Georgia, serif;">
              <p style="margin: 0 0 14px; font-size: 17px; font-weight: bold; color: #0F2733;">
                Olá, ${user.name || 'Doutor(a)'}!
              </p>
              <p style="margin: 0 0 16px; color: #162B37; line-height: 1.6;">
                Sua assinatura do plano <strong>${planName || planId}</strong> foi ativada com sucesso no sistema Dex.
              </p>
            </div>`
        });
      }
    } catch (emailErr) {
      console.warn('[Dex Plans API] Falha no disparo do e-mail de confirmação de assinatura:', emailErr);
    }

    return res.status(200).json({
      success: true,
      message: `Plano ${planName || planId} ativado com sucesso!`,
      subscription: {
        id: txId,
        planId,
        period,
        status: 'ACTIVE',
        amount,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        paymentMethod: 'MOCK_CARD'
      }
    });
  } catch (error: any) {
    console.error('[Dex Plans API] Erro ao processar assinatura:', error);
    return res.status(500).json({ error: 'Erro interno ao processar a assinatura.' });
  }
}

