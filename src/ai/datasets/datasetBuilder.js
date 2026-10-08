/**
 * Генератор и сборщик обучающих датасетов LAUTE (Dataset Builder)
 * Создает сотни вариаций сообщений на трех языках (RU, EN, KZ)
 * с разметкой intent, action, языка и контекста.
 */

import { LAUTE_INTENTS } from '../intent/intents.js';
import { LAUTE_ACTIONS } from '../actions/actions.js';

export function generateLauteDataset() {
  const samples = [];

  // 1. GREETING -> TEXT_RESPONSE (Каталог строго ЗАПРЕЩЕН)
  const greetingTemplates = [
    { text: 'Привет', lang: 'ru' },
    { text: 'Здравствуйте', lang: 'ru' },
    { text: 'Добрый день', lang: 'ru' },
    { text: 'Добрый вечер', lang: 'ru' },
    { text: 'Доброе утро', lang: 'ru' },
    { text: 'Приветствую', lang: 'ru' },
    { text: 'Хай', lang: 'ru' },
    { text: 'Салам', lang: 'ru' },
    { text: 'Привет, как дела?', lang: 'ru' },
    { text: 'Здравствуй', lang: 'ru' },
    { text: 'Доброго времени суток', lang: 'ru' },
    { text: 'Привет, ты тут?', lang: 'ru' },
    { text: 'Сәлем', lang: 'kz' },
    { text: 'Сәлеметсіз бе', lang: 'kz' },
    { text: 'Ассалаумағалейкум', lang: 'kz' },
    { text: 'Қайырлы күн', lang: 'kz' },
    { text: 'Қайырлы таң', lang: 'kz' },
    { text: 'Сәлем, қалайсың?', lang: 'kz' },
    { text: 'Hello', lang: 'en' },
    { text: 'Hi', lang: 'en' },
    { text: 'Hey there', lang: 'en' },
    { text: 'Good day', lang: 'en' },
    { text: 'Good morning', lang: 'en' },
    { text: 'Good evening', lang: 'en' },
    { text: 'Hi, how are you?', lang: 'en' },
  ];
  greetingTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.GREETING,
      action: LAUTE_ACTIONS.TEXT_RESPONSE,
      lang: t.lang,
    });
  });

  // 2. SMALL_TALK -> TEXT_RESPONSE (Каталог строго ЗАПРЕЩЕН)
  const smallTalkTemplates = [
    { text: 'Как дела?', lang: 'ru' },
    { text: 'Как твои дела?', lang: 'ru' },
    { text: 'Как жизнь?', lang: 'ru' },
    { text: 'Как настроение?', lang: 'ru' },
    { text: 'Какая сегодня погода?', lang: 'ru' },
    { text: 'Сегодня хороший день', lang: 'ru' },
    { text: 'Что делаешь?', lang: 'ru' },
    { text: 'Как успехи?', lang: 'ru' },
    { text: 'Расскажи что-нибудь интересное', lang: 'ru' },
    { text: 'Расскажи анекдот', lang: 'ru' },
    { text: 'У меня отличное настроение', lang: 'ru' },
    { text: 'Қалайсың?', lang: 'kz' },
    { text: 'Қалайсыз?', lang: 'kz' },
    { text: 'Жағдай қалай?', lang: 'kz' },
    { text: 'Көңіл-күй қалай?', lang: 'kz' },
    { text: 'Не істеп жатырсың?', lang: 'kz' },
    { text: 'How are you?', lang: 'en' },
    { text: 'How is it going?', lang: 'en' },
    { text: 'How are things?', lang: 'en' },
    { text: 'How are you doing today?', lang: 'en' },
    { text: 'Nice weather today', lang: 'en' },
  ];
  smallTalkTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.SMALL_TALK,
      action: LAUTE_ACTIONS.TEXT_RESPONSE,
      lang: t.lang,
    });
  });

  // 3. ABOUT_AI -> TEXT_RESPONSE (Каталог строго ЗАПРЕЩЕН)
  const aboutAiTemplates = [
    { text: 'Ты кто?', lang: 'ru' },
    { text: 'Кто ты такой?', lang: 'ru' },
    { text: 'Кто ты?', lang: 'ru' },
    { text: 'Расскажи о себе', lang: 'ru' },
    { text: 'Что ты умеешь?', lang: 'ru' },
    { text: 'Чем ты можешь помочь?', lang: 'ru' },
    { text: 'Каковы твои возможности?', lang: 'ru' },
    { text: 'Ты человек или бот?', lang: 'ru' },
    { text: 'Ты искусственный интеллект?', lang: 'ru' },
    { text: 'Сен кімсің?', lang: 'kz' },
    { text: 'Сен не істей аласың?', lang: 'kz' },
    { text: 'Өзің туралы айтып берші', lang: 'kz' },
    { text: 'Who are you?', lang: 'en' },
    { text: 'What are you?', lang: 'en' },
    { text: 'Tell me about yourself', lang: 'en' },
    { text: 'What can you do?', lang: 'en' },
    { text: 'How can you help me?', lang: 'en' },
  ];
  aboutAiTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.ABOUT_AI,
      action: LAUTE_ACTIONS.TEXT_RESPONSE,
      lang: t.lang,
    });
  });

  // 4. ABOUT_LAUTE / ABOUT_COMPANY -> TEXT_RESPONSE (Каталог строго ЗАПРЕЩЕН)
  const aboutLauteTemplates = [
    { text: 'Расскажи о LAUTE', lang: 'ru' },
    { text: 'Что такое LAUTE?', lang: 'ru' },
    { text: 'Чем занимается компания LAUTE?', lang: 'ru' },
    { text: 'Кто производитель LAUTE?', lang: 'ru' },
    { text: 'Где производят сантехнику LAUTE?', lang: 'ru' },
    { text: 'История компании LAUTE', lang: 'ru' },
    { text: 'Что за бренд LAUTE?', lang: 'ru' },
    { text: 'Каковы стандарты качества LAUTE?', lang: 'ru' },
    { text: 'Расскажи о производстве', lang: 'ru' },
    { text: 'LAUTE компаниясы туралы айтып бер', lang: 'kz' },
    { text: 'LAUTE деген не?', lang: 'kz' },
    { text: 'LAUTE қай елдің бренді?', lang: 'kz' },
    { text: 'Tell me about LAUTE', lang: 'en' },
    { text: 'What is LAUTE?', lang: 'en' },
    { text: 'Where is LAUTE manufactured?', lang: 'en' },
    { text: 'About LAUTE company and standards', lang: 'en' },
  ];
  aboutLauteTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.ABOUT_LAUTE,
      action: LAUTE_ACTIONS.TEXT_RESPONSE,
      lang: t.lang,
    });
  });

  // 5. ABOUT_PRODUCTS -> SHOW_CATEGORY (Обзор направлений без навязывания конкретных артикулов)
  const aboutProductsTemplates = [
    { text: 'Что вы производите?', lang: 'ru' },
    { text: 'Что производит LAUTE?', lang: 'ru' },
    { text: 'Какую сантехнику вы делаете?', lang: 'ru' },
    { text: 'Какой у вас ассортимент?', lang: 'ru' },
    { text: 'Какие категории товаров есть?', lang: 'ru' },
    { text: 'LAUTE қандай өнімдер шығарады?', lang: 'kz' },
    { text: 'Сіздерде қандай тауарлар бар?', lang: 'kz' },
    { text: 'What products does LAUTE make?', lang: 'en' },
    { text: 'What do you produce?', lang: 'en' },
    { text: 'Show product lines', lang: 'en' },
  ];
  aboutProductsTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.ABOUT_PRODUCTS,
      action: LAUTE_ACTIONS.SHOW_CATEGORY,
      lang: t.lang,
    });
  });

  // 6. PRODUCT_SELECTION (Неопределенный запрос) -> ASK_CLARIFICATION (НЕ показывать каталог сразу!)
  const selectionClarificationTemplates = [
    { text: 'Мне нужен смеситель', lang: 'ru' },
    { text: 'Хочу купить смеситель', lang: 'ru' },
    { text: 'Посоветуй смеситель', lang: 'ru' },
    { text: 'Помоги выбрать кран', lang: 'ru' },
    { text: 'Мне нужен хороший смеситель, но не знаю какой', lang: 'ru' },
    { text: 'Подбери что-нибудь надежное', lang: 'ru' },
    { text: 'Хочу кран для дома', lang: 'ru' },
    { text: 'Посоветуйте надежный смеситель', lang: 'ru' },
    { text: 'Ищу кран', lang: 'ru' },
    { text: 'Смеситель керек', lang: 'kz' },
    { text: 'Маған кран таңдап берші', lang: 'kz' },
    { text: 'Араластырғыш сатып алғым келеді', lang: 'kz' },
    { text: 'I need a mixer tap', lang: 'en' },
    { text: 'I want to buy a faucet', lang: 'en' },
    { text: 'Recommend a good mixer', lang: 'en' },
    { text: 'Help me choose a faucet', lang: 'en' },
  ];
  selectionClarificationTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.PRODUCT_SELECTION,
      action: LAUTE_ACTIONS.ASK_CLARIFICATION,
      lang: t.lang,
    });
  });

  // 7. PRODUCT_SEARCH (Конкретный запрос с параметрами) -> SHOW_PRODUCTS (Показываем карточки!)
  const searchProductTemplates = [
    { text: 'Покажи смесители для кухни', lang: 'ru' },
    { text: 'Мне нужен черный смеситель для раковины', lang: 'ru' },
    { text: 'Покажи смесители с гибким изливом', lang: 'ru' },
    { text: 'Смеситель 2 в 1 с фильтром для питьевой воды', lang: 'ru' },
    { text: 'Покажи высокие смесители для раковины-чаши', lang: 'ru' },
    { text: 'Душевая система со стойкой тропический душ', lang: 'ru' },
    { text: 'Смеситель для ванны с длинным изливом 350 мм', lang: 'ru' },
    { text: 'Черный матовый смеситель на кухню', lang: 'ru' },
    { text: 'Покажи хромированные смесители для мойки', lang: 'ru' },
    { text: 'Компактный смеситель для маленькой кухни', lang: 'ru' },
    { text: 'Смеситель Prime K-10', lang: 'ru' },
    { text: 'Quadro Filter смеситель', lang: 'ru' },
    { text: 'Асүйге арналған араластырғыштарды көрсет', lang: 'kz' },
    { text: 'Қара түсті қолжуғыш смесительдері', lang: 'kz' },
    { text: 'Ауыз су сүзгісі бар 2-і-1 смеситель', lang: 'kz' },
    { text: 'Ваннаға арналған ұзын изливті кран', lang: 'kz' },
    { text: 'Show kitchen mixer taps', lang: 'en' },
    { text: 'Show black bathroom faucets', lang: 'en' },
    { text: '2-in-1 drinking filter faucets', lang: 'en' },
    { text: 'Show shower column systems', lang: 'en' },
    { text: 'Flexible spout kitchen faucets', lang: 'en' },
    { text: 'High body basin faucets for vessel sinks', lang: 'en' },
  ];
  searchProductTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.PRODUCT_SEARCH,
      action: LAUTE_ACTIONS.SHOW_PRODUCTS,
      lang: t.lang,
    });
  });

  // 8. PRODUCT_COMPARISON -> COMPARE_PRODUCTS
  const comparisonTemplates = [
    { text: 'Сравни этот смеситель и тот', lang: 'ru' },
    { text: 'Чем отличается модель Prime K-10 от Quadro Filter?', lang: 'ru' },
    { text: 'В чем разница между высоким и низким изливом?', lang: 'ru' },
    { text: 'Чем отличается смеситель для кухни от смесителя для ванной?', lang: 'ru' },
    { text: 'Сравнить эти два варианта', lang: 'ru' },
    { text: 'Осы екі араластырғышты салыстыр', lang: 'kz' },
    { text: 'Асүй мен ванна смесительдерінің айырмашылығы қандай?', lang: 'kz' },
    { text: 'Compare these two models', lang: 'en' },
    { text: 'What is the difference between kitchen and bath faucets?', lang: 'en' },
    { text: 'Compare high spout and low spout', lang: 'en' },
  ];
  comparisonTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.PRODUCT_COMPARISON,
      action: LAUTE_ACTIONS.COMPARE_PRODUCTS,
      lang: t.lang,
    });
  });

  // 9. TECHNICAL_QUESTION -> TEXT_RESPONSE (Инженерные объяснения)
  const techTemplates = [
    { text: 'Что такое картридж в смесителе?', lang: 'ru' },
    { text: 'Из какой латуни сделан корпус?', lang: 'ru' },
    { text: 'Что такое латунь CW617N?', lang: 'ru' },
    { text: 'Почему вода течет из-под крана?', lang: 'ru' },
    { text: 'Какое давление выдерживает смеситель?', lang: 'ru' },
    { text: 'Что такое аэратор Neoperl Rub-Clean?', lang: 'ru' },
    { text: 'Сколько циклов выдерживает картридж Sedal?', lang: 'ru' },
    { text: 'Картридж деген не?', lang: 'kz' },
    { text: 'CW617N латуні деген не?', lang: 'kz' },
    { text: 'Краннан неге су ағады?', lang: 'kz' },
    { text: 'What is a ceramic cartridge?', lang: 'en' },
    { text: 'What is CW617N brass?', lang: 'en' },
    { text: 'Why is the faucet leaking?', lang: 'en' },
    { text: 'How much water pressure does it withstand?', lang: 'en' },
  ];
  techTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.TECHNICAL_QUESTION,
      action: LAUTE_ACTIONS.TEXT_RESPONSE,
      lang: t.lang,
    });
  });

  // 10. WARRANTY & SERVICE -> SHOW_SERVICE
  const serviceTemplates = [
    { text: 'Какая гарантия на смесители LAUTE?', lang: 'ru' },
    { text: 'Условия гарантийного обслуживания', lang: 'ru' },
    { text: 'Как работает цифровой сервис LAUTE?', lang: 'ru' },
    { text: 'Где найти сервисный центр?', lang: 'ru' },
    { text: 'Что делать при гарантийном случае?', lang: 'ru' },
    { text: 'Кепілдік мерзімі қандай?', lang: 'kz' },
    { text: 'Сервистік қызмет қалай жұмыс істейді?', lang: 'kz' },
    { text: 'What is the warranty period?', lang: 'en' },
    { text: 'How does LAUTE service work?', lang: 'en' },
  ];
  serviceTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.WARRANTY,
      action: LAUTE_ACTIONS.SHOW_SERVICE,
      lang: t.lang,
    });
  });

  // 11. PARTNERSHIP -> SHOW_PARTNERSHIP
  const partnerTemplates = [
    { text: 'Хочу стать дилером LAUTE', lang: 'ru' },
    { text: 'Сотрудничество для девелоперов и строителей', lang: 'ru' },
    { text: 'Дилер болу шарттары қандай?', lang: 'kz' },
    { text: 'Серіктестік орнату туралы', lang: 'kz' },
    { text: 'How to become a LAUTE dealer?', lang: 'en' },
    { text: 'Partnership opportunities for developers', lang: 'en' },
  ];
  partnerTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.PARTNERSHIP,
      action: LAUTE_ACTIONS.SHOW_PARTNERSHIP,
      lang: t.lang,
    });
  });

  // 12. WHOLESALE -> SHOW_PARTNERSHIP
  const wholesaleTemplates = [
    { text: 'Условия оптовых закупок', lang: 'ru' },
    { text: 'Как получить оптовый прайс-лист?', lang: 'ru' },
    { text: 'Оптовые поставки сантехники', lang: 'ru' },
    { text: 'Оптовые цены на смесители', lang: 'ru' },
    { text: 'Көтерме сауда шарттары', lang: 'kz' },
    { text: 'Көтерме бағалар прайсы', lang: 'kz' },
    { text: 'Wholesale partnership terms', lang: 'en' },
    { text: 'B2B price list for distributors', lang: 'en' },
  ];
  wholesaleTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.WHOLESALE,
      action: LAUTE_ACTIONS.SHOW_PARTNERSHIP,
      lang: t.lang,
    });
  });

  // 13. SERVICE -> SHOW_SERVICE
  const serviceCenterTemplates = [
    { text: 'Как работает сервисный центр?', lang: 'ru' },
    { text: 'Где находится сервисный центр LAUTE?', lang: 'ru' },
    { text: 'Сервисное обслуживание смесителей', lang: 'ru' },
    { text: 'Ремонт и запчасти LAUTE', lang: 'ru' },
    { text: 'Сервистік қызмет көрсету', lang: 'kz' },
    { text: 'Қосалқы бөлшектер мен жөндеу', lang: 'kz' },
    { text: 'Where is the LAUTE service center?', lang: 'en' },
    { text: 'Maintenance and spare parts service', lang: 'en' },
  ];
  serviceCenterTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.SERVICE,
      action: LAUTE_ACTIONS.SHOW_SERVICE,
      lang: t.lang,
    });
  });

  // 14. CONTACTS -> SHOW_CONTACTS
  const contactTemplates = [
    { text: 'Контакты компании LAUTE', lang: 'ru' },
    { text: 'Телефон офиса и отдела продаж', lang: 'ru' },
    { text: 'Электронная почта и реквизиты', lang: 'ru' },
    { text: 'Как связаться с LAUTE?', lang: 'ru' },
    { text: 'Байланыс нөмірлері', lang: 'kz' },
    { text: 'Кеңсе телефоны және байланыс', lang: 'kz' },
    { text: 'Office contacts and phone numbers', lang: 'en' },
    { text: 'How to contact sales support?', lang: 'en' },
  ];
  contactTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.CONTACTS,
      action: LAUTE_ACTIONS.SHOW_CONTACTS,
      lang: t.lang,
    });
  });

  // 15. REGIONS -> SHOW_CONTACTS
  const regionsTemplates = [
    { text: 'Где находятся ваши склады?', lang: 'ru' },
    { text: 'Адрес склада в Алматы', lang: 'ru' },
    { text: 'Адрес склада в Астане', lang: 'ru' },
    { text: 'Адрес склада в Новосибирске', lang: 'ru' },
    { text: 'Адрес склада в Москве', lang: 'ru' },
    { text: 'Алматыдағы қойманың мекенжайы', lang: 'kz' },
    { text: 'Астанадағы қойманың мекенжайы', lang: 'kz' },
    { text: 'Where are your regional warehouses?', lang: 'en' },
    { text: 'Warehouse addresses in Almaty and Moscow', lang: 'en' },
  ];
  regionsTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.REGIONS,
      action: LAUTE_ACTIONS.SHOW_CONTACTS,
      lang: t.lang,
    });
  });

  // 16. DELIVERY -> TEXT_RESPONSE
  const deliveryTemplates = [
    { text: 'Как осуществляется доставка?', lang: 'ru' },
    { text: 'Сколько времени занимает доставка?', lang: 'ru' },
    { text: 'Есть ли самовывоз со склада?', lang: 'ru' },
    { text: 'Жеткізу қалай жасалады?', lang: 'kz' },
    { text: 'Тауарды қалай жеткізесіздер?', lang: 'kz' },
    { text: 'How does shipping and delivery work?', lang: 'en' },
    { text: 'Can I pick up orders from the warehouse?', lang: 'en' },
  ];
  deliveryTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.DELIVERY,
      action: LAUTE_ACTIONS.TEXT_RESPONSE,
      lang: t.lang,
    });
  });

  // 17. STOCK -> TEXT_RESPONSE
  const stockTemplates = [
    { text: 'Есть ли товар в наличии на складе?', lang: 'ru' },
    { text: 'Какой остаток товара на складе?', lang: 'ru' },
    { text: 'Товар бар ма қоймада?', lang: 'kz' },
    { text: 'Қоймадағы қалдықтар қандай?', lang: 'kz' },
    { text: 'Is this item currently in stock?', lang: 'en' },
    { text: 'Check warehouse availability', lang: 'en' },
  ];
  stockTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.STOCK,
      action: LAUTE_ACTIONS.TEXT_RESPONSE,
      lang: t.lang,
    });
  });

  // 18. PRICE -> TEXT_RESPONSE
  const priceTemplates = [
    { text: 'Сколько стоит этот смеситель?', lang: 'ru' },
    { text: 'Какая цена у моделей LAUTE?', lang: 'ru' },
    { text: 'Где посмотреть розничные цены?', lang: 'ru' },
    { text: 'Бағасы қанша тұрады?', lang: 'kz' },
    { text: 'Бағалар тізімі қайда?', lang: 'kz' },
    { text: 'What is the price of this faucet?', lang: 'en' },
    { text: 'Where can I see retail prices?', lang: 'en' },
  ];
  priceTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.PRICE,
      action: LAUTE_ACTIONS.TEXT_RESPONSE,
      lang: t.lang,
    });
  });

  // 19. APPLICATION -> SHOW_CONTACTS
  const applicationTemplates = [
    { text: 'Хочу оставить заявку на покупку', lang: 'ru' },
    { text: 'Как оформить заявку на заказ?', lang: 'ru' },
    { text: 'Тапсырыс беру үшін өтінім қалдыру', lang: 'kz' },
    { text: 'Өтінім қалай беремін?', lang: 'kz' },
    { text: 'I want to submit a purchase inquiry', lang: 'en' },
    { text: 'How do I place an order request?', lang: 'en' },
  ];
  applicationTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.APPLICATION,
      action: LAUTE_ACTIONS.SHOW_CONTACTS,
      lang: t.lang,
    });
  });

  // 20. PRODUCT_DETAILS -> SHOW_PRODUCT
  const productDetailsTemplates = [
    { text: 'Подробные характеристики Prime K-10', lang: 'ru' },
    { text: 'Покажи паспорт модели Quadro Filter', lang: 'ru' },
    { text: 'Детальная информация о смесителе', lang: 'ru' },
    { text: 'Өнімнің толық сипаттамасы', lang: 'kz' },
    { text: 'Detailed specifications of this model', lang: 'en' },
  ];
  productDetailsTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.PRODUCT_DETAILS,
      action: LAUTE_ACTIONS.SHOW_PRODUCT,
      lang: t.lang,
    });
  });

  // 21. ABOUT_COMPANY -> TEXT_RESPONSE
  const companyTemplates = [
    { text: 'Расскажи о философии компании', lang: 'ru' },
    { text: 'Кто стоит за брендом LAUTE?', lang: 'ru' },
    { text: 'Миссия и стандарты компании', lang: 'ru' },
    { text: 'Компанияның философиясы мен мақсаты', lang: 'kz' },
    { text: 'Company mission and manufacturing vision', lang: 'en' },
  ];
  companyTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.ABOUT_COMPANY,
      action: LAUTE_ACTIONS.TEXT_RESPONSE,
      lang: t.lang,
    });
  });

  // 22. OFF_TOPIC -> TEXT_RESPONSE (Каталог строго ЗАПРЕЩЕН)
  const offTopicTemplates = [
    { text: 'Кто такой Наполеон Бонапарт?', lang: 'ru' },
    { text: 'Какая завтра погода?', lang: 'ru' },
    { text: 'Сколько стоит биткоин?', lang: 'ru' },
    { text: 'Какой сейчас курс доллара?', lang: 'ru' },
    { text: 'Кто выиграл чемпионат мира по футболу?', lang: 'ru' },
    { text: 'Посоветуй хороший фильм на вечер', lang: 'ru' },
    { text: 'бла бла хз ахаха', lang: 'ru' },
    { text: 'абракадабра лол', lang: 'ru' },
    { text: 'Что приготовить на ужин?', lang: 'ru' },
    { text: 'Что приготовить на обед?', lang: 'ru' },
    { text: 'Наполеон кім болған?', lang: 'kz' },
    { text: 'Биткоин бағамы қанша?', lang: 'kz' },
    { text: 'Who is Napoleon?', lang: 'en' },
    { text: 'What is the price of Bitcoin?', lang: 'en' },
    { text: 'Tell me a random story about space', lang: 'en' },
    { text: 'Tell me a random story', lang: 'en' },
    { text: 'blah blah haha', lang: 'en' },
  ];
  offTopicTemplates.forEach(t => {
    samples.push({
      text: t.text,
      intent: LAUTE_INTENTS.OFF_TOPIC,
      action: LAUTE_ACTIONS.TEXT_RESPONSE,
      lang: t.lang,
    });
  });

  // 23. GOODBYE & HELP
  const otherTemplates = [
    { text: 'Спасибо за помощь', intent: LAUTE_INTENTS.HELP, action: LAUTE_ACTIONS.TEXT_RESPONSE, lang: 'ru' },
    { text: 'Благодарю', intent: LAUTE_INTENTS.HELP, action: LAUTE_ACTIONS.TEXT_RESPONSE, lang: 'ru' },
    { text: 'Рахмет сізге', intent: LAUTE_INTENTS.HELP, action: LAUTE_ACTIONS.TEXT_RESPONSE, lang: 'kz' },
    { text: 'Thank you very much', intent: LAUTE_INTENTS.HELP, action: LAUTE_ACTIONS.TEXT_RESPONSE, lang: 'en' },
    { text: 'До свидания', intent: LAUTE_INTENTS.GOODBYE, action: LAUTE_ACTIONS.TEXT_RESPONSE, lang: 'ru' },
    { text: 'Пока', intent: LAUTE_INTENTS.GOODBYE, action: LAUTE_ACTIONS.TEXT_RESPONSE, lang: 'ru' },
    { text: 'Сау болыңыз', intent: LAUTE_INTENTS.GOODBYE, action: LAUTE_ACTIONS.TEXT_RESPONSE, lang: 'kz' },
    { text: 'Goodbye, have a nice day', intent: LAUTE_INTENTS.GOODBYE, action: LAUTE_ACTIONS.TEXT_RESPONSE, lang: 'en' },
    // 24. UNKNOWN
    { text: 'ээээээээ', intent: LAUTE_INTENTS.UNKNOWN, action: LAUTE_ACTIONS.TEXT_RESPONSE, lang: 'ru' },
    { text: 'фывапролдж', intent: LAUTE_INTENTS.UNKNOWN, action: LAUTE_ACTIONS.TEXT_RESPONSE, lang: 'ru' },
    { text: 'xyz123abc', intent: LAUTE_INTENTS.UNKNOWN, action: LAUTE_ACTIONS.TEXT_RESPONSE, lang: 'en' },
    // 25. Сложные запросы с опечатками
    { text: 'смеситль для кухн', intent: LAUTE_INTENTS.PRODUCT_SEARCH, action: LAUTE_ACTIONS.SHOW_PRODUCTS, lang: 'ru' },
    { text: 'хочу чорный кран на кухню', intent: LAUTE_INTENTS.PRODUCT_SEARCH, action: LAUTE_ACTIONS.SHOW_PRODUCTS, lang: 'ru' },
    { text: 'покажи душевие стойки', intent: LAUTE_INTENTS.PRODUCT_SEARCH, action: LAUTE_ACTIONS.SHOW_PRODUCTS, lang: 'ru' },
  ];
  otherTemplates.forEach(t => {
    samples.push(t);
  });

  // Аугментация выборки вариациями знаков препинания и регистра
  const augmented = [];
  samples.forEach(s => {
    augmented.push(s);
    // Вариант 1: без знаков
    const noPunct = s.text.replace(/[?!.,]/g, '').trim();
    if (noPunct !== s.text) {
      augmented.push({ ...s, text: noPunct });
    }
    // Вариант 2: нижний регистр
    const lower = s.text.toLowerCase();
    if (lower !== s.text) {
      augmented.push({ ...s, text: lower });
    }
  });

  return augmented;
}

export default generateLauteDataset;
