import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Globe, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const ProfilePage: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en'>('es');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setSelectedLanguage(profile.preferred_language as 'es' | 'en');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await updateProfile({
        full_name: fullName,
        phone: phone,
        preferred_language: selectedLanguage,
      });

      if (error) throw error;

      await setLanguage(selectedLanguage);
      setMessage(language === 'es' ? 'Perfil actualizado exitosamente' : 'Profile updated successfully');
    } catch (err: any) {
      setMessage(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <p className="text-gray-600">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-600 to-blue-600 rounded-full mb-6 shadow-xl text-white text-4xl font-bold">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{profile.full_name?.charAt(0).toUpperCase() || 'U'}</span>
            )}
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {t('settings')}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-blue-600 mx-auto rounded-full"></div>
        </div>

        <div className="bg-gray-50 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('Error') || message.includes('error')
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <User size={20} />
                <span>{t('fullName')}</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder={language === 'es' ? 'Tu nombre completo' : 'Your full name'}
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Mail size={20} />
                <span>{t('email')}</span>
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                {language === 'es'
                  ? 'El correo electrónico no se puede cambiar'
                  : 'Email cannot be changed'}
              </p>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Phone size={20} />
                <span>{t('phone')}</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="+1 (809) 555-0123"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Globe size={20} />
                <span>{t('language')}</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('es')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedLanguage === 'es'
                      ? 'border-red-600 bg-gradient-to-br from-red-50 to-white shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className={`font-bold ${
                    selectedLanguage === 'es' ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {t('spanish')}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLanguage('en')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedLanguage === 'en'
                      ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-white shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className={`font-bold ${
                    selectedLanguage === 'en' ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {t('english')}
                  </p>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-red-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              <Save size={24} />
              <span>{loading ? '...' : t('save')}</span>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 mb-1">
                  {language === 'es' ? 'Fecha de registro' : 'Registration date'}
                </p>
                <p>{new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 mb-1">
                  {language === 'es' ? 'Última actualización' : 'Last updated'}
                </p>
                <p>{new Date(profile.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
