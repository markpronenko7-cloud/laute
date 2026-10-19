import React from 'react';
import {
  Sliders,
  Type,
  Image as ImageIcon,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
  Upload
} from 'lucide-react';
import { uploadSingleImage } from '../../services/adminApi';
import { NativeBlockInspector } from './NativeBlockInspector';

export const BlockInspector = ({
  block,
  onChange,
  onOpenMediaPicker,
  availablePages = []
}) => {
  if (!block) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--adm-text-muted)' }}>
        <Sliders size={28} style={{ opacity: 0.4, margin: '0 auto 12px' }} />
        <h4 style={{ margin: '0 0 6px 0', fontSize: 14, color: '#FFFFFF' }}>Блок не выбран</h4>
        <p style={{ margin: 0, fontSize: 12 }}>
          Нажмите на любой блок на макете или выберите его в списке слоёв слева, чтобы редактировать его настройки
        </p>
      </div>
    );
  }

  if (block.type === 'system_page') return <NativeBlockInspector block={block} onChange={onChange} onOpenMediaPicker={onOpenMediaPicker}/>;

  const handleFieldChange = (field, value) => {
    onChange({
      ...block,
      [field]: value
    });
  };

  const handleStyleChange = (styleField, value) => {
    onChange({
      ...block,
      style: {
        ...(block.style || {}),
        [styleField]: value
      }
    });
  };

  const handleItemChange = (itemIdx, field, value) => {
    const updatedItems = [...(block.items || [])];
    updatedItems[itemIdx] = {
      ...updatedItems[itemIdx],
      [field]: value
    };
    onChange({
      ...block,
      items: updatedItems
    });
  };

  const handleAddItem = () => {
    const updatedItems = [...(block.items || [])];
    let newItem = { title: 'Новый пункт', desc: 'Описание пункта' };
    if (block.type === 'faq') {
      newItem = { question: 'Новый вопрос?', answer: 'Подробный ответ на вопрос...' };
    } else if (block.type === 'steps') {
      newItem = { step: `0${updatedItems.length + 1}`, title: 'Новый этап', desc: 'Описание этапа' };
    } else if (block.type === 'contact_cards') {
      newItem = { title: 'Новый филиал', city: 'Город', address: 'Адрес', phone: '+7 (983) 310-56-26', email: 'opt@laute.ltd' };
    }
    updatedItems.push(newItem);
    onChange({
      ...block,
      items: updatedItems
    });
  };

  const handleDeleteItem = (itemIdx) => {
    const updatedItems = (block.items || []).filter((_, i) => i !== itemIdx);
    onChange({
      ...block,
      items: updatedItems
    });
  };

  const handleImageUpload = async (e, targetField = 'imageUrl', itemIdx = null) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadSingleImage(file);
      if (res && res.url) {
        if (itemIdx !== null) {
          handleItemChange(itemIdx, targetField, res.url);
        } else {
          handleFieldChange(targetField, res.url);
        }
      }
    } catch (err) {
      alert(err.message || 'Ошибка загрузки изображения');
    }
  };

  const hasItems = ['features', 'gallery', 'steps', 'contact_cards', 'faq'].includes(block.type);

  return (
    <div className="block-inspector-content" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--adm-border)' }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-accent-amber)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Тип: {block.type}
          </span>
          <h4 style={{ margin: '2px 0 0 0', fontSize: 14, color: '#FFFFFF' }}>Настройки блока</h4>
        </div>
        <button
          type="button"
          className={`admin-btn ${block.isVisible !== false ? 'admin-btn-ghost' : 'admin-btn-outline'} admin-btn-xs`}
          onClick={() => handleFieldChange('isVisible', block.isVisible === false ? true : false)}
          title="Скрыть/показать блок"
        >
          {block.isVisible !== false ? <Eye size={13} /> : <EyeOff size={13} />}
          <span style={{ fontSize: 11 }}>{block.isVisible !== false ? 'Виден' : 'Скрыт'}</span>
        </button>
      </div>

      {/* Main Text Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h5 style={{ margin: 0, fontSize: 12, color: 'var(--adm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Тексты блока
        </h5>

        {/* Badge */}
        {block.badge !== undefined && (
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--adm-text-muted)', marginBottom: 4 }}>
              Бейдж (верхняя плашка):
            </label>
            <input
              type="text"
              className="admin-input"
              value={block.badge || ''}
              onChange={e => handleFieldChange('badge', e.target.value)}
              placeholder="Например: О ЗАВОДЕ LAUTE"
              style={{ width: '100%', fontSize: 12 }}
            />
          </div>
        )}

        {/* Title */}
        {block.title !== undefined && (
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--adm-text-muted)', marginBottom: 4 }}>
              Заголовок:
            </label>
            <input
              type="text"
              className="admin-input"
              value={block.title || ''}
              onChange={e => handleFieldChange('title', e.target.value)}
              placeholder="Основной заголовок"
              style={{ width: '100%', fontSize: 13, fontWeight: 600 }}
            />
          </div>
        )}

        {/* Subtitle */}
        {block.subtitle !== undefined && (
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--adm-text-muted)', marginBottom: 4 }}>
              Подзаголовок / Краткое описание:
            </label>
            <textarea
              rows={2}
              className="admin-input"
              value={block.subtitle || ''}
              onChange={e => handleFieldChange('subtitle', e.target.value)}
              placeholder="Поясняющий текст"
              style={{ width: '100%', fontSize: 12, resize: 'vertical' }}
            />
          </div>
        )}

        {/* Content (Long Text) */}
        {block.content !== undefined && (
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--adm-text-muted)', marginBottom: 4 }}>
              Основное текстовое содержание:
            </label>
            <textarea
              rows={4}
              className="admin-input"
              value={block.content || ''}
              onChange={e => handleFieldChange('content', e.target.value)}
              placeholder="Подробный текст блока..."
              style={{ width: '100%', fontSize: 12, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>
        )}

        {/* Columns fields */}
        {block.type === 'columns' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <div style={{ padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--adm-accent-blue)', marginBottom: 4 }}>Колонка 1:</label>
              <input
                type="text"
                className="admin-input"
                value={block.col1Title || ''}
                onChange={e => handleFieldChange('col1Title', e.target.value)}
                placeholder="Заголовок колонки 1"
                style={{ width: '100%', fontSize: 12, marginBottom: 6 }}
              />
              <textarea
                rows={2}
                className="admin-input"
                value={block.col1Text || ''}
                onChange={e => handleFieldChange('col1Text', e.target.value)}
                placeholder="Текст колонки 1"
                style={{ width: '100%', fontSize: 12 }}
              />
            </div>
            <div style={{ padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--adm-accent-blue)', marginBottom: 4 }}>Колонка 2:</label>
              <input
                type="text"
                className="admin-input"
                value={block.col2Title || ''}
                onChange={e => handleFieldChange('col2Title', e.target.value)}
                placeholder="Заголовок колонки 2"
                style={{ width: '100%', fontSize: 12, marginBottom: 6 }}
              />
              <textarea
                rows={2}
                className="admin-input"
                value={block.col2Text || ''}
                onChange={e => handleFieldChange('col2Text', e.target.value)}
                placeholder="Текст колонки 2"
                style={{ width: '100%', fontSize: 12 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Image Settings (if applicable) */}
      {(block.imageUrl !== undefined || block.type === 'image_text') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--adm-border)', paddingTop: 14 }}>
          <h5 style={{ margin: 0, fontSize: 12, color: 'var(--adm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Изображение блока
          </h5>

          {block.imageUrl && (
            <div style={{ height: 110, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--adm-border)', position: 'relative' }}>
              <img
                src={block.imageUrl.startsWith('http') ? block.imageUrl : `${import.meta.env.BASE_URL}${block.imageUrl.replace(/^\//, '')}`}
                alt="Превью"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <label className="admin-btn admin-btn-outline admin-btn-xs" style={{ flex: 1, justifyContent: 'center', cursor: 'pointer' }}>
              <Upload size={13} />
              <span>Загрузить фото</span>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'imageUrl')} />
            </label>
            {onOpenMediaPicker && (
              <button
                type="button"
                className="admin-btn admin-btn-ghost admin-btn-xs"
                onClick={() => onOpenMediaPicker((url) => handleFieldChange('imageUrl', url))}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <ImageIcon size={13} />
                <span>Медиатека</span>
              </button>
            )}
          </div>

          {block.type === 'image_text' && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
              <label style={{ fontSize: 11, color: 'var(--adm-text-muted)' }}>Расположение фото:</label>
              <select
                className="admin-select"
                value={block.imagePosition || 'right'}
                onChange={e => handleFieldChange('imagePosition', e.target.value)}
                style={{ fontSize: 12, padding: '3px 8px' }}
              >
                <option value="left">Слева</option>
                <option value="right">Справа</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Button / CTA Settings */}
      {['hero', 'image_text', 'cta_banner'].includes(block.type) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--adm-border)', paddingTop: 14 }}>
          <h5 style={{ margin: 0, fontSize: 12, color: 'var(--adm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Кнопка действия (CTA)
          </h5>

          <div>
            <label className="studio-check"><input type="checkbox" checked={!!block.buttonNewTab} onChange={e => handleFieldChange('buttonNewTab', e.target.checked)}/>Внешнюю ссылку в новой вкладке</label>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--adm-text-muted)', marginBottom: 4 }}>Текст кнопки:</label>
            <input
              type="text"
              className="admin-input"
              value={block.buttonText || ''}
              onChange={e => handleFieldChange('buttonText', e.target.value)}
              placeholder="Например: Смотреть каталог"
              style={{ width: '100%', fontSize: 12 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--adm-text-muted)', marginBottom: 4 }}>Ссылка кнопки:</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                className="admin-input"
                value={block.buttonLink || ''}
                onChange={e => handleFieldChange('buttonLink', e.target.value)}
                placeholder="/catalog или https://..."
                style={{ flex: 1, fontSize: 12 }}
              />
              <select
                className="admin-select"
                onChange={e => {
                  if (e.target.value) handleFieldChange('buttonLink', e.target.value);
                }}
                style={{ width: 110, fontSize: 11 }}
              >
                <option value="">Страницы...</option>
                <option value="/">Главная</option>
                <option value="/catalog">Каталог</option>
                <option value="/company">О LAUTE</option>
                <option value="/partners">Партнёрам</option>
                <option value="/where-to-buy">Где купить</option>
                <option value="/service">Сервис</option>
                <option value="/contacts">Контакты</option>
                {availablePages.filter(p => !p.isSystem).map(p => (
                  <option key={p.id} value={`/${p.slug}`}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--adm-text-muted)', marginBottom: 4 }}>Стиль кнопки:</label>
            <select
              className="admin-select"
              value={block.buttonType || 'primary'}
              onChange={e => handleFieldChange('buttonType', e.target.value)}
              style={{ width: '100%', fontSize: 12 }}
            >
              <option value="primary">Основная золотая LAUTE</option>
              <option value="gold">Премиум золото (Gold Accent)</option>
              <option value="outline">Контурная белая (Outline)</option>
            </select>
          </div>
        </div>
      )}

      {/* Repeating Items (Features, Gallery, Steps, Contacts, FAQ) */}
      {hasItems && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--adm-border)', paddingTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h5 style={{ margin: 0, fontSize: 12, color: 'var(--adm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Элементы списка ({block.items?.length || 0})
            </h5>
            <button
              type="button"
              className="admin-btn admin-btn-primary admin-btn-xs"
              onClick={handleAddItem}
            >
              <Plus size={12} />
              <span>Добавить пункт</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
            {(block.items || []).map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 8,
                  padding: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-accent-blue)' }}>
                    Пункт #{idx + 1}
                  </span>
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => handleDeleteItem(idx)}
                    style={{ color: 'var(--adm-accent-red)', padding: 3 }}
                    title="Удалить пункт"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* FAQ Questions */}
                {block.type === 'faq' ? (
                  <>
                    <input
                      type="text"
                      className="admin-input"
                      value={item.question || ''}
                      onChange={e => handleItemChange(idx, 'question', e.target.value)}
                      placeholder="Вопрос..."
                      style={{ fontSize: 12 }}
                    />
                    <textarea
                      rows={2}
                      className="admin-input"
                      value={item.answer || ''}
                      onChange={e => handleItemChange(idx, 'answer', e.target.value)}
                      placeholder="Ответ..."
                      style={{ fontSize: 12, resize: 'vertical' }}
                    />
                  </>
                ) : block.type === 'contact_cards' ? (
                  <>
                    <input
                      type="text"
                      className="admin-input"
                      value={item.title || ''}
                      onChange={e => handleItemChange(idx, 'title', e.target.value)}
                      placeholder="Название филиала"
                      style={{ fontSize: 12 }}
                    />
                    <input
                      type="text"
                      className="admin-input"
                      value={item.city || ''}
                      onChange={e => handleItemChange(idx, 'city', e.target.value)}
                      placeholder="Город, страна"
                      style={{ fontSize: 12 }}
                    />
                    <input
                      type="text"
                      className="admin-input"
                      value={item.address || ''}
                      onChange={e => handleItemChange(idx, 'address', e.target.value)}
                      placeholder="Адрес"
                      style={{ fontSize: 12 }}
                    />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        type="text"
                        className="admin-input"
                        value={item.phone || ''}
                        onChange={e => handleItemChange(idx, 'phone', e.target.value)}
                        placeholder="Телефон"
                        style={{ flex: 1, fontSize: 11 }}
                      />
                      <input
                        type="text"
                        className="admin-input"
                        value={item.email || ''}
                        onChange={e => handleItemChange(idx, 'email', e.target.value)}
                        placeholder="Email"
                        style={{ flex: 1, fontSize: 11 }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      className="admin-input"
                      value={item.title || ''}
                      onChange={e => handleItemChange(idx, 'title', e.target.value)}
                      placeholder="Заголовок карточки"
                      style={{ fontSize: 12, fontWeight: 600 }}
                    />
                    <textarea
                      rows={2}
                      className="admin-input"
                      value={item.desc || ''}
                      onChange={e => handleItemChange(idx, 'desc', e.target.value)}
                      placeholder="Описание карточки"
                      style={{ fontSize: 12, resize: 'vertical' }}
                    />
                    {item.imageUrl !== undefined && (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input
                          type="text"
                          className="admin-input"
                          value={item.imageUrl || ''}
                          onChange={e => handleItemChange(idx, 'imageUrl', e.target.value)}
                          placeholder="Путь к изображению"
                          style={{ flex: 1, fontSize: 11 }}
                        />
                        <label className="admin-btn admin-btn-ghost admin-btn-xs" style={{ cursor: 'pointer', padding: '4px 8px' }}>
                          <Upload size={12} />
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'imageUrl', idx)} />
                        </label>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Style & Layout */}
      {block.type === 'form_lead' && <label className="form-group">Кнопка отправки формы<input className="admin-input" value={block.submitText || ''} placeholder="Отправить заявку в отдел продаж" onChange={e => handleFieldChange('submitText', e.target.value)}/></label>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--adm-border)', paddingTop: 14 }}>
        <h5 style={{ margin: 0, fontSize: 12, color: 'var(--adm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Оформление и дизайн
        </h5>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <label style={{ fontSize: 11, color: 'var(--adm-text-muted)', width: 90 }}>Фон блока:</label>
          <select
            className="admin-select"
            value={block.style?.background || 'dark'}
            onChange={e => handleStyleChange('background', e.target.value)}
            style={{ flex: 1, fontSize: 12 }}
          >
            <option value="dark">Тёмный фон LAUTE (#0B0E14)</option>
            <option value="card">Плашка-карточка (#121721)</option>
            <option value="deep">Глубокий чёрный (#06080B)</option>
            <option value="transparent">Прозрачный</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <label style={{ fontSize: 11, color: 'var(--adm-text-muted)', width: 90 }}>Отступы:</label>
          <select
            className="admin-select"
            value={block.style?.padding || 'lg'}
            onChange={e => handleStyleChange('padding', e.target.value)}
            style={{ flex: 1, fontSize: 12 }}
          >
            <option value="sm">Компактные (36px)</option>
            <option value="md">Стандартные (60px)</option>
            <option value="lg">Просторные (90px)</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <label style={{ fontSize: 11, color: 'var(--adm-text-muted)', width: 90 }}>Выравнивание:</label>
          <select
            className="admin-select"
            value={block.style?.alignment || 'left'}
            onChange={e => handleStyleChange('alignment', e.target.value)}
            style={{ flex: 1, fontSize: 12 }}
          >
            <option value="left">По левому краю</option>
            <option value="center">По центру</option>
          </select>
        </div>
      </div>
    </div>
  );
};
