// Vercel Serverless Function: GET/POST /api/auth/test-email
// Endpoint de diagnóstico para verificar conexão SMTP com Gmail e variáveis de ambiente

import nodemailer from 'nodemailer';
import { sendEmail } from '../_lib/emailService';

export default async function handler(req: any, res: any) {
  try {
    const rawUser = process.env.SMTP_USER || process.env.EMAIL_USER || '';
    const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';
    const cleanUser = rawUser.trim().replace(/^["']|["']$/g, '');
    const cleanPass = rawPass.trim().replace(/\s+/g, '').replace(/^["']|["']$/g, '');
    const resendKey = process.env.RESEND_API_KEY ? 'Presente' : 'Ausente';
    const emailFrom = process.env.EMAIL_FROM || 'Padrão (confirm.dex@gmail.com)';

    // Mascarar dados para exibição segura
    const maskedUser = cleanUser ? `${cleanUser.substring(0, 3)}***@${cleanUser.split('@')[1] || 'gmail.com'}` : 'Não configurado';

    const diagnostic = {
      smtp_configured: !!(cleanUser && cleanPass),
      smtp_user_set: !!cleanUser,
      smtp_user_preview: maskedUser,
      smtp_pass_set: !!cleanPass,
      smtp_pass_length: cleanPass.length,
      resend_status: resendKey,
      email_from: emailFrom,
      timestamp: new Date().toISOString()
    };

    if (!cleanUser || !cleanPass) {
      return res.status(200).json({
        success: false,
        error: 'Variáveis SMTP_USER ou SMTP_PASS não foram encontradas no ambiente da Vercel. Certifique-se de adicioná-las em Vercel > Settings > Environment Variables e fazer um Redeploy.',
        diagnostic
      });
    }

    // Testa a conexão e autenticação direta com o servidor do Gmail
    const isGmail = cleanUser.endsWith('@gmail.com');
    const transporter = isGmail
      ? nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: cleanUser,
            pass: cleanPass
          }
        })
      : nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 587,
          secure: (Number(process.env.SMTP_PORT) || 587) === 465,
          auth: {
            user: cleanUser,
            pass: cleanPass
          }
        });

    // 1. Testa autenticação
    await transporter.verify();

    // 2. Se o usuário passou ?to=email@..., envia um e-mail de teste real
    const targetEmail = req.query?.to || req.body?.to;
    let sendResult = null;

    if (targetEmail) {
      sendResult = await sendEmail({
        to: targetEmail,
        subject: 'Teste de Conexão de E-mail — Dex Jurídico',
        headline: 'Serviço de E-mail Conectado!',
        paragraphs: [
          'Este é um e-mail de teste confirmando que a sua integração SMTP com o Gmail foi configurada com absoluto sucesso.',
          'A partir de agora, confirmações de cadastro e redefinições de senha serão enviadas normalmente para os seus usuários.'
        ],
        subtext: 'Diagnóstico do sistema Dex Jurídico.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Conexão SMTP com o Gmail verificada e autenticada com sucesso!',
      diagnostic,
      emailSent: targetEmail ? sendResult : 'Para disparar um e-mail de teste agora, acesse esta mesma URL passando ?to=seu_email@dominio.com'
    });
  } catch (error: any) {
    console.error('[API Test Email] Erro:', error);
    return res.status(200).json({
      success: false,
      error: error?.message || 'Falha ao autenticar com o Gmail.',
      errorCode: error?.code,
      errorResponse: error?.response,
      dica: error?.code === 'EAUTH' 
        ? 'Erro de autenticação (EAUTH): A senha de app de 16 caracteres informada no SMTP_PASS está incorreta ou o Gmail bloqueou. Verifique se copiou a senha de app de 16 letras corretamente sem caracteres extras.'
        : 'Verifique se as credenciais e portas SMTP estão corretas.'
    });
  }
}

