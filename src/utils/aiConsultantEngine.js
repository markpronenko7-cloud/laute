/**
 * Интеллектуальный движок AI-Консультанта LAUTE
 * Обеспечивает контекстный многоходовый диалог, анализ потребностей,
 * подбор товаров из живого каталога, учет городов и остатков,
 * сравнение моделей, бизнес-аналитику и базу знаний.
 */

import { LAUTE_KNOWLEDGE_BASE } from '../data/knowledgeBase.js';

/**
 * Нормализует текст для анализа
 */
const normalize = (text) => (text || '').toLowerCase().replace(/ё/g, 'е').trim();

/**
 * Извлекает город из текста
 */
const extractCity = (query) => {
  const q = normalize(query);
  if (q.includes('алмат') || q.includes('almaty')) return 'Алматы';
  if (q.includes('астан') || q.includes('astana') || q.includes('нур-султан')) return 'Астана';
  if (q.includes('новосибирск') || q.includes('новосиб') || q.includes('сибирь')) return 'Новосибирск';
  if (q.includes('москв') || q.includes('moscow')) return 'Москва';
  if (q.includes('шымкент') || q.includes('shymkent')) return 'Шымкент';
  return null;
};

/**
 * Извлекает категорию из текста
 */
const extractCategory = (query) => {
  const q = normalize(query);
  if (q.includes('кухн') || q.includes('мойк') || q.includes('асүй') || q.includes('kitchen')) {
    if (q.includes('мойк') && !q.includes('смесител') && !q.includes('кран')) {
      return 'Кухонные мойки';
    }
    return 'Кухонные смесители';
  }
  if (q.includes('раковин') || q.includes('умывальн') || q.includes('қолжуғыш') || q.includes('basin')) {
    return 'Смесители для раковины';
  }
  if (q.includes('ванн') || q.includes('купани') || q.includes('bath')) {
    if (q.includes('универсальн') || q.includes('350') || q.includes('длинный')) {
      return 'Универсальные смесители (ванна/раковина)';
    }
    return 'Смесители для ванны';
  }
  if (q.includes('душ') || q.includes('стойк') || q.includes('тропическ') || q.includes('колонн') || q.includes('гарнитур')) {
    return 'Душевые системы и гарнитуры';
  }
  if (q.includes('биде') || q.includes('гигиеническ')) {
    return 'Биде и гигиенический душ';
  }
  if (q.includes('картридж')) {
    return 'Картриджи';
  }
  if (q.includes('аэратор')) {
    return 'Аэраторы';
  }
  return null;
};

/**
 * Оценивает товар по запросу пользователя
 */
const scoreProduct = (product, criteria) => {
  let score = 0;
  const pName = normalize(product.name);
  const pDesc = normalize(product.description);
  const pSpecs = normalize(product.specs);
  const pTags = (product.tags || []).map(normalize);

  // 1. Категория
  if (criteria.category && product.category === criteria.category) {
    score += 50;
  }

  // 2. Бюджет
  if (criteria.budget === 'недорогой' || criteria.budget === 'бюджетный' || criteria.budget === 'эконом') {
    if (product.price <= 32000) score += 30;
    else if (product.price <= 40000) score += 10;
  } else if (criteria.budget === 'премиум' || criteria.budget === 'люкс') {
    if (product.price >= 40000) score += 30;
  }

  // 3. Стиль и особенности
  if (criteria.requirements) {
    criteria.requirements.forEach(req => {
      const r = normalize(req);
      if (pTags.includes(r) || pDesc.includes(r) || pSpecs.includes(r) || pName.includes(r)) {
        score += 20;
      }
    });
  }

  // 4. Популярность (бонус за проверенные лидеры продаж)
  if (product.isPopular) {
    score += 15;
  }

  // 5. Наличие в целевом городе
  if (criteria.city && product.cityStock?.[criteria.city] > 0) {
    score += 25;
  }

  return score;
};

/**
 * Основная функция генерации ответа AI-Консультанта
 */
