import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  FolderKanban, 
  DollarSign, 
  Ban
} from 'lucide-react';
import { CaseStatus, DeadlinePriority, DeadlineStatus, FinancialStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral', 
  icon, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2'
  };

  const variantClasses = {
    primary: 'bg-[#4A808E]/25 text-[#72ACBA] border border-[#4A808E]/50',
    success: 'bg-[#48BB78]/20 text-[#48BB78] border border-[#48BB78]/40',
    warning: 'bg-[#C48A5C]/20 text-[#C48A5C] border border-[#C48A5C]/40',
    danger: 'bg-dex-coral/20 text-dex-coral border border-dex-coral/50',
    info: 'bg-[#CBEBD8]/25 text-[#2B8255] border border-[#CBEBD8]/50',
    purple: 'bg-[#E0D7F5]/25 text-[#A78BFA] border border-[#E0D7F5]/40',
    neutral: 'bg-white/10 text-[#C2D6DC] border border-white/15',
  };

  return (
    <span 
      className={`inline-flex items-center font-serif font-medium rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

// Badges especializados com acessibilidade (ícone + texto)
export const PriorityBadge: React.FC<{ priority: DeadlinePriority }> = ({ priority }) => {
  switch (priority) {
    case 'CRITICAL':
      return (
        <Badge variant="danger" icon={<ShieldAlert className="w-3.5 h-3.5 text-dex-coral" />}>
          [CRÍTICO] Fatal
        </Badge>
      );
    case 'HIGH':
      return (
        <Badge variant="warning" icon={<AlertTriangle className="w-3.5 h-3.5 text-[#C48A5C]" />}>
          [ALTA] Urgente
        </Badge>
      );
    case 'MEDIUM':
      return (
        <Badge variant="primary" icon={<Clock className="w-3.5 h-3.5 text-[#72ACBA]" />}>
          Média
        </Badge>
      );
    case 'NORMAL':
    default:
      return (
        <Badge variant="neutral" icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#C2D6DC]" />}>
          Normal
        </Badge>
      );
  }
};

export const DeadlineStatusBadge: React.FC<{ status: DeadlineStatus; dueDate: string }> = ({ status, dueDate }) => {
  const today = new Date().toISOString().substring(0, 10);
  const isToday = dueDate === today;
  const isOverdue = status === 'OVERDUE' || (status === 'PENDING' && dueDate < today);

  if (status === 'COMPLETED') {
    return (
      <Badge variant="success" icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#48BB78]" />}>
        Cumprido
      </Badge>
    );
  }

  if (isOverdue) {
    return (
      <Badge variant="danger" icon={<AlertCircle className="w-3.5 h-3.5 text-dex-coral" />}>
        Atrasado
      </Badge>
    );
  }

  if (isToday) {
    return (
      <Badge variant="warning" icon={<Clock className="w-3.5 h-3.5 text-[#C48A5C]" />}>
        Vence Hoje
      </Badge>
    );
  }

  return (
    <Badge variant="primary" icon={<Clock className="w-3.5 h-3.5 text-[#72ACBA]" />}>
      Pendente
    </Badge>
  );
};

export const CaseStatusBadge: React.FC<{ status: CaseStatus }> = ({ status }) => {
  switch (status) {
    case 'INICIAL':
      return (
        <Badge variant="primary" icon={<FolderKanban className="w-3.5 h-3.5 text-[#72ACBA]" />}>
          Fase Inicial
        </Badge>
      );
    case 'INSTRUCAO':
      return (
        <Badge variant="warning" icon={<Clock className="w-3.5 h-3.5 text-[#C48A5C]" />}>
          Em Instrução
        </Badge>
      );
    case 'SENTENCA':
      return (
        <Badge variant="success" icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#48BB78]" />}>
          Sentenciado
        </Badge>
      );
    case 'RECURSAL':
      return (
        <Badge variant="purple" icon={<AlertTriangle className="w-3.5 h-3.5 text-[#A78BFA]" />}>
          Fase Recursal
        </Badge>
      );
    case 'EXECUCAO':
      return (
        <Badge variant="danger" icon={<Clock className="w-3.5 h-3.5 text-dex-coral" />}>
          Execução
        </Badge>
      );
    case 'ACORDO':
      return (
        <Badge variant="success" icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#48BB78]" />}>
          Acordo
        </Badge>
      );
    case 'ARQUIVADO':
    default:
      return (
        <Badge variant="neutral" icon={<Ban className="w-3.5 h-3.5 text-[#C2D6DC]" />}>
          Arquivado
        </Badge>
      );
  }
};

export const FinancialStatusBadge: React.FC<{ status: FinancialStatus }> = ({ status }) => {
  switch (status) {
    case 'PAGO':
      return (
        <Badge variant="success" icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#48BB78]" />}>
          Liquidado
        </Badge>
      );
    case 'PENDENTE':
      return (
        <Badge variant="warning" icon={<Clock className="w-3.5 h-3.5 text-[#C48A5C]" />}>
          A Vencer
        </Badge>
      );
    case 'ATRASADO':
      return (
        <Badge variant="danger" icon={<AlertCircle className="w-3.5 h-3.5 text-dex-coral" />}>
          Inadimplente
        </Badge>
      );
    case 'CANCELADO':
    default:
      return (
        <Badge variant="neutral" icon={<Ban className="w-3.5 h-3.5 text-[#C2D6DC]" />}>
          Cancelado
        </Badge>
      );
  }
};
