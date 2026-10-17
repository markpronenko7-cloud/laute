import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Eye,
  Check,
  RotateCcw,
  Plus,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  Sliders,
  Sparkles,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Globe,
  CheckCircle2,
  AlertTriangle,
  History,
  X
} from 'lucide-react';
import { BlockRenderer } from './BlockRenderer';
import { BlockInspector } from './BlockInspector';
import { BlockLibraryModal } from './BlockLibraryModal';
import {
  updateCustomPage,
  duplicateCustomPage,
  fetchPageVersions,
  rollbackPagesVersion
} from '../../services/adminApi';

export const VisualPageBuilder = ({
  page,
  allPages = [],
  onBack,
  onSaveSuccess,
  showNotice = () => {}
}) => {
  const [currentPage, setCurrentPage] = useState(page);
  const [blocks, setBlocks] = useState(page.blocks || []);
  const [selectedBlockId, setSelectedBlockId] = useState(blocks[0]?.id || null);
  const [selectedBlockIdx, setSelectedBlockIdx] = useState(0);

  const [viewportMode, setViewportMode] = useState('desktop'); // desktop | tablet | mobile
  const [leftTab, setLeftTab] = useState('layers'); // layers | page_seo
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [insertAfterIndex, setInsertAfterIndex] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Versions history state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [pageVersions, setPageVersions] = useState([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

  // Live preview modal state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Media picker modal stub
  const [mediaPickerCallback, setMediaPickerCallback] = useState(null);

  const canvasRef = useRef(null);

  useEffect(() => {
    setCurrentPage(page);
    setBlocks(page.blocks || []);
    if (page.blocks && page.blocks.length > 0) {
      setSelectedBlockId(page.blocks[0].id);
      setSelectedBlockIdx(0);
    }
    setHasUnsavedChanges(false);
  }, [page]);

  const selectedBlock = blocks.find(b => b.id === selectedBlockId) || blocks[selectedBlockIdx] || null;

  // Select a block
  const handleSelectBlock = (blk, idx) => {
    setSelectedBlockId(blk.id);
    setSelectedBlockIdx(idx);
    setLeftTab('layers');
  };

  // Update a block's fields
  const handleUpdateBlock = (updatedBlock) => {
    setBlocks(prev => prev.map(b => b.id === updatedBlock.id ? updatedBlock : b));
    setHasUnsavedChanges(true);
  };

  // Move block up
  const handleMoveUp = (idx) => {
    if (idx <= 0) return;
    setBlocks(prev => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx - 1];
      copy[idx - 1] = temp;
      return copy;
    });
    setSelectedBlockIdx(idx - 1);
    setHasUnsavedChanges(true);
  };

  // Move block down
  const handleMoveDown = (idx) => {
    if (idx >= blocks.length - 1) return;
    setBlocks(prev => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx + 1];
      copy[idx + 1] = temp;
      return copy;
    });
    setSelectedBlockIdx(idx + 1);
    setHasUnsavedChanges(true);
  };

  // Duplicate block
  const handleDuplicateBlock = (blk, idx) => {
    const duplicated = {
      ...JSON.parse(JSON.stringify(blk)),
      id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: blk.title ? `${blk.title} (Копия)` : blk.title
    };
    setBlocks(prev => {
      const copy = [...prev];
      copy.splice(idx + 1, 0, duplicated);
      return copy;
    });
    setSelectedBlockId(duplicated.id);
    setSelectedBlockIdx(idx + 1);
    setHasUnsavedChanges(true);
    showNotice(`Блок "${blk.type}" сдублирован`);
  };

  // Delete block
  const handleDeleteBlock = (idx) => {
    setBlocks(prev => {
      const copy = prev.filter((_, i) => i !== idx);
      return copy;
    });
    if (selectedBlockIdx >= idx && selectedBlockIdx > 0) {
      setSelectedBlockIdx(selectedBlockIdx - 1);
      setSelectedBlockId(blocks[selectedBlockIdx - 1]?.id || null);
    }
    setHasUnsavedChanges(true);
    showNotice('Блок удален');
  };

  // Add block from library template
  const handleAddBlockFromTemplate = (template) => {
    const newBlock = {
      ...JSON.parse(JSON.stringify(template.defaultData)),
      id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: template.type,
      isVisible: true
    };

    setBlocks(prev => {
      const copy = [...prev];
      if (insertAfterIndex !== null && insertAfterIndex >= 0 && insertAfterIndex < copy.length) {
        copy.splice(insertAfterIndex + 1, 0, newBlock);
      } else {
        copy.push(newBlock);
      }
      return copy;
    });

    const newIdx = insertAfterIndex !== null ? insertAfterIndex + 1 : blocks.length;
    setSelectedBlockId(newBlock.id);
    setSelectedBlockIdx(newIdx);
    setInsertAfterIndex(null);
    setHasUnsavedChanges(true);
    showNotice(`Добавлен блок: "${template.name}"`);
  };

  // Save changes to backend
  const handleSavePage = async (statusOverride = null) => {
    setIsSaving(true);
    try {
      const nextStatus = statusOverride !== null ? statusOverride : 'ЧЕРНОВИК';
      const updatedPageData = {
        ...currentPage,
        blocks,
        status: nextStatus,
        updatedAt: new Date().toISOString()
      };

      await updateCustomPage(currentPage.id, updatedPageData);
      setCurrentPage(updatedPageData);
      setHasUnsavedChanges(false);
      showNotice(
        nextStatus === 'ОПУБЛИКОВАН'
          ? 'Страница успешно опубликована на сайте!'
          : 'Черновик страницы сохранён (статус: Черновик)'
      );
      if (onSaveSuccess) onSaveSuccess(updatedPageData);
    } catch (err) {
      showNotice(err.message || 'Ошибка сохранения страницы', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Open versions history
  const handleOpenHistory = async () => {
    setIsLoadingVersions(true);
    setIsHistoryModalOpen(true);
    try {
      const versions = await fetchPageVersions();
      setPageVersions(versions);
    } catch (err) {
      showNotice('Ошибка загрузки истории версий', 'error');
    } finally {
      setIsLoadingVersions(false);
    }
  };

  // Rollback to specific version
  const handleRollback = async (backupId) => {
    if (!window.confirm(`Восстановить версию ${backupId}? Текущие несохраненные правки будут заменены.`)) return;
    try {
      const restoredPages = await rollbackPagesVersion(backupId);
      const list = Array.isArray(restoredPages) ? restoredPages : [];
      const myPage = list.find(p => p.id === currentPage.id);
      if (myPage) {
        setCurrentPage(myPage);
        setBlocks(myPage.blocks || []);
        if (myPage.blocks?.[0]) {
          setSelectedBlockId(myPage.blocks[0].id);
          setSelectedBlockIdx(0);
        }
      }
      setIsHistoryModalOpen(false);
      setHasUnsavedChanges(false);
      showNotice('Версия успешно восстановлена!');
      if (onSaveSuccess && myPage) onSaveSuccess(myPage);
    } catch (err) {
      showNotice(err.message || 'Ошибка восстановления версии', 'error');
    }
  };

  // Viewport width styling
  let canvasWidth = '100%';
  if (viewportMode === 'tablet') canvasWidth = '768px';
  if (viewportMode === 'mobile') canvasWidth = '375px';

  return (
    <div className="visual-builder-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#07090D', color: '#FFFFFF', overflow: 'hidden' }}>
      {/* 1. TOP APP BAR */}
      <header className="builder-topbar" style={{ height: 56, background: '#0D1117', borderBottom: '1px solid var(--adm-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 100 }}>
        {/* Left: Back & Page title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={() => {
              if (hasUnsavedChanges) {
                if (!window.confirm('У вас есть несохранённые изменения. Вы уверены, что хотите выйти?')) return;
              }
              onBack();
            }}
          >
            <ArrowLeft size={16} />
            <span>Страницы</span>
          </button>

          <div style={{ height: 22, width: 1, background: 'var(--adm-border)' }}></div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ fontSize: 14, color: '#FFFFFF' }}>{currentPage.title}</strong>
              <code style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, color: 'var(--adm-accent-blue)' }}>
                {currentPage.route || `/${currentPage.slug}`}
              </code>
              <span
                className={`stat-tag ${currentPage.status === 'ОПУБЛИКОВАН' ? 'success' : 'warning'}`}
                style={{ fontSize: 11, padding: '2px 8px' }}
              >
                {currentPage.status === 'ОПУБЛИКОВАН' ? 'Опубликовано' : 'Черновик'}
              </span>
              {hasUnsavedChanges && (
                <span style={{ fontSize: 11, color: 'var(--adm-accent-amber)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  • Не сохранено
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Device Viewport Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: 3, borderRadius: 8, border: '1px solid var(--adm-border)' }}>
          <button
            type="button"
            className={`admin-btn ${viewportMode === 'desktop' ? 'admin-btn-primary' : 'admin-btn-ghost'} admin-btn-xs`}
            onClick={() => setViewportMode('desktop')}
            title="Десктоп (100%)"
            style={{ padding: '4px 10px' }}
          >
            <Monitor size={14} />
            <span style={{ fontSize: 11 }}>Desktop</span>
          </button>

          <button
            type="button"
            className={`admin-btn ${viewportMode === 'tablet' ? 'admin-btn-primary' : 'admin-btn-ghost'} admin-btn-xs`}
            onClick={() => setViewportMode('tablet')}
            title="Планшет (768px)"
            style={{ padding: '4px 10px' }}
          >
            <Tablet size={14} />
            <span style={{ fontSize: 11 }}>Tablet</span>
          </button>

          <button
            type="button"
            className={`admin-btn ${viewportMode === 'mobile' ? 'admin-btn-primary' : 'admin-btn-ghost'} admin-btn-xs`}
            onClick={() => setViewportMode('mobile')}
            title="Смартфон (375px)"
            style={{ padding: '4px 10px' }}
          >
            <Smartphone size={14} />
            <span style={{ fontSize: 11 }}>Mobile</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="admin-btn admin-btn-outline admin-btn-xs"
            onClick={handleOpenHistory}
            title="История версий и откат"
          >
            <History size={13} />
            <span>Версии</span>
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-ghost admin-btn-xs"
            onClick={() => setIsPreviewModalOpen(true)}
            title="Предпросмотр всей страницы"
          >
            <Eye size={13} />
            <span>Предпросмотр</span>
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-outline admin-btn-sm"
            onClick={() => handleSavePage('ЧЕРНОВИК')}
            disabled={isSaving}
          >
            <Save size={14} />
            <span>{isSaving ? 'Сохранение...' : 'Сохранить черновик'}</span>
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-primary admin-btn-sm"
            onClick={() => handleSavePage('ОПУБЛИКОВАН')}
            disabled={isSaving}
            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)', color: '#000', fontWeight: 700 }}
          >
            <Check size={14} />
            <span>Опубликовать</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN 3-COLUMN WORKSPACE */}
      <div className="builder-workspace" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT COLUMN: Layers & Structure */}
        <aside className="builder-sidebar-left" style={{ width: 280, background: '#0D1117', borderRight: '1px solid var(--adm-border)', display: 'flex', flexDirection: 'column' }}>
          {/* Left panel header */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--adm-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                className={`admin-btn ${leftTab === 'layers' ? 'admin-btn-primary' : 'admin-btn-ghost'} admin-btn-xs`}
                onClick={() => setLeftTab('layers')}
              >
                <Layers size={13} />
                <span>Блоки ({blocks.length})</span>
              </button>
              <button
                type="button"
                className={`admin-btn ${leftTab === 'page_seo' ? 'admin-btn-primary' : 'admin-btn-ghost'} admin-btn-xs`}
                onClick={() => setLeftTab('page_seo')}
              >
                <Globe size={13} />
                <span>SEO</span>
              </button>
            </div>

            <button
              type="button"
              className="admin-btn admin-btn-primary admin-btn-xs"
              onClick={() => {
                setInsertAfterIndex(null);
                setIsLibraryOpen(true);
              }}
              title="Добавить блок в конец страницы"
              style={{ padding: '4px 8px' }}
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Left panel body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {leftTab === 'layers' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {blocks.map((blk, idx) => {
                  const isSel = blk.id === selectedBlockId;
                  return (
                    <div
                      key={blk.id}
                      onClick={() => handleSelectBlock(blk, idx)}
                      style={{
                        padding: '9px 10px',
                        borderRadius: 8,
                        background: isSel ? 'rgba(56, 139, 253, 0.15)' : 'rgba(255,255,255,0.02)',
                        border: isSel ? '1px solid var(--adm-accent-blue)' : '1px solid rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--adm-accent-amber)' }}>
                          #{idx + 1}
                        </span>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {blk.title || blk.name || blk.type}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--adm-text-muted)', textTransform: 'uppercase' }}>
                            {blk.type}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          className="action-btn"
                          disabled={idx === 0}
                          onClick={() => handleMoveUp(idx)}
                          style={{ padding: 2, height: 20, width: 20 }}
                          title="Выше"
                        >
                          <ArrowUp size={11} />
                        </button>
                        <button
                          type="button"
                          className="action-btn"
                          disabled={idx === blocks.length - 1}
                          onClick={() => handleMoveDown(idx)}
                          style={{ padding: 2, height: 20, width: 20 }}
                          title="Ниже"
                        >
                          <ArrowDown size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  className="admin-btn admin-btn-outline admin-btn-xs"
                  onClick={() => {
                    setInsertAfterIndex(null);
                    setIsLibraryOpen(true);
                  }}
                  style={{ width: '100%', marginTop: 8, padding: '8px 12px', justifyContent: 'center', borderStyle: 'dashed' }}
                >
                  <Plus size={14} />
                  <span>+ Добавить блок</span>
                </button>
              </div>
            ) : (
              /* SEO & Page settings tab */
              <div style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--adm-text-muted)', marginBottom: 4 }}>
                    Название страницы:
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={currentPage.title || ''}
                    onChange={e => {
                      setCurrentPage({ ...currentPage, title: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    style={{ width: '100%', fontSize: 12 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--adm-text-muted)', marginBottom: 4 }}>
                    URL slug:
                  </label>
                  <input
                    type="text"
                    disabled={currentPage.isSystem}
                    className="admin-input"
                    value={currentPage.slug || ''}
                    onChange={e => {
                      setCurrentPage({ ...currentPage, slug: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    style={{ width: '100%', fontSize: 12 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--adm-text-muted)', marginBottom: 4 }}>
                    Meta Description:
                  </label>
                  <textarea
                    rows={3}
                    className="admin-input"
                    value={currentPage.description || ''}
                    onChange={e => {
                      setCurrentPage({ ...currentPage, description: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    style={{ width: '100%', fontSize: 12, resize: 'vertical' }}
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* CENTER COLUMN: Interactive Canvas */}
        <main
          className="builder-canvas-wrapper"
          style={{
            flex: 1,
            background: '#040609',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 12px'
          }}
          onClick={() => setSelectedBlockId(null)}
        >
          <div
            ref={canvasRef}
            className={`builder-canvas-frame frame-${viewportMode}`}
            style={{
              width: canvasWidth,
              maxWidth: '100%',
              minHeight: '80vh',
              background: '#0B0E14',
              borderRadius: viewportMode === 'desktop' ? 0 : 16,
              border: viewportMode === 'desktop' ? 'none' : '2px solid rgba(255,255,255,0.1)',
              boxShadow: viewportMode === 'desktop' ? 'none' : '0 20px 60px rgba(0,0,0,0.8)',
              overflow: 'hidden',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {blocks.length === 0 ? (
              <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--adm-text-muted)' }}>
                <Sparkles size={40} style={{ color: '#D4AF37', margin: '0 auto 16px', opacity: 0.7 }} />
                <h3 style={{ color: '#FFFFFF', margin: '0 0 8px 0', fontSize: 20 }}>Страница пока пуста</h3>
                <p style={{ margin: '0 0 24px 0', fontSize: 14 }}>
                  Добавьте готовый блок из библиотеки LAUTE, чтобы начать конструирование страницы
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLibraryOpen(true);
                  }}
                >
                  <Plus size={16} />
                  <span>+ Выбрать первый блок</span>
                </button>
              </div>
            ) : (
              blocks.map((blk, idx) => (
                <BlockRenderer
                  key={blk.id || idx}
                  block={blk}
                  index={idx}
                  totalBlocks={blocks.length}
                  isEditor={true}
                  isSelected={blk.id === selectedBlockId}
                  onSelectBlock={handleSelectBlock}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onDuplicate={handleDuplicateBlock}
                  onDelete={handleDeleteBlock}
                  onAddBelow={(index) => {
                    setInsertAfterIndex(index);
                    setIsLibraryOpen(true);
                  }}
                />
              ))
            )}
          </div>
        </main>

        {/* RIGHT COLUMN: Block Inspector */}
        <aside className="builder-sidebar-right" style={{ width: 340, background: '#0D1117', borderLeft: '1px solid var(--adm-border)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <BlockInspector
            block={selectedBlock}
            onChange={handleUpdateBlock}
            availablePages={allPages}
            onOpenMediaPicker={callback => setMediaPickerCallback(() => callback)}
          />
        </aside>
      </div>

      {/* 3. MODALS */}
      {/* Block Library Modal */}
      <BlockLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectTemplate={handleAddBlockFromTemplate}
      />

      {/* Version History Modal */}
      {isHistoryModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsHistoryModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <History size={18} style={{ color: 'var(--adm-accent-amber)' }} />
                <h3>История версий и точек восстановления</h3>
              </div>
              <button type="button" className="close-btn" onClick={() => setIsHistoryModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              {isLoadingVersions ? (
                <p>Загрузка списка версий...</p>
              ) : pageVersions.length === 0 ? (
                <p className="empty-text">История автоматических снимков пуста. Снимки создаются при каждом сохранении.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pageVersions.map(v => (
                    <div
                      key={v.backupId}
                      style={{
                        padding: '12px 14px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--adm-border)',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <strong>{v.description}</strong>
                        <div style={{ fontSize: 12, color: 'var(--adm-text-muted)', marginTop: 2 }}>
                          {new Date(v.timestamp).toLocaleString('ru-RU')}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="admin-btn admin-btn-outline admin-btn-xs"
                        onClick={() => handleRollback(v.backupId)}
                      >
                        <RotateCcw size={12} />
                        <span>Восстановить</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Live Preview Modal */}
      {isPreviewModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsPreviewModalOpen(false)} style={{ zIndex: 10000 }}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ width: '96%', maxWidth: 1200, height: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="admin-modal-header" style={{ padding: '12px 18px', borderBottom: '1px solid var(--adm-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Eye size={18} style={{ color: 'var(--adm-accent-blue)' }} />
                <h3 style={{ margin: 0, fontSize: 16 }}>Предпросмотр страницы: {currentPage.title}</h3>
              </div>
              <button type="button" className="close-btn" onClick={() => setIsPreviewModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', background: '#0B0E14' }}>
              {blocks.map((blk, idx) => (
                <BlockRenderer
                  key={blk.id || idx}
                  block={blk}
                  index={idx}
                  totalBlocks={blocks.length}
                  isEditor={false}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
