import ExcelJS from 'exceljs';
import { CATEGORY_NAMES } from '../src/data/catalogData.js';

export const EXCEL_COLUMNS_DEF = [
  { header: 'Артикул (SKU) *', key: 'article', width: 18, isRequired: true },
  { header: 'Название товара *', key: 'name', width: 38, isRequired: true },
  { header: 'Категория *', key: 'category', width: 28, isRequired: true },
  { header: 'Подкатегория', key: 'subcategory', width: 22 },
  { header: 'Коллекция', key: 'collection', width: 18 },
  { header: 'Бренд', key: 'brand', width: 12 },
  { header: 'Описание', key: 'description', width: 45 },
  { header: 'Цена *', key: 'price', width: 14, isRequired: true },
  { header: 'Валюта', key: 'currency', width: 10 },
  { header: 'Материал', key: 'material', width: 24 },
  { header: 'Цвет', key: 'color', width: 18 },
  { header: 'Покрытие', key: 'finish', width: 22 },
  { header: 'Тип установки', key: 'installType', width: 24 },
  { header: 'Назначение', key: 'purpose', width: 20 },
  { header: 'Размеры', key: 'dimensions', width: 28 },
  { header: 'Вес', key: 'weight', width: 12 },
  { header: 'Объём', key: 'volume', width: 12 },
  { header: 'Технические характеристики', key: 'specs', width: 45 },
  { header: 'Фотографии (пути / ссылки)', key: 'photos', width: 35 },
  { header: 'Статус товара', key: 'status', width: 16 },
  { header: 'SEO-заголовок', key: 'seoTitle', width: 30 },
  { header: 'SEO-описание', key: 'seoDesc', width: 35 },
  { header: 'URL товара', key: 'url', width: 24 },
  { header: 'Статус действия', key: 'actionStatus', width: 20 },
  { header: 'Дополнительные характеристики', key: 'extraSpecs', width: 30 }
];

const BRAND_DARK = 'FF0F172A';
const BRAND_BLUE = 'FF1E293B';
const HEADER_FILL = 'FF1E293B';
const REQ_FILL = 'FF0F172A';
const LIGHT_ROW = 'FFF8FAFC';
const BORDER_COLOR = 'FFE2E8F0';

/**
 * Создаёт стилизованный Excel-файл со всеми листами для экспорта
 */
