/**
 * Полный пайплайн вывода собственной AI-системы LAUTE (Inference Pipeline)
 * Реализует строгую последовательность:
 * USER MESSAGE
 * ↓
 * LANGUAGE DETECTION
 * ↓
 * TOKENIZATION & NEURAL FORWARD PASS (Transformer)
 * ↓
 * INTENT & ACTION CLASSIFICATION (Neural Heads)
 * ↓
 * ENTITY EXTRACTION & DIALOG MANAGER
 * ↓
 * KNOWLEDGE GROUNDING & RETRIEVER
 * ↓
 * ACTION DECISION (No unsolicited catalog!)
 * ↓
 * RESPONSE GENERATION
 * ↓
 * FACT CHECK (Hallucination Guard)
 * ↓
 * MEMORY PERSISTENCE
 */

import { IntentAnalyzer } from '../reasoning/intentAnalyzer.js';
import { EntityExtractor } from '../reasoning/entityExtractor.js';
import { DialogManager } from '../reasoning/dialogManager.js';
import { ResponseGenerator } from '../reasoning/responseGenerator.js';
import { HallucinationGuard } from '../reasoning/hallucinationGuard.js';

export class InferencePipeline {
  constructor(engine) {
    this.engine = engine;
    this.guard = new HallucinationGuard();
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
        text: 'Пожалуйста, напишите ваш вопрос или интересующую тему.',
        quickChips: ['Мне нужен смеситель для кухни', 'Как выбрать смеситель?'],
        recommendedProducts: [],
        intent: 'UNKNOWN',
        action: 'TEXT_RESPONSE',
      };
    }

    // 1. Определение языка
    const detectedLang = forcedLang || IntentAnalyzer.detectLanguage(query, currentContext.lang || 'ru');

    // 2. Строгая проверка на недостоверные или конфиденциальные данные (Анти-галлюцинация)
    if (this.guard.isUnverifiedQuery(query)) {
      const refusal = this.guard.getHonestRefusal(detectedLang);
      return {
        text: refusal.text,
        quickChips: refusal.quickChips,
        recommendedProducts: [],
        intent: 'OFF_TOPIC',
        action: 'TEXT_RESPONSE',
      };
    }

    // 3. Токенизация запроса
    const tokenIds = this.engine.tokenizer.encode(query, { addSpecialTokens: true });

    // 4. Прямой проход через трансформер и классификационные головы
    let modelOutput = null;
    try {
      modelOutput = this.engine.model.forward(tokenIds);
    } catch (e) {
      console.warn('Model forward pass warning:', e.message);
    }

    const predictedIntent = modelOutput?.predictedIntent || 'UNKNOWN';
    const rawAction = modelOutput?.predictedAction || 'TEXT_RESPONSE';

    // 5. Синхронизация рабочей памяти
    const workingMemory = this.engine.sessionManager.working;
    if (currentContext && Object.keys(currentContext).length > 0) {
      workingMemory.update(currentContext);
    }

    // 6. Извлечение параметров (Entity Extraction)
    const extractedEntities = EntityExtractor.extract(query, workingMemory.snapshot());

    // 7. Менеджер диалога и выбор окончательного действия (Action Decision)
    const { finalAction, updatedSlots } = DialogManager.processTurn({
      userQuery: query,
      predictedIntent,
      predictedAction: rawAction,
      extractedEntities,
      workingMemory,
      lang: detectedLang,
    });
    workingMemory.update(updatedSlots);

    // 8. Поиск подходящих товаров, ТОЛЬКО если действие SHOW_PRODUCTS
    let matchedProducts = [];
    if (finalAction === 'SHOW_PRODUCTS' || finalAction === 'COMPARE_PRODUCTS') {
      const allProds = products.length > 0 ? products : this.engine.contextManager.catalog.products;
      matchedProducts = allProds.filter(p => {
        if (updatedSlots.category && p.category !== updatedSlots.category && !p.category?.includes(updatedSlots.category)) {
          return false;
        }
        if (updatedSlots.color && p.color !== updatedSlots.color && !(p.name || '').toLowerCase().includes(updatedSlots.color.toLowerCase())) {
          return false;
        }
        return true;
      });

      // Если жесткая фильтрация дала 0, возвращаем по категории
      if (matchedProducts.length === 0 && updatedSlots.category) {
        matchedProducts = allProds.filter(p => p.category === updatedSlots.category);
      }
      matchedProducts = matchedProducts.slice(0, 3);
    }

    // 9. Семантическое извлечение заземляющих фактов (RAG)
    const retrievedFacts = this.engine.retriever ? this.engine.retriever.retrieve(query, 2) : [];

    // 10. Генерация естественного ответа
    const generated = ResponseGenerator.generate({
      intent: predictedIntent,
      action: finalAction,
      slots: updatedSlots,
      retrievedFacts,
      matchedProducts,
      lang: detectedLang,
      rawQuery: query,
    });

    // 11. Финальная проверка на галлюцинации
    const guardViolation = this.guard.validateResponse(generated.text, retrievedFacts, query, detectedLang);
    const finalText = guardViolation ? guardViolation.text : generated.text;

    // 12. Сохранение хода в память диалога и персистенция
    this.engine.sessionManager.conversation.addUserMessage(query);
    this.engine.sessionManager.conversation.addAssistantMessage(finalText, {
      quickChips: generated.quickChips,
      recommendedProducts: matchedProducts,
      intent: predictedIntent,
      action: finalAction,
    });
    this.engine.sessionManager.persistSession();

    // 13. Учет метрик
    this.engine.status.recordInference();

    return {
      text: finalText,
      quickChips: generated.quickChips || [],
      recommendedProducts: matchedProducts,
      intent: predictedIntent,
      action: finalAction,
      newContext: workingMemory.snapshot(),
      metrics: {
        tokenCount: tokenIds.length,
        intentConfidence: modelOutput?.intentConfidence || 1.0,
      }
    };
  }
}

export default InferencePipeline;
