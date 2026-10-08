/**
 * Нейронные слои и тензорные вычисления собственной модели LAUTE
 * Включает:
 * - Матричные операции (умножение, транспонирование, сложение)
 * - Активацию GELU, Softmax
 * - Layer Normalization
 * - Sinusoidal Positional Encoding
 * - Scaled Dot-Product Attention с каузальной маской
 * - Multi-Head Attention
 * - Feed-Forward Network (FFN)
 */

export const TensorMath = {
  zeros(rows, cols) {
    const res = new Array(rows);
    for (let i = 0; i < rows; i++) {
      res[i] = new Float32Array(cols);
    }
    return res;
  },

  xavierInit(rows, cols) {
    const limit = Math.sqrt(6 / (rows + cols));
    const res = new Array(rows);
    for (let i = 0; i < rows; i++) {
      res[i] = new Float32Array(cols);
      for (let j = 0; j < cols; j++) {
        res[i][j] = (Math.random() * 2 - 1) * limit;
      }
    }
    return res;
  },

  matmul(A, B) {
    const rowsA = A.length;
    const colsA = A[0].length;
    const colsB = B[0].length;

    const C = new Array(rowsA);
    for (let i = 0; i < rowsA; i++) {
      C[i] = new Float32Array(colsB);
      for (let k = 0; k < colsA; k++) {
        const aik = A[i][k];
        if (aik === 0) continue;
        for (let j = 0; j < colsB; j++) {
          C[i][j] += aik * B[k][j];
        }
      }
    }
    return C;
  },

  transpose(A) {
    const rows = A.length;
    const cols = A[0].length;
    const res = new Array(cols);
    for (let j = 0; j < cols; j++) {
      res[j] = new Float32Array(rows);
      for (let i = 0; i < rows; i++) {
        res[j][i] = A[i][j];
      }
    }
    return res;
  },

  addMatrices(A, B) {
    const rows = A.length;
    const cols = A[0].length;
    const res = new Array(rows);
    for (let i = 0; i < rows; i++) {
      res[i] = new Float32Array(cols);
      for (let j = 0; j < cols; j++) {
        res[i][j] = A[i][j] + B[i][j];
      }
    }
    return res;
  },

  addBias(A, b) {
    const rows = A.length;
    const cols = A[0].length;
    const res = new Array(rows);
    for (let i = 0; i < rows; i++) {
      res[i] = new Float32Array(cols);
      for (let j = 0; j < cols; j++) {
        res[i][j] = A[i][j] + (b[j] || 0);
      }
    }
    return res;
  },

  gelu(x) {
    // Аппроксимация GELU: 0.5 * x * (1 + tanh(sqrt(2/pi) * (x + 0.044715 * x^3)))
    const sqrt2OverPi = 0.7978845608;
    return 0.5 * x * (1 + Math.tanh(sqrt2OverPi * (x + 0.044715 * Math.pow(x, 3))));
  },

  softmax(vec) {
    const len = vec.length;
    let max = -Infinity;
    for (let i = 0; i < len; i++) {
      if (vec[i] > max) max = vec[i];
    }
    let sum = 0;
    const exp = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      exp[i] = Math.exp(vec[i] - max);
      sum += exp[i];
    }
    const invSum = sum > 0 ? 1 / sum : 1;
    for (let i = 0; i < len; i++) {
      exp[i] *= invSum;
    }
    return exp;
  },

  layerNorm(X, gamma = null, beta = null, eps = 1e-5) {
    const rows = X.length;
    const cols = X[0].length;
    const res = new Array(rows);

    for (let i = 0; i < rows; i++) {
      res[i] = new Float32Array(cols);
      let mean = 0;
      for (let j = 0; j < cols; j++) mean += X[i][j];
      mean /= cols;

      let variance = 0;
      for (let j = 0; j < cols; j++) {
        const diff = X[i][j] - mean;
        variance += diff * diff;
      }
      variance /= cols;
      const invStd = 1 / Math.sqrt(variance + eps);

      for (let j = 0; j < cols; j++) {
        const normalized = (X[i][j] - mean) * invStd;
        const g = gamma ? gamma[j] : 1.0;
        const b = beta ? beta[j] : 0.0;
        res[i][j] = normalized * g + b;
      }
    }
    return res;
  },

  /**
   * Синусоидальное позиционное кодирование (Vaswani et al.)
   */
  sinusoidalPositionalEncoding(maxSeqLen, dModel) {
    const pe = new Array(maxSeqLen);
    for (let pos = 0; pos < maxSeqLen; pos++) {
      pe[pos] = new Float32Array(dModel);
      for (let i = 0; i < dModel; i += 2) {
        const divTerm = Math.exp((i * -Math.log(10000.0)) / dModel);
        pe[pos][i] = Math.sin(pos * divTerm);
        if (i + 1 < dModel) {
          pe[pos][i + 1] = Math.cos(pos * divTerm);
        }
      }
    }
    return pe;
  }
};

