/**
 * Семантический роутер рассуждения LAUTE (Semantic Router)
 * Маршрутизирует запрос, связывает анализ намерений, извлечение фактов,
 * проверку на галлюцинации и синтез ответов.
 */

import { IntentAnalyzer, INTENTS } from './intentAnalyzer.js';
import { HallucinationGuard } from './hallucinationGuard.js';
import { ResponseSynthesizer } from './responseSynthesizer.js';

export class SemanticRouter {
  constructor(retriever = null, guard = null) {
    this.retriever = retriever;
    this.guard = guard || new HallucinationGuard();
  }

  /**
   * Маршрутизация и исполнение пайплайна рассуждения
   */
  routeAndExecute({
    query,
    workingMemory,
    products = [],
    forcedLang = null,
  }) {
    // 1. Анализ намерений и языка
    const intentData = IntentAnalyzer.analyze(query, workingMemory.snapshot());
    const effectiveLang = forcedLang || intentData.lang || 'ru';

    // 2. Строгая проверка на недостоверные или конфиденциальные данные
    if (intentData.intent === INTENTS.UNVERIFIED_REQUEST || this.guard.isUnverifiedQuery(query)) {
      return this.guard.getHonestRefusal(effectiveLang);
    }

    // 3. Семантическое извлечение заземляющих фактов (RAG)
    let retrievedFacts = [];
    if (this.retriever) {
      retrievedFacts = this.retriever.retrieve(query, 3);
    }

    // 4. Синтез ответа
    const synthesized = ResponseSynthesizer.synthesize({
      intentData,
      query,
      retrievedFacts,
      workingMemory,
      products,
      lang: effectiveLang,
    });

    // 5. Финальная валидация ответа фильтром защиты от выдумывания
    const guardViolation = this.guard.validateResponse(
      synthesized.text,
      retrievedFacts,
      query,
      effectiveLang
    );

    if (guardViolation) {
      return guardViolation;
    }

    return synthesized;
  }
}

export default SemanticRouter;
