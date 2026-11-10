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

export class StripePaymentProvider implements PaymentProvider {
  getProviderName(): string {
    return 'Stripe Checkout & Billing';
  }

  async createSubscription(input: PaymentIntentInput): Promise<PaymentResult> {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const res = await fetch('/api/payment/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: input.planId,
        period: input.period,
        userId: input.user.id,
        userEmail: input.user.email,
        userName: input.user.name,
        officeId: input.user.officeId,
        origin
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao conectar com o gateway de pagamento Stripe.');
    }

    const data = await res.json();
    if (data.url && typeof window !== 'undefined') {
      window.location.href = data.url;
    }

    const now = new Date();
    const endDate = new Date(now);
    if (input.period === 'YEARLY') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setDate(endDate.getDate() + 30);
    }

    return {
      success: true,
      transactionId: data.sessionId || `stripe_ses_${Date.now()}`,
      provider: 'STRIPE',
      message: 'Redirecionando para o Stripe Checkout seguro...',
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
    const res = await fetch('/api/payment/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        returnUrl: typeof window !== 'undefined' ? window.location.href : 'https://dexjuridico.vercel.app/planos'
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.url && typeof window !== 'undefined') {
        window.location.href = data.url;
      }
    }
    return {
      success: true,
      message: 'Redirecionando para o portal de faturamento seguro...',
      canceledAt: new Date().toISOString()
    };
  }
}

export const activePaymentProvider: PaymentProvider = new StripePaymentProvider();
export const mockPaymentProvider: PaymentProvider = new MockPaymentProvider();

