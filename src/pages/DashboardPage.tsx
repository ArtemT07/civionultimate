import React, { useEffect, useState } from 'react';
import { Users, Calculator, Mail, TrendingUp, BarChart3, Activity, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

type AnalyticsData = {
  totalVisits: number;
  calculatorUses: number;
  contactForms: number;
  projectsCreated: number;
  totalUsers: number;
};

type DashboardPageProps = {
  onNavigate: (page: string) => void;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { isOwner, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalVisits: 0,
    calculatorUses: 0,
    contactForms: 0,
    projectsCreated: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get analytics counts
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('site_analytics')
        .select('event_type');

      if (analyticsError) throw analyticsError;

      // Count by event type
      const visits = analyticsData?.filter(a => a.event_type === 'page_visit').length || 0;
      const calcs = analyticsData?.filter(a => a.event_type === 'calculator_use').length || 0;
      const contacts = analyticsData?.filter(a => a.event_type === 'contact_form').length || 0;
      const projects = analyticsData?.filter(a => a.event_type === 'project_created').length || 0;

      // Get total users count
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      setAnalytics({
        totalVisits: visits,
        calculatorUses: calcs,
        contactForms: contacts,
        projectsCreated: projects,
        totalUsers: usersCount || 0,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner && !isAdmin) {
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

  const stats = [
    {
      icon: Activity,
      label: t('totalVisits'),
      value: analytics.totalVisits,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: Calculator,
      label: t('calculatorUses'),
      value: analytics.calculatorUses,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      icon: Mail,
      label: t('contactForms'),
      value: analytics.contactForms,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      icon: TrendingUp,
      label: t('projectsCreated'),
      value: analytics.projectsCreated,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      icon: Users,
      label: t('totalUsers'),
      value: analytics.totalUsers,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboard')}</h1>
          </div>
          <p className="text-gray-600">{t('dashboardDescription')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
            >
              <div className={`${stat.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* CMS Management for Owner */}
        {isOwner && (
          <div className="mb-8">
            <div
              onClick={() => onNavigate('cms')}
              className="bg-gradient-to-r from-red-600 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all p-8 cursor-pointer transform hover:scale-105"
            >
              <div className="flex items-center space-x-4 text-white">
                <div className="bg-white/20 p-4 rounded-xl">
                  <FileText size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Sistema CMS</h3>
                  <p className="text-white/90">Administrar contenido del sitio web - Páginas, Textos e Imágenes</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart Placeholder */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>{t('activityOverview')}</span>
          </h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">{t('chartComingSoon')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
