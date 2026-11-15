import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { catalogRoute } from '../utils/catalogSearch';

export function CampaignBanner({ title, image, filters, subtitle, className = '', eager = false, disabled = false, children }) {
  const { lang, navigateTo } = useApp();
  const route = catalogRoute(filters);
  const action = lang === 'en' ? 'View in catalog' : lang === 'kz' ? 'Каталогтан көру' : 'Смотреть в каталоге';
  return <a className={'campaign-banner ' + className} href={import.meta.env.BASE_URL + route} onClick={event => {
    if (disabled) { event.preventDefault(); return; }
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigateTo(route);
  }}>
    <img src={/^(?:https?:|\/|data:|blob:)/i.test(image) ? image : import.meta.env.BASE_URL + image}
      alt="" width="1760" height="900" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} />
    {children}
    <div className="campaign-caption">
      <strong>{title}</strong>
      {subtitle && <small>{subtitle}</small>}
      <span>{action}<ArrowUpRight size={17} aria-hidden="true" /></span>
    </div>
  </a>;
}
