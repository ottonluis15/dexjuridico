import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin para simular/executar a rota /api/transcribe no ambiente de desenvolvimento local
function geminiTranscribeDevPlugin(): Plugin {
  return {
    name: 'gemini-transcribe-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/transcribe' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });

          req.on('end', async () => {
            try {
              const { audioBase64, mimeType } = JSON.parse(body || '{}');

              if (!audioBase64) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Dados de áudio não fornecidos.' }));
                return;
              }

              const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

              if (!apiKey) {
                // Modo demonstração local caso a chave do Gemini ainda não tenha sido configurada no ambiente
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  text: 'Cliente relata contratação em 12/03/2021 com jornada extraordinária habitual sem registro e sem pagamento de horas extras. Relata ainda assédio moral e solicita ajuizamento de reclamatória trabalhista com pedido de rescisão indireta.',
                  note: 'Modo local: configure GEMINI_API_KEY no ambiente para chamada real.'
                }));
                return;
              }

              const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

              const geminiRes = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                console.error('[Gemini Audio Error]:', errBody);
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Erro de resposta da API do Google Gemini.' }));
                return;
              }

              const geminiData = await geminiRes.json();
              const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, text }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err?.message || 'Erro no processamento do áudio.' }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), geminiTranscribeDevPlugin()],
  server: {
    port: 3000,
    open: false
  }
})
