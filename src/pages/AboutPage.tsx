import React from 'react';
import { Award, Users, Target, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const AboutPage: React.FC = () => {
  const { t, language } = useLanguage();

  const values = [
    {
      icon: Award,
      title: language === 'es' ? 'Excelencia' : 'Excellence',
      description: language === 'es'
        ? 'Compromiso con la más alta calidad en cada proyecto'
        : 'Commitment to the highest quality in every project',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: Users,
      title: language === 'es' ? 'Trabajo en Equipo' : 'Teamwork',
      description: language === 'es'
        ? 'Colaboración efectiva para lograr resultados excepcionales'
        : 'Effective collaboration to achieve exceptional results',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Target,
      title: language === 'es' ? 'Precisión' : 'Precision',
      description: language === 'es'
        ? 'Atención meticulosa a cada detalle del proyecto'
        : 'Meticulous attention to every project detail',
      color: 'from-red-600 to-blue-600',
    },
    {
      icon: TrendingUp,
      title: language === 'es' ? 'Innovación' : 'Innovation',
      description: language === 'es'
        ? 'Adopción de tecnologías y métodos de construcción avanzados'
        : 'Adoption of advanced construction technologies and methods',
      color: 'from-blue-600 to-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('aboutTitle')}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-blue-600 mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('aboutDescription')}
          </p>
        </div>

        <div className="mb-16">
          <img
            src="https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Construction"
            className="w-full h-96 object-cover rounded-3xl shadow-2xl"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-blue-600 rounded-3xl transform -rotate-3"></div>
            <div className="relative bg-gray-50 p-8 rounded-3xl shadow-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {language === 'es' ? 'Nuestra Historia' : 'Our Story'}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {language === 'es'
                  ? 'Fundada hace más de 20 años, nuestra empresa ha sido pionera en el desarrollo de proyectos de construcción de alta calidad en toda República Dominicana.'
                  : 'Founded over 20 years ago, our company has been a pioneer in developing high-quality construction projects throughout the Dominican Republic.'}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {language === 'es'
                  ? 'Hemos completado más de 500 proyectos, desde residencias familiares hasta grandes complejos comerciales, siempre manteniendo nuestro compromiso con la excelencia y la satisfacción del cliente.'
                  : 'We have completed over 500 projects, from family residences to large commercial complexes, always maintaining our commitment to excellence and customer satisfaction.'}
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-red-600 rounded-3xl transform rotate-3"></div>
            <div className="relative bg-gray-50 p-8 rounded-3xl shadow-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {language === 'es' ? 'Nuestra Misión' : 'Our Mission'}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {language === 'es'
                  ? 'Transformar sueños en realidad a través de construcciones excepcionales que combinan diseño innovador, materiales de primera calidad y técnicas de construcción avanzadas.'
                  : 'Transform dreams into reality through exceptional constructions that combine innovative design, premium materials, and advanced construction techniques.'}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {language === 'es'
                  ? 'Nos comprometemos a superar las expectativas de nuestros clientes, entregando proyectos a tiempo y dentro del presupuesto.'
                  : 'We are committed to exceeding our clients\' expectations, delivering projects on time and within budget.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            {language === 'es' ? 'Nuestros Valores' : 'Our Values'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-blue-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-6">
            {language === 'es' ? '¿Por Qué Elegirnos?' : 'Why Choose Us?'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-gray-50 bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
              <p className="text-5xl font-bold mb-2">20+</p>
              <p className="text-lg">
                {language === 'es' ? 'Años de Experiencia' : 'Years of Experience'}
              </p>
            </div>
            <div className="bg-gray-50 bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
              <p className="text-5xl font-bold mb-2">500+</p>
              <p className="text-lg">
                {language === 'es' ? 'Proyectos Completados' : 'Completed Projects'}
              </p>
            </div>
            <div className="bg-gray-50 bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
              <p className="text-5xl font-bold mb-2">100%</p>
              <p className="text-lg">
                {language === 'es' ? 'Satisfacción del Cliente' : 'Client Satisfaction'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
