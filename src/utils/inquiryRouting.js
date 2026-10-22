import { REGIONS_CONFIG } from '../data/regionsData.js';

export const DEFAULT_INQUIRY_EMAIL = 'markpronenko7@gmail.com';
export const INQUIRY_TYPES = { partner: 'Сотрудничество', service: 'Сервис', order: 'Заказы из каталога' };
export const isInquiryEmail = value => /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(String(value || '').trim());

export function resolveInquiryRecipient(settings, type, region) {
  const config = settings || {};
  const email = config.regions?.[region]?.[type] || config.defaults?.[type] || DEFAULT_INQUIRY_EMAIL;
  if (!isInquiryEmail(email)) throw new Error('Адрес получателя настроен неверно. Свяжитесь с LAUTE по телефону.');
  return email.trim();
}

export function validateInquiryRouting(settings) {
  if (!settings) return;
  const rows = [settings.defaults, ...REGIONS_CONFIG.map(r => settings.regions?.[r.id])];
  for (const row of rows) for (const type of Object.keys(INQUIRY_TYPES)) {
    if (row?.[type] && !isInquiryEmail(row[type])) throw new Error('Проверьте email получателей заявок: нужен один корректный адрес в каждом поле.');
  }
}
