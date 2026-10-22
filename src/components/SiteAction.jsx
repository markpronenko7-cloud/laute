import React from 'react';
import { useApp } from '../context/AppContext';

export const isSafeActionLink = value => !value || /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(value);

// Keep the existing action unless the employee explicitly chooses a destination.
export function SiteAction({ controlId, children, onClick, className, ...props }) {
  const { siteContent, navigateTo, openPartnerModal, openServiceModal, openCartModal } = useApp();
  const setting = siteContent?.buttons?.[controlId] || {};
  if (setting.isVisible === false) return null;
  let replaced = false;
  const content = React.Children.map(children, child => {
    if (!replaced && !props['aria-busy'] && setting.label && React.isValidElement(child) && child.type === 'span') {
      replaced = true;
      return React.cloneElement(child, {}, setting.label);
    }
    return child;
  });
  const handleClick = e => {
    if (props.type === 'submit' || !setting.action || setting.action === 'original') return onClick?.(e);
    e.preventDefault();
    if (setting.action === 'partner') return openPartnerModal();
    if (setting.action === 'service') return openServiceModal();
    if (setting.action === 'cart') return openCartModal();
    const link = setting.link?.trim();
    if (!link || !isSafeActionLink(link)) return;
    if (link.startsWith('/')) return navigateTo(link.slice(1) || 'home');
    if (link.startsWith('#')) return document.getElementById(link.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    if (setting.newTab && /^https?:/i.test(link)) window.open(link, '_blank', 'noopener,noreferrer');
    else window.location.assign(link);
  };
  const styled = setting.style ? className?.replace(/\bbtn-(primary|secondary|outline|gold)\b/g, '') + ` btn-${setting.style}` : className;
  return <button {...props} data-site-action={controlId} className={styled} onClick={handleClick}>{content}</button>;
}
