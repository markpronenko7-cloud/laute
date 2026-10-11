import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translations } from '../src/i18n/translations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const BACKUPS_DIR = path.resolve(DATA_DIR, 'backups');
const CONTENT_BACKUPS_DIR = path.resolve(BACKUPS_DIR, 'content');
const CONTENT_FILE = path.resolve(DATA_DIR, 'content.json');
const DRAFT_FILE = path.resolve(DATA_DIR, 'draft_content.json');
const CATEGORIES_FILE = path.resolve(DATA_DIR, 'categories.json');
const CUSTOM_PAGES_FILE = path.resolve(DATA_DIR, 'custom_pages.json');
const PUBLIC_CONTENT_FILE = path.resolve(__dirname, '..', 'public', 'data', 'content.json');

// Ensure directories
[DATA_DIR, BACKUPS_DIR, CONTENT_BACKUPS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function readJson(file, defaultVal) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
  return defaultVal;
}

function writeJson(file, data) {
  try {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
  }
}

/**
 * Baseline initial content builder from translations and site configuration
 */
export function buildInitialContent() {
  return {
    version: '1.0.0',
    lastPublishedAt: new Date().toISOString(),
    publishedBy: 'Система LAUTE',
    seo: {
      global: {
        siteName: 'LAUTE',
        defaultTitle: 'LAUTE — Завод смесителей и инженерной сантехники | Официальный сайт',
        defaultDescription: 'Официальный сайт завода сантехники LAUTE: кухонные смесители с подключением к фильтру, пространства ванных комнат, душевые зоны, испанские картриджи Sedal, латунь А+, PVD-покрытия и Первый цифровой сервис.',
        keywords: 'LAUTE, смесители, завод смесителей, сантехника, душевые системы, Sedal, CW617N, латунь',
        canonicalUrl: 'https://laute.ltd',
        robots: 'index, follow'
      },
      pages: {
        home: {
          title: 'LAUTE — Завод смесителей и инженерной сантехники | Официальный сайт',
          description: 'Официальный сайт завода сантехники LAUTE: немецкие стандарты качества, европейская первичная латунь CW617N, картриджи Sedal.',
          slug: '',
          h1: 'Смешивая воду. Бизнес и Технологии.',
          indexing: true
        },
        catalog: {
          title: 'Каталог продукции LAUTE — Смесители и душевые системы оптом',
          description: 'Полная номенклатура завода LAUTE: кухонные смесители, смесители для ванны и умывальника, душевые стойки.',
          slug: 'catalog',
          h1: 'Каталог продукции LAUTE',
          indexing: true
        },
        company: {
          title: 'О компании LAUTE — Завод и стандарты производства',
          description: 'История, стандарты качества, технологии производства и лаборатория контроля сантехники LAUTE.',
          slug: 'company',
          h1: 'О компании LAUTE',
          indexing: true
        },
        partners: {
          title: 'Партнёрам и дилерам LAUTE — Условия оптового сотрудничества',
          description: 'Прямые поставки от завода LAUTE для оптовиков, строительных комплектаций и региональных дилеров.',
          slug: 'partners',
          h1: 'Сотрудничество с LAUTE',
          indexing: true
        },
        service: {
          title: 'Первый цифровой сервис LAUTE — Заводская гарантия 5 лет',
          description: 'Цифровой сервис-деск LAUTE: решение рекламаций и сервисных вопросов за 36 часов по заводскому регламенту.',
          slug: 'service',
          h1: 'Первый цифровой сервис LAUTE',
          indexing: true
        },
        whereToBuy: {
          title: 'Где купить продукцию LAUTE — Официальные партнеры и точки продаж',
          description: 'Официальные представительства, дилеры и оптовые склады LAUTE в России, Казахстане и СНГ.',
          slug: 'where-to-buy',
          h1: 'Где купить LAUTE',
          indexing: true
        },
        contacts: {
          title: 'Контакты завода LAUTE — Отдел продаж и представительства',
          description: 'Свяжитесь с представительством завода LAUTE. Телефоны отдела продаж, адрес и реквизиты.',
          slug: 'contacts',
          h1: 'Контакты LAUTE',
          indexing: true
        }
      }
    },
    navigation: [
      { id: 'nav-home', label: 'Главная', route: 'home', order: 1, isVisible: true },
      { id: 'nav-catalog', label: 'Каталог', route: 'catalog', order: 2, isVisible: true },
      { id: 'nav-company', label: 'О LAUTE', route: 'company', order: 3, isVisible: true },
      { id: 'nav-partners', label: 'Партнёрам', route: 'partners', order: 4, isVisible: true },
      { id: 'nav-service', label: 'Сервис и гарантия', route: 'service', order: 5, isVisible: true },
      { id: 'nav-where-to-buy', label: 'Где купить', route: 'where-to-buy', order: 6, isVisible: true },
      { id: 'nav-contacts', label: 'Контакты', route: 'contacts', order: 7, isVisible: true }
    ],
    footer: {
      brandDescription: 'LAUTE — завод смесителей, душевых систем, кухонных моек и комплектующих. Продукция для жилых пространств и профессиональных проектов.',
      officeAddress: 'Россия, 630073, Новосибирская область, г. Новосибирск, ул. Блюхера, 71',
      phones: [
        { label: 'Отдел продаж 1', number: '+7 (983) 310-56-26', tel: '+79833105626' },
        { label: 'Отдел продаж 2', number: '+7 (913) 203-07-37', tel: '+79132030737' }
      ],
      emails: [
        { label: 'Оптовый отдел', email: 'opt@laute.ltd' }
      ],
      socials: {
        instagram: 'https://www.instagram.com/laute.official.russia/',
        facebook: 'https://www.facebook.com/laute.official.russia/',
        youtube: 'https://www.youtube.com/channel/UCNr6GllBjjPC6mg0wyc-BOw'
      },
      legalText: 'Политика конфиденциальности • Пользовательское соглашение',
      copyrightNotice: '© 2026 LAUTE LTD. Все права защищены.'
    },
    homeBlocks: {
      heroSlider: [
        {
          id: 'slide-1',
          tagline: 'LAUTE®',
          title: 'Управляй водой грамотно',
          subtitle: '',
          buttonText: 'Каталог',
          buttonLink: 'catalog',
          image: 'images/hero/hero-slide-1.jpg',
          order: 1,
          isVisible: true
        },
        {
          id: 'slide-2',
          tagline: 'ДУШЕВЫЕ СИСТЕМЫ LAUTE',
          title: 'Вода, наполняющая жизнь',
          subtitle: '',
          buttonText: 'Смотреть каталог',
          buttonLink: 'catalog',
          image: 'images/hero/hero-slide-2.jpg',
          order: 2,
          isVisible: true
        },
        {
          id: 'slide-3',
          tagline: 'КУХОННЫЕ РЕШЕНИЯ',
          title: 'Функциональность встречается с дизайном.',
          subtitle: '',
          buttonText: 'Смотреть коллекцию',
          buttonLink: 'catalog',
          image: 'images/hero/hero-slide-3.jpg',
          order: 3,
          isVisible: true
        },
        {
          id: 'slide-4',
          tagline: 'ПАРТНЁРСТВО B2B',
          title: 'Развиваемся вместе',
          subtitle: 'Наша работа — это забота о вашей прибыли.',
          buttonText: 'Стать партнёром',
          buttonLink: 'modal:partner',
          image: 'images/hero/hero-slide-4.jpg',
          order: 4,
          isVisible: true
        },
        {
          id: 'slide-5',
          tagline: 'ПРОИЗВОДИТЕЛЬ LAUTE',
          title: 'Смешивая воду. Бизнес и Технологии.',
          subtitle: '',
          buttonText: 'О компании',
          buttonLink: 'company',
          image: 'images/hero/hero-slide-5.jpg',
          order: 5,
          isVisible: true
        },
        {
          id: 'slide-6',
          tagline: 'ИНЖЕНЕРНАЯ ФИЛОСОФИЯ LAUTE',
          title: 'Интеллект и экологичность в деталях.',
          subtitle: 'SUS304 · ЭКО алюминий · Латунь А+ · PVD-покрытие',
          buttonText: 'Смотреть технологии',
          buttonLink: 'anchor:technologies',
          image: 'images/hero/hero-slide-6.jpg',
          order: 6,
          isVisible: true
        }
      ],
      materials: {
        badge: 'ТЕХНОЛОГИИ & МАТЕРИАЛЫ',
        title: 'Инженерная надежность в каждой детали',
        desc: 'Никаких компромиссов: первичная конструкционная латунь, пищевая нержавеющая сталь SUS304, ЭКО алюминий, испанские картриджи Sedal и молекулярное вакуумное PVD-осаждение.',
        items: [
          {
            id: 'mat-sedal',
            title: 'Испанские картриджи Sedal',
            tag: 'SEDAL GROUP · SPAIN · EST. 1974',
            desc: 'Керамические картриджи от европейского производителя Sedal (Испания, осн. 1974). Диски из спеченной керамики с микрозеркальной алмазной полировкой, тестирование до 500 000 рабочих циклов по стандарту EN 817. Плавный ход рычага и термостойкость до 90°C.',
            image: 'images/sedal_cartridge_macro.jpg',
            isVisible: true
          },
          {
            id: 'mat-brass',
            title: 'Сверхпрочные эксцентрики из латуни А+',
            tag: 'BRASS CW617N · HIGH DENSITY',
            desc: 'Массивные монтажные S-образные переходники из первичной конструкционной латуни марки А+. Прецизионная резьба 1/2" на 3/4" и плотная металлическая структура для надежного настенного монтажа смесителей.',
            image: 'images/brass_eccentric_macro.jpg',
            isVisible: true
          },
          {
            id: 'mat-sus304',
            title: 'Нержавеющая сталь SUS304',
            tag: 'AUSTENITIC SUS304 · CHROME-NICKEL',
            desc: 'Пищевая аустенитная нержавеющая сталь с высоким содержанием хрома и никеля. Абсолютная устойчивость к коррозии и благородная матовая сатинированная фактура.',
            image: 'images/sus304_steel_macro.jpg',
            isVisible: true
          },
          {
            id: 'mat-eco-alu',
            title: 'ЭКО алюминий',
            tag: 'ECO ALUMINUM · ANODIZED PROFILE',
            desc: 'Конструкционный анодированный алюминиевый профиль. Экологичный и долговечный металл высокой жесткости для душевых перегородок и кабин.',
            image: 'images/eco_aluminum_macro.jpg',
            isVisible: true
          },
          {
            id: 'mat-pvd',
            title: 'PVD-покрытие',
            tag: 'PVD VACUUM DEPOSITION',
            desc: 'PVD — технология нанесения прочного декоративно-защитного покрытия в вакууме на молекулярном уровне. Стойкость к истиранию и безупречная глубина цвета.',
            image: 'images/pvd_coating_macro.jpg',
            isVisible: true
          }
        ]
      },
      collections: {
        badge: 'АРХИТЕКТУРНЫЕ ЛИНИИ',
        title: 'Коллекции LAUTE',
        desc: 'Смесители, душевые зоны, кабины и сантехническое оборудование, объединённые единой философией надежности и чистоты формы.',
        items: [
          {
            id: 'coll-bathroom',
            title: 'Пространства ванных комнат',
            tagline: 'Эргономика и дизайн',
            image: 'images/collections/coll-bathroom.jpg',
            category: 'Смесители для ванны и умывальника'
          },
          {
            id: 'coll-kitchen',
            title: 'Кухонные смесители',
            tagline: 'С поворотным изливом 360°',
            image: 'images/collections/coll-kitchen.jpg',
            category: 'Кухонные смесители'
          },
          {
            id: 'coll-filter',
            title: 'С подключением к фильтру',
            tagline: 'Системы 2-в-1',
            image: 'images/collections/coll-filter.jpg',
            category: 'Кухонные смесители с подключением к фильтру'
          },
          {
            id: 'coll-shower',
            title: 'Душевые зоны и кабины',
            tagline: 'Тропический душ и гидромассаж',
            image: 'images/collections/coll-shower.jpg',
            category: 'Душевые системы'
          }
        ]
      },
      partnershipBanner: {
        badge: 'СОТРУДНИЧЕСТВО B2B',
        title: 'Прямые поставки от завода LAUTE',
        desc: 'Специальные условия для дилеров, строительных объектов и оптовых сетей. Поддержка образцами, рекламными материалами и персональным менеджером.',
        buttonText: 'Стать партнёром',
        buttonLink: 'modal:partner'
      }
    },
    translations: {
      ru: translations.ru,
      kz: translations.kz,
      en: translations.en
    }
  };
}

