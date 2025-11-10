import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

type CMSSection = {
  id: string;
  page_id: string;
  order: number;
  type: string;
  content_es: any;
  content_en: any;
  is_active: boolean;
};

type DynamicCMSPageProps = {
  slug: string;
};

export const DynamicCMSPage: React.FC<DynamicCMSPageProps> = ({ slug }) => {
  const { language } = useLanguage();
  const { theme, loading: themeLoading } = useTheme();
  const [sections, setSections] = useState<CMSSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    loadPage();
  }, [slug]);

  const loadPage = async () => {
    try {
      const { data: pageData, error: pageError } = await supabase
        .from('cms_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (pageError) throw pageError;

      if (!pageData) {
        setLoading(false);
        return;
      }

      setPageTitle(language === 'es' ? pageData.title_es : pageData.title_en);

      const { data: sectionsData, error: sectionsError } = await supabase
        .from('cms_sections')
        .select('*')
        .eq('page_id', pageData.id)
        .eq('is_active', true)
        .order('order');

      if (sectionsError) throw sectionsError;

      setSections(sectionsData || []);
    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (section: CMSSection) => {
    const content = language === 'es' ? section.content_es : section.content_en;
    const gradientStyle = theme
      ? { background: `linear-gradient(to right, ${theme.colors.primary.from}, ${theme.colors.primary.to})` }
      : {};

    switch (section.type) {
      case 'hero':
        return (
          <div
            key={section.id}
            className="relative py-32 text-white"
            style={gradientStyle}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              {content?.title && (
                <h1 className="text-5xl font-bold mb-6">{content.title}</h1>
              )}
              {content?.text && (
                <p className="text-xl opacity-90 max-w-3xl mx-auto">{content.text}</p>
              )}
            </div>
          </div>
        );

      case 'text':
        return (
          <div key={section.id} className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              {content?.title && (
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{content.title}</h2>
              )}
              {content?.text && (
                <div className="prose prose-lg max-w-none text-gray-700">
                  {content.text.split('\n').map((paragraph: string, i: number) => (
                    <p key={i} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'image':
        return (
          <div key={section.id} className="py-16 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {content?.title && (
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{content.title}</h2>
              )}
              {content?.image_url && (
                <img
                  src={content.image_url}
                  alt={content.title || 'Image'}
                  className="w-full rounded-2xl shadow-xl"
                />
              )}
              {content?.text && (
                <p className="mt-6 text-center text-gray-600">{content.text}</p>
              )}
            </div>
          </div>
        );

      case 'cards':
        return (
          <div key={section.id} className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {content?.title && (
                <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">{content.title}</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {content?.cards?.map((card: any, i: number) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    {card.image_url && (
                      <img src={card.image_url} alt={card.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                    )}
                    {card.title && <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>}
                    {card.text && <p className="text-gray-600">{card.text}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div key={section.id} className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {content?.title && (
                <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">{content.title}</h2>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {content?.images?.map((image: string, i: number) => (
                  <img
                    key={i}
                    src={image}
                    alt={`Gallery ${i + 1}`}
                    className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow"
                  />
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading || themeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Página no encontrada</h2>
          <p className="text-gray-600">Esta página no existe o no está activa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {sections.map((section) => renderSection(section))}
    </div>
  );
};
