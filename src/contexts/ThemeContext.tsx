import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type LogoSettings = {
  url: string;
  width: number;
  height: number;
  position: string;
};

type ColorSettings = {
  primary: {
    from: string;
    to: string;
  };
  secondary: string;
  text: string;
  textLight: string;
};

type FontSettings = {
  heading: string;
  body: string;
  sizes: any;
};

type ButtonSettings = {
  defaultSize: string;
  borderRadius: number;
  sizes: any;
};

type ThemeSettings = {
  logo: LogoSettings;
  colors: ColorSettings;
  fonts: FontSettings;
  buttons: ButtonSettings;
};

type ThemeContextType = {
  theme: ThemeSettings | null;
  loading: boolean;
  reloadTheme: () => Promise<void>;
};

const defaultTheme: ThemeSettings = {
  logo: {
    url: '/civion-logo.svg',
    width: 80,
    height: 80,
    position: 'left',
  },
  colors: {
    primary: {
      from: '#dc2626',
      to: '#2563eb',
    },
    secondary: '#f3f4f6',
    text: '#111827',
    textLight: '#6b7280',
  },
  fonts: {
    heading: 'system-ui',
    body: 'system-ui',
    sizes: {},
  },
  buttons: {
    defaultSize: 'medium',
    borderRadius: 8,
    sizes: {
      small: { px: 12, py: 6, text: 14 },
      medium: { px: 16, py: 8, text: 16 },
      large: { px: 24, py: 12, text: 18 },
    },
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTheme = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const settings: any = {};
        data.forEach((setting) => {
          settings[setting.setting_key] = setting.setting_value;
        });

        setTheme({
          logo: settings.logo || defaultTheme.logo,
          colors: settings.colors || defaultTheme.colors,
          fonts: settings.fonts || defaultTheme.fonts,
          buttons: settings.buttons || defaultTheme.buttons,
        });
      } else {
        setTheme(defaultTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      setTheme(defaultTheme);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTheme();
  }, []);

  const reloadTheme = async () => {
    await loadTheme();
  };

  return (
    <ThemeContext.Provider value={{ theme, loading, reloadTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