/**
 * Получить текущий опубликованный контент
 */
export function getPublishedContent() {
  let content = readJson(CONTENT_FILE, null);
  if (!content) {
    content = buildInitialContent();
    writeJson(CONTENT_FILE, content);
    syncPublicContent(content);
  }
  return content;
}

/**
 * Получить черновик контента (если есть, иначе копия опубликованного)
 */
export function getDraftContent() {
  let draft = readJson(DRAFT_FILE, null);
  if (!draft) {
    const published = getPublishedContent();
    draft = JSON.parse(JSON.stringify(published));
    draft.hasUnpublishedChanges = false;
    writeJson(DRAFT_FILE, draft);
  }
  return draft;
}

/**
 * Сохранить черновик контента
 */
export function saveDraftContent(updates, sessionId) {
  const currentDraft = getDraftContent();
  const newDraft = {
    ...currentDraft,
    ...updates,
    hasUnpublishedChanges: true,
    lastDraftSavedAt: new Date().toISOString(),
    draftSessionId: sessionId
  };
  writeJson(DRAFT_FILE, newDraft);
  return newDraft;
}

/**
 * Опубликовать черновик (переносит драфт в published + делает снимок бэкапа + синхронизирует public)
 */
export function publishDraftContent(sessionId) {
  const draft = getDraftContent();
  const previousPublished = getPublishedContent();

  // Create timestamped backup of published content before overwriting
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupId = `content_backup_${timestamp}`;
  const backupFile = path.resolve(CONTENT_BACKUPS_DIR, `${backupId}.json`);
  writeJson(backupFile, {
    backupId,
    timestamp: new Date().toISOString(),
    sessionId,
    content: previousPublished
  });

  // Prepare new published object
  const published = {
    ...draft,
    hasUnpublishedChanges: false,
    version: incrementVersion(previousPublished.version || '1.0.0'),
    lastPublishedAt: new Date().toISOString(),
    publishedBy: `Сессия ${sessionId || 'Администратор'}`
  };

  writeJson(CONTENT_FILE, published);
  syncPublicContent(published);

  // Update draft state
  const cleanDraft = {
    ...published,
    hasUnpublishedChanges: false
  };
  writeJson(DRAFT_FILE, cleanDraft);

  return {
    success: true,
    backupId,
    version: published.version,
    publishedAt: published.lastPublishedAt,
    content: published
  };
}

