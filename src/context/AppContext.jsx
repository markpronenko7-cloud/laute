import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { translations } from '../i18n/translations';
import { getPageSeo } from '../utils/contentSettings';
import { getPublishedPage } from '../utils/pagePublication';
import { DEFAULT_PRODUCTS } from '../data/catalogData';
import { portal, getPartnerToken, clearPartnerToken } from '../services/partnerApi';
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
  const [partnerAccount, setPartnerAccount] = useState(null);
  const [partnerManager, setPartnerManager] = useState(null);
  const [partnerPrices, setPartnerPrices] = useState({});
  const [partnerLoading, setPartnerLoading] = useState(!!getPartnerToken());
  const [partnerError, setPartnerError] = useState('');
  const partnerRequest = useRef(0);
  const logoutPartner = useCallback(() => {
    partnerRequest.current++;
    clearPartnerToken(); setPartnerAccount(null); setPartnerManager(null); setPartnerPrices({}); setPartnerLoading(false);
  }, []);
  const refreshPartner = useCallback(async () => {
    if (!getPartnerToken()) return;
    const request = ++partnerRequest.current;
    setPartnerLoading(true); setPartnerError(''); setPartnerPrices({});
    try {
      const result = await portal('me');
      if (request !== partnerRequest.current) return;
      setPartnerAccount(result.account); setPartnerManager(result.manager);
      if (result.account.role === 'partner' && !result.account.mustChange) {
        const catalog = await portal('catalog');
        if (request !== partnerRequest.current) return;
        setPartnerPrices(Object.fromEntries(catalog.prices.map(p => [p.article, p])));
      }
    } catch (e) { if (request === partnerRequest.current) setPartnerError(e.message); throw e; }
    finally { if (request === partnerRequest.current) setPartnerLoading(false); }
  }, []);
  useEffect(() => {
    refreshPartner().catch(() => {});
    const expired = () => { logoutPartner(); setPartnerError('Сессия истекла. Войди снова.'); };
    const refresh = () => { if (getPartnerToken()) refreshPartner().catch(() => {}); };
    window.addEventListener('laute:portal-expired', expired);
    window.addEventListener('focus', refresh);
    return () => { window.removeEventListener('laute:portal-expired', expired); window.removeEventListener('focus', refresh); };
  }, [refreshPartner, logoutPartner]);
  const getProductPrice = useCallback(product => partnerAccount?.role === 'partner'
    ? partnerPrices[product.article]?.price ?? null : product.price, [partnerAccount, partnerPrices]);

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
  const isB2BAuthorized = !!partnerAccount && !partnerAccount.mustChange;

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
      if (Array.isArray(whs)) setWarehousesList(whs);
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
      if (Array.isArray(pages)) {
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
    if (typeof window !== 'undefined' && prod?.article) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('product', prod.article);
        window.history.replaceState({}, '', url.toString());
      } catch {
        // ignore
      }
    }
  }, []);

  const closeProductModal = useCallback(() => {
    setSelectedProduct(null);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('product') || url.searchParams.has('sku')) {
          url.searchParams.delete('product');
          url.searchParams.delete('sku');
          window.history.replaceState({}, '', url.toString());
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Support direct URL opening (?product=SKU or #product/SKU or /product/SKU) and page refresh
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncProductFromUrl = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        let sku = params.get('product') || params.get('sku');

        if (!sku) {
          const hash = window.location.hash.replace(/^#\/?/, '');
          if (hash.startsWith('product/')) {
            sku = hash.split('/')[1];
          } else if (hash.includes('product=')) {
            const m = hash.match(/product=([^&]+)/);
            if (m) sku = decodeURIComponent(m[1]);
          }
        }

        if (!sku) {
          const path = window.location.pathname.replace(/\/laute\/?/, '').replace(/^\//, '');
          if (path.startsWith('product/')) {
            sku = path.split('/')[1];
          }
        }

        if (!sku && window.location.search.startsWith('?/product/')) {
          const seg = window.location.search.slice(10).split('&')[0];
          if (seg) sku = decodeURIComponent(seg);
        }

        if (sku && products && products.length > 0) {
          const cleanSku = String(sku).trim().toLowerCase();
          const found = products.find(p => p.article && p.article.toLowerCase() === cleanSku);
          if (found) {
            setSelectedProduct(found);
          } else {
            setSelectedProduct({
              article: sku,
              name: `Товар ${sku}`,
              notFound: true
            });
          }
        }
      } catch {
        // ignore
      }
    };

    syncProductFromUrl();
    window.addEventListener('popstate', syncProductFromUrl);
    window.addEventListener('hashchange', syncProductFromUrl);
    return () => {
      window.removeEventListener('popstate', syncProductFromUrl);
      window.removeEventListener('hashchange', syncProductFromUrl);
    };
  }, [products]);

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
      const rawPrice = liveProd !== undefined ? Number(getProductPrice(liveProd)) : (partnerAccount ? NaN : Number(entry.price));
      const hasKnownPrice = Number.isFinite(rawPrice) && rawPrice > 0;
      const qty = Math.max(1, Math.min(9999, parseInt(entry.quantity, 10) || 1));

      return {
        article: entry.article,
        currency: liveProd?.currency || '₸',
        title: liveProd?.title || liveProd?.name || entry.title || entry.article,
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
  }, [cartRawItems, products, getProductPrice, partnerAccount]);

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
  const cartCurrencyTotals = useMemo(() => cartItems.reduce((totals, item) => {
    if (item.hasKnownPrice) totals[item.currency] = (totals[item.currency] || 0) + item.lineSubtotal;
    return totals;
  }, {}), [cartItems]);
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

    const savedSeo = getPageSeo(siteContent, currentRoute);
    const customPage = pagesList.map(p => getPublishedPage(p, true)).filter(Boolean)
      .find(p => p.slug === currentRoute || p.route === `/${currentRoute}`);
    pageTitle = savedSeo.title || customPage?.seoTitle || customPage?.title || pageTitle;
    pageDesc = savedSeo.description || customPage?.seoDescription || customPage?.description || pageDesc;
    document.title = pageTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && pageDesc) {
      metaDesc.setAttribute('content', pageDesc);
    }
    const setMeta = (selector, attribute, value) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement(attribute === 'href' ? 'link' : 'meta');
        if (attribute === 'href') element.rel = 'canonical';
        else element.name = 'robots';
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };
    setMeta('meta[name="robots"]', 'content', currentRoute === 'admin' ? 'noindex, nofollow' : savedSeo.robots || (savedSeo.indexing === false ? 'noindex, follow' : siteContent?.seo?.global?.robots || 'index, follow'));
    const canonical = savedSeo.canonical || savedSeo.canonicalUrl || `${siteContent?.seo?.global?.canonicalUrl || 'https://laute.ltd'}/${currentRoute === 'home' ? '' : currentRoute}`;
    setMeta('link[rel="canonical"]', 'href', canonical);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', pageTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', pageDesc);
  }, [lang, currentRoute, siteContent, pagesList]);

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
    partnerAccount, partnerManager, partnerLoading, partnerError, refreshPartner, logoutPartner, getProductPrice,
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
    cartCurrencyTotals,
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
    openAuthModal: () => partnerAccount ? navigateTo('account') : setIsAuthModalOpen(true),
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
