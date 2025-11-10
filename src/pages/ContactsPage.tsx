import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const ContactsPage: React.FC = () => {
  const { t, language } = useLanguage();

  const contactInfo = [
    {
      icon: MapPin,
      title: t('address'),
      value: t('addressValue'),
      color: 'from-red-500 to-red-600',
    },
    {
      icon: Phone,
      title: language === 'es' ? 'Teléfono' : 'Phone',
      value: t('phoneValue'),
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Mail,
      title: t('email'),
      value: t('emailValue'),
      color: 'from-red-600 to-blue-600',
    },
    {
      icon: Clock,
      title: language === 'es' ? 'Horario' : 'Hours',
      value: language === 'es' ? 'Lun - Vie: 8:00 AM - 6:00 PM' : 'Mon - Fri: 8:00 AM - 6:00 PM',
      color: 'from-blue-600 to-red-600',
    },
  ];

  return (
    <div className="min-h-screen relative py-16">
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Office background"
          className="w-full h-full object-cover opacity-5"
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('contactTitle')}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-blue-600 mx-auto rounded-full mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('contactDescription')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                  <Icon className="text-white" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {info.title}
                </h3>
                <p className="text-gray-600">
                  {info.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-gray-50 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {language === 'es' ? 'Envíanos un Mensaje' : 'Send us a Message'}
            </h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('fullName')}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder={language === 'es' ? 'Tu nombre' : 'Your name'}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('email')}
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder={language === 'es' ? 'tu@email.com' : 'you@email.com'}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="+1 (809) 555-0123"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'es' ? 'Mensaje' : 'Message'}
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                  placeholder={language === 'es' ? 'Cuéntanos sobre tu proyecto...' : 'Tell us about your project...'}
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-red-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-xl"
              >
                {language === 'es' ? 'Enviar Mensaje' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-br from-red-600 to-blue-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
              <h2 className="text-3xl font-bold mb-6">
                {language === 'es' ? 'Visítanos' : 'Visit Us'}
              </h2>
              <p className="text-lg mb-8 opacity-90">
                {language === 'es'
                  ? 'Nuestra oficina está abierta para reuniones. Agenda una cita para discutir tu proyecto.'
                  : 'Our office is open for meetings. Schedule an appointment to discuss your project.'}
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="mt-1 flex-shrink-0" size={24} />
                  <div>
                    <p className="font-semibold">{t('addressValue')}</p>
                    <p className="text-sm opacity-75">
                      {language === 'es' ? 'Zona Colonial' : 'Colonial Zone'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="mt-1 flex-shrink-0" size={24} />
                  <div>
                    <p className="font-semibold">
                      {language === 'es' ? 'Lunes a Viernes' : 'Monday to Friday'}
                    </p>
                    <p className="text-sm opacity-75">8:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl overflow-hidden shadow-lg border border-gray-100">
              <img
                src="https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Office location"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {language === 'es' ? 'Nuestra Oficina' : 'Our Office'}
                </h3>
                <p className="text-gray-600">
                  Santo Domingo, República Dominicana
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