/**
 * Отменить изменения в черновике (сбросить к последней опубликованной версии)
 */
export function discardDraftContent() {
  const published = getPublishedContent();
  const resetDraft = JSON.parse(JSON.stringify(published));
  resetDraft.hasUnpublishedChanges = false;
  writeJson(DRAFT_FILE, resetDraft);
  return resetDraft;
}

/**
 * Откат контента к определенному бэкапу
 */
export function rollbackContentToBackup(backupId, sessionId) {
  const backupFile = path.resolve(CONTENT_BACKUPS_DIR, `${backupId}.json`);
  if (!fs.existsSync(backupFile)) {
    throw new Error(`Файл бэкапа ${backupId} не найден.`);
  }

  const backupData = readJson(backupFile, null);
  if (!backupData || !backupData.content) {
    throw new Error(`Повреждённый файл бэкапа ${backupId}.`);
  }

  // Backup current state first
  const current = getPublishedContent();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const preRollbackBackupId = `content_pre_rollback_${timestamp}`;
  writeJson(path.resolve(CONTENT_BACKUPS_DIR, `${preRollbackBackupId}.json`), {
    backupId: preRollbackBackupId,
    timestamp: new Date().toISOString(),
    sessionId,
    description: `Авто-снимок перед откатом к ${backupId}`,
    content: current
  });

  const restored = {
    ...backupData.content,
    hasUnpublishedChanges: false,
    lastPublishedAt: new Date().toISOString(),
    publishedBy: `Откат к ${backupId} (Сессия ${sessionId})`
  };

  writeJson(CONTENT_FILE, restored);
  writeJson(DRAFT_FILE, restored);
  syncPublicContent(restored);

  return {
    success: true,
    restoredVersion: restored.version,
    backupId: preRollbackBackupId,
    content: restored
  };
}

