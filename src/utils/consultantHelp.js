import { getRegionConfig } from '../data/regionsData.js';
import { normalizeSearch } from './catalogSearch.js';

export const commercialTermsQuestion = /минимальн[а-я]+ заказ|услов[а-я]+ (сотрудничеств|постав|оптов)|оптов[а-я]+ скидк|minimum order|partner terms|wholesale discount|ең аз тапсырыс/u;

const helpTopics = [
  [/^(?:привет|здравствуй(?:те)?|hi|hello|сәлем|сәлеметсіз бе)[!. ]*$/u, [
    'Здравствуйте! Опишите, что нужно подобрать, или пришлите артикул модели.',
    'Hello! Tell me what you’re shopping for or send a model SKU.',
    'Сәлеметсіз бе! Не іздеп жатқаныңызды немесе модель артикулын жазыңыз.'
  ]],
  [/^(?:спасибо(?: большое)?|thanks|thank you|рахмет)[!. ]*$/u, [
    'Пожалуйста! Если нужно уточнить что-то по подборке, можно сослаться на позицию по порядку или назвать артикул.',
    'You’re welcome! Refer to a model by its position in the shortlist or by SKU to ask a follow-up.',
    'Оқасы жоқ! Қосымша сұрақ болса, үлгінің тізімдегі орнын немесе артикулын айтыңыз.'
  ]],
  [/картридж|cartridge/u, [
    'Картридж в однорычажном смесителе регулирует напор и смешивает горячую и холодную воду. Для замены сверьте диаметр, высоту штока и посадку по артикулу смесителя.',
    'A single-lever cartridge controls the flow and mixes hot and cold water. Before replacing it, check the diameter, stem height and fit for your model.',
    'Картридж су ағынын реттеп, ыстық және суық суды араластырады. Ауыстырмас бұрын диаметрі мен бекіту өлшемдерін модель бойынша тексеріңіз.'
  ]],
  [/аэратор|aerator/u, [
    'Аэратор стоит на конце излива и формирует струю. Для замены проверьте диаметр резьбы и её тип: внутренняя, наружная или скрытая.',
    'An aerator sits at the tip of the spout and shapes the stream. Check the thread diameter and whether it is internal, external or recessed before replacing it.',
    'Аэратор шүмектің ұшында орналасып, су ағынын қалыптастырады. Ауыстырмас бұрын бұранда түрі мен диаметрін тексеріңіз.'
  ]],
  [/под окн|открыв[^ ]* окн|под шкаф|низк[^ ]* шкаф|under (a )?(window|cabinet)|clearance|терезе аст/u, [
    'Измерьте расстояние от поверхности мойки до нижней кромки створки или шкафа. Сравните его с общей высотой смесителя, учитывая поднятую ручку. По вылету излива проверьте, что струя попадёт внутрь чаши.',
    'Measure from the sink deck to the bottom of the window sash or cabinet. Compare that clearance with the overall faucet height, including the raised handle. Use the spout reach to check that the stream will land inside the bowl.',
    'Жуғыш бетінен терезе жақтауына немесе шкафқа дейін өлшеңіз. Араластырғыштың толық биіктігін, көтерілген тұтқасын және шүмектің су ағынын тостағанға бағыттайтынын тексеріңіз.'
  ]],
  [/брызг|неглубок[а-я]* мойк|splash|shallow sink/u, [
    'Для неглубокой мойки сверьте высоту до излива и вылет по чертежу. Чем выше струя падает на дно, тем больше риск брызг. Проверьте, что она направлена внутрь чаши и вдали от края.',
    'For a shallow sink, check spout height and reach on the drawing. A longer drop increases the chance of splashing. Aim the stream inside the bowl, away from its rim.',
    'Таяз жуғышқа шүмек биіктігі мен ұзындығын сызбадан тексеріңіз. Су биіктен түссе, көбірек шашырайды. Ағын тостағанның ішіне бағытталсын.'
  ]],
  [/гаранти|warranty|кепілдік/u, [
    'Гарантийный срок и условия указаны в талоне конкретной модели. Для обращения подготовьте артикул, чек и фото или видео дефекта.',
    'The model’s warranty card gives its term and conditions. For a service request, have the SKU, receipt and photos or video of the defect ready.',
    'Мерзім мен талаптар модельдің кепілдік талонында көрсетілген. Қызметке жүгінгенде артикул, чек және ақаудың фотосын не видеосын дайындаңыз.'
  ]],
  [/теч[а-я]*|протеч|капает|\bleak|тамшыла/u, [
    'Сначала определите, откуда течёт: из носика, из-под ручки или у соединения со шлангом. При активной протечке перекройте воду. Место протечки и артикул помогут сервису проверить, какую деталь нужно заменить.',
    'Check whether the leak comes from the spout, handle or hose connection. Shut off the water if it is actively leaking. The location and SKU help service identify the affected part.',
    'Су шүмектен, тұтқадан немесе шланг қосылысынан аға ма, тексеріңіз. Су ағып жатса, беруді жабыңыз. Ақау орны мен артикул бөлшекті анықтауға көмектеседі.'
  ]],
  [/как выбрат|как подобрат|how to choos|қалай таңдау/u, [
    'Начните с места и типа монтажа. Затем проверьте высоту и вылет излива по чертежу, чтобы струя попадала в чашу. Для кухни подумайте, нужен ли отдельный канал под фильтр или гибкий излив. Для какой зоны подбираете смеситель?',
    'Start with the fixture location and mounting type. Check spout height and reach on the drawing so the stream lands in the bowl. In a kitchen, consider a separate filtered-water channel or a flexible spout. Where will the faucet be installed?',
    'Алдымен орнату орны мен монтаж түрін таңдаңыз. Су тостағанға түсуі үшін шүмектің биіктігі мен ұзындығын сызбадан тексеріңіз. Араластырғыш қай бөлмеге керек?'
  ]],
  [/компани|о laute|истори|производ|about laute|history|company|туралы|тарих/u, [
    'LAUTE выпускает смесители и сантехнику для кухни и ванной. История началась в 1998 году с мастерской кухонной мебели в Ганновере. В 2003 году компания начала инвестировать в собственное направление производства смесителей.',
    'LAUTE makes faucets and fittings for kitchens and bathrooms. Its history began in a kitchen furniture workshop in Hanover in 1998. The company began investing in faucet manufacturing in 2003.',
    'LAUTE асүй мен ваннаға арналған араластырғыштар мен сантехника шығарады. Тарихы 1998 жылы Ганновердегі асүй жиһазы шеберханасынан басталды. 2003 жылы компания араластырғыш өндірісіне инвестиция сала бастады.'
  ]]
];

