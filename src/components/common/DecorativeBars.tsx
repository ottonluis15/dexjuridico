import React from 'react';

interface DecorativeBarsProps {
  className?: string;
  coralWidth?: string;
  tealWidth?: string;
  height?: string;
  centered?: boolean;
}

export const DecorativeBars: React.FC<DecorativeBarsProps> = ({
  className = '',
  coralWidth = 'w-24 sm:w-32',
  tealWidth = 'w-24 sm:w-32',
  height = 'h-1.5',
  centered = false,
}) => {
  return (
    <div
      aria-hidden="true"
      className={`flex flex-col gap-1 select-none pointer-events-none ${
        centered ? 'items-center mx-auto' : 'items-start'
      } ${className}`}
    >
      {/* Barra superior coral */}
      <div
        className={`${coralWidth} ${height} bg-dex-coral rounded-full shadow-sm`}
      />
      {/* Barra inferior teal, ligeiramente deslocada */}
      <div
        className={`${tealWidth} ${height} bg-dex-teal rounded-full shadow-sm ${
          centered ? 'translate-x-1.5' : 'translate-x-2'
        }`}
      />
    </div>
  );
};

export const DecorativeDots: React.FC<{ className?: string; size?: string }> = ({
  className = '',
  size = 'w-3.5 h-3.5',
}) => {
  return (
    <div aria-hidden="true" className={`flex items-center gap-2 select-none pointer-events-none ${className}`}>
      <span className={`${size} rounded-full bg-dex-coral inline-block`} />
      <span className={`${size} rounded-full bg-dex-coral inline-block`} />
      <span className={`${size} rounded-full bg-dex-coral inline-block`} />
    </div>
  );
};

