/**
 * Централизованная конфигурация региональной структуры LAUTE
 * Список регионов: Сибирь, РФ | Казахстан | ОАЭ | США | Китай
 */

export const REGIONS_CONFIG = [
  {
    id: 'siberia',
    names: {
      ru: 'Сибирь, РФ',
      kz: 'Сібір, РФ',
      en: 'Siberia, RF'
    },
    office: 'Россия, 630073, г. Новосибирск, ул. Блюхера, 71',
    primaryPhone: '+7 (983) 310-56-26',
    altPhones: ['+7 (913) 203-07-37'],
    primaryEmail: 'nsk@laute.ltd',
    altEmail: 'opt@laute.ltd',
    responsibleManager: 'Оксана (рук. отдела продаж)',
    serviceEmail: 'nsk@laute.ltd'
  },
  {
    id: 'kz',
    names: {
      ru: 'Казахстан',
      kz: 'Қазақстан',
      en: 'Kazakhstan'
    },
    office: 'Координация поставок в Республику Казахстан',
    primaryPhone: '+7 (983) 310-56-26',
    altPhones: ['+7 (913) 203-07-37'],
    primaryEmail: 'opt@laute.ltd',
    altEmail: 'opt@laute.ltd',
    responsibleManager: 'Экспортное направление LAUTE (РК)',
    serviceEmail: 'opt@laute.ltd'
  },
  {
    id: 'uae',
    names: {
      ru: 'ОАЭ',
      kz: 'БАӘ',
      en: 'UAE'
    },
    office: 'LAUTE International Coordination (UAE / MENA)',
    primaryPhone: '+7 (983) 310-56-26',
    altPhones: [],
    primaryEmail: 'opt@laute.ltd',
    altEmail: 'opt@laute.ltd',
    responsibleManager: 'International B2B Department',
    serviceEmail: 'opt@laute.ltd'
  },
  {
    id: 'usa',
    names: {
      ru: 'США',
      kz: 'АҚШ',
      en: 'USA'
    },
    office: 'LAUTE North America Coordination',
    primaryPhone: '+7 (983) 310-56-26',
    altPhones: [],
    primaryEmail: 'opt@laute.ltd',
    altEmail: 'opt@laute.ltd',
    responsibleManager: 'North America Trade Coordinator',
    serviceEmail: 'opt@laute.ltd'
  },
  {
    id: 'china',
    names: {
      ru: 'Китай',
      kz: 'Қытай',
      en: 'China'
    },
    office: 'LAUTE Manufacturing & Export Hub',
    primaryPhone: '+7 (983) 310-56-26',
    altPhones: [],
    primaryEmail: 'opt@laute.ltd',
    altEmail: 'opt@laute.ltd',
    responsibleManager: 'APAC Export Coordination',
    serviceEmail: 'opt@laute.ltd'
  }
];

export const DEFAULT_REGION_ID = 'siberia';

export const getRegionConfig = (regionId) => {
  return REGIONS_CONFIG.find((r) => r.id === regionId) || REGIONS_CONFIG[0];
};

export const getRegionName = (regionId, lang = 'ru') => {
  const reg = getRegionConfig(regionId);
  return reg.names[lang] || reg.names.ru;
};
