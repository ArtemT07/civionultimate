import React, { useEffect, useState } from 'react';
import { Building2, Hammer, Wrench, Lightbulb, ArrowRight, Bed, Bath, Maximize } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

type Property = {
  id: string;
  title_es: string;
  title_en: string;
  description_es?: string;
  description_en?: string;
  price: number;
  location?: string;
  bedrooms: number;
  bathrooms: number;
  area_m2: number;
  images: string[];
  features_es: string[];
  features_en: string[];
  is_featured: boolean;
  is_active: boolean;
};

type HomePageProps = {
  onNavigate: (page: string) => void;
};

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('property_listings')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
    }).format(amount);
  };

  const services = [
    {
      icon: Building2,
      title: t('residentialConstruction'),
      color: 'from-red-500 to-red-600',
    },
    {
      icon: Hammer,
      title: t('commercialConstruction'),
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Wrench,
      title: t('renovation'),
      color: 'from-red-600 to-blue-600',
    },
    {
      icon: Lightbulb,
      title: t('consulting'),
      color: 'from-blue-600 to-red-600',
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Construction background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/85"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <div className="bg-gradient-to-r from-red-600 via-white to-blue-600 p-1 rounded-2xl">
                <div className="bg-gray-50 px-6 py-2 rounded-xl">
                  <p className="text-sm font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
                    República Dominicana
                  </p>
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              {t('heroTitle')}
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
              {t('heroSubtitle')}
            </p>

            <button
              onClick={() => onNavigate('calculator')}
              className="group bg-gradient-to-r from-red-600 to-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-red-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-2xl inline-flex items-center space-x-2"
            >
              <span>{t('getStarted')}</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('ourServices')}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="group bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-red-600 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {properties.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {language === 'es' ? 'Propiedades Destacadas' : 'Featured Properties'}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-blue-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <div key={property.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden border border-gray-100">
                  {property.images.length > 0 && (
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={property.images[0]}
                        alt={language === 'es' ? property.title_es : property.title_en}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                        {formatCurrency(property.price)}
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {language === 'es' ? property.title_es : property.title_en}
                    </h3>
                    {property.location && (
                      <p className="text-sm text-gray-500 mb-4">{property.location}</p>
                    )}
                    {(property.description_es || property.description_en) && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {language === 'es' ? property.description_es : property.description_en}
                      </p>
                    )}
                    <div className="flex items-center space-x-6 text-gray-700 mb-4">
                      <div className="flex items-center space-x-2">
                        <Bed size={20} className="text-red-600" />
                        <span>{property.bedrooms}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Bath size={20} className="text-blue-600" />
                        <span>{property.bathrooms}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Maximize size={20} className="text-gray-600" />
                        <span>{property.area_m2} m²</span>
                      </div>
                    </div>
                    <button className="w-full bg-gradient-to-r from-red-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2">
                      <span>{language === 'es' ? 'Ver Detalles' : 'View Details'}</span>
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {t('aboutTitle')}
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {t('aboutDescription')}
              </p>
              <button
                onClick={() => onNavigate('about')}
                className="bg-gradient-to-r from-red-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
              >
                <span>{t('about')}</span>
                <ArrowRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative overflow-hidden rounded-2xl shadow-xl transform transition-transform hover:scale-105">
                <img
                  src="https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Construction workers"
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="relative overflow-hidden rounded-2xl shadow-xl transform transition-transform hover:scale-105">
                <img
                  src="https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Building construction"
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="col-span-2 relative overflow-hidden rounded-2xl shadow-xl transform transition-transform hover:scale-105">
                <img
                  src="https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Modern building"
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
