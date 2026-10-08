/**
 * Синтезатор ответов LAUTE AI (Response Synthesizer)
 * Формирует естественные, контекстно-связанные и достоверные ответы
 * на трех языках (RU, KZ, EN) без шаблонности и без роботизированных отписок.
 */

import { INTENTS } from './intentAnalyzer.js';

export class ResponseSynthesizer {
  /**
   * Синтез ответа на основе распознанного намерения, заземленных фактов и памяти
   */
  static synthesize({
    intentData,
    query,
    retrievedFacts = [],
    workingMemory,
    products = [],
    lang = 'ru',
  }) {
    const { intent, subType, concept } = intentData;
    const wm = workingMemory.snapshot();

    // 1. Приветствие
    if (intent === INTENTS.GREETING) {
      if (lang === 'kz') {
        return {
          text: 'Сәлеметсіз бе! Мен LAUTE ресми цифрлық AI-кеңесшісімін. Сантехника таңдауға, техникалық ерекшеліктерді түсіндіруге және сұрақтарыңызға жауап беруге әрқашан дайынмын. Сізге қандай көмек қажет?',
          quickChips: ['Асүйге арналған смеситель', 'Смеситель қалай таңдау керек?', 'Картридж деген не?', 'LAUTE компаниясы туралы'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'greeting' },
        };
      }
      if (lang === 'en') {
        return {
          text: 'Hello! I am the official digital AI consultant for LAUTE. I am here to help you navigate sanitary engineering, explain technical nuances, and select durable fittings. How can I assist you today?',
          quickChips: ['Kitchen mixers', 'How to choose a faucet?', 'What is a cartridge?', 'About LAUTE company'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'greeting' },
        };
      }
      return {
        text: 'Здравствуйте! Я официальный цифровой AI-консультант LAUTE. Помогу разобраться в нюансах сантехники, просто объясню устройство оборудования и помогу подобрать надежные решения. О чём хотите поговорить?',
        quickChips: ['Мне нужен смеситель для кухни', 'Как выбрать смеситель?', 'Что такое картридж?', 'Расскажи о компании LAUTE'],
        recommendedProducts: [],
        newContext: { ...wm, lastTopic: 'greeting' },
      };
    }

    // 2. Как дела? (Small talk)
    if (intent === INTENTS.SMALL_TALK && subType === 'how_are_you') {
      if (lang === 'kz') {
        return {
          text: 'Рахмет, бәрі тамаша! Барлық жүйелер штаттық режимде жұмыс істеп тұр. Сізге сантехника мен LAUTE өнімдері бойынша көмектесуге қуаныштымын. Қандай сұрағыңыз бар?',
          quickChips: ['Смеситель таңдау', 'Картридж деген не?', 'LAUTE сапасы'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'how_are_you' },
        };
      }
      if (lang === 'en') {
        return {
          text: 'I am doing great, thank you! Ready to assist you with sanitary engineering questions, product selections, and technical insights. What would you like to explore?',
          quickChips: ['How to choose a faucet?', 'Kitchen mixers', 'About LAUTE'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'how_are_you' },
        };
      }
      return {
        text: 'Спасибо, всё отлично! Работаю в штатном режиме и готов подробно ответить на любые вопросы о смесителях, материалах и инженерных решениях LAUTE. О чём хотите узнать?',
        quickChips: ['Как выбрать смеситель?', 'Что такое картридж?', 'Расскажи о компании LAUTE'],
        recommendedProducts: [],
        newContext: { ...wm, lastTopic: 'how_are_you' },
      };
    }

    // 3. Кто ты? (Identity)
    if (intent === INTENTS.IDENTITY) {
      if (lang === 'kz') {
        return {
          text: 'Мен — LAUTE ресми цифрлық AI-кеңесшісімін. Мен сантехника саласындағы нақты инженерлік білімдермен, өнім каталогымен және еуропалық сапа стандарттарымен жұмыс істеймін. Мақсатым — сізге сенімді шешім таңдауға көмектесу.',
          quickChips: ['Сіз не істей аласыз?', 'Смеситель қалай таңдау керек?', 'LAUTE туралы'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'identity' },
        };
      }
      if (lang === 'en') {
        return {
          text: 'I am the dedicated digital AI consultant of LAUTE. I specialize in architectural sanitary engineering, primary brass manufacturing standards, and finding the perfect faucets for modern spaces.',
          quickChips: ['What can you do?', 'How to choose a faucet?', 'About LAUTE'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'identity' },
        };
      }
      return {
        text: 'Я — собственный цифровой AI-консультант компании LAUTE. Моя задача — помогать выбирать надежную сантехнику, на простом и понятном языке объяснять сложные инженерные вещи (картриджи, аэраторы, сплавы) и подбирать модели под конкретные условия монтажа.',
        quickChips: ['Что ты умеешь?', 'Как выбрать смеситель?', 'Расскажи о компании LAUTE'],
        recommendedProducts: [],
        newContext: { ...wm, lastTopic: 'identity' },
      };
    }

    // 4. Что ты умеешь? / Помоги мне (Capabilities)
    if (intent === INTENTS.CAPABILITIES) {
      if (lang === 'kz') {
        return {
          text: 'Мен келесі бағыттар бойынша көмектесе аламын:\n• Асүйге, ваннаға немесе душқа арналған смесительді дұрыс таңдауға көмектесу;\n• Техникалық терминдерді (картридж, латунь, аэратор, излив) қарапайым тілмен түсіндіру;\n• Сұрақтарыңызға жауап беру және модельдерді салыстыру;\n• Өнімнің өндірістік стандарттары туралы нақты ақпарат беру.',
          quickChips: ['Смеситель таңдау', 'Картридж деген не?', 'LAUTE стандарттары'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'capabilities' },
        };
      }
      if (lang === 'en') {
        return {
          text: 'Here is what I can do for you:\n• Help you select the right mixer tap for kitchen, basin, or bath;\n• Explain engineering concepts in simple terms (cartridges, primary brass, aerators);\n• Compare different models and spout configurations;\n• Share verified manufacturer standards and warehouse availability.',
          quickChips: ['How to choose a faucet?', 'What is a cartridge?', 'About LAUTE'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'capabilities' },
        };
      }
      return {
        text: 'Я умею:\n• Понятно и без сложных терминов объяснять устройство сантехники;\n• Помогать подбирать смесители под размеры мойки или раковины;\n• Сравнивать характеристики и показывать различия моделей;\n• Рассказывать о гарантии, сервисе и европейских стандартах LAUTE.\n\nЗадайте любой интересующий вас вопрос!',
        quickChips: ['Мне нужен смеситель для кухни', 'Как выбрать смеситель?', 'Что такое картридж?'],
        recommendedProducts: [],
        newContext: { ...wm, lastTopic: 'capabilities' },
      };
    }

    // 4.5. Анализ возможностей партнерства (Partnership Opportunity Analysis)
    if (intent === INTENTS.COMPANY_INFO && subType === 'partnership_analysis') {
      if (lang === 'kz') {
        return {
          text: 'LAUTE-мен ынтымақтастық мүмкіндіктерін талдауға көмектесемін:\n\n1. Сіздің компанияңыздың бағыты қандай: өңірлік дистрибьюция, бөлшек сауда желісі, құрылыс нысандарын жинақтау немесе монтаждау ұйымы?\n2. Қай өңірде жұмыс істейсіз?\n3. Қандай өнім номенклатурасы қызықтырады?\n\nЖауабыңызды жазыңыз, мен мүмкіндіктерді анықтап, өңірлік менеджерге нақты сұраныс дайындауға көмектесемін.',
          quickChips: ['Өңірлік дистрибьюция', 'Құрылыс нысанын жинақтау', 'Бөлшек сауда салоны', 'Монтаж ұйымы'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'partnership_analysis', lastAiQuestion: 'ask_partner_type' }
        };
      }
      if (lang === 'en') {
        return {
          text: 'I will gladly help analyze partnership opportunities with LAUTE for your business:\n\n1. What is your primary business profile: regional wholesale distribution, retail sanitary showrooms, construction developer supply, or plumbing contractor?\n2. What geographic region/market do you operate in?\n3. Do you require project specification or regular warehouse supplies?\n\nTell me about your business and I will outline available cooperation formats.',
          quickChips: ['Wholesale distribution', 'Developer project spec', 'Retail showroom', 'Installation contractor'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'partnership_analysis', lastAiQuestion: 'ask_partner_type' }
        };
      }
      return {
        text: 'Я помогу проанализировать варианты сотрудничества с LAUTE для вашей компании без лишней бюрократии:\n\n1. Какой формат ближе вашей деятельности: оптовая дистрибьюция, торговая сеть/салон сантехники, комплектация строительного объекта или монтажные работы?\n2. В каком городе и регионе вы работаете?\n3. Требуется ли подбор спецификации под конкретный проект или регулярные оптовые поставки складской номенклатуры?\n\nНапишите кратко о вашей компании — и я сориентирую по доступным возможностям сотрудничества.',
        quickChips: ['Оптовая дистрибьюция', 'Комплектация объекта', 'Розничная сеть / салон', 'Монтажная организация'],
        recommendedProducts: [],
        newContext: { ...wm, lastTopic: 'partnership_analysis', lastAiQuestion: 'ask_partner_type' }
      };
    }

    // 5. Расскажи о компании LAUTE
    if (intent === INTENTS.COMPANY_INFO) {
      return {
        text: 'LAUTE — бренд сантехники, созданный по европейским архитектурным стандартам надежности и лаконичного дизайна.\n\nКлючевые принципы производства:\n• Первичная латунь CW617N со сверхнизким содержанием свинца (<1.6%);\n• 100% заводские гидроиспытания каждого корпуса давлением 16 бар;\n• Керамические картриджи с алмазной шлифовкой на 500 000+ рабочих циклов;\n• Официальная гарантия 5 лет на латунные корпуса и развитая сеть складов (Алматы, Астана, Новосибирск, Москва).',
        quickChips: ['Что производит LAUTE?', 'Как выбрать смеситель?', 'О гарантии и сервисе'],
        recommendedProducts: [],
        newContext: { ...wm, lastTopic: 'company_info' },
      };
    }

    // 6. Что вы производите? (Production range)
    if (intent === INTENTS.CATALOG_QUERY && subType === 'production_range') {
      return {
        text: 'LAUTE производит полный спектр надежной сантехнической арматуры:\n• Кухонные смесители (классические, с гибким изливом и 2-в-1 под фильтр питьевой воды);\n• Смесители для раковины (стандартные и высокие для накладных раковин-чаш);\n• Смесители для ванны (монолитные и универсальные с изливом 350 мм);\n• Душевые системы и телескопические гарнитуры с тропическим душем;\n• Оригинальные комплектующие (керамические картриджи, аэраторы Neoperl).\n\nДля какой зоны вы хотите подобрать решение?',
        quickChips: ['Кухонные смесители', 'Смесители для раковины', 'Смесители для ванны', 'Душевые системы'],
        recommendedProducts: [],
        newContext: { ...wm, lastTopic: 'production_range', lastAiQuestion: 'ask_zone' },
      };
    }

    // 7. Что такое смеситель?
    if (intent === INTENTS.TECH_EXPLANATION && concept === 'mixer_definition') {
      if (lang === 'kz') {
        return {
          text: 'Араластырғыш (смеситель) — бұл ыстық және суық суды бір ағынға араластырып, оның температурасы мен қысымын реттейтін сантехникалық құрылғы. Ол суды қажетті мөлшерде және ыңғайлы температурада тұтынушыға жеткізеді.',
          quickChips: ['Смеситель қалай таңдау керек?', 'Картридж деген не?', 'LAUTE өнімдері'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'mixer_definition' },
        };
      }
      if (lang === 'en') {
        return {
          text: 'A mixer tap (faucet) is a sanitary engineering device that blends hot and cold water supplies into a unified stream, allowing precise control over temperature and water pressure with a single lever or handles.',
          quickChips: ['How to choose a faucet?', 'What is a cartridge?', 'Kitchen mixers'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'mixer_definition' },
        };
      }
      return {
        text: 'Смеситель — это сантехнический прибор, который смешивает потоки горячей и холодной воды в единую струю и позволяет точно регулировать её температуру и напор с помощью рычага или вентилей.',
        quickChips: ['Как выбрать смеситель?', 'Что такое картридж?', 'Что лучше: высокий или низкий излив?'],
        recommendedProducts: [],
        newContext: { ...wm, lastTopic: 'mixer_definition' },
      };
    }

    // 8. Что такое картридж в смесителе?
    if (intent === INTENTS.TECH_EXPLANATION && concept === 'cartridge') {
      if (lang === 'kz') {
        return {
          text: 'Қарапайым сөзбен айтқанда, картридж — бұл араластырғыштың ішкі «жүрегі».\n\nОның ішінде өте тегіс екі керамикалық пластина орналасқан. Сіз тұтқаны көтергенде немесе бұрғанда, бұл пластиналар бір-біріне қатысты жылжып:\n• Ыстық және суық судың ағынын дәл реттейді;\n• Су қысымын біркелкі ашады немесе жабады.\n\nLAUTE өнімдерінде дискілері алмазбен жылтыратылған керамикалық картридждер қолданылады. Олар кем дегенде 500 000 жұмыс цикліне есептелген (бұл тұрмыста 10+ жыл мінсіз жұмыс деген сөз).',
          quickChips: ['Неге краннан су ағуы мүмкін?', 'Смеситель қалай таңдау керек?', 'LAUTE латуні туралы'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'cartridge_explanation', lastSubject: 'cartridge' },
        };
      }
      if (lang === 'en') {
        return {
          text: 'In simple terms, the cartridge is the mechanical "heart" of any single-lever mixer tap.\n\nInside, there are two precisely diamond-lapped ceramic discs with engineered cutouts. When you move the handle, these plates glide against each other:\n• Balancing hot and cold water flows to hit your exact temperature;\n• Controlling water volume smoothly without dripping.\n\nLAUTE uses European-standard ceramic cartridges tested for at least 500,000 operational cycles, providing over a decade of leak-free service.',
          quickChips: ['Why do faucets leak?', 'How to choose a faucet?', 'LAUTE materials'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'cartridge_explanation', lastSubject: 'cartridge' },
        };
      }
      return {
        text: 'Простыми словами, картридж — это внутреннее «сердце» любого современного однорычажного смесителя.\n\nВнутри его корпуса находятся две гладкие керамические пластины с микроотверстиями. Когда вы двигаете рычаг крана, эти пластины смещаются относительно друг друга:\n• Они смешивают холодную и горячую воду в нужной пропорции, задавая температуру;\n• Они плавно перекрывают или открывают напор воды.\n\nВ смесителях LAUTE установлены картриджи с алмазной притиркой керамических дисков (Sedal / Kerox), выдерживающие свыше 500 000 рабочих циклов. Это гарантирует плавный ход рукоятки и отсутствие капель на протяжении более 10 лет.',
        quickChips: ['Почему вода может течь из-под крана?', 'Как выбрать смеситель?', 'Из какого материала корпус?'],
        recommendedProducts: [],
        newContext: { ...wm, lastTopic: 'cartridge_explanation', lastSubject: 'cartridge' },
      };
    }

    // 9. Как выбрать смеситель?
    if (intent === INTENTS.RECOMMENDATION && subType === 'selection_guide') {
      if (lang === 'kz') {
        return {
          text: 'Сенімді және ыңғайлы араластырғыш таңдау үшін 5 негізгі ережені есте сақтаңыз:\n\n1. Корпус материалы: Тек бастапқы латунь (мысалы, LAUTE CW617N). Силуминнен аулақ болыңыз — ол жеңіл және тез жарылады.\n2. Картридж сапасы: Алмазбен өңделген керамикалық дискілер кемінде 500 000 циклге қызмет етуі керек.\n3. Излив өлшемі: Жуғыштың тереңдігіне сәйкес келуі тиіс (су шашырамауы үшін).\n4. Аэратор: Әк қағынан тазартылатын Neoperl аэраторлары суды 30%-ға дейін үнемдейді.\n5. Зауыттық кепілдік: Корпусқа кемінде 5 жыл және аймақтық қосалқы бөлшектер базасы болуы шарт.\n\nСіз смесительді қай бөлмеге таңдап жатырсыз — асүй ме, ванна ма?',
          quickChips: ['Асүй үшін', 'Ванна үшін', 'Қолжуғыш үшін', 'LAUTE сапасы'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'selection_guide', lastAiQuestion: 'ask_zone' },
        };
      }
      return {
        text: 'Чтобы выбрать смеситель, который прослужит более 10 лет без хлопот, обратите внимание на 5 ключевых факторов:\n\n1. Материал корпуса: Только первичная сантехническая латунь марки CW617N. Она тяжёлая, не боится коррозии и не содержит токсичных примесей. Избегайте лёгкого силумина.\n2. Картридж: Керамический узел европейского стандарта (Sedal / Kerox) с алмазной притиркой дисков на 500 000+ рабочих циклов.\n3. Геометрия излива: Струя воды должна падать точно в центр сливного отверстия мойки или чуть впереди, на высоте, исключающей брызги.\n4. Аэратор: Качественный аэратор (Neoperl) насыщает струю воздухом, делает её мягкой и бесшумной, экономя до 30% воды.\n5. Гарантия и сервис: Заводская гарантия 5 лет на корпус и наличие запчастей на региональных складах.\n\nДля какой зоны вам сейчас нужен смеситель: кухни, раковины или ванной комнаты?',
        quickChips: ['Для кухни', 'Для раковины', 'Для ванной', 'О материалах LAUTE'],
        recommendedProducts: [],
        newContext: { ...wm, lastTopic: 'selection_guide', lastAiQuestion: 'ask_zone' },
      };
    }

    // 10. Чем отличается смеситель для кухни от смесителя для ванной?
    if (intent === INTENTS.COMPARISON && concept === 'kitchen_vs_bath') {
      return {
        text: 'Между смесителем для кухни и для ванной есть три главных инженерных различия:\n\n1. Подвижность и высота излива: На кухне излив всегда поворотный (часто высокий, Г-образный или гибкий), чтобы было удобно мыть посуду и набирать воду в кастрюли. В ванной смеситель обычно компактный, монолитный, рассчитанный на быстрый набор ванны без разбрызгивания.\n2. Наличие дивертора (переключателя на душ): Смеситель для ванны оснащён переключателем между изливом и лейкой душа. У кухонного смесителя дивертора нет, но может быть второй рычаг под фильтр питьевой воды.\n3. Способ монтажа: Кухонный смеситель крепится на мойку или столешницу на одно отверстие, а смеситель для ванны крепится на стену на два вывода воды через эксцентрики.',
        quickChips: ['Что лучше: высокий или низкий излив?', 'Как выбрать смеситель?', 'Показать кухонные смесители'],
        recommendedProducts: [],
        newContext: { ...wm, lastTopic: 'concept_differences', lastSubject: 'kitchen_vs_bath' },
      };
    }

    // 11. Что лучше: высокий или низкий излив?
    if (intent === INTENTS.COMPARISON && concept === 'spout_height') {
      return {
        text: 'Однозначного ответа нет — выбор зависит от глубины вашей мойки и задач:\n\nВысокий излив (280–380 мм):\n➕ Плюсы: максимальный комфорт при мытье противней, высоких кастрюль и наборе воды в графины.\n➖ Минусы: если чаша мойки неглубокая (меньше 18–19 см), неизбежно будут брызги на столешницу.\n\nНизкий или средний излив (160–240 мм):\n➕ Плюсы: практичность, отсутствие брызг, аккуратный вид. Идеально под окно или навесные шкафы.\n➖ Минусы: под ним сложнее мыть крупную габаритную посуду.\n\nКакая у вас глубина чаши мойки? Это поможет окончательно определиться с высотой.',
        quickChips: ['Глубокая мойка (более 19 см)', 'Неглубокая мойка (до 18 см)', 'С гибким изливом'],
        recommendedProducts: [],
        newContext: { ...wm, lastTopic: 'spout_height_advice', lastSubject: 'spout_height' },
      };
    }

    // 12. Почему вода может течь из-под крана? (Troubleshooting)
    if (intent === INTENTS.TROUBLESHOOTING && concept === 'leak_reasons') {
      return {
        text: 'Вода может течь из-под смесителя по нескольким распространенным техническим причинам:\n\n1. Износ или повреждение керамического картриджа — если в водопроводной воде есть окалина или песок, они могут попасть между пластинами, нарушая герметичность.\n2. Затвердевание или износ уплотнительных резиновых колец (прокладок) от горячей воды и солей жесткости.\n3. Протечка в месте крепления поворотного излива — указывает на истирание уплотнительных манжет на основании гусака.\n4. Ослабление прижимной гайки картриджа под декоративным колпачком.\n5. Повышенное давление в трубах (гидроудары при отсутствии редуктора).\n\nНе видя кран, поставить точный диагноз невозможно, но в подавляющем большинстве случаев вопрос решает простая замена картриджа или уплотнителей.',
        quickChips: ['Что такое картридж?', 'Условия гарантии LAUTE', 'Как выбрать надежный смеситель?'],
        recommendedProducts: [],
        newContext: { ...wm, lastTopic: 'troubleshooting_leak', lastSubject: 'leak_reasons' },
      };
    }

    // 13. Рекомендация для современной кухни
    if (intent === INTENTS.RECOMMENDATION && subType === 'modern_kitchen') {
      const modernKitchenProds = products.filter(p =>
        p.category === 'Кухонные смесители' && (p.article === 'LT-K102-FLT' || p.article === 'LT-K103-FLX')
      );
      return {
        text: 'Для современной кухни я бы однозначно выбрал смеситель с совмещённым каналом под фильтр питьевой воды 2-в-1 (например, флагманский LAUTE Quadro Filter) либо модель с гибким изливом (LAUTE Flexi Pro):\n\n• Это практично: не нужно ставить отдельный кран для питьевой воды и сверлить мойку;\n• Высокий излив позволяет свободно промывать большие кастрюли и противни;\n• Корпус из латуни CW617N и картридж Sedal гарантируют плавность и тишину при открывании.\n\nХотите узнать подробнее о технических характеристиках или о том, почему важен качественный картридж?',
        quickChips: ['А почему?', 'А если кухня маленькая?', 'Показать LAUTE Quadro Filter', 'Что такое картридж?'],
        recommendedProducts: modernKitchenProds.slice(0, 2),
        newContext: {
          ...wm,
          category: 'Кухонные смесители',
          lastTopic: 'kitchen_recommendation',
          lastSubject: 'modern_kitchen_recommendation'
        }
      };
    }

    // 14. Анафора «А почему?»
    if (intent === INTENTS.ANAPHORA_FOLLOWUP && subType === 'why') {
      if (wm.lastSubject === 'modern_kitchen_recommendation' || wm.lastTopic === 'kitchen_recommendation') {
        return {
          text: 'Потому что на современной кухне эргономика и чистота линий выходят на первый план:\n\n1. Свобода движений: Высокий поворотный или гибкий излив позволяет без труда мыть противни и наполнять высокие кастрюли, не ударяя посудой о кран.\n2. Канал 2-в-1 для питьевой воды: Вам не придётся сверлить столешницу или мойку под отдельный тонкий кран для фильтра — обе линии воды выведены в один латунный корпус с раздельными каналами.\n3. Ресурс и плавность: Первичная латунь марки CW617N и керамический картридж на 500 000 циклов дают мягкий ход ручки и полностью исключают риск протечек.\n\nА какая у вас глубина чаши мойки? Это поможет окончательно определиться с высотой.',
          quickChips: ['А если кухня маленькая?', 'Показать такие смесители', 'Что такое картридж?'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'why_explained', lastSubject: 'modern_kitchen_why' }
        };
      }
      return {
        text: 'Этот подход основан на трёх ключевых принципах: долговечность материалов (первичная латунь CW617N), устойчивость к износу и максимальный комфорт в ежедневном использовании. О каком именно нюансе рассказать подробнее?',
        quickChips: ['О материалах LAUTE', 'Как выбрать смеситель?', 'Подобрать под мой проект'],
        recommendedProducts: [],
        newContext: { ...wm, lastTopic: 'why_explained' }
      };
    }

    // 15. Анафора «А если кухня маленькая?»
    if (intent === INTENTS.ANAPHORA_FOLLOWUP && subType === 'small_kitchen') {
      const compactProducts = products.filter(p =>
        p.category === 'Кухонные смесители' &&
        (p.tags?.includes('компактный') || p.dimensions?.includes('240') || p.article === 'LT-K101-CHR')
      );
      return {
        text: 'Если кухня небольшая, приоритеты немного меняются:\n\n1. Высота излива: Слишком высокий смеситель (35–40 см) на компактной мойке приведёт к брызгам на столешницу и фартук. Оптимальна средняя высота 220–260 мм с вылетом излива около 180–200 мм.\n2. Геометрия: Лаконичный поворотный излив не загромождает рабочее пространство и не мешает открыванию настенных шкафов или окна.\n3. В линейке LAUTE для небольших кухонь отлично подходит модель LAUTE Prime K-10: компактные габариты, латунный корпус CW617N и мягкий аэратор Neoperl против брызг.\n\nПоказать подробные размеры и чертёж этой модели?',
        quickChips: ['Показать LAUTE Prime K-10', 'А как насчет фильтра 2-в-1?', 'Как выбрать смеситель?'],
        recommendedProducts: compactProducts.slice(0, 2),
        newContext: {
          ...wm,
          category: 'Кухонные смесители',
          requirements: [...wm.requirements, 'компактный'],
          lastTopic: 'small_kitchen_advice',
          lastSubject: 'compact_kitchen_faucet'
        }
      };
    }

    // 16. Запрос на покупку без зоны («Хочу купить смеситель»)
    if (intent === INTENTS.RECOMMENDATION && subType === 'general_faucet_request') {
      return {
        text: 'С удовольствием помогу подобрать надежный смеситель LAUTE! Подскажите, для какой зоны подбираем: кухни, раковины или ванной комнаты?',
        quickChips: ['Для кухни', 'Для раковины', 'Для ванной', 'Показать хиты продаж'],
        recommendedProducts: [],
        newContext: { ...wm, lastTopic: 'selection_start', lastAiQuestion: 'ask_zone' }
      };
    }

    // 17. Ответ на уточнение зоны
    if (intent === INTENTS.RECOMMENDATION && subType === 'zone_specified') {
      const qLower = String(query).toLowerCase();
      if (qLower.includes('кухн') || qLower.includes('асүй') || qLower.includes('kitchen')) {
        return {
          text: 'Отлично, подбираем для кухни! Чтобы предложить самый удобный вариант, подскажите:\n1. Планируете ли подключать фильтр питьевой воды (у нас есть удобные модели 2-в-1, чтобы не ставить второй кран)?\n2. Мойка просторная или компактная?',
          quickChips: ['С подключением фильтра 2-в-1', 'Для маленькой кухни', 'С гибким изливом', 'Показать все варианты'],
          recommendedProducts: [],
          newContext: { ...wm, category: 'Кухонные смесители', lastTopic: 'kitchen_selection', lastAiQuestion: 'ask_kitchen_details' }
        };
      }
      if (qLower.includes('раковин') || qLower.includes('умывальн')) {
        return {
          text: 'Понял, смеситель для раковины! Уточните, пожалуйста: раковина обычная врезная (в тумбу) или накладная чаша на столешницу? (Для чаши требуется высокий смеситель с увеличенным корпусом).',
          quickChips: ['Обычная врезная раковина', 'Накладная раковина-чаша', 'С гигиеническим душем'],
          recommendedProducts: [],
          newContext: { ...wm, category: 'Смесители для раковины', lastTopic: 'basin_selection', lastAiQuestion: 'ask_basin_type' }
        };
      }
      return {
        text: 'Отлично! Для ванной комнаты у нас есть два ключевых решения:\n1. Монолитные короткие смесители с переключателем на душ — для отдельной ванны;\n2. Универсальные смесители с длинным поворотным изливом 350 мм — если один смеситель обслуживает и ванну, и рядом стоящую раковину.\n\nКакой вариант лучше подойдёт под вашу планировку?',
        quickChips: ['Короткий излив для ванны', 'Длинный излив 350 мм (универсальный)', 'Душевая стойка'],
        recommendedProducts: [],
        newContext: { ...wm, category: 'Смесители для ванны', lastTopic: 'bath_selection', lastAiQuestion: 'ask_bath_type' }
      };
    }

    // 18. Интересный факт
    if (intent === INTENTS.SMALL_TALK && subType === 'interesting_fact') {
      return {
        text: 'Вот интересный инженерный факт: керамические пластины внутри картриджа смесителей LAUTE шлифуются алмазным порошком до оптической плоскопараллельности с допуском менее 0.1 микрона. За счёт этого между ними возникает эффект молекулярного притяжения — вода не способна просочиться даже при давлении гидроудара в 16 бар!',
        quickChips: ['Что такое картридж?', 'О материалах LAUTE', 'Как выбрать смеситель?'],
        recommendedProducts: [],
        newContext: { ...wm, lastTopic: 'fact_shared' }
      };
    }

    // 19. Благодарность
    if (intent === INTENTS.GRATITUDE) {
      if (lang === 'kz') {
        return {
          text: 'Оқасы жоқ! Сізге көмектескеніме өте қуаныштымын. Тағы да сұрақтарыңыз болса, әрқашан осындамын!',
          quickChips: ['Смеситель таңдау', 'Каталогты көрсету'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'gratitude' }
        };
      }
      if (lang === 'en') {
        return {
          text: 'You are very welcome! Glad I could help. Let me know if you need any more recommendations or technical details.',
          quickChips: ['Explore catalog', 'How to choose a faucet?'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'gratitude' }
        };
      }
      return {
        text: 'Пожалуйста! Рад был помочь разобраться. Если появятся ещё вопросы по сантехнике или монтажу — я всегда на связи!',
        quickChips: ['Показать каталог', 'Как выбрать смеситель?'],
        recommendedProducts: [],
        newContext: { ...wm, lastTopic: 'gratitude' }
      };
    }

    // 20. Прощание
    if (intent === INTENTS.FAREWELL) {
      if (lang === 'kz') {
        return {
          text: 'Сау болыңыз! Күніңіз сәтті өтсін! LAUTE сапасына сенім білдіргеніңізге рахмет.',
          quickChips: ['Сәлем!'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'farewell' }
        };
      }
      if (lang === 'en') {
        return {
          text: 'Goodbye! Have a wonderful day, and thank you for choosing LAUTE architectural sanitary solutions.',
          quickChips: ['Hello!'],
          recommendedProducts: [],
          newContext: { ...wm, lastTopic: 'farewell' }
        };
      }
      return {
        text: 'До свидания! Отличного вам дня и удачного выбора надежной сантехники LAUTE!',
        quickChips: ['Привет!'],
        recommendedProducts: [],
        newContext: { ...wm, lastTopic: 'farewell' }
      };
    }

    // По умолчанию, если заземленные факты найдены
    if (retrievedFacts.length > 0) {
      const topFact = retrievedFacts[0];
      return {
        text: `${topFact.text}\n\nЧем еще я могу вам помочь по продукции или сантехнике LAUTE?`,
        quickChips: ['Как выбрать смеситель?', 'О компании LAUTE', 'Показать каталог'],
        recommendedProducts: [],
        newContext: { ...wm, lastTopic: 'fact_retrieved' }
      };
    }

    // Запасной естественный ответ
    return {
      text: lang === 'kz'
        ? 'Мен LAUTE сантехникасы бойынша барлық сұрақтарыңызға жауап беруге дайынмын. Нақты қай бағытты талқылағыңыз келеді?'
        : lang === 'en'
        ? 'I am ready to help you with any questions regarding LAUTE sanitary products and engineering solutions. What would you like to know?'
        : 'Я готов помочь вам с любыми вопросами по продукции и сантехнике LAUTE. О чём хотите узнать подробнее?',
      quickChips: ['Мне нужен смеситель для кухни', 'Как выбрать смеситель?', 'Что такое картридж?'],
      recommendedProducts: [],
      newContext: { ...wm, lastTopic: 'general_help' }
    };
  }
}

export default ResponseSynthesizer;
