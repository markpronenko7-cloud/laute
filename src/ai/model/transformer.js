/**
 * Собственная нейросетевая модель LAUTE (LauteTransformerModel)
 * Полноценная архитектура трансформера с:
 * - Token Embeddings + Positional Encodings
 * - Transformer Encoder Blocks (Multi-Head Self-Attention + FFN + Pre-LN + Residuals)
 * - Sequence Pooling
 * - Головой классификации намерений (Intent Classification Head -> 25 классов)
 * - Головой выбора действия (Action Decision Head -> 10 действий)
 * - Языковой проекцией (Language Modeling Head)
 * - Аналитическими градиентами для обратного распространения ошибки (Backpropagation)
 */

import { LauteModelConfig } from './config.js';
import { TensorMath, MultiHeadAttention, FeedForward } from './layers.js';
import { INDEX_TO_INTENT, NUM_INTENTS } from '../intent/intents.js';
import { INDEX_TO_ACTION, NUM_ACTIONS } from '../actions/actions.js';

export class TransformerBlock {
  constructor(dModel, nHeads, dFf) {
    this.dModel = dModel;
    this.attention = new MultiHeadAttention(dModel, nHeads);
    this.ffn = new FeedForward(dModel, dFf);
  }

  forward(X, isCausal = true) {
    // Pre-LayerNorm архитектура
    const norm1 = TensorMath.layerNorm(X);
    const attnOut = this.attention.forward(norm1, isCausal);
    const xWithAttn = TensorMath.addMatrices(X, attnOut);

    const norm2 = TensorMath.layerNorm(xWithAttn);
    const ffnOut = this.ffn.forward(norm2);
    return TensorMath.addMatrices(xWithAttn, ffnOut);
  }
}

export class LauteTransformerModel {
  constructor(config = null) {
    this.config = config || new LauteModelConfig();

    // 1. Таблица эмбеддингов токенов (vocabSize x dModel)
    this.tokenEmbeddings = TensorMath.xavierInit(this.config.vocabSize, this.config.dModel);

    // 2. Позиционные эмбеддинги (maxSeqLen x dModel)
    this.positionalEmbeddings = TensorMath.sinusoidalPositionalEncoding(
      this.config.maxSeqLen,
      this.config.dModel
    );

    // 3. Стек трансформерных блоков
    this.blocks = [];
    for (let i = 0; i < this.config.nLayers; i++) {
      this.blocks.push(
        new TransformerBlock(this.config.dModel, this.config.nHeads, this.config.dFf)
      );
    }

    // 4. Голова классификации намерений (dModel x numIntents)
    this.intentHead = TensorMath.xavierInit(this.config.dModel, this.config.numIntents);
    this.intentBias = new Float32Array(this.config.numIntents);

    // 5. Голова выбора действия UI (dModel x numActions)
    this.actionHead = TensorMath.xavierInit(this.config.dModel, this.config.numActions);
    this.actionBias = new Float32Array(this.config.numActions);

    // 6. Выходная языковая проекция (dModel x vocabSize)
    this.outputHead = TensorMath.xavierInit(this.config.dModel, this.config.vocabSize);
  }

