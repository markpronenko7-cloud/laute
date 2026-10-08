/**
 * Оптимизатор для обучения собственной модели LAUTE
 * Поддерживает алгоритм Adam (Adaptive Moment Estimation)
 * с моментом первого и второго порядка, смещением и weight decay.
 */

export class AdamOptimizer {
  constructor(learningRate = 0.002, beta1 = 0.9, beta2 = 0.999, eps = 1e-8, weightDecay = 1e-4) {
    this.lr = learningRate;
    this.beta1 = beta1;
    this.beta2 = beta2;
    this.eps = eps;
    this.weightDecay = weightDecay;
    this.t = 0; // Шаг оптимизатора

    // Словари состояний для матриц (m, v)
    this.mMatrices = new Map();
    this.vMatrices = new Map();

    // Словари состояний для векторов (m, v)
    this.mVectors = new Map();
    this.vVectors = new Map();
  }

  /**
   * Обновление 2D матрицы весов по её градиенту
   */
  updateMatrix(paramName, matrix, gradMatrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;

    if (!this.mMatrices.has(paramName)) {
      const m = new Array(rows);
      const v = new Array(rows);
      for (let i = 0; i < rows; i++) {
        m[i] = new Float32Array(cols);
        v[i] = new Float32Array(cols);
      }
      this.mMatrices.set(paramName, m);
      this.vMatrices.set(paramName, v);
    }

    const m = this.mMatrices.get(paramName);
    const v = this.vMatrices.get(paramName);
    const step = this.t;

    const beta1 = this.beta1;
    const beta2 = this.beta2;
    const lr = this.lr;
    const eps = this.eps;
    const wd = this.weightDecay;

    const bc1 = 1 - Math.pow(beta1, step);
    const bc2 = 1 - Math.pow(beta2, step);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let g = gradMatrix[i][j];
        if (wd > 0) {
          g += wd * matrix[i][j]; // Weight decay
        }

        m[i][j] = beta1 * m[i][j] + (1 - beta1) * g;
        v[i][j] = beta2 * v[i][j] + (1 - beta2) * g * g;

        const mHat = m[i][j] / bc1;
        const vHat = v[i][j] / bc2;

        matrix[i][j] -= (lr / (Math.sqrt(vHat) + eps)) * mHat;
      }
    }
  }

  /**
   * Обновление 1D вектора смещения (Bias) по его градиенту
   */
  updateVector(paramName, vec, gradVec) {
    const len = vec.length;

    if (!this.mVectors.has(paramName)) {
      this.mVectors.set(paramName, new Float32Array(len));
      this.vVectors.set(paramName, new Float32Array(len));
    }

    const m = this.mVectors.get(paramName);
    const v = this.vVectors.get(paramName);
    const step = this.t;

    const beta1 = this.beta1;
    const beta2 = this.beta2;
    const lr = this.lr;
    const eps = this.eps;

    const bc1 = 1 - Math.pow(beta1, step);
    const bc2 = 1 - Math.pow(beta2, step);

    for (let i = 0; i < len; i++) {
      const g = gradVec[i];
      m[i] = beta1 * m[i] + (1 - beta1) * g;
      v[i] = beta2 * v[i] + (1 - beta2) * g * g;

      const mHat = m[i] / bc1;
      const vHat = v[i] / bc2;

      vec[i] -= (lr / (Math.sqrt(vHat) + eps)) * mHat;
    }
  }

  step() {
    this.t++;
  }
}

export default AdamOptimizer;
