import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

type ThemedButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
};

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size,
  className = '',
  type = 'button',
  disabled = false,
}) => {
  const { theme } = useTheme();

  if (!theme) {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
          variant === 'primary'
            ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white hover:from-red-700 hover:to-blue-700'
            : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {children}
      </button>
    );
  }

  const buttonSize = size || theme.buttons.defaultSize;
  const sizeStyle = theme.buttons.sizes[buttonSize] || theme.buttons.sizes.medium;

  const baseStyle = {
    borderRadius: `${theme.buttons.borderRadius}px`,
    paddingLeft: `${sizeStyle.px}px`,
    paddingRight: `${sizeStyle.px}px`,
    paddingTop: `${sizeStyle.py}px`,
    paddingBottom: `${sizeStyle.py}px`,
    fontSize: `${sizeStyle.text}px`,
  };

  const variantStyle =
    variant === 'primary'
      ? {
          background: `linear-gradient(to right, ${theme.colors.primary.from}, ${theme.colors.primary.to})`,
          color: 'white',
        }
      : {
          backgroundColor: theme.colors.secondary,
          color: theme.colors.text,
        };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyle, ...variantStyle }}
      className={`font-semibold transition-all hover:opacity-90 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {children}
    </button>
  );
};