export async function createExportWorkbook(products) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'LAUTE Catalog System';
  workbook.created = new Date();

  // 1. Лист Инструкция
  const wsHelp = workbook.addWorksheet('Инструкция', { views: [{ showGridLines: true }] });
  wsHelp.columns = [{ width: 5 }, { width: 28 }, { width: 65 }, { width: 30 }];
  wsHelp.mergeCells('B2:D2');
  const titleCell = wsHelp.getCell('B2');
  titleCell.value = 'ИНСТРУКЦИЯ ПО УПРАВЛЕНИЮ КАТАЛОГОМ LAUTE (EXCEL)';
  titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_DARK } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  wsHelp.getRow(2).height = 40;

  const instructions = [
    ['1. Идентификатор SKU', 'Артикул (SKU) — единственный уникальный ключ товара. По нему система распознает товар.', 'Обязательно к заполнению'],
    ['2. Добавление товара', 'Укажите новый артикул, название, категорию, цену и статус действия = ДОБАВИТЬ.', 'Товар появится на сайте'],
    ['3. Обновление товара', 'Измените нужные колонки (цена, описание, фото) и оставьте статус действия = ОБНОВИТЬ.', 'Товары не из файла НЕ удаляются!'],
    ['4. Скрытие товара', 'Установите Статус действия = СКРЫТЬ или Статус товара = СКРЫТ.', 'Товар скроется с витрины'],
    ['5. Цены', 'Указывайте цену только цифрами (без знака валюты и пробелов).', 'Пример: 28900']
  ];

  let curRow = 4;
  wsHelp.getCell(`B${curRow}`).value = 'ШАГ / ПРАВИЛО';
  wsHelp.getCell(`C${curRow}`).value = 'ОПИСАНИЕ И ДЕЙСТВИЕ';
  wsHelp.getCell(`D${curRow}`).value = 'ВАЖНЫЕ ПРИМЕЧАНИЯ';
  ['B', 'C', 'D'].forEach(col => {
    const c = wsHelp.getCell(`${col}${curRow}`);
    c.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_BLUE } };
    c.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  });
  wsHelp.getRow(curRow).height = 28;

  instructions.forEach(([step, desc, notes]) => {
    curRow++;
    wsHelp.getCell(`B${curRow}`).value = step;
    wsHelp.getCell(`C${curRow}`).value = desc;
    wsHelp.getCell(`D${curRow}`).value = notes;
    ['B', 'C', 'D'].forEach(col => {
      const c = wsHelp.getCell(`${col}${curRow}`);
      c.font = { name: 'Segoe UI', size: 10, bold: col === 'B' };
      c.alignment = { vertical: 'middle', wrapText: true };
      c.border = {
        top: { style: 'thin', color: { argb: BORDER_COLOR } },
        bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
        left: { style: 'thin', color: { argb: BORDER_COLOR } },
        right: { style: 'thin', color: { argb: BORDER_COLOR } }
      };
    });
    wsHelp.getRow(curRow).height = 36;
  });

  // 2. Лист Справочники
  const wsRef = workbook.addWorksheet('Справочники');
  wsRef.columns = [
    { header: 'Категории', key: 'categories', width: 35 },
    { header: 'Валюты', key: 'currencies', width: 12 },
    { header: 'Статусы товара', key: 'statuses', width: 18 },
    { header: 'Статусы действия', key: 'actions', width: 22 },
    { header: 'Цвета', key: 'colors', width: 24 }
  ];
  wsRef.getRow(1).height = 30;
  wsRef.getRow(1).eachCell((cell) => {
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_BLUE } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const refData = {
    categories: CATEGORY_NAMES,
    currencies: ['₸', '₽', '$', '€'],
    statuses: ['АКТИВЕН', 'СКРЫТ'],
    actions: ['ОБНОВИТЬ', 'ДОБАВИТЬ', 'СКРЫТЬ', 'УДАЛИТЬ'],
    colors: ['Хром глянец', 'Матовый черный', 'Матовый графит', 'Брашированное золото', 'Белый матовый', 'Нержавеющая сталь']
  };

  const maxRows = Math.max(...Object.values(refData).map(arr => arr.length));
  for (let i = 0; i < maxRows; i++) {
    wsRef.addRow({
      categories: refData.categories[i] || '',
      currencies: refData.currencies[i] || '',
      statuses: refData.statuses[i] || '',
      actions: refData.actions[i] || '',
      colors: refData.colors[i] || ''
    });
  }

  // 3. Лист Товары
  const wsProducts = workbook.addWorksheet('Товары', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });
  wsProducts.columns = EXCEL_COLUMNS_DEF;
  wsProducts.autoFilter = { from: 'A1', to: 'Y1' };

  wsProducts.getRow(1).height = 36;
  wsProducts.getRow(1).eachCell((cell, colNum) => {
    const colDef = EXCEL_COLUMNS_DEF[colNum - 1];
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colDef.isRequired ? REQ_FILL : HEADER_FILL }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF334155' } },
      bottom: { style: 'medium', color: { argb: 'FF334155' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      right: { style: 'thin', color: { argb: 'FF334155' } }
    };
  });

  // Populate products
  products.forEach((p, idx) => {
    const photosStr = [p.photo1, p.photo2, p.photo3].filter(Boolean).join(', ');
    const row = wsProducts.addRow({
      article: p.article,
      name: p.name,
      category: p.category,
      subcategory: p.subcategory || (p.category.includes('Кухонные') ? 'С поворотным изливом' : 'Стандарт'),
      collection: p.collection || 'LAUTE Master Line',
      brand: p.brand || 'LAUTE',
      description: p.description || '',
      price: p.price,
      currency: p.currency || '₸',
      material: p.material || 'Первичная латунь CW617N (евростандарт)',
      color: p.color || 'Хром глянец',
      finish: p.finish || 'Гальванический хром',
      installType: p.installType || (p.category.includes('ванны') ? 'Настенный наружный монтаж' : 'Врезной на мойку / умывальник'),
      purpose: p.purpose || p.category,
      dimensions: p.dimensions || '',
      weight: p.weight || '',
      volume: p.volume || '',
      specs: p.specs || '',
      photos: photosStr,
      status: p.status || 'АКТИВЕН',
      seoTitle: p.seoTitle || `${p.name} — купить от официального производителя LAUTE`,
      seoDesc: p.seoDesc || `${p.name}: проверенное качество LAUTE, заводская гарантия 5 лет.`,
      url: p.url || `/catalog#${p.article}`,
      actionStatus: 'ОБНОВИТЬ',
      extraSpecs: p.extraSpecs || ''
    });

    row.height = 26;
    row.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: BORDER_COLOR } },
        bottom: { style: 'thin', color: { argb: BORDER_COLOR } }
      };
      if (idx % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_ROW } };
      }
    });
  });

  // Data validations for dropdowns
  for (let r = 2; r <= Math.max(50, products.length + 20); r++) {
    wsProducts.getCell(`C${r}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['Справочники!$A$2:$A$15']
    };
    wsProducts.getCell(`I${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['Справочники!$B$2:$B$5']
    };
    wsProducts.getCell(`T${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['Справочники!$C$2:$C$3']
    };
    wsProducts.getCell(`X${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['Справочники!$D$2:$D$5']
    };
  }

  return workbook;
}

/**
 * Парсит и валидирует загруженный буфер Excel-файла
 */
export async function parseAndValidateExcelBuffer(buffer, currentProducts) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  // Найти рабочий лист: сначала 'Товары', иначе первый лист, отличный от 'Инструкция' и 'Справочники'
  let targetSheet = workbook.getWorksheet('Товары');
  if (!targetSheet) {
    targetSheet = workbook.worksheets.find(ws => 
      ws.name !== 'Инструкция' && 
      ws.name !== 'Справочники' && 
      ws.name !== 'Примеры'
    ) || workbook.worksheets[0];
  }

  if (!targetSheet || targetSheet.rowCount <= 1) {
    return {
      success: false,
      summary: { toAdd: 0, toUpdate: 0, unchanged: 0, toHide: 0, toDelete: 0, errorsCount: 1 },
      errors: [{ row: 1, article: '-', message: 'Лист с товарами пуст или не содержит данных.' }],
      diffs: [],
      validRows: []
    };
  }

  // Считываем заголовки первой строки
  const headerRow = targetSheet.getRow(1);
  const colIndexMap = {};
  headerRow.eachCell((cell, colNumber) => {
    const text = String(cell.value || '').trim();
    colIndexMap[text] = colNumber;
    // Очищенный вариант для нечувствительности к регистру и звездочкам
    const cleanKey = text.replace(/[*()]/g, '').trim().toLowerCase();
    colIndexMap[cleanKey] = colNumber;
  });

  const getCellVal = (row, ...aliases) => {
    for (const alias of aliases) {
      const colNum = colIndexMap[alias] || colIndexMap[alias.toLowerCase()];
      if (colNum) {
        const val = row.getCell(colNum).value;
        if (val === null || val === undefined) return '';
        if (typeof val === 'object' && val.text) return String(val.text).trim();
        if (typeof val === 'object' && val.result !== undefined) return String(val.result).trim();
        return String(val).trim();
      }
    }
    return '';
  };

  const existingMap = new Map();
  currentProducts.forEach(p => {
    existingMap.set(p.article.trim().toUpperCase(), p);
  });

  const seenArticlesInFile = new Map(); // SKU -> rowNum
  const errors = [];
  const validRows = [];
  const diffs = [];

  let toAdd = 0;
  let toUpdate = 0;
  let unchanged = 0;
  let toHide = 0;
  let toDelete = 0;

  for (let r = 2; r <= targetSheet.rowCount; r++) {
    const row = targetSheet.getRow(r);
    // Проверяем пустую строку
    let hasAnyData = false;
    row.eachCell(() => { hasAnyData = true; });
    if (!hasAnyData) continue;

    const rawArticle = getCellVal(row, 'Артикул (SKU) *', 'Артикул (SKU)', 'Артикул', 'sku', 'article');
    const rawName = getCellVal(row, 'Название товара *', 'Название товара', 'Название', 'name');
    const rawCategory = getCellVal(row, 'Категория *', 'Категория', 'category');
    const rawPrice = getCellVal(row, 'Цена *', 'Цена', 'price');
    const rawCurrency = getCellVal(row, 'Валюта', 'currency') || '₸';
    const rawDesc = getCellVal(row, 'Описание', 'description');
    const rawDimensions = getCellVal(row, 'Размеры', 'Размер', 'dimensions');
    const rawWeight = getCellVal(row, 'Вес', 'weight');
    const rawVolume = getCellVal(row, 'Объём', 'volume');
    const rawSpecs = getCellVal(row, 'Технические характеристики', 'Характеристики', 'specs');
    const rawPhotos = getCellVal(row, 'Фотографии (пути / ссылки)', 'Фотографии', 'Фотография 1', 'photos');
    const rawStatus = getCellVal(row, 'Статус товара', 'status') || 'АКТИВЕН';
    const rawAction = (getCellVal(row, 'Статус действия', 'actionStatus', 'Действие') || 'ОБНОВИТЬ').toUpperCase();
    const rawSubcategory = getCellVal(row, 'Подкатегория', 'subcategory');
    const rawCollection = getCellVal(row, 'Коллекция', 'collection');
    const rawBrand = getCellVal(row, 'Бренд', 'brand') || 'LAUTE';
    const rawMaterial = getCellVal(row, 'Материал', 'material');
    const rawColor = getCellVal(row, 'Цвет', 'color');
    const rawFinish = getCellVal(row, 'Покрытие', 'finish');
    const rawInstallType = getCellVal(row, 'Тип установки', 'installType');
    const rawPurpose = getCellVal(row, 'Назначение', 'purpose');
    const rawSeoTitle = getCellVal(row, 'SEO-заголовок', 'seoTitle');
    const rawSeoDesc = getCellVal(row, 'SEO-описание', 'seoDesc');
    const rawUrl = getCellVal(row, 'URL товара', 'url');
    const rawExtraSpecs = getCellVal(row, 'Дополнительные характеристики', 'extraSpecs');

    // Пропуск явных примеров, если они остались
    if (rawArticle.includes('DEMO') || rawName.includes('[ДЕМО')) {
      continue;
    }

    // 1. Проверка артикула
    if (!rawArticle) {
      errors.push({
        row: r,
        article: '-',
        message: `Строка ${r}: не указан артикул (SKU) товара.`
      });
      continue;
    }

    const cleanArticle = rawArticle.trim();
    const upperArticle = cleanArticle.toUpperCase();

    // Проверка дублей внутри файла
    if (seenArticlesInFile.has(upperArticle)) {
      const prevRow = seenArticlesInFile.get(upperArticle);
      errors.push({
        row: r,
        article: cleanArticle,
        message: `Строка ${r}: повторяется артикул "${cleanArticle}". Он уже был указан в строке ${prevRow}.`
      });
      continue;
    }
    seenArticlesInFile.set(upperArticle, r);

    // Проверка статуса действия
    const validActions = ['ОБНОВИТЬ', 'ДОБАВИТЬ', 'СКРЫТЬ', 'УДАЛИТЬ'];
    if (!validActions.includes(rawAction)) {
      errors.push({
        row: r,
        article: cleanArticle,
        message: `Строка ${r}: некорректный статус действия "${rawAction}". Допустимо: ОБНОВИТЬ, ДОБАВИТЬ, СКРЫТЬ, УДАЛИТЬ.`
      });
      continue;
    }

    // Удаление
    if (rawAction === 'УДАЛИТЬ') {
      const existing = existingMap.get(upperArticle);
      if (!existing) {
        errors.push({
          row: r,
          article: cleanArticle,
          message: `Строка ${r}: товар с артикулом "${cleanArticle}" не найден для удаления.`
        });
        continue;
      }
      toDelete++;
      diffs.push({
        article: cleanArticle,
        name: existing.name,
        action: 'УДАЛИТЬ',
        changes: [{ field: 'Статус', oldVal: existing.status, newVal: 'УДАЛЁН ИЗ КАТАЛОГА' }]
      });
      validRows.push({
        rowNum: r,
        article: cleanArticle,
        action: 'УДАЛИТЬ',
        isDelete: true
      });
      continue;
    }

    // 2. Проверка названия
    if (!rawName) {
      errors.push({
        row: r,
        article: cleanArticle,
        message: `Строка ${r}: не указано название товара для артикула "${cleanArticle}".`
      });
      continue;
    }

    // 3. Проверка категории
    if (!rawCategory) {
      errors.push({
        row: r,
        article: cleanArticle,
        message: `Строка ${r}: не указана категория для артикула "${cleanArticle}".`
      });
      continue;
    }

    // 4. Проверка цены
    const numPrice = parseFloat(rawPrice.replace(/[^\d.]/g, ''));
    if (isNaN(numPrice) || numPrice <= 0) {
      errors.push({
        row: r,
        article: cleanArticle,
        message: `Строка ${r}: некорректная цена "${rawPrice}". Цена должна быть положительным числом.`
      });
      continue;
    }

    // Фотографии распарсить
    let photo1 = '';
    let photo2 = '';
    let photo3 = '';
    if (rawPhotos) {
      const parts = rawPhotos.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
      photo1 = parts[0] || '';
      photo2 = parts[1] || '';
      photo3 = parts[2] || '';
    }

    const existingProduct = existingMap.get(upperArticle);

    // Если фото не указаны в строке при обновлении, сохраняем существующие
    if (existingProduct) {
      if (!photo1) photo1 = existingProduct.photo1 || 'images/cat_laute_brand.jpg';
      if (!photo2) photo2 = existingProduct.photo2 || '';
      if (!photo3) photo3 = existingProduct.photo3 || '';
    } else {
      if (!photo1) photo1 = 'images/cat_laute_brand.jpg';
    }

    const itemStatus = rawAction === 'СКРЫТЬ' ? 'СКРЫТ' : (rawStatus.toUpperCase() === 'СКРЫТ' ? 'СКРЫТ' : 'АКТИВЕН');

    const productPayload = {
      rowNum: r,
      article: cleanArticle,
      name: rawName,
      category: rawCategory,
      subcategory: rawSubcategory,
      collection: rawCollection,
      brand: rawBrand,
      description: rawDesc,
      price: numPrice,
      currency: rawCurrency,
      material: rawMaterial,
      color: rawColor,
      finish: rawFinish,
      installType: rawInstallType,
      purpose: rawPurpose,
      dimensions: rawDimensions,
      weight: rawWeight,
      volume: rawVolume,
      specs: rawSpecs,
      photo1,
      photo2,
      photo3,
      status: itemStatus,
      seoTitle: rawSeoTitle,
      seoDesc: rawSeoDesc,
      url: rawUrl || `/catalog#${cleanArticle}`,
      extraSpecs: rawExtraSpecs,
      action: rawAction
    };

    // Анализ изменений по сравнению с существующей базой
    if (!existingProduct || rawAction === 'ДОБАВИТЬ') {
      toAdd++;
      diffs.push({
        article: cleanArticle,
        name: rawName,
        action: 'ДОБАВИТЬ',
        changes: [
          { field: 'Новый товар', oldVal: '—', newVal: `${rawName} (${numPrice} ${rawCurrency})` },
          { field: 'Категория', oldVal: '—', newVal: rawCategory },
          { field: 'Статус', oldVal: '—', newVal: itemStatus }
        ]
      });
    } else {
      // Существующий товар - проверяем, что изменилось
      const fieldChanges = [];
      if (existingProduct.name !== rawName) {
        fieldChanges.push({ field: 'Название', oldVal: existingProduct.name, newVal: rawName });
      }
      if (Number(existingProduct.price) !== Number(numPrice)) {
        fieldChanges.push({ field: 'Цена', oldVal: `${existingProduct.price} ${existingProduct.currency || '₸'}`, newVal: `${numPrice} ${rawCurrency}` });
      }
      if (existingProduct.category !== rawCategory) {
        fieldChanges.push({ field: 'Категория', oldVal: existingProduct.category, newVal: rawCategory });
      }
      if ((existingProduct.description || '') !== rawDesc) {
        fieldChanges.push({ field: 'Описание', oldVal: 'Изменено', newVal: 'Новое описание' });
      }
      if ((existingProduct.specs || '') !== rawSpecs) {
        fieldChanges.push({ field: 'Характеристики', oldVal: 'Изменены', newVal: 'Новые характеристики' });
      }
      if (existingProduct.status !== itemStatus) {
        fieldChanges.push({ field: 'Статус', oldVal: existingProduct.status, newVal: itemStatus });
      }
      if (rawAction === 'СКРЫТЬ') {
        fieldChanges.push({ field: 'Действие', oldVal: existingProduct.status, newVal: 'СКРЫТ С САЙТА' });
      }

      if (fieldChanges.length > 0) {
        if (itemStatus === 'СКРЫТ' || rawAction === 'СКРЫТЬ') {
          toHide++;
        } else {
          toUpdate++;
        }
        diffs.push({
          article: cleanArticle,
          name: rawName,
          action: rawAction === 'СКРЫТЬ' ? 'СКРЫТЬ' : 'ОБНОВИТЬ',
          changes: fieldChanges
        });
      } else {
        unchanged++;
      }
    }

    validRows.push(productPayload);
  }

  const success = errors.length === 0;

  return {
    success,
    summary: {
      toAdd,
      toUpdate,
      unchanged,
      toHide,
      toDelete,
      errorsCount: errors.length
    },
    diffs,
    errors,
    validRows
  };
}

