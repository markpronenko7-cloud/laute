/**
 * LAUTE Master Image & Product Display Helper
 * 
 * 1. Обработка ссылок на Google Drive (файлы и папки) -> прямое отображение изображений через lh3.googleusercontent.com
 * 2. Обработка ссылок на страницы товаров (Tilda og:image)
 * 3. Строгая классификация фотографий:
 *    - Основное фото: ТОЛЬКО сам смеситель (НЕ коробка, НЕ чертёж, НЕ упаковка)
 *    - Чертёж (Размеры и чертежи): схемы, габариты, монтажные чертежи
 *    - Упаковка / коробка: изображения тары и коробок
 *    - Дополнительные фото: ракурсы, интерьер, детали
 * 4. Нормализация отображения названий товаров:
 *    - Заголовок: Название изделия (Смеситель для раковины / ванны / кухни)
 *    - Подзаголовок: Цвет · Серия (из реальных данных каталога)
 *    - Артикул: SKU
 */

// Известные папки Google Drive каталога LAUTE с сопоставлением файлов
const GOOGLE_DRIVE_FOLDER_MAP = {
  // ETH103D: Смеситель для раковины Ethereum ETH103D
  '1GX5IBbcrJBeLG1fkgUXkdxIfez_84X9G': {
    mixer: 'https://lh3.googleusercontent.com/d/12qG6rFNV62T2nnvsoAcRxQ0OLkuY7JZD', // c1d11432-c802-47dd-8418-b1f3ba8d4384.png (смеситель)
    drawing: 'https://lh3.googleusercontent.com/d/1LrdsmGJZMUQ3rF1qwItAS5AV_1UOIVHD' // ca3c7750-5e8f-4f09-8151-ca3ff0151f05.jpg (чертёж)
  },
  // ETH163GQ: Смеситель для ванны матовое золото Ethereum ETH163GQ
  '1vC6s6GQe0tqWE8M4YCAXJqhyqZbapKsS': {
    mixer: 'https://lh3.googleusercontent.com/d/1ElOjzr-jtWrng4TKNwOi4t8P_3IoT23v', // b50b79c6-591e-4585-a8bf-470bdabdbae9.jpg (смеситель)
    drawing: 'https://lh3.googleusercontent.com/d/1dDb1_XDrG1-rjHsABKzgzHzG9WejgMPt', // 04e3fed8-0fa7-488d-a659-925eddd51c91.jpg (чертёж)
    interior: 'https://lh3.googleusercontent.com/d/1rvDE6g3QIfwuzhn51l7h3RL_XHhiPeIR' // интерьерное фото
  }
};

// Известные ссылки на страницы товаров Tilda
const TILDA_PAGE_MAP = {
  '294403083-918450897712': 'https://static.tildacdn.com/stor3863-3362-4238-a630-396638636635/11477791.png', // A0163
  '294401648-960727442851': 'https://static.tildacdn.com/stor3133-3664-4664-a531-353734316361/24108275.png'  // R0101F
};

/**
 * Извлекает File ID из ссылки на Google Drive
 */
export function extractGoogleDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;

  // Формат /file/d/FILE_ID
  const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]{25,})/i);
  if (fileDMatch) return fileDMatch[1];

  // Формат id=FILE_ID
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]{25,})/i);
  if (idMatch) return idMatch[1];

  // Формат /thumbnail?id=FILE_ID
  const thumbMatch = url.match(/\/thumbnail\?[^"]*id=([a-zA-Z0-9_-]{25,})/i);
  if (thumbMatch) return thumbMatch[1];

  // Формат /open?id=FILE_ID
  const openMatch = url.match(/\/open\?[^"]*id=([a-zA-Z0-9_-]{25,})/i);
  if (openMatch) return openMatch[1];

  return null;
}

/**
 * Извлекает Folder ID из ссылки на папку Google Drive
 */
export function extractGoogleDriveFolderId(url) {
  if (!url || typeof url !== 'string') return null;
  const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]{25,})/i);
  return folderMatch ? folderMatch[1] : null;
}

/**
 * Нормализует любую ссылку на изображение:
 * - Google Drive File ID -> прямая ссылка lh3.googleusercontent.com/d/ID
 * - Google Drive Folder ID -> маппинг на основное фото смесителя
 * - Ссылка на Tilda страницу -> прямая ссылка на изображение смесителя
 * - Относительные пути -> префикс baseUrl
 */
export function getAssetPath(rawUrl, baseUrl = import.meta.env?.BASE_URL || '/') {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const url = rawUrl.trim();
  // Product images may already include Vite's base path after classification.
  if (url.startsWith(baseUrl)) return url;
  return normalizeImageUrl(url, baseUrl);
}

