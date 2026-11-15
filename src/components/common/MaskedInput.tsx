import React, { useRef, useId } from 'react';
import { 
  maskCPF, 
  maskCNPJ, 
  maskCPFOrCNPJ, 
  maskPhone, 
  maskCEP, 
  maskOAB, 
  maskCNJ, 
  maskCurrency, 
  maskDate, 
  maskTime,
  unmaskDigits,
  unmaskAlphanumeric,
  unmaskCurrencyToCents,
  normalizeOAB
} from '../../utils/masks';

export type MaskType = 
  | 'cpf' 
  | 'cnpj' 
  | 'cpf_cnpj' 
  | 'phone' 
  | 'cep' 
  | 'oab' 
  | 'cnj' 
  | 'currency' 
  | 'date' 
  | 'time';

export interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  mask: MaskType;
  value: string | number;
  onChange: (formattedValue: string, rawValue: string) => void;
  label?: string;
  error?: string | null;
  helperText?: string;
  clientType?: 'PF' | 'PJ';
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperClassName?: string;
  variant?: 'modal' | 'card';
}

export const MaskedInput: React.FC<MaskedInputProps> = ({
  mask,
  value,
  onChange,
  label,
  error,
  helperText,
  clientType,
  containerClassName = '',
  labelClassName,
  inputClassName,
  helperClassName,
  variant = 'modal',
  id: customId,
  required,
  disabled,
  placeholder,
  className = '',
  onBlur,
  ...restProps
}) => {
  const generatedId = useId();
  const inputId = customId || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const inputRef = useRef<HTMLInputElement>(null);

  // Formata o valor bruto para exibição
  const formatValue = (val: string | number): string => {
    const str = val === null || val === undefined ? '' : String(val);
    switch (mask) {
      case 'cpf':
        return maskCPF(str);
      case 'cnpj':
        return maskCNPJ(str);
      case 'cpf_cnpj':
        return maskCPFOrCNPJ(str, clientType);
      case 'phone':
        return maskPhone(str);
      case 'cep':
        return maskCEP(str);
      case 'oab':
        return maskOAB(str);
      case 'cnj':
        return maskCNJ(str);
      case 'currency':
        return maskCurrency(str);
      case 'date':
        return maskDate(str);
      case 'time':
        return maskTime(str);
      default:
        return str;
    }
  };

  // Obtém o valor normalizado para armazenamento
  const extractRawValue = (formatted: string): string => {
    switch (mask) {
      case 'currency':
        return String(unmaskCurrencyToCents(formatted));
      case 'oab':
        return normalizeOAB(formatted);
      case 'cnpj':
        return unmaskAlphanumeric(formatted);
      case 'cpf_cnpj':
        return clientType === 'PJ' || /[A-Z]/.test(formatted) 
          ? unmaskAlphanumeric(formatted) 
          : unmaskDigits(formatted);
      default:
        return unmaskDigits(formatted);
    }
  };

  const displayValue = formatValue(value);

  // Define inputMode e placeholder padrão
  const getInputMode = (): React.HTMLAttributes<HTMLInputElement>['inputMode'] => {
    if (restProps.inputMode) return restProps.inputMode;
    switch (mask) {
      case 'cpf':
      case 'phone':
      case 'cep':
      case 'currency':
      case 'date':
      case 'time':
      case 'cnj':
        return 'numeric';
      case 'cnpj':
      case 'cpf_cnpj':
      case 'oab':
        return 'text'; // CNPJ alfanumérico e OAB requerem letras
      default:
        return 'text';
    }
  };

  const getDefaultPlaceholder = (): string => {
    if (placeholder) return placeholder;
    switch (mask) {
      case 'cpf':
        return '000.000.000-00';
      case 'cnpj':
        return '00.000.000/0000-00';
      case 'cpf_cnpj':
        return clientType === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00 ou CNPJ';
      case 'phone':
        return '(11) 99999-9999';
      case 'cep':
        return '00000-000';
      case 'oab':
        return '123456/SP';
      case 'cnj':
        return '0000000-00.0000.0.00.0000';
      case 'currency':
        return 'R$ 0,00';
      case 'date':
        return 'DD/MM/AAAA';
      case 'time':
        return '00:00';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    const inputEl = inputRef.current;
    const prevCursor = inputEl?.selectionStart || 0;
    const prevLen = displayValue.length;

    // Formata o novo valor
    const formatted = formatValue(rawInput);
    const raw = extractRawValue(formatted);

    onChange(formatted, raw);

    // Ajusta a posição do cursor para não pular ao editar no meio
    requestAnimationFrame(() => {
      if (!inputEl) return;
      const newLen = formatted.length;
      let newCursor = prevCursor + (newLen - prevLen);
      if (newCursor < 0) newCursor = 0;
      if (newCursor > newLen) newCursor = newLen;
      try {
        inputEl.setSelectionRange(newCursor, newCursor);
      } catch {}
    });
  };

  const isModal = variant === 'modal';

  const resolvedLabelClass = labelClassName || (
    isModal
      ? 'block text-xs font-serif italic text-[#C2D6DC] mb-1.5'
      : 'block text-xs font-serif font-bold text-dex-navy-950 dark:text-[#F9ECE2] mb-1.5'
  );

  const resolvedInputClass = isModal
    ? `w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-navy-950/50 focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif transition-all ${
        error ? 'ring-2 ring-red-500 border border-red-500' : 'border border-transparent'
      } ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-300' : ''}`
    : `w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-serif transition-all bg-white dark:bg-[#0F2733] text-dex-navy-950 dark:text-[#F9ECE2] border ${
        error 
          ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
          : 'border-[#D8C3B5] dark:border-[#214154] focus:border-[#4A808E] focus:ring-2 focus:ring-[#4A808E]/20'
      } ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''}`;

  const resolvedHelperClass = helperClassName || (
    isModal
      ? 'text-[11px] text-[#A6C5CD] font-serif mt-1'
      : 'text-[11px] text-dex-support dark:text-[#A7BAC5] font-serif mt-1'
  );

  const resolvedErrorClass = isModal
    ? 'text-xs text-red-400 font-serif font-medium flex items-center gap-1 mt-1'
    : 'text-xs text-red-600 dark:text-red-400 font-serif font-medium flex items-center gap-1 mt-1';

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className={resolvedLabelClass}
        >
          {label} {required && <span className="text-dex-coral" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={getDefaultPlaceholder()}
          inputMode={getInputMode()}
          aria-invalid={!!error}
          aria-describedby={
            [
              error ? errorId : null,
              helperText ? helperId : null
            ].filter(Boolean).join(' ') || undefined
          }
          className={`${resolvedInputClass} ${inputClassName || ''} ${className}`}
          {...restProps}
        />
      </div>

      {helperText && !error && (
        <p id={helperId} className={resolvedHelperClass}>
          {helperText}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className={resolvedErrorClass}>
          <span>•</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
