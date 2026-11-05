import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Building2,
  UserCheck,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DexLogo } from '../common/DexLogo';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onNavigateToLanding: () => void;
  initialPlan?: string;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onNavigateToLanding,
  initialPlan = 'Escritório Pro'
}) => {
  const { registerUser } = useAuth();
  const { showToast } = useData();

  // Tipo de cadastro: Escritório vs Advogado Individual
  const [accountType, setAccountType] = useState<'OFFICE' | 'LAWYER'>('OFFICE');

  // Modalidade de Advogado (se for LAWYER)
  const [lawyerAffiliation, setLawyerAffiliation] = useState<'INDEPENDENT' | 'LINKED'>('INDEPENDENT');
  const [officeCodeOrEmail, setOfficeCodeOrEmail] = useState('');

  // Dados do Escritório
  const [firmName, setFirmName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [primaryArea, setPrimaryArea] = useState('');
  const [address, setAddress] = useState('');

  // Dados do Administrador / Advogado
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [oab, setOab] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Máscara amigável de CNPJ: 00.000.000/0000-00
  const handleCnpjChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 14);
    let formatted = raw;
    if (raw.length > 12) {
      formatted = raw.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})$/, '$1.$2.$3/$4-$5');
    } else if (raw.length > 8) {
      formatted = raw.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})$/, '$1.$2.$3/$4');
    } else if (raw.length > 5) {
      formatted = raw.replace(/^(\d{2})(\d{3})(\d{1,3})$/, '$1.$2.$3');
    } else if (raw.length > 2) {
      formatted = raw.replace(/^(\d{2})(\d{1,3})$/, '$1.$2');
    }
    setCnpj(formatted);
  };

  // Máscara amigável de Telefone: (00) 00000-0000
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 10) {
      formatted = raw.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (raw.length > 6) {
      formatted = raw.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (raw.length > 2) {
      formatted = raw.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    }
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações gerais
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (accountType === 'OFFICE' && !firmName.trim()) {
      setError('Informe o nome do escritório.');
      return;
    }

    if (accountType === 'LAWYER' && lawyerAffiliation === 'LINKED' && !officeCodeOrEmail.trim()) {
      setError('Informe o código ou e-mail do escritório ao qual deseja se vincular.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await registerUser({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: accountType === 'OFFICE' ? 'ADMIN' : 'LAWYER',
        oab: oab.trim().toUpperCase() || 'OAB/PENDENTE',
        phone: phone.trim() || undefined,
        firmName: accountType === 'OFFICE' ? firmName.trim() : undefined,
        cnpj: accountType === 'OFFICE' ? cnpj.trim() : undefined,
        address: address.trim() || undefined,
        primaryArea: primaryArea.trim() || undefined,
        plan: accountType === 'OFFICE' ? initialPlan : 'Advogado Individual',
        isIndependent: accountType === 'LAWYER' && lawyerAffiliation === 'INDEPENDENT',
        officeCodeOrEmail: accountType === 'LAWYER' && lawyerAffiliation === 'LINKED' ? officeCodeOrEmail.trim() : undefined
      });

      if (!res.success) {
        setError(res.error || 'Erro ao realizar cadastro.');
        setIsSubmitting(false);
        return;
      }

      showToast(`Bem-vindo ao Dex! Conta criada com sucesso.`, 'success');
    } catch {
      setError('Ocorreu um erro inesperado ao realizar o cadastro. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dex-cream flex flex-col justify-center items-center py-8 px-4 sm:px-6 relative font-serif text-dex-navy-950 overflow-x-hidden selection:bg-dex-coral selection:text-white">
      {/* PENAS DECORATIVAS AO REDOR DO CARD (Anexo 3) */}
      {/* Pena 2 no canto superior esquerdo */}
      <div className="absolute top-10 left-6 sm:top-14 sm:left-16 pointer-events-none z-0">
        <img
          src="/img/pena2.png"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          width="130"
          height="160"
          className="w-20 sm:w-28 h-auto drop-shadow-sm opacity-90 animate-feather-drift"
        />
      </div>

      {/* Pena 4 no canto inferior esquerdo */}
      <div className="absolute bottom-12 left-8 sm:bottom-16 sm:left-24 pointer-events-none z-0">
        <img
          src="/img/pena4.png"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          width="140"
          height="140"
          className="w-20 sm:w-28 h-auto drop-shadow-sm opacity-90"
        />
      </div>

      {/* Pena 5 no canto superior direito */}
      <div className="absolute top-10 right-8 sm:top-12 sm:right-20 pointer-events-none z-0">
        <img
          src="/img/pena5.png"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          width="130"
          height="190"
          className="w-20 sm:w-28 h-auto drop-shadow-sm opacity-90 animate-feather-drift"
        />
      </div>

      {/* Pena 3 grande no canto inferior direito */}
      <div className="absolute bottom-8 right-6 sm:bottom-12 sm:right-16 pointer-events-none z-0">
        <img
          src="/img/pena3.png"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          width="150"
          height="190"
          className="w-24 sm:w-36 h-auto drop-shadow-sm opacity-95"
        />
      </div>

      {/* Barra de Navegação Superior e Seletor de Tipo */}
      <div className="max-w-[1020px] w-full mx-auto mb-4 flex items-center justify-between px-2 relative z-10">
        <button
          onClick={onNavigateToLanding}
          className="flex items-center gap-1.5 text-xs text-dex-support hover:text-dex-navy-950 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao início</span>
        </button>

        {/* Seletor Sutil: Escritório vs Advogado Individual */}
        <div role="group" aria-label="Tipo de conta" className="inline-flex items-center bg-[#E5D7CC] p-1 rounded-full border border-dex-border/80">
          <button
            type="button"
            onClick={() => setAccountType('OFFICE')}
            aria-pressed={accountType === 'OFFICE'}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              accountType === 'OFFICE'
                ? 'bg-dex-navy-950 text-white shadow-sm font-semibold'
                : 'text-dex-navy-950/70 hover:text-dex-navy-950'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Escritório</span>
          </button>
          <button
            type="button"
            onClick={() => setAccountType('LAWYER')}
            aria-pressed={accountType === 'LAWYER'}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              accountType === 'LAWYER'
                ? 'bg-dex-navy-950 text-white shadow-sm font-semibold'
                : 'text-dex-navy-950/70 hover:text-dex-navy-950'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Advogado Individual</span>
          </button>
        </div>
      </div>

      {/* CARD PRINCIPAL PÊSSEGO (Anexo 3) */}
      <div className="max-w-[1020px] w-full bg-dex-peach rounded-[28px] sm:rounded-[36px] shadow-2xl p-6 sm:p-10 lg:p-12 relative z-10 border border-[#D5B093]/70">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* COLUNA ESQUERDA: Logo, Textos e Corvo 2 (Anexo 3) */}
          <div className="lg:col-span-4 flex flex-col justify-between items-center lg:items-start text-center lg:text-left border-b lg:border-b-0 lg:border-r border-[#35474B]/40 pb-8 lg:pb-0 lg:pr-8">
            <div className="space-y-4 w-full flex flex-col items-center lg:items-start">
              {/* Logo com Balança e Texto Dex */}
              <DexLogo variant="dark" size="lg" />
              <p className="text-xs sm:text-sm text-dex-navy-950/80 italic font-serif">
                Sistema de Advocacia
              </p>

              {/* Título Principal */}
              <div className="pt-2">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-dex-navy-950 leading-tight">
                  {accountType === 'OFFICE' ? 'Crie seu escritório' : 'Cadastro Individual'}
                </h1>
                <p className="text-xs sm:text-sm text-dex-support italic mt-1">
                  Preencha os dados para começar
                </p>
              </div>

              {/* Linha horizontal decorativa */}
              <div className="w-3/4 lg:w-full h-[1px] bg-[#35474B]/40 my-3" />
            </div>

            {/* Ilustração corvo2.png na coluna esquerda (Anexo 3) */}
            <div className="w-full flex justify-center lg:justify-start pt-4 pointer-events-none">
              <img
                src="/img/corvo2.png"
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                width="220"
                height="220"
                className="w-44 sm:w-52 h-auto drop-shadow-md select-none transform hover:scale-105 transition-transform"
              />
            </div>
          </div>

          {/* COLUNA DIREITA: Formulário com Inputs Cinza-Azulado (Anexo 3) */}
          <div className="lg:col-span-8 flex flex-col justify-center">
            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-dex-coral/20 border border-dex-coral/60 text-dex-navy-950 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* DADOS DO ESCRITÓRIO OU TIPO DE VÍNCULO */}
              {accountType === 'OFFICE' ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-xs sm:text-sm italic font-serif text-dex-navy-950/90 font-medium">
                      Dados do escritório
                    </span>
                  </div>

                  {/* Nome do escritório (Largura Total) */}
                  <div className="space-y-1">
                    <label className="block text-xs italic font-serif text-dex-navy-950">
                      Nome do escritório
                    </label>
                    <input
                      type="text"
                      required
                      value={firmName}
                      onChange={(e) => setFirmName(e.target.value)}
                      placeholder="Ex: Moreira & Associados Advocacia"
                      className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark transition-all"
                    />
                  </div>

                  {/* Cnpj e Telefone (Lado a Lado) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs italic font-serif text-dex-navy-950">
                        Cnpj
                      </label>
                      <input
                        type="text"
                        value={cnpj}
                        onChange={(e) => handleCnpjChange(e.target.value)}
                        placeholder="00.000.000/0000-00"
                        className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs italic font-serif text-dex-navy-950">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark transition-all"
                      />
                    </div>
                  </div>

                  {/* Área Principal e Endereço (Lado a Lado) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs italic font-serif text-dex-navy-950">
                        Área Principal
                      </label>
                      <input
                        type="text"
                        value={primaryArea}
                        onChange={(e) => setPrimaryArea(e.target.value)}
                        placeholder="Ex: Cível, Trabalhista, Tributário"
                        className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs italic font-serif text-dex-navy-950">
                        Endereço
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ex: Av. Paulista, 1500 - SP"
                        className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark transition-all"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-xs sm:text-sm italic font-serif text-dex-navy-950/90 font-medium">
                      Modalidade do Advogado
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLawyerAffiliation('INDEPENDENT')}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                        lawyerAffiliation === 'INDEPENDENT'
                          ? 'bg-dex-navy-950 text-white border-dex-navy-950 shadow'
                          : 'bg-dex-input text-dex-navy-950 border-transparent hover:bg-dex-beige'
                      }`}
                    >
                      Advogado Autônomo
                    </button>
                    <button
                      type="button"
                      onClick={() => setLawyerAffiliation('LINKED')}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                        lawyerAffiliation === 'LINKED'
                          ? 'bg-dex-navy-950 text-white border-dex-navy-950 shadow'
                          : 'bg-dex-input text-dex-navy-950 border-transparent hover:bg-dex-beige'
                      }`}
                    >
                      Vinculado a Escritório
                    </button>
                  </div>

                  {lawyerAffiliation === 'LINKED' && (
                    <div className="space-y-1 pt-1">
                      <label className="block text-xs italic font-serif text-dex-navy-950">
                        Código ou E-mail do Escritório
                      </label>
                      <input
                        type="text"
                        required
                        value={officeCodeOrEmail}
                        onChange={(e) => setOfficeCodeOrEmail(e.target.value)}
                        placeholder="admin@escritorio.adv.br ou código DEX-XXXX"
                        className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* SEPARADOR CENTRAL COM DADOS DO ADMINISTRADOR / ADVOGADO */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1 h-[1px] bg-[#35474B]/40" />
                <span className="text-xs sm:text-sm italic font-serif text-dex-navy-950/90 font-medium shrink-0">
                  {accountType === 'OFFICE' ? 'Dados do administrador' : 'Dados do profissional'}
                </span>
                <div className="flex-1 h-[1px] bg-[#35474B]/40" />
              </div>

              {/* Nome completo (Largura Total) */}
              <div className="space-y-1">
                <label className="block text-xs italic font-serif text-dex-navy-950">
                  Nome completo
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Dra. Helena Moreira"
                  className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark transition-all"
                />
              </div>

              {/* E-mail e OAB* (Lado a Lado) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="block text-xs italic font-serif text-dex-navy-950">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@escritorio.adv.br"
                    className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs italic font-serif text-dex-navy-950">
                    OAB*
                  </label>
                  <input
                    type="text"
                    required
                    value={oab}
                    onChange={(e) => setOab(e.target.value)}
                    placeholder="Ex: SP 123.456"
                    className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark transition-all"
                  />
                </div>
              </div>

              {/* Senha e Confirmar senha (Lado a Lado - Corrigido "senha" para "Senha" como solicitado) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs italic font-serif text-dex-navy-950">
                      Senha
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-dex-support hover:text-dex-navy-950"
                      tabIndex={-1}
                    >
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 dígitos"
                    className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs italic font-serif text-dex-navy-950">
                      Confirmar senha
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-[11px] text-dex-support hover:text-dex-navy-950"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full px-4 py-2.5 rounded-xl bg-dex-input text-dex-navy-950 text-xs sm:text-sm placeholder:text-dex-support/70 focus:outline-none focus:ring-2 focus:ring-dex-slate-dark transition-all"
                  />
                </div>
              </div>

              {/* BOTÃO CRIAR ESCRITÓRIO (Slate Escuro - Anexo 3) */}
              <div className="pt-3 text-center space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto min-w-[220px] px-8 py-3 bg-dex-slate-dark hover:bg-dex-slate-darkHover text-white text-sm font-semibold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? 'Criando conta...' : (accountType === 'OFFICE' ? 'Criar escritório' : 'Criar minha conta')}
                </button>

                {/* LINK FAZER LOGIN (Terracota - Anexo 3) */}
                <div className="text-xs text-dex-navy-950">
                  <span>Já tem conta? </span>
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="text-dex-terracotta hover:underline font-semibold cursor-pointer italic"
                  >
                    fazer Login
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
