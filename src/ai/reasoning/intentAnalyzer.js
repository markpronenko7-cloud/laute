/**
 * Анализатор намерений пользователя (Intent Analyzer)
 * Классифицирует тип пользовательского запроса, извлекает сущности
 * и определяет язык коммуникации (RU, KZ, EN).
 */

export const INTENTS = {
  GREETING: 'greeting',
  SMALL_TALK: 'small_talk',
  IDENTITY: 'identity',
  CAPABILITIES: 'capabilities',
  COMPANY_INFO: 'company_info',
  CATALOG_QUERY: 'catalog_query',
  TECH_EXPLANATION: 'tech_explanation',
  RECOMMENDATION: 'recommendation',
  ANAPHORA_FOLLOWUP: 'anaphora_followup',
  SPEC_INQUIRY: 'spec_inquiry',
  TROUBLESHOOTING: 'troubleshooting',
  COMPARISON: 'comparison',
  UNVERIFIED_REQUEST: 'unverified_request',
  GRATITUDE: 'gratitude',
  FAREWELL: 'farewell',
  UNKNOWN: 'unknown',
};

export class IntentAnalyzer {
  /**
   * Определение языка
   */
  static detectLanguage(rawText, fallback = 'ru') {
    if (!rawText) return fallback;
    const t = String(rawText).toLowerCase();

    // Казахский алфавит и специфические слова
    if (
      /[әіңғүұқөһ]/i.test(t) ||
      /(сәлем|сәлеметсіз|қалайсың|қалайсыз|рахмет|араластырғыш|өнім|неге|сау бол|жақсы|қандай|қолжуғыш|не істей|сен кімсің)/i.test(t)
    ) {
      return 'kz';
    }

    // Английский язык
    const latinCount = (t.match(/[a-z]/g) || []).length;
    const cyrillicCount = (t.match(/[а-яё]/g) || []).length;
    if (latinCount > 0 && cyrillicCount === 0) return 'en';
    if (latinCount > cyrillicCount && latinCount > 3) return 'en';

    return fallback;
  }

