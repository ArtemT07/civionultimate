import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type BackButtonProps = {
  onClick: () => void;
};

export const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  const { language } = useLanguage();

  const text = language === 'es' ? 'Volver' : 'Back';

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors group"
    >
      <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
      <span className="font-medium">{text}</span>
    </button>
  );
};
