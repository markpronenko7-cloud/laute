/**
 * Менеджер чекпоинтов собственной модели LAUTE
 * Обеспечивает сохранение, загрузку и версионирование контрольных точек обучения.
 */

import { WeightsManager } from './weights.js';

export class CheckpointManager {
  constructor(storagePrefix = 'laute_checkpoint_') {
    this.storagePrefix = storagePrefix;
  }

  /**
   * Создание структуры чекпоинта
   */
  createCheckpoint(model, metadata = {}) {
    const exported = WeightsManager.exportWeights(model);
    return {
      checkpointId: metadata.checkpointId || `ckpt_${Date.now()}`,
      epoch: metadata.epoch || 0,
      step: metadata.step || 0,
      loss: metadata.loss || null,
      valLoss: metadata.valLoss || null,
      metrics: metadata.metrics || {},
      version: metadata.version || '1.0.0',
      timestamp: new Date().toISOString(),
      config: exported.config,
      weights: exported.weights,
    };
  }

  /**
   * Сохранение чекпоинта в Web Storage или IndexedDB/память
   */
  saveToStorage(checkpoint) {
    try {
      const key = `${this.storagePrefix}${checkpoint.checkpointId}`;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(checkpoint));
        return true;
      }
    } catch (e) {
      console.warn('Could not save checkpoint to localStorage (quota or unavailable):', e.message);
    }
    return false;
  }

  /**
   * Загрузка чекпоинта по идентификатору
   */
  loadFromStorage(checkpointId) {
    try {
      const key = `${this.storagePrefix}${checkpointId}`;
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load checkpoint:', e.message);
    }
    return null;
  }

  /**
   * Восстановление модели из чекпоинта
   */
  restoreModel(model, checkpoint) {
    if (!checkpoint || !checkpoint.weights) {
      throw new Error('Invalid checkpoint data.');
    }
    WeightsManager.loadWeights(model, checkpoint);
    return true;
  }
}

export default CheckpointManager;
