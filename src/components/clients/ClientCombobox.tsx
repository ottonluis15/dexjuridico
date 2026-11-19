import React, { useState, useRef, useEffect, useMemo, useId } from 'react';
import { Search, Plus, ChevronDown, Check, UserPlus, Building2, User as UserIcon, X } from 'lucide-react';
import { Client } from '../../types';
import { useData } from '../../context/DataContext';
import { formatDisplay } from '../../utils/masks';
import { ClientModal } from './ClientModal';

function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function cleanAlphanumeric(text: string): string {
  if (!text) return '';
  return text.toUpperCase().replace(/[^0-9A-Z]/g, '');
}

function cleanDigits(text: string): string {
  if (!text) return '';
  return text.replace(/\D/g, '');
}

export interface ClientComboboxProps {
  value: string;
  onChange: (clientId: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string | null;
  disabled?: boolean;
  /** Permite ocultar o atalho de criação se necessário */
  allowCreate?: boolean;
  /** Texto explicativo exibido dentro do modal "Novo cliente" */
  createContextNotice?: string;
  /** Variante visual: 'modal' para superfícies escuras (#162B37), 'card' para cards claros/escuros */
  variant?: 'modal' | 'card';
}

export const ClientCombobox: React.FC<ClientComboboxProps> = ({
  value,
  onChange,
  label = 'Cliente Outorgante',
  required = false,
  placeholder = 'Pesquisar por nome, CPF/CNPJ ou e-mail...',
  error,
  disabled = false,
  allowCreate = true,
  createContextNotice = 'O cliente será salvo na aba Clientes e ficará vinculado automaticamente, mesmo se você cancelar este formulário depois.',
  variant = 'modal'
}) => {
  const { userClients, canCreateClient } = useData();
  const showCreateAction = allowCreate && canCreateClient;

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [prefillNameForCreate, setPrefillNameForCreate] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const inputId = useId();
  const listboxId = useId();
  const errorId = useId();

  const selectedClient = useMemo(
    () => userClients.find(c => c.id === value) || null,
    [userClients, value]
  );

  // Filtra apenas clientes da carteira autorizada do usuário (userClients)
  const filteredClients = useMemo(() => {
    const cleanQ = normalizeText(query);
    if (!cleanQ) return userClients;

    const digitsQ = cleanDigits(query);
    const alphaQ = cleanAlphanumeric(query);

    return userClients.filter(client => {
      const nameNorm = normalizeText(client.name || '');
      const emailNorm = normalizeText(client.email || '');
      const docDigits = cleanDigits(client.document || '');
      const docAlpha = cleanAlphanumeric(client.document || '');

      return (
        nameNorm.includes(cleanQ) ||
        emailNorm.includes(cleanQ) ||
        (digitsQ.length >= 2 && docDigits.includes(digitsQ)) ||
        (alphaQ.length >= 2 && docAlpha.includes(alphaQ))
      );
    });
  }, [userClients, query]);

  // Total de opções navegáveis por teclado (clientes filtrados + opção "+ Adicionar novo cliente")
  const totalOptions = filteredClients.length + (showCreateAction ? 1 : 0);
  const createOptionIndex = showCreateAction ? filteredClients.length : -1;

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
        setActiveIndex(-1);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Mantém a opção ativa visível na rolagem da lista
  useEffect(() => {
    if (!isOpen || activeIndex < 0 || !listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-option-index="${activeIndex}"]`);
    if (activeEl && typeof (activeEl as HTMLElement).scrollIntoView === 'function') {
      (activeEl as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, isOpen]);

  // Se o texto digitado parecer um nome (não for apenas números/CPF ou e-mail), pré-preenche no modal
  const extractSuggestedName = (rawQuery: string): string => {
    const trimmed = rawQuery.trim();
    if (!trimmed) return '';
    if (trimmed.includes('@')) return '';
    // Se tiver mais dígitos que letras, provavelmente é CPF/CNPJ
    const letters = (trimmed.match(/[A-Za-zÀ-ÿ]/g) || []).length;
    const digits = (trimmed.match(/\d/g) || []).length;
    if (digits > letters) return '';
    return trimmed;
  };

  const handleOpenCreateModal = () => {
    setPrefillNameForCreate(extractSuggestedName(query));
    setIsOpen(false);
    setActiveIndex(-1);
    setIsCreateModalOpen(true);
  };

  const handleSelectClient = (client: Client) => {
    onChange(client.id);
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleClientCreated = (newClient: Client) => {
    onChange(newClient.id);
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
    // Devolve foco ao campo Cliente Outorgante após fechar o modal
    setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(totalOptions > 0 ? 0 : -1);
      } else if (totalOptions > 0) {
        setActiveIndex(prev => (prev + 1) % totalOptions);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(totalOptions > 0 ? totalOptions - 1 : -1);
      } else if (totalOptions > 0) {
        setActiveIndex(prev => (prev <= 0 ? totalOptions - 1 : prev - 1));
      }
      return;
    }

    if (e.key === 'Enter' && isOpen) {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredClients.length) {
        handleSelectClient(filteredClients[activeIndex]);
      } else if (showCreateAction && (activeIndex === createOptionIndex || filteredClients.length === 0)) {
        handleOpenCreateModal();
      }
      return;
    }

    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);
      setQuery('');
      setActiveIndex(-1);
      return;
    }

    if (e.key === 'Tab' && isOpen) {
      setIsOpen(false);
      setQuery('');
      setActiveIndex(-1);
    }
  };

  const activeOptionId =
    isOpen && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined;

  const displayInputValue = isOpen
    ? query
    : selectedClient
    ? `${selectedClient.name}${selectedClient.document ? ` (${formatDisplay(selectedClient.document, 'cpf_cnpj')})` : ''}`
    : '';

  const isModalVariant = variant === 'modal';

  const labelClasses = isModalVariant
    ? 'block text-xs italic font-serif text-[#C2D6DC]'
    : 'block text-xs font-serif font-bold text-dex-navy-950 dark:text-[#F9ECE2]';

  const announcementText = isOpen
    ? filteredClients.length === 0
      ? 'Nenhum cliente encontrado.'
      : filteredClients.length === 1
      ? '1 cliente encontrado.'
      : `${filteredClients.length} clientes encontrados.`
    : '';

  return (
    <div ref={containerRef} className="space-y-1.5 relative">
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {required && <span className="text-dex-coral ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}

      {/* Região ARIA live para leitores de tela */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcementText}
      </span>

      <div className="flex items-stretch gap-2">
        <div className="relative flex-1 min-w-0">
          <Search
            className="w-3.5 h-3.5 text-dex-navy-950/55 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />

          <input
            ref={inputRef}
            id={inputId}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            aria-required={required}
            disabled={disabled}
            autoComplete="off"
            placeholder={
              selectedClient && isOpen
                ? `Atual: ${selectedClient.name} — digite para trocar...`
                : placeholder
            }
            value={displayInputValue}
            onFocus={() => {
              if (!disabled) {
                setIsOpen(true);
                setActiveIndex(filteredClients.length > 0 ? 0 : createOptionIndex);
              }
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className={`w-full pl-9 pr-14 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-navy-950/50 focus:outline-none focus:ring-2 font-serif transition-all ${
              error
                ? 'ring-2 ring-red-500 border border-red-500'
                : 'border border-transparent focus:ring-dex-coral'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          />

          {/* Botão limpar seleção / texto + seta abrir/fechar */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            {(query || (selectedClient && isOpen)) && !disabled && (
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  setQuery('');
                  if (!query && selectedClient) {
                    onChange('');
                  }
                  inputRef.current?.focus();
                }}
                aria-label="Limpar busca de cliente"
                className="p-1 rounded-lg text-dex-navy-950/60 hover:text-dex-navy-950 hover:bg-black/5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                setIsOpen(prev => !prev);
                inputRef.current?.focus();
              }}
              aria-label={isOpen ? 'Fechar lista de clientes' : 'Abrir lista de clientes'}
              className="p-1 rounded-lg text-dex-navy-950/70 hover:text-dex-navy-950 hover:bg-black/5 cursor-pointer"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* Botão "+" compacto ao lado do campo para criar cliente sem precisar abrir a lista */}
        {showCreateAction && !disabled && (
          <button
            type="button"
            onClick={handleOpenCreateModal}
            title="Adicionar novo cliente"
            aria-label="Adicionar novo cliente"
            className="px-3 rounded-xl bg-dex-coral hover:bg-dex-coral-hover text-white flex items-center justify-center gap-1 shadow transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            <span className="hidden sm:inline text-xs font-bold">Novo</span>
          </button>
        )}
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-400 font-serif font-medium flex items-center gap-1">
          <span>•</span>
          <span>{error}</span>
        </p>
      )}

