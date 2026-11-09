// Vercel Serverless Function: GET/POST /api/auth/test-email
// Endpoint de diagnóstico 100% autônomo (zero dependências relativas para evitar falhas de módulo no Vercel)
// Renderiza HTML amigável no navegador ou JSON quando chamado via API

import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  // Funções de resposta seguras e universais (compatíveis com Node puro e Vercel runtime)
  const sendHtml = (statusCode: number, html: string) => {
    try {
      res.statusCode = statusCode;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      if (typeof res.send === 'function') {
        return res.send(html);
      }
      return res.end(html);
    } catch {
      res.statusCode = statusCode;
      return res.end(html);
    }
  };

  const sendJson = (statusCode: number, data: any) => {
    try {
      res.statusCode = statusCode;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      if (typeof res.json === 'function') {
        return res.json(data);
      }
      return res.end(JSON.stringify(data));
    } catch {
      res.statusCode = statusCode;
      return res.end(JSON.stringify(data));
    }
  };

  const isHtmlRequest = req?.headers?.accept?.includes('text/html') && !req?.query?.json;

  try {
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
    const resendKey = process.env.RESEND_API_KEY ? 'Presente' : 'Ausente';
    const emailFrom = process.env.EMAIL_FROM || `Dex Jurídico <${cleanUser || 'confirm.dex@gmail.com'}>`;

    // Mascarar dados para exibição segura
    const maskedUser = cleanUser ? `${cleanUser.substring(0, 3)}***@${cleanUser.split('@')[1] || 'gmail.com'}` : 'NÃO CONFIGURADO';

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
      const missingVars = [];
      if (!cleanUser) missingVars.push('SMTP_USER');
      if (!cleanPass) missingVars.push('SMTP_PASS');

      if (isHtmlRequest) {
        return sendHtml(200, renderDiagnosticHtml({
          success: false,
          diagnostic,
          title: 'Variáveis de Ambiente Não Encontradas',
          description: `As variáveis <strong>${missingVars.join(' e ')}</strong> não foram detectadas no ambiente da Vercel.`,
          actionSteps: [
            'Acesse o dashboard da Vercel no projeto Dex Jurídico.',
            'Vá em <strong>Settings > Environment Variables</strong>.',
            'Adicione <code>SMTP_USER = confirm.dex@gmail.com</code> (marcando Production, Preview e Development).',
            'Adicione <code>SMTP_PASS = sua_senha_de_16_letras</code> (a Senha de App gerada no Google).',
            '<strong>IMPORTANTE:</strong> Vá na aba <strong>Deployments</strong>, clique nos 3 pontinhos do último deploy e clique em <strong>Redeploy</strong> para as variáveis entrarem em vigor.'
          ]
        }));
      }

      return sendJson(200, {
        success: false,
        error: `Variáveis ${missingVars.join(' e ')} não foram encontradas no ambiente da Vercel. Certifique-se de adicioná-las em Settings > Environment Variables e fazer um Redeploy.`,
        diagnostic
      });
    }

    // Testa a conexão e autenticação com timeout curto (4s) para evitar 504 no serverless
    let authSuccess = false;
    let authPort = 465;
    let authError: any = null;

    try {
      const transporter465 = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: cleanUser, pass: cleanPass },
        connectionTimeout: 4000,
        greetingTimeout: 4000,
        socketTimeout: 5000,
        tls: { rejectUnauthorized: false }
      });
      await transporter465.verify();
      authSuccess = true;
      authPort = 465;
    } catch (err465: any) {
      authError = err465;
      // Se falhou na 465 por timeout ou conexão, tenta na porta 587 (STARTTLS)
      try {
        const transporter587 = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: { user: cleanUser, pass: cleanPass },
          connectionTimeout: 4000,
          greetingTimeout: 4000,
          socketTimeout: 5000,
          tls: { rejectUnauthorized: false }
        });
        await transporter587.verify();
        authSuccess = true;
        authPort = 587;
        authError = null;
      } catch (err587: any) {
        authError = err587;
      }
    }

    if (!authSuccess) {
      let advice = 'Verifique se as credenciais do Google estão corretas.';
      if (authError?.code === 'EAUTH' || (authError?.response && authError.response.includes('535'))) {
        advice = 'Falha de Autenticação (535): O Google não aceitou este usuário ou senha de App. Certifique-se de que a Verificação em 2 Etapas está ativada na conta confirm.dex@gmail.com e gere uma nova Senha de App de 16 letras em myaccount.google.com/apppasswords.';
      } else if (authError?.code === 'ETIMEDOUT') {
        advice = 'Tempo esgotado ao conectar no Google. O provedor em nuvem demorou para responder.';
      }

      if (isHtmlRequest) {
        return sendHtml(200, renderDiagnosticHtml({
          success: false,
          diagnostic,
          title: `Erro de Conexão com o Gmail (${authError?.code || 'AUTH_ERROR'})`,
          description: authError?.message || 'Falha ao autenticar.',
          errorCode: authError?.code,
          errorResponse: authError?.response,
          advice,
          actionSteps: [
            'Acesse a conta Google <strong>confirm.dex@gmail.com</strong>.',
            'Vá em <strong>Segurança > Senhas de App</strong> (myaccount.google.com/apppasswords).',
            'Gere uma nova Senha de App para "Outro (Dex Jurídico)".',
            'Copie a senha de 16 letras e cole na Vercel no <code>SMTP_PASS</code>.',
            'Faça um novo <strong>Redeploy</strong> na Vercel para aplicar a nova senha.'
          ]
        }));
      }

      return sendJson(200, {
        success: false,
        error: authError?.message || 'Falha ao autenticar com o Gmail.',
        errorCode: authError?.code,
        errorResponse: authError?.response,
        dica: advice,
        diagnostic
      });
    }

    // Se o usuário passou ?to=email@..., envia um e-mail de teste real diretamente
    const targetEmail = req.query?.to || req.body?.to;
    let sendResult: any = null;

    if (targetEmail) {
      try {
        const directTransporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: authPort,
          secure: authPort === 465,
          auth: { user: cleanUser, pass: cleanPass },
          connectionTimeout: 5000,
          tls: { rejectUnauthorized: false }
        });

        const info = await directTransporter.sendMail({
          from: emailFrom,
          to: targetEmail,
          subject: 'Teste de Conexão de E-mail — Dex Jurídico',
          html: `<div style="font-family: Georgia, serif; padding: 24px; background: #FAF5F0; border: 1px solid #EAE0DA; border-radius: 12px; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #0F2733; margin: 0 0 12px;">⚖️ Dex Jurídico — Teste Concluído</h2>
            <p style="color: #35474B; font-size: 14px; line-height: 1.5;">Este e-mail confirma que a integração SMTP com o Gmail via porta <strong>${authPort}</strong> está ativa e operando perfeitamente.</p>
            <p style="color: #8F8A87; font-size: 11px; margin-top: 16px;">Disparado automaticamente pelo diagnóstico do Dex.</p>
          </div>`,
          text: `Dex Jurídico — Teste Concluído!\nSua integração SMTP com o Gmail via porta ${authPort} está ativa e operando perfeitamente.`
        });

        sendResult = { success: true, messageId: info.messageId };
      } catch (sendErr: any) {
        sendResult = { success: false, error: sendErr.message };
      }
    }

    if (isHtmlRequest) {
      return sendHtml(200, renderDiagnosticHtml({
        success: true,
        diagnostic,
        title: 'Conexão SMTP com o Gmail Autenticada com Sucesso! 🚀',
        description: `O servidor conectou com sucesso na porta <strong>${authPort}</strong> e a conta <strong>${maskedUser}</strong> está pronta para enviar e-mails.`,
        targetEmail,
        sendResult
      }));
    }

    return sendJson(200, {
      success: true,
      message: `Conexão SMTP com o Gmail verificada e autenticada com sucesso na porta ${authPort}!`,
      authPort,
      diagnostic,
      emailSent: targetEmail ? sendResult : 'Para disparar um e-mail de teste agora, acesse esta mesma URL passando ?to=seu_email@dominio.com'
    });
  } catch (error: any) {
    console.error('[API Test Email] Erro inesperado capturado:', error);
    if (isHtmlRequest) {
      return sendHtml(200, renderDiagnosticHtml({
        success: false,
        title: 'Aviso do Servidor',
        description: error?.message || 'Ocorreu um erro ao processar o diagnóstico.'
      }));
    }
    return sendJson(200, {
      success: false,
      error: error?.message || 'Erro inesperado no servidor.'
    });
  }
}

