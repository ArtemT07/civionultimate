import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

type MediaFile = {
  name: string;
  url: string;
  created_at: string;
};

export const MediaLibrary: React.FC = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('cms-media')
        .list('', { sortBy: { column: 'created_at', order: 'desc' } });

      if (error) throw error;

      const filesWithUrls = data.map((file) => ({
        name: file.name,
        url: supabase.storage.from('cms-media').getPublicUrl(file.name).data.publicUrl,
        created_at: file.created_at || '',
      }));

      setFiles(filesWithUrls);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('cms-media')
        .upload(fileName, file);

      if (error) throw error;

      await loadFiles();
      alert('✅ Archivo subido exitosamente');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error subiendo archivo');
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileName: string) => {
    if (!confirm('¿Eliminar este archivo?')) return;

    try {
      const { error } = await supabase.storage
        .from('cms-media')
        .remove([fileName]);

      if (error) throw error;

      await loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error eliminando archivo');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Biblioteca de Medios</h2>
        <p className="text-gray-600 text-sm">Sube y gestiona imágenes para usar en tu sitio</p>
      </div>

      <div className="mb-6">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              {uploading ? 'Subiendo...' : 'Click para subir imagen'}
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, SVG (max 5MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={uploadFile}
            disabled={uploading}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file) => (
          <div key={file.name} className="group relative border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <img
              src={file.url}
              alt={file.name}
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={() => copyUrl(file.url)}
                className="bg-white text-gray-900 p-2 rounded-lg mr-2 hover:bg-gray-100 transition-colors"
                title="Copiar URL"
              >
                {copiedUrl === file.url ? <Check size={18} /> : <Copy size={18} />}
              </button>
              <button
                onClick={() => deleteFile(file.name)}
                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="p-2 bg-white">
              <p className="text-xs text-gray-600 truncate">{file.name}</p>
            </div>
          </div>
        ))}
      </div>

      {files.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No hay archivos subidos aún</p>
        </div>
      )}
    </div>
  );
};
