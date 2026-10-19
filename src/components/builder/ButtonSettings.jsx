import React, { useState } from 'react';
import { SITE_CONTROLS } from '../../data/siteControls';

export function ButtonSettings({ content, onChange }) {
  const [search, setSearch] = useState('');
  const patch = (id, values) => onChange({ ...content, hasUnpublishedChanges: true,
    buttons: { ...content?.buttons, [id]: { ...content?.buttons?.[id], ...values } } });
  return <div className="admin-view">
    <div className="view-header"><div><span className="studio-eyebrow">Сайт / Действия</span><h2 className="view-title">Кнопки сайта</h2><p className="view-subtitle">Текст, действие и оформление. Пустой текст сохраняет текущую подпись на каждом языке. Кнопки новых блоков настраиваются в конструкторе.</p></div></div>
    <input className="admin-input" aria-label="Найти кнопку" placeholder="Найти страницу или кнопку…" value={search} onChange={e => setSearch(e.target.value)}/>
    <div className="studio-category-grid">{SITE_CONTROLS.filter(c => (c.page + ' ' + c.label).toLowerCase().includes(search.toLowerCase())).map(c => {
      const value = content?.buttons?.[c.id] || {};
      return <section className="studio-category-card" key={c.id}>
        <span className="studio-eyebrow">{c.page}</span><h3>{c.label}</h3>
        <label className="form-group">Текст кнопки<input aria-label={'Текст: ' + c.label} value={value.label || ''} placeholder="Текущая подпись" onChange={e => patch(c.id, { label: e.target.value })}/></label>
        {!c.submit && <><label className="form-group">При нажатии<select aria-label={'Действие: ' + c.label} value={value.action || 'original'} onChange={e => patch(c.id, { action: e.target.value })}>
          <option value="original">Текущее действие</option><option value="link">Перейти по ссылке</option><option value="partner">Открыть заявку партнёра</option><option value="service">Открыть обращение в сервис</option><option value="cart">Открыть корзину</option>
        </select></label>
        {value.action === 'link' && <><label className="form-group">Ссылка<input aria-label={'Ссылка: ' + c.label} placeholder="/catalog, #контакты или https://…" value={value.link || ''} onChange={e => patch(c.id, { link: e.target.value })}/></label><label className="studio-check"><input type="checkbox" checked={!!value.newTab} onChange={e => patch(c.id, { newTab: e.target.checked })}/>Внешнюю ссылку в новой вкладке</label></>}</>}
        <label className="form-group">Оформление<select value={value.style || ''} onChange={e => patch(c.id, { style: e.target.value })}><option value="">Текущее</option><option value="primary">Основная</option><option value="secondary">Второстепенная</option><option value="outline">Контурная</option></select></label>
        <label className="studio-check"><input type="checkbox" checked={value.isVisible !== false} onChange={e => patch(c.id, { isVisible: e.target.checked })}/>Показывать на сайте</label>
      </section>;
    })}</div>
  </div>;
}
