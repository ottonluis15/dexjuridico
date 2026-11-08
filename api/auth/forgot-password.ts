// Vercel Serverless Function: POST /api/auth/forgot-password
// Solicitação de redefinição de senha com proteção contra enumeração de contas

import { sendEmail } from '../_lib/emailService';
import { createTokenRecord, checkRateLimit } from '../_lib/tokenService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido.' });
  }

  try {
    const { email, origin } = req.body || {};

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'E-mail não fornecido.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').toString().split(',')[0].trim();

    // Rate limiting: máximo de 5 solicitações por 30 minutos por IP/E-mail
    const rateCheck = checkRateLimit(`forgot_${cleanEmail}_${clientIp}`, 5, 30);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: `Muitas tentativas de recuperação. Por favor, aguarde ${rateCheck.waitMinutes} minutos.`
      });
    }

    // Não permitir redefinição na conta demo
    if (cleanEmail === 'demo@dexjuridico.adv.br') {
      return res.status(200).json({
        success: true,
        message: 'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha em instantes.'
      });
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
              return res.status(200).json({
                success: true,
                message: 'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha em instantes.'
              });
            }
            targetUserId = list[0].id;
            userName = list[0].name || userName;
          }
        }
      } catch (e) {
        console.warn('[API Forgot Password] Erro ao consultar Supabase:', e);
      }
    }

    // Cria token com validade de 45 minutos (apenas hash salvo no banco)
    const { rawToken } = await createTokenRecord({
      userId: targetUserId,
      email: cleanEmail,
      type: 'PASSWORD_RESET',
      expiresInHours: 0.75, // 45 minutos
      metadata: { name: userName }
    });

    const baseUrl = origin || process.env.APP_URL || (req.headers.host ? `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}` : 'http://localhost:5173');
    const resetUrl = `${baseUrl}?reset_token=${rawToken}&email=${encodeURIComponent(cleanEmail)}`;

    // Dispara o e-mail seguro
    const emailResult = await sendEmail({
      to: cleanEmail,
      subject: 'Redefinição de Senha — Dex Gestão Jurídica',
      headline: 'Recuperação de Acesso Forense',
      recipientName: userName,
      paragraphs: [
        'Recebemos uma solicitação para redefinir a senha de acesso da sua conta no Dex.',
        'Se foi você quem solicitou, clique no botão abaixo para definir sua nova credencial de segurança.'
      ],
      actionLink: {
        label: 'Redefinir minha senha',
        url: resetUrl
      },
      subtext: 'Por segurança, este link expira em 45 minutos e pode ser utilizado apenas uma única vez. Gerar um novo link invalida este anterior.',
      securityNotice: 'Se você não solicitou a alteração da sua senha, ignore este e-mail. Sua senha atual permanecerá inalterada e segura.'
    });

    // Resposta genérica padrão OWASP (nunca revela se o e-mail existe)
    return res.status(200).json({
      success: true,
      message: 'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha em instantes.',
      simulated: emailResult.simulated,
      actionUrl: process.env.NODE_ENV !== 'production' ? resetUrl : undefined
    });
  } catch (error: any) {
    console.error('[API Forgot Password] Erro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao processar recuperação de senha.'
    });
  }
}

