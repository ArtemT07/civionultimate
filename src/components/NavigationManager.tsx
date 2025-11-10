import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Menu } from 'lucide-react';
import { supabase } from '../lib/supabase';

type NavItem = {
  id: string;
  label_es: string;
  label_en: string;
  link_type: 'internal' | 'external' | 'cms_page';
  link_value: string;
  order: number;
  is_active: boolean;
};

export const NavigationManager: React.FC = () => {
  const [items, setItems] = useState<NavItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [form, setForm] = useState({
    label_es: '',
    label_en: '',
    link_type: 'internal' as const,
    link_value: '',
    order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .is('parent_id', null)
        .order('order');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading navigation:', error);
    }
  };

  const openModal = (item?: NavItem) => {
    if (item) {
      setEditingItem(item);
      setForm({
        label_es: item.label_es,
        label_en: item.label_en,
        link_type: item.link_type as 'internal' | 'external' | 'cms_page',
        link_value: item.link_value,
        order: item.order,
        is_active: item.is_active,
      });
    } else {
      setEditingItem(null);
      setForm({
        label_es: '',
        label_en: '',
        link_type: 'internal',
        link_value: '',
        order: items.length + 1,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const saveItem = async () => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('navigation_items')
          .update(form)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('navigation_items')
          .insert([form]);

        if (error) throw error;
      }

      await loadItems();
      closeModal();
      alert('✅ Elemento guardado. Recargue para ver cambios en el menú.');
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error guardando elemento');
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('¿Eliminar este elemento del menú?')) return;

    try {
      const { error } = await supabase
        .from('navigation_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadItems();
      alert('✅ Elemento eliminado. Recargue para ver cambios en el menú.');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error eliminando elemento');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Navegación del Sitio</h2>
          <p className="text-gray-600 text-sm">Gestiona los elementos del menú principal</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-red-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-700 hover:to-blue-700 transition-all flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nuevo Elemento</span>
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <Menu size={20} className="text-gray-400" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">{item.label_es}</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-600">{item.label_en}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                  <span className="px-2 py-0.5 bg-gray-100 rounded">{item.link_type}</span>
                  <span>{item.link_value}</span>
                  {!item.is_active && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">Oculto</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => openModal(item)}
                className="text-blue-600 hover:text-blue-700 p-2"
                title="Editar"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => deleteItem(item.id)}
                className="text-red-600 hover:text-red-700 p-2"
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No hay elementos en el menú</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingItem ? 'Editar Elemento' : 'Nuevo Elemento'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiqueta (Español)
                  </label>
                  <input
                    type="text"
                    value={form.label_es}
                    onChange={(e) => setForm({ ...form, label_es: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiqueta (Inglés)
                  </label>
                  <input
                    type="text"
                    value={form.label_en}
                    onChange={(e) => setForm({ ...form, label_en: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Enlace
                </label>
                <select
                  value={form.link_type}
                  onChange={(e) => setForm({ ...form, link_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="internal">Interno (/about, /contacts)</option>
                  <option value="external">Externo (https://...)</option>
                  <option value="cms_page">Página CMS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL / Ruta
                </label>
                <input
                  type="text"
                  value={form.link_value}
                  onChange={(e) => setForm({ ...form, link_value: e.target.value })}
                  placeholder={form.link_type === 'internal' ? '/about' : 'https://example.com'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orden
                  </label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Visible</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveItem}
                  className="bg-gradient-to-r from-red-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-red-700 hover:to-blue-700 transition-all flex items-center space-x-2"
                >
                  <Save size={18} />
                  <span>Guardar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
