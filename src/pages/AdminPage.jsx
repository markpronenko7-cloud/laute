import { ButtonSettings } from '../components/builder/ButtonSettings';
import { getEditableBlocks } from '../utils/pagePublication';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CATEGORY_NAMES } from '../data/catalogData';
import { getNavTranslation, getPageSeo, navigationKey } from '../utils/contentSettings';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  FileText,
  Layers,
  Package,
  FolderTree,
  FileSpreadsheet,
  Image as ImageIcon,
  Menu,
  Languages,
  Search,
  Globe,
  GitPullRequest,
  History,
  Settings,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  Save,
  Upload,
  Download,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  Shield,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Copy,
  Sliders,
  Info,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Boxes,
  Warehouse,
  BarChart3,
  Monitor,
  Tablet,
  Smartphone
} from 'lucide-react';
import {
  checkAuthStatus,
  setupInitialPassword,
  loginWithPassword,
  devAutoLogin,
  getCurrentAdminSession,
  logoutAdmin,
  changeAdminPassword,
  fetchSiteContent,
  saveSiteContentDraft,
  publishSiteContent,
  discardSiteContentDraft,
  rollbackSiteContent,
  fetchCustomPages,
  createCustomPage,
  updateCustomPage,
  deleteCustomPage,
  fetchCategories,
  saveCategories,
  fetchProducts,
  addProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  deleteProductsBatch,
  fetchMediaList,
  uploadMediaFiles,
  uploadSingleImage,
  deleteMediaFile,
  downloadExcelTemplate,
  exportCurrentCatalog,
  validateExcelFile,
  commitExcelImport,
  downloadErrorReport,
  fetchHistory,
  rollbackToBackup,
  fetchContentBackups,
  fetchSystemSettings,
  downloadFullSystemBackup,
  fetchWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  fetchWarehouseStock,
  saveStockItem,
  saveBulkStock,
  downloadStockTemplate,
  exportStockToExcel,
  validateStockExcelFile,
  commitStockExcelImport,
  fetchRegionWarehouseMap,
  saveRegionWarehouseMap,
  duplicateCustomPage,
  fetchTerritoryRules,
  saveTerritoryRules,
  fetchOrderInquiries,
  updateOrderInquiryInAdmin,
  deleteOrderInquiryInAdmin,
  resolveMediaUrl,
  checkSystemDiagnostics,
  getAuthToken
} from '../services/adminApi';
import { REGIONS_CONFIG } from '../data/regionsData';
import { VisualPageBuilder } from '../components/builder/VisualPageBuilder';
import {
  downloadStockTemplateExcel,
  parseStockExcelClient
} from '../utils/excelManager';
import '../styles/admin.css';
import '../styles/admin-studio.css';

// Demo mode privacy masking helpers for customer personal data
const maskCustomerName = (name) => {
  if (!name) return '—';
  const trimmed = String(name).trim();
  if (trimmed.length <= 2) return '**';
  return trimmed[0] + '***' + trimmed.slice(-1);
};

const maskCustomerContact = (contact) => {
  if (!contact) return '—';
  const str = String(contact).trim();
  if (str.includes('@')) {
    const parts = str.split('@');
    const user = parts[0];
    const domain = parts[1] || '';
    const maskedUser = user.length > 2 ? `${user[0]}***${user.slice(-1)}` : '***';
    const domainParts = domain.split('.');
    const ext = domainParts.length > 1 ? domainParts.pop() : 'com';
    return `${maskedUser}@***.${ext}`;
  }
  // Phone: +7 (9**) ***-**-XX
  const digits = str.replace(/\D/g, '');
  if (digits.length >= 7) {
    const last2 = str.slice(-2);
    return `+* (***) ***-**-${last2}`;
  }
  return '***-**-**';
};

// Image Field Editor component with file upload, preview, and path editing
const ImageFieldEditor = ({ value, onChange, label = 'Изображение' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const inputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await uploadSingleImage(file);
      if (res && res.url) {
        onChange(res.url);
      }
    } catch (err) {
      setUploadError(err.message || 'Ошибка загрузки изображения');
    } finally {
      setIsUploading(false);
    }
  };

  const previewSrc = value ? resolveMediaUrl(value) : '';

  return (
    <div className="image-field-editor">
      {label && <label className="image-field-label">{label}</label>}
      <div className="image-field-controls">
        <div className="image-preview-thumbnail">
          {value ? (
            <img key={previewSrc} src={previewSrc} alt="Выбранное фото" onLoad={e=>{e.currentTarget.style.display='';}} onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <div className="image-no-preview"><ImageIcon size={20} /></div>
          )}
        </div>
        <div className="image-input-column">
          <div className="image-action-buttons">
            <input 
              type="file" 
              ref={inputRef} 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />
            <button 
              type="button" 
              className="admin-btn admin-btn-outline admin-btn-xs"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload size={12} />
              <span>{isUploading ? 'Загрузка...' : 'Загрузить фото'}</span>
            </button>
            {value && (
              <button 
                type="button" 
                className="admin-btn admin-btn-ghost admin-btn-xs danger"
                onClick={() => onChange('')}
              >
                <Trash2 size={12} />
                <span>Очистить</span>
              </button>
            )}
          </div>
          <input 
            type="text" 
            className="image-path-input" 
            aria-label={label || 'Ссылка на фото'} placeholder="Ссылка на фото"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
          {uploadError && <span className="image-upload-error">{uploadError}</span>}
        </div>
      </div>
    </div>
  );
};

