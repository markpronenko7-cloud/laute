export const ROLE_CODES = ['CDP', 'DAP', 'RSP', 'RAP', 'MDP'];

export const ROLE_EXPANSIONS = [
  'Chief Dealer Partner', 'Dealer Agent-Partner', 'Retail Sales Partner',
  'Recommending Agent-Partner', 'Marketplace Dealer Partner'
];

export const partnership = {
  ru: {
    title: 'Ваш рынок. Ваша команда. Ваш масштаб.',
    subtitle: 'Развивайте бизнес с Заводом смесителей LAUTE. Выберите своё направление — от рекомендации продукции до собственной агентской структуры.',
    choose: 'Выбрать формат партнёрства', discuss: 'Обсудить мой регион',
    about: 'Кратко о партнерстве с Заводом смесителей Laute',
    story: [
      'Сплочённая, творческая и уверенная в своих возможностях команда Завода Laute осуществляет свою деятельность в СНГ с 2005 года. Мы предлагаем широкий выбор смесителей, приносящих высокий уровень прибыли нашим клиентам и агентам структуры продаж.',
      'В связи с динамичным расширением и освоением новых рынков мы заинтересованы в сотрудничестве с опытными и амбициозными партнёрами.'
    ],
    caption: 'Механическая обработка на производстве',
    benefitsTitle: 'Топ 3 причины работать с нами',
    benefits: [
      'Максимально высокий уровень качества и гарантий; доступная конечная стоимость для потребителя',
      'Постоянное расширение коллекций трендовыми, дизайнерскими решениями',
      'Лидирующие рыночные показатели по торговой наценке и партнёрским бонусам'
    ],
    rolesTitle: 'Выберите свой формат партнёрства', rolesQuestion: 'Как вы хотите развиваться с LAUTE?',
    roles: [
      ['Владелец агентской структуры', 'Создавать команду', 'Имеет возможность:\n• создания собственной структуры от 1 до 10 агентов-дилеров;\n• осуществления личных продаж как агент-дилер.'],
      ['Агент-дилер', 'Развивать территорию', 'Отвечает за развитие продаж на закрепленной за ним территории; привлекает, мотивирует и контролирует деятельность агентов по продажам и расширяет pro-агентскую сеть.'],
      ['Агент розничных продаж', 'Работать с покупателями', 'В партнёрстве с агентом-дилером осуществляет продвижение товара конечным потребителям.'],
      ['Pro-агент', 'Рекомендовать и знакомить', 'Оказывает содействие и даёт рекомендации в начале работы с новыми клиентами.'],
      ['Дилер по маркетплейсам', 'Развивать онлайн-продажи', 'Отвечает за развитие продаж на маркетплейсах.']
    ],
    discussRole: 'Обсудить этот формат',
    banner: 'Вы знаете свой рынок. Давайте обсудим его возможности.',
    bannerText: 'Расскажите о регионе, опыте и направлении, которое хотите развивать. Вместе определим подходящий формат сотрудничества с LAUTE.',
    bannerCta: 'Обсудить возможности', showcase: 'Продукт, с которого начинается ваш бизнес.',
    model: 'Смотреть в каталоге', finishes: ['Глянцевый хром', 'Матовое золото', 'Поворотный излив'],
    stagesTitle: 'Как будет происходить сотрудничество?',
    stages: [
      ['Ваш запрос', 'Оставьте заявку на сотрудничество с обязательным указанием региона'],
      ['Наше предложение', 'Сначала мы проверим, доступен ли регион для расширения; а затем подготовим предложение'],
      ['Обсуждение условий', 'Вместе обсудим условия сотрудничества и подготовим договор, который будет устраивать обе стороны'],
      ['Начало сотрудничества', 'После закрытия всех возражений, подписываем договор и приступаем к работе']
    ],
    firstStep: 'Сделать первый шаг',
    form: 'Давайте начнём с вашей идеи.', formText: 'В каком регионе и направлении вы хотите развивать бизнес с LAUTE?',
    name: 'ФИО', role: 'Формат партнёрства', region: 'Регион', territory: 'Где вы живёте и какую территорию хотели бы освоить?',
    experience: 'Профессиональный и жизненный опыт', email: 'Электронная почта', phone: 'Телефон',
    comment: 'Расскажите о вашем опыте, контактах на рынке или планах.', submit: 'Обсудить партнёрство',
    success: 'Почтовый сервис принял заявку. Команда LAUTE свяжется с вами.', error: 'Не удалось отправить заявку. Попробуйте ещё раз.'
  },
  en: {
    title: 'Your market. Your team. Your scale.',
    subtitle: 'Grow your business with the LAUTE faucet factory. Choose a direction, from recommending products to building your own dealer network.',
    choose: 'Choose a partnership format', discuss: 'Discuss my region',
    about: 'Partnership with the LAUTE faucet factory',
    story: [
      'The close-knit, creative and confident LAUTE factory team has worked in the CIS since 2005. We offer a broad range of faucets that deliver high margins for our customers and sales agents.',
      'As we expand and enter new markets, we are looking to work with experienced, ambitious partners.'
    ],
    caption: 'Machining on the factory floor',
    benefitsTitle: 'Three reasons to work with us',
    benefits: ['High standards of quality and warranty coverage, with accessible retail pricing', 'Collections continually expanded with current design trends', 'Market-leading retail margins and partner bonuses'],
    rolesTitle: 'Choose your partnership format', rolesQuestion: 'How would you like to grow with LAUTE?',
    roles: [
      ['Agency network owner', 'Build a team', 'Can build a network of one to ten dealer agents and make sales directly as a dealer agent.'],
      ['Dealer agent', 'Develop a territory', 'Develops sales in their assigned territory, recruits, motivates and manages sales agents, and expands the referral network.'],
      ['Retail sales agent', 'Work with customers', 'Works with a dealer agent to promote products to end customers.'],
      ['Referral agent', 'Recommend and introduce', 'Helps with introductions and recommendations when starting work with new customers.'],
      ['Marketplace dealer', 'Grow online sales', 'Develops sales on online marketplaces.']
    ],
    discussRole: 'Discuss this format',
    banner: 'You know your market. Let’s discuss its potential.',
    bannerText: 'Tell us about your region, your experience and the direction you want to develop. Together we’ll identify a suitable way to work with LAUTE.',
    bannerCta: 'Discuss opportunities', showcase: 'The products your business starts with.',
    model: 'View in catalog', finishes: ['Polished chrome', 'Matte gold', 'Swivel spout'],
    stagesTitle: 'How does the partnership work?',
    stages: [
      ['Your enquiry', 'Send a partnership enquiry and specify your region.'],
      ['Our proposal', 'We check whether the region is open for expansion and then prepare a proposal.'],
      ['Discuss the terms', 'We discuss the terms together and prepare an agreement that works for both parties.'],
      ['Start working together', 'Once outstanding issues are resolved, we sign the agreement and start working together.']
    ],
    firstStep: 'Take the first step',
    form: 'Let’s start with your idea.', formText: 'Where and in what capacity would you like to grow your business with LAUTE?',
    name: 'Full name', role: 'Partnership format', region: 'Region', territory: 'Where do you live and which territory would you like to develop?',
    experience: 'Professional and life experience', email: 'Email', phone: 'Phone',
    comment: 'Tell us about your experience, market contacts or plans.', submit: 'Discuss a partnership',
    success: 'The mail service accepted your enquiry. The LAUTE team will contact you.', error: 'Your enquiry could not be sent. Please try again.'
  },
  kz: {
    title: 'Сіздің нарығыңыз. Сіздің командаңыз. Сіздің ауқымыңыз.',
    subtitle: 'LAUTE араластырғыштар зауытымен бизнесіңізді дамытыңыз. Өнімді ұсынудан жеке агенттік құрылым құруға дейінгі бағытты таңдаңыз.',
    choose: 'Серіктестік форматын таңдау', discuss: 'Өңірімді талқылау',
    about: 'Laute араластырғыштар зауытымен серіктестік туралы',
    story: [
      'Laute зауытының ұйымшыл, шығармашыл және өз мүмкіндігіне сенімді командасы ТМД-да 2005 жылдан бері жұмыс істейді. Біз клиенттеріміз бен сату агенттеріне жоғары пайда әкелетін араластырғыштардың кең ассортиментін ұсынамыз.',
      'Қарқынды дамып, жаңа нарықтарды игеру барысында тәжірибелі әрі өршіл серіктестермен жұмыс істеуге мүдделіміз.'
    ],
    caption: 'Өндірістегі механикалық өңдеу',
    benefitsTitle: 'Бізбен жұмыс істеудің үш себебі',
    benefits: ['Сапа мен кепілдіктің жоғары деңгейі, тұтынушыға қолжетімді баға', 'Топтамалар заманауи дизайнерлік шешімдермен үнемі толықтырылады', 'Сауда үстемесі мен серіктес бонустары бойынша нарықтағы жетекші көрсеткіштер'],
    rolesTitle: 'Серіктестік форматын таңдаңыз', rolesQuestion: 'LAUTE-пен қалай дамығыңыз келеді?',
    roles: [
      ['Агенттік құрылым иесі', 'Команда құру', 'Бірден онға дейін дилер агенттен тұратын жеке құрылым құрып, дилер агент ретінде өзі де сата алады.'],
      ['Дилер агент', 'Аумақты дамыту', 'Өзіне бекітілген аумақта сатуды дамытады, сату агенттерін тартады, ынталандырады және олардың жұмысын бақылайды, ұсыным агенттерінің желісін кеңейтеді.'],
      ['Бөлшек сауда агенті', 'Сатып алушылармен жұмыс істеу', 'Дилер агентпен бірге өнімді түпкі тұтынушыларға ұсынады.'],
      ['Ұсыным агенті', 'Ұсыну және таныстыру', 'Жаңа клиенттермен жұмыс басталғанда көмектесіп, ұсыным береді.'],
      ['Маркетплейс дилері', 'Онлайн сатуды дамыту', 'Маркетплейстердегі сатуды дамытады.']
    ],
    discussRole: 'Осы форматты талқылау',
    banner: 'Өз нарығыңызды білесіз. Мүмкіндіктерін бірге талқылайық.',
    bannerText: 'Өңіріңіз, тәжірибеңіз және дамытқыңыз келетін бағыт туралы айтыңыз. LAUTE-пен серіктестіктің қолайлы форматын бірге анықтаймыз.',
    bannerCta: 'Мүмкіндіктерді талқылау', showcase: 'Бизнесіңіз басталатын өнім.',
    model: 'Каталогтан қарау', finishes: ['Жылтыр хром', 'Күңгірт алтын', 'Бұрылмалы шүмек'],
    stagesTitle: 'Серіктестік қалай басталады?',
    stages: [
      ['Сіздің өтінішіңіз', 'Өңіріңізді міндетті түрде көрсетіп, серіктестікке өтініш беріңіз.'],
      ['Біздің ұсынысымыз', 'Алдымен өңірде кеңею мүмкіндігін тексеріп, содан кейін ұсыныс дайындаймыз.'],
      ['Шарттарды талқылау', 'Серіктестік шарттарын бірге талқылап, екі тарапқа қолайлы келісімшарт дайындаймыз.'],
      ['Жұмысты бастау', 'Ашық мәселелерді шешкеннен кейін келісімшартқа қол қойып, жұмысқа кірісеміз.']
    ],
    firstStep: 'Алғашқы қадам жасау',
    form: 'Идеяңыздан бастайық.', formText: 'LAUTE-пен бизнесті қай өңірде және қай бағытта дамытқыңыз келеді?',
    name: 'Аты-жөніңіз', role: 'Серіктестік форматы', region: 'Өңір', territory: 'Қайда тұрасыз және қай аумақты дамытқыңыз келеді?',
    experience: 'Кәсіби және өмірлік тәжірибе', email: 'Электрондық пошта', phone: 'Телефон',
    comment: 'Тәжірибеңіз, нарықтағы байланыстарыңыз немесе жоспарыңыз туралы айтыңыз.', submit: 'Серіктестікті талқылау',
    success: 'Пошта қызметі өтінішіңізді қабылдады. LAUTE командасы сізбен байланысады.', error: 'Өтініш жіберілмеді. Қайталап көріңіз.'
  }
};