/**
 * Scaled Dot-Product Attention:
 * Attention(Q, K, V) = Softmax((Q * K^T) / sqrt(d_k) + causalMask) * V
 */
export function scaledDotProductAttention(Q, K, V, isCausal = true) {
  const seqLen = Q.length;
  const dK = Q[0].length;
  const scale = 1 / Math.sqrt(dK);

  const KT = TensorMath.transpose(K);
  const scores = TensorMath.matmul(Q, KT);

  // Применение масштаба и каузальной маски (будущие токены маскируются значением -1e9)
  for (let i = 0; i < seqLen; i++) {
    for (let j = 0; j < seqLen; j++) {
      scores[i][j] *= scale;
      if (isCausal && j > i) {
        scores[i][j] = -1e9;
      }
    }
    scores[i] = TensorMath.softmax(scores[i]);
  }

  return TensorMath.matmul(scores, V);
}

/**
 * Слой Multi-Head Attention
 */
export class MultiHeadAttention {
  constructor(dModel, nHeads) {
    this.dModel = dModel;
    this.nHeads = nHeads;
    this.dHead = dModel / nHeads;

    // Веса проекций Q, K, V и выходной проекции O
    this.Wq = TensorMath.xavierInit(dModel, dModel);
    this.Wk = TensorMath.xavierInit(dModel, dModel);
    this.Wv = TensorMath.xavierInit(dModel, dModel);
    this.Wo = TensorMath.xavierInit(dModel, dModel);
  }

  forward(X, isCausal = true) {
    const seqLen = X.length;

    // Линейные проекции
    const Q = TensorMath.matmul(X, this.Wq);
    const K = TensorMath.matmul(X, this.Wk);
    const V = TensorMath.matmul(X, this.Wv);

    // Разделение по головам, вычисление внимания и объединение
    const headOutputs = [];
    for (let h = 0; h < this.nHeads; h++) {
      const qHead = TensorMath.zeros(seqLen, this.dHead);
      const kHead = TensorMath.zeros(seqLen, this.dHead);
      const vHead = TensorMath.zeros(seqLen, this.dHead);

      const offset = h * this.dHead;
      for (let i = 0; i < seqLen; i++) {
        for (let j = 0; j < this.dHead; j++) {
          qHead[i][j] = Q[i][offset + j];
          kHead[i][j] = K[i][offset + j];
          vHead[i][j] = V[i][offset + j];
        }
      }

      const outHead = scaledDotProductAttention(qHead, kHead, vHead, isCausal);
      headOutputs.push(outHead);
    }

    // Конкатенация голов
    const concatenated = TensorMath.zeros(seqLen, this.dModel);
    for (let i = 0; i < seqLen; i++) {
      for (let h = 0; h < this.nHeads; h++) {
        const offset = h * this.dHead;
        for (let j = 0; j < this.dHead; j++) {
          concatenated[i][offset + j] = headOutputs[h][i][j];
        }
      }
    }

    // Выходная проекция W_o
    return TensorMath.matmul(concatenated, this.Wo);
  }
}

/**
 * Двухслойный Feed-Forward Network с активацией GELU
 */
export class FeedForward {
  constructor(dModel, dFf) {
    this.dModel = dModel;
    this.dFf = dFf;

    this.W1 = TensorMath.xavierInit(dModel, dFf);
    this.b1 = new Float32Array(dFf);
    this.W2 = TensorMath.xavierInit(dFf, dModel);
    this.b2 = new Float32Array(dModel);
  }

  forward(X) {
    // 1. Линейная проекция + b1
    const hidden = TensorMath.addBias(TensorMath.matmul(X, this.W1), this.b1);

    // 2. Активация GELU
    const rows = hidden.length;
    const cols = hidden[0].length;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        hidden[i][j] = TensorMath.gelu(hidden[i][j]);
      }
    }

    // 3. Выходная линейная проекция + b2
    return TensorMath.addBias(TensorMath.matmul(hidden, this.W2), this.b2);
  }
}