export const AdminPage = () => {
  const { 
    navigateTo, 
    products, 
    updateProducts, 
    siteContent, 
    setSiteContent, 
    reloadSiteContent,
    adminSession,
    setAdminSession,
    reloadStockData,
    reloadPages
  } = useApp();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(adminSession));
  const [isDemoMode, setIsDemoMode] = useState(Boolean(adminSession?.isDemo));
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [needsInitialSetup, setNeedsInitialSetup] = useState(false);
  const [initialPasswordInput, setInitialPasswordInput] = useState('');
  const [initialPasswordConfirm, setInitialPasswordConfirm] = useState('');

  // Active Tab: 1 to 13
  const [activeTab, setActiveTab] = useState('dashboard');
  const [navSearch, setNavSearch] = useState('');
  const [notice, setNotice] = useState(null);

  // Content Draft State
  const [draftContent, setDraftContent] = useState(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastContentSave, setLastContentSave] = useState('');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Products State
  const [catalogList, setCatalogList] = useState(products || []);
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Все');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [selectedCatalogSkus, setSelectedCatalogSkus] = useState(new Set());
  const [isBatchDeletingProducts, setIsBatchDeletingProducts] = useState(false);

  // Catalog Inline Editing & Product Modal Tabs State
  const [inlineEditingArticle, setInlineEditingArticle] = useState(null);
  const [inlineEditData, setInlineEditData] = useState({ name: '', price: 0, category: '', status: '' });
  const [isInlineSaving, setIsInlineSaving] = useState(false);
  const [productModalTab, setProductModalTab] = useState('main'); // main | specs | pricing | media | publish | seo | stock

  // Categories State
  const [categoriesList, setCategoriesList] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSavingCategories, setIsSavingCategories] = useState(false);
  const [isAttachingMedia, setIsAttachingMedia] = useState(false);

  // Warehouse & Stock Management State
  const [warehousesList, setWarehousesList] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [stockList, setStockList] = useState([]);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [isSavingStock, setIsSavingStock] = useState(false);
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockCategoryFilter, setStockCategoryFilter] = useState('Все');
  const [stockLevelFilter, setStockLevelFilter] = useState('all'); // all | in_stock | out_of_stock | unspecified
  const [stockLocalEdits, setStockLocalEdits] = useState({});
  const [isWhModalOpen, setIsWhModalOpen] = useState(false);
  const [editingWh, setEditingWh] = useState(null);
  const [whFormData, setWhFormData] = useState({ id: '', name: '', country: '', city: '', address: '', priority: 1, isActive: true });
  const [whFormError, setWhFormError] = useState('');
  const [isSavingWh, setIsSavingWh] = useState(false);
  const [isStockExcelModalOpen, setIsStockExcelModalOpen] = useState(false);
  const [stockExcelDiff, setStockExcelDiff] = useState(null);
  const [stockExcelMode, setStockExcelMode] = useState('partial'); // partial | replace
  const [isStockExcelConfirming, setIsStockExcelConfirming] = useState(false);
  const [stockExcelReplaceAgreed, setStockExcelReplaceAgreed] = useState(false);
  const stockFileInputRef = useRef(null);

  // Region-Warehouse Mapping & Excel Single Mode State
  const [adminRegionMap, setAdminRegionMap] = useState({
    siberia: 'novosibirsk',
    kz: 'almaty',
    almaty: 'almaty',
    moscow: 'moscow',
    china: 'china',
    uae: null,
    usa: null
  });
  const [isSavingRegionMap, setIsSavingRegionMap] = useState(false);
  const [excelSelectedWarehouseId, setExcelSelectedWarehouseId] = useState(''); // No hardcoded Almaty!
  const [testPreviewRegion, setTestPreviewRegion] = useState('siberia');

  // Multi-Warehouse Matrix & Mass Stock State
  const [stockMatrixViewMode, setStockMatrixViewMode] = useState('matrix'); // matrix | single | region_map | warehouses
  const [selectedStockSkus, setSelectedStockSkus] = useState([]);
  const [isMassStockModalOpen, setIsMassStockModalOpen] = useState(false);
  const [massStockTargetWh, setMassStockTargetWh] = useState('all');
  const [massStockAction, setMassStockAction] = useState('set'); // set | add | subtract
  const [massStockQty, setMassStockQty] = useState('');
  const [isMassStockSaving, setIsMassStockSaving] = useState(false);
  const [matrixEditingCell, setMatrixEditingCell] = useState(null); // { whId, sku }
  const [matrixCellVal, setMatrixCellVal] = useState('');
  const [stockExcelDownloadMenuOpen, setStockExcelDownloadMenuOpen] = useState(false);

  // Editor Simulator Mode
  const [editorSimulatorMode, setEditorSimulatorMode] = useState('desktop'); // desktop | tablet | mobile

  // Media Attachment & Details
  const [mediaDetailModal, setMediaDetailModal] = useState(null);
  const [mediaAttachProductSku, setMediaAttachProductSku] = useState('');
  const [mediaAttachSlot, setMediaAttachSlot] = useState('photo1');

  // SEO Active Page Tab
  const [seoActivePage, setSeoActivePage] = useState('home');

  // Pages & Visual Page Builder State
  const [pagesList, setPagesList] = useState([]);
  const [selectedPageForEditor, setSelectedPageForEditor] = useState('home');
  const [editingCustomPage, setEditingCustomPage] = useState(null);
  const [builderEditingPage, setBuilderEditingPage] = useState(null);
  const [isCreatePageModalOpen, setIsCreatePageModalOpen] = useState(false);
  const [newPageForm, setNewPageForm] = useState({ title: '', slug: '', description: '', template: 'hero_text' });
  const [pagesSearchQuery, setPagesSearchQuery] = useState('');

  // Excel State
  const [excelFile, setExcelFile] = useState(null);
  const [isValidatingExcel, setIsValidatingExcel] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [isCommittingExcel, setIsCommittingExcel] = useState(false);
  const [excelCommitStats, setExcelCommitStats] = useState(null);
  const fileInputRef = useRef(null);

  // Media State
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaSearch, setMediaSearch] = useState('');
  const [selectedMediaPreview, setSelectedMediaPreview] = useState(null);
  const mediaInputRef = useRef(null);

  // History & Backups State
  const [auditLogs, setAuditLogs] = useState([]);
  const [backupsList, setBackupsList] = useState([]);
  const [contentBackupsList, setContentBackupsList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Settings State
  const [systemStats, setSystemStats] = useState(null);
  const [diagnosticsResult, setDiagnosticsResult] = useState(null);
  const [isCheckingDiagnostics, setIsCheckingDiagnostics] = useState(false);
  const [oldPasswordChange, setOldPasswordChange] = useState('');
  const [newPasswordChange, setNewPasswordChange] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordChangeMsg, setPasswordChangeMsg] = useState('');

  // Helper to show auto-dismiss notices
  const showNotice = useCallback((message, type = 'success') => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 4500);
  }, []);

  // Check initial session & auth status on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      // 1. Check existing session
      const existingSession = await getCurrentAdminSession();
      if (existingSession && isMounted) {
        setIsAuthenticated(true);
        setAdminSession(existingSession);
        return;
      }

      // 2. Local development passwordless auto-login (STRICTLY localhost / 127.0.0.1)
      const isLocalHost = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

      if (isLocalHost) {
        const devSession = await devAutoLogin();
        if (devSession && isMounted) {
          setIsAuthenticated(true);
          setAdminSession(devSession);
          showNotice('Локальная разработка: выполнен автоматический вход в панель');
          return;
        }
      }

      // 3. Otherwise, check standard password status (for production / remote access)
      const status = await checkAuthStatus();
      if (isMounted) {
        if (status && !status.isInitialized) {
          setNeedsInitialSetup(true);
        }
        setIsAuthenticated(false);
        setAdminSession(null);
      }
    };

    initAuth();

    return () => { isMounted = false; };
  }, [setAdminSession, showNotice]);

  // Load active tab data
  const loadContentData = useCallback(async () => {
    setIsLoadingContent(true);
    try {
      const draft = await fetchSiteContent(true);
      if (draft) setDraftContent(current => current || draft);
    } catch (err) {
      showNotice(err.message || 'Не удалось загрузить черновик', 'error');
    } finally {
      setIsLoadingContent(false);
    }
  }, []);

  const loadCatalogData = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const prods = await fetchProducts(true, true);
      if (Array.isArray(prods)) {
        setCatalogList(prods);
        updateProducts(prods);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [updateProducts]);

  const loadCategoriesData = useCallback(async () => {
    try {
      const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts(true)]);
      const names = new Set(cats.map(c => c.name));
      const all = [...cats];
      [...prods.map(p => p.category)].filter(Boolean).forEach(name => {
        if (!names.has(name)) { all.push({ id: name, name }); names.add(name); }
      });
      setCategoriesList(all);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadPagesData = useCallback(async () => {
    try {
      const pages = await fetchCustomPages();
      setPagesList(pages);
      await reloadPages();
    } catch (err) {
      console.error(err);
    }
  }, [reloadPages]);

  const loadMediaData = useCallback(async () => {
    setIsLoadingMedia(true);
    try {
      const files = await fetchMediaList();
      setMediaFiles(files);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMedia(false);
    }
  }, []);

  const loadHistoryData = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const data = await fetchHistory();
      setAuditLogs(data.logs || []);
      setBackupsList(data.backups || []);
      const cBackups = await fetchContentBackups();
      setContentBackupsList(cBackups);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const loadSettingsData = useCallback(async () => {
    try {
      const stats = await fetchSystemSettings();
      setSystemStats(stats);
      if (stats?.diagnostics) {
        setDiagnosticsResult(stats.diagnostics);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleRunDiagnostics = async () => {
    setIsCheckingDiagnostics(true);
    try {
      const diag = await checkSystemDiagnostics();
      setDiagnosticsResult(diag);
      showNotice('Диагностика подключения успешно выполнена');
    } catch (err) {
      showNotice(err.message || 'Ошибка проверки подключения', 'error');
    } finally {
      setIsCheckingDiagnostics(false);
    }
  };

  const loadStockData = useCallback(async (targetWhId = null) => {
    setIsLoadingStock(true);
    try {
      const [whs, allStock, regMap] = await Promise.all([
        fetchWarehouses(),
        fetchWarehouseStock(null), // Fetch complete stock matrix across all warehouses
        fetchRegionWarehouseMap()
      ]);
      if (Array.isArray(whs) && whs.length > 0) {
        setWarehousesList(whs);
        const whId = targetWhId || selectedWarehouseId || whs[0].id;
        setSelectedWarehouseId(whId);
      }
      setStockList(allStock || []);
      if (regMap && typeof regMap === 'object') {
        setAdminRegionMap(regMap);
      }
    } catch (err) {
      console.error('Ошибка загрузки остатков:', err);
    } finally {
      setIsLoadingStock(false);
    }
  }, [selectedWarehouseId]);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (activeTab === 'dashboard') {
      loadCatalogData();
      loadPagesData();
      loadSettingsData();
      loadHistoryData();
      loadContentData();
    } else if (activeTab === 'buttons' || activeTab === 'editor' || activeTab === 'drafts' || activeTab === 'languages' || activeTab === 'menu' || activeTab === 'seo') {
      loadContentData();
      if (activeTab === 'drafts' || activeTab === 'editor') {
        loadHistoryData();
      }
    } else if (activeTab === 'catalog') {
      loadCatalogData();
      loadCategoriesData();
    } else if (activeTab === 'stock') {
      loadCatalogData();
      loadCategoriesData();
      loadStockData();
    } else if (activeTab === 'categories') {
      loadCategoriesData();
      loadCatalogData();
    } else if (activeTab === 'excel') {
      loadCatalogData();
    } else if (activeTab === 'pages') {
      loadPagesData();
    } else if (activeTab === 'media') {
      loadMediaData();
      loadCatalogData();
    } else if (activeTab === 'history') {
      loadHistoryData();
    } else if (activeTab === 'settings') {
      loadSettingsData();
    }
  }, [
    isAuthenticated, 
    activeTab, 
    loadContentData, 
    loadCatalogData, 
    loadCategoriesData, 
    loadStockData,
    loadPagesData, 
    loadMediaData, 
    loadHistoryData, 
    loadSettingsData
  ]);

  // Handle Login with Single Password
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setAuthError('Введите пароль');
      return;
    }

    setIsSubmittingAuth(true);
    setAuthError('');

    try {
      const res = await loginWithPassword(passwordInput);
      if (res.success) {
        setIsAuthenticated(true);
        setAdminSession(res.session);
        setPasswordInput('');
        showNotice('Добро пожаловать в панель управления LAUTE');
      }
    } catch (err) {
      if (err.needsSetup) {
        setNeedsInitialSetup(true);
      }
      setAuthError(err.message || 'Неверный пароль доступа');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Handle Initial Password Setup
  const handleInitialSetup = async (e) => {
    e.preventDefault();
    if (initialPasswordInput.length < 6) {
      setAuthError('Пароль должен быть длиной не менее 6 символов');
      return;
    }
    if (initialPasswordInput !== initialPasswordConfirm) {
      setAuthError('Пароли не совпадают');
      return;
    }

    setIsSubmittingAuth(true);
    setAuthError('');

    try {
      await setupInitialPassword(initialPasswordInput);
      setNeedsInitialSetup(false);
      showNotice('Пароль успешно задан! Теперь войдите с новым паролем.');
      setPasswordInput(initialPasswordInput);
    } catch (err) {
      setAuthError(err.message || 'Ошибка установки пароля');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    if (!isDemoMode) {
      await logoutAdmin();
    }
    setIsAuthenticated(false);
    setIsDemoMode(false);
    setAdminSession(null);
    navigateTo('home');
  };

  // Warning on unsaved changes when closing tab or reloading
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (draftContent?.hasUnpublishedChanges) {
        e.preventDefault();
        e.returnValue = 'У вас есть несохранённые изменения в черновике. Вы уверены, что хотите закрыть страницу?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [draftContent?.hasUnpublishedChanges]);

  // Safe navigation back to site
  const handleReturnToSite = () => {
    if (draftContent?.hasUnpublishedChanges) {
      if (!window.confirm('В черновике есть изменения, которые ещё не опубликованы на сайте. Вернуться на сайт?')) {
        return;
      }
    }
    navigateTo('home');
  };

  // Reorder slides in hero slider
  const moveSlide = (sIdx, direction) => {
    if (!draftContent?.homeBlocks?.heroSlider) return;
    const slides = [...draftContent.homeBlocks.heroSlider];
    const targetIdx = sIdx + direction;
    if (targetIdx < 0 || targetIdx >= slides.length) return;

    const temp = slides[sIdx];
    slides[sIdx] = slides[targetIdx];
    slides[targetIdx] = temp;

    slides.forEach((s, idx) => { s.order = idx + 1; });

    setDraftContent({
      ...draftContent,
      hasUnpublishedChanges: true,
      homeBlocks: { ...draftContent.homeBlocks, heroSlider: slides }
    });
  };

  // Save Draft Handler
  const saveCurrentDraft = async () => {
    const latest = await fetchSiteContent(true);
    // Заявки и территории редактируются отдельно: не перезаписываем их старой копией редактора.
    const updates = { ...draftContent };
    delete updates.order_inquiries;
    delete updates.territoryManagers;
    return saveSiteContentDraft({ ...latest, ...updates });
  };

  const handleSaveDraft = async () => {
    if (isSavingDraft || isPublishing) return;
    if (isDemoMode) {
      showNotice('В ознакомительном демо-режиме изменение реальных данных заблокировано. Для сохранения требуется авторизация с мастер-паролем.');
      return;
    }
    if (!draftContent) return;
    setIsSavingDraft(true);
    try {
      const saved = await saveCurrentDraft();
      setDraftContent(saved);
      setLastContentSave('Черновик сохранён · ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
      showNotice('Изменения сохранены');
    } catch (err) {
      showNotice(err.message || 'Ошибка сохранения черновика', 'error');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Publish Draft Handler
  const handlePublish = async () => {
    if (isSavingDraft || isPublishing) return;
    if (isDemoMode) {
      showNotice('В ознакомительном демо-режиме публикация на сайте заблокирована. Для публикации требуется авторизация с мастер-паролем.');
      return;
    }
    setIsPublishing(true);
    try {
      if (draftContent) await saveCurrentDraft();
      const res = await publishSiteContent();
      setDraftContent(res.content);
      setSiteContent(res.content);
      setLastContentSave('Публикация подтверждена · ' + res.content.version);
      reloadSiteContent();
      showNotice('Изменения опубликованы');
    } catch (err) {
      showNotice(err.message || 'Ошибка публикации', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Discard Draft Handler
  const handleDiscardDraft = async () => {
    if (isDemoMode) {
      showNotice('В ознакомительном демо-режиме отмена изменений заблокирована.');
      return;
    }
    if (!window.confirm('Вы уверены, что хотите отменить все несохранённые изменения черновика?')) return;
    try {
      const res = await discardSiteContentDraft();
      setDraftContent(res);
      showNotice('Несохранённые изменения отменены');
    } catch (err) {
      showNotice(err.message, 'error');
    }
  };

  // Password Change Handler in Settings
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (isDemoMode) {
      setPasswordChangeMsg('В ознакомительном демо-режиме смена мастер-пароля заблокирована.');
      return;
    }
    if (newPasswordChange.length < 6) {
      setPasswordChangeMsg('Новый пароль должен быть не менее 6 символов');
      return;
    }
    if (newPasswordChange !== newPasswordConfirm) {
      setPasswordChangeMsg('Новые пароли не совпадают');
      return;
    }

    try {
      await changeAdminPassword(oldPasswordChange, newPasswordChange);
      setPasswordChangeMsg('✅ Пароль успешно изменён! Запомните новый пароль.');
      setOldPasswordChange('');
      setNewPasswordChange('');
      setNewPasswordConfirm('');
      showNotice('Пароль администратора успешно изменён');
    } catch (err) {
      setPasswordChangeMsg(`❌ ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // CATALOG INLINE EDITING HANDLERS
  // -------------------------------------------------------------
  const handleStartInlineEdit = (prod) => {
    setInlineEditingArticle(prod.article);
    setInlineEditData({
      name: prod.name || '',
      price: prod.price || 0,
      category: prod.category || 'Кухонные смесители',
      status: prod.status || 'АКТИВЕН'
    });
  };

  const handleCancelInlineEdit = () => {
    setInlineEditingArticle(null);
    setInlineEditData({ name: '', price: 0, category: '', status: '' });
  };

  const handleSaveInlineEdit = async (article) => {
    if (isDemoMode) {
      showNotice('В демонстрационном режиме быстрое сохранение заблокировано.');
      return;
    }
    if (!inlineEditData.name.trim()) {
      showNotice('Название товара не может быть пустым', 'error');
      return;
    }
    const numPrice = Number(inlineEditData.price);
    if (isNaN(numPrice) || numPrice < 0) {
      showNotice('Цена должна быть положительным числом', 'error');
      return;
    }

    setIsInlineSaving(true);
    try {
      const existing = catalogList.find(p => p.article === article);
      const updatedProd = {
        ...existing,
        name: inlineEditData.name.trim(),
        price: numPrice,
        category: inlineEditData.category,
        status: inlineEditData.status
      };
      await updateProduct(article, updatedProd);
      setCatalogList(prev => prev.map(p => p.article === article ? updatedProd : p));
      updateProducts(catalogList.map(p => p.article === article ? updatedProd : p));
      setInlineEditingArticle(null);
      showNotice(`Товар ${article} успешно сохранён`);
    } catch (err) {
      showNotice(err.message || 'Ошибка сохранения товара', 'error');
    } finally {
      setIsInlineSaving(false);
    }
  };

  const handleBatchDeleteProducts = async () => {
    if (isDemoMode) {
      showNotice('В демонстрационном режиме удаление товаров заблокировано.');
      return;
    }
    const count = selectedCatalogSkus.size;
    if (count === 0) return;

    if (window.confirm(`Вы уверены, что хотите удалить ${count} выбранных товаров из каталога?`)) {
      setIsBatchDeletingProducts(true);
      try {
        const skusToDelete = Array.from(selectedCatalogSkus);
        await deleteProductsBatch(skusToDelete);
        setSelectedCatalogSkus(new Set());
        await loadCatalogData();
        showNotice(`Успешно удалено товаров: ${count}`);
      } catch (err) {
        showNotice(err.message || 'Ошибка массового удаления', 'error');
      } finally {
        setIsBatchDeletingProducts(false);
      }
    }
  };

  // -------------------------------------------------------------
  // WAREHOUSE & STOCK MATRIX HANDLERS
  // -------------------------------------------------------------
  const handleSaveMatrixCell = async (whId, sku, newQty) => {
    if (isDemoMode) {
      showNotice('В ознакомительном демо-режиме изменение остатков защищено.');
      return;
    }
    const parsed = parseInt(newQty, 10);
    if (isNaN(parsed) || parsed < 0) {
      showNotice('Остаток должен быть неотрицательным числом (0 или больше)', 'error');
      return;
    }
    try {
      await saveStockItem(whId, sku, parsed);
      setStockList(prev => {
        const idx = prev.findIndex(s => s.sku === sku && s.warehouseId === whId);
        const now = new Date().toISOString();
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], quantity: parsed, updatedAt: now };
          return updated;
        } else {
          return [...prev, { warehouseId: whId, sku, quantity: parsed, updatedAt: now, updatedBy: 'admin' }];
        }
      });
      setMatrixEditingCell(null);
      showNotice(`Остаток ${sku} сохранён: ${parsed} шт.`);
    } catch (err) {
      showNotice(err.message || 'Ошибка сохранения остатка', 'error');
    }
  };

  const handleToggleStockSelect = (sku) => {
    setSelectedStockSkus(prev => 
      prev.includes(sku) ? prev.filter(s => s !== sku) : [...prev, sku]
    );
  };

  const handleSelectAllStock = (visibleSkus) => {
    if (selectedStockSkus.length === visibleSkus.length) {
      setSelectedStockSkus([]);
    } else {
      setSelectedStockSkus([...visibleSkus]);
    }
  };

  const handleApplyMassStockEdit = async () => {
    if (isDemoMode) {
      showNotice('В ознакомительном демо-режиме массовое изменение защищено.');
      return;
    }
    if (selectedStockSkus.length === 0) {
      showNotice('Не выбрано ни одного товара', 'error');
      return;
    }
    const qtyVal = parseInt(massStockQty, 10);
    if (isNaN(qtyVal) || (massStockAction === 'set' && qtyVal < 0)) {
      showNotice('Укажите корректное число остатка (неотрицательное)', 'error');
      return;
    }

    setIsMassStockSaving(true);
    try {
      const targetWhs = massStockTargetWh === 'all' 
        ? warehousesList.map(w => w.id) 
        : [massStockTargetWh];
      
      const updates = [];
      const now = new Date().toISOString();

      for (const sku of selectedStockSkus) {
        for (const whId of targetWhs) {
          const existing = stockList.find(s => s.sku === sku && s.warehouseId === whId);
          let newQty = qtyVal;
          if (massStockAction === 'add') {
            newQty = Math.max(0, (existing?.quantity || 0) + qtyVal);
          } else if (massStockAction === 'subtract') {
            newQty = Math.max(0, (existing?.quantity || 0) - qtyVal);
          }
          updates.push({ warehouseId: whId, sku, quantity: newQty });
        }
      }

      await saveBulkStock(updates);
      setStockList(prev => {
        const next = [...prev];
        updates.forEach(u => {
          const idx = next.findIndex(s => s.sku === u.sku && s.warehouseId === u.warehouseId);
          if (idx >= 0) {
            next[idx] = { ...next[idx], quantity: u.quantity, updatedAt: now };
          } else {
            next.push({ warehouseId: u.warehouseId, sku: u.sku, quantity: u.quantity, updatedAt: now, updatedBy: 'admin' });
          }
        });
        return next;
      });

      setIsMassStockModalOpen(false);
      setSelectedStockSkus([]);
      setMassStockQty('');
      showNotice(`Массовое обновление остатков успешно выполнено (${updates.length} записей)`);
    } catch (err) {
      showNotice(err.message || 'Ошибка массового обновления остатков', 'error');
    } finally {
      setIsMassStockSaving(false);
    }
  };

  const handleAttachMediaToProduct = async () => {
    if (isDemoMode) {
      showNotice('В ознакомительном демо-режиме изменение товаров защищено.');
      return;
    }
    if (!mediaDetailModal || !mediaAttachProductSku) {
      showNotice('Выберите товар для привязки', 'error');
      return;
    }
    try {
      const prod = catalogList.find(p => p.article === mediaAttachProductSku);
      if (!prod) return;
      setIsAttachingMedia(true);
      const updatedProd = await updateProduct(prod.article, { [mediaAttachSlot]: mediaDetailModal.url });
      setCatalogList(prev => prev.map(p => p.article === prod.article ? updatedProd : p));
      updateProducts(catalogList.map(p => p.article === prod.article ? updatedProd : p));
      showNotice(`Фото «${mediaDetailModal.name}» привязано к товару ${prod.article} (${mediaAttachSlot})`);
      setMediaDetailModal(null);
    } catch (err) {
      showNotice(err.message || 'Ошибка привязки фото к товару', 'error');
    } finally { setIsAttachingMedia(false); }
  };
  const persistCategories = async (next) => {
    if (isDemoMode) { showNotice('Для сохранения войди по паролю', 'error'); return; }
    setIsSavingCategories(true);
    try {
      setCategoriesList(await saveCategories(next));
      await loadCatalogData();
      setEditingCategory(null);
      showNotice('Категории и связи товаров сохранены. Изменения уже на сайте.');
    } catch (err) { showNotice(err.message, 'error'); }
    finally { setIsSavingCategories(false); }
  };
  const handleSelectWarehouse = (whId) => {
    setSelectedWarehouseId(whId);
    setStockLocalEdits({});
  };

  const handleSaveRegionMap = async () => {
    setIsSavingRegionMap(true);
    try {
      await saveRegionWarehouseMap(adminRegionMap);
      await reloadStockData();
      showNotice('Таблица соответствий «Регион → Склад» успешно сохранена');
    } catch (err) {
      showNotice(err.message || 'Ошибка сохранения таблицы соответствий', 'error');
    } finally {
      setIsSavingRegionMap(false);
    }
  };

  const handleSaveStockRow = async (sku) => {
    if (isDemoMode) {
      showNotice('В ознакомительном демо-режиме изменение складских остатков защищено.');
      return;
    }
    const editVal = stockLocalEdits[sku];
    if (editVal === undefined || editVal === '') {
      showNotice('Укажите количество для сохранения', 'error');
      return;
    }
    const qty = parseInt(editVal, 10);
    if (isNaN(qty) || qty < 0) {
      showNotice('Количество не может быть отрицательным числом', 'error');
      return;
    }

    setIsSavingStock(true);
    try {
      await saveStockItem(selectedWarehouseId, sku, qty);
      setStockList(prev => {
        const existingIdx = prev.findIndex(s => s.sku === sku && s.warehouseId === selectedWarehouseId);
        const now = new Date().toISOString();
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], quantity: qty, updatedAt: now };
          return updated;
        } else {
          return [...prev, { warehouseId: selectedWarehouseId, sku, quantity: qty, updatedAt: now, updatedBy: 'admin' }];
        }
      });
      setStockLocalEdits(prev => {
        const copy = { ...prev };
        delete copy[sku];
        return copy;
      });
      showNotice(`Остаток ${sku} успешно сохранён: ${qty} шт.`);
    } catch (err) {
      showNotice(err.message || 'Ошибка сохранения остатка', 'error');
    } finally {
      setIsSavingStock(false);
    }
  };

  const handleOpenWhModal = (wh = null) => {
    setEditingWh(wh);
    setWhFormError('');
    if (wh) {
      setWhFormData({
        id: wh.id,
        name: wh.name,
        country: wh.country || '',
        city: wh.city || '',
        address: wh.address || '',
        priority: wh.priority || 1,
        isActive: wh.isActive !== false
      });
    } else {
      setWhFormData({
        id: '',
        name: '',
        country: '',
        city: '',
        address: '',
        priority: (warehousesList.length + 1),
        isActive: true
      });
    }
    setIsWhModalOpen(true);
  };

  const handleSaveWh = async (e) => {
    e.preventDefault();
    if (isDemoMode) {
      showNotice('В ознакомительном демо-режиме изменение складов защищено.');
      return;
    }
    if (!whFormData.name.trim()) {
      setWhFormError('Укажите название склада');
      return;
    }
    const whId = (editingWh ? editingWh.id : whFormData.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')) || whFormData.name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!whId) {
      setWhFormError('Укажите идентификатор склада');
      return;
    }

    setIsSavingWh(true);
    setWhFormError('');
    try {
      if (editingWh) {
        await updateWarehouse(editingWh.id, {
          name: whFormData.name,
          country: whFormData.country,
          city: whFormData.city,
          address: whFormData.address,
          priority: Number(whFormData.priority) || 1,
          isActive: whFormData.isActive
        });
        showNotice(`Склад «${whFormData.name}» обновлён`);
      } else {
        await createWarehouse({
          id: whId,
          name: whFormData.name,
          country: whFormData.country,
          city: whFormData.city,
          address: whFormData.address,
          priority: Number(whFormData.priority) || 1,
          isActive: whFormData.isActive
        });
        showNotice(`Склад «${whFormData.name}» успешно добавлен`);
      }
      setIsWhModalOpen(false);
      await loadStockData(editingWh ? editingWh.id : whId);
    } catch (err) {
      setWhFormError(err.message || 'Ошибка сохранения склада');
    } finally {
      setIsSavingWh(false);
    }
  };

  const handleDeleteWh = async (wh) => {
    if (isDemoMode) {
      showNotice('В ознакомительном демо-режиме удаление складов защищено.');
      return;
    }
    if (warehousesList.length <= 1) {
      showNotice('Нельзя удалить единственный склад в системе', 'error');
      return;
    }
    const itemsOnWh = stockList.filter(s => s.warehouseId === wh.id && s.quantity > 0).length;
    let msg = `Удалить склад «${wh.name}»?`;
    if (itemsOnWh > 0) {
      msg = `Внимание: на складе «${wh.name}» числится ${itemsOnWh} позиций с остатком. Вы уверены, что хотите удалить этот склад?`;
    }
    if (!window.confirm(msg)) return;

    try {
      await deleteWarehouse(wh.id);
      showNotice(`Склад «${wh.name}» удалён`);
      const remainingWhs = warehousesList.filter(w => w.id !== wh.id);
      setWarehousesList(remainingWhs);
      if (selectedWarehouseId === wh.id && remainingWhs.length > 0) {
        handleSelectWarehouse(remainingWhs[0].id);
      }
    } catch (err) {
      showNotice(err.message || 'Ошибка удаления склада', 'error');
    }
  };

  const handleDownloadAllWarehousesStock = async (mode = 'template') => {
    try {
      try {
        if (mode === 'template') {
          await downloadStockTemplate('all');
        } else {
          await exportStockToExcel('all');
        }
      } catch (e) {
        downloadStockTemplateExcel('all', catalogList, stockList, warehousesList);
      }
      showNotice(mode === 'template' 
        ? 'Файл шаблона для ВСЕХ складов (.xlsx) успешно скачан' 
        : 'Текущие остатки ВСЕХ складов экспортированы в Excel (.xlsx)'
      );
    } catch (err) {
      showNotice(err.message || 'Ошибка формирования файла Excel для всех складов', 'error');
    }
  };

  const handleDownloadStockTemplate = async (whId = excelSelectedWarehouseId) => {
    if (!whId) {
      showNotice('Пожалуйста, выберите склад для скачивания шаблона Режима А', 'error');
      return;
    }
    try {
      const activeWh = warehousesList.find(w => w.id === whId);
      if (!activeWh) {
        showNotice('Склад не найден в настройках', 'error');
        return;
      }
      try {
        await downloadStockTemplate(whId);
      } catch (e) {
        downloadStockTemplateExcel(activeWh, catalogList, stockList, warehousesList);
      }
      showNotice(`Шаблон остатков для склада «${activeWh.name}» скачан`);
    } catch (err) {
      showNotice(err.message || 'Ошибка загрузки шаблона', 'error');
    }
  };

  const handleExportStockExcel = async (whId = excelSelectedWarehouseId) => {
    if (!whId) {
      showNotice('Пожалуйста, выберите склад для экспорта остатков Режима А', 'error');
      return;
    }
    try {
      const activeWh = warehousesList.find(w => w.id === whId);
      if (!activeWh) {
        showNotice('Склад не найден в настройках', 'error');
        return;
      }
      try {
        await exportStockToExcel(whId);
      } catch (e) {
        downloadStockTemplateExcel(activeWh, catalogList, stockList, warehousesList);
      }
      showNotice(`Файл остатков для склада «${activeWh.name}» экспортирован`);
    } catch (err) {
      showNotice(err.message || 'Ошибка экспорта остатков', 'error');
    }
  };

  const handleStockFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (stockFileInputRef.current) stockFileInputRef.current.value = '';

    try {
      let result = null;
      try {
        result = await validateStockExcelFile(file, excelSelectedWarehouseId || selectedWarehouseId || 'all');
      } catch (apiErr) {
        const activeWh = warehousesList.find(w => w.id === (excelSelectedWarehouseId || selectedWarehouseId)) || null;
        result = await parseStockExcelClient(file, activeWh, catalogList, stockList, warehousesList);
      }

      if (result) {
        setStockExcelDiff(result);
        setStockExcelMode('partial');
        setStockExcelReplaceAgreed(false);
        setIsStockExcelModalOpen(true);
      }
    } catch (err) {
      showNotice(err.message || 'Ошибка проверки Excel-файла', 'error');
    }
  };

  const handleCommitStockExcel = async () => {
    if (isDemoMode) {
      showNotice('В ознакомительном демо-режиме изменение остатков через Excel защищено.');
      return;
    }
    if (!stockExcelDiff || !stockExcelDiff.diffList) return;
    if (stockExcelMode === 'replace' && !stockExcelReplaceAgreed) {
      showNotice('Для режима полной замены подтвердите согласие флажком', 'error');
      return;
    }

    setIsStockExcelConfirming(true);
    try {
      try {
        await commitStockExcelImport(selectedWarehouseId, stockExcelDiff.diffList, stockExcelMode);
      } catch (apiErr) {
        const newStockMap = new Map();
        stockList.forEach(s => newStockMap.set(s.sku, s.quantity));

        if (stockExcelMode === 'replace') {
          const updatedSkus = new Set(stockExcelDiff.diffList.map(d => d.sku));
          catalogList.forEach(p => {
            if (!updatedSkus.has(p.article)) {
              newStockMap.set(p.article, 0);
            }
          });
        }

        stockExcelDiff.diffList.forEach(d => {
          newStockMap.set(d.sku, d.newQuantity);
        });

        const updatedStockArray = [];
        newStockMap.forEach((qty, sku) => {
          updatedStockArray.push({
            warehouseId: selectedWarehouseId,
            sku,
            quantity: qty,
            updatedAt: new Date().toISOString(),
            updatedBy: 'admin (excel)'
          });
        });
        setStockList(updatedStockArray);
      }

      showNotice(`Остатки склада успешно обновлены из Excel (${stockExcelDiff.diffList.length} поз.)`);
      setIsStockExcelModalOpen(false);
      setStockExcelDiff(null);
      await loadStockData(selectedWarehouseId);
    } catch (err) {
      showNotice(err.message || 'Ошибка применения изменений', 'error');
    } finally {
      setIsStockExcelConfirming(false);
    }
  };

  // Заявки из корзины без регистрации и распределение территорий менеджеров
  const [orderInquiriesList, setOrderInquiriesList] = useState([]);
  const [territoryRulesList, setTerritoryRulesList] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isSavingTerritories, setIsSavingTerritories] = useState(false);
  const [orderFilterStatus, setOrderFilterStatus] = useState('all'); // 'all' | 'assigned' | 'pending_assignment'

  const loadOrdersAndTerritories = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const [rules, orders] = await Promise.all([
        fetchTerritoryRules(),
        fetchOrderInquiries().catch(() => [])
      ]);
      if (Array.isArray(rules)) setTerritoryRulesList(rules);
      if (Array.isArray(orders)) setOrderInquiriesList(orders);
    } catch (err) {
      console.error('Ошибка загрузки заявок и территорий:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && (activeTab === 'orders' || activeTab === 'dashboard')) {
      loadOrdersAndTerritories();
    }
  }, [isAuthenticated, activeTab, loadOrdersAndTerritories]);

  const handleAddTerritoryRule = () => {
    setTerritoryRulesList((prev) => [
      ...prev,
      {
        id: `terr_${Date.now()}`,
        territoryName: 'Новая территория',
        cities: [''],
        managerName: '',
        managerEmail: '',
        active: true
      }
    ]);
  };

  const handleUpdateTerritoryField = (ruleId, field, value) => {
    setTerritoryRulesList((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, [field]: value } : r))
    );
  };

  const handleRemoveTerritoryRule = (ruleId) => {
    setTerritoryRulesList((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const handleSaveTerritoryRules = async () => {
    if (isDemoMode) {
      showNotice('В ознакомительном режиме изменение правил территорий защищено.');
      return;
    }
    setIsSavingTerritories(true);
    try {
      const res = await saveTerritoryRules(territoryRulesList);
      if (res?.territories) setTerritoryRulesList(res.territories);
      showNotice('Правила «Территория → Ответственный менеджер → Email» успешно сохранены');
    } catch (err) {
      showNotice(err.message || 'Ошибка сохранения правил территорий', 'error');
    } finally {
      setIsSavingTerritories(false);
    }
  };

  const handleAssignOrderTerritory = async (inquiryNumber, territoryId) => {
    if (isDemoMode) {
      showNotice('В ознакомительном режиме изменение статуса заявки защищено.');
      return;
    }
    const token = getAuthToken();
    if (!token) {
      showNotice('Требуется авторизация администратора', 'error');
      return;
    }
    const rule = territoryRulesList.find((r) => r.id === territoryId);
    if (!rule) return;

    try {
      const res = await updateOrderInquiryInAdmin(inquiryNumber, {
        routing: {
          status: 'assigned',
          statusLabel: 'Назначен менеджер',
          territoryId: rule.id,
          territoryName: rule.territoryName,
          managerName: rule.managerName,
          managerEmail: rule.managerEmail
        }
      });
      if (res && res.order) {
        setOrderInquiriesList((prev) => prev.map((o) => (o.inquiryNumber === inquiryNumber ? res.order : o)));
      } else {
        await loadOrdersAndTerritories();
      }
      showNotice(`Заявка ${inquiryNumber} успешно закреплена за менеджером (${rule.managerEmail || rule.managerName})`);
    } catch (err) {
      showNotice(err.message || 'Ошибка обновления заявки', 'error');
    }
  };

  const handleDeleteOrderInquiry = async (inquiryNumber) => {
    if (isDemoMode) {
      showNotice('В ознакомительном режиме удаление заявки защищено.');
      return;
    }
    const token = getAuthToken();
    if (!token) {
      showNotice('Требуется авторизация администратора', 'error');
      return;
    }
    if (!window.confirm(`Вы уверены, что хотите удалить заявку ${inquiryNumber}? Это действие необратимо.`)) {
      return;
    }
    try {
      const res = await deleteOrderInquiryInAdmin(inquiryNumber);
      if (res && res.success !== false) {
        setOrderInquiriesList((prev) => prev.filter((o) => o.inquiryNumber !== inquiryNumber));
        showNotice(`Заявка ${inquiryNumber} успешно удалена`);
      } else {
        showNotice('Не удалось удалить заявку на сервере', 'error');
      }
    } catch (err) {
      showNotice(err.message || 'Ошибка удаления заявки', 'error');
    }
  };

  const pendingOrdersCount = orderInquiriesList.filter(
    (o) => o.routing?.status === 'pending_assignment'
  ).length;

  // Navigation Items (15 Sections)
  const navItems = [
    { id: 'dashboard', label: 'Обзор', icon: LayoutDashboard },
    {
      id: 'orders',
      label: 'Заявки',
      icon: Mail,
      count: orderInquiriesList.length || undefined,
      badge: pendingOrdersCount > 0 ? `Ожидают: ${pendingOrdersCount}` : null
    },
    { id: 'editor', label: 'Общие настройки', icon: Edit3, badge: draftContent?.hasUnpublishedChanges ? 'Черновик' : null },
    { id: 'pages', label: 'Страницы', icon: FileText },
    { id: 'catalog', label: 'Товары', icon: Package, count: catalogList.length },
    { id: 'stock', label: 'Склады', icon: Boxes },
    { id: 'buttons', label: 'Кнопки сайта', icon: Sliders },
    { id: 'categories', label: 'Категории', icon: FolderTree },
    { id: 'excel', label: 'Excel', icon: FileSpreadsheet },
    { id: 'media', label: 'Фотографии', icon: ImageIcon },
    { id: 'menu', label: 'Меню и футер', icon: Menu },
    { id: 'languages', label: 'Языки и переводы', icon: Languages },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'drafts', label: 'Публикации', icon: GitPullRequest, badge: draftContent?.hasUnpublishedChanges ? '●' : null },
    { id: 'history', label: 'История изменений', icon: History },
    { id: 'settings', label: 'Настройки', icon: Settings }
  ];

  // -------------------------------------------------------------
  // RENDER: 1. LOGIN SCREEN (Strictly Single Password Field)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="admin-login-screen">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-login-brand">
              <span className="admin-brand-title">LAUTE</span>
            </div>
            <div className="admin-login-badge">
              <Shield size={14} />
              <span>Безопасный доступ</span>
            </div>
            <h1 className="admin-login-title">
              {needsInitialSetup ? 'Первоначальная настройка' : 'Панель сотрудников'}
            </h1>
            <p className="admin-login-subtitle">
              {needsInitialSetup 
                ? 'Задайте постоянный пароль доступа для панели сотрудников LAUTE'
                : 'Для входа в систему введите пароль доступа к панели сотрудников'
              }
            </p>
          </div>

          {authError && (
            <div className="admin-login-alert error">
              <AlertTriangle size={16} />
              <span>{authError}</span>
            </div>
          )}

          {needsInitialSetup ? (
            <form onSubmit={handleInitialSetup} className="admin-login-form">
              <div className="form-group">
                <label>Новый мастер-пароль администратора:</label>
                <input
                  type="password"
                  value={initialPasswordInput}
                  onChange={(e) => setInitialPasswordInput(e.target.value)}
                  placeholder="Минимум 6 символов..."
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Повторите пароль:</label>
                <input
                  type="password"
                  value={initialPasswordConfirm}
                  onChange={(e) => setInitialPasswordConfirm(e.target.value)}
                  placeholder="Повторите ввод пароля..."
                  required
                />
              </div>

              <button
                type="submit"
                className="admin-btn admin-btn-primary admin-btn-full"
                disabled={isSubmittingAuth}
              >
                {isSubmittingAuth ? 'Сохранение...' : 'Задать пароль и войти'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="admin-login-form">
              <div className="form-group">
                <label htmlFor="admin-password-input">Пароль</label>
                <input
                  id="admin-password-input"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Введите пароль администратора..."
                  required
                  autoFocus
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="admin-btn admin-btn-primary admin-btn-full"
                disabled={isSubmittingAuth}
              >
                {isSubmittingAuth ? 'Проверка пароля...' : 'Войти'}
              </button>
            </form>
          )}

          <div className="admin-login-footer">
            <button
              type="button"
              className="admin-back-link"
              onClick={() => navigateTo('home')}
            >
              <ArrowLeft size={14} />
              <span>Вернуться на сайт LAUTE</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: 2. MAIN CMS DASHBOARD (13 SECTIONS)
  // -------------------------------------------------------------
  return (
    <div className="admin-layout">
      {/* Demo Mode Notice Banner */}
      {isDemoMode && (
        <div className="admin-demo-banner">
          <div className="admin-demo-banner-content">
            <Shield size={16} className="admin-demo-icon" />
            <div>
              <strong>Ознакомительный демонстрационный режим LAUTE:</strong>
              <span> открыт полный просмотр всех 13 разделов и интерфейса. Внесение реальных изменений защищено.</span>
            </div>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-xs admin-btn-outline"
            onClick={() => {
              setIsDemoMode(false);
              setIsAuthenticated(false);
              setAdminSession(null);
            }}
          >
            <Lock size={12} />
            <span>Выйти из демо-режима</span>
          </button>
        </div>
      )}

      {/* Top Application Bar */}
      <header className="admin-navbar">
        <div className="admin-navbar-left">
          <div className="admin-brand-cluster">
            <span className="admin-logo-text">LAUTE</span>
            <span className="admin-cms-badge">STUDIO / УПРАВЛЕНИЕ</span>
          </div>

          {lastContentSave && <span className="studio-save-confirmation" role="status">{lastContentSave}</span>}

          {draftContent?.hasUnpublishedChanges && (
            <div className="admin-draft-chip">
              <span className="draft-dot"></span>
              <span>Есть черновик ({draftContent.version || '1.0.0'})</span>
            </div>
          )}
        </div>

        <div className="admin-navbar-actions">
          {draftContent?.hasUnpublishedChanges && (
            <>
              <button 
                type="button" 
                className="admin-btn admin-btn-outline admin-btn-sm"
                onClick={handleSaveDraft}
                disabled={isSavingDraft || isPublishing}
                title="Сохранить черновик"
              >
                <Save size={14} />
                <span>{isSavingDraft ? 'Сохранение...' : 'Сохранить'}</span>
              </button>

              <button 
                type="button" 
                className="admin-btn admin-btn-success admin-btn-sm"
                onClick={handlePublish}
                disabled={isPublishing || isSavingDraft}
                title="Опубликовать изменения на сайте"
              >
                <Check size={14} />
                <span>{isPublishing ? 'Публикация...' : 'Опубликовать'}</span>
              </button>
            </>
          )}

          <button 
            type="button" 
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={handleReturnToSite}
            title="Вернуться на сайт"
          >
            <ArrowLeft size={14} />
            <span>Вернуться на сайт</span>
          </button>

          <button 
            type="button" 
            className="admin-btn admin-btn-danger admin-btn-sm"
            onClick={handleLogout}
            title="Завершить сессию"
          >
            <LogOut size={14} />
            <span>Выйти</span>
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar + Content Area */}
      <div className="admin-container">
        {/* Sidebar Navigation */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-menu">
            <label className="admin-nav-search">
              <Search size={15} />
              <input aria-label="Найти раздел" placeholder="Найти раздел…" value={navSearch} onChange={e => setNavSearch(e.target.value)} />
            </label>
            {[
              { label: 'Работа', ids: ['dashboard', 'pages', 'catalog', 'orders'] },
              { label: 'Каталог', ids: ['categories', 'media', 'excel', 'stock'] },
              { label: 'Настройки сайта', compact: true, ids: ['buttons', 'menu', 'languages', 'seo', 'drafts', 'editor'] },
              { label: 'Система', compact: true, ids: ['history', 'settings'] }
            ].map(group => {
              const items = group.ids.map(id => navItems.find(item => item.id === id)).filter(item => item && item.label.toLowerCase().includes(navSearch.toLowerCase()));
              if (!items.length) return null;
              const Group = group.compact ? 'details' : 'section';
              return <Group className="admin-nav-group" data-primary={group.label==='Работа' ? '' : undefined} key={group.label} aria-label={group.label} open={group.compact ? group.ids.includes(activeTab) || !!navSearch : undefined}>
                {group.compact ? <summary>{group.label}<ChevronDown size={13}/></summary> : <h2>{group.label}</h2>}
                {items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return <button key={item.id} type="button" onClick={() => setActiveTab(item.id)} className={'admin-nav-item ' + (isActive ? 'active' : '')} aria-current={isActive ? 'page' : undefined}>
                    <div className="admin-nav-item-left"><Icon size={17} className="nav-icon" /><span>{item.label}</span></div>
                    {item.badge && <span className="admin-nav-badge warning">{item.badge}</span>}
                    {item.count !== undefined && <span className="admin-nav-badge count">{item.count}</span>}
                  </button>;
                })}
              </Group>;
            })}
            <details className="studio-mobile-navigation"><summary>Ещё <ChevronDown size={14}/></summary><div>{navItems.filter(item=>!['dashboard','pages','catalog'].includes(item.id)).map(item=><button key={item.id} onClick={e=>{setActiveTab(item.id);e.currentTarget.closest('details').open=false;}}>{item.label}</button>)}</div></details>
            {!navItems.some(item => item.label.toLowerCase().includes(navSearch.toLowerCase())) && <p className="admin-nav-empty">Раздел не найден. Измени запрос.</p>}
          </div>

          <div className="admin-sidebar-footer">
            <div className="admin-session-box">
              <Shield size={14} className="session-shield" />
              <div className="session-info">
                <span className="session-title">Сессия активна</span>
                <span className="session-id">{'Доступ сотрудника'}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="admin-main-viewport">
          <div className="workspace-location"><span>LAUTE</span><ChevronRight size={13}/><strong>{navItems.find(item=>item.id===activeTab)?.label}</strong></div>
          {notice && (
            <div role={notice.type === 'error' ? 'alert' : 'status'} className={`admin-floating-notice ${notice.type}`}>
              {notice.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              <span>{notice.message}</span>
            </div>
          )}

          {activeTab === 'dashboard' && <div className="admin-view studio-overview">
            <header className="overview-header"><div><span className="studio-eyebrow">Рабочее пространство</span><h1>Что меняем сегодня?</h1></div><span className="overview-live"><span/>Сайт работает</span></header>
            <div className="overview-primary-grid">
              <button className="overview-primary-card site" onClick={()=>setActiveTab('pages')}><FileText size={28}/><span className="overview-card-meta">{pagesList.length} страниц</span><h2>Сайт</h2><p>Тексты, блоки и фотографии</p><span className="overview-card-cta">Редактировать страницы <ChevronRight size={17}/></span></button>
              <button className="overview-primary-card products" onClick={()=>setActiveTab('catalog')}><Package size={28}/><span className="overview-card-meta">{catalogList.length} товаров</span><h2>Каталог</h2><p>Товары, цены и наличие</p><span className="overview-card-cta">Открыть каталог <ChevronRight size={17}/></span></button>
            </div>
            <div className="overview-secondary-grid">{[{id:'orders',title:'Заявки',note:'Обращения клиентов',Icon:Mail},{id:'excel',title:'Excel',note:'Импорт и экспорт',Icon:FileSpreadsheet},{id:'media',title:'Фотографии',note:'Медиатека сайта',Icon:ImageIcon},{id:'categories',title:'Категории',note:'Структура каталога',Icon:FolderTree}].map(({id,title,note,Icon})=><button key={id} onClick={()=>setActiveTab(id)}><Icon size={22}/><span><strong>{title}</strong><small>{note}</small></span><ChevronRight size={16}/></button>)}</div>
            <div className="overview-status-row"><div><span className="studio-eyebrow">Публикация</span><strong>{draftContent?.hasUnpublishedChanges?'Есть сохранённый черновик':'Все изменения на сайте'}</strong></div><button className="admin-btn admin-btn-outline" onClick={()=>setActiveTab(draftContent?.hasUnpublishedChanges?'drafts':'history')}>{draftContent?.hasUnpublishedChanges?'Посмотреть черновик':'История изменений'}</button></div>
          </div>}

          {activeTab === 'buttons' && <ButtonSettings content={draftContent} onChange={setDraftContent} />}

          {/* TAB 2: РЕДАКТОР САЙТА (ВИЗУАЛЬНЫЙ РЕДАКТОР БЛОКОВ) */}
          {activeTab === 'editor' && (
            <div className="admin-view editor-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">Общие настройки сайта</h2>
                  <p className="view-subtitle">Редактирование текстов, заголовков, слайдов, фотографий и блоков всех страниц сайта</p>
                </div>
                <div className="header-actions"><span className="stat-tag">Сохранение и публикация — в верхней панели</span></div>
              </div>

              {/* Page Selection Row */}
              <div className="editor-page-selector">
                <span className="selector-label">Выберите страницу для редактирования:</span>
                <div className="selector-tabs">
                  {[
                    { id: 'home', title: 'Главная страница' },
                    { id: 'catalog', title: 'Каталог' },
                    { id: 'company', title: 'О компании' },
                    { id: 'partners', title: 'Партнёрам' },
                    { id: 'service', title: 'Сервис' },
                    { id: 'contacts', title: 'Контакты' },
                    { id: 'footer', title: 'Футер' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`selector-tab-btn ${selectedPageForEditor === p.id ? 'active' : ''}`}
                      onClick={() => setSelectedPageForEditor(p.id)}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tilda-style Visual Builder Banner in Editor */}
              <div style={{
                margin: '14px 0 20px',
                padding: '16px 20px',
                background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(170,130,10,0.06) 100%)',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: 'rgba(212,175,55,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D4AF37'
                  }}>
                    <Sliders size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 14, letterSpacing: '0.01em' }}>
                      Визуальный Tilda-конструктор блоков для страницы «{
                        selectedPageForEditor === 'home' ? 'Главная' :
                        selectedPageForEditor === 'contacts' ? 'Контакты' :
                        selectedPageForEditor === 'company' ? 'О компании' :
                        selectedPageForEditor === 'partners' ? 'Партнёрам' :
                        selectedPageForEditor === 'service' ? 'Сервис' :
                        selectedPageForEditor === 'catalog' ? 'Каталог' :
                        selectedPageForEditor
                      }»
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--adm-text-muted)', marginTop: 2 }}>
                      Добавляйте любые готовые блоки из библиотеки, перемещайте порядок, меняйте фото/текст прямо на холсте и управляйте версиями
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="admin-btn admin-btn-primary admin-btn-sm"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                    color: '#000000',
                    fontWeight: 700,
                    padding: '8px 18px',
                    boxShadow: '0 2px 10px rgba(212,175,55,0.3)'
                  }}
                  onClick={() => {
                    const matched = pagesList.find(p => p.id === selectedPageForEditor || p.slug === selectedPageForEditor);
                    if (matched) {
                      setBuilderEditingPage(matched);
                      setActiveTab('pages');
                    } else if (pagesList.length > 0) {
                      setBuilderEditingPage(pagesList[0]);
                      setActiveTab('pages');
                    } else {
                      setActiveTab('pages');
                    }
                  }}
                >
                  <Edit3 size={15} />
                  <span>Открыть в Конструкторе блоков</span>
                </button>
              </div>

              {/* EDITOR FOR HOME PAGE */}
              {selectedPageForEditor === 'home' && draftContent?.homeBlocks && (
                <div className="editor-blocks-container">
                  {/* 1. Hero Slider Editor */}
                  <div className="editor-section-card">
                    <div className="editor-card-header">
                      <div className="badge-tag">СЕКЦИЯ 1</div>
                      <h3>Главный экран: Полноэкранный слайдер (Hero Carousel)</h3>
                      <p>Управление слайдами, заголовками, порядком и фоновыми изображениями</p>
                    </div>

                    <div className="slides-editor-list">
                      {draftContent.homeBlocks.heroSlider?.map((slide, sIdx) => (
                        <div key={slide.id || sIdx} className="slide-editor-item">
                          <div className="slide-item-header">
                            <div className="slide-item-actions">
                              <span className="slide-num">Слайд #{sIdx + 1}</span>
                              <button
                                type="button"
                                className="admin-btn admin-btn-ghost admin-btn-xs"
                                onClick={() => moveSlide(sIdx, -1)}
                                disabled={sIdx === 0}
                                title="Переместить слайд выше"
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button
                                type="button"
                                className="admin-btn admin-btn-ghost admin-btn-xs"
                                onClick={() => moveSlide(sIdx, 1)}
                                disabled={sIdx === (draftContent.homeBlocks.heroSlider.length - 1)}
                                title="Переместить слайд ниже"
                              >
                                <ArrowDown size={13} />
                              </button>
                            </div>

                            <div className="slide-toggles" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={slide.isVisible !== false}
                                  onChange={(e) => {
                                    const updated = [...draftContent.homeBlocks.heroSlider];
                                    updated[sIdx].isVisible = e.target.checked;
                                    setDraftContent({
                                      ...draftContent,
                                      hasUnpublishedChanges: true,
                                      homeBlocks: { ...draftContent.homeBlocks, heroSlider: updated }
                                    });
                                  }}
                                />
                                <span>Видимый на сайте</span>
                              </label>

                              {draftContent.homeBlocks.heroSlider.length > 1 && (
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-ghost admin-btn-xs danger"
                                  title="Удалить слайд"
                                  onClick={() => {
                                    if (window.confirm(`Удалить слайд #${sIdx + 1}?`)) {
                                      const updated = draftContent.homeBlocks.heroSlider.filter((_, i) => i !== sIdx);
                                      updated.forEach((s, idx) => { s.order = idx + 1; });
                                      setDraftContent({
                                        ...draftContent,
                                        hasUnpublishedChanges: true,
                                        homeBlocks: { ...draftContent.homeBlocks, heroSlider: updated }
                                      });
                                    }
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="slide-fields-grid">
                            <div className="form-group">
                              <label>Теглайн / Подпись:</label>
                              <input
                                type="text"
                                value={slide.tagline || ''}
                                onChange={(e) => {
                                  const updated = [...draftContent.homeBlocks.heroSlider];
                                  updated[sIdx].tagline = e.target.value;
                                  setDraftContent({
                                    ...draftContent,
                                    hasUnpublishedChanges: true,
                                    homeBlocks: { ...draftContent.homeBlocks, heroSlider: updated }
                                  });
                                }}
                              />
                            </div>

                            <div className="form-group">
                              <label>Главный заголовок слайда:</label>
                              <input
                                type="text"
                                value={slide.title || ''}
                                onChange={(e) => {
                                  const updated = [...draftContent.homeBlocks.heroSlider];
                                  updated[sIdx].title = e.target.value;
                                  setDraftContent({
                                    ...draftContent,
                                    hasUnpublishedChanges: true,
                                    homeBlocks: { ...draftContent.homeBlocks, heroSlider: updated }
                                  });
                                }}
                              />
                            </div>

                            <div className="form-group">
                              <label>Текст кнопки:</label>
                              <input
                                type="text"
                                value={slide.buttonText || ''}
                                onChange={(e) => {
                                  const updated = [...draftContent.homeBlocks.heroSlider];
                                  updated[sIdx].buttonText = e.target.value;
                                  setDraftContent({
                                    ...draftContent,
                                    hasUnpublishedChanges: true,
                                    homeBlocks: { ...draftContent.homeBlocks, heroSlider: updated }
                                  });
                                }}
                              />
                            </div>

                            <ImageFieldEditor
                              label="Фоновое изображение слайда:"
                              value={slide.image || ''}
                              onChange={(url) => {
                                const updated = [...draftContent.homeBlocks.heroSlider];
                                updated[sIdx].image = url;
                                setDraftContent({
                                  ...draftContent,
                                  hasUnpublishedChanges: true,
                                  homeBlocks: { ...draftContent.homeBlocks, heroSlider: updated }
                                });
                              }}
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        className="admin-btn admin-btn-outline admin-btn-sm"
                        style={{ marginTop: 14 }}
                        onClick={() => {
                          const currentSlides = draftContent.homeBlocks?.heroSlider || [];
                          const newSlide = {
                            id: `slide-${Date.now()}`,
                            order: currentSlides.length + 1,
                            tagline: 'LAUTE®',
                            title: 'Новый заголовок слайда',
                            subtitle: '',
                            buttonText: 'Каталог',
                            buttonLink: 'catalog',
                            image: 'images/hero/hero-slide-1.jpg',
                            isVisible: true
                          };
                          setDraftContent({
                            ...draftContent,
                            hasUnpublishedChanges: true,
                            homeBlocks: {
                              ...draftContent.homeBlocks,
                              heroSlider: [...currentSlides, newSlide]
                            }
                          });
                        }}
                      >
                        <Plus size={14} />
                        <span>Добавить новый слайд</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Materials & Technologies Editor */}
                  <div className="editor-section-card">
                    <div className="editor-card-header">
                      <div className="badge-tag">СЕКЦИЯ 2</div>
                      <h3>Технологии & Материалы LAUTE</h3>
                      <p>Управление текстами об инженерных стандартах (Sedal, латунь, SUS304, PVD)</p>
                    </div>

                    <div className="editor-fields-row">
                      <div className="form-group">
                        <label>Бейдж секции:</label>
                        <input
                          type="text"
                          value={draftContent.homeBlocks.materials?.badge || ''}
                          onChange={(e) => {
                            setDraftContent({
                              ...draftContent,
                              hasUnpublishedChanges: true,
                              homeBlocks: {
                                ...draftContent.homeBlocks,
                                materials: { ...draftContent.homeBlocks.materials, badge: e.target.value }
                              }
                            });
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label>Заголовок секции:</label>
                        <input
                          type="text"
                          value={draftContent.homeBlocks.materials?.title || ''}
                          onChange={(e) => {
                            setDraftContent({
                              ...draftContent,
                              hasUnpublishedChanges: true,
                              homeBlocks: {
                                ...draftContent.homeBlocks,
                                materials: { ...draftContent.homeBlocks.materials, title: e.target.value }
                              }
                            });
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Описание секции:</label>
                      <textarea
                        rows={2}
                        value={draftContent.homeBlocks.materials?.desc || ''}
                        onChange={(e) => {
                          setDraftContent({
                            ...draftContent,
                            hasUnpublishedChanges: true,
                            homeBlocks: {
                              ...draftContent.homeBlocks,
                              materials: { ...draftContent.homeBlocks.materials, desc: e.target.value }
                            }
                          });
                        }}
                      />
                    </div>
                  </div>

                  {/* 3. B2B Partnership Banner */}
                  <div className="editor-section-card">
                    <div className="editor-card-header">
                      <div className="badge-tag">СЕКЦИЯ 3</div>
                      <h3>Партнёрский блок (B2B)</h3>
                      <p>Тексты блока прямого оптового сотрудничества с заводом LAUTE</p>
                    </div>

                    <div className="form-group">
                      <label>Заголовок:</label>
                      <input
                        type="text"
                        value={draftContent.homeBlocks.partnershipBanner?.title || ''}
                        onChange={(e) => {
                          setDraftContent({
                            ...draftContent,
                            hasUnpublishedChanges: true,
                            homeBlocks: {
                              ...draftContent.homeBlocks,
                              partnershipBanner: { ...draftContent.homeBlocks.partnershipBanner, title: e.target.value }
                            }
                          });
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Описание:</label>
                      <textarea
                        rows={2}
                        value={draftContent.homeBlocks.partnershipBanner?.desc || ''}
                        onChange={(e) => {
                          setDraftContent({
                            ...draftContent,
                            hasUnpublishedChanges: true,
                            homeBlocks: {
                              ...draftContent.homeBlocks,
                              partnershipBanner: { ...draftContent.homeBlocks.partnershipBanner, desc: e.target.value }
                            }
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* EDITOR FOR CONTACTS & FOOTER */}
              {(selectedPageForEditor === 'contacts' || selectedPageForEditor === 'footer') && draftContent?.footer && (
                <div className="editor-blocks-container">
                  <div className="editor-section-card">
                    <div className="editor-card-header">
                      <h3>Контакты и информация в футере</h3>
                      <p>Редактирование адресов, номеров телефонов и электронной почты</p>
                    </div>

                    <div className="form-group">
                      <label>Описание бренда в футере:</label>
                      <textarea
                        rows={2}
                        value={draftContent.footer.brandDescription || ''}
                        onChange={(e) => {
                          setDraftContent({
                            ...draftContent,
                            hasUnpublishedChanges: true,
                            footer: { ...draftContent.footer, brandDescription: e.target.value }
                          });
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Адрес представительства:</label>
                      <input
                        type="text"
                        value={draftContent.footer.officeAddress || ''}
                        onChange={(e) => {
                          setDraftContent({
                            ...draftContent,
                            hasUnpublishedChanges: true,
                            footer: { ...draftContent.footer, officeAddress: e.target.value }
                          });
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Электронная почта отдела продаж:</label>
                      <input
                        type="text"
                        value={draftContent.footer.emails?.[0]?.email || ''}
                        onChange={(e) => {
                          const emails = [...(draftContent.footer.emails || [{ label: 'Отдел продаж', email: '' }])];
                          emails[0].email = e.target.value;
                          setDraftContent({
                            ...draftContent,
                            hasUnpublishedChanges: true,
                            footer: { ...draftContent.footer, emails }
                          });
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Телефон отдела продаж 1:</label>
                      <input
                        type="text"
                        value={draftContent.footer.phones?.[0]?.number || ''}
                        onChange={(e) => {
                          const phones = [...(draftContent.footer.phones || [{ number: '', tel: '' }])];
                          phones[0] = { ...phones[0], number: e.target.value, tel: e.target.value.replace(/[^0-9+]/g, '') };
                          setDraftContent({
                            ...draftContent,
                            hasUnpublishedChanges: true,
                            footer: { ...draftContent.footer, phones }
                          });
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Телефон отдела продаж 2:</label>
                      <input
                        type="text"
                        value={draftContent.footer.phones?.[1]?.number || ''}
                        onChange={(e) => {
                          const phones = [...(draftContent.footer.phones || [])];
                          if (!phones[1]) phones.push({ number: '', tel: '' });
                          phones[1].number = e.target.value;
                          setDraftContent({
                            ...draftContent,
                            hasUnpublishedChanges: true,
                            footer: { ...draftContent.footer, phones }
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* EDITOR FOR OTHER PAGES */}
              {selectedPageForEditor !== 'home' && selectedPageForEditor !== 'contacts' && selectedPageForEditor !== 'footer' && (
                <div className="editor-blocks-container">
                  <div className="editor-section-card">
                    <div className="editor-card-header">
                      <h3>Раздел «{selectedPageForEditor.toUpperCase()}»</h3>
                      <p>Редактирование информационного содержимого и текстов раздела</p>
                    </div>

                    <div className="form-group">
                      <label>Заголовок раздела (H1):</label>
                      <input
                        type="text"
                        value={draftContent?.seo?.pages?.[selectedPageForEditor]?.h1 || ''}
                        onChange={(e) => {
                          const pages = { ...(draftContent?.seo?.pages || {}) };
                          if (!pages[selectedPageForEditor]) pages[selectedPageForEditor] = {};
                          pages[selectedPageForEditor].h1 = e.target.value;
                          setDraftContent({
                            ...draftContent,
                            hasUnpublishedChanges: true,
                            seo: { ...draftContent.seo, pages }
                          });
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Краткое описание раздела:</label>
                      <textarea
                        rows={3}
                        value={draftContent?.seo?.pages?.[selectedPageForEditor]?.description || ''}
                        onChange={(e) => {
                          const pages = { ...(draftContent?.seo?.pages || {}) };
                          if (!pages[selectedPageForEditor]) pages[selectedPageForEditor] = {};
                          pages[selectedPageForEditor].description = e.target.value;
                          setDraftContent({
                            ...draftContent,
                            hasUnpublishedChanges: true,
                            seo: { ...draftContent.seo, pages }
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: СТРАНИЦЫ И ВИЗУАЛЬНЫЙ КОНСТРУКТОР */}
          {activeTab === 'pages' && (
            builderEditingPage ? (
              <VisualPageBuilder
                page={builderEditingPage}
                allPages={pagesList}
                onBack={() => {
                  setBuilderEditingPage(null);
                  loadPagesData();
                }}
                onSaveSuccess={(updated) => {
                  setPagesList(prev => prev.map(p => p.id === updated.id ? updated : p));
                  loadPagesData();
                }}
                showNotice={showNotice}
              />
            ) : (
              <div className="admin-view pages-view">
                <div className="view-header">
                  <div>
                    <h2 className="view-title">Страницы</h2>
                    <p className="view-subtitle">
                      Выбери страницу для редактирования.
                    </p>
                  </div>
                  <div className="header-actions">
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-primary admin-btn-sm"
                      onClick={() => {
                        setNewPageForm({
                          title: '',
                          slug: '',
                          description: '',
                          template: 'hero_text'
                        });
                        setIsCreatePageModalOpen(true);
                      }}
                      style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)', color: '#000', fontWeight: 700 }}
                    >
                      <Plus size={15} />
                      <span>+ Создать страницу</span>
                    </button>
                  </div>
                </div>

                {/* Search & Quick Filters Bar */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-muted)' }} />
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Поиск страницы по названию или URL..."
                      value={pagesSearchQuery}
                      onChange={e => setPagesSearchQuery(e.target.value)}
                      style={{ width: '100%', paddingLeft: 32, fontSize: 13 }}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--adm-text-muted)' }}>
                    Всего страниц: <strong>{pagesList.length}</strong>
                  </span>
                </div>

                <div className="studio-page-grid">{pagesList.filter(p=>!pagesSearchQuery||(p.title+' '+p.slug).toLowerCase().includes(pagesSearchQuery.toLowerCase())).map((p,index)=><article className="studio-page-card" key={p.id}>
                  <button className="studio-page-cover" onClick={()=>setBuilderEditingPage(p)} aria-label={'Редактировать: '+p.title}><span className="page-cover-number">{String(index+1).padStart(2,'0')}</span><div className="page-cover-lines"><i/><i/><div><i/><i/><i/></div></div><span className="page-cover-edit"><Edit3 size={16}/>Редактировать</span></button>
                  <div className="studio-page-info"><div><h3>{p.title}</h3><small>/{p.slug==='home'?'':p.slug}</small></div><span className={'stat-tag '+(p.status==='ЧЕРНОВИК'?'warning':'success')}>{p.status==='ЧЕРНОВИК'?'Черновик':'На сайте'}</span></div>
                  <div className="studio-page-bottom"><span>{getEditableBlocks(p).length} блоков</span><details className="page-card-more"><summary aria-label={'Действия: '+p.title}>•••</summary><div><button onClick={()=>navigateTo(p.slug==='home'?'home':p.slug)}>Открыть на сайте</button><button disabled={isDemoMode} onClick={async()=>{try{await duplicateCustomPage(p.id);await loadPagesData();}catch(err){showNotice(err.message,'error');}}}>Создать копию</button>{!p.isSystem&&<button disabled={isDemoMode} onClick={async()=>{if(!window.confirm('Удалить страницу «'+p.title+'»?'))return;try{await deleteCustomPage(p.id);await loadPagesData();}catch(err){showNotice(err.message,'error');}}}>Удалить</button>}</div></details></div>
                </article>)}</div>

                {/* Create Page Modal */}
                {isCreatePageModalOpen && (
                  <div className="admin-modal-overlay" onClick={() => setIsCreatePageModalOpen(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
                      <div className="admin-modal-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Plus size={18} style={{ color: '#D4AF37' }} />
                          <h3>Создание новой страницы</h3>
                        </div>
                        <button type="button" className="close-btn" onClick={() => setIsCreatePageModalOpen(false)}>
                          <X size={18} />
                        </button>
                      </div>

                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!newPageForm.title || !newPageForm.slug) {
                            showNotice('Укажите название и URL slug страницы', 'error');
                            return;
                          }
                          const cleanSlug = newPageForm.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

                          let initialBlocks = [];
                          const now = Date.now();
                          if (newPageForm.template === 'hero_text') {
                            initialBlocks = [
                              {
                                id: `blk-${now}-1`,
                                type: 'hero',
                                badge: 'LAUTE',
                                title: newPageForm.title,
                                subtitle: newPageForm.description || '',
                                buttonText: 'Подробнее',
                                buttonLink: '#',
                                buttonType: 'primary',
                                style: { background: 'dark', alignment: 'center', padding: 'lg' }
                              },
                              {
                                id: `blk-${now}-2`,
                                type: 'text',
                                title: 'О разделе',
                                content: 'Содержимое новой страницы. Настройте этот блок в визуальном конструкторе.',
                                style: { background: 'card', alignment: 'left', padding: 'md' }
                              }
                            ];
                          } else if (newPageForm.template === 'presentation') {
                            initialBlocks = [
                              {
                                id: `blk-${now}-1`,
                                type: 'hero',
                                badge: 'ПРЕЗЕНТАЦИЯ',
                                title: newPageForm.title,
                                subtitle: newPageForm.description || '',
                                buttonText: 'Оставить заявку',
                                buttonLink: '#lead-form',
                                buttonType: 'gold',
                                style: { background: 'dark', alignment: 'center', padding: 'lg' }
                              },
                              {
                                id: `blk-${now}-2`,
                                type: 'features',
                                badge: 'ПРЕИМУЩЕСТВА',
                                title: 'Ключевые особенности',
                                items: [
                                  { title: 'Пункт 1', desc: 'Описание первого преимущества' },
                                  { title: 'Пункт 2', desc: 'Описание второго преимущества' },
                                  { title: 'Пункт 3', desc: 'Описание третьего преимущества' }
                                ],
                                style: { background: 'card', alignment: 'left', padding: 'md' }
                              },
                              {
                                id: `blk-${now}-3`,
                                type: 'form_lead',
                                title: 'Оставить заявку',
                                subtitle: 'Заполните форму для оперативной связи',
                                formType: 'contact',
                                style: { background: 'dark', alignment: 'center', padding: 'lg' }
                              }
                            ];
                          } else if (newPageForm.template === 'contacts') {
                            initialBlocks = [
                              {
                                id: `blk-${now}-1`,
                                type: 'hero',
                                badge: 'КОНТАКТЫ',
                                title: newPageForm.title,
                                subtitle: newPageForm.description || '',
                                style: { background: 'dark', alignment: 'center', padding: 'md' }
                              },
                              {
                                id: `blk-${now}-2`,
                                type: 'contact_cards',
                                badge: 'ОФИСЫ',
                                title: 'Наши филиалы',
                                items: [
                                  { title: 'Центральный офис', city: 'Новосибирск', address: 'ул. Блюхера, 71', phone: '+7 (983) 310-56-26', email: 'nsk@laute.ltd' }
                                ],
                                style: { background: 'card', alignment: 'left', padding: 'lg' }
                              }
                            ];
                          }

                          try {
                            const created = await createCustomPage({
                              title: newPageForm.title,
                              slug: cleanSlug,
                              route: `/${cleanSlug}`,
                              description: newPageForm.description,
                              blocks: initialBlocks,
                              status: 'ЧЕРНОВИК'
                            });
                            setIsCreatePageModalOpen(false);
                            setNewPageForm({ title: '', slug: '', description: '', template: 'hero_text' });
                            await loadPagesData();
                            showNotice(`Страница "${created.title}" успешно создана!`);
                            setBuilderEditingPage(created);
                          } catch (err) {
                            showNotice(err.message || 'Ошибка создания страницы', 'error');
                          }
                        }}
                      >
                        <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          <div>
                            <label className="field-label required">Название страницы:</label>
                            <input
                              type="text"
                              required
                              className="admin-input"
                              placeholder="Например: Наши технологии"
                              value={newPageForm.title}
                              onChange={e => {
                                const title = e.target.value;
                                const autoSlug = title
                                  .toLowerCase()
                                  .replace(/[а-яё]/g, char => {
                                    const map = {
                                      'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh',
                                      'з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o',
                                      'п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts',
                                      'ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'
                                    };
                                    return map[char] || char;
                                  })
                                  .replace(/[^a-z0-9_-]/g, '-')
                                  .replace(/-+/g, '-');
                                setNewPageForm(prev => ({
                                  ...prev,
                                  title,
                                  slug: prev.slug === '' || prev.slug === autoSlug.slice(0, -1) ? autoSlug : prev.slug
                                }));
                              }}
                              style={{ width: '100%' }}
                            />
                          </div>

                          <div>
                            <label className="field-label required">URL slug (адрес страницы):</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ color: 'var(--adm-text-muted)', fontSize: 13 }}>https://laute.ltd/</span>
                              <input
                                type="text"
                                required
                                className="admin-input"
                                placeholder="technologies"
                                value={newPageForm.slug}
                                onChange={e => setNewPageForm({ ...newPageForm, slug: e.target.value })}
                                style={{ flex: 1 }}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="field-label">Краткое описание (SEO Description):</label>
                            <textarea
                              rows={2}
                              className="admin-input"
                              placeholder="Описание страницы для поисковых систем"
                              value={newPageForm.description}
                              onChange={e => setNewPageForm({ ...newPageForm, description: e.target.value })}
                              style={{ width: '100%', resize: 'vertical' }}
                            />
                          </div>

                          <div>
                            <label className="field-label">Стартовый шаблон страницы:</label>
                            <select
                              className="admin-select"
                              value={newPageForm.template}
                              onChange={e => setNewPageForm({ ...newPageForm, template: e.target.value })}
                              style={{ width: '100%' }}
                            >
                              <option value="hero_text">Стандартный: Hero-баннер + Текстовый блок</option>
                              <option value="presentation">Презентация: Hero + Преимущества + Форма заявки</option>
                              <option value="contacts">Контакты: Hero + Карточки филиалов + Обратная связь</option>
                              <option value="empty">Пустая страница (начать с чистого листа)</option>
                            </select>
                          </div>
                        </div>

                        <div className="admin-modal-footer">
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            onClick={() => setIsCreatePageModalOpen(false)}
                          >
                            Отмена
                          </button>
                          <button
                            type="submit"
                            className="admin-btn admin-btn-primary admin-btn-sm"
                            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)', color: '#000', fontWeight: 700 }}
                          >
                            <Plus size={14} />
                            <span>Создать и открыть в конструкторе</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* TAB 4: КАТАЛОГ */}
          {activeTab === 'catalog' && (
            <div className="admin-view catalog-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">Товары</h2>
                  <p className="view-subtitle">Управление позициями номенклатуры, ценами, описаниями, фотографиями и статусами</p>
                </div>
                <div className="header-actions">
                  {selectedCatalogSkus.size > 0 && (
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      onClick={handleBatchDeleteProducts}
                      disabled={isBatchDeletingProducts}
                      style={{ background: '#EF4444', color: '#fff', border: 'none' }}
                      title={`Удалить ${selectedCatalogSkus.size} выбранных товаров`}
                    >
                      <Trash2 size={14} />
                      <span>{isBatchDeletingProducts ? 'Удаление...' : `Удалить выбранные (${selectedCatalogSkus.size})`}</span>
                    </button>
                  )}
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-primary admin-btn-sm"
                    onClick={() => setIsAddingNewProduct(true)}
                  >
                    <Plus size={14} />
                    <span>Добавить товар</span>
                  </button>
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    onClick={() => setActiveTab('excel')}
                  >
                    <FileSpreadsheet size={14} />
                    <span>Excel</span>
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="admin-filters-bar">
                <div className="search-box">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Поиск по названию или артикулу SKU..."
                  />
                  {productSearch && (
                    <button type="button" onClick={() => setProductSearch('')} className="clear-btn">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="filter-select-group">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="Все">Все категории ({catalogList.length})</option>
                    {categoriesList.map((c) => (
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="all">Все статусы</option>
                    <option value="active">Только активные</option>
                    <option value="hidden">Только скрытые</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="admin-table-wrapper">
                {(() => {
                  const filtered = catalogList.filter((p) => {
                    const matchSearch = !productSearch || 
                      p.article?.toLowerCase().includes(productSearch.toLowerCase()) ||
                      p.name?.toLowerCase().includes(productSearch.toLowerCase());
                    const matchCat = categoryFilter === 'Все' || p.category === categoryFilter;
                    const matchStatus = statusFilter === 'all' || 
                      (statusFilter === 'active' && p.status !== 'СКРЫТ') ||
                      (statusFilter === 'hidden' && p.status === 'СКРЫТ');
                    return matchSearch && matchCat && matchStatus;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="admin-empty-state">
                        <Search size={36} className="empty-icon" />
                        <h3>Ничего не найдено</h3>
                        <p>По вашему запросу {productSearch ? `«${productSearch}»` : ''} товары в каталоге не найдены.</p>
                        <button 
                          type="button" 
                          className="admin-btn admin-btn-outline admin-btn-sm"
                          onClick={() => {
                            setProductSearch('');
                            setCategoryFilter('Все');
                            setStatusFilter('all');
                          }}
                        >
                          Сбросить фильтры поиска
                        </button>
                      </div>
                    );
                  }

                  return (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th style={{ width: 40, textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={filtered.length > 0 && filtered.every(p => selectedCatalogSkus.has(p.article))}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCatalogSkus(new Set(filtered.map(p => p.article)));
                                } else {
                                  setSelectedCatalogSkus(new Set());
                                }
                              }}
                              title="Выбрать все товары на экране"
                              style={{ cursor: 'pointer', width: 16, height: 16 }}
                            />
                          </th>
                          <th style={{ width: 60 }}>Фото</th>
                          <th>Артикул</th>
                          <th>Название товара</th>
                          <th>Категория</th>
                          <th>Цена</th>
                          <th>Статус</th>
                          <th style={{ width: 170 }}>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((prod) => {
                          const isHidden = prod.status === 'СКРЫТ';
                          const thumbSrc = prod.photo1 ? resolveMediaUrl(prod.photo1) : '';
                          const isInline = inlineEditingArticle === prod.article;

                          return (
                            <tr key={prod.article} className={isHidden ? 'row-muted' : (isInline ? 'row-editing' : '')}>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={selectedCatalogSkus.has(prod.article)}
                                  onChange={(e) => {
                                    const next = new Set(selectedCatalogSkus);
                                    if (e.target.checked) {
                                      next.add(prod.article);
                                    } else {
                                      next.delete(prod.article);
                                    }
                                    setSelectedCatalogSkus(next);
                                  }}
                                  style={{ cursor: 'pointer', width: 16, height: 16 }}
                                />
                              </td>
                              <td>
                                <div className="table-thumb-frame">
                                  {prod.photo1 ? (
                                    <img 
                                      src={thumbSrc} 
                                      alt={prod.name} 
                                      className="table-thumb" 
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  ) : (
                                    <ImageIcon size={18} className="cell-muted" />
                                  )}
                                </div>
                              </td>
                              <td><code>{prod.article}</code></td>
                              <td>
                                {isInline ? (
                                  <input
                                    type="text"
                                    className="inline-edit-input"
                                    value={inlineEditData.name}
                                    onChange={(e) => setInlineEditData({ ...inlineEditData, name: e.target.value })}
                                    placeholder="Название товара"
                                    autoFocus
                                  />
                                ) : (
                                  <div className="prod-title-wrap">
                                    <strong>{prod.name}</strong>
                                    <span className="prod-sub">{prod.collection || 'LAUTE Master'}</span>
                                  </div>
                                )}
                              </td>
                              <td>
                                {isInline ? (
                                  <select
                                    className="inline-edit-select"
                                    value={inlineEditData.category}
                                    onChange={(e) => setInlineEditData({ ...inlineEditData, category: e.target.value })}
                                  >
                                    {categoriesList.map((c) => (
                                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                                    ))}
                                  </select>
                                ) : (
                                  prod.category
                                )}
                              </td>
                              <td>
                                {isInline ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <input
                                      type="number"
                                      min="0"
                                      step="100"
                                      className="inline-edit-input"
                                      style={{ width: 90 }}
                                      value={inlineEditData.price}
                                      onChange={(e) => setInlineEditData({ ...inlineEditData, price: e.target.value })}
                                    />
                                    <span className="currency-label">{prod.currency || '₸'}</span>
                                  </div>
                                ) : (
                                  <span className="price-tag" title="Нажмите «Быстрое редактирование» для изменения цены">
                                    {Number(prod.price).toLocaleString('ru-RU')} {prod.currency || '₸'}
                                  </span>
                                )}
                              </td>
                              <td>
                                {isInline ? (
                                  <select
                                    className="inline-edit-select"
                                    value={inlineEditData.status}
                                    onChange={(e) => setInlineEditData({ ...inlineEditData, status: e.target.value })}
                                  >
                                    <option value="АКТИВЕН">Активен</option>
                                    <option value="СКРЫТ">Скрыт</option>
                                  </select>
                                ) : (
                                  <span className={`stat-tag ${isHidden ? 'warning' : 'success'}`}>
                                    {isHidden ? 'Скрыт' : 'Активен'}
                                  </span>
                                )}
                              </td>
                              <td>
                                {isInline ? (
                                  <div className="inline-action-btns">
                                    <button
                                      type="button"
                                      className="inline-save-btn"
                                      onClick={() => handleSaveInlineEdit(prod.article)}
                                      disabled={isInlineSaving}
                                      title="Сохранить изменения"
                                    >
                                      <Check size={13} />
                                      <span>OK</span>
                                    </button>
                                    <button
                                      type="button"
                                      className="inline-cancel-btn"
                                      onClick={handleCancelInlineEdit}
                                      title="Отменить редактирование"
                                    >
                                      <X size={13} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="actions-cell studio-catalog-actions">
                                    <button type="button" className="admin-btn admin-btn-outline admin-btn-xs" onClick={()=>{setProductModalTab('main');setEditingProduct({...prod});}}>Изменить</button>
                                    <details className="catalog-actions-menu"><summary aria-label={'Действия: '+prod.article}>•••</summary><div>
                                      <button onClick={()=>handleStartInlineEdit(prod)}>Быстрое изменение</button>
                                      <button disabled={isDemoMode} onClick={async()=>{try{await toggleProductStatus(prod.article,isHidden?'АКТИВЕН':'СКРЫТ');await loadCatalogData();showNotice('Статус товара сохранён');}catch(err){showNotice(err.message,'error');}}}>{isHidden?'Показать на сайте':'Скрыть с сайта'}</button>
                                      <button disabled={isDemoMode} onClick={async()=>{if(!window.confirm('Удалить товар '+prod.article+'?'))return;try{await deleteProduct(prod.article);setSelectedCatalogSkus(prev=>{const next=new Set(prev);next.delete(prod.article);return next;});await loadCatalogData();showNotice('Товар удалён');}catch(err){showNotice(err.message,'error');}}}>Удалить товар</button>
                                    </div></details>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB: СКЛАДСКИЕ ОСТАТКИ (ПОЛНАЯ МАТРИЦА ВСЕХ СКЛАДОВ + НАСТРОЙКА СКЛАДОВ) */}
          {activeTab === 'stock' && (
            <div className="admin-view stock-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">Склады</h2>
                  <p className="view-subtitle">
                    Единая складская система: матрица остатков филиалов (Алматы, Новосибирск, Москва, Китай), быстрое редактирование ячеек, массовые операции и Excel-синхронизация
                  </p>
                </div>
                <div className="header-actions">
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-primary admin-btn-sm"
                    onClick={() => handleDownloadAllWarehousesStock('template')}
                    title="Скачать официальный Excel-шаблон остатков сразу для всех складов компании"
                  >
                    <Download size={14} />
                    <span>Скачать Excel для всех складов</span>
                  </button>

                  <button 
                    type="button" 
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    onClick={() => handleOpenWhModal(null)}
                    title="Добавить новый логистический склад"
                  >
                    <Plus size={14} />
                    <span>Добавить склад</span>
                  </button>

                  {/* Excel Download Dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-outline admin-btn-sm"
                      onClick={() => setStockExcelDownloadMenuOpen(!stockExcelDownloadMenuOpen)}
                      title="Экспорт и шаблоны Excel"
                    >
                      <Download size={14} />
                      <span>Excel экспорт / шаблоны</span>
                      <ChevronDown size={13} />
                    </button>

                    {stockExcelDownloadMenuOpen && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: 6,
                          background: 'var(--adm-surface-card)',
                          border: '1px solid var(--adm-border)',
                          borderRadius: 10,
                          boxShadow: 'var(--adm-shadow-lg)',
                          zIndex: 100,
                          minWidth: 320,
                          padding: 12
                        }}
                      >
                        {/* MODE B */}
                        <div style={{ padding: '4px 6px 6px', fontSize: 11, fontWeight: 700, color: 'var(--adm-accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Режим B — Все склады (Матрица)
                        </div>
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost admin-btn-xs"
                          style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', marginBottom: 4 }}
                          onClick={async () => {
                            setStockExcelDownloadMenuOpen(false);
                            await handleDownloadAllWarehousesStock('template');
                          }}
                        >
                          <Download size={13} />
                          <span>Скачать шаблон (Матрица всех складов)</span>
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost admin-btn-xs"
                          style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', marginBottom: 10 }}
                          onClick={async () => {
                            setStockExcelDownloadMenuOpen(false);
                            await handleDownloadAllWarehousesStock('export');
                          }}
                        >
                          <FileSpreadsheet size={13} />
                          <span>Экспорт остатков (Все склады)</span>
                        </button>

                        <div style={{ borderTop: '1px solid var(--adm-border)', margin: '8px 0' }}></div>

                        {/* MODE A */}
                        <div style={{ padding: '4px 6px 6px', fontSize: 11, fontWeight: 700, color: 'var(--adm-accent-amber)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Режим A — Отдельный склад
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <label style={{ display: 'block', fontSize: 11, color: 'var(--adm-text-muted)', marginBottom: 4 }}>
                            Выберите склад для работы:
                          </label>
                          <select
                            className="admin-select"
                            style={{ width: '100%', fontSize: 12, padding: '4px 8px' }}
                            value={excelSelectedWarehouseId}
                            onChange={(e) => setExcelSelectedWarehouseId(e.target.value)}
                          >
                            <option value="">— Выберите нужный склад —</option>
                            {warehousesList.map(w => (
                              <option key={w.id} value={w.id}>{w.name} ({w.city || w.country})</option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost admin-btn-xs"
                          style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', marginBottom: 4 }}
                          onClick={() => {
                            if (!excelSelectedWarehouseId) {
                              showNotice('Пожалуйста, выберите склад для выгрузки шаблона Режима А', 'error');
                              return;
                            }
                            setStockExcelDownloadMenuOpen(false);
                            handleDownloadStockTemplate(excelSelectedWarehouseId);
                          }}
                        >
                          <Download size={13} />
                          <span>Скачать шаблон выбранного склада</span>
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost admin-btn-xs"
                          style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left' }}
                          onClick={() => {
                            if (!excelSelectedWarehouseId) {
                              showNotice('Пожалуйста, выберите склад для экспорта Режима А', 'error');
                              return;
                            }
                            setStockExcelDownloadMenuOpen(false);
                            handleExportStockExcel(excelSelectedWarehouseId);
                          }}
                        >
                          <FileSpreadsheet size={13} />
                          <span>Экспорт остатков выбранного склада</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={stockFileInputRef}
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={handleStockFileUpload}
                  />
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-primary admin-btn-sm"
                    onClick={() => stockFileInputRef.current?.click()}
                    title="Импорт Excel файл (поддерживает как один склад, так и матрицу всех складов)"
                  >
                    <Upload size={14} />
                    <span>Импорт Excel</span>
                  </button>
                </div>
              </div>

              {/* View Mode Navigation Bar */}
              <div className="stock-mode-selector-nav">
                <button
                  type="button"
                  className={`stock-mode-nav-btn ${stockMatrixViewMode === 'matrix' ? 'active' : ''}`}
                  onClick={() => setStockMatrixViewMode('matrix')}
                >
                  <Boxes size={15} />
                  <span>Матрица всех складов ({catalogList.length})</span>
                </button>

                <button
                  type="button"
                  className={`stock-mode-nav-btn ${stockMatrixViewMode === 'single' ? 'active' : ''}`}
                  onClick={() => setStockMatrixViewMode('single')}
                >
                  <Warehouse size={15} />
                  <span>По отдельному филиалу</span>
                </button>

                <button
                  type="button"
                  className={`stock-mode-nav-btn ${stockMatrixViewMode === 'region_map' ? 'active' : ''}`}
                  onClick={() => setStockMatrixViewMode('region_map')}
                >
                  <MapPin size={15} />
                  <span>Соответствие: Регион → Склад</span>
                </button>

                <button
                  type="button"
                  className={`stock-mode-nav-btn ${stockMatrixViewMode === 'warehouses' ? 'active' : ''}`}
                  onClick={() => setStockMatrixViewMode('warehouses')}
                >
                  <Sliders size={15} />
                  <span>Настройка складов ({warehousesList.length})</span>
                </button>
              </div>

              {/* VIEW 1: MATRIX ALL WAREHOUSES */}
              {stockMatrixViewMode === 'matrix' && (
                <>
                  {/* Summary Grid for All Warehouses */}
                  {(() => {
                    let totalUnitsAll = 0;
                    let activeItemsCount = 0;
                    const skuWithStockSet = new Set();

                    stockList.forEach(s => {
                      if (s.quantity > 0) {
                        totalUnitsAll += s.quantity;
                        skuWithStockSet.add(s.sku);
                      }
                    });

                    return (
                      <div className="stock-summary-grid">
                        <div className="stock-summary-card primary">
                          <span className="stat-label">Подключенные склады</span>
                          <h3 className="stat-value">{warehousesList.length} <small>склада</small></h3>
                          <p className="stat-sub">{warehousesList.map(w => w.name).join(' • ')}</p>
                        </div>

                        <div className="stock-summary-card">
                          <span className="stat-label">Всего продукции на балансе</span>
                          <h3 className="stat-value">{totalUnitsAll.toLocaleString('ru-RU')} <small>шт.</small></h3>
                          <p className="stat-sub">Физический объём по всей номенклатуре</p>
                        </div>

                        <div className="stock-summary-card">
                          <span className="stat-label">Товаров в наличии</span>
                          <h3 className="stat-value">{skuWithStockSet.size} <small>поз.</small></h3>
                          <p className="stat-sub">Из {catalogList.length} позиций каталога LAUTE</p>
                        </div>

                        <div className="stock-summary-card">
                          <span className="stat-label">Режим синхронизации</span>
                          <h3 className="stat-value">Изолированный</h3>
                          <p className="stat-sub">Изменение склада не затрагивает другие филиалы</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Filters Bar */}
                  <div className="admin-filters-bar">
                    <div className="search-box">
                      <Search size={16} className="search-icon" />
                      <input
                        type="text"
                        value={stockSearchQuery}
                        onChange={(e) => setStockSearchQuery(e.target.value)}
                        placeholder="Поиск по артикулу (SKU) или названию изделия..."
                      />
                      {stockSearchQuery && (
                        <button type="button" onClick={() => setStockSearchQuery('')} className="clear-btn">
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="filter-select-group">
                      <select
                        value={stockCategoryFilter}
                        onChange={(e) => setStockCategoryFilter(e.target.value)}
                        className="admin-select"
                      >
                        <option value="Все">Все категории ({catalogList.length})</option>
                        {categoriesList.map((c) => (
                          <option key={c.id || c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Mass Stock Actions Bar */}
                  {selectedStockSkus.length > 0 && (
                    <div className="stock-mass-actions-bar">
                      <div className="stock-mass-info">
                        <CheckCircle2 size={18} color="var(--adm-accent-blue)" />
                        <span>Выбрано товаров: <strong>{selectedStockSkus.length} шт.</strong></span>
                      </div>
                      <div className="stock-mass-btns">
                        <button
                          type="button"
                          className="admin-btn admin-btn-primary admin-btn-sm"
                          onClick={() => setIsMassStockModalOpen(true)}
                        >
                          <Sliders size={14} />
                          <span>Массовое изменение остатков</span>
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          onClick={() => setSelectedStockSkus([])}
                        >
                          <X size={14} />
                          <span>Снять выбор</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Matrix Table */}
                  <div className="admin-table-wrapper">
                    {isLoadingStock ? (
                      <div className="admin-loading-indicator">
                        <RefreshCw size={24} className="spin-icon" />
                        <span>Загрузка матрицы складских остатков...</span>
                      </div>
                    ) : (
                      (() => {
                        const filtered = catalogList.filter(prod => {
                          const matchSearch = !stockSearchQuery ||
                            prod.article?.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
                            prod.name?.toLowerCase().includes(stockSearchQuery.toLowerCase());
                          const matchCat = stockCategoryFilter === 'Все' || prod.category === stockCategoryFilter;
                          return matchSearch && matchCat;
                        });

                        const visibleSkus = filtered.map(p => p.article);
                        const isAllSelected = visibleSkus.length > 0 && visibleSkus.every(s => selectedStockSkus.includes(s));

                        if (filtered.length === 0) {
                          return (
                            <div className="admin-empty-state">
                              <Search size={36} className="empty-icon" />
                              <h3>Ничего не найдено</h3>
                              <p>По запросу {stockSearchQuery ? `«${stockSearchQuery}»` : ''} товары на складах не найдены.</p>
                              <button 
                                type="button" 
                                className="admin-btn admin-btn-outline admin-btn-sm"
                                onClick={() => { setStockSearchQuery(''); setStockCategoryFilter('Все'); }}
                              >
                                Сбросить фильтры
                              </button>
                            </div>
                          );
                        }

                        return (
                          <table className="admin-table stock-matrix-table">
                            <thead>
                              <tr>
                                <th style={{ width: 40, textAlign: 'center' }}>
                                  <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={() => handleSelectAllStock(visibleSkus)}
                                    title="Выбрать все видимые товары"
                                  />
                                </th>
                                <th style={{ width: 60 }}>Фото</th>
                                <th style={{ width: 130 }}>SKU</th>
                                <th>Название изделия</th>
                                <th>Категория</th>
                                {/* Dynamic Column for Every Configured Warehouse */}
                                {warehousesList.map(wh => (
                                  <th key={wh.id} style={{ minWidth: 120 }}>
                                    <div>{wh.name}</div>
                                    <small style={{ fontSize: 10, color: 'var(--adm-text-muted)', fontWeight: 400 }}>
                                      {wh.city || wh.country}
                                    </small>
                                  </th>
                                ))}
                                <th style={{ width: 100, textAlign: 'right' }}>Итого</th>
                                <th style={{ width: 80, textAlign: 'center' }}>Инфо</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filtered.map(prod => {
                                const thumbSrc = prod.photo1 ? resolveMediaUrl(prod.photo1) : '';
                                const isSelected = selectedStockSkus.includes(prod.article);

                                // Calculate total stock across warehouses
                                let rowTotal = 0;
                                warehousesList.forEach(wh => {
                                  const sItem = stockList.find(s => s.sku === prod.article && s.warehouseId === wh.id);
                                  if (sItem && typeof sItem.quantity === 'number') {
                                    rowTotal += sItem.quantity;
                                  }
                                });

                                return (
                                  <tr key={prod.article} className={isSelected ? 'row-selected' : ''}>
                                    <td style={{ textAlign: 'center' }}>
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleToggleStockSelect(prod.article)}
                                      />
                                    </td>
                                    <td>
                                      <div className="table-thumb-frame">
                                        {prod.photo1 ? (
                                          <img 
                                            src={thumbSrc} 
                                            alt={prod.name} 
                                            className="table-thumb" 
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                          />
                                        ) : (
                                          <ImageIcon size={18} className="cell-muted" />
                                        )}
                                      </div>
                                    </td>
                                    <td><code>{prod.article}</code></td>
                                    <td>
                                      <div className="prod-title-wrap">
                                        <strong>{prod.name}</strong>
                                        <span className="prod-sub">{prod.collection || 'LAUTE'}</span>
                                      </div>
                                    </td>
                                    <td>{prod.category}</td>

                                    {/* Warehouse Quantity Cells */}
                                    {warehousesList.map(wh => {
                                      const stockRecord = stockList.find(s => s.sku === prod.article && s.warehouseId === wh.id);
                                      const isEditingCell = matrixEditingCell?.whId === wh.id && matrixEditingCell?.sku === prod.article;
                                      const qtyVal = stockRecord ? stockRecord.quantity : null;

                                      return (
                                        <td key={wh.id} className="wh-matrix-cell">
                                          {isEditingCell ? (
                                            <div className="wh-inline-editor">
                                              <input
                                                type="number"
                                                min="0"
                                                className="wh-inline-input"
                                                value={matrixCellVal}
                                                onChange={(e) => setMatrixCellVal(e.target.value)}
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter') {
                                                    handleSaveMatrixCell(wh.id, prod.article, matrixCellVal);
                                                  } else if (e.key === 'Escape') {
                                                    setMatrixEditingCell(null);
                                                  }
                                                }}
                                                autoFocus
                                              />
                                              <button
                                                type="button"
                                                className="wh-inline-save-btn"
                                                onClick={() => handleSaveMatrixCell(wh.id, prod.article, matrixCellVal)}
                                                title="Сохранить остаток"
                                              >
                                                <Check size={12} />
                                              </button>
                                              <button
                                                type="button"
                                                className="wh-inline-cancel-btn"
                                                onClick={() => setMatrixEditingCell(null)}
                                                title="Отмена"
                                              >
                                                <X size={12} />
                                              </button>
                                            </div>
                                          ) : (
                                            (() => {
                                              if (qtyVal === null || qtyVal === undefined) {
                                                return (
                                                  <span
                                                    className="wh-qty-display unspecified"
                                                    onClick={() => {
                                                      setMatrixEditingCell({ whId: wh.id, sku: prod.article });
                                                      setMatrixCellVal('');
                                                    }}
                                                    title={`Нажмите, чтобы ввести остаток для склада «${wh.name}»`}
                                                  >
                                                    Нет данных
                                                  </span>
                                                );
                                              } else if (qtyVal > 0) {
                                                return (
                                                  <span
                                                    className="wh-qty-display in-stock"
                                                    onClick={() => {
                                                      setMatrixEditingCell({ whId: wh.id, sku: prod.article });
                                                      setMatrixCellVal(String(qtyVal));
                                                    }}
                                                    title={`Нажмите, чтобы изменить остаток (${qtyVal} шт.)`}
                                                  >
                                                    {qtyVal} шт.
                                                  </span>
                                                );
                                              } else {
                                                return (
                                                  <span
                                                    className="wh-qty-display out-of-stock"
                                                    onClick={() => {
                                                      setMatrixEditingCell({ whId: wh.id, sku: prod.article });
                                                      setMatrixCellVal('0');
                                                    }}
                                                    title="Остаток 0 шт. Нажмите для изменения"
                                                  >
                                                    0 шт.
                                                  </span>
                                                );
                                              }
                                            })()
                                          )}
                                        </td>
                                      );
                                    })}

                                    {/* Row Total */}
                                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                                      <span className={`price-tag ${rowTotal > 0 ? '' : 'zero'}`}>
                                        {rowTotal} шт.
                                      </span>
                                    </td>

                                    {/* Action button */}
                                    <td style={{ textAlign: 'center' }}>
                                      <button
                                        type="button"
                                        className="action-btn"
                                        onClick={() => {
                                          setProductModalTab('stock');
                                          setEditingProduct({ ...prod });
                                        }}
                                        title="Подробная карточка товара и история"
                                      >
                                        <Sliders size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        );
                      })()
                    )}
                  </div>
                </>
              )}

              {/* VIEW 2: SINGLE WAREHOUSE */}
              {stockMatrixViewMode === 'single' && (
                <>
                  {/* Warehouse Selection Bar */}
                  <div className="warehouse-selector-bar">
                    <div className="warehouse-pills-list">
                      {warehousesList.map((wh) => {
                        const isSelected = wh.id === selectedWarehouseId;
                        return (
                          <div 
                            key={wh.id} 
                            className={`warehouse-pill ${isSelected ? 'active' : ''}`}
                            onClick={() => handleSelectWarehouse(wh.id)}
                          >
                            <span className="wh-dot"></span>
                            <div className="wh-pill-info">
                              <span className="wh-pill-name">{wh.name}</span>
                              <span className="wh-pill-location">{wh.city ? `${wh.city}, ${wh.country}` : wh.country}</span>
                            </div>
                            {!wh.isActive && (
                              <span className="wh-pill-tag inactive">Отключен</span>
                            )}
                            <button
                              type="button"
                              className="wh-pill-edit-btn"
                              title={`Настройки склада «${wh.name}»`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenWhModal(wh);
                              }}
                            >
                              <Sliders size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Single Warehouse Stats Cards */}
                  {(() => {
                    const currentWh = warehousesList.find(w => w.id === selectedWarehouseId) || warehousesList[0];
                    const stockMap = new Map();
                    stockList.forEach(s => {
                      if (s.warehouseId === selectedWarehouseId) {
                        stockMap.set(s.sku, s);
                      }
                    });

                    let inStockCount = 0;
                    let totalUnits = 0;
                    let outOfStockCount = 0;
                    let notSpecifiedCount = 0;

                    catalogList.forEach(prod => {
                      const item = stockMap.get(prod.article);
                      if (!item || item.quantity === null || item.quantity === undefined) {
                        notSpecifiedCount++;
                      } else if (item.quantity > 0) {
                        inStockCount++;
                        totalUnits += item.quantity;
                      } else {
                        outOfStockCount++;
                      }
                    });

                    return (
                      <div className="stock-summary-grid">
                        <div className="stock-summary-card primary">
                          <span className="stat-label">Выбранный филиал</span>
                          <h3 className="stat-value">{currentWh?.name || '—'}</h3>
                          <p className="stat-sub">{currentWh?.address || currentWh?.city || 'Адрес не указан'}</p>
                        </div>

                        <div className="stock-summary-card">
                          <span className="stat-label">В наличии на складе</span>
                          <h3 className="stat-value">{inStockCount} <small>поз.</small></h3>
                          <p className="stat-sub">Всего физических единиц: <strong>{totalUnits} шт.</strong></p>
                        </div>

                        <div className="stock-summary-card">
                          <span className="stat-label">Закончились (0 шт.)</span>
                          <h3 className="stat-value">{outOfStockCount} <small>поз.</small></h3>
                          <p className="stat-sub">Требуется пополнение запасов</p>
                        </div>

                        <div className="stock-summary-card">
                          <span className="stat-label">Не указаны / Не загружены</span>
                          <h3 className="stat-value">{notSpecifiedCount} <small>поз.</small></h3>
                          <p className="stat-sub">Из {catalogList.length} позиций каталога</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Filters & Search */}
                  <div className="admin-filters-bar">
                    <div className="search-box">
                      <Search size={16} className="search-icon" />
                      <input
                        type="text"
                        value={stockSearchQuery}
                        onChange={(e) => setStockSearchQuery(e.target.value)}
                        placeholder="Поиск по артикулу (SKU) или названию изделия..."
                      />
                      {stockSearchQuery && (
                        <button type="button" onClick={() => setStockSearchQuery('')} className="clear-btn">
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="filter-select-group">
                      <select
                        value={stockCategoryFilter}
                        onChange={(e) => setStockCategoryFilter(e.target.value)}
                        className="admin-select"
                      >
                        <option value="Все">Все категории ({catalogList.length})</option>
                        {categoriesList.map((c) => (
                          <option key={c.id || c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>

                      <select
                        value={stockLevelFilter}
                        onChange={(e) => setStockLevelFilter(e.target.value)}
                        className="admin-select"
                      >
                        <option value="all">Все уровни остатков</option>
                        <option value="in_stock">В наличии (&gt; 0 шт.)</option>
                        <option value="out_of_stock">Закончились (0 шт.)</option>
                        <option value="unspecified">Не указаны / Не загружены</option>
                      </select>
                    </div>
                  </div>

                  {/* Single Warehouse Table */}
                  <div className="admin-table-wrapper">
                    <table className="admin-table stock-table">
                      <thead>
                        <tr>
                          <th style={{ width: 60 }}>Фото</th>
                          <th style={{ width: 140 }}>Артикул</th>
                          <th>Наименование товара</th>
                          <th>Категория</th>
                          <th style={{ width: 220 }}>Количество на складе</th>
                          <th style={{ width: 150 }}>Статус наличия</th>
                          <th style={{ width: 160 }}>Обновлено</th>
                          <th style={{ width: 120 }}>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catalogList
                          .filter(prod => {
                            const matchSearch = !stockSearchQuery ||
                              prod.article?.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
                              prod.name?.toLowerCase().includes(stockSearchQuery.toLowerCase());
                            const matchCat = stockCategoryFilter === 'Все' || prod.category === stockCategoryFilter;

                            const stockItem = stockList.find(s => s.sku === prod.article && s.warehouseId === selectedWarehouseId);
                            const currentQty = stockItem ? stockItem.quantity : null;

                            let matchLevel = true;
                            if (stockLevelFilter === 'in_stock') {
                              matchLevel = currentQty !== null && currentQty > 0;
                            } else if (stockLevelFilter === 'out_of_stock') {
                              matchLevel = currentQty !== null && currentQty === 0;
                            } else if (stockLevelFilter === 'unspecified') {
                              matchLevel = currentQty === null || currentQty === undefined;
                            }

                            return matchSearch && matchCat && matchLevel;
                          })
                          .map(prod => {
                            const thumbSrc = prod.photo1 ? resolveMediaUrl(prod.photo1) : '';
                            const stockItem = stockList.find(s => s.sku === prod.article && s.warehouseId === selectedWarehouseId);
                            const dbQty = stockItem ? stockItem.quantity : null;
                            const hasEdit = stockLocalEdits[prod.article] !== undefined;
                            const displayQty = hasEdit ? stockLocalEdits[prod.article] : (dbQty !== null ? dbQty : '');
                            const numVal = parseInt(displayQty, 10);
                            const isChanged = hasEdit && (dbQty === null ? displayQty !== '' : numVal !== dbQty);

                            let statusTagClass = 'tag-unspecified';
                            let statusTagLabel = 'Нет данных';

                            if (dbQty !== null && !isNaN(dbQty)) {
                              if (dbQty > 0) {
                                statusTagClass = 'tag-instock';
                                statusTagLabel = `В наличии (${dbQty} шт.)`;
                              } else {
                                statusTagClass = 'tag-outofstock';
                                statusTagLabel = '0 шт. (под заказ)';
                              }
                            }

                            const formattedDate = stockItem?.updatedAt 
                              ? new Date(stockItem.updatedAt).toLocaleDateString('ru-RU', { 
                                  day: '2-digit', 
                                  month: '2-digit', 
                                  year: 'numeric', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })
                              : '—';

                            return (
                              <tr key={prod.article}>
                                <td>
                                  <div className="table-thumb-frame">
                                    {prod.photo1 ? (
                                      <img 
                                        src={thumbSrc} 
                                        alt={prod.name} 
                                        className="table-thumb" 
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                      />
                                    ) : (
                                      <ImageIcon size={18} className="cell-muted" />
                                    )}
                                  </div>
                                </td>
                                <td><code>{prod.article}</code></td>
                                <td>
                                  <div className="prod-title-wrap">
                                    <strong>{prod.name}</strong>
                                    <span className="prod-sub">{prod.collection || 'LAUTE'}</span>
                                  </div>
                                </td>
                                <td>{prod.category}</td>
                                <td>
                                  <div className="stock-qty-input-group">
                                    <button
                                      type="button"
                                      className="qty-step-btn"
                                      onClick={() => {
                                        const cur = parseInt(displayQty || '0', 10) || 0;
                                        const next = Math.max(0, cur - 1);
                                        setStockLocalEdits(prev => ({ ...prev, [prod.article]: next }));
                                      }}
                                      title="Уменьшить на 1"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min="0"
                                      step="1"
                                      className={`stock-qty-field ${isChanged ? 'field-modified' : ''}`}
                                      placeholder="Нет данных"
                                      value={displayQty}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setStockLocalEdits(prev => ({ ...prev, [prod.article]: val }));
                                      }}
                                    />
                                    <button
                                      type="button"
                                      className="qty-step-btn"
                                      onClick={() => {
                                        const cur = parseInt(displayQty || '0', 10) || 0;
                                        const next = cur + 1;
                                        setStockLocalEdits(prev => ({ ...prev, [prod.article]: next }));
                                      }}
                                      title="Увеличить на 1"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td>
                                  <span className={`stock-status-badge ${statusTagClass}`}>
                                    {statusTagLabel}
                                  </span>
                                </td>
                                <td className="cell-date">
                                  <span>{formattedDate}</span>
                                </td>
                                <td>
                                  <div className="actions-cell">
                                    <button
                                      type="button"
                                      className={`action-btn ${isChanged ? 'btn-save-active' : ''}`}
                                      disabled={!isChanged || isSavingStock}
                                      onClick={() => handleSaveStockRow(prod.article)}
                                      title={isChanged ? 'Сохранить изменённое количество' : 'Значение не изменено'}
                                    >
                                      <Save size={15} />
                                    </button>
                                    {hasEdit && (
                                      <button
                                        type="button"
                                        className="action-btn"
                                        onClick={() => {
                                          setStockLocalEdits(prev => {
                                            const copy = { ...prev };
                                            delete copy[prod.article];
                                            return copy;
                                          });
                                        }}
                                        title="Сбросить правку"
                                      >
                                        <RotateCcw size={14} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* VIEW: REGION TO WAREHOUSE MAPPING & LIVE TEST PREVIEW */}
              {stockMatrixViewMode === 'region_map' && (
                <div className="warehouse-region-map-section" style={{ padding: '4px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 16, margin: '0 0 4px 0', color: '#FFFFFF' }}>
                        Соответствие: Регион сайта → Склад по умолчанию
                      </h3>
                      <p className="cell-muted" style={{ margin: 0, maxWidth: 780, fontSize: 13 }}>
                        При выборе посетителем региона в шапке сайта автоматически подставляются остатки настроенного склада.
                        Если для региона склад не привязан, система показывает нейтральное состояние «Склад не выбран» без случайных цифр.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary admin-btn-sm"
                      onClick={handleSaveRegionMap}
                      disabled={isSavingRegionMap}
                    >
                      <Save size={14} />
                      <span>{isSavingRegionMap ? 'Сохранение...' : 'Сохранить соответствия'}</span>
                    </button>
                  </div>

                  {/* Mapping Table */}
                  <div className="admin-table-wrapper" style={{ marginBottom: 24 }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th style={{ width: 220 }}>Регион сайта</th>
                          <th style={{ width: 140 }}>Код региона</th>
                          <th style={{ width: 280 }}>Склад по умолчанию</th>
                          <th style={{ width: 200 }}>Статус связки</th>
                          <th>Координация поставок</th>
                        </tr>
                      </thead>
                      <tbody>
                        {REGIONS_CONFIG.map(reg => {
                          const currentWhId = adminRegionMap[reg.id] || '';
                          const matchedWh = warehousesList.find(w => w.id === currentWhId);

                          return (
                            <tr key={reg.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <MapPin size={16} style={{ color: 'var(--adm-accent-blue)' }} />
                                  <strong style={{ color: '#FFFFFF' }}>{reg.names?.ru || reg.id}</strong>
                                </div>
                              </td>
                              <td>
                                <code>{reg.id}</code>
                              </td>
                              <td>
                                <select
                                  className="admin-select"
                                  style={{ width: '100%', fontSize: 13, padding: '6px 10px', background: 'var(--adm-surface-card)' }}
                                  value={currentWhId}
                                  onChange={(e) => {
                                    const val = e.target.value || null;
                                    setAdminRegionMap(prev => ({
                                      ...prev,
                                      [reg.id]: val
                                    }));
                                  }}
                                >
                                  <option value="">— Склад не выбран —</option>
                                  {warehousesList.map(w => (
                                    <option key={w.id} value={w.id}>
                                      {w.name} ({w.city ? `${w.city}, ${w.country}` : w.country})
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                {matchedWh ? (
                                  <span className="wh-pill-tag active" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <Check size={12} /> {matchedWh.name}
                                  </span>
                                ) : (
                                  <span className="wh-pill-tag inactive" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <X size={12} /> Склад не выбран
                                  </span>
                                )}
                              </td>
                              <td style={{ fontSize: 12, color: 'var(--adm-text-muted)' }}>
                                {reg.responsibleManager || reg.office || '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Test Preview Section */}
                  <div style={{ background: 'var(--adm-surface-card)', border: '1px solid var(--adm-border)', borderRadius: 12, padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Eye size={18} style={{ color: 'var(--adm-accent-amber)' }} />
                        <h4 style={{ margin: 0, fontSize: 14, color: '#FFFFFF' }}>
                          Интерактивный тестовый предпросмотр остатков по регионам
                        </h4>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <label style={{ fontSize: 12, color: 'var(--adm-text-muted)' }}>Проверить выбор региона:</label>
                        <select
                          className="admin-select"
                          style={{ fontSize: 13, padding: '4px 10px' }}
                          value={testPreviewRegion}
                          onChange={(e) => setTestPreviewRegion(e.target.value)}
                        >
                          {REGIONS_CONFIG.map(r => (
                            <option key={r.id} value={r.id}>{r.names?.ru || r.id}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {(() => {
                      const selWhId = adminRegionMap[testPreviewRegion];
                      const selWh = warehousesList.find(w => w.id === selWhId);

                      return (
                        <div>
                          <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 14, fontSize: 13, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                            <div>
                              <span style={{ color: 'var(--adm-text-muted)' }}>Регион: </span>
                              <strong style={{ color: '#FFFFFF' }}>{REGIONS_CONFIG.find(r => r.id === testPreviewRegion)?.names?.ru}</strong>
                            </div>
                            <div>
                              <span style={{ color: 'var(--adm-text-muted)' }}>Склад по умолчанию: </span>
                              {selWh ? (
                                <strong style={{ color: 'var(--adm-accent-blue)' }}>{selWh.name} ({selWh.city || selWh.country})</strong>
                              ) : (
                                <strong style={{ color: 'var(--adm-accent-amber)' }}>Склад не выбран (остатки скрыты)</strong>
                              )}
                            </div>
                          </div>

                          <div className="admin-table-wrapper" style={{ maxHeight: 280, overflowY: 'auto' }}>
                            <table className="admin-table admin-table-compact">
                              <thead>
                                <tr>
                                  <th>Артикул</th>
                                  <th>Название</th>
                                  <th>Категория</th>
                                  <th>Отображаемый остаток для региона</th>
                                </tr>
                              </thead>
                              <tbody>
                                {catalogList.slice(0, 15).map(prod => {
                                  if (!selWhId) {
                                    return (
                                      <tr key={prod.article}>
                                        <td><code>{prod.article}</code></td>
                                        <td>{prod.name}</td>
                                        <td>{prod.category}</td>
                                        <td><span className="wh-qty-display unspecified">Склад не выбран</span></td>
                                      </tr>
                                    );
                                  }
                                  const item = stockList.find(s => s.sku === prod.article && s.warehouseId === selWhId);
                                  const qty = item ? item.quantity : null;
                                  let statusNode;
                                  if (qty === null || qty === undefined) {
                                    statusNode = <span className="wh-qty-display unspecified">Нет данных</span>;
                                  } else if (qty > 0) {
                                    statusNode = <span className="wh-qty-display in-stock">{qty} шт. в наличии</span>;
                                  } else {
                                    statusNode = <span className="wh-qty-display out-of-stock">0 шт. (под заказ)</span>;
                                  }

                                  return (
                                    <tr key={prod.article}>
                                      <td><code>{prod.article}</code></td>
                                      <td>{prod.name}</td>
                                      <td>{prod.category}</td>
                                      <td>{statusNode}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* VIEW 3: WAREHOUSE CONFIGURATION (НАСТРОЙКА СКЛАДОВ) */}
              {stockMatrixViewMode === 'warehouses' && (
                <div className="warehouse-mgmt-section">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 16, margin: '0 0 4px 0', color: '#FFFFFF' }}>Логистические склады LAUTE ({warehousesList.length})</h3>
                      <p className="cell-muted" style={{ margin: 0 }}>
                        Управление перечнем филиалов, адресами, приоритетом и отображением в системе
                      </p>
                    </div>
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary admin-btn-sm"
                      onClick={() => handleOpenWhModal(null)}
                    >
                      <Plus size={14} />
                      <span>Добавить новый склад</span>
                    </button>
                  </div>

                  <div className="warehouse-mgmt-grid">
                    {warehousesList.map(wh => {
                      const stockCount = stockList.filter(s => s.warehouseId === wh.id && s.quantity > 0).length;
                      let totalUnits = 0;
                      stockList.filter(s => s.warehouseId === wh.id).forEach(s => {
                        if (s.quantity > 0) totalUnits += s.quantity;
                      });

                      return (
                        <div key={wh.id} className="warehouse-mgmt-card">
                          <div className="warehouse-mgmt-card-header">
                            <div>
                              <h4 className="warehouse-mgmt-card-title">{wh.name}</h4>
                              <span className="warehouse-mgmt-card-code">ID: {wh.id}</span>
                            </div>
                            <span className={`stat-tag ${wh.isActive ? 'success' : 'warning'}`}>
                              {wh.isActive ? 'Активен' : 'Отключен'}
                            </span>
                          </div>

                          <div className="warehouse-mgmt-card-body">
                            <div><strong>Страна:</strong> {wh.country || '—'}</div>
                            <div><strong>Город:</strong> {wh.city || '—'}</div>
                            <div><strong>Адрес / Терминал:</strong> {wh.address || '—'}</div>
                            <div><strong>Приоритет:</strong> #{wh.priority || 1}</div>
                            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                              <strong>На балансе:</strong> {stockCount} позиций ({totalUnits} шт.)
                            </div>
                          </div>

                          <div className="warehouse-mgmt-card-footer">
                            <button
                              type="button"
                              className="admin-btn admin-btn-outline admin-btn-xs"
                              onClick={() => handleOpenWhModal(wh)}
                            >
                              <Edit3 size={12} />
                              <span>Редактировать</span>
                            </button>

                            <button
                              type="button"
                              className="admin-btn admin-btn-danger admin-btn-xs"
                              onClick={() => handleDeleteWh(wh)}
                            >
                              <Trash2 size={12} />
                              <span>Удалить</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="admin-view categories-view">
              <div className="view-header"><div><span className="studio-eyebrow">Каталог / Структура</span><h2 className="view-title">Категории</h2><p className="view-subtitle">Названия, порядок и фотографии.</p></div>
                <button className="admin-btn admin-btn-primary" disabled={isSavingCategories} onClick={() => setEditingCategory({ id: 'cat-' + Date.now(), name: '', description: '', isVisible: true })}><Plus size={16}/>Добавить категорию</button>
              </div>
              <div className="studio-category-grid">
                {categoriesList.map((cat, idx) => <article className="studio-category-card" key={cat.id || cat.name}>
                  <div className="studio-category-top"><span className="studio-category-index">{String(idx + 1).padStart(2, '0')}</span><span className={'stat-tag ' + (cat.isVisible === false ? 'warning' : 'success')}>{cat.isVisible === false ? 'Скрыта' : 'На сайте'}</span></div>
                  {cat.image && <img className="studio-category-image" src={resolveMediaUrl(cat.image)} alt=""/>}
                  <h3>{cat.name}</h3><p>{cat.description || 'Добавь описание категории'}</p><span className="cell-muted">{catalogList.filter(p => p.category === cat.name).length} товаров</span>
                  <div className="studio-category-actions"><button className="admin-btn admin-btn-outline" disabled={isSavingCategories} onClick={() => setEditingCategory({ ...cat, originalName: cat.name })}><Edit3 size={14}/>Изменить</button>
                    <button className="admin-btn admin-btn-ghost" aria-label={'Поднять ' + cat.name} disabled={idx === 0 || isSavingCategories} onClick={() => { const next = [...categoriesList]; [next[idx-1],next[idx]] = [next[idx],next[idx-1]]; persistCategories(next); }}><ArrowUp size={16}/></button>
                    <button className="admin-btn admin-btn-ghost" aria-label={'Опустить ' + cat.name} disabled={idx === categoriesList.length-1 || isSavingCategories} onClick={() => { const next = [...categoriesList]; [next[idx+1],next[idx]] = [next[idx],next[idx+1]]; persistCategories(next); }}><ArrowDown size={16}/></button>
                  </div>
                </article>)}
              </div>
              {editingCategory && <div className="admin-modal-overlay"><form className="admin-modal" onSubmit={e => { e.preventDefault(); const found = categoriesList.some(c => c.id === editingCategory.id); persistCategories(found ? categoriesList.map(c => c.id === editingCategory.id ? editingCategory : c) : [...categoriesList, editingCategory]); }}>
                <div className="admin-modal-header"><h3>{editingCategory.name || 'Новая категория'}</h3><button type="button" className="admin-btn admin-btn-ghost" disabled={isSavingCategories} onClick={() => setEditingCategory(null)}><X size={18}/></button></div>
                <div className="admin-modal-body">
                  <label className="form-group">Название<input aria-label="Название категории" required value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}/></label>
                  <label className="form-group">Описание<textarea aria-label="Описание категории" rows={3} value={editingCategory.description || ''} onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}/></label>
                  <ImageFieldEditor label="Фото категории" value={editingCategory.image || ''} onChange={image => setEditingCategory({ ...editingCategory, image })}/>
                  <label className="studio-check"><input type="checkbox" checked={editingCategory.isVisible !== false} onChange={e => setEditingCategory({ ...editingCategory, isVisible: e.target.checked })}/>Показывать категорию и её товары на сайте</label>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="admin-btn admin-btn-danger" disabled={isSavingCategories || catalogList.some(p => p.category === editingCategory.name)} onClick={() => { if (window.confirm('Удалить пустую категорию?')) persistCategories(categoriesList.filter(c => c.id !== editingCategory.id)); }}>Удалить пустую</button>
                  <button type="submit" className="admin-btn admin-btn-primary" disabled={isSavingCategories}>{isSavingCategories ? 'Сохраняю и проверяю…' : 'Сохранить на сайте'}</button>
                </div>
              </form></div>}
            </div>
          )}

          {/* TAB 6: ИМПОРТ И ЭКСПОРТ EXCEL */}
          {activeTab === 'excel' && (
            <div className="admin-view excel-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">Excel</h2>
                  <p className="view-subtitle">Экспорт, редактирование и безопасный импорт каталога в Microsoft Excel (.xlsx)</p>
                </div>
              </div>

              {/* 3 Action Cards */}
              <div className="excel-cards-row">
                {/* 1. Template */}
                <div className="excel-action-card">
                  <div className="card-top-icon">
                    <Download size={26} />
                  </div>
                  <h3>Шаблон Excel</h3>
                  <p>Оригинальный фирменный файл <strong>LAUTE_Catalog.xlsx</strong> со справочниками, выпадающими списками и инструкцией.</p>
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-outline admin-btn-full"
                    onClick={downloadExcelTemplate}
                  >
                    <Download size={14} />
                    <span>Скачать шаблон (.xlsx)</span>
                  </button>
                </div>

                {/* 2. Current Export */}
                <div className="excel-action-card">
                  <div className="card-top-icon">
                    <FileSpreadsheet size={26} />
                  </div>
                  <h3>Текущий каталог</h3>
                  <p>Полная выгрузка действующей базы каталога LAUTE ({catalogList.length} товаров) со всеми ценами, описаниями и фото.</p>
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-outline admin-btn-full"
                    onClick={exportCurrentCatalog}
                  >
                    <FileSpreadsheet size={14} />
                    <span>Скачать каталог</span>
                  </button>
                </div>

                {/* 3. Upload */}
                <div className="excel-action-card featured">
                  <div className="card-top-icon accent">
                    <Upload size={26} />
                  </div>
                  <h3>Импорт Excel</h3>
                  <p>Проверь изменения перед применением.</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setExcelFile(file);
                      setIsValidatingExcel(true);
                      setValidationResult(null);
                      setExcelCommitStats(null);

                      try {
                        const result = await validateExcelFile(file);
                        setValidationResult(result);
                      } catch (err) {
                        showNotice(err.message, 'error');
                      } finally {
                        setIsValidatingExcel(false);
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-primary admin-btn-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isValidatingExcel}
                  >
                    <Upload size={14} />
                    <span>{isValidatingExcel ? 'Проверка файла...' : 'Выбрать файл XLSX'}</span>
                  </button>
                </div>

                {/* 4. Warehouse Stock Matrix Template */}
                <div className="excel-action-card featured" style={{ border: '1px solid var(--adm-accent-blue)' }}>
                  <div className="card-top-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8' }}>
                    <Layers size={26} />
                  </div>
                  <h3>Остатки складов</h3>
                  <p>Единый Excel-шаблон со столбцами по всем филиалам ({warehousesList.map(w => w.name).join(', ')}). Позволяет обновлять складские остатки по всей филиальной сети одновременно.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-primary admin-btn-full"
                      onClick={() => handleDownloadAllWarehousesStock('template')}
                    >
                      <Download size={14} />
                      <span>Скачать Excel для всех складов</span>
                    </button>
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-outline admin-btn-full"
                      onClick={() => handleDownloadAllWarehousesStock('export')}
                    >
                      <FileSpreadsheet size={14} />
                      <span>Экспорт текущих остатков всех складов</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Validation Results Preview */}
              {validationResult && (
                <div className="excel-results-section">
                  <div className="summary-banner">
                    <h3>Результат проверки файла: {excelFile?.name}</h3>
                    <div className="summary-pills-row">
                      <div className="pill-item added">
                        <span className="pill-count">+{validationResult.summary?.toAdd || 0}</span>
                        <span className="pill-name">Будет добавлено</span>
                      </div>
                      <div className="pill-item updated">
                        <span className="pill-count">{validationResult.summary?.toUpdate || 0}</span>
                        <span className="pill-name">Будет обновлено</span>
                      </div>
                      <div className="pill-item unchanged">
                        <span className="pill-count">{validationResult.summary?.unchanged || 0}</span>
                        <span className="pill-name">Без изменений</span>
                      </div>
                      <div className="pill-item hidden">
                        <span className="pill-count">{validationResult.summary?.toHide || 0}</span>
                        <span className="pill-name">Будет скрыто</span>
                      </div>
                      <div className="pill-item errors">
                        <span className="pill-count">{validationResult.summary?.errorsCount || 0}</span>
                        <span className="pill-name">Ошибок в строках</span>
                      </div>
                    </div>
                  </div>

                  {/* Errors Notice if any */}
                  {validationResult.errors && validationResult.errors.length > 0 && (
                    <div className="excel-errors-card">
                      <div className="errors-header-row">
                        <h4>Обнаружены ошибки в строках Excel ({validationResult.errors.length}):</h4>
                        <button 
                          type="button" 
                          className="admin-btn admin-btn-outline admin-btn-sm"
                          onClick={() => downloadErrorReport(validationResult.errors)}
                        >
                          <Download size={13} />
                          <span>Скачать отчёт об ошибках</span>
                        </button>
                      </div>

                      <div className="errors-list">
                        {validationResult.errors.map((err, eIdx) => (
                          <div key={eIdx} className="error-row-item">
                            <span className="row-num">Строка {err.row}:</span>
                            <span className="row-sku">[{err.article}]</span>
                            <span className="row-msg">{err.field ? `${err.field}: ` : ''}{err.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Commit Action */}
                  <div className="excel-commit-bar">
                    <p className="note">
                      Товары, отсутствующие в Excel, <strong>НЕ будут удалены</strong> с сайта. Новые позиции добавятся, существующие обновятся по SKU.
                    </p>

                    <button
                      type="button"
                      className="admin-btn admin-btn-success admin-btn-lg"
                      disabled={isCommittingExcel || !validationResult.validRows || validationResult.validRows.length === 0}
                      onClick={async () => {
                        if (isDemoMode) {
                          showNotice('В демонстрационном режиме применение импорта Excel к базе данных заблокировано.');
                          return;
                        }
                        setIsCommittingExcel(true);
                        try {
                          const res = await commitExcelImport(validationResult.validRows);
                          setExcelCommitStats(res.stats);
                          setValidationResult(null);
                          loadCatalogData();
                          showNotice(`Импорт успешно завершён! Добавлено: +${res.stats.added}, обновлено: ${res.stats.updated}`);
                        } catch (err) {
                          showNotice(err.message, 'error');
                        } finally {
                          setIsCommittingExcel(false);
                        }
                      }}
                    >
                      <Check size={16} />
                      <span>{isCommittingExcel ? 'Применение изменений...' : 'Подтвердить и обновить каталог на сайте'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Success Commit Banner */}
              {excelCommitStats && (
                <div className="admin-alert-banner success">
                  <div className="banner-icon-col">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="banner-content-col">
                    <h4>Каталог успешно обновлён из Excel!</h4>
                    <p>
                      Добавлено: +{excelCommitStats.added} товаров, обновлено: {excelCommitStats.updated}, скрыто: {excelCommitStats.hidden}.
                      Всего позиций в действующем каталоге: {excelCommitStats.total}. Создана резервная копия для мгновенного отката при необходимости.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: ФОТОГРАФИИ И МЕДИА */}
          {activeTab === 'media' && (
            <div className="admin-view media-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">Фотографии</h2>
                  <p className="view-subtitle">Медиаменеджер: загрузка фотографий товаров, интерьеров и баннеров</p>
                </div>
                <div className="header-actions">
                  <input
                    type="file"
                    ref={mediaInputRef}
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      if (isDemoMode) {
                        showNotice('В демонстрационном режиме загрузка файлов заблокирована.', 'error');
                        return;
                      }
                      const token = getAuthToken();
                      if (!token) {
                        showNotice('Требуется авторизация администратора для загрузки файлов.', 'error');
                        return;
                      }
                      setIsUploadingMedia(true);
                      try {
                        await uploadMediaFiles(files);
                        await loadMediaData();
                        showNotice(`Успешно загружено ${files.length} изображений`);
                      } catch (err) {
                        showNotice(err.message || 'Ошибка загрузки файлов', 'error');
                      } finally {
                        setIsUploadingMedia(false);
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-primary admin-btn-sm"
                    onClick={() => mediaInputRef.current?.click()}
                    disabled={isUploadingMedia}
                  >
                    <Upload size={14} />
                    <span>{isUploadingMedia ? 'Загрузка...' : 'Загрузить фотографии'}</span>
                  </button>
                </div>
              </div>

              {/* Media Search */}
              <div className="admin-filters-bar">
                <div className="search-box">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    placeholder="Поиск по названию файла..."
                  />
                </div>
                <span className="cell-muted">Всего файлов: {mediaFiles.length}</span>
              </div>

              {/* Media Grid */}
              <div className="media-gallery-grid">
                {mediaFiles
                  .filter(f => !mediaSearch || f.name.toLowerCase().includes(mediaSearch.toLowerCase()))
                  .map((file, fIdx) => {
                    const fullSrc = resolveMediaUrl(file.url);
                    return (
                      <div key={file.url} className="media-card-item">
                        <div 
                          className="media-thumb-box"
                          onClick={() => setSelectedMediaPreview(file)}
                        >
                          <img src={fullSrc} alt={file.name} loading="lazy" />
                        </div>
                        <div className="media-card-body">
                          <span className="media-filename" title={file.name}>{file.name}</span>
                          <span className="media-filesize">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <div className="media-card-actions">
                          <button
                            type="button"
                            className="media-mini-btn"
                            title="Скопировать относительный путь"
                            onClick={() => {
                              navigator.clipboard.writeText(file.url);
                              showNotice(`Путь скопирован: ${file.url}`);
                            }}
                          >
                            <Copy size={13} />
                            <span>Путь</span>
                          </button>

                          <button
                            type="button"
                            className="media-mini-btn"
                            title="Привязать фото к товару в каталоге"
                            onClick={() => {
                              setMediaDetailModal(file);
                              setMediaAttachProductSku(catalogList[0]?.article || '');
                              setMediaAttachSlot('photo1');
                            }}
                          >
                            <Package size={13} />
                            <span>Привязать</span>
                          </button>

                          <button
                            type="button"
                            className="media-mini-btn danger"
                            title={file.isStorage ? 'Удалить файл' : 'Фирменный файл сайта'}
                            disabled={!file.isStorage}
                            onClick={async () => {
                              if (!file.isStorage) return;
                              if (isDemoMode) {
                                showNotice('В демонстрационном режиме удаление файлов заблокировано.', 'error');
                                return;
                              }
                              const token = getAuthToken();
                              if (!token) {
                                showNotice('Требуется авторизация администратора для удаления файлов.', 'error');
                                return;
                              }
                              if (window.confirm(`Вы уверены, что хотите удалить файл "${file.name}" из хранилища?`)) {
                                try {
                                  await deleteMediaFile(file.name);
                                  await loadMediaData();
                                  showNotice(`Файл "${file.name}" успешно удален из хранилища`);
                                } catch (err) {
                                  showNotice(err.message || 'Ошибка удаления файла из хранилища', 'error');
                                }
                              }
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 8: МЕНЮ И ФУТЕР */}
          {activeTab === 'menu' && (
            <div className="admin-view menu-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">Меню сайта и футер</h2>
                  <p className="view-subtitle">Управление ссылками навигации, контактами представительств и юридической информацией</p>
                </div>
                <div className="header-actions">
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    onClick={handleSaveDraft}
                  >
                    <Save size={14} />
                    <span>Сохранить черновик</span>
                  </button>
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-success admin-btn-sm"
                    onClick={handlePublish}
                  >
                    <Check size={14} />
                    <span>Опубликовать</span>
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="admin-section-card">
                <h3 className="card-section-title">Пункты главного меню навигации</h3>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Порядок</th>
                        <th>Название пункта</th>
                        <th>Маршрут / Ссылка</th>
                        <th>Видимость</th>
                      </tr>
                    </thead>
                    <tbody>
                      {draftContent?.navigation?.map((navItem, nIdx) => (
                        <tr key={navItem.id || nIdx}>
                          <td>#{navItem.order || nIdx + 1}</td>
                          <td>
                            <input
                              type="text"
                              className="admin-input-inline"
                              value={navItem.label}
                              onChange={(e) => {
                                const updated = [...draftContent.navigation];
                                updated[nIdx].label = e.target.value;
                                setDraftContent({
                                  ...draftContent,
                                  hasUnpublishedChanges: true,
                                  navigation: updated
                                });
                              }}
                            />
                          </td>
                          <td><code>{navItem.route}</code></td>
                          <td>
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={navItem.isVisible !== false}
                                onChange={(e) => {
                                  const updated = [...draftContent.navigation];
                                  updated[nIdx].isVisible = e.target.checked;
                                  setDraftContent({
                                    ...draftContent,
                                    hasUnpublishedChanges: true,
                                    navigation: updated
                                  });
                                }}
                              />
                              <span>Отображать</span>
                            </label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer Information */}
              <div className="admin-section-card">
                <h3 className="card-section-title">Контактные данные и реквизиты в футере</h3>
                <div className="form-group">
                  <label>Адрес представительства:</label>
                  <input
                    type="text"
                    value={draftContent?.footer?.officeAddress || ''}
                    onChange={(e) => {
                      setDraftContent({
                        ...draftContent,
                        hasUnpublishedChanges: true,
                        footer: { ...draftContent.footer, officeAddress: e.target.value }
                      });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Телефон отдела продаж:</label>
                  <input
                    type="text"
                    value={draftContent?.footer?.phones?.[0]?.number || ''}
                    onChange={(e) => {
                      const phones = [...(draftContent?.footer?.phones || [])];
                      if (!phones[0]) phones.push({ number: '', tel: '' });
                      phones[0].number = e.target.value;
                      setDraftContent({
                        ...draftContent,
                        hasUnpublishedChanges: true,
                        footer: { ...draftContent.footer, phones }
                      });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Электронная почта:</label>
                  <input
                    type="text"
                    value={draftContent?.footer?.emails?.[0]?.email || ''}
                    onChange={(e) => {
                      const emails = [...(draftContent?.footer?.emails || [])];
                      if (!emails[0]) emails.push({ email: '' });
                      emails[0].email = e.target.value;
                      setDraftContent({
                        ...draftContent,
                        hasUnpublishedChanges: true,
                        footer: { ...draftContent.footer, emails }
                      });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Юридические документы и копирайт:</label>
                  <input
                    type="text"
                    value={draftContent?.footer?.legalText || ''}
                    onChange={(e) => {
                      setDraftContent({
                        ...draftContent,
                        hasUnpublishedChanges: true,
                        footer: { ...draftContent.footer, legalText: e.target.value }
                      });
                    }}
                  />
                </div>

                <p className="cell-muted" style={{ marginTop: 12 }}>
                  * Ссылка «Управление» в самом низу футера зафиксирована в строгом соответствии с требованиями безопасности.
                </p>
              </div>
            </div>
          )}

          {/* TAB 9: ЯЗЫКИ И ПЕРЕВОДЫ (RU, KZ, EN) */}
          {activeTab === 'languages' && (
            <div className="admin-view languages-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">Языки</h2>
                  <p className="view-subtitle">Мультиязычная система LAUTE: точный подсчёт заполненности, редактирование переводов и публикация</p>
                </div>
                <div className="header-actions">
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft || isPublishing}
                  >
                    <Save size={14} />
                    <span>{isSavingDraft ? 'Сохранение...' : 'Сохранить черновик'}</span>
                  </button>
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-success admin-btn-sm"
                    onClick={handlePublish}
                    disabled={isPublishing || isSavingDraft}
                  >
                    <Check size={14} />
                    <span>Опубликовать переводы</span>
                  </button>
                </div>
              </div>

              {/* Language Status Cards with Real Completeness Counters */}
              <div className="admin-section-card">
                <div className="lang-status-grid">
                  {/* RU */}
                  <div className="lang-status-card">
                    <div className="lang-card-header">
                      <span className="lang-badge" style={{ background: '#38BDF8', color: '#0B0F19' }}>RU</span>
                      <span className="stat-tag success">Основной (Эталон)</span>
                    </div>
                    <h4>Русский язык</h4>
                    <p className="lang-desc">Базовый язык инженерного каталога, технических паспортов и регламентов завода LAUTE.</p>
                    <div className="translation-progress-row">
                      <div className="translation-progress-bar">
                        <div className="translation-progress-fill full" style={{ width: '100%' }}></div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--adm-success)' }}>100%</span>
                    </div>
                    <div className="lang-meta" style={{ marginTop: 12 }}>
                      <span>Заполнено: <strong>{draftContent?.navigation?.filter(item => item.label?.trim()).length || 0} / {draftContent?.navigation?.length || 0}</strong> пунктов меню</span>
                      <span>Незаполненных: <strong>0</strong></span>
                    </div>
                  </div>

                  {/* KZ */}
                  <div className="lang-status-card">
                    <div className="lang-card-header">
                      <span className="lang-badge" style={{ background: '#F59E0B', color: '#0B0F19' }}>KZ</span>
                      <span className="stat-tag info">Локализация (KZ)</span>
                    </div>
                    <h4>Қазақ тілі</h4>
                    <p className="lang-desc">Региональная версия для партнёров и заказчиков в Республике Казахстан. Локализация навигации и сервиса.</p>
                    {(() => {
                      const kzFilled = (draftContent?.navigation || []).filter(item => getNavTranslation(draftContent, 'kz', item).trim()).length;
                      const kzTotal = draftContent?.navigation?.length || 0;
                      const kzPct = kzTotal ? Math.round((kzFilled / kzTotal) * 100) : 0;
                      const kzMissing = kzTotal - kzFilled;

                      return (
                        <>
                          <div className="translation-progress-row">
                            <div className="translation-progress-bar">
                              <div className="translation-progress-fill partial" style={{ width: `${kzPct}%` }}></div>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--adm-warning)' }}>{kzPct}%</span>
                          </div>
                          <div className="lang-meta" style={{ marginTop: 12 }}>
                            <span>Заполнено: <strong>{kzFilled} / {kzTotal}</strong></span>
                            <span>Требует перевода: <strong>{kzMissing}</strong></span>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* EN */}
                  <div className="lang-status-card">
                    <div className="lang-card-header">
                      <span className="lang-badge" style={{ background: '#10B981', color: '#0B0F19' }}>EN</span>
                      <span className="stat-tag info">Международный (EN)</span>
                    </div>
                    <h4>English</h4>
                    <p className="lang-desc">Международная версия для экспортных контрактов, международных дистрибьюторов и B2B каталога.</p>
                    {(() => {
                      const enFilled = (draftContent?.navigation || []).filter(item => getNavTranslation(draftContent, 'en', item).trim()).length;
                      const enTotal = draftContent?.navigation?.length || 0;
                      const enPct = enTotal ? Math.round((enFilled / enTotal) * 100) : 0;
                      const enMissing = enTotal - enFilled;

                      return (
                        <>
                          <div className="translation-progress-row">
                            <div className="translation-progress-bar">
                              <div className="translation-progress-fill partial" style={{ width: `${enPct}%` }}></div>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--adm-warning)' }}>{enPct}%</span>
                          </div>
                          <div className="lang-meta" style={{ marginTop: 12 }}>
                            <span>Заполнено: <strong>{enFilled} / {enTotal}</strong></span>
                            <span>Требует перевода: <strong>{enMissing}</strong></span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Translation Editor Section */}
              <div className="admin-section-card" style={{ marginTop: 24 }}>
                <h3 className="card-section-title">Редактирование языковых строк навигации и сервиса</h3>
                <p className="cell-muted" style={{ marginBottom: 16 }}>
                  Вы можете редактировать региональные переводы для меню и ключевых надписей сайта:
                </p>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: 180 }}>Ключ / Элемент</th>
                        <th>Русский (RU - Базовый)</th>
                        <th>Қазақ тілі (KZ)</th>
                        <th>English (EN)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {draftContent?.navigation?.map((navItem, nIdx) => {
                        const kzVal = getNavTranslation(draftContent, 'kz', navItem);
                        const enVal = getNavTranslation(draftContent, 'en', navItem);

                        return (
                          <tr key={navItem.id || nIdx}>
                            <td><code>навигация: {navItem.id}</code></td>
                            <td><strong>{navItem.label}</strong></td>
                            <td>
                              <input
                                type="text"
                                className="inline-edit-input"
                                placeholder={`Перевод на казахский...`}
                                value={kzVal}
                                onChange={(e) => {
                                  const updatedTranslations = {
                                    ...(draftContent.translations || {}),
                                    kz: {
                                      ...(draftContent.translations?.kz || {}),
                                      nav: { ...(draftContent.translations?.kz?.nav || {}), [navigationKey(navItem.route)]: e.target.value }
                                    }
                                  };
                                  setDraftContent({
                                    ...draftContent,
                                    hasUnpublishedChanges: true,
                                    translations: updatedTranslations
                                  });
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="inline-edit-input"
                                placeholder={`English translation...`}
                                value={enVal}
                                onChange={(e) => {
                                  const updatedTranslations = {
                                    ...(draftContent.translations || {}),
                                    en: {
                                      ...(draftContent.translations?.en || {}),
                                      nav: {
                                        ...(draftContent.translations?.en?.nav || {}),
                                        [navigationKey(navItem.route)]: e.target.value
                                      }
                                    }
                                  };
                                  setDraftContent({
                                    ...draftContent,
                                    hasUnpublishedChanges: true,
                                    translations: updatedTranslations
                                  });
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SEO & ПОИСКОВАЯ ОПТИМИЗАЦИЯ */}
          {activeTab === 'seo' && (
            <div className="admin-view seo-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">Для поиска</h2>
                  <p className="view-subtitle">Комплексный аудит метаданных, сниппеты поисковых систем Google/Yandex и постраничная настройка</p>
                </div>
                <div className="header-actions">
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft || isPublishing}
                  >
                    <Save size={14} />
                    <span>{isSavingDraft ? 'Сохранение...' : 'Сохранить черновик'}</span>
                  </button>
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-success admin-btn-sm"
                    onClick={handlePublish}
                    disabled={isPublishing || isSavingDraft}
                  >
                    <Check size={14} />
                    <span>Опубликовать SEO</span>
                  </button>
                </div>
              </div>

              {/* SEO Health Audit Banner */}
              <div className="admin-section-card">
                <h3 className="card-section-title">Заполнение метаданных</h3>
                <p>Title: {(getPageSeo(draftContent, seoActivePage).title || '').length} символов. Description: {(getPageSeo(draftContent, seoActivePage).description || '').length} символов.</p>
              </div>

              {/* SEO Page Selector Tabs */}
              <div className="editor-page-selector" style={{ marginBottom: 16 }}>
                <span className="selector-label">Выберите раздел для настройки SEO:</span>
                <div className="selector-tabs">
                  {[
                    { id: 'home', title: 'Главная страница' },
                    { id: 'catalog', title: 'Каталог продукции' },
                    { id: 'about', title: 'О компании LAUTE' },
                    { id: 'partners', title: 'Партнёрам и дистрибьюторам' },
                    { id: 'contacts', title: 'Контакты представительств' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`selector-tab-btn ${seoActivePage === tab.id ? 'active' : ''}`}
                      onClick={() => setSeoActivePage(tab.id)}
                    >
                      {tab.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page SEO Fields Card */}
              <div className="admin-section-card">
                <h3 className="card-section-title">
                  Метаданные страницы: {
                    seoActivePage === 'home' ? 'Главная страница' :
                    seoActivePage === 'catalog' ? 'Каталог продукции' :
                    seoActivePage === 'about' ? 'О компании LAUTE' :
                    seoActivePage === 'partners' ? 'Партнёрам и дистрибьюторам' : 'Контакты представительств'
                  }
                </h3>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Title (Заголовок в поисковой выдаче и вкладке браузера):</label>
                    <small style={{ color: 'var(--adm-text-muted)' }}>
                      {(getPageSeo(draftContent, seoActivePage).title || draftContent?.seo?.global?.defaultTitle || '').length} / 60 симв.
                    </small>
                  </div>
                  <input
                    type="text"
                    value={getPageSeo(draftContent, seoActivePage).title || (seoActivePage === 'home' ? (draftContent?.seo?.global?.defaultTitle || 'LAUTE — Премиальная сантехника и смесители') : '')}
                    onChange={(e) => {
                      const updatedSeo = {
                        ...(draftContent.seo || {}),
                        [seoActivePage]: {
                          ...(draftContent.seo?.[seoActivePage] || {}),
                          title: e.target.value
                        }
                      };
                      if (seoActivePage === 'home') {
                        updatedSeo.global = { ...(draftContent.seo?.global || {}), defaultTitle: e.target.value };
                      }
                      setDraftContent({
                        ...draftContent,
                        hasUnpublishedChanges: true,
                        seo: updatedSeo
                      });
                    }}
                    placeholder="LAUTE — Премиальная сантехника и смесители из первичной латуни"
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Meta Description (Краткое описание для сниппета):</label>
                    <small style={{ color: 'var(--adm-text-muted)' }}>
                      {(getPageSeo(draftContent, seoActivePage).description || draftContent?.seo?.global?.defaultDescription || '').length} / 160 симв.
                    </small>
                  </div>
                  <textarea
                    rows={2}
                    value={getPageSeo(draftContent, seoActivePage).description || (seoActivePage === 'home' ? (draftContent?.seo?.global?.defaultDescription || '') : '')}
                    onChange={(e) => {
                      const updatedSeo = {
                        ...(draftContent.seo || {}),
                        [seoActivePage]: {
                          ...(draftContent.seo?.[seoActivePage] || {}),
                          description: e.target.value
                        }
                      };
                      if (seoActivePage === 'home') {
                        updatedSeo.global = { ...(draftContent.seo?.global || {}), defaultDescription: e.target.value };
                      }
                      setDraftContent({
                        ...draftContent,
                        hasUnpublishedChanges: true,
                        seo: updatedSeo
                      });
                    }}
                    placeholder="Официальный завод сантехники LAUTE. Латунь CW617N, картриджи Sedal, PVD-покрытие. B2B поставки, оптовые склады в Алматы, Новосибирске и Москве."
                  />
                </div>

                <div className="modal-form-grid" style={{ marginTop: 14 }}>
                  <div className="form-group">
                    <label>Канонический URL (Canonical):</label>
                    <input
                      type="text"
                      value={getPageSeo(draftContent, seoActivePage).canonical || `https://laute.ltd/${seoActivePage === 'home' ? '' : seoActivePage}`}
                      onChange={(e) => {
                        const updatedSeo = {
                          ...(draftContent.seo || {}),
                          [seoActivePage]: {
                            ...(draftContent.seo?.[seoActivePage] || {}),
                            canonical: e.target.value
                          }
                        };
                        setDraftContent({
                          ...draftContent,
                          hasUnpublishedChanges: true,
                          seo: updatedSeo
                        });
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Директива индексирования (Robots):</label>
                    <select
                      className="admin-select"
                      value={getPageSeo(draftContent, seoActivePage).robots || 'index, follow'}
                      onChange={(e) => {
                        const updatedSeo = {
                          ...(draftContent.seo || {}),
                          [seoActivePage]: {
                            ...(draftContent.seo?.[seoActivePage] || {}),
                            robots: e.target.value
                          }
                        };
                        setDraftContent({
                          ...draftContent,
                          hasUnpublishedChanges: true,
                          seo: updatedSeo
                        });
                      }}
                    >
                      <option value="index, follow">index, follow (Разрешить индексацию)</option>
                      <option value="noindex, follow">noindex, follow (Скрыть из поиска, переходить по ссылкам)</option>
                      <option value="noindex, nofollow">noindex, nofollow (Полностью запретить)</option>
                    </select>
                  </div>
                </div>

                {/* Google SERP Snippet Preview */}
                <div className="serp-preview-box" style={{ marginTop: 20 }}>
                  <span className="serp-label">Предпросмотр сниппета в результатах поиска Google:</span>
                  <div className="serp-card">
                    <span className="serp-url">
                      https://laute.ltd{seoActivePage === 'home' ? '' : `/${seoActivePage}`}
                    </span>
                    <h4 className="serp-title">
                      {getPageSeo(draftContent, seoActivePage).title || draftContent?.seo?.global?.defaultTitle || 'LAUTE — Премиальная сантехника'}
                    </h4>
                    <p className="serp-desc">
                      {getPageSeo(draftContent, seoActivePage).description || draftContent?.seo?.global?.defaultDescription || 'Официальный производитель сантехники LAUTE.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: ЧЕРНОВИКИ И ПУБЛИКАЦИИ */}
          {activeTab === 'drafts' && (
            <div className="admin-view drafts-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">Черновики и публикации</h2>
                  <p className="view-subtitle">Управление жизненным циклом контента: сохранение, предпросмотр и публикация на витрину</p>
                </div>
              </div>

              <div className="admin-section-card">
                <div className="draft-state-box">
                  <div className="state-badge-row">
                    <span className={`status-pill ${draftContent?.hasUnpublishedChanges ? 'pending' : 'synced'}`}>
                      {draftContent?.hasUnpublishedChanges ? 'Есть черновик в работе' : 'Все изменения опубликованы'}
                    </span>
                    <span className="version-pill">Версия сайта: {draftContent?.version || '1.0.0'}</span>
                  </div>

                  <h3>
                    {draftContent?.hasUnpublishedChanges 
                      ? 'В системе есть правки, ожидающие публикации на сайте'
                      : 'Текущий контент на сайте полностью актуален'
                    }
                  </h3>

                  <p className="state-desc">
                    При публикации создаётся неизменяемый архивный снимок предыдущей версии контента. 
                    В случае ошибки можно мгновенно вернуться к любому предыдущему состоянию через раздел «История изменений».
                  </p>

                  <div className="draft-actions-row">
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-success admin-btn-lg"
                      onClick={handlePublish}
                      disabled={isPublishing || !draftContent?.hasUnpublishedChanges}
                    >
                      <Check size={16} />
                      <span>{isPublishing ? 'Публикация...' : 'Опубликовать все изменения на сайте'}</span>
                    </button>

                    <button 
                      type="button" 
                      className="admin-btn admin-btn-outline admin-btn-lg"
                      onClick={handleDiscardDraft}
                      disabled={!draftContent?.hasUnpublishedChanges}
                    >
                      <RotateCcw size={16} />
                      <span>Отменить правки черновика</span>
                    </button>
                  </div>

                  {contentBackupsList.length > 0 && (
                    <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--adm-border)' }}>
                      <h4 style={{ fontSize: 15, marginBottom: 8, color: 'var(--adm-text-primary)' }}>
                        Точки восстановления версий контента ({contentBackupsList.length})
                      </h4>
                      <p className="cell-muted" style={{ marginBottom: 14 }}>
                        Вы можете в любой момент откатить опубликованный контент к любой из предыдущих сохранённых версий:
                      </p>
                      <div className="admin-table-wrapper">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Дата и время</th>
                              <th>Версия</th>
                              <th>Снимок / Описание</th>
                              <th>Сессия</th>
                              <th style={{ width: 140 }}>Действие</th>
                            </tr>
                          </thead>
                          <tbody>
                            {contentBackupsList.map((cb) => (
                              <tr key={cb.backupId}>
                                <td className="cell-time">{new Date(cb.timestamp).toLocaleString('ru-RU')}</td>
                                <td><span className="version-pill">v{cb.version || '1.0.0'}</span></td>
                                <td><strong>{cb.description}</strong></td>
                                <td className="cell-muted">{cb.sessionId || 'Администратор'}</td>
                                <td>
                                  <button
                                    type="button"
                                    className="admin-btn admin-btn-danger admin-btn-xs"
                                    onClick={async () => {
                                      if (window.confirm(`Восстановить сайт к версии от ${new Date(cb.timestamp).toLocaleString('ru-RU')}?`)) {
                                        try {
                                          const res = await rollbackSiteContent(cb.backupId);
                                          setDraftContent(res.content);
                                          setSiteContent(res.content);
                                          reloadSiteContent();
                                          showNotice(`Сайт успешно восстановлен к версии ${res.restoredVersion}`);
                                        } catch (err) {
                                          showNotice(err.message, 'error');
                                        }
                                      }
                                    }}
                                  >
                                    <RotateCcw size={13} />
                                    <span>Восстановить</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: ИСТОРИЯ И БЭКАПЫ */}
          {activeTab === 'history' && (
            <div className="admin-view history-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">История изменений</h2>
                  <p className="view-subtitle">Журнал всех операций и мгновенный откат каталога или контента к любому снимку</p>
                </div>
              </div>

              {/* Backups List */}
              <div className="admin-section-card">
                <h3 className="card-section-title">Резервные копии каталога ({backupsList.length})</h3>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Время создания</th>
                        <th>Описание операции</th>
                        <th>Позиций</th>
                        <th>Сессия</th>
                        <th>Действие</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backupsList.map((b) => (
                        <tr key={b.backupId}>
                          <td className="cell-time">{new Date(b.timestamp).toLocaleString('ru-RU')}</td>
                          <td><strong>{b.description}</strong></td>
                          <td>{b.productsCount} товаров</td>
                          <td className="cell-muted">{b.sessionId}</td>
                          <td>
                            <button
                              type="button"
                              className="admin-btn admin-btn-danger admin-btn-xs"
                              onClick={async () => {
                                if (window.confirm(`Откатить базу каталога к снимку от ${new Date(b.timestamp).toLocaleString('ru-RU')}?`)) {
                                  try {
                                    await rollbackToBackup(b.backupId);
                                    loadCatalogData();
                                    loadHistoryData();
                                    showNotice(`Каталог успешно восстановлен к снимку ${b.backupId}`);
                                  } catch (err) {
                                    showNotice(err.message, 'error');
                                  }
                                }
                              }}
                            >
                              <RotateCcw size={13} />
                              <span>Откатить</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Full Audit Logs */}
              <div className="admin-section-card">
                <h3 className="card-section-title">Журнал безопасности и операций</h3>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Время</th>
                        <th>Тип</th>
                        <th>Описание</th>
                        <th>Сессия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="cell-time">{new Date(log.timestamp).toLocaleString('ru-RU')}</td>
                          <td><span className="log-action-tag">{log.actionTitle || log.action}</span></td>
                          <td>{log.summary}</td>
                          <td className="cell-muted">{log.sessionId || 'Система'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: НАСТРОЙКИ */}
          {activeTab === 'settings' && (
            <div className="admin-view settings-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">Настройки</h2>
                  <p className="view-subtitle">Смена мастер-пароля администратора, выгрузка полной базы данных и технические параметры</p>
                </div>
              </div>

              {/* Change Password Card */}
              <div className="admin-section-card">
                <h3 className="card-section-title">Пароль</h3>
                <p className="section-desc">
                  Доступ ко всей административной панели осуществляется по единственному безопасному мастер-паролю.
                  Пароль проверяется сервером. Сессия требуется для изменения данных.
                </p>

                {passwordChangeMsg && (
                  <div className="admin-alert-box info" style={{ marginBottom: 16 }}>
                    {passwordChangeMsg}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="settings-form">
                  <div className="form-group">
                    <label>Текущий пароль администратора:</label>
                    <input
                      type="password"
                      value={oldPasswordChange}
                      onChange={(e) => setOldPasswordChange(e.target.value)}
                      required
                      placeholder="Введите текущий пароль..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Новый пароль (минимум 6 символов):</label>
                    <input
                      type="password"
                      value={newPasswordChange}
                      onChange={(e) => setNewPasswordChange(e.target.value)}
                      required
                      placeholder="Новый сложный пароль..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Повторите новый пароль:</label>
                    <input
                      type="password"
                      value={newPasswordConfirm}
                      onChange={(e) => setNewPasswordConfirm(e.target.value)}
                      required
                      placeholder="Подтверждение нового пароля..."
                    />
                  </div>

                  <button type="submit" className="admin-btn admin-btn-primary">
                    <Lock size={14} />
                    <span>Сохранить новый пароль</span>
                  </button>
                </form>
              </div>

              {/* Full System Backup Export */}
              <div className="admin-section-card">
                <h3 className="card-section-title">Резервная копия</h3>
                <p className="section-desc">
                  Товары, страницы и настройки одним файлом.
                </p>

                <button 
                  type="button" 
                  className="admin-btn admin-btn-outline"
                  onClick={downloadFullSystemBackup}
                >
                  <Download size={14} />
                  <span>Скачать резервную копию</span>
                </button>
              </div>

              {/* System Diagnostics */}
              <div className="admin-section-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 className="card-section-title" style={{ margin: 0 }}>Подключение</h3>
                    <p className="section-desc" style={{ margin: '4px 0 0 0' }}>
                      Состояние базы и фотографий.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    onClick={handleRunDiagnostics}
                    disabled={isCheckingDiagnostics}
                  >
                    <RefreshCw size={14} className={isCheckingDiagnostics ? 'spin' : ''} />
                    <span>{isCheckingDiagnostics ? 'Диагностика...' : 'Проверить подключение'}</span>
                  </button>
                </div>

                <div className="sys-params-grid">
                  <div className="param-item">
                    <span className="param-label">База данных PostgreSQL:</span>
                    <span className="param-val" style={{ color: diagnosticsResult?.database?.status === 'connected' ? 'var(--admin-success, #10b981)' : 'var(--admin-danger, #ef4444)', fontWeight: 600 }}>
                      {diagnosticsResult ? (diagnosticsResult.database?.status === 'connected' ? `✓ Подключено (${diagnosticsResult.database.latencyMs} мс)` : `✕ ${diagnosticsResult.database?.details || 'Недоступно'}`) : 'Проверка выполняется...'}
                    </span>
                  </div>
                  <div className="param-item">
                    <span className="param-label">Облачное хранилище (Storage):</span>
                    <span className="param-val" style={{ color: diagnosticsResult?.storage?.status === 'connected' ? 'var(--admin-success, #10b981)' : 'var(--admin-danger, #ef4444)', fontWeight: 600 }}>
                      {diagnosticsResult ? (diagnosticsResult.storage?.status === 'connected' ? `✓ Подключено (${diagnosticsResult.storage.latencyMs} мс)` : `✕ ${diagnosticsResult.storage?.details || 'Недоступно'}`) : 'Проверка выполняется...'}
                    </span>
                  </div>
                  <div className="param-item">
                    <span className="param-label">Хостинг и Backend API:</span>
                    <span className="param-val" style={{ color: 'var(--admin-text, #1e293b)' }}>
                      {diagnosticsResult ? (diagnosticsResult.backend?.status === 'connected' ? `✓ ${diagnosticsResult.backend.details}` : 'GitHub Pages: серверный API недоступен') : 'Проверка выполняется...'}
                    </span>
                  </div>
                  <div className="param-item">
                    <span className="param-label">Безопасность и авторизация:</span>
                    <span className="param-val" style={{ color: 'var(--admin-success, #10b981)', fontWeight: 600 }}>
                      Авторизация через Supabase; параметры защиты проверяются на сервере
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              RENDER: ЗАЯВКИ ИЗ КОРЗИНЫ И ТЕРРИТОРИИ МЕНЕДЖЕРОВ
          ------------------------------------------------------------- */}
          {activeTab === 'orders' && (
            <div className="admin-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">Заявки</h2>
                  <p className="view-subtitle">
                    Настройка правил «Территория → Ответственный менеджер → Email менеджера» и обработка первичных заявок без регистрации
                  </p>
                </div>
                <div className="view-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    onClick={loadOrdersAndTerritories}
                    disabled={isLoadingOrders}
                  >
                    <RefreshCw size={14} />
                    <span>Обновить список</span>
                  </button>
                </div>
              </div>

              {/* БЛОК 1: НАСТРОЙКА РАСПРЕДЕЛЕНИЯ МЕНЕДЖЕРОВ ПО ТЕРРИТОРИЯМ */}
              <div className="admin-section-card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
                  <div>
                    <h3 className="card-section-title" style={{ marginBottom: 4 }}>
                      Правила распределения: Территория → Ответственный менеджер → Email
                    </h3>
                    <p className="section-desc" style={{ margin: 0 }}>
                      При отправке заявки из корзины система сопоставляет указанный клиентом город со списком городов территории. Если территория не назначена, заявка сохраняется со статусом «Ожидает назначения».
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn-outline admin-btn-sm"
                      onClick={handleAddTerritoryRule}
                    >
                      <Plus size={14} />
                      <span>Добавить территорию</span>
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary admin-btn-sm"
                      onClick={handleSaveTerritoryRules}
                      disabled={isSavingTerritories}
                    >
                      <Save size={14} />
                      <span>{isSavingTerritories ? 'Сохранение...' : 'Сохранить правила территорий'}</span>
                    </button>
                  </div>
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: '22%' }}>Территория / Федеральный округ</th>
                        <th style={{ width: '34%' }}>Города территории (через запятую)</th>
                        <th style={{ width: '22%' }}>Ответственный менеджер / Отдел</th>
                        <th style={{ width: '16%' }}>Email менеджера</th>
                        <th style={{ width: '6%' }}>Действие</th>
                      </tr>
                    </thead>
                    <tbody>
                      {territoryRulesList.map((rule) => (
                        <tr key={rule.id}>
                          <td>
                            <input
                              type="text"
                              className="inline-edit-input"
                              style={{ width: '100%' }}
                              value={rule.territoryName || ''}
                              onChange={(e) => handleUpdateTerritoryField(rule.id, 'territoryName', e.target.value)}
                              placeholder="Название территории..."
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="inline-edit-input"
                              style={{ width: '100%' }}
                              value={Array.isArray(rule.cities) ? rule.cities.join(', ') : rule.cities || ''}
                              onChange={(e) =>
                                handleUpdateTerritoryField(
                                  rule.id,
                                  'cities',
                                  e.target.value.split(',').map((c) => c.trim())
                                )
                              }
                              placeholder="Новосибирск, Омск, Томск..."
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="inline-edit-input"
                              style={{ width: '100%' }}
                              value={rule.managerName || ''}
                              onChange={(e) => handleUpdateTerritoryField(rule.id, 'managerName', e.target.value)}
                              placeholder="ФИО или отдел продаж..."
                            />
                          </td>
                          <td>
                            <input
                              type="email"
                              className="inline-edit-input"
                              style={{ width: '100%' }}
                              value={rule.managerEmail || ''}
                              onChange={(e) => handleUpdateTerritoryField(rule.id, 'managerEmail', e.target.value)}
                              placeholder="manager@laute.ltd"
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="admin-btn admin-btn-ghost admin-btn-xs danger"
                              onClick={() => handleRemoveTerritoryRule(rule.id)}
                              title="Удалить территорию"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* БЛОК 2: ЖУРНАЛ ПОСТУПИВШИХ ЗАЯВОК ИЗ КОРЗИНЫ */}
              <div className="admin-section-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                  <div>
                    <h3 className="card-section-title" style={{ marginBottom: 4 }}>
                      Реестр поступивших заявок ({orderInquiriesList.length})
                    </h3>
                    <p className="section-desc" style={{ margin: 0 }}>
                      Заявки, отправленные посетителями без регистрации через публичный каталог
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className={`admin-btn admin-btn-xs ${orderFilterStatus === 'all' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                      onClick={() => setOrderFilterStatus('all')}
                    >
                      Все ({orderInquiriesList.length})
                    </button>
                    <button
                      type="button"
                      className={`admin-btn admin-btn-xs ${orderFilterStatus === 'pending_assignment' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                      onClick={() => setOrderFilterStatus('pending_assignment')}
                    >
                      Ожидают назначения ({pendingOrdersCount})
                    </button>
                    <button
                      type="button"
                      className={`admin-btn admin-btn-xs ${orderFilterStatus === 'assigned' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                      onClick={() => setOrderFilterStatus('assigned')}
                    >
                      Назначены ({orderInquiriesList.length - pendingOrdersCount})
                    </button>
                  </div>
                </div>

                {orderInquiriesList.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--adm-text-secondary)' }}>
                    Поступивших заявок пока нет.
                  </div>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Номер и дата</th>
                          <th>Клиент и контакты</th>
                          <th>Город</th>
                          <th>Территория и менеджер</th>
                          <th>Состав заявки (SKU)</th>
                          <th>Сумма</th>
                          <th>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderInquiriesList
                          .filter((ord) =>
                            orderFilterStatus === 'all' ? true : ord.routing?.status === orderFilterStatus
                          )
                          .map((ord) => (
                            <tr key={ord.inquiryNumber}>
                              <td>
                                <div>
                                  <code>{ord.inquiryNumber}</code>
                                </div>
                                <small className="cell-muted">
                                  {ord.createdAt ? new Date(ord.createdAt).toLocaleString('ru-RU') : '—'}
                                </small>
                              </td>
                              <td>
                                <div>
                                  <strong>{isDemoMode ? maskCustomerName(ord.customer?.name) : ord.customer?.name}</strong>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--adm-accent-blue)' }}>
                                  {isDemoMode ? maskCustomerContact(ord.customer?.contact) : ord.customer?.contact}
                                </div>
                                {ord.customer?.comment && (
                                  <div style={{ fontSize: 11, color: 'var(--adm-text-muted)', marginTop: 3 }}>
                                    «{isDemoMode ? '*** [Скрыто в демо-режиме]' : ord.customer.comment}»
                                  </div>
                                )}
                              </td>
                              <td>
                                <strong>{ord.customer?.city}</strong>
                              </td>
                              <td>
                                {ord.routing?.status === 'assigned' ? (
                                  <div>
                                    <span className="stat-tag success" style={{ marginBottom: 4, display: 'inline-block' }}>
                                      Назначен менеджер
                                    </span>
                                    <div style={{ fontSize: 12 }}>
                                      <strong>{ord.routing.territoryName}</strong>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--adm-text-secondary)' }}>
                                      {ord.routing.managerName} ({ord.routing.managerEmail})
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="stat-tag warning" style={{ marginBottom: 6, display: 'inline-block' }}>
                                      Ожидает назначения
                                    </span>
                                    <div>
                                      <select
                                        className="admin-select"
                                        style={{ fontSize: 12, padding: '4px 8px' }}
                                        defaultValue=""
                                        onChange={(e) => {
                                          if (e.target.value) {
                                            handleAssignOrderTerritory(ord.inquiryNumber, e.target.value);
                                          }
                                        }}
                                      >
                                        <option value="">Назначить территорию...</option>
                                        {territoryRulesList.map((r) => (
                                          <option key={r.id} value={r.id}>
                                            {r.territoryName} ({r.managerEmail})
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  {(ord.items || []).map((it, idx) => (
                                    <div key={idx} style={{ fontSize: 12 }}>
                                      <code>{it.article}</code> — {it.title} × <strong>{it.quantity} шт.</strong>
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td>
                                <strong>
                                  {ord.summary?.totalKnownAmount > 0
                                    ? `${Number(ord.summary.totalKnownAmount).toLocaleString('ru-RU')} ₽`
                                    : 'По запросу'}
                                </strong>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-ghost admin-btn-xs danger"
                                  onClick={() => handleDeleteOrderInquiry(ord.inquiryNumber)}
                                  title="Удалить заявку"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: EDIT / ADD PRODUCT */}
      {/* MODAL: EDIT / ADD PRODUCT (7 FULL SECTIONS) */}
      {(editingProduct || isAddingNewProduct) && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-window large" style={{ maxWidth: 940 }}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Package size={20} color="var(--adm-accent-blue)" />
                <div>
                  <h3 style={{ margin: 0, fontSize: 17 }}>
                    {isAddingNewProduct ? 'Добавление нового товара в каталог' : `Редактирование товара ${editingProduct?.article}`}
                  </h3>
                  <small style={{ color: 'var(--adm-text-muted)' }}>
                    {editingProduct?.name || 'LAUTE Premium Collection'}
                  </small>
                </div>
              </div>
              <button 
                type="button" 
                className="close-btn"
                onClick={() => { setEditingProduct(null); setIsAddingNewProduct(false); }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 7 Section Navigation Tabs */}
            <div className="modal-tabs-bar">
              <button
                type="button"
                className={`modal-tab-btn ${productModalTab === 'main' ? 'active' : ''}`}
                onClick={() => setProductModalTab('main')}
              >
                <Package size={14} />
                <span>Основное</span>
              </button>

              <button
                type="button"
                className={`modal-tab-btn ${productModalTab === 'specs' ? 'active' : ''}`}
                onClick={() => setProductModalTab('specs')}
              >
                <Sliders size={14} />
                <span>Характеристики</span>
              </button>

              <button
                type="button"
                className={`modal-tab-btn ${productModalTab === 'pricing' ? 'active' : ''}`}
                onClick={() => setProductModalTab('pricing')}
              >
                <BarChart3 size={14} />
                <span>Цены</span>
              </button>

              <button
                type="button"
                className={`modal-tab-btn ${productModalTab === 'media' ? 'active' : ''}`}
                onClick={() => setProductModalTab('media')}
              >
                <ImageIcon size={14} />
                <span>Фото</span>
              </button>

              <button
                type="button"
                className={`modal-tab-btn ${productModalTab === 'publish' ? 'active' : ''}`}
                onClick={() => setProductModalTab('publish')}
              >
                <Eye size={14} />
                <span>Видимость</span>
              </button>

              <button
                type="button"
                className={`modal-tab-btn ${productModalTab === 'seo' ? 'active' : ''}`}
                onClick={() => setProductModalTab('seo')}
              >
                <Globe size={14} />
                <span>Для поиска</span>
              </button>

              <button
                type="button"
                className={`modal-tab-btn ${productModalTab === 'stock' ? 'active' : ''}`}
                onClick={() => setProductModalTab('stock')}
              >
                <Boxes size={14} />
                <span>Склады</span>
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (isDemoMode) {
                  showNotice('В демонстрационном режиме сохранение изменений товаров заблокировано.');
                  return;
                }
                setIsSavingProduct(true);
                try {
                  if (isAddingNewProduct) {
                    await addProduct(editingProduct);
                    showNotice(`Товар ${editingProduct.article} добавлен в каталог`);
                  } else {
                    await updateProduct(editingProduct.article, editingProduct);
                    showNotice(`Товар ${editingProduct.article} успешно сохранён`);
                  }
                  setEditingProduct(null);
                  setIsAddingNewProduct(false);
                  loadCatalogData();
                } catch (err) {
                  showNotice(err.message, 'error');
                } finally {
                  setIsSavingProduct(false);
                }
              }}
              className="admin-modal-form"
            >
              {/* TAB 1: ОСНОВНАЯ ИНФОРМАЦИЯ */}
              {productModalTab === 'main' && (
                <div className="modal-tab-pane">
                  <div className="modal-form-grid">
                    <div className="form-group">
                      <label>Артикул *:</label>
                      <input
                        type="text"
                        required
                        disabled={!isAddingNewProduct}
                        value={editingProduct?.article || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, article: e.target.value })}
                        placeholder="Например, LT-K101-CHR"
                      />
                    </div>

                    <div className="form-group">
                      <label>Название товара *:</label>
                      <input
                        type="text"
                        required
                        value={editingProduct?.name || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        placeholder="Полное наименование изделия..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Категория *:</label>
                      <select
                        value={editingProduct?.category || 'Кухонные смесители'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      >
                        {categoriesList.map((c) => (
                          <option key={c.id || c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Подкатегория / Тип:</label>
                      <input
                        type="text"
                        value={editingProduct?.subcategory || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, subcategory: e.target.value })}
                        placeholder="Например, Высокий излив с аэратором"
                      />
                    </div>

                    <div className="form-group">
                      <label>Коллекция:</label>
                      <input
                        type="text"
                        value={editingProduct?.collection || 'LAUTE Master Line'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, collection: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Бренд:</label>
                      <input
                        type="text"
                        value={editingProduct?.brand || 'LAUTE'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: 14 }}>
                    <label>Описание товара:</label>
                    <textarea
                      rows={4}
                      value={editingProduct?.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      placeholder="Подробное описание назначения и ключевых преимуществ модели..."
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: ХАРАКТЕРИСТИКИ */}
              {productModalTab === 'specs' && (
                <div className="modal-tab-pane">
                  <div className="modal-form-grid">
                    <div className="form-group">
                      <label>Материал корпуса:</label>
                      <input
                        type="text"
                        value={editingProduct?.material || 'Первичная латунь CW617N (евростандарт)'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Цвет:</label>
                      <input
                        type="text"
                        value={editingProduct?.color || 'Хром глянец'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, color: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Покрытие:</label>
                      <input
                        type="text"
                        value={editingProduct?.coating || 'Гальваническое хромирование / PVD'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, coating: e.target.value })}
                        placeholder="PVD, Хром, Матовый порошковый полимер"
                      />
                    </div>

                    <div className="form-group">
                      <label>Размеры (высота / вынос):</label>
                      <input
                        type="text"
                        value={editingProduct?.dimensions || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, dimensions: e.target.value })}
                        placeholder="Например, Высота: 295 мм, Вынос: 210 мм"
                      />
                    </div>

                    <div className="form-group">
                      <label>Тип установки:</label>
                      <input
                        type="text"
                        value={editingProduct?.installType || 'На раковину / столешницу'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, installType: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Назначение:</label>
                      <input
                        type="text"
                        value={editingProduct?.purpose || 'Для кухни / мойки'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, purpose: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Подключения:</label>
                      <input
                        type="text"
                        value={editingProduct?.connections || 'G 1/2", гибкая подводка 500 мм в оплетке'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, connections: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Гарантия производителя:</label>
                      <input
                        type="text"
                        value={editingProduct?.warranty || '5 лет (на корпус 7 лет)'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, warranty: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: 14 }}>
                    <label>Комплектация:</label>
                    <input
                      type="text"
                      value={editingProduct?.kit || 'Смеситель, гибкая подводка, стабилизирующая пластина, комплект быстрого монтажа'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, kit: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: 14 }}>
                    <label>Технические характеристики (дополнительно):</label>
                    <textarea
                      rows={3}
                      value={editingProduct?.specs || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, specs: e.target.value })}
                      placeholder="Керамический картридж Sedal 35 мм (Испания), аэратор Neoperl с защитой от известковых отложений..."
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: ЦЕНЫ */}
              {productModalTab === 'pricing' && (
                <div className="modal-tab-pane">
                  <div className="modal-form-grid">
                    <div className="form-group">
                      <label>Публичная цена на сайте *:</label>
                      <div className="input-with-currency">
                        <input
                          type="number"
                          required
                          min="0"
                          step="100"
                          value={editingProduct?.price || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                          placeholder="28900"
                        />
                        <span className="currency-label">{editingProduct?.currency || '₸'}</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Валюта расчёта:</label>
                      <select
                        value={editingProduct?.currency || '₸'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, currency: e.target.value })}
                      >
                        <option value="₸">₸ (Тенге KZT)</option>
                        <option value="₽">₽ (Рубль RUB)</option>
                        <option value="$">$ (Доллар USD)</option>
                        <option value="€">€ (Евро EUR)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Статус цены:</label>
                      <select
                        value={editingProduct?.priceStatus || 'regular'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, priceStatus: e.target.value })}
                      >
                        <option value="regular">Стандартная цена</option>
                        <option value="promo">Специальное предложение (Акция)</option>
                        <option value="on_request">По запросу дистрибьютора</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ФОТОГРАФИИ И МЕДИА */}
              {productModalTab === 'media' && (
                <div className="modal-tab-pane">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <ImageFieldEditor
                      label="Основное фото:"
                      value={editingProduct?.photo1 || ''}
                      onChange={(url) => setEditingProduct({ ...editingProduct, photo1: url })}
                    />

                    <ImageFieldEditor
                      label="Второе фото:"
                      value={editingProduct?.photo2 || ''}
                      onChange={(url) => setEditingProduct({ ...editingProduct, photo2: url })}
                    />

                    <ImageFieldEditor
                      label="Третье фото:"
                      value={editingProduct?.photo3 || ''}
                      onChange={(url) => setEditingProduct({ ...editingProduct, photo3: url })}
                    />

                    <ImageFieldEditor
                      label="Чертёж:"
                      value={editingProduct?.drawing || ''}
                      onChange={(url) => setEditingProduct({ ...editingProduct, drawing: url })}
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: 16 }}>
                    <label>Ссылка на паспорт изделия / технический лист (PDF):</label>
                    <input
                      type="text"
                      value={editingProduct?.documentUrl || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, documentUrl: e.target.value })}
                      placeholder="docs/laute-passports/LT-K101.pdf"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: ПУБЛИКАЦИЯ */}
              {productModalTab === 'publish' && (
                <div className="modal-tab-pane">
                  <div className="modal-form-grid">
                    <div className="form-group">
                      <label>Статус публикации:</label>
                      <select
                        value={editingProduct?.status || 'АКТИВЕН'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                      >
                        <option value="АКТИВЕН">АКТИВЕН (Опубликован на сайте)</option>
                        <option value="СКРЫТ">СКРЫТ (Снят с витрины)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Режим черновика:</label>
                      <select
                        value={editingProduct?.isDraft ? 'draft' : 'live'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isDraft: e.target.value === 'draft' })}
                      >
                        <option value="live">Готов к публикации</option>
                        <option value="draft">В работе (черновик)</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-alert-banner" style={{ marginTop: 16 }}>
                    <Info size={16} />
                    <span>
                      Товары со статусом «АКТИВЕН» мгновенно появляются в поисковой выдаче и фильтрах каталога LAUTE после сохранения.
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 6: SEO */}
              {productModalTab === 'seo' && (
                <div className="modal-tab-pane">
                  <div className="form-group">
                    <label>SEO Title (Заголовок сниппета):</label>
                    <input
                      type="text"
                      value={editingProduct?.seoTitle || `${editingProduct?.name || ''} ${editingProduct?.article || ''} | LAUTE Официальный сайт`}
                      onChange={(e) => setEditingProduct({ ...editingProduct, seoTitle: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>SEO Meta Description (Описание):</label>
                    <textarea
                      rows={2}
                      value={editingProduct?.seoDescription || `${editingProduct?.name || ''}. Первичная латунь CW617N, картридж Sedal. Купить оптом и в розницу у официального производителя LAUTE.`}
                      onChange={(e) => setEditingProduct({ ...editingProduct, seoDescription: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>ЧПУ URL (Slug):</label>
                    <input
                      type="text"
                      value={editingProduct?.slug || editingProduct?.article?.toLowerCase().replace(/[^a-z0-9]/g, '-') || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                    />
                  </div>

                  <div className="serp-preview-box" style={{ marginTop: 16 }}>
                    <span className="serp-label">Предпросмотр в выдаче Google:</span>
                    <div className="serp-card">
                      <span className="serp-url">https://laute.ltd/catalog/{editingProduct?.article?.toLowerCase()}</span>
                      <h4 className="serp-title">{editingProduct?.seoTitle || `${editingProduct?.name} | LAUTE`}</h4>
                      <p className="serp-desc">{editingProduct?.seoDescription || editingProduct?.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: СКЛАДЫ (ОСТАТКИ ПО ВСЕМ СКЛАДАМ ДЛЯ ЭТОГО ТОВАРА) */}
              {productModalTab === 'stock' && (
                <div className="modal-tab-pane">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#FFFFFF' }}>Складские запасы товара {editingProduct?.article}</h4>
                      <small className="cell-muted">Управление количеством на каждом региональном терминале</small>
                    </div>
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost admin-btn-xs"
                      onClick={() => {
                        setEditingProduct(null);
                        setActiveTab('stock');
                      }}
                    >
                      <Boxes size={12} />
                      <span>Перейти в полный раздел складов</span>
                    </button>
                  </div>

                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Склад</th>
                          <th>Город / Страна</th>
                          <th style={{ width: 140 }}>Остаток (шт.)</th>
                          <th>Статус</th>
                          <th style={{ width: 100 }}>Действие</th>
                        </tr>
                      </thead>
                      <tbody>
                        {warehousesList.map(wh => {
                          const sItem = stockList.find(s => s.sku === editingProduct?.article && s.warehouseId === wh.id);
                          const currentQty = sItem ? sItem.quantity : null;
                          const editKey = `${editingProduct?.article}_${wh.id}`;
                          const hasLocalEdit = stockLocalEdits[editKey] !== undefined;
                          const displayVal = hasLocalEdit ? stockLocalEdits[editKey] : (currentQty !== null ? currentQty : '');

                          return (
                            <tr key={wh.id}>
                              <td><strong>{wh.name}</strong></td>
                              <td>{wh.city ? `${wh.city}, ${wh.country}` : wh.country}</td>
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  className="inline-edit-input"
                                  style={{ width: 90 }}
                                  value={displayVal}
                                  placeholder="—"
                                  onChange={(e) => {
                                    setStockLocalEdits(prev => ({ ...prev, [editKey]: e.target.value }));
                                  }}
                                />
                              </td>
                              <td>
                                {currentQty !== null ? (
                                  currentQty > 0 ? (
                                    <span className="stat-tag success">{currentQty} шт.</span>
                                  ) : (
                                    <span className="stat-tag danger">0 шт. (нет)</span>
                                  )
                                ) : (
                                  <span className="cell-muted">Не загружен</span>
                                )}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-primary admin-btn-xs"
                                  onClick={async () => {
                                    const val = parseInt(displayVal, 10);
                                    if (isNaN(val) || val < 0) {
                                      showNotice('Укажите корректный остаток', 'error');
                                      return;
                                    }
                                    await handleSaveMatrixCell(wh.id, editingProduct.article, val);
                                    setStockLocalEdits(prev => {
                                      const copy = { ...prev };
                                      delete copy[editKey];
                                      return copy;
                                    });
                                  }}
                                >
                                  <Save size={12} />
                                  <span>Сохранить</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => { setEditingProduct(null); setIsAddingNewProduct(false); }}
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={isSavingProduct}
                >
                  <Save size={14} />
                  <span>{isSavingProduct ? 'Сохранение...' : 'Сохранить'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MASS STOCK EDIT */}
      {isMassStockModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <div className="modal-header-title">
                <Boxes size={18} />
                <h3>Массовое изменение складских остатков</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsMassStockModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-alert-banner" style={{ marginBottom: 16 }}>
                <Info size={16} />
                <span>
                  Выбрано позиций для обновления: <strong>{selectedStockSkus.length} шт.</strong>
                </span>
              </div>

              <div className="form-group">
                <label>Целевой филиал / склад:</label>
                <select
                  value={massStockTargetWh}
                  onChange={(e) => setMassStockTargetWh(e.target.value)}
                  className="admin-select"
                >
                  <option value="all">Все склады одновременно ({warehousesList.length})</option>
                  {warehousesList.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.city || w.country})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Операция:</label>
                <select
                  value={massStockAction}
                  onChange={(e) => setMassStockAction(e.target.value)}
                  className="admin-select"
                >
                  <option value="set">Установить точное значение (шт.)</option>
                  <option value="add">Прибавить к текущему остатку (+ шт.)</option>
                  <option value="subtract">Списать из остатка (- шт.)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Количество (физических единиц):</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="admin-input"
                  placeholder="Например, 25"
                  value={massStockQty}
                  onChange={(e) => setMassStockQty(e.target.value)}
                />
              </div>

              <div className="admin-modal-footer" style={{ marginTop: 20 }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => setIsMassStockModalOpen(false)}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  disabled={isMassStockSaving || !massStockQty}
                  onClick={handleApplyMassStockEdit}
                >
                  <Check size={14} />
                  <span>{isMassStockSaving ? 'Применение...' : 'Применить массовое обновление'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MEDIA DETAIL & PRODUCT ATTACH */}
      {mediaDetailModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card" style={{ maxWidth: 540 }}>
            <div className="admin-modal-header">
              <div className="modal-header-title">
                <ImageIcon size={18} />
                <h3>Медиафайл: {mediaDetailModal.name}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setMediaDetailModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <img
                  src={resolveMediaUrl(mediaDetailModal.url)}
                  alt={mediaDetailModal.name}
                  style={{ maxHeight: 220, maxWidth: '100%', objectFit: 'contain', borderRadius: 8, border: '1px solid var(--adm-border)' }}
                />
              </div>

              <div style={{ fontSize: 13, color: 'var(--adm-text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                <div><strong>Путь в проекте:</strong> <code>{mediaDetailModal.url}</code></div>
                <div><strong>Размер:</strong> {(mediaDetailModal.size / 1024).toFixed(1)} KB</div>
              </div>

              <div style={{ borderTop: '1px solid var(--adm-border)', paddingTop: 14 }}>
                <h4 style={{ fontSize: 14, color: '#FFFFFF', margin: '0 0 10px 0' }}>Быстрая привязка к товару в каталоге:</h4>
                <div className="form-group">
                  <label>Выберите товар из номенклатуры:</label>
                  <select
                    className="admin-select"
                    value={mediaAttachProductSku}
                    onChange={(e) => setMediaAttachProductSku(e.target.value)}
                  >
                    <option value="">-- Выберите товар (SKU) --</option>
                    {catalogList.map(p => (
                      <option key={p.article} value={p.article}>
                        {p.article} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Слот изображения:</label>
                  <select
                    className="admin-select"
                    value={mediaAttachSlot}
                    onChange={(e) => setMediaAttachSlot(e.target.value)}
                  >
                    <option value="photo1">Основное фото</option>
                    <option value="photo2">Второе фото</option>
                    <option value="photo3">Третье фото</option>
                    <option value="drawing">Чертёж</option>
                  </select>
                </div>

                <div className="admin-modal-footer" style={{ marginTop: 16 }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline"
                    onClick={() => setMediaDetailModal(null)}
                  >
                    Закрыть
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    disabled={!mediaAttachProductSku || isAttachingMedia}
                    onClick={handleAttachMediaToProduct}
                  >
                    <Check size={14} />
                    <span>Привязать к товару</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW MODAL */}
      {previewModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-window large">
            <div className="admin-modal-header">
              <h3>Предварительный просмотр витрины сайта</h3>
              <button 
                type="button" 
                className="close-btn"
                onClick={() => setPreviewModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="editor-simulator-bar">
              <span style={{ fontSize: 12, color: 'var(--adm-text-muted)', marginRight: 8 }}>Эмуляция устройства:</span>
              <button
                type="button"
                className={`simulator-btn ${editorSimulatorMode === 'desktop' ? 'active' : ''}`}
                onClick={() => setEditorSimulatorMode('desktop')}
              >
                <Monitor size={15} />
                <span>Desktop (100%)</span>
              </button>
              <button
                type="button"
                className={`simulator-btn ${editorSimulatorMode === 'tablet' ? 'active' : ''}`}
                onClick={() => setEditorSimulatorMode('tablet')}
              >
                <Tablet size={15} />
                <span>Tablet (768px)</span>
              </button>
              <button
                type="button"
                className={`simulator-btn ${editorSimulatorMode === 'mobile' ? 'active' : ''}`}
                onClick={() => setEditorSimulatorMode('mobile')}
              >
                <Smartphone size={15} />
                <span>Mobile (375px)</span>
              </button>
            </div>

            <div className="simulator-preview-wrapper" style={{ maxHeight: '68vh', overflowY: 'auto', padding: '10px 0' }}>
              <div className={`simulator-preview-frame ${editorSimulatorMode}`}>
                <div className="preview-content-box">
                  <p className="cell-muted" style={{ marginBottom: 16 }}>
                    Ниже отображаются внесённые вами изменения черновика перед публикацией:
                  </p>

                  <div style={{ marginBottom: 20 }}>
                    <span className="badge-tag" style={{ marginBottom: 8, display: 'inline-block' }}>Слайды главного экрана</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {draftContent?.homeBlocks?.heroSlider?.filter(s => s.isVisible !== false).map((slide, idx) => (
                        <div key={slide.id || idx} className="preview-hero-sample" style={{ padding: 20, textAlign: 'left', display: 'flex', gap: 16, alignItems: 'center' }}>
                          {slide.image && (
                            <div style={{ width: 100, height: 60, borderRadius: 6, overflow: 'hidden', minWidth: 100, background: '#000' }}>
                              <img 
                                src={resolveMediaUrl(slide.image)}
                                alt="Slide preview" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            </div>
                          )}
                          <div>
                            <span className="badge-refined" style={{ fontSize: 11 }}>{slide.tagline}</span>
                            <h3 style={{ color: '#FFFFFF', fontSize: 18, margin: '6px 0' }}>{slide.title}</h3>
                            <span style={{ fontSize: 12, color: 'var(--adm-accent-blue)' }}>Кнопка: «{slide.buttonText}»</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {draftContent?.homeBlocks?.materials && (
                    <div style={{ marginBottom: 20, padding: 16, background: 'var(--adm-surface-card)', borderRadius: 8, border: '1px solid var(--adm-border)' }}>
                      <span className="badge-tag" style={{ marginBottom: 8, display: 'inline-block' }}>Технологии & Материалы</span>
                      <div style={{ color: 'var(--adm-accent-blue)', fontSize: 12, fontWeight: 700 }}>{draftContent.homeBlocks.materials.badge}</div>
                      <h4 style={{ color: '#FFFFFF', margin: '4px 0 8px 0', fontSize: 16 }}>{draftContent.homeBlocks.materials.title}</h4>
                      <p style={{ color: 'var(--adm-text-secondary)', fontSize: 13, margin: 0 }}>{draftContent.homeBlocks.materials.desc}</p>
                    </div>
                  )}

                  {draftContent?.footer && (
                    <div style={{ padding: 16, background: 'var(--adm-surface-card)', borderRadius: 8, border: '1px solid var(--adm-border)' }}>
                      <span className="badge-tag" style={{ marginBottom: 8, display: 'inline-block' }}>Контакты и футер</span>
                      <p style={{ color: 'var(--adm-text-secondary)', fontSize: 13, margin: '4px 0' }}>
                        <strong>Адрес:</strong> {draftContent.footer.officeAddress}
                      </p>
                      <p style={{ color: 'var(--adm-text-secondary)', fontSize: 13, margin: '4px 0' }}>
                        <strong>Телефон:</strong> {draftContent.footer.phones?.[0]?.number}
                      </p>
                      <p style={{ color: 'var(--adm-text-secondary)', fontSize: 13, margin: '4px 0' }}>
                        <strong>Email:</strong> {draftContent.footer.emails?.[0]?.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={() => setPreviewModalOpen(false)}
              >
                Закрыть
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-success"
                onClick={() => {
                  setPreviewModalOpen(false);
                  handlePublish();
                }}
              >
                <Check size={14} />
                <span>Опубликовать эти изменения</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT WAREHOUSE */}
      {isWhModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <div className="modal-header-title">
                <Warehouse size={18} />
                <h3>{editingWh ? `Редактирование склада «${editingWh.name}»` : 'Добавить новый логистический склад'}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsWhModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveWh} className="admin-modal-body">
              {whFormError && (
                <div className="admin-alert-banner" style={{ padding: '8px 12px', marginBottom: 16 }}>
                  <AlertTriangle size={16} />
                  <span>{whFormError}</span>
                </div>
              )}

              <div className="form-group">
                <label>Идентификатор (slug):</label>
                <input
                  type="text"
                  value={whFormData.id}
                  disabled={Boolean(editingWh)}
                  placeholder="almaty, novosibirsk, moscow, china..."
                  onChange={(e) => setWhFormData({ ...whFormData, id: e.target.value })}
                  required
                />
                <span className="form-help-text">Уникальный системный код для связки с базой остатков.</span>
              </div>

              <div className="form-group">
                <label>Название склада (для интерфейса):</label>
                <input
                  type="text"
                  value={whFormData.name}
                  placeholder="Алматы, Новосибирск, Москва, Китай..."
                  onChange={(e) => setWhFormData({ ...whFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Страна:</label>
                  <input
                    type="text"
                    value={whFormData.country}
                    placeholder="Казахстан, Россия, КНР..."
                    onChange={(e) => setWhFormData({ ...whFormData, country: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Город:</label>
                  <input
                    type="text"
                    value={whFormData.city}
                    placeholder="Алматы, Москва..."
                    onChange={(e) => setWhFormData({ ...whFormData, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Физический адрес или комплекс:</label>
                <input
                  type="text"
                  value={whFormData.address}
                  placeholder="г. Алматы, пр. Райымбека, 212"
                  onChange={(e) => setWhFormData({ ...whFormData, address: e.target.value })}
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'center' }}>
                <div className="form-group">
                  <label>Приоритет в списке:</label>
                  <input
                    type="number"
                    min="1"
                    value={whFormData.priority}
                    onChange={(e) => setWhFormData({ ...whFormData, priority: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
                <div className="form-group" style={{ paddingTop: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={whFormData.isActive}
                      onChange={(e) => setWhFormData({ ...whFormData, isActive: e.target.checked })}
                    />
                    <span>Склад активен для выбора</span>
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer" style={{ marginTop: 24 }}>
                {editingWh && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger admin-btn-sm"
                    style={{ marginRight: 'auto' }}
                    onClick={() => handleDeleteWh(editingWh)}
                  >
                    <Trash2 size={14} />
                    <span>Удалить склад</span>
                  </button>
                )}
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => setIsWhModalOpen(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={isSavingWh}
                >
                  <Save size={14} />
                  <span>{isSavingWh ? 'Сохранение...' : 'Сохранить склад'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STOCK EXCEL DIFF PREVIEW & IMPORT */}
      {isStockExcelModalOpen && stockExcelDiff && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card wide">
            <div className="admin-modal-header">
              <div className="modal-header-title">
                <FileSpreadsheet size={18} />
                <h3>Предварительный просмотр импорта остатков: Склад «{stockExcelDiff.warehouseName || selectedWarehouseId}»</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setIsStockExcelModalOpen(false);
                  setStockExcelDiff(null);
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Import Mode Radio Selection */}
              <div className="import-mode-selector">
                <label className={`mode-card ${stockExcelMode === 'partial' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="stockMode"
                    value="partial"
                    checked={stockExcelMode === 'partial'}
                    onChange={() => setStockExcelMode('partial')}
                  />
                  <div>
                    <strong>Частичное обновление (Безопасный режим по умолчанию)</strong>
                    <p>Обновляются только позиции, указанные в Excel. Неуказанные артикулы на этом складе сохраняют текущее количество без изменений.</p>
                  </div>
                </label>

                <label className={`mode-card danger-mode ${stockExcelMode === 'replace' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="stockMode"
                    value="replace"
                    checked={stockExcelMode === 'replace'}
                    onChange={() => setStockExcelMode('replace')}
                  />
                  <div>
                    <strong>Полная замена остатков склада (Режим инвентаризации)</strong>
                    <p>Товары из Excel получат новые значения. Все остальные товары на складе «{stockExcelDiff.warehouseName}» будут обнулены (0 шт.).</p>
                  </div>
                </label>
              </div>

              {stockExcelMode === 'replace' && (
                <div className="admin-alert-banner" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.4)', margin: '16px 0' }}>
                  <AlertTriangle size={20} style={{ color: '#EF4444' }} />
                  <div>
                    <h4 style={{ color: '#EF4444', margin: '0 0 4px 0' }}>Требуется подтверждение полной замены</h4>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--adm-text-secondary)' }}>
                      Этот режим затрагивает ТОЛЬКО склад «{stockExcelDiff.warehouseName}». Остальные склады (Новосибирск, Москва, КНР) не будут затронуты.
                    </p>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, cursor: 'pointer', fontWeight: 600, color: '#FFFFFF' }}>
                      <input
                        type="checkbox"
                        checked={stockExcelReplaceAgreed}
                        onChange={(e) => setStockExcelReplaceAgreed(e.target.checked)}
                      />
                      <span>Я подтверждаю полную замену остатков на данном складе</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Stats Summary Chips */}
              <div className="diff-stats-chips">
                <span className="diff-chip success">Валидных строк: {stockExcelDiff.validCount || stockExcelDiff.diffList?.length || 0}</span>
                {stockExcelDiff.errorCount > 0 && (
                  <span className="diff-chip danger">Ошибок в файле: {stockExcelDiff.errorCount}</span>
                )}
                <span className="diff-chip info">Выбран склад: {stockExcelDiff.warehouseName}</span>
              </div>

              {/* Errors List */}
              {stockExcelDiff.errors && stockExcelDiff.errors.length > 0 && (
                <div className="excel-diff-errors-box">
                  <h4>Ошибки и предупреждения валидации ({stockExcelDiff.errors.length}):</h4>
                  <ul>
                    {stockExcelDiff.errors.map((err, eIdx) => (
                      <li key={eIdx}>
                        {typeof err === 'string' ? err : `Строка ${err.row}${err.sku ? ` (${err.sku})` : ''}: ${err.message}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Diff Preview Table */}
              <div className="admin-table-wrapper" style={{ maxHeight: 320, overflowY: 'auto' }}>
                <table className="admin-table diff-table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Наименование</th>
                      <th>Было</th>
                      <th>Станет</th>
                      <th>Разница</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockExcelDiff.diffList?.map((d) => (
                      <tr key={d.sku}>
                        <td><code>{d.sku}</code></td>
                        <td><strong>{d.name}</strong></td>
                        <td>{d.oldQuantity} шт.</td>
                        <td><strong>{d.newQuantity} шт.</strong></td>
                        <td>
                          <span className={`diff-delta ${d.diff > 0 ? 'plus' : d.diff < 0 ? 'minus' : 'zero'}`}>
                            {d.diff > 0 ? `+${d.diff}` : d.diff === 0 ? '0' : d.diff} шт.
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={() => {
                  setIsStockExcelModalOpen(false);
                  setStockExcelDiff(null);
                }}
              >
                Отмена
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-success"
                disabled={
                  isStockExcelConfirming ||
                  !stockExcelDiff.diffList ||
                  stockExcelDiff.diffList.length === 0 ||
                  (stockExcelMode === 'replace' && !stockExcelReplaceAgreed)
                }
                onClick={handleCommitStockExcel}
              >
                <Check size={14} />
                <span>{isStockExcelConfirming ? 'Применение...' : `Подтвердить и обновить склад «${stockExcelDiff.warehouseName}»`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
