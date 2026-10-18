import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  ArrowRight, 
  PackageCheck, 
  Info, 
  Eye, 
  Scale, 
  MapPin, 
  Sparkles, 
  Layers,
  CheckCircle2,
  Warehouse,
  Ruler,
  ShoppingBag,
  Plus,
  Minus,
  Check
} from 'lucide-react';
import { classifyProductImages, formatProductDisplay } from '../utils/imageHelper';

export const CatalogPage = () => {
  const { 
    lang, 
    t, 
    openPartnerModal, 
    openAuthModal, 
    products, 
    openProductModal, 
    startComparison,
    addToCart,
    updateCartQuantity,
    getCartItemQuantity,
    openCartModal,
    cartDistinctCount,
    cartTotalUnits,
    cartTotalKnownAmount,
    adminSession,
    isB2BAuthorized,
    warehousesList,
    activeWarehouseId,
    activeWarehouse,
    setClientSelectedWarehouse,
    getStockForSku
  } = useApp();

  const [catalogView, setCatalogView] = useState('products'); // 'products' | 'categories'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMounting, setSelectedMounting] = useState('all');

  const baseUrl = import.meta.env.BASE_URL;
  const cat = t.catalogPage || {};

  const getImgUrl = (path) => {
    if (!path) return `${baseUrl}laute-logo.png`;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const clean = path.replace(/^\//, '');
    return `${baseUrl}${clean}`;
  };

  const categoryTranslations = {
    'kitchen-mixers': {
      name: { ru: 'Кухонные смесители', kz: 'Асүй араластырғыштары', en: 'Kitchen Mixers' },
      badge: { ru: 'Высокий спрос', kz: 'Жоғары сұраныс', en: 'High Demand' },
      desc: {
        ru: 'Смесители с высоким изливом, подключением питьевого фильтра, гибким изливом и выдвижной лейкой. Керамический картридж.',
        kz: 'Биік шүмегі бар, ауыз су сүзгісі қосылатын, икемді шүмегі және тартылатын сусепкіші бар араластырғыштар. Керамикалық картридж.',
        en: 'Mixers with high spout, filtered drinking water connection, flexible spout and pull-out spray. Ceramic cartridge.'
      },
      filters: {
        ru: 'Под фильтр • Гибкий излив • Выдвижная лейка • Однорычажные',
        kz: 'Сүзгіге арналған • Икемді шүмек • Тартылатын сусепкіш • Біртұтқалы',
        en: 'Filter connection • Flexible spout • Pull-out spray • Single lever'
      },
      specs: {
        ru: ['Высота излива: 180–320 мм', 'Подключение фильтра: опционально', 'Управление: однорычажное', 'Материал: сантехническая латунь'],
        kz: ['Шүмек биіктігі: 180–320 мм', 'Сүзгіні қосу: таңдау бойынша', 'Басқару: біртұтқалы', 'Материал: сантехникалық жез'],
        en: ['Spout height: 180–320 mm', 'Filter connection: optional', 'Control: single lever', 'Material: plumbing brass']
      }
    },
    'basin-mixers': {
      name: { ru: 'Смесители для раковины', kz: 'Қолжуғыш араластырғыштары', en: 'Basin Mixers' },
      badge: { ru: 'Базовая программа', kz: 'Негізгі бағдарлама', en: 'Core Line' },
      desc: {
        ru: 'Низкие и высокие модели для накладных чаш, настенные варианты со стабильным картриджем и экономичным аэратором.',
        kz: 'Үстеме тостағандарға арналған аласа және биік модельдер, тұрақты картриджі және үнемді аэраторы бар қабырғалық нұсқалар.',
        en: 'Low and high models for countertop bowls, wall-mounted options with durable cartridge and eco aerator.'
      },
      filters: {
        ru: 'Низкие • Высокие для чаш • Настенные • С донным клапаном',
        kz: 'Аласа • Тостағандарға арналған биік • Қабырғалық • Түптік клапанмен',
        en: 'Low • High for vessel sinks • Wall-mounted • With click-clack'
      },
      specs: {
        ru: ['Высота: 140–280 мм', 'Для накладных чаш', 'Мягкий аэратор', 'Керамический узел'],
        kz: ['Биіктігі: 140–280 мм', 'Үстеме тостағандар үшін', 'Жұмсақ аэратор', 'Керамикалық торап'],
        en: ['Height: 140–280 mm', 'For vessel bowls', 'Soft aerator', 'Ceramic cartridge']
      }
    },
    'bath-mixers': {
      name: { ru: 'Смесители для ванны', kz: 'Ванна араластырғыштары', en: 'Bath Mixers' },
      badge: { ru: 'Надёжность', kz: 'Сенімділік', en: 'Durability' },
      desc: {
        ru: 'Модели с коротким монолитным или длинным поворотным изливом, настенного монтажа и врезные на борт ванны.',
        kz: 'Қысқа тұтас немесе ұзын бұрылмалы шүмегі бар, қабырғаға орнатылатын және ванна бортына кіріктірілетін модельдер.',
        en: 'Models with short fixed or long swivel spout, wall-mounted and bathtub rim deck-mounted.'
      },
      filters: {
        ru: 'Короткий излив • Длинный поворотный • Настенный • На борт',
        kz: 'Қысқа шүмек • Ұзын бұрылмалы • Қабырғалық • Бортқа орнатылатын',
        en: 'Short spout • Long swivel • Wall mount • Deck mount'
      },
      specs: {
        ru: ['Длина излива: 100–350 мм', 'Межосевое: 150 мм', 'Дивертор: флажковый/кнопочный', 'Душевой выход: G 1/2"'],
        kz: ['Шүмек ұзындығы: 100–350 мм', 'Ось аралығы: 150 мм', 'Дивертор: жалаушалы/түймелі', 'Душ шығысы: G 1/2"'],
        en: ['Spout length: 100–350 mm', 'Center distance: 150 mm', 'Diverter: lever/pull', 'Shower outlet: G 1/2"']
      }
    },
    'universal-mixers': {
      name: { ru: 'Универсальные смесители (ванна/раковина)', kz: 'Әмбебап араластырғыштар (ванна/қолжуғыш)', en: 'Universal Mixers (Bath/Basin)' },
      badge: { ru: 'Популярная серия', kz: 'Танымал топтама', en: 'Popular Series' },
      desc: {
        ru: 'Классические решения с длинным поворотным изливом 300–400 мм для совмещённого обслуживания ванны и умывальника.',
        kz: 'Ванна мен жуғышқа бірлескен қызмет көрсетуге арналған ұзын 300–400 мм бұрылмалы шүмегі бар классикалық шешімдер.',
        en: 'Classic solutions with long swivel spout 300–400 mm for combined bath and basin use.'
      },
      filters: {
        ru: 'Поворотный излив 300–400 мм • Настенный монтаж • С душевым набором',
        kz: 'Бұрылмалы шүмек 300–400 мм • Қабырғалық орнату • Душ жиынтығымен',
        en: 'Swivel spout 300–400 mm • Wall mounted • With shower set'
      },
      specs: {
        ru: ['Вылет излива: 300–400 мм', 'Угол поворота: 360°', 'Стандартная посадка 150 мм', 'Надёжный переключатель'],
        kz: ['Шүмек шығуы: 300–400 мм', 'Бұрылу бұрышы: 360°', 'Стандартты бекіту 150 мм', 'Сенімді ауыстырғыш'],
        en: ['Spout projection: 300–400 mm', 'Swivel angle: 360°', 'Standard 150 mm fitting', 'Durable diverter']
      }
    },
    'shower-mixers': {
      name: { ru: 'Смесители для душа', kz: 'Душ араластырғыштары', en: 'Shower Mixers' },
      badge: { ru: 'Компактные', kz: 'Ықшам', en: 'Compact' },
      desc: {
        ru: 'Компактные смесители без излива наружного и скрытого монтажа, обеспечивающие эргономичное управление душевой зоной.',
        kz: 'Душ аймағын эргономикалық басқаруды қамтамасыз ететін, шүмексіз, сыртқы және жасырын орнатылатын ықшам араластырғыштар.',
        en: 'Compact spoutless mixers for exposed and concealed installation, providing ergonomic shower control.'
      },
      filters: {
        ru: 'Без излива • Наружный монтаж • Встраиваемый блок',
        kz: 'Шүмексіз • Сыртқы монтаж • Кіріктірілетін блок',
        en: 'Spoutless • Exposed mount • Concealed body'
      },
      specs: {
        ru: ['Монтаж: настенный / скрытый', 'Подключение: 1/2"', 'Плавная регулировка', 'Шумопоглощение'],
        kz: ['Орнату: қабырғалық / жасырын', 'Қосылу: 1/2"', 'Бірқалыпты реттеу', 'Шу басу'],
        en: ['Mount: wall / concealed', 'Inlet: 1/2"', 'Smooth regulation', 'Noise reduction']
      }
    },
    'bidet-hygiene': {
      name: { ru: 'Биде и гигиенический душ', kz: 'Биде және гигиеналық душ', en: 'Bidet & Hygienic Shower' },
      badge: { ru: 'Комфорт', kz: 'Жайлылық', en: 'Comfort' },
      desc: {
        ru: 'Смесители на биде с поворотным аэратором, а также встраиваемые и настенные комплекты гигиенического душа со шлангом и лейкой.',
        kz: 'Бұрылмалы аэраторы бар бидеге арналған араластырғыштар, сондай-ақ түтігі мен сусепкіші бар гигиеналық душтың кіріктірілетін және қабырғалық жиынтықтары.',
        en: 'Bidet mixers with swivel aerator, as well as concealed and wall-mounted hygienic shower sets with hose and handset.'
      },
      filters: {
        ru: 'Для биде • Комплект гигиенического душа • Встраиваемые',
        kz: 'Биде үшін • Гигиеналық душ жиынтығы • Кіріктірілетін',
        en: 'For bidet • Hygienic shower set • Concealed'
      },
      specs: {
        ru: ['Шланг с защитой от перекручивания', 'Лейка с клапаном Stop', 'Компактный настенный держатель'],
        kz: ['Бұралудан қорғалған түтік', 'Stop клапаны бар сусепкіш', 'Ықшам қабырға ұстағышы'],
        en: ['Anti-twist hose', 'Handset with Stop valve', 'Compact wall bracket']
      }
    },
    'sinks': {
      name: { ru: 'Кухонные мойки', kz: 'Асүй жуғыштары', en: 'Kitchen Sinks' },
      badge: { ru: 'Многофункциональные', kz: 'Көпфункционалды', en: 'Multifunctional' },
      desc: {
        ru: 'Нержавеющие кухонные мойки различной толщины стали и конфигураций: с крылом, интегрированным водопадом, коландером и шумоизоляцией.',
        kz: 'Тот баспайтын болаттан жасалған әртүрлі қалыңдықтағы және конфигурациядағы асүй жуғыштары: қанаты бар, кіріктірілген сарқырамасы бар, коландері және дыбыс оқшаулағышы бар.',
        en: 'Stainless steel kitchen sinks of various thicknesses and configurations: with drainboard, waterfall, colander, and noise insulation.'
      },
      filters: {
        ru: 'Врезные • Подстольные • С крылом • Интегрированные системы',
        kz: 'Ойып орнатылатын • Үстеласты • Қанаты бар • Кіріктірілген жүйелер',
        en: 'Inset • Undermount • With drainboard • Integrated systems'
      },
      specs: {
        ru: ['Шумоизоляционное покрытие', 'Глубина чаши: 180–220 мм', 'Комплект сливной арматуры', 'Отверстия под смеситель/дозатор'],
        kz: ['Шу оқшаулайтын жабын', 'Тостаған тереңдігі: 180–220 мм', 'Ағызу арматурасының жиынтығы', 'Араластырғыш/мөлшерлегіш ойықтары'],
        en: ['Sound-deadening pads', 'Bowl depth: 180–220 mm', 'Waste kit included', 'Pre-punched tap holes']
      }
    },
    'shower-systems': {
      name: { ru: 'Душевые системы и гарнитуры', kz: 'Душ жүйелері мен гарнитурлары', en: 'Shower Systems & Sets' },
      badge: { ru: 'Премиум дизайн', kz: 'Премиум дизайн', en: 'Premium Design' },
      desc: {
        ru: 'Душевые стойки с регулировкой высоты, широкими верхними тропическими душами, ручными лейками с несколькими режимами струи.',
        kz: 'Биіктігі реттелетін душ бағандары, кең үстіңгі тропикалық душтары, бірнеше ағын режимі бар қол сусепкіштері.',
        en: 'Shower columns with adjustable height, broad overhead rain showers, and multi-mode hand sprays.'
      },
      filters: {
        ru: 'С изливом • Без излива • С термостатом • С регулировкой стойки',
        kz: 'Шүмегі бар • Шүмексіз • Термостатпен • Бағанды реттеумен',
        en: 'With spout • Without spout • Thermostatic • Telescopic rail'
      },
      specs: {
        ru: ['Регулировка стойки: 850–1250 мм', 'Диаметр верхнего душа: 200–300 мм', 'Шланг 1.5 м', 'Защита от известкового налёта'],
        kz: ['Бағанды реттеу: 850–1250 мм', 'Үстіңгі душ диаметрі: 200–300 мм', 'Түтік 1.5 м', 'Әк қағынан қорғау'],
        en: ['Rail height: 850–1250 mm', 'Head diameter: 200–300 mm', '1.5 m hose', 'Anti-calc silicone nozzles']
      }
    },
    'cartridges': {
      name: { ru: 'Картриджи', kz: 'Картридждер', en: 'Cartridges' },
      badge: { ru: 'Комплектующие', kz: 'Бөлшектер', en: 'Components' },
      desc: {
        ru: 'Оригинальные керамические картриджи различных диаметров (25, 35, 40 мм) с увеличенным ресурсом циклов открывания-закрывания.',
        kz: 'Ашу-жабу циклдерінің ресурсы ұлғайтылған әртүрлі диаметрлі (25, 35, 40 мм) түпнұсқа керамикалық картридждер.',
        en: 'Genuine ceramic cartridges of various diameters (25, 35, 40 mm) with extended open-close cycle endurance.'
      },
      filters: {
        ru: '25 мм • 35 мм • 40 мм • С ножками / без ножек',
        kz: '25 мм • 35 мм • 40 мм • Аяқтары бар / аяқтары жоқ',
        en: '25 mm • 35 mm • 40 mm • With/without legs'
      },
      specs: {
        ru: ['Ресурс: до 500 000 циклов', 'Керамические пластины высокой плотности', 'Стабильная работа при скачках давления'],
        kz: ['Ресурс: 500 000 циклге дейін', 'Жоғары тығыздықтағы керамикалық тақталар', 'Қысым өзгергенде тұрақты жұмыс'],
        en: ['Cycle life: up to 500,000', 'High density ceramic discs', 'Stable under pressure spikes']
      }
    },
    'aerators': {
      name: { ru: 'Аэраторы', kz: 'Аэраторлар', en: 'Aerators' },
      badge: { ru: 'Экономия воды', kz: 'Суды үнемдеу', en: 'Water Saving' },
      desc: {
        ru: 'Водосберегающие аэраторы с защитой от известковых отложений, поворотные шарнирные насадки с мягким насыщением струи воздухом.',
        kz: 'Әк шөгінділерінен қорғалған су үнемдейтін аэраторлар, су ағынын ауамен жұмсақ қанықтыратын бұрылмалы шарнирлі саптамалар.',
        en: 'Water-saving anti-calc aerators, swivel nozzles with soft air-enriched flow.'
      },
      filters: {
        ru: 'Внутренняя резьба • Наружная резьба • Поворотные • Эко-режим',
        kz: 'Ішкі бұранда • Сыртқы бұранда • Бұрылмалы • Эко-режим',
        en: 'Female thread • Male thread • Swivel • Eco flow'
      },
      specs: {
        ru: ['Экономия расхода воды до 30%', 'Силиконовая сетка легкой очистки', 'Стандартные резьбы M24 / M22'],
        kz: ['Су шығынын 30%-ға дейін үнемдеу', 'Оңай тазаланатын силикон тор', 'M24 / M22 стандартты бұрандалары'],
        en: ['Water saving up to 30%', 'Easy clean silicone mesh', 'Standard M24 / M22 threads']
      }
    },
    'hoses-showers': {
      name: { ru: 'Душевые шланги и лейки', kz: 'Душ түтіктері мен сусепкіштері', en: 'Shower Hoses & Handsets' },
      badge: { ru: 'Расходные узлы', kz: 'Шығын тораптары', en: 'Consumables' },
      desc: {
        ru: 'Усиленные шланги двойного плетения с защитой от перекручивания (anti-twist) и эргономичные лейки с самоочищающимися форсунками.',
        kz: 'Бұралудан қорғалған қос өрілген күшейтілген түтіктер (anti-twist) және өздігінен тазаланатын форсункалары бар эргономикалық сусепкіштер.',
        en: 'Reinforced anti-twist double-lock hoses and ergonomic shower handsets with self-cleaning nozzles.'
      },
      filters: {
        ru: 'Шланги 1.5–2.0 м • Лейки 1–5 режимов • Anti-twist защита',
        kz: 'Түтіктер 1.5–2.0 м • 1–5 режимі бар сусепкіштер • Anti-twist қорғанысы',
        en: 'Hoses 1.5–2.0 m • Handsets 1–5 modes • Anti-twist system'
      },
      specs: {
        ru: ['Латунные конусы подключения G 1/2"', 'Устойчивость на разрыв до 50 кг', 'Хромированный ударопрочный ABS'],
        kz: ['G 1/2" жез қосылу конустары', '50 кг дейін үзілуге төзімділік', 'Хромдалған соққыға төзімді ABS'],
        en: ['Brass G 1/2" nuts', 'Tensile resistance up to 50 kg', 'Chrome-plated durable ABS']
      }
    },
    'spouts': {
      name: { ru: 'Изливы для смесителей', kz: 'Араластырғыш шүмектері', en: 'Mixer Spouts' },
      badge: { ru: 'Запасные части', kz: 'Қосалқы бөлшектер', en: 'Spare Parts' },
      desc: {
        ru: 'Поворотные изливы различной длины (S-образные, плоские, круглые) из утолщённой латуни со стандартной гайкой крепления 3/4".',
        kz: 'Стандартты 3/4" бекіту гайкасы бар қалыңдатылған латуньнен жасалған әртүрлі ұзындықтағы (S-тәрізді, жалпақ, дөңгелек) бұрылмалы шүмектер.',
        en: 'Swivel spouts of various lengths (S-shaped, flat, tubular) made of heavy brass with standard 3/4" union nut.'
      },
      filters: {
        ru: 'Длина 200–400 мм • Плоские • Круглые трубчатые • S-образные',
        kz: 'Ұзындығы 200–400 мм • Жалпақ • Дөңгелек құбырлы • S-тәрізді',
        en: 'Length 200–400 mm • Flat • Tubular • S-curve'
      },
      specs: {
        ru: ['Толщина стенки 1.0–1.2 мм', 'Двойные кольцевые уплотнители', 'Предустановленный аэратор'],
        kz: ['Қабырға қалыңдығы 1.0–1.2 мм', 'Қос сақиналы тығыздағыштар', 'Алдын ала орнатылған аэратор'],
        en: ['Wall thickness 1.0–1.2 mm', 'Double O-ring seal', 'Pre-installed aerator']
      }
    },
    'diverters-fittings': {
      name: { ru: 'Диверторы и эксцентрики', kz: 'Диверторлар мен эксцентриктер', en: 'Diverters & Eccentrics' },
      badge: { ru: 'Инженерные узлы', kz: 'Инженерлік тораптар', en: 'Fittings' },
      desc: {
        ru: 'Переключатели потока (диверторы) флажкового и штокового типа, усиленные латунные эксцентрики и декоративные отражатели.',
        kz: 'Жалауша және өзекше түріндегі ағынды ауыстырып-қосқыштар (диверторлар), күшейтілген жез эксцентриктер және сәндік шағылыстырғыштар.',
        en: 'Lever and pull-up diverters, reinforced brass eccentric adapters, and decorative flanges.'
      },
      filters: {
        ru: 'Кнопочные диверторы • Флажковые • Эксцентрики 3/4" на 1/2"',
        kz: 'Түймелі диверторлар • Жалаушалы • 3/4"-тен 1/2"-ке дейінгі эксцентриктер',
        en: 'Pull diverters • Lever diverters • 3/4" to 1/2" eccentrics'
      },
      specs: {
        ru: ['Усиленный металл', 'Точная геометрия резьбы', 'Комплектация с уплотнителями'],
        kz: ['Күшейтілген металл', 'Бұранданың дәл геометриясы', 'Тығыздағыштармен жабдықталуы'],
        en: ['Heavy-duty brass', 'Precision threading', 'Washers included']
      }
    },
    'shower-cabins': {
      name: { ru: 'Бюджетные душевые кабины', kz: 'Үнемді душ кабиналары', en: 'Economy Shower Cabins' },
      badge: { ru: 'Специальная линия', kz: 'Арнайы желі', en: 'Special Line' },
      desc: {
        ru: 'Практичные душевые кабины с закалённым безопасным стеклом, надёжными поддонами, раздвижными дверями и продуманной сборкой.',
        kz: 'Шыңдалған қауіпсіз әйнегі, сенімді табандары, сырғымалы есіктері және ойластырылған құрастырылуы бар практикалық душ кабиналары.',
        en: 'Practical shower cabins with tempered safety glass, durable trays, sliding doors, and modular assembly.'
      },
      filters: {
        ru: '80х80 • 90х90 • Низкий поддон • Высокий поддон • Без крыши / с крышей',
        kz: '80х80 • 90х90 • Аласа табан • Биік табан • Шатырсыз / шатырмен',
        en: '80x80 • 90x90 • Low tray • High tray • Open top / roofed'
      },
      specs: {
        ru: ['Закалённое стекло: 4–5 мм', 'Профиль: анодированный алюминий', 'Акриловый поддон с металлическим каркасом', 'Роликовая система плавного хода'],
        kz: ['Шыңдалған әйнек: 4–5 мм', 'Профиль: анодталған алюминий', 'Металл қаңқасы бар акрил табан', 'Бірқалыпты жүрісті роликті жүйе'],
        en: ['Tempered glass: 4–5 mm', 'Anodized aluminum frame', 'Acrylic tray with metal subframe', 'Smooth-gliding roller system']
      }
    }
  };

  const normalizeCategory = (value) => String(value || '').trim().replace(/\s+/g, ' ');
  const activeProducts = products.filter(p => p.status !== 'СКРЫТ');
  const productCategories = Array.from(new Set(activeProducts.map(p => normalizeCategory(p.category)).filter(Boolean)));

  // Show only categories that actually contain products in the current catalog.
  const categoryDefinitions = [
    { id: 'kitchen-mixers', image: `${baseUrl}images/cat_kitchen.png`, mounting: 'deck' },
    { id: 'basin-mixers', image: `${baseUrl}images/category-basin-v2.png`, mounting: 'deck' },
    { id: 'bath-mixers', image: `${baseUrl}images/category-bath-v2.png`, mounting: 'wall' },
    { id: 'universal-mixers', image: `${baseUrl}images/category-universal-v2.png`, mounting: 'wall' },
    { id: 'shower-mixers', image: `${baseUrl}images/cat_shower.png`, mounting: 'wall' },
    { id: 'bidet-hygiene', image: `${baseUrl}images/cat_shower.png`, mounting: 'wall' },
    { id: 'sinks', image: `${baseUrl}images/cat_sinks.png`, mounting: 'deck' },
    { id: 'shower-systems', image: `${baseUrl}images/cat_shower.png`, mounting: 'wall' },
    { id: 'cartridges', image: `${baseUrl}images/cat_components.png`, mounting: 'internal' },
    { id: 'aerators', image: `${baseUrl}images/cat_components.png`, mounting: 'internal' },
    { id: 'hoses-showers', image: `${baseUrl}images/cat_shower.png`, mounting: 'internal' },
    { id: 'spouts', image: `${baseUrl}images/cat_components.png`, mounting: 'internal' },
    { id: 'diverters-fittings', image: `${baseUrl}images/cat_components.png`, mounting: 'internal' },
    { id: 'shower-cabins', image: `${baseUrl}images/cat_laute_brand.jpg`, mounting: 'cabin' }
  ];
  const categories = productCategories.map((sourceCategory) => {
    const item = categoryDefinitions.find((candidate) => categoryTranslations[candidate.id]?.name?.ru === sourceCategory);
    if (!item) {
      return {
        id: sourceCategory,
        sourceCategory,
        name: sourceCategory,
        image: null,
        mounting: 'other',
        count: activeProducts.filter(p => normalizeCategory(p.category) === sourceCategory).length
      };
    }
    const tr = categoryTranslations[item.id] || {};
    return {
      ...item,
      sourceCategory,
      count: activeProducts.filter(p => normalizeCategory(p.category) === sourceCategory).length,
      name: tr.name?.[lang] || tr.name?.ru || item.id,
      badge: tr.badge?.[lang] || tr.badge?.ru || '',
      desc: tr.desc?.[lang] || tr.desc?.ru || '',
      filters: tr.filters?.[lang] || tr.filters?.ru || '',
      specs: tr.specs?.[lang] || tr.specs?.ru || []
    };
  });

  // Filter Categories
  const filteredCategories = categories.filter(c => {
    const matchesCat = selectedCategory === 'all' || c.id === selectedCategory;
    const matchesMount = selectedMounting === 'all' || c.mounting === selectedMounting;
    const matchesSearch = searchQuery === '' || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.desc || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesMount && matchesSearch;
  });

  // Filter Live Products
  const filteredProducts = activeProducts.filter(p => {
    const matchesCat = selectedCategory === 'all' || normalizeCategory(p.category) === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      p.article.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.specs && p.specs.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="page-wrapper catalog-page">
      {/* Page Header */}
      <section className="page-header catalog-hero-header">
        <div className="container">
          <div className="page-header-content catalog-header-grid">
            <div className="catalog-header-text">
              <span className="section-badge">{cat.badge || 'Номенклатура продукции'}</span>
              <h1 className="page-title">{cat.title || 'Номенклатура продукции LAUTE'}</h1>
              <p className="page-subtitle">
                {cat.subtitle || 'Полноразмерный каталог сантехники, сформированный по назначению изделий и архитектурным сериям.'}
              </p>
            </div>

            <div className="catalog-header-actions">
              <button
                type="button"
                className="btn btn-primary catalog-cart-trigger-btn"
                onClick={openCartModal}
              >
                <ShoppingBag size={17} />
                <span>{cat.openCartBtn || 'Корзина заявки'}</span>
                {cartTotalUnits > 0 && (
                  <span className="catalog-cart-count-pill">
                    {cartTotalUnits} шт.
                    {cartTotalKnownAmount > 0 ? ` · ${cartTotalKnownAmount.toLocaleString('ru-RU')} ₽` : ''}
                  </span>
                )}
              </button>

              {isB2BAuthorized || adminSession ? (
                <button type="button" className="btn btn-outline catalog-b2b-btn" onClick={openAuthModal}>
                  <CheckCircle2 size={15} color="#10B981" />
                  <span>Склад: {activeWarehouse?.name || 'Не выбран'}</span>
                </button>
              ) : (
                <button type="button" className="btn btn-outline catalog-b2b-btn" onClick={openAuthModal}>
                  <PackageCheck size={16} />
                  <span>{cat.authBtn || 'Авторизоваться для просмотра остатков'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stock Notice & Rules */}
      <section className="stock-notice-bar">
        <div className="container">
          <div className="notice-inner">
            <div className="notice-lead">
              {isB2BAuthorized || adminSession ? (
                <Warehouse size={18} color="#0D9488" />
              ) : (
                <Info size={18} className="notice-icon" />
              )}
              <div className="notice-text">
                {isB2BAuthorized || adminSession ? (
                  <>
                    <strong>Служебные остатки филиала LAUTE:</strong>{' '}
                    {activeWarehouse
                      ? `Показываются фактические остатки склада «${activeWarehouse.name}» (${activeWarehouse.city || activeWarehouse.country}).`
                      : 'Склад по умолчанию для выбранного региона не назначен.'}
                  </>
                ) : (
                  <>
                    <strong>{cat.stockTitle || 'Статус складов'}:</strong>{' '}
                    {cat.stockDesc ||
                      'Остатки по складам доступны авторизованным дилерам. В публичном каталоге указаны розничные цены для формирования первичной заявки менеджеру без регистрации.'}
                  </>
                )}
              </div>
            </div>

            {(isB2BAuthorized || adminSession) && (
              <div className="notice-warehouse-switcher">
                <span>Сменить склад:</span>
                <select
                  value={activeWarehouseId || ''}
                  onChange={(e) => setClientSelectedWarehouse(e.target.value || null)}
                  className="notice-warehouse-select"
                >
                  <option value="">(По умолчанию для региона)</option>
                  {warehousesList.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.city || w.country})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Catalog Workspace */}
      <section className="catalog-main-section">
        <div className="container">
          {/* View switcher + Cart summary bar */}
          <div className="catalog-view-switcher-bar">
            <div className="view-toggle-group">
              <button
                type="button"
                className={`view-toggle-btn ${catalogView === 'products' ? 'active' : ''}`}
                onClick={() => {
                  setCatalogView('products');
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
              >
                <Sparkles size={15} />
                <span>
                  {cat.allProductsTab || 'Вся номенклатура'} ({activeProducts.length})
                </span>
              </button>

              <button
                type="button"
                className={`view-toggle-btn ${catalogView === 'categories' ? 'active' : ''}`}
                onClick={() => {
                  setCatalogView('categories');
                  setSelectedCategory('all');
                  setSelectedMounting('all');
                  setSearchQuery('');
                }}
              >
                <Layers size={15} />
                <span>{(cat.allCategories || 'Все категории').replace(/\s*\(\d+\)\s*$/, '')} ({categories.length})</span>
              </button>
            </div>

            <div className="catalog-toolbar-right">
              <span className="catalog-found-counter">
                {catalogView === 'products'
                  ? `${filteredProducts.length} ${cat.foundModels || 'позиций в номенклатуре'}`
                  : `${filteredCategories.length} категорий`}
              </span>

              <button
                type="button"
                className={`catalog-inline-cart-btn ${cartDistinctCount > 0 ? 'has-items' : ''}`}
                onClick={openCartModal}
              >
                <ShoppingBag size={16} />
                <span>{cat.openCartBtn || 'Корзина заявки'}</span>
                <span className="catalog-inline-cart-badge">{cartTotalUnits}</span>
              </button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="catalog-controls-bar">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder={cat.searchPlaceholder || 'Поиск по номенклатуре или артикулу...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {catalogView === 'products' && productCategories.length > 0 && (
              <div className="mounting-filter-group">
                <span className="filter-label">
                  {lang === 'kz' ? 'Санат:' : lang === 'en' ? 'Category:' : 'Категория:'}
                </span>
                <div className="filter-chips">
                  <button
                    type="button"
                    className={`chip-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    {lang === 'kz' ? 'Барлығы' : lang === 'en' ? 'All' : 'Все'}
                  </button>
                  {productCategories.map((cName) => (
                    <button
                      key={cName}
                      type="button"
                      className={`chip-btn ${selectedCategory === cName ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cName)}
                    >
                      {cName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {catalogView === 'categories' && (
              <div className="mounting-filter-group">
                <span className="filter-label">
                  {lang === 'kz' ? 'Орнату түрі:' : lang === 'en' ? 'Mounting type:' : 'Тип монтажа:'}
                </span>
                <div className="filter-chips">
                  <button
                    type="button"
                    className={`chip-btn ${selectedMounting === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedMounting('all')}
                  >
                    {cat.allMountings || 'Все типы монтажа'}
                  </button>
                  <button
                    type="button"
                    className={`chip-btn ${selectedMounting === 'deck' ? 'active' : ''}`}
                    onClick={() => setSelectedMounting('deck')}
                  >
                    {cat.deckMounting || 'На борт (раковина / мойка)'}
                  </button>
                  <button
                    type="button"
                    className={`chip-btn ${selectedMounting === 'wall' ? 'active' : ''}`}
                    onClick={() => setSelectedMounting('wall')}
                  >
                    {cat.wallMounting || 'Настенный монтаж'}
                  </button>
                  <button
                    type="button"
                    className={`chip-btn ${selectedMounting === 'internal' ? 'active' : ''}`}
                    onClick={() => setSelectedMounting('internal')}
                  >
                    {lang === 'kz' ? 'Бөлшектер' : lang === 'en' ? 'Components' : 'Комплектующие'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* VIEW 1: LIVE PRODUCTS GRID */}
          {catalogView === 'products' && (
            <div className="live-products-grid">
              {filteredProducts.map((p) => {
                const displayInfo = formatProductDisplay(p);
                const imgInfo = classifyProductImages(p, baseUrl);
                // Главной фотографией всегда должен быть сам смеситель (imgInfo.mainPhoto отфильтровывает чертежи и коробки)
                const mainPhotoSrc = imgInfo.mainPhoto || getImgUrl(p.photo1);
                const qtyInCart = getCartItemQuantity(p.article);
                const rawPrice = Number(p.price);
                const hasKnownPrice = Number.isFinite(rawPrice) && rawPrice > 0;

                return (
                  <article key={p.article} className="product-sku-card">
                    <div
                      className="sku-card-media"
                      onClick={() => openProductModal(p)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') openProductModal(p);
                      }}
                    >
                      <img
                        src={mainPhotoSrc}
                        alt={displayInfo.title}
                        className="sku-product-img"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = `${baseUrl}images/cat_laute_brand.jpg`;
                        }}
                      />
                      <span className="sku-art-badge">
                        {cat.skuLabel || 'АРТ.'} {p.article}
                      </span>
                      {p.isPopular && <span className="sku-pop-badge">Лидер продаж</span>}
                      {imgInfo.drawingPhotos.length > 0 && (
                        <span
                          className="sku-drawing-indicator"
                          title="В подробной карточке доступен инженерный чертёж"
                        >
                          <Ruler size={11} />
                          <span>Чертёж</span>
                        </span>
                      )}
                    </div>

                    <div className="sku-card-content">
                      <div className="sku-meta-line">
                        <span className="sku-category-tag">{p.category}</span>
                        {p.series && <span className="sku-series-tag">{p.series}</span>}
                      </div>

                      <h3
                        className="sku-card-title"
                        onClick={() => openProductModal(p)}
                        title={displayInfo.title}
                      >
                        {displayInfo.title}
                      </h3>

                      {displayInfo.subtitle && (
                        <div className="sku-card-subtitle">
                          <span className="sku-subtitle-badge">{displayInfo.subtitle}</span>
                        </div>
                      )}

                      {displayInfo.cleanSpecs.length > 0 && (
                        <div className="sku-specs-chips">
                          {displayInfo.cleanSpecs.slice(0, 3).map((spec, sIdx) => (
                            <span key={sIdx} className="sku-spec-chip">
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="sku-card-bottom-area">
                        <div className="sku-price-row">
                          <div className="sku-price-block">
                            <span className="sku-price-label">
                              {cat.retailPriceLabel || 'Публичная розничная цена'}
                            </span>
                            <div className={`sku-price ${!hasKnownPrice ? 'is-on-request' : ''}`}>
                              {hasKnownPrice
                                ? `${rawPrice.toLocaleString('ru-RU')} ${p.currency || '₽'}`
                                : cat.priceOnRequest || 'Цена по запросу'}
                            </div>
                          </div>
                        </div>

                        <div className="sku-stock-summary">
                          {isB2BAuthorized || adminSession ? (() => {
                            const stock = getStockForSku(p.article);
                            if (stock.status === 'in_stock') {
                              return (
                                <>
                                  <MapPin size={13} color="#0D9488" />
                                  <span style={{ color: '#0D9488', fontWeight: 600 }}>
                                    {stock.warehouseName}: {stock.label}
                                  </span>
                                </>
                              );
                            } else if (stock.status === 'out_of_stock') {
                              return (
                                <>
                                  <MapPin size={13} color="#D97706" />
                                  <span style={{ color: '#D97706', fontWeight: 600 }}>
                                    {stock.warehouseName}: 0 шт. (под заказ)
                                  </span>
                                </>
                              );
                            } else if (stock.status === 'no_warehouse') {
                              return (
                                <>
                                  <MapPin size={13} color="#64748B" />
                                  <span>Склад не выбран</span>
                                </>
                              );
                            } else {
                              return (
                                <>
                                  <MapPin size={13} color="#64748B" />
                                  <span>{stock.warehouseName}: Нет данных</span>
                                </>
                              );
                            }
                          })() : (
                            <>
                              <MapPin size={13} color="#64748B" />
                              <span>Складские остатки: в B2B кабинете</span>
                            </>
                          )}
                        </div>

                        {/* КНОПКИ КАРТОЧКИ: Подробнее + Сравнить (верхний ряд), Добавить в корзину (полноширинная кнопка снизу без обрезания) */}
                        <div className="sku-card-actions">
                          <div className="sku-card-secondary-actions">
                            <button
                              type="button"
                              className="sku-btn-secondary sku-action-detail"
                              onClick={() => openProductModal(p)}
                            >
                              <Eye size={14} />
                              <span>{cat.detailsBtn || 'Подробнее'}</span>
                            </button>

                            <button
                              type="button"
                              className="sku-btn-secondary sku-action-compare"
                              onClick={() => {
                                const other =
                                  activeProducts.find(
                                    (item) => item.category === p.category && item.article !== p.article
                                  ) || activeProducts.find((item) => item.article !== p.article);
                                if (other) startComparison(p, other);
                              }}
                              title="Сравнить характеристики с другой моделью"
                            >
                              <Scale size={14} />
                              <span>{cat.compareBtn || 'Сравнить'}</span>
                            </button>
                          </div>

                          {qtyInCart > 0 ? (
                            <div className="sku-cart-active-row">
                              <div className="sku-cart-stepper">
                                <button
                                  type="button"
                                  className="sku-stepper-btn"
                                  onClick={() => updateCartQuantity(p.article, qtyInCart - 1)}
                                  aria-label="Уменьшить количество"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="sku-stepper-value">
                                  <Check size={13} />
                                  <span>{cat.inCartLabel || 'В корзине'}: {qtyInCart}</span>
                                </span>
                                <button
                                  type="button"
                                  className="sku-stepper-btn"
                                  onClick={() => addToCart(p, 1)}
                                  aria-label="Увеличить количество"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <button
                                type="button"
                                className="sku-open-cart-mini"
                                onClick={openCartModal}
                                title={cat.openCartBtn || 'Открыть корзину'}
                              >
                                <ShoppingBag size={15} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="sku-btn-add-cart"
                              onClick={() => addToCart(p, 1)}
                            >
                              <ShoppingBag size={15} />
                              <span>{cat.addToCartBtn || 'Добавить в корзину'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="empty-catalog-state" style={{ gridColumn: '1 / -1' }}>
                  <p>По вашему поисковому запросу товаров не найдено.</p>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                  >
                    {cat.resetFilters || 'Сбросить фильтры'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: CATEGORIES WITH CURRENT PRODUCTS */}
          {catalogView === 'categories' && (
            <div className="catalog-grid">
              {filteredCategories.map((cItem, idx) => (
                <div key={cItem.id} className="catalog-card">
                  <div className={`card-media ${cItem.image ? '' : 'card-media-empty'}`}>
                    {cItem.image && <img src={cItem.image} alt="" className="card-product-img" loading="lazy" />}
                    <span className="card-badge">
                      {cItem.count} {lang === 'en' ? 'models' : lang === 'kz' ? 'модель' : 'мод.'}
                    </span>
                  </div>

                  <div className="card-content">
                    <div className="card-cat-number">
                      {lang === 'kz'
                        ? `Санат #${idx + 1}`
                        : lang === 'en'
                        ? `Category #${idx + 1}`
                        : `Категория #${idx + 1}`}
                    </div>
                    <h3 className="card-title">{cItem.name}</h3>
                    {cItem.image && <span className="card-image-note">{lang === 'en' ? 'Category illustration' : lang === 'kz' ? 'Санат иллюстрациясы' : 'Иллюстрация категории'}</span>}

                    <div className="card-footer">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm btn-full"
                        onClick={() => {
                          setCatalogView('products');
                          setSelectedCategory(cItem.sourceCategory);
                          setSearchQuery('');
                        }}
                      >
                        <span>
                          {lang === 'kz'
                            ? 'Модельдерді көру'
                            : lang === 'en'
                            ? 'Browse Models'
                            : 'Смотреть модели в каталоге'}
                        </span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state for categories */}
          {catalogView === 'categories' && filteredCategories.length === 0 && (
            <div className="empty-catalog-state">
              <p>
                {lang === 'kz'
                  ? 'Сұранысыңыз бойынша санаттар табылмады. Сүзгілерді тазартып көріңіз.'
                  : lang === 'en'
                  ? 'No categories found matching your criteria. Try resetting filters.'
                  : 'По вашему запросу категорий не найдено. Попробуйте сбросить фильтры.'}
              </p>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedMounting('all');
                  setSearchQuery('');
                }}
              >
                {cat.resetFilters || 'Сбросить фильтры'}
              </button>
            </div>
          )}

          {/* Нижний информационный блок каталога */}
          <div className="catalog-bottom-banner">
            <div className="banner-text">
              <span className="catalog-banner-overline">ПРЯМОЕ СОТРУДНИЧЕСТВО С ЗАВОДОМ LAUTE</span>
              <h3>{cat.notFoundTitle || 'Не нашли нужную позицию?'}</h3>
              <p>
                {cat.notFoundDesc ||
                  'Завод LAUTE производит индивидуальные партии под проектные спецификации застройщиков и оптовых клиентов.'}
              </p>
            </div>
            <div className="catalog-banner-actions">
              {cartDistinctCount > 0 && (
                <button type="button" className="btn btn-outline catalog-banner-cart-btn" onClick={openCartModal}>
                  <ShoppingBag size={16} />
                  <span>
                    {cat.openCartBtn || 'Корзина заявки'} ({cartTotalUnits})
                  </span>
                </button>
              )}
              <button type="button" className="btn btn-primary" onClick={openPartnerModal}>
                <span>{cat.requestObjectBtn || 'Запросить подбор под объект'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default CatalogPage;
