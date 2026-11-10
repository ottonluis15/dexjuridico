// Vercel Serverless Function: POST /api/payment/create-checkout-session
// Criação de sessão do Stripe Checkout para pagamentos de assinaturas (Cartão, Boleto, Pix)
// Valores calculados ESTRITAMENTE no servidor para segurança forense contra manipulação de preço.

import { createClient } from '@supabase/supabase-js';

const PLAN_PRICING: Record<string, { name: string; description: string; monthly: number; yearly: number }> = {
  TRIAL: {
    name: 'Teste Gratuito',
    description: '14 dias de avaliação completa da plataforma Dex.',
    monthly: 0,
    yearly: 0
  },
  ESSENTIAL: {
    name: 'Essencial Autônomo',
    description: 'Assinatura individual com 120 processos, 80 clientes e IA forense.',
    monthly: 99,
    yearly: 79 * 12 // R$ 948/ano
  },
  PROFESSIONAL: {
    name: 'Profissional',
    description: 'Banca em expansão com até 3 advogados, 500 processos e mural da equipe.',
    monthly: 229,
    yearly: 189 * 12 // R$ 2.268/ano
  },
  OFFICE: {
    name: 'Escritório Pro',
    description: 'Capacidade corporativa até 15 advogados, 5.000 processos e auditoria avançada.',
    monthly: 449,
    yearly: 379 * 12 // R$ 4.548/ano
  }
};

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

    const { 
      planId = 'PROFESSIONAL', 
      period = 'MONTHLY', 
      userId, 
      userEmail, 
      userName, 
      officeId, 
      origin = 'https://dexjuridico.vercel.app' 
    } = body || {};

    const cleanPlanId = String(planId).toUpperCase();
    const cleanPeriod = String(period).toUpperCase() === 'YEARLY' ? 'YEARLY' : 'MONTHLY';
    const plan = PLAN_PRICING[cleanPlanId] || PLAN_PRICING.PROFESSIONAL;

    // Plano Gratuito (Trial) dispensa checkout no gateway
    if (cleanPlanId === 'TRIAL') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        success: true, 
        url: `${origin}/dashboard`,
        message: 'Plano de teste gratuito ativado diretamente.' 
      }));
      return;
    }

    const priceInCents = (cleanPeriod === 'YEARLY' ? plan.yearly : plan.monthly) * 100;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    // Se a chave do Stripe estiver presente no ambiente (Produção ou Sandbox de Testes)
    if (stripeSecretKey && !stripeSecretKey.includes('placeholder')) {
      const Stripe = (await import('stripe')).default;
      const stripe = new (Stripe as any)(stripeSecretKey, { apiVersion: '2023-10-16' });

      // Buscar ou criar cliente Stripe para manter histórico de faturas unificado
      let customerId: string | undefined = undefined;
      if (userEmail) {
        const existingCustomers = await stripe.customers.list({
          email: userEmail.trim().toLowerCase(),
          limit: 1
        });
        if (existingCustomers.data.length > 0) {
          customerId = existingCustomers.data[0].id;
        } else {
          const newCustomer = await stripe.customers.create({
            email: userEmail.trim().toLowerCase(),
            name: userName || 'Titular Dex',
            metadata: { userId: userId || '', officeId: officeId || '' }
          });
          customerId = newCustomer.id;
        }
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card', 'boleto'],
        mode: 'subscription',
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: `Dex Gestão Jurídica — ${plan.name} (${cleanPeriod === 'YEARLY' ? 'Anual' : 'Mensal'})`,
                description: plan.description,
              },
              unit_amount: priceInCents,
              recurring: {
                interval: cleanPeriod === 'YEARLY' ? 'year' : 'month',
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}/pagamento-sucesso?session_id={CHECKOUT_SESSION_ID}&plan=${cleanPlanId}&period=${cleanPeriod}`,
        cancel_url: `${origin}/planos?canceled=true`,
        metadata: {
          userId: userId || '',
          userEmail: userEmail || '',
          planId: cleanPlanId,
          period: cleanPeriod,
          officeId: officeId || ''
        }
      });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        success: true, 
        url: session.url, 
        sessionId: session.id,
        provider: 'STRIPE'
      }));
      return;
    }

    // Modo Sandbox / Contingência Segura (quando em ambiente local ou sem chaves do Stripe configuradas)
    console.log('[Stripe Checkout Sandbox] STRIPE_SECRET_KEY não configurada. Redirecionando para fluxo de teste homologado.');
    const mockSuccessUrl = `${origin}/pagamento-sucesso?mock=true&plan=${cleanPlanId}&period=${cleanPeriod}&userId=${userId || ''}`;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: true, 
      url: mockSuccessUrl, 
      simulated: true,
      provider: 'MOCK_SANDBOX'
    }));
  } catch (error: any) {
    console.error('[Create Checkout Session Error]', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message || 'Erro ao inicializar sessão de pagamento.' }));
  }
}

