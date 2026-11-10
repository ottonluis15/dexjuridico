import React from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { validatePassword } from '../../utils/passwordPolicy';

interface PasswordRequirementsProps {
  password: string;
  confirmPassword?: string;
  showMatchStatus?: boolean;
  className?: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  confirmPassword,
  showMatchStatus = false,
  className = ''
}) => {
  const result = validatePassword(password);
  const hasTypedPassword = password.length > 0;
  const hasTypedConfirm = typeof confirmPassword === 'string' && confirmPassword.length > 0;
  const passwordsMatch = hasTypedPassword && hasTypedConfirm && password === confirmPassword;
  const passwordsDiverge = hasTypedConfirm && password !== confirmPassword;

  return (
    <div 
      className={`p-3.5 rounded-xl bg-dex-input/60 dark:bg-[#0A1922]/60 border border-dex-border/60 dark:border-[#214154]/60 space-y-2.5 font-serif text-xs ${className}`}
      aria-live="polite"
      aria-atomic="false"
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-black/5 dark:border-white/5">
        <span className="font-semibold text-dex-navy-950/80 dark:text-[#A6C5CD]">
          Requisitos de segurança da credencial:
        </span>
        <span className="text-[11px] font-mono font-bold text-dex-terracotta dark:text-dex-coral-light">
          {result.score}/5 atendidos
        </span>
      </div>

      <ul className="space-y-1.5" role="list">
        {result.requirements.map(req => (
          <li 
            key={req.id} 
            className={`flex items-center gap-2 transition-colors ${
              req.met 
                ? 'text-emerald-700 dark:text-emerald-400 font-medium' 
                : (hasTypedPassword ? 'text-dex-support/80 dark:text-slate-400' : 'text-dex-support/60 dark:text-slate-500')
            }`}
          >
            {req.met ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-label="Atendido: " />
            ) : (
              <Circle className="w-3.5 h-3.5 shrink-0 opacity-40" aria-label="Pendente: " />
            )}
            <span>{req.label}</span>
          </li>
        ))}
      </ul>

      {showMatchStatus && hasTypedConfirm && (
        <div 
          className={`pt-2 mt-2 border-t border-black/5 dark:border-white/5 flex items-center gap-2 ${
            passwordsMatch 
              ? 'text-emerald-700 dark:text-emerald-400 font-medium' 
              : 'text-dex-coral dark:text-rose-400 font-medium'
          }`}
        >
          {passwordsMatch ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>As senhas digitadas conferem perfeitamente.</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-dex-coral dark:text-rose-400" />
              <span>A confirmação de senha não coincide com a nova senha digitada.</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

