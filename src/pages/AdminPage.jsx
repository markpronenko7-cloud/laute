import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Eye, 
  EyeOff, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  RotateCcw, 
  Users, 
  LogOut, 
  Shield, 
  Package, 
  Image as ImageIcon, 
  ArrowLeft,
  X,
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  loginEmployee, 
  logoutEmployee, 
  fetchProducts, 
  addProduct, 
  updateProduct, 
  toggleProductStatus, 
  deleteProduct, 
  uploadImageFile, 
  validateExcelFile, 
  commitExcelImport, 
  downloadExcelTemplate, 
  exportCurrentCatalog, 
  downloadErrorReport, 
  fetchHistory, 
  rollbackToBackup, 
  fetchStaffUsers, 
  createStaffUser 
} from '../services/catalogApi';
import { CATEGORY_NAMES } from '../data/catalogData';
import '../styles/admin.css';

export const AdminPage = () => {
  const { currentUser, setCurrentUser, navigateTo, products, updateProducts } = useApp();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active tab in dashboard
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'add' | 'import' | 'export' | 'history' | 'errors' | 'users'

  // Products filtering & search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'hidden'
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Edit product modal
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Add product form
  const [newProductData, setNewProductData] = useState({
    article: '',
    name: '',
    category: 'Кухонные смесители',
    subcategory: '',
    collection: 'LAUTE Master Line',
    brand: 'LAUTE',
    description: '',
    price: '',
    currency: '₸',
    material: 'Первичная латунь CW617N (евростандарт)',
    color: 'Хром глянец',
    finish: 'Гальванический хром',
    installType: 'Врезной на мойку / умывальник',
    purpose: 'Кухонные смесители',
    dimensions: '',
    weight: '',
    volume: '',
    specs: '',
    photo1: 'images/cat_laute_brand.jpg',
    photo2: '',
    photo3: '',
    status: 'АКТИВЕН'
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [addSuccessMessage, setAddSuccessMessage] = useState('');

  // Excel Import state
  const [excelFile, setExcelFile] = useState(null);
  const [isValidatingExcel, setIsValidatingExcel] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [isCommittingImport, setIsCommittingImport] = useState(false);
  const [importSuccessData, setImportSuccessData] = useState(null);
  const fileInputRef = useRef(null);

  // History & Rollback state
  const [historyLogs, setHistoryLogs] = useState([]);
  const [backupsList, setBackupsList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [rollbackSuccessMsg, setRollbackSuccessMsg] = useState('');

  // Staff users state (admin only)
  const [staffUsers, setStaffUsers] = useState([]);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('editor');
  const [newStaffTitle, setNewStaffTitle] = useState('');

  // Local message notice
  const [notice, setNotice] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  // Load products & history when tab switches or on mount
  const refreshCatalogData = async () => {
    setIsLoadingProducts(true);
    try {
      const data = await fetchProducts(true);
      if (Array.isArray(data) && data.length > 0) {
        updateProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadHistoryData = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await fetchHistory();
      setHistoryLogs(data.logs || []);
      setBackupsList(data.backups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadStaffData = async () => {
    if (!isAdmin) return;
    try {
      const users = await fetchStaffUsers();
      setStaffUsers(users || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshCatalogData();
      if (activeTab === 'history') loadHistoryData();
      if (activeTab === 'users') loadStaffData();
    }
  }, [currentUser, activeTab]);

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await loginEmployee(loginEmail, loginPassword);
      setCurrentUser(res.user);
    } catch (err) {
      setLoginError(err.message || 'Ошибка авторизации');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    logoutEmployee();
    setCurrentUser(null);
  };

  // Quick fill helper for testing
  const handleQuickFill = (email, pass) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError('');
  };

  // -------------------------------------------------------------
  // PRODUCTS FILTERING
  // -------------------------------------------------------------
  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      (p.article && p.article.toLowerCase().includes(q)) || 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q));

    const matchCat = selectedCategory === 'Все' || p.category === selectedCategory;

    const matchStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && p.status !== 'СКРЫТ') ||
      (statusFilter === 'hidden' && p.status === 'СКРЫТ');

    return matchSearch && matchCat && matchStatus;
  });

  const totalCount = products.length;
  const activeCount = products.filter(p => p.status !== 'СКРЫТ').length;
  const hiddenCount = products.filter(p => p.status === 'СКРЫТ').length;

  // Toggle single product status
  const handleToggleStatus = async (sku, currentStatus) => {
    const nextStatus = currentStatus === 'СКРЫТ' ? 'АКТИВЕН' : 'СКРЫТ';
    try {
      await toggleProductStatus(sku, nextStatus);
      const updated = products.map(p => p.article === sku ? { ...p, status: nextStatus } : p);
      updateProducts(updated);
      setNotice(`Статус товара ${sku} изменен на "${nextStatus}"`);
      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      alert(`Ошибка: ${err.message}`);
    }
  };

  // Delete product
  const handleDeleteProduct = async (sku, name) => {
    if (!window.confirm(`Вы уверены, что хотите удалить товар "${name}" (${sku}) из каталога? Будет создана автоматическая резервная копия.`)) {
      return;
    }
    try {
      await deleteProduct(sku);
      const updated = products.filter(p => p.article !== sku);
      updateProducts(updated);
      setNotice(`Товар ${sku} удален из каталога`);
      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      alert(`Ошибка: ${err.message}`);
    }
  };

  // Save edited product
  const handleSaveProductEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSavingProduct(true);
    try {
      await updateProduct(editingProduct.article, editingProduct);
      const updated = products.map(p => p.article === editingProduct.article ? editingProduct : p);
      updateProducts(updated);
      setEditingProduct(null);
      setNotice(`Товар ${editingProduct.article} успешно сохранён!`);
      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      alert(`Ошибка: ${err.message}`);
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Image Upload handler for Edit modal or Add form
  const handleImageUpload = async (e, target) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadImageFile(file);
      if (target === 'edit') {
        setEditingProduct(prev => ({ ...prev, photo1: res.url }));
      } else if (target === 'add') {
        setNewProductData(prev => ({ ...prev, photo1: res.url }));
      }
      setNotice('Изображение успешно загружено на сервер');
      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      alert(`Ошибка загрузки изображения: ${err.message}`);
    }
  };

  // Add Product Submit
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProductData.article || !newProductData.name || !newProductData.price) {
      alert('Заполните обязательные поля: Артикул, Название, Цена');
      return;
    }
    setIsAddingProduct(true);
    try {
      const res = await addProduct(newProductData);
      const updated = [res.product, ...products];
      updateProducts(updated);
      setAddSuccessMessage(`Товар ${res.product.article} («${res.product.name}») успешно добавлен в каталог!`);
      // Reset form
      setNewProductData({
        article: '',
        name: '',
        category: 'Кухонные смесители',
        subcategory: '',
        collection: 'LAUTE Master Line',
        brand: 'LAUTE',
        description: '',
        price: '',
        currency: '₸',
        material: 'Первичная латунь CW617N (евростандарт)',
        color: 'Хром глянец',
        finish: 'Гальванический хром',
        installType: 'Врезной на мойку / умывальник',
        purpose: 'Кухонные смесители',
        dimensions: '',
        weight: '',
        volume: '',
        specs: '',
        photo1: 'images/cat_laute_brand.jpg',
        photo2: '',
        photo3: '',
        status: 'АКТИВЕН'
      });
      setTimeout(() => setAddSuccessMessage(''), 5000);
    } catch (err) {
      alert(`Ошибка добавления товара: ${err.message}`);
    } finally {
      setIsAddingProduct(false);
    }
  };

  // -------------------------------------------------------------
  // EXCEL IMPORT WORKFLOW
  // -------------------------------------------------------------
  const handleExcelFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFile(file);
    setIsValidatingExcel(true);
    setValidationResult(null);
    setImportSuccessData(null);

    try {
      const result = await validateExcelFile(file);
      setValidationResult(result);
    } catch (err) {
      setValidationResult({
        success: false,
        summary: { toAdd: 0, toUpdate: 0, unchanged: 0, toHide: 0, toDelete: 0, errorsCount: 1 },
        errors: [{ row: '-', article: '-', message: `Ошибка парсинга: ${err.message}` }],
        diffs: [],
        validRows: []
      });
    } finally {
      setIsValidatingExcel(false);
    }
  };

  const handleCommitExcelImport = async () => {
    if (!validationResult || !validationResult.validRows || validationResult.validRows.length === 0) return;

    setIsCommittingImport(true);
    try {
      const res = await commitExcelImport(validationResult.validRows);
      if (res.success && res.products) {
        updateProducts(res.products);
        setImportSuccessData(res);
        setValidationResult(null);
        setExcelFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err) {
      alert(`Ошибка применения изменений: ${err.message}`);
    } finally {
      setIsCommittingImport(false);
    }
  };

  // Handle Rollback
  const handleRollback = async (backupId) => {
    if (!isAdmin) {
      alert('Действие доступно только Главному администратору.');
      return;
    }
    if (!window.confirm(`Вы уверены, что хотите откатить весь каталог к резервной копии ${backupId}? Текущие данные будут заменены состоянием этого бэкапа.`)) {
      return;
    }

    try {
      const res = await rollbackToBackup(backupId);
      if (res.success && res.products) {
        updateProducts(res.products);
        setRollbackSuccessMsg(`Каталог успешно восстановлен! Всего позиций: ${res.restoredCount}`);
        loadHistoryData();
        setTimeout(() => setRollbackSuccessMsg(''), 5000);
      }
    } catch (err) {
      alert(`Ошибка отката: ${err.message}`);
    }
  };

  // Add Staff User
  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    if (!newStaffEmail || !newStaffPassword || !newStaffName) {
      alert('Заполните все обязательные поля');
      return;
    }
    try {
      const newUser = await createStaffUser({
        email: newStaffEmail,
        password: newStaffPassword,
        name: newStaffName,
        role: newStaffRole,
        title: newStaffTitle
      });
      setStaffUsers(prev => [...prev, newUser]);
      setNewStaffEmail('');
      setNewStaffPassword('');
      setNewStaffName('');
      setNewStaffTitle('');
      alert('Сотрудник успешно добавлен!');
    } catch (err) {
      alert(`Ошибка добавления сотрудника: ${err.message}`);
    }
  };

  // =============================================================
  // RENDER: LOGIN SCREEN (when not authenticated)
  // =============================================================
  if (!currentUser) {
    return (
      <div className="admin-login-screen">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-login-badge">
              <Shield size={14} color="#2563EB" />
              <span>ЗАКРЫТЫЙ СЛУЖЕБНЫЙ ДОСТУП</span>
            </div>
            <div className="admin-login-logo">LAUTE</div>
            <h1 className="admin-login-title">Управление каталогом товаров</h1>
            <p className="admin-login-subtitle">
              Единый центр управления номенклатурой, ценами и синхронизацией через Microsoft Excel.
            </p>
          </div>

          {loginError && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="admin-login-form">
            <div className="form-group">
              <label>Рабочий E-mail сотрудника *</label>
              <input
                type="email"
                required
                placeholder="employee@laute.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Пароль доступа *</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="adm-btn adm-btn-accent" 
              style={{ width: '100%', padding: '12px', marginTop: '10px' }}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Проверка учётных данных...' : 'Войти в панель управления'}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="admin-quick-roles">
            <div className="admin-quick-roles-title">Учётные записи для быстрого входа:</div>
            
            <button 
              type="button" 
              className="admin-quick-btn"
              onClick={() => handleQuickFill('admin@laute.com', 'laute_admin_2026!')}
            >
              <div>
                <strong>Иван Смирнов</strong> (Главный администратор)
                <div style={{ fontSize: '11px', color: '#64748B' }}>admin@laute.com (полные права, бэкапы, сотрудники)</div>
              </div>
              <Shield size={16} color="#2563EB" />
            </button>

            <button 
              type="button" 
              className="admin-quick-btn"
              onClick={() => handleQuickFill('editor@laute.com', 'laute_editor_2026!')}
            >
              <div>
                <strong>Елена Васильева</strong> (Редактор каталога)
                <div style={{ fontSize: '11px', color: '#64748B' }}>editor@laute.com (товары, Excel импорт/экспорт)</div>
              </div>
              <Edit3 size={16} color="#10B981" />
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button 
                type="button" 
                className="adm-btn adm-btn-outline adm-btn-sm" 
                onClick={() => navigateTo('catalog')}
              >
                <ArrowLeft size={14} />
                <span>Вернуться на витрину LAUTE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================
  // RENDER: DASHBOARD (when authenticated)
  // =============================================================
  return (
    <div className="admin-layout">
      {/* 1. TOP NAVBAR */}
      <header className="admin-navbar">
        <div className="admin-navbar-brand">
          <div className="admin-brand-logo">LAUTE</div>
          <span className="admin-brand-badge">ПАНЕЛЬ УПРАВЛЕНИЯ КАТАЛОГОМ</span>
          <div className="admin-navbar-status">
            <div className="admin-status-dot" />
            <span>Сервер синхронизирован</span>
          </div>
        </div>

        <div className="admin-navbar-user">
          <button 
            type="button" 
            className="adm-btn adm-btn-outline adm-btn-sm" 
            style={{ color: '#F8FAFC', borderColor: '#334155', background: '#1E293B' }}
            onClick={() => navigateTo('catalog')}
            title="Открыть публичный каталог товаров"
          >
            <ArrowLeft size={14} />
            <span>Витрина сайта</span>
          </button>

          <div className="admin-user-info">
            <div className="admin-user-name">{currentUser.name}</div>
            <div className="admin-user-role">
              {currentUser.role === 'admin' ? 'Главный администратор' : 'Контент-редактор'}
            </div>
          </div>

          <button 
            type="button" 
            className="adm-btn adm-btn-outline adm-btn-sm" 
            style={{ color: '#EF4444', borderColor: '#334155', background: '#1E293B' }}
            onClick={handleLogout}
            title="Выйти из системы"
          >
            <LogOut size={14} />
            <span>Выход</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main style={{ padding: '24px', maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* Global Notice Toast */}
        {notice && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} color="#10B981" />
            <span>{notice}</span>
          </div>
        )}

        {/* 2. METRICS CARDS */}
        <div className="admin-metrics-container">
          <div className="admin-metric-card">
            <div className="admin-metric-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
              <Package size={24} />
            </div>
            <div>
              <div className="admin-metric-val">{totalCount}</div>
              <div className="admin-metric-label">Всего товаров в базе</div>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
              <Eye size={24} />
            </div>
            <div>
              <div className="admin-metric-val">{activeCount}</div>
              <div className="admin-metric-label">Опубликовано на сайте</div>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon" style={{ background: '#F1F5F9', color: '#64748B' }}>
              <EyeOff size={24} />
            </div>
            <div>
              <div className="admin-metric-val">{hiddenCount}</div>
              <div className="admin-metric-label">Скрытых позиций</div>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <div className="admin-metric-val">.XLSX</div>
              <div className="admin-metric-label">Готов к импорту/экспорту</div>
            </div>
          </div>
        </div>

        {/* 3. NAVIGATION TABS */}
        <nav className="admin-tabs-nav">
          <button 
            type="button" 
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={16} />
            <span>Все товары</span>
            <span className="admin-tab-badge">{totalCount}</span>
          </button>

          <button 
            type="button" 
            className={`admin-tab-btn ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <Plus size={16} />
            <span>Добавить товар</span>
          </button>

          <button 
            type="button" 
            className={`admin-tab-btn ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            <Upload size={16} />
            <span>Импорт Excel</span>
          </button>

          <button 
            type="button" 
            className={`admin-tab-btn ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            <Download size={16} />
            <span>Экспорт Excel</span>
          </button>

          <button 
            type="button" 
            className={`admin-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={16} />
            <span>История изменений</span>
          </button>

          <button 
            type="button" 
            className={`admin-tab-btn ${activeTab === 'errors' ? 'active' : ''}`}
            onClick={() => setActiveTab('errors')}
          >
            <AlertTriangle size={16} />
            <span>Ошибки импорта</span>
          </button>

          {isAdmin && (
            <button 
              type="button" 
              className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={16} />
              <span>Сотрудники</span>
            </button>
          )}
        </nav>

        {/* -------------------------------------------------------------
            TAB 1: ВСЕ ТОВАРЫ
            ------------------------------------------------------------- */}
        {activeTab === 'products' && (
          <div className="admin-panel-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <Package size={18} color="#2563EB" />
                <span>Номенклатура каталога LAUTE</span>
              </h2>

              <div className="admin-filters-bar">
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Поиск по артикулу, названию..."
                    className="admin-search-input"
                    style={{ paddingLeft: '32px' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select 
                  className="admin-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="Все">Все категории ({totalCount})</option>
                  {CATEGORY_NAMES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
                  <button 
                    type="button"
                    style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: statusFilter === 'all' ? '#FFFFFF' : 'transparent', color: statusFilter === 'all' ? '#0F172A' : '#64748B' }}
                    onClick={() => setStatusFilter('all')}
                  >
                    Все ({totalCount})
                  </button>
                  <button 
                    type="button"
                    style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: statusFilter === 'active' ? '#FFFFFF' : 'transparent', color: statusFilter === 'active' ? '#059669' : '#64748B' }}
                    onClick={() => setStatusFilter('active')}
                  >
                    Активные ({activeCount})
                  </button>
                  <button 
                    type="button"
                    style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: statusFilter === 'hidden' ? '#FFFFFF' : 'transparent', color: statusFilter === 'hidden' ? '#DC2626' : '#64748B' }}
                    onClick={() => setStatusFilter('hidden')}
                  >
                    Скрытые ({hiddenCount})
                  </button>
                </div>

                <button 
                  type="button" 
                  className="adm-btn adm-btn-accent adm-btn-sm"
                  onClick={() => setActiveTab('add')}
                >
                  <Plus size={14} />
                  <span>Добавить товар</span>
                </button>
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Фото</th>
                    <th>Артикул (SKU)</th>
                    <th>Наименование</th>
                    <th>Категория</th>
                    <th>Цена</th>
                    <th>Статус</th>
                    <th>Обновлено</th>
                    <th style={{ textAlign: 'right' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                        Товары не найдены по заданным критериям поиска.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.article}>
                        <td>
                          <img 
                            src={p.photo1 || 'images/cat_laute_brand.jpg'} 
                            alt={p.name} 
                            className="admin-table-thumb"
                            onError={(e) => { e.target.src = 'images/cat_laute_brand.jpg'; }}
                          />
                        </td>
                        <td>
                          <strong style={{ fontFamily: 'monospace', color: '#0F172A' }}>{p.article}</strong>
                        </td>
                        <td>
                          <div style={{ fontWeight: '600', color: '#1E293B' }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{p.collection || 'LAUTE Master Line'}</div>
                        </td>
                        <td>
                          <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>
                            {p.category}
                          </span>
                        </td>
                        <td>
                          <strong style={{ fontSize: '14px', color: '#0F172A' }}>
                            {Number(p.price).toLocaleString('ru-RU')} {p.currency || '₸'}
                          </strong>
                        </td>
                        <td>
                          {p.status === 'СКРЫТ' ? (
                            <span className="status-badge hidden">
                              <EyeOff size={12} />
                              <span>СКРЫТ</span>
                            </span>
                          ) : (
                            <span className="status-badge active">
                              <Eye size={12} />
                              <span>АКТИВЕН</span>
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '12px', color: '#64748B' }}>
                          {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('ru-RU') : 'Эталон'}
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button 
                            type="button" 
                            className="adm-btn adm-btn-outline adm-btn-sm" 
                            style={{ marginRight: '6px' }}
                            onClick={() => setEditingProduct({ ...p })}
                            title="Редактировать товар"
                          >
                            <Edit3 size={13} />
                            <span>Править</span>
                          </button>

                          <button 
                            type="button" 
                            className="adm-btn adm-btn-outline adm-btn-sm" 
                            style={{ marginRight: '6px' }}
                            onClick={() => handleToggleStatus(p.article, p.status)}
                            title={p.status === 'СКРЫТ' ? 'Вернуть на сайт' : 'Скрыть с сайта'}
                          >
                            {p.status === 'СКРЫТ' ? <Eye size={13} color="#059669" /> : <EyeOff size={13} color="#64748B" />}
                            <span>{p.status === 'СКРЫТ' ? 'Показать' : 'Скрыть'}</span>
                          </button>

                          <button 
                            type="button" 
                            className="adm-btn adm-btn-outline adm-btn-sm" 
                            style={{ color: '#EF4444' }}
                            onClick={() => handleDeleteProduct(p.article, p.name)}
                            title="Удалить товар"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 2: ДОБАВИТЬ ТОВАР
            ------------------------------------------------------------- */}
        {activeTab === 'add' && (
          <div className="admin-panel-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <Plus size={18} color="#2563EB" />
                <span>Создание новой номенклатурной позиции LAUTE</span>
              </h2>
            </div>

            {addSuccessMessage && (
              <div style={{ margin: '20px 24px 0', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={20} color="#10B981" />
                <span>{addSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddProductSubmit} style={{ padding: '24px' }}>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Артикул (SKU) * [Уникальный ключ]</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: LT-K105-NW"
                    value={newProductData.article}
                    onChange={(e) => setNewProductData({ ...newProductData, article: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Категория *</label>
                  <select
                    value={newProductData.category}
                    onChange={(e) => setNewProductData({ ...newProductData, category: e.target.value })}
                  >
                    {CATEGORY_NAMES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Название товара *</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Смеситель для кухни LAUTE Aurora A-1"
                  value={newProductData.name}
                  onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                />
              </div>

              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Цена *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Например: 32000"
                    value={newProductData.price}
                    onChange={(e) => setNewProductData({ ...newProductData, price: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Валюта</label>
                  <select
                    value={newProductData.currency}
                    onChange={(e) => setNewProductData({ ...newProductData, currency: e.target.value })}
                  >
                    <option value="₸">₸ (Казахстанский тенге)</option>
                    <option value="₽">₽ (Российский рубль)</option>
                    <option value="$">$ (Доллар США)</option>
                    <option value="€">€ (Евро)</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Коллекция</label>
                  <input
                    type="text"
                    placeholder="LAUTE Master Line"
                    value={newProductData.collection}
                    onChange={(e) => setNewProductData({ ...newProductData, collection: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Материал</label>
                  <input
                    type="text"
                    placeholder="Первичная латунь CW617N"
                    value={newProductData.material}
                    onChange={(e) => setNewProductData({ ...newProductData, material: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Цвет</label>
                  <input
                    type="text"
                    placeholder="Хром глянец / Матовый черный"
                    value={newProductData.color}
                    onChange={(e) => setNewProductData({ ...newProductData, color: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Тип установки</label>
                  <input
                    type="text"
                    placeholder="Врезной на мойку / Настенный"
                    value={newProductData.installType}
                    onChange={(e) => setNewProductData({ ...newProductData, installType: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Описание</label>
                <textarea
                  placeholder="Подробное описание товара для покупателей и партнёров..."
                  value={newProductData.description}
                  onChange={(e) => setNewProductData({ ...newProductData, description: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Технические характеристики</label>
                <textarea
                  placeholder="Картридж 35мм керамический; аэратор Neoperl; подводка 45см..."
                  value={newProductData.specs}
                  onChange={(e) => setNewProductData({ ...newProductData, specs: e.target.value })}
                />
              </div>

              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Размеры</label>
                  <input
                    type="text"
                    placeholder="Высота: 280 мм, вылет: 190 мм"
                    value={newProductData.dimensions}
                    onChange={(e) => setNewProductData({ ...newProductData, dimensions: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Вес</label>
                  <input
                    type="text"
                    placeholder="1.6 кг"
                    value={newProductData.weight}
                    onChange={(e) => setNewProductData({ ...newProductData, weight: e.target.value })}
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="admin-form-group">
                <label>Основная фотография (путь или загрузка файла)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={newProductData.photo1}
                    onChange={(e) => setNewProductData({ ...newProductData, photo1: e.target.value })}
                    style={{ flex: 1 }}
                  />
                  <label className="adm-btn adm-btn-outline" style={{ cursor: 'pointer', margin: 0 }}>
                    <ImageIcon size={15} />
                    <span>Загрузить фото</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageUpload(e, 'add')}
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  type="submit" 
                  className="adm-btn adm-btn-accent" 
                  style={{ padding: '12px 24px' }}
                  disabled={isAddingProduct}
                >
                  <CheckCircle2 size={16} />
                  <span>{isAddingProduct ? 'Сохранение...' : 'Добавить товар в каталог'}</span>
                </button>

                <button 
                  type="button" 
                  className="adm-btn adm-btn-outline"
                  onClick={() => setActiveTab('products')}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 3: ИМПОРТ EXCEL
            ------------------------------------------------------------- */}
        {activeTab === 'import' && (
          <div className="admin-panel-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <FileSpreadsheet size={18} color="#10B981" />
                <span>Массовое обновление каталога через Microsoft Excel</span>
              </h2>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button" 
                  className="adm-btn adm-btn-outline adm-btn-sm" 
                  onClick={downloadExcelTemplate}
                  title="Скачать эталонный пустой шаблон"
                >
                  <Download size={14} />
                  <span>Скачать шаблон Excel</span>
                </button>

                <button 
                  type="button" 
                  className="adm-btn adm-btn-outline adm-btn-sm" 
                  onClick={exportCurrentCatalog}
                  title="Скачать текущий каталог с данными"
                >
                  <Download size={14} />
                  <span>Скачать текущий каталог</span>
                </button>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              
              {/* Instructions banner */}
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '16px 20px', borderRadius: '10px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Info size={22} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '13px', color: '#1E3A8A', lineHeight: 1.6 }}>
                  <strong>Регламент импорта LAUTE:</strong> Вы можете загрузить как заполненный шаблон, так и выгрузку текущего каталога с изменениями.
                  Система автоматически проверит уникальность артикулов, цены и обязательные поля.
                  <strong> Товары, отсутствующие в файле, НЕ удаляются из базы.</strong>
                </div>
              </div>

              {/* Upload Drop Zone */}
              <div 
                className="excel-upload-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept=".xlsx, .xls" 
                  style={{ display: 'none' }}
                  onChange={handleExcelFileSelect}
                />
                <FileSpreadsheet size={48} color="#10B981" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>
                  {excelFile ? `Выбран файл: ${excelFile.name}` : 'Нажмите для выбора файла Excel (.xlsx)'}
                </div>
                <div style={{ fontSize: '13px', color: '#64748B' }}>
                  {excelFile ? `Размер: ${(excelFile.size / 1024).toFixed(1)} КБ` : 'Перетащите файл сюда или нажмите для выбора на компьютере'}
                </div>
              </div>

              {/* Loading Indicator */}
              {isValidatingExcel && (
                <div style={{ textAlign: 'center', padding: '30px', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <RefreshCw size={20} className="spin-animation" />
                  <span>Выполняется автоматическая проверка строк файла...</span>
                </div>
              )}

              {/* Import Success Message */}
              {importSuccessData && (
                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '24px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center' }}>
                  <CheckCircle2 size={40} color="#10B981" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#065F46', margin: '0 0 8px' }}>
                    Импорт успешно применён! Каталог на сайте обновлён.
                  </h3>
                  <p style={{ fontSize: '13px', color: '#047857', margin: '0 0 16px' }}>
                    Добавлено: +{importSuccessData.stats?.added || 0}, Обновлено: {importSuccessData.stats?.updated || 0}, Скрыто: {importSuccessData.stats?.hidden || 0}, Удалено: {importSuccessData.stats?.deleted || 0}. 
                    Создана точка отката: <code>{importSuccessData.backupId}</code>
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button 
                      type="button" 
                      className="adm-btn adm-btn-primary adm-btn-sm" 
                      onClick={() => setActiveTab('products')}
                    >
                      Посмотреть все товары
                    </button>
                    <button 
                      type="button" 
                      className="adm-btn adm-btn-outline adm-btn-sm" 
                      onClick={() => navigateTo('catalog')}
                    >
                      Перейти на витрину сайта
                    </button>
                  </div>
                </div>
              )}

              {/* Validation Result Preview */}
              {validationResult && (
                <div>
                  {/* Summary Cards */}
                  <div className="excel-preview-summary-grid">
                    <div className="excel-summary-stat-box" style={{ background: '#ECFDF5', borderColor: '#A7F3D0' }}>
                      <div className="excel-summary-stat-val" style={{ color: '#059669' }}>
                        +{validationResult.summary?.toAdd || 0}
                      </div>
                      <div className="excel-summary-stat-title" style={{ color: '#065F46' }}>Будет добавлено</div>
                    </div>

                    <div className="excel-summary-stat-box" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
                      <div className="excel-summary-stat-val" style={{ color: '#2563EB' }}>
                        {validationResult.summary?.toUpdate || 0}
                      </div>
                      <div className="excel-summary-stat-title" style={{ color: '#1E40AF' }}>Будет обновлено</div>
                    </div>

                    <div className="excel-summary-stat-box" style={{ background: '#F8FAFC', borderColor: '#E2E8F0' }}>
                      <div className="excel-summary-stat-val" style={{ color: '#64748B' }}>
                        {validationResult.summary?.unchanged || 0}
                      </div>
                      <div className="excel-summary-stat-title" style={{ color: '#475569' }}>Без изменений</div>
                    </div>

                    <div className="excel-summary-stat-box" style={{ background: validationResult.summary?.errorsCount > 0 ? '#FEF2F2' : '#F8FAFC', borderColor: validationResult.summary?.errorsCount > 0 ? '#FECACA' : '#E2E8F0' }}>
                      <div className="excel-summary-stat-val" style={{ color: validationResult.summary?.errorsCount > 0 ? '#DC2626' : '#94A3B8' }}>
                        {validationResult.summary?.errorsCount || 0}
                      </div>
                      <div className="excel-summary-stat-title" style={{ color: validationResult.summary?.errorsCount > 0 ? '#991B1B' : '#64748B' }}>Строк с ошибками</div>
                    </div>
                  </div>

                  {/* Errors Breakdown (if any) */}
                  {validationResult.errors && validationResult.errors.length > 0 && (
                    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '18px 20px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontWeight: '700', fontSize: '14px' }}>
                          <AlertTriangle size={18} />
                          <span>Обнаружены ошибки в строках (строки с ошибками не будут импортированы):</span>
                        </div>
                        <button 
                          type="button" 
                          className="adm-btn adm-btn-outline adm-btn-sm" 
                          style={{ borderColor: '#FECACA', color: '#DC2626' }}
                          onClick={downloadErrorReport}
                        >
                          <Download size={13} />
                          <span>Скачать отчёт об ошибках (Excel)</span>
                        </button>
                      </div>

                      <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                        {validationResult.errors.map((err, idx) => (
                          <div key={idx} style={{ fontSize: '13px', color: '#991B1B', padding: '6px 0', borderBottom: '1px solid #FEE2E2' }}>
                            <strong>Строка {err.row}:</strong> {err.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Changes Diff Table */}
                  {validationResult.diffs && validationResult.diffs.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>
                        Детализация изменений по товарам:
                      </h3>
                      <div className="admin-table-wrapper" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Артикул</th>
                              <th>Наименование</th>
                              <th>Действие</th>
                              <th>Что меняется</th>
                            </tr>
                          </thead>
                          <tbody>
                            {validationResult.diffs.map((diff, idx) => (
                              <tr key={idx}>
                                <td><strong style={{ fontFamily: 'monospace' }}>{diff.article}</strong></td>
                                <td>{diff.name}</td>
                                <td>
                                  {diff.action === 'ДОБАВИТЬ' && <span className="diff-tag-add">ДОБАВЛЕНИЕ</span>}
                                  {diff.action === 'ОБНОВИТЬ' && <span className="diff-tag-change">ОБНОВЛЕНИЕ</span>}
                                  {diff.action === 'СКРЫТЬ' && <span className="diff-tag-hide">СКРЫТИЕ</span>}
                                  {diff.action === 'УДАЛИТЬ' && <span style={{ background: '#FEE2E2', color: '#B91C1C', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>УДАЛЕНИЕ</span>}
                                </td>
                                <td>
                                  {diff.changes.map((ch, cIdx) => (
                                    <div key={cIdx} style={{ fontSize: '12px', marginBottom: '2px' }}>
                                      <span style={{ fontWeight: '600', color: '#475569' }}>{ch.field}:</span>{' '}
                                      <span style={{ textDecoration: 'line-through', color: '#94A3B8' }}>{ch.oldVal}</span>{' '}
                                      ➔ <strong style={{ color: '#059669' }}>{ch.newVal}</strong>
                                    </div>
                                  ))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Apply Actions */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                      type="button" 
                      className="adm-btn adm-btn-accent" 
                      style={{ padding: '12px 28px', fontSize: '14px' }}
                      onClick={handleCommitExcelImport}
                      disabled={isCommittingImport || !validationResult.validRows || validationResult.validRows.length === 0}
                    >
                      <CheckCircle2 size={16} />
                      <span>{isCommittingImport ? 'Применение изменений...' : 'Подтвердить и обновить каталог сайта'}</span>
                    </button>

                    <button 
                      type="button" 
                      className="adm-btn adm-btn-outline" 
                      onClick={() => {
                        setValidationResult(null);
                        setExcelFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      Сбросить
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 4: ЭКСПОРТ EXCEL
            ------------------------------------------------------------- */}
        {activeTab === 'export' && (
          <div className="admin-panel-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <Download size={18} color="#2563EB" />
                <span>Выгрузка каталога LAUTE в Microsoft Excel</span>
              </h2>
            </div>

            <div style={{ padding: '30px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                  <FileSpreadsheet size={40} color="#2563EB" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px' }}>Актуальный каталог</h3>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 18px', minHeight: '38px' }}>
                    Выгрузка всех существующих товаров ({totalCount} шт.) со всеми характеристиками, ценами и статусами.
                  </p>
                  <button 
                    type="button" 
                    className="adm-btn adm-btn-accent" 
                    style={{ width: '100%' }}
                    onClick={exportCurrentCatalog}
                  >
                    <Download size={15} />
                    <span>Скачать каталог (.xlsx)</span>
                  </button>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                  <FileSpreadsheet size={40} color="#10B981" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px' }}>Эталонный шаблон</h3>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 18px', minHeight: '38px' }}>
                    Чистый файл с закрепленными заголовками, выпадающими списками, инструкцией и примерами заполнения.
                  </p>
                  <button 
                    type="button" 
                    className="adm-btn adm-btn-primary" 
                    style={{ width: '100%' }}
                    onClick={downloadExcelTemplate}
                  >
                    <Download size={15} />
                    <span>Скачать шаблон (.xlsx)</span>
                  </button>
                </div>
              </div>

              <div style={{ background: '#EFF6FF', padding: '16px', borderRadius: '8px', fontSize: '13px', color: '#1E40AF', display: 'flex', gap: '10px' }}>
                <Info size={18} style={{ flexShrink: 0 }} />
                <span>
                  Файлы формируются в формате Microsoft Excel (.xlsx) с поддержкой автофильтров, стилей LAUTE и валидации списков.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 5: ИСТОРИЯ ИЗМЕНЕНИЙ И ОТКАТ
            ------------------------------------------------------------- */}
        {activeTab === 'history' && (
          <div className="admin-panel-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <History size={18} color="#2563EB" />
                <span>Журнал аудита операций и резервные копии</span>
              </h2>

              <button 
                type="button" 
                className="adm-btn adm-btn-outline adm-btn-sm" 
                onClick={loadHistoryData}
              >
                <RefreshCw size={13} />
                <span>Обновить</span>
              </button>
            </div>

            {rollbackSuccessMsg && (
              <div style={{ margin: '20px 24px 0', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '12px 18px', borderRadius: '8px' }}>
                <CheckCircle2 size={16} /> <strong>{rollbackSuccessMsg}</strong>
              </div>
            )}

            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                Хронология действий сотрудников:
              </h3>

              <div className="admin-table-wrapper" style={{ marginBottom: '32px' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Время</th>
                      <th>Сотрудник</th>
                      <th>Операция</th>
                      <th>Сводка</th>
                      <th>Точка отката</th>
                      {isAdmin && <th style={{ textAlign: 'right' }}>Действие</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {historyLogs.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
                          Записей аудита пока нет.
                        </td>
                      </tr>
                    ) : (
                      historyLogs.map((log) => (
                        <tr key={log.id}>
                          <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: '#64748B' }}>
                            {new Date(log.timestamp).toLocaleString('ru-RU')}
                          </td>
                          <td>
                            <strong>{log.user}</strong>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>{log.userEmail}</div>
                          </td>
                          <td>
                            <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                              {log.actionTitle || log.action}
                            </span>
                          </td>
                          <td style={{ maxWidth: '350px' }}>
                            <div style={{ fontSize: '13px' }}>{log.summary}</div>
                            {log.details && <div style={{ fontSize: '11px', color: '#64748B' }}>{log.details}</div>}
                          </td>
                          <td style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                            {log.backupId ? log.backupId : '—'}
                          </td>
                          {isAdmin && (
                            <td style={{ textAlign: 'right' }}>
                              {log.backupId && (
                                <button 
                                  type="button" 
                                  className="adm-btn adm-btn-outline adm-btn-sm" 
                                  style={{ color: '#D97706', borderColor: '#FDE68A' }}
                                  onClick={() => handleRollback(log.backupId)}
                                  title="Восстановить состояние до этой операции"
                                >
                                  <RotateCcw size={12} />
                                  <span>Откатить</span>
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Backups List */}
              {backupsList.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                    Доступные моментальные снимки (Резервные копии базы):
                  </h3>
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Идентификатор снимка</th>
                          <th>Дата создания</th>
                          <th>Причина создания</th>
                          <th>Автор</th>
                          <th>Товаров</th>
                          {isAdmin && <th style={{ textAlign: 'right' }}>Восстановление</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {backupsList.map((b) => (
                          <tr key={b.backupId}>
                            <td><strong style={{ fontFamily: 'monospace' }}>{b.backupId}</strong></td>
                            <td style={{ fontSize: '12px' }}>{new Date(b.timestamp).toLocaleString('ru-RU')}</td>
                            <td>{b.description}</td>
                            <td>{b.author}</td>
                            <td><strong>{b.productsCount}</strong></td>
                            {isAdmin && (
                              <td style={{ textAlign: 'right' }}>
                                <button 
                                  type="button" 
                                  className="adm-btn adm-btn-outline adm-btn-sm" 
                                  style={{ color: '#2563EB' }}
                                  onClick={() => handleRollback(b.backupId)}
                                >
                                  <RotateCcw size={12} />
                                  <span>Восстановить базу</span>
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 6: ОШИБКИ ИМПОРТА
            ------------------------------------------------------------- */}
        {activeTab === 'errors' && (
          <div className="admin-panel-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <AlertTriangle size={18} color="#DC2626" />
                <span>Журнал ошибок проверки Excel</span>
              </h2>

              <button 
                type="button" 
                className="adm-btn adm-btn-outline adm-btn-sm"
                onClick={downloadErrorReport}
              >
                <Download size={14} />
                <span>Скачать отчёт об ошибках (Excel)</span>
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '18px' }}>
                Здесь отображаются ошибки, выявленные алгоритмом валидации при последней проверке Excel-файла.
              </p>

              {validationResult?.errors && validationResult.errors.length > 0 ? (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>№ Строки</th>
                        <th>Артикул</th>
                        <th>Описание проблемы</th>
                        <th>Рекомендация по исправлению</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationResult.errors.map((err, idx) => (
                        <tr key={idx}>
                          <td><strong>Строка {err.row}</strong></td>
                          <td style={{ fontFamily: 'monospace' }}>{err.article}</td>
                          <td style={{ color: '#DC2626' }}>{err.message}</td>
                          <td>
                            {err.message.includes('не указан артикул') && 'Укажите артикул по стандарту LT-XXXX-YYY'}
                            {err.message.includes('повторяется артикул') && 'Удалите дубликат строки или измените артикул'}
                            {err.message.includes('некорректная цена') && 'Укажите только цифры (например: 28900)'}
                            {err.message.includes('не указано название') && 'Заполните наименование смесителя/товара'}
                            {err.message.includes('не указана категория') && 'Выберите категорию из выпадающего списка'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '10px' }}>
                  <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>Ошибок импорта нет</div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>Все проверенные файлы соответствовали стандартам номенклатуры LAUTE.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 7: УПРАВЛЕНИЕ СОТРУДНИКАМИ (Admin only)
            ------------------------------------------------------------- */}
        {activeTab === 'users' && isAdmin && (
          <div className="admin-panel-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <Users size={18} color="#2563EB" />
                <span>Управление правами и учётными записями сотрудников</span>
              </h2>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>Действующие сотрудники:</h3>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Имя сотрудника</th>
                        <th>E-mail (Логин)</th>
                        <th>Должность</th>
                        <th>Роль</th>
                        <th>Последний вход</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffUsers.map((u) => (
                        <tr key={u.id}>
                          <td><strong>{u.name}</strong></td>
                          <td>{u.email}</td>
                          <td>{u.title}</td>
                          <td>
                            <span style={{ 
                              background: u.role === 'admin' ? '#EFF6FF' : '#F1F5F9',
                              color: u.role === 'admin' ? '#2563EB' : '#475569',
                              padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700'
                            }}>
                              {u.role === 'admin' ? 'АДМИНИСТРАТОР' : 'РЕДАКТОР'}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px', color: '#64748B' }}>
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleString('ru-RU') : 'Не зафиксирован'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add New Staff Form */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '24px', borderRadius: '12px', maxWidth: '640px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Создать новую учётную запись сотрудника:</h3>
                
                <form onSubmit={handleAddStaffSubmit}>
                  <div className="admin-form-group">
                    <label>ФИО Сотрудника *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Например: Алексей Кузнецов"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label>Рабочий E-mail *</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="a.kuznetsov@laute.com"
                        value={newStaffEmail}
                        onChange={(e) => setNewStaffEmail(e.target.value)}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Пароль доступа *</label>
                      <input 
                        type="password" 
                        required 
                        placeholder="Минимум 8 знаков"
                        value={newStaffPassword}
                        onChange={(e) => setNewStaffPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label>Роль в системе *</label>
                      <select 
                        value={newStaffRole}
                        onChange={(e) => setNewStaffRole(e.target.value)}
                      >
                        <option value="editor">Редактор каталога (товары, Excel)</option>
                        <option value="admin">Администратор (полный доступ, бэкапы, сотрудники)</option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label>Должность / Отдел</label>
                      <input 
                        type="text" 
                        placeholder="Менеджер отдела номенклатуры"
                        value={newStaffTitle}
                        onChange={(e) => setNewStaffTitle(e.target.value)}
                      />
                    </div>
                  </div>

                  <button type="submit" className="adm-btn adm-btn-accent" style={{ marginTop: '10px' }}>
                    <Plus size={15} />
                    <span>Создать аккаунт сотрудника</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* -------------------------------------------------------------
          PRODUCT EDIT MODAL
          ------------------------------------------------------------- */}
      {editingProduct && (
        <div className="admin-modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                  Редактирование товара {editingProduct.article}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Изменения сразу сохраняются в базу данных и на сайт</span>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingProduct(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProductEdit}>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Артикул (SKU) [Неизменяемый ключ]</label>
                  <input type="text" disabled value={editingProduct.article} style={{ background: '#F1F5F9' }} />
                </div>

                <div className="admin-form-group">
                  <label>Категория *</label>
                  <select 
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  >
                    {CATEGORY_NAMES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Наименование товара *</label>
                <input 
                  type="text" 
                  required 
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>

              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Цена *</label>
                  <input 
                    type="number" 
                    required 
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Статус публикации</label>
                  <select 
                    value={editingProduct.status}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                  >
                    <option value="АКТИВЕН">АКТИВЕН (Опубликован на сайте)</option>
                    <option value="СКРЫТ">СКРЫТ (Снят с витрины)</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Описание</label>
                <textarea 
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Технические характеристики</label>
                <textarea 
                  value={editingProduct.specs || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, specs: e.target.value })}
                />
              </div>

              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Размеры</label>
                  <input 
                    type="text" 
                    value={editingProduct.dimensions || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, dimensions: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Вес</label>
                  <input 
                    type="text" 
                    value={editingProduct.weight || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value })}
                  />
                </div>
              </div>

              {/* Photos with upload button */}
              <div className="admin-form-group">
                <label>Основная фотография</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <img 
                    src={editingProduct.photo1 || 'images/cat_laute_brand.jpg'} 
                    alt="Превью" 
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                    onError={(e) => { e.target.src = 'images/cat_laute_brand.jpg'; }}
                  />
                  <input 
                    type="text" 
                    value={editingProduct.photo1 || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, photo1: e.target.value })}
                    style={{ flex: 1 }}
                  />
                  <label className="adm-btn adm-btn-outline" style={{ cursor: 'pointer', margin: 0 }}>
                    <ImageIcon size={15} />
                    <span>Загрузить</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageUpload(e, 'edit')}
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="adm-btn adm-btn-outline" 
                  onClick={() => setEditingProduct(null)}
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  className="adm-btn adm-btn-accent"
                  disabled={isSavingProduct}
                >
                  <CheckCircle2 size={16} />
                  <span>{isSavingProduct ? 'Сохранение...' : 'Сохранить изменения'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
