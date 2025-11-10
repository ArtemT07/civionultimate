import React, { useEffect, useState } from 'react';
import { Home, Plus, Edit2, Trash2, Save, X, Upload, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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

export const PropertyManager: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title_es: '',
    title_en: '',
    description_es: '',
    description_en: '',
    price: 0,
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    area_m2: 0,
    images: [] as string[],
    features_es: [] as string[],
    features_en: [] as string[],
    is_featured: false,
    is_active: true,
  });

  const [newFeatureEs, setNewFeatureEs] = useState('');
  const [newFeatureEn, setNewFeatureEn] = useState('');
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('property_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (property?: Property) => {
    if (property) {
      setEditingProperty(property);
      setForm({
        title_es: property.title_es,
        title_en: property.title_en,
        description_es: property.description_es || '',
        description_en: property.description_en || '',
        price: property.price,
        location: property.location || '',
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area_m2: property.area_m2,
        images: property.images || [],
        features_es: property.features_es || [],
        features_en: property.features_en || [],
        is_featured: property.is_featured,
        is_active: property.is_active,
      });
    } else {
      setEditingProperty(null);
      setForm({
        title_es: '',
        title_en: '',
        description_es: '',
        description_en: '',
        price: 0,
        location: '',
        bedrooms: 0,
        bathrooms: 0,
        area_m2: 0,
        images: [],
        features_es: [],
        features_en: [],
        is_featured: false,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const saveProperty = async () => {
    try {
      const propertyData = {
        ...form,
        description_es: form.description_es || null,
        description_en: form.description_en || null,
        location: form.location || null,
      };

      if (editingProperty) {
        const { error } = await supabase
          .from('property_listings')
          .update(propertyData)
          .eq('id', editingProperty.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('property_listings')
          .insert({
            ...propertyData,
            created_by: user?.id,
          });

        if (error) throw error;
      }

      await loadProperties();
      setShowModal(false);
      setEditingProperty(null);
    } catch (error) {
      console.error('Error saving property:', error);
      alert(language === 'es' ? 'Error guardando propiedad' : 'Error saving property');
    }
  };

  const deleteProperty = async (propertyId: string) => {
    if (!confirm(language === 'es' ? '¿Eliminar esta propiedad?' : 'Delete this property?')) return;

    try {
      const { error } = await supabase
        .from('property_listings')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;
      await loadProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert(language === 'es' ? 'Error eliminando propiedad' : 'Error deleting property');
    }
  };

  const addFeatureEs = () => {
    if (newFeatureEs.trim()) {
      setForm({ ...form, features_es: [...form.features_es, newFeatureEs.trim()] });
      setNewFeatureEs('');
    }
  };

  const addFeatureEn = () => {
    if (newFeatureEn.trim()) {
      setForm({ ...form, features_en: [...form.features_en, newFeatureEn.trim()] });
      setNewFeatureEn('');
    }
  };

  const removeFeatureEs = (index: number) => {
    setForm({ ...form, features_es: form.features_es.filter((_, i) => i !== index) });
  };

  const removeFeatureEn = (index: number) => {
    setForm({ ...form, features_en: form.features_en.filter((_, i) => i !== index) });
  };

  const addImage = () => {
    if (newImage.trim()) {
      setForm({ ...form, images: [...form.images, newImage.trim()] });
      setNewImage('');
    }
  };

  const removeImage = (index: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Home size={28} className="text-blue-600" />
          <span>{language === 'es' ? 'Gestión de Propiedades' : 'Property Management'}</span>
        </h2>
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-red-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-700 hover:to-blue-700 transition-all flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>{language === 'es' ? 'Nueva Propiedad' : 'New Property'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
            {property.images.length > 0 && (
              <img
                src={property.images[0]}
                alt={language === 'es' ? property.title_es : property.title_en}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900 flex-1">
                  {language === 'es' ? property.title_es : property.title_en}
                </h3>
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={() => openModal(property)}
                    className="text-blue-600 hover:text-blue-700 p-1"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteProperty(property.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-2">{formatCurrency(property.price)}</p>
              <p className="text-sm text-gray-600 mb-3">{property.location}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <span>🛏 {property.bedrooms}</span>
                <span>🚿 {property.bathrooms}</span>
                <span>📐 {property.area_m2} m²</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  property.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {property.is_active
                    ? (language === 'es' ? 'Activa' : 'Active')
                    : (language === 'es' ? 'Inactiva' : 'Inactive')}
                </span>
                {property.is_featured && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {language === 'es' ? 'Destacada' : 'Featured'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {language === 'es' ? 'No hay propiedades' : 'No properties'}
          </h3>
          <p className="text-gray-600">
            {language === 'es' ? 'Comienza agregando una nueva propiedad' : 'Start by adding a new property'}
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingProperty
                  ? (language === 'es' ? 'Editar Propiedad' : 'Edit Property')
                  : (language === 'es' ? 'Nueva Propiedad' : 'New Property')}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === 'es' ? 'Título (Español)' : 'Title (Spanish)'}
                  </label>
                  <input
                    type="text"
                    value={form.title_es}
                    onChange={(e) => setForm({...form, title_es: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === 'es' ? 'Título (Inglés)' : 'Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={form.title_en}
                    onChange={(e) => setForm({...form, title_en: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === 'es' ? 'Descripción (Español)' : 'Description (Spanish)'}
                  </label>
                  <textarea
                    value={form.description_es}
                    onChange={(e) => setForm({...form, description_es: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === 'es' ? 'Descripción (Inglés)' : 'Description (English)'}
                  </label>
                  <textarea
                    value={form.description_en}
                    onChange={(e) => setForm({...form, description_en: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === 'es' ? 'Precio' : 'Price'}
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({...form, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === 'es' ? 'Habitaciones' : 'Bedrooms'}
                  </label>
                  <input
                    type="number"
                    value={form.bedrooms}
                    onChange={(e) => setForm({...form, bedrooms: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === 'es' ? 'Baños' : 'Bathrooms'}
                  </label>
                  <input
                    type="number"
                    value={form.bathrooms}
                    onChange={(e) => setForm({...form, bathrooms: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === 'es' ? 'Área (m²)' : 'Area (m²)'}
                  </label>
                  <input
                    type="number"
                    value={form.area_m2}
                    onChange={(e) => setForm({...form, area_m2: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'es' ? 'Ubicación' : 'Location'}
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({...form, location: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'es' ? 'Imágenes' : 'Images'}
                </label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      placeholder="URL de imagen"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={addImage}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {form.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img src={img} alt={`Property ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === 'es' ? 'Características (Español)' : 'Features (Spanish)'}
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newFeatureEs}
                        onChange={(e) => setNewFeatureEs(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeatureEs())}
                        placeholder="Nueva característica"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={addFeatureEs}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {form.features_es.map((feature, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                          <span className="text-sm">{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFeatureEs(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === 'es' ? 'Características (Inglés)' : 'Features (English)'}
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newFeatureEn}
                        onChange={(e) => setNewFeatureEn(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeatureEn())}
                        placeholder="New feature"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={addFeatureEn}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {form.features_en.map((feature, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                          <span className="text-sm">{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFeatureEn(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({...form, is_featured: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {language === 'es' ? 'Propiedad destacada' : 'Featured property'}
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({...form, is_active: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {language === 'es' ? 'Propiedad activa' : 'Active property'}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-100 text-gray-900 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={saveProperty}
                className="flex-1 bg-gradient-to-r from-red-600 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-blue-700 flex items-center justify-center space-x-2"
              >
                <Save size={20} />
                <span>{language === 'es' ? 'Guardar' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
