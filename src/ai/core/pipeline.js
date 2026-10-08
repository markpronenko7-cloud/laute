/**
 * Пайплайн инференса собственного AI LAUTE (Inference Pipeline)
 * Реализует пошаговую обработку:
 * 1. Нормализация входных данных
 * 2. Определение языка
 * 3. Токенизация и извлечение эмбеддинга моделью
 * 4. Заземление фактами из базы знаний (RAG)
 * 5. Рассуждение и маршрутизация (Reasoning Layer)
 * 6. Фильтрация от галлюцинаций (Hallucination Guard)
 * 7. Сохранение хода в память (Memory Persistence)
 */

export class InferencePipeline {
  constructor(engine) {
    this.engine = engine;
  }

  execute({
    rawQuery = '',
    products = [],
    forcedLang = null,
    currentContext = {},
  }) {
    const query = String(rawQuery || '').trim();
    if (!query) {
      return {
        text: 'Пожалуйста, введите ваш вопрос или тему для обсуждения.',
        quickChips: ['Мне нужен смеситель для кухни', 'Как выбрать смеситель?'],
        recommendedProducts: [],
      };
    }

    // 1. Токенизация запроса
    const tokenIds = this.engine.tokenizer.encode(query, { addSpecialTokens: true });

    // 2. Извлечение векторного эмбеддинга собственной моделью
    let sequenceEmbedding = null;
    try {
      sequenceEmbedding = this.engine.model.getEmbedding(tokenIds);
    } catch (e) {
      // Graceful fallback
    }

    // 3. Синхронизация рабочей памяти
    const workingMemory = this.engine.sessionManager.working;
    if (currentContext && Object.keys(currentContext).length > 0) {
      workingMemory.update(currentContext);
    }

    // 4. Исполнение семантического роутера
    const result = this.engine.router.routeAndExecute({
      query,
      workingMemory,
      products: products.length > 0 ? products : this.engine.contextManager.catalog.products,
      forcedLang,
    });

    // 5. Обновление рабочей памяти результатом
    if (result.newContext) {
      workingMemory.update(result.newContext);
    }

    // 6. Запись реплик в память диалога и сохранение сессии
    this.engine.sessionManager.conversation.addUserMessage(query);
    this.engine.sessionManager.conversation.addAssistantMessage(result.text, {
      quickChips: result.quickChips,
      recommendedProducts: result.recommendedProducts,
    });
    this.engine.sessionManager.persistSession();

    // 7. Учет метрик
    this.engine.status.recordInference();

    return {
      text: result.text,
      quickChips: result.quickChips || [],
      recommendedProducts: result.recommendedProducts || [],
      newContext: workingMemory.snapshot(),
      metrics: {
        tokenCount: tokenIds.length,
        hasEmbedding: sequenceEmbedding !== null,
      }
    };
  }
}

export default InferencePipeline;
