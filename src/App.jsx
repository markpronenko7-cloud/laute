import React from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Categories } from './components/Categories';
import { InteriorShowcase } from './components/InteriorShowcase';
import { PartnerBenefits } from './components/PartnerBenefits';
import { Production } from './components/Production';
import { AIAndService } from './components/AIAndService';
import { WhereToBuy } from './components/WhereToBuy';
import { PartnerCTA } from './components/PartnerCTA';
import { Footer } from './components/Footer';
import { PartnerModal } from './components/modals/PartnerModal';
import { ServiceModal } from './components/modals/ServiceModal';
import { AIModal } from './components/modals/AIModal';
import { AuthModal } from './components/modals/AuthModal';

export const AppContent = () => {
  return (
    <div className="app-layout">
      <Header />
      <main>
        <Hero />
        <Categories />
        <InteriorShowcase />
        <PartnerBenefits />
        <Production />
        <AIAndService />
        <WhereToBuy />
        <PartnerCTA />
      </main>
      <Footer />

      {/* Global Modals */}
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
