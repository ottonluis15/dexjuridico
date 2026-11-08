import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Briefcase, 
  Users, 
  FileText, 
  DollarSign, 
  UserCheck, 
  MessageSquare, 
  X, 
  ArrowRight,
  Clock,
  Loader2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { TabType } from './Sidebar';
import { LegalCase, Client, TemplateDocument, FinancialEntry, Lawyer, WallPost } from '../../types';

interface GlobalSearchProps {
  onNavigateToTab: (tab: TabType, extraPayload?: { caseId?: string; clientId?: string }) => void;
  onOpenCaseDetail?: (caseItem: LegalCase) => void;
  onOpenClientDetail?: (client: Client) => void;
}

interface SearchResultItem {
  id: string;
  category: 'CASES' | 'CLIENTS' | 'TEMPLATES' | 'FINANCIAL' | 'LAWYERS' | 'WALL';
  categoryLabel: string;
  title: string;
  subtitle: string;
  badge?: string;
  originalItem: any;
}

/**
 * Remove acentuação e transforma para minúsculas
 */
function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Remove pontuações para busca de números e documentos
 */
function cleanDigits(text: string): string {
  if (!text) return '';
  return text.replace(/\D/g, '');
}

/**
 * Destaca o trecho pesquisado com proteção contra injeção de HTML
 */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) return <>{text}</>;

  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  const index = normalizedText.indexOf(normalizedQuery);

  if (index === -1) {
    return <>{text}</>;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <>
      {before}
      <mark className="bg-dex-coral/25 text-white font-bold rounded px-0.5">{match}</mark>
      {after}
    </>
  );
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onNavigateToTab,
  onOpenCaseDetail,
  onOpenClientDetail
}) => {
  const { currentUser, isAdmin } = useAuth();
  const { 
    userCases, 
    userClients, 
    userTemplates, 
    userFinancial, 
    userTeamPosts, 
    lawyers 
  } = useData();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsListRef = useRef<HTMLDivElement>(null);

  // Debounce de ~300ms
  useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
      setSelectedIndex(-1);
    }, 280);

    return () => clearTimeout(handler);
  }, [query]);

  // Atalho global Ctrl+K / Cmd+K para focar a busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Membros visíveis da equipe respeitando o escritório do usuário
  const visibleTeamLawyers = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.isIndependent) {
      return lawyers.filter(l => l.userId === currentUser.id);
    }
    return lawyers.filter(l => !currentUser.officeId || l.officeId === currentUser.officeId);
  }, [lawyers, currentUser]);

  // Execução da busca com estrito isolamento por escritório e permissões
  const searchResults = useMemo((): SearchResultItem[] => {
    const cleanQ = normalizeText(debouncedQuery);
    if (!cleanQ || cleanQ.length < 2) return [];

    const digitsQ = cleanDigits(debouncedQuery);
    const items: SearchResultItem[] = [];

    // 1. Processos (userCases - já isolado por escritório e advogado)
    const matchingCases = userCases.filter(c => {
      const client = userClients.find(cl => cl.id === c.clientId);
      const numNorm = normalizeText(c.caseNumber || '');
      const numDigits = cleanDigits(c.caseNumber || '');
      const clientName = normalizeText(client?.name || '');
      const desc = normalizeText(c.description || '');
      const action = normalizeText(c.actionType || '');
      const court = normalizeText(c.court || '');
      const area = normalizeText(c.legalArea || '');

      return (
        numNorm.includes(cleanQ) ||
        (digitsQ.length >= 3 && numDigits.includes(digitsQ)) ||
        clientName.includes(cleanQ) ||
        desc.includes(cleanQ) ||
        action.includes(cleanQ) ||
        court.includes(cleanQ) ||
        area.includes(cleanQ)
      );
    }).slice(0, 5);

    matchingCases.forEach(c => {
      const client = userClients.find(cl => cl.id === c.clientId);
      items.push({
        id: `case_${c.id}`,
        category: 'CASES',
        categoryLabel: 'Processos',
        title: c.caseNumber || 'Processo sem número',
        subtitle: `${client?.name || 'Cliente'} • ${c.actionType || c.legalArea || 'Ação'}`,
        badge: c.status,
        originalItem: c
      });
    });

    // 2. Clientes (userClients - respeita estritamente a carteira restrita)
    const matchingClients = userClients.filter(cl => {
      const name = normalizeText(cl.name || '');
      const doc = cleanDigits(cl.document || '');
      const email = normalizeText(cl.email || '');
      const phone = cleanDigits(cl.phone || '');

      return (
        name.includes(cleanQ) ||
        (digitsQ.length >= 3 && doc.includes(digitsQ)) ||
        email.includes(cleanQ) ||
        (digitsQ.length >= 4 && phone.includes(digitsQ))
      );
    }).slice(0, 5);

    matchingClients.forEach(cl => {
      items.push({
        id: `client_${cl.id}`,
        category: 'CLIENTS',
        categoryLabel: 'Clientes',
        title: cl.name,
        subtitle: `${cl.document || 'Sem documento'} • ${cl.email || cl.phone || 'Contato'}`,
        badge: cl.type === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física',
        originalItem: cl
      });
    });

    // 3. Modelos & Documentos Jurídicos (userTemplates)
    const matchingTemplates = userTemplates.filter(t => {
      const title = normalizeText(t.title || '');
      const cat = normalizeText(t.category || '');
      const desc = normalizeText(t.description || '');
      const file = normalizeText(t.fileName || '');

      return title.includes(cleanQ) || cat.includes(cleanQ) || desc.includes(cleanQ) || file.includes(cleanQ);
    }).slice(0, 4);

    matchingTemplates.forEach(t => {
      items.push({
        id: `tpl_${t.id}`,
        category: 'TEMPLATES',
        categoryLabel: 'Modelos Jurídicos',
        title: t.title,
        subtitle: `${t.category} • ${t.fileName}`,
        badge: t.fileType?.toUpperCase(),
        originalItem: t
      });
    });

    // 4. Lançamentos Financeiros (userFinancial)
    const matchingFinancial = userFinancial.filter(f => {
      const client = userClients.find(cl => cl.id === f.clientId);
      const title = normalizeText(f.title || '');
      const desc = normalizeText(f.description || '');
      const method = normalizeText(f.paymentMethod || '');
      const clientName = normalizeText(client?.name || '');

      return title.includes(cleanQ) || desc.includes(cleanQ) || method.includes(cleanQ) || clientName.includes(cleanQ);
    }).slice(0, 4);

    matchingFinancial.forEach(f => {
      const client = userClients.find(cl => cl.id === f.clientId);
      const isExpense = f.type === 'DESPESA' || f.type === 'CUSTAS';
      items.push({
        id: `fin_${f.id}`,
        category: 'FINANCIAL',
        categoryLabel: 'Financeiro',
        title: f.title || f.description || 'Lançamento',
        subtitle: `${isExpense ? 'Despesa' : 'Receita'} • ${client?.name || 'Geral'}`,
        badge: `R$ ${Number(f.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        originalItem: f
      });
    });

    // 5. Membros da Equipe (visibleTeamLawyers)
    const matchingLawyers = visibleTeamLawyers.filter(l => {
      const name = normalizeText(l.name || '');
      const oab = normalizeText(l.oab || '');
      const email = normalizeText(l.email || '');
      const role = normalizeText(l.roleTitle || '');
      const specs = (l.specialties || []).map(normalizeText).join(' ');

      return name.includes(cleanQ) || oab.includes(cleanQ) || email.includes(cleanQ) || role.includes(cleanQ) || specs.includes(cleanQ);
    }).slice(0, 4);

    matchingLawyers.forEach(l => {
      items.push({
        id: `law_${l.id}`,
        category: 'LAWYERS',
        categoryLabel: 'Equipe',
        title: l.name,
        subtitle: `${l.roleTitle || 'Advogado'} • OAB ${l.oab}`,
        badge: l.specialties?.[0] || 'Advocacia',
        originalItem: l
      });
    });

    // 6. Mural da Equipe (userTeamPosts)
    const matchingPosts = userTeamPosts.filter(p => {
      const title = normalizeText(p.title || '');
      const content = normalizeText(p.content || '');
      const author = normalizeText(p.authorName || '');
      const cat = normalizeText(p.category || '');

      return title.includes(cleanQ) || content.includes(cleanQ) || author.includes(cleanQ) || cat.includes(cleanQ);
    }).slice(0, 4);

    matchingPosts.forEach(p => {
      items.push({
        id: `post_${p.id}`,
        category: 'WALL',
        categoryLabel: 'Mural',
        title: p.title,
        subtitle: `Publicado por ${p.authorName} em ${p.createdAt}`,
        badge: p.category,
        originalItem: p
      });
    });

    return items;
  }, [debouncedQuery, userCases, userClients, userTemplates, userFinancial, visibleTeamLawyers, userTeamPosts]);

  // Agrupamento dos resultados por categoria para exibição limpa
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResultItem[]> = {};
    searchResults.forEach(item => {
      if (!groups[item.categoryLabel]) {
        groups[item.categoryLabel] = [];
      }
      groups[item.categoryLabel].push(item);
    });
    return groups;
  }, [searchResults]);

  // Ação ao selecionar um resultado
  const handleSelectResult = (item: SearchResultItem) => {
    setIsOpen(false);
    setQuery('');

    switch (item.category) {
      case 'CASES':
        if (onOpenCaseDetail) {
          onOpenCaseDetail(item.originalItem);
        }
        onNavigateToTab('cases', { caseId: item.originalItem.id });
        break;
      case 'CLIENTS':
        if (onOpenClientDetail) {
          onOpenClientDetail(item.originalItem);
        }
        onNavigateToTab('clients', { clientId: item.originalItem.id });
        break;
      case 'TEMPLATES':
        onNavigateToTab('documents');
        break;
      case 'FINANCIAL':
        onNavigateToTab('financial');
        break;
      case 'LAWYERS':
        onNavigateToTab(isAdmin ? 'lawyers' : 'lawyer-workbench');
        break;
      case 'WALL':
        onNavigateToTab('team-wall');
        break;
    }
  };

  // Navegação por setas (ArrowUp, ArrowDown, Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        handleSelectResult(searchResults[selectedIndex]);
      } else if (searchResults.length > 0) {
        handleSelectResult(searchResults[0]);
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Processos':
        return <Briefcase className="w-3.5 h-3.5 text-dex-coral" />;
      case 'Clientes':
        return <Users className="w-3.5 h-3.5 text-dex-teal-light" />;
      case 'Modelos Jurídicos':
        return <FileText className="w-3.5 h-3.5 text-amber-300" />;
      case 'Financeiro':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Equipe':
        return <UserCheck className="w-3.5 h-3.5 text-purple-300" />;
      case 'Mural':
        return <MessageSquare className="w-3.5 h-3.5 text-sky-300" />;
      default:
        return <Search className="w-3.5 h-3.5 text-white/60" />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Campo de Busca Principal com Padrão ARIA Combobox */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-white/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="dex-global-search-results"
          aria-activedescendant={selectedIndex >= 0 ? searchResults[selectedIndex]?.id : undefined}
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar processos, Clientes... (Ctrl+K)"
          className="w-full pl-9 pr-8 py-2 rounded-full bg-white/10 text-white placeholder:text-white/60 text-xs font-serif border border-white/15 focus:outline-none focus:ring-2 focus:ring-dex-coral transition-all"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setDebouncedQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-0.5"
            aria-label="Limpar busca"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Região Acessível Live para Leitores de Tela */}
      <div className="sr-only" aria-live="polite">
        {isOpen && debouncedQuery && (
          searchResults.length === 0
            ? 'Nenhum resultado encontrado.'
            : `${searchResults.length} resultados encontrados agrupados por categoria.`
        )}
      </div>

      {/* Dropdown de Resultados Suspenso */}
      {isOpen && query.trim().length >= 2 && (
        <div 
          id="dex-global-search-results"
          role="listbox"
          ref={resultsListRef}
          className="absolute left-0 right-0 top-full mt-2 bg-[#12232D] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[480px] overflow-y-auto font-serif text-white divide-y divide-white/10 backdrop-blur-md"
        >
          {/* Header com indicador de busca */}
          <div className="px-4 py-2.5 bg-black/30 flex items-center justify-between text-[11px] text-[#A8A29E]">
            <div className="flex items-center gap-2">
              {isSearching ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-dex-coral" />
                  <span>Pesquisando no acervo forense...</span>
                </>
              ) : (
                <span>Resultados para "{debouncedQuery}"</span>
              )}
            </div>
            <span className="text-[10px] text-white/40">↑↓ navegar • Enter selecionar • Esc fechar</span>
          </div>

          {/* Estado: Nenhum resultado */}
          {!isSearching && searchResults.length === 0 && (
            <div className="p-8 text-center space-y-2">
              <Search className="w-8 h-8 text-white/30 mx-auto" />
              <p className="text-sm font-bold text-white/90">
                Nenhum registro encontrado
              </p>
              <p className="text-xs text-[#8F8A87] max-w-xs mx-auto">
                Não encontramos processos, clientes, modelos ou finanças correspondentes no seu escritório.
              </p>
            </div>
          )}

          {/* Grupos de Resultados */}
          {Object.entries(groupedResults).map(([categoryLabel, categoryItems]) => (
            <div key={categoryLabel} className="p-2">
              {/* Título do Grupo */}
              <div className="px-3 py-1.5 flex items-center gap-2 text-[11px] font-bold text-white/70 uppercase tracking-wider">
                {getCategoryIcon(categoryLabel)}
                <span>{categoryLabel}</span>
                <span className="text-[10px] text-white/40 font-normal">({categoryItems.length})</span>
              </div>

              {/* Itens do Grupo */}
              <div className="space-y-1 mt-1">
                {categoryItems.map((item) => {
                  const globalIdx = searchResults.findIndex(r => r.id === item.id);
                  const isHighlighted = globalIdx === selectedIndex;

                  return (
                    <div
                      key={item.id}
                      role="option"
                      aria-selected={isHighlighted}
                      onClick={() => handleSelectResult(item)}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`px-3 py-2 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isHighlighted
                          ? 'bg-white/15 text-white ring-1 ring-dex-coral/50'
                          : 'hover:bg-white/10 text-white/90'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate">
                          <HighlightMatch text={item.title} query={debouncedQuery} />
                        </div>
                        <div className="text-[11px] text-[#A8A29E] truncate">
                          <HighlightMatch text={item.subtitle} query={debouncedQuery} />
                        </div>
                      </div>

                      {item.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 shrink-0 border border-white/10">
                          {item.badge}
                        </span>
                      )}

                      <ArrowRight className="w-3.5 h-3.5 text-white/40 shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
