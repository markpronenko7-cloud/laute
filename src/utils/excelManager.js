import * as XLSX from 'xlsx';
import { CATEGORY_NAMES, AVAILABLE_CITIES } from '../data/catalogData.js';

// Официальные колонки каталога LAUTE (полное соответствие LAUTE_Catalog.xlsx)
export const EXCEL_COLUMNS = [
  'Артикул (SKU) *',
  'Название товара *',
  'Категория *',
  'Подкатегория',
  'Коллекция',
  'Бренд',
  'Описание',
  'Цена *',
  'Валюта',
  'Материал',
  'Цвет',
  'Покрытие',
  'Тип установки',
  'Назначение',
  'Размеры',
  'Вес',
  'Объём',
  'Технические характеристики',
  'Фотографии (пути / ссылки)',
  'Статус товара',
  'SEO-заголовок',
  'SEO-описание',
  'URL товара',
  'Статус действия',
  'Дополнительные характеристики'
];

/**
 * Скачивает официальный Excel-шаблон LAUTE_Catalog.xlsx со всеми справочниками и стилями
 */
export const downloadExcelTemplate = () => {
  const staticPath = window.location.pathname.includes('/laute') ? '/laute/LAUTE_Catalog.xlsx' : '/LAUTE_Catalog.xlsx';
  const link = document.createElement('a');
  link.href = staticPath;
  link.download = 'LAUTE_Catalog.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Скачивает текущую актуальную номенклатуру каталога в формате Excel (.xlsx),
 * полностью совместимом с повторным импортом (лист "Товары" и стандартные заголовки).
 */
export const exportCurrentCatalogToExcel = (products) => {
  const exportData = (products || []).map((p) => {
    const photos = [p.photo1, p.photo2, p.photo3].filter(Boolean).join(', ');

    return {
      'Артикул (SKU) *': p.article,
      'Название товара *': p.name || '',
      'Категория *': p.category || '',
      'Подкатегория': p.subcategory || '',
      'Коллекция': p.collection || '',
      'Бренд': p.brand || 'LAUTE',
      'Описание': p.description || '',
      'Цена *': p.price || 0,
      'Валюта': p.currency || '₸',
      'Материал': p.material || '',
      'Цвет': p.color || '',
      'Покрытие': p.finish || '',
      'Тип установки': p.installType || '',
      'Назначение': p.purpose || '',
      'Размеры': p.dimensions || '',
      'Вес': p.weight || '',
      'Объём': p.volume || '',
      'Технические характеристики': p.specs || '',
      'Фотографии (пути / ссылки)': photos,
      'Статус товара': p.status || 'АКТИВЕН',
      'SEO-заголовок': p.seoTitle || '',
      'SEO-описание': p.seoDesc || '',
      'URL товара': p.url || `/catalog#${p.article}`,
      'Статус действия': p.status === 'СКРЫТ' ? 'СКРЫТ' : 'ОБНОВИТЬ',
      'Дополнительные характеристики': p.extraSpecs || ''
    };
  });

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Товары');
  XLSX.writeFile(wb, `LAUTE_Каталог_Экспорт_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

/**
 * Скачивает файл с отчётом об ошибках валидации Excel
 */
export const downloadErrorReport = (errors) => {
  if (!errors || errors.length === 0) return;
  const rows = errors.map(e => ({
    'Номер строки': e.row,
    'Артикул (SKU)': e.article || '—',
    'Колонка': e.field || '—',
    'Текст ошибки': e.message,
    'Рекомендация': 'Исправьте значение в строке файла Excel и загрузите повторно'
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ошибки импорта');
  XLSX.writeFile(wb, `LAUTE_Ошибки_Импорта_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

/**
 * Нормализует ключ столбца для нечувствительного к регистру, пробелам и спецсимволам поиска
 */
function normalizeColumnKey(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[*()]/g, '')
    .replace(/[\s_\-\/]+/g, '')
    .trim();
}

/**
 * Извлекает значение из строки таблицы по списку возможных синонимов названий колонок
 */
function getColumnValue(cleanRow, aliases) {
  for (const alias of aliases) {
    const norm = normalizeColumnKey(alias);
    for (const [k, v] of Object.entries(cleanRow)) {
      if (k === norm || k.startsWith(norm) || norm.startsWith(k)) {
        if (v !== undefined && v !== null && String(v).trim() !== '') {
          return String(v).trim();
        }
      }
    }
  }
  return '';
}

/**
 * Парсит загруженный файл Excel и производит строгую построчную валидацию.
 * Автоматически находит нужный лист каталога ("Товары" / "Каталог" / лист с артикулами).
 * Возвращает { success, errors, validRows, rows, summary, stats }
 */
export const parseAndValidateExcelFile = async (file, currentProducts = []) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          resolve({
            success: false,
            errors: [{ row: 1, article: '—', field: 'Файл', message: 'Книга Excel не содержит ни одного листа.' }],
            validRows: [],
            rows: [],
            summary: { toAdd: 0, toUpdate: 0, unchanged: 0, toHide: 0, toDelete: 0, errorsCount: 1 },
            stats: null
          });
          return;
        }

        // 1. Умный поиск целевого листа с товарами
        let targetSheetName = null;

        // Приоритет A: поиск по названию листа
        for (const name of workbook.SheetNames) {
          const lower = name.toLowerCase();
          if (lower === 'товары' || lower === 'каталог' || lower === 'products' || lower === 'каталог laute' || lower === 'товары laute') {
            targetSheetName = name;
            break;
          }
        }

        // Приоритет B: поиск по вхождению "товар" или "каталог" в названии
        if (!targetSheetName) {
          for (const name of workbook.SheetNames) {
            const lower = name.toLowerCase();
            if (lower.includes('товар') || lower.includes('каталог') || lower.includes('product')) {
              targetSheetName = name;
              break;
            }
          }
        }

        // Приоритет C: сканирование содержимого листов на наличие заголовков "артикул" / "sku"
        if (!targetSheetName) {
          for (const name of workbook.SheetNames) {
            const ws = workbook.Sheets[name];
            if (!ws) continue;
            const previewRows = XLSX.utils.sheet_to_json(ws, { header: 1, range: 0 });
            const hasSkuHeader = previewRows.slice(0, 10).some(row => 
              Array.isArray(row) && row.some(cell => {
                const c = String(cell || '').toLowerCase();
                return c.includes('артикул') || c.includes('sku');
              })
            );
            if (hasSkuHeader) {
              targetSheetName = name;
              break;
            }
          }
        }

        // Fallback: первый лист
        if (!targetSheetName) {
          targetSheetName = workbook.SheetNames[0];
        }

        const worksheet = workbook.Sheets[targetSheetName];
        if (!worksheet) {
          resolve({
            success: false,
            errors: [{ row: 1, article: '—', field: 'Лист', message: `Лист "${targetSheetName}" пуст или не найден.` }],
            validRows: [],
            rows: [],
            summary: { toAdd: 0, toUpdate: 0, unchanged: 0, toHide: 0, toDelete: 0, errorsCount: 1 },
            stats: null
          });
          return;
        }

        // Определяем строку с заголовками (на случай вступительного текста или пустых строк)
        const rawSheetArray = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        let headerRowOffset = 0;
        for (let i = 0; i < Math.min(15, rawSheetArray.length); i++) {
          const rowArr = rawSheetArray[i];
          if (Array.isArray(rowArr) && rowArr.some(cell => {
            const c = String(cell || '').toLowerCase();
            return c.includes('артикул') || c.includes('sku') || c.includes('название');
          })) {
            headerRowOffset = i;
            break;
          }
        }

        const rawRows = XLSX.utils.sheet_to_json(worksheet, { range: headerRowOffset, defval: '' });

        if (!rawRows || rawRows.length === 0) {
          resolve({
            success: false,
            errors: [{ row: 1, article: '—', field: 'Лист', message: `Лист "${targetSheetName}" не содержит строк с данными товаров.` }],
            validRows: [],
            rows: [],
            summary: { toAdd: 0, toUpdate: 0, unchanged: 0, toHide: 0, toDelete: 0, errorsCount: 1 },
            stats: null
          });
          return;
        }

        const errors = [];
        const validRows = [];
        
        // Карта существующих товаров
        const existingMap = new Map();
        (currentProducts || []).forEach(p => {
          if (p && p.article) {
            existingMap.set(p.article.trim().toUpperCase(), p);
          }
        });

        const seenArticles = new Set();

        rawRows.forEach((row, index) => {
          const rowNum = index + headerRowOffset + 2; // +1 за 0-индекс, +1 за строку заголовка

          // Нормализуем ключи текущей строки
          const cleanRow = {};
          Object.keys(row).forEach((k) => {
            cleanRow[normalizeColumnKey(k)] = row[k];
          });

          // Пропускаем полностью пустые строки (например, пустые форматированные строки внизу шаблона)
          const hasAnyData = Object.values(cleanRow).some(v => v !== undefined && v !== null && String(v).trim() !== '');
          if (!hasAnyData) {
            return;
          }

          const article = getColumnValue(cleanRow, ['артикул', 'sku', 'article', 'код']);
          const name = getColumnValue(cleanRow, ['названиетовара', 'название', 'наименование', 'name', 'title']);
          const category = getColumnValue(cleanRow, ['категория', 'category']);
          const priceRaw = getColumnValue(cleanRow, ['цена', 'стоимость', 'price']);
          const actionRaw = getColumnValue(cleanRow, ['статусдействия', 'действие', 'action', 'статус', 'status']);
          const productStatusRaw = getColumnValue(cleanRow, ['статустовара', 'productstatus']);

          // Если в строке нет ни артикула, ни названия, ни цены — это пустая строка, пропускаем
          if (!article && !name && !priceRaw) {
            return;
          }

          // 1. Проверка артикула
          if (!article) {
            errors.push({
              row: rowNum,
              article: '—',
              field: 'Артикул (SKU)',
              message: 'Артикул (SKU) отсутствует или пуст в строке'
            });
            return;
          }

          const upperArticle = article.toUpperCase();
          if (seenArticles.has(upperArticle)) {
            errors.push({
              row: rowNum,
              article,
              field: 'Артикул (SKU)',
              message: `Дублирующийся артикул ${article} внутри загружаемого файла Excel`
            });
            return;
          }
          seenArticles.add(upperArticle);

          // 2. Проверка статуса действия
          let actionStatus = (actionRaw || 'ОБНОВИТЬ').toUpperCase();
          if (actionStatus === 'ADD') actionStatus = 'ДОБАВИТЬ';
          if (actionStatus === 'UPDATE') actionStatus = 'ОБНОВИТЬ';
          if (actionStatus === 'HIDE') actionStatus = 'СКРЫТ';
          if (actionStatus === 'DELETE') actionStatus = 'УДАЛИТЬ';

          const allowedActions = ['ДОБАВИТЬ', 'ОБНОВИТЬ', 'СКРЫТЬ', 'УДАЛИТЬ'];
          if (!allowedActions.includes(actionStatus)) {
            errors.push({
              row: rowNum,
              article,
              field: 'Статус действия',
              message: `Недопустимый статус действия "${actionRaw}". Допустимо: ДОБАВИТЬ, ОБНОВИТЬ, СКРЫТЬ, УДАЛИТЬ`
            });
            return;
          }

          // Для операции явного удаления достаточно только артикула
          if (actionStatus === 'УДАЛИТЬ') {
            validRows.push({
              rowNum,
              article,
              actionStatus: 'УДАЛИТЬ',
              status: 'УДАЛИТЬ',
              isDelete: true,
              isExisting: existingMap.has(upperArticle),
              isChanged: true
            });
            return;
          }

          // 3. Проверка названия товара
          if (!name) {
            errors.push({
              row: rowNum,
              article,
              field: 'Название товара',
              message: 'Название товара обязательно, но не заполнено'
            });
            return;
          }

          // 4. Проверка цены
          const cleanPriceStr = String(priceRaw || '').replace(/\s+/g, '').replace(',', '.');
          const parsedPrice = parseFloat(cleanPriceStr.replace(/[^\d.]/g, ''));
          if (isNaN(parsedPrice) || parsedPrice <= 0) {
            errors.push({
              row: rowNum,
              article,
              field: 'Цена',
              message: `Некорректная цена "${priceRaw}". Должно быть положительное число`
            });
            return;
          }

          // 5. Проверка категории
          if (!category) {
            errors.push({
              row: rowNum,
              article,
              field: 'Категория',
              message: 'Категория товара обязательна, но не заполнена'
            });
            return;
          }

          // Фотографии: поддержка объединённого поля и отдельных колонок
          const photoCombined = getColumnValue(cleanRow, ['фотографиипутиссылки', 'фотографиипути/ссылки', 'фотографии', 'photos', 'фото']);
          const photoParts = photoCombined ? photoCombined.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean) : [];
          const photo1 = getColumnValue(cleanRow, ['фотография1', 'photo1']) || photoParts[0] || '';
          const photo2 = getColumnValue(cleanRow, ['фотография2', 'photo2']) || photoParts[1] || '';
          const photo3 = getColumnValue(cleanRow, ['фотография3', 'photo3']) || photoParts[2] || '';

          const stockRaw = getColumnValue(cleanRow, ['наличие', 'остаток', 'количество', 'stock', 'qty']);
          const stockNum = parseInt(stockRaw, 10);
          const safeStock = isNaN(stockNum) ? 0 : Math.max(0, stockNum);

          const existingProd = existingMap.get(upperArticle);
          const isExisting = Boolean(existingProd);

          // Проверяем, изменились ли данные по сравнению с текущей базой
          let isChanged = !isExisting;
          if (isExisting && existingProd) {
            if (
              existingProd.name !== name ||
              Number(existingProd.price) !== parsedPrice ||
              existingProd.category !== category ||
              (actionStatus === 'СКРЫТ' && existingProd.status !== 'СКРЫТ') ||
              (actionStatus !== 'СКРЫТ' && existingProd.status === 'СКРЫТ')
            ) {
              isChanged = true;
            }
          }

          validRows.push({
            rowNum,
            article: article.trim(),
            name: name.trim(),
            category: category.trim(),
            subcategory: getColumnValue(cleanRow, ['подкатегория', 'subcategory']),
            collection: getColumnValue(cleanRow, ['коллекция', 'collection']),
            brand: getColumnValue(cleanRow, ['бренд', 'brand']) || 'LAUTE',
            description: getColumnValue(cleanRow, ['описание', 'description']),
            price: parsedPrice,
            currency: getColumnValue(cleanRow, ['валюта', 'currency']) || '₸',
            material: getColumnValue(cleanRow, ['материал', 'material']),
            color: getColumnValue(cleanRow, ['цвет', 'color']),
            finish: getColumnValue(cleanRow, ['покрытие', 'finish']),
            installType: getColumnValue(cleanRow, ['типустановки', 'installtype']),
            purpose: getColumnValue(cleanRow, ['назначение', 'purpose']),
            dimensions: getColumnValue(cleanRow, ['размеры', 'размер', 'dimensions']),
            weight: getColumnValue(cleanRow, ['вес', 'weight']),
            volume: getColumnValue(cleanRow, ['объём', 'объем', 'volume']),
            specs: getColumnValue(cleanRow, ['техническиехарактеристики', 'характеристики', 'specs']),
            extraSpecs: getColumnValue(cleanRow, ['дополнительныехарактеристики', 'extraspecs']),
            photo1: photo1 || (isExisting ? existingProd?.photo1 : 'images/cat_laute_brand.jpg') || 'images/cat_laute_brand.jpg',
            photo2: photo2 || (isExisting ? existingProd?.photo2 : '') || '',
            photo3: photo3 || (isExisting ? existingProd?.photo3 : '') || '',
            city: getColumnValue(cleanRow, ['город', 'city']) || 'Алматы',
            stock: safeStock,
            status: (actionStatus === 'СКРЫТ' || productStatusRaw === 'СКРЫТ') ? 'СКРЫТ' : 'АКТИВЕН',
            actionStatus,
            seoTitle: getColumnValue(cleanRow, ['seoзаголовок', 'seotitle']),
            seoDesc: getColumnValue(cleanRow, ['seoописание', 'seodesc']),
            url: getColumnValue(cleanRow, ['urlтовара', 'url']) || `/catalog#${article.trim()}`,
            isExisting,
            isChanged
          });
        });

        // Подсчёт статистики для предпросмотра
        let toAdd = 0;
        let toUpdate = 0;
        let unchanged = 0;
        let toHide = 0;
        let toDelete = 0;

        validRows.forEach((r) => {
          if (r.actionStatus === 'УДАЛИТЬ') {
            toDelete++;
          } else if (r.actionStatus === 'СКРЫТ' || r.status === 'СКРЫТ') {
            toHide++;
          } else if (!r.isExisting || r.actionStatus === 'ДОБАВИТЬ') {
            toAdd++;
          } else if (r.isChanged) {
            toUpdate++;
          } else {
            unchanged++;
          }
        });

        const summary = {
          toAdd,
          toUpdate,
          unchanged,
          toHide,
          toDelete,
          errorsCount: errors.length
        };

        const stats = {
          totalRows: rawRows.length,
          validCount: validRows.length,
          errorCount: errors.length,
          newCount: toAdd,
          updateCount: toUpdate,
          unchangedCount: unchanged,
          hideCount: toHide,
          deleteCount: toDelete,
          added: toAdd,
          updated: toUpdate,
          hidden: toHide
        };

        resolve({
          success: errors.length === 0,
          summary,
          stats,
          errors,
          validRows,
          rows: validRows
        });
      } catch (err) {
        resolve({
          success: false,
          errors: [{ row: 1, article: '—', field: 'Файл', message: `Критическая ошибка чтения Excel: ${err.message}` }],
          validRows: [],
          rows: [],
          summary: { toAdd: 0, toUpdate: 0, unchanged: 0, toHide: 0, toDelete: 0, errorsCount: 1 },
          stats: null
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        errors: [{ row: 1, article: '—', field: 'Файл', message: 'Не удалось прочитать загруженный файл Excel.' }],
        validRows: [],
        rows: [],
        summary: { toAdd: 0, toUpdate: 0, unchanged: 0, toHide: 0, toDelete: 0, errorsCount: 1 },
        stats: null
      });
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Применяет проверенные строки импорта к существующему каталогу.
 * КРИТИЧЕСКОЕ ПРАВИЛО БЕЗОПАСНОСТИ:
 * Товары, отсутствующие в Excel, НИКОГДА НЕ удаляются!
 * Удаление производится ИСКЛЮЧИТЕЛЬНО при явном статусе "УДАЛИТЬ".
 */
export const applyExcelImport = (currentProducts = [], validatedRows = []) => {
  const productMap = new Map();
  (currentProducts || []).forEach(p => {
    if (p && p.article) {
      productMap.set(p.article.trim().toUpperCase(), { ...p });
    }
  });

  (validatedRows || []).forEach((row) => {
    if (!row || !row.article) return;
    const key = row.article.trim().toUpperCase();

    // 1. Явное удаление
    if (row.actionStatus === 'УДАЛИТЬ') {
      productMap.delete(key);
      return;
    }

    // 2. Существующий товар — обновляем
    if (productMap.has(key)) {
      const existing = productMap.get(key);
      const updatedCityStock = { ...(existing.cityStock || {}) };
      if (row.city) {
        updatedCityStock[row.city] = row.stock;
      }

      productMap.set(key, {
        ...existing,
        name: row.name || existing.name,
        category: row.category || existing.category,
        subcategory: row.subcategory !== undefined && row.subcategory !== '' ? row.subcategory : existing.subcategory,
        collection: row.collection !== undefined && row.collection !== '' ? row.collection : existing.collection,
        brand: row.brand || existing.brand || 'LAUTE',
        description: row.description !== undefined && row.description !== '' ? row.description : existing.description,
        price: row.price !== undefined ? row.price : existing.price,
        currency: row.currency || existing.currency || '₸',
        material: row.material !== undefined && row.material !== '' ? row.material : existing.material,
        color: row.color !== undefined && row.color !== '' ? row.color : existing.color,
        finish: row.finish !== undefined && row.finish !== '' ? row.finish : existing.finish,
        installType: row.installType !== undefined && row.installType !== '' ? row.installType : existing.installType,
        purpose: row.purpose !== undefined && row.purpose !== '' ? row.purpose : existing.purpose,
        dimensions: row.dimensions !== undefined && row.dimensions !== '' ? row.dimensions : existing.dimensions,
        weight: row.weight !== undefined && row.weight !== '' ? row.weight : existing.weight,
        volume: row.volume !== undefined && row.volume !== '' ? row.volume : existing.volume,
        specs: row.specs !== undefined && row.specs !== '' ? row.specs : existing.specs,
        extraSpecs: row.extraSpecs !== undefined && row.extraSpecs !== '' ? row.extraSpecs : existing.extraSpecs,
        photo1: row.photo1 || existing.photo1,
        photo2: row.photo2 || existing.photo2,
        photo3: row.photo3 || existing.photo3,
        cityStock: updatedCityStock,
        status: (row.actionStatus === 'СКРЫТ' || row.status === 'СКРЫТ') ? 'СКРЫТ' : 'АКТИВЕН',
        seoTitle: row.seoTitle || existing.seoTitle,
        seoDesc: row.seoDesc || existing.seoDesc,
        url: row.url || existing.url,
        updatedAt: new Date().toISOString()
      });
    } else {
      // 3. Новый товар — добавляем
      const newCityStock = {};
      if (row.city) {
        newCityStock[row.city] = row.stock;
      }

      productMap.set(key, {
        article: row.article.trim(),
        name: row.name,
        category: row.category,
        subcategory: row.subcategory || '',
        collection: row.collection || '',
        brand: row.brand || 'LAUTE',
        description: row.description || '',
        price: row.price,
        currency: row.currency || '₸',
        material: row.material || '',
        color: row.color || '',
        finish: row.finish || '',
        installType: row.installType || '',
        purpose: row.purpose || '',
        dimensions: row.dimensions || '',
        weight: row.weight || '',
        volume: row.volume || '',
        specs: row.specs || '',
        extraSpecs: row.extraSpecs || '',
        photo1: row.photo1 || 'images/cat_laute_brand.jpg',
        photo2: row.photo2 || '',
        photo3: row.photo3 || '',
        cityStock: newCityStock,
        status: (row.actionStatus === 'СКРЫТ' || row.status === 'СКРЫТ') ? 'СКРЫТ' : 'АКТИВЕН',
        seoTitle: row.seoTitle || '',
        seoDesc: row.seoDesc || '',
        url: row.url || `/catalog#${row.article.trim()}`,
        updatedAt: new Date().toISOString()
      });
    }
  });

  return Array.from(productMap.values());
};

/**
 * Генерирует и скачивает официальный Excel-шаблон остатков
 * Поддерживает:
 * — Режим B: Все склады одновременно (матрица столбцов) при warehouse = null или 'all'
 * — Режим A: Отдельно выбранный склад
 */
export const downloadStockTemplateExcel = (warehouse, products = [], currentStock = [], allWarehouses = []) => {
  const isAll = !warehouse || warehouse === 'all' || warehouse?.id === 'all';

  if (isAll) {
    // Режим B — Матрица всех складов
    const whList = (Array.isArray(allWarehouses) && allWarehouses.length > 0)
      ? allWarehouses
      : [
          { id: 'almaty', name: 'Алматы' },
          { id: 'novosibirsk', name: 'Новосибирск' },
          { id: 'moscow', name: 'Москва' },
          { id: 'china', name: 'Китай' }
        ];

    const stockMap = new Map();
    (currentStock || []).forEach(s => {
      stockMap.set(`${s.warehouseId}::${s.sku}`, s.quantity);
    });

    const headers = ['Артикул (SKU)', 'Наименование товара', 'Категория'];
    whList.forEach(wh => {
      headers.push(`${wh.name} (шт)`);
    });
    headers.push('Дата выгрузки');

    const exportDate = new Date().toLocaleDateString('ru-RU');

    const rows = (products || []).map(p => {
      const row = {
        'Артикул (SKU)': p.article,
        'Наименование товара': p.name,
        'Категория': p.category || ''
      };
      whList.forEach(wh => {
        const key = `${wh.id}::${p.article}`;
        const qty = stockMap.has(key) ? stockMap.get(key) : null;
        row[`${wh.name} (шт)`] = (qty !== null && qty !== undefined) ? qty : '';
      });
      row['Дата выгрузки'] = exportDate;
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
    ws['!cols'] = [
      { wch: 18 },
      { wch: 44 },
      { wch: 24 },
      ...whList.map(() => ({ wch: 20 })),
      { wch: 16 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Все склады LAUTE');
    XLSX.writeFile(wb, 'LAUTE_Stock_Template_ALL_WAREHOUSES.xlsx');
    return true;
  }

  // Режим A — Конкретный выбранный склад
  const whObj = typeof warehouse === 'object' && warehouse !== null 
    ? warehouse 
    : { id: String(warehouse), name: String(warehouse) };

  const stockMap = new Map();
  (currentStock || []).forEach(s => {
    if (s.warehouseId === whObj.id) {
      stockMap.set(s.sku, s.quantity);
    }
  });

  const rows = (products || []).map(p => {
    const qty = stockMap.has(p.article) ? stockMap.get(p.article) : null;
    return {
      'Артикул (SKU)': p.article,
      'Наименование товара': p.name,
      'Категория': p.category || '',
      'Количество на складе (шт)': (qty !== null && qty !== undefined) ? qty : '',
      'Склад': whObj.name || whObj.id
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 18 },
    { wch: 42 },
    { wch: 24 },
    { wch: 26 },
    { wch: 18 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Остатки — ${whObj.name || whObj.id}`);
  XLSX.writeFile(wb, `LAUTE_Stock_Template_${whObj.id}.xlsx`);
  return true;
};

/**
 * Парсит и валидирует загруженный Excel-файл со складскими остатками на клиенте
 * Поддерживает как файл одного склада (Режим А), так и матрицу всех складов (Режим B)
 */
export const parseStockExcelClient = async (file, warehouse, currentProducts, currentStock = [], allWarehouses = []) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        if (!sheet) {
          throw new Error('Файл не содержит листов');
        }

        const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (rawRows.length < 2) {
          throw new Error('Файл Excel пуст или содержит только заголовок');
        }

        const headers = rawRows[0].map(h => String(h || '').trim().toLowerCase());
        const skuIdx = headers.findIndex(h => h.includes('артикул') || h.includes('sku'));

        if (skuIdx === -1) {
          throw new Error('Не найдена колонка "Артикул" или "SKU" в файле');
        }

        const productsMap = new Map();
        currentProducts.forEach(p => productsMap.set(p.article, p));

        const stockMap = new Map();
        (currentStock || []).forEach(s => {
          stockMap.set(`${s.warehouseId}::${s.sku}`, s.quantity);
        });

        // Проверяем, есть ли колонки нескольких складов (Режим B)
        const whColumns = [];
        (allWarehouses || []).forEach(wh => {
          const colIdx = headers.findIndex(h => 
            h.includes(wh.name.toLowerCase()) || 
            h.includes(wh.id.toLowerCase())
          );
          if (colIdx !== -1) {
            whColumns.push({ colIdx, warehouse: wh });
          }
        });

        const isMultiWh = whColumns.length > 0;
        let singleQtyIdx = -1;
        let singleWh = warehouse || (allWarehouses && allWarehouses[0]) || { id: 'almaty', name: 'Алматы' };

        if (!isMultiWh) {
          singleQtyIdx = headers.findIndex(h => 
            h.includes('количество') || h.includes('остаток') || h.includes('кол-во') || h.includes('qty')
          );
          if (singleQtyIdx === -1) {
            throw new Error('Не найдены колонки складов или колонка "Количество" в файле');
          }
        }

        const diffList = [];
        const errors = [];
        const seenSkus = new Set();
        const now = new Date().toISOString();

        for (let i = 1; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row || row.length === 0) continue;

          const skuRaw = row[skuIdx];
          const sku = String(skuRaw || '').trim();
          if (!sku) continue;

          if (seenSkus.has(sku)) {
            errors.push({ row: i + 1, sku, message: `Повторяющийся артикул ${sku} в файле` });
            continue;
          }
          seenSkus.add(sku);

          const product = productsMap.get(sku);
          if (!product) {
            errors.push({ row: i + 1, sku, message: `Артикул ${sku} не найден в номенклатуре LAUTE` });
            continue;
          }

          if (isMultiWh) {
            // Обрабатываем каждый склад в матрице
            whColumns.forEach(({ colIdx, warehouse: wh }) => {
              const val = row[colIdx];
              if (val === null || val === undefined || val === '') return; // Пропускаем пустые (без изменений)

              let qty = 0;
              if (typeof val === 'number') {
                qty = Math.max(0, Math.floor(val));
              } else {
                const parsed = parseInt(String(val).replace(/[^0-9]/g, ''), 10);
                if (isNaN(parsed) || parsed < 0) {
                  errors.push({ row: i + 1, sku, message: `Некорректное число для склада ${wh.name}: "${val}"` });
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
                oldQuantity: currentQty !== null ? currentQty : '—',
                newQuantity: qty,
                diff,
                updatedAt: now
              });
            });
          } else {
            // Обрабатываем один склад
            const val = row[singleQtyIdx];
            if (val === null || val === undefined || val === '') continue;

            let qty = 0;
            if (typeof val === 'number') {
              qty = Math.max(0, Math.floor(val));
            } else {
              const parsed = parseInt(String(val).replace(/[^0-9]/g, ''), 10);
              if (isNaN(parsed) || parsed < 0) {
                errors.push({ row: i + 1, sku, message: `Некорректное число количества "${val}"` });
                continue;
              }
              qty = parsed;
            }

            const stockKey = `${singleWh.id}::${sku}`;
            const currentQty = stockMap.has(stockKey) ? stockMap.get(stockKey) : 0;
            const diff = qty - currentQty;

            diffList.push({
              sku,
              name: product.name,
              category: product.category,
              warehouseId: singleWh.id,
              warehouseName: singleWh.name,
              oldQuantity: currentQty,
              newQuantity: qty,
              diff,
              updatedAt: now
            });
          }
        }

        resolve({
          isMultiWarehouse: isMultiWh,
          warehouseId: isMultiWh ? 'all' : singleWh.id,
          warehouseName: isMultiWh ? 'Все склады' : singleWh.name,
          totalRows: diffList.length + errors.length,
          validCount: diffList.length,
          errorCount: errors.length,
          diffList,
          errors
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsArrayBuffer(file);
  });
};
