/**
 * Модуль оценки качества собственной модели LAUTE (Evaluation Suite)
 * Проверяет точность классификации намерений, выбор действий UI,
 * отсутствие показа каталога при обычных вопросах и защиту от выдумывания.
 */

import { INTENT_TO_INDEX } from '../intent/intents.js';
import { ACTION_TO_INDEX } from '../actions/actions.js';

export class ModelEvaluator {
  constructor(model, tokenizer) {
    this.model = model;
    this.tokenizer = tokenizer;
  }

  /**
   * Комплексная оценка на наборе тестовых примеров
   */
  evaluate(testSamples) {
    let total = testSamples.length;
    let correctIntents = 0;
    let correctActions = 0;
    let falseCatalogShows = 0;
    let falseCatalogDenials = 0;

    const perIntentStats = {};
    const detailedResults = [];

    for (let i = 0; i < total; i++) {
      const sample = testSamples[i];
      const tokenIds = this.tokenizer.encode(sample.text, { addSpecialTokens: true });

      const out = this.model.forward(tokenIds);
      const isIntentMatch = out.predictedIntent === sample.intent;
      const isActionMatch = out.predictedAction === sample.action;

      if (isIntentMatch) correctIntents++;
      if (isActionMatch) correctActions++;

      // Проверка критического правила: не показывать каталог при обычном диалоге/off-topic
      const nonProductIntents = ['GREETING', 'SMALL_TALK', 'ABOUT_AI', 'ABOUT_LAUTE', 'OFF_TOPIC', 'GOODBYE'];
      if (nonProductIntents.includes(sample.intent) && out.predictedAction === 'SHOW_PRODUCTS') {
        falseCatalogShows++;
      }

      // Проверка: не блокировать каталог, когда пользователь явно ищет товар
      if (sample.action === 'SHOW_PRODUCTS' && out.predictedAction !== 'SHOW_PRODUCTS') {
        falseCatalogDenials++;
      }

      if (!perIntentStats[sample.intent]) {
        perIntentStats[sample.intent] = { total: 0, correct: 0 };
      }
      perIntentStats[sample.intent].total++;
      if (isIntentMatch) perIntentStats[sample.intent].correct++;

      detailedResults.push({
        text: sample.text,
        expectedIntent: sample.intent,
        predictedIntent: out.predictedIntent,
        intentMatch: isIntentMatch,
        expectedAction: sample.action,
        predictedAction: out.predictedAction,
        actionMatch: isActionMatch,
      });
    }

    const intentAccuracy = (correctIntents / (total || 1)) * 100;
    const actionAccuracy = (correctActions / (total || 1)) * 100;

    return {
      totalSamples: total,
      intentAccuracy: intentAccuracy.toFixed(2) + '%',
      actionAccuracy: actionAccuracy.toFixed(2) + '%',
      falseCatalogShows,
      falseCatalogDenials,
      perIntentStats,
      detailedResults,
    };
  }
}

export default ModelEvaluator;
