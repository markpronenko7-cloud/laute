/**
 * Менеджер весов собственной модели LAUTE
 * Поддерживает сохранение, загрузку, экспорт и инспекцию параметров модели.
 */

export class WeightsManager {
  /**
   * Подсчет общего количества параметров модели
   */
  static countParameters(model) {
    let count = 0;

    // 1. Token Embeddings (vocabSize * dModel)
    count += model.config.vocabSize * model.config.dModel;

    // 2. Transformer blocks
    for (const block of model.blocks) {
      // Attention: Wq, Wk, Wv, Wo (4 * dModel * dModel)
      count += 4 * (model.config.dModel * model.config.dModel);
      // FFN: W1 (dModel * dFf) + b1 (dFf) + W2 (dFf * dModel) + b2 (dModel)
      count += (model.config.dModel * model.config.dFf) + model.config.dFf;
      count += (model.config.dFf * model.config.dModel) + model.config.dModel;
    }

    // 3. Intent Head (dModel * numIntents + numIntents)
    count += (model.config.dModel * model.config.numIntents) + model.config.numIntents;

    // 4. Action Head (dModel * numActions + numActions)
    count += (model.config.dModel * model.config.numActions) + model.config.numActions;

    // 5. Output Head (dModel * vocabSize)
    count += model.config.dModel * model.config.vocabSize;

    return count;
  }

  /**
   * Экспорт весов модели в JSON-сериализуемый формат
   */
  static exportWeights(model, precision = 5) {
    const roundVal = (v) => precision != null ? Number(v.toFixed(precision)) : v;
    const serializeMatrix = (M) => M.map(row => Array.from(row).map(roundVal));
    const serializeVector = (V) => Array.from(V).map(roundVal);

    const blocksData = model.blocks.map(b => ({
      attention: {
        Wq: serializeMatrix(b.attention.Wq),
        Wk: serializeMatrix(b.attention.Wk),
        Wv: serializeMatrix(b.attention.Wv),
        Wo: serializeMatrix(b.attention.Wo),
      },
      ffn: {
        W1: serializeMatrix(b.ffn.W1),
        b1: serializeVector(b.ffn.b1),
        W2: serializeMatrix(b.ffn.W2),
        b2: serializeVector(b.ffn.b2),
      }
    }));

    return {
      version: '1.2.0',
      config: model.config.toJSON(),
      weights: {
        tokenEmbeddings: serializeMatrix(model.tokenEmbeddings),
        blocks: blocksData,
        intentHead: serializeMatrix(model.intentHead),
        intentBias: serializeVector(model.intentBias),
        actionHead: serializeMatrix(model.actionHead),
        actionBias: serializeVector(model.actionBias),
        outputHead: serializeMatrix(model.outputHead),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Загрузка весов в модель из JSON/объекта
   */
  static loadWeights(model, data) {
    if (!data || !data.weights) {
      throw new Error('Invalid weights payload.');
    }

    const deserializeMatrix = (dataMatrix) => {
      return dataMatrix.map(row => new Float32Array(row));
    };

    if (data.weights.tokenEmbeddings) {
      model.tokenEmbeddings = deserializeMatrix(data.weights.tokenEmbeddings);
    }

    if (data.weights.intentHead) {
      model.intentHead = deserializeMatrix(data.weights.intentHead);
    }
    if (data.weights.intentBias) {
      model.intentBias = new Float32Array(data.weights.intentBias);
    }

    if (data.weights.actionHead) {
      model.actionHead = deserializeMatrix(data.weights.actionHead);
    }
    if (data.weights.actionBias) {
      model.actionBias = new Float32Array(data.weights.actionBias);
    }

    if (data.weights.outputHead) {
      model.outputHead = deserializeMatrix(data.weights.outputHead);
    }

    if (Array.isArray(data.weights.blocks)) {
      for (let i = 0; i < Math.min(model.blocks.length, data.weights.blocks.length); i++) {
        const bSrc = data.weights.blocks[i];
        const bDst = model.blocks[i];

        if (bSrc.attention) {
          bDst.attention.Wq = deserializeMatrix(bSrc.attention.Wq);
          bDst.attention.Wk = deserializeMatrix(bSrc.attention.Wk);
          bDst.attention.Wv = deserializeMatrix(bSrc.attention.Wv);
          bDst.attention.Wo = deserializeMatrix(bSrc.attention.Wo);
        }

        if (bSrc.ffn) {
          bDst.ffn.W1 = deserializeMatrix(bSrc.ffn.W1);
          bDst.ffn.b1 = new Float32Array(bSrc.ffn.b1);
          bDst.ffn.W2 = deserializeMatrix(bSrc.ffn.W2);
          bDst.ffn.b2 = new Float32Array(bSrc.ffn.b2);
        }
      }
    }

    return true;
  }
}

export default WeightsManager;
