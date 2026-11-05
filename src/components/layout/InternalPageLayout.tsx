import React from 'react';
import { Search, Plus } from 'lucide-react';
import { DecorativeBars } from '../common/DecorativeBars';

export interface SummaryCardItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  helperText?: string;
}

export interface KPIItem {
  title: string;
  value: string | number;
  icon?: any;
  iconTileColor?: 'peach' | 'mint' | 'purple' | 'cream' | 'coral';
  helperText?: string;
}

export interface FilterPill {
  label: string;
  active: boolean;
  onClick: () => void;
}

export interface InternalPageLayoutProps {
  // Headings
  title?: string;
  headerTitle?: string;
  subtitle?: string;
  headerSubtitle?: string;

  // KPI / Summary Cards (Anexo 5)
  summaryCards?: SummaryCardItem[];
  kpis?: KPIItem[];

  // Action Buttons
  actionLabel?: string;
  onAction?: () => void;
  headerActions?: React.ReactNode;

  // Filters & Search
  filters?: FilterPill[];
  headerFilters?: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;

  // Content
  children: React.ReactNode;
  className?: string;
}

export const InternalPageLayout: React.FC<InternalPageLayoutProps> = ({
  title,
  headerTitle,
  subtitle,
  headerSubtitle,
  summaryCards,
  kpis,
  actionLabel,
  onAction,
  headerActions,
  filters,
  headerFilters,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  children,
  className = '',
}) => {
  const displayTitle = title || headerTitle;
  const displaySubtitle = subtitle || headerSubtitle;

  // Helper to map KPI tile colors to Dex tokens
  const getTileClasses = (tileColor?: string) => {
    switch (tileColor) {
      case 'mint':
        return 'bg-dex-kpi-mint text-dex-navy-950';
      case 'purple':
        return 'bg-dex-kpi-purple text-dex-navy-950';
      case 'cream':
        return 'bg-dex-kpi-cream text-dex-navy-950';
      case 'coral':
        return 'bg-dex-coral/20 text-dex-coral';
      case 'peach':
      default:
        return 'bg-dex-kpi-peach text-dex-navy-950';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* LINHA 1: 4 Cards de Resumo em Azul-Marinho (Anexo 5) */}
      {(kpis || summaryCards) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {kpis ? (
            kpis.map((kpi, idx) => {
              const IconComponent = kpi.icon;
              return (
                <div
                  key={idx}
                  className="bg-dex-navy-900 rounded-[24px] p-5 sm:p-6 shadow-xl border border-white/5 flex flex-col justify-between transition-all hover:border-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    {IconComponent && (
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md shrink-0 ${getTileClasses(kpi.iconTileColor)}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-serif text-[#8F8A87] block">{kpi.title}</span>
                    <span className="font-serif text-2xl font-bold text-white tracking-tight mt-0.5 block">
                      {kpi.value}
                    </span>
                    {kpi.helperText && (
                      <span className="text-[11px] text-[#8F8A87] mt-1 block font-serif">{kpi.helperText}</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            summaryCards?.map((card, idx) => (
              <div
                key={idx}
                className="bg-dex-navy-900 rounded-[24px] p-5 sm:p-6 shadow-xl border border-white/5 flex flex-col justify-between transition-all hover:border-white/10"
              >
                <div className="flex items-start justify-between mb-3">
                  {card.icon && (
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md shrink-0 ${card.iconBgColor || 'bg-dex-kpi-peach'} ${card.iconTextColor || 'text-dex-navy-950'}`}>
                      {card.icon}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-xs font-serif text-[#8F8A87] block">{card.label}</span>
                  <span className="font-serif text-2xl font-bold text-white tracking-tight mt-0.5 block">
                    {card.value}
                  </span>
                  {card.helperText && (
                    <span className="text-[11px] text-[#8F8A87] mt-1 block font-serif">{card.helperText}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* LINHA 2: Barra de Ações & Filtros (Anexo 5) */}
      <div className="bg-dex-navy-900 rounded-[24px] p-5 sm:p-6 shadow-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Lado Esquerdo: Título & Subtítulo */}
        {displayTitle ? (
          <div>
            <DecorativeBars className="mb-1.5" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
              {displayTitle}
            </h2>
            {displaySubtitle && (
              <p className="text-xs text-[#8F8A87] font-serif mt-0.5">
                {displaySubtitle}
              </p>
            )}
          </div>
        ) : (
          <div />
        )}

        {/* Lado Direito: Busca, Filtros e Ação Principal */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Campo de Busca */}
          {onSearchChange && (
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue || ''}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-dex-coral"
              />
            </div>
          )}

          {/* Filtros Pills */}
          {filters && filters.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {filters.map((f, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={f.onClick}
                  className={`px-3 py-1.5 rounded-full text-xs font-serif font-bold transition-all ${
                    f.active
                      ? 'bg-dex-coral text-white shadow-md'
                      : 'bg-dex-navy-800 text-[#8F8A87] hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {headerFilters}

          {/* Botão de Ação Principal */}
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="flex items-center gap-2 px-5 py-2.5 bg-dex-coral hover:bg-dex-coral/90 text-white text-xs font-serif font-bold rounded-xl shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{actionLabel}</span>
            </button>
          )}

          {headerActions}
        </div>
      </div>

      {/* LINHA 3: Grande Card de Conteúdo Principal (Anexo 5) */}
      <div className="bg-dex-navy-900 rounded-[28px] p-5 sm:p-7 shadow-2xl border border-white/5">
        {children}
      </div>
    </div>
  );
};