export const processConsultantMessage = ({
  rawQuery,
  currentContext = {},
  products = [],
  lang = 'ru'
}) => {
  const query = rawQuery.trim();
  const q = normalize(query);

  const context = {
    step: currentContext.step || 'idle',
    category: currentContext.category || null,
    style: currentContext.style || null,
    budget: currentContext.budget || null,
    city: currentContext.city || null,
    requirements: currentContext.requirements || [],
    lastProducts: currentContext.lastProducts || [],
    ...currentContext
  };

  // Проверяем указание города в сообщении
  const detectedCity = extractCity(query);
  if (detectedCity) {
    context.city = detectedCity;
  }

  // 1. ПРИВЕТСТВИЕ («Привет», «Здравствуйте», «Добрый день»)
  if (/^(привет|здравствуй|добрый день|доброе утро|добрый вечер|салем|сәлем|hi|hello|hey)[\s!.,?]*$/i.test(q)) {
    return {
      text: lang === 'kz'
        ? 'Сәлеметсіз бе! Мен LAUTE ресми AI-кеңесшісімін. Жобаңызға сәйкес келетін араластырғыштар мен сантехникалық жабдықтарды таңдауға көмектесемін. Қандай өнім іздеп жатырсыз?'
        : lang === 'en'
        ? 'Hello! I am the official LAUTE AI consultant. I will help you select the ideal sanitary fittings and mixers for your project. What are you looking for?'
        : 'Здравствуйте! Я официальный AI-консультант LAUTE. Помогу подобрать надежное оборудование и сантехнику под ваш проект. Что вы сейчас ищете?',
      quickChips: ['Мне нужен смеситель', 'Душевая система', 'Что вы продаёте?', 'О компании LAUTE'],
      recommendedProducts: [],
      newContext: { ...context, step: 'greeting' }
    };
  }

  // 2. БЛАГОДАРНОСТЬ («Спасибо», «Рахмет»)
  if (q.includes('спасибо') || q.includes('благодар') || q.includes('рахмет') || q.includes('thank')) {
    return {
      text: lang === 'kz'
        ? 'Оқасы жоқ! Көмектесуге әрқашан қуаныштымын. Тауарларды салыстыру немесе тапсырыс беру қажет болса — кез келген уақытта жазыңыз!'
        : lang === 'en'
        ? 'You are very welcome! If you need technical specifications, stock verification, or model comparison, feel free to ask.'
        : 'Пожалуйста! Всегда рад помочь. Если понадобятся характеристики, проверка остатков по складам или сравнение моделей — обращайтесь в любое время.',
      quickChips: ['Показать каталог', 'Проверить наличие в Алматы', 'Гарантия и сервис'],
      recommendedProducts: [],
      newContext: context
    };
  }

  // 3. АССОРТИМЕНТ («Что вы продаёте?», «Каталог», «Что есть?»)
  if (q.includes('что вы продаете') || q.includes('что продаете') || q.includes('что есть') || q.includes('ассортимент') || q.includes('продукция') || q.includes('не сатасыздар') || q.includes('что продаёте')) {
    return {
      text: lang === 'kz'
        ? 'LAUTE зауыты еуропалық сапа стандартындағы сантехниканы шығарады:\n\n• Асүй араластырғыштары (ауыз су сүзгісі қосылатын және икемді изливті)\n• Раковина мен ваннаға арналған араластырғыштар (CW617N латунь)\n• Тропикалық жаңбыр душы бар жүйелер\n• Тот баспайтын болаттан жасалған асүй жуғыштары (AISI 304)\n• Фирмалық керамикалық картридждер мен аэраторлар\n\nСізге қай бағытты қарастырған ыңғайлы?'
        : lang === 'en'
        ? 'LAUTE manufactures premium European-standard architectural plumbing:\n\n• Kitchen faucets (filter-connected 2-in-1 and flexible spouts)\n• Basin & bath mixers (solid CW617N brass)\n• Rain shower columns & sets\n• Stainless steel kitchen sinks (AISI 304)\n• Genuine ceramic cartridges & Neoperl aerators\n\nWhich category would you like to explore?'
        : 'LAUTE производит сантехническое оборудование европейского инженерного стандарта из первичной латуни CW617N:\n\n• Кухонные смесители (включая модели с каналом под питьевой фильтр 2в1 и гибким изливом)\n• Смесители для раковины и ванны\n• Душевые системы с тропическим душем\n• Кухонные мойки из нержавеющей стали AISI 304\n• Оригинальные комплектующие (картриджи 500 000 циклов, аэраторы Neoperl)\n\nКакая группа оборудования вам требуется?',
      quickChips: ['Кухонные смесители', 'Смесители для раковины', 'Смесители для ванны', 'Душевые системы'],
      recommendedProducts: [],
      newContext: { ...context, step: 'needs_discovery' }
    };
  }

  // 4. ВОПРОСЫ О КОМПАНИИ, МАТЕРИАЛАХ, ГАРАНТИИ И СЕРВИСЕ
  if (q.includes('материал') || q.includes('латунь') || q.includes('силумин') || q.includes('качество')) {
    return {
      text: `Все корпусные изделия LAUTE отливаются исключительно из первичной сантехнической латуни марки CW617N (содержание свинца <1.6%). Мы категорически не используем вторичный силумин или токсичные примеси. Каждый корпус перед нанесением 12-микронного хромирования проходит гидротестирование давлением 16 бар на заводском стенде.`,
      quickChips: ['Подобрать смеситель', 'Условия гарантии', 'Где купить?'],
      recommendedProducts: [],
      newContext: context
    };
  }

  if (q.includes('гаранти') || q.includes('сервис') || q.includes('ремонт') || q.includes('36 час')) {
    return {
      text: `На продукцию LAUTE действует прямая заводская гарантия:\n• 5 лет — на цельнолитые латунные корпуса смесителей;\n• 2 года — на керамические картриджи, шланги и душевые лейки.\n\nВ компании работает Первый цифровой сервисный центр LAUTE с регламентным временем обработки обращений до 36 рабочих часов. Запасные узлы всегда в наличии на региональных складах.`,
      quickChips: ['Связаться с сервисом', 'Подобрать смеситель', 'Наличие на складах'],
      recommendedProducts: [],
      newContext: context
    };
  }

  // 5. АНАЛИЗ КОНКУРЕНТОВ («Как вы по сравнению с Grohe/Iddis/Lemark?»)
  if (q.includes('grohe') || q.includes('hansgrohe') || q.includes('iddis') || q.includes('lemark') || q.includes('конкурент') || q.includes('сравнить с другими брендами')) {
    return {
      text: `У меня пока нет актуальных данных по конкретным артикулам конкурентов для прямого прейскурантного сопоставления.\n\nОднако с точки зрения инженерии LAUTE обеспечивает строгий паритет с европейскими лидерами:\n• Первичная латунь CW617N;\n• Керамические узлы с ресурсом 500 000 рабочих циклов;\n• Аэраторы Neoperl (Швейцария);\n• 5 лет гарантии.\n\nПри этом за счёт прямого контракта с производителем и оптимизированной логистики в Казахстане и СНГ продукция LAUTE даёт выигрыш по цене до 25–40% при равной надёжности.`,
      quickChips: ['Подобрать смеситель LAUTE', 'Открыть каталог', 'Запросить оптовый прайс'],
      recommendedProducts: [],
      newContext: context
    };
  }

  // 6. БИЗНЕС-АНАЛИТИКА И ОСТАТКИ («Анализ остатков», «Что лучше продаётся?», «Аналитика спроса»)
  if (q.includes('анализ остатков') || q.includes('что лучше продается') || q.includes('лидер продаж') || q.includes('бизнес') || q.includes('спрос') || q.includes('что продвигать')) {
    const populars = products.filter(p => p.isPopular);
    const lowStock = products.filter(p => {
      const total = Object.values(p.cityStock || {}).reduce((a, b) => a + b, 0);
      return total > 0 && total < 30;
    });

    const popText = populars.map(p => `• ${p.name} (арт. ${p.article}) — лидер категории "${p.category}"`).join('\n');
    const lowText = lowStock.slice(0, 3).map(p => `• ${p.name} — суммарный остаток всего ${Object.values(p.cityStock || {}).reduce((a, b) => a + b, 0)} шт.`).join('\n');

    return {
      text: `Аналитическая сводка по номенклатуре LAUTE на основе актуальной базы:\n\n🔥 Хиты продаж с наивысшим спросом:\n${popText}\n\n⚠️ Позиции, требующие пополнения запасов:\n${lowText}\n\nРекомендация: в Алматы и Новосибирске наблюдается стабильно высокий спрос на кухонную серию с фильтром и универсальные смесители 350 мм. Имеет смысл поддерживать неснижаемый запас от 20 шт.`,
      quickChips: ['Посмотреть хиты продаж', 'Экспорт каталога в Excel', 'Оптовые условия'],
      recommendedProducts: populars.slice(0, 3),
      newContext: context
    };
  }

  // 7. СРАВНЕНИЕ ТОВАРОВ («Сравнить эти два смесителя», «Сравни»)
  if (q.includes('сравн') || q.includes('compare') || q.includes('разниц')) {
    let itemA = null;
    let itemB = null;

    // Проверяем, упоминаются ли конкретные артикулы или последние рекомендованные
    if (context.lastProducts && context.lastProducts.length >= 2) {
      itemA = context.lastProducts[0];
      itemB = context.lastProducts[1];
    } else {
      // Ищем два подходящих кухонных или смесителя для раковины
      const pool = products.filter(p => p.status !== 'СКРЫТ');
      itemA = pool.find(p => p.article === 'LT-K101-CHR') || pool[0];
      itemB = pool.find(p => p.article === 'LT-K102-FLT') || pool[1];
    }

    if (itemA && itemB) {
      return {
        text: `Инженерное сравнение моделей LAUTE:\n\n1. ${itemA.name} (${itemA.price?.toLocaleString()} ${itemA.currency}):\n• Размеры: ${itemA.dimensions}\n• Особенность: компактный, экономичный, надёжная классика для небольших моек.\n• Наличие: ${itemA.cityStock?.['Алматы'] || 0} шт. в Алматы.\n\n2. ${itemB.name} (${itemB.price?.toLocaleString()} ${itemB.currency}):\n• Размеры: ${itemB.dimensions}\n• Особенность: высокий излив, встроенный канал под питьевой фильтр 2-в-1.\n• Наличие: ${itemB.cityStock?.['Алматы'] || 0} шт. в Алматы.\n\nВердикт: если питьевой фильтр не требуется или мойка компактная — выбирайте ${itemA.name}. Если нужен современный функционал без врезки отдельного крана для фильтра — оптимален ${itemB.name}.`,
        quickChips: [`Посмотреть ${itemA.article}`, `Посмотреть ${itemB.article}`, 'Открыть сравнение'],
        recommendedProducts: [itemA, itemB],
        triggerComparison: [itemA, itemB],
        newContext: { ...context, step: 'comparing', lastProducts: [itemA, itemB] }
      };
    }
  }

  // 8. ПРОВЕРКА НАЛИЧИЯ ПО ГОРОДУ («Есть ли этот смеситель в Алматы?»)
  if (detectedCity || q.includes('наличи') || q.includes('остат') || q.includes('склад')) {
    const targetCity = detectedCity || context.city || 'Алматы';
    
    // Определяем товар: берем последний рекомендованный или ищем по контексту
    let targetProduct = context.lastProducts?.[0];
    if (!targetProduct) {
      targetProduct = products.find(p => q.includes(normalize(p.article)) || q.includes(normalize(p.name))) || products[0];
    }

    if (targetProduct) {
      const stockInCity = targetProduct.cityStock?.[targetCity] || 0;
      
      if (stockInCity > 0) {
        return {
          text: `Да, товар «${targetProduct.name}» (арт. ${targetProduct.article}) доступен в городе ${targetCity}.\n\n• Текущий остаток на складе: ${stockInCity} шт.\n• Базовая цена: ${targetProduct.price?.toLocaleString()} ${targetProduct.currency}\n• Готовность к отгрузке: в день оформления заявки.`,
          quickChips: [`Посмотреть ${targetProduct.article}`, 'Проверить в Астане', 'Подобрать ещё варианты'],
          recommendedProducts: [targetProduct],
          newContext: { ...context, city: targetCity, lastProducts: [targetProduct] }
        };
      } else {
        // Товара нет в этом городе — подбираем альтернативу, которая есть в наличии!
        const alternative = products.find(p => 
          p.category === targetProduct.category && 
          p.article !== targetProduct.article && 
          (p.cityStock?.[targetCity] || 0) > 0
        );

        let altText = '';
        if (alternative) {
          altText = `\n\nОднако в наличии в городе ${targetCity} есть отличный аналог: «${alternative.name}» (арт. ${alternative.article}) — ${alternative.cityStock[targetCity]} шт. по цене ${alternative.price?.toLocaleString()} ${alternative.currency}.`;
        }

        return {
          text: `Сейчас товара «${targetProduct.name}» нет в наличии на складе в городе ${targetCity} (остаток 0).${altText}\n\nМогу оформить перемещение с центрального склада или подробнее рассказать об аналоге.`,
          quickChips: alternative ? [`Посмотреть ${alternative.article}`, 'Оформить предзаказ', 'Все товары в наличии'] : ['Оформить предзаказ'],
          recommendedProducts: alternative ? [alternative] : [targetProduct],
          newContext: { ...context, city: targetCity, lastProducts: alternative ? [alternative] : [targetProduct] }
        };
      }
    }
  }

  // 9. ОБОБЩЁННЫЙ ЗАПРОС («Мне нужен смеситель», без указания зоны)
  if ((q.includes('смесител') || q.includes('кран') || q.includes('араластырғыш') || q.includes('mixer')) && !context.category) {
    const specificCat = extractCategory(query);
    if (!specificCat) {
      return {
        text: lang === 'kz'
          ? 'Әрине! Смесительді қай аймақ үшін іздеп жатырсыз: асүй, қолжуғыш немесе ванна бөлмесі үшін бе?'
          : lang === 'en'
          ? 'Certainly! Which zone do you need the mixer for: kitchen, washbasin, or bath?'
          : 'Конечно! Помогу выбрать оптимальную модель. Уточните, пожалуйста: вам нужен смеситель для кухни, раковины или ванной комнаты?',
        quickChips: ['Для кухни', 'Для раковины', 'Для ванны', 'Универсальный (ванна/раковина)'],
        recommendedProducts: [],
        newContext: { ...context, step: 'needs_discovery' }
      };
    }
  }

  // 10. УТОЧНЕНИЕ ПОСЛЕ УКАЗАНИЯ ЗОНЫ («Для кухни»)
  if ((q === 'для кухни' || q.includes('кухн')) && context.step === 'needs_discovery' && !context.budget && !context.style) {
    return {
      text: 'Понял, подбираем для кухни! Подскажите, пожалуйста:\n1. Какой стиль вам ближе — современный, минималистичный или классический?\n2. Какой примерно ориентир по бюджету?\n3. Нужны ли дополнительные функции (например, подключение питьевого фильтра, гибкий излив или компактные габариты для небольшой кухни)?',
      quickChips: [
        'Недорогой для маленькой кухни',
        'Под питьевой фильтр 2-в-1',
        'С гибким изливом',
        'Современный минимализм'
      ],
      recommendedProducts: [],
      newContext: { ...context, category: 'Кухонные смесители', step: 'refining' }
    };
  }

  // 11. УМНЫЙ ПОДБОР ТОВАРА (Анализ потребности: категория, бюджет, стиль, размеры)
  // Пример: «Мне нужен недорогой современный смеситель для маленькой кухни»
  let targetCategory = extractCategory(query) || context.category;
  
  // Распознаём бюджет
  let detectedBudget = context.budget;
  if (q.includes('недорог') || q.includes('бюджетн') || q.includes('дешев') || q.includes('эконом') || q.includes('арзан')) {
    detectedBudget = 'недорогой';
  } else if (q.includes('премиум') || q.includes('дорог') || q.includes('люкс') || q.includes('топ')) {
    detectedBudget = 'премиум';
  }

  // Распознаём требования
  const newReqs = [...context.requirements];
  if (q.includes('маленьк') || q.includes('компактн') || q.includes('небольш')) newReqs.push('компактный');
  if (q.includes('фильтр') || q.includes('питьев')) newReqs.push('под фильтр');
  if (q.includes('гибк') || q.includes('силикон')) newReqs.push('гибкий излив');
  if (q.includes('современ') || q.includes('минимализм')) newReqs.push('современный');

  if (targetCategory || q.includes('купить') || q.includes('подобрать') || q.includes('посоветуй') || q.includes('выбрать') || detectedBudget || newReqs.length > 0) {
    const finalCategory = targetCategory || 'Кухонные смесители';
    const criteria = {
      category: finalCategory,
      budget: detectedBudget,
      requirements: newReqs,
      city: context.city || 'Алматы'
    };

    // Фильтруем и ранжируем товары
    const activeProducts = products.filter(p => p.status !== 'СКРЫТ');
    const scoredList = activeProducts.map(p => ({
      product: p,
      score: scoreProduct(p, criteria)
    })).sort((a, b) => b.score - a.score);

    const topMatches = scoredList.slice(0, 3).map(item => item.product);

    if (topMatches.length > 0) {
      let analysisSummary = `По вашему запросу я проанализировал ассортимент LAUTE:\n• Категория: ${finalCategory}\n`;
      if (detectedBudget) analysisSummary += `• Бюджетный ориентир: ${detectedBudget === 'недорогой' ? 'оптимальная доступная цена' : 'премиум сегмент'}\n`;
      if (newReqs.length > 0) analysisSummary += `• Требования: ${newReqs.join(', ')}\n`;
      if (context.city) analysisSummary += `• Город проверки: ${context.city}\n`;

      analysisSummary += `\nРекомендую 3 наиболее сбалансированных варианта:\n\n`;

      topMatches.forEach((p, idx) => {
        let badge = idx === 0 ? '🏆 Лучший по цене и назначению' : idx === 1 ? '⭐ Оптимальный выбор' : '💎 Премиальный вариант';
        if (p.isPopular) badge += ' (Хит продаж)';
        analysisSummary += `${idx + 1}. ${p.name} (арт. ${p.article}) — ${p.price?.toLocaleString()} ${p.currency}\n   ${badge}\n   ${p.dimensions || ''}\n\n`;
      });

      analysisSummary += 'Вы можете открыть карточку любого товара для просмотра чертежа и фото, либо нажать «Сравнить», чтобы сопоставить их характеристики:';

      return {
        text: analysisSummary,
        quickChips: [
          `Сравнить ${topMatches[0]?.article} и ${topMatches[1]?.article}`,
          `Наличие в ${context.city || 'Алматы'}`,
          'Перейти в каталог'
        ],
        recommendedProducts: topMatches,
        newContext: {
          ...context,
          category: finalCategory,
          budget: detectedBudget,
          requirements: newReqs,
          step: 'recommending',
          lastProducts: topMatches
        }
      };
    }
  }

  // 12. ДЕФОЛТНЫЙ ИНТЕЛЛЕКТУАЛЬНЫЙ ОТВЕТ (Всегда полезен, ведет диалог)
  const defaultPicks = products.filter(p => p.isPopular).slice(0, 2);
  return {
    text: `Я могу помочь подобрать сантехнику LAUTE под ваши задачи:\n• Смесители для кухни (включая модели под фильтр 2-в-1)\n• Смесители для раковины и ванны\n• Душевые стойки с тропическим душем\n• Проверить наличие на складах в Алматы, Астане, Новосибирске и Москве\n\nНапишите, что именно вы ищете или какой параметр для вас важнее всего?`,
    quickChips: ['Мне нужен смеситель для кухни', 'Душевая система', 'Проверить наличие в Алматы', 'Что вы продаёте?'],
    recommendedProducts: defaultPicks,
    newContext: context
  };
};
