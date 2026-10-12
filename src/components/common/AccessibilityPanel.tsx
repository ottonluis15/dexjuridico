import React, { useState, useEffect, useRef } from 'react';
import { Sliders, Type, Sun, Sparkles, X, RotateCcw } from 'lucide-react';

export type FontSizeOption = 'normal' | 'large' | 'xlarge';

interface A11yPreferences {
  fontSize: FontSizeOption;
  highContrast: boolean;
  reducedMotion: boolean;
}

const STORAGE_KEY = 'dex_a11y_preferences';

const DEFAULT_PREFS: A11yPreferences = {
  fontSize: 'normal',
  highContrast: false,
  reducedMotion: false,
};

export const AccessibilityPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prefs, setPrefs] = useState<A11yPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });

  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Aplicar classes no elemento HTML
  useEffect(() => {
    const root = document.documentElement;

    // Tamanho da fonte
    root.classList.remove('a11y-font-normal', 'a11y-font-large', 'a11y-font-xlarge');
    root.classList.add(`a11y-font-${prefs.fontSize}`);

    // Alto contraste
    if (prefs.highContrast) {
      root.classList.add('a11y-high-contrast');
    } else {
      root.classList.remove('a11y-high-contrast');
    }

    // Redução de movimento
    if (prefs.reducedMotion) {
      root.classList.add('a11y-reduced-motion');
    } else {
      root.classList.remove('a11y-reduced-motion');
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Erro ao salvar preferências de acessibilidade', e);
    }
  }, [prefs]);

  // Teclado: fechar no Escape e devolver foco
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const updateFontSize = (size: FontSizeOption) => {
    setPrefs(prev => ({ ...prev, fontSize: size }));
  };

  const toggleHighContrast = () => {
    setPrefs(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleReducedMotion = () => {
    setPrefs(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  };

  const handleReset = () => {
    setPrefs(DEFAULT_PREFS);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {/* Botão de Gatilho de Acessibilidade */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir painel de acessibilidade e preferências de exibição"
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
        className="w-11 h-11 rounded-full bg-slate-900/90 hover:bg-slate-800 text-brand-400 hover:text-brand-300 border border-slate-700/80 shadow-xl backdrop-blur-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer focus-visible:ring-4 focus-visible:ring-brand-500/50"
        title="Opções de Acessibilidade (Tamanho da fonte e contraste)"
      >
        <Sliders className="w-5 h-5" />
      </button>

      {/* Modal / Popover de Acessibilidade */}
      {isOpen && (
        <div
          id="accessibility-panel"
          ref={panelRef}
          role="region"
          aria-label="Controles de Acessibilidade"
          className="absolute bottom-14 left-0 w-80 sm:w-96 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-5 text-slate-100 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Cabeçalho */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Acessibilidade</h2>
                <p className="text-[11px] text-slate-400">Personalize a legibilidade e contraste</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                buttonRef.current?.focus();
              }}
              aria-label="Fechar painel de acessibilidade"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-4 space-y-4">
            {/* 1. Tamanho da Fonte */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Type className="w-4 h-4 text-cyan-400" />
                <span>Tamanho da Fonte</span>
              </label>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Ajuste do tamanho de texto">
                <button
                  type="button"
                  onClick={() => updateFontSize('normal')}
                  aria-pressed={prefs.fontSize === 'normal'}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    prefs.fontSize === 'normal'
                      ? 'bg-brand-600 border-brand-500 text-white shadow-md'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Padrão (100%)
                </button>
                <button
                  type="button"
                  onClick={() => updateFontSize('large')}
                  aria-pressed={prefs.fontSize === 'large'}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    prefs.fontSize === 'large'
                      ? 'bg-brand-600 border-brand-500 text-white shadow-md'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Grande (115%)
                </button>
                <button
                  type="button"
                  onClick={() => updateFontSize('xlarge')}
                  aria-pressed={prefs.fontSize === 'xlarge'}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    prefs.fontSize === 'xlarge'
                      ? 'bg-brand-600 border-brand-500 text-white shadow-md'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Extra (125%)
                </button>
              </div>
            </div>

            {/* 2. Modo Alto Contraste */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Sun className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Alto Contraste</div>
                  <div className="text-[10px] text-slate-400">Realça bordas e texto para maior legibilidade</div>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleHighContrast}
                role="switch"
                aria-checked={prefs.highContrast}
                aria-label="Alternar modo de alto contraste"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  prefs.highContrast ? 'bg-brand-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    prefs.highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* 3. Reduzir Animações */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Reduzir Animações</div>
                  <div className="text-[10px] text-slate-400">Minimiza efeitos de transição e movimento</div>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleReducedMotion}
                role="switch"
                aria-checked={prefs.reducedMotion}
                aria-label="Alternar redução de movimento"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  prefs.reducedMotion ? 'bg-brand-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    prefs.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Rodapé: Reset */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-[10px] text-slate-500">Salvo no navegador</span>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar padrões</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
