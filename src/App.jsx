import React, { Suspense, lazy } from 'react';
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
import { AIConsultant } from './components/AIConsultant';
import { AuthModal } from './components/modals/AuthModal';
import { ProductDetailModal } from './components/modals/ProductDetailModal';
import { ProductComparisonModal } from './components/modals/ProductComparisonModal';
import { ExcelManagerModal } from './components/modals/ExcelManagerModal';
import CartModal from './components/modals/CartModal';
import { CustomPageRenderer } from './components/builder/CustomPageRenderer';

const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));

export const AppContent = () => {
  const { currentRoute, pagesList = [] } = useApp();

  if (currentRoute === 'admin') {
    return (
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#07090D', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Загрузка панели управления LAUTE...</div>}>
        <AdminPage />
      </Suspense>
    );
  }

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
        return <HomePage />;
      default: {
        // Dynamic custom pages created through Visual Page Builder
        const customPage = pagesList.find(p => p.status !== 'ЧЕРНОВИК' && (p.slug === currentRoute || p.route === `/${currentRoute}`));
        if (customPage) {
          return <CustomPageRenderer page={customPage} />;
        }
        return <HomePage />;
      }
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
      <AIConsultant />
      <AuthModal />
      <ProductDetailModal />
      <ProductComparisonModal />
      <CartModal />
      <ExcelManagerModal />
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
