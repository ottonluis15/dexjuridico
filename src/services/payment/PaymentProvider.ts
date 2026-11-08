// Adaptador de Pagamento — Dex Gestão Jurídica Inteligente
// Interface abstrata para permitir troca transparente de gateway (Mock, Stripe, Mercado Pago, Pagar.me)
// sem alterar nenhuma lógica de negócio ou interface do usuário.

export interface PaymentIntentInput {
  planId: string;
  planName: string;
  period: 'MONTHLY' | 'YEARLY';
  amount: number;
  user: {
    id: string;
    name: string;
    email: string;
    officeId?: string;
    isIndependent?: boolean;
  };
  cardInfo?: {
    holderName?: string;
    cardNumberMasked?: string; // Ex: •••• •••• •••• 4242
    expiry?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  provider: 'MOCK' | 'STRIPE' | 'MERCADO_PAGO';
  message: string;
  subscription: {
    planId: string;
    period: 'MONTHLY' | 'YEARLY';
    status: 'ACTIVE';
    startDate: string;
    endDate: string;
    amount: number;
  };
}

export interface CancelSubscriptionResult {
  success: boolean;
  message: string;
  canceledAt: string;
}

export interface PaymentProvider {
  /**
   * Processa a assinatura (ou alteração de plano)
   */
  createSubscription(input: PaymentIntentInput): Promise<PaymentResult>;

  /**
   * Cancela a assinatura ativa do usuário ou escritório
   */
  cancelSubscription(userIdOrOfficeId: string): Promise<CancelSubscriptionResult>;

  /**
   * Nome descritivo do provedor ativo
   */
  getProviderName(): string;
}

/**
 * Provedor Mock de Demonstração
 * Simula checkout e transações com latência de rede realista, sem cobrar valor real
 * e sem armazenar nenhum dado sensível de cartão de crédito.
 */
export class MockPaymentProvider implements PaymentProvider {
  getProviderName(): string {
    return 'Dex Sandbox Mock Payment';
  }

  async createSubscription(input: PaymentIntentInput): Promise<PaymentResult> {
    // Simula tempo de resposta do gateway de pagamento (600ms)
    await new Promise((resolve) => setTimeout(resolve, 600));

    const now = new Date();
    const endDate = new Date(now);
    if (input.period === 'YEARLY') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setDate(endDate.getDate() + 30);
    }

    const txId = `tx_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    return {
      success: true,
      transactionId: txId,
      provider: 'MOCK',
      message: 'Assinatura simulada processada com sucesso no ambiente de testes Dex.',
      subscription: {
        planId: input.planId,
        period: input.period,
        status: 'ACTIVE',
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        amount: input.amount
      }
    };
  }

  async cancelSubscription(userIdOrOfficeId: string): Promise<CancelSubscriptionResult> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      success: true,
      message: 'Assinatura cancelada com sucesso. O acesso permanecerá ativo até o final do período vigente.',
      canceledAt: new Date().toISOString()
    };
  }
}

/**
 * =========================================================================================
 * GUIA DE INTEGRAÇÃO DE NOVOS GATEWAYS (STRIPE / MERCADO PAGO):
 * =========================================================================================
 * 
 * Para plugar um gateway real sem alterar o restante da aplicação:
 * 
 * 1. IMPLEMENTAR STRIPE:
 *    export class StripePaymentProvider implements PaymentProvider {
 *      private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
 * 
 *      async createSubscription(input: PaymentIntentInput): Promise<PaymentResult> {
 *        // 1. Criar ou buscar customer no Stripe pelo email do usuário
 *        // 2. Criar Checkout Session ou Subscription direta com o price_id correspondente ao plano
 *        // 3. Retornar os dados formatados na interface PaymentResult
 *      }
 *      ...
 *    }
 * 
 * 2. IMPLEMENTAR MERCADO PAGO:
 *    export class MercadoPagoPaymentProvider implements PaymentProvider {
 *      private mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
 *      ...
 *    }
 * 
 * 3. BASTA ALTERAR A INSTÂNCIA ABAIXO:
 *    export const activePaymentProvider: PaymentProvider = 
 *      process.env.VITE_PAYMENT_GATEWAY === 'stripe' ? new StripePaymentProvider() : new MockPaymentProvider();
 * =========================================================================================
 */

export const activePaymentProvider: PaymentProvider = new MockPaymentProvider();

