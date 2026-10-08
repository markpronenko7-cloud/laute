/**
 * Собственная AI-система LAUTE (LAUTE Proprietary AI System)
 * Единая точка экспорта всех изолированных подсистем:
 *
 * /ai/core        - Координирующее ядро, пайплайн инференса, статус
 * /ai/model       - Собственная модель трансформера, токенизатор, словарь, слои, веса, чекпоинты
 * /ai/memory      - Кратковременная, рабочая и долговременная память, менеджер сессий
 * /ai/context     - Контекст бренда, каталога, сервиса и логистики
 * /ai/knowledge   - Структурированная база знаний и семантический ретривер (RAG)
 * /ai/reasoning   - Анализатор намерений, защита от выдумывания, синтезатор ответов
 * /ai/chat        - Контроллер диалога и взаимодействия с UI
 * /ai/training    - Датасеты JSON/JSONL, тренер модели, менеджер чекпоинтов
 * /ai/api         - Абстракция /api/ai/chat с поддержкой перехода на собственный сервер
 * /ai/config      - Конфигурация ядра и безопасности
 */

// Core
export { LauteAIEngine, getLauteAIEngine } from './core/engine.js';
export { InferencePipeline } from './core/pipeline.js';
export { EngineStatus } from './core/status.js';

// Model Architecture
export { LauteModelConfig } from './model/config.js';
export { LauteVocabulary, SPECIAL_TOKENS } from './model/vocabulary.js';
export { LauteTokenizer } from './model/tokenizer.js';
export { TensorMath, MultiHeadAttention, FeedForward, scaledDotProductAttention } from './model/layers.js';
export { LauteTransformerModel, TransformerBlock } from './model/transformer.js';
export { WeightsManager } from './model/weights.js';
export { CheckpointManager } from './model/checkpoint.js';

// Memory Subsystem
export { ConversationMemory } from './memory/conversationMemory.js';
export { WorkingMemory } from './memory/workingMemory.js';
export { FactMemory } from './memory/factMemory.js';
export { SessionManager } from './memory/sessionManager.js';

// Context Subsystem
export { LAUTE_BRAND_CONTEXT } from './context/brandContext.js';
export { CatalogContext } from './context/catalogContext.js';
export { LAUTE_SERVICE_CONTEXT } from './context/serviceContext.js';
export { ContextManager } from './context/contextManager.js';

// Knowledge Subsystem
export { LAUTE_KNOWLEDGE_BASE } from './knowledge/knowledgeBase.js';
export { SemanticRetriever } from './knowledge/retriever.js';

// Reasoning Subsystem
export { IntentAnalyzer, INTENTS } from './reasoning/intentAnalyzer.js';
export { HallucinationGuard } from './reasoning/hallucinationGuard.js';
export { ResponseSynthesizer } from './reasoning/responseSynthesizer.js';
export { SemanticRouter } from './reasoning/semanticRouter.js';

// Chat & UI Interaction
export { ChatController } from './chat/chatController.js';

// Training Subsystem
export { LauteDataset } from './training/dataset.js';
export { LauteTrainer } from './training/trainer.js';
export { DatasetManager } from './training/datasetManager.js';

// API Subsystem
export { chatApi, handleChatApiRequest, API_MODES } from './api/chatApi.js';

// Configuration
export { LAUTE_AI_CONFIG } from './config/index.js';

// Default export
import { getLauteAIEngine } from './core/engine.js';
export default getLauteAIEngine;
