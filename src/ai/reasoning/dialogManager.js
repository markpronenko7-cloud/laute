/**
 * Менеджер многоходового диалога LAUTE (Dialog Manager)
 * Управляет состоянием беседы, разрешением анафор и формированием уточняющих вопросов.
 */

export class DialogManager {
  /**
   * Обновление состояния диалога с учетом новой реплики
   */
  static processTurn({
    userQuery,
    predictedIntent,
    predictedAction,
    extractedEntities,
    workingMemory,
    lang = 'ru',
  }) {
    const wm = workingMemory.snapshot();
    const updatedSlots = {
      ...wm,
      ...extractedEntities,
    };

    // Разрешение анафор и продолжений
    // Если на предыдущем шаге AI спросил цвет, а пользователь ответил одним словом
    if (wm.pendingQuestion === 'ask_color' && extractedEntities.color) {
      updatedSlots.color = extractedEntities.color;
      updatedSlots.pendingQuestion = null;
    }

    // Если на предыдущем шаге AI спросил зону, а пользователь указал категорию
    if (wm.pendingQuestion === 'ask_zone' && extractedEntities.category) {
      updatedSlots.category = extractedEntities.category;
      updatedSlots.pendingQuestion = null;
    }

    // Определение: нужно ли задать уточняющий вопрос
    let finalAction = predictedAction;
    let pendingQuestion = wm.pendingQuestion;

    const isProductIntent = predictedIntent === 'PRODUCT_SELECTION' || 
                            predictedIntent === 'PRODUCT_SEARCH' ||
                            (extractedEntities.category && /(смесит|кран|душ|стойк|мойк|раковин|көрсет|show)/i.test(userQuery));

    if (isProductIntent) {
      if (!updatedSlots.category) {
        finalAction = 'ASK_CLARIFICATION';
        pendingQuestion = 'ask_zone';
      } else if (!updatedSlots.color && (userQuery.includes('подобрать') || userQuery.includes('выбрать'))) {
        finalAction = 'ASK_CLARIFICATION';
        pendingQuestion = 'ask_color';
      } else {
        finalAction = 'SHOW_PRODUCTS';
        pendingQuestion = null;
      }
    }

    // Защита: для не-продуктовых интентов действие ВСЕГДА только TEXT_RESPONSE
    const textOnlyIntents = [
      'GREETING',
      'SMALL_TALK',
      'ABOUT_AI',
      'ABOUT_LAUTE',
      'ABOUT_COMPANY',
      'OFF_TOPIC',
      'GOODBYE',
      'HELP',
    ];

    if (textOnlyIntents.includes(predictedIntent)) {
      finalAction = 'TEXT_RESPONSE';
      pendingQuestion = null;
    }

    updatedSlots.pendingQuestion = pendingQuestion;
    return {
      finalAction,
      updatedSlots,
    };
  }

  /**
   * Генерация текста уточняющего вопроса
   */
  static generateClarification(slots, lang = 'ru') {
    if (lang === 'kz') {
      if (!slots.category) {
        return 'Әрине, сенімді араластырғыш таңдауға көмектесемін! Алдымен нақтылап алайық: ол қай аймаққа қажет — асүй, қолжуғыш немесе ванна бөлмесі үшін бе?';
      }
      if (!slots.color) {
        return 'Түсі бойынша қандай талғамыңыз бар: классикалық хром ба, әлде заманауи күңгірт қара ма?';
      }
    }

    if (lang === 'en') {
      if (!slots.category) {
        return 'Certainly, I will help you select the ideal fittings! First, which room do you need it for: kitchen, washbasin, or bath?';
      }
      if (!slots.color) {
        return 'What finish or color do you prefer: timeless chrome, matte black, or brushed satin?';
      }
    }

    if (!slots.category) {
      return 'С удовольствием помогу подобрать надежную сантехнику LAUTE! Уточните, пожалуйста, для какой зоны подбираем: кухни, раковины или ванной комнаты?';
    }
    if (!slots.color) {
      return 'Отлично! А по цвету и отделке есть предпочтения: классический хром, матовый чёрный или сатин/браш?';
    }

    return 'Подскажите, какие размеры или особенности монтажа вам необходимы?';
  }
}

export default DialogManager;
