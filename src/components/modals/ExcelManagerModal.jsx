import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  RefreshCw, 
  Trash2, 
  EyeOff, 
  PlusCircle, 
  Check 
} from 'lucide-react';
import { 
  downloadExcelTemplate, 
  exportCurrentCatalogToExcel, 
  parseAndValidateExcelFile, 
  applyExcelImport 
} from '../../utils/excelManager';

export const ExcelManagerModal = () => {
  const { isExcelModalOpen, closeExcelModal, products, updateProducts } = useApp();

  const [uploadedFile, setUploadedFile] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [appliedStats, setAppliedStats] = useState(null);

  const fileInputRef = useRef(null);

  if (!isExcelModalOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsValidating(true);
    setValidationResult(null);
    setImportSuccess(false);

    try {
      const result = await parseAndValidateExcelFile(file, products);
      setValidationResult(result);
    } catch (err) {
      setValidationResult({
        success: false,
        errors: [`Ошибка обработки: ${err.message}`],
        rows: [],
        stats: null
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleApplyImport = () => {
    if (!validationResult || !validationResult.success || validationResult.rows.length === 0) return;

    const updatedCatalog = applyExcelImport(products, validationResult.rows);
    updateProducts(updatedCatalog);
    setAppliedStats(validationResult.stats);
    setImportSuccess(true);
    setValidationResult(null);
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    setUploadedFile(null);
    setValidationResult(null);
    setImportSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="modal-overlay" onClick={closeExcelModal}>
      <div 
        className="modal-content excel-manager-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '880px', width: '95%' }}
      >
        <button className="modal-close-btn" onClick={closeExcelModal} aria-label="Закрыть">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-category-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <FileSpreadsheet size={15} />
            <span>Массовое обновление каталога (Excel)</span>
          </div>
          <h2 className="modal-title" style={{ fontSize: '1.4rem' }}>
            Управление номенклатурой и остатками LAUTE
          </h2>
          <p className="modal-subtitle">
            Загрузка и выгрузка каталога через Excel (.xlsx). Изменения моментально транслируются в каталог сайта и интеллектуальный AI-Консультант.
          </p>
        </div>

        {/* Step 1: Template Actions Bar */}
        <div className="excel-actions-banner">
          <div className="excel-action-col">
            <span className="excel-step-num">1</span>
            <div>
              <div className="excel-step-title">Шаблон для сотрудников</div>
              <p className="excel-step-desc">Скачайте официальный шаблон с правильными заголовками и примерами строк</p>
            </div>
            <button 
              type="button" 
              className="btn btn-outline btn-sm" 
              onClick={downloadExcelTemplate}
              title="Скачать пустой шаблон Excel"
            >
              <Download size={15} />
              <span>Скачать шаблон Excel</span>
            </button>
          </div>

          <div className="excel-action-col">
            <span className="excel-step-num">2</span>
            <div>
              <div className="excel-step-title">Текущий каталог ({products.length} товаров)</div>
              <p className="excel-step-desc">Выгрузить всю действующую базу товаров с актуальными ценами и остатками</p>
            </div>
            <button 
              type="button" 
              className="btn btn-outline btn-sm" 
              onClick={() => exportCurrentCatalogToExcel(products)}
              title="Экспортировать текущие товары в Excel"
            >
              <FileSpreadsheet size={15} />
              <span>Экспорт каталога</span>
            </button>
          </div>
        </div>

        {/* Success State */}
        {importSuccess && (
          <div className="excel-success-box">
            <div className="success-icon-wrap">
              <CheckCircle2 size={32} color="#10B981" />
            </div>
            <div>
              <h4 style={{ margin: '0 0 6px', color: '#10B981', fontSize: '1.1rem' }}>
                Изменения успешно применены к каталогу LAUTE!
              </h4>
              <p style={{ margin: '0 0 10px', color: '#CBD5E1', fontSize: '0.85rem' }}>
                Каталог на сайте и база знаний AI-Консультанта обновлены. AI уже использует свежие цены, характеристики и остатки.
              </p>
              {appliedStats && (
                <div className="excel-stats-chips">
                  <span className="chip-badge chip-new">+{appliedStats.newCount} новых</span>
                  <span className="chip-badge chip-upd">↻ {appliedStats.updateCount} обновлено</span>
                  {appliedStats.hideCount > 0 && <span className="chip-badge chip-hide">👁 {appliedStats.hideCount} скрыто</span>}
                  {appliedStats.deleteCount > 0 && <span className="chip-badge chip-del">✕ {appliedStats.deleteCount} удалено</span>}
                </div>
              )}
            </div>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleReset} style={{ marginLeft: 'auto' }}>
              Загрузить ещё
            </button>
          </div>
        )}

        {/* Step 3: Upload Area */}
        {!importSuccess && (
          <div className="excel-upload-zone">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              id="excel-file-input"
            />
            <label htmlFor="excel-file-input" className="excel-drop-area">
              <Upload size={32} className="upload-cloud-icon" />
              <div className="upload-prompt-text">
                {uploadedFile ? (
                  <strong>Выбран файл: {uploadedFile.name}</strong>
                ) : (
                  <span>Нажмите или перетащите заполненный <strong>Excel-файл (.xlsx)</strong></span>
                )}
              </div>
              <span className="upload-hint">Поддерживаются форматы Excel (.xlsx) и CSV</span>
            </label>
          </div>
        )}

        {/* Loading Spinner during validation */}
        {isValidating && (
          <div className="excel-validating-spinner">
            <RefreshCw size={20} className="spin-icon" />
            <span>Проверка структуры файла и корректности строк...</span>
          </div>
        )}

        {/* Validation Errors Display */}
        {validationResult && !validationResult.success && (
          <div className="excel-errors-panel">
            <div className="error-header">
              <AlertTriangle size={18} color="#EF4444" />
              <strong>Обнаружены ошибки в файле ({validationResult.errors.length}):</strong>
            </div>
            <ul className="error-list">
              {validationResult.errors.map((err, idx) => (
                <li key={idx} className="error-item">{err}</li>
              ))}
            </ul>
            <p className="error-tip">
              Пожалуйста, исправьте указанные строки в Excel и загрузите файл повторно.
            </p>
          </div>
        )}

        {/* Validation Preview & Confirmation */}
        {validationResult && validationResult.success && (
          <div className="excel-preview-panel">
            <div className="preview-header">
              <div className="preview-title-row">
                <CheckCircle2 size={18} color="#10B981" />
                <span className="preview-heading">Файл проверен. Предварительный просмотр изменений:</span>
              </div>
              
              <div className="excel-stats-chips">
                <span className="chip-badge chip-new">+{validationResult.stats.newCount} новых</span>
                <span className="chip-badge chip-upd">↻ {validationResult.stats.updateCount} обновить</span>
                {validationResult.stats.hideCount > 0 && <span className="chip-badge chip-hide">👁 {validationResult.stats.hideCount} скрыть</span>}
                {validationResult.stats.deleteCount > 0 && <span className="chip-badge chip-del">✕ {validationResult.stats.deleteCount} удалить</span>}
              </div>
            </div>

            {/* Safety Notice per Specification */}
            <div className="safety-alert">
              <Info size={16} color="#38BDF8" style={{ flexShrink: 0 }} />
              <span>
                <strong>Безопасность каталога:</strong> Товары, не указанные в файле, НЕ удаляются. Удаление производится исключительно при явном статусе <code>УДАЛИТЬ</code>.
              </span>
            </div>

            {/* Preview Table of rows */}
            <div className="preview-table-container">
              <table className="preview-table">
                <thead>
                  <tr>
                    <th>Строка</th>
                    <th>Действие</th>
                    <th>Артикул</th>
                    <th>Название</th>
                    <th>Категория</th>
                    <th>Цена</th>
                    <th>Город / Наличие</th>
                  </tr>
                </thead>
                <tbody>
                  {validationResult.rows.slice(0, 10).map((r, i) => (
                    <tr key={i} className={`row-action-${r.actionStatus.toLowerCase()}`}>
                      <td>{r.rowNum}</td>
                      <td>
                        <span className={`status-pill status-${r.actionStatus.toLowerCase()}`}>
                          {r.actionStatus}
                        </span>
                      </td>
                      <td><code>{r.article}</code></td>
                      <td>{r.name || '—'}</td>
                      <td>{r.category || '—'}</td>
                      <td>{r.price ? `${r.price.toLocaleString('ru-RU')} ${r.currency}` : '—'}</td>
                      <td>{r.city ? `${r.city}: ${r.stock} шт.` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {validationResult.rows.length > 10 && (
                <div className="table-more-hint">
                  ...и ещё {validationResult.rows.length - 10} позиций
                </div>
              )}
            </div>

            {/* Confirmation Action Buttons */}
            <div className="preview-actions-bar">
              <button type="button" className="btn btn-outline btn-sm" onClick={handleReset}>
                Отмена
              </button>
              <button type="button" className="btn btn-primary" onClick={handleApplyImport}>
                <Check size={16} />
                <span>Подтвердить и применить изменения</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