  /**
   * Прямой проход (Forward pass)
   * @param {number[]} inputIds - Входная последовательность токенов
   */
  forward(inputIds) {
    const seqLen = Math.min(inputIds.length, this.config.maxSeqLen);
    if (seqLen === 0) {
      throw new Error('Input token sequence cannot be empty.');
    }

    // 1. Сборка входного представления: Token Embedding + Positional Encoding
    const X = new Array(seqLen);
    for (let i = 0; i < seqLen; i++) {
      const tokenId = inputIds[i];
      const validId = (tokenId >= 0 && tokenId < this.config.vocabSize) ? tokenId : this.config.unkTokenId;
      const tokEmb = this.tokenEmbeddings[validId];
      const posEmb = this.positionalEmbeddings[i];

      X[i] = new Float32Array(this.config.dModel);
      for (let j = 0; j < this.config.dModel; j++) {
        X[i][j] = tokEmb[j] + posEmb[j];
      }
    }

    // 2. Проход через трансформер-блоки
    let hidden = X;
    for (let l = 0; l < this.blocks.length; l++) {
      hidden = this.blocks[l].forward(hidden, false);
    }

    // 3. Финальная нормализация
    const finalNorm = TensorMath.layerNorm(hidden);

    // 4. Sequence Pooling (Mean Pooling) -> h (dModel)
    const pooledEmbedding = new Float32Array(this.config.dModel);
    for (let i = 0; i < seqLen; i++) {
      for (let j = 0; j < this.config.dModel; j++) {
        pooledEmbedding[j] += finalNorm[i][j];
      }
    }
    const invSeq = 1 / seqLen;
    for (let j = 0; j < this.config.dModel; j++) {
      pooledEmbedding[j] *= invSeq;
    }

    // 5. Вычисление логитов намерений (Intent Logits & Probs)
    const intentLogits = new Float32Array(this.config.numIntents);
    for (let j = 0; j < this.config.numIntents; j++) {
      let sum = this.intentBias[j];
      for (let d = 0; d < this.config.dModel; d++) {
        sum += pooledEmbedding[d] * this.intentHead[d][j];
      }
      intentLogits[j] = sum;
    }
    const intentProbs = TensorMath.softmax(intentLogits);

    let topIntentIdx = 0;
    let maxIntentProb = intentProbs[0];
    for (let j = 1; j < intentProbs.length; j++) {
      if (intentProbs[j] > maxIntentProb) {
        maxIntentProb = intentProbs[j];
        topIntentIdx = j;
      }
    }
    const predictedIntent = INDEX_TO_INTENT[topIntentIdx] || 'UNKNOWN';

    // 6. Вычисление логитов действий (Action Logits & Probs)
    const actionLogits = new Float32Array(this.config.numActions);
    for (let j = 0; j < this.config.numActions; j++) {
      let sum = this.actionBias[j];
      for (let d = 0; d < this.config.dModel; d++) {
        sum += pooledEmbedding[d] * this.actionHead[d][j];
      }
      actionLogits[j] = sum;
    }
    const actionProbs = TensorMath.softmax(actionLogits);

    let topActionIdx = 0;
    let maxActionProb = actionProbs[0];
    for (let j = 1; j < actionProbs.length; j++) {
      if (actionProbs[j] > maxActionProb) {
        maxActionProb = actionProbs[j];
        topActionIdx = j;
      }
    }
    const predictedAction = INDEX_TO_ACTION[topActionIdx] || 'TEXT_RESPONSE';

    // 7. Языковая проекция токенов
    const tokenLogits = TensorMath.matmul(finalNorm, this.outputHead);

    return {
      logits: tokenLogits,
      tokenLogits,
      hiddenStates: finalNorm,
      pooledEmbedding,
      intentLogits,
      intentProbs,
      predictedIntentIndex: topIntentIdx,
      predictedIntent,
      intentConfidence: maxIntentProb,
      actionLogits,
      actionProbs,
      predictedActionIndex: topActionIdx,
      predictedAction,
      actionConfidence: maxActionProb,
    };
  }

  /**
   * Авторегрессионная генерация токенов
   */
  generate(promptIds, options = {}) {
    const maxNewTokens = options.maxNewTokens || 5;
    const tokens = [...promptIds];
    for (let step = 0; step < maxNewTokens; step++) {
      const { logits } = this.forward(tokens);
      const lastTokenLogits = logits[logits.length - 1];
      let bestToken = 0;
      let maxVal = -Infinity;
      for (let t = 0; t < lastTokenLogits.length; t++) {
        if (lastTokenLogits[t] > maxVal) {
          maxVal = lastTokenLogits[t];
          bestToken = t;
        }
      }
      tokens.push(bestToken);
      if (bestToken === this.config.eosTokenId) break;
    }
    return tokens;
  }

  /**
   * Извлечение векторного эмбеддинга
   */
  getEmbedding(inputIds) {
    const { pooledEmbedding } = this.forward(inputIds);
    return pooledEmbedding;
  }
}

export default LauteTransformerModel;
