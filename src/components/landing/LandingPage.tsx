import React, { useState, useRef, useEffect } from 'react';
import { 
  Scale, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  FileText, 
  DollarSign, 
  ChevronDown, 
  Play, 
  Check, 
  Building2, 
  Award,
  Globe,
  ExternalLink,
  Bot,
  Calendar,
  Layers,
  FolderKanban,
  Sun,
  Moon,
  Menu,
  X,
  AlertOctagon,
  AlertTriangle,
  Info
} from 'lucide-react';
import { DexLogo } from '../common/DexLogo';
import { DecorativeBars, DecorativeDots } from '../common/DecorativeBars';
import { HeroDashboardMockup } from './HeroDashboardMockup';
import { useTheme } from '../../context/ThemeContext';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: (plan?: string) => void;
  onBackToApp?: () => void;
  isLoggedIn?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToRegister,
  onBackToApp,
  isLoggedIn = false
}) => {
  const { effectiveTheme, toggleTheme } = useTheme();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [activePreviewTab, setActivePreviewTab] = useState<'overview' | 'ai' | 'deadlines' | 'finance'>('ai');
  const [activeAiDemoIndex, setActiveAiDemoIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const hamburgerBtnRef = useRef<HTMLButtonElement>(null);

  // Detecta rolagem para aplicar sombra suave apenas após o usuário começar a rolar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mensagem flash pós-exclusão de conta / escritório
  const [accountDeletedFlashMessage, setAccountDeletedFlashMessage] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('dex_account_deleted_msg');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (accountDeletedFlashMessage) {
      try {
        sessionStorage.removeItem('dex_account_deleted_msg');
      } catch {}
      const timer = setTimeout(() => {
        setAccountDeletedFlashMessage(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [accountDeletedFlashMessage]);

  // Fecha menu mobile com tecla ESC e devolve o foco ao botão
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        hamburgerBtnRef.current?.focus();
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  type UrgencyLevel = 'CRÍTICA' | 'ALTA' | 'MÉDIA' | 'BAIXA';

  const urgencyMeta: Record<UrgencyLevel, {
    label: string;
    badgeClasses: string;
    barActiveClass: string;
    barsCount: number;
    shapeClass: string;
    Icon: React.ElementType;
  }> = {
    'CRÍTICA': {
      label: 'CRÍTICA',
      badgeClasses: 'bg-urgency-critical-bg text-urgency-critical-fg border-urgency-critical-border',
      barActiveClass: 'bg-urgency-critical-bar',
      barsCount: 4,
      shapeClass: 'rounded-lg border-2',
      Icon: AlertOctagon,
    },
    'ALTA': {
      label: 'ALTA',
      badgeClasses: 'bg-urgency-high-bg text-urgency-high-fg border-urgency-high-border',
      barActiveClass: 'bg-urgency-high-bar',
      barsCount: 3,
      shapeClass: 'rounded-xl border-[1.5px]',
      Icon: AlertTriangle,
    },
    'MÉDIA': {
      label: 'MÉDIA',
      badgeClasses: 'bg-urgency-medium-bg text-urgency-medium-fg border-urgency-medium-border',
      barActiveClass: 'bg-urgency-medium-bar',
      barsCount: 2,
      shapeClass: 'rounded-full border',
      Icon: Info,
    },
    'BAIXA': {
      label: 'BAIXA',
      badgeClasses: 'bg-urgency-low-bg text-urgency-low-fg border-urgency-low-border',
      barActiveClass: 'bg-urgency-low-bar',
      barsCount: 1,
      shapeClass: 'rounded-full border border-dashed',
      Icon: ShieldCheck,
    },
  };

  const aiDemoCases: Array<{
    title: string;
    area: string;
    urgency: UrgencyLevel;
    prompt: string;
    framing: string;
    questions: string[];
    documents: string[];
    value: string;
  }> = [
    {
      title: 'Trabalhista — Horas Extras e Dano Moral',
      area: 'Trabalhista',
      urgency: 'ALTA',
      prompt: 'Trabalhei por 3 anos em uma transportadora fazendo jornadas diárias de 14 horas sem receber adicional de horas extras. Fui demitido sem justa causa e sofria humilhações constantes do encarregado perante toda a equipe.',
      framing: 'Reclamatória Trabalhista c/c Pedido de Horas Extras (art. 59 CLT) e Indenização por Danos Morais (art. 223-B CLT).',
      questions: [
        'Havia registro biométrico de ponto ou folha manual?',
        'Possui testemunhas que presenciavam as humilhações?',
        'O aviso prévio e verbas rescisórias foram pagos no prazo de 10 dias?'
      ],
      documents: ['TRCT e comprovante de quitação', 'Espelhos de ponto ou extrato de jornada', 'Prints de WhatsApp ou conversas corporativas'],
      value: 'R$ 78.500,00'
    },
    {
      title: 'Consumidor — Cancelamento e Extravio de Bagagem',
      area: 'Consumidor / Cível',
      urgency: 'MÉDIA',
      prompt: 'Minha viagem de férias para Fortaleza foi arruinada. O voo atrasou 9 horas sem assistência material e minha mala só foi devolvida 5 dias depois, com itens danificados.',
      framing: 'Ação de Indenização por Danos Morais e Materiais (Resolução 400 ANAC e art. 14 CDC). Responsabilidade objetiva da companhia aérea.',
      questions: [
        'Foi lavrado o Registro de Irregularidade de Bagagem (RIB) no aeroporto?',
        'Guardou os comprovantes de despesas com itens essenciais durante os 5 dias?'
      ],
      documents: ['Bilhete aéreo e cartões de embarque', 'Protocolo RIB emitido pela companhia', 'Comprovantes de gastos e fotos da mala avariada'],
      value: 'R$ 22.000,00'
    },
    {
      title: 'Família — Execução e Prisão Civil de Alimentos',
      area: 'Família e Sucessões',
      urgency: 'CRÍTICA',
      prompt: 'O genitor não paga a pensão alimentícia fixada em juízo há 3 meses consecutivos. As crianças estão sem material escolar e com mensalidades atrasadas.',
      framing: 'Cumprimento de Sentença de Obrigação de Pagar Alimentos sob Rito de Prisão Civil (art. 528 CPC). Súmula 309 do STJ.',
      questions: [
        'Qual o valor exato fixado no título executivo judicial anterior?',
        'Houve algum pagamento parcial ou justificativa formal do devedor?'
      ],
      documents: ['Cópia da sentença ou acordo homologado de alimentos', 'Planilha atualizada do débito alimentar', 'Certidão de nascimento dos menores'],
      value: 'R$ 14.800,00'
    },
    {
      title: 'Previdenciário — Revisão de Tempo Especial',
      area: 'Previdenciário',
      urgency: 'BAIXA',
      prompt: 'Trabalhei 12 anos como técnico industrial exposto a ruído acima de 90 dB antes da reforma da previdência, mas o INSS concedeu minha aposentadoria comum sem converter o período especial.',
      framing: 'Ação de Revisão de Benefício Previdenciário com Reconhecimento de Atividade Especial (art. 57 da Lei nº 8.213/1991 e Tema 534 do STJ).',
      questions: [
        'A empresa forneceu o Perfil Profissiográfico Previdenciário (PPP) atualizado?',
        'A concessão do benefício ocorreu há menos de 10 anos (prazo decadencial)?'
      ],
      documents: ['Carta de concessão e CNIS completo', 'PPP e LTCAT do período de exposição', 'CTPS com registro dos contratos'],
      value: 'R$ 36.400,00'
    }
  ];

  const faqs = [
    {
      q: 'O Dex AI está em conformidade com o Estatuto da OAB e o Provimento nº 205/2021?',
      a: 'Sim, 100%! O módulo Dex AI foi desenvolvido estritamente como um assistente preliminar de apoio à triagem. Todas as saídas contam com aviso obrigatório de revisão humana e não há automação de peticionamento sem validação expressa do advogado.'
    },
    {
      q: 'Como funciona o controle de prazos fatais e audiências?',
      a: 'O Dex classifica os prazos em quatro níveis de prioridade (Crítica, Alta, Média, Normal). Prazos fatais geram alertas visuais em tempo real no dashboard, avisos de contagem regressiva e baixa com 1 clique após cumprimento.'
    },
    {
      q: 'Posso usar o Dex em computadores diferentes e no celular?',
      a: 'Sim. A aplicação é totalmente web e responsiva, adaptando-se com excelência a monitores ultrawide, notebooks, tablets e smartphones, sem necessidade de instalação pesada.'
    },
    {
      q: 'Como é garantida a segurança dos dados e sigilo segundo a LGPD?',
      a: 'O sistema conta com inventário detalhado de tratamento de dados pessoais (art. 37 LGPD), trilha imutável de auditoria com IP e timestamp, e permissão estrita RBAC por perfil (Sócios vs. Advogados Associados).'
    },
    {
      q: 'Existe período de teste gratuito?',
      a: 'Sim! Ao criar sua conta você ganha 14 dias de teste completo com acesso ilimitado a todos os módulos e ao Dex AI, sem necessidade de cartão de crédito.'
    }
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-dex-cream dark:bg-[#0A1922] text-dex-navy-950 dark:text-[#F9ECE2] font-serif selection:bg-dex-coral selection:text-white antialiased overflow-x-clip transition-colors">
      {/* Skip Link para Acessibilidade por Teclado */}
      <a href="#landing-main" className="skip-link">
        Pular para o conteúdo principal
      </a>

      {/* Toast Notificação de Conta/Escritório Excluído com Sucesso */}
      {accountDeletedFlashMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] max-w-md w-[90%] p-4 rounded-2xl bg-dex-navy-950 text-white shadow-2xl border border-dex-teal/50 flex items-center justify-between gap-3 animate-fadeIn"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-dex-teal shrink-0" />
            <span className="text-xs font-serif leading-snug">{accountDeletedFlashMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setAccountDeletedFlashMessage(null)}
            className="text-white/60 hover:text-white p-1 rounded-lg cursor-pointer"
            aria-label="Fechar notificação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Sticky Fixo no Topo (respeita safe-area-inset-top e prefers-reduced-motion) */}
      <header
        className={`sticky top-0 z-40 pt-[env(safe-area-inset-top)] bg-dex-cream/92 dark:bg-[#0A1922]/92 backdrop-blur-md border-b border-[#D8C3B5]/90 dark:border-[#366076]/80 transition-shadow duration-200 motion-reduce:transition-none ${
          isScrolled ? 'shadow-md dark:shadow-[0_6px_24px_rgba(0,0,0,0.4)]' : 'shadow-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 sm:h-[72px] flex items-center justify-between">
          {/* Logo à esquerda */}
          <button
            type="button"
            onClick={() => {
              const prefersReduced =
                typeof window !== 'undefined' &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
            }}
            aria-label="Dex Jurídico — Voltar ao topo"
            className="cursor-pointer transition-transform hover:scale-105 motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral rounded-lg"
          >
            <DexLogo variant={effectiveTheme === 'dark' ? 'light' : 'dark'} size="md" />
          </button>

          {/* Links e Ações à direita */}
          <div className="flex items-center gap-3 sm:gap-6">
            <nav className="hidden md:flex items-center gap-8 text-sm text-landing-muted font-medium">
              <button
                type="button"
                onClick={() => scrollToSection('recursos')}
                className="hover:text-dex-navy-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                Recursos
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('sobre')}
                className="hover:text-dex-navy-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                Sobre nós
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('planos')}
                className="hover:text-dex-navy-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                Planos
              </button>
            </nav>

            {/* Seletor Rápido de Tema (Claro / Escuro) */}
            <button
              type="button"
              onClick={toggleTheme}
              title={effectiveTheme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              aria-label="Alternar tema"
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-dex-peach/40 dark:bg-[#162B37] text-dex-navy-950 dark:text-[#F9ECE2] hover:bg-dex-peach dark:hover:bg-[#214154] border border-dex-border dark:border-[#366076] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
            >
              {effectiveTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-dex-navy-950" />
              )}
            </button>

            {/* Botões de Ação no Desktop */}
            <div className="hidden md:flex items-center gap-3 sm:gap-4">
              {isLoggedIn && onBackToApp ? (
                <button
                  type="button"
                  onClick={onBackToApp}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-dex-navy-950 dark:bg-[#386B78] hover:bg-dex-navy-900 dark:hover:bg-[#2E5A66] text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
                >
                  <span>Voltar ao Sistema</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="min-h-[44px] text-sm font-medium text-landing-muted hover:text-dex-navy-950 dark:hover:text-white transition-colors px-3 py-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral rounded-lg"
                  >
                    Entrar
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateToRegister('Escritório Pro')}
                    className="min-h-[44px] px-5 sm:px-6 py-2.5 rounded-xl bg-dex-navy-950 dark:bg-[#386B78] hover:bg-dex-navy-900 dark:hover:bg-[#2E5A66] text-white text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
                  >
                    Criar conta
                  </button>
                </>
              )}
            </div>

            {/* Botão Hambúrguer Mobile com Acessibilidade */}
            <button
              ref={hamburgerBtnRef}
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-dex-peach/40 dark:bg-[#162B37] text-dex-navy-950 dark:text-[#F9ECE2] hover:bg-dex-peach dark:hover:bg-[#214154] border border-dex-border dark:border-[#214154] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Drawer do Menu Hambúrguer Mobile (com rolagem segura para não cortar em telas baixas ou zoom 200%) */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu principal de navegação"
            className="md:hidden border-t border-[#D8C3B5]/80 dark:border-[#366076] bg-dex-cream/98 dark:bg-[#0A1922]/98 backdrop-blur-xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[calc(100dvh-4rem-env(safe-area-inset-top))] overflow-y-auto transition-all motion-reduce:transition-none"
          >
            <nav className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection('recursos');
                }}
                className="min-h-[44px] flex items-center px-4 py-2.5 rounded-xl text-left text-base font-medium text-dex-navy-950 dark:text-[#F9ECE2] hover:bg-dex-peach/50 dark:hover:bg-[#162B37] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
              >
                Recursos
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection('sobre');
                }}
                className="min-h-[44px] flex items-center px-4 py-2.5 rounded-xl text-left text-base font-medium text-dex-navy-950 dark:text-[#F9ECE2] hover:bg-dex-peach/50 dark:hover:bg-[#162B37] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
              >
                Sobre nós
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection('planos');
                }}
                className="min-h-[44px] flex items-center px-4 py-2.5 rounded-xl text-left text-base font-medium text-dex-navy-950 dark:text-[#F9ECE2] hover:bg-dex-peach/50 dark:hover:bg-[#162B37] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
              >
                Planos
              </button>
            </nav>

            <div className="pt-3 border-t border-[#D8C3B5]/60 dark:border-[#366076] flex flex-col gap-3">
              {isLoggedIn && onBackToApp ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onBackToApp();
                  }}
                  className="min-h-[44px] w-full py-3 rounded-xl bg-dex-navy-950 dark:bg-[#386B78] hover:bg-dex-navy-900 dark:hover:bg-[#2E5A66] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
                >
                  <span>Voltar ao Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigateToLogin();
                    }}
                    className="min-h-[44px] w-full py-3 rounded-xl bg-dex-peach/60 dark:bg-[#162B37] text-dex-navy-950 dark:text-[#F9ECE2] text-sm font-semibold border border-dex-border dark:border-[#366076] flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
                  >
                    Entrar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigateToRegister('Escritório Pro');
                    }}
                    className="min-h-[44px] w-full py-3 rounded-xl bg-dex-navy-950 dark:bg-[#386B78] hover:bg-dex-navy-900 dark:hover:bg-[#2E5A66] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
                  >
                    <span>Criar conta</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main id="landing-main" tabIndex={-1} className="focus:outline-none">
      {/* HERO SECTION (Fiel ao Anexo 1) */}
      <section className="relative pt-10 pb-20 lg:pt-16 lg:pb-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Coluna Esquerda: Textos e CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Barras decorativas coral e teal empilhadas */}
            <DecorativeBars coralWidth="w-28 sm:w-36" tealWidth="w-28 sm:w-36" height="h-2" />

            {/* Título Principal com tipografia fluida */}
            <h1 className="text-[clamp(2.1rem,6vw,3.75rem)] font-display font-bold leading-[1.15] text-dex-coral tracking-tight">
              Onde a advocacia encontra sua{' '}
              <span className="block italic text-dex-navy-950 dark:text-white font-serif font-normal mt-1">
                melhor versão.
              </span>
            </h1>

            {/* Parágrafo de Apoio */}
            <p className="text-sm sm:text-base lg:text-lg text-landing-muted leading-relaxed max-w-xl">
              Deixamos a burocracia invisível. Centralize prazos, honorários e o andamento processual do seu escritório em uma interface desenhada para não atrapalhar o seu dia.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigateToRegister('Escritório Pro')}
                className="min-h-[44px] px-8 py-3.5 rounded-xl bg-dex-navy-950 dark:bg-[#386B78] hover:bg-dex-navy-900 dark:hover:bg-[#2E5A66] text-white text-sm font-semibold shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
              >
                <span>Criar conta gratuitamente</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onNavigateToLogin}
                className="min-h-[44px] px-6 py-3.5 rounded-xl bg-dex-peach/60 dark:bg-[#162B37] hover:bg-dex-peach dark:hover:bg-[#214154] text-dex-navy-950 dark:text-[#F9ECE2] text-sm font-semibold border border-dex-border dark:border-[#366076] transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
              >
                <span>Fazer login</span>
              </button>
            </div>

            {/* Micro badges de confiança */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-landing-muted font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-landing-accent stroke-[2.5]" aria-hidden="true" />
                <span>14 dias grátis sem cartão</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-dex-teal-dark dark:text-[#6BA7B5] stroke-[2.5]" aria-hidden="true" />
                <span>Provimento OAB 205/2021</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-dex-terracotta dark:text-[#F09A7E] stroke-[2.5]" aria-hidden="true" />
                <span>Blindagem LGPD</span>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Mockup do Dashboard com Corvo e Penas (Anexo 1) */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end pt-8 lg:pt-0">
            <HeroDashboardMockup />
          </div>
        </div>
      </section>

      {/* SEÇÃO DE RECURSOS / BENTO GRID (Fiel ao Anexo 2) */}
      <section id="recursos" className="scroll-mt-20 sm:scroll-mt-24 py-20 lg:py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#D8C3B5]/70 dark:border-[#214154] transition-colors">
        {/* Cabeçalho da Seção Centralizado */}
        <div className="text-center max-w-4xl mx-auto mb-14 sm:mb-16 space-y-3 sm:space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-dex-navy-950 dark:text-white tracking-tight leading-tight pb-2 sm:pb-3">
            Construído para quem vive o{' '}
            <span className="relative inline-block whitespace-nowrap">
              <span>Direito</span>
              {/* Duas barras decorativas sublinhando a palavra Direito: coral em cima, teal embaixo, ligeiramente deslocadas */}
              <span
                className="absolute -bottom-2 sm:-bottom-2.5 left-0 w-full flex flex-col gap-0.5 sm:gap-1 select-none pointer-events-none"
                aria-hidden="true"
              >
                <span className="w-full h-1 sm:h-1.5 bg-[#F4665C] rounded-full shadow-xs" />
                <span className="w-full h-1 sm:h-1.5 bg-[#4A808E] rounded-full shadow-xs translate-x-1 sm:translate-x-1.5" />
              </span>
            </span>
          </h2>

          <p className="text-base sm:text-lg text-landing-muted leading-relaxed max-w-2xl mx-auto pt-2">
            Menos abas abertas, menos planilhas perdidas.<br className="hidden sm:inline" /> O Dex unifica o que realmente importa para a saúde do seu escritório.
          </p>
        </div>

        {/* Grade Bento Responsiva: 1 coluna no celular (<768px), 2 colunas no tablet (md), 1.6x para 1x no desktop (lg) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr] gap-6 items-stretch">
          {/* Card Grande: Painel de Controle */}
          <div className="md:col-span-2 lg:col-span-1 rounded-[20px] sm:rounded-[24px] border border-[#222222]/75 dark:border-[#366076] overflow-hidden shadow-sm flex flex-col sm:flex-row h-full">
            {/* Painel Esquerdo em Bege (#EAE0DA): Texto Explicativo com tipografia fluida */}
            <div className="flex-1 bg-[#EAE0DA] dark:bg-[#1A3342] p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-3 sm:space-y-4 transition-colors">
              <h3 className="text-2xl sm:text-3xl lg:text-[32px] font-display font-bold text-dex-navy-950 dark:text-white tracking-tight leading-[1.15]">
                Painel de<br />Controle
              </h3>
              <p className="text-xs sm:text-sm text-dex-navy-950/85 dark:text-[#C5D8E0] leading-relaxed max-w-sm">
                O pulso do seu escritório em uma única tela. Receitas, andamentos e alertas críticos disponíveis no momento em que você acessa o sistema.
              </p>
            </div>

            {/* Painel Direito em Creme mais claro (#FAF5F0): Gráfico decorativo de duas barras verticais arredondadas em bege */}
            <div 
              aria-hidden="true" 
              className="w-full sm:w-[46%] lg:w-[45%] bg-[#FAF5F0] dark:bg-[#0F2733] border-t sm:border-t-0 sm:border-l border-[#222222]/20 dark:border-[#366076] flex items-end justify-center gap-4 sm:gap-5 px-6 pt-8 pb-6 sm:pb-8 self-stretch min-h-[160px] sm:min-h-[240px] lg:min-h-full transition-colors"
            >
              {/* Barra vertical esquerda (menor / mais baixa) */}
              <div className="w-9 sm:w-11 lg:w-12 h-24 sm:h-32 lg:h-36 rounded-full border border-[#222222]/75 dark:border-[#6BA7B5] bg-[#EAE0DA] dark:bg-[#1A3342] shadow-xs shrink-0" />
              {/* Barra vertical direita (maior / mais alta) */}
              <div className="w-9 sm:w-11 lg:w-12 h-36 sm:h-44 lg:h-52 rounded-full border border-[#222222]/75 dark:border-[#6BA7B5] bg-[#EAE0DA] dark:bg-[#1A3342] shadow-xs shrink-0" />
            </div>
          </div>

          {/* Coluna Direita: Dois cards empilhados com fundo transparente, somando a altura exata do card grande */}
          <div className="md:col-span-2 lg:col-span-1 flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-col gap-6 h-full">
            {/* Card Superior: Acompanhamento */}
            <div className="bg-transparent rounded-[20px] sm:rounded-[24px] border border-[#222222]/75 dark:border-[#366076] p-6 sm:p-8 lg:p-9 flex-1 flex flex-col justify-center shadow-xs transition-colors">
              <div className="space-y-2.5">
                <div className="w-9 h-9 text-dex-navy-950 dark:text-[#F9ECE2] flex items-center">
                  <Scale className="w-7 h-7 stroke-[1.5]" aria-hidden="true" />
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-dex-navy-950 dark:text-white">
                  Acompanhamento
                </h3>
                <p className="text-xs sm:text-sm text-landing-muted leading-relaxed">
                  Cada movimentação ou mudança de status organizada em uma linha do tempo clara.
                </p>
              </div>
            </div>

            {/* Card Inferior: Carteira de Clientes */}
            <div className="bg-transparent rounded-[20px] sm:rounded-[24px] border border-[#222222]/75 dark:border-[#366076] p-6 sm:p-8 lg:p-9 flex-1 flex flex-col justify-center shadow-xs transition-colors">
              <div className="space-y-2.5">
                <div className="w-9 h-9 text-dex-navy-950 dark:text-[#F9ECE2] flex items-center">
                  <Users className="w-7 h-7 stroke-[1.5]" aria-hidden="true" />
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-dex-navy-950 dark:text-white">
                  Carteira de Clientes
                </h3>
                <p className="text-xs sm:text-sm text-landing-muted leading-relaxed">
                  Mantenha o histórico completo de contratos, processos e comunicações.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO DEX AI 2.0 INTERATIVA */}
      <section id="dex-ai" className="scroll-mt-20 sm:scroll-mt-24 py-20 lg:py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#D8C3B5]/70 dark:border-[#214154]">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dex-peach/80 dark:bg-[#162B37] border border-dex-terracotta/50 dark:border-[#6BA7B5] text-dex-navy-950 dark:text-[#F9ECE2] text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-landing-accent" aria-hidden="true" />
            <span>Motor Dex AI 2.0 • Triagem Jurídica de Casos</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-dex-navy-950 dark:text-white">
            Inteligência que entende o ritual forense
          </h2>
          <p className="text-base sm:text-lg text-landing-muted">
            Cole um relato informal, áudio do WhatsApp ou entrevista com o cliente. O Dex AI identifica a área jurídica, extrai os fatos essenciais, formula a tese e calcula a estimativa da causa.
          </p>
        </div>

        {/* Seletor de Casos de Demonstração */}
        <div className="flex flex-wrap justify-center gap-3 mb-8" role="tablist" aria-label="Áreas jurídicas de demonstração">
          {aiDemoCases.map((item, idx) => (
            <button
              key={item.title}
              type="button"
              role="tab"
              aria-selected={activeAiDemoIndex === idx}
              onClick={() => setActiveAiDemoIndex(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral ${
                activeAiDemoIndex === idx
                  ? 'bg-dex-navy-950 dark:bg-[#386B78] text-white shadow-md border border-transparent dark:border-[#6BA7B5]'
                  : 'bg-dex-beige dark:bg-[#162B37] hover:bg-dex-peach dark:hover:bg-[#214154] text-dex-navy-950 dark:text-[#F9ECE2] border border-dex-border dark:border-[#366076]'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Card Interativo do Caso Selecionado */}
        {(() => {
          const current = aiDemoCases[activeAiDemoIndex];
          const urgencyInfo = urgencyMeta[current.urgency];
          const UrgencyIcon = urgencyInfo.Icon;
          return (
            <div className="bg-dex-beige/70 dark:bg-[#162B37] rounded-[28px] border border-[#222222]/60 dark:border-[#366076] p-6 sm:p-10 shadow-md max-w-5xl mx-auto space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Relato Bruto do Cliente */}
                <div className="lg:col-span-5 space-y-4 bg-white/80 dark:bg-[#0F2733] p-6 rounded-2xl border border-dex-border dark:border-[#366076]">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-landing-muted dark:text-[#8EC3D0]">
                      Relato Bruto do Cliente:
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-dex-beige dark:bg-[#1A3646] text-dex-navy-950 dark:text-[#E2ECF0] border border-dex-border dark:border-[#366076]">
                      {current.area}
                    </span>
                  </div>
                  <p className="text-sm text-dex-navy-950 dark:text-[#F9ECE2] italic leading-relaxed">
                    "{current.prompt}"
                  </p>
                  <div className="pt-2">
                    <div
                      className={`inline-flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold shadow-xs ${urgencyInfo.shapeClass} ${urgencyInfo.badgeClasses}`}
                      role="status"
                      aria-label={`Nível de urgência: ${urgencyInfo.label}`}
                    >
                      <UrgencyIcon className="w-4 h-4 shrink-0 stroke-[2.25]" aria-hidden={true} />
                      <span>Urgência: {urgencyInfo.label}</span>
                      {/* Indicador visual por barras (não depende apenas de cor) */}
                      <span className="inline-flex items-end gap-0.5 ml-1" aria-hidden="true">
                        {[1, 2, 3, 4].map((level) => (
                          <span
                            key={level}
                            className={`w-1 rounded-sm transition-opacity ${
                              level === 1 ? 'h-1.5' : level === 2 ? 'h-2' : level === 3 ? 'h-2.5' : 'h-3'
                            } ${
                              level <= urgencyInfo.barsCount
                                ? urgencyInfo.barActiveClass
                                : 'bg-current opacity-25'
                            }`}
                          />
                        ))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estruturação Jurídica da IA */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-landing-muted dark:text-[#8EC3D0]">
                      Enquadramento Jurídico Sugerido:
                    </span>
                    <h4 className="text-lg font-bold text-dex-navy-950 dark:text-white">
                      {current.framing}
                    </h4>
                  </div>

                  {/* Perguntas Cruciais */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-landing-muted dark:text-[#8EC3D0]">
                      Perguntas Fundamentais para a Entrevista:
                    </span>
                    <ul className="space-y-2">
                      {current.questions.map((q, i) => (
                        <li key={i} className="text-xs sm:text-sm text-dex-navy-950 dark:text-[#E2ECF0] flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-landing-accent shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Documentos Exigidos */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-landing-muted dark:text-[#8EC3D0]">
                      Checklist Probatório Recomendado:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {current.documents.map((d, i) => (
                        <span key={i} className="text-xs bg-dex-input dark:bg-[#0F2733] px-3 py-1 rounded-lg text-dex-navy-950 dark:text-[#F9ECE2] font-medium border border-dex-border/80 dark:border-[#366076]">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Valor Estimado */}
                  <div className="pt-2 flex items-center justify-between border-t border-dex-border dark:border-[#366076]">
                    <span className="text-xs text-landing-muted font-medium">Estimativa do Pedido:</span>
                    <span className="text-xl font-bold font-display text-landing-accent">{current.value}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* SEÇÃO PLANOS & PREÇOS */}
      <section id="planos" className="scroll-mt-20 sm:scroll-mt-24 py-20 lg:py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#D8C3B5]/70 dark:border-[#214154]">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-dex-navy-950 dark:text-white">
            Investimento transparente para cada fase da sua banca
          </h2>
          <p className="text-base sm:text-lg text-landing-muted">
            Sem fidelidade forçada. Cancele ou altere seu plano quando desejar.
          </p>

          {/* Alternador Mensal / Anual */}
          <div className="inline-flex items-center gap-2 p-1 rounded-full bg-dex-beige dark:bg-[#162B37] border border-dex-border dark:border-[#366076] mt-4">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-dex-navy-950 dark:bg-[#386B78] text-white shadow' : 'text-landing-muted hover:text-dex-navy-950 dark:hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-dex-navy-950 dark:bg-[#386B78] text-white shadow' : 'text-landing-muted hover:text-dex-navy-950 dark:hover:text-white'
              }`}
            >
              <span>Anual</span>
              <span className="px-2 py-0.5 rounded-full bg-[#C4362C] dark:bg-[#D9453B] text-white text-[10px] font-bold">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Grid de 3 Planos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {/* Plano 1: Advogado Individual */}
          <div className="bg-dex-cream dark:bg-[#162B37] rounded-[24px] border border-[#222222]/80 dark:border-[#366076] p-8 flex flex-col justify-between shadow-sm">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-landing-muted dark:text-[#8EC3D0]">Autônomo</span>
                <h3 className="text-2xl font-display font-bold text-dex-navy-950 dark:text-white mt-1">Essencial Autônomo</h3>
                <p className="text-xs text-landing-muted mt-2">Para advogados autônomos e individuais em ascensão.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-display font-bold text-dex-navy-950 dark:text-white">
                  {billingCycle === 'yearly' ? 'R$ 79' : 'R$ 99'}
                </span>
                <span className="text-xs text-landing-muted">/mês</span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-dex-border dark:border-[#366076] text-xs text-dex-navy-950 dark:text-[#E2ECF0]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-landing-accent shrink-0" aria-hidden="true" />
                  <span>1 Usuário com OAB</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-landing-accent shrink-0" aria-hidden="true" />
                  <span>Até 120 Processos Ativos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-landing-accent shrink-0" aria-hidden="true" />
                  <span>150 Consultas de IA Forense / mês</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-landing-accent shrink-0" aria-hidden="true" />
                  <span>Controle de Prazos Fatais & Exportação</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToRegister('Essencial')}
              className="mt-8 w-full py-3 rounded-xl bg-dex-slate-dark hover:bg-dex-slate-darkHover dark:bg-[#386B78] dark:hover:bg-[#2E5A66] text-white text-xs font-semibold shadow transition-all cursor-pointer"
            >
              Começar com Essencial
            </button>
          </div>

          {/* Plano 2: Profissional (Destaque) */}
          <div className="bg-dex-peach/90 dark:bg-[#1E3A4B] rounded-[24px] border-2 border-dex-navy-950 dark:border-[#6BA7B5] p-8 flex flex-col justify-between shadow-xl relative lg:scale-105 z-10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#C4362C] dark:bg-[#D9453B] text-white text-[11px] font-bold shadow-md whitespace-nowrap">
              Mais Recomendado
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-dex-navy-950 dark:text-[#8EC3D0]">Banca em Expansão</span>
                <h3 className="text-2xl font-display font-bold text-dex-navy-950 dark:text-white mt-1">Profissional</h3>
                <p className="text-xs text-dex-navy-950/85 dark:text-[#D0E0E8] mt-2">Gestão integrada completa de equipe, honorários e IA.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-display font-bold text-dex-navy-950 dark:text-white">
                  {billingCycle === 'yearly' ? 'R$ 189' : 'R$ 229'}
                </span>
                <span className="text-xs text-dex-navy-950/85 dark:text-[#D0E0E8]">/mês</span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-dex-navy-950/20 dark:border-[#366076] text-xs text-dex-navy-950 dark:text-[#E2ECF0] font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-landing-accent stroke-[2.5] shrink-0" aria-hidden="true" />
                  <span>Até 3 Advogados na Equipe</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-landing-accent stroke-[2.5] shrink-0" aria-hidden="true" />
                  <span>Até 500 Processos & 350 Clientes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-landing-accent stroke-[2.5] shrink-0" aria-hidden="true" />
                  <span>500 Requisições de IA Forense / mês</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-landing-accent stroke-[2.5] shrink-0" aria-hidden="true" />
                  <span>Mural da Equipe & Gestão de Produtividade</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-landing-accent stroke-[2.5] shrink-0" aria-hidden="true" />
                  <span>Exportação de Planilhas em XLSX & CSV</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToRegister('Profissional')}
              className="mt-8 w-full py-3.5 rounded-xl bg-dex-navy-950 dark:bg-[#386B78] hover:bg-dex-navy-900 dark:hover:bg-[#2E5A66] text-white text-xs font-bold shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Experimentar 14 Dias Grátis
            </button>
          </div>

          {/* Plano 3: Escritório Pro */}
          <div className="bg-dex-cream dark:bg-[#162B37] rounded-[24px] border border-[#222222]/80 dark:border-[#366076] p-8 flex flex-col justify-between shadow-sm">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-landing-muted dark:text-[#8EC3D0]">Grandes Bancas</span>
                <h3 className="text-2xl font-display font-bold text-dex-navy-950 dark:text-white mt-1">Escritório Pro</h3>
                <p className="text-xs text-landing-muted mt-2">Bancas consolidadas e sociedades corporativas.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-display font-bold text-dex-navy-950 dark:text-white">
                  {billingCycle === 'yearly' ? 'R$ 379' : 'R$ 449'}
                </span>
                <span className="text-xs text-landing-muted">/mês</span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-dex-border dark:border-[#366076] text-xs text-dex-navy-950 dark:text-[#E2ECF0]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-landing-accent shrink-0" aria-hidden="true" />
                  <span>Até 15 Advogados na Banca</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-landing-accent shrink-0" aria-hidden="true" />
                  <span>Processos em Escala (até 5.000 ativos)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-landing-accent shrink-0" aria-hidden="true" />
                  <span>2.000 Requisições de IA Forense / mês</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-landing-accent shrink-0" aria-hidden="true" />
                  <span>Auditoria Completa LGPD & Suporte Prioritário</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToRegister('Escritório Pro')}
              className="mt-8 w-full py-3 rounded-xl bg-dex-slate-dark hover:bg-dex-slate-darkHover dark:bg-[#386B78] dark:hover:bg-[#2E5A66] text-white text-xs font-semibold shadow transition-all cursor-pointer"
            >
              Assinar Escritório Pro
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO FAQ */}
      <section id="faq" className="scroll-mt-20 sm:scroll-mt-24 py-20 lg:py-28 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto border-t border-[#D8C3B5]/70 dark:border-[#214154]">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-dex-navy-950 dark:text-white">
            Perguntas Frequentes
          </h2>
          <p className="text-sm sm:text-base text-landing-muted">
            Tire suas dúvidas sobre segurança, ética na advocacia e recursos da plataforma.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={faq.q}
                className="bg-dex-beige/60 dark:bg-[#162B37] rounded-2xl border border-dex-border/80 dark:border-[#366076] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-display font-bold text-base sm:text-lg text-dex-navy-950 dark:text-[#F9ECE2]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-dex-navy-950 dark:text-[#F9ECE2] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-landing-accent' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 text-sm text-landing-muted leading-relaxed border-t border-dex-border/40 dark:border-[#366076]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      </main>

      {/* FOOTER ELEGANTE */}
      <footer id="sobre" className="scroll-mt-20 sm:scroll-mt-24 bg-[#EAE0DA] dark:bg-[#0F2733] border-t border-[#D8C3B5] dark:border-[#366076] py-14 px-4 sm:px-6 lg:px-12 transition-colors">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-between">
          <div className="md:col-span-5 space-y-3">
            <DexLogo variant={effectiveTheme === 'dark' ? 'light' : 'dark'} size="md" subtitle="Sistema de Advocacia" />
            <p className="text-xs text-landing-muted max-w-sm leading-relaxed">
              Plataforma de governança forense e gestão jurídica orientada a dados com inteligência artificial ética.
            </p>
          </div>

          <div className="md:col-span-4 flex flex-wrap gap-6 text-xs text-landing-muted font-medium">
            <button type="button" onClick={() => scrollToSection('recursos')} className="hover:text-dex-navy-950 dark:hover:text-white cursor-pointer">
              Recursos
            </button>
            <button type="button" onClick={() => scrollToSection('planos')} className="hover:text-dex-navy-950 dark:hover:text-white cursor-pointer">
              Planos & Preços
            </button>
            <button type="button" onClick={() => scrollToSection('faq')} className="hover:text-dex-navy-950 dark:hover:text-white cursor-pointer">
              Perguntas Frequentes
            </button>
            <button type="button" onClick={onNavigateToLogin} className="hover:text-dex-navy-950 dark:hover:text-white cursor-pointer">
              Acesso ao Sistema
            </button>
          </div>

          <div className="md:col-span-3 text-left md:text-right text-xs text-landing-muted space-y-1">
            <p>© {new Date().getFullYear()} Dex Jurídico.</p>
            <p>Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
