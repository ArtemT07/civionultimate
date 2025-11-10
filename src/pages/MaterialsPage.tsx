import React from 'react';
import { Box, Hammer, Trees, Palette, Zap, Grid3x3 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MaterialsPage: React.FC = () => {
  const { t, language } = useLanguage();

  const materials = [
    {
      icon: Box,
      title: t('concrete'),
      description: language === 'es'
        ? 'Concreto de alta resistencia para estructuras duraderas y seguras'
        : 'High-strength concrete for durable and safe structures',
      specs: language === 'es'
        ? ['Resistencia: 3000-5000 PSI', 'Certificación ISO', 'Mezcla personalizada']
        : ['Strength: 3000-5000 PSI', 'ISO Certification', 'Custom mix'],
      color: 'from-red-500 to-red-600',
    },
    {
      icon: Hammer,
      title: t('steel'),
      description: language === 'es'
        ? 'Acero estructural de grado comercial para máxima durabilidad'
        : 'Commercial-grade structural steel for maximum durability',
      specs: language === 'es'
        ? ['Grado 60', 'Anti-corrosión', 'Varillas 3/8" - 1"']
        : ['Grade 60', 'Anti-corrosion', 'Rebar 3/8" - 1"'],
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Trees,
      title: t('wood'),
      description: language === 'es'
        ? 'Madera de calidad premium tratada para exteriores e interiores'
        : 'Premium quality wood treated for exterior and interior use',
      specs: language === 'es'
        ? ['Tratamiento anti-termitas', 'Maderas tropicales', 'Secado al horno']
        : ['Anti-termite treatment', 'Tropical woods', 'Kiln-dried'],
      color: 'from-red-600 to-blue-600',
    },
    {
      icon: Grid3x3,
      title: t('ceramics'),
      description: language === 'es'
        ? 'Cerámica y porcelanato de marcas reconocidas internacionalmente'
        : 'Ceramics and porcelain from internationally recognized brands',
      specs: language === 'es'
        ? ['Acabados variados', 'Pisos y paredes', 'Importación directa']
        : ['Various finishes', 'Floors and walls', 'Direct import'],
      color: 'from-blue-600 to-red-600',
    },
    {
      icon: Palette,
      title: t('paint'),
      description: language === 'es'
        ? 'Pinturas y recubrimientos de alta calidad para todo tipo de superficies'
        : 'High-quality paints and coatings for all types of surfaces',
      specs: language === 'es'
        ? ['Libre de VOC', 'Látex y esmalte', 'Colores personalizados']
        : ['VOC-free', 'Latex and enamel', 'Custom colors'],
      color: 'from-red-500 to-blue-500',
    },
    {
      icon: Zap,
      title: t('electrical'),
      description: language === 'es'
        ? 'Materiales eléctricos certificados y de máxima seguridad'
        : 'Certified electrical materials with maximum safety',
      specs: language === 'es'
        ? ['Certificación UL', 'Cables calibrados', 'Breakers y paneles']
        : ['UL Certification', 'Calibrated cables', 'Breakers and panels'],
      color: 'from-blue-500 to-red-500',
    },
  ];

  return (
    <div className="min-h-screen relative py-16">
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Construction materials background"
          className="w-full h-full object-cover opacity-5"
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('materialsTitle')}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-blue-600 mx-auto rounded-full mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('materialsDescription')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {materials.map((material, index) => {
            const Icon = material.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${material.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                  <Icon className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {material.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {material.description}
                </p>
                <div className="space-y-2">
                  {material.specs.map((spec, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${material.color}`}></div>
                      <p className="text-sm text-gray-700">{spec}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-red-600 to-blue-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
            <h2 className="text-3xl font-bold mb-6">
              {language === 'es' ? 'Calidad Garantizada' : 'Guaranteed Quality'}
            </h2>
            <p className="text-lg mb-6 opacity-90">
              {language === 'es'
                ? 'Todos nuestros materiales cumplen con las más estrictas normas internacionales de calidad y seguridad.'
                : 'All our materials meet the strictest international quality and safety standards.'}
            </p>
            <ul className="space-y-3">
              {[
                language === 'es' ? 'Certificaciones internacionales' : 'International certifications',
                language === 'es' ? 'Proveedores verificados' : 'Verified suppliers',
                language === 'es' ? 'Garantía de fábrica' : 'Factory warranty',
                language === 'es' ? 'Entrega oportuna' : 'Timely delivery',
              ].map((item, idx) => (
                <li key={idx} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-50 bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-gray-50 rounded-full"></div>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {language === 'es' ? 'Nuestro Compromiso' : 'Our Commitment'}
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              {language === 'es'
                ? 'Trabajamos únicamente con materiales de la más alta calidad para garantizar la durabilidad y seguridad de cada proyecto.'
                : 'We work only with the highest quality materials to ensure the durability and safety of every project.'}
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-red-50 to-white rounded-xl">
                <p className="text-4xl font-bold text-red-600 mb-2">100%</p>
                <p className="text-sm text-gray-600">
                  {language === 'es' ? 'Calidad' : 'Quality'}
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl">
                <p className="text-4xl font-bold text-blue-600 mb-2">24h</p>
                <p className="text-sm text-gray-600">
                  {language === 'es' ? 'Entrega' : 'Delivery'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