export function getConsultantHelp(message, { region, lang, baseUrl }) {
  const query = normalizeSearch(message);
  const index = lang === 'en' ? 1 : lang === 'kz' ? 2 : 0;
  if (commercialTermsQuestion.test(query)) {
    const contact = getRegionConfig(region);
    const text = [
      'Оптовые цены и условия заказа зависят от аккаунта и региона. Если у вас есть кабинет партнёра, откройте каталог под своим аккаунтом. Минимальный заказ и условия поставки можно уточнить у отдела продаж.',
      'Wholesale prices and order terms depend on your account and region. Sign in to see your account prices. Contact sales to confirm the minimum order and delivery terms.',
      'Көтерме баға мен тапсырыс шарттары аккаунт пен өңірге байланысты. Аккаунттағы бағаны көру үшін кабинетке кіріңіз. Ең аз тапсырыс пен жеткізу шарттарын сату бөлімінен нақтылаңыз.'
    ];
    return { text: text[index] + '\n' + contact.altEmail, sources: [{ title: 'LAUTE B2B', url: baseUrl + 'partners' }] };
  }
  if (/контакт|телефон|почта|сервис|contact|service|байланыс/u.test(query)) {
    const details = getRegionConfig(region);
    const service = /сервис|service/u.test(query);
    return {
      text: `${details.names[lang] || details.names.ru} · LAUTE\n${details.primaryPhone} · ${service ? details.serviceEmail : details.primaryEmail}`,
      sources: [{ title: service ? 'LAUTE Service' : 'LAUTE', url: baseUrl + (service ? 'service' : 'contacts') }]
    };
  }
  const topic = helpTopics.find(([pattern]) => pattern.test(query));
  if (topic) return { text: topic[1][index] };
  return null;
}
