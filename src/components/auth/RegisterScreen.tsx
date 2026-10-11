import React, { useState } from 'react';
import { 
  Scale, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  CheckCircle2,
  Building2,
  UserCheck,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

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
      setError('Por favor, preencha todos os campos obrigatórios (*).');
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

      showToast(`Bem-vindo(a) ao Dex! Conta criada com sucesso.`, 'success');
    } catch {
      setError('Ocorreu um erro inesperado ao realizar o cadastro. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex flex-col justify-center items-center py-8 px-4 sm:px-6 relative font-sans text-stone-800">
      {/* Barra Superior Discreta de Navegação */}
      <div className="max-w-[980px] w-full mx-auto mb-4 flex items-center justify-between px-2">
        <button
          onClick={onNavigateToLanding}
          className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao início</span>
        </button>

        {/* Seletor Sutil: Escritório vs Advogado Individual */}
        <div className="inline-flex items-center bg-stone-200/60 p-1 rounded-full border border-stone-200">
          <button
            type="button"
            onClick={() => setAccountType('OFFICE')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              accountType === 'OFFICE'
                ? 'bg-white text-stone-900 shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Escritório</span>
          </button>
          <button
            type="button"
            onClick={() => setAccountType('LAWYER')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              accountType === 'LAWYER'
                ? 'bg-white text-stone-900 shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Advogado Individual</span>
          </button>
        </div>
      </div>

      {/* Card Principal - Design Exato do Mockup */}
      <div className="max-w-[980px] w-full bg-white rounded-[28px] sm:rounded-[34px] border border-amber-200/50 shadow-[0_20px_50px_rgba(0,0,0,0.03),0_0_25px_rgba(245,158,11,0.04)] p-6 sm:p-10 md:p-12 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* COLUNA ESQUERDA: Identidade Visual e Ilustração */}
          <div className="lg:col-span-5 flex flex-col items-center justify-between text-center pb-6 lg:pb-0">
            <div className="w-full flex flex-col items-center">
              {/* Logo Dex com Balança */}
              <div className="flex items-center justify-center gap-2.5">
                <Scale className="w-7 h-7 sm:w-8 sm:h-8 text-stone-800" strokeWidth={1.8} />
                <span className="font-serif font-black text-3xl sm:text-4xl text-stone-900 tracking-tight">
                  Dex
                </span>
              </div>
              <p className="text-stone-700 text-xs sm:text-sm font-normal tracking-wide mt-1">
                Sistema de Advocacia
              </p>

              {/* Título Principal em Serifa */}
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-stone-900 mt-6 sm:mt-7">
                {accountType === 'OFFICE' ? 'Crie seu escritório' : 'Cadastro de Advogado'}
              </h2>
              <p className="text-stone-400 text-xs sm:text-[13px] mt-1 font-sans">
                {accountType === 'OFFICE' ? 'Preencha os dados para comecar' : 'Preencha seus dados para começar'}
              </p>

              {/* Divisor Horizontal Delicado */}
              <div className="w-40 sm:w-48 h-[1px] bg-stone-200/80 my-6 sm:my-7" />
            </div>

            {/* Espaço Inferior: Ilustração Vetorial Minimalista */}
            <div className="w-full flex flex-col items-center justify-center my-auto py-4">
              <div className="w-48 h-44 sm:w-56 sm:h-48 flex items-center justify-center relative">
                {/* Arte linear com traço fino sofisticado */}
                <svg
                  viewBox="0 0 240 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full text-stone-400/80 stroke-current"
                >
                  {/* Base Neoclássica */}
                  <line x1="30" y1="180" x2="210" y2="180" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="45" y1="174" x2="195" y2="174" strokeWidth="1" strokeLinecap="round" />
                  <line x1="60" y1="168" x2="180" y2="168" strokeWidth="1" strokeLinecap="round" />

                  {/* Colunas Arquitetônicas do Templo da Justiça */}
                  <rect x="70" y="80" width="10" height="88" rx="1" strokeWidth="1" strokeDasharray="3 3" />
                  <rect x="115" y="80" width="10" height="88" rx="1" strokeWidth="1.2" />
                  <rect x="160" y="80" width="10" height="88" rx="1" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Frontão / Frontispício Superior */}
                  <polygon points="120,28 40,68 200,68" strokeWidth="1.2" strokeLinejoin="round" />
                  <line x1="50" y1="74" x2="190" y2="74" strokeWidth="1" />

                  {/* Balança Central */}
                  <g className="text-stone-700 stroke-current">
                    {/* Haste Central */}
                    <line x1="120" y1="45" x2="120" y2="140" strokeWidth="1.8" strokeLinecap="round" />
                    {/* Barra Transversal */}
                    <line x1="75" y1="65" x2="165" y2="65" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Ponto de Apoio Superior */}
                    <circle cx="120" cy="45" r="3" strokeWidth="1.5" />

                    {/* Prato Esquerdo */}
                    <line x1="75" y1="65" x2="62" y2="98" strokeWidth="1" />
                    <line x1="75" y1="65" x2="88" y2="98" strokeWidth="1" />
                    <path d="M58 98 Q 75 110 92 98 Z" strokeWidth="1.2" />

                    {/* Prato Direito */}
                    <line x1="165" y1="65" x2="152" y2="98" strokeWidth="1" />
                    <line x1="165" y1="65" x2="178" y2="98" strokeWidth="1" />
                    <path d="M148 98 Q 165 110 182 98 Z" strokeWidth="1.2" />
                  </g>

                  {/* Folhas de Louro / Ramo Delicado */}
                  <path d="M35 150 C 30 135 32 110 45 95" strokeWidth="0.8" strokeDasharray="2 2" />
                  <path d="M205 150 C 210 135 208 110 195 95" strokeWidth="0.8" strokeDasharray="2 2" />
                </svg>
              </div>
              <span className="text-[11px] font-serif italic text-stone-400 mt-2">
                Advocacia, Ética &amp; Tecnologia
              </span>
            </div>

            {/* Rodapé da Coluna Esquerda */}
            <div className="text-[11px] text-stone-400">
              Dex Gestão Jurídica Inteligente
            </div>
          </div>

          {/* DIVISOR VERTICAL (Desktop) */}
          <div className="hidden lg:block w-[1px] bg-stone-200/80 -my-6 self-stretch" />

          {/* COLUNA DIREITA: Formulário com Seções */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            {/* Mensagem de Erro (se houver) */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* ===== MODO ESCRITÓRIO ===== */}
              {accountType === 'OFFICE' && (
                <>
                  {/* SEÇÃO 1: DADOS DO ESCRITÓRIO */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 h-[1px] bg-stone-200/80" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 whitespace-nowrap">
                      DADOS DO ESCRITÓRIO
                    </span>
                    <div className="flex-1 h-[1px] bg-stone-200/80" />
                  </div>

                  {/* Nome do Escritório */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      NOME DO ESCRITÓRIO *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Silva & Associados"
                      value={firmName}
                      onChange={e => setFirmName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white focus:ring-1 focus:ring-stone-400/20 transition-all"
                    />
                  </div>

                  {/* CNPJ e Telefone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        CNPJ
                      </label>
                      <input
                        type="text"
                        placeholder="00.000.000/0000-00"
                        value={cnpj}
                        onChange={e => handleCnpjChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white focus:ring-1 focus:ring-stone-400/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        TELEFONE
                      </label>
                      <input
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={phone}
                        onChange={e => handlePhoneChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white focus:ring-1 focus:ring-stone-400/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Área Principal e Endereço */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        ÁREA PRINCIPAL *
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={primaryArea}
                          onChange={e => setPrimaryArea(e.target.value)}
                          className="w-full appearance-none px-3.5 py-2.5 bg-[#fafafa] border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white focus:ring-1 focus:ring-stone-400/20 transition-all pr-8 cursor-pointer"
                        >
                          <option value="">Selecione a area</option>
                          <option value="Direito Civil">Direito Civil</option>
                          <option value="Direito Trabalhista">Direito Trabalhista</option>
                          <option value="Direito Empresarial">Direito Empresarial & Societário</option>
                          <option value="Direito Tributário">Direito Tributário</option>
                          <option value="Direito Penal">Direito Penal & Criminal</option>
                          <option value="Direito de Família">Direito de Família & Sucessões</option>
                          <option value="Direito Previdenciário">Direito Previdenciário</option>
                          <option value="Direito Imobiliário">Direito Imobiliário</option>
                          <option value="Full Service">Full Service / Multidisciplinar</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        ENDEREÇO
                      </label>
                      <input
                        type="text"
                        placeholder="Rua, N, Cidade/UF"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white focus:ring-1 focus:ring-stone-400/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* SEÇÃO 2: DADOS DO ADMINISTRADOR */}
                  <div className="flex items-center gap-3 pt-3">
                    <div className="flex-1 h-[1px] bg-stone-200/80" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 whitespace-nowrap">
                      DADOS DO ADMINISTRADOR
                    </span>
                    <div className="flex-1 h-[1px] bg-stone-200/80" />
                  </div>

                  {/* Nome Completo */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      NOME COMPLETO *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Seu nome completo"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white focus:ring-1 focus:ring-stone-400/20 transition-all"
                    />
                  </div>

                  {/* E-mail e OAB */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        E-MAIL *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="seu@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white focus:ring-1 focus:ring-stone-400/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        OAB
                      </label>
                      <input
                        type="text"
                        placeholder="UF000000"
                        value={oab}
                        onChange={e => setOab(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white focus:ring-1 focus:ring-stone-400/20 uppercase transition-all"
                      />
                    </div>
                  </div>

                  {/* Senha e Confirmar Senha */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        SENHA *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Minimo 6 caracteres"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white focus:ring-1 focus:ring-stone-400/20 pr-9 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        CONFIRMAR SENHA *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Repita a senha"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white focus:ring-1 focus:ring-stone-400/20 pr-9 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Envio: Criar Escritório */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 sm:py-3.5 bg-[#222222] hover:bg-[#111111] text-white font-medium text-xs sm:text-sm rounded-full transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Criando seu escritório...</span>
                        </>
                      ) : (
                        <span>Criar Escritório</span>
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* ===== MODO ADVOGADO INDIVIDUAL ===== */}
              {accountType === 'LAWYER' && (
                <>
                  {/* Sub-seleção: Autônomo vs Vinculado */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                      Como atuará no sistema?
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-stone-200 cursor-pointer">
                        <input
                          type="radio"
                          name="lawyerAffiliation"
                          checked={lawyerAffiliation === 'INDEPENDENT'}
                          onChange={() => setLawyerAffiliation('INDEPENDENT')}
                          className="text-stone-800"
                        />
                        <span className="font-medium text-stone-800">Advogado Autônomo</span>
                      </label>

                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-stone-200 cursor-pointer">
                        <input
                          type="radio"
                          name="lawyerAffiliation"
                          checked={lawyerAffiliation === 'LINKED'}
                          onChange={() => setLawyerAffiliation('LINKED')}
                          className="text-stone-800"
                        />
                        <span className="font-medium text-stone-800">Vincular a Escritório</span>
                      </label>
                    </div>

                    {lawyerAffiliation === 'LINKED' && (
                      <div className="pt-1">
                        <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                          Código ou E-mail da Banca *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: DEX-4819 ou contato@escritorio.adv.br"
                          value={officeCodeOrEmail}
                          onChange={e => setOfficeCodeOrEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* SEÇÃO 1: DADOS PROFISSIONAIS */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 h-[1px] bg-stone-200/80" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 whitespace-nowrap">
                      DADOS PROFISSIONAIS
                    </span>
                    <div className="flex-1 h-[1px] bg-stone-200/80" />
                  </div>

                  {/* Nome Completo */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      NOME COMPLETO *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Seu nome completo"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white focus:ring-1 focus:ring-stone-400/20 transition-all"
                    />
                  </div>

                  {/* OAB e Telefone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        OAB COM UF *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 184920/SP"
                        value={oab}
                        onChange={e => setOab(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white focus:ring-1 focus:ring-stone-400/20 uppercase transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        TELEFONE / WHATSAPP
                      </label>
                      <input
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={phone}
                        onChange={e => handlePhoneChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white focus:ring-1 focus:ring-stone-400/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Área Principal */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      ÁREA DE ATUAÇÃO PRINCIPAL
                    </label>
                    <div className="relative">
                      <select
                        value={primaryArea}
                        onChange={e => setPrimaryArea(e.target.value)}
                        className="w-full appearance-none px-3.5 py-2.5 bg-[#fafafa] border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white focus:ring-1 focus:ring-stone-400/20 transition-all pr-8 cursor-pointer"
                      >
                        <option value="">Selecione a área de atuação</option>
                        <option value="Direito Civil">Direito Civil</option>
                        <option value="Direito Trabalhista">Direito Trabalhista</option>
                        <option value="Direito Empresarial">Direito Empresarial & Societário</option>
                        <option value="Direito Tributário">Direito Tributário</option>
                        <option value="Direito Penal">Direito Penal & Criminal</option>
                        <option value="Direito de Família">Direito de Família & Sucessões</option>
                        <option value="Direito Previdenciário">Direito Previdenciário</option>
                        <option value="Direito Imobiliário">Direito Imobiliário</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* SEÇÃO 2: DADOS DE ACESSO */}
                  <div className="flex items-center gap-3 pt-3">
                    <div className="flex-1 h-[1px] bg-stone-200/80" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 whitespace-nowrap">
                      DADOS DE ACESSO
                    </span>
                    <div className="flex-1 h-[1px] bg-stone-200/80" />
                  </div>

                  {/* E-mail */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      E-MAIL *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="seu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white focus:ring-1 focus:ring-stone-400/20 transition-all"
                    />
                  </div>

                  {/* Senha e Confirmação */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        SENHA *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Minimo 6 caracteres"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white focus:ring-1 focus:ring-stone-400/20 pr-9 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        CONFIRMAR SENHA *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Repita a senha"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white focus:ring-1 focus:ring-stone-400/20 pr-9 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Envio: Criar Conta de Advogado */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 sm:py-3.5 bg-[#222222] hover:bg-[#111111] text-white font-medium text-xs sm:text-sm rounded-full transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Cadastrando advogado...</span>
                        </>
                      ) : (
                        <span>Criar Conta de Advogado</span>
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* Rodapé: Link de Login idêntico ao mockup */}
              <div className="text-center text-xs text-stone-500 pt-2">
                Ja tem conta?{' '}
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-[#c28840] hover:text-[#9e6826] font-medium transition-colors cursor-pointer"
                >
                  Fazer login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
