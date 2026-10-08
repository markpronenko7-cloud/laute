import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../i18n/translations';
import { DEFAULT_PRODUCTS } from '../data/catalogData';

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

  // Live Products Catalog synced across Excel -> База -> Каталог -> AI
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('laute_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_PRODUCTS;
  });

  const updateProducts = useCallback((newProducts) => {
    setProducts(newProducts);
    try {
      localStorage.setItem('laute_products', JSON.stringify(newProducts));
    } catch {
      // storage quota or fallback
    }
  }, []);

  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(true); // Auto-open on initial load
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Product Detail & Comparison modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [comparisonItems, setComparisonItems] = useState(null);
  const [selectedCity, setSelectedCity] = useState('Алматы');

  const openProductModal = useCallback((prod) => {
    setSelectedProduct(prod);
  }, []);

  const closeProductModal = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const startComparison = useCallback((itemA, itemB) => {
    setComparisonItems([itemA, itemB]);
  }, []);

  const closeComparisonModal = useCallback(() => {
    setComparisonItems(null);
  }, []);

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
    
    let pageTitle = translations[lang]?.meta?.title || 'LAUTE — Завод смесителей и инженерной сантехники | Официальный сайт';
    let pageDesc = translations[lang]?.meta?.description || '';

    if (currentRoute === 'catalog') {
      const catTitles = {
        ru: 'Каталог сантехники LAUTE — Кухонные смесители, пространства ванных комнат, душевые зоны',
        kz: 'LAUTE сантехника каталогы — Асүй араластырғыштары, ванна бөлмелері, душ жүйелері',
        en: 'LAUTE Sanitary Catalog — Kitchen Faucets, Bathroom Spaces, Shower Systems'
      };
      pageTitle = catTitles[lang] || catTitles.ru;
    } else if (currentRoute === 'service') {
      const srvTitles = {
        ru: 'Первый цифровой сервис LAUTE — Сервисное обслуживание и гарантийная поддержка сантехники',
        kz: 'LAUTE бірінші сандық сервисі — Қызмет көрсету және кепілдік қолдау',
        en: 'LAUTE First Digital Service — Warranty Support & Technical Service'
      };
      pageTitle = srvTitles[lang] || srvTitles.ru;
    } else if (currentRoute === 'partners') {
      const partTitles = {
        ru: 'Партнёрство B2B LAUTE — Развиваемся вместе | Оптовые поставки сантехники от завода',
        kz: 'LAUTE B2B серіктестігі — Бірге дамимыз | Сантехниканы көтерме жеткізу',
        en: 'LAUTE B2B Partnership — Growing Together | Wholesale Sanitary Solutions'
      };
      pageTitle = partTitles[lang] || partTitles.ru;
    } else if (currentRoute === 'company') {
      const compTitles = {
        ru: 'О компании LAUTE — Немецкие инженерные технологии и культура сантехники',
        kz: 'LAUTE компаниясы туралы — Неміс инженерлік технологиялары мен мәдениеті',
        en: 'About LAUTE — German Engineering Standards & Sanitary Excellence'
      };
      pageTitle = compTitles[lang] || compTitles.ru;
    } else if (currentRoute === 'where-to-buy') {
      const buyTitles = {
        ru: 'Где купить продукцию LAUTE — Дилерская сеть и официальные точки продаж',
        kz: 'LAUTE өнімдерін қайдан сатып алуға болады — Дилерлік желі',
        en: 'Where to Buy LAUTE — Official Dealers & Distribution Network'
      };
      pageTitle = buyTitles[lang] || buyTitles.ru;
    } else if (currentRoute === 'contacts') {
      const conTitles = {
        ru: 'Контакты завода LAUTE — Отдел оптовых продаж и региональные офисы',
        kz: 'LAUTE зауытының байланыстары — Көтерме сату бөлімі',
        en: 'LAUTE Contacts — Wholesale Department & Global Offices'
      };
      pageTitle = conTitles[lang] || conTitles.ru;
    }

    document.title = pageTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && pageDesc) {
      metaDesc.setAttribute('content', pageDesc);
    }
  }, [lang, currentRoute]);

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
    products,
    updateProducts,
    selectedProduct,
    openProductModal,
    closeProductModal,
    comparisonItems,
    startComparison,
    closeComparisonModal,
    selectedCity,
    setSelectedCity,
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
    startAIPartnerAnalysis: () => {
      setIsAIModalOpen(true);
      window.dispatchEvent(new CustomEvent('laute:ai:partner-analysis'));
    },
    isAuthModalOpen,
    openAuthModal: () => setIsAuthModalOpen(true),
    closeAuthModal: () => setIsAuthModalOpen(false),
    isExcelModalOpen,
    openExcelModal: () => setIsExcelModalOpen(true),
    closeExcelModal: () => setIsExcelModalOpen(false)
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
