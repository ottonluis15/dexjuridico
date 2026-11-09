// Vercel Serverless Function: POST /api/auth/send-verification
// Envia e-mail de confirmação de cadastro ou reenvio de confirmação

import { sendEmail } from '../_lib/emailService';
import { createTokenRecord, checkRateLimit } from '../_lib/tokenService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido.' });
  }

  try {
    const { email, name, userId, origin } = req.body || {};

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'E-mail não informado.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').toString().split(',')[0].trim();

    // Rate Limiting: Máximo de 4 reenvios por hora por IP/E-mail
    const rateCheck = checkRateLimit(`verify_${cleanEmail}_${clientIp}`, 4, 60);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: `Muitas tentativas de envio. Por favor, aguarde ${rateCheck.waitMinutes} minutos antes de solicitar novo e-mail.`
      });
    }

    // Cria token seguro de uso único (válido por 24 horas)
    const effectiveUserId = userId || `usr_${cleanEmail}`;
    const { rawToken } = await createTokenRecord({
      userId: effectiveUserId,
      email: cleanEmail,
      type: 'EMAIL_VERIFICATION',
      expiresInHours: 24,
      metadata: { name: name || 'Usuário' }
    });

    // Constrói a URL de confirmação
    const baseUrl = origin || process.env.APP_URL || (req.headers.host ? `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}` : 'http://localhost:5173');
    const confirmUrl = `${baseUrl}?verify_token=${rawToken}&email=${encodeURIComponent(cleanEmail)}`;

    // Dispara e-mail com template do Dex
    const emailResult = await sendEmail({
      to: cleanEmail,
      subject: 'Confirme seu e-mail — Dex Gestão Jurídica',
      headline: 'Confirmação de Acesso à sua Banca',
      recipientName: name || undefined,
      paragraphs: [
        'Seu cadastro no Dex — Gestão Jurídica Inteligente com IA está quase concluído.',
        'Para ativar sua conta e liberar o acesso com segurança à plataforma forense, clique no botão abaixo para confirmar seu endereço de e-mail.'
      ],
      actionLink: {
        label: 'Confirmar meu e-mail',
        url: confirmUrl
      },
      subtext: 'Este link é válido por 24 horas e pode ser utilizado apenas uma vez.',
      securityNotice: 'Se você não solicitou este cadastro no Dex, desconsidere esta mensagem. Nenhuma ação será realizada na sua conta.'
    });

    if (!emailResult.success) {
      console.error('[API Send Verification] Falha no envio do e-mail:', emailResult.error);
      return res.status(500).json({
        success: false,
        error: `Falha no envio do e-mail de confirmação: ${emailResult.error}`,
        actionUrl: process.env.NODE_ENV !== 'production' ? confirmUrl : undefined
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Se o e-mail for válido, enviamos as instruções de confirmação.',
      simulated: emailResult.simulated,
      actionUrl: process.env.NODE_ENV !== 'production' ? confirmUrl : undefined
    });
  } catch (error: any) {
    console.error('[API Send Verification] Erro:', error);
    return res.status(500).json({
      success: false,
      error: 'Ocorreu um erro interno ao processar a solicitação de envio.'
    });
  }
}

