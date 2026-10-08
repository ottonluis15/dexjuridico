import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  HelpCircle, 
  FileCheck, 
  ShieldAlert, 
  FolderPlus, 
  Copy, 
  RotateCcw, 
  Settings, 
  Scale, 
  Check, 
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Cpu,
  Zap,
  CheckCircle2,
  DollarSign,
  Calendar,
  Building2
} from 'lucide-react';
import { aiService, SAMPLE_CASE_TEMPLATES } from '../../services/aiService';
import { AIAnalysisResult, LegalArea } from '../../types';
import { useData } from '../../context/DataContext';
import { PriorityBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface DexAIAssistantProps {
  onNavigateToCases: () => void;
}

export const DexAIAssistant: React.FC<DexAIAssistantProps> = ({ onNavigateToCases }) => {
  const { clients, lawyers, addCase, prefillCaseFromAI, clearPendingAiDraft, showToast } = useData();

  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet');

  // Estados do Modal de Criação e Salvamento do Processo
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedLawyerId, setSelectedLawyerId] = useState('');
  const [customCNJ, setCustomCNJ] = useState('');
  const [customCourt, setCustomCourt] = useState('Foro Central Cível / Especializado');
  const [customValue, setCustomValue] = useState('50000');
  const [customActionType, setCustomActionType] = useState('');
  const [customLegalArea, setCustomLegalArea] = useState<LegalArea>('Cível');

  const handleAnalyze = async () => {
    if (!promptText.trim()) {
      showToast('Por favor, digite ou selecione um relato fático para análise.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const result = await aiService.analyzeCase(promptText);
      setAnalysisResult(result);
      showToast('Análise jurídica estruturada com sucesso!', 'success');
    } catch (err) {
      showToast('Erro ao processar análise de IA.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyTemplate = (rawText: string) => {
    setPromptText(rawText);
  };

  const handleCopyToClipboard = (text: string, sectionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    showToast(`Conteúdo (${sectionName}) copiado para a área de transferência!`, 'info');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Abrir Modal com campos da IA prontos para revisão
  const openCreateModal = () => {
    if (!analysisResult) return;
    const randomCNJ = `10${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(10 + Math.random() * 89)}.2026.8.26.0100`;
    setCustomCNJ(randomCNJ);
    setSelectedClientId(clients[0]?.id || '');
    setSelectedLawyerId(lawyers[0]?.id || '');
    setCustomActionType(analysisResult.suggestedActionType);
    setCustomLegalArea(analysisResult.suggestedLegalArea);
    setCustomValue((analysisResult.estimatedValue || 50000).toString());
    setCustomCourt('Foro Central da Comarca da Capital / SP');
    setIsCreateModalOpen(true);
  };

  // Salvar Processo revisado no sistema
  const handleSaveProcessFromModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysisResult) return;

    if (!customCNJ.trim() || !selectedClientId || !selectedLawyerId || !customActionType.trim()) {
      showToast('Por favor, selecione cliente, advogado e preencha os campos obrigatórios (*).', 'warning');
      return;
    }

    const newCase = addCase({
      caseNumber: customCNJ.trim(),
      court: customCourt.trim() || 'Vara Cível / Especializada',
      clientId: selectedClientId,
      lawyerId: selectedLawyerId,
      legalArea: customLegalArea,
      actionType: customActionType.trim(),
      status: 'INICIAL',
      value: parseFloat(customValue) || 0,
      distributionDate: new Date().toISOString().substring(0, 10),
      description: analysisResult.factsSummary,
      notes: `[Triagem Dex AI]\nEnquadramento: ${analysisResult.legalFraming}\n\nPerguntas pendentes:\n- ${analysisResult.clarificationQuestions.join('\n- ')}\n\nChecklist Documental:\n- ${analysisResult.requiredDocuments.join('\n- ')}`
    });

    clearPendingAiDraft();
    setIsCreateModalOpen(false);
    showToast(`Processo ${newCase.caseNumber} salvo com sucesso no banco de dados!`, 'success');
    onNavigateToCases();
  };

  // Salvar Imediatamente com 1 clique usando padrões da IA
  const handleQuickSaveProcess = () => {
    if (!analysisResult) return;
    const randomCNJ = `10${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(10 + Math.random() * 89)}.2026.8.26.0100`;
    const defaultClientId = clients[0]?.id || '';
    const defaultLawyerId = lawyers[0]?.id || '';

    const newCase = addCase({
      caseNumber: randomCNJ,
      court: 'Foro Central da Comarca da Capital / SP',
      clientId: defaultClientId,
      lawyerId: defaultLawyerId,
      legalArea: analysisResult.suggestedLegalArea,
      actionType: analysisResult.suggestedActionType,
      status: 'INICIAL',
      value: analysisResult.estimatedValue || 50000,
      distributionDate: new Date().toISOString().substring(0, 10),
      description: analysisResult.factsSummary,
      notes: `[Triagem Dex AI]\nEnquadramento: ${analysisResult.legalFraming}\n\nPerguntas pendentes:\n- ${analysisResult.clarificationQuestions.join('\n- ')}\n\nChecklist Documental:\n- ${analysisResult.requiredDocuments.join('\n- ')}`
    });

    clearPendingAiDraft();
    showToast(`Processo ${newCase.caseNumber} gerado e salvo com sucesso!`, 'success');
    onNavigateToCases();
  };

  const urgencyColors = {
    BAIXA: 'bg-slate-800 text-slate-300 border-slate-700',
    MEDIA: 'bg-blue-950/80 text-blue-300 border-blue-800',
    ALTA: 'bg-amber-950/80 text-amber-300 border-amber-800',
    CRITICA: 'bg-rose-950/80 text-rose-300 border-rose-800'
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Dex AI 2.0 • Triagem Jurídica Assistida
            </span>
            <span className="text-xs text-slate-400">Direito Brasileiro & LGPD</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Assistente Jurídico Inteligente
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Cole ou digite o relato inicial do cliente. A IA estrutura a síntese dos fatos, enquadramento preliminar, perguntas de instrução, lista de documentos e análise de urgência.
          </p>
        </div>

        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold self-start md:self-auto transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Configurar Conector LLM</span>
        </button>
      </div>

      {/* LLM Connector Settings Accordion (Se expandido) */}
      {isSettingsOpen && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 animate-in fade-in space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Integração com Provedores de IA (Anthropic Claude, Gemini, OpenAI)
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">Modo: Motor Local Otimizado + Conector Aberto</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            O Dex possui um motor cognitivo analítico local pronto para demonstração offline, além de um conector padronizado em <code className="text-brand-300">src/services/aiService.ts</code> para integração com APIs reais de LLM em produção.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Modelo Selecionado</label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet (Recomendado para Direito)</option>
                <option value="gemini-1-5-pro">Google Gemini 1.5 Pro</option>
                <option value="gpt-4o">OpenAI GPT-4o</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Chave de API (Opcional)</label>
              <input
                type="password"
                placeholder="sk-ant-... ou AIzaSy..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sample Scenarios Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Ou carregue um caso de exemplo real para teste imediato:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SAMPLE_CASE_TEMPLATES.map(template => (
            <button
              key={template.id}
              onClick={() => handleApplyTemplate(template.rawText)}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
            >
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 inline-block mb-1.5">
                {template.category}
              </span>
              <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                {template.title.split(':')[1] || template.title}
              </h5>
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                {template.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Input Prompt Section */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <div>
          <label className="block text-xs font-bold text-white mb-1.5 flex items-center justify-between">
            <span>Relato Fático do Caso / Mensagem do Cliente</span>
            <span className="text-xs text-slate-400 font-normal">
              {promptText.length} caracteres
            </span>
          </label>
          <textarea
            rows={5}
            placeholder="Cole aqui o relato fático bruto, anotações de entrevista com o cliente ou histórico narrado..."
            value={promptText}
            onChange={e => setPromptText(e.target.value)}
            className="w-full p-4 bg-slate-800/90 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 leading-relaxed font-sans"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Scale className="w-4 h-4 text-cyan-400" />
            <span>Processamento com conformidade e minimização de dados LGPD.</span>
          </div>

          <div className="flex items-center gap-2">
            {promptText && (
              <button
                onClick={() => setPromptText('')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Limpar
              </button>
            )}

            <button
              onClick={handleAnalyze}
              disabled={isLoading || !promptText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/50 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analisando fatos & enquadramento...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Estruturar Caso com IA</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Structured Output Cards */}
      {analysisResult && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* MANDATORY WARNING BANNER (Item 3.10) */}
          <div className="p-4 rounded-2xl bg-amber-950/50 border-2 border-amber-500/60 text-amber-200 shadow-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold tracking-wider uppercase text-amber-300">
                Aviso Obrigatório de Conformidade Ética e Jurídica
              </h4>
              <p className="text-xs leading-relaxed text-amber-100 font-medium">
                ⚠️ <strong>Conteúdo gerado por IA. Revise antes de utilizar ou salvar.</strong> O Dex AI é uma ferramenta de apoio analítico e triagem preliminar. A IA nunca substitui o raciocínio crítico, o julgamento privativo e a responsabilidade técnica do advogado habilitado na OAB.
              </p>
            </div>
          </div>

          {/* Action Bar: Create Process Directly with Instant & Modal options */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-brand-950/50 to-cyan-950/40 border border-brand-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Triagem Finalizada
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Ação: {analysisResult.suggestedActionType}
                </h4>
              </div>
              <p className="text-xs text-slate-300">
                Área: <strong className="text-brand-300">{analysisResult.suggestedLegalArea}</strong> • Estimativa: <strong className="text-emerald-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(analysisResult.estimatedValue || 50000)}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleQuickSaveProcess}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/60 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Salva automaticamente o processo no sistema com 1 clique"
              >
                <Zap className="w-4 h-4 text-emerald-200 fill-emerald-200" />
                <span>⚡ Salvar Processo (1 Clique)</span>
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Revisar & Salvar</span>
              </button>
            </div>
          </div>

          {/* Grid of 4 Structured Blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Block 1: Resumo dos Fatos & Enquadramento */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    1. Resumo dos Fatos & Fundamento
                  </h4>
                  <button
                    onClick={() => handleCopyToClipboard(`${analysisResult.factsSummary}\n\nEnquadramento: ${analysisResult.legalFraming}`, 'Resumo')}
                    className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                    title="Copiar texto"
                  >
                    {copiedSection === 'Resumo' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div>
                  <h5 className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Síntese Fática Estruturada:</h5>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {analysisResult.factsSummary}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <h5 className="text-[11px] font-semibold text-brand-300 uppercase mb-1">Hipóteses de Enquadramento Legal:</h5>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {analysisResult.legalFraming}
                  </p>
                </div>
              </div>
            </div>

            {/* Block 2: Perguntas Complementares */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    2. Perguntas Complementares para o Cliente
                  </h4>
                  <button
                    onClick={() => handleCopyToClipboard(analysisResult.clarificationQuestions.join('\n'), 'Perguntas')}
                    className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                    title="Copiar perguntas"
                  >
                    {copiedSection === 'Perguntas' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  Pontos essenciais a serem esclarecidos na entrevista de instrução inicial:
                </p>

                <ul className="space-y-2">
                  {analysisResult.clarificationQuestions.map((q, idx) => (
                    <li key={idx} className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-200 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Block 3: Checklist de Documentos */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    3. Checklist de Documentos Prováveis
                  </h4>
                  <button
                    onClick={() => handleCopyToClipboard(analysisResult.requiredDocuments.join('\n'), 'Documentos')}
                    className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                    title="Copiar lista de documentos"
                  >
                    {copiedSection === 'Documentos' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  Documentação necessária para instrução probatória idônea da petição:
                </p>

                <ul className="space-y-2">
                  {analysisResult.requiredDocuments.map((doc, idx) => (
                    <li key={idx} className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Block 4: Classificação Preliminar de Urgência */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    4. Classificação Preliminar de Urgência
                  </h4>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${urgencyColors[analysisResult.urgencyLevel]}`}>
                    Nível: {analysisResult.urgencyLevel}
                  </span>
                </div>

                <div>
                  <h5 className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Fundamentação do Risco / Prescrição:</h5>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-200 leading-relaxed">
                    {analysisResult.urgencyReason}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-[11px] text-slate-400">
                  <p><strong>Diretriz Técnica:</strong> Em caso de risco crítico ou alto, priorizar distribuição imediata de pedido de tutela de urgência antecipada antecedente ou cautelar (art. 303/305 CPC).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Interativo para Revisão e Salvamento do Processo da IA */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Salvar Novo Processo no Sistema"
        subtitle="Confirme os detalhes da petição e vincule o cliente e advogado responsável"
        maxWidth="3xl"
        icon={<Sparkles className="w-5 h-5 text-cyan-400" />}
      >
        <form onSubmit={handleSaveProcessFromModal} className="space-y-4">
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Dados estruturados automaticamente a partir da triagem do <strong>Dex AI</strong>.</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-300">Pronto para cadastro</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CNJ */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Número do Processo (CNJ) *
              </label>
              <input
                type="text"
                required
                value={customCNJ}
                onChange={e => setCustomCNJ(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            {/* Ação */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Ação / Tipo de Demanda *
              </label>
              <input
                type="text"
                required
                value={customActionType}
                onChange={e => setCustomActionType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            {/* Cliente */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cliente Vinculado *
              </label>
              <select
                required
                value={selectedClientId}
                onChange={e => setSelectedClientId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              >
                <option value="">Selecione o cliente...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.document})
                  </option>
                ))}
              </select>
            </div>

            {/* Advogado */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Advogado(a) Responsável *
              </label>
              <select
                required
                value={selectedLawyerId}
                onChange={e => setSelectedLawyerId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              >
                <option value="">Selecione o advogado...</option>
                {lawyers.map(lawyer => (
                  <option key={lawyer.id} value={lawyer.id}>
                    {lawyer.name} ({lawyer.oab})
                  </option>
                ))}
              </select>
            </div>

            {/* Área */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Área do Direito *
              </label>
              <select
                value={customLegalArea}
                onChange={e => setCustomLegalArea(e.target.value as LegalArea)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              >
                {([
                  'Trabalhista',
                  'Cível',
                  'Tributário',
                  'Família e Sucessões',
                  'Penal',
                  'Empresarial',
                  'Previdenciário',
                  'Consumidor',
                  'Imobiliário'
                ] as LegalArea[]).map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            {/* Tribunal / Vara */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tribunal / Foro
              </label>
              <input
                type="text"
                value={customCourt}
                onChange={e => setCustomCourt(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            {/* Valor da Causa */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Valor da Causa (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={customValue}
                onChange={e => setCustomValue(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            {/* Status Inicial */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Fase Processual Inicial
              </label>
              <input
                type="text"
                disabled
                value="Fase Inicial (Distribuição)"
                className="w-full px-3.5 py-2.5 bg-slate-800/40 border border-slate-700/50 rounded-xl text-xs text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Síntese dos Fatos */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Síntese Fática Estruturada pela IA
            </label>
            <textarea
              rows={3}
              readOnly
              value={analysisResult?.factsSummary || ''}
              className="w-full px-3.5 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Processo no Sistema</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
