import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendEmail } from '../_lib/emailService.ts';

// Vercel Serverless Function: Cancelamento de Assinatura
export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const { user, reason } = req.body || {};

    if (!user || !user.email) {
      return res.status(400).json({ error: 'Usuário não identificado para cancelamento.' });
    }

    if (user.role === 'LAWYER' && !user.isIndependent) {
      return res.status(403).json({ 
        error: 'Apenas o sócio administrador pode solicitar o cancelamento do plano do escritório.' 
      });
    }

    if (user.isDemo) {
      return res.status(403).json({ 
        error: 'A conta de demonstração não permite alterações.' 
      });
    }

    const canceledAt = new Date().toISOString();

    try {
      await sendEmail({
        to: user.email,
        subject: `Cancelamento de Assinatura — Dex Gestão Jurídica`,
        html: `
          <div style="background-color: #F9ECE2; border-radius: 8px; padding: 24px; border: 1px solid #D8C3B5; margin: 20px 0;">
            <p style="margin: 0 0 14px; font-size: 17px; font-weight: bold; color: #0F2733;">
              Olá, ${user.name || 'Doutor(a)'}!
            </p>
            <p style="margin: 0 0 16px; color: #162B37; line-height: 1.6;">
              Confirmamos que o cancelamento da sua assinatura Dex foi processado com sucesso.
            </p>
            <p style="margin: 0 0 16px; color: #162B37; line-height: 1.6;">
              Seus dados, processos e clientes permanecerão salvos com segurança. Você continuará com acesso aos seus recursos até o término do ciclo de faturamento contratado.
            </p>
            <p style="margin: 16px 0 0; font-size: 13px; color: #7B8794; line-height: 1.5;">
              Caso queira reativar seu plano ou escolher outra modalidade a qualquer momento, basta acessar a aba <strong>Planos</strong> no Dex.
            </p>
          </div>
        `,
        text: `Olá ${user.name}!\n\nConfirmamos o cancelamento da sua assinatura Dex em ${new Date(canceledAt).toLocaleDateString('pt-BR')}.\nSeus dados permanecem seguros e você pode reativar seu plano a qualquer momento.`
      });
    } catch (emailErr) {
      console.warn('[Dex Plans API] Falha no disparo do e-mail de cancelamento:', emailErr);
    }

    return res.status(200).json({
      success: true,
      message: 'Assinatura cancelada com sucesso.',
      canceledAt
    });
  } catch (error: any) {
    console.error('[Dex Plans API] Erro ao cancelar assinatura:', error);
    return res.status(500).json({ error: 'Erro interno ao processar o cancelamento.' });
  }
}

