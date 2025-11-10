import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

type ImagePickerProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
};

type MediaFile = {
  name: string;
  url: string;
};

export const ImagePicker: React.FC<ImagePickerProps> = ({ value, onChange, label = 'Imagen' }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [files, setFiles] = useState<MediaFile[]>([]);

  useEffect(() => {
    if (showPicker) {
      loadFiles();
    }
  }, [showPicker]);

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('cms-media')
        .list('', { sortBy: { column: 'created_at', order: 'desc' } });

      if (error) throw error;

      const filesWithUrls = data.map((file) => ({
        name: file.name,
        url: supabase.storage.from('cms-media').getPublicUrl(file.name).data.publicUrl,
      }));

      setFiles(filesWithUrls);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const selectImage = (url: string) => {
    onChange(url);
    setShowPicker(false);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      <div className="flex space-x-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL de imagen o selecciona de la biblioteca"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <ImageIcon size={18} />
          <span>Biblioteca</span>
        </button>
      </div>

      {value && (
        <div className="mt-2">
          <img src={value} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
        </div>
      )}

      {showPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Seleccionar Imagen</h3>
              <button onClick={() => setShowPicker(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {files.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No hay imágenes. Ve a "Medios y Navegación" para subir.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {files.map((file) => (
                  <button
                    key={file.url}
                    onClick={() => selectImage(file.url)}
                    className={`relative group border-2 rounded-lg overflow-hidden hover:border-blue-500 transition-colors ${
                      value === file.url ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={file.url} alt={file.name} className="w-full h-32 object-cover" />
                    {value === file.url && (
                      <div className="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center">
                        <Check size={32} className="text-blue-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
