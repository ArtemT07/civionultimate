import React, { useEffect, useState } from 'react';
import { FileText, Plus, Edit2, Trash2, Image, Save, X, Upload, Eye, EyeOff, Settings, Palette, Type, Layout, Menu as MenuIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { MediaLibrary } from '../components/MediaLibrary';
import { NavigationManager } from '../components/NavigationManager';
import { ImagePicker } from '../components/ImagePicker';

type CMSPage = {
  id: string;
  slug: string;
  title_es: string;
  title_en: string;
  is_active: boolean;
  created_at: string;
};

type CMSSection = {
  id: string;
  page_id: string;
  order: number;
  type: string;
  content_es: any;
  content_en: any;
  is_active: boolean;
};

type SiteSettings = {
  logo: { url: string; width: number; height: number; position: string };
  fonts: { heading: string; body: string; sizes: any };
  colors: { primary: { from: string; to: string }; secondary: string; text: string; textLight: string };
  buttons: { defaultSize: string; borderRadius: number; sizes: any };
};

type CMSPageProps = {
  onNavigate?: (page: string) => void;
};

export const CMSPage: React.FC<CMSPageProps> = ({ onNavigate }) => {
  const { isOwner, user } = useAuth();
  const { t, language } = useLanguage();
  const { reloadTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'pages' | 'design' | 'media'>('pages');
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<CMSPage | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [editedSettings, setEditedSettings] = useState<SiteSettings | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sections, setSections] = useState<CMSSection[]>([]);
  const [showPageModal, setShowPageModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [editingSection, setEditingSection] = useState<CMSSection | null>(null);
  const [loading, setLoading] = useState(true);

  const [pageForm, setPageForm] = useState({
    slug: '',
    title_es: '',
    title_en: '',
    is_active: true,
  });

  const [sectionForm, setSectionForm] = useState({
    type: 'text',
    order: 0,
    content_es: { title: '', text: '', image_url: '' },
    content_en: { title: '', text: '', image_url: '' },
    is_active: true,
  });

  useEffect(() => {
    if (isOwner) {
      loadPages();
      loadSiteSettings();
    }
  }, [isOwner]);

  useEffect(() => {
    if (selectedPage) {
      loadSections(selectedPage.id);
    }
  }, [selectedPage]);

  const loadSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;

      const settings: any = {};
      data?.forEach((setting) => {
        settings[setting.setting_key] = setting.setting_value;
      });

      setSiteSettings(settings);
      setEditedSettings(settings);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error loading site settings:', error);
    }
  };

  const updateLocalSetting = (key: string, value: any) => {
    if (editedSettings) {
      setEditedSettings({ ...editedSettings, [key]: value });
      setHasUnsavedChanges(true);
    }
  };

  const saveSiteSettings = async () => {
    if (!editedSettings) return;

    try {
      const updates = Object.keys(editedSettings).map(async (key) => {
        return supabase
          .from('site_settings')
          .update({
            setting_value: editedSettings[key],
            updated_at: new Date().toISOString(),
            updated_by: user?.id,
          })
          .eq('setting_key', key);
      });

      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);

      if (errors.length > 0) throw errors[0].error;

      await loadSiteSettings();
      await reloadTheme();
      alert('✅ Cambios guardados exitosamente');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error guardando cambios');
    }
  };

  const loadPages = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async (pageId: string) => {
    try {
      const { data, error } = await supabase
        .from('cms_sections')
        .select('*')
        .eq('page_id', pageId)
        .order('order');

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  };

  const openPageModal = (page?: CMSPage) => {
    if (page) {
      setEditingPage(page);
      setPageForm({
        slug: page.slug,
        title_es: page.title_es,
        title_en: page.title_en,
        is_active: page.is_active,
      });
    } else {
      setEditingPage(null);
      setPageForm({
        slug: '',
        title_es: '',
        title_en: '',
        is_active: true,
      });
    }
    setShowPageModal(true);
  };

  const savePage = async () => {
    try {
      if (editingPage) {
        const { error } = await supabase
          .from('cms_pages')
          .update({
            ...pageForm,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingPage.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cms_pages')
          .insert({
            ...pageForm,
            created_by: user?.id,
          });

        if (error) throw error;
      }

      await loadPages();
      setShowPageModal(false);
      setEditingPage(null);
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Error guardando página');
    }
  };

  const deletePage = async (pageId: string) => {
    if (!confirm('¿Eliminar esta página?')) return;

    try {
      const { error } = await supabase
        .from('cms_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;
      await loadPages();
      if (selectedPage?.id === pageId) {
        setSelectedPage(null);
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Error eliminando página');
    }
  };

  const openSectionModal = (section?: CMSSection) => {
    if (section) {
      setEditingSection(section);
      setSectionForm({
        type: section.type,
        order: section.order,
        content_es: section.content_es || { title: '', text: '', image_url: '' },
        content_en: section.content_en || { title: '', text: '', image_url: '' },
        is_active: section.is_active,
      });
    } else {
      setEditingSection(null);
      setSectionForm({
        type: 'text',
        order: sections.length,
        content_es: { title: '', text: '', image_url: '' },
        content_en: { title: '', text: '', image_url: '' },
        is_active: true,
      });
    }
    setShowSectionModal(true);
  };

  const saveSection = async () => {
    if (!selectedPage) return;

    try {
      if (editingSection) {
        const { error } = await supabase
          .from('cms_sections')
          .update({
            ...sectionForm,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingSection.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cms_sections')
          .insert({
            ...sectionForm,
            page_id: selectedPage.id,
          });

        if (error) throw error;
      }

      await loadSections(selectedPage.id);
      setShowSectionModal(false);
      setEditingSection(null);
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Error guardando sección');
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm('¿Eliminar esta sección?')) return;

    try {
      const { error } = await supabase
        .from('cms_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;
      if (selectedPage) {
        await loadSections(selectedPage.id);
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Error eliminando sección');
    }
  };

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center max-w-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">Solo el propietario puede acceder al CMS</p>
          <div className="bg-gray-100 p-4 rounded-lg text-left text-sm">
            <p className="font-semibold mb-2">Información de diagnóstico:</p>
            <p>Email: {user?.email || 'No autenticado'}</p>
            <p>Roles: {roles.length > 0 ? roles.join(', ') : 'Sin roles'}</p>
            <p>isOwner: {isOwner ? 'Sí' : 'No'}</p>
            <p>isAdmin: {isAdmin ? 'Sí' : 'No'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <Settings className="text-blue-600" />
              <span>Sistema CMS</span>
            </h1>
            <p className="text-gray-600 mt-1">Gestión completa de contenido y diseño del sitio web</p>
            <p className="text-xs text-gray-400 mt-1">Usuario: {user?.email} | v2.0 WordPress-style</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('pages')}
              className={`px-6 py-3 font-semibold transition-colors flex items-center space-x-2 border-b-2 ${
                activeTab === 'pages'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText size={20} />
              <span>Páginas y Contenido</span>
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`px-6 py-3 font-semibold transition-colors flex items-center space-x-2 border-b-2 ${
                activeTab === 'design'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Palette size={20} />
              <span>Diseño Global</span>
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`px-6 py-3 font-semibold transition-colors flex items-center space-x-2 border-b-2 ${
                activeTab === 'media'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <MenuIcon size={20} />
              <span>Medios y Navegación</span>
            </button>
          </div>
        </div>

        {/* Pages Tab Content */}
        {activeTab === 'pages' && (
          <>
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => openPageModal()}
                className="bg-gradient-to-r from-red-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-700 hover:to-blue-700 transition-all flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Nueva Página</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pages List */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Páginas</h2>
            <div className="space-y-2">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPage?.id === page.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPage(page)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{page.title_es}</h3>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPageModal(page);
                        }}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(page.id);
                        }}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">/{page.slug}</p>
                  <div className="mt-2 flex items-center justify-between">
                    {page.is_active ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Activa</span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Inactiva</span>
                    )}
                    {page.is_active && onNavigate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(`cms-${page.slug}`);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ver Página →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sections Editor */}
          {selectedPage && (
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Secciones: {selectedPage.title_es}</h2>
                <button
                  onClick={() => openSectionModal()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center space-x-2"
                >
                  <Plus size={18} />
                  <span>Nueva Sección</span>
                </button>
              </div>

              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-mono rounded">
                          {section.type}
                        </span>
                        <span className="text-sm text-gray-600">Orden: {section.order}</span>
                        {section.is_active ? (
                          <Eye size={16} className="text-green-600" />
                        ) : (
                          <EyeOff size={16} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openSectionModal(section)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => deleteSection(section.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      <p className="font-semibold">{section.content_es?.title || 'Sin título'}</p>
                      <p className="text-gray-600 line-clamp-2">{section.content_es?.text || 'Sin texto'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
            </div>
          </>
        )}

        {/* Design Tab Content */}
        {activeTab === 'design' && editedSettings && (
          <div className="space-y-6">
            {hasUnsavedChanges && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
                <p className="text-yellow-800 font-medium">Tienes cambios sin guardar</p>
                <button
                  onClick={saveSiteSettings}
                  className="bg-gradient-to-r from-red-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-red-700 hover:to-blue-700 transition-all flex items-center space-x-2"
                >
                  <Save size={18} />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logo Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Image size={24} className="text-blue-600" />
                <span>Configuración de Logo</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">URL del Logo</label>
                  <input
                    type="text"
                    value={editedSettings.logo.url}
                    onChange={(e) => {
                      const newSettings = { ...editedSettings.logo, url: e.target.value };
                      updateLocalSetting('logo', newSettings);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ancho (px)</label>
                    <input
                      type="number"
                      value={editedSettings.logo.width}
                      onChange={(e) => {
                        const newSettings = { ...editedSettings.logo, width: parseInt(e.target.value) };
                        updateLocalSetting('logo', newSettings);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Alto (px)</label>
                    <input
                      type="number"
                      value={editedSettings.logo.height}
                      onChange={(e) => {
                        const newSettings = { ...editedSettings.logo, height: parseInt(e.target.value) };
                        updateLocalSetting('logo', newSettings);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Posición</label>
                  <select
                    value={editedSettings.logo.position}
                    onChange={(e) => {
                      const newSettings = { ...editedSettings.logo, position: e.target.value };
                      updateLocalSetting('logo', newSettings);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="left">Izquierda</option>
                    <option value="center">Centro</option>
                    <option value="right">Derecha</option>
                  </select>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                  <img
                    src={editedSettings.logo.url}
                    alt="Logo preview"
                    style={{ width: editedSettings.logo.width, height: editedSettings.logo.height }}
                    className="border border-gray-200 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Colors Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Palette size={24} className="text-blue-600" />
                <span>Colores del Sitio</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Color Primario (Inicio)</label>
                  <input
                    type="color"
                    value={editedSettings.colors.primary.from}
                    onChange={(e) => {
                      const newSettings = { ...editedSettings.colors, primary: { ...editedSettings.colors.primary, from: e.target.value } };
                      updateLocalSetting('colors', newSettings);
                    }}
                    className="w-full h-12 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Color Primario (Fin)</label>
                  <input
                    type="color"
                    value={editedSettings.colors.primary.to}
                    onChange={(e) => {
                      const newSettings = { ...editedSettings.colors, primary: { ...editedSettings.colors.primary, to: e.target.value } };
                      updateLocalSetting('colors', newSettings);
                    }}
                    className="w-full h-12 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Color de Texto</label>
                  <input
                    type="color"
                    value={editedSettings.colors.text}
                    onChange={(e) => {
                      const newSettings = { ...editedSettings.colors, text: e.target.value };
                      updateLocalSetting('colors', newSettings);
                    }}
                    className="w-full h-12 rounded-lg"
                  />
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Vista previa del gradiente:</p>
                  <div
                    className="h-16 rounded-lg"
                    style={{
                      background: `linear-gradient(to right, ${editedSettings.colors.primary.from}, ${editedSettings.colors.primary.to})`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Fonts Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Type size={24} className="text-blue-600" />
                <span>Tipografía</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fuente de Encabezados</label>
                  <select
                    value={editedSettings.fonts.heading}
                    onChange={(e) => {
                      const newSettings = { ...editedSettings.fonts, heading: e.target.value };
                      updateLocalSetting('fonts', newSettings);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="system-ui">System UI</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fuente del Cuerpo</label>
                  <select
                    value={editedSettings.fonts.body}
                    onChange={(e) => {
                      const newSettings = { ...editedSettings.fonts, body: e.target.value };
                      updateLocalSetting('fonts', newSettings);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="system-ui">System UI</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Layout size={24} className="text-blue-600" />
                <span>Botones</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tamaño por Defecto</label>
                  <select
                    value={editedSettings.buttons.defaultSize}
                    onChange={(e) => {
                      const newSettings = { ...editedSettings.buttons, defaultSize: e.target.value };
                      updateLocalSetting('buttons', newSettings);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="small">Pequeño</option>
                    <option value="medium">Mediano</option>
                    <option value="large">Grande</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Radio de Bordes (px)</label>
                  <input
                    type="number"
                    value={editedSettings.buttons.borderRadius}
                    onChange={(e) => {
                      const newSettings = { ...editedSettings.buttons, borderRadius: parseInt(e.target.value) };
                      updateLocalSetting('buttons', newSettings);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                  <button
                    style={{
                      borderRadius: `${editedSettings.buttons.borderRadius}px`,
                      background: `linear-gradient(to right, ${editedSettings.colors.primary.from}, ${editedSettings.colors.primary.to})`
                    }}
                    className="text-white px-6 py-3 font-semibold"
                  >
                    Botón de Ejemplo
                  </button>
                </div>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>

      {/* Page Modal */}
      {showPageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingPage ? 'Editar Página' : 'Nueva Página'}
              </h3>
              <button onClick={() => setShowPageModal(false)} className="text-gray-500">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (URL)</label>
                <input
                  type="text"
                  value={pageForm.slug}
                  onChange={(e) => setPageForm({...pageForm, slug: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="mi-pagina"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Título (Español)</label>
                <input
                  type="text"
                  value={pageForm.title_es}
                  onChange={(e) => setPageForm({...pageForm, title_es: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Título (Inglés)</label>
                <input
                  type="text"
                  value={pageForm.title_en}
                  onChange={(e) => setPageForm({...pageForm, title_en: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pageForm.is_active}
                    onChange={(e) => setPageForm({...pageForm, is_active: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Página activa</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPageModal(false)}
                className="flex-1 bg-gray-100 text-gray-900 px-4 py-3 rounded-xl font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={savePage}
                className="flex-1 bg-gradient-to-r from-red-600 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingSection ? 'Editar Sección' : 'Nueva Sección'}
              </h3>
              <button onClick={() => setShowSectionModal(false)} className="text-gray-500">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
                  <select
                    value={sectionForm.type}
                    onChange={(e) => setSectionForm({...sectionForm, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="text">Texto</option>
                    <option value="image">Imagen</option>
                    <option value="gallery">Galería</option>
                    <option value="hero">Hero</option>
                    <option value="cards">Tarjetas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Orden</label>
                  <input
                    type="number"
                    value={sectionForm.order}
                    onChange={(e) => setSectionForm({...sectionForm, order: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Contenido (Español)</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Título"
                    value={sectionForm.content_es.title || ''}
                    onChange={(e) => setSectionForm({
                      ...sectionForm,
                      content_es: {...sectionForm.content_es, title: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <textarea
                    placeholder="Texto"
                    rows={4}
                    value={sectionForm.content_es.text || ''}
                    onChange={(e) => setSectionForm({
                      ...sectionForm,
                      content_es: {...sectionForm.content_es, text: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <ImagePicker
                    label="Imagen"
                    value={sectionForm.content_es.image_url || ''}
                    onChange={(url) => setSectionForm({
                      ...sectionForm,
                      content_es: {...sectionForm.content_es, image_url: url}
                    })}
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Contenido (Inglés)</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Title"
                    value={sectionForm.content_en.title || ''}
                    onChange={(e) => setSectionForm({
                      ...sectionForm,
                      content_en: {...sectionForm.content_en, title: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <textarea
                    placeholder="Text"
                    rows={4}
                    value={sectionForm.content_en.text || ''}
                    onChange={(e) => setSectionForm({
                      ...sectionForm,
                      content_en: {...sectionForm.content_en, text: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <ImagePicker
                    label="Image"
                    value={sectionForm.content_en.image_url || ''}
                    onChange={(url) => setSectionForm({
                      ...sectionForm,
                      content_en: {...sectionForm.content_en, image_url: url}
                    })}
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sectionForm.is_active}
                    onChange={(e) => setSectionForm({...sectionForm, is_active: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Sección activa</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowSectionModal(false)}
                className="flex-1 bg-gray-100 text-gray-900 px-4 py-3 rounded-xl font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={saveSection}
                className="flex-1 bg-gradient-to-r from-red-600 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media and Navigation Tab */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          <MediaLibrary />
          <NavigationManager />
        </div>
      )}
    </div>
  );
};
