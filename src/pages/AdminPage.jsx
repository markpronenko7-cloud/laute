import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  MapPin
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
  downloadFullSystemBackup
} from '../services/adminApi';
import '../styles/admin.css';

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

  const previewSrc = value 
    ? (value.startsWith('http') || value.startsWith('/') ? value : `${import.meta.env.BASE_URL}${value}`)
    : '';

  return (
    <div className="image-field-editor">
      {label && <label className="image-field-label">{label}</label>}
      <div className="image-field-controls">
        <div className="image-preview-thumbnail">
          {value ? (
            <img src={previewSrc} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
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
              <span>{isUploading ? 'Загрузка...' : 'Выбрать файл на компьютере'}</span>
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
            placeholder="или введите путь к файлу (например, images/hero/hero-slide-1.jpg)"
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
    setAdminSession 
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

  const handleEnterDemoMode = () => {
    setIsDemoMode(true);
    setIsAuthenticated(true);
    setAdminSession({
      id: 'demo_session',
      role: 'demo_inspector',
      isDemo: true,
      name: 'Ознакомительный просмотр'
    });
    showNotice('Включён ознакомительный режим. Доступен полный просмотр всех разделов.');
  };

  // Active Tab: 1 to 13
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notice, setNotice] = useState(null);

  // Content Draft State
  const [draftContent, setDraftContent] = useState(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
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

  // Categories State
  const [categoriesList, setCategoriesList] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);

  // Pages State
  const [pagesList, setPagesList] = useState([]);
  const [selectedPageForEditor, setSelectedPageForEditor] = useState('home');
  const [editingCustomPage, setEditingCustomPage] = useState(null);

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
      if (draft) setDraftContent(draft);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingContent(false);
    }
  }, []);

  const loadCatalogData = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const prods = await fetchProducts(true);
      if (Array.isArray(prods) && prods.length > 0) {
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
      const cats = await fetchCategories();
      setCategoriesList(cats);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadPagesData = useCallback(async () => {
    try {
      const pages = await fetchCustomPages();
      setPagesList(pages);
    } catch (err) {
      console.error(err);
    }
  }, []);

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
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (activeTab === 'dashboard') {
      loadSettingsData();
      loadHistoryData();
      loadContentData();
    } else if (activeTab === 'editor' || activeTab === 'drafts' || activeTab === 'languages' || activeTab === 'menu' || activeTab === 'seo') {
      loadContentData();
      if (activeTab === 'drafts' || activeTab === 'editor') {
        loadHistoryData();
      }
    } else if (activeTab === 'catalog') {
      loadCatalogData();
      loadCategoriesData();
    } else if (activeTab === 'categories') {
      loadCategoriesData();
    } else if (activeTab === 'pages') {
      loadPagesData();
    } else if (activeTab === 'media') {
      loadMediaData();
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
  const handleSaveDraft = async () => {
    if (isDemoMode) {
      showNotice('В ознакомительном демо-режиме изменение реальных данных заблокировано. Для сохранения требуется авторизация с мастер-паролем.');
      return;
    }
    if (!draftContent) return;
    setIsSavingDraft(true);
    try {
      const saved = await saveSiteContentDraft(draftContent);
      setDraftContent(saved);
      showNotice('Изменения сохранены');
    } catch (err) {
      showNotice(err.message || 'Ошибка сохранения черновика', 'error');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Publish Draft Handler
  const handlePublish = async () => {
    if (isDemoMode) {
      showNotice('В ознакомительном демо-режиме публикация на сайте заблокирована. Для публикации требуется авторизация с мастер-паролем.');
      return;
    }
    setIsPublishing(true);
    try {
      const res = await publishSiteContent();
      setDraftContent(res.content);
      setSiteContent(res.content);
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

  // Navigation Items (13 Sections)
  const navItems = [
    { id: 'dashboard', label: 'Главная панель', icon: LayoutDashboard },
    { id: 'editor', label: 'Редактор сайта', icon: Edit3, badge: draftContent?.hasUnpublishedChanges ? 'Черновик' : null },
    { id: 'pages', label: 'Страницы', icon: FileText },
    { id: 'catalog', label: 'Каталог', icon: Package, count: catalogList.length },
    { id: 'categories', label: 'Категории товаров', icon: FolderTree },
    { id: 'excel', label: 'Импорт и экспорт Excel', icon: FileSpreadsheet },
    { id: 'media', label: 'Фотографии и медиа', icon: ImageIcon },
    { id: 'menu', label: 'Меню и футер', icon: Menu },
    { id: 'languages', label: 'Языки и переводы', icon: Languages },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'drafts', label: 'Черновики и публикации', icon: GitPullRequest, badge: draftContent?.hasUnpublishedChanges ? '●' : null },
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

          {/* Demonstration Inspection Mode for testing and review */}
          <div className="admin-demo-access-block">
            <div className="admin-demo-divider">
              <span>или</span>
            </div>
            <button
              type="button"
              className="admin-btn admin-btn-outline admin-btn-full admin-btn-demo"
              onClick={handleEnterDemoMode}
            >
              <Eye size={15} />
              <span>Ознакомительный демо-режим</span>
            </button>
            <p className="admin-demo-access-hint">
              Полный просмотр разделов каталога, цен и настроек панели сотрудников LAUTE
            </p>
          </div>

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
            <span className="admin-cms-badge">ПАНЕЛЬ СОТРУДНИКОВ</span>
          </div>

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
                disabled={isSavingDraft}
                title="Сохранить черновик"
              >
                <Save size={14} />
                <span>{isSavingDraft ? 'Сохранение...' : 'Сохранить'}</span>
              </button>

              <button 
                type="button" 
                className="admin-btn admin-btn-success admin-btn-sm"
                onClick={handlePublish}
                disabled={isPublishing}
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
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                >
                  <div className="admin-nav-item-left">
                    <Icon size={17} className="nav-icon" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && <span className="admin-nav-badge warning">{item.badge}</span>}
                  {item.count !== undefined && <span className="admin-nav-badge count">{item.count}</span>}
                </button>
              );
            })}
          </div>

          <div className="admin-sidebar-footer">
            <div className="admin-session-box">
              <Shield size={14} className="session-shield" />
              <div className="session-info">
                <span className="session-title">Сессия активна</span>
                <span className="session-id">{adminSession?.id || 'admin-session'}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="admin-main-viewport">
          {notice && (
            <div className={`admin-floating-notice ${notice.type}`}>
              {notice.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              <span>{notice.message}</span>
            </div>
          )}

          {/* TAB 1: ГЛАВНАЯ ПАНЕЛЬ */}
          {activeTab === 'dashboard' && (
            <div className="admin-view dashboard-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">Главная панель управления</h2>
                  <p className="view-subtitle">Сводный статус контента, каталога товаров и публикации сайта LAUTE</p>
                </div>
                <div className="header-actions">
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-primary admin-btn-sm"
                    onClick={() => setActiveTab('editor')}
                  >
                    <Edit3 size={14} />
                    <span>Редактор сайта</span>
                  </button>
                </div>
              </div>

              {/* Status Banner if Drafts are Pending */}
              {draftContent?.hasUnpublishedChanges && (
                <div className="admin-alert-banner">
                  <div className="banner-icon-col">
                    <Sparkles size={22} />
                  </div>
                  <div className="banner-content-col">
                    <h4>Есть неопубликованные изменения</h4>
                    <p>В черновике сохранены правки контента сайта. Они видны в режиме предпросмотра, но еще не появились на действующем сайте.</p>
                  </div>
                  <div className="banner-action-col">
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-success"
                      onClick={handlePublish}
                      disabled={isPublishing}
                    >
                      <Check size={14} />
                      <span>{isPublishing ? 'Публикация...' : 'Опубликовать сейчас'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Stat Cards Grid */}
              <div className="admin-stats-grid">
                <div className="stat-card" onClick={() => setActiveTab('catalog')}>
                  <div className="stat-card-top">
                    <span className="stat-label">Товаров в каталоге</span>
                    <Package size={20} className="stat-icon" />
                  </div>
                  <div className="stat-value">{catalogList.length}</div>
                  <div className="stat-footer">
                    <span className="stat-tag success">Активных: {catalogList.filter(p => p.status !== 'СКРЫТ').length}</span>
                    <span className="stat-tag warning">Скрыто: {catalogList.filter(p => p.status === 'СКРЫТ').length}</span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => setActiveTab('pages')}>
                  <div className="stat-card-top">
                    <span className="stat-label">Страниц сайта</span>
                    <FileText size={20} className="stat-icon" />
                  </div>
                  <div className="stat-value">{pagesList.length + 7}</div>
                  <div className="stat-footer">
                    <span>7 основных разделов + {pagesList.length} инфо-страниц</span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => setActiveTab('drafts')}>
                  <div className="stat-card-top">
                    <span className="stat-label">Версия публикации</span>
                    <GitPullRequest size={20} className="stat-icon" />
                  </div>
                  <div className="stat-value">{draftContent?.version || '1.0.0'}</div>
                  <div className="stat-footer">
                    <span>{draftContent?.hasUnpublishedChanges ? 'Черновик ожидает публикации' : 'Сайт синхронизирован'}</span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => setActiveTab('history')}>
                  <div className="stat-card-top">
                    <span className="stat-label">Точки отката</span>
                    <History size={20} className="stat-icon" />
                  </div>
                  <div className="stat-value">{backupsList.length}</div>
                  <div className="stat-footer">
                    <span>Резервных снимков каталога</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="admin-section-card">
                <h3 className="card-section-title">Быстрые действия</h3>
                <div className="quick-actions-row">
                  <button 
                    type="button" 
                    className="quick-tile-btn"
                    onClick={() => setActiveTab('editor')}
                  >
                    <Edit3 size={18} />
                    <span>Редактировать тексты</span>
                  </button>

                  <button 
                    type="button" 
                    className="quick-tile-btn"
                    onClick={() => { setActiveTab('catalog'); setIsAddingNewProduct(true); }}
                  >
                    <Plus size={18} />
                    <span>Добавить товар</span>
                  </button>

                  <button 
                    type="button" 
                    className="quick-tile-btn"
                    onClick={downloadExcelTemplate}
                  >
                    <Download size={18} />
                    <span>Шаблон Excel</span>
                  </button>

                  <button 
                    type="button" 
                    className="quick-tile-btn"
                    onClick={exportCurrentCatalog}
                  >
                    <FileSpreadsheet size={18} />
                    <span>Выгрузить каталог</span>
                  </button>

                  <button 
                    type="button" 
                    className="quick-tile-btn"
                    onClick={() => setActiveTab('media')}
                  >
                    <ImageIcon size={18} />
                    <span>Медиаменеджер</span>
                  </button>

                  <button 
                    type="button" 
                    className="quick-tile-btn"
                    onClick={() => setActiveTab('menu')}
                  >
                    <Menu size={18} />
                    <span>Контакты и футер</span>
                  </button>
                </div>
              </div>

              {/* Recent Activity Log Preview */}
              <div className="admin-section-card">
                <div className="card-header-row">
                  <h3 className="card-section-title">Последние операции в системе</h3>
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-ghost admin-btn-sm"
                    onClick={() => setActiveTab('history')}
                  >
                    <span>Вся история</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Время</th>
                        <th>Действие</th>
                        <th>Операция</th>
                        <th>Сессия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.slice(0, 6).map((log) => (
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

          {/* TAB 2: РЕДАКТОР САЙТА (ВИЗУАЛЬНЫЙ РЕДАКТОР БЛОКОВ) */}
          {activeTab === 'editor' && (
            <div className="admin-view editor-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">Редактор сайта LAUTE</h2>
                  <p className="view-subtitle">Редактирование текстов, заголовков, слайдов, фотографий и блоков всех страниц сайта</p>
                </div>
                <div className="header-actions">
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft}
                  >
                    <Save size={14} />
                    <span>{isSavingDraft ? 'Сохранение...' : 'Сохранить черновик'}</span>
                  </button>

                  <button 
                    type="button" 
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    onClick={() => setPreviewModalOpen(true)}
                  >
                    <Eye size={14} />
                    <span>Предпросмотр</span>
                  </button>

                  <button 
                    type="button" 
                    className="admin-btn admin-btn-success admin-btn-sm"
                    onClick={handlePublish}
                    disabled={isPublishing}
                  >
                    <Check size={14} />
                    <span>{isPublishing ? 'Публикация...' : 'Опубликовать'}</span>
                  </button>

                  <button 
                    type="button" 
                    className="admin-btn admin-btn-ghost admin-btn-sm"
                    onClick={handleDiscardDraft}
                    title="Сбросить изменения к последней публикации"
                  >
                    <RotateCcw size={14} />
                    <span>Отменить</span>
                  </button>

                  {contentBackupsList.length > 0 && (
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-outline admin-btn-sm"
                      onClick={() => setActiveTab('drafts')}
                      title="Восстановить предыдущую версию контента"
                    >
                      <RotateCcw size={14} />
                      <span>Восстановить версию</span>
                    </button>
                  )}
                </div>
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

          {/* TAB 3: СТРАНИЦЫ */}
          {activeTab === 'pages' && (
            <div className="admin-view pages-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">Управление страницами</h2>
                  <p className="view-subtitle">Все разделы сайта LAUTE и создание новых информационных страниц на основе шаблонов</p>
                </div>
                <div className="header-actions">
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-primary admin-btn-sm"
                    onClick={() => {
                      setEditingCustomPage({
                        title: '',
                        slug: '',
                        description: '',
                        template: 'info',
                        blocks: [{ type: 'hero', title: '', subtitle: '' }, { type: 'text', content: '' }]
                      });
                    }}
                  >
                    <Plus size={14} />
                    <span>Создать страницу</span>
                  </button>
                </div>
              </div>

              {/* Standard Pages Table */}
              <div className="admin-section-card">
                <h3 className="card-section-title">Основные разделы сайта</h3>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Название раздела</th>
                        <th>Маршрут (URL)</th>
                        <th>Тип</th>
                        <th>Статус</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { title: 'Главная', route: '/', type: 'Главная страница' },
                        { title: 'Каталог', route: '/catalog', type: 'Каталог товаров' },
                        { title: 'О LAUTE', route: '/company', type: 'О компании' },
                        { title: 'Партнёрам', route: '/partners', type: 'B2B раздел' },
                        { title: 'Первый цифровой сервис', route: '/service', type: 'Сервис и гарантия' },
                        { title: 'Где купить', route: '/where-to-buy', type: 'Дилерская сеть' },
                        { title: 'Контакты', route: '/contacts', type: 'Контакты' }
                      ].map((p, idx) => (
                        <tr key={idx}>
                          <td><strong>{p.title}</strong></td>
                          <td><code>{p.route}</code></td>
                          <td>{p.type}</td>
                          <td><span className="stat-tag success">Активна</span></td>
                          <td>
                            <button
                              type="button"
                              className="admin-btn admin-btn-ghost admin-btn-xs"
                              onClick={() => {
                                setSelectedPageForEditor(p.route.replace('/', '') || 'home');
                                setActiveTab('editor');
                              }}
                            >
                              <Edit3 size={13} />
                              <span>Редактировать</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Custom Info Pages */}
              <div className="admin-section-card">
                <h3 className="card-section-title">Дополнительные информационные страницы ({pagesList.length})</h3>
                {pagesList.length === 0 ? (
                  <p className="empty-text">Дополнительных информационных страниц пока нет.</p>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Заголовок</th>
                          <th>URL slug</th>
                          <th>Шаблон</th>
                          <th>Статус</th>
                          <th>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagesList.map((cp) => (
                          <tr key={cp.id}>
                            <td><strong>{cp.title}</strong></td>
                            <td><code>/{cp.slug}</code></td>
                            <td>{cp.template}</td>
                            <td><span className="stat-tag success">{cp.status || 'ОПУБЛИКОВАН'}</span></td>
                            <td className="cell-actions">
                              <button
                                type="button"
                                className="admin-btn admin-btn-ghost admin-btn-xs"
                                onClick={() => setEditingCustomPage(cp)}
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                type="button"
                                className="admin-btn admin-btn-danger admin-btn-xs"
                                onClick={async () => {
                                  if (isDemoMode) {
                                    showNotice('В демонстрационном режиме удаление страниц заблокировано.');
                                    return;
                                  }
                                  if (window.confirm(`Удалить страницу "${cp.title}"?`)) {
                                    await deleteCustomPage(cp.id);
                                    loadPagesData();
                                    showNotice('Страница удалена');
                                  }
                                }}
                              >
                                <Trash2 size={13} />
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

          {/* TAB 4: КАТАЛОГ */}
          {activeTab === 'catalog' && (
            <div className="admin-view catalog-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">Каталог продукции LAUTE</h2>
                  <p className="view-subtitle">Управление позициями номенклатуры, ценами, описаниями, фотографиями и статусами</p>
                </div>
                <div className="header-actions">
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
                    <span>Excel синхронизация</span>
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
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>Фото</th>
                      <th>Артикул (SKU)</th>
                      <th>Название товара</th>
                      <th>Категория</th>
                      <th>Цена</th>
                      <th>Статус</th>
                      <th style={{ width: 140 }}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalogList
                      .filter((p) => {
                        const matchSearch = !productSearch || 
                          p.article?.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.name?.toLowerCase().includes(productSearch.toLowerCase());
                        const matchCat = categoryFilter === 'Все' || p.category === categoryFilter;
                        const matchStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && p.status !== 'СКРЫТ') ||
                          (statusFilter === 'hidden' && p.status === 'СКРЫТ');
                        return matchSearch && matchCat && matchStatus;
                      })
                      .map((prod) => {
                        const isHidden = prod.status === 'СКРЫТ';
                        const thumbSrc = prod.photo1 ? `${import.meta.env.BASE_URL}${prod.photo1}` : '';

                        return (
                          <tr key={prod.article} className={isHidden ? 'row-muted' : ''}>
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
                                <span className="prod-sub">{prod.collection || 'LAUTE Master'}</span>
                              </div>
                            </td>
                            <td>{prod.category}</td>
                            <td>
                              <span className="price-tag">
                                {Number(prod.price).toLocaleString('ru-RU')} {prod.currency || '₸'}
                              </span>
                            </td>
                            <td>
                              <span className={`stat-tag ${isHidden ? 'warning' : 'success'}`}>
                                {isHidden ? 'Скрыт' : 'Активен'}
                              </span>
                            </td>
                            <td>
                              <div className="actions-cell">
                                <button
                                  type="button"
                                  className="action-btn"
                                  onClick={() => setEditingProduct(prod)}
                                  title="Редактировать товар"
                                >
                                  <Edit3 size={15} />
                                </button>

                                <button
                                  type="button"
                                  className={`action-btn ${isHidden ? 'active-green' : ''}`}
                                  onClick={async () => {
                                    if (isDemoMode) {
                                      showNotice('В демонстрационном режиме изменение статуса товара заблокировано.');
                                      return;
                                    }
                                    const newStatus = isHidden ? 'АКТИВЕН' : 'СКРЫТ';
                                    await toggleProductStatus(prod.article, newStatus);
                                    loadCatalogData();
                                    showNotice(`Статус товара ${prod.article} изменён на "${newStatus}"`);
                                  }}
                                  title={isHidden ? 'Показать на сайте' : 'Скрыть с сайта'}
                                >
                                  {isHidden ? <Eye size={15} /> : <EyeOff size={15} />}
                                </button>

                                <button
                                  type="button"
                                  className="action-btn danger"
                                  onClick={async () => {
                                    if (isDemoMode) {
                                      showNotice('В демонстрационном режиме удаление товаров заблокировано.');
                                      return;
                                    }
                                    if (window.confirm(`Вы уверены, что хотите удалить товар ${prod.article} (${prod.name}) из каталога?`)) {
                                      await deleteProduct(prod.article);
                                      loadCatalogData();
                                      showNotice(`Товар ${prod.article} удалён`);
                                    }
                                  }}
                                  title="Удалить товар"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: КАТЕГОРИИ */}
          {activeTab === 'categories' && (
            <div className="admin-view categories-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">Категории каталога</h2>
                  <p className="view-subtitle">Структура категорий, последовательность отображения и привязка номенклатуры</p>
                </div>
              </div>

              <div className="admin-section-card">
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Порядок</th>
                        <th>Название категории</th>
                        <th>Видимость</th>
                        <th>Товаров</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoriesList.map((cat, idx) => (
                        <tr key={cat.id || idx}>
                          <td>#{cat.order || idx + 1}</td>
                          <td><strong>{cat.name}</strong></td>
                          <td>
                            <span className="stat-tag success">Отображается</span>
                          </td>
                          <td>{catalogList.filter(p => p.category === cat.name).length} позиций</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ИМПОРТ И ЭКСПОРТ EXCEL */}
          {activeTab === 'excel' && (
            <div className="admin-view excel-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">Синхронизация каталога через Excel</h2>
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
                  <h3>Скачать шаблон Excel</h3>
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
                  <h3>Скачать текущий каталог</h3>
                  <p>Полная выгрузка действующей базы каталога LAUTE ({catalogList.length} товаров) со всеми ценами, описаниями и фото.</p>
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-outline admin-btn-full"
                    onClick={exportCurrentCatalog}
                  >
                    <FileSpreadsheet size={14} />
                    <span>Выгрузить текущую базу</span>
                  </button>
                </div>

                {/* 3. Upload */}
                <div className="excel-action-card featured">
                  <div className="card-top-icon accent">
                    <Upload size={26} />
                  </div>
                  <h3>Загрузить Excel</h3>
                  <p>Умный импорт: проверка артикулов, цен, предотвращение дублей и предварительный показ всех изменений перед применением.</p>
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
                        <h4>Обнаружены ошибки в строках Excel:</h4>
                        <button 
                          type="button" 
                          className="admin-btn admin-btn-outline admin-btn-sm"
                          onClick={downloadErrorReport}
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
                            <span className="row-msg">{err.message}</span>
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
                  <h2 className="view-title">Фотографии и медиафайлы</h2>
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
                      setIsUploadingMedia(true);
                      try {
                        await uploadMediaFiles(files);
                        loadMediaData();
                        showNotice(`Успешно загружено ${files.length} изображений`);
                      } catch (err) {
                        showNotice(err.message, 'error');
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
                    const fullSrc = `${import.meta.env.BASE_URL}${file.url}`;
                    return (
                      <div key={fIdx} className="media-card-item">
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
                            className="media-mini-btn danger"
                            title="Удалить файл"
                            onClick={async () => {
                              if (isDemoMode) {
                                showNotice('В демонстрационном режиме удаление файлов заблокировано.');
                                return;
                              }
                              if (window.confirm(`Удалить файл "${file.name}"?`)) {
                                await deleteMediaFile(file.name);
                                loadMediaData();
                                showNotice('Файл удален');
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

          {/* TAB 9: ЯЗЫКИ И ПЕРЕВОДЫ */}
          {activeTab === 'languages' && (
            <div className="admin-view languages-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">Языки и переводы (RU, KZ, EN)</h2>
                  <p className="view-subtitle">Поддержка трёх языковых версий сайта LAUTE с контролем заполненности</p>
                </div>
                <div className="header-actions">
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-success admin-btn-sm"
                    onClick={handlePublish}
                  >
                    <Check size={14} />
                    <span>Опубликовать переводы</span>
                  </button>
                </div>
              </div>

              <div className="admin-section-card">
                <div className="lang-status-grid">
                  <div className="lang-status-card">
                    <span className="lang-badge">RU</span>
                    <h4>Русский язык (Основной)</h4>
                    <span className="stat-tag success">100% Заполнено</span>
                    <p>Используется как стандартный базовый язык завода и резервный fallback для остальных версий.</p>
                  </div>

                  <div className="lang-status-card">
                    <span className="lang-badge">KZ</span>
                    <h4>Қазақ тілі (Казахский)</h4>
                    <span className="stat-tag success">Активен</span>
                    <p>Полноценный перевод интерфейса, навигации, карточек номенклатуры и сервиса.</p>
                  </div>

                  <div className="lang-status-card">
                    <span className="lang-badge">EN</span>
                    <h4>English (Английский)</h4>
                    <span className="stat-tag success">Активен</span>
                    <p>Международная версия для экспортных контрактов, дистрибьюторов и глобального каталога.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SEO */}
          {activeTab === 'seo' && (
            <div className="admin-view seo-view">
              <div className="view-header">
                <div>
                  <h2 className="view-title">Поисковая оптимизация (SEO)</h2>
                  <p className="view-subtitle">Метатеги, заголовки, индексирование и предварительный просмотр сниппетов Google</p>
                </div>
                <div className="header-actions">
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-success admin-btn-sm"
                    onClick={handlePublish}
                  >
                    <Check size={14} />
                    <span>Опубликовать SEO</span>
                  </button>
                </div>
              </div>

              {/* Global SEO */}
              <div className="admin-section-card">
                <h3 className="card-section-title">Глобальные метаданные сайта</h3>
                <div className="form-group">
                  <label>Базовый заголовок сайта (Title):</label>
                  <input
                    type="text"
                    value={draftContent?.seo?.global?.defaultTitle || ''}
                    onChange={(e) => {
                      setDraftContent({
                        ...draftContent,
                        hasUnpublishedChanges: true,
                        seo: {
                          ...draftContent.seo,
                          global: { ...draftContent.seo?.global, defaultTitle: e.target.value }
                        }
                      });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Базовое описание (Meta Description):</label>
                  <textarea
                    rows={2}
                    value={draftContent?.seo?.global?.defaultDescription || ''}
                    onChange={(e) => {
                      setDraftContent({
                        ...draftContent,
                        hasUnpublishedChanges: true,
                        seo: {
                          ...draftContent.seo,
                          global: { ...draftContent.seo?.global, defaultDescription: e.target.value }
                        }
                      });
                    }}
                  />
                </div>

                {/* Google SERP Snippet Preview */}
                <div className="serp-preview-box">
                  <span className="serp-label">Предпросмотр сниппета в поиске Google:</span>
                  <div className="serp-card">
                    <span className="serp-url">https://laute.ltd</span>
                    <h4 className="serp-title">{draftContent?.seo?.global?.defaultTitle}</h4>
                    <p className="serp-desc">{draftContent?.seo?.global?.defaultDescription}</p>
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
                  <h2 className="view-title">История изменений и резервные копии</h2>
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
                  <h2 className="view-title">Системные настройки</h2>
                  <p className="view-subtitle">Смена мастер-пароля администратора, выгрузка полной базы данных и технические параметры</p>
                </div>
              </div>

              {/* Change Password Card */}
              <div className="admin-section-card">
                <h3 className="card-section-title">Смена пароля доступа к панели управления</h3>
                <p className="section-desc">
                  Доступ ко всей административной панели осуществляется по единственному безопасному мастер-паролю.
                  Пароль шифруется на сервере алгоритмом <strong>scrypt</strong> с уникальной криптографической солью.
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
                <h3 className="card-section-title">Полная резервная копия сайта</h3>
                <p className="section-desc">
                  Выгрузка полной базы сайта в один файл JSON: все товары каталога, контент страниц, меню, SEO-настройки и категории.
                </p>

                <button 
                  type="button" 
                  className="admin-btn admin-btn-outline"
                  onClick={downloadFullSystemBackup}
                >
                  <Download size={14} />
                  <span>Скачать полный бэкап системы (.json)</span>
                </button>
              </div>

              {/* System Diagnostics */}
              <div className="admin-section-card">
                <h3 className="card-section-title">Технические параметры окружения</h3>
                <div className="sys-params-grid">
                  <div className="param-item">
                    <span className="param-label">Серверный стек:</span>
                    <span className="param-val">Node.js {systemStats?.nodeVersion || 'v24'} · Express · Crypto (scrypt)</span>
                  </div>
                  <div className="param-item">
                    <span className="param-label">Хранилище данных:</span>
                    <span className="param-val">Локальная постоянная файловая БД с транзакционной синхронизацией</span>
                  </div>
                  <div className="param-item">
                    <span className="param-label">Аптайм сервера:</span>
                    <span className="param-val">{Math.floor((systemStats?.serverUptime || 0) / 60)} мин.</span>
                  </div>
                  <div className="param-item">
                    <span className="param-label">Защита от перебора:</span>
                    <span className="param-val">Активна (максимум 5 попыток ввода пароля)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: EDIT / ADD PRODUCT */}
      {(editingProduct || isAddingNewProduct) && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-window large">
            <div className="admin-modal-header">
              <h3>{isAddingNewProduct ? 'Добавление нового товара в каталог' : `Редактирование товара ${editingProduct?.article}`}</h3>
              <button 
                type="button" 
                className="close-btn"
                onClick={() => { setEditingProduct(null); setIsAddingNewProduct(false); }}
              >
                <X size={18} />
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
                    showNotice(`Товар ${editingProduct.article} успешно обновлён`);
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
              <div className="modal-form-grid">
                <div className="form-group">
                  <label>Артикул (SKU) *:</label>
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
                    placeholder="Полное наименование смесителя..."
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
                  <label>Цена *:</label>
                  <div className="input-with-currency">
                    <input
                      type="number"
                      required
                      value={editingProduct?.price || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      placeholder="28900"
                    />
                    <span className="currency-label">{editingProduct?.currency || '₸'}</span>
                  </div>
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
                  <label>Материал корпуса:</label>
                  <input
                    type="text"
                    value={editingProduct?.material || 'Первичная латунь CW617N (евростандарт)'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Цвет и покрытие:</label>
                  <input
                    type="text"
                    value={editingProduct?.color || 'Хром глянец'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, color: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Статус публикации:</label>
                  <select
                    value={editingProduct?.status || 'АКТИВЕН'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                  >
                    <option value="АКТИВЕН">АКТИВЕН (Виден на сайте)</option>
                    <option value="СКРЫТ">СКРЫТ (Скрыт от покупателей)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Описание товара:</label>
                <textarea
                  rows={3}
                  value={editingProduct?.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Технические характеристики:</label>
                <textarea
                  rows={2}
                  value={editingProduct?.specs || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, specs: e.target.value })}
                  placeholder="Картридж Sedal 35 мм, аэратор Neoperl..."
                />
              </div>

              <ImageFieldEditor
                label="Основное фото товара (photo1):"
                value={editingProduct?.photo1 || ''}
                onChange={(url) => setEditingProduct({ ...editingProduct, photo1: url })}
              />

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
                  <span>{isSavingProduct ? 'Сохранение...' : 'Сохранить товар'}</span>
                </button>
              </div>
            </form>
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
            <div className="preview-content-box" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
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
                            src={slide.image?.startsWith('http') || slide.image?.startsWith('/') ? slide.image : `${import.meta.env.BASE_URL}${slide.image}`}
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
    </div>
  );
};