      {/* Listbox Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#12232D] border border-[#366076] rounded-2xl shadow-2xl overflow-hidden">
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Lista de clientes disponíveis"
            className="max-h-60 overflow-y-auto custom-scrollbar divide-y divide-white/5"
          >
            {filteredClients.length === 0 ? (
              <li className="px-4 py-4 text-center space-y-1">
                <p className="text-xs font-serif font-semibold text-white">
                  Nenhum cliente encontrado
                </p>
                <p className="text-[11px] text-[#A6C5CD] font-serif">
                  {userClients.length === 0
                    ? 'Sua carteira ainda não possui clientes cadastrados.'
                    : `Nenhum resultado para "${query.trim()}".`}
                </p>
              </li>
            ) : (
              filteredClients.map((client, idx) => {
                const isSelected = client.id === value;
                const isActive = idx === activeIndex;
                return (
                  <li
                    key={client.id}
                    id={`${listboxId}-opt-${idx}`}
                    data-option-index={idx}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectClient(client);
                    }}
                    className={`px-3.5 py-2.5 flex items-center justify-between gap-2.5 cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-[#1E3A4B] text-white'
                        : isSelected
                        ? 'bg-[#1A3342]/80 text-white'
                        : 'text-[#E2ECF0] hover:bg-[#1A3342]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white/10 text-[#C2D6DC] flex items-center justify-center shrink-0">
                        {client.type === 'PJ' ? (
                          <Building2 className="w-3.5 h-3.5 text-dex-coral" aria-hidden="true" />
                        ) : (
                          <UserIcon className="w-3.5 h-3.5 text-[#72ACBA]" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-serif font-bold text-white truncate">
                          {client.name}
                        </p>
                        <p className="text-[11px] text-[#A6C5CD] font-mono truncate">
                          {formatDisplay(client.document, 'cpf_cnpj')}
                          {client.email ? ` • ${client.email}` : ''}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#48BB78] shrink-0" aria-hidden="true" />
                    )}
                  </li>
                );
              })
            )}

            {/* Opção em destaque ao final da lista: + Adicionar novo cliente */}
            {showCreateAction && (
              <li
                id={`${listboxId}-opt-${createOptionIndex}`}
                data-option-index={createOptionIndex}
                role="option"
                aria-selected={false}
                onMouseEnter={() => setActiveIndex(createOptionIndex)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleOpenCreateModal();
                }}
                className={`sticky bottom-0 px-3.5 py-3 flex items-center gap-2.5 cursor-pointer border-t border-[#366076] transition-colors ${
                  activeIndex === createOptionIndex
                    ? 'bg-dex-coral text-white'
                    : 'bg-[#162B37] hover:bg-dex-coral/90 text-[#F9ECE2] hover:text-white'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-serif font-bold truncate">
                    + Adicionar novo cliente
                    {extractSuggestedName(query) ? ` "${extractSuggestedName(query)}"` : ''}
                  </p>
                  <p className="text-[10px] opacity-85 font-serif">
                    Cadastrar agora sem perder os dados preenchidos
                  </p>
                </div>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Modal/Drawer compartilhado "Novo cliente" — mesma validação e lógica da aba Clientes */}
      {showCreateAction && (
        <ClientModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setTimeout(() => inputRef.current?.focus(), 60);
          }}
          initialName={prefillNameForCreate}
          contextNotice={createContextNotice}
          customSuccessToast="Cliente criado e adicionado à aba Clientes"
          onClientCreated={handleClientCreated}
          nested={true}
        />
      )}
    </div>
  );
};
