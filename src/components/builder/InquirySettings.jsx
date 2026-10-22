import React from 'react';
import { REGIONS_CONFIG } from '../../data/regionsData';
import { DEFAULT_INQUIRY_EMAIL, INQUIRY_TYPES } from '../../utils/inquiryRouting';

export function InquirySettings({ content, onChange }) {
  const settings = content?.inquiryRouting || {};
  const patch = (region, type, email) => {
    const next = region === 'default'
      ? { ...settings, defaults: { ...settings.defaults, [type]: email.trim() } }
      : { ...settings, regions: { ...settings.regions, [region]: { ...settings.regions?.[region], [type]: email.trim() } } };
    onChange({ ...content, inquiryRouting: next, hasUnpublishedChanges: true });
  };
  return <div className="admin-view">
    <div className="view-header"><div><span className="studio-eyebrow">Сайт / Обращения</span><h2 className="view-title">Email заявок</h2><p className="view-subtitle">Отдельные получатели для сотрудничества, сервиса и заказов в каждом регионе. Сохраните и опубликуйте изменения в верхней панели.</p></div></div>
    <p>Регион берётся из выбора посетителя; в сервисной анкете — из региона обращения. Пустое поле использует общий адрес своего направления.</p>
    <p>Если общий адрес тоже не заполнен, получатель — {DEFAULT_INQUIRY_EMAIL}.</p>
    <p role="note">Каждый новый ящик нужно один раз активировать по письму FormSubmit после первой отправки. Затем повторите заявку. Подтверждение приёма сервисом ещё не подтверждает доставку в почтовый ящик.</p>
    <div className="studio-category-grid">{[{ id: 'default', names: { ru: 'Общие адреса' } }, ...REGIONS_CONFIG].map(region => <section className="studio-category-card" key={region.id}>
      <h3>{region.names.ru}</h3>
      {Object.entries(INQUIRY_TYPES).map(([type, title]) => <label className="form-group" key={type}>{title}<input type="email" aria-label={`${region.names.ru}: ${title}`} value={(region.id === 'default' ? settings.defaults?.[type] : settings.regions?.[region.id]?.[type]) || ''} placeholder={settings.defaults?.[type] || DEFAULT_INQUIRY_EMAIL} onChange={e => patch(region.id, type, e.target.value)} /></label>)}
    </section>)}</div>
  </div>;
}
