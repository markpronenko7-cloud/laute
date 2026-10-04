import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('laute_lang') || 'ru';
  });

  const [region, setRegion] = useState(() => {
    return localStorage.getItem('laute_region') || 'kz';
  });

  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('laute_lang', lang);
    document.documentElement.lang = lang === 'kz' ? 'kk' : lang;
    
    // Update document title and description according to selected language
    if (translations[lang]?.meta) {
      document.title = translations[lang].meta.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', translations[lang].meta.description);
      }
    }
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('laute_region', region);
  }, [region]);

  const t = translations[lang] || translations.ru;

  const value = {
    lang,
    setLang,
    region,
    setRegion,
    t,
    isPartnerModalOpen,
    openPartnerModal: () => setIsPartnerModalOpen(true),
    closePartnerModal: () => setIsPartnerModalOpen(false),
    isServiceModalOpen,
    openServiceModal: () => setIsServiceModalOpen(true),
    closeServiceModal: () => setIsServiceModalOpen(false),
    isAIModalOpen,
    openAIModal: () => setIsAIModalOpen(true),
    closeAIModal: () => setIsAIModalOpen(false),
    isAuthModalOpen,
    openAuthModal: () => setIsAuthModalOpen(true),
    closeAuthModal: () => setIsAuthModalOpen(false)
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
