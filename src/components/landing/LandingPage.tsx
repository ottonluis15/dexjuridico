import React, { useState } from 'react';
import { 
  Scale, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  FolderKanban, 
  DollarSign, 
  Users, 
  FileText, 
  Zap, 
  ChevronDown, 
  Play, 
  Star, 
  Lock, 
  HelpCircle, 
  BookOpen, 
  ShieldAlert, 
  Check, 
  Cpu, 
  Building2, 
  Award,
  Globe,
  ExternalLink
} from 'lucide-react';

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
      urgencyColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
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
      urgency: 'MEDIA',
      urgencyColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
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
      urgency: 'CRITICA',
      urgencyColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans antialiased overflow-x-hidden">
      {/* Glow decorative blurs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-brand-600/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-[800px] left-0 w-[500px] h-[500px] bg-brand-700/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Bar Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 via-brand-600 to-slate-900 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-black tracking-tight text-white">DEX</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Legal AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Gestão Jurídica Inteligente</p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#recursos" className="hover:text-cyan-400 transition-colors">Recursos</a>
            <a href="#dex-ai" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Dex AI 2.0
            </a>
            <a href="#modulos" className="hover:text-cyan-400 transition-colors">Módulos</a>
            <a href="#planos" className="hover:text-cyan-400 transition-colors">Planos & Preços</a>
            <a href="#seguranca" className="hover:text-cyan-400 transition-colors">LGPD & OAB</a>
            <a href="#faq" className="hover:text-cyan-400 transition-colors">FAQ</a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {isLoggedIn && onBackToApp ? (
              <button
                onClick={onBackToApp}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all flex items-center gap-2"
              >
                <span>Voltar ao Sistema</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            ) : (
              <>
                <button
                  onClick={onNavigateToLogin}
                  className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-all"
                >
                  Entrar
                </button>
                <button
                  onClick={() => onNavigateToRegister('Escritório Pro')}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-brand-600 to-brand-500 hover:from-cyan-400 hover:to-brand-400 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span>Cadastre-se Grátis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Floating Release Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold mb-8 backdrop-blur-md shadow-lg shadow-cyan-950/50 animate-bounce duration-1000">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Nova Versão 2.0 com Dex AI & Conformidade Total OAB/LGPD</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-6">
          Gestão Jurídica de Alta Precisão com o Poder da{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-brand-300 to-brand-500 bg-clip-text text-transparent">
            Inteligência Artificial
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
          Centralize processos no padrão CNJ, blinde seu escritório contra perda de prazos fatais com controle militar, controle honorários e realize triagens preditivas de casos em segundos com o <strong>Dex AI</strong>.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          <button
            onClick={() => onNavigateToRegister('Escritório Pro')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-brand-600 to-brand-500 hover:from-cyan-400 hover:to-brand-400 text-white text-sm font-bold shadow-xl shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>Iniciar Avaliação Grátis</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onNavigateToLogin}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-sm font-bold border border-slate-700/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            <span>Ver Demonstração ao Vivo</span>
          </button>
        </div>

        {/* Trust Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">+15.000</div>
            <div className="text-xs text-slate-400 font-medium">Processos CNJ Gerenciados</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mb-1">99.8%</div>
            <div className="text-xs text-slate-400 font-medium">Precisão em Prazos Fatais</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mb-1">100%</div>
            <div className="text-xs text-slate-400 font-medium">Conformidade OAB & LGPD</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-300 mb-1">14h/sem</div>
            <div className="text-xs text-slate-400 font-medium">Economizadas por Advogado</div>
          </div>
        </div>

        {/* Interactive App Preview Showcase */}
        <div className="mt-16 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-4 sm:p-6 text-left relative overflow-hidden backdrop-blur-2xl">
          {/* Mock Window Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-400 pl-2">
                dex-juridico.adv.br • Cockpit Operacional
              </span>
            </div>

            {/* Interactive Preview Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/90 border border-slate-700/60 text-xs">
              <button
                onClick={() => setActivePreviewTab('ai')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activePreviewTab === 'ai' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dex AI</span>
              </button>
              <button
                onClick={() => setActivePreviewTab('deadlines')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activePreviewTab === 'deadlines' ? 'bg-brand-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Prazos Fatais</span>
              </button>
              <button
                onClick={() => setActivePreviewTab('finance')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activePreviewTab === 'finance' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Honorários</span>
              </button>
              <button
                onClick={() => setActivePreviewTab('overview')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activePreviewTab === 'overview' ? 'bg-slate-700 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>Visão Geral</span>
              </button>
            </div>
          </div>

          {/* Dynamic Mock Content */}
          <div className="pt-6">
            {activePreviewTab === 'ai' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded">
                      Análise Cognitiva Automática
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">
                      Ação Indenizatória por Extravio de Carga & Danos Morais
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 font-mono">Valor Estimado: R$ 64.000,00</span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Urgência: ALTA
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <span className="font-bold text-cyan-300 uppercase text-[11px] block">1. Enquadramento Legal</span>
                    <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                      Art. 749 e 750 do Código Civil c/c Art. 14 do CDC. Responsabilidade objetiva do transportador e indenização punitiva.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <span className="font-bold text-amber-300 uppercase text-[11px] block">2. Perguntas de Instrução</span>
                    <ul className="text-slate-300 space-y-1 list-disc list-inside">
                      <li>Houve declaração de valor da carga na emissão da nota fiscal?</li>
                      <li>Houve contratação de seguro próprio pela transportadora?</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <span className="font-bold text-emerald-300 uppercase text-[11px] block">3. Checklist de Documentos</span>
                    <ul className="text-slate-300 space-y-1 list-disc list-inside">
                      <li>Conhecimento de Transporte Eletrônico (CT-e)</li>
                      <li>Boletim de Ocorrência Policial</li>
                      <li>Notas fiscais de aquisição das mercadorias</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'deadlines' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <div>
                      <span className="font-bold text-white block">Contestação — Proc. 1024589-32.2024.8.26.0100</span>
                      <span className="text-slate-400 text-[11px]">3ª Vara Cível Central • Dra. Helena Moreira</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-400 block">VENCE HOJE (18:00)</span>
                    <span className="text-[10px] text-slate-400">Classificação: CRÍTICA</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">Audiência de Instrução — Proc. 0001248-89.2024.5.02.0012</span>
                    <span className="text-slate-400 text-[11px]">12ª Vara do Trabalho de SP • Dr. Lucas Mendes</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-300 block">Em 3 dias (14:30)</span>
                    <span className="text-[10px] text-slate-400">Classificação: ALTA</span>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'finance' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs">
                    <span className="text-slate-400 text-[11px] block">Honorários Recebidos (Mês)</span>
                    <span className="text-xl font-bold text-emerald-400 mt-1 block">R$ 54.200,00</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs">
                    <span className="text-slate-400 text-[11px] block">Honorários a Receber</span>
                    <span className="text-xl font-bold text-amber-300 mt-1 block">R$ 28.500,00</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-brand-950/40 border border-brand-500/30 text-xs">
                    <span className="text-slate-400 text-[11px] block">Contratos de Êxito Ativos</span>
                    <span className="text-xl font-bold text-brand-300 mt-1 block">18 Demandas</span>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'overview' && (
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-center space-y-2">
                <div className="text-sm font-bold text-white">Cockpit Completo de Gestão Jurídica Modular</div>
                <p className="text-xs text-slate-300 max-w-xl mx-auto">
                  Acesse em uma única tela: lista de processos no formato CNJ, status de honorários contratuais, repositório de documentos sob sigilo e mural de comunicação da banca.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Dex AI Simulation Section */}
      <section id="dex-ai" className="py-20 bg-slate-900/60 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 inline-flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Simulador Interativo
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Veja o Dex AI em Ação em Segundos
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Escolha um relato fático real abaixo e veja como a IA estrutura instantaneamente o enquadramento, perguntas probatórias e cálculo preliminar de urgência.
            </p>
          </div>

          {/* Scenario Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {aiDemoCases.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveAiDemoIndex(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeAiDemoIndex === idx
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 scale-105'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}
              >
                <span>{item.title}</span>
              </button>
            ))}
          </div>

          {/* AI Simulator Output Card */}
          {(() => {
            const currentCase = aiDemoCases[activeAiDemoIndex];
            return (
              <div className="max-w-4xl mx-auto rounded-3xl bg-slate-950 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Relato Bruto Apresentado pelo Cliente:
                  </span>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 italic leading-relaxed">
                    "{currentCase.prompt}"
                  </div>
                </div>

                {/* AI Processing Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-cyan-400">Enquadramento Automático</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{currentCase.framing}</h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-emerald-400 font-mono">Causa: {currentCase.value}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${currentCase.urgencyColor}`}>
                      Urgência: {currentCase.urgency}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      Perguntas para a Entrevista de Instrução
                    </span>
                    <ul className="text-xs text-slate-300 space-y-2 pt-1">
                      {currentCase.questions.map((q, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Checklist Probatório Recomendado
                    </span>
                    <ul className="text-xs text-slate-300 space-y-2 pt-1">
                      {currentCase.documents.map((doc, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Call to Action Button to Open or Test */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
                  <div className="text-xs text-slate-400">
                    O Dex converte esta análise diretamente em um processo CNJ com 1 clique.
                  </div>
                  <button
                    onClick={() => onNavigateToRegister('Escritório Pro')}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Testar Gratuitamente no seu Escritório</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Modules Feature Grid */}
      <section id="modulos" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/30 mb-3 inline-block">
            Arquitetura Modular
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Tudo o que seu Escritório Precisa em uma Só Plataforma
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Módulos integrados projetados sob as melhores práticas de governança jurídica e engenharia de software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Dex AI 2.0 • Triagem Jurídica</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interpreta relatos de clientes, sugere tipo de ação, fundamentação legal prévia, cálculo de urgência e salva o processo no sistema com 1 clique.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6 text-brand-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Controle Militar de Prazos</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Classificação por fatalidade (Crítica, Alta, Média), filtros temporais (Hoje, Esta Semana, Vencidos) e baixa ágil em 1 clique.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Financeiro & Honorários</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gestão de honorários contratuais, retainers mensais, contratos de êxito e controle de pagamentos (PIX, Boleto, TED).
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <FolderKanban className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Processos no Padrão CNJ</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Controle estrito de numeração no formato CNJ (0000000-00.0000.0.00.0000), fases processuais, vinculação de advogado e valor da causa.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Repositório & Sigilo</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Armazenamento seguro de peças, procurações e laudos técnicos com flag explícita de sigilo profissional e validação de formatos.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Governança LGPD & Auditoria</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inventário dos dados pessoais tratados (finalidades e base legal) e trilha imutável de logs de acessos com IP e usuário.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section id="planos" className="py-20 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 mb-3 inline-block">
              Planos Transparentes
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Investimento sob Medida para sua Banca
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Comece agora sem taxa de implantação e com 14 dias de garantia incondicional.
            </p>

            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
                Mensal
              </span>
              <button
                type="button"
                onClick={() => setBillingCycle(b => b === 'monthly' ? 'yearly' : 'monthly')}
                className="w-12 h-6 rounded-full bg-slate-800 border border-slate-700 p-0.5 transition-colors relative cursor-pointer"
              >
                <div className={`w-4 h-4 rounded-full bg-cyan-400 transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-400'}`}>
                Anual
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Economize 20%
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan 1 */}
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Advogado Individual</h3>
                <p className="text-xs text-slate-400 mt-1">Ideal para profissionais autônomos</p>
                <div className="mt-6">
                  <span className="text-4xl font-black text-white">
                    {billingCycle === 'yearly' ? 'R$ 89' : 'R$ 109'}
                  </span>
                  <span className="text-xs text-slate-400">/mês</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>1 Usuário (Advogado Titular)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Até 150 Processos CNJ ativos</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>50 Análises Dex AI por mês</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Controle de Prazos Fatais & Agenda</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Controle Financeiro de Honorários</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onNavigateToRegister('Advogado Individual')}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                Cadastrar Individual
              </button>
            </div>

            {/* Plan 2: FEATURED */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-cyan-950/40 border-2 border-cyan-500 shadow-2xl shadow-cyan-950/50 flex flex-col justify-between space-y-6 relative scale-105 z-10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-brand-500 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider shadow">
                Mais Escolhido pelos Escritórios ⭐
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Escritório Pro</h3>
                <p className="text-xs text-cyan-200 mt-1">Para bancas de pequeno e médio porte</p>
                <div className="mt-6">
                  <span className="text-4xl font-black text-white">
                    {billingCycle === 'yearly' ? 'R$ 199' : 'R$ 249'}
                  </span>
                  <span className="text-xs text-slate-300">/mês</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-slate-200">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span><strong>Até 5 Advogados</strong> com controle RBAC</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span><strong>Processos CNJ Ilimitados</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span><strong>Dex AI Ilimitado</strong> com motor Claude/Gemini</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Área do Advogado personalizada</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Módulo Financeiro Avançado & Extratos</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Mural da Equipe & Gestão de Pauta</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onNavigateToRegister('Escritório Pro')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-brand-600 to-brand-500 hover:from-cyan-400 hover:to-brand-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                Cadastrar Escritório Pro (14 dias grátis)
              </button>
            </div>

            {/* Plan 3 */}
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Banca Corporativa</h3>
                <p className="text-xs text-slate-400 mt-1">Para sociedades consolidadas e filiais</p>
                <div className="mt-6">
                  <span className="text-4xl font-black text-white">
                    {billingCycle === 'yearly' ? 'R$ 499' : 'R$ 599'}
                  </span>
                  <span className="text-xs text-slate-400">/mês</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Advogados & Estagiários Ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Múltiplas Filiais e Centros de Custo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Trilha LGPD Avançada com DPO dedicado</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>API Aberta para Integração com Tribunais</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Suporte VIP via WhatsApp 24/7</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onNavigateToRegister('Banca Corporativa')}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                Falar com Especialista
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-3 inline-block">
            Depoimentos Reais
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Advogados que Confiam no DEX
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "O Dex AI revolucionou a nossa triagem inicial. Reduzimos o tempo de atendimento em mais de 60% e nunca mais perdemos um prazo fatal."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120"
                alt="Dra. Helena"
                className="w-10 h-10 rounded-full object-cover border border-cyan-400/30"
              />
              <div>
                <span className="text-xs font-bold text-white block">Dra. Helena Moreira</span>
                <span className="text-[11px] text-slate-400 block">Sócia • OAB 184.920/SP</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "A clareza dos filtros de prazos e audiências é fantástica. A equipe inteira sabe exatamente o que precisa ser cumprido em cada dia."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=120"
                alt="Dr. Lucas"
                className="w-10 h-10 rounded-full object-cover border border-slate-700"
              />
              <div>
                <span className="text-xs font-bold text-white block">Dr. Lucas Mendes</span>
                <span className="text-[11px] text-slate-400 block">Trabalhista • OAB 312.450/SP</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "O respeito rigoroso às normas da OAB e à LGPD nos deu a segurança necessária para adotar IA no nosso escritório sem riscos éticos."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=120"
                alt="Dra. Beatriz"
                className="w-10 h-10 rounded-full object-cover border border-slate-700"
              />
              <div>
                <span className="text-xs font-bold text-white block">Dra. Beatriz Albuquerque</span>
                <span className="text-[11px] text-slate-400 block">Cível • OAB 278.114/SP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & LGPD Banner */}
      <section id="seguranca" className="py-16 bg-slate-900/80 border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>Segurança da Informação & Sigilo Profissional</span>
            </div>
            <h3 className="text-2xl font-bold text-white">Blindagem Jurídica e Proteção Total de Dados</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Desenvolvido com criptografia de ponta a ponta, backups diários automatizados, trilha imutável de auditoria e conformidade certificada com a Lei Geral de Proteção de Dados (Lei 13.709/2018) e Provimento OAB nº 205/2021.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <Lock className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-white block">Criptografia RSA</span>
              <span className="text-[10px] text-slate-400">Em repouso e trânsito</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <Award className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-white block">OAB Compliance</span>
              <span className="text-[10px] text-slate-400">Provimento 205/2021</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Perguntas Frequentes</h2>
          <p className="text-xs text-slate-400 mt-2">Tire suas dúvidas técnicas e operacionais sobre o DEX</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-brand-950 via-slate-900 to-cyan-950 border border-cyan-500/40 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Pronto para Elevar o Padrão do seu Escritório?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Junte-se a centenas de advogados que já transformaram a gestão da sua banca com o DEX. Crie sua conta em 1 minuto sem compromisso.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => onNavigateToRegister('Escritório Pro')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-brand-500 hover:from-cyan-400 hover:to-brand-400 text-white font-bold text-sm shadow-xl shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Cadastrar Gratuitamente Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 font-bold font-serif">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="text-white font-bold text-sm">DEX Legal AI</span>
              <p className="text-[10px]">Sistema de Gestão Jurídica Modularizado</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#recursos" className="hover:text-slate-300 transition-colors">Recursos</a>
            <a href="#dex-ai" className="hover:text-slate-300 transition-colors">Dex AI</a>
            <a href="#planos" className="hover:text-slate-300 transition-colors">Planos</a>
            <button onClick={onNavigateToLogin} className="hover:text-slate-300 transition-colors cursor-pointer">
              Login
            </button>
            <button onClick={() => onNavigateToRegister()} className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer">
              Criar Conta
            </button>
          </div>

          <div className="text-center md:text-right text-[11px]">
            © {new Date().getFullYear()} DEX Jurídico. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};
