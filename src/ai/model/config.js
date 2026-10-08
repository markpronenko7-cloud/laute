/**
 * Конфигурация собственной нейросетевой модели LAUTE
 */

import { NUM_INTENTS } from '../intent/intents.js';
import { NUM_ACTIONS } from '../actions/actions.js';

export class LauteModelConfig {
  constructor(options = {}) {
    this.vocabSize = options.vocabSize || 768;
    this.dModel = options.dModel || 64;
    this.nHeads = options.nHeads || 4;
    this.nLayers = options.nLayers || 2;
    this.dFf = options.dFf || 128;
    this.maxSeqLen = options.maxSeqLen || 64;
    this.numIntents = options.numIntents || NUM_INTENTS;
    this.numActions = options.numActions || NUM_ACTIONS;
    this.dropout = options.dropout !== undefined ? options.dropout : 0.1;
    this.padTokenId = options.padTokenId || 0;
    this.bosTokenId = options.bosTokenId || 1;
    this.eosTokenId = options.eosTokenId || 2;
    this.unkTokenId = options.unkTokenId || 3;
    this.maskTokenId = options.maskTokenId || 4;
    this.sepTokenId = options.sepTokenId || 5;

    if (this.dModel % this.nHeads !== 0) {
      throw new Error(`dModel (${this.dModel}) must be divisible by nHeads (${this.nHeads})`);
    }
  }

  get dHead() {
    return this.dModel / this.nHeads;
  }

  toJSON() {
    return {
      vocabSize: this.vocabSize,
      dModel: this.dModel,
      nHeads: this.nHeads,
      nLayers: this.nLayers,
      dFf: this.dFf,
      maxSeqLen: this.maxSeqLen,
      numIntents: this.numIntents,
      numActions: this.numActions,
      dropout: this.dropout,
      padTokenId: this.padTokenId,
      bosTokenId: this.bosTokenId,
      eosTokenId: this.eosTokenId,
      unkTokenId: this.unkTokenId,
      maskTokenId: this.maskTokenId,
      sepTokenId: this.sepTokenId,
    };
  }

  static fromJSON(json) {
    return new LauteModelConfig(json);
  }
}

export default LauteModelConfig;
