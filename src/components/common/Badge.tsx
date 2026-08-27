import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  FileText, 
  FolderKanban, 
  Sparkles,
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
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2'
  };

  const variantClasses = {
    primary: 'bg-blue-950/80 text-blue-300 border border-blue-800/60',
    success: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60',
    warning: 'bg-amber-950/80 text-amber-300 border border-amber-800/60',
    danger: 'bg-rose-950/80 text-rose-300 border border-rose-800/60',
    info: 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60',
    purple: 'bg-purple-950/80 text-purple-300 border border-purple-800/60',
    neutral: 'bg-slate-800/80 text-slate-300 border border-slate-700/60',
  };

  return (
    <span 
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
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
        <Badge variant="danger" icon={<ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}>
          [CRÍTICO] Fatal
        </Badge>
      );
    case 'HIGH':
      return (
        <Badge variant="warning" icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}>
          [ALTA] Urgente
        </Badge>
      );
    case 'MEDIUM':
      return (
        <Badge variant="primary" icon={<Clock className="w-3.5 h-3.5 text-blue-400" />}>
          Média
        </Badge>
      );
    case 'NORMAL':
    default:
      return (
        <Badge variant="neutral" icon={<CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />}>
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
      <Badge variant="success" icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}>
        Concluído
      </Badge>
    );
  }

  if (isOverdue) {
    return (
      <Badge variant="danger" icon={<AlertCircle className="w-3.5 h-3.5 text-rose-400" />}>
        ⚠️ VENCIDO
      </Badge>
    );
  }

  if (isToday) {
    return (
      <Badge variant="warning" icon={<Clock className="w-3.5 h-3.5 text-amber-400" />}>
        ⏳ Vence Hoje
      </Badge>
    );
  }

  return (
    <Badge variant="info" icon={<Clock className="w-3.5 h-3.5 text-cyan-400" />}>
      Pendente
    </Badge>
  );
};

export const CaseStatusBadge: React.FC<{ status: CaseStatus }> = ({ status }) => {
  const config: Record<CaseStatus, { label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral' }> = {
    INICIAL: { label: 'Fase Inicial', variant: 'info' },
    INSTRUCAO: { label: 'Instrução Probatória', variant: 'primary' },
    SENTENCA: { label: 'Fase de Sentença', variant: 'purple' },
    RECURSAL: { label: 'Grau Recursal', variant: 'warning' },
    EXECUCAO: { label: 'Execução de Sentença', variant: 'danger' },
    ACORDO: { label: 'Acordo Homologado', variant: 'success' },
    ARQUIVADO: { label: 'Arquivado', variant: 'neutral' },
  };

  const item = config[status] || { label: status, variant: 'neutral' };

  return (
    <Badge variant={item.variant} icon={<FolderKanban className="w-3.5 h-3.5" />}>
      {item.label}
    </Badge>
  );
};

export const FinancialStatusBadge: React.FC<{ status: FinancialStatus }> = ({ status }) => {
  switch (status) {
    case 'PAGO':
      return (
        <Badge variant="success" icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}>
          Pago
        </Badge>
      );
    case 'PENDENTE':
      return (
        <Badge variant="warning" icon={<Clock className="w-3.5 h-3.5 text-amber-400" />}>
          A Receber
        </Badge>
      );
    case 'ATRASADO':
      return (
        <Badge variant="danger" icon={<AlertCircle className="w-3.5 h-3.5 text-rose-400" />}>
          Em Atraso
        </Badge>
      );
    case 'CANCELADO':
    default:
      return (
        <Badge variant="neutral" icon={<Ban className="w-3.5 h-3.5 text-slate-400" />}>
          Cancelado
        </Badge>
      );
  }
};
