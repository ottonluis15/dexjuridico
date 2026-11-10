// Vercel Serverless Function: POST /api/payment/portal
// Redireciona o titular para o Stripe Billing Customer Portal oficial,
// permitindo atualizar cartão, ver faturas e notas fiscais sem risco de segurança.

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Método não permitido. Utilize POST.' }));
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'JSON inválido no corpo da requisição.' }));
        return;
      }
    }

    const { customerId, returnUrl = 'https://dexjuridico.vercel.app/planos' } = body || {};
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (stripeSecretKey && customerId) {
      const Stripe = (await import('stripe')).default;
      const stripe = new (Stripe as any)(stripeSecretKey, { apiVersion: '2023-10-16' });

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true, url: portalSession.url }));
      return;
    }

    // Fallback sandbox se não houver cliente Stripe real
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: true, 
      url: returnUrl,
      message: 'Portal de faturamento simulado no ambiente de demonstração.' 
    }));
  } catch (error: any) {
    console.error('[Stripe Billing Portal Error]', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message || 'Erro ao abrir o portal de faturamento.' }));
  }
}

