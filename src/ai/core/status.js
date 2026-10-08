/**
 * Статус и диагностика собственного AI-ядра LAUTE
 */

import { LAUTE_AI_CONFIG } from '../config/index.js';
import { WeightsManager } from '../model/weights.js';

export class EngineStatus {
  constructor(engine) {
    this.engine = engine;
    this.startTime = Date.now();
    this.totalInferences = 0;
  }

  recordInference() {
    this.totalInferences++;
  }

  getStatus() {
    const model = this.engine?.model;
    const vocab = this.engine?.tokenizer?.vocab;
    const paramsCount = model ? WeightsManager.countParameters(model) : 0;

    return {
      identity: LAUTE_AI_CONFIG.identity,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      totalInferences: this.totalInferences,
      model: {
        name: LAUTE_AI_CONFIG.model.modelName,
        parametersCount: paramsCount,
        dModel: model?.config?.dModel || 64,
        nLayers: model?.config?.nLayers || 2,
        nHeads: model?.config?.nHeads || 4,
        maxSeqLen: model?.config?.maxSeqLen || 128,
      },
      vocabulary: {
        totalTokens: vocab ? vocab.size : 0,
      },
      memory: {
        activeMessages: this.engine?.sessionManager?.conversation?.messages?.length || 0,
        activeFacts: this.engine?.sessionManager?.facts?.facts?.size || 0,
      },
      guardrails: {
        antiHallucinationActive: true,
        externalApisBlocked: true,
        zeroVendorLockin: true,
      }
    };
  }
}

export default EngineStatus;
