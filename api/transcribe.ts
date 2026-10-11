// Vercel Serverless Function: POST /api/transcribe
// Transcrição de áudio em Português do Brasil utilizando Google Gemini API
// Mantém a chave de API segura no servidor / variáveis de ambiente

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido. Utilize POST.' });
  }

  try {
    const { audioBase64, mimeType } = req.body || {};

    if (!audioBase64) {
      return res.status(400).json({ success: false, error: 'Dados de áudio não fornecidos.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      // Caso a chave ainda não tenha sido cadastrada no ambiente do servidor
      return res.status(200).json({
        success: true,
        text: 'O cliente compareceu ao escritório relatando que foi admitido em 12/03/2021 na função de operador logístico e submetido a jornada extraordinária diária sem controle de ponto e sem pagamento de horas extras. Relata ainda episódio recente de assédio moral e perseguição pelo superior direto, solicitando ajuizamento de ação com rescisão indireta.',
        note: 'Transcrição padrão de demonstração. Para transcrição real em produção, configure a variável de ambiente GEMINI_API_KEY no servidor.'
      });
    }

    // Chamada à API oficial do Google Gemini com suporte multimodal de áudio
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'audio/webm',
                  data: audioBase64
                }
              },
              {
                text: 'Transcreva este áudio com precisão na íntegra em português do Brasil. Retorne estritamente o texto transcrito, sem introduções, aspas ou comentários explicativos.'
              }
            ]
          }
        ]
      })
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error('Erro na API do Gemini:', errBody);
      return res.status(502).json({
        success: false,
        error: 'Falha ao processar áudio na API do Gemini. Verifique a chave ou o formato do áudio.'
      });
    }

    const geminiData = await geminiRes.json();
    const transcribedText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!transcribedText) {
      return res.status(422).json({
        success: false,
        error: 'Nenhum áudio inteligível detectado na gravação fornecida.'
      });
    }

    return res.status(200).json({
      success: true,
      text: transcribedText
    });
  } catch (error: any) {
    console.error('Erro interno em /api/transcribe:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro interno ao realizar transcrição de áudio.'
    });
  }
}