function renderDiagnosticHtml(opts: any): string {
  const { success, diagnostic, title, description, errorCode, errorResponse, advice, actionSteps, targetEmail, sendResult } = opts;
  const statusColor = success ? '#10B981' : '#EF4444';
  const statusBg = success ? '#ECFDF5' : '#FEF2F2';
  const statusBorder = success ? '#A7F3D0' : '#FECACA';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diagnóstico de E-mail — Dex Jurídico</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #F9ECE2; margin: 0; padding: 24px; color: #0F2733; }
    .card { max-width: 680px; margin: 20px auto; background: #FFFFFF; border-radius: 20px; box-shadow: 0 10px 30px rgba(15,39,51,0.08); padding: 32px; border: 1px solid #EAE0DA; }
    .header { text-align: center; border-bottom: 2px solid #F0CBAE; padding-bottom: 20px; margin-bottom: 24px; }
    .logo { font-size: 26px; font-weight: bold; font-family: Georgia, serif; }
    .subtitle { font-size: 12px; color: #8F8A87; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
    .status-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusBorder}; margin-bottom: 16px; }
    .status-box { background: ${statusBg}; border: 1px solid ${statusBorder}; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    .table td { padding: 10px 12px; border-bottom: 1px solid #F0ECE9; }
    .table tr:last-child td { border-bottom: none; }
    .label { font-weight: 600; color: #4B5563; width: 45%; }
    .val { font-family: monospace; font-size: 13px; }
    .ok { color: #10B981; font-weight: bold; }
    .fail { color: #EF4444; font-weight: bold; }
    .test-box { background: #FAF5F0; border-radius: 12px; padding: 20px; border: 1px solid #EAE0DA; margin-top: 24px; }
    .test-form { display: flex; gap: 8px; margin-top: 12px; }
    .test-input { flex: 1; padding: 10px 14px; border-radius: 8px; border: 1px solid #D1D5DB; font-size: 14px; }
    .test-btn { background: #0F2733; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }
    .test-btn:hover { background: #2A393C; }
    .steps { margin-top: 16px; padding-left: 20px; line-height: 1.6; font-size: 14px; color: #374151; }
    .steps li { margin-bottom: 8px; }
    code { background: #F3F4F6; padding: 2px 6px; border-radius: 4px; font-size: 12px; color: #D946EF; }
    .json-link { text-align: center; margin-top: 24px; font-size: 12px; }
    .json-link a { color: #4A808E; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">⚖️ Dex Jurídico</div>
      <div class="subtitle">Diagnóstico de Integração SMTP Gmail</div>
    </div>

    <div style="text-align: center;">
      <span class="status-badge">${success ? '● CONECTADO' : '● FALHA DETECTADA'}</span>
    </div>

    <div class="status-box">
      <h2 style="margin: 0 0 10px; font-size: 18px; color: ${statusColor};">${title}</h2>
      <p style="margin: 0; font-size: 14px; line-height: 1.5;">${description}</p>
      ${errorCode ? `<p style="margin: 8px 0 0; font-size: 12px; font-family: monospace; color: #6B7280;">Código de Erro: <strong>${errorCode}</strong></p>` : ''}
      ${errorResponse ? `<p style="margin: 4px 0 0; font-size: 12px; font-family: monospace; color: #6B7280;">Resposta do Servidor: ${errorResponse}</p>` : ''}
      ${advice ? `<div style="margin-top: 12px; padding: 10px; background: rgba(0,0,0,0.04); border-radius: 8px; font-size: 13px; line-height: 1.4;">💡 <strong>Dica da IA:</strong> ${advice}</div>` : ''}
    </div>

    ${diagnostic ? `
    <h3 style="margin: 0 0 8px; font-size: 15px;">Variáveis de Ambiente Detectadas</h3>
    <table class="table">
      <tr>
        <td class="label">Usuário SMTP (SMTP_USER):</td>
        <td class="val">${diagnostic.smtp_user_set ? `<span class="ok">✓ ${diagnostic.smtp_user_preview}</span>` : '<span class="fail">✗ NÃO ENCONTRADO</span>'}</td>
      </tr>
      <tr>
        <td class="label">Senha SMTP (SMTP_PASS):</td>
        <td class="val">${diagnostic.smtp_pass_set ? `<span class="ok">✓ Presente (${diagnostic.smtp_pass_length} caracteres)</span>` : '<span class="fail">✗ NÃO ENCONTRADO</span>'}</td>
      </tr>
      <tr>
        <td class="label">Remetente (EMAIL_FROM):</td>
        <td class="val">${diagnostic.email_from}</td>
      </tr>
    </table>` : ''}

    ${actionSteps ? `
    <h3 style="margin: 24px 0 8px; font-size: 15px;">Passo a Passo para Resolver:</h3>
    <ol class="steps">
      ${actionSteps.map((step: string) => `<li>${step}</li>`).join('')}
    </ol>` : ''}

    <div class="test-box">
      <h3 style="margin: 0 0 6px; font-size: 15px;">Disparar E-mail de Teste</h3>
      <p style="margin: 0; font-size: 12px; color: #6B7280;">Digite seu e-mail pessoal para testar o recebimento em tempo real:</p>
      <form class="test-form" method="GET" action="/api/auth/test-email">
        <input type="email" name="to" class="test-input" placeholder="seu-email-pessoal@gmail.com" required value="${targetEmail || ''}">
        <button type="submit" class="test-btn">Enviar Teste</button>
      </form>
      ${sendResult ? `
        <div style="margin-top: 14px; padding: 10px; border-radius: 8px; font-size: 13px; background: ${sendResult.success ? '#D1FAE5' : '#FEE2E2'}; color: ${sendResult.success ? '#065F46' : '#991B1B'};">
          ${sendResult.success ? `✓ E-mail enviado com sucesso! Verifique sua caixa de entrada e spam (ID: ${sendResult.messageId}).` : `✗ Falha no envio: ${sendResult.error}`}
        </div>` : ''}
    </div>

    <div class="json-link">
      <a href="/api/auth/test-email?json=true">Ver diagnóstico em formato JSON bruto</a>
    </div>
  </div>
</body>
</html>`;
}
