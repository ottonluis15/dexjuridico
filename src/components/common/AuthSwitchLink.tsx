import React from 'react';

export interface AuthSwitchLinkProps {
  prompt: string;
  actionLabel: string;
  onAction?: () => void;
  className?: string;
}

export const AuthSwitchLink: React.FC<AuthSwitchLinkProps> = ({
  prompt,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`text-center text-xs text-dex-navy-950 dark:text-[#F9ECE2] pt-1 ${className}`.trim()}
    >
      <span>{prompt.endsWith(' ') ? prompt : `${prompt} `}</span>
      <button
        type="button"
        onClick={onAction}
        className="text-dex-terracotta dark:text-dex-coral-light hover:underline font-semibold cursor-pointer italic focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-coral focus-visible:ring-offset-1 rounded transition-colors"
      >
        {actionLabel}
      </button>
    </div>
  );
};

export default AuthSwitchLink;

