/**
 * Модуль управления датасетами LAUTE (Dataset Management)
 * Поддерживает форматы JSON / JSONL, разделение на train / val / test,
 * токенизацию, пакетирование (batching) и подготовку тензоров для обучения.
 */

export class LauteDataset {
  constructor(samples = [], tokenizer = null) {
    this.samples = Array.isArray(samples) ? samples : [];
    this.tokenizer = tokenizer;
  }

  get length() {
    return this.samples.length;
  }

  /**
   * Загрузка датасета из строки формата JSONL
   */
  static fromJSONL(jsonlContent, tokenizer = null) {
    if (!jsonlContent || typeof jsonlContent !== 'string') {
      return new LauteDataset([], tokenizer);
    }

    const lines = jsonlContent.split('\n');
    const samples = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      try {
        const item = JSON.parse(trimmed);
        samples.push(item);
      } catch (e) {
        console.warn('Skipping invalid JSONL line:', e.message);
      }
    }

    return new LauteDataset(samples, tokenizer);
  }

  /**
   * Разделение на обучающую, валидационную и тестовую выборки
   */
  split(trainRatio = 0.8, valRatio = 0.1, testRatio = 0.1) {
    const shuffled = [...this.samples].sort(() => Math.random() - 0.5);
    const total = shuffled.length;
    const trainEnd = Math.floor(total * trainRatio);
    const valEnd = trainEnd + Math.floor(total * valRatio);

    return {
      train: new LauteDataset(shuffled.slice(0, trainEnd), this.tokenizer),
      val: new LauteDataset(shuffled.slice(trainEnd, valEnd), this.tokenizer),
      test: new LauteDataset(shuffled.slice(valEnd), this.tokenizer),
    };
  }

  /**
   * Генерация батчей для цикла обучения
   */
  getBatches(batchSize = 4, maxSeqLen = 64) {
    const batches = [];
    for (let i = 0; i < this.samples.length; i += batchSize) {
      const slice = this.samples.slice(i, i + batchSize);
      const batchInputIds = [];
      const batchTargetIds = [];

      slice.forEach(sample => {
        if (!this.tokenizer) return;
        const text = `${sample.prompt || ''} ${sample.response || ''}`.trim();
        const encoded = this.tokenizer.encode(text, { padToMax: true, maxLen: maxSeqLen });

        batchInputIds.push(encoded);
        // Таргет со сдвигом на 1 токен вправо для авторегрессионного моделирования
        const target = [...encoded.slice(1), 0];
        batchTargetIds.push(target);
      });

      if (batchInputIds.length > 0) {
        batches.push({
          inputIds: batchInputIds,
          targetIds: batchTargetIds,
          size: batchInputIds.length,
        });
      }
    }
    return batches;
  }

  /**
   * Экспорт в JSONL
   */
  toJSONL() {
    return this.samples.map(s => JSON.stringify(s)).join('\n');
  }
}

export default LauteDataset;
