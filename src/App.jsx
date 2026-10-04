import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { CompanyPage } from './pages/CompanyPage';
import { PartnersPage } from './pages/PartnersPage';
import { WhereToBuyPage } from './pages/WhereToBuyPage';
import { ServicePage } from './pages/ServicePage';
import { ContactsPage } from './pages/ContactsPage';
import { PartnerModal } from './components/modals/PartnerModal';
import { ServiceModal } from './components/modals/ServiceModal';
import { AIModal } from './components/modals/AIModal';
import { AuthModal } from './components/modals/AuthModal';

export const AppContent = () => {
  const { currentRoute } = useApp();

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'catalog':
        return <CatalogPage />;
      case 'company':
        return <CompanyPage />;
      case 'partners':
        return <PartnersPage />;
      case 'where-to-buy':
        return <WhereToBuyPage />;
      case 'service':
        return <ServicePage />;
      case 'contacts':
        return <ContactsPage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="app-layout">
      <Header />
      <main id="main-content">
        {renderCurrentPage()}
      </main>
      <Footer />

      {/* Global B2B Modals */}
      <PartnerModal />
      <ServiceModal />
      <AIModal />
      <AuthModal />
    </div>
  );
};

export const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
