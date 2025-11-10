import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, Settings, LayoutDashboard, FolderOpen, User, Package, Calculator } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AuthModal } from './AuthModal';
import { Logo } from './Logo';
import { supabase } from '../lib/supabase';

type NavItem = {
  id: string;
  label_es: string;
  label_en: string;
  link_type: string;
  link_value: string;
  order: number;
};

type NavbarProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
};

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const { user, profile, signOut, isOwner, isAdmin, isMaterialsManager } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNavigation();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const loadNavigation = async () => {
    try {
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .is('parent_id', null)
        .eq('is_active', true)
        .order('order');

      if (error) throw error;
      setNavItems(data || []);
    } catch (error) {
      console.error('Error loading navigation:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsProfileMenuOpen(false);
    onNavigate('home');
  };

  return (
    <>
      <nav className="bg-gray-50 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
              <Logo className="h-20 w-auto" />
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const label = language === 'es' ? item.label_es : item.label_en;
                const isActive = currentPage === item.link_value.replace('/', '');

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.link_type === 'internal') {
                        const page = item.link_value === '/' ? 'home' : item.link_value.replace('/', '');
                        onNavigate(page);
                      } else if (item.link_type === 'external') {
                        window.open(item.link_value, '_blank');
                      }
                    }}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
              {user && (
                <>
                  <button
                    onClick={() => onNavigate('calculator')}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-1 ${
                      currentPage === 'calculator'
                        ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Calculator size={16} />
                    <span>{t('calculator')}</span>
                  </button>
                  <button
                    onClick={() => onNavigate('projects')}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-1 ${
                      currentPage === 'projects'
                        ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FolderOpen size={16} />
                    <span>{t('myProjects')}</span>
                  </button>
                </>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('es')}
                  className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${
                    language === 'es'
                      ? 'bg-gray-50 text-red-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ES
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${
                    language === 'en'
                      ? 'bg-gray-50 text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  EN
                </button>
              </div>

              {user ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 ring-2 ring-white"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">{profile?.full_name?.charAt(0).toUpperCase() || 'U'}</span>
                    )}
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-50 rounded-lg shadow-xl py-2 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{profile?.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                      </div>
                      {(isOwner || isAdmin) && (
                        <button
                          onClick={() => {
                            onNavigate('dashboard');
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                        >
                          <LayoutDashboard size={16} />
                          <span>{t('dashboard')}</span>
                        </button>
                      )}
                      {isOwner && (
                        <button
                          onClick={() => {
                            onNavigate('users');
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                        >
                          <User size={16} />
                          <span>{t('userManagement')}</span>
                        </button>
                      )}
                      {(isOwner || isAdmin || isMaterialsManager) && (
                        <button
                          onClick={() => {
                            onNavigate('materials-management');
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                        >
                          <Package size={16} />
                          <span>{t('materialsManagement')}</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onNavigate('projects');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                      >
                        <FolderOpen size={16} />
                        <span>{t('myProjects')}</span>
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                      >
                        <Settings size={16} />
                        <span>{t('settings')}</span>
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-gradient-to-r from-red-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-red-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  {t('login')}
                </button>
              )}
            </div>

            <button
              className="md:hidden text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-gray-50 border-t border-gray-200">
            <div className="px-4 py-3 space-y-2">
              {navItems.map((item) => {
                const label = language === 'es' ? item.label_es : item.label_en;
                const isActive = currentPage === item.link_value.replace('/', '');

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.link_type === 'internal') {
                        const page = item.link_value === '/' ? 'home' : item.link_value.replace('/', '');
                        onNavigate(page);
                      } else if (item.link_type === 'external') {
                        window.open(item.link_value, '_blank');
                      }
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}

              <div className="flex items-center justify-center space-x-2 bg-gray-100 rounded-lg p-1 my-3">
                <button
                  onClick={() => setLanguage('es')}
                  className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                    language === 'es'
                      ? 'bg-gray-50 text-red-600 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  Español
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                    language === 'en'
                      ? 'bg-gray-50 text-blue-600 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  English
                </button>
              </div>

              {user ? (
                <>
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <User size={20} />
                    <span>{t('profile')}</span>
                  </button>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut size={20} />
                    <span>{t('logout')}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-red-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg"
                >
                  {t('login')}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
