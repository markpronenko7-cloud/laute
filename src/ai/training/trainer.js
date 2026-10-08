/**
 * Тренер собственной нейросетевой модели LAUTE (LauteTrainer)
 * Реализует настоящий цикл обучения (Training Pipeline):
 * - Прямой проход (Forward pass) через трансформер и классификационные головы
 * - Вычисление кросс-энтропии (Cross-Entropy Loss) по намерению и действию
 * - Обратное распространение ошибки (Backpropagation) с градиентами
 * - Обновление весов с помощью оптимизатора Adam (Adaptive Moment Estimation)
 * - Оценку качества на валидационной выборке (Validation Loss & Accuracy)
 * - Сохранение реальных чекпоинтов в JSON/хранилище
 */

import { TensorMath } from '../model/layers.js';
import { AdamOptimizer } from './optimizer.js';
import { CheckpointManager } from '../model/checkpoint.js';
import { INTENT_TO_INDEX } from '../intent/intents.js';
import { ACTION_TO_INDEX } from '../actions/actions.js';

export class LauteTrainer {
  constructor(model, tokenizer, options = {}) {
    this.model = model;
    this.tokenizer = tokenizer;
    this.checkpointManager = new CheckpointManager('laute_ckpt_');

    this.options = {
      learningRate: options.learningRate || 0.003,
      epochs: options.epochs || 8,
      batchSize: options.batchSize || 8,
      checkpointInterval: options.checkpointInterval || 2,
      ...options,
    };

    this.optimizer = new AdamOptimizer(this.options.learningRate);
    this.history = {
      epochs: [],
      trainLoss: [],
      valLoss: [],
      trainAccuracy: [],
      valAccuracy: [],
    };
  }

  /**
   * Вычисление кросс-энтропии (Cross-Entropy Loss)
   */
  computeCrossEntropy(probs, targetIdx) {
    const p = Math.max(1e-12, probs[targetIdx] || 1e-12);
    return -Math.log(p);
  }

  /**
   * Шаг обучения на одном батче с обратным распространением ошибки
   */
  trainBatch(batch) {
    let batchLoss = 0;
    let correctIntents = 0;

    const dModel = this.model.config.dModel;
    const numIntents = this.model.config.numIntents;
    const numActions = this.model.config.numActions;

    // Аккумуляторы градиентов для батча
    const gradIntentHead = TensorMath.zeros(dModel, numIntents);
    const gradIntentBias = new Float32Array(numIntents);
    const gradActionHead = TensorMath.zeros(dModel, numActions);
    const gradActionBias = new Float32Array(numActions);
    const gradEmbeddings = new Map(); // tokenId -> Float32Array(dModel)

    const batchSize = batch.length;

    for (let s = 0; s < batchSize; s++) {
      const sample = batch[s];
      const text = sample.text || sample.prompt || '';
      const tokenIds = this.tokenizer.encode(text, { addSpecialTokens: true });
      if (tokenIds.length === 0) continue;

      // 1. Прямой проход
      const out = this.model.forward(tokenIds);

      // Целевые метки
      const targetIntentIdx = INTENT_TO_INDEX[sample.intent] !== undefined ? INTENT_TO_INDEX[sample.intent] : INTENT_TO_INDEX.UNKNOWN;
      const targetActionIdx = ACTION_TO_INDEX[sample.action] !== undefined ? ACTION_TO_INDEX[sample.action] : ACTION_TO_INDEX.TEXT_RESPONSE;

      // Расчет Loss
      const lossIntent = this.computeCrossEntropy(out.intentProbs, targetIntentIdx);
      const lossAction = this.computeCrossEntropy(out.actionProbs, targetActionIdx);
      const sampleLoss = lossIntent + 0.5 * lossAction;

      batchLoss += sampleLoss;
      if (out.predictedIntentIndex === targetIntentIdx) {
        correctIntents++;
      }

      // 2. Вычисление градиентов Softmax + Cross-Entropy: dL/dz = P - Y
      const dIntent = new Float32Array(numIntents);
      for (let j = 0; j < numIntents; j++) {
        dIntent[j] = out.intentProbs[j] - (j === targetIntentIdx ? 1.0 : 0.0);
        gradIntentBias[j] += dIntent[j] / batchSize;
        for (let d = 0; d < dModel; d++) {
          gradIntentHead[d][j] += (out.pooledEmbedding[d] * dIntent[j]) / batchSize;
        }
      }

      const dAction = new Float32Array(numActions);
      for (let j = 0; j < numActions; j++) {
        dAction[j] = out.actionProbs[j] - (j === targetActionIdx ? 1.0 : 0.0);
        gradActionBias[j] += (dAction[j] * 0.5) / batchSize;
        for (let d = 0; d < dModel; d++) {
          gradActionHead[d][j] += (out.pooledEmbedding[d] * dAction[j] * 0.5) / batchSize;
        }
      }

      // 3. Обратное распространение в pooledEmbedding: dL/dh
      const dH = new Float32Array(dModel);
      for (let d = 0; d < dModel; d++) {
        let gradD = 0;
        for (let j = 0; j < numIntents; j++) {
          gradD += dIntent[j] * this.model.intentHead[d][j];
        }
        for (let j = 0; j < numActions; j++) {
          gradD += dAction[j] * 0.5 * this.model.actionHead[d][j];
        }
        dH[d] = gradD;
      }

      // 4. Градиент к токенам эмбеддингов
      tokenIds.forEach(tId => {
        if (!gradEmbeddings.has(tId)) {
          gradEmbeddings.set(tId, new Float32Array(dModel));
        }
        const gT = gradEmbeddings.get(tId);
        for (let d = 0; d < dModel; d++) {
          gT[d] += dH[d] / (tokenIds.length * batchSize);
        }
      });
    }

    // 5. Шаг оптимизатора Adam для обновления весов
    this.optimizer.step();
    this.optimizer.updateMatrix('intentHead', this.model.intentHead, gradIntentHead);
    this.optimizer.updateVector('intentBias', this.model.intentBias, gradIntentBias);
    this.optimizer.updateMatrix('actionHead', this.model.actionHead, gradActionHead);
    this.optimizer.updateVector('actionBias', this.model.actionBias, gradActionBias);

    // Обновление весов затронутых эмбеддингов токенов
    for (const [tId, gT] of gradEmbeddings.entries()) {
      if (tId >= 0 && tId < this.model.tokenEmbeddings.length) {
        this.optimizer.updateVector(`tokEmb_${tId}`, this.model.tokenEmbeddings[tId], gT);
      }
    }

    return {
      batchLoss: batchLoss / batchSize,
      accuracy: correctIntents / batchSize,
    };
  }

