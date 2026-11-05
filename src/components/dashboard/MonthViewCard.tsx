import React from 'react';
import { useData } from '../../context/DataContext';

export const MonthViewCard: React.FC = () => {
  const { userDeadlines } = useData();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based
  const currentDay = now.getDate();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Primeiro dia do mês e total de dias
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Domingo
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Dias com prazos agendados no mês
  const activeDeadlineDays = new Set(
    userDeadlines.map(d => {
      if (!d.dueDate) return -1;
      const [y, m, day] = d.dueDate.split('-').map(Number);
      if (y === currentYear && m === currentMonth + 1) {
        return day;
      }
      return -1;
    })
  );

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  // Criar células vazias para o início do mês
  const emptyDays = Array.from({ length: firstDayIndex }, (_, i) => i);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="bg-[#162B37] rounded-[24px] p-6 shadow-xl border border-[#214154]/40 flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Cabeçalho do Card (Anexo 4) */}
        <div className="flex items-center justify-between pb-3 border-b border-[#214154]/60">
          <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-tight">
            Visão do mês
          </h3>
          <span className="text-xs text-[#A6C5CD] font-serif">
            {monthNames[currentMonth]} {currentYear}
          </span>
        </div>

        {/* Grade do Calendário Mensal */}
        <div>
          {/* Dias da semana */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {weekDays.map((wd, i) => (
              <span key={i} className="text-[11px] font-bold text-[#A6C5CD]/80 font-serif">
                {wd}
              </span>
            ))}
          </div>

          {/* Células dos dias */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="h-7 w-7 sm:h-8 sm:w-8" />
            ))}

            {monthDays.map((day) => {
              const isToday = day === currentDay;
              const hasDeadline = activeDeadlineDays.has(day);

              return (
                <div
                  key={day}
                  className={`h-7 w-7 sm:h-8 sm:w-8 mx-auto rounded-full flex flex-col items-center justify-center text-xs font-serif transition-colors relative ${
                    isToday
                      ? 'bg-dex-coral text-white font-bold shadow-md'
                      : hasDeadline
                      ? 'bg-white/10 text-white font-medium hover:bg-white/20'
                      : 'text-[#EAE0DA]/70 hover:bg-white/5'
                  }`}
                >
                  <span>{day}</span>
                  {hasDeadline && !isToday && (
                    <span className="w-1 h-1 rounded-full bg-[#4A808E] absolute bottom-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rodapé explicativo */}
      <div className="mt-4 pt-3 border-t border-[#214154]/60 flex items-center justify-between text-xs text-[#A6C5CD] font-serif">
        <span>Hoje: dia {currentDay}</span>
        <span>{activeDeadlineDays.size} datas com pauta</span>
      </div>
    </div>
  );
};

