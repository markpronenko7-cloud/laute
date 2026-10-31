// Primary source: https://laute.ltd/company. Additional context: /catalog, /partner, /service.
// These are source-reported figures, not independently verified 2026 statistics.
const row = (year, title, desc, enTitle, enDesc, kzTitle, kzDesc) => ({ year, title, desc, translations: { en: { title: enTitle, desc: enDesc }, kz: { title: kzTitle, desc: kzDesc } } });
const section = (name, type, title, subtitle, enTitle, enSubtitle, kzTitle, kzSubtitle, extra = {}) => ({
  id: `company-v2-${name}`, anchor: `company-v2-${name}`, companySection: name, type, title, subtitle,
  translations: { en: { title: enTitle, subtitle: enSubtitle }, kz: { title: kzTitle, subtitle: kzSubtitle } },
  style: { background: 'deep', padding: 'lg' }, ...extra
});

export const COMPANY_BLOCKS = [
  section('hero', 'image_text', "Вода — часть жизни. Производство смесителей — наша работа.", "Мы создаём смесители и сантехнику для кухни и ванной. За каждым изделием LAUTE — производство, работа инженеров и опыт, который начинается в 1998 году.", "Water is part of life. Making faucets is our work.", "We make faucets and fittings for kitchens and bathrooms. Behind LAUTE are manufacturing, engineering and a story that began in 1998.", "Су — өмірдің бір бөлігі. Араластырғыштар жасау — біздің жұмысымыз.", "Біз асүй мен ваннаға арналған араластырғыштар мен сантехника жасаймыз. LAUTE артында өндіріс, инженерлер еңбегі және 1998 жылдан басталған тәжірибе тұр.", { badge: 'О LAUTE', imageUrl: 'images/hero/hero-slide-1.jpg', buttonText: 'Обсудить сотрудничество', buttonLink: '#company-v2-inquiry' }),
  section('scale', 'features', "От производства до вашего проекта", "Заводы, склады и партнёры — одна сеть, которая связывает производство с магазинами и покупателями.", "From the factory to your project", "Factories, warehouses and partners connect manufacturing with stores and customers.", "Өндірістен сіздің жобаңызға дейін", "Зауыттар, қоймалар мен серіктестер өндірісті дүкендермен және сатып алушылармен байланыстырады.", { items: [
    row('', '3', 'завода в Китае', '3', 'factories in China', '3', 'Қытайдағы зауыт'),
    row('', '10', 'офисов продаж в семи странах и регионах', '10', 'sales offices across seven countries and regions', '10', 'жеті ел мен аймақтағы сату кеңсесі'),
    row('', '2 000', 'партнёров', '2,000', 'partners', '2 000', 'серіктес'),
    row('', '200 000', 'смесителей в месяц', '200,000', 'faucets per month', '200 000', 'айына шығарылатын араластырғыш')
  ] }),
  section('history', 'factory_history', "Начали с кухни. Продолжили с водой.", "Наша история началась в Ганновере с мастерской кухонной мебели. Сегодня LAUTE объединяет производство смесителей и международную партнёрскую сеть.", "It began in the kitchen. It grew with water.", "Our story started with a kitchen furniture workshop in Hanover. Today LAUTE brings together faucet manufacturing and an international partner network.", "Асүйден басталды. Сумен жалғасты.", "Тарихымыз Ганновердегі асүй жиһазы шеберханасынан басталды. Бүгінде LAUTE араластырғыштар өндірісі мен халықаралық серіктестер желісін біріктіреді.", { items: [
    row('1998', 'Начало в Ганновере', 'Предприниматель Пауль Франк (Paul Frank) основывает Laute Küchenmöbel в Ганновере, Нижняя Саксония: мастерскую кухонной мебели премиум-класса из натуральных материалов.', 'The beginning in Hanover', 'Entrepreneur Paul Frank establishes Laute Küchenmöbel in Hanover, Lower Saxony: a workshop making premium kitchen furniture from natural materials.', 'Ганновердегі бастау', 'Кәсіпкер Пауль Франк Төменгі Саксониядағы Ганноверде табиғи материалдардан жоғары санатты асүй жиһазын жасайтын Laute Küchenmöbel шеберханасын ашады.'),
    row('2002', 'Выход на азиатский рынок', 'Пауль Франк открывает завод кухонной мебели в Вэньчжоу, китайская провинция Чжэцзян.', 'Entering the Asian market', 'Paul Frank opens a kitchen furniture factory in Wenzhou, Zhejiang province, China.', 'Азия нарығына шығу', 'Пауль Франк Қытайдың Чжэцзян провинциясындағы Вэньчжоуда асүй жиһазы зауытын ашады.'),
    row('2003', 'Первый шаг к смесителям', 'Инвестиции в создание завода смесителей совместно с группой предпринимателей из Вэньчжоу.', 'Moving into faucets', 'Investment in a faucet factory in partnership with a group of Wenzhou entrepreneurs.', 'Араластырғыштар өндірісіне қадам', 'Вэньчжоу кәсіпкерлерімен бірлесіп араластырғыштар зауытын құруға инвестиция салынады.'),
    row('2005', 'Представительство в СНГ', 'Начинает работу представительство в СНГ. Открывается первый склад завода смесителей LAUTE.', 'A presence in the CIS', 'The CIS representative office begins operating, with the first LAUTE faucet warehouse.', 'ТМД-дағы өкілдік', 'ТМД өкілдігі жұмысын бастайды. LAUTE араластырғыштар зауытының алғашқы қоймасы ашылады.'),
    row('2015', 'Инвестиции в производство', 'Немецкие и китайские акционеры увеличивают инвестиции в завод. Немецкие инженеры включаются в производственные процессы и усиливают контроль качества.', 'Investing in production', 'German and Chinese shareholders increase investment. German engineers join production operations and strengthen quality control.', 'Өндіріске инвестиция', 'Неміс және қытай акционерлері зауытқа инвестицияны арттырады. Неміс инженерлері өндіріс үдерістеріне қатысып, сапа бақылауын күшейтеді.'),
    row('2016', 'Появление Rainsberg', 'Для российского рынка запускается производство смесителей Rainsberg в эконом-сегменте.', 'Introducing Rainsberg', 'Rainsberg faucet production begins for the economy segment of the Russian market.', 'Rainsberg маркасының пайда болуы', 'Ресей нарығының үнемді сегментіне арналған Rainsberg араластырғыштары шығарыла бастайды.'),
    row('2018', 'Гонконг и Сибирь', 'В Гонконге открывается совместная немецко-китайская корпорация Laute LTD. Многократно растут вложения в товарные запасы в России; появляется первый региональный склад в Сибири.', 'Hong Kong and Siberia', 'The joint German–Chinese corporation Laute LTD opens in Hong Kong. Investment in Russian stock multiplies, and the first regional warehouse opens in Siberia.', 'Гонконг және Сібір', 'Гонконгте неміс-қытай Laute LTD корпорациясы ашылады. Ресейдегі тауар қорына инвестициялар еселеп өсіп, Сібірдегі алғашқы өңірлік қойма ашылады.'),
    row('2020', 'Новая модель партнёрства', 'Завод представляет модель дистрибуции, позволяющую партнёрам развивать собственный дилерский бизнес на его инфраструктуре. Условия сотрудничества согласовываются с каждым партнёром.', 'A new partnership model', 'The factory introduces partner dealer businesses using its infrastructure. Partnership terms are agreed individually.', 'Серіктестіктің жаңа үлгісі', 'Зауыт инфрақұрылымын пайдаланып, жеке дилерлік бизнесті дамыту үлгісі енгізіледі. Серіктестік шарттары жеке келісіледі.'),
    row('2022', 'Офис в Казахстане', 'Открываем офис в Казахстане и расширяем работу с местными партнёрами.', 'An office in Kazakhstan', 'An office opens in Kazakhstan as sales grow. Partnership enquiries are accepted through the website from cities across the country.', 'Қазақстандағы кеңсе', 'Сату көлемінің өсуімен Қазақстанда кеңсе ашылады. Ел қалаларынан серіктестік өтініштері сайт арқылы қабылданады.'),
    { ...row('2023', 'Выход на Amazon', 'LAUTE сообщает о выходе на американский рынок и размещении продукции на Amazon.', 'Launching on Amazon', 'LAUTE announces its entry into the US market and product listings on Amazon.', 'Amazon-ға шығу', 'LAUTE АҚШ нарығына шығып, Amazon-да өнімдерін орналастырғанын хабарлайды.') },
    row('2024', 'Офис-склад в Дубае', 'В международной сети появляется офис-склад в Дубае, ОАЭ.', 'An office and warehouse in Dubai', 'An office and warehouse in Dubai, UAE joins the international network.', 'Дубайдағы кеңсе-қойма', 'Халықаралық желіде БАӘ, Дубай қаласындағы кеңсе-қойма пайда болады.'),
    row('2025', 'Расширение коллекций LAUTE', 'Расширяем коллекции флагманского бренда LAUTE. Solana, Ethereum и Bitcoin отсылают к миру Web3 и интересу бренда к технологиям будущего, включая AI.', 'Expanding LAUTE collections', 'The flagship LAUTE collections expand. Solana, Ethereum and Bitcoin reference Web3 and the brand’s interest in future technologies, including AI.', 'LAUTE коллекцияларын кеңейту', 'LAUTE негізгі брендінің коллекциялары кеңейеді. Solana, Ethereum және Bitcoin Web3 әлеміне және брендтің AI қоса болашақ технологияларына қызығушылығына сілтейді.'),
    row('2026', 'Склад в Алматы', 'Открываем склад в Алматы — на историческом Шёлковом пути. Развиваем логистику в Центральной Азии, чтобы быть ближе к партнёрам.', 'A warehouse in Almaty', 'A warehouse opens in Almaty on the historic Silk Road, bringing Central Asian logistics closer to our partners.', 'Алматыдағы қойма', 'Тарихи Жібек жолындағы Алматыда қойма ашылады. Серіктестерге жақын болу үшін Орталық Азиядағы логистиканы дамытамыз.')
  ] }),
  section('production', 'gallery', "Прежде чем открыть воду", "Смесители и мойки: металл, работа оборудования и ручная доводка. Семь процессов — в деталях и в движении.", "Before the water flows", "Faucets and sinks: metal, machinery and hand finishing. Seven processes, in detail and in motion.", "Суды ашқанға дейін", "Араластырғыштар мен жуғыштар: металл, жабдық жұмысы және қолмен өңдеу. Жеті үдеріс — бөлшектерімен және қозғалыста.", { processMediaVersion: 1, items: [
    { ...row('', 'Литьё заготовок', 'Расплавленный металл переносят из печи в форму. В кадре — заливка и работа с литейной оснасткой.', 'Casting the blanks', 'Molten metal is transferred from the furnace into a mould. The footage shows pouring and work at the casting station.', 'Дайындамаларды құю', 'Балқыған металл пештен қалыпқа құйылады. Кадрда құю және қалыппен жұмыс көрсетілген.'), processId: 'casting', durationLabel: '0:11' },
    { ...row('', 'Обрезка отливок', 'На прессе отделяют лишний металл от отливки. Затем заготовки собирают в производственную тару для дальнейшей обработки.', 'Trimming the castings', 'A press removes excess metal from the castings. The blanks are then collected for further processing.', 'Құймаларды кесу', 'Пресс құймадағы артық металды алып тастайды. Дайындамалар келесі өңдеуге жиналады.'), processId: 'trimming', durationLabel: '0:10' },
    { ...row('', 'Механическая обработка', 'Режущий инструмент обрабатывает металлическую заготовку. Крупный план показывает рабочую зону станка, стружку и детали после операции.', 'Machining the blanks', 'A cutting tool machines the metal blank. A close view shows the working area, metal chips and parts after machining.', 'Механикалық өңдеу', 'Кескіш құрал металл дайындаманы өңдейді. Жақын планда станоктың жұмыс аймағы, жоңқа және өңделген бөлшектер көрінеді.'), processId: 'machining', durationLabel: '0:08' },
    { ...row('', 'Роботизированная полировка', 'Манипулятор подводит корпус к полировальному кругу и меняет положение детали. Общий и крупный планы показывают одну и ту же операцию с разных точек.', 'Robotic polishing', 'A robot brings the body to the polishing wheel and changes its position. Wide and close views show the same operation from different angles.', 'Роботпен жылтырату', 'Робот корпусты жылтырату дөңгелегіне жақындатып, оның қалпын өзгертеді. Үдеріс әртүрлі нүктеден көрсетілген.'), processId: 'robot-polishing', durationLabel: '0:14' },
    { ...row('', 'Ручная обработка моек', 'Мастер последовательно обрабатывает поверхность и края мойки ручным инструментом. Здесь важны доступ к углам и контроль каждого движения.', 'Hand finishing the sinks', 'An operator works the sink surface and edges with a handheld tool, reaching the corners and controlling each pass.', 'Жуғыштарды қолмен өңдеу', 'Шебер жуғыштың беті мен жиектерін қол құралымен өңдейді, бұрыштарға жетіп, әр қозғалысты бақылайды.'), processId: 'sink-finishing', durationLabel: '0:14' },
    { ...row('', 'Нанесение герметика', 'На обратной стороне мойки мастер наносит состав вдоль стыка. Крупный план сохраняет весь рабочий жест — от движения пистолета до готовой полосы.', 'Applying sealant', 'An operator applies sealant along a joint on the underside of the sink. The close view follows the application along the seam.', 'Герметик жағу', 'Шебер жуғыштың артқы жағындағы түйіспеге герметик жағады. Жақын план жағу қозғалысын көрсетеді.'), processId: 'sealing', durationLabel: '0:10' },
    { ...row('', 'Комплектация и упаковка', 'Смеситель и комплектующие размещают в формованном вкладыше, затем закрывают коробку. Отдельный ролик показывает работу упаковочного участка.', 'Kitting and packing', 'The faucet and accessories are placed into a moulded insert before the box is closed. A dedicated edit follows the packing operation.', 'Жинақтау және орау', 'Араластырғыш пен бөлшектер қалыпталған төсемге орналастырылып, қорап жабылады. Жеке бейне орау жұмысын көрсетеді.'), processId: 'packing', durationLabel: '0:15' }
  ].map(item => ({ ...item, mediaKind: 'documentary', imageUrl: `images/factory/processes/${item.processId}.webp`, posterUrl: `images/factory/processes/${item.processId}-poster.webp`, videoUrl: `media/processes/${item.processId}.mp4` })) }),
  section('range', 'features', "Для дома, в котором живут", "Смесители для кухни и ванной, душевые системы, мойки и комплектующие. Выберите то, что подходит вашему пространству и привычкам.", "For the home you live in", "Kitchen and bathroom faucets, shower systems, sinks and components. Find what fits your space and your daily routine.", "Өмірге толы үйге арналған", "Асүй мен ванна араластырғыштары, душ жүйелері, жуғыштар және бөлшектер. Кеңістігіңіз бен әдеттеріңізге сай өнімді таңдаңыз.", { buttonText: 'Перейти в каталог', buttonLink: '/catalog', items: [
    row('', 'LAUTE · до 10 лет', 'Гарантия на смесители LAUTE. Условия — в талоне вашей модели.', 'LAUTE · up to 10 years', 'Warranty for LAUTE faucets. See your model’s warranty card for terms.', 'LAUTE · 10 жылға дейін', 'LAUTE араластырғыштарына кепілдік. Шарттары модель талонында көрсетілген.'),
    row('', 'Oute · до 7 лет', 'Гарантия на смесители Oute. Условия — в талоне вашей модели.', 'Oute · up to 7 years', 'Factory-stated warranty for Oute faucets.', 'Oute · 7 жылға дейін', 'Oute араластырғыштарына зауыт мәлімдеген кепілдік.'),
    row('', 'Rainsberg · 3 года', 'Гарантия на смесители Rainsberg. Условия — в талоне вашей модели.', 'Rainsberg · 3 years', 'Factory-stated warranty for Rainsberg faucets.', 'Rainsberg · 3 жыл', 'Rainsberg араластырғыштарына зауыт мәлімдеген кепілдік.'),
    row('', 'Срок службы · 15 лет', 'Заявленный срок службы. Гарантийные сроки указаны отдельно.', 'Service life · 15 years', 'The stated product service life is a separate measure from the warranty period.', 'Қызмет мерзімі · 15 жыл', 'Өнімнің мәлімделген қызмет мерзімі кепілдік мерзімінен бөлек көрсеткіш.')
  ], content: 'Для кухни и ванной, душевые системы, аксессуары, комплектующие, линия «Управляй водой» и многофункциональные мойки представлены в каталоге старого сайта. Гарантия конкретной модели определяется её талоном. Сохраните талон и упаковку; для обращения в сервис подготовьте описание неисправности, фото или видео изделия и дефекта, а также чек. Повреждения при неквалифицированной установке и применение агрессивных чистящих средств исключены из гарантийного обслуживания.' }),
  section('geography', 'contact_cards', "Ближе, чем кажется", "Казахстан, США, ОАЭ, Китай, Германия и Россия. Развиваем сеть, чтобы работать рядом с нашими партнёрами.", "Closer than you think", "Kazakhstan, the USA, the UAE, China, Germany and Russia. A network built to work closer to our partners.", "Сізге жақынырақ", "Қазақстан, АҚШ, БАӘ, Қытай, Германия және Ресей. Серіктестерге жақын болу үшін желімізді дамытамыз.", { buttonText: 'Действующие контакты', buttonLink: '/contacts', items: [
    { title: 'Алматы / Almaty / Алматы', desc: 'Офис-склад / Office & warehouse / Кеңсе-қойма · пр. Райымбека, 212, Алматы, Казахстан', lat: 43.270, lng: 76.914 },
    { title: 'Новосибирск / Novosibirsk', desc: 'Офис-склад / Office & warehouse / Кеңсе-қойма · ул. Блюхера, 71, Новосибирск, 630073', lat: 54.991578, lng: 82.901808 },
    { title: 'Вэньчжоу / Wenzhou', desc: 'Завод / Factory / Зауыт · 299 Haicheng Street Square Road, Longwan District, Wenzhou City, Zhejiang Province', lat: 27.9798432, lng: 120.664399 },
    { title: 'Ганновер / Hanover', desc: 'Офис-склад / Office & warehouse / Кеңсе-қойма · Hansastrabe 7-1, Hannover, Germany (написание из источника / source spelling)', lat: 52.421733, lng: 9.686426 },
    { title: 'Астана / Astana', desc: 'Офис продаж / Sales office / Сату кеңсесі · просп. Тауелсиздик, 24, Астана, 020000, Казахстан', lat: 51.144297, lng: 71.462634 },
    { title: 'Флорида / Florida', desc: 'Офис продаж / Sales office / Сату кеңсесі · 221 W Hallandale Beach BLVD 310, Hallandale FL 33009, USA', lat: 25.989639, lng: -80.151434 },
    { title: 'Дубай / Dubai', desc: 'Офис-склад / Office & warehouse / Кеңсе-қойма · Dubai, Miracle by Danube, office 2115', lat: 25.0580415, lng: 55.23941 },
    { title: 'Томск / Tomsk', desc: 'Офис продаж / Sales office / Сату кеңсесі', lat: 56.4977, lng: 84.9744 },
    { title: 'Усть-Каменогорск / Oskemen / Өскемен', desc: 'Офис продаж / Sales office / Сату кеңсесі', lat: 49.9714, lng: 82.6059 },
    { title: 'Техас / Texas', desc: 'Офис продаж / Sales office / Сату кеңсесі · 26077 Nelson Way, unit 1407, Katy 77494 TX, USA', lat: 29.775874, lng: -95.830287 },
    { title: 'Москва / Moscow / Мәскеу', desc: 'Офис-склад / Office & warehouse / Кеңсе-қойма · Вишнёвая ул., 7, Подольск, Московская область, 142111', lat: 55.47999, lng: 37.574965 }
  ] }),
  section('inquiry', 'form_lead', "Давайте работать вместе", "У вас магазин, проект или идея для сотрудничества? Расскажите о себе. Обсудим ассортимент, поставки и условия работы в вашем регионе.", "Let’s work together", "A store, a project or a partnership idea? Tell us about it. Let’s discuss products, supply and terms for your region.", "Бірге жұмыс істейік", "Дүкеніңіз, жобаңыз немесе серіктестік идеяңыз бар ма? Өзіңіз туралы айтыңыз. Өңіріңіздегі ассортиментті, жеткізуді және жұмыс шарттарын талқылаймыз.", { items: [
    ['Оптовая компания', 'Wholesaler', 'Көтерме компания'], ['Розничный магазин', 'Retail store', 'Бөлшек дүкен'], ['Сеть DIY', 'DIY chain', 'DIY желісі'], ['Сеть сантехмагазинов', 'Plumbing store chain', 'Сантехника дүкендері желісі'], ['Магазин сантехники', 'Plumbing store', 'Сантехника дүкені'], ['Общехозяйственный магазин', 'Hardware store', 'Шаруашылық дүкені'], ['Сеть общехозмагов', 'Hardware store chain', 'Шаруашылық дүкендері желісі'], ['Рыночная точка', 'Market stall', 'Базардағы сауда орны'], ['Подрядная организация', 'Contractor', 'Мердігер ұйым'], ['Дизайнер', 'Designer', 'Дизайнер'], ['Интернет-магазин', 'Online store', 'Интернет-дүкен'], ['Другое', 'Other', 'Басқа']
  ].map(([ru, en, kz]) => row('', ru, '', en, '', kz, '')) })
];

