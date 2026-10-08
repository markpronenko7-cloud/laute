/**
 * Словарь собственной модели LAUTE
 * Поддерживает сопоставление токенов с идентификаторами,
 * специальные токены и расширенный словарь (RU, EN, KZ) с устойчивостью к опечаткам.
 */

export const SPECIAL_TOKENS = {
  PAD: '<pad>',
  BOS: '<bos>',
  EOS: '<eos>',
  UNK: '<unk>',
  MASK: '<mask>',
  SEP: '<sep>',
};

// Базовые токены предметной области LAUTE, диалога и опечаток
export const DEFAULT_LAUTE_VOCABULARY_TERMS = [
  // Бренд и компания
  'laute', 'лауте', 'компания', 'бренд', 'завод', 'производство', 'миссия',
  'стандарт', 'качество', 'европейский', 'гарантия', 'сервис', 'официальный',
  'фирма', 'производитель', 'архитектурный', 'надежность', 'европа',
  // Материалы и инженерные узлы
  'латунь', 'cw617n', 'первичная', 'сплав', 'силумин', 'хром', 'никель',
  'картридж', 'керамический', 'sedal', 'kerox', 'диск', 'пластина', 'алмазный',
  'аэратор', 'neoperl', 'руб-клин', 'rub-clean', 'давление', 'бар', '16', 'гидротест',
  'излив', 'поворотный', 'высокий', 'низкий', 'гибкий', 'выдвижной', 'дивертор',
  'нержавейка', 'сталь', 'металл', 'покрытие', 'матовый', 'глянцевый', 'пвд', 'pvd',
  // Цвета и отделка
  'черный', 'чёрный', 'чорный', 'белый', 'хром', 'хромированный', 'сатин', 'графит',
  'золото', 'браш', 'матовый', 'антрацит', 'глянец', 'темный', 'светлый',
  // Категории сантехники и опечатки
  'смеситель', 'смеситль', 'смесители', 'кран', 'краник', 'кранчик', 'кухня', 'кухонный', 'кухн',
  'мойка', 'мойку', 'раковина', 'раковину', 'умывальник', 'ванна', 'ванну', 'ванная',
  'душ', 'душевая', 'душевие', 'стойка', 'система', 'лейка', 'шланг', 'гарнитур', 'биде',
  'фильтр', '2в1', '2-в-1', 'питьевой', 'подводка', 'эксцентрик', 'монтаж', 'установка',
  'кабина', 'поддон', 'трап', 'сифон', 'накладная', 'чаша', 'столешница', 'врезной',
  // Города, логистика и партнерство
  'алматы', 'астана', 'новосибирск', 'москва', 'шымкент', 'склад', 'наличие', 'остаток',
  'доставка', 'логистика', 'самовывоз', 'партнеры', 'партнерство', 'дилеры', 'опт',
  'оптовый', 'прайс', 'дилерский', 'договор', 'сотрудничество', 'контакты', 'телефон',
  'адрес', 'офис', 'почта', 'email', 'заявка', 'купить', 'заказать', 'цена', 'стоимость',
  // Человеческий диалог RU
  'привет', 'здравствуйте', 'здравствуй', 'добрый', 'день', 'вечер', 'утро', 'хай', 'салам',
  'как', 'дела', 'жизнь', 'настроение', 'погода', 'сегодня', 'хороший', 'отличный',
  'кто', 'ты', 'что', 'умеешь', 'расскажи', 'себе', 'помоги', 'мне', 'нужен', 'нужна', 'нужно',
  'выбрать', 'подобрать', 'посоветуй', 'посоветуйте', 'покажи', 'покажите', 'сравни', 'сравнить',
  'разница', 'отличие', 'почему', 'зачем', 'спасибо', 'благодарю', 'пока', 'до', 'свидания',
  'отлично', 'хорошо', 'ясно', 'понял', 'подскажи', 'характеристики', 'размеры', 'чертеж',
  'модель', 'артикул', 'вариант', 'варианты', 'стильный', 'удобный', 'надежный',
  // Вопросы вне темы (Off-topic)
  'наполеон', 'погода', 'дождь', 'солнце', 'футбол', 'кино', 'курс', 'доллар', 'биткоин',
  'анекдот', 'шутка', 'хз', 'бла', 'ахаха', 'лол', 'кек', 'ерунда', 'просто', 'так',
  // Казахский диалог KZ
  'сәлем', 'сәлеметсіз', 'сәлеметсіз бе', 'қалайсыз', 'қалайсың', 'сен', 'кімсің', 'не',
  'істейсің', 'араластырғыш', 'асүй', 'қолжуғыш', 'ванна', 'душ', 'рахмет',
  'сау', 'бол', 'болыңыз', 'жақсы', 'көмек', 'бағасы', 'қайда', 'қойма', 'сапа',
  'кепілдік', 'латунь', 'неге', 'қандай', 'таңдау', 'көрсет', 'көрсетіңіз', 'қара', 'ақ',
  // Английский диалог EN
  'hello', 'hi', 'hey', 'how', 'are', 'you', 'who', 'what', 'can', 'do', 'help',
  'mixer', 'faucet', 'tap', 'kitchen', 'sink', 'basin', 'bath', 'shower', 'black', 'white',
  'chrome', 'gold', 'cartridge', 'brass', 'ceramic', 'warranty', 'service', 'price', 'specs',
  'stock', 'where', 'buy', 'thanks', 'thank', 'bye', 'goodbye', 'recommend', 'choose',
  'compare', 'difference', 'modern', 'quality', 'durability', 'clean', 'water', 'filter'
];

