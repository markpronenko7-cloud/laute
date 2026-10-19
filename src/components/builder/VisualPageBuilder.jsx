import { PageCanvas } from './PageCanvas';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Plus, Save, Check, MoreHorizontal, Monitor, Smartphone, Tablet, X, ArrowUp, ArrowDown, Trash2, History, Eye, Settings, Image as ImageIcon } from 'lucide-react';
import { BlockRenderer } from './BlockRenderer';
import { StudioInspector } from './StudioInspector';
import { BlockLibraryModal } from './BlockLibraryModal';
import { NativeEditorScope } from './NativeContent';
import { getEditableBlocks } from '../../utils/pagePublication';
import { updateCustomPage, fetchPageVersions, rollbackPagesVersion, fetchMediaList, resolveMediaUrl } from '../../services/adminApi';
export function VisualPageBuilder({
  page,
  allPages = [],
  onBack,
  onSaveSuccess,
  showNotice = () => {}
}) {
  const [currentPage, setCurrentPage] = useState(page);
  const [blocks, setBlocks] = useState(() => getEditableBlocks(page));
  const [selectedId, setSelectedId] = useState(() => getEditableBlocks(page)[0]?.id);
  const [selectedField, setSelectedField] = useState(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [device, setDevice] = useState('desktop');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const [menu, setMenu] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [library, setLibrary] = useState(false);
  const [insertAt, setInsertAt] = useState(null);
  const [versions, setVersions] = useState([]);
  const [media, setMedia] = useState([]);
  const [mediaCallback, setMediaCallback] = useState(null);
  const [mediaQuery, setMediaQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const canvas = useRef(null);
  const canvasDocument = useRef(null);
  const selected = blocks.find(b => b.id === selectedId) || null;
  useEffect(() => {
    const warn = e => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const change = next => {
    setBlocks(next);
    setDirty(true);
    setStatus(null);
  };
  const update = block => change(blocks.map(b => b.id === block.id ? block : b));
  const select = (block, index, scroll = false) => {
    setSelectedId(block.id);
    setSelectedField(null);
    setInspectorOpen(true);
    if (scroll) canvasDocument.current?.querySelectorAll('[data-editor-block]')[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };
  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    change(next);
  };
  const remove = index => {
    if (blocks[index]?.protected) return;
    setConfirmation({ text: 'Удалить блок?', action: () => {
      change(blocks.filter((_, i) => i !== index));
      setSelectedId(null);
      setSelectedField(null);
    }});
  };
  const duplicate = (block, index) => {
    if (block.type === 'system_section' || block.type === 'system_page') return;
    const copy = {
      ...structuredClone(block),
      id: 'block-' + crypto.randomUUID()
    };
    const next = [...blocks];
    next.splice(index + 1, 0, copy);
    change(next);
    select(copy, index + 1);
  };
  const back = () => {
    if (busy) return;
    if (dirty) setConfirmation({ text: 'Выйти без сохранения?', action: onBack });
    else onBack();
  };
  const save = async publish => {
    if (busy) return;
    setBusy(true);
    setStatus(null);
    try {
      const saved = await updateCustomPage(currentPage.id, {
        ...currentPage,
        useBuilder: true,
        blocks: blocks.map(b => b.protected ? {
          ...b,
          isVisible: true
        } : b),
        status: publish ? 'ОПУБЛИКОВАН' : 'ЧЕРНОВИК'
      });
      setCurrentPage(saved);
      setDirty(false);
      setStatus({
        type: 'success',
        text: publish ? 'Опубликовано · проверено на сайте' : 'Черновик сохранён'
      });
      onSaveSuccess?.(saved);
    } catch (error) {
      setStatus({
        type: 'error',
        text: error.message
      });
    } finally {
      setBusy(false);
    }
  };
  const openVersions = async () => {
    setMenu(false);
    setDialog('versions');
    setLoading(true);
    setDialogError('');
    try {
      setVersions(await fetchPageVersions());
    } catch (e) {
      setDialogError(e.message);
    } finally {
      setLoading(false);
    }
  };
  const restore = async id => {
    setLoading(true);
    try {
      const list = await rollbackPagesVersion(id);
      const restored = list.find(p => p.id === page.id);
      if (!restored) throw new Error('В этой версии страницы нет');
      setCurrentPage(restored);
      const next = getEditableBlocks(restored);
      setBlocks(next);
      setSelectedId(next[0]?.id);
      setSelectedField(null);
      setDirty(false);
      onSaveSuccess?.(restored);
      setDialog(null);
    } catch (e) {
      setDialogError(e.message);
    } finally {
      setLoading(false);
    }
  };
  const pickMedia = async callback => {
    setMediaCallback(() => callback);
    setDialog('media');
    setLoading(true);
    setDialogError('');
    try {
      setMedia(await fetchMediaList());
    } catch (e) {
      setDialogError(e.message);
    } finally {
      setLoading(false);
    }
  };
  const openSettings = () => {
    setMenu(false);
    setDialog('settings');
  };
  const addTemplate = template => {
    const block = {
      ...structuredClone(template.defaultData || {}),
      id: 'block-' + crypto.randomUUID(),
      type: template.type,
      isVisible: true
    };
    const next = [...blocks];
    const index = insertAt ?? next.length;
    next.splice(index, 0, block);
    change(next);
    setLibrary(false);
    setInsertAt(null);
    select(block, index);
  };
  return <div className="visual-builder-root studio-builder">
    <header className="studio-builder-header">
      <div className="studio-builder-title"><button className="admin-btn admin-btn-ghost" onClick={back} disabled={busy} aria-label="К страницам"><ArrowLeft size={18} /></button><div><strong>{currentPage.title}</strong><small>{dirty ? 'Не сохранено' : currentPage.status === 'ЧЕРНОВИК' ? 'Черновик' : 'На сайте'}</small></div></div>
      <div className="studio-device-switch">{[[Monitor, 'desktop', 'Компьютер'], [Tablet, 'tablet', 'Планшет'], [Smartphone, 'mobile', 'Телефон']].map(([Icon, id, label]) => <button key={id} aria-label={label} className={device === id ? 'active' : ''} onClick={() => setDevice(id)}><Icon size={17} /></button>)}</div>
      <div className="studio-builder-actions"><button className="admin-btn admin-btn-outline" aria-label="Сохранить черновик" onClick={() => save(false)} disabled={busy}><Save size={15} /><span>Сохранить</span></button><button className="admin-btn admin-btn-primary" onClick={() => save(true)} disabled={busy}><Check size={16} /><span>{busy ? 'Проверка…' : 'Опубликовать'}</span></button><div className="studio-more"><button className="admin-btn admin-btn-ghost" aria-label="Другие действия" onClick={() => setMenu(!menu)}><MoreHorizontal size={20} /></button>{menu && <div className="studio-more-menu"><button onClick={() => {
              setDialog('preview');
              setMenu(false);
            }}><Eye size={15} />Предпросмотр</button><button onClick={openSettings}><Settings size={15} />Название и адрес</button><button onClick={openVersions}><History size={15} />История версий</button></div>}</div></div>
    </header>
    {status && <div className={'studio-builder-status ' + status.type} role={status.type === 'error' ? 'alert' : 'status'}>{status.text}</div>}
    <div className="builder-workspace" inert={busy ? '' : undefined}>
      <aside className="builder-sidebar-left"><div className="studio-blocks-heading"><strong>Блоки страницы</strong><span>{blocks.length}</span></div><div className="studio-block-list">{blocks.map((block, index) => <button key={block.id} className={'studio-block-row ' + (selectedId === block.id ? 'active' : '')} onClick={() => select(block, index, true)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{block.title || {
                hero: 'Обложка',
                text: 'Текст',
                gallery: 'Фотографии',
                form_lead: 'Форма',
                contact_cards: 'Контакты',
                features: 'Карточки',
                cta_banner: 'Призыв к действию'
              }[block.type] || 'Блок'}</strong>{block.isVisible === false && <small>Скрыт</small>}</button>)}</div><button className="admin-btn admin-btn-outline studio-add-block" onClick={() => {
          setInsertAt(null);
          setLibrary(true);
        }}><Plus size={16} />Добавить блок</button></aside>
      <main className="builder-canvas-wrapper" ref={canvas}><PageCanvas device={device} onReady={doc => {
          canvasDocument.current = doc;
        }}><NativeEditorScope.Provider value={{
            selected: selectedField,
            onSelect: field => {
              setSelectedId(field.blockId);
              setSelectedField(field);
              setInspectorOpen(true);
              if (window.matchMedia('(max-width: 850px)').matches) requestAnimationFrame(() => canvasDocument.current?.querySelector('[data-native-field="' + CSS.escape(field.key) + '"]')?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
            }
          }}>{blocks.map((block, index) => <BlockRenderer key={block.id} block={block} index={index} totalBlocks={blocks.length} isEditor isSelected={selectedId === block.id} onSelectBlock={select} onMoveUp={i => move(i, -1)} onMoveDown={i => move(i, 1)} onDuplicate={duplicate} onDelete={remove} onAddBelow={i => {
              setInsertAt(i + 1);
              setLibrary(true);
            }} />)}</NativeEditorScope.Provider>{!blocks.length && <button className="studio-empty-canvas" onClick={() => setLibrary(true)}><Plus size={28} />Добавить первый блок</button>}</PageCanvas></main>
      <aside className={'builder-sidebar-right ' + (inspectorOpen ? 'is-open' : '')}><div className="studio-inspector-top"><span>Настройки</span><button className="admin-btn admin-btn-ghost" aria-label="Закрыть настройки" onClick={() => setInspectorOpen(false)}><X size={18} /></button></div><StudioInspector availablePages={allPages} block={selected} selectedField={selectedField} onChange={update} onOpenMediaPicker={pickMedia} onClearField={() => setSelectedField(null)} />{selected && !selectedField && <div className="studio-section-actions"><button className="admin-btn admin-btn-outline" disabled={blocks.indexOf(selected) === 0} onClick={() => move(blocks.indexOf(selected), -1)}><ArrowUp size={15} />Выше</button><button className="admin-btn admin-btn-outline" disabled={blocks.indexOf(selected) === blocks.length - 1} onClick={() => move(blocks.indexOf(selected), 1)}><ArrowDown size={15} />Ниже</button>{!selected.protected && <button className="admin-btn admin-btn-ghost" onClick={() => update({
            ...selected,
            isVisible: selected.isVisible === false
          })}>{selected.isVisible === false ? 'Показать' : 'Скрыть'}</button>}</div>}</aside>
    </div>
    <BlockLibraryModal isOpen={library} onClose={() => setLibrary(false)} onSelectTemplate={addTemplate} />
    {dialog && <div className="admin-modal-overlay studio-dialog-overlay" onClick={() => setDialog(null)}><div className={'admin-modal studio-dialog ' + (dialog === 'preview' ? 'studio-preview-dialog' : '')} onClick={e => e.stopPropagation()}><div className="admin-modal-header"><h3>{{
              media: 'Фотографии',
              versions: 'История версий',
              settings: 'Страница',
              preview: 'Предпросмотр'
            }[dialog]}</h3><button className="admin-btn admin-btn-ghost" aria-label="Закрыть окно" onClick={() => setDialog(null)}><X size={19} /></button></div><div className="admin-modal-body">
      {loading && <p role="status">Загрузка…</p>}{dialogError && <p role="alert">{dialogError}</p>}
      {dialog === 'media' && <><input placeholder="Найти фото" aria-label="Найти фото" value={mediaQuery} onChange={e => setMediaQuery(e.target.value)} /><div className="studio-media-picker">{media.filter(m => m.name.toLowerCase().includes(mediaQuery.toLowerCase())).map(m => <button key={m.url} onClick={() => {
                mediaCallback?.(m.url);
                setDialog(null);
              }}><img src={resolveMediaUrl(m.url)} alt={m.name} /><span>{m.name}</span></button>)}</div></>}
      {dialog === 'versions' && versions.map(v => <div className="studio-version-row" key={v.backupId}><div><strong>{v.description}</strong><small>{new Date(v.timestamp).toLocaleString('ru-RU')}</small></div><button className="admin-btn admin-btn-outline" disabled={loading} onClick={() => setConfirmation({ text: 'Восстановить эту версию всех страниц?', action: () => restore(v.backupId) })}>Восстановить</button></div>)}
      {dialog === 'settings' && <><label className="studio-field"><span>Название</span><input value={currentPage.title || ''} onChange={e => {
                setCurrentPage({
                  ...currentPage,
                  title: e.target.value
                });
                setDirty(true);
              }} /></label><label className="studio-field"><span>Адрес</span><input disabled={currentPage.isSystem} value={currentPage.slug || ''} onChange={e => {
                setCurrentPage({
                  ...currentPage,
                  slug: e.target.value
                });
                setDirty(true);
              }} /></label><label className="studio-field"><span>Описание для поиска</span><textarea value={currentPage.description || ''} onChange={e => {
                setCurrentPage({
                  ...currentPage,
                  description: e.target.value
                });
                setDirty(true);
              }} /></label></>}
      {dialog === 'preview' && <div style={{
            height: '70dvh'
          }}><PageCanvas device={device}><div inert="">{blocks.map((block, index) => <BlockRenderer key={block.id} block={block} index={index} />)}</div></PageCanvas></div>}
    </div></div></div>}
    {confirmation && <div className="admin-modal-overlay studio-dialog-overlay"><div className="admin-modal studio-dialog" role="alertdialog" aria-modal="true" aria-label={confirmation.text}><div className="admin-modal-body"><h3>{confirmation.text}</h3><div className="studio-section-actions"><button className="admin-btn admin-btn-outline" autoFocus onClick={() => setConfirmation(null)}>Остаться</button><button className="admin-btn admin-btn-primary" onClick={() => { const action = confirmation.action; setConfirmation(null); action(); }}>Подтвердить</button></div></div></div></div>}
  </div>;
}
