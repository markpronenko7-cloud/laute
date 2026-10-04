/**
 * Централизованная конфигурация региональной структуры LAUTE
 *
 * Согласно протоколу проекта:
 * Окончательный перечень стран, регионов, филиалов и складов отгрузки
 * находится на этапе согласования. Конфигурация ниже представляет собой
 * гибкую модель данных для маршрутизации обращений, контактов и логистики.
 */

export const REGIONS_CONFIG = [
  {
    id: 'siberia',
    names: {
      ru: 'Сибирь (РФ)',
      kz: 'Сібір (РФ)',
      en: 'Siberia (RF)'
    },
    office: 'Россия, 630073, г. Новосибирск, ул. Блюхера, 71',
    primaryPhone: '+7 (983) 310-56-26',
    altPhones: ['+7 (913) 203-07-37', '+7 (952) 802-55-99'],
    primaryEmail: 'nsk@laute.ltd',
    altEmail: 'opt@laute.ltd',
    responsibleManager: 'Оксана (рук. отдела продаж)',
    serviceEmail: 'nsk@laute.ltd',
    logisticsNote: {
      ru: 'Отгрузки по Сибирскому ФО, Дальнему Востоку и сопредельным территориям',
      kz: 'Сібір ФО, Қиыр Шығыс және көршілес аумақтар бойынша жөнелтулер',
      en: 'Shipments across Siberian Federal District, Far East and adjacent regions'
    }
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
    serviceEmail: 'opt@laute.ltd',
    logisticsNote: {
      ru: 'Прямые контрактные поставки оптовым дилерам и сетям в Республике Казахстан',
      kz: 'Қазақстан Республикасындағы көтерме дилерлер мен желілерге тікелей жеткізілімдер',
      en: 'Direct B2B supply agreements with wholesale distributors across Kazakhstan'
    }
  },
  {
    id: 'ru',
    names: {
      ru: 'Россия (Европейская часть)',
      kz: 'Ресей (Еуропалық бөлігі)',
      en: 'Russia (European Part)'
    },
    office: 'Центральное координационное направление поставок',
    primaryPhone: '+7 (913) 203-07-37',
    altPhones: ['+7 (983) 310-56-26'],
    primaryEmail: 'opt@laute.ltd',
    altEmail: 'opt@laute.ltd',
    responsibleManager: 'Сергей (отдел оптовых поставок)',
    serviceEmail: 'opt@laute.ltd',
    logisticsNote: {
      ru: 'Комплектация и организация логистики по европейской части РФ',
      kz: 'РФ еуропалық бөлігі бойынша логистиканы ұйымдастыру',
      en: 'Order fulfillment and freight coordination for western regions of Russia'
    }
  },
  {
    id: 'other',
    names: {
      ru: 'Другие регионы и страны СНГ',
      kz: 'Басқа өңірлер және ТМД',
      en: 'Other Regions & CIS'
    },
    office: 'Департамент внешнеэкономической деятельности LAUTE',
    primaryPhone: '+7 (983) 310-56-26',
    altPhones: ['+7 (913) 203-07-37'],
    primaryEmail: 'opt@laute.ltd',
    altEmail: 'pro_d@laute.ltd',
    responsibleManager: 'Департамент ВЭД и контрактных поставок',
    serviceEmail: 'opt@laute.ltd',
    logisticsNote: {
      ru: 'Индивидуальные внешнеторговые контракты, поставки в страны ЕАЭС и СНГ',
      kz: 'Жеке сыртқы сауда келісім-шарттары, ЕАЭО және ТМД елдеріне жеткізілімдер',
      en: 'Cross-border wholesale contracts, supply chains for EAEU & international markets'
    }
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
