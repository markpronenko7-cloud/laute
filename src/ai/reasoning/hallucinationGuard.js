/**
 * Слой защиты от галлюцинаций (Hallucination Guard)
 * Предотвращает выдумывание технических характеристик, цен, остатков,
 * недействительных гарантий или конфиденциальных контактов.
 */

export class HallucinationGuard {
  constructor(options = {}) {
    this.strictPriceCheck = options.strictPriceCheck !== false;
    this.strictStockCheck = options.strictStockCheck !== false;
    this.strictContactsCheck = options.strictContactsCheck !== false;
  }

  /**
   * Проверка запроса на наличие недостоверных или конфиденциальных тем
   */
  isUnverifiedQuery(query) {
    if (!query) return false;
    const q = String(query).toLowerCase();

    const sensitivePatterns = [
      'личный номер',
      'домашний адрес',
      'номер директора',
      'телефон директора',
      'личный телефон',
      'зарплата директора',
      'зарплата',
      'зарплату',
      'руководств',
      'секретный склад',
      'биткоин',
      'криптовалют',
    ];

    return sensitivePatterns.some(pattern => q.includes(pattern));
  }

  /**
   * Генерация честного ответа при отсутствии подтверждённых данных
   */
  getHonestRefusal(lang = 'ru') {
    if (lang === 'kz') {
      return {
        text: 'Кешіріңіз, дәл осы мәселе бойынша ресми деректер базасында расталған мәлімет жоқ. Мен тек LAUTE компаниясының нақты инженерлік стандарттары мен ресми каталогы бойынша ақпарат беремін және жалған деректер ойлап таппаймын.',
        quickChips: ['LAUTE стандарттары туралы', 'Смеситель қалай таңдау керек?', 'Каталогты көрсету'],
        isHonestRefusal: true,
      };
    }

    if (lang === 'en') {
      return {
        text: 'I do not have verified official records regarding this inquiry. As the official LAUTE AI, I strictly operate on confirmed engineering facts and catalog data without speculating or inventing unverified information.',
        quickChips: ['About LAUTE standards', 'How to choose a mixer?', 'Show catalog'],
        isHonestRefusal: true,
      };
    }

    return {
      text: 'У меня пока нет точной информации по данному вопросу, и я не хочу выдумывать данные или вводить вас в заблуждение. Я могу рассказать только о подтверждённых инженерных характеристиках, продукции и стандартах LAUTE.',
      quickChips: ['О стандартах LAUTE', 'Как выбрать смеситель?', 'Показать каталог продукции'],
      isHonestRefusal: true,
    };
  }

  /**
   * Валидация сгенерированного ответа перед отображением
   */
  validateResponse(draftText, verifiedFacts = [], query = '', lang = 'ru') {
    if (this.isUnverifiedQuery(query)) {
      return this.getHonestRefusal(lang);
    }

    // Если ответ пустой или нерелевантный
    if (!draftText || draftText.trim().length === 0) {
      return this.getHonestRefusal(lang);
    }

    return null; // Валидация пройдена успешно
  }
}

export default HallucinationGuard;
