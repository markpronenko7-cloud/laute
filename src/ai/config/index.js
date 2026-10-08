/**
 * Конфигурация собственного AI LAUTE
 * Изолированные настройки ядра, модели, памяти, поиска и безопасности
 */

export const LAUTE_AI_CONFIG = {
  // Идентификация системы
  identity: {
    name: 'LAUTE AI',
    version: '1.0.0-architectural',
    provider: 'LAUTE Proprietary Core (Independent, No External API)',
    author: 'LAUTE Sanitary Technologies',
    license: 'Proprietary B2B',
  },

  // Поддерживаемые языки
  languages: {
    supported: ['ru', 'en', 'kz'],
    default: 'ru',
  },

  // Параметры собственной архитектуры нейронной модели
  model: {
    modelName: 'laute-micro-transformer-v1',
    vocabSize: 512,
    dModel: 64,         // Размерность эмбеддинга
    nHeads: 4,          // Число голов внимания
    nLayers: 2,         // Число трансформер-блоков
    dFf: 128,           // Размерность скрытого слоя FFN
    maxSeqLen: 128,      // Максимальная длина контекста в токенах
    dropout: 0.1,
    temperature: 0.7,   // Температура сэмплирования
    topK: 5,            // Top-K отбор токенов
    bosTokenId: 1,      // <bos>
    eosTokenId: 2,      // <eos>
    padTokenId: 0,      // <pad>
    unkTokenId: 3,      // <unk>
    maskTokenId: 4,     // <mask>
    sepTokenId: 5,      // <sep>
  },

  // Параметры системы памяти
  memory: {
    maxHistoryTurns: 30,
    storageKey: 'laute_ai_memory_session_v1',
    factsStorageKey: 'laute_ai_facts_persistent_v1',
    persistAcrossReloads: true,
  },

  // Параметры семантического ретривера (RAG)
  retriever: {
    topK: 3,
    minSimilarityScore: 0.18,
    useHybridSearch: true, // Семантический векторный + BM25 токенный поиск
  },

  // Защита от выдумывания (Hallucination Guard)
  guardrails: {
    strictPriceCheck: true,        // Запрет выдумывать цены
    strictStockCheck: true,        // Запрет выдумывать остатки
    strictSpecsCheck: true,        // Запрет выдумывать характеристики
    strictContactsCheck: true,     // Запрет раскрывать личные контакты руководства
    honestRefusalEnabled: true,    // Честный отказ при отсутствии подтверждённых данных
  },

  // Настройки обучения и датасетов
  training: {
    defaultBatchSize: 4,
    defaultLearningRate: 0.001,
    defaultEpochs: 10,
    checkpointStorageKey: 'laute_model_checkpoints',
    checkpointDirectory: '/ai/checkpoints',
  },

  // Локальный API режим
  api: {
    mode: 'local', // 'local' (выполнение в браузере) или 'self_hosted_server' (в будущем)
    endpoint: '/api/ai/chat',
  }
};

export default LAUTE_AI_CONFIG;
