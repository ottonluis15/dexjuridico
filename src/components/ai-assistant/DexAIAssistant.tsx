import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  FileCheck, 
  ShieldAlert, 
  FolderPlus, 
  Copy, 
  Settings, 
  Scale, 
  Check, 
  AlertTriangle, 
  BookOpen, 
  Cpu, 
  Zap, 
  Mic 
} from 'lucide-react';
import { aiService, SAMPLE_CASE_TEMPLATES } from '../../services/aiService';
import { storageService } from '../../services/storageService';
import { AIAnalysisResult, LegalArea } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { AudioTranscriber } from './AudioTranscriber';
import { DecorativeBars } from '../common/DecorativeBars';

interface DexAIAssistantProps {
  onNavigateToCases: () => void;
}

export const DexAIAssistant: React.FC<DexAIAssistantProps> = ({ onNavigateToCases }) => {
  const { currentUser } = useAuth();
  const { clients, lawyers, addCase, clearPendingAiDraft, showToast, checkResourceLimit, limitsUsage } = useData();

  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet');
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);

  const handleTranscriptionComplete = (transcribedText: string) => {
    setPromptText(prev => {
      const cleanNew = transcribedText.trim();
      if (!prev.trim()) return cleanNew;
      return `${prev.trim()}\n\n[Transcrição de Áudio]:\n${cleanNew}`;
    });
    showToast('Áudio transcrito e inserido no relato com sucesso!', 'success');
  };

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

    if (currentUser?.isDemo) {
      const rateLimit = storageService.checkDemoAiRateLimit();
      if (!rateLimit.allowed) {
        showToast(
          `Limite de requisições atingido para a conta demo (máximo de 5 análises por hora). Liberação em ~${rateLimit.resetMinutes} min.`,
          'warning'
        );
        return;
      }
    }

    // Validação de Limite Mensal do Plano (Item 4)
    const limitCheck = checkResourceLimit('aiRequests');
    if (!limitCheck.allowed) {
      showToast(limitCheck.message!, 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await aiService.analyzeCase(promptText);
      if (currentUser?.id) {
        storageService.incrementAiUsage(currentUser.id);
      }
      setAnalysisResult(result);
      showToast('Análise jurídica estruturada com sucesso!', 'success');
    } catch {
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

  const handleSaveProcessFromModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysisResult) return;

    if (!customCNJ.trim() || !selectedClientId || !selectedLawyerId || !customActionType.trim()) {
      showToast('Por favor, preencha os campos obrigatórios (*).', 'warning');
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
    BAIXA: 'bg-dex-navy-800 text-dex-beige border-dex-beige/20',
    MEDIA: 'bg-dex-teal-500/30 text-dex-peach border-dex-teal-500/40',
    ALTA: 'bg-dex-terracotta/30 text-dex-coral border-dex-terracotta/50',
    CRITICA: 'bg-dex-coral/30 text-dex-coral border-dex-coral/60'
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10">
          <DecorativeBars className="mb-2" />
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-serif font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-dex-coral/20 text-dex-coral border border-dex-coral/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-dex-coral" />
              Dex AI • Triagem Jurídica Inteligente
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Assistente de IA
          </h2>
          <p className="text-xs text-[#8F8A87] mt-1 max-w-2xl leading-relaxed">
            Cole ou digite o relato inicial do cliente. A IA estrutura a síntese dos fatos, enquadramento preliminar, perguntas de instrução, lista de documentos e análise de urgência.
          </p>
        </div>

        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dex-navy-800 hover:bg-dex-navy-700 text-dex-beige border border-white/10 text-xs font-serif transition-colors self-start md:self-auto"
        >
          <Settings className="w-4 h-4 text-dex-coral" />
          <span>Configurar Motor LLM</span>
        </button>

        {/* Subtle crow background watermark */}
        <img
          src="/img/corvo1.png"
          alt=""
          aria-hidden="true"
          className="absolute right-0 bottom-0 w-36 opacity-10 pointer-events-none -mr-4 -mb-6"
        />
      </div>

      {/* LLM Connector Settings Accordion */}
      {isSettingsOpen && (
        <div className="p-6 rounded-[24px] bg-dex-navy-900 border border-white/10 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-dex-coral flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Integração com Provedores de IA (Anthropic Claude, Gemini, OpenAI)
            </h4>
            <span className="text-[11px] text-[#8F8A87]">Motor Local Otimizado</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            O Dex possui um motor cognitivo analítico local pronto para demonstração, além de conector padronizado para integração com APIs reais em produção.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-serif italic text-dex-beige mb-1">Modelo Selecionado</label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              >
                <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet (Recomendado para Direito)</option>
                <option value="gemini-1-5-pro">Google Gemini 1.5 Pro</option>
                <option value="gpt-4o">OpenAI GPT-4o</option>
              </select>
            </div>

            <div className="flex flex-col justify-center text-xs text-[#8F8A87]">
              <span className="font-serif font-bold text-dex-beige mb-1">Segurança e Sigilo Profissional</span>
              <p>As chaves de API e dados confidenciais são mantidos no servidor sem compartilhamento público.</p>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Casos de Exemplo - Conta de Demonstração */}
      {currentUser?.isDemo && (
        <div className="space-y-3 p-5 rounded-[24px] bg-dex-navy-900 border border-dex-teal-500/30">
          <div className="flex items-center gap-2 text-xs font-serif font-bold text-dex-peach uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-dex-coral" />
            <span>[Modo Demonstração] Casos de exemplo para teste imediato:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SAMPLE_CASE_TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => handleApplyTemplate(template.rawText)}
                className="p-3.5 rounded-2xl bg-dex-navy-800 hover:bg-dex-navy-700/90 border border-white/5 hover:border-dex-coral/40 text-left transition-all group"
              >
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-dex-kpi-peach text-dex-navy-950 inline-block mb-1.5">
                  {template.category}
                </span>
                <h5 className="font-serif text-xs font-bold text-white group-hover:text-dex-coral transition-colors line-clamp-1">
                  {template.title.split(':')[1] || template.title}
                </h5>
                <p className="text-[11px] text-[#8F8A87] line-clamp-2 mt-1">
                  {template.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Prompt Section */}
      <div className="p-6 md:p-8 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-2xl space-y-4">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <label className="text-xs font-serif italic text-dex-beige flex items-center gap-2">
              <span>Relato Fático do Caso / Mensagem do Cliente</span>
            </label>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsAudioModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-dex-coral/20 hover:bg-dex-coral/30 text-dex-coral border border-dex-coral/40 rounded-xl text-xs font-serif font-bold transition-all"
                title="Gravar pelo microfone ou enviar arquivo de áudio"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Gravar / Enviar Áudio</span>
              </button>

              <span className="text-xs text-[#8F8A87]">
                {promptText.length} caracteres
              </span>
            </div>
          </div>
          <textarea
            rows={6}
            placeholder="Cole aqui o relato fático bruto, anotações da consulta inicial ou grave um áudio pelo botão acima..."
            value={promptText}
            onChange={e => setPromptText(e.target.value)}
            className="w-full p-4 bg-dex-input text-dex-navy-950 rounded-2xl text-xs placeholder:text-slate-500 font-serif focus:outline-none focus:ring-2 focus:ring-dex-coral leading-relaxed"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-[#8F8A87]">
            <Scale className="w-4 h-4 text-dex-coral" />
            <span>Processamento com conformidade e minimização de dados LGPD.</span>
          </div>

          <div className="flex items-center gap-3">
            {promptText && (
              <button
                onClick={() => setPromptText('')}
                className="px-4 py-2.5 rounded-xl bg-dex-navy-800 hover:bg-dex-navy-700 text-dex-beige text-xs font-serif transition-colors"
              >
                Limpar
              </button>
            )}

            <button
              onClick={handleAnalyze}
              disabled={isLoading || !promptText.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-dex-coral hover:bg-dex-coral/90 disabled:opacity-50 text-white text-xs font-serif font-bold rounded-xl shadow-lg transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analisando fatos & enquadramento...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Estruturar Caso com IA</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Structured Output Cards */}
      {analysisResult && (
        <div className="space-y-6 animate-fade-in">
          {/* MANDATORY ETHICAL WARNING BANNER */}
          <div className="p-5 rounded-[20px] bg-dex-navy-900 border-2 border-dex-coral/50 text-dex-coral shadow-xl flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-dex-coral shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-serif text-xs font-bold tracking-wider uppercase text-dex-coral">
                Aviso Obrigatório de Conformidade Ética e Jurídica
              </h4>
              <p className="text-xs leading-relaxed text-slate-200">
                ⚠️ <strong>Conteúdo gerado por IA. Revise antes de utilizar ou salvar.</strong> O Dex AI é uma ferramenta de apoio analítico e triagem preliminar. A IA nunca substitui o raciocínio crítico, o julgamento privativo e a responsabilidade técnica do advogado habilitado na OAB.
              </p>
            </div>
          </div>

          {/* Action Bar: Create Process Directly */}
          <div className="p-6 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-serif font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-dex-kpi-peach text-dex-navy-950">
                  Triagem Finalizada
                </span>
                <h4 className="font-serif text-base font-bold text-white tracking-tight">
                  Ação: {analysisResult.suggestedActionType}
                </h4>
              </div>
              <p className="text-xs text-slate-300">
                Área: <strong className="text-dex-peach">{analysisResult.suggestedLegalArea}</strong> • Estimativa: <strong className="text-dex-chart-green">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(analysisResult.estimatedValue || 50000)}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleQuickSaveProcess}
                className="flex items-center gap-2 px-4 py-2.5 bg-dex-slate hover:bg-slate-700 text-white text-xs font-serif font-bold rounded-xl shadow-lg transition-all"
                title="Salva automaticamente o processo no sistema com 1 clique"
              >
                <Zap className="w-4 h-4 text-dex-coral" />
                <span>Salvar Processo (1 Clique)</span>
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-dex-coral hover:bg-dex-coral/90 text-white text-xs font-serif font-bold rounded-xl shadow-lg transition-all"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Revisar &amp; Salvar</span>
              </button>
            </div>
          </div>

          {/* Grid of 4 Structured Blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Block 1: Resumo dos Fatos & Enquadramento */}
            <div className="p-6 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-dex-coral flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    1. Resumo dos Fatos &amp; Fundamento
                  </h4>
                  <button
                    onClick={() => handleCopyToClipboard(`${analysisResult.factsSummary}\n\nEnquadramento: ${analysisResult.legalFraming}`, 'Resumo')}
                    className="text-[#8F8A87] hover:text-white p-1 rounded-md transition-colors"
                    title="Copiar texto"
                  >
                    {copiedSection === 'Resumo' ? <Check className="w-4 h-4 text-dex-chart-green" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div>
                  <h5 className="font-serif italic text-xs text-[#8F8A87] mb-1">Síntese Fática Estruturada:</h5>
                  <p className="text-xs text-slate-200 leading-relaxed font-serif">
                    {analysisResult.factsSummary}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-dex-navy-800 border border-white/5">
                  <h5 className="font-serif italic text-xs text-dex-peach mb-1">Hipóteses de Enquadramento Legal:</h5>
                  <p className="text-xs text-dex-beige leading-relaxed">
                    {analysisResult.legalFraming}
                  </p>
                </div>
              </div>
            </div>

            {/* Block 2: Perguntas Complementares */}
            <div className="p-6 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-dex-peach flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-dex-coral" />
                    2. Perguntas Complementares para o Cliente
                  </h4>
                  <button
                    onClick={() => handleCopyToClipboard(analysisResult.clarificationQuestions.join('\n'), 'Perguntas')}
                    className="text-[#8F8A87] hover:text-white p-1 rounded-md transition-colors"
                    title="Copiar perguntas"
                  >
                    {copiedSection === 'Perguntas' ? <Check className="w-4 h-4 text-dex-chart-green" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-xs text-[#8F8A87]">
                  Pontos essenciais a serem esclarecidos na entrevista de instrução inicial:
                </p>

                <ul className="space-y-2">
                  {analysisResult.clarificationQuestions.map((q, idx) => (
                    <li key={idx} className="p-3 rounded-xl bg-dex-navy-800 border border-white/5 text-xs text-slate-200 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-dex-coral/20 text-dex-coral font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Block 3: Checklist de Documentos */}
            <div className="p-6 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-dex-chart-green flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    3. Checklist de Documentos Prováveis
                  </h4>
                  <button
                    onClick={() => handleCopyToClipboard(analysisResult.requiredDocuments.join('\n'), 'Documentos')}
                    className="text-[#8F8A87] hover:text-white p-1 rounded-md transition-colors"
                    title="Copiar lista de documentos"
                  >
                    {copiedSection === 'Documentos' ? <Check className="w-4 h-4 text-dex-chart-green" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-xs text-[#8F8A87]">
                  Documentação necessária para instrução probatória idônea da petição:
                </p>

                <ul className="space-y-2">
                  {analysisResult.requiredDocuments.map((doc, idx) => (
                    <li key={idx} className="p-3 rounded-xl bg-dex-navy-800 border border-white/5 text-xs text-slate-200 flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-dex-coral shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Block 4: Classificação Preliminar de Urgência */}
            <div className="p-6 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-dex-coral flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    4. Classificação Preliminar de Urgência
                  </h4>
                  <span className={`text-xs font-serif font-bold px-3 py-1 rounded-full border ${urgencyColors[analysisResult.urgencyLevel]}`}>
                    Nível: {analysisResult.urgencyLevel}
                  </span>
                </div>

                <div>
                  <h5 className="font-serif italic text-xs text-[#8F8A87] mb-1">Fundamentação do Risco / Prescrição:</h5>
                  <div className="p-3.5 rounded-xl bg-dex-navy-800 border border-white/5 text-xs text-slate-200 leading-relaxed font-serif">
                    {analysisResult.urgencyReason}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-dex-navy-950/60 border border-white/5 text-[11px] text-[#8F8A87]">
                  <p><strong>Diretriz Técnica:</strong> Em caso de risco crítico ou alto, priorizar distribuição imediata de pedido de tutela de urgência antecipada antecedente ou cautelar (art. 303/305 CPC).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Interativo para Revisão e Salvamento do Processo */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Salvar Novo Processo no Sistema"
        subtitle="Confirme os detalhes da petição e vincule o cliente e advogado responsável"
        maxWidth="3xl"
        icon={<Sparkles className="w-5 h-5 text-dex-coral" />}
      >
        <form onSubmit={handleSaveProcessFromModal} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-dex-navy-950 border border-dex-teal-500/30 flex items-center justify-between text-xs text-dex-peach">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-dex-coral shrink-0" />
              <span>Dados estruturados automaticamente a partir da triagem do <strong>Dex AI</strong>.</span>
            </div>
            <span className="text-[11px] text-dex-coral font-bold">Pronto para cadastro</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                Número do Processo (CNJ) *
              </label>
              <input
                type="text"
                required
                value={customCNJ}
                onChange={e => setCustomCNJ(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-mono rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              />
            </div>

            <div>
              <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                Ação / Tipo de Demanda *
              </label>
              <input
                type="text"
                required
                value={customActionType}
                onChange={e => setCustomActionType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              />
            </div>

            <div>
              <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                Cliente Vinculado *
              </label>
              <select
                required
                value={selectedClientId}
                onChange={e => setSelectedClientId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              >
                <option value="">Selecione o cliente...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.document})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                Advogado Responsável *
              </label>
              <select
                required
                value={selectedLawyerId}
                onChange={e => setSelectedLawyerId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              >
                <option value="">Selecione o advogado...</option>
                {lawyers.map(lawyer => (
                  <option key={lawyer.id} value={lawyer.id}>
                    {lawyer.name} ({lawyer.oab})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                Área do Direito *
              </label>
              <select
                value={customLegalArea}
                onChange={e => setCustomLegalArea(e.target.value as LegalArea)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
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

            <div>
              <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                Tribunal / Foro
              </label>
              <input
                type="text"
                value={customCourt}
                onChange={e => setCustomCourt(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              />
            </div>

            <div>
              <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                Valor da Causa (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={customValue}
                onChange={e => setCustomValue(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dex-input text-dex-navy-950 font-serif rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dex-coral"
              />
            </div>

            <div>
              <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
                Fase Processual Inicial
              </label>
              <input
                type="text"
                disabled
                value="Fase Inicial (Distribuição)"
                className="w-full px-3.5 py-2.5 bg-dex-navy-950 text-slate-400 font-serif rounded-xl text-xs border border-white/5 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-serif italic text-[#C2D6DC] mb-1.5">
              Síntese Fática Estruturada pela IA
            </label>
            <textarea
              rows={3}
              readOnly
              value={analysisResult?.factsSummary || ''}
              className="w-full px-3.5 py-2.5 bg-dex-navy-950 text-slate-300 font-serif rounded-xl text-xs border border-white/5 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2.5 text-xs text-slate-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-dex-coral hover:bg-dex-coral/90 text-white text-xs font-serif font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Processo no Sistema</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Gravação e Transcrição de Áudio com IA */}
      <AudioTranscriber
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onTranscriptionComplete={handleTranscriptionComplete}
      />
    </div>
  );
};