export function normalizeImageUrl(rawUrl, baseUrl = import.meta.env?.BASE_URL || '/') {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // 1. Проверяем папку Google Drive
  const folderId = extractGoogleDriveFolderId(trimmed);
  if (folderId && GOOGLE_DRIVE_FOLDER_MAP[folderId]) {
    return GOOGLE_DRIVE_FOLDER_MAP[folderId].mixer;
  }

  // 2. Проверяем файл Google Drive
  const fileId = extractGoogleDriveFileId(trimmed);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // 3. Проверяем Tilda страницу
  for (const [tildaKey, directImg] of Object.entries(TILDA_PAGE_MAP)) {
    if (trimmed.includes(tildaKey)) {
      return directImg;
    }
  }

  // 4. Обычные прямые ссылки http/https
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // 5. Относительные пути
  const clean = trimmed.replace(/^\//, '');
  return `${baseUrl}${clean}`;
}

/**
 * Определяет тип изображения по URL или имени:
 * 'drawing' | 'box' | 'mixer'
 */
export function detectImageType(url) {
  if (!url || typeof url !== 'string') return 'mixer';
  const lower = url.toLowerCase();

  // Чертежи и схемы размеров
  if (
    lower.includes('чертеж') ||
    lower.includes('чертёж') ||
    lower.includes('drawing') ||
    lower.includes('blueprint') ||
    lower.includes('scheme') ||
    lower.includes('schema') ||
    lower.includes('размер') ||
    lower.includes('dimension') ||
    lower.includes('ca3c7750') || // ETH103D drawing filename
    lower.includes('04e3fed8') || // ETH163GQ drawing filename
    lower.includes('1lrdsmgjzmuq3rf1qwitas5av_1uoivhd') || // ETH103D drawing Google Drive ID
    lower.includes('1ddb1_xdrg1-rjhsbkzgzhzg9wejgpmt')    // ETH163GQ drawing Google Drive ID
  ) {
    return 'drawing';
  }

  // Коробки и упаковка
  if (
    lower.includes('коробк') ||
    lower.includes('упаковк') ||
    lower.includes('box') ||
    lower.includes('package') ||
    lower.includes('packaging') ||
    lower.includes('carton') ||
    lower.includes('tara')
  ) {
    return 'box';
  }

  return 'mixer';
}

/**
 * Классифицирует все изображения товара:
 * возвращает { mainPhoto, drawingPhotos, boxPhotos, additionalPhotos, allPhotos }
 */
export function classifyProductImages(product, baseUrl = import.meta.env?.BASE_URL || '/') {
  if (!product) {
    const fallback = `${baseUrl}images/cat_laute_brand.jpg`;
    return {
      mainPhoto: fallback,
      drawingPhotos: [],
      boxPhotos: [],
      additionalPhotos: [],
      allPhotos: [fallback]
    };
  }

  const rawImages = [];

  // Проверяем папку Google Drive в photo1
  const folderId = extractGoogleDriveFolderId(product.photo1);
  if (folderId && GOOGLE_DRIVE_FOLDER_MAP[folderId]) {
    const mapped = GOOGLE_DRIVE_FOLDER_MAP[folderId];
    if (mapped.mixer) rawImages.push({ url: mapped.mixer, type: 'mixer' });
    if (mapped.drawing) rawImages.push({ url: mapped.drawing, type: 'drawing' });
    if (mapped.interior) rawImages.push({ url: mapped.interior, type: 'mixer' });
  }

  // Дополнительно проверяем photo1, photo2, photo3, drawingUrl, boxUrl
  const candidates = [
    { url: product.photo1, defaultType: null },
    { url: product.photo2, defaultType: null },
    { url: product.photo3, defaultType: null },
    { url: product.drawingUrl || product.raw_data?.drawingUrl, defaultType: 'drawing' },
    { url: product.boxUrl || product.raw_data?.boxUrl, defaultType: 'box' }
  ];

  candidates.forEach(c => {
    if (c.url && typeof c.url === 'string') {
      // Может быть список через запятую
      const parts = c.url.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
      parts.forEach(part => {
        const norm = normalizeImageUrl(part, baseUrl);
        if (norm && !rawImages.some(r => r.url === norm)) {
          const type = c.defaultType || detectImageType(part) || detectImageType(norm);
          rawImages.push({ url: norm, type });
        }
      });
    }
  });

  // Если для артикула есть известные изображения в справочниках
  if (product.article === 'ETH103D' && !rawImages.some(r => r.url.includes('12qG6rFNV62T2nnvsoAcRxQ0OLkuY7JZD'))) {
    rawImages.unshift({ url: 'https://lh3.googleusercontent.com/d/12qG6rFNV62T2nnvsoAcRxQ0OLkuY7JZD', type: 'mixer' });
    rawImages.push({ url: 'https://lh3.googleusercontent.com/d/1LrdsmGJZMUQ3rF1qwItAS5AV_1UOIVHD', type: 'drawing' });
  } else if (product.article === 'ETH163GQ' && !rawImages.some(r => r.url.includes('1ElOjzr-jtWrng4TKNwOi4t8P_3IoT23v'))) {
    rawImages.unshift({ url: 'https://lh3.googleusercontent.com/d/1ElOjzr-jtWrng4TKNwOi4t8P_3IoT23v', type: 'mixer' });
    rawImages.push({ url: 'https://lh3.googleusercontent.com/d/1dDb1_XDrG1-rjHsABKzgzHzG9WejgMPt', type: 'drawing' });
    rawImages.push({ url: 'https://lh3.googleusercontent.com/d/1rvDE6g3QIfwuzhn51l7h3RL_XHhiPeIR', type: 'mixer' });
  } else if (product.article === 'A0163' && !rawImages.some(r => r.url.includes('11477791.png'))) {
    rawImages.unshift({ url: 'https://static.tildacdn.com/stor3863-3362-4238-a630-396638636635/11477791.png', type: 'mixer' });
  } else if (product.article === 'R0101F' && !rawImages.some(r => r.url.includes('24108275.png'))) {
    rawImages.unshift({ url: 'https://static.tildacdn.com/stor3133-3664-4664-a531-353734316361/24108275.png', type: 'mixer' });
  }

  const mixerPhotos = rawImages.filter(i => i.type === 'mixer').map(i => i.url);
  const drawingPhotos = rawImages.filter(i => i.type === 'drawing').map(i => i.url);
  const boxPhotos = rawImages.filter(i => i.type === 'box').map(i => i.url);

  // ГЛАВНОЕ ТРЕБОВАНИЕ: Основная фотография — ТОЛЬКО сам смеситель! НЕ коробка и НЕ чертёж!
  const fallback = `${baseUrl}images/cat_laute_brand.jpg`;
  const mainPhoto = mixerPhotos.length > 0 ? mixerPhotos[0] : (boxPhotos[0] || drawingPhotos[0] || fallback);

  // Дополнительные фото (исключая главное фото)
  const additionalPhotos = [
    ...mixerPhotos.slice(1),
    ...boxPhotos
  ];

  const allPhotos = [mainPhoto, ...additionalPhotos];

  return {
    mainPhoto,
    drawingPhotos,
    boxPhotos,
    additionalPhotos,
    allPhotos
  };
}

/**
 * Нормализует цвет товара для красивого вывода
 */
export function normalizeColorName(rawColor) {
  if (!rawColor) return '';
  const c = String(rawColor).trim();
  const lower = c.toLowerCase();
  if (lower === 'хром глянец' || lower === 'глянцевый хром' || lower === 'хром') return 'Хром';
  if (lower === 'цвет черный' || lower === 'черный' || lower === 'чёрный' || lower === 'матовый черный') return 'Чёрный';
  if (lower === 'брашированное золото' || lower === 'матовое золото' || lower === 'матоваое золото') return 'Матовое золото';
  if (lower === 'нержавеющая сталь' || lower === 'сатин' || lower === 'сталь') return 'Сатин / Нержавеющая сталь';
  if (lower === 'графит' || lower === 'оружейная сталь' || lower === 'gun metal') return 'Графит';
  if (lower === 'белый' || lower === 'матовый белый') return 'Белый';
  return c;
}

/**
 * Нормализует название серии / коллекции
 */
export function normalizeSeriesName(collection, brand) {
  if (!collection && !brand) return '';
  const raw = String(collection || '').trim();
  if (!raw) return '';
  if (raw.toLowerCase().startsWith('laute ')) {
    return `Серия ${raw.replace(/laute /i, '')}`;
  }
  if (raw.toLowerCase().startsWith('серия ')) {
    return raw;
  }
  return `Серия ${raw}`;
}

/**
 * Приводит отображение товара к утверждённому стандарту LAUTE:
 * 1. Название: тип изделия (Смеситель для раковины, Смеситель для ванны, Смеситель для кухни)
 * 2. Подзаголовок: Цвет · Серия (из реальных данных каталога)
 * 3. Артикул: SKU
 * 4. Технические характеристики: размеры, картридж, монтаж в характеристиках, а не в названии.
 */
export function formatProductDisplay(product) {
  if (!product) {
    return {
      title: 'Смеситель LAUTE',
      subtitle: '',
      color: '',
      series: '',
      article: '',
      cleanSpecs: []
    };
  }

  const rawName = String(product.name || '').trim();
  const rawCat = String(product.category || '').trim().toLowerCase();
  const rawSub = String(product.subcategory || '').trim().toLowerCase();
  const rawColor = normalizeColorName(product.color || product.finish);
  const rawSeries = normalizeSeriesName(product.collection, product.brand);

  // 1. Определение чистого типа изделия (Title)
  let title = '';

  if (rawCat.includes('раковин') || rawSub.includes('раковин') || rawName.toLowerCase().includes('для раковины') || rawName.toLowerCase().includes('для умывальника')) {
    if (rawSub.includes('поворотн') || rawName.toLowerCase().includes('поворотн')) {
      title = 'Смеситель для раковины (поворотный излив)';
    } else if (rawSub.includes('высок') || rawName.toLowerCase().includes('высок')) {
      title = 'Смеситель для раковины (высокий)';
    } else {
      title = 'Смеситель для раковины';
    }
  } else if (rawCat.includes('ванн') || rawSub.includes('ванн') || rawName.toLowerCase().includes('для ванны')) {
    if (rawSub.includes('длинн') || rawName.toLowerCase().includes('длинн') || (product.dimensions && product.dimensions.includes('350'))) {
      title = 'Смеситель для ванны (длинный излив)';
    } else {
      title = 'Смеситель для ванны';
    }
  } else if (rawCat.includes('кухн') || rawSub.includes('кухн') || rawName.toLowerCase().includes('для кухни') || rawName.toLowerCase().includes('кухонн')) {
    if (rawName.toLowerCase().includes('фильтр') || (product.specs && product.specs.toLowerCase().includes('фильтр'))) {
      title = 'Смеситель для кухни с каналом под фильтр';
    } else {
      title = 'Смеситель для кухни';
    }
  } else if (rawCat.includes('универсальн')) {
    title = 'Универсальный смеситель (ванна / раковина)';
  } else if (rawCat.includes('душ') || rawName.toLowerCase().includes('душ')) {
    title = 'Душевая система';
  } else {
    // Очищаем существующее название от мусорных вставок
    title = rawName
      .replace(/,\s*(?:цвет\s+)?(?:хром|черный|чёрный|матовое\s+золото|брашированное\s+золото)[^,]*/gi, '')
      .replace(/\s*¢?\d+\s*мм\.?/gi, '')
      .replace(/\s*с гайкой/gi, '')
      .replace(new RegExp(`\\s*${product.article}\\b`, 'gi'), '')
      .trim();
    if (!title) title = product.category || 'Смеситель LAUTE';
  }

  // 2. Мета-строка (Цвет · Серия)
  const metaParts = [];
  if (rawColor) metaParts.push(rawColor);
  if (rawSeries) metaParts.push(rawSeries);
  const subtitle = metaParts.join(' · ');

  // 3. Выделенные технические характеристики для бейджей карточки
  const cleanSpecs = [];

  // Картридж
  if (product.dimensions?.toLowerCase().includes('sedal') || product.description?.toLowerCase().includes('sedal') || product.specs?.toLowerCase().includes('sedal')) {
    cleanSpecs.push('Картридж SEDAL 40 мм');
  } else if (product.specs?.toLowerCase().includes('картридж') || product.dimensions?.toLowerCase().includes('картридж')) {
    const cartMatch = (product.dimensions + ' ' + product.specs).match(/картридж[:\s]*(\d+\s*мм)/i);
    cleanSpecs.push(cartMatch ? `Картридж ${cartMatch[1]}` : 'Керамический картридж');
  }

  // Излив
  if (product.dimensions?.toLowerCase().includes('длина излива')) {
    const spoutMatch = product.dimensions.match(/длина излива[:\s]*(\d+\s*мм)/i);
    if (spoutMatch) cleanSpecs.push(`Излив ${spoutMatch[1]}`);
  }

  // Материал
  if (product.material?.toLowerCase().includes('эко-алюминий') || product.specs?.toLowerCase().includes('эко-алюминий')) {
    cleanSpecs.push('Авиационный эко-алюминий');
  } else if (product.material?.toLowerCase().includes('латунь') || product.specs?.toLowerCase().includes('латунь')) {
    cleanSpecs.push('Первичная латунь CW617N');
  }

  // Монтаж
  if (product.installType) {
    cleanSpecs.push(product.installType.replace(/тип установки/i, '').trim());
  }

  return {
    title,
    subtitle,
    color: rawColor,
    series: rawSeries,
    article: product.article,
    cleanSpecs
  };
}
