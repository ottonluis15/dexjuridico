import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UserPlus, AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { MaskedInput } from '../common/MaskedInput';
import { Client, ClientType, ClientStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { validateCPFOrCNPJ, validatePhone, validateEmail, validateCEP } from '../../utils/validators';
import { maskCPFOrCNPJ, maskPhone, maskCEP, formatDisplay, unmaskAlphanumeric, unmaskDigits } from '../../utils/masks';

export interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: Client | null;
  initialClient?: Client | null;
  /** Pré-preenche o campo Nome quando aberto a partir de uma busca no combobox */
  initialName?: string;
  /** Aviso contextual exibido no topo (ex: "O cliente será salvo na aba Clientes") */
  contextNotice?: string;
  /** Callback acionado após criar um novo cliente ou selecionar um cliente duplicado existente */
  onClientCreated?: (client: Client) => void;
  /** Mensagem personalizada de toast ao criar o cliente */
  customSuccessToast?: string;
  /** Quando aberto sobre outro modal (ex: tela de Processo/Financeiro), usa z-index superior e drawer no mobile */
  nested?: boolean;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  clientToEdit,
  initialClient,
  initialName = '',
  contextNotice,
  onClientCreated,
  customSuccessToast,
  nested = false
}) => {
  const activeClient = clientToEdit || initialClient || null;
  const { createClientSafe, updateClient, lawyers, showToast } = useData();
  const { currentUser } = useAuth();

  const currentLawyer = useMemo(
    () => lawyers.find(l => l.userId === currentUser?.id) || null,
    [lawyers, currentUser?.id]
  );

  // Filtra advogados visíveis apenas do mesmo escritório (ou o próprio autônomo)
  const visibleLawyers = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.isIndependent || !currentUser.officeId) {
      return lawyers.filter(l => l.userId === currentUser.id || l.id === currentLawyer?.id);
    }
    return lawyers.filter(l => l.officeId === currentUser.officeId);
  }, [lawyers, currentUser, currentLawyer]);

  const [name, setName] = useState('');
  const [type, setType] = useState<ClientType>('PF');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [zipCode, setZipCode] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ClientStatus>('ACTIVE');
  const [linkedLawyerId, setLinkedLawyerId] = useState('');

  // Estados de erro por campo e alertas de regra de negócio
  const [docError, setDocError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [cepError, setCepError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<'PLAN_LIMIT' | 'DUPLICATE' | 'VALIDATION' | 'FORBIDDEN' | null>(null);
  const [duplicateClient, setDuplicateClient] = useState<Client | null>(null);

  // Controle de envio (evita duplo clique) e confirmação de descarte
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const isSubmittingRef = useRef(false);
  const idempotencyKeyRef = useRef<string>('');
  const initialSnapshotRef = useRef<string>('');

  useEffect(() => {
    if (!isOpen) return;

    idempotencyKeyRef.current = `idem_cli_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    isSubmittingRef.current = false;
    setIsSubmitting(false);
    setShowDiscardConfirm(false);

    const defaultLawyerId = currentLawyer?.id || visibleLawyers[0]?.id || '';

    if (activeClient) {
      const nextName = activeClient.name;
      const nextDoc = maskCPFOrCNPJ(activeClient.document, activeClient.type);
      const nextEmail = activeClient.email;
      const nextPhone = maskPhone(activeClient.phone);
      const nextStreet = activeClient.address.street;
      const nextNum = activeClient.address.number;
      const nextZip = maskCEP(activeClient.address.zipCode);
      const nextNotes = activeClient.notes || '';

      setName(nextName);
      setType(activeClient.type);
      setDocument(nextDoc);
      setEmail(nextEmail);
      setPhone(nextPhone);
      setStreet(nextStreet);
      setNumber(nextNum);
      setComplement(activeClient.address.complement || '');
      setNeighborhood(activeClient.address.neighborhood);
      setCity(activeClient.address.city);
      setState(activeClient.address.state);
      setZipCode(nextZip);
      setNotes(nextNotes);
      setStatus(activeClient.status);
      setLinkedLawyerId(activeClient.linkedLawyerId || '');

      initialSnapshotRef.current = JSON.stringify({
        name: nextName,
        document: nextDoc,
        email: nextEmail,
        phone: nextPhone,
        street: nextStreet,
        number: nextNum,
        zipCode: nextZip,
        notes: nextNotes
      });
    } else {
      const prefillName = (initialName || '').trim();
      setName(prefillName);
      setType('PF');
      setDocument('');
      setEmail('');
      setPhone('');
      setStreet('');
      setNumber('');
      setComplement('');
      setNeighborhood('');
      setCity('São Paulo');
      setState('SP');
      setZipCode('');
      setNotes('');
      setStatus('ACTIVE');
      setLinkedLawyerId(defaultLawyerId);

      initialSnapshotRef.current = JSON.stringify({
        name: prefillName,
        document: '',
        email: '',
        phone: '',
        street: '',
        number: '',
        zipCode: '',
        notes: ''
      });
    }

    setDocError(null);
    setPhoneError(null);
    setEmailError(null);
    setCepError(null);
    setGeneralError(null);
    setErrorCode(null);
    setDuplicateClient(null);
  }, [activeClient, isOpen, initialName]);

  const hasUnsavedChanges = () => {
    const currentSnapshot = JSON.stringify({
      name,
      document,
      email,
      phone,
      street,
      number,
      zipCode,
      notes
    });
    return currentSnapshot !== initialSnapshotRef.current;
  };

  const handleRequestClose = () => {
    if (isSubmittingRef.current) return;
    if (hasUnsavedChanges() && !showDiscardConfirm) {
      setShowDiscardConfirm(true);
      return;
    }
    setShowDiscardConfirm(false);
    onClose();
  };

  const handleSelectExistingDuplicate = () => {
    if (!duplicateClient) return;
    if (onClientCreated) {
      onClientCreated(duplicateClient);
    }
    showToast(`Cliente existente "${duplicateClient.name}" selecionado.`, 'info');
    setShowDiscardConfirm(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    setDocError(null);
    setPhoneError(null);
    setEmailError(null);
    setCepError(null);
    setGeneralError(null);
    setErrorCode(null);
    setDuplicateClient(null);
    setShowDiscardConfirm(false);

    const cleanName = name.replace(/\s+/g, ' ').trim();
    if (cleanName.length < 2) {
      setGeneralError('Informe o nome completo ou razão social do cliente.');
      return;
    }

    const docVal = validateCPFOrCNPJ(document, type);
    if (!docVal.isValid) {
      setDocError(docVal.error || 'Documento inválido.');
      return;
    }

    const phoneVal = validatePhone(phone);
    if (!phoneVal.isValid) {
      setPhoneError(phoneVal.error || 'Telefone inválido.');
      return;
    }

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      setEmailError(emailVal.error || 'E-mail inválido.');
      return;
    }

    if (zipCode.trim()) {
      const cepVal = validateCEP(zipCode);
      if (!cepVal.isValid) {
        setCepError(cepVal.error || 'CEP inválido.');
        return;
      }
    }

    // Normaliza documento gravado no banco (apenas caracteres úteis; suporta CNPJ Alfanumérico 2026)
    const normalizedDoc =
      type === 'PJ' || /[A-Za-z]/.test(document)
        ? unmaskAlphanumeric(document)
        : unmaskDigits(document);

    const payload = {
      name: cleanName,
      type,
      document: normalizedDoc,
      email: email.trim().toLowerCase(),
      phone: unmaskDigits(phone),
      address: {
        street: street.trim() || 'Rua Principal',
        number: number.trim() || 'S/N',
        complement: complement.trim(),
        neighborhood: neighborhood.trim() || 'Centro',
        city: city.trim() || 'São Paulo',
        state: state.trim() || 'SP',
        zipCode: unmaskDigits(zipCode) || '01000000'
      },
      notes: notes.trim(),
      status,
      linkedLawyerId: linkedLawyerId || undefined
    };

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      if (activeClient) {
        updateClient(activeClient.id, payload);
        onClose();
      } else {
        const result = createClientSafe(payload, {
          idempotencyKey: idempotencyKeyRef.current,
          customToast: customSuccessToast,
          silentToast: false
        });

        if (!result.success || !result.client) {
          setGeneralError(result.error || 'Não foi possível salvar o cliente.');
          setErrorCode(result.code || 'VALIDATION');
          if (result.duplicateClient) {
            setDuplicateClient(result.duplicateClient);
          }
          // Gera nova chave de idempotência para nova tentativa após o usuário corrigir os dados
          idempotencyKeyRef.current = `idem_cli_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
          return;
        }

        if (onClientCreated) {
          onClientCreated(result.client);
        }
        onClose();
      }
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleRequestClose}
      title={activeClient ? 'Editar Cadastro do Cliente' : 'Novo Cliente'}
      subtitle={activeClient ? 'Atualize as informações cadastrais e contatos' : 'Preencha os dados civis ou societários'}
      maxWidth="3xl"
      icon={<UserPlus className="w-5 h-5 text-dex-coral" />}
      zIndexClass={nested ? 'z-[60]' : 'z-50'}
      drawerOnMobile={nested}
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Aviso contextual (quando aberto dentro de Processo/Financeiro) */}
        {contextNotice && !activeClient && (
          <div className="p-3 rounded-xl bg-[#1A3646] border border-[#4A808E]/50 text-[#D4E6EC] text-xs font-serif flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#72ACBA] shrink-0 mt-0.5" aria-hidden="true" />
            <span>{contextNotice}</span>
          </div>
        )}

        {/* Confirmação de descarte quando há dados preenchidos */}
        {showDiscardConfirm && (
          <div
            role="alertdialog"
            aria-label="Confirmar descarte de cadastro"
            className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/50 text-amber-100 text-xs font-serif flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" aria-hidden="true" />
              <span>Há dados preenchidos neste cadastro. Deseja realmente descartar?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold cursor-pointer"
              >
                Continuar editando
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardConfirm(false);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
              >
                Descartar
              </button>
            </div>
          </div>
        )}

        {/* Tipo de Cliente (PF vs PJ) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setType('PF');
              setDocError(null);
              setDuplicateClient(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              type === 'PF'
                ? 'bg-dex-coral text-white shadow'
                : 'bg-white/10 text-[#C2D6DC] hover:text-white'
            }`}
          >
            Pessoa Física (CPF)
          </button>
          <button
            type="button"
            onClick={() => {
              setType('PJ');
              setDocError(null);
              setDuplicateClient(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              type === 'PJ'
                ? 'bg-dex-coral text-white shadow'
                : 'bg-white/10 text-[#C2D6DC] hover:text-white'
            }`}
          >
            Pessoa Jurídica (CNPJ)
          </button>
        </div>

        {/* Alerta de Duplicidade com botão para selecionar cliente existente */}
        {errorCode === 'DUPLICATE' && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-amber-500/15 border border-amber-400/60 text-amber-100 text-xs font-serif space-y-3"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <p className="font-bold text-amber-200">Este cliente já existe</p>
                <p className="text-amber-100/90 leading-relaxed">{generalError}</p>
                {duplicateClient && (
                  <p className="text-[11px] text-amber-200/90 font-mono">
                    {duplicateClient.name} • {formatDisplay(duplicateClient.document, 'cpf_cnpj')}
                  </p>
                )}
              </div>
            </div>
            {duplicateClient && onClientCreated && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSelectExistingDuplicate}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#48BB78] hover:bg-[#3EA368] text-white text-xs font-bold shadow cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Selecionar cliente existente</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mensagem Geral de Erro (Validação / Limite de Plano / Permissão) */}
        {generalError && errorCode !== 'DUPLICATE' && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-500/20 border border-red-400/60 text-red-100 text-xs font-serif flex items-start gap-2.5"
          >
            <AlertTriangle className="w-4 h-4 text-red-300 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Linha 1: Nome / Razão Social e CPF/CNPJ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              {type === 'PF' ? 'Nome Completo*' : 'Razão Social / Nome Empresarial*'}
            </label>
            <input
              type="text"
              required
              placeholder={type === 'PF' ? 'Ex: Carlos Alberto da Silva' : 'Ex: Metalúrgica Progresso S/A'}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-navy-950/50 focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>

          <MaskedInput
            mask="cpf_cnpj"
            clientType={type}
            label={type === 'PF' ? 'CPF' : 'CNPJ'}
            required
            value={document}
            onChange={(formatted) => {
              setDocument(formatted);
              setDocError(null);
              if (errorCode === 'DUPLICATE') {
                setDuplicateClient(null);
                setGeneralError(null);
                setErrorCode(null);
              }
            }}
            error={docError}
          />
        </div>

        {/* Linha 2: E-mail e Telefone / WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              E-mail de Contato*
            </label>
            <input
              type="email"
              required
              placeholder="cliente@email.com"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-navy-950/50 focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
            {emailError && (
              <p role="alert" className="text-xs text-red-400 font-serif">• {emailError}</p>
            )}
          </div>

          <MaskedInput
            mask="phone"
            label="Telefone / Celular (WhatsApp)"
            required
            value={phone}
            onChange={(formatted) => {
              setPhone(formatted);
              setPhoneError(null);
            }}
            error={phoneError}
          />
        </div>

        {/* Linha 3: Endereço (CEP, Logradouro, Número) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4">
            <MaskedInput
              mask="cep"
              label="CEP"
              value={zipCode}
              onChange={(formatted) => {
                setZipCode(formatted);
                setCepError(null);
              }}
              error={cepError}
              placeholder="00000-000"
            />
          </div>

          <div className="sm:col-span-5 space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Logradouro (Rua, Av)
            </label>
            <input
              type="text"
              placeholder="Ex: Av. Rio Branco"
              value={street}
              onChange={e => setStreet(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-navy-950/50 focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Número / Sala
            </label>
            <input
              type="text"
              placeholder="Ex: 120, Sala 4"
              value={number}
              onChange={e => setNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-navy-950/50 focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            />
          </div>
        </div>

        {/* Linha 4: Advogado Responsável e Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Advogado da Banca Responsável
            </label>
            <select
              value={linkedLawyerId}
              onChange={e => setLinkedLawyerId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            >
              <option value="">Sem advogado específico</option>
              {visibleLawyers.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.oab})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs italic font-serif text-[#C2D6DC]">
              Status na Carteira
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as ClientStatus)}
              className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
            >
              <option value="ACTIVE">Ativo com Processos</option>
              <option value="PROSPECT">Prospect / Em Negociação</option>
              <option value="INACTIVE">Inativo / Encerrado</option>
            </select>
          </div>
        </div>

        {/* Anotações */}
        <div className="space-y-1">
          <label className="block text-xs italic font-serif text-[#C2D6DC]">
            Observações Gerais & Histórico do Cliente
          </label>
          <textarea
            rows={2}
            placeholder="Informações adicionais, indicações, observações..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-navy-950/50 focus:outline-none focus:ring-2 focus:ring-dex-coral font-serif"
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#214154]/70">
          <button
            type="button"
            onClick={handleRequestClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-dex-coral hover:bg-dex-coral-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold shadow transition-all hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
            <span>
              {isSubmitting
                ? 'Salvando...'
                : activeClient
                ? 'Salvar Alterações'
                : 'Salvar Cliente'}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
