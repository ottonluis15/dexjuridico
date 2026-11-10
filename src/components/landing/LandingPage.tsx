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
  X
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
  const hamburgerBtnRef = useRef<HTMLButtonElement>(null);

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

  const aiDemoCases = [
    {
      title: 'Trabalhista — Horas Extras e Dano Moral',
      area: 'Trabalhista',
      urgency: 'ALTA',
      urgencyColor: 'text-[#C48A5C] bg-[#F9D9C3]/70 border-[#C48A5C]/40',
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
      urgencyColor: 'text-[#4A808E] bg-[#DCE5E4] border-[#4A808E]/40',
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
      urgencyColor: 'text-[#F4665C] bg-[#F0CBAE]/60 border-[#F4665C]/40',
      prompt: 'O genitor não paga a pensão alimentícia fixada em juízo há 3 meses consecutivos. As crianças estão sem material escolar e com mensalidades atrasadas.',
      framing: 'Cumprimento de Sentença de Obrigação de Pagar Alimentos sob Rito de Prisão Civil (art. 528 CPC). Súmula 309 do STJ.',
      questions: [
        'Qual o valor exato fixado no título executivo judicial anterior?',
        'Houve algum pagamento parcial ou justificativa formal do devedor?'
      ],
      documents: ['Cópia da sentença ou acordo homologado de alimentos', 'Planilha atualizada do débito alimentar', 'Certidão de nascimento dos menores'],
      value: 'R$ 14.800,00'
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
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-dex-cream dark:bg-[#0A1922] text-dex-navy-950 dark:text-[#F9ECE2] font-serif selection:bg-dex-coral selection:text-white antialiased overflow-x-hidden transition-colors">
      {/* Toast Notificação de Conta/Escritório Excluído com Sucesso */}
      {accountDeletedFlashMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] p-4 rounded-2xl bg-dex-navy-950 text-white shadow-2xl border border-dex-teal/50 flex items-center justify-between gap-3 animate-fadeIn"
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

      {/* Header (Anexo 1) */}
      <header className="sticky top-0 z-50 bg-dex-cream/95 dark:bg-[#0A1922]/95 backdrop-blur-md border-b border-[#D8C3B5]/90 dark:border-[#214154] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between">
          {/* Logo à esquerda */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="cursor-pointer transition-transform hover:scale-105"
          >
            <DexLogo variant={effectiveTheme === 'dark' ? 'light' : 'dark'} size="md" />
          </div>

          {/* Links e Ações à direita */}
          <div className="flex items-center gap-3 sm:gap-6">
            <nav className="hidden md:flex items-center gap-8 text-sm text-dex-support dark:text-[#A7BAC5] font-medium">
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
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-dex-peach/40 dark:bg-[#162B37] text-dex-navy-950 dark:text-[#F9ECE2] hover:bg-dex-peach dark:hover:bg-[#214154] border border-dex-border dark:border-[#214154] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
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
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-dex-navy-950 dark:bg-[#4A808E] hover:bg-dex-navy-900 dark:hover:bg-[#3d6a76] text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
                >
                  <span>Voltar ao Sistema</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="min-h-[44px] text-sm font-medium text-dex-support dark:text-[#A7BAC5] hover:text-dex-navy-950 dark:hover:text-white transition-colors px-3 py-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral rounded-lg"
                  >
                    Entrar
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateToRegister('Escritório Pro')}
                    className="min-h-[44px] px-5 sm:px-6 py-2.5 rounded-xl bg-dex-navy-950 dark:bg-[#4A808E] hover:bg-dex-navy-900 dark:hover:bg-[#3d6a76] text-white text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
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

        {/* Drawer do Menu Hambúrguer Mobile */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu principal de navegação"
            className="md:hidden border-t border-[#D8C3B5]/80 dark:border-[#214154] bg-dex-cream/98 dark:bg-[#0A1922]/98 backdrop-blur-xl shadow-2xl p-6 space-y-4 transition-all"
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

            <div className="pt-3 border-t border-[#D8C3B5]/60 dark:border-[#214154] flex flex-col gap-3">
              {isLoggedIn && onBackToApp ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onBackToApp();
                  }}
                  className="min-h-[44px] w-full py-3 rounded-xl bg-dex-navy-950 dark:bg-[#4A808E] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
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
                    className="min-h-[44px] w-full py-3 rounded-xl bg-dex-peach/60 dark:bg-[#162B37] text-dex-navy-950 dark:text-[#F9ECE2] text-sm font-semibold border border-dex-border dark:border-[#214154] flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
                  >
                    Entrar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigateToRegister('Escritório Pro');
                    }}
                    className="min-h-[44px] w-full py-3 rounded-xl bg-dex-navy-950 dark:bg-[#4A808E] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
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

      {/* HERO SECTION (Fiel ao Anexo 1) */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
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

            {/* Parágrafo de Apoio Cinza */}
            <p className="text-sm sm:text-base lg:text-lg text-dex-support dark:text-[#A7BAC5] leading-relaxed max-w-xl">
              Deixamos a burocracia invisível. Centralize prazos, honorários e o andamento processual do seu escritório em uma interface desenhada para não atrapalhar o seu dia.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigateToRegister('Escritório Pro')}
                className="min-h-[44px] px-8 py-3.5 rounded-xl bg-dex-navy-950 dark:bg-[#4A808E] hover:bg-dex-navy-900 dark:hover:bg-[#3d6a76] text-white text-sm font-semibold shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
              >
                <span>Criar conta gratuitamente</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onNavigateToLogin}
                className="min-h-[44px] px-6 py-3.5 rounded-xl bg-dex-peach/60 dark:bg-[#162B37] hover:bg-dex-peach dark:hover:bg-[#214154] text-dex-navy-950 dark:text-[#F9ECE2] text-sm font-semibold border border-dex-border dark:border-[#214154] transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral"
              >
                <span>Fazer login</span>
              </button>
            </div>

            {/* Micro badges de confiança */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-dex-support font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-dex-coral stroke-[2.5]" />
                <span>14 dias grátis sem cartão</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-dex-teal stroke-[2.5]" />
                <span>Provimento OAB 205/2021</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-dex-terracotta stroke-[2.5]" />
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
      <section id="recursos" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#D8C3B5]/70 dark:border-[#214154]">
        {/* Cabeçalho da Seção Centralizado */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-dex-navy-950 dark:text-white tracking-tight">
            Construído para quem vive o{' '}
            <span className="relative inline-block">
              Direito
              {/* Duas barras decorativas sublinhando a palavra Direito */}
              <span className="block mt-2">
                <DecorativeBars centered coralWidth="w-28 sm:w-36" tealWidth="w-28 sm:w-36" height="h-1.5" />
              </span>
            </span>
          </h2>

          <p className="text-base sm:text-lg text-dex-support dark:text-[#A7BAC5] leading-relaxed max-w-2xl mx-auto pt-2">
            Menos abas abertas, menos planilhas perdidas. O Dex unifica o que realmente importa para a saúde do seu escritório.
          </p>
        </div>

        {/* Grade Bento Responsiva: 1 coluna no celular (<768px), 2 colunas no tablet (md: 768px-1023px), 12 colunas no desktop (lg: >=1024px) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card Grande: Painel de Controle */}
          <div className="md:col-span-2 lg:col-span-7 bg-dex-cream dark:bg-[#162B37] rounded-[24px] border border-[#222222]/80 dark:border-[#214154] overflow-hidden shadow-sm flex flex-col sm:flex-row h-full">
            {/* Metade Esquerda: Texto Explicativo com tipografia fluida */}
            <div className="flex-1 p-6 sm:p-8 lg:p-12 flex flex-col justify-center space-y-3 sm:space-y-4">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-dex-navy-950 dark:text-white tracking-tight leading-[1.15]">
                Painel de<br className="hidden sm:inline" /> Controle
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-dex-support dark:text-[#A7BAC5] leading-relaxed max-w-sm">
                O pulso do seu escritório em uma única tela. Receitas, andamentos e alertas críticos disponíveis no momento em que você acessa o sistema.
              </p>
            </div>

            {/* Metade Direita / Inferior: Gráfico decorativo de duas barras (empilha no celular, lado a lado no tablet e desktop) */}
            <div className="w-full sm:w-[46%] lg:w-[48%] bg-[#EAE0DA] dark:bg-[#0F2733] border-t sm:border-t-0 sm:border-l border-[#222222]/20 dark:border-[#214154] flex items-end justify-center gap-4 sm:gap-6 px-6 pt-8 pb-6 sm:pb-10 self-stretch min-h-[180px] sm:min-h-[260px] lg:min-h-full">
              {/* Cápsula 1 (menor) */}
              <div className="w-10 sm:w-12 lg:w-14 h-28 sm:h-36 lg:h-48 rounded-full border-[1.5px] border-[#222222]/80 dark:border-[#4A808E] bg-[#EAE0DA] dark:bg-[#162B37] shadow-xs flex-shrink-0" />
              {/* Cápsula 2 (maior) */}
              <div className="w-10 sm:w-12 lg:w-14 h-40 sm:h-48 lg:h-64 rounded-full border-[1.5px] border-[#222222]/80 dark:border-[#4A808E] bg-[#EAE0DA] dark:bg-[#162B37] shadow-xs flex-shrink-0" />
            </div>
          </div>

          {/* Cards Secundários: lado a lado no tablet (md), empilhados na coluna direita no desktop (lg) */}
          <div className="md:col-span-2 lg:col-span-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 h-full">
            {/* Card Superior / Coluna 1: Acompanhamento */}
            <div className="bg-dex-cream dark:bg-[#162B37] rounded-[24px] border border-[#222222]/80 dark:border-[#214154] p-6 sm:p-8 lg:p-9 flex flex-col justify-center shadow-sm">
              <div className="space-y-3">
                <div className="w-10 h-10 text-dex-navy-950 dark:text-[#F9ECE2]">
                  <Scale className="w-7 h-7 stroke-[1.8]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-dex-navy-950 dark:text-white">
                  Acompanhamento
                </h3>
                <p className="text-xs sm:text-sm text-dex-support dark:text-[#A7BAC5] leading-relaxed">
                  Cada movimentação ou mudança de status organizada em uma linha do tempo clara.
                </p>
              </div>
            </div>

            {/* Card Inferior / Coluna 2: Carteira de Clientes */}
            <div className="bg-dex-cream dark:bg-[#162B37] rounded-[24px] border border-[#222222]/80 dark:border-[#214154] p-6 sm:p-8 lg:p-9 flex flex-col justify-center shadow-sm">
              <div className="space-y-3">
                <div className="w-10 h-10 text-dex-navy-950 dark:text-[#F9ECE2]">
                  <Users className="w-7 h-7 stroke-[1.8]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-dex-navy-950 dark:text-white">
                  Carteira de Clientes
                </h3>
                <p className="text-xs sm:text-sm text-dex-support dark:text-[#A7BAC5] leading-relaxed">
                  Mantenha o histórico completo de contratos, processos e comunicações.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO DEX AI 2.0 INTERATIVA */}
      <section id="dex-ai" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#D8C3B5]/70 dark:border-[#214154]">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dex-peach/80 dark:bg-[#162B37] border border-dex-terracotta/40 dark:border-[#4A808E] text-dex-navy-950 dark:text-[#F9ECE2] text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-dex-coral" />
            <span>Motor Dex AI 2.0 • Triagem Jurídica de Casos</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-dex-navy-950 dark:text-white">
            Inteligência que entende o ritual forense
          </h2>
          <p className="text-base sm:text-lg text-dex-support dark:text-[#A7BAC5]">
            Cole um relato informal, áudio do WhatsApp ou entrevista com o cliente. O Dex AI identifica a área jurídica, extrai os fatos essenciais, formula a tese e calcula a estimativa da causa.
          </p>
        </div>

        {/* Seletor de Casos de Demonstração */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {aiDemoCases.map((item, idx) => (
            <button
              key={item.title}
              onClick={() => setActiveAiDemoIndex(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeAiDemoIndex === idx
                  ? 'bg-dex-navy-950 dark:bg-[#4A808E] text-white shadow-md'
                  : 'bg-dex-beige dark:bg-[#162B37] hover:bg-dex-peach dark:hover:bg-[#214154] text-dex-navy-950 dark:text-[#F9ECE2] border border-dex-border dark:border-[#214154]'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Card Interativo do Caso Selecionado */}
        {(() => {
          const current = aiDemoCases[activeAiDemoIndex];
          return (
            <div className="bg-dex-beige/70 dark:bg-[#162B37] rounded-[28px] border border-[#222222]/60 dark:border-[#214154] p-6 sm:p-10 shadow-md max-w-5xl mx-auto space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Relato Bruto do Cliente */}
                <div className="lg:col-span-5 space-y-3 bg-white/70 dark:bg-[#0F2733] p-6 rounded-2xl border border-dex-border dark:border-[#214154]">
                  <span className="text-xs font-bold uppercase tracking-wider text-dex-support dark:text-[#82B3C0]">
                    Relato Bruto do Cliente:
                  </span>
                  <p className="text-sm text-dex-navy-950 dark:text-[#F9ECE2] italic leading-relaxed">
                    "{current.prompt}"
                  </p>
                  <div className="pt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${current.urgencyColor}`}>
                      Urgência: {current.urgency}
                    </span>
                  </div>
                </div>

                {/* Estruturação Jurídica da IA */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-dex-support dark:text-[#82B3C0]">
                      Enquadramento Jurídico Sugerido:
                    </span>
                    <h4 className="text-lg font-bold text-dex-navy-950 dark:text-white">
                      {current.framing}
                    </h4>
                  </div>

                  {/* Perguntas Cruciais */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-dex-support dark:text-[#82B3C0]">
                      Perguntas Fundamentais para a Entrevista:
                    </span>
                    <ul className="space-y-2">
                      {current.questions.map((q, i) => (
                        <li key={i} className="text-xs sm:text-sm text-dex-navy-950 dark:text-[#E2ECF0] flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-dex-coral shrink-0 mt-0.5" />
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Documentos Exigidos */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-dex-support dark:text-[#82B3C0]">
                      Checklist Probatório Recomendado:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {current.documents.map((d, i) => (
                        <span key={i} className="text-xs bg-dex-input dark:bg-[#0F2733] px-3 py-1 rounded-lg text-dex-navy-950 dark:text-[#F9ECE2] font-medium border border-dex-border/60 dark:border-[#214154]">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Valor Estimado */}
                  <div className="pt-2 flex items-center justify-between border-t border-dex-border dark:border-[#214154]">
                    <span className="text-xs text-dex-support dark:text-[#A7BAC5] font-medium">Estimativa do Pedido:</span>
                    <span className="text-xl font-bold font-display text-dex-coral">{current.value}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* SEÇÃO PLANOS & PREÇOS */}
      <section id="planos" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#D8C3B5]/70 dark:border-[#214154]">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-dex-navy-950 dark:text-white">
            Investimento transparente para cada fase da sua banca
          </h2>
          <p className="text-base sm:text-lg text-dex-support dark:text-[#A7BAC5]">
            Sem fidelidade forçada. Cancele ou altere seu plano quando desejar.
          </p>

          {/* Alternador Mensal / Anual */}
          <div className="inline-flex items-center gap-2 p-1 rounded-full bg-dex-beige dark:bg-[#162B37] border border-dex-border dark:border-[#214154] mt-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-dex-navy-950 dark:bg-[#4A808E] text-white shadow' : 'text-dex-support dark:text-[#A7BAC5] hover:text-dex-navy-950 dark:hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-dex-navy-950 dark:bg-[#4A808E] text-white shadow' : 'text-dex-support dark:text-[#A7BAC5] hover:text-dex-navy-950 dark:hover:text-white'
              }`}
            >
              <span>Anual</span>
              <span className="px-2 py-0.5 rounded-full bg-dex-coral text-white text-[10px] font-bold">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Grid de 3 Planos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {/* Plano 1: Advogado Individual */}
          <div className="bg-dex-cream dark:bg-[#162B37] rounded-[24px] border border-[#222222]/80 dark:border-[#214154] p-8 flex flex-col justify-between shadow-sm">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-dex-support dark:text-[#82B3C0]">Autônomo</span>
                <h3 className="text-2xl font-display font-bold text-dex-navy-950 dark:text-white mt-1">Essencial Autônomo</h3>
                <p className="text-xs text-dex-support dark:text-[#A7BAC5] mt-2">Para advogados autônomos e individuais em ascensão.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-display font-bold text-dex-navy-950 dark:text-white">
                  {billingCycle === 'yearly' ? 'R$ 79' : 'R$ 99'}
                </span>
                <span className="text-xs text-dex-support dark:text-[#A7BAC5]">/mês</span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-dex-border dark:border-[#214154] text-xs text-dex-navy-950 dark:text-[#E2ECF0]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral" />
                  <span>1 Usuário com OAB</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral" />
                  <span>Até 120 Processos Ativos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral" />
                  <span>150 Consultas de IA Forense / mês</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral" />
                  <span>Controle de Prazos Fatais & Exportação</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigateToRegister('Essencial')}
              className="mt-8 w-full py-3 rounded-xl bg-dex-slate-dark hover:bg-dex-slate-darkHover dark:bg-[#4A808E] dark:hover:bg-[#3d6a76] text-white text-xs font-semibold shadow transition-all cursor-pointer"
            >
              Começar com Essencial
            </button>
          </div>

          {/* Plano 2: Profissional (Destaque) */}
          <div className="bg-dex-peach/90 dark:bg-[#1E3A4B] rounded-[24px] border-2 border-dex-navy-950 dark:border-[#4A808E] p-8 flex flex-col justify-between shadow-xl relative scale-105 z-10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-dex-coral text-white text-[11px] font-bold shadow-md">
              Mais Recomendado
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-dex-navy-950 dark:text-[#82B3C0]">Banca em Expansão</span>
                <h3 className="text-2xl font-display font-bold text-dex-navy-950 dark:text-white mt-1">Profissional</h3>
                <p className="text-xs text-dex-navy-950/80 dark:text-[#C5D2D9] mt-2">Gestão integrada completa de equipe, honorários e IA.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-display font-bold text-dex-navy-950 dark:text-white">
                  {billingCycle === 'yearly' ? 'R$ 189' : 'R$ 229'}
                </span>
                <span className="text-xs text-dex-navy-950/80 dark:text-[#C5D2D9]">/mês</span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-dex-navy-950/20 dark:border-[#214154] text-xs text-dex-navy-950 dark:text-[#E2ECF0] font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral stroke-[2.5]" />
                  <span>Até 3 Advogados na Equipe</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral stroke-[2.5]" />
                  <span>Até 500 Processos & 350 Clientes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral stroke-[2.5]" />
                  <span>500 Requisições de IA Forense / mês</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral stroke-[2.5]" />
                  <span>Mural da Equipe & Gestão de Produtividade</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral stroke-[2.5]" />
                  <span>Exportação de Planilhas em XLSX & CSV</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigateToRegister('Profissional')}
              className="mt-8 w-full py-3.5 rounded-xl bg-dex-navy-950 dark:bg-[#4A808E] hover:bg-dex-navy-900 dark:hover:bg-[#3d6a76] text-white text-xs font-bold shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Experimentar 14 Dias Grátis
            </button>
          </div>

          {/* Plano 3: Escritório Pro */}
          <div className="bg-dex-cream dark:bg-[#162B37] rounded-[24px] border border-[#222222]/80 dark:border-[#214154] p-8 flex flex-col justify-between shadow-sm">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-dex-support dark:text-[#82B3C0]">Grandes Bancas</span>
                <h3 className="text-2xl font-display font-bold text-dex-navy-950 dark:text-white mt-1">Escritório Pro</h3>
                <p className="text-xs text-dex-support dark:text-[#A7BAC5] mt-2">Bancas consolidadas e sociedades corporativas.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-display font-bold text-dex-navy-950 dark:text-white">
                  {billingCycle === 'yearly' ? 'R$ 379' : 'R$ 449'}
                </span>
                <span className="text-xs text-dex-support dark:text-[#A7BAC5]">/mês</span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-dex-border dark:border-[#214154] text-xs text-dex-navy-950 dark:text-[#E2ECF0]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral" />
                  <span>Até 15 Advogados na Banca</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral" />
                  <span>Processos em Escala (até 5.000 ativos)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral" />
                  <span>2.000 Requisições de IA Forense / mês</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral" />
                  <span>Auditoria Completa LGPD & Suporte Prioritário</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigateToRegister('Escritório Pro')}
              className="mt-8 w-full py-3 rounded-xl bg-dex-slate-dark hover:bg-dex-slate-darkHover dark:bg-[#4A808E] dark:hover:bg-[#3d6a76] text-white text-xs font-semibold shadow transition-all cursor-pointer"
            >
              Assinar Escritório Pro
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO FAQ */}
      <section id="faq" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto border-t border-[#D8C3B5]/70 dark:border-[#214154]">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-dex-navy-950 dark:text-white">
            Perguntas Frequentes
          </h2>
          <p className="text-sm sm:text-base text-dex-support dark:text-[#A7BAC5]">
            Tire suas dúvidas sobre segurança, ética na advocacia e recursos da plataforma.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={faq.q}
                className="bg-dex-beige/60 dark:bg-[#162B37] rounded-2xl border border-dex-border/80 dark:border-[#214154] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-display font-bold text-base sm:text-lg text-dex-navy-950 dark:text-[#F9ECE2]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-dex-navy-950 dark:text-[#F9ECE2] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-dex-coral' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-dex-support dark:text-[#A7BAC5] leading-relaxed border-t border-dex-border/40 dark:border-[#214154]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER ELEGANTE */}
      <footer id="sobre" className="bg-[#EAE0DA] dark:bg-[#0F2733] border-t border-[#D8C3B5] dark:border-[#214154] py-14 px-4 sm:px-6 lg:px-12 transition-colors">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-between">
          <div className="md:col-span-5 space-y-3">
            <DexLogo variant={effectiveTheme === 'dark' ? 'light' : 'dark'} size="md" subtitle="Sistema de Advocacia" />
            <p className="text-xs text-dex-support dark:text-[#A7BAC5] max-w-sm leading-relaxed">
              Plataforma de governança forense e gestão jurídica orientada a dados com inteligência artificial ética.
            </p>
          </div>

          <div className="md:col-span-4 flex flex-wrap gap-6 text-xs text-dex-support dark:text-[#A7BAC5] font-medium">
            <button onClick={() => scrollToSection('recursos')} className="hover:text-dex-navy-950 dark:hover:text-white cursor-pointer">
              Recursos
            </button>
            <button onClick={() => scrollToSection('planos')} className="hover:text-dex-navy-950 dark:hover:text-white cursor-pointer">
              Planos & Preços
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-dex-navy-950 dark:hover:text-white cursor-pointer">
              Perguntas Frequentes
            </button>
            <button onClick={onNavigateToLogin} className="hover:text-dex-navy-950 dark:hover:text-white cursor-pointer">
              Acesso ao Sistema
            </button>
          </div>

          <div className="md:col-span-3 text-left md:text-right text-xs text-dex-support dark:text-[#A7BAC5] space-y-1">
            <p>© {new Date().getFullYear()} Dex Jurídico.</p>
            <p>Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
