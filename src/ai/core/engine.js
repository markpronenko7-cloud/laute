/**
 * Собственное ядро искусственного интеллекта LAUTE (LauteAIEngine)
 * Главная точка входа, координирующая:
 * - Модель трансформера с головами намерений и действий
 * - Токенизатор и расширенный словарь
 * - Менеджер сессий и память диалога
 * - Семантический ретривер (RAG)
 * - Пайплайн вывода без показа каталога при обычном диалоге
 */

import { LAUTE_AI_CONFIG } from '../config/index.js';
import { LauteModelConfig } from '../model/config.js';
import { LauteVocabulary } from '../model/vocabulary.js';
import { LauteTokenizer } from '../model/tokenizer.js';
import { LauteTransformerModel } from '../model/transformer.js';
import { WeightsManager } from '../model/weights.js';
import { SessionManager } from '../memory/sessionManager.js';
import { ContextManager } from '../context/contextManager.js';
import { SemanticRetriever } from '../knowledge/retriever.js';
import { HallucinationGuard } from '../reasoning/hallucinationGuard.js';
import { SemanticRouter } from '../reasoning/semanticRouter.js';
import { InferencePipeline } from '../inference/pipeline.js';
import { EngineStatus } from './status.js';
import { DEFAULT_LAUTE_CHECKPOINT } from '../checkpoints/defaultCheckpoint.js';

export class LauteAIEngine {
  constructor(options = {}) {
    this.config = { ...LAUTE_AI_CONFIG, ...options };
    const ckpt = options.checkpoint || DEFAULT_LAUTE_CHECKPOINT;

    // 1. Инициализация словаря и токенизатора из обученного чекпоинта
    if (ckpt && ckpt.vocab) {
      this.vocab = LauteVocabulary.fromJSON(ckpt.vocab);
    } else {
      this.vocab = new LauteVocabulary();
    }
    this.tokenizer = new LauteTokenizer(this.vocab, this.config.model.maxSeqLen);

    // 2. Инициализация собственной модели с параметрами чекпоинта
    const vocabSize = ckpt?.config?.vocabSize || this.vocab.size;
    this.modelConfig = new LauteModelConfig({
      vocabSize,
      dModel: ckpt?.config?.dModel || this.config.model.dModel,
      nHeads: ckpt?.config?.nHeads || this.config.model.nHeads,
      nLayers: ckpt?.config?.nLayers || this.config.model.nLayers,
      dFf: ckpt?.config?.dFf || this.config.model.dFf,
      maxSeqLen: ckpt?.config?.maxSeqLen || this.config.model.maxSeqLen,
      numIntents: ckpt?.config?.numIntents || 25,
      numActions: ckpt?.config?.numActions || 10,
    });
    this.model = new LauteTransformerModel(this.modelConfig);

    // 3. Загрузка обученных весов
    if (ckpt && ckpt.weights) {
      WeightsManager.loadWeights(this.model, ckpt);
    }
    this.loadTrainedWeights();

    // 4. Память и управление сессией
    this.sessionManager = new SessionManager({
      sessionKey: this.config.memory.storageKey,
      factsKey: this.config.memory.factsStorageKey,
      maxTurns: this.config.memory.maxHistoryTurns,
    });

    // 5. Контекст и каталог
    this.contextManager = new ContextManager();

    // 6. Семантический ретривер (RAG)
    this.retriever = new SemanticRetriever(this.model, this.tokenizer);

    // 7. Слой рассуждения и защита от выдумывания
    this.guard = new HallucinationGuard(this.config.guardrails);
    this.router = new SemanticRouter(this.retriever, this.guard);

    // 8. Пайплайн вывода и статус
    this.pipeline = new InferencePipeline(this);
    this.status = new EngineStatus(this);
  }

  loadTrainedWeights() {
    try {
      // В среде браузера веса могут быть в localStorage, в Node.js - в файле
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('laute_ckpt_laute_model_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          WeightsManager.loadWeights(this.model, parsed);
        }
      }
    } catch (e) {
      // Инициализировано весами Xavier
    }
  }

  /**
   * Основной метод обработки пользовательского сообщения
   */
  processMessage({
    rawQuery = '',
    currentContext = {},
    products = [],
    history = [],
    lang = null,
  }) {
    if (products && products.length > 0) {
      this.contextManager.setCatalogProducts(products);
    }

    return this.pipeline.execute({
      rawQuery,
      products,
      forcedLang: lang,
      currentContext,
    });
  }

  resetSession() {
    this.sessionManager.resetSession();
  }

  getSessionHistory() {
    return this.sessionManager.conversation.getHistory();
  }

  getStatus() {
    return this.status.getStatus();
  }
}

let globalEngineInstance = null;

export const getLauteAIEngine = (options = {}) => {
  if (!globalEngineInstance) {
    globalEngineInstance = new LauteAIEngine(options);
  }
  return globalEngineInstance;
};

export default LauteAIEngine;