/**
 * Синхронизация опубликованного контента в public/data/content.json
 */
export function syncPublicContent(content) {
  try {
    const dir = path.dirname(PUBLIC_CONTENT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PUBLIC_CONTENT_FILE, JSON.stringify(content, null, 2), 'utf8');
  } catch (err) {
    console.error('Error syncing public content:', err);
  }
}

function incrementVersion(ver) {
  const parts = String(ver).split('.').map(n => parseInt(n, 10) || 0);
  if (parts.length === 3) {
    parts[2] += 1;
    return parts.join('.');
  }
  return '1.0.1';
}

/**
 * Управление списком категорий товаров
 */
const DEFAULT_CATEGORIES = [
  { id: 'cat-kitchen', name: 'Кухонные смесители', icon: 'UtensilsCrossed', order: 1, isVisible: true, count: 6 },
  { id: 'cat-filter', name: 'Кухонные смесители с подключением к фильтру', icon: 'Filter', order: 2, isVisible: true, count: 4 },
  { id: 'cat-bath', name: 'Смесители для ванны и умывальника', icon: 'Droplets', order: 3, isVisible: true, count: 5 },
  { id: 'cat-shower', name: 'Душевые системы', icon: 'ShowerHead', order: 4, isVisible: true, count: 4 },
  { id: 'cat-thermo', name: 'Термостатические смесители', icon: 'Thermometer', order: 5, isVisible: true, count: 2 },
  { id: 'cat-built-in', name: 'Встраиваемые системы скрытого монтажа', icon: 'Layers', order: 6, isVisible: true, count: 3 }
];

