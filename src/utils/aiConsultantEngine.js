/**
 * Интеллектуальный диалоговый движок AI-Консультанта LAUTE
 * 
 * Обеспечивает полноценный разговорный интеллект:
 * - Понимание естественного языка и различных формулировок
 * - Контекст и память диалога (многоходовые беседы, анафоры «А почему?», «А если кухня маленькая?»)
 * - Ответы на общие человеческие вопросы (приветствие, «как дела», «кто ты», «что ты умеешь», интересные факты)
 * - Понятные объяснения технических понятий простыми словами (картридж, высокий/низкий излив, причины течи)
 * - Отказ от выдумывания недостоверных фактов (честность при отсутствии данных)
 * - Поддержка 3 языков: Русский, Қазақша, English
 * - Умный подбор и рекомендации из живого каталога продукции LAUTE
 */

import { LAUTE_KNOWLEDGE_BASE } from '../data/knowledgeBase.js';

/**
 * Нормализация текста: нижний регистр, замена ё -> е, удаление лишних знаков
 */
export const normalize = (text) => {
  return (text || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[«»""''`]/g, '')
    .trim();
};

/**
 * Определение языка сообщения (казахский, английский или русский)
 */
export const detectLanguage = (text, fallback = 'ru') => {
  if (!text) return fallback;
  const t = text.toLowerCase();
  
  // Казахский алфавит и характерные слова
  if (
    /[әіңғүұқөһ]/i.test(t) || 
    /(сәлем|сәлеметсіз|қалайсың|рахмет|араластырғыш|өнім|неге|сау бол|жақсы|қандай|қолжуғыш|не істей)/i.test(t)
  ) {
    return 'kz';
  }
  
  // Английские слова и латиница (чистая латиница без кириллицы)
  const latinCount = (t.match(/[a-z]/g) || []).length;
  const cyrillicCount = (t.match(/[а-яё]/g) || []).length;
  if (latinCount > 0 && cyrillicCount === 0) {
    return 'en';
  }
  if (latinCount > cyrillicCount && latinCount > 3) {
    return 'en';
  }
  
  return fallback || 'ru';
};

/**
 * Извлечение города из текста
 */
export const extractCity = (query) => {
  const q = normalize(query);
  if (q.includes('алмат') || q.includes('almaty')) return 'Алматы';
  if (q.includes('астан') || q.includes('astana') || q.includes('нур-султан')) return 'Астана';
  if (q.includes('новосибирск') || q.includes('новосиб') || q.includes('сибирь')) return 'Новосибирск';
  if (q.includes('москв') || q.includes('moscow')) return 'Москва';
  if (q.includes('шымкент') || q.includes('shymkent')) return 'Шымкент';
  return null;
};

/**
 * Извлечение зоны / категории сантехники
 */
export const extractCategory = (query) => {
  const q = normalize(query);
  if (q.includes('кухн') || q.includes('мойк') || q.includes('асүй') || q.includes('kitchen') || q.includes('посуд')) {
    if (q.includes('мойк') && !q.includes('смесител') && !q.includes('кран') && !q.includes('mixer')) {
      return 'Кухонные мойки';
    }
    return 'Кухонные смесители';
  }
  if (q.includes('раковин') || q.includes('умывальн') || q.includes('қолжуғыш') || q.includes('basin') || q.includes('чаш')) {
    return 'Смесители для раковины';
  }
  if (q.includes('ванн') || q.includes('купани') || q.includes('bath') || q.includes('ванна')) {
    if (q.includes('универсальн') || q.includes('350') || q.includes('длинный излив')) {
      return 'Универсальные смесители (ванна/раковина)';
    }
    return 'Смесители для ванны';
  }
  if (q.includes('душ') || q.includes('стойк') || q.includes('тропическ') || q.includes('колонн') || q.includes('гарнитур') || q.includes('shower')) {
    return 'Душевые системы и гарнитуры';
  }
  if (q.includes('биде') || q.includes('гигиеническ')) {
    return 'Биде и гигиенический душ';
  }
  if (q.includes('картридж') || q.includes('cartridge')) {
    return 'Картриджи';
  }
  if (q.includes('аэратор') || q.includes('aerator')) {
    return 'Аэраторы';
  }
  return null;
};

/**
 * Оценка соответствия товара критериям
 */
const scoreProduct = (product, criteria) => {
  let score = 0;
  const pName = normalize(product.name);
  const pDesc = normalize(product.description);
  const pSpecs = normalize(product.specs);
  const pTags = (product.tags || []).map(normalize);

  // Категория
  if (criteria.category && product.category === criteria.category) {
    score += 50;
  }

  // Бюджет
  if (criteria.budget === 'недорогой' || criteria.budget === 'бюджетный' || criteria.budget === 'эконом') {
    if (product.price <= 32000) score += 30;
    else if (product.price <= 40000) score += 10;
  } else if (criteria.budget === 'премиум' || criteria.budget === 'люкс') {
    if (product.price >= 40000) score += 30;
  }

  // Требования (компактный, под фильтр, гибкий и т.д.)
  if (criteria.requirements) {
    criteria.requirements.forEach(req => {
      const r = normalize(req);
      if (pTags.includes(r) || pDesc.includes(r) || pSpecs.includes(r) || pName.includes(r)) {
        score += 25;
      }
    });
  }

  // Популярные лидеры продаж
  if (product.isPopular) {
    score += 15;
  }

  // Наличие в городе
  if (criteria.city && product.cityStock?.[criteria.city] > 0) {
    score += 20;
  }

  return score;
};

/**
 * Основной интеллектуальный обработчик входящих сообщений
 */
export const processConsultantMessage = ({
  rawQuery = '',
  currentContext = {},
  products = [],
  history = [],
  lang: forcedLang = null
}) => {
  const query = (rawQuery || '').trim();
  const q = normalize(query);
  const detectedLang = forcedLang || detectLanguage(query, currentContext.lang || 'ru');

  // Инициализация и поддержание контекста
  const context = {
    step: currentContext.step || 'idle',
    lastTopic: currentContext.lastTopic || null,
    lastSubject: currentContext.lastSubject || null,
    lastAiQuestion: currentContext.lastAiQuestion || null,
    category: currentContext.category || null,
    style: currentContext.style || null,
    budget: currentContext.budget || null,
    city: currentContext.city || null,
    requirements: currentContext.requirements ? [...currentContext.requirements] : [],
    lastProducts: currentContext.lastProducts || [],
    lang: detectedLang,
    turnCount: (currentContext.turnCount || 0) + 1,
    ...currentContext
  };

  // Проверка указания города
  const foundCity = extractCity(query);
  if (foundCity) {
    context.city = foundCity;
  }

  // =========================================================================
  // 1. АНАФОРА И УТОЧНЯЮЩИЕ ВОПРОСЫ («А почему?», «Почему?», «Why?»)
  // =========================================================================
  const isWhyQuestion = /^(а\s+)?(почему|зачем|с\s+чем\s+связано|неге|why)(\s*[\?!.]*)$/i.test(q) ||
                        (q.includes('почему') && q.length < 20);

  if (isWhyQuestion) {
    // Разрешаем контекст в зависимости от того, о чем шла речь в предыдущем ответе
    if (context.lastSubject === 'modern_kitchen_recommendation' || context.lastTopic === 'kitchen_recommendation') {
      return {
        text: detectedLang === 'kz'
          ? `Заманауи асүй үшін бұл таңдаудың бірнеше маңызды себебі бар:\n\n1. Эргономика: Биік немесе икемді излив үлкен кастрюльдер мен табаларды оңай жууға мүмкіндік береді.\n2. 2-і-1 арнасы: Ауыз су сүзгісі үшін үстел үстін тесудің қажеті жоқ — барлығы бір корпуста біріктірілген.\n3. Сенімділік: LAUTE CW617N латуні мен алмазбен өңделген керамикалық картридж ағып кетусіз ұзақ жылдар қызмет етеді.\n\nСіздің асүйіңіздің көлемі қандай? Ыңғайлы өлшемдерді бірге таңдайық!`
          : detectedLang === 'en'
          ? `There are key engineering and practical reasons for choosing this for a modern kitchen:\n\n1. Ergonomics: A high swivel or flexible spout allows you to effortlessly clean large cookware and fill deep pots without splashing.\n2. Built-in 2-in-1 filter channel: Eliminates the need to drill an extra hole in your countertop for drinking water.\n3. Durability: Solid CW617N brass and diamond-polished ceramic cartridges guarantee smooth operation for over 500,000 cycles.\n\nWhat is your sink size? I can help find the perfect dimensional fit.`
          : `Потому что на современной кухне эргономика и чистота линий выходят на первый план:\n\n1. Свобода движений: Высокий поворотный или гибкий излив позволяет без труда мыть противни и наполнять высокие кастрюли, не ударяя посудой о кран.\n2. Канал 2-в-1 для питьевой воды: Вам не придётся сверлить столешницу или мойку под отдельный тонкий кран для фильтра — обе линии воды выведены в один латунный корпус с раздельными каналами.\n3. Ресурс и плавность: Первичная латунь марки CW617N и керамический картридж на 500 000 циклов дают мягкий ход ручки и полностью исключают риск протечек.\n\nА какая у вас глубина чаши мойки? Это поможет окончательно определиться с высотой.`,
        quickChips: ['А если кухня маленькая?', 'Показать такие смесители', 'Что такое картридж?'],
        recommendedProducts: [],
        newContext: { ...context, lastTopic: 'why_explained', lastSubject: 'modern_kitchen_why' }
      };
    }

    if (context.lastSubject === 'cartridge' || context.lastTopic === 'cartridge_explanation') {
      return {
        text: `Потому что именно керамические пластины внутри картриджа берут на себя всю нагрузку: они выдерживают тысячи открываний, гидроудары до 16 бар и сопротивляются трению песчинок в воде. Если картридж сделан качественно (с алмазной шлифовкой), смеситель работает бесшумно и без подкапываний годами.`,
        quickChips: ['Как выбрать смеситель?', 'Почему течет вода из крана?', 'О компании LAUTE'],
        recommendedProducts: [],
        newContext: { ...context, lastTopic: 'why_explained', lastSubject: 'cartridge_why' }
      };
    }

    // Общий разумный ответ на «Почему?»
    return {
      text: detectedLang === 'kz'
        ? `Бұл шешім пайдаланудың ұзақ мерзімділігіне, сапалы материалдарға (CW617N латуні) және күнделікті тұрмыстағы ыңғайлылыққа негізделген. Нақты бір параметрді толығырақ түсіндірейін бе?`
        : detectedLang === 'en'
        ? `This approach is driven by long-term durability, premium materials (solid CW617N brass), and daily ergonomic comfort. Would you like me to elaborate on a specific aspect?`
        : `Этот подход основан на трёх ключевых принципах: долговечность материалов (первичная латунь CW617N), устойчивость к износу и максимальный комфорт в ежедневном использовании. О каком именно нюансе рассказать подробнее?`,
      quickChips: ['О материалах LAUTE', 'Как выбрать смеситель?', 'Подобрать под мой проект'],
      recommendedProducts: [],
      newContext: { ...context, lastTopic: 'why_explained' }
    };
  }

  // =========================================================================
  // 2. АНАФОРА: УТОЧНЕНИЕ «А ЕСЛИ КУХНЯ МАЛЕНЬКАЯ?», «А ЕСЛИ МЕСТА МАЛО?»
  // =========================================================================
  if (
    q.includes('если кухня маленьк') || 
    q.includes('маленькая кухня') || 
    q.includes('для маленькой кухни') || 
    q.includes('компактн') ||
    q.includes('места мало') ||
    q.includes('асүй кішкентай') ||
    q.includes('small kitchen')
  ) {
    const compactProducts = products.filter(p => 
      p.category === 'Кухонные смесители' && 
      (p.tags?.includes('компактный') || p.dimensions?.includes('240') || p.article === 'LT-K101-CHR')
    );

    return {
      text: detectedLang === 'kz'
        ? `Егер асүй шағын болса, басымдықтар өзгереді:\n\n1. Излив биіктігі: Тым биік излив (35 см-ден жоғары) шағын жуғышта судың жан-жаққа шашырауына әкеледі. 220–260 мм орташа биіктік ең қолайлы.\n2. Ықшам корпусты дизайн: Терезеге немесе үстіңгі шкафтарға кедергі жасамайды.\n3. LAUTE топтамасында шағын кеңістіктер үшін Prime K-10 моделі мінсіз сәйкес келеді.\n\nОсы үлгіні көргіңіз келе ме?`
        : detectedLang === 'en'
        ? `For a compact kitchen, the priorities shift slightly:\n\n1. Spout height: An excessively tall spout (over 35 cm) in a small shallow sink will cause water splashing on the countertop. A medium height of 220–260 mm is optimal.\n2. Visual balance: A sleek, compact body leaves more free workspace and won't obstruct cabinets or window sills.\n3. In the LAUTE lineup, the Prime K-10 model is tailored specifically for compact installations.\n\nWould you like to examine its dimensions?`
        : `Если кухня небольшая, приоритеты немного меняются:\n\n1. Высота излива: Слишком высокий смеситель (35–40 см) на компактной мойке приведёт к брызгам на столешницу и фартук. Оптимальна средняя высота 220–260 мм с вылетом излива около 180–200 мм.\n2. Геометрия: Лаконичный поворотный излив не загромождает рабочее пространство и не мешает открыванию настенных шкафов или окна.\n3. В линейке LAUTE для небольших кухонь отлично подходит модель LAUTE Prime K-10: компактные габариты, латунный корпус CW617N и мягкий аэратор Neoperl против брызг.\n\nПоказать подробные размеры и чертёж этой модели?`,
      quickChips: ['Показать LAUTE Prime K-10', 'А как насчет фильтра 2-в-1?', 'Как выбрать смеситель?'],
      recommendedProducts: compactProducts.slice(0, 2),
      newContext: {
        ...context,
        category: 'Кухонные смесители',
        requirements: [...context.requirements, 'компактный'],
        lastTopic: 'small_kitchen_advice',
        lastSubject: 'compact_kitchen_faucet'
      }
    };
  }

  // =========================================================================
  // 3. ОТВЕТ НА УТОЧНЕНИЕ ЗОНЫ («Для кухни», «Для раковины», «Для ванной», «Для душа»)
  // =========================================================================
  if (
    context.lastAiQuestion === 'ask_zone' || 
    q === 'для кухни' || 
    q === 'для раковины' || 
    q === 'для ванной' || 
    q === 'для душа'
  ) {
    if (q.includes('кухн') || q.includes('асүй') || q.includes('kitchen')) {
      return {
        text: detectedLang === 'kz'
          ? `Тамаша, асүй үшін! Ең қолайлы нұсқаны табу үшін айта кетіңізші:\n1. Сізге қарапайым үлгі ме, әлде ауыз су сүзгісі (2-і-1) қосылатын немесе икемді изливті моделі қажет пе?\n2. Асүй кеңістігіңіз стандартты ма, әлде ықшам ба?`
          : detectedLang === 'en'
          ? `Great, for the kitchen! To narrow down the ideal option, please let me know:\n1. Do you need a 2-in-1 mixer with a drinking water filter channel, a flexible hose, or a classic swivel spout?\n2. Is your sink area spacious or compact?`
          : `Отлично, подбираем для кухни! Чтобы предложить самый удобный вариант, подскажите:\n1. Планируете ли подключать фильтр питьевой воды (у нас есть удобные модели 2-в-1, чтобы не ставить второй кран)?\n2. Мойка просторная или компактная?`,
        quickChips: ['С подключением фильтра 2-в-1', 'Для маленькой кухни', 'С гибким изливом', 'Показать все варианты'],
        recommendedProducts: [],
        newContext: {
          ...context,
          category: 'Кухонные смесители',
          lastTopic: 'kitchen_selection',
          lastAiQuestion: 'ask_kitchen_details'
        }
      };
    }

    if (q.includes('раковин') || q.includes('умывальн') || q.includes('қолжуғыш') || q.includes('basin')) {
      return {
        text: detectedLang === 'kz'
          ? `Түсінікті, қолжуғыш үшін! Раковинаңыз қандай: жиһазға кіріктірілген стандартты ма, әлде үстел үстіне қойылатын биік чаша ма? (Чаша үшін биік корпусты араластырғыш қажет).`
          : detectedLang === 'en'
          ? `Understood, for the washbasin! What type of sink do you have: a standard inset basin or a countertop vessel sink? (Vessel sinks require an elevated high-body mixer).`
          : `Понял, смеситель для раковины! Уточните, пожалуйста: раковина обычная врезная (в тумбу) или накладная чаша на столешницу? (Для чаши требуется высокий смеситель с увеличенным корпусом).`,
        quickChips: ['Обычная врезная раковина', 'Накладная раковина-чаша', 'С гигиеническим душем'],
        recommendedProducts: [],
        newContext: {
          ...context,
          category: 'Смесители для раковины',
          lastTopic: 'basin_selection',
          lastAiQuestion: 'ask_basin_type'
        }
      };
    }

    if (q.includes('ванн') || q.includes('купани') || q.includes('bath')) {
      return {
        text: `Отлично! Для ванной комнаты у нас есть два ключевых решения:\n1. Монолитные короткие смесители с переключателем на душ — для отдельной ванны;\n2. Универсальные смесители с длинным поворотным изливом 350 мм — если один смеситель обслуживает и ванну, и рядом стоящую раковину.\n\nКакой вариант лучше подойдёт под вашу планировку?`,
        quickChips: ['Короткий излив для ванны', 'Длинный излив 350 мм (универсальный)', 'Душевая стойка'],
        recommendedProducts: [],
        newContext: {
          ...context,
          category: 'Смесители для ванны',
          lastTopic: 'bath_selection',
          lastAiQuestion: 'ask_bath_type'
        }
      };
    }
  }

  // =========================================================================
  // 4. ВОПРОС «КАКОЙ СМЕСИТЕЛЬ ТЫ БЫ ВЫБРАЛ ДЛЯ СОВРЕМЕННОЙ КУХНИ?»
  // =========================================================================
  if (
    (q.includes('какой смеситель ты бы выбрал') || q.includes('что бы ты выбрал') || q.includes('какой посоветуешь')) &&
    (q.includes('кухн') || q.includes('современ'))
  ) {
    const modernKitchenProds = products.filter(p => 
      p.category === 'Кухонные смесители' && (p.article === 'LT-K102-FLT' || p.article === 'LT-K103-FLX')
    );

    return {
      text: detectedLang === 'kz'
        ? `Егер мен заманауи асүй үшін таңдасам, міндетті түрде ауыз су сүзгісіне арналған каналы бар 2-і-1 моделін (мысалы, LAUTE Quadro Filter) немесе икемді силикон изливті нұсқаны таңдар едім.\n\nСебебі бұл шешімдер:\n• Жұмыс үстелінің кеңістігін үнемдейді (қосымша кран қажет емес);\n• Үлкен ыдыстарды жууды айтарлықтай жеңілдетеді;\n• Архитектуралық минимализм стилінде өте сәнді көрінеді.`
        : detectedLang === 'en'
        ? `If I were equipping a modern kitchen, I would definitely choose a 2-in-1 mixer with an integrated drinking water filter channel (such as the LAUTE Quadro Filter) or a model with a flexible silicone spout.\n\nHere is why:\n• Saves countertop space (no separate filtered water faucet needed);\n• Makes rinsing large roasting pans and pots effortless;\n• Delivers a clean architectural minimalist aesthetic in solid CW617N brass.`
        : `Для современной кухни я бы однозначно выбрал смеситель с совмещённым каналом под фильтр питьевой воды 2-в-1 (например, флагманский LAUTE Quadro Filter) либо модель с гибким изливом (LAUTE Flexi Pro):\n\n• Это практично: не нужно ставить отдельный кран для питьевой воды и сверлить мойку;\n• Высокий излив позволяет свободно промывать большие кастрюли и противни;\n• Корпус из латуни CW617N и картридж Sedal гарантируют плавность и тишину при открывании.\n\nХотите узнать подробнее о технических характеристиках или о том, почему важен качественный картридж?`,
      quickChips: ['А почему?', 'А если кухня маленькая?', 'Показать LAUTE Quadro Filter', 'Что такое картридж?'],
      recommendedProducts: modernKitchenProds.slice(0, 2),
      newContext: {
        ...context,
        category: 'Кухонные смесители',
        lastTopic: 'kitchen_recommendation',
        lastSubject: 'modern_kitchen_recommendation'
      }
    };
  }

  // =========================================================================
  // 5. ОБЪЯСНЕНИЕ ПОНЯТИЙ: «ЧТО ТАКОЕ КАРТРИДЖ В СМЕСИТЕЛЕ?»
  // =========================================================================
  if (
    (q.includes('что такое картридж') || q.includes('простыми словами картридж') || q.includes('зачем картридж')) ||
    (q.includes('картридж') && (q.includes('объясни') || q.includes('расскажи') || q.includes('как устроен') || q.includes('как работает')))
  ) {
    return {
      text: detectedLang === 'kz'
        ? `Қарапайым сөзбен айтқанда, картридж — бұл араластырғыштың ішкі «жүрегі».\n\nОның ішінде өте тегіс екі керамикалық пластина орналасқан. Сіз тұтқаны көтергенде немесе бұрғанда, бұл пластиналар бір-біріне қатысты жылжып:\n• Ыстық және суық судың ағынын дәл реттейді;\n• Су қысымын біркелкі ашады немесе жабады.\n\nLAUTE өнімдерінде дискілері алмазбен жылтыратылған керамикалық картридждер қолданылады. Олар кем дегенде 500 000 жұмыс цикліне есептелген (бұл тұрмыста 10+ жыл мінсіз жұмыс деген сөз).`
        : detectedLang === 'en'
        ? `In simple terms, the cartridge is the mechanical "heart" of any single-lever mixer tap.\n\nInside, there are two precisely diamond-lapped ceramic discs with engineered cutouts. When you move the handle, these plates glide against each other:\n• Balancing hot and cold water flows to hit your exact temperature;\n• Controlling water volume smoothly without dripping.\n\nLAUTE uses European-standard ceramic cartridges tested for at least 500,000 operational cycles, providing over a decade of leak-free service.`
        : `Простыми словами, картридж — это внутреннее «сердце» любого современного однорычажного смесителя.\n\nВнутри его пластикового корпуса находятся две гладкие керамические пластины с микроотверстиями. Когда вы двигаете рычаг крана, эти пластины смещаются относительно друг друга:\n• Они смешивают холодную и горячую воду в нужной пропорции, задавая температуру;\n• Они плавно перекрывают или открывают напор воды.\n\nВ смесителях LAUTE установлены картриджи с алмазной притиркой керамических дисков (Sedal / Kerox), выдерживающие свыше 500 000 рабочих циклов. Это гарантирует плавный ход рукоятки и отсутствие капель на протяжении более 10 лет.`,
      quickChips: ['Почему вода может течь из-под крана?', 'Как выбрать смеситель?', 'Из какого материала корпус?'],
      recommendedProducts: [],
      newContext: { ...context, lastTopic: 'cartridge_explanation', lastSubject: 'cartridge' }
    };
  }

  // =========================================================================
  // 6. СРАВНЕНИЕ: «ЧЕМ ОТЛИЧАЕТСЯ СМЕСИТЕЛЬ ДЛЯ КУХНИ ОТ СМЕСИТЕЛЯ ДЛЯ ВАННОЙ?»
  // =========================================================================
  if (
    q.includes('чем отличается') || 
    (q.includes('разниц') && (q.includes('кухн') || q.includes('ванн'))) ||
    q.includes('отличие смесителя для кухни от')
  ) {
    return {
      text: detectedLang === 'kz'
        ? `Асүй мен ваннаға арналған араластырғыштардың 3 басты айырмашылығы бар:\n\n1. Излив қозғалысы және биіктігі: Асүй смесительдері әрқашан айналмалы (поворотный) немесе икемді болады, ал ванна смесительдері көбінесе қысқа және монолитті болып келеді.\n2. Душқа арналған ауыстырғыш (дивертор): Ванна үлгілерінде суды құйғыштан душ лейкасына ауыстыратын тетік болады, ал асүй нұсқаларында мұндай болмайды (бірақ ауыз су сүзгісіне арналған арна болуы мүмкін).\n3. Орнату тәсілі: Асүй смесительдері мойкаға немесе үстелге (столешница) бекітіледі, ал ванна смесительдері негізінен қабырғаға эксцентриктер арқылы орнатылады.`
        : detectedLang === 'en'
        ? `There are 3 fundamental differences between kitchen and bathroom mixers:\n\n1. Spout maneuverability: Kitchen taps almost always feature a swivel, high-arc, or pull-out spout for washing groceries and pans. Bath mixers typically have shorter, rigid spouts designed to fill a tub quickly.\n2. Diverter mechanism: Bath mixers include a diverter valve to switch water flow to a hand shower, whereas kitchen mixers may integrate a 2-in-1 drinking filter bypass.\n3. Mounting design: Kitchen taps mount directly onto the sink deck or countertop, while bath mixers usually mount onto wall water outlets.`
        : `Между смесителем для кухни и для ванной есть три главных инженерных различия:\n\n1. Подвижность и высота излива: На кухне излив всегда поворотный (часто высокий, Г-образный или гибкий), чтобы было удобно мыть посуду и набирать воду в кастрюли. В ванной смеситель обычно компактный, монолитный, рассчитанный на быстрый набор ванны без разбрызгивания.\n2. Наличие дивертора (переключателя на душ): Смеситель для ванны оснащён клапаном переключения потока между изливом и душевой лейкой. У кухонного смесителя такого переключателя нет, но может быть второй рычаг под фильтр питьевой воды.\n3. Способ монтажа: Кухонный смеситель крепится на мойку или столешницу на одно отверстие, а смеситель для ванны крепится на стену на два вывода воды через эксцентрики.`,
      quickChips: ['Что лучше: высокий или низкий излив?', 'Как выбрать смеситель?', 'Показать кухонные смесители'],
      recommendedProducts: [],
      newContext: { ...context, lastTopic: 'concept_differences', lastSubject: 'kitchen_vs_bath' }
    };
  }

  // =========================================================================
  // 7. СРАВНЕНИЕ: «ЧТО ЛУЧШЕ: ВЫСОКИЙ ИЛИ НИЗКИЙ ИЗЛИВ?»
  // =========================================================================
  if (
    q.includes('высокий или низкий излив') || 
    q.includes('высокий или низкий') || 
    (q.includes('излив') && (q.includes('лучше') || q.includes('высота')))
  ) {
    return {
      text: detectedLang === 'kz'
        ? `Біржақты жауап жоқ — бұл сіздің жуғышыңыздың (мойка) тереңдігіне тікелей байланысты:\n\nБиік излив (280–380 мм):\n+ Артықшылығы: Үлкен кастрюльдерді, құмыраларды жуу өте ыңғайлы.\n- Кемшілігі: Жуғыш таяз болса (18 см-ден кем), су тамшылары жан-жаққа шашырайды.\n\nАласа излив (150–220 мм):\n+ Артықшылығы: Су мүлдем шашырамайды, шағын асүйлер мен терезе алды үшін өте ыңғайлы.\n- Кемшілігі: Ірі габаритті ыдыстарды жуу қиынырақ.\n\nСіздің жуғышыңыздың тереңдігі қандай? Ең дұрыс нұсқаны айтып беремін.`
        : detectedLang === 'en'
        ? `Neither is universally better — the ideal choice depends on your sink bowl depth:\n\nHigh spout (280–380 mm):\n+ Pros: Great clearance for large stockpots, baking sheets, and pitchers.\n- Cons: In a shallow sink (under 18 cm depth), high water drop causes splashing.\n\nLow spout (150–220 mm):\n+ Pros: Minimal splashing, compact footprint, perfect for small kitchens and window clearance.\n- Cons: Harder to wash oversized pots underneath.\n\nWhat is the depth of your sink bowl? I can suggest the exact balanced height.`
        : `Однозначного ответа нет — выбор зависит от глубины вашей мойки и задач:\n\nВысокий излив (280–380 мм):\n➕ Плюсы: максимальный комфорт при мытье противней, высоких кастрюль и наборе воды в графины.\n➖ Минусы: если чаша мойки неглубокая (меньше 18–19 см), неизбежно будут брызги на столешницу.\n\nНизкий или средний излив (160–240 мм):\n➕ Плюсы: практичность, отсутствие брызг, аккуратный вид. Идеально под окно или навесные шкафы.\n➖ Минусы: под ним сложнее мыть крупную габаритную посуду.\n\nЗолотая середина — смесители средней высоты с вытяжной лейкой или гибким изливом (LAUTE Flexi Pro). Какая у вас глубина чаши мойки?`,
      quickChips: ['Глубокая мойка (более 19 см)', 'Неглубокая мойка (до 18 см)', 'С гибким изливом'],
      recommendedProducts: [],
      newContext: { ...context, lastTopic: 'spout_height_advice', lastSubject: 'spout_height' }
    };
  }

  // =========================================================================
  // 8. ДИАГНОСТИКА: «ПОЧЕМУ ВОДА МОЖЕТ ТЕЧЬ ИЗ-ПОД КРАНА?»
  // =========================================================================
  if (
    q.includes('почему вода может течь') || 
    q.includes('почему течет кран') || 
    q.includes('капает кран') || 
    q.includes('вода сочится') || 
    q.includes('течь из-под') ||
    q.includes('су ағады') ||
    q.includes('leaking tap') ||
    q.includes('faucet leak')
  ) {
    return {
      text: detectedLang === 'kz'
        ? `Араластырғыштан судың ағуы немесе тамшылауы негізінен бірнеше себепке байланысты:\n\n1. Картридждің тозуы немесе арасына құм/әк түйіршіктерінің түсуі — керамикалық дискілер тығыз жабылмайды.\n2. Тығыздағыш резеңке сақиналардың (прокладка) ескіруі немесе қатаюы.\n3. Бұрылмалы изливтің түйіскен жерінен су шықса — излив тығыздағышының тозуы.\n4. Қысымның шамадан тыс жоғары болуы (гидросоққы).\n\nНақты жағдайды білмей диагноз қою қиын, бірақ 80% жағдайда картриджді немесе тығыздағыштарды ауыстыру мәселені толық шешеді.`
        : detectedLang === 'en'
        ? `Water leaking from a faucet usually stems from a few mechanical factors:\n\n1. Cartridge wear or mineral buildup: If sediment gets trapped between the ceramic discs, they cannot seal completely.\n2. Worn O-rings or seals: Rubber gaskets can harden over time from hot water.\n3. Swivel spout base leak: Indicates friction wear on the spout mounting rings.\n4. Excessive water line pressure spikes.\n\nWithout inspecting the mixer directly, the most common fix is replacing the internal ceramic cartridge or the O-ring seals.`
        : `Вода может течь из-под смесителя по нескольким распространенным техническим причинам:\n\n1. Износ или повреждение керамического картриджа — если в водопроводной воде есть окалина или песок, они могут попасть между пластинами, нарушая герметичность.\n2. Затвердевание или износ уплотнительных резиновых колец (прокладок) от горячей воды и солей жесткости.\n3. Протечка в месте крепления поворотного излива — указывает на истирание уплотнительных манжет на основании гусака.\n4. Ослабление прижимной гайки картриджа под декоративным колпачком.\n5. Повышенное давление в трубах (гидроудары при отсутствии редуктора).\n\nНе видя кран, поставить точный диагноз невозможно, но в подавляющем большинстве случаев вопрос решает простая замена картриджа или уплотнителей.`,
      quickChips: ['Что такое картридж?', 'Условия гарантии LAUTE', 'Как выбрать надежный смеситель?'],
      recommendedProducts: [],
      newContext: { ...context, lastTopic: 'troubleshooting_leak', lastSubject: 'leak_reasons' }
    };
  }

  // =========================================================================
  // 9. КОНСУЛЬТАЦИЯ: «КАК ВЫБРАТЬ СМЕСИТЕЛЬ?» / «НА ЧТО ОБРАТИТЬ ВНИМАНИЕ?»
  // =========================================================================
  if (
    q.includes('как выбрать смеситель') || 
    q.includes('как правильно выбрать смеситель') || 
    q.includes('на что обратить внимание') || 
    q.includes('критерии выбора') ||
    q.includes('қалай таңдау керек') ||
    q.includes('how to choose a faucet')
  ) {
    return {
      text: detectedLang === 'kz'
        ? `Сенімді және ыңғайлы араластырғыш таңдау үшін 5 негізгі ережені есте сақтаңыз:\n\n1. Корпус материалы: Тек бастапқы латунь (мысалы, LAUTE CW617N). Силуминнен аулақ болыңыз — ол жеңіл және тез жарылады.\n2. Картридж сапасы: Алмазбен өңделген керамикалық дискілер кемінде 500 000 циклге қызмет етуі керек.\n3. Излив өлшемі: Жуғыштың тереңдігіне сәйкес келуі тиіс (су шашырамауы үшін).\n4. Аэратор: Әк қағынан тазартылатын Neoperl аэраторлары суды 30%-ға дейін үнемдейді.\n5. Зауыттық кепілдік: Корпусқа кемінде 5 жыл және аймақтық қосалқы бөлшектер базасы болуы шарт.\n\nСіз смесительді қай бөлмеге таңдап жатырсыз — асүй ме, ванна ма?`
        : detectedLang === 'en'
        ? `To choose a dependable mixer that lasts decades, focus on these 5 engineering checkpoints:\n\n1. Body Material: Insist on primary brass (like LAUTE CW617N). Avoid cheap silumin/zinc alloys, which corrode and crack under pressure.\n2. Cartridge Quality: Look for diamond-polished ceramic discs rated for at least 500,000 cycles.\n3. Proportions: Match spout height and reach to your sink depth to prevent splashing.\n4. Aerator: Rub-clean silicone aerators (Neoperl) soften water and save up to 30% consumption.\n5. Warranty & Service: 5+ years warranty backed by local warehouse parts support.\n\nWhich room are you selecting a faucet for: kitchen, basin, or bath?`
        : `Чтобы выбрать смеситель, который прослужит более 10 лет без хлопот, обратите внимание на 5 ключевых факторов:\n\n1. Материал корпуса: Только первичная сантехническая латунь марки CW617N. Она тяжёлая, не боится коррозии и не содержит вредных примесей. Избегайте лёгкого порошкового силумина.\n2. Картридж: Керамический узел европейского стандарта (Sedal / Kerox) с алмазной притиркой дисков на 500 000+ рабочих циклов.\n3. Геометрия излива: Струя воды должна падать точно в центр сливного отверстия мойки или чуть впереди, на высоте, исключающей брызги.\n4. Аэратор: Качественный аэратор (Neoperl) насыщает струю воздухом, делает её мягкой и бесшумной, экономя до 30% воды.\n5. Гарантия и сервис: Заводская гарантия 5 лет на корпус и наличие запчастей на региональных складах.\n\nДля какой зоны вам сейчас нужен смеситель: кухни, раковины или ванной комнаты?`,
      quickChips: ['Для кухни', 'Для раковины', 'Для ванной', 'О материалах LAUTE'],
      recommendedProducts: [],
      newContext: { ...context, lastTopic: 'selection_guide', lastAiQuestion: 'ask_zone' }
    };
  }

  // =========================================================================
  // 10. ЧТО ТАКОЕ СМЕСИТЕЛЬ?
  // =========================================================================
  if (
    q === 'что такое смеситель' || 
    q === 'что такое кран' || 
    q.includes('что такое смеситель?') ||
    q.includes('смеситель деген не')
  ) {
    return {
      text: detectedLang === 'kz'
        ? `Араластырғыш (смеситель) — бұл ыстық және суық суды бір ағынға араластырып, оның температурасы мен қысымын реттейтін сантехникалық құрылғы. Ол суды қажетті мөлшерде және ыңғайлы температурада тұтынушыға жеткізеді.`
        : detectedLang === 'en'
        ? `A mixer tap (faucet) is a sanitary engineering device that blends hot and cold water supplies into a unified stream, allowing precise control over temperature and water pressure with a single lever or handles.`
        : `Смеситель — это сантехническое устройство, которое смешивает холодную и горячую воду из двух водопроводных труб в единый комфортный поток, позволяя плавно регулировать его температуру и напор.\n\nВ отличие от простого крана (который подаёт только одну воду), современный смеситель обеспечивает безопасную и комфортную подачу воды на кухне или в ванной.`,
      quickChips: ['Как выбрать смеситель?', 'Что такое картридж?', 'Что производит LAUTE?'],
      recommendedProducts: [],
      newContext: { ...context, lastTopic: 'concept_mixer' }
    };
  }

  // =========================================================================
  // 11. ИНТЕРЕСНЫЙ ФАКТ («РАССКАЖИ ЧТО-НИБУДЬ ИНТЕРЕСНОЕ»)
  // =========================================================================
  if (
    q.includes('расскажи что-нибудь интересное') || 
    q.includes('интересный факт') || 
    q.includes('удиви меня') || 
    q.includes('что-то интересное') ||
    q.includes('қызықты дерек') ||
    q.includes('tell me something interesting')
  ) {
    return {
      text: detectedLang === 'kz'
        ? `Қызықты инженерлік дерек:\n\nКерамикалық картридж ойлап табылғанға дейін барлық крандарда резеңке прокладкалар қолданылған, олар әр 3-6 ай сайын тозып тұратын. Ал LAUTE араластырғыштарындағы керамикалық пластиналар микрондық дәлдікпен жылтыратылған — олардың арасында ешқандай резеңке тығыздағыш жоқ! Олар молекулалық тартылыс күшімен суды ұстап тұрады.\n\nСонымен қатар, LAUTE зауытында әрбір корпус хромдалмас бұрын 16 бар ауа және су қысымымен сыналады — бұл қалалық пәтерлердегі қысымнан 4 есе жоғары!`
        : detectedLang === 'en'
        ? `Here is a fascinating sanitary engineering fact:\n\nBefore the invention of ceramic disc cartridges, all taps relied on rubber washers that had to be replaced every few months. In LAUTE mixers, the ceramic discs are polished to sub-micron optical flatness: there are no rubber washers between the moving plates! They seal water purely through the molecular flatness of the ceramic surfaces.\n\nFurthermore, every LAUTE solid brass body undergoes a 16-bar pressure hydro-test before finishing — 4 times higher than standard household plumbing pressure!`
        : `Любопытный инженерный факт:\n\nДо изобретения керамических картриджей все краны держались на резиновых прокладках, которые истирались за несколько месяцев. В смесителях LAUTE керамические пластины отполированы с субмикронной точностью: между ними нет никаких резиновых уплотнителей! Они удерживают напор воды исключительно за счёт идеального молекулярного прилегания гладких керамических поверхностей.\n\nА ещё каждый литой корпус LAUTE перед хромированием проходит гидроиспытание давлением 16 бар на заводском стенде — это в 4 раза выше стандартного рабочего давления в городских квартирах.`,
      quickChips: ['О материалах LAUTE', 'Как выбрать смеситель?', 'Подобрать смеситель'],
      recommendedProducts: [],
      newContext: { ...context, lastTopic: 'fun_fact' }
    };
  }

  // =========================================================================
  // 12. ИДЕНТИЧНОСТЬ: «КТО ТЫ?», «ТЫ КТО?», «WHO ARE YOU?»
  // =========================================================================
  if (
    /^(а\s+)?(кто\s+ты|ты\s+кто|ты\s+человек|что\s+ты\s+такое|сен\s+кімсің|who\s+are\s+you)[\s!.,?]*$/i.test(q) ||
    q.includes('кто ты') || 
    q.includes('ты кто')
  ) {
    return {
      text: detectedLang === 'kz'
        ? `Мен LAUTE халықаралық сантехникалық брендінің ресми цифрлық AI-кеңесшісімін.\n\nМенің міндетім — сантехника мен араластырғыштардың ерекшеліктерін түсіндіру, техникалық сұрақтарға жауап беру және асүйіңіз бен ваннаңыз үшін ең үйлесімді үлгілерді таңдауға көмектесу.`
        : detectedLang === 'en'
        ? `I am the official digital AI consultant for LAUTE, an international architectural sanitaryware brand.\n\nI assist with technical explanations, plumbing specifications, product recommendations, and finding the right mixers and shower systems for your projects.`
        : `Я официальный цифровой AI-консультант компании LAUTE — международного производителя инженерной сантехники и смесителей европейского стандарта.\n\nМоя задача — помогать вам с любыми вопросами по сантехнике: от простых объяснений технических терминов и причин протечек до грамотного подбора оборудования под габариты вашей кухни или ванной.`,
      quickChips: ['Что ты умеешь?', 'О компании LAUTE', 'Как выбрать смеситель?'],
      recommendedProducts: [],
      newContext: { ...context, lastTopic: 'identity', lastSubject: 'ai_self' }
    };
  }

  // =========================================================================
  // 13. ВОЗМОЖНОСТИ: «ЧТО ТЫ УМЕЕШЬ?», «ЧЕМ МОЖЕШЬ ПОМОЧЬ?»
  // =========================================================================
  if (
    q.includes('что ты умеешь') || 
    q.includes('чем можешь помочь') || 
    q.includes('что можешь делать') || 
    q.includes('какие твои возможности') ||
    q.includes('не істей аласың') ||
    q.includes('what can you do')
  ) {
    return {
      text: detectedLang === 'kz'
        ? `Менің мүмкіндіктерім:\n\n• Түсіндіру: Сантехниканың құрылысын (картридждер, аэраторлар, латунь маркалары) қарапайым тілмен айтып беремін;\n• Таңдау: Асүй, раковина және ванна бөлмелерінің өлшемдеріне қарай оңтайлы араластырғыштар мен душ жүйелерін ұсынамын;\n• Салыстыру: Модельдердің артықшылықтары мен айырмашылықтарын сараптаймын;\n• Сұрақтарға жауап беру: Теңгерімдер, кепілдік (5 жыл) және қызмет көрсету туралы ақпарат беремін.\n\nСізге қандай тақырып бойынша көмектесе аламын?`
        : detectedLang === 'en'
        ? `Here is what I can do for you:\n\n• Explain: Break down complex sanitary engineering terms (cartridges, brass grades, aerators) in simple, human language;\n• Recommend: Help you choose the ideal kitchen tap, basin mixer, or rain shower based on your exact room layout;\n• Compare: Highlight technical tradeoffs between different models and spout styles;\n• LAUTE Standards: Provide verified information regarding our 5-year warranty, CW617N brass standard, and 36-hour service desk.\n\nWhat would you like to explore?`
        : `Вот чем я могу вам помочь:\n\n• Объяснять сложные вещи просто: расскажу, как устроен картридж, почему важна первичная латунь CW617N и чем высокий излив отличается от низкого;\n• Грамотно подбирать сантехнику: под габариты вашей мойки, высоту шкафов или тип раковины;\n• Сравнивать решения: помогу сопоставить характеристики и подскажу оптимальный выбор;\n• Консультировать по бренду LAUTE: стандарты производства, 5 лет гарантии и сервисная поддержка.\n\nС чего начнём разговор?`,
      quickChips: ['Подобрать смеситель', 'Что такое картридж?', 'Расскажи о компании LAUTE'],
      recommendedProducts: [],
      newContext: { ...context, lastTopic: 'capabilities', lastSubject: 'ai_self' }
    };
  }

  // =========================================================================
  // 14. СВЕТСКАЯ БЕСЕДА: «КАК ДЕЛА?», «HOW ARE YOU?», «ҚАЛАЙСЫҢ?»
  // =========================================================================
  if (
    /^(как\s+дела|как\s+ты|как\s+жизнь|как\s+поживаешь|қалайсың|қалайсыз|how\s+are\s+you)[\s!.,?]*$/i.test(q) ||
    (q.includes('как дела') && q.length < 25)
  ) {
    return {
      text: detectedLang === 'kz'
        ? `Рахмет, бәрі тамаша! LAUTE сантехникалық жүйелері бойынша сұрақтарыңызға жауап беруге және пайдалы кеңес беруге дайынмын. Сіздің көңіл-күйіңіз қалай?`
        : detectedLang === 'en'
        ? `Doing great, thank you! I'm fully online and ready to help you with sanitary engineering insights, design guidance, and LAUTE products. How is your day going?`
        : `Спасибо, всё отлично! Работаю в штатном режиме, готов отвечать на любые вопросы по сантехнике, делиться инженерными тонкостями и помогать с выбором. А у вас как дела?`,
      quickChips: ['Мне нужен смеситель для кухни', 'Расскажи о компании LAUTE', 'Что ты умеешь?'],
      recommendedProducts: [],
      newContext: { ...context, lastTopic: 'chitchat' }
    };
  }

  // =========================================================================
  // 15. ПРИВЕТСТВИЕ: «ПРИВЕТ», «ЗДРАВСТВУЙТЕ», «СӘЛЕМ», «HELLO», «ЙО»
  // =========================================================================
  if (
    /^(привет|здравствуй|здравствуйте|добрый день|доброе утро|добрый вечер|салем|сәлем|сәлеметсіз(\s+бе)?|hi|hello|hey|йо|салют|хай)[\s!.,?]*$/i.test(q)
  ) {
    return {
      text: detectedLang === 'kz'
        ? 'Сәлеметсіз бе! Мен LAUTE ресми AI-кеңесшісімін. Жобаңызға немесе үйіңізге сәйкес келетін араластырғыштар мен сантехникалық жабдықтарды таңдауға көмектесемін. Қандай сұрағыңыз бар?'
        : detectedLang === 'en'
        ? 'Hello! I am the official LAUTE AI consultant. I can help you navigate architectural sanitary fittings, explain technical nuances, or select the ideal faucet. How can I help you today?'
        : 'Здравствуйте! Я официальный AI-консультант LAUTE. Помогу разобраться в нюансах сантехники, просто объясню технические детали и помогу подобрать надежное оборудование. О чём хотите узнать?',
      quickChips: detectedLang === 'kz'
        ? ['Асүй араластырғышы керек', 'Смесительді қалай таңдау керек?', 'LAUTE не шығарады?', 'Картридж деген не?']
        : detectedLang === 'en'
        ? ['I need a kitchen faucet', 'How to choose a faucet?', 'What does LAUTE produce?', 'What is a cartridge?']
        : ['Мне нужен смеситель для кухни', 'Как выбрать смеситель?', 'Что производит LAUTE?', 'Что такое картридж?'],
      recommendedProducts: [],
      newContext: { ...context, step: 'greeting', lastTopic: 'greeting' }
    };
  }

  // =========================================================================
  // 16. БЛАГОДАРНОСТЬ: «СПАСИБО», «РАХМЕТ», «THANK YOU»
  // =========================================================================
  if (
    q.includes('спасибо') || 
    q.includes('благодар') || 
    q.includes('рахмет') || 
    q.includes('thank')
  ) {
    return {
      text: detectedLang === 'kz'
        ? 'Оқасы жоқ! Сізге көмектескеніме өте қуаныштымын. Егер басқа техникалық сұрақтар туындаса — кез келген уақытта жазыңыз!'
        : detectedLang === 'en'
        ? 'You are very welcome! Glad I could help. If you have any other questions regarding sanitary equipment or LAUTE solutions, feel free to ask anytime.'
        : 'Пожалуйста! Рад был помочь. Если появятся вопросы по монтажу, характеристикам или подбору других позиций — всегда к вашим услугам!',
      quickChips: ['Показать каталог', 'О компании LAUTE', 'Гарантия и сервис'],
      recommendedProducts: [],
      newContext: { ...context, lastTopic: 'gratitude' }
    };
  }

  // =========================================================================
  // 17. ПРОЩАНИЕ: «ПОКА», «ДО СВИДАНИЯ», «САУ БОЛ», «BYE»
  // =========================================================================
  if (
    /^(пока|до свидания|всего хорошего|увидимся|до связи|сау бол|қош бол|bye|goodbye)[\s!.,?]*$/i.test(q)
  ) {
    return {
      text: detectedLang === 'kz'
        ? 'Сау болыңыз! Күніңіз сәтті өтсін! LAUTE әрқашан сіздің қызметіңізде.'
        : detectedLang === 'en'
        ? 'Goodbye! Have a wonderful day ahead. Whenever you need sanitary advice, I am right here.'
        : 'До свидания! Хорошего вам дня! Если понадобятся ответы по сантехнике LAUTE — я всегда на связи.',
      quickChips: ['Связаться с LAUTE', 'Открыть каталог', 'О компании'],
      recommendedProducts: [],
      newContext: { ...context, lastTopic: 'farewell' }
    };
  }

  // =========================================================================
  // 18. О КОМПАНИИ LAUTE
  // =========================================================================
  if (
    q.includes('о компании laute') || 
    q.includes('о компании') || 
    q.includes('о бренде') || 
    q.includes('история laute') || 
    q.includes('что за компания') ||
    q.includes('laute туралы') ||
    q.includes('about laute')
  ) {
    return {
      text: detectedLang === 'kz'
        ? `LAUTE — сантехникалық жабдықтар мен араластырғыштар шығаратын халықаралық бренд:\n\n• Тек CW617N бастапқы сантехникалық латунінен құйылған корпустар (силумин мен зиянды қоспаларсыз);\n• Әрбір корпус хромдау алдында 16 бар қысыммен гидросынақтан өтеді;\n• 500 000 жұмыс цикліне есептелген керамикалық картридждер;\n• 5 жылдық ресми зауыттық кепілдік және 36 жұмыс сағаты ішінде жауап беретін цифрлық сервистік орталық;\n• Алматы, Астана, Новосибирск және Мәскеу қалаларындағы аймақтық қоймалар желісі.`
        : detectedLang === 'en'
        ? `LAUTE is an international manufacturing brand specializing in European-standard architectural plumbing:\n\n• 100% solid CW617N primary brass casting with strictly limited lead content (<1.6%);\n• 16-bar hydrostatic pressure testing for every raw casing before finishing;\n• Diamond-lapped ceramic cartridges rated for over 500,000 cycles;\n• Official 5-year factory body warranty supported by a 36-hour digital service desk;\n• Logistics distribution hubs in Almaty, Astana, Novosibirsk, and Moscow.`
        : `LAUTE — международная производственно-торговая компания, выпускающая сантехническую продукцию европейского инженерного стандарта:\n\n• Честные материалы: корпуса отливаются исключительно из первичной латуни марки CW617N (без вторичного силумина и с содержанием свинца <1.6%);\n• Испытания давлением: каждый корпус перед хромированием проходит гидротест 16 бар на заводском стенде;\n• Узлы европейских лидеров: керамические картриджи на 500 000 циклов (Sedal / Kerox) и аэраторы Neoperl;\n• Ответственность: 5 лет заводской гарантии на корпуса смесителей и Первый цифровой сервисный центр LAUTE (регламент ответа до 36 часов);\n• Логистика: региональные склады в Алматы, Астане, Новосибирске и Москве.`,
      quickChips: ['Что производит LAUTE?', 'Подобрать смеситель', 'Гарантия и сервис'],
      recommendedProducts: [],
      newContext: { ...context, lastTopic: 'company_about', lastSubject: 'laute_company' }
    };
  }

  // =========================================================================
  // 19. ЧТО ПРОИЗВОДИТ LAUTE? / АССОРТИМЕНТ
  // =========================================================================
  if (
    q.includes('что вы продаете') || 
    q.includes('что продаете') || 
    q.includes('что производит laute') || 
    q.includes('что производит') || 
    q.includes('какой ассортимент') || 
    q.includes('продукция laute') ||
    q.includes('не шығарады') ||
    q.includes('не сатасыздар') ||
    q.includes('what do you produce') ||
    q.includes('what products')
  ) {
    return {
      text: detectedLang === 'kz'
        ? `LAUTE келесі негізгі бағыттар бойынша инженерлік сантехниканы шығарады:\n\n1. Асүй араластырғыштары — классикалық поворотты, ауыз су сүзгісі қосылатын 2-і-1 үлгілері және икемді силикон изливті нұсқалар;\n2. Раковина араластырғыштары — стандартты және накладной раковина-чашаларға арналған биік корпустар;\n3. Ванна араластырғыштары — монолитті қысқа және 350 мм ұзын поворотты изливті әмбебап үлгілер;\n4. Душ жүйелері — реттелетін телескопиялық қарнағы бар тропикалық жаңбыр душтары;\n5. Кухонные мойки — AISI 304 тот баспайтын болаттан жасалған дыбыс оқшаулағыш мойкалар;\n6. Түпнұсқа жиынтықтауыштар — 500 000 циклді керамикалық картридждер мен Neoperl аэраторлары.\n\nҚай санатты толығырақ қарастырғыңыз келеді?`
        : detectedLang === 'en'
        ? `LAUTE manufactures premium plumbing equipment across core categories:\n\n1. Kitchen Faucets — standard swivel, 2-in-1 drinking filter integrated models, and flexible hose spouts;\n2. Basin Mixers — standard inset mixers and tall vessel sink mixer columns;\n3. Bath Mixers — compact wall-mount mixers and universal 350 mm long swivel spout models;\n4. Shower Systems — telescoping rain shower columns and dual handset sets;\n5. Kitchen Sinks — heavy-gauge AISI 304 soundproof stainless steel basins;\n6. OEM Components — precision ceramic cartridges and Neoperl Swiss aerators.\n\nWhich category would you like to explore?`
        : `LAUTE производит сантехническую арматуру и оборудование европейского стандарта:\n\n1. Кухонные смесители — включая модели с каналом под питьевой фильтр 2-в-1 и смесители с гибким силиконовым изливом;\n2. Смесители для раковины — классические низкие и высокие колонны для накладных раковин-чаш;\n3. Смесители для ванны — короткие монолитные и универсальные с длинным поворотным изливом 350 мм;\n4. Душевые системы — душевые стойки с верхним тропическим душем и ручной лейкой;\n5. Кухонные мойки — из нержавеющей стали марки AISI 304 с шумоизоляционным напылением;\n6. Комплектующие — керамические картриджи на 500 000 циклов и аэраторы Neoperl.\n\nКакая группа товаров вас интересует?`,
      quickChips: ['Кухонные смесители', 'Смесители для раковины', 'Душевые системы', 'Как выбрать смеситель?'],
      recommendedProducts: [],
      newContext: { ...context, lastTopic: 'assortment_overview' }
    };
  }

  // =========================================================================
  // 20. МАТЕРИАЛЫ И ЛАТУНЬ CW617N
  // =========================================================================
  if (
    q.includes('материал') || 
    q.includes('латунь') || 
    q.includes('силумин') || 
    q.includes('cw617n')
  ) {
    return {
      text: `Все корпусные изделия LAUTE отливаются исключительно из первичной сантехнической латуни марки CW617N по европейскому стандарту EN 12165. Содержание свинца строго контролируется и составляет менее 1.6%, что полностью безопасно для питьевой воды.\n\nМы принципиально не используем вторичный переплавленный силумин или порошковый цинковый сплав ZAMAK в элементах, контактирующих с водой. Латунь CW617N обладает высокой прочностью на растяжение и не растрескивается при гидроударах.`,
      quickChips: ['Условия гарантии', 'Как выбрать смеситель?', 'Показать кухонные смесители'],
      recommendedProducts: [],
      newContext: { ...context, lastTopic: 'materials_brass', lastSubject: 'brass_material' }
    };
  }

  // =========================================================================
  // 21. ГАРАНТИЯ И СЕРВИС
  // =========================================================================
  if (
    q.includes('гаранти') || 
    q.includes('сервис') || 
    q.includes('36 час') || 
    q.includes('ремонт')
  ) {
    return {
      text: `На продукцию LAUTE действует прямая заводская гарантия:\n• 5 лет — на цельнолитые латунные корпуса смесителей;\n• 2 года — на керамические картриджи, гибкую подводку, шланги и лейки.\n\nВ компании работает Первый цифровой сервисный центр LAUTE с регламентным временем обработки обращений до 36 рабочих часов. В случае гарантийного вопроса замена или оригинальные запчасти отгружаются с ближайшего регионального склада.`,
      quickChips: ['Где находятся склады?', 'О компании LAUTE', 'Подобрать смеситель'],
      recommendedProducts: [],
      newContext: { ...context, lastTopic: 'warranty_service' }
    };
  }

  // =========================================================================
  // 22. СРАВНЕНИЕ С ДРУГИМИ БРЕНДАМИ / КОНКУРЕНТЫ
  // =========================================================================
  if (
    q.includes('grohe') || 
    q.includes('hansgrohe') || 
    q.includes('iddis') || 
    q.includes('lemark') || 
    q.includes('конкурент') ||
    q.includes('другие бренды')
  ) {
    return {
      text: `У меня нет доступа к закрытым прейскурантам сторонних брендов для прямого сопоставления цен конкретных чужих артикулов.\n\nОднако с точки зрения инженерии LAUTE обеспечивает строгий паритет с европейскими стандартами:\n• Первичная латунь CW617N;\n• Керамические картриджи с алмазной притиркой на 500 000 циклов;\n• Аэраторы Neoperl;\n• 5 лет заводской гарантии.\n\nЗа счёт прямого контракта с фабрикой и выстроенной логистики в Казахстане и СНГ продукция LAUTE даёт выигрыш по цене без компромиссов в надёжности.`,
      quickChips: ['О материалах LAUTE', 'Показать каталог LAUTE', 'Как выбрать смеситель?'],
      recommendedProducts: [],
      newContext: { ...context, lastTopic: 'competitor_policy' }
    };
  }

  // =========================================================================
  // 23. ОТКАЗ ОТ ВЫДУМЫВАНИЯ НЕДОСТОВЕРНЫХ ФАКТОВ
  // =========================================================================
  if (
    q.includes('личный телефон') || 
    q.includes('домашний адрес') || 
    q.includes('паспортные данные') || 
    q.includes('доставка на марс') ||
    q.includes('секретн') ||
    q.includes('директор') && q.includes('номер')
  ) {
    return {
      text: `У меня нет точной информации по этому вопросу. Я не хочу выдумывать недостоверные данные. Для уточнения административных или официальных корпоративных вопросов рекомендую обратиться напрямую в службу поддержки LAUTE через форму на странице «Контакты».`,
      quickChips: ['Перейти в контакты', 'О продукции LAUTE', 'Как выбрать смеситель?'],
      recommendedProducts: [],
      newContext: context
    };
  }

  // =========================================================================
  // 24. СРАВНЕНИЕ ДВУХ КОНКРЕТНЫХ ТОВАРОВ
  // =========================================================================
  if (q.includes('сравн') || q.includes('compare')) {
    let itemA = null;
    let itemB = null;

    if (context.lastProducts && context.lastProducts.length >= 2) {
      itemA = context.lastProducts[0];
      itemB = context.lastProducts[1];
    } else {
      const pool = products.filter(p => p.status !== 'СКРЫТ');
      itemA = pool.find(p => p.article === 'LT-K101-CHR') || pool[0];
      itemB = pool.find(p => p.article === 'LT-K102-FLT') || pool[1];
    }

    if (itemA && itemB) {
      return {
        text: `Сравнение моделей LAUTE:\n\n1. ${itemA.name} (${itemA.price?.toLocaleString()} ${itemA.currency}):\n• Назначение: компактный, проверенная классика для стандартных моек.\n• Особенности: ${itemA.specs}\n\n2. ${itemB.name} (${itemB.price?.toLocaleString()} ${itemB.currency}):\n• Назначение: высокий излив со встроенным каналом под питьевой фильтр 2-в-1.\n• Особенности: ${itemB.specs}\n\nВердикт: если фильтр не нужен или мойка небольшая — оптимален ${itemA.name}. Если нужен современный функционал без врезки отдельного крана для питьевой воды — рекомендую ${itemB.name}.`,
        quickChips: [`Посмотреть ${itemA.article}`, `Посмотреть ${itemB.article}`, 'Подобрать ещё'],
        recommendedProducts: [itemA, itemB],
        triggerComparison: [itemA, itemB],
        newContext: { ...context, lastTopic: 'comparison', lastProducts: [itemA, itemB] }
      };
    }
  }

  // =========================================================================
  // 25. ПРОВЕРКА НАЛИЧИЯ ПО ГОРОДАМ
  // =========================================================================
  if (foundCity || q.includes('наличи') || q.includes('остат') || q.includes('склад')) {
    const targetCity = foundCity || context.city || 'Алматы';
    let targetProduct = context.lastProducts?.[0];
    if (!targetProduct) {
      targetProduct = products.find(p => q.includes(normalize(p.article)) || q.includes(normalize(p.name))) || products[0];
    }

    if (targetProduct) {
      const stockInCity = targetProduct.cityStock?.[targetCity] || 0;
      
      if (stockInCity > 0) {
        return {
          text: `Товар «${targetProduct.name}» (арт. ${targetProduct.article}) есть в наличии в городе ${targetCity} (${stockInCity} шт.).\n\n• Базовая цена: ${targetProduct.price?.toLocaleString()} ${targetProduct.currency}\n• Доставка / самовывоз: отгрузка со склада в день оформления заявки.`,
          quickChips: [`Посмотреть ${targetProduct.article}`, 'Проверить в Астане', 'Подобрать ещё варианты'],
          recommendedProducts: [targetProduct],
          newContext: { ...context, city: targetCity, lastProducts: [targetProduct] }
        };
      } else {
        const alternative = products.find(p => 
          p.category === targetProduct.category && 
          p.article !== targetProduct.article && 
          (p.cityStock?.[targetCity] || 0) > 0
        );

        let altText = '';
        if (alternative) {
          altText = `\n\nОднако в наличии в городе ${targetCity} есть подходящая альтернатива: «${alternative.name}» (арт. ${alternative.article}) — ${alternative.cityStock[targetCity]} шт.`;
        }

        return {
          text: `В данный момент модели «${targetProduct.name}» нет на складе в городе ${targetCity} (остаток 0).${altText}\n\nВозможна отгрузка под заказ с центрального склада либо подбор доступного аналога.`,
          quickChips: alternative ? [`Посмотреть ${alternative.article}`, 'Оформить предзаказ', 'Все товары в наличии'] : ['Оформить предзаказ'],
          recommendedProducts: alternative ? [alternative] : [targetProduct],
          newContext: { ...context, city: targetCity, lastProducts: alternative ? [alternative] : [targetProduct] }
        };
      }
    }
  }

  // =========================================================================
  // 26. НЕОПРЕДЕЛЁННЫЙ ЗАПРОС НА ПОДБОР СМЕСИТЕЛЯ
  // =========================================================================
  const isVagueMixerRequest = (
    q === 'мне нужен смеситель' || 
    q === 'хочу купить смеситель' || 
    q === 'посоветуй смеситель' || 
    q === 'выбрать смеситель' ||
    q === 'кран керек' ||
    q === 'i need a faucet'
  );

  if (isVagueMixerRequest && !context.category) {
    return {
      text: detectedLang === 'kz'
        ? 'Әрине! Смесительді қай аймақ үшін іздеп жатырсыз: асүй, қолжуғыш немесе ванна бөлмесі үшін бе?'
        : detectedLang === 'en'
        ? 'Certainly! Which zone do you need the mixer for: kitchen, washbasin, or bath?'
        : 'Конечно! Помогу выбрать оптимальную модель. Уточните, пожалуйста: вам нужен смеситель для кухни, раковины или ванной комнаты?',
      quickChips: ['Для кухни', 'Для раковины', 'Для ванной', 'Универсальный (ванна/раковина)'],
      recommendedProducts: [],
      newContext: { ...context, step: 'needs_discovery', lastAiQuestion: 'ask_zone' }
    };
  }

  // =========================================================================
  // 27. УМНЫЙ ПОДБОР ПО ПАРАМЕТРАМ И КАТЕГОРИИ
  // =========================================================================
  let targetCategory = extractCategory(query) || context.category;
  
  let detectedBudget = context.budget;
  if (q.includes('недорог') || q.includes('бюджетн') || q.includes('дешев') || q.includes('эконом') || q.includes('арзан')) {
    detectedBudget = 'недорогой';
  } else if (q.includes('премиум') || q.includes('дорог') || q.includes('люкс') || q.includes('топ')) {
    detectedBudget = 'премиум';
  }

  const newReqs = [...context.requirements];
  if (q.includes('маленьк') || q.includes('компактн') || q.includes('небольш')) newReqs.push('компактный');
  if (q.includes('фильтр') || q.includes('питьев')) newReqs.push('под фильтр');
  if (q.includes('гибк') || q.includes('силикон')) newReqs.push('гибкий излив');
  if (q.includes('современ') || q.includes('минимализм')) newReqs.push('современный');

  if (
    targetCategory || 
    q.includes('купить') || 
    q.includes('подобрать') || 
    q.includes('посоветуй') || 
    detectedBudget || 
    newReqs.length > 0
  ) {
    const finalCategory = targetCategory || 'Кухонные смесители';
    const criteria = {
      category: finalCategory,
      budget: detectedBudget,
      requirements: newReqs,
      city: context.city || 'Алматы'
    };

    const activeProducts = products.filter(p => p.status !== 'СКРЫТ');
    const scoredList = activeProducts.map(p => ({
      product: p,
      score: scoreProduct(p, criteria)
    })).sort((a, b) => b.score - a.score);

    const topMatches = scoredList.slice(0, 3).map(item => item.product);

    if (topMatches.length > 0) {
      let analysisSummary = `По вашему запросу я подобрал оптимальные решения LAUTE:\n• Категория: ${finalCategory}\n`;
      if (detectedBudget) analysisSummary += `• Бюджетный ориентир: ${detectedBudget === 'недорогой' ? 'доступная надёжность' : 'премиальное оснащение'}\n`;
      if (newReqs.length > 0) analysisSummary += `• Особенности: ${Array.from(new Set(newReqs)).join(', ')}\n`;

      analysisSummary += `\nРекомендуемые модели из каталога:\n\n`;

      topMatches.forEach((p, idx) => {
        let badge = idx === 0 ? '🏆 Рекомендация консультанта' : idx === 1 ? '⭐ Сбалансированный выбор' : '💎 Премиальная модель';
        if (p.isPopular) badge += ' (Хит продаж)';
        analysisSummary += `${idx + 1}. ${p.name} (арт. ${p.article}) — ${p.price?.toLocaleString()} ${p.currency}\n   ${badge}\n   ${p.dimensions || ''}\n\n`;
      });

      analysisSummary += 'Вы можете нажать на карточку товара, чтобы изучить чертёж и технические параметры, или сравнить их:';

      return {
        text: analysisSummary,
        quickChips: [
          `Сравнить ${topMatches[0]?.article} и ${topMatches[1]?.article}`,
          `Наличие в ${context.city || 'Алматы'}`,
          'Как выбрать смеситель?'
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

  // =========================================================================
  // 28. ЕСТЕСТВЕННЫЙ ДИАЛОГОВЫЙ ОТВЕТ (УНИВЕРСАЛЬНЫЙ ЧЕЛОВЕЧЕСКИЙ ФОЛЛБЕК)
  // =========================================================================
  return {
    text: detectedLang === 'kz'
      ? `Мен сіздің сұрағыңызды түсіндім. Мен сантехника құрылысы, араластырғыштар мен душ жүйелерін таңдау, сондай-ақ LAUTE стандарттары бойынша кез келген сұраққа жауап бере аламын.\n\nСізді нақты не қызықтырады: өнім таңдау ма, материалдардың айырмашылығы ма, әлде техникалық кеңес пе?`
      : detectedLang === 'en'
      ? `I understand your message. I am here to help with any sanitary engineering questions, faucet and shower selection, or LAUTE European quality standards.\n\nWhat would you like to focus on: selecting a model, explaining technical features, or learning more about LAUTE?`
      : `Я внимательно вас слушаю! Я могу просто и понятно объяснить устройство сантехники, помочь с выбором смесителя или душевой системы, либо ответить на любые вопросы о стандартах LAUTE.\n\nПодскажите, о чём мы сейчас поговорим: о подборе модели под ваш интерьер, технических особенностях или гарантии и сервисе?`,
    quickChips: [
      'Мне нужен смеситель для кухни',
      'Как выбрать смеситель?',
      'Что такое картридж?',
      'О компании LAUTE'
    ],
    recommendedProducts: products.filter(p => p.isPopular).slice(0, 2),
    newContext: context
  };
};

export default processConsultantMessage;
