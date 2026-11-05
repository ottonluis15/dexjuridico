import React from 'react';
import { DecorativeDots } from '../common/DecorativeBars';

export const HeroDashboardMockup: React.FC = () => {
  return (
    <div className="relative w-full max-w-[540px] lg:max-w-[580px] mx-auto select-none">
      {/* Fundo cinza-claro arredondado e levemente desfocado (Anexo 1) */}
      <div
        aria-hidden="true"
        className="absolute -inset-4 sm:-inset-6 bg-[#E0DDD9]/70 backdrop-blur-md rounded-[36px] shadow-2xl -z-10"
      />

      {/* Corvo pousando no canto superior esquerdo do mockup */}
      <div className="absolute -top-16 -left-12 sm:-top-20 sm:-left-16 z-20 pointer-events-none">
        <img
          src="/img/corvo1.png"
          alt=""
          aria-hidden="true"
          width="230"
          height="230"
          fetchPriority="high"
          decoding="async"
          className="w-40 sm:w-56 h-auto drop-shadow-xl animate-float-gentle transform -rotate-3"
        />
      </div>

      {/* Janela do Mockup em HTML/CSS/SVG fiel ao Anexo 1 */}
      <div className="relative z-10 w-full bg-[#467B88] rounded-[24px] border border-[#3A6874] shadow-xl overflow-hidden flex flex-col aspect-[4/3] sm:aspect-[1.25/1]">
        <div className="flex flex-1 w-full h-full">
          {/* Sidebar esquerda em teal */}
          <div className="w-[28%] sm:w-[26%] bg-[#4E8896] border-r border-[#3D6E7B] p-3 sm:p-4 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Bloco de topo da sidebar */}
              <div className="w-full h-6 sm:h-7 bg-[#2D4D54] rounded-lg" />
              {/* Linhas de navegação (barras horizontais) */}
              <div className="space-y-2 pt-2">
                <div className="w-4/5 h-2.5 sm:h-3 bg-[#7FB0BC] rounded-full" />
                <div className="w-3/5 h-2 sm:h-2.5 bg-[#7FB0BC]/80 rounded-full" />
                <div className="w-2/3 h-2 sm:h-2.5 bg-[#7FB0BC]/80 rounded-full" />
                <div className="w-1/2 h-2 sm:h-2.5 bg-[#7FB0BC]/60 rounded-full" />
              </div>
            </div>
            {/* Bloco inferior sutil */}
            <div className="w-8 h-8 rounded-full bg-[#3D6E7B]/70" />
          </div>

          {/* Área principal direita */}
          <div className="flex-1 flex flex-col bg-[#4A808E]">
            {/* Topbar escura com avatar pêssego */}
            <div className="h-10 sm:h-12 bg-[#2D454F] px-4 flex items-center justify-between border-b border-[#3D606C]">
              <div className="w-20 sm:w-28 h-2.5 bg-[#64939F] rounded-full" />
              {/* Avatar circular pêssego */}
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#F0CBAE] shadow-sm" />
            </div>

            {/* Conteúdo interno da janela */}
            <div className="p-3 sm:p-4 flex-1 flex flex-col gap-3">
              {/* 3 cards pequenos superiores */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="h-16 sm:h-20 bg-[#5A97A5] rounded-xl border border-[#6BA7B5]/40" />
                <div className="h-16 sm:h-20 bg-[#5A97A5] rounded-xl border border-[#6BA7B5]/40" />
                <div className="h-16 sm:h-20 bg-[#5A97A5] rounded-xl border border-[#6BA7B5]/40" />
              </div>

              {/* Linha inferior: gráfico de barras à esquerda e card vazio à direita */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-1">
                {/* Gráfico de barras */}
                <div className="bg-[#6AA8B6] rounded-xl p-2.5 sm:p-3 flex items-end justify-around gap-1.5 sm:gap-2 border border-[#7BB7C4]/40">
                  <div className="w-3 sm:w-4 bg-white/80 rounded-t h-[65%]" />
                  <div className="w-3 sm:w-4 bg-white/80 rounded-t h-[40%]" />
                  <div className="w-3 sm:w-4 bg-white/80 rounded-t h-[85%]" />
                  <div className="w-3 sm:w-4 bg-white/80 rounded-t h-[55%]" />
                  <div className="w-3 sm:w-4 bg-white/80 rounded-t h-[95%]" />
                </div>

                {/* Card vazio arredondado */}
                <div className="bg-[#5A97A5] rounded-xl border border-[#6BA7B5]/40" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pena decorativa na base inferior (pena1.png) */}
      <div className="absolute -bottom-8 left-8 sm:left-12 z-20 pointer-events-none">
        <img
          src="/img/pena1.png"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          width="180"
          height="60"
          className="w-36 sm:w-48 h-auto drop-shadow-md animate-feather-drift"
        />
      </div>

      {/* 3 bolinhas coral no canto inferior direito (Anexo 1) */}
      <div className="absolute -bottom-4 -right-2 sm:-bottom-5 sm:-right-4 z-20">
        <DecorativeDots size="w-4 h-4 sm:w-5 sm:h-5" className="gap-2 sm:gap-2.5" />
      </div>
    </div>
  );
};