export function getCategories() {
  const cats = readJson(CATEGORIES_FILE, null);
  if (!cats) {
    writeJson(CATEGORIES_FILE, DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
  return cats;
}

export function saveCategories(categories) {
  writeJson(CATEGORIES_FILE, categories);
  return categories;
}

/**
 * Управление информационными страницами (существующими и новыми)
 */
const DEFAULT_CUSTOM_PAGES = [
  {
    id: 'page-warranty',
    slug: 'warranty',
    title: 'Условия гарантии LAUTE 5 лет',
    description: 'Официальный регламент заводской гарантии и условия сервисного обслуживания.',
    status: 'ОПУБЛИКОВАН',
    template: 'info',
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
    blocks: [
      { id: 'b1', type: 'hero', title: 'Гарантийная политика LAUTE', subtitle: '5 лет безупречной службы на все корпуса смесителей' },
      { id: 'b2', type: 'text', content: 'Завод LAUTE несёт полную ответственность за качество выпускаемой сантехники. Корпуса из первичной латуни CW617N проходят ультразвуковой и гидродинамический контроль под давлением 16 бар.' }
    ]
  },
  {
    id: 'page-install',
    slug: 'installation-guide',
    title: 'Инструкции по монтажу и уходу',
    description: 'Рекомендации инженеров LAUTE по правильной установке и повседневному уходу за хромированными и PVD поверхностями.',
    status: 'ОПУБЛИКОВАН',
    template: 'info',
    createdAt: '2026-02-10T00:00:00.000Z',
    updatedAt: '2026-03-05T00:00:00.000Z',
    blocks: [
      { id: 'b1', type: 'hero', title: 'Руководство по монтажу', subtitle: 'Советы сантехникам и установщикам' },
      { id: 'b2', type: 'text', content: 'Перед монтажом обязательно промойте водопроводные трубы от строительного шлама. Используйте стандартные комплектные эксцентрики и уплотнители.' }
    ]
  }
];

export function getCustomPages() {
  const pages = readJson(CUSTOM_PAGES_FILE, null);
  if (!pages) {
    writeJson(CUSTOM_PAGES_FILE, DEFAULT_CUSTOM_PAGES);
    return DEFAULT_CUSTOM_PAGES;
  }
  return pages;
}

export function saveCustomPages(pages) {
  writeJson(CUSTOM_PAGES_FILE, pages);
  return pages;
}
