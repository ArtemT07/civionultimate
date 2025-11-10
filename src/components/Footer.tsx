import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { language } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              {language === 'es' ? 'Contacto' : 'Contact'}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone size={20} className="text-red-500" />
                <span>+1 (809) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={20} className="text-red-500" />
                <a href="mailto:info@civion.com" className="hover:text-red-500 transition-colors">
                  info@civion.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={20} className="text-red-500" />
                <span>
                  {language === 'es'
                    ? 'Santo Domingo, República Dominicana'
                    : 'Santo Domingo, Dominican Republic'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">
              {language === 'es' ? 'Enlaces' : 'Links'}
            </h3>
            <div className="space-y-2">
              <a href="#" className="block hover:text-red-500 transition-colors">
                {language === 'es' ? 'Inicio' : 'Home'}
              </a>
              <a href="#" className="block hover:text-red-500 transition-colors">
                {language === 'es' ? 'Sobre Nosotros' : 'About Us'}
              </a>
              <a href="#" className="block hover:text-red-500 transition-colors">
                {language === 'es' ? 'Materiales' : 'Materials'}
              </a>
              <a href="#" className="block hover:text-red-500 transition-colors">
                {language === 'es' ? 'Calculadora' : 'Calculator'}
              </a>
              <a href="#" className="block hover:text-red-500 transition-colors">
                {language === 'es' ? 'Contacto' : 'Contact'}
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">
              {language === 'es' ? 'Síguenos' : 'Follow Us'}
            </h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-400">
                {language === 'es'
                  ? 'Horario de atención: Lun - Vie, 8:00 AM - 6:00 PM'
                  : 'Business hours: Mon - Fri, 8:00 AM - 6:00 PM'}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>
            © {new Date().getFullYear()} Civion.{' '}
            {language === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
};