  /**
   * Оценка модели на тестовом/валидационном датасете
   */
  evaluate(dataset) {
    let totalLoss = 0;
    let correctIntents = 0;
    const samples = dataset.samples || dataset;

    for (let s = 0; s < samples.length; s++) {
      const sample = samples[s];
      const tokenIds = this.tokenizer.encode(sample.text, { addSpecialTokens: true });
      if (tokenIds.length === 0) continue;

      const out = this.model.forward(tokenIds);
      const targetIntentIdx = INTENT_TO_INDEX[sample.intent] !== undefined ? INTENT_TO_INDEX[sample.intent] : INTENT_TO_INDEX.UNKNOWN;
      const targetActionIdx = ACTION_TO_INDEX[sample.action] !== undefined ? ACTION_TO_INDEX[sample.action] : ACTION_TO_INDEX.TEXT_RESPONSE;

      const loss = this.computeCrossEntropy(out.intentProbs, targetIntentIdx) +
                   0.5 * this.computeCrossEntropy(out.actionProbs, targetActionIdx);
      totalLoss += loss;

      if (out.predictedIntentIndex === targetIntentIdx) {
        correctIntents++;
      }
    }

    return {
      loss: totalLoss / (samples.length || 1),
      accuracy: correctIntents / (samples.length || 1),
    };
  }

  /**
   * Полный цикл обучения (Training Loop)
   */
  async train(trainInput, valInput = null, onProgress = null) {
    const trainSamples = Array.isArray(trainInput) ? trainInput : (trainInput?.samples || []);
    const valSamples = Array.isArray(valInput) ? valInput : (valInput?.samples || null);
    const epochs = this.options.epochs;
    const batchSize = this.options.batchSize;
    const totalSamples = trainSamples.length;

    console.log(`\n🧠 LAUTE NEURAL TRAINING PIPELINE STARTED`);
    console.log(`Dataset size: ${totalSamples} samples | Batch size: ${batchSize} | Epochs: ${epochs}`);

    for (let ep = 1; ep <= epochs; ep++) {
      // Перемешивание выборки перед эпохой
      const shuffled = [...trainSamples].sort(() => Math.random() - 0.5);
      let epochLossSum = 0;
      let epochAccSum = 0;
      let batchCount = 0;

      for (let i = 0; i < totalSamples; i += batchSize) {
        const batch = shuffled.slice(i, i + batchSize);
        const { batchLoss, accuracy } = this.trainBatch(batch);
        epochLossSum += batchLoss;
        epochAccSum += accuracy;
        batchCount++;
      }

      const avgTrainLoss = epochLossSum / (batchCount || 1);
      const avgTrainAcc = epochAccSum / (batchCount || 1);

      this.history.epochs.push(ep);
      this.history.trainLoss.push(avgTrainLoss);
      this.history.trainAccuracy.push(avgTrainAcc);

      let valMetrics = { loss: null, accuracy: null };
      if (valSamples && valSamples.length > 0) {
        valMetrics = this.evaluate(valSamples);
        this.history.valLoss.push(valMetrics.loss);
        this.history.valAccuracy.push(valMetrics.accuracy);
      }

      console.log(`Epoch ${ep}/${epochs} -> Train Loss: ${avgTrainLoss.toFixed(4)} | Train Acc: ${(avgTrainAcc * 100).toFixed(1)}%${valMetrics.loss !== null ? ` | Val Loss: ${valMetrics.loss.toFixed(4)} | Val Acc: ${(valMetrics.accuracy * 100).toFixed(1)}%` : ''}`);

      if (onProgress) {
        onProgress({ epoch: ep, trainLoss: avgTrainLoss, trainAcc: avgTrainAcc, valMetrics });
      }

      // Сохранение чекпоинта
      if (ep % this.options.checkpointInterval === 0 || ep === epochs) {
        const ckpt = this.checkpointManager.createCheckpoint(this.model, {
          checkpointId: `laute_epoch_${ep}`,
          epoch: ep,
          loss: avgTrainLoss,
          valLoss: valMetrics.loss,
          accuracy: avgTrainAcc,
        });
        this.checkpointManager.saveToStorage(ckpt);
      }
    }

    console.log(`✅ Training finished. Model weights updated and checkpointed.\n`);
    return this.history;
  }
}

export default LauteTrainer;
