// Infraestrutura Unificada de E-mail Transacional — Dex Gestão Jurídica Inteligente
// Projetado para ambiente Serverless Vercel (Node.js runtime)
// Provedor principal: Resend (REST API direta via fetch, zero-dependency, ultra-rápido)
// Em desenvolvimento ou sem RESEND_API_KEY configurada: simula o envio e imprime o link no console do servidor.

import nodemailer from 'nodemailer';

export interface EmailActionLink {
  label: string;
  url: string;
}

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  headline?: string;
  recipientName?: string;
  paragraphs?: string[];
  actionLink?: EmailActionLink;
  subtext?: string;
  securityNotice?: string;
  html?: string;
  text?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Monta o layout HTML do e-mail respeitando o Design System do Dex:
 * - Paleta oficial: Fundo creme (#F9ECE2), Card (#FFFFFF / #FAF5F0), Detalhes em Coral (#F4665C) e Teal (#4A808E), Botão (#0F2733)
 * - Tipografia serifada elegante com fallback seguro para e-mails (Georgia, Garamond, serif)
 * - 100% responsivo e com estilos inline para máxima compatibilidade com Outlook, Gmail, Apple Mail
 */
export function buildDexEmailHtml(payload: SendEmailPayload): string {
  if (payload.html) {
    return payload.html;
  }

  const {
    headline = 'Notificação Dex',
    recipientName,
    paragraphs = [],
    actionLink,
    subtext,
    securityNotice
  } = payload;

  const greeting = recipientName ? `Olá, ${escapeHtml(recipientName)}.` : 'Olá.';

  const paragraphsHtml = paragraphs
    .map(
      (p) =>
        `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #35474B; font-family: 'Georgia', serif;">${escapeHtml(
          p
        )}</p>`
    )
    .join('');

  const actionButtonHtml = actionLink
    ? `
      <div style="text-align: center; margin: 32px 0 24px;">
        <a href="${actionLink.url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #0F2733; color: #FFFFFF; font-family: 'Georgia', serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(15, 39, 51, 0.25); text-align: center;">
          ${escapeHtml(actionLink.label)}
        </a>
        <p style="margin: 14px 0 0; font-size: 12px; color: #8F8A87; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Se o botão não funcionar, copie e cole este link no seu navegador:<br/>
          <a href="${actionLink.url}" style="color: #4A808E; text-decoration: underline; word-break: break-all;">${actionLink.url}</a>
        </p>
      </div>`
    : '';

  const subtextHtml = subtext
    ? `<div style="padding: 14px; background-color: #F9ECE2; border-radius: 10px; margin: 20px 0; border: 1px solid #EAE0DA; font-size: 13px; color: #6D6865; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${escapeHtml(subtext)}
      </div>`
    : '';

  const securityNoticeHtml = securityNotice
    ? `<p style="margin: 24px 0 0; font-size: 12px; color: #8F8A87; border-top: 1px solid #EAE0DA; padding-top: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <strong>Nota de segurança:</strong> ${escapeHtml(securityNotice)}
      </p>`
    : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(payload.subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9ECE2; font-family: 'Georgia', Cambria, serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9ECE2; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Container Principal -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 39, 51, 0.08); border: 1px solid #EAE0DA;">
          
          <!-- Topo com Marca Dex -->
          <tr>
            <td style="padding: 32px 36px 20px; background-color: #FAF5F0; border-bottom: 2px solid #F0CBAE; text-align: center;">
              <!-- Ícone da Balança em SVG Seguro -->
              <div style="display: inline-block; vertical-align: middle; margin-right: 8px;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0F2733" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
                  <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                  <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                  <path d="M7 21h10"/>
                  <path d="M12 3v18"/>
                  <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
                </svg>
              </div>
              <span style="font-family: 'Georgia', serif; font-size: 26px; font-weight: bold; color: #0F2733; vertical-align: middle; letter-spacing: -0.5px;">Dex</span>
              <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #8F8A87; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Gestão Jurídica Inteligente</p>
              
              <!-- Barras decorativas Coral e Teal -->
              <div style="margin: 12px auto 0; width: 64px; text-align: center;">
                <div style="height: 3px; background-color: #F4665C; border-radius: 2px; margin-bottom: 2px;"></div>
                <div style="height: 3px; background-color: #4A808E; border-radius: 2px; width: 44px; margin: 0 auto;"></div>
              </div>
            </td>
          </tr>

          <!-- Corpo do Conteúdo -->
          <tr>
            <td style="padding: 36px 36px 28px; text-align: left;">
              <h1 style="margin: 0 0 18px; font-family: 'Georgia', serif; font-size: 22px; font-weight: bold; color: #0F2733; line-height: 1.3;">
                ${escapeHtml(headline)}
              </h1>
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #35474B; font-weight: 600;">
                ${greeting}
              </p>
              ${paragraphsHtml}
              ${actionButtonHtml}
              ${subtextHtml}
              ${securityNoticeHtml}
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="padding: 24px 36px 32px; background-color: #FAF5F0; border-top: 1px solid #EAE0DA; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 12px; color: #8F8A87; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Dex — Sistema de Advocacia e Gestão Jurídica com IA
              </p>
              <p style="margin: 0; font-size: 11px; color: #A8A29E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Este é um e-mail transacional automático. Por favor, não responda a esta mensagem.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Converte o payload em versão texto puro para clientes sem suporte a HTML
 */
export function buildDexEmailText(payload: SendEmailPayload): string {
  if (payload.text) {
    return payload.text;
  }

  const parts: string[] = [
    `DEX — GESTÃO JURÍDICA INTELIGENTE`,
    `----------------------------------------`,
    payload.headline || 'Notificação Dex',
    ``,
    payload.recipientName ? `Olá, ${payload.recipientName}.` : `Olá.`,
    ``,
    ...(payload.paragraphs || []),
    ``
  ];

  if (payload.actionLink) {
    parts.push(`Para prosseguir, acesse o link abaixo:`);
    parts.push(payload.actionLink.url);
    parts.push(``);
  }

  if (payload.subtext) {
    parts.push(`Aviso: ${payload.subtext}`);
    parts.push(``);
  }

  if (payload.securityNotice) {
    parts.push(`Nota de segurança: ${payload.securityNotice}`);
    parts.push(``);
  }

  parts.push(`----------------------------------------`);
  parts.push(`Dex Sistema de Advocacia — Não responda a este e-mail.`);

  return parts.join('\n');
}

/**
 * Envia o e-mail via SMTP (Gmail, Outlook etc.), Resend API ou simula em desenvolvimento
 */
export async function sendEmail(payload: SendEmailPayload): Promise<EmailSendResult> {
  const fromEmail = process.env.EMAIL_FROM || 'Dex Jurídico <confirm.dex@gmail.com>';
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];
  const htmlContent = buildDexEmailHtml(payload);
  const textContent = buildDexEmailText(payload);

  // 1. PRIORIDADE: ENVIO VIA SMTP (Gmail, Outlook etc. - ideal para domínio público sem taxas)
  const smtpHost = process.env.SMTP_HOST;
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

  // Limpeza de segurança: remove espaços do código do Google (ex: 'abcd efgh ijkl mnop' -> 'abcdefghijklmnop') e aspas
  const cleanUser = rawUser.trim().replace(/^["']|["']$/g, '');
  const cleanPass = rawPass.trim().replace(/\s+/g, '').replace(/^["']|["']$/g, '');

  if (cleanUser && cleanPass) {
    const isGmail = !smtpHost || smtpHost.includes('gmail') || cleanUser.endsWith('@gmail.com');
    const configuredPort = Number(process.env.SMTP_PORT) || 465;
    const effectiveFrom = process.env.EMAIL_FROM || `Dex Jurídico <${cleanUser}>`;

    // Função auxiliar de criação de transporte com timeouts seguros para ambiente serverless
    const makeTransporter = (port: number, secure: boolean) => {
      return nodemailer.createTransport({
        host: isGmail ? 'smtp.gmail.com' : (smtpHost || 'smtp.gmail.com'),
        port,
        secure,
        auth: {
          user: cleanUser,
          pass: cleanPass
        },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
        tls: {
          rejectUnauthorized: false
        }
      });
    };

    try {
      let transporter = makeTransporter(configuredPort, configuredPort === 465);
      let info;

      try {
        info = await transporter.sendMail({
          from: effectiveFrom,
          to: recipients.join(', '),
          subject: payload.subject,
          html: htmlContent,
          text: textContent
        });
      } catch (firstError: any) {
        // Se a tentativa na porta 465 falhou por timeout ou rede, tenta automaticamente na porta 587 (STARTTLS)
        const isNetworkErr = firstError.code === 'ETIMEDOUT' || firstError.code === 'ECONNREFUSED' || firstError.code === 'ESOCKET' || firstError.code === 'ENOTFOUND';
        if (configuredPort === 465 && isNetworkErr) {
          console.warn('[DEX EMAIL - SMTP] Tentativa na porta 465 falhou por rede. Tentando fallback na porta 587 (STARTTLS)...');
          transporter = makeTransporter(587, false);
          info = await transporter.sendMail({
            from: effectiveFrom,
            to: recipients.join(', '),
            subject: payload.subject,
            html: htmlContent,
            text: textContent
          });
        } else {
          throw firstError;
        }
      }

      console.log(`[DEX EMAIL - SMTP] Enviado com sucesso para ${recipients.join(', ')} | ID: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        simulated: false
      };
    } catch (smtpError: any) {
      console.error('[DEX EMAIL - SMTP] Erro detalhado ao enviar via SMTP:', smtpError?.code, smtpError?.response || smtpError?.message || smtpError);
      
      let friendlyError = smtpError?.message || 'Erro ao conectar ao provedor SMTP.';
      if (smtpError?.code === 'EAUTH' || (smtpError?.response && smtpError.response.includes('535'))) {
        friendlyError = 'Falha de autenticação no Google (535): Senha de App incorreta ou revogada. Verifique se o 2FA está ativo no confirm.dex@gmail.com e gere uma nova Senha de App de 16 caracteres.';
      } else if (smtpError?.code === 'ETIMEDOUT') {
        friendlyError = 'Tempo limite de conexão esgotado ao conectar ao servidor SMTP do Google (porta 465/587).';
      }

      return {
        success: false,
        error: `Falha no envio via SMTP (${smtpError?.code || 'AUTH_ERROR'}): ${friendlyError}`
      };
    }
  }

  // 2. SEGUNDA OPÇÃO: RESEND REST API (se RESEND_API_KEY estiver configurado)
  const resendApiKey = process.env.RESEND_API_KEY || '';

  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: recipients,
          subject: payload.subject,
          html: htmlContent,
          text: textContent
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[DEX EMAIL - Resend] Erro ao enviar e-mail:', response.status, errText);
        return {
          success: false,
          error: 'Falha no envio do e-mail pelo provedor Resend.'
        };
      }

      const data: any = await response.json();
      return {
        success: true,
        messageId: data?.id,
        simulated: false
      };
    } catch (error: any) {
      console.error('[DEX EMAIL - Resend] Erro inesperado:', error?.message || error);
      return {
        success: false,
        error: 'Erro de comunicação ao disparar e-mail via Resend.'
      };
    }
  }

  // 3. MODO DESENVOLVIMENTO OU SEM PROVEDOR CONFIGURADO (SIMULAÇÃO)
  console.log('\n================== [DEX EMAIL SIMULADO] ==================');
  console.log(`Para: ${recipients.join(', ')}`);
  console.log(`Remetente: ${fromEmail}`);
  console.log(`Assunto: ${payload.subject}`);
  console.log(`Título: ${payload.headline}`);
  if (payload.actionLink) {
    console.log(`LINK DE AÇÃO: ${payload.actionLink.url}`);
  }
  console.log('----------------------------------------------------------');
  console.log(textContent);
  console.log('==========================================================\n');

  if (isProduction) {
    console.warn('[DEX EMAIL] AVISO: Nem SMTP (SMTP_USER / SMTP_PASS) nem RESEND_API_KEY estão configurados no ambiente da Vercel!');
  }

  return {
    success: true,
    simulated: true,
    messageId: `sim_${Date.now()}`
  };
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