/**
 * Создаёт Excel-отчёт об ошибках
 */
export async function createErrorReportWorkbook(errors) {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Ошибки импорта');
  ws.columns = [
    { header: '№ Строки в Excel', key: 'row', width: 18 },
    { header: 'Артикул (SKU)', key: 'article', width: 22 },
    { header: 'Причина ошибки', key: 'message', width: 55 },
    { header: 'Рекомендация по исправлению', key: 'recommendation', width: 45 }
  ];

  ws.getRow(1).height = 30;
  ws.getRow(1).eachCell(cell => {
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; // Red
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  errors.forEach(err => {
    let rec = 'Проверьте значение в указанной строке';
    if (err.message.includes('не указан артикул')) {
      rec = 'Заполните уникальный артикул (например LT-K101-CHR)';
    } else if (err.message.includes('повторяется артикул')) {
      rec = 'Удалите дубликат или назначьте уникальный артикул';
    } else if (err.message.includes('некорректная цена')) {
      rec = 'Укажите цену числом без букв и пробелов (например 28900)';
    } else if (err.message.includes('не указано название')) {
      rec = 'Заполните официальное наименование товара';
    } else if (err.message.includes('не указана категория')) {
      rec = 'Выберите категорию из выпадающего списка листа «Справочники»';
    }

    const row = ws.addRow({
      row: err.row,
      article: err.article,
      message: err.message,
      recommendation: rec
    });
    row.height = 24;
    row.eachCell(cell => {
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.alignment = { vertical: 'middle' };
    });
  });

  return workbook;
}

/**
 * Создаёт официальный Excel-шаблон / выгрузку остатков для конкретного склада (Режим А)
 */
export async function createWarehouseStockWorkbook(warehouse, products, stockList = []) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'LAUTE Warehouse System';
  workbook.created = new Date();

  const stockMap = new Map();
  stockList.forEach(s => {
    if (s.warehouseId === warehouse.id) {
      stockMap.set(s.sku, s);
    }
  });

  const ws = workbook.addWorksheet(`Остатки — ${warehouse.name}`, { views: [{ showGridLines: true }] });
  ws.columns = [
    { header: 'Артикул (SKU) *', key: 'sku', width: 20 },
    { header: 'Наименование товара (справочно)', key: 'name', width: 44 },
    { header: 'Категория', key: 'category', width: 24 },
    { header: 'Количество на складе (шт) *', key: 'quantity', width: 28 },
    { header: 'Дата обновления', key: 'updatedAt', width: 22 },
    { header: 'Склад', key: 'warehouse', width: 18 }
  ];

  ws.getRow(1).height = 32;
  ws.getRow(1).eachCell(cell => {
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF162032' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  products.forEach((p, idx) => {
    const itemStock = stockMap.get(p.article);
    const qty = (itemStock && itemStock.quantity !== null && itemStock.quantity !== undefined) ? itemStock.quantity : '';
    const upd = itemStock?.updatedAt ? new Date(itemStock.updatedAt).toLocaleDateString('ru-RU') : 'Не указана';

    const row = ws.addRow({
      sku: p.article,
      name: p.name,
      category: p.category || '',
      quantity: qty,
      updatedAt: upd,
      warehouse: warehouse.name
    });

    row.height = 24;
    const isEven = idx % 2 === 0;
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 || colNumber === 4 ? 'center' : 'left' };
      if (isEven) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
    });
  });

  return workbook;
}

