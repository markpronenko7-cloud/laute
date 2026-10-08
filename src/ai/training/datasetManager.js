/**
 * Менеджер датасетов и обучающих выборок LAUTE
 */

import { LauteDataset } from './dataset.js';

export class DatasetManager {
  constructor(tokenizer = null) {
    this.tokenizer = tokenizer;
    this.datasets = new Map();
  }

  registerDataset(name, jsonlContent) {
    const ds = LauteDataset.fromJSONL(jsonlContent, this.tokenizer);
    this.datasets.set(name, ds);
    return ds;
  }

  getDataset(name) {
    return this.datasets.get(name) || null;
  }

  getStatistics() {
    const stats = {};
    for (const [name, ds] of this.datasets.entries()) {
      stats[name] = {
        totalSamples: ds.length,
      };
    }
    return stats;
  }
}

export default DatasetManager;
