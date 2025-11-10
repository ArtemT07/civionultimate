import React, { useEffect, useState } from 'react';
import { FolderOpen, Trash2, Eye, Calendar, DollarSign, Ruler } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

type Project = {
  id: string;
  name: string;
  area: number;
  project_type: 'residential' | 'commercial';
  base_cost: number;
  materials_cost: number;
  total_cost: number;
  selected_materials: any[];
  created_at: string;
};

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm(t('confirmDeleteProject'))) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      await loadProjects();
      setSelectedProject(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert(t('errorDeletingProject'));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(language === 'es' ? 'es-DO' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('loginRequired')}</h2>
          <p className="text-gray-600">{t('pleaseLoginToViewProjects')}</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <FolderOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">{t('myProjects')}</h1>
          </div>
          <p className="text-gray-600">{t('viewYourSavedCalculations')}</p>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noProjects')}</h3>
            <p className="text-gray-600">{t('startByCreatingCalculation')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Projects List */}
            <div className="lg:col-span-2 space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border cursor-pointer ${
                    selectedProject?.id === project.id ? 'border-blue-600' : 'border-gray-100'
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Calendar size={16} />
                          <span>{formatDate(project.created_at)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Ruler size={16} />
                          <span>{project.area} m²</span>
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.project_type === 'residential'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {t(project.project_type)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">{t('baseCost')}</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(project.base_cost)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">{t('materialsCost')}</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(project.materials_cost)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">{t('totalCost')}</p>
                      <p className="text-lg font-bold text-blue-600">{formatCurrency(project.total_cost)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Project Details */}
            {selectedProject && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">{t('projectDetails')}</h2>
                    <button
                      onClick={() => deleteProject(selectedProject.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-2">{t('projectName')}</p>
                      <p className="text-lg text-gray-900">{selectedProject.name}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-2">{t('projectType')}</p>
                      <p className="text-lg text-gray-900">{t(selectedProject.project_type)}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-2">{t('area')}</p>
                      <p className="text-lg text-gray-900">{selectedProject.area} m²</p>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm font-semibold text-gray-600 mb-3">{t('costBreakdown')}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('baseCost')}</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(selectedProject.base_cost)}</span>
                        </div>
                        {selectedProject.materials_cost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('materialsCost')}</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(selectedProject.materials_cost)}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span className="font-bold text-gray-900">{t('totalCost')}</span>
                          <span className="font-bold text-blue-600 text-lg">{formatCurrency(selectedProject.total_cost)}</span>
                        </div>
                      </div>
                    </div>

                    {selectedProject.selected_materials && selectedProject.selected_materials.length > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm font-semibold text-gray-600 mb-3">{t('selectedMaterials')}</p>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {selectedProject.selected_materials.map((material: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <p className="font-medium text-gray-900 mb-1">{material.name}</p>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {material.quantity} × {formatCurrency(material.unit_price)}
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {formatCurrency(material.total_price)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm font-semibold text-gray-600 mb-2">{t('createdAt')}</p>
                      <p className="text-sm text-gray-900">{formatDate(selectedProject.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
