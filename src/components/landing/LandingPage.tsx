import React, { useState } from 'react';
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
  FolderKanban
} from 'lucide-react';
import { DexLogo } from '../common/DexLogo';
import { DecorativeBars, DecorativeDots } from '../common/DecorativeBars';
import { HeroDashboardMockup } from './HeroDashboardMockup';

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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [activePreviewTab, setActivePreviewTab] = useState<'overview' | 'ai' | 'deadlines' | 'finance'>('ai');
  const [activeAiDemoIndex, setActiveAiDemoIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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
    <div className="min-h-screen bg-dex-cream text-dex-navy-950 font-serif selection:bg-dex-coral selection:text-white antialiased overflow-x-hidden">
      {/* Header (Anexo 1) */}
      <header className="sticky top-0 z-50 bg-dex-cream/95 backdrop-blur-md border-b border-[#D8C3B5]/90 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between">
          {/* Logo à esquerda */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="cursor-pointer transition-transform hover:scale-105"
          >
            <DexLogo variant="dark" size="md" />
          </div>

          {/* Links e Ações à direita */}
          <div className="flex items-center gap-6 sm:gap-10">
            <nav className="hidden md:flex items-center gap-8 text-sm text-dex-support font-medium">
              <button
                onClick={() => scrollToSection('recursos')}
                className="hover:text-dex-navy-950 transition-colors cursor-pointer"
              >
                Recursos
              </button>
              <button
                onClick={() => scrollToSection('sobre')}
                className="hover:text-dex-navy-950 transition-colors cursor-pointer"
              >
                Sobre nós
              </button>
              <button
                onClick={() => scrollToSection('planos')}
                className="hover:text-dex-navy-950 transition-colors cursor-pointer"
              >
                Planos
              </button>
            </nav>

            <div className="flex items-center gap-3 sm:gap-4">
              {isLoggedIn && onBackToApp ? (
                <button
                  onClick={onBackToApp}
                  className="px-5 py-2.5 rounded-xl bg-dex-navy-950 hover:bg-dex-navy-900 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Voltar ao Sistema</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <>
                  <button
                    onClick={onNavigateToLogin}
                    className="text-sm font-medium text-dex-support hover:text-dex-navy-950 transition-colors px-2 py-1 cursor-pointer"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => onNavigateToRegister('Escritório Pro')}
                    className="px-5 sm:px-6 py-2.5 rounded-xl bg-dex-navy-950 hover:bg-dex-navy-900 text-white text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Criar conta
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION (Fiel ao Anexo 1) */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Coluna Esquerda: Textos e CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Barras decorativas coral e teal empilhadas */}
            <DecorativeBars coralWidth="w-28 sm:w-36" tealWidth="w-28 sm:w-36" height="h-2" />

            {/* Título Principal Fiel ao Anexo 1 */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-[1.15] text-dex-coral tracking-tight">
              Onde a advocacia encontra sua{' '}
              <span className="block italic text-dex-navy-950 font-serif font-normal mt-1">
                melhor versão.
              </span>
            </h1>

            {/* Parágrafo de Apoio Cinza */}
            <p className="text-base sm:text-lg text-dex-support leading-relaxed max-w-xl">
              Deixamos a burocracia invisível. Centralize prazos, honorários e o andamento processual do seu escritório em uma interface desenhada para não atrapalhar o seu dia.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => onNavigateToRegister('Escritório Pro')}
                className="px-8 py-3.5 rounded-xl bg-dex-navy-950 hover:bg-dex-navy-900 text-white text-sm font-semibold shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Criar conta gratuitamente</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onNavigateToLogin}
                className="px-6 py-3.5 rounded-xl bg-dex-peach/60 hover:bg-dex-peach text-dex-navy-950 text-sm font-semibold border border-dex-border transition-all flex items-center justify-center gap-2 cursor-pointer"
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
      <section id="recursos" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#D8C3B5]/70">
        {/* Cabeçalho da Seção Centralizado */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-dex-navy-950 tracking-tight">
            Construído para quem vive o{' '}
            <span className="relative inline-block">
              Direito
              {/* Duas barras decorativas sublinhando a palavra Direito */}
              <span className="block mt-2">
                <DecorativeBars centered coralWidth="w-28 sm:w-36" tealWidth="w-28 sm:w-36" height="h-1.5" />
              </span>
            </span>
          </h2>

          <p className="text-base sm:text-lg text-dex-support leading-relaxed max-w-2xl mx-auto pt-2">
            Menos abas abertas, menos planilhas perdidas. O Dex unifica o que realmente importa para a saúde do seu escritório.
          </p>
        </div>

        {/* Grade Bento do Anexo 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card Grande à Esquerda: Painel de Controle */}
          <div className="lg:col-span-7 bg-dex-cream rounded-[24px] border border-[#222222]/80 p-8 sm:p-10 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Texto explicativo */}
              <div className="sm:col-span-7 space-y-4">
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-dex-navy-950">
                  Painel de Controle
                </h3>
                <p className="text-sm sm:text-base text-dex-support leading-relaxed">
                  O pulso do seu escritório em uma única tela. Receitas, andamentos e alertas críticos disponíveis no momento em que você acessa o sistema.
                </p>
              </div>

              {/* Painel bege com barras decorativas (Anexo 2) */}
              <div className="sm:col-span-5 bg-dex-beige rounded-2xl p-6 flex items-end justify-center gap-4 h-48 border border-[#D8C3B5]/60">
                <div className="w-10 h-28 rounded-full border border-dex-navy-950/60 bg-transparent" />
                <div className="w-10 h-40 rounded-full border border-dex-navy-950/60 bg-transparent" />
              </div>
            </div>
          </div>

          {/* Coluna Direita com 2 Cards Empilhados */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Card Superior: Acompanhamento */}
            <div className="flex-1 bg-dex-cream rounded-[24px] border border-[#222222]/80 p-7 sm:p-8 flex flex-col justify-between shadow-sm">
              <div className="space-y-3">
                <div className="w-10 h-10 text-dex-navy-950">
                  <Scale className="w-7 h-7 stroke-[1.8]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-dex-navy-950">
                  Acompanhamento
                </h3>
                <p className="text-sm text-dex-support leading-relaxed">
                  Cada movimentação ou mudança de status organizada em uma linha do tempo clara.
                </p>
              </div>
            </div>

            {/* Card Inferior: Carteira de Clientes */}
            <div className="flex-1 bg-dex-cream rounded-[24px] border border-[#222222]/80 p-7 sm:p-8 flex flex-col justify-between shadow-sm">
              <div className="space-y-3">
                <div className="w-10 h-10 text-dex-navy-950">
                  <Users className="w-7 h-7 stroke-[1.8]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-dex-navy-950">
                  Carteira de Clientes
                </h3>
                <p className="text-sm text-dex-support leading-relaxed">
                  Mantenha o histórico completo de contratos, processos e comunicações.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO DEX AI 2.0 INTERATIVA */}
      <section id="dex-ai" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#D8C3B5]/70">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dex-peach/80 border border-dex-terracotta/40 text-dex-navy-950 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-dex-coral" />
            <span>Motor Dex AI 2.0 • Triagem Jurídica de Casos</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-dex-navy-950">
            Inteligência que entende o ritual forense
          </h2>
          <p className="text-base sm:text-lg text-dex-support">
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
                  ? 'bg-dex-navy-950 text-white shadow-md'
                  : 'bg-dex-beige hover:bg-dex-peach text-dex-navy-950 border border-dex-border'
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
            <div className="bg-dex-beige/70 rounded-[28px] border border-[#222222]/60 p-6 sm:p-10 shadow-md max-w-5xl mx-auto space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Relato Bruto do Cliente */}
                <div className="lg:col-span-5 space-y-3 bg-white/70 p-6 rounded-2xl border border-dex-border">
                  <span className="text-xs font-bold uppercase tracking-wider text-dex-support">
                    Relato Bruto do Cliente:
                  </span>
                  <p className="text-sm text-dex-navy-950 italic leading-relaxed">
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
                    <span className="text-xs font-bold uppercase tracking-wider text-dex-support">
                      Enquadramento Jurídico Sugerido:
                    </span>
                    <h4 className="text-lg font-bold text-dex-navy-950">
                      {current.framing}
                    </h4>
                  </div>

                  {/* Perguntas Cruciais */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-dex-support">
                      Perguntas Fundamentais para a Entrevista:
                    </span>
                    <ul className="space-y-2">
                      {current.questions.map((q, i) => (
                        <li key={i} className="text-xs sm:text-sm text-dex-navy-950 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-dex-coral shrink-0 mt-0.5" />
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Documentos Exigidos */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-dex-support">
                      Checklist Probatório Recomendado:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {current.documents.map((d, i) => (
                        <span key={i} className="text-xs bg-dex-input px-3 py-1 rounded-lg text-dex-navy-950 font-medium border border-dex-border/60">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Valor Estimado */}
                  <div className="pt-2 flex items-center justify-between border-t border-dex-border">
                    <span className="text-xs text-dex-support font-medium">Estimativa do Pedido:</span>
                    <span className="text-xl font-bold font-display text-dex-coral">{current.value}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* SEÇÃO PLANOS & PREÇOS */}
      <section id="planos" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#D8C3B5]/70">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-dex-navy-950">
            Investimento transparente para cada fase da sua banca
          </h2>
          <p className="text-base sm:text-lg text-dex-support">
            Sem fidelidade forçada. Cancele ou altere seu plano quando desejar.
          </p>

          {/* Alternador Mensal / Anual */}
          <div className="inline-flex items-center gap-2 p-1 rounded-full bg-dex-beige border border-dex-border mt-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-dex-navy-950 text-white shadow' : 'text-dex-support hover:text-dex-navy-950'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-dex-navy-950 text-white shadow' : 'text-dex-support hover:text-dex-navy-950'
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
          <div className="bg-dex-cream rounded-[24px] border border-[#222222]/80 p-8 flex flex-col justify-between shadow-sm">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-dex-support">Autônomo</span>
                <h3 className="text-2xl font-display font-bold text-dex-navy-950 mt-1">Advogado Solo</h3>
                <p className="text-xs text-dex-support mt-2">Para profissionais independentes em ascensão.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-display font-bold text-dex-navy-950">
                  {billingCycle === 'yearly' ? 'R$ 89' : 'R$ 119'}
                </span>
                <span className="text-xs text-dex-support">/mês</span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-dex-border text-xs text-dex-navy-950">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral" />
                  <span>1 Usuário com OAB</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral" />
                  <span>Até 100 Processos Ativos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral" />
                  <span>50 Triagens de Dex AI / mês</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral" />
                  <span>Controle de Prazos Fatais & Agenda</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigateToRegister('Advogado Solo')}
              className="mt-8 w-full py-3 rounded-xl bg-dex-slate-dark hover:bg-dex-slate-darkHover text-white text-xs font-semibold shadow transition-all cursor-pointer"
            >
              Começar com Advogado Solo
            </button>
          </div>

          {/* Plano 2: Escritório Pro (Destaque) */}
          <div className="bg-dex-peach/90 rounded-[24px] border-2 border-dex-navy-950 p-8 flex flex-col justify-between shadow-xl relative scale-105 z-10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-dex-coral text-white text-[11px] font-bold shadow-md">
              Mais Escolhido pelas Bancas
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-dex-navy-950">Banca em Expansão</span>
                <h3 className="text-2xl font-display font-bold text-dex-navy-950 mt-1">Escritório Pro</h3>
                <p className="text-xs text-dex-navy-950/80 mt-2">Gestão integrada completa de equipe, honorários e IA.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-display font-bold text-dex-navy-950">
                  {billingCycle === 'yearly' ? 'R$ 239' : 'R$ 299'}
                </span>
                <span className="text-xs text-dex-navy-950/80">/mês</span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-dex-navy-950/20 text-xs text-dex-navy-950 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral stroke-[2.5]" />
                  <span>Até 5 Advogados & Colaboradores</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral stroke-[2.5]" />
                  <span>Processos & Clientes Ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral stroke-[2.5]" />
                  <span>Dex AI 2.0 Ilimitado com Transcrição de Áudio</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral stroke-[2.5]" />
                  <span>Mural da Equipe & Gestão de Produtividade</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral stroke-[2.5]" />
                  <span>Exportação de Relatórios em PDF & XLSX</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigateToRegister('Escritório Pro')}
              className="mt-8 w-full py-3.5 rounded-xl bg-dex-navy-950 hover:bg-dex-navy-900 text-white text-xs font-bold shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Experimentar 14 Dias Grátis
            </button>
          </div>

          {/* Plano 3: Corporate / Elite */}
          <div className="bg-dex-cream rounded-[24px] border border-[#222222]/80 p-8 flex flex-col justify-between shadow-sm">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-dex-support">Grandes Bancas</span>
                <h3 className="text-2xl font-display font-bold text-dex-navy-950 mt-1">Corporate & Sócios</h3>
                <p className="text-xs text-dex-support mt-2">Bancas consolidadas com múltiplos núcleos.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-display font-bold text-dex-navy-950">
                  {billingCycle === 'yearly' ? 'R$ 499' : 'R$ 599'}
                </span>
                <span className="text-xs text-dex-support">/mês</span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-dex-border text-xs text-dex-navy-950">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral" />
                  <span>Advogados & Estagiários Ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral" />
                  <span>Multi-Escritórios e Filiais</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral" />
                  <span>Auditoria Completa LGPD & Trilha Imutável</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dex-coral" />
                  <span>Suporte VIP via WhatsApp com Gerente Dedicado</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigateToRegister('Corporate')}
              className="mt-8 w-full py-3 rounded-xl bg-dex-slate-dark hover:bg-dex-slate-darkHover text-white text-xs font-semibold shadow transition-all cursor-pointer"
            >
              Falar com Consultor
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO FAQ */}
      <section id="faq" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto border-t border-[#D8C3B5]/70">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-dex-navy-950">
            Perguntas Frequentes
          </h2>
          <p className="text-sm sm:text-base text-dex-support">
            Tire suas dúvidas sobre segurança, ética na advocacia e recursos da plataforma.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={faq.q}
                className="bg-dex-beige/60 rounded-2xl border border-dex-border/80 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-display font-bold text-base sm:text-lg text-dex-navy-950">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-dex-navy-950 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-dex-coral' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-dex-support leading-relaxed border-t border-dex-border/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER ELEGANTE */}
      <footer id="sobre" className="bg-[#EAE0DA] border-t border-[#D8C3B5] py-14 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-between">
          <div className="md:col-span-5 space-y-3">
            <DexLogo variant="dark" size="md" subtitle="Sistema de Advocacia" />
            <p className="text-xs text-dex-support max-w-sm leading-relaxed">
              Plataforma de governança forense e gestão jurídica orientada a dados com inteligência artificial ética.
            </p>
          </div>

          <div className="md:col-span-4 flex flex-wrap gap-6 text-xs text-dex-support font-medium">
            <button onClick={() => scrollToSection('recursos')} className="hover:text-dex-navy-950 cursor-pointer">
              Recursos
            </button>
            <button onClick={() => scrollToSection('planos')} className="hover:text-dex-navy-950 cursor-pointer">
              Planos & Preços
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-dex-navy-950 cursor-pointer">
              Perguntas Frequentes
            </button>
            <button onClick={onNavigateToLogin} className="hover:text-dex-navy-950 cursor-pointer">
              Acesso ao Sistema
            </button>
          </div>

          <div className="md:col-span-3 text-left md:text-right text-xs text-dex-support space-y-1">
            <p>© {new Date().getFullYear()} Dex Jurídico.</p>
            <p>Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
