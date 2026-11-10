// Política de Segurança Forense de Senhas — Dex Gestão Jurídica Inteligente
// Fonte da verdade única compartilhada entre o front-end e o backend serverless.

export interface PasswordRuleRequirement {
  id: 'length' | 'uppercase' | 'lowercase' | 'number' | 'special';
  label: string;
  met: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 a 5
  requirements: PasswordRuleRequirement[];
  error?: string;
}

/**
 * Valida a senha contra os requisitos forenses rigorosos do Dex
 */
export function validatePassword(password: string): PasswordValidationResult {
  const safePassword = typeof password === 'string' ? password : '';

  const requirements: PasswordRuleRequirement[] = [
    {
      id: 'length',
      label: 'Mínimo de 8 caracteres',
      met: safePassword.length >= 8
    },
    {
      id: 'uppercase',
      label: 'Pelo menos uma letra maiúscula (A-Z)',
      met: /[A-Z]/.test(safePassword)
    },
    {
      id: 'lowercase',
      label: 'Pelo menos uma letra minúscula (a-z)',
      met: /[a-z]/.test(safePassword)
    },
    {
      id: 'number',
      label: 'Pelo menos um número (0-9)',
      met: /[0-9]/.test(safePassword)
    },
    {
      id: 'special',
      label: 'Pelo menos um caractere especial (!@#$%^&*...)',
      met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(safePassword)
    }
  ];

  const score = requirements.filter(r => r.met).length;
  const isValid = score === requirements.length;

  let error: string | undefined = undefined;
  if (!isValid) {
    const missing = requirements.filter(r => !r.met).map(r => r.label);
    error = `A senha não atende aos requisitos forenses: ${missing.join(', ')}.`;
  }

  return {
    isValid,
    score,
    requirements,
    error
  };
}

