import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

type LogoProps = {
  className?: string;
};

export const Logo: React.FC<LogoProps> = ({ className }) => {
  const { theme, loading } = useTheme();

  if (loading || !theme) {
    return (
      <img
        src="/civion-logo.svg"
        alt="Civion Logo"
        className={className || "h-12"}
      />
    );
  }

  return (
    <img
      src={theme.logo.url}
      alt="Civion Logo"
      style={{
        width: theme.logo.width,
        height: theme.logo.height,
      }}
      className={className}
    />
  );
};