export function localizeCompanyBlock(block, lang) {
  if (lang === 'ru') return block;
  const buttons = { en: { hero: 'Discuss a partnership', range: 'Browse the catalog', geography: 'Current contacts' }, kz: { hero: 'Серіктестікті талқылау', range: 'Каталогқа өту', geography: 'Қазіргі байланыс деректері' } };
  return { ...block, buttonText: buttons[lang]?.[block.companySection] || block.buttonText, ...block.translations?.[lang], items: block.items?.map(item => ({ ...item, ...item.translations?.[lang] })) };
}

// Migrate the previous system presentation once; employee-added blocks survive.
// Saved blocks retain their order and visibility; shipped illustrations upgrade.
export function getCompanyBlocks(blocks = []) {
  if (blocks.some(b => b.companySection)) {
    let migrated = false;
    const upgraded = blocks.map(block => {
      // Upgrade only the shipped six-image presentation, never employee media.
      const legacyIllustrations = block.companySection === 'production' && block.items?.length === 6 && block.items.every(item => /^images\/factory\/laute-process-[a-z]+-v2\.webp$/.test(item.imageUrl || ''));
      if (!legacyIllustrations) return block;
      migrated = true;
      const production = COMPANY_BLOCKS.find(item => item.companySection === 'production');
      return {
        ...block, items: production.items, subtitle: production.subtitle,
        translations: {
          ...block.translations,
          en: { ...block.translations?.en, subtitle: production.translations.en.subtitle },
          kz: { ...block.translations?.kz, subtitle: production.translations.kz.subtitle }
        },
        processMediaVersion: production.processMediaVersion
      };
    });
    return migrated ? upgraded : blocks;
  }
  return [...COMPANY_BLOCKS, ...blocks.filter(b => !b.id?.startsWith('blk-comp-') && !['factory_film', 'factory_history'].includes(b.type))];
}