  /**
   * Нормализация строки
   */
  static normalize(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[«»""''`]/g, '')
      .trim();
  }

  /**
   * Анализ сообщения и извлечение намерения и сущностей
   */
  static analyze(query, workingMemory = {}) {
    const q = this.normalize(query);
    const lang = this.detectLanguage(query, workingMemory.lang || 'ru');

    // 1. Проверка на запрос конфиденциальной/вымышленной информации
    if (
      q.includes('личный номер') ||
      q.includes('домашний адрес') ||
      q.includes('номер директора') ||
      q.includes('телефон директора') ||
      q.includes('биткоин') ||
      q.includes('курс валют')
    ) {
      return { intent: INTENTS.UNVERIFIED_REQUEST, lang, entities: {} };
    }

    // 2. Анафоры и контекстные продолжения («А почему?», «А если кухня маленькая?»)
    if (/^(а\s+)?(почему|зачем|с\s+чем\s+связано|неге|why)(\s*[\?!.]*)$/i.test(q) || (q.includes('почему') && q.length < 18)) {
      return { intent: INTENTS.ANAPHORA_FOLLOWUP, subType: 'why', lang, entities: {} };
    }

    if (
      q.includes('если кухня маленьк') ||
      q.includes('маленькая кухня') ||
      q.includes('для маленькой кухни') ||
      q.includes('компактн') ||
      q.includes('места мало') ||
      q.includes('асүй кішкентай') ||
      q.includes('small kitchen')
    ) {
      return { intent: INTENTS.ANAPHORA_FOLLOWUP, subType: 'small_kitchen', lang, entities: { category: 'Кухонные смесители', req: 'компактный' } };
    }

    // 3. Уточняющие ответы на вопрос AI («Для кухни», «Для раковины», «Для ванной», «Для душа»)
    const isZoneAnswer = (
      q === 'для кухни' ||
      q === 'для раковины' ||
      q === 'для ванной' ||
      q === 'для душа' ||
      ((workingMemory.lastAiQuestion === 'ask_zone') &&
       (q.includes('кухн') || q.includes('раковин') || q.includes('ванн') || q.includes('душ') || q.includes('асүй') || q.includes('қолжуғыш')) &&
       !q.includes('чем отличается') && !q.includes('что такое') && !q.includes('какой смеситель ты бы выбрал') && !q.includes('сәлем'))
    );
    if (isZoneAnswer) {
      return { intent: INTENTS.RECOMMENDATION, subType: 'zone_specified', lang, entities: { query: q } };
    }

    // 4. Рекомендация для современной кухни («какой смеситель ты бы выбрал для современной кухни»)
    if (
      (q.includes('какой смеситель ты бы выбрал') || q.includes('что бы ты выбрал') || q.includes('какой посоветуешь')) &&
      (q.includes('кухн') || q.includes('современ'))
    ) {
      return { intent: INTENTS.RECOMMENDATION, subType: 'modern_kitchen', lang, entities: { category: 'Кухонные смесители' } };
    }

    // 5. Технические понятия и устройство
    if (
      q.includes('что такое картридж') ||
      q.includes('простыми словами картридж') ||
      q.includes('зачем картридж') ||
      (q.includes('картридж') && (q.includes('объясни') || q.includes('расскажи') || q.includes('как устроен')))
    ) {
      return { intent: INTENTS.TECH_EXPLANATION, concept: 'cartridge', lang, entities: {} };
    }

    if (
      q.includes('чем отличается') ||
      (q.includes('разниц') && (q.includes('кухн') || q.includes('ванн')))
    ) {
      return { intent: INTENTS.COMPARISON, concept: 'kitchen_vs_bath', lang, entities: {} };
    }

    if (
      q.includes('высокий или низкий излив') ||
      q.includes('высокий или низкий') ||
      (q.includes('излив') && (q.includes('лучше') || q.includes('высота')))
    ) {
      return { intent: INTENTS.COMPARISON, concept: 'spout_height', lang, entities: {} };
    }

    if (
      q.includes('почему вода может течь') ||
      q.includes('почему течет кран') ||
      q.includes('капает кран') ||
      q.includes('вода сочится') ||
      q.includes('су ағады') ||
      q.includes('faucet leak')
    ) {
      return { intent: INTENTS.TROUBLESHOOTING, concept: 'leak_reasons', lang, entities: {} };
    }

    if (
      q === 'что такое смеситель' ||
      q === 'что такое кран' ||
      q.includes('что такое смеситель?') ||
      q.includes('смеситель деген не')
    ) {
      return { intent: INTENTS.TECH_EXPLANATION, concept: 'mixer_definition', lang, entities: {} };
    }

    if (
      q.includes('как выбрать смеситель') ||
      q.includes('как правильно выбрать') ||
      q.includes('на что обратить внимание') ||
      q.includes('критерии выбора') ||
      q.includes('қалай таңдау керек') ||
      q.includes('how to choose a faucet')
    ) {
      return { intent: INTENTS.RECOMMENDATION, subType: 'selection_guide', lang, entities: {} };
    }

    // 6. Расскажи что-нибудь интересное / факт
    if (q.includes('что-нибудь интересное') || q.includes('интересный факт') || q.includes('удиви меня')) {
      return { intent: INTENTS.SMALL_TALK, subType: 'interesting_fact', lang, entities: {} };
    }

    // 7. Общие человеческие вопросы (General Small Talk)
    const isGreeting = (
      q === 'привет' ||
      q.startsWith('привет ') ||
      q.startsWith('привет,') ||
      q.startsWith('привет!') ||
      q === 'здравствуйте' ||
      q.startsWith('здравствуйте') ||
      q.startsWith('добрый день') ||
      q.startsWith('салам') ||
      q.startsWith('сәлем') ||
      q.startsWith('сәлеметсіз') ||
      q.startsWith('hello') ||
      q.startsWith('hi')
    );
    if (isGreeting) {
      return { intent: INTENTS.GREETING, lang, entities: {} };
    }

    const isHowAreYou = (
      q.includes('как дела') ||
      q.includes('как жизнь') ||
      q.includes('қалайсың') ||
      q.includes('қалайсыз') ||
      q.includes('how are you')
    );
    if (isHowAreYou) {
      return { intent: INTENTS.SMALL_TALK, subType: 'how_are_you', lang, entities: {} };
    }

    const isIdentity = (
      q === 'кто ты' ||
      q.startsWith('кто ты') ||
      q.includes('ты кто') ||
      q.includes('сен кімсің') ||
      q.includes('who are you')
    );
    if (isIdentity) {
      return { intent: INTENTS.IDENTITY, lang, entities: {} };
    }

    if (q.includes('что ты умеешь') || q.includes('чем можешь помочь') || q.includes('не істей аласың') || q.includes('what can you do') || q.includes('помоги мне') || q === 'помоги') {
      return { intent: INTENTS.CAPABILITIES, lang, entities: {} };
    }

    if (
      q.includes('возможност') ||
      q.includes('партнер') ||
      q.includes('сотрудничеств') ||
      q.includes('дилер') ||
      q.includes('опт') ||
      q.includes('b2b') ||
      q.includes('серіктес') ||
      q.includes('ынтымақтастық') ||
      q.includes('partnership')
    ) {
      return { intent: INTENTS.COMPANY_INFO, subType: 'partnership_analysis', lang, entities: {} };
    }

    if (q.includes('о компании') || q.includes('про laute') || q.includes('о бренде') || q.includes('о laute') || q.includes('компания туралы')) {
      return { intent: INTENTS.COMPANY_INFO, lang, entities: {} };
    }

    if (q.includes('что производит') || q.includes('что вы производите') || q.includes('ассортимент') || q.includes('қандай өнімдер')) {
      return { intent: INTENTS.CATALOG_QUERY, subType: 'production_range', lang, entities: {} };
    }

    // 8. Запрос на покупку/подбор («Хочу купить смеситель», «Мне нужен смеситель»)
    if (
      q.includes('хочу купить') ||
      q.includes('мне нужен смеситель') ||
      q.includes('нужен кран') ||
      q.includes('подбери смеситель')
    ) {
      return { intent: INTENTS.RECOMMENDATION, subType: 'general_faucet_request', lang, entities: {} };
    }

    // 9. Благодарность и прощание
    if (/^(спасибо|благодарю|рахмет|thank you|thanks)/i.test(q)) {
      return { intent: INTENTS.GRATITUDE, lang, entities: {} };
    }

    if (/^(пока|до свидания|сау бол|сау болыңыз|goodbye|bye)/i.test(q)) {
      return { intent: INTENTS.FAREWELL, lang, entities: {} };
    }

    // 10. Извлечение города
    const city = this.extractCity(q);

    return {
      intent: INTENTS.UNKNOWN,
      lang,
      entities: { city },
    };
  }

  static extractCity(q) {
    if (q.includes('алмат') || q.includes('almaty')) return 'Алматы';
    if (q.includes('астан') || q.includes('astana') || q.includes('нур-султан')) return 'Астана';
    if (q.includes('новосибирск') || q.includes('новосиб')) return 'Новосибирск';
    if (q.includes('москв') || q.includes('moscow')) return 'Москва';
    if (q.includes('шымкент') || q.includes('shymkent')) return 'Шымкент';
    return null;
  }
}

export default IntentAnalyzer;
