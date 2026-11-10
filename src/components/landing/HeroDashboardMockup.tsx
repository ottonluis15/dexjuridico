import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DecorativeDots } from '../common/DecorativeBars';

export const HeroDashboardMockup: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafIdRef = useRef<number | null>(null);

  // Animação contínua e suave via requestAnimationFrame (física de inércia e amortecimento)
  useEffect(() => {
    let active = true;

    const animate = () => {
      if (!active) return;
      const dx = targetRef.current.x - currentRef.current.x;
      const dy = targetRef.current.y - currentRef.current.y;

      // Se houver diferença perceptível, interpola suavemente (lerp)
      if (Math.abs(dx) > 0.0005 || Math.abs(dy) > 0.0005) {
        currentRef.current.x += dx * 0.085;
        currentRef.current.y += dy * 0.085;
        setTilt({
          x: currentRef.current.x,
          y: currentRef.current.y,
        });
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      active = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Manipulador de movimento do mouse (calcula posição normalizada -1 a 1 relativa ao centro do mockup)
  const handleMouseMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Normalizado de -1 a 1 com alcance estendido para responder a movimentos na seção inteira
    const x = Math.max(-1.2, Math.min(1.2, (clientX - centerX) / (rect.width * 0.75)));
    const y = Math.max(-1.2, Math.min(1.2, (clientY - centerY) / (rect.height * 0.75)));

    targetRef.current = { x, y };
  }, []);

  // Ouve movimentos na seção Hero ou no container
  useEffect(() => {
    const heroEl = containerRef.current?.closest('section') || document.body;

    const onMove = (e: MouseEvent) => {
      setIsHovered(true);
      handleMouseMove(e.clientX, e.clientY);
    };

    const onLeave = () => {
      setIsHovered(false);
      targetRef.current = { x: 0, y: 0 };
    };

    heroEl.addEventListener('mousemove', onMove as EventListener);
    heroEl.addEventListener('mouseleave', onLeave as EventListener);

    return () => {
      heroEl.removeEventListener('mousemove', onMove as EventListener);
      heroEl.removeEventListener('mouseleave', onLeave as EventListener);
    };
  }, [handleMouseMove]);

  // Ângulos e rotações 3D calculados com base estática estilizada (como na Imagem 1) + dinamismo do mouse
  const rotateY = -4 + tilt.x * 14;
  const rotateX = 2 - tilt.y * 12;
  const rotateZ = -1 + tilt.x * -1.8;

  const normX = tilt.x;
  const normY = tilt.y;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[360px] sm:max-w-[520px] lg:max-w-[620px] mx-auto select-none [perspective:1400px]"
    >
      {/* Moldura / Fundo cinza-claro arredondado fiel à Imagem 1 */}
      <div
        style={{
          transform: `translate3d(${normX * -6}px, ${normY * -5}px, 0px) scale(${isHovered ? 1.015 : 1})`,
          transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="w-full bg-[#D6DDD8] rounded-[24px] sm:rounded-[36px] p-4 sm:p-7 md:p-8 shadow-2xl relative"
      >
        {/* Janela do Mockup do Dashboard (100% fiel à Imagem 1 e Anexo 1) */}
        <div
          style={{
            transform: `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) translate3d(${normX * 8}px, ${normY * 6}px, 16px)`,
            transition: 'transform 0.1s linear',
            transformStyle: 'preserve-3d',
          }}
          className="relative z-10 w-full bg-[#4A808E] rounded-[20px] sm:rounded-[22px] border-[1.5px] border-[#1D323A] shadow-xl overflow-hidden flex flex-col aspect-[4/3] sm:aspect-[1.28/1]"
        >
          <div className="flex flex-1 w-full h-full">
            {/* Sidebar esquerda em tom teal (fiel à Imagem 1) */}
            <div className="w-[30%] sm:w-[28%] bg-[#437583] border-r-[1.5px] border-[#1D323A] p-3 sm:p-4 flex flex-col justify-start">
              {/* Bloco superior da sidebar: retângulo escuro com borda */}
              <div className="w-full h-7 sm:h-8 bg-[#273E45] border-[1.5px] border-[#18282D] rounded-md shadow-inner" />

              {/* 4 barras horizontais em tom ciano-claro com pontas arredondadas (Imagem 1) */}
              <div className="space-y-2.5 pt-4 sm:pt-5">
                <div className="w-[74%] h-3 sm:h-3.5 bg-[#82B3C0] rounded-full shadow-sm" />
                <div className="w-[52%] h-3 sm:h-3.5 bg-[#82B3C0] rounded-full shadow-sm" />
                <div className="w-[68%] h-3 sm:h-3.5 bg-[#82B3C0] rounded-full shadow-sm" />
                <div className="w-[22%] h-2.5 sm:h-3 bg-[#82B3C0] rounded-full shadow-sm" />
              </div>
            </div>

            {/* Área principal direita */}
            <div className="flex-1 flex flex-col bg-[#4A808E]">
              {/* Topbar escura com avatar pêssego à direita (Imagem 1) */}
              <div className="h-10 sm:h-12 bg-[#273E45] border-b-[1.5px] border-[#1D323A] px-4 sm:px-5 flex items-center justify-end">
                {/* Avatar circular pêssego com fina borda escura */}
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EBB796] border border-[#1D323A] shadow-sm" />
              </div>

              {/* Conteúdo interno da janela */}
              <div className="p-3 sm:p-4 flex-1 flex flex-col gap-2.5 sm:gap-3">
                {/* Linha Superior: 3 cards arredondados lado a lado */}
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  <div className="h-20 sm:h-28 bg-[#457886] rounded-xl border-[1.5px] border-[#1D323A] shadow-sm" />
                  <div className="h-20 sm:h-28 bg-[#457886] rounded-xl border-[1.5px] border-[#1D323A] shadow-sm" />
                  <div className="h-20 sm:h-28 bg-[#598E9B] rounded-xl border-[1.5px] border-[#1D323A] shadow-sm" />
                </div>

                {/* Linha Inferior: Gráfico de 4 colunas à esquerda e Card vazio à direita */}
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5 flex-1">
                  {/* Card do Gráfico (com exatamente 4 colunas em ciano-claro como na Imagem 1) */}
                  <div className="h-24 sm:h-36 bg-[#598E9B] rounded-xl border-[1.5px] border-[#1D323A] p-2.5 sm:p-3 flex items-end justify-around gap-2 shadow-sm">
                    {/* Coluna 1: alta */}
                    <div className="w-3.5 sm:w-4 bg-[#C2DFE4] rounded-t-sm h-[82%] shadow-sm" />
                    {/* Coluna 2: baixa */}
                    <div className="w-3.5 sm:w-4 bg-[#C2DFE4] rounded-t-sm h-[36%] shadow-sm" />
                    {/* Coluna 3: média-alta */}
                    <div className="w-3.5 sm:w-4 bg-[#C2DFE4] rounded-t-sm h-[68%] shadow-sm" />
                    {/* Coluna 4: média-baixa */}
                    <div className="w-3.5 sm:w-4 bg-[#C2DFE4] rounded-t-sm h-[46%] shadow-sm" />
                  </div>

                  {/* Card vazio arredondado à direita */}
                  <div className="h-24 sm:h-36 bg-[#457886] rounded-xl border-[1.5px] border-[#1D323A] shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corvo pousando no canto superior esquerdo do mockup */}
      <div className="absolute -top-10 -left-2 sm:-top-20 sm:-left-14 z-20 pointer-events-none">
        <img
          src="/img/corvo1.png"
          alt=""
          aria-hidden="true"
          width="230"
          height="230"
          fetchPriority="high"
          decoding="async"
          className="w-28 sm:w-44 lg:w-56 h-auto max-w-[75vw] drop-shadow-xl animate-float-gentle transform -rotate-3"
        />
      </div>

      {/* Pena decorativa na base inferior (oculta em mobile estreito para evitar sobreposição) */}
      <div
        style={{
          transform: `translate3d(${normX * -12}px, ${normY * -10}px, 20px)`,
          transition: 'transform 0.2s ease-out',
        }}
        className="hidden sm:block absolute -bottom-8 left-10 sm:left-14 z-30 pointer-events-none"
      >
        <img
          src="/img/pena1.png"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          width="180"
          height="60"
          className="w-36 sm:w-48 h-auto drop-shadow-md"
        />
      </div>

      {/* 3 bolinhas coral no canto inferior direito com posicionamento seguro */}
      <div
        style={{
          transform: `translate3d(${normX * 8}px, ${normY * 8}px, 25px)`,
          transition: 'transform 0.18s ease-out',
        }}
        className="absolute -bottom-3 right-1 sm:-bottom-5 sm:-right-4 z-30 pointer-events-none"
      >
        <DecorativeDots size="w-3.5 h-3.5 sm:w-5 sm:h-5" className="gap-1.5 sm:gap-2.5" />
      </div>
    </div>
  );
};
