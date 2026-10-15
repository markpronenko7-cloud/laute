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
 * Скачивает официальный Excel-шаблон LAUTE_Catalog.xlsx со всеми справочниками и стилями
 */
export const downloadExcelTemplate = () => {
  // Проверяем доступность через API или статический файл в public
  const staticPath = window.location.pathname.includes('/laute') ? '/laute/LAUTE_Catalog.xlsx' : '/LAUTE_Catalog.xlsx';
  const link = document.createElement('a');
  link.href = staticPath;
  link.download = 'LAUTE_Catalog.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

