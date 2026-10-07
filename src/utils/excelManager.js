import * as XLSX from 'xlsx';
import { CATEGORY_NAMES, AVAILABLE_CITIES } from '../data/catalogData.js';

export const EXCEL_COLUMNS = [
  'Артикул',
  'Название',
  'Категория',
  'Цена',
  'Валюта',
  'Описание',
  'Размер',
  'Вес',
  'Объём',
  'Характеристики',
  'Фотография 1',
  'Фотография 2',
  'Фотография 3',
  'Город',
  'Наличие',
  'Статус действия'
];

/**
 * Генерирует и скачивает официальный Excel-шаблон (.xlsx)
 */
export const downloadExcelTemplate = () => {
  const sampleData = [
    {
      'Артикул': 'LT-K105-NW',
      'Название': 'Смеситель для кухни LAUTE Aurora A-1',
      'Категория': 'Кухонные смесители',
      'Цена': 31500,
      'Валюта': '₸',
      'Описание': 'Стильный смеситель с поворотным изливом 360 градусов и керамическим картриджем 35 мм.',
      'Размер': 'Высота: 290 мм, вылет: 200 мм',
      'Вес': '1.60 кг',
      'Объём': '0.008 м³',
      'Характеристики': 'Латунь CW617N, картридж 35 мм, аэратор Neoperl, подводка 45 см',
      'Фотография 1': 'images/cat_kitchen.png',
      'Фотография 2': 'images/collections/coll-kitchen.jpg',
      'Фотография 3': 'images/cat_laute_brand.jpg',
      'Город': 'Алматы',
      'Наличие': '15',
      'Статус действия': 'ДОБАВИТЬ'
    },
    {
      'Артикул': 'LT-K101-CHR',
      'Название': 'Смеситель для кухни LAUTE Prime K-10',
      'Категория': 'Кухонные смесители',
      'Цена': 29900,
      'Валюта': '₸',
      'Описание': 'Обновленная цена и скорректированный остаток по складу Алматы.',
      'Размер': 'Высота: 260 мм, вылет излива: 185 мм',
      'Вес': '1.45 кг',
      'Объём': '0.007 м³',
      'Характеристики': 'Латунь CW617N, картридж 35 мм, Neoperl',
      'Фотография 1': 'images/cat_kitchen.png',
      'Фотография 2': '',
      'Фотография 3': '',
      'Город': 'Алматы',
      'Наличие': '20',
      'Статус действия': 'ОБНОВИТЬ'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData, { header: EXCEL_COLUMNS });
  // Устанавливаем ширину колонок для удобства сотрудников
  ws['!cols'] = [
    { wch: 16 }, // Артикул
    { wch: 38 }, // Название
    { wch: 24 }, // Категория
    { wch: 12 }, // Цена
    { wch: 8 },  // Валюта
    { wch: 45 }, // Описание
    { wch: 28 }, // Размер
    { wch: 12 }, // Вес
    { wch: 12 }, // Объём
    { wch: 40 }, // Характеристики
    { wch: 28 }, // Фотография 1
    { wch: 28 }, // Фотография 2
    { wch: 28 }, // Фотография 3
    { wch: 16 }, // Город
    { wch: 12 }, // Наличие
    { wch: 18 }  // Статус действия
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Шаблон LAUTE');
  XLSX.writeFile(wb, 'LAUTE_Шаблон_Каталога.xlsx');
};

/**
 * Скачивает текущую актуальную номенклатуру каталога в формате Excel (.xlsx)
 */
export const exportCurrentCatalogToExcel = (products) => {
  const exportData = products.map((p) => {
    // Формируем сводку наличия
    const cityEntries = Object.entries(p.cityStock || {});
    const mainCity = cityEntries.length > 0 ? cityEntries[0][0] : 'Алматы';
    const mainStock = cityEntries.length > 0 ? cityEntries[0][1] : 0;

    return {
      'Артикул': p.article,
      'Название': p.name,
      'Категория': p.category,
      'Цена': p.price,
      'Валюта': p.currency || '₸',
      'Описание': p.description || '',
      'Размер': p.dimensions || '',
      'Вес': p.weight || '',
      'Объём': p.volume || '',
      'Характеристики': p.specs || '',
      'Фотография 1': p.photo1 || '',
      'Фотография 2': p.photo2 || '',
      'Фотография 3': p.photo3 || '',
      'Город': mainCity,
      'Наличие': mainStock,
      'Статус действия': p.status === 'СКРЫТ' ? 'СКРЫТ' : 'ОБНОВИТЬ'
    };
  });

  const ws = XLSX.utils.json_to_sheet(exportData, { header: EXCEL_COLUMNS });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Каталог LAUTE');
  XLSX.writeFile(wb, `LAUTE_Каталог_Экспорт_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

/**
 * Парсит загруженный файл и производит строгую построчную валидацию
 * Возвращает { success, errors, rows, stats, preview }
 */
export const parseAndValidateExcelFile = async (file, currentProducts) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          resolve({
            success: false,
            errors: ['Файл пуст или лист не содержит строк с данными.'],
            rows: [],
            stats: null
          });
          return;
        }

        const errors = [];
        const validRows = [];
        const existingArticles = new Set(currentProducts.map(p => p.article.trim().toUpperCase()));

        // Построчная проверка
        rawRows.forEach((row, index) => {
          const rowNum = index + 2; // Учитываем заголовок в строке 1
          
          // Нормализуем ключи строки на случай пробелов
          const cleanRow = {};
          Object.keys(row).forEach((k) => {
            cleanRow[k.trim()] = String(row[k]).trim();
          });

          const article = cleanRow['Артикул'] || cleanRow['артикул'] || cleanRow['Article'] || cleanRow['SKU'];
          const name = cleanRow['Название'] || cleanRow['название'] || cleanRow['Name'];
          const category = cleanRow['Категория'] || cleanRow['категория'] || cleanRow['Category'];
          const priceRaw = cleanRow['Цена'] || cleanRow['цена'] || cleanRow['Price'];
          const statusRaw = cleanRow['Статус действия'] || cleanRow['Статус'] || cleanRow['статус'] || cleanRow['Действие'] || cleanRow['Action'];

          // 1. Проверка артикула
          if (!article) {
            errors.push(`Строка ${rowNum} — ошибка: не указан артикул.`);
            return;
          }

          const upperArticle = article.toUpperCase();

          // 2. Проверка статуса действия
          const status = (statusRaw || 'ОБНОВИТЬ').toUpperCase();
          const allowedStatuses = ['ДОБАВИТЬ', 'ОБНОВИТЬ', 'СКРЫТЬ', 'УДАЛИТЬ'];
          if (!allowedStatuses.includes(status)) {
            errors.push(`Строка ${rowNum} — ошибка: неверный статус действия "${statusRaw}". Допустимо: ДОБАВИТЬ, ОБНОВИТЬ, СКРЫТЬ, УДАЛИТЬ.`);
            return;
          }

          // Для удаления товара достаточно только артикула со статусом УДАЛИТЬ
          if (status === 'УДАЛИТЬ') {
            validRows.push({
              rowNum,
              article,
              status: 'УДАЛИТЬ',
              isDelete: true
            });
            return;
          }

          // 3. Проверка названия
          if (!name) {
            errors.push(`Строка ${rowNum} — ошибка: не указано название товара для артикула ${article}.`);
            return;
          }

          // 4. Проверка цены
          const parsedPrice = parseFloat(priceRaw.replace(/[^\d.]/g, ''));
          if (isNaN(parsedPrice) || parsedPrice <= 0) {
            errors.push(`Строка ${rowNum} — ошибка: неверная цена "${priceRaw}". Должно быть положительное число.`);
            return;
          }

          // 5. Проверка категории
          if (!category) {
            errors.push(`Строка ${rowNum} — ошибка: не указана категория для артикула ${article}.`);
            return;
          }

          // Формируем проверенную запись
          const city = cleanRow['Город'] || 'Алматы';
          const stockNum = parseInt(cleanRow['Наличие'] || '0', 10);
          const safeStock = isNaN(stockNum) ? 0 : Math.max(0, stockNum);

          validRows.push({
            rowNum,
            article: article.trim(),
            name: name.trim(),
            category: category.trim(),
            price: parsedPrice,
            currency: cleanRow['Валюта'] || '₸',
            description: cleanRow['Описание'] || '',
            dimensions: cleanRow['Размер'] || '',
            weight: cleanRow['Вес'] || '',
            volume: cleanRow['Объём'] || '',
            specs: cleanRow['Характеристики'] || '',
            photo1: cleanRow['Фотография 1'] || 'images/cat_laute_brand.jpg',
            photo2: cleanRow['Фотография 2'] || '',
            photo3: cleanRow['Фотография 3'] || '',
            city,
            stock: safeStock,
            status: status === 'СКРЫТ' ? 'СКРЫТ' : 'АКТИВЕН',
            actionStatus: status,
            isExisting: existingArticles.has(upperArticle)
          });
        });

        // Подсчёт статистики для предварительного просмотра
        let newCount = 0;
        let updateCount = 0;
        let hideCount = 0;
        let deleteCount = 0;

        validRows.forEach((r) => {
          if (r.actionStatus === 'ДОБАВИТЬ' || (!r.isExisting && r.actionStatus !== 'УДАЛИТЬ')) {
            newCount++;
          } else if (r.actionStatus === 'УДАЛИТЬ') {
            deleteCount++;
          } else if (r.actionStatus === 'СКРЫТ') {
            hideCount++;
          } else {
            updateCount++;
          }
        });

        const stats = {
          totalRows: rawRows.length,
          validCount: validRows.length,
          errorCount: errors.length,
          newCount,
          updateCount,
          hideCount,
          deleteCount
        };

        resolve({
          success: errors.length === 0,
          errors,
          rows: validRows,
          stats
        });
      } catch (err) {
        resolve({
          success: false,
          errors: [`Критическая ошибка чтения Excel файла: ${err.message}`],
          rows: [],
          stats: null
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        errors: ['Не удалось прочитать загруженный файл.'],
        rows: [],
        stats: null
      });
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Применяет проверенные строки импорта к существующему каталогу.
 * КРИТИЧЕСКОЕ ПРАВИЛО БЕЗОПАСНОСТИ:
 * Если товар отсутствует в новом Excel, он НЕ удаляется!
 * Удаление происходит ТОЛЬКО если указано действие УДАЛИТЬ.
 */
export const applyExcelImport = (currentProducts, validatedRows) => {
  const productMap = new Map();
  currentProducts.forEach(p => {
    productMap.set(p.article.trim().toUpperCase(), { ...p });
  });

  validatedRows.forEach((row) => {
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
        price: row.price || existing.price,
        currency: row.currency || existing.currency,
        description: row.description || existing.description,
        dimensions: row.dimensions || existing.dimensions,
        weight: row.weight || existing.weight,
        volume: row.volume || existing.volume,
        specs: row.specs || existing.specs,
        photo1: row.photo1 || existing.photo1,
        photo2: row.photo2 || existing.photo2,
        photo3: row.photo3 || existing.photo3,
        cityStock: updatedCityStock,
        status: row.actionStatus === 'СКРЫТ' ? 'СКРЫТ' : 'АКТИВЕН'
      });
    } else {
      // 3. Новый товар — добавляем
      const newCityStock = {};
      if (row.city) {
        newCityStock[row.city] = row.stock;
      } else {
        newCityStock['Алматы'] = row.stock || 10;
      }

      productMap.set(key, {
        article: row.article,
        name: row.name,
        category: row.category,
        price: row.price,
        currency: row.currency || '₸',
        description: row.description,
        dimensions: row.dimensions,
        weight: row.weight,
        volume: row.volume,
        specs: row.specs,
        photo1: row.photo1 || 'images/cat_laute_brand.jpg',
        photo2: row.photo2 || '',
        photo3: row.photo3 || '',
        cityStock: newCityStock,
        status: row.actionStatus === 'СКРЫТ' ? 'СКРЫТ' : 'АКТИВЕН',
        isPopular: false,
        salesRank: 99,
        viewsCount: 1,
        tags: [row.category.toLowerCase()]
      });
    }
  });

  return Array.from(productMap.values());
};
