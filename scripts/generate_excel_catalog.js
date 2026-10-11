import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DEFAULT_PRODUCTS, CATEGORY_NAMES } from '../src/data/catalogData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createCatalogExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'LAUTE Sanitary Systems';
  workbook.lastModifiedBy = 'LAUTE Catalog Management';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Colors
  const BRAND_DARK = 'FF0F172A'; // Slate 900
  const BRAND_BLUE = 'FF1E293B'; // Slate 800
  const BRAND_ACCENT = 'FF2563EB'; // Blue 600
  const HEADER_FILL = 'FF1E293B';
  const REQ_FILL = 'FF0F172A';
  const LIGHT_ROW = 'FFF8FAFC';
  const BORDER_COLOR = 'FFE2E8F0';

  // -------------------------------------------------------------
  // 1. ЛИСТ: «Инструкция»
  // -------------------------------------------------------------
  const wsHelp = workbook.addWorksheet('Инструкция', {
    views: [{ showGridLines: true }]
  });

  wsHelp.columns = [
    { width: 5 },
    { width: 28 },
    { width: 65 },
    { width: 30 }
  ];

  // Title
  wsHelp.mergeCells('B2:D2');
  const titleCell = wsHelp.getCell('B2');
  titleCell.value = 'ИНСТРУКЦИЯ ПО УПРАВЛЕНИЮ КАТАЛОГОМ LAUTE (EXCEL)';
  titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_DARK } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  wsHelp.getRow(2).height = 40;

  // Subtitle
  wsHelp.mergeCells('B3:D3');
  const subCell = wsHelp.getCell('B3');
  subCell.value = 'Официальный регламент заполнения номенклатуры для сотрудников и контент-менеджеров LAUTE';
  subCell.font = { name: 'Segoe UI', size: 11, italic: true, color: { argb: 'FF64748B' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  wsHelp.getRow(3).height = 25;

  const instructions = [
    ['1. Идентификатор SKU', 'Артикул (SKU) — единственный уникальный ключ товара. Никогда не меняйте артикул у существующего товара без согласования. По артикулу система понимает, какой товар обновить.', 'Обязательное поле. Формат: LT-XXXX-YYY'],
    ['2. Добавление товара', 'Чтобы добавить новый товар, напишите новый уникальный артикул, заполните название, категорию, цену и выберите Статус действия = ДОБАВИТЬ.', 'Если артикула еще нет в базе, он создается автоматически.'],
    ['3. Обновление товара', 'Чтобы изменить цену, описание, фото или характеристики — измените нужную ячейку и оставьте Статус действия = ОБНОВИТЬ.', 'Товары, отсутствующие в файле, НЕ удаляются из каталога!'],
    ['4. Скрытие товара', 'Чтобы временно скрыть товар с витрины сайта (нет в наличии, снят с производства), установите Статус действия = СКРЫТЬ или Статус товара = СКРЫТ.', 'Товар сохранится в базе, но не будет виден покупателям.'],
    ['5. Удаление товара', 'Для полного удаления товара установите Статус действия = УДАЛИТЬ. Будьте осторожны: удаление фиксируется в журнале изменений.', 'Администратор может восстановить товар через историю бэкапов.'],
    ['6. Цены и валюта', 'Указывайте цену только цифрами (например, 28900). Не пишите буквы и пробелы в ячейке цены. Валюта выбирается из списка (₸, ₽, $, €).', 'По умолчанию: ₸ (тенге)'],
    ['7. Категории и списки', 'Используйте выпадающие списки в колонках. Значения берутся из листа «Справочники». Это защищает от опечаток в фильтрах каталога.', 'Не меняйте названия категорий вручную.'],
    ['8. Фотографии', 'Указывайте пути к файлам на сервере (например, images/cat_kitchen.png) или ссылки. Можно загрузить фото прямо через панель управления.', 'Если поле оставить пустым при обновлении, старое фото сохранится.'],
    ['9. Защита от дублей', 'Система проверяет уникальность артикулов перед импортом. Повторный импорт одного и того же файла ничего не испортит и не создаст дублей.', 'Предпросмотр покажет 0 изменений.'],
    ['10. Предпросмотр', 'Перед реальным применением файла на сайте админ-панель покажет отчёт: сколько добавлено, обновлено, скрыто и детальный список ошибок.', 'Ошибочные строки не попадут в базу.']
  ];

  let curRow = 5;
  // Header row
  wsHelp.getCell(`B${curRow}`).value = 'ШАГ / ПРАВИЛО';
  wsHelp.getCell(`C${curRow}`).value = 'ОПИСАНИЕ И ДЕЙСТВИЕ';
  wsHelp.getCell(`D${curRow}`).value = 'ВАЖНЫЕ ПРИМЕЧАНИЯ';
  ['B', 'C', 'D'].forEach(col => {
    const c = wsHelp.getCell(`${col}${curRow}`);
    c.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_BLUE } };
    c.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    c.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };
  });
  wsHelp.getRow(curRow).height = 28;

  instructions.forEach(([step, desc, notes], idx) => {
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
      if (idx % 2 === 1) {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_ROW } };
      }
    });
    wsHelp.getRow(curRow).height = 42;
  });

  // -------------------------------------------------------------
  // 2. ЛИСТ: «Справочники»
  // -------------------------------------------------------------
  const wsRef = workbook.addWorksheet('Справочники');
  wsRef.columns = [
    { header: 'Категории', key: 'categories', width: 35 },
    { header: 'Валюты', key: 'currencies', width: 12 },
    { header: 'Статусы товара', key: 'statuses', width: 18 },
    { header: 'Статусы действия', key: 'actions', width: 22 },
    { header: 'Цвета', key: 'colors', width: 24 },
    { header: 'Покрытия', key: 'finishes', width: 24 },
    { header: 'Тип установки', key: 'installTypes', width: 30 },
    { header: 'Материалы', key: 'materials', width: 32 }
  ];

  // Style header row
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
    colors: ['Хром глянец', 'Матовый черный', 'Матовый графит', 'Брашированное золото', 'Белый матовый', 'Нержавеющая сталь'],
    finishes: ['Гальванический хром', 'PVD-покрытие устойчивое к царапинам', 'Порошковая полимерная эмаль', 'Сатинированная шлифовка'],
    installTypes: ['Врезной на мойку / умывальник', 'Настенный наружный монтаж', 'Скрытый встраиваемый монтаж (i-Box)', 'Напольный отдельностоящий'],
    materials: ['Первичная латунь CW617N (евростандарт)', 'Пищевая нержавеющая сталь AISI 304', 'Пищевой силикон Soft-Flex', 'Керамика оксид алюминия Al2O3']
  };

  const maxRows = Math.max(...Object.values(refData).map(arr => arr.length));
  for (let i = 0; i < maxRows; i++) {
    const row = wsRef.addRow({
      categories: refData.categories[i] || '',
      currencies: refData.currencies[i] || '',
      statuses: refData.statuses[i] || '',
      actions: refData.actions[i] || '',
      colors: refData.colors[i] || '',
      finishes: refData.finishes[i] || '',
      installTypes: refData.installTypes[i] || '',
      materials: refData.materials[i] || ''
    });
    row.height = 22;
    row.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: BORDER_COLOR } },
        bottom: { style: 'thin', color: { argb: BORDER_COLOR } }
      };
    });
  }

  // -------------------------------------------------------------
  // 3. ЛИСТ: «Категории»
  // -------------------------------------------------------------
  const wsCat = workbook.addWorksheet('Категории');
  wsCat.columns = [
    { header: 'Код группы', key: 'code', width: 14 },
    { header: 'Основная категория', key: 'category', width: 34 },
    { header: 'Подкатегории', key: 'subcategories', width: 45 },
    { header: 'Типичные характеристики для категории', key: 'specs', width: 60 }
  ];

  wsCat.getRow(1).height = 30;
  wsCat.getRow(1).eachCell((cell) => {
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_BLUE } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const categoriesDetail = [
    { code: 'LT-K', category: 'Кухонные смесители', subcategories: 'Стандартные 360°, Под фильтр 2в1, С гибким изливом', specs: 'Высота излива, угол поворота (360°), диаметр картриджа (35мм), тип аэратора Neoperl' },
    { code: 'LT-B', category: 'Смесители для раковины', subcategories: 'Низкие врезные, Высокие для накладных чаш, Сенсорные', specs: 'Высота струи, вылет излива, картридж Kerox 28/35мм, донный клапан Click-Clack' },
    { code: 'LT-V', category: 'Смесители для ванны', subcategories: 'Настенные монолитные, С длинным поворотным изливом', specs: 'Межосевое расстояние 150 мм, тип дивертора (нажимной/поворотный), эксцентрики с шумопоглотителем' },
    { code: 'LT-U', category: 'Универсальные смесители (ванна/раковина)', subcategories: 'С плоским изливом 350мм, С круглой трубкой 300мм', specs: 'Длина излива (350 мм), угол поворота, душевой гарнитур в комплекте' },
    { code: 'LT-S', category: 'Душевые системы и гарнитуры', subcategories: 'Душевые колонны с тропическим душем, Душевые стойки', specs: 'Диаметр верхнего диска (250мм), телескопическая штанга (850-1250мм), режимы лейки, защита Easy-Clean' },
    { code: 'LT-W', category: 'Кухонные мойки', subcategories: 'Врезные, Интегрированные/подстольные, Двухчашевые', specs: 'Марка стали AISI 304, толщина полки/чаши (3.0/1.2мм), глубина чаши (210мм), шумоизоляция' },
    { code: 'LT-H', category: 'Биде и гигиенический душ', subcategories: 'Скрытого монтажа, Наружные смесители для биде', specs: 'Глубина встраивания (45-65мм), длина шланга (1.2м), клапан принудительного закрытия' },
    { code: 'LT-C', category: 'Картриджи', subcategories: 'Керамические 35 мм, Керамические 40 мм, Термостатические', specs: 'Диаметр корпуса, высота, размер штока под ручку, ресурс циклов (500 000)' },
    { code: 'LT-A', category: 'Аэраторы', subcategories: 'Поворотные шарнирные M24, Внутренняя резьба F22', specs: 'Резьба, расход воды (л/мин), защита от известкового налёта' }
  ];

  categoriesDetail.forEach((c) => {
    const row = wsCat.addRow(c);
    row.height = 26;
    row.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: BORDER_COLOR } },
        bottom: { style: 'thin', color: { argb: BORDER_COLOR } }
      };
    });
  });

  // -------------------------------------------------------------
  // 4. ЛИСТ: «Товары» (Основная рабочая таблица)
  // -------------------------------------------------------------
  const wsProducts = workbook.addWorksheet('Товары', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  const productColumns = [
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

  wsProducts.columns = productColumns;
  wsProducts.autoFilter = { from: 'A1', to: 'Y1' };

  // Style header row of «Товары»
  const headerRow = wsProducts.getRow(1);
  headerRow.height = 36;
  headerRow.eachCell((cell, colNum) => {
    const colDef = productColumns[colNum - 1];
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

  // Populate with DEFAULT_PRODUCTS
  DEFAULT_PRODUCTS.forEach((p, idx) => {
    const photosStr = [p.photo1, p.photo2, p.photo3].filter(Boolean).join(', ');
    const row = wsProducts.addRow({
      article: p.article,
      name: p.name,
      category: p.category,
      subcategory: p.category.includes('Кухонные') ? 'С поворотным изливом' : p.category.includes('Душевые') ? 'Душевая колонна' : 'Стандарт',
      collection: 'LAUTE Master Line',
      brand: 'LAUTE',
      description: p.description,
      price: p.price,
      currency: p.currency || '₸',
      material: 'Первичная латунь CW617N (евростандарт)',
      color: 'Хром глянец',
      finish: 'Гальванический хром',
      installType: p.category.includes('ванны') || p.category.includes('Универсальные') ? 'Настенный наружный монтаж' : 'Врезной на мойку / умывальник',
      purpose: p.category,
      dimensions: p.dimensions || '',
      weight: p.weight || '',
      volume: p.volume || '',
      specs: p.specs || '',
      photos: photosStr,
      status: p.status || 'АКТИВЕН',
      seoTitle: `${p.name} — купить от официального производителя LAUTE`,
      seoDesc: `${p.name}: проверенное качество, латунь CW617N, официальная заводская гарантия 5 лет.`,
      url: `/catalog#${p.article}`,
      actionStatus: 'ОБНОВИТЬ',
      extraSpecs: ''
    });

    row.height = 26;
    row.eachCell((cell, colNum) => {
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

  // Add Data Validations for rows 2 to 500 on «Товары»
  for (let r = 2; r <= 500; r++) {
    // Column C: Категория -> =Справочники!$A$2:$A$15
    wsProducts.getCell(`C${r}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['Справочники!$A$2:$A$15'],
      showErrorMessage: true,
      errorTitle: 'Недопустимая категория',
      error: 'Пожалуйста, выберите категорию из выпадающего списка листа Справочники.'
    };

    // Column I: Валюта -> =Справочники!$B$2:$B$5
    wsProducts.getCell(`I${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['Справочники!$B$2:$B$5'],
      showErrorMessage: true,
      errorTitle: 'Неверная валюта',
      error: 'Выберите валюту: ₸, ₽, $, €'
    };

    // Column T: Статус товара -> =Справочники!$C$2:$C$3
    wsProducts.getCell(`T${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['Справочники!$C$2:$C$3']
    };

    // Column X: Статус действия -> =Справочники!$D$2:$D$5
    wsProducts.getCell(`X${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['Справочники!$D$2:$D$5'],
      showErrorMessage: true,
      errorTitle: 'Неверный статус действия',
      error: 'Допустимо: ОБНОВИТЬ, ДОБАВИТЬ, СКРЫТЬ, УДАЛИТЬ'
    };

    // Column J: Материал
    wsProducts.getCell(`J${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['Справочники!$H$2:$H$5']
    };

    // Column K: Цвет
    wsProducts.getCell(`K${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['Справочники!$E$2:$E$7']
    };
  }

  // -------------------------------------------------------------
  // 5. ЛИСТ: «Примеры»
  // -------------------------------------------------------------
  const wsExamples = workbook.addWorksheet('Примеры', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  wsExamples.columns = productColumns;
  const exHeaderRow = wsExamples.getRow(1);
  exHeaderRow.height = 36;
  exHeaderRow.eachCell((cell, colNum) => {
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const demoExamples = [
    {
      article: 'LT-DEMO-KITCHEN',
      name: '[ДЕМО-ПРИМЕР] Смеситель для демонстрации заполнения',
      category: 'Кухонные смесители',
      subcategory: 'С гибким изливом',
      collection: 'Excellence Pro',
      brand: 'LAUTE',
      description: 'Это демонстрационный пример заполнения. Такие строки с [ДЕМО] или на листе «Примеры» игнорируются при загрузке на сайт.',
      price: 35000,
      currency: '₸',
      material: 'Первичная латунь CW617N (евростандарт)',
      color: 'Матовый черный',
      finish: 'PVD-покрытие устойчивое к царапинам',
      installType: 'Врезной на мойку / умывальник',
      purpose: 'Кухонные смесители',
      dimensions: 'Высота: 320 мм, вылет: 210 мм',
      weight: '2.1 кг',
      volume: '0.008 м³',
      specs: 'Картридж 35мм, аэратор Neoperl, гибкий шланг Soft-Flex',
      photos: 'images/cat_kitchen.png',
      status: 'АКТИВЕН',
      seoTitle: 'Демонстрационный смеситель LAUTE',
      seoDesc: 'Пример правильного заполнения SEO описания',
      url: '/catalog#demo',
      actionStatus: 'ДОБАВИТЬ',
      extraSpecs: 'Давление 16 бар'
    },
    {
      article: 'LT-DEMO-BATH',
      name: '[ДЕМО-ПРИМЕР] Смеситель для ванны (образец)',
      category: 'Смесители для ванны',
      subcategory: 'Настенные',
      collection: 'Nordic Clean',
      brand: 'LAUTE',
      description: 'Демонстрация заполнения характеристик для категории настенных смесителей.',
      price: 29900,
      currency: '₸',
      material: 'Первичная латунь CW617N (евростандарт)',
      color: 'Хром глянец',
      finish: 'Гальванический хром',
      installType: 'Настенный наружный монтаж',
      purpose: 'Смесители для ванны',
      dimensions: 'Межосевое: 150 мм',
      weight: '1.9 кг',
      volume: '0.007 м³',
      specs: 'Керамический дивертор, шумопоглощающие эксцентрики',
      photos: 'images/cat_bath.png',
      status: 'АКТИВЕН',
      seoTitle: 'Смеситель для ванны LAUTE образец',
      seoDesc: 'Пример мета-описания',
      url: '/catalog#demo-bath',
      actionStatus: 'ОБНОВИТЬ',
      extraSpecs: 'В комплекте шланг 1.5м'
    }
  ];

  demoExamples.forEach((ex) => {
    const row = wsExamples.addRow(ex);
    row.height = 26;
    row.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.alignment = { vertical: 'middle' };
    });
  });

  // Save workbook to both root and public directory
  const rootPath = path.resolve(__dirname, '..', 'LAUTE_Catalog.xlsx');
  const publicPath = path.resolve(__dirname, '..', 'public', 'LAUTE_Catalog.xlsx');

  await workbook.xlsx.writeFile(rootPath);
  await workbook.xlsx.writeFile(publicPath);

  console.log('✅ Файл LAUTE_Catalog.xlsx успешно создан:');
  console.log('  -> ' + rootPath);
  console.log('  -> ' + publicPath);
}

createCatalogExcel().catch(err => {
  console.error('❌ Ошибка при создании Excel:', err);
  process.exit(1);
});