/**
 * Создаёт единый Excel со всеми складами (Режим B)
 */
export async function createAllWarehousesStockWorkbook(warehouses, products, stockList = []) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'LAUTE Warehouse System';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('Складские остатки LAUTE', { views: [{ showGridLines: true }] });

  // Map stock: key is `${warehouseId}::${sku}`
  const stockMap = new Map();
  stockList.forEach(s => {
    stockMap.set(`${s.warehouseId}::${s.sku}`, s.quantity);
  });

  const columns = [
    { header: 'Артикул (SKU) *', key: 'sku', width: 20 },
    { header: 'Наименование товара', key: 'name', width: 44 },
    { header: 'Категория', key: 'category', width: 24 }
  ];

  warehouses.forEach(wh => {
    columns.push({
      header: `${wh.name} (шт)`,
      key: `wh_${wh.id}`,
      width: 20
    });
  });

  columns.push({ header: 'Дата выгрузки', key: 'exportDate', width: 20 });
  ws.columns = columns;

  ws.getRow(1).height = 34;
  ws.getRow(1).eachCell(cell => {
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const exportDate = new Date().toLocaleDateString('ru-RU');

  products.forEach((p, idx) => {
    const rowData = {
      sku: p.article,
      name: p.name,
      category: p.category || '',
      exportDate
    };

    warehouses.forEach(wh => {
      const key = `${wh.id}::${p.article}`;
      const qty = stockMap.has(key) ? stockMap.get(key) : null;
      rowData[`wh_${wh.id}`] = (qty !== null && qty !== undefined) ? qty : '';
    });

    const row = ws.addRow(rowData);
    row.height = 24;
    const isEven = idx % 2 === 0;

    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 || colNumber > 3 ? 'center' : 'left' };
      if (isEven) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
    });
  });

  return workbook;
}