export class LauteVocabulary {
  constructor(initialTokens = []) {
    this.tokenToId = new Map();
    this.idToToken = new Map();
    this.tokenCounts = new Map();

    // Регистрируем специальные токены строго в начале
    this.addToken(SPECIAL_TOKENS.PAD);  // id 0
    this.addToken(SPECIAL_TOKENS.BOS);  // id 1
    this.addToken(SPECIAL_TOKENS.EOS);  // id 2
    this.addToken(SPECIAL_TOKENS.UNK);  // id 3
    this.addToken(SPECIAL_TOKENS.MASK); // id 4
    this.addToken(SPECIAL_TOKENS.SEP);  // id 5

    // Регистрируем базовый терминологический запас
    const seedTokens = initialTokens.length > 0 ? initialTokens : DEFAULT_LAUTE_VOCABULARY_TERMS;
    seedTokens.forEach(token => this.addToken(token));
  }

  get size() {
    return this.tokenToId.size;
  }

  addToken(rawToken) {
    if (!rawToken || typeof rawToken !== 'string') return -1;
    const token = rawToken.toLowerCase().trim();
    if (!token) return -1;

    if (this.tokenToId.has(token)) {
      const currentCount = this.tokenCounts.get(token) || 1;
      this.tokenCounts.set(token, currentCount + 1);
      return this.tokenToId.get(token);
    }

    const newId = this.tokenToId.size;
    this.tokenToId.set(token, newId);
    this.idToToken.set(newId, token);
    this.tokenCounts.set(token, 1);
    return newId;
  }

  getId(token) {
    if (!token) return this.tokenToId.get(SPECIAL_TOKENS.UNK);
    const normalized = token.toLowerCase().trim();
    if (this.tokenToId.has(normalized)) {
      return this.tokenToId.get(normalized);
    }
    return this.tokenToId.get(SPECIAL_TOKENS.UNK);
  }

  getToken(id) {
    if (this.idToToken.has(id)) {
      return this.idToToken.get(id);
    }
    return SPECIAL_TOKENS.UNK;
  }

  hasToken(token) {
    if (!token) return false;
    return this.tokenToId.has(token.toLowerCase().trim());
  }

  /**
   * Обучение словаря на корпусе текстов
   */
  buildFromCorpus(texts = []) {
    texts.forEach(text => {
      if (typeof text !== 'string') return;
      const words = text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s\-]/gu, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 1);

      words.forEach(word => this.addToken(word));
    });
    return this.size;
  }

  toJSON() {
    return {
      tokens: Array.from(this.idToToken.entries()).map(([id, token]) => ({ id, token })),
      size: this.size,
    };
  }

  static fromJSON(data) {
    const vocab = new LauteVocabulary([]);
    if (data && Array.isArray(data.tokens)) {
      data.tokens.forEach(item => {
        vocab.tokenToId.set(item.token, item.id);
        vocab.idToToken.set(item.id, item.token);
      });
    }
    return vocab;
  }
}

export default LauteVocabulary;