// Legacy blocks remain available in the CMS library.
export const FACTORY_FILM = {
  id: 'laute-factory-film', type: 'factory_film', badge: 'LAUTE / МАТЕРИАЛЫ И ПРОИЗВОДСТВО',
  title: 'Характер рождается в деталях.',
  subtitle: 'Металл, точность обработки и внимание к поверхности. Короткий взгляд на производство LAUTE — и визуальная история материалов.',
  videoUrl: 'media/laute-factory-documentary.mp4', imageUrl: 'images/factory/surface-study.webp',
  buttonText: 'Обсудить сотрудничество', buttonLink: '/partners',
  style: { background: 'transparent', padding: 'lg' }
};

export const FACTORY_HISTORY = {
  id: 'laute-factory-history', type: 'factory_history', badge: 'ИСТОРИЯ, КОТОРАЯ ПРОДОЛЖАЕТСЯ',
  title: 'Следующий шаг — ближе к будущему.',
  subtitle: 'Новые коллекции. Новые маршруты. Тот же характер LAUTE.',
  items: [
    { year: '2025', title: 'Новая глава флагманского бренда', desc: 'Год масштабного расширения коллекций под флагманским брендом LAUTE. Solana, Ethereum и Bitcoin отсылают к миру Web3 и выражают интерес бренда к технологиям будущего. Web3 и AI становятся частью нового взгляда LAUTE на развитие отрасли.', note: 'SOLANA / ETHEREUM / BITCOIN' },
    { year: '2026', title: 'Алматы. На новом Шёлковом пути.', desc: 'LAUTE открывает склад в Алматы — одной из ключевых точек исторического Шёлкового пути. Это новый этап развития логистики и сотрудничества в Центральной Азии: завод становится ближе к своим партнёрам и их проектам.', note: 'LAUTE / ALMATY / CENTRAL ASIA' }
  ], style: { background: 'transparent', padding: 'lg' }
};
