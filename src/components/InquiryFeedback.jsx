import React from 'react';
import { useApp } from '../context/AppContext';

export function InquiryFeedback({ sending, error }) {
  const { lang } = useApp();
  return <>
    {sending && <p role="status" aria-live="polite">{lang === 'en' ? 'Sending your request…' : lang === 'kz' ? 'Өтініш жіберілуде…' : 'Отправляем заявку…'}</p>}
    {error && <p role="alert" style={{ color: '#b91c1c', background: '#fff1f2', padding: 12, borderRadius: 8, lineHeight: 1.5 }}>{error}</p>}
  </>;
}
