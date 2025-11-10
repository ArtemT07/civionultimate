import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/Navbar';
import { BackButton } from './components/BackButton';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { ContactsPage } from './pages/ContactsPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { ProfilePage } from './pages/ProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { MaterialsManagementPage } from './pages/MaterialsManagementPage';
import { CMSPage } from './pages/CMSPage';
import { DynamicCMSPage } from './pages/DynamicCMSPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageHistory, setPageHistory] = useState<string[]>(['home']);

  const navigate = (page: string) => {
    setPageHistory([...pageHistory, page]);
    setCurrentPage(page);
  };

  const goBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = pageHistory.slice(0, -1);
      setPageHistory(newHistory);
      setCurrentPage(newHistory[newHistory.length - 1]);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'about':
        return <AboutPage />;
      case 'calculator':
        return <CalculatorPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'materials':
        return <MaterialsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'dashboard':
        return <DashboardPage onNavigate={navigate} />;
      case 'users':
        return <UserManagementPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'materials-management':
        return <MaterialsManagementPage />;
      case 'cms':
        return <CMSPage onNavigate={navigate} />;
      default:
        if (currentPage.startsWith('cms-')) {
          const slug = currentPage.replace('cms-', '');
          return <DynamicCMSPage slug={slug} />;
        }
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <div className="min-h-screen">
            <Navbar currentPage={currentPage} onNavigate={navigate} />
        {currentPage !== 'home' && pageHistory.length > 1 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <BackButton onClick={goBack} />
          </div>
        )}
            <main>{renderPage()}</main>
          </div>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