/**
 * Валидирует загруженный Excel-файл со складскими остатками
 * Автоматически поддерживает как Режим А (один выбранный склад), так и Режим B (все склады в одной таблице)
 */
export async function parseAndValidateWarehouseStockExcelBuffer(buffer, targetWarehouse, currentProducts, currentStock = [], allWarehouses = []) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('Файл Excel не содержит листов');
  }

  const headerRow = worksheet.getRow(1);
  let skuColIdx = -1;
  const warehouseColIndices = []; // { colNumber, warehouse }
  let singleQtyColIdx = -1;

  const warehousesToMatch = [];
  if (Array.isArray(allWarehouses) && allWarehouses.length > 0) {
    warehousesToMatch.push(...allWarehouses);
  } else if (Array.isArray(targetWarehouse)) {
    warehousesToMatch.push(...targetWarehouse);
  } else if (targetWarehouse && typeof targetWarehouse === 'object' && targetWarehouse.name) {
    warehousesToMatch.push(targetWarehouse);
  }

  headerRow.eachCell((cell, colNumber) => {
    const rawVal = cell.value;
    const textVal = (typeof rawVal === 'object' && rawVal?.text) ? rawVal.text : String(rawVal || '');
    const val = textVal.trim().toLowerCase();
    if (val.includes('артикул') || val.includes('sku')) {
      skuColIdx = colNumber;
      return;
    }

    // Check if this column matches any known warehouse name or ID
    for (const wh of warehousesToMatch) {
      if (!wh) continue;
      const whNameLower = (wh.name || '').toLowerCase();
      const whIdLower = (wh.id || '').toLowerCase();
      if ((whNameLower && val.includes(whNameLower)) || (whIdLower && val.includes(whIdLower))) {
        warehouseColIndices.push({ colNumber, warehouse: wh });
        return;
      }
    }

    // Generic quantity column if single warehouse mode
    if (val.includes('количество') || val.includes('остаток') || val.includes('кол-во') || val.includes('qty')) {
      singleQtyColIdx = colNumber;
    }
  });

  if (skuColIdx === -1) {
    throw new Error('Не найдена колонка "Артикул" или "SKU" в первой строке Excel');
  }

  const isMultiWarehouseMode = warehouseColIndices.length > 1;

  if (!isMultiWarehouseMode && singleQtyColIdx === -1 && warehouseColIndices.length === 0) {
    throw new Error('Не найдены колонки со складами или количеством в первой строке Excel');
  }

  const productsMap = new Map();
  currentProducts.forEach(p => productsMap.set(p.article, p));

  // Current stock indexed by `${warehouseId}::${sku}`
  const stockMap = new Map();
  currentStock.forEach(s => {
    stockMap.set(`${s.warehouseId}::${s.sku}`, s.quantity);
  });

  const diffList = [];
  const errors = [];
  const seenSkus = new Set();
  const now = new Date().toISOString();

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const skuRaw = row.getCell(skuColIdx).value;
    if (!skuRaw) return; // skip empty lines

    const sku = String(skuRaw || '').trim();
    if (!sku) return;

    if (seenSkus.has(sku)) {
      errors.push({ row: rowNumber, sku, message: `Повторяющийся артикул ${sku} в файле` });
      return;
    }
    seenSkus.add(sku);

    const product = productsMap.get(sku);
    if (!product) {
      errors.push({ row: rowNumber, sku, message: `Артикул ${sku} не найден в каталоге LAUTE` });
      return;
    }

    if (isMultiWarehouseMode) {
      // Process each warehouse column for this product row
      warehouseColIndices.forEach(({ colNumber, warehouse }) => {
        const qtyRaw = row.getCell(colNumber).value;
        if (qtyRaw === null || qtyRaw === undefined || String(qtyRaw).trim() === '') {
          return; // preserve existing value (partial update)
        }

        let qty = 0;
        if (typeof qtyRaw === 'number') {
          qty = Math.max(0, Math.floor(qtyRaw));
        } else {
          const parsed = parseInt(String(qtyRaw).replace(/[^0-9]/g, ''), 10);
          if (isNaN(parsed) || parsed < 0) {
            errors.push({ row: rowNumber, sku, message: `Некорректное число остатка "${qtyRaw}" для склада ${warehouse.name}` });
            return;
          }
          qty = parsed;
        }

        const stockKey = `${warehouse.id}::${sku}`;
        const currentQty = stockMap.has(stockKey) ? stockMap.get(stockKey) : null;
        const diff = currentQty !== null ? qty - currentQty : qty;

        diffList.push({
          sku,
          name: product.name,
          category: product.category,
          warehouseId: warehouse.id,
          warehouseName: warehouse.name,
          oldQuantity: currentQty !== null ? currentQty : 0,
          newQuantity: qty,
          diff,
          updatedAt: now
        });
      });
    } else {
      // Single warehouse mode
      const wh = (warehouseColIndices.length > 0 ? warehouseColIndices[0].warehouse : targetWarehouse) || targetWarehouse;
      const colIdx = warehouseColIndices.length > 0 ? warehouseColIndices[0].colNumber : singleQtyColIdx;
      const qtyRaw = row.getCell(colIdx).value;

      if (qtyRaw === null || qtyRaw === undefined || String(qtyRaw).trim() === '') {
        return; // skip if empty, preserving existing
      }

      let qty = 0;
      if (typeof qtyRaw === 'number') {
        qty = Math.max(0, Math.floor(qtyRaw));
      } else {
        const parsed = parseInt(String(qtyRaw).replace(/[^0-9]/g, ''), 10);
        if (isNaN(parsed) || parsed < 0) {
          errors.push({ row: rowNumber, sku, message: `Некорректное количество "${qtyRaw}" для ${sku}` });
          return;
        }
        qty = parsed;
      }

      const stockKey = `${wh.id}::${sku}`;
      const currentQty = stockMap.has(stockKey) ? stockMap.get(stockKey) : null;
      const diff = currentQty !== null ? qty - currentQty : qty;

      diffList.push({
        sku,
        name: product.name,
        category: product.category,
        warehouseId: wh.id,
        warehouseName: wh.name,
        oldQuantity: currentQty !== null ? currentQty : 0,
        newQuantity: qty,
        diff,
        updatedAt: now
      });
    }
  });

  return {
    valid: errors.length === 0,
    mode: isMultiWarehouseMode ? 'all' : 'single',
    warehouseId: isMultiWarehouseMode ? 'all' : (targetWarehouse?.id || 'single'),
    warehouseName: isMultiWarehouseMode ? 'Все склады' : (targetWarehouse?.name || ''),
    totalRows: seenSkus.size,
    validCount: diffList.length,
    errorCount: errors.length,
    changedCount: diffList.filter(d => d.diff !== 0).length,
    diffList,
    errors
  };
}

