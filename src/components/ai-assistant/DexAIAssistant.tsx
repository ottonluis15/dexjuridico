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
  Cpu
} from 'lucide-react';
import { aiService, SAMPLE_CASE_TEMPLATES } from '../../services/aiService';
import { AIAnalysisResult } from '../../types';
import { useData } from '../../context/DataContext';
import { PriorityBadge } from '../common/Badge';

interface DexAIAssistantProps {
  onNavigateToCases: () => void;
}

export const DexAIAssistant: React.FC<DexAIAssistantProps> = ({ onNavigateToCases }) => {
  const { prefillCaseFromAI, showToast } = useData();

  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet');

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

  const handleCreateProcessFromAI = () => {
    if (!analysisResult) return;
    prefillCaseFromAI(analysisResult, promptText);
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

          {/* Action Bar: Create Process Directly */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-brand-950/50 border border-brand-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Ação Sugerida: {analysisResult.suggestedActionType}
              </h4>
              <p className="text-xs text-slate-300">
                Área: <strong className="text-brand-300">{analysisResult.suggestedLegalArea}</strong> • Estimativa da Causa: <strong className="text-emerald-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(analysisResult.estimatedValue || 50000)}</strong>
              </p>
            </div>

            <button
              onClick={handleCreateProcessFromAI}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto hover:scale-105"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Criar Processo a partir desta Análise</span>
            </button>
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
    </div>
  );
};
