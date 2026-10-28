// Primary source: https://laute.ltd/company. Additional context: /catalog, /partner, /service.
// These are source-reported figures, not independently verified 2026 statistics.
const row = (year, title, desc, enTitle, enDesc, kzTitle, kzDesc) => ({ year, title, desc, translations: { en: { title: enTitle, desc: enDesc }, kz: { title: kzTitle, desc: kzDesc } } });
const section = (name, type, title, subtitle, enTitle, enSubtitle, kzTitle, kzSubtitle, extra = {}) => ({
  id: `company-v2-${name}`, companySection: name, type, title, subtitle,
  translations: { en: { title: enTitle, subtitle: enSubtitle }, kz: { title: kzTitle, subtitle: kzSubtitle } },
  style: { background: 'deep', padding: 'lg' }, ...extra
});

export const COMPANY_BLOCKS = [
  section('hero', 'image_text', 'LAUTE. От истоков — к производству.', 'История с 1998 года. Производство смесителей, международная сеть и люди, которые развивают её вместе с заводом.', 'LAUTE. From its origins to manufacturing.', 'A history beginning in 1998. Faucet manufacturing, an international network and the people building it with the factory.', 'LAUTE. Бастаудан өндіріске дейін.', '1998 жылдан басталған тарих. Араластырғыштар өндірісі, халықаралық желі және оны зауытпен бірге дамытатын адамдар.', { badge: 'LAUTE / COMPANY', imageUrl: 'images/factory/laute-casting.png', buttonText: 'Обсудить сотрудничество', buttonLink: '#company-v2-inquiry' }),
  section('scale', 'features', 'Масштаб в цифрах', 'Показатели из презентации завода на laute.ltd. История в ней доведена до 2024 года; дата обновления самих показателей не указана.', 'Manufacturing at a glance', 'Figures from the factory presentation on laute.ltd. Its timeline ends in 2024; the figures have no stated update date.', 'Өндіріс ауқымы', 'laute.ltd зауыт таныстырылымындағы көрсеткіштер. Ондағы тарих 2024 жылға дейін берілген; көрсеткіштердің жаңартылған күні көрсетілмеген.', { items: [
    row('', '3', 'завода в Китае', '3', 'factories in China', '3', 'Қытайдағы зауыт'),
    row('', '10', 'офисов продаж в семи странах и регионах', '10', 'sales offices across seven countries and regions', '10', 'жеті ел мен аймақтағы сату кеңсесі'),
    row('', '1 600', 'партнёров', '1,600', 'partners', '1 600', 'серіктес'),
    row('', '200 000', 'смесителей в месяц', '200,000', 'faucets per month', '200 000', 'айына шығарылатын араластырғыш')
  ] }),
  section('history', 'factory_history', 'История, шаг за шагом', 'От мебельной мастерской в Германии до международной сети завода смесителей. По материалам LAUTE.', 'A history, step by step', 'From a furniture workshop in Germany to an international faucet manufacturing network. Based on LAUTE materials.', 'Тарих: қадам сайын', 'Германиядағы жиһаз шеберханасынан халықаралық араластырғыштар өндірісі желісіне дейін. LAUTE материалдары бойынша.', { items: [
    row('1998', 'Начало в Ганновере', 'Предприниматель Пауль Франк (Paul Frank) основывает Laute Küchenmöbel в Ганновере, Нижняя Саксония: мастерскую кухонной мебели премиум-класса из натуральных материалов.', 'The beginning in Hanover', 'Entrepreneur Paul Frank establishes Laute Küchenmöbel in Hanover, Lower Saxony: a workshop making premium kitchen furniture from natural materials.', 'Ганновердегі бастау', 'Кәсіпкер Пауль Франк Төменгі Саксониядағы Ганноверде табиғи материалдардан жоғары санатты асүй жиһазын жасайтын Laute Küchenmöbel шеберханасын ашады.'),
    row('2002', 'Выход на азиатский рынок', 'Пауль Франк открывает завод кухонной мебели в Вэньчжоу, китайская провинция Чжэцзян.', 'Entering the Asian market', 'Paul Frank opens a kitchen furniture factory in Wenzhou, Zhejiang province, China.', 'Азия нарығына шығу', 'Пауль Франк Қытайдың Чжэцзян провинциясындағы Вэньчжоуда асүй жиһазы зауытын ашады.'),
    row('2003', 'Первый шаг к смесителям', 'Инвестиции в создание завода смесителей совместно с группой предпринимателей из Вэньчжоу.', 'Moving into faucets', 'Investment in a faucet factory in partnership with a group of Wenzhou entrepreneurs.', 'Араластырғыштар өндірісіне қадам', 'Вэньчжоу кәсіпкерлерімен бірлесіп араластырғыштар зауытын құруға инвестиция салынады.'),
    row('2005', 'Представительство в СНГ', 'Начинает работу представительство в СНГ. Первый склад завода смесителей LAUTE открывается в Москве.', 'A presence in the CIS', 'The CIS representative office begins operating, with the first LAUTE faucet warehouse in Moscow.', 'ТМД-дағы өкілдік', 'ТМД өкілдігі жұмысын бастайды. Мәскеуде LAUTE араластырғыштар зауытының алғашқы қоймасы ашылады.'),
    row('2015', 'Инвестиции в производство', 'Немецкие и китайские акционеры увеличивают инвестиции в завод. Немецкие инженеры включаются в производственные процессы и усиливают контроль качества.', 'Investing in production', 'German and Chinese shareholders increase investment. German engineers join production operations and strengthen quality control.', 'Өндіріске инвестиция', 'Неміс және қытай акционерлері зауытқа инвестицияны арттырады. Неміс инженерлері өндіріс үдерістеріне қатысып, сапа бақылауын күшейтеді.'),
    row('2016', 'Появление Rainsberg', 'Для российского рынка запускается производство смесителей Rainsberg в эконом-сегменте.', 'Introducing Rainsberg', 'Rainsberg faucet production begins for the economy segment of the Russian market.', 'Rainsberg маркасының пайда болуы', 'Ресей нарығының үнемді сегментіне арналған Rainsberg араластырғыштары шығарыла бастайды.'),
    row('2018', 'Гонконг и Сибирь', 'В Гонконге открывается совместная немецко-китайская корпорация Laute LTD. Многократно растут вложения в товарные запасы в России; появляется первый региональный склад в Сибири.', 'Hong Kong and Siberia', 'The joint German–Chinese corporation Laute LTD opens in Hong Kong. Investment in Russian stock multiplies, and the first regional warehouse opens in Siberia.', 'Гонконг және Сібір', 'Гонконгте неміс-қытай Laute LTD корпорациясы ашылады. Ресейдегі тауар қорына инвестициялар еселеп өсіп, Сібірдегі алғашқы өңірлік қойма ашылады.'),
    row('2020', 'Новая модель партнёрства', 'Завод представляет модель дистрибуции, позволяющую партнёрам развивать собственный дилерский бизнес на его инфраструктуре. В исходной презентации модель описана как старт без вложений; действующие условия согласовываются индивидуально.', 'A new partnership model', 'The factory introduces partner dealer businesses using its infrastructure. The source describes starting without investment; current terms are agreed individually.', 'Серіктестіктің жаңа үлгісі', 'Зауыт инфрақұрылымын пайдаланып, жеке дилерлік бизнесті дамыту үлгісі енгізіледі. Бастапқы таныстырылымда инвестициясыз бастау көрсетілген; қолданыстағы шарттар жеке келісіледі.'),
    row('2022', 'Офис в Казахстане', 'На фоне роста продаж открывается офис в Казахстане. Заявки на сотрудничество принимаются из городов страны через сайт.', 'An office in Kazakhstan', 'An office opens in Kazakhstan as sales grow. Partnership enquiries are accepted through the website from cities across the country.', 'Қазақстандағы кеңсе', 'Сату көлемінің өсуімен Қазақстанда кеңсе ашылады. Ел қалаларынан серіктестік өтініштері сайт арқылы қабылданады.'),
    { ...row('2023', 'Выход на Amazon', 'LAUTE сообщает о выходе на американский рынок и размещении продукции на Amazon.', 'Launching on Amazon', 'LAUTE announces its entry into the US market and product listings on Amazon.', 'Amazon-ға шығу', 'LAUTE АҚШ нарығына шығып, Amazon-да өнімдерін орналастырғанын хабарлайды.'), link: 'https://clck.ru/353yyR' },
    row('2024', 'Офис-склад в Дубае', 'В международной сети появляется офис-склад в Дубае, ОАЭ.', 'An office and warehouse in Dubai', 'An office and warehouse in Dubai, UAE joins the international network.', 'Дубайдағы кеңсе-қойма', 'Халықаралық желіде БАӘ, Дубай қаласындағы кеңсе-қойма пайда болады.')
  ] }),
  section('production', 'gallery', 'Как рождается смеситель', 'Шесть этапов производства по описанию завода. Фотографии — с официальной страницы LAUTE.', 'How a faucet is made', 'Six production stages described by the factory. Photographs from the official LAUTE company page.', 'Араластырғыш қалай жасалады', 'Зауыт сипаттаған өндірістің алты кезеңі. Фотосуреттер LAUTE ресми парақшасынан алынған.', { items: [
    { ...row('', 'Литьё корпуса', 'Корпуса изготавливают по технологии, которую завод описывает как немецкое литьё.', 'Casting the body', 'Bodies are cast using what the factory describes as German casting technology.', 'Корпусты құю', 'Корпустар зауыт неміс құю технологиясы деп сипаттайтын әдіспен жасалады.'), imageUrl: 'images/factory/laute-casting.png' },
    { ...row('', 'Роботизированная обработка', 'Робот обрабатывает корпуса смесителей.', 'Robotic machining', 'A robot machines the faucet bodies.', 'Роботпен өңдеу', 'Робот араластырғыш корпустарын өңдейді.'), imageUrl: 'images/factory/laute-machining.png' },
    { ...row('', 'Автоматическая полировка', 'Поверхность полируют на автоматическом оборудовании до гладкого состояния.', 'Automatic polishing', 'Automatic equipment polishes the surfaces to a smooth finish.', 'Автоматты жылтырату', 'Автоматты жабдық беттерді тегіс болғанша жылтыратады.'), imageUrl: 'images/factory/laute-polishing.png' },
    { ...row('', 'Контроль ОТК', 'Сотрудники отдела технического контроля проверяют качество продукции.', 'Quality inspection', 'Quality control staff inspect the products.', 'Сапаны тексеру', 'Техникалық бақылау бөлімінің қызметкерлері өнім сапасын тексереді.'), imageUrl: 'images/factory/laute-inspection.png' },
    { ...row('', 'Защитное покрытие', 'Никелевое и хромовое покрытия защищают смесители от коррозии.', 'Protective plating', 'Nickel and chrome plating protect the faucets against corrosion.', 'Қорғаныш жабыны', 'Никель және хром жабындары араластырғыштарды коррозиядан қорғайды.'), imageUrl: 'images/factory/laute-plating.png' },
    { ...row('', 'Испытания после сборки', 'Проверка давлением: воздухом свыше 0,75 МПа и водой свыше 1,6 МПа.', 'Testing after assembly', 'Pressure tests: air above 0.75 MPa and water above 1.6 MPa.', 'Құрастырғаннан кейінгі сынақ', 'Қысыммен сынау: ауа — 0,75 МПа-дан жоғары, су — 1,6 МПа-дан жоғары.'), imageUrl: 'images/factory/laute-testing.png' }
  ] }),
  section('range', 'features', 'Ассортимент и ответственность', 'Более 2 000 наименований смесителей и сопутствующего оборудования разных ценовых категорий — по данным страницы завода.', 'Products and support', 'More than 2,000 faucets and related plumbing products across price segments, according to the factory page.', 'Ассортимент және жауапкершілік', 'Зауыт парақшасында әртүрлі баға санатындағы 2 000-нан астам араластырғыш пен ілеспе сантехника өнімі көрсетілген.', { buttonText: 'Перейти в каталог', buttonLink: '/catalog', items: [
    row('', 'Oute · до 7 лет', 'Заявленная заводом гарантия на смесители Oute.', 'Oute · up to 7 years', 'Factory-stated warranty for Oute faucets.', 'Oute · 7 жылға дейін', 'Oute араластырғыштарына зауыт мәлімдеген кепілдік.'),
    row('', 'Rainsberg · 3 года', 'Заявленная заводом гарантия на смесители Rainsberg.', 'Rainsberg · 3 years', 'Factory-stated warranty for Rainsberg faucets.', 'Rainsberg · 3 жыл', 'Rainsberg араластырғыштарына зауыт мәлімдеген кепілдік.'),
    row('', 'Срок службы · 15 лет', 'Заявленный срок службы изделий — отдельный показатель, не срок гарантии.', 'Service life · 15 years', 'The stated product service life is a separate measure from the warranty period.', 'Қызмет мерзімі · 15 жыл', 'Өнімнің мәлімделген қызмет мерзімі кепілдік мерзімінен бөлек көрсеткіш.')
  ], content: 'Для кухни и ванной, душевые системы, аксессуары, комплектующие, линия «Управляй водой» и многофункциональные мойки представлены в каталоге старого сайта. Гарантия конкретной модели определяется её талоном. Сохраните талон и упаковку; для обращения в сервис подготовьте описание неисправности, фото или видео изделия и дефекта, а также чек. Повреждения при неквалифицированной установке и применение агрессивных чистящих средств исключены из гарантийного обслуживания.' }),
  section('geography', 'contact_cards', 'География LAUTE', 'Германия, Китай, Гонконг, Россия, Казахстан, США и ОАЭ. Ниже — точки с карты исходной страницы. Архивные адреса не заменяют действующие контакты: уточняйте их перед визитом.', 'LAUTE around the world', 'Germany, China, Hong Kong, Russia, Kazakhstan, the USA and the UAE. Locations from the source map appear below. Historical addresses do not replace current contacts; confirm before visiting.', 'LAUTE географиясы', 'Германия, Қытай, Гонконг, Ресей, Қазақстан, АҚШ және БАӘ. Төменде бастапқы картадағы нүктелер берілген. Бұрынғы мекенжайлар қазіргі байланыс деректерін алмастырмайды; барар алдында нақтылаңыз.', { buttonText: 'Действующие контакты', buttonLink: '/contacts', items: [
    { title: 'Москва / Moscow / Мәскеу', desc: 'Офис-склад / Office & warehouse / Кеңсе-қойма · Вишнёвая ул., 7, Подольск, Московская область, 142111', lat: 55.47999, lng: 37.574965 },
    { title: 'Новосибирск / Novosibirsk', desc: 'Офис-склад / Office & warehouse / Кеңсе-қойма · ул. Блюхера, 71, Новосибирск, 630073', lat: 54.991578, lng: 82.901808 },
    { title: 'Вэньчжоу / Wenzhou', desc: 'Завод / Factory / Зауыт · 299 Haicheng Street Square Road, Longwan District, Wenzhou City, Zhejiang Province', lat: 27.9798432, lng: 120.664399 },
    { title: 'Ганновер / Hanover', desc: 'Офис-склад / Office & warehouse / Кеңсе-қойма · Hansastrabe 7-1, Hannover, Germany (написание из источника / source spelling)', lat: 52.421733, lng: 9.686426 },
    { title: 'Астана / Astana', desc: 'Офис продаж / Sales office / Сату кеңсесі · просп. Тауелсиздик, 24, Астана, 020000, Казахстан', lat: 51.144297, lng: 71.462634 },
    { title: 'Флорида / Florida', desc: 'Офис продаж / Sales office / Сату кеңсесі · 221 W Hallandale Beach BLVD 310, Hallandale FL 33009, USA', lat: 25.989639, lng: -80.151434 },
    { title: 'Дубай / Dubai', desc: 'Офис-склад / Office & warehouse / Кеңсе-қойма · Dubai, Miracle by Danube, office 2115', lat: 25.0580415, lng: 55.23941 },
    { title: 'Томск / Tomsk', desc: 'Офис продаж / Sales office / Сату кеңсесі', lat: 56.4977, lng: 84.9744 },
    { title: 'Усть-Каменогорск / Oskemen / Өскемен', desc: 'Офис продаж / Sales office / Сату кеңсесі', lat: 49.9714, lng: 82.6059 },
    { title: 'Техас / Texas', desc: 'Офис продаж / Sales office / Сату кеңсесі · 26077 Nelson Way, unit 1407, Katy 77494 TX, USA', lat: 29.775874, lng: -95.830287 }
  ] }),
  section('inquiry', 'form_lead', 'Давай обсудим сотрудничество', 'Расскажи о своём бизнесе и городе. Специалист уточнит доступность региона, подготовит предложение и обсудит условия договора — такой порядок описан в партнёрской программе LAUTE.', 'Let’s discuss a partnership', 'Tell us about your business and city. A specialist checks regional availability, prepares a proposal and discusses contract terms, following the LAUTE partnership process.', 'Серіктестікті талқылайық', 'Бизнесіңіз бен қалаңыз туралы айтыңыз. Маман өңірдің қолжетімділігін тексеріп, ұсыныс дайындайды және шарт талаптарын талқылайды — LAUTE серіктестік бағдарламасындағы тәртіп осындай.', { items: [
    ['Оптовая компания', 'Wholesaler', 'Көтерме компания'], ['Розничный магазин', 'Retail store', 'Бөлшек дүкен'], ['Сеть DIY', 'DIY chain', 'DIY желісі'], ['Сеть сантехмагазинов', 'Plumbing store chain', 'Сантехника дүкендері желісі'], ['Магазин сантехники', 'Plumbing store', 'Сантехника дүкені'], ['Общехозяйственный магазин', 'Hardware store', 'Шаруашылық дүкені'], ['Сеть общехозмагов', 'Hardware store chain', 'Шаруашылық дүкендері желісі'], ['Рыночная точка', 'Market stall', 'Базардағы сауда орны'], ['Подрядная организация', 'Contractor', 'Мердігер ұйым'], ['Дизайнер', 'Designer', 'Дизайнер'], ['Интернет-магазин', 'Online store', 'Интернет-дүкен'], ['Другое', 'Other', 'Басқа']
  ].map(([ru, en, kz]) => row('', ru, '', en, '', kz, '')) })
];

export function localizeCompanyBlock(block, lang) {
  if (lang === 'ru') return block;
  const buttons = { en: { hero: 'Discuss a partnership', range: 'Browse the catalog', geography: 'Current contacts' }, kz: { hero: 'Серіктестікті талқылау', range: 'Каталогқа өту', geography: 'Қазіргі байланыс деректері' } };
  return { ...block, buttonText: buttons[lang]?.[block.companySection] || block.buttonText, ...block.translations?.[lang], items: block.items?.map(item => ({ ...item, ...item.translations?.[lang] })) };
}

// Migrate the previous system presentation once; employee-added blocks survive.
// Saved v2 blocks remain authoritative, including their order and visibility.
export function getCompanyBlocks(blocks = []) {
  if (blocks.some(b => b.companySection)) return blocks;
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
