import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../i18n/translations';

const AppContext = createContext();

// Helper to extract route from current URL
const getRouteFromUrl = () => {
  const path = window.location.pathname.replace(/\/laute\/?/, '').replace(/^\//, '');
  const hash = window.location.hash.replace(/^#\/?/, '');
  const search = window.location.search;

  // If redirected from 404 SPA handler
  if (search.startsWith('?/')) {
    const cleanSearch = search.slice(2).split('&')[0];
    if (cleanSearch) return cleanSearch;
  }

  if (hash && ['catalog', 'company', 'partners', 'where-to-buy', 'service', 'contacts', 'materials', 'cabinet'].includes(hash)) {
    return hash;
  }

  if (path && ['catalog', 'company', 'partners', 'where-to-buy', 'service', 'contacts', 'materials', 'cabinet'].includes(path)) {
    return path;
  }

  return 'home';
};

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('laute_lang') || 'ru';
  });

  const [region, setRegion] = useState(() => {
    return localStorage.getItem('laute_region') || 'siberia';
  });

  const [currentRoute, setCurrentRoute] = useState(getRouteFromUrl);

  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Navigate to route
  const navigateTo = useCallback((route, anchor) => {
    setCurrentRoute(route);
    const basePath = window.location.pathname.includes('/laute') ? '/laute/' : '/';
    const targetUrl = route === 'home' ? `${basePath}${anchor ? '#' + anchor : ''}` : `${basePath}${route}${anchor ? '#' + anchor : ''}`;
    
    try {
      window.history.pushState({ route }, '', targetUrl);
    } catch {
      // fallback
    }

    if (anchor) {
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Listen to browser popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getRouteFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    localStorage.setItem('laute_lang', lang);
    document.documentElement.lang = lang === 'kz' ? 'kk' : lang;
    
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
    currentRoute,
    navigateTo,
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
    isAIConsultantOpen: isAIModalOpen,
    openAIConsultant: () => setIsAIModalOpen(true),
    closeAIConsultant: () => setIsAIModalOpen(false),
    toggleAIConsultant: () => setIsAIModalOpen(prev => !prev),
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
