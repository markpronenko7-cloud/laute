import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { translations } from '../i18n/translations';
import { DEFAULT_PRODUCTS } from '../data/catalogData';
import {
  fetchProducts,
  getCurrentAdminSession,
  logoutAdmin,
  fetchSiteContent,
  fetchWarehouses,
  fetchWarehouseStock,
  fetchRegionWarehouseMap,
  saveRegionWarehouseMap,
  fetchCustomPages
} from '../services/adminApi';

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

  if (hash) {
    return hash;
  }

  if (path) {
    return path;
  }

  return 'home';
};

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('laute_lang') || 'ru';
  });

  const [region, setRegionState] = useState(() => {
    return localStorage.getItem('laute_region') || 'siberia';
  });

  const [currentRoute, setCurrentRoute] = useState(getRouteFromUrl);

  // Current logged in admin session
  const [adminSession, setAdminSession] = useState(null);

  // Dynamic Site Content (synced from CMS backend / public content.json)
  const [siteContent, setSiteContent] = useState(() => {
    try {
      const saved = localStorage.getItem('laute_site_content');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return null;
  });

  const reloadSiteContent = useCallback(async () => {
    try {
      const content = await fetchSiteContent(false);
      if (content) {
        setSiteContent(content);
        localStorage.setItem('laute_site_content', JSON.stringify(content));
      }
    } catch {
      // fallback
    }
  }, []);

  // Live Products Catalog synced across Excel -> База -> Каталог
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('laute_products');
      const wasLoaded = localStorage.getItem('laute_products_loaded_from_backend');
      if (saved && wasLoaded) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_PRODUCTS;
  });

  // Warehouses & Stock State
  const [warehousesList, setWarehousesList] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [regionWarehouseMap, setRegionWarehouseMap] = useState({
    siberia: 'novosibirsk',
    kz: 'almaty',
    almaty: 'almaty',
    moscow: 'moscow',
    china: 'china',
    uae: null,
    usa: null
  });
  const [clientSelectedWarehouseId, setClientSelectedWarehouseId] = useState(null);
  const [isB2BAuthorized, setIsB2BAuthorized] = useState(() => {
    return localStorage.getItem('laute_b2b_auth') === 'true';
  });

  // Pages List State for Visual Page Builder
  const [pagesList, setPagesList] = useState([]);

  // Change region and auto-sync default warehouse
  const setRegion = useCallback((newRegion) => {
    setRegionState(newRegion);
    setClientSelectedWarehouseId(null); // Reset manual override to default mapped warehouse
  }, []);

  // Active warehouse: manual client choice OR default mapped for current region
  const activeWarehouseId = clientSelectedWarehouseId || regionWarehouseMap[region] || null;
  const activeWarehouse = warehousesList.find(w => w.id === activeWarehouseId) || null;

  // Real warehouse stock lookup for any SKU
  const getStockForSku = useCallback((sku, targetWhId = activeWarehouseId) => {
    if (!targetWhId) {
      return {
        quantity: null,
        warehouseId: null,
        warehouseName: null,
        status: 'no_warehouse',
        label: 'Склад не выбран'
      };
    }
    const whObj = warehousesList.find(w => w.id === targetWhId);
    const item = stockList.find(s => s.sku === sku && s.warehouseId === targetWhId);

    if (!item || item.quantity === null || item.quantity === undefined) {
      return {
        quantity: null,
        warehouseId: targetWhId,
        warehouseName: whObj?.name || targetWhId,
        status: 'unspecified',
        label: 'Нет данных'
      };
    }

    if (item.quantity === 0) {
      return {
        quantity: 0,
        warehouseId: targetWhId,
        warehouseName: whObj?.name || targetWhId,
        status: 'out_of_stock',
        label: '0 шт. (под заказ)'
      };
    }

    return {
      quantity: item.quantity,
      warehouseId: targetWhId,
      warehouseName: whObj?.name || targetWhId,
      status: 'in_stock',
      label: `${item.quantity} шт. в наличии`
    };
  }, [activeWarehouseId, warehousesList, stockList]);

  // Reload warehouses, region mapping and stock data
  const reloadStockData = useCallback(async () => {
    try {
      const [whs, map, stocks] = await Promise.all([
        fetchWarehouses(),
        fetchRegionWarehouseMap(),
        fetchWarehouseStock(null)
      ]);
      if (Array.isArray(whs) && whs.length > 0) setWarehousesList(whs);
      if (map && typeof map === 'object') setRegionWarehouseMap(map);
      if (Array.isArray(stocks)) setStockList(stocks);
    } catch (err) {
      console.warn('Error loading stock/warehouse context:', err);
    }
  }, []);

  // Reload products from backend or sync
  const reloadProducts = useCallback(async () => {
    try {
      const live = await fetchProducts(true);
      if (Array.isArray(live)) {
        setProducts(live);
        localStorage.setItem('laute_products', JSON.stringify(live));
        localStorage.setItem('laute_products_loaded_from_backend', 'true');
      }
    } catch {
      // fallback
    }
  }, []);

  // Reload all CMS pages
  const reloadPages = useCallback(async () => {
    try {
      const pages = await fetchCustomPages();
      if (Array.isArray(pages) && pages.length > 0) {
        setPagesList(pages);
      }
    } catch (err) {
      console.warn('Error loading pages context:', err);
    }
  }, []);

  // Fetch current session, content, products and stock on mount
  useEffect(() => {
    getCurrentAdminSession().then(sess => {
      if (sess) setAdminSession(sess);
    });
    reloadSiteContent();
    reloadProducts();
    reloadStockData();
    reloadPages();
  }, [reloadSiteContent, reloadProducts, reloadStockData, reloadPages]);

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

  // ==========================================
  // КОРЗИНА ПЕРВИЧНОЙ ЗАЯВКИ БЕЗ РЕГИСТРАЦИИ
  // ==========================================
  const CART_STORAGE_KEY = 'laute_cart_items_v1';

  const [cartRawItems, setCartRawItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(it => it && it.article && Number(it.quantity) > 0);
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartRawItems));
    } catch {
      // ignore storage quota errors
    }
  }, [cartRawItems]);

  // Синхронизируем позиции корзины с живой номенклатурой каталога (только публичные розничные цены)
  const cartItems = useMemo(() => {
    return cartRawItems.map((entry) => {
      const liveProd = products.find(p => p.article === entry.article);
      const rawPrice = liveProd !== undefined ? Number(liveProd.price) : Number(entry.price);
      const hasKnownPrice = Number.isFinite(rawPrice) && rawPrice > 0;
      const qty = Math.max(1, Math.min(9999, parseInt(entry.quantity, 10) || 1));

      return {
        article: entry.article,
        title: liveProd?.title || entry.title || entry.article,
        series: liveProd?.series || entry.series || '',
        category: liveProd?.category || entry.category || '',
        image: liveProd?.image || entry.image || '',
        images: liveProd?.images || entry.images || [],
        price: hasKnownPrice ? rawPrice : null,
        hasKnownPrice,
        quantity: qty,
        lineSubtotal: hasKnownPrice ? rawPrice * qty : null
      };
    });
  }, [cartRawItems, products]);

  const addToCart = useCallback((product, deltaQty = 1) => {
    if (!product || !product.article) return;
    const addAmount = Math.max(1, parseInt(deltaQty, 10) || 1);

    setCartRawItems((prev) => {
      const idx = prev.findIndex(item => item.article === product.article);
      if (idx > -1) {
        const updated = [...prev];
        const nextQty = Math.min(9999, (parseInt(updated[idx].quantity, 10) || 1) + addAmount);
        updated[idx] = {
          ...updated[idx],
          title: product.title || updated[idx].title,
          price: Number(product.price) > 0 ? Number(product.price) : null,
          image: product.image || updated[idx].image,
          images: product.images || updated[idx].images,
          quantity: nextQty
        };
        return updated;
      }

      return [
        ...prev,
        {
          article: product.article,
          title: product.title || product.article,
          series: product.series || '',
          category: product.category || '',
          price: Number(product.price) > 0 ? Number(product.price) : null,
          image: product.image || '',
          images: Array.isArray(product.images) ? product.images : [],
          quantity: addAmount
        }
      ];
    });
  }, []);

  const updateCartQuantity = useCallback((article, newQuantity) => {
    if (!article) return;
    const parsed = parseInt(newQuantity, 10);
    if (isNaN(parsed) || parsed <= 0) {
      setCartRawItems(prev => prev.filter(item => item.article !== article));
      return;
    }
    const clamped = Math.min(9999, parsed);
    setCartRawItems(prev =>
      prev.map(item => (item.article === article ? { ...item, quantity: clamped } : item))
    );
  }, []);

  const removeFromCart = useCallback((article) => {
    if (!article) return;
    setCartRawItems(prev => prev.filter(item => item.article !== article));
  }, []);

  const clearCart = useCallback(() => {
    setCartRawItems([]);
  }, []);

  const getCartItemQuantity = useCallback(
    (article) => {
      const found = cartRawItems.find(it => it.article === article);
      return found ? found.quantity : 0;
    },
    [cartRawItems]
  );

  const cartDistinctCount = cartItems.length;
  const cartTotalUnits = useMemo(
    () => cartItems.reduce((acc, it) => acc + (it.quantity || 0), 0),
    [cartItems]
  );
  const cartTotalKnownAmount = useMemo(
    () => cartItems.reduce((acc, it) => acc + (it.lineSubtotal || 0), 0),
    [cartItems]
  );
  const cartHasPriceOnRequest = useMemo(
    () => cartItems.some(it => !it.hasKnownPrice),
    [cartItems]
  );

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

  function deepMerge(target, source) {
    if (!source || typeof source !== 'object') return target;
    const output = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = deepMerge(target[key] || {}, source[key]);
      } else if (source[key] !== undefined) {
        output[key] = source[key];
      }
    }
    return output;
  }

  const t = useMemo(() => {
    const base = translations[lang] || translations.ru;
    if (siteContent && siteContent.translations && siteContent.translations[lang]) {
      return deepMerge(base, siteContent.translations[lang]);
    }
    return base;
  }, [lang, siteContent]);

  const value = {
    lang,
    setLang,
    region,
    setRegion,
    currentRoute,
    navigateTo,
    t,
    adminSession,
    setAdminSession,
    siteContent,
    setSiteContent,
    reloadSiteContent,
    reloadProducts,
    products,
    updateProducts,
    selectedProduct,
    openProductModal,
    closeProductModal,
    comparisonItems,
    startComparison,
    closeComparisonModal,
    // Корзина первичной заявки без регистрации
    cartItems,
    isCartModalOpen,
    openCartModal: () => setIsCartModalOpen(true),
    closeCartModal: () => setIsCartModalOpen(false),
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartItemQuantity,
    cartDistinctCount,
    cartTotalUnits,
    cartTotalKnownAmount,
    cartHasPriceOnRequest,
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
    closeExcelModal: () => setIsExcelModalOpen(false),
    currentUser: adminSession,
    setCurrentUser: setAdminSession,
    // Warehouse & Regional Stocks Synchronization
    warehousesList,
    setWarehousesList,
    stockList,
    setStockList,
    regionWarehouseMap,
    setRegionWarehouseMap,
    updateRegionWarehouseMap: async (newMap) => {
      setRegionWarehouseMap(newMap);
      await saveRegionWarehouseMap(newMap);
    },
    activeWarehouseId,
    activeWarehouse,
    clientSelectedWarehouseId,
    setClientSelectedWarehouse: (whId) => setClientSelectedWarehouseId(whId),
    getStockForSku,
    reloadStockData,
    isB2BAuthorized,
    setIsB2BAuthorized: (val) => {
      setIsB2BAuthorized(val);
      localStorage.setItem('laute_b2b_auth', val ? 'true' : 'false');
    },
    // Visual Page Builder & CMS Pages
    pagesList,
    setPagesList,
    reloadPages,
    logout: () => {
      logoutAdmin();
      setAdminSession(null);
    }
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
