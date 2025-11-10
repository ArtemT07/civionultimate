import React, { useEffect, useState } from 'react';
import { Package, Plus, Edit2, Trash2, Search, X, Save, FolderPlus, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

type Category = {
  id: string;
  name_es: string;
  name_en: string;
  description_es?: string;
  description_en?: string;
};

type Material = {
  id: string;
  category_id: string;
  zone_id?: string;
  name_es: string;
  name_en: string;
  description_es?: string;
  description_en?: string;
  photo_url?: string;
  store_price: number;
  company_profit_price: number;
  discount_price: number;
  labor_price: number;
  final_price: number;
  unit: string;
  is_base_material: boolean;
  is_active: boolean;
};

type Zone = {
  id: string;
  name_es: string;
  name_en: string;
  description_es?: string;
  description_en?: string;
  display_order: number;
  is_active: boolean;
};

export const MaterialsManagementPage: React.FC = () => {
  const { isOwner, isAdmin, isMaterialsManager, user } = useAuth();
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [materialForm, setMaterialForm] = useState({
    name_es: '',
    name_en: '',
    description_es: '',
    description_en: '',
    category_id: '',
    zone_id: '',
    store_price: 0,
    company_profit_price: 0,
    discount_price: 0,
    labor_price: 0,
    unit: 'm²',
    is_base_material: false,
    is_active: true,
    photo_url: '',
  });

  const [zoneForm, setZoneForm] = useState({
    name_es: '',
    name_en: '',
    description_es: '',
    description_en: '',
    display_order: 0,
  });

  const [categoryForm, setCategoryForm] = useState({
    name_es: '',
    name_en: '',
    description_es: '',
    description_en: '',
  });

  useEffect(() => {
    if (isOwner || isAdmin || isMaterialsManager) {
      loadData();
    }
  }, [isOwner, isAdmin, isMaterialsManager]);

  useEffect(() => {
    filterMaterials();
  }, [materials, searchTerm, selectedCategory]);

  const loadData = async () => {
    try {
      const [categoriesResult, zonesResult, materialsResult] = await Promise.all([
        supabase.from('material_categories').select('*').order('name_es'),
        supabase.from('material_zones').select('*').order('display_order'),
        supabase.from('materials').select('*').order('name_es'),
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (zonesResult.error) throw zonesResult.error;
      if (materialsResult.error) throw materialsResult.error;

      setCategories(categoriesResult.data || []);
      setZones(zonesResult.data || []);
      setMaterials(materialsResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = materials;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => m.category_id === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.name_es.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.name_en.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMaterials(filtered);
  };

  const openMaterialModal = (material?: Material) => {
    if (material) {
      setEditingMaterial(material);
      setMaterialForm({
        name_es: material.name_es,
        name_en: material.name_en,
        description_es: material.description_es || '',
        description_en: material.description_en || '',
        category_id: material.category_id,
        zone_id: material.zone_id || '',
        store_price: material.store_price,
        company_profit_price: material.company_profit_price,
        discount_price: material.discount_price,
        labor_price: material.labor_price,
        unit: material.unit,
        is_base_material: material.is_base_material,
        is_active: material.is_active,
        photo_url: material.photo_url || '',
      });
    } else {
      setEditingMaterial(null);
      setMaterialForm({
        name_es: '',
        name_en: '',
        description_es: '',
        description_en: '',
        category_id: categories[0]?.id || '',
        zone_id: '',
        store_price: 0,
        company_profit_price: 0,
        discount_price: 0,
        labor_price: 0,
        unit: 'm²',
        is_base_material: false,
        is_active: true,
        photo_url: '',
      });
    }
    setShowMaterialModal(true);
  };

  const openZoneModal = (zone?: Zone) => {
    if (zone) {
      setEditingZone(zone);
      setZoneForm({
        name_es: zone.name_es,
        name_en: zone.name_en,
        description_es: zone.description_es || '',
        description_en: zone.description_en || '',
        display_order: zone.display_order,
      });
    } else {
      setEditingZone(null);
      setZoneForm({
        name_es: '',
        name_en: '',
        description_es: '',
        description_en: '',
        display_order: zones.length + 1,
      });
    }
    setShowZoneModal(true);
  };

  const saveZone = async () => {
    try {
      if (editingZone) {
        const { error } = await supabase
          .from('material_zones')
          .update({
            ...zoneForm,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingZone.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('material_zones')
          .insert(zoneForm);

        if (error) throw error;
      }

      await loadData();
      setShowZoneModal(false);
      setEditingZone(null);
    } catch (error) {
      console.error('Error saving zone:', error);
      alert(language === 'es' ? 'Error al guardar la zona' : 'Error saving zone');
    }
  };

  const deleteZone = async (zoneId: string) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('material_zones')
        .delete()
        .eq('id', zoneId);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error deleting zone:', error);
      alert(language === 'es' ? 'Error al eliminar la zona' : 'Error deleting zone');
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `materials/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('materials')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('materials')
        .getPublicUrl(filePath);

      setMaterialForm({ ...materialForm, photo_url: publicUrlData.publicUrl });
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert(language === 'es' ? 'Error subiendo foto' : 'Error uploading photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const saveMaterial = async () => {
    try {
      const materialData = {
        ...materialForm,
        zone_id: materialForm.zone_id || null,
        description_es: materialForm.description_es || null,
        description_en: materialForm.description_en || null,
        photo_url: materialForm.photo_url || null,
      };

      if (editingMaterial) {
        const { error } = await supabase
          .from('materials')
          .update({
            ...materialData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingMaterial.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('materials')
          .insert({
            ...materialData,
            created_by: user?.id,
          });

        if (error) throw error;
      }

      await loadData();
      setShowMaterialModal(false);
      setEditingMaterial(null);
    } catch (error) {
      console.error('Error saving material:', error);
      alert(t('errorSavingMaterial'));
    }
  };

  const deleteMaterial = async (materialId: string) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error deleting material:', error);
      alert(t('errorDeletingMaterial'));
    }
  };

  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name_es: category.name_es,
        name_en: category.name_en,
        description_es: category.description_es || '',
        description_en: category.description_en || '',
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name_es: '',
        name_en: '',
        description_es: '',
        description_en: '',
      });
    }
    setShowCategoryModal(true);
  };

  const saveCategory = async () => {
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('material_categories')
          .update({
            ...categoryForm,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('material_categories')
          .insert({
            ...categoryForm,
            created_by: user?.id,
          });

        if (error) throw error;
      }

      await loadData();
      setShowCategoryModal(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      alert(t('errorSavingCategory'));
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('material_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(t('errorDeletingCategory'));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
    }).format(amount);
  };

  if (!isOwner && !isAdmin && !isMaterialsManager) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('accessDenied')}</h2>
          <p className="text-gray-600">{t('noPermission')}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  const canManageCategories = isOwner || isAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">{t('materialsManagement')}</h1>
            </div>
            <div className="flex space-x-3">
              {canManageCategories && (
                <button
                  onClick={() => openCategoryModal()}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center space-x-2"
                >
                  <FolderPlus size={20} />
                  <span>{t('newCategory')}</span>
                </button>
              )}
              <button
                onClick={() => openMaterialModal()}
                className="bg-gradient-to-r from-red-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-700 hover:to-blue-700 transition-all flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>{t('newMaterial')}</span>
              </button>
            </div>
          </div>
          <p className="text-gray-600">{t('manageMaterialsAndPrices')}</p>
        </div>

        {/* Categories Management */}
        {canManageCategories && (
          <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('categories')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-900 flex-1">
                    {language === 'es' ? cat.name_es : cat.name_en}
                  </span>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => openCategoryModal(cat)}
                      className="text-blue-600 hover:text-blue-700 transition-colors p-1"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="text-red-600 hover:text-red-700 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zones Management */}
        {canManageCategories && (
          <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'es' ? 'Zonas del Calculador' : 'Calculator Zones'}
              </h2>
              <button
                onClick={() => openZoneModal()}
                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all flex items-center space-x-1"
              >
                <Plus size={16} />
                <span>{language === 'es' ? 'Nueva Zona' : 'New Zone'}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {zones.map((zone) => (
                <div key={zone.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-900 flex-1">
                    {language === 'es' ? zone.name_es : zone.name_en}
                  </span>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => openZoneModal(zone)}
                      className="text-blue-600 hover:text-blue-700 transition-colors p-1"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteZone(zone.id)}
                      className="text-red-600 hover:text-red-700 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('searchMaterials')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="all">{t('allCategories')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {language === 'es' ? cat.name_es : cat.name_en}
              </option>
            ))}
          </select>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
              {material.photo_url && (
                <img
                  src={material.photo_url}
                  alt={language === 'es' ? material.name_es : material.name_en}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}

              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900 flex-1">
                  {language === 'es' ? material.name_es : material.name_en}
                </h3>
                <div className="flex space-x-2 ml-2">
                  <button
                    onClick={() => openMaterialModal(material)}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deleteMaterial(material.id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {categories.find(c => c.id === material.category_id)?.[language === 'es' ? 'name_es' : 'name_en']}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('storePrice')}:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(material.store_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('companyProfitPrice')}:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(material.company_profit_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('laborPrice')}:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(material.labor_price)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-900">{t('finalPrice')}:</span>
                  <span className="font-bold text-blue-600">{formatCurrency(material.final_price)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  material.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {material.is_active ? t('active') : t('inactive')}
                </span>
                {material.is_base_material && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {t('baseMaterial')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredMaterials.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noMaterials')}</h3>
            <p className="text-gray-600">{t('startByAddingMaterial')}</p>
          </div>
        )}
      </div>

      {/* Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingMaterial ? t('editMaterial') : t('newMaterial')}
              </h3>
              <button
                onClick={() => setShowMaterialModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('nameSpanish')}
                  </label>
                  <input
                    type="text"
                    value={materialForm.name_es}
                    onChange={(e) => setMaterialForm({...materialForm, name_es: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('nameEnglish')}
                  </label>
                  <input
                    type="text"
                    value={materialForm.name_en}
                    onChange={(e) => setMaterialForm({...materialForm, name_en: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('category')}
                  </label>
                  <select
                    value={materialForm.category_id}
                    onChange={(e) => setMaterialForm({...materialForm, category_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {language === 'es' ? cat.name_es : cat.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === 'es' ? 'Zona (opcional)' : 'Zone (optional)'}
                  </label>
                  <select
                    value={materialForm.zone_id}
                    onChange={(e) => setMaterialForm({...materialForm, zone_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{language === 'es' ? 'Sin zona' : 'No zone'}</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {language === 'es' ? zone.name_es : zone.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('storePrice')}
                  </label>
                  <input
                    type="number"
                    value={materialForm.store_price}
                    onChange={(e) => setMaterialForm({...materialForm, store_price: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('companyProfitPrice')}
                  </label>
                  <input
                    type="number"
                    value={materialForm.company_profit_price}
                    onChange={(e) => setMaterialForm({...materialForm, company_profit_price: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('discountPrice')}
                  </label>
                  <input
                    type="number"
                    value={materialForm.discount_price}
                    onChange={(e) => setMaterialForm({...materialForm, discount_price: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('laborPrice')}
                  </label>
                  <input
                    type="number"
                    value={materialForm.labor_price}
                    onChange={(e) => setMaterialForm({...materialForm, labor_price: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('unit')}
                </label>
                <select
                  value={materialForm.unit}
                  onChange={(e) => setMaterialForm({...materialForm, unit: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="m²">m² (metros cuadrados)</option>
                  <option value="m³">m³ (metros cúbicos)</option>
                  <option value="m">m (metros lineales)</option>
                  <option value="kg">kg (kilogramos)</option>
                  <option value="t">t (toneladas)</option>
                  <option value="l">l (litros)</option>
                  <option value="gal">gal (galones)</option>
                  <option value="pza">pza (pieza)</option>
                  <option value="caja">caja</option>
                  <option value="bulto">bulto/saco</option>
                  <option value="unidad">unidad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('photo')}
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <div className="flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                        <Upload size={20} className="text-gray-600" />
                        <span className="text-sm text-gray-600">
                          {uploadingPhoto
                            ? (language === 'es' ? 'Subiendo...' : 'Uploading...')
                            : (language === 'es' ? 'Seleccionar archivo' : 'Select file')}
                        </span>
                      </div>
                    </label>
                  </div>
                  {materialForm.photo_url && (
                    <div className="relative">
                      <img
                        src={materialForm.photo_url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setMaterialForm({...materialForm, photo_url: ''})}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={materialForm.is_base_material}
                    onChange={(e) => setMaterialForm({...materialForm, is_base_material: e.target.checked})}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">{t('isBaseMaterial')}</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={materialForm.is_active}
                    onChange={(e) => setMaterialForm({...materialForm, is_active: e.target.checked})}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">{t('active')}</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowMaterialModal(false)}
                className="flex-1 bg-gray-100 text-gray-900 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                {t('cancel')}
              </button>
              <button
                onClick={saveMaterial}
                className="flex-1 bg-gradient-to-r from-red-600 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
              >
                <Save size={20} />
                <span>{t('save')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && canManageCategories && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingCategory ? t('editCategory') : t('newCategory')}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('nameSpanish')}
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name_es}
                    onChange={(e) => setCategoryForm({...categoryForm, name_es: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('nameEnglish')}
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name_en}
                    onChange={(e) => setCategoryForm({...categoryForm, name_en: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('descriptionSpanish')}
                  </label>
                  <textarea
                    value={categoryForm.description_es}
                    onChange={(e) => setCategoryForm({...categoryForm, description_es: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('descriptionEnglish')}
                  </label>
                  <textarea
                    value={categoryForm.description_en}
                    onChange={(e) => setCategoryForm({...categoryForm, description_en: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 bg-gray-100 text-gray-900 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                {t('cancel')}
              </button>
              <button
                onClick={saveCategory}
                className="flex-1 bg-gradient-to-r from-red-600 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
              >
                <Save size={20} />
                <span>{t('save')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zone Modal */}
      {showZoneModal && canManageCategories && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingZone
                  ? (language === 'es' ? 'Editar Zona' : 'Edit Zone')
                  : (language === 'es' ? 'Nueva Zona' : 'New Zone')}
              </h3>
              <button
                onClick={() => setShowZoneModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('nameSpanish')}
                  </label>
                  <input
                    type="text"
                    value={zoneForm.name_es}
                    onChange={(e) => setZoneForm({...zoneForm, name_es: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Cocina, Baño, Sala"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('nameEnglish')}
                  </label>
                  <input
                    type="text"
                    value={zoneForm.name_en}
                    onChange={(e) => setZoneForm({...zoneForm, name_en: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Kitchen, Bathroom, Living Room"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('descriptionSpanish')}
                  </label>
                  <textarea
                    value={zoneForm.description_es}
                    onChange={(e) => setZoneForm({...zoneForm, description_es: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Descripción opcional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('descriptionEnglish')}
                  </label>
                  <textarea
                    value={zoneForm.description_en}
                    onChange={(e) => setZoneForm({...zoneForm, description_en: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Optional description"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'es' ? 'Orden de visualización' : 'Display Order'}
                </label>
                <input
                  type="number"
                  value={zoneForm.display_order}
                  onChange={(e) => setZoneForm({...zoneForm, display_order: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowZoneModal(false)}
                className="flex-1 bg-gray-100 text-gray-900 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                {t('cancel')}
              </button>
              <button
                onClick={saveZone}
                className="flex-1 bg-gradient-to-r from-red-600 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
              >
                <Save size={20} />
                <span>{t('save')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
