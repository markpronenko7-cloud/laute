/**
 * Исполняемый скрипт обучения собственной модели LAUTE (Run Training)
 * Запускает реальный цикл обучения с обратным распространением ошибки,
 * оптимизатором Adam, расчетом функции потерь, валидацией и сохранением чекпоинта.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { LauteModelConfig } from '../model/config.js';
import { LauteVocabulary } from '../model/vocabulary.js';
import { LauteTokenizer } from '../model/tokenizer.js';
import { LauteTransformerModel } from '../model/transformer.js';
import { WeightsManager } from '../model/weights.js';
import { LauteTrainer } from './trainer.js';
import { generateLauteDataset } from '../datasets/datasetBuilder.js';
import { ModelEvaluator } from '../evaluation/evaluator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('================================================================');
  console.log('🚀 ЗАПУСК ОБУЧЕНИЯ СОБСТВЕННОЙ НЕЙРОСЕТЕВОЙ МОДЕЛИ LAUTE');
  console.log('================================================================\n');

  // 1. Генерация и подготовка датасета
  const allSamples = generateLauteDataset();
  console.log(`📊 Всего сгенерировано обучающих примеров: ${allSamples.length}`);

  // Разделение на train (80%), val (10%), test (10%)
  const shuffled = [...allSamples].sort(() => Math.random() - 0.5);
  const nTrain = Math.floor(shuffled.length * 0.8);
  const nVal = Math.floor(shuffled.length * 0.1);

  const trainSamples = shuffled.slice(0, nTrain);
  const valSamples = shuffled.slice(nTrain, nTrain + nVal);
  const testSamples = shuffled.slice(nTrain + nVal);

  console.log(`- Train выборка: ${trainSamples.length} примеров`);
  console.log(`- Val выборка: ${valSamples.length} примеров`);
  console.log(`- Test выборка: ${testSamples.length} примеров`);

  // Сохранение датасетов на диск
  const dataDir = path.join(__dirname, '../datasets/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(path.join(dataDir, 'train.jsonl'), trainSamples.map(s => JSON.stringify(s)).join('\n'));
  fs.writeFileSync(path.join(dataDir, 'val.jsonl'), valSamples.map(s => JSON.stringify(s)).join('\n'));
  fs.writeFileSync(path.join(dataDir, 'test.jsonl'), testSamples.map(s => JSON.stringify(s)).join('\n'));
  console.log('💾 Датасеты train.jsonl, val.jsonl, test.jsonl сохранены в src/ai/datasets/data/');

  // 2. Инициализация словаря и токенизатора
  const vocab = new LauteVocabulary();
  vocab.buildFromCorpus(allSamples.map(s => s.text));
  const tokenizer = new LauteTokenizer(vocab, 64);
  console.log(`📚 Размерность словаря модели: ${vocab.size} токенов`);

  // 3. Инициализация модели
  const config = new LauteModelConfig({
    vocabSize: vocab.size,
    dModel: 64,
    nHeads: 4,
    nLayers: 2,
    dFf: 128,
    maxSeqLen: 64,
  });
  const model = new LauteTransformerModel(config);
  const totalParams = WeightsManager.countParameters(model);
  console.log(`⚙️ Архитектура: Transformer Encoder (Pre-LN, 2 слоя, 4 головы внимания)`);
  console.log(`🔢 Общее количество обучаемых параметров: ${totalParams}\n`);

  // 4. Оценка исходного (необученного) состояния
  console.log('--- Оценка до начала обучения (Baseline) ---');
  const preEvaluator = new ModelEvaluator(model, tokenizer);
  const preEval = preEvaluator.evaluate(testSamples);
  console.log(`Начальная точность intent: ${preEval.intentAccuracy} | action: ${preEval.actionAccuracy}`);

  // 5. Запуск реального цикла обучения (Fine-Tuning)
  const trainer = new LauteTrainer(model, tokenizer, {
    epochs: 25,
    batchSize: 8,
    learningRate: 0.003,
    checkpointInterval: 5,
  });

  const startTime = Date.now();
  const history = await trainer.train(trainSamples, valSamples);
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`⏱️ Время обучения: ${durationSec} сек.`);

  // 6. Сохранение итогового чекпоинта модели
  const ckptDir = path.join(__dirname, '../checkpoints');
  if (!fs.existsSync(ckptDir)) {
    fs.mkdirSync(ckptDir, { recursive: true });
  }

  const exported = WeightsManager.exportWeights(model, 5);
  const checkpointPayload = {
    modelName: 'laute-transformer-v1.0',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    trainingStats: {
      totalSamples: allSamples.length,
      epochs: 25,
      finalTrainLoss: history.trainLoss[history.trainLoss.length - 1],
      finalValLoss: history.valLoss[history.valLoss.length - 1],
      finalTrainAcc: history.trainAccuracy[history.trainAccuracy.length - 1],
      finalValAcc: history.valAccuracy[history.valAccuracy.length - 1],
      durationSeconds: durationSec,
    },
    vocab: vocab.toJSON(),
    config: exported.config,
    weights: exported.weights,
  };

  const ckptFile = path.join(ckptDir, 'laute_model_v1.json');
  fs.writeFileSync(ckptFile, JSON.stringify(checkpointPayload, null, 2));
  console.log(`\n💾 Обученные веса и метаданные сохранены в: ${ckptFile}`);

  const jsFile = path.join(ckptDir, 'defaultCheckpoint.js');
  fs.writeFileSync(jsFile, `export const DEFAULT_LAUTE_CHECKPOINT = ${JSON.stringify(checkpointPayload)};\nexport default DEFAULT_LAUTE_CHECKPOINT;\n`);
  console.log(`💾 Модуль мгновенного доступа сохранен в: ${jsFile}`);

  // 7. Финальная контрольная оценка качества на тестовой выборке
  console.log('\n================================================================');
  console.log('📈 ФИНАЛЬНЫЙ ОТЧЕТ КАЧЕСТВА (TEST BENCHMARK)');
  console.log('================================================================');
  const postEvaluator = new ModelEvaluator(model, tokenizer);
  const postEval = postEvaluator.evaluate(testSamples);

  console.log(`✅ Итоговая точность Intent: ${postEval.intentAccuracy}`);
  console.log(`✅ Итоговая точность Action: ${postEval.actionAccuracy}`);
  console.log(`🛡️ Ложных показов каталога при обычном диалоге/off-topic: ${postEval.falseCatalogShows} (0 = идеальная защита)`);
  console.log(`🎯 Ложных блокировок при явном поиске товара: ${postEval.falseCatalogDenials}`);
  console.log('================================================================\n');

  return { checkpointPayload, postEval };
}

run().catch(err => {
  console.error('Training execution error:', err);
  process.exit(1);
});
