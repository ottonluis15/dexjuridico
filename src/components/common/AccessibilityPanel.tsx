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

  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove('a11y-font-normal', 'a11y-font-large', 'a11y-font-xlarge');
    root.classList.add(`a11y-font-${prefs.fontSize}`);

    if (prefs.highContrast) {
      root.classList.add('a11y-high-contrast');
    } else {
      root.classList.remove('a11y-high-contrast');
    }

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
    <div className="fixed bottom-6 right-6 z-40">
      {/* Botão de Gatilho de Acessibilidade */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir painel de acessibilidade e preferências de exibição"
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
        className="w-12 h-12 rounded-full bg-dex-navy-900 hover:bg-dex-navy-800 text-dex-coral border border-dex-coral/40 shadow-2xl backdrop-blur-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus-visible:ring-4 focus-visible:ring-dex-coral/50"
        title="Opções de Acessibilidade"
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
          className="absolute bottom-16 right-0 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-dex-navy-900 border border-white/10 rounded-[24px] shadow-2xl p-6 text-white z-50 animate-fade-in"
        >
          {/* Cabeçalho */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-dex-coral/20 text-dex-coral flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-sm font-bold text-white tracking-tight">Acessibilidade</h2>
                <p className="text-[11px] text-[#8F8A87] font-serif">Legibilidade e preferências visuais</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                buttonRef.current?.focus();
              }}
              aria-label="Fechar painel de acessibilidade"
              className="w-7 h-7 rounded-full bg-[#EAE0DA] text-dex-navy-900 hover:bg-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-4 space-y-4">
            {/* 1. Tamanho da Fonte */}
            <div className="space-y-2">
              <label className="text-xs font-serif italic text-dex-beige flex items-center gap-2">
                <Type className="w-4 h-4 text-dex-coral" />
                <span>Tamanho da Fonte</span>
              </label>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Ajuste do tamanho de texto">
                <button
                  type="button"
                  onClick={() => updateFontSize('normal')}
                  aria-pressed={prefs.fontSize === 'normal'}
                  className={`py-2 px-3 rounded-xl text-xs font-serif font-bold border transition-all ${
                    prefs.fontSize === 'normal'
                      ? 'bg-dex-coral border-dex-coral text-white shadow-md'
                      : 'bg-dex-navy-800 border-white/5 text-slate-300 hover:bg-dex-navy-700'
                  }`}
                >
                  Padrão (100%)
                </button>
                <button
                  type="button"
                  onClick={() => updateFontSize('large')}
                  aria-pressed={prefs.fontSize === 'large'}
                  className={`py-2 px-3 rounded-xl text-xs font-serif font-bold border transition-all ${
                    prefs.fontSize === 'large'
                      ? 'bg-dex-coral border-dex-coral text-white shadow-md'
                      : 'bg-dex-navy-800 border-white/5 text-slate-300 hover:bg-dex-navy-700'
                  }`}
                >
                  Grande (115%)
                </button>
                <button
                  type="button"
                  onClick={() => updateFontSize('xlarge')}
                  aria-pressed={prefs.fontSize === 'xlarge'}
                  className={`py-2 px-3 rounded-xl text-xs font-serif font-bold border transition-all ${
                    prefs.fontSize === 'xlarge'
                      ? 'bg-dex-coral border-dex-coral text-white shadow-md'
                      : 'bg-dex-navy-800 border-white/5 text-slate-300 hover:bg-dex-navy-700'
                  }`}
                >
                  Extra (125%)
                </button>
              </div>
            </div>

            {/* 2. Modo Alto Contraste */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-dex-navy-800 border border-white/5">
              <div className="flex items-center gap-2.5">
                <Sun className="w-4 h-4 text-dex-peach" />
                <div>
                  <div className="font-serif text-xs font-bold text-white">Alto Contraste</div>
                  <div className="text-[11px] text-[#8F8A87] font-serif">Realça bordas e contraste de leitura</div>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleHighContrast}
                role="switch"
                aria-checked={prefs.highContrast}
                aria-label="Alternar modo de alto contraste"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  prefs.highContrast ? 'bg-dex-coral' : 'bg-dex-navy-950'
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
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-dex-navy-800 border border-white/5">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-dex-kpi-purple" />
                <div>
                  <div className="font-serif text-xs font-bold text-white">Reduzir Animações</div>
                  <div className="text-[11px] text-[#8F8A87] font-serif">Minimiza efeitos de transição e movimento</div>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleReducedMotion}
                role="switch"
                aria-checked={prefs.reducedMotion}
                aria-label="Alternar redução de movimento"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  prefs.reducedMotion ? 'bg-dex-coral' : 'bg-dex-navy-950'
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
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-serif">
            <span className="text-[11px] text-[#8F8A87]">Salvo no navegador</span>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-slate-300 hover:text-dex-coral transition-colors"
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
