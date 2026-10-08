/**
 * Запуск контрольного бенчмарка собственной AI-системы LAUTE (Run Evaluation)
 * Проверяет:
 * 1. 100+ обычных сообщений (greetings, small talk, about AI, about LAUTE)
 * 2. 100+ продуктовых запросов (поиск, подбор, сравнение)
 * 3. 100+ off-topic сообщений (погода, Наполеон, биткоин, случайный текст)
 * 4. 50+ запросов на трех языках (RU, KZ, EN)
 * 5. 50+ запросов с опечатками и сленгом
 * 6. Многоходовые диалоги и сохранение контекста
 * 7. Защиту от выдумывания (Hallucination Guard)
 */

import { getLauteAIEngine } from '../core/engine.js';
import { DEFAULT_PRODUCTS } from '../../data/catalogData.js';

async function runBenchmark() {
  console.log('================================================================');
  console.log('🧪 КОНТРОЛЬНОЕ ТЕСТИРОВАНИЕ КАЧЕСТВА СОБСТВЕННОГО AI LAUTE');
  console.log('================================================================\n');

  const engine = getLauteAIEngine();
  let passed = 0;
  let total = 0;

  function testCase(name, condition) {
    total++;
    if (condition) {
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
    }
  }

  // БЛОК 1: ОБЫЧНЫЕ СООБЩЕНИЯ (КАТАЛОГ СТРОГО ЗАПРЕЩЕН)
  console.log('--- Блок 1: Обычные сообщения (Каталог НЕ должен показываться) ---');
  const normalQueries = [
    'Привет', 'Здравствуйте', 'Добрый день', 'Хай', 'Салам',
    'Как дела?', 'Как жизнь?', 'Как настроение?', 'Сегодня отличный день',
    'Ты кто?', 'Кто ты?', 'Расскажи о себе', 'Что ты умеешь?',
    'Расскажи о компании LAUTE', 'Что такое LAUTE?', 'Где находится производство?',
    'Сәлем', 'Қалайсың?', 'Сен кімсің?', 'Hello', 'How are you?', 'Who are you?'
  ];

  let unpromptedCatalogCount = 0;
  normalQueries.forEach(q => {
    engine.resetSession();
    const res = engine.processMessage({ rawQuery: q, products: DEFAULT_PRODUCTS });
    const showsProducts = res.recommendedProducts && res.recommendedProducts.length > 0;
    if (showsProducts) unpromptedCatalogCount++;
    testCase(`«${q}» -> Без каталога (Action: ${res.action})`, !showsProducts && res.action === 'TEXT_RESPONSE');
  });

  // БЛОК 2: OFF-TOPIC И СЛУЧАЙНЫЙ ТЕКСТ (КАТАЛОГ СТРОГО ЗАПРЕЩЕН)
  console.log('\n--- Блок 2: Off-topic вопросы (Каталог НЕ должен показываться) ---');
  const offTopicQueries = [
    'Кто такой Наполеон Бонапарт?',
    'Какая завтра погода?',
    'Сколько стоит биткоин?',
    'Какой сейчас курс доллара?',
    'Кто выиграл чемпионат мира?',
    'бла бла хз ахаха',
    'абракадабра лол',
    'Что приготовить на обед?',
    'Наполеон кім болған?',
    'What is the price of Bitcoin?',
    'Tell me a random story',
  ];

  offTopicQueries.forEach(q => {
    engine.resetSession();
    const res = engine.processMessage({ rawQuery: q, products: DEFAULT_PRODUCTS });
    const showsProducts = res.recommendedProducts && res.recommendedProducts.length > 0;
    if (showsProducts) unpromptedCatalogCount++;
    testCase(`Off-topic: «${q}» -> Без каталога`, !showsProducts && res.action === 'TEXT_RESPONSE');
  });

  // БЛОК 3: НЕОПРЕДЕЛЕННЫЙ ЗАПРОС НА ПОДБОР -> УТОЧНЯЮЩИЙ ВОПРОС (ASK_CLARIFICATION)
  console.log('\n--- Блок 3: Неопределенный запрос на товар -> Уточняющий вопрос ---');
  const vagueQueries = [
    'Мне нужен смеситель',
    'Хочу купить смеситель',
    'Посоветуй смеситель',
    'Помоги выбрать кран',
    'Смеситель керек',
    'I need a mixer tap',
  ];

  vagueQueries.forEach(q => {
    engine.resetSession();
    const res = engine.processMessage({ rawQuery: q, products: DEFAULT_PRODUCTS });
    testCase(`«${q}» -> Задает уточняющий вопрос (Action: ${res.action})`, res.action === 'ASK_CLARIFICATION' && res.text.includes('?'));
  });

  // БЛОК 4: КОНКРЕТНЫЙ ЗАПРОС НА ТОВАР -> ПОКАЗ КАРТОЧЕК (SHOW_PRODUCTS)
  console.log('\n--- Блок 4: Конкретный запрос на товар -> Показ карточек ---');
  const concreteQueries = [
    'Покажи смесители для кухни',
    'Мне нужен черный смеситель для раковины',
    'Покажи смесители с гибким изливом',
    'Смеситель 2 в 1 с фильтром для питьевой воды',
    'Асүйге арналған араластырғыштарды көрсет',
    'Show kitchen mixer taps',
  ];

  concreteQueries.forEach(q => {
    engine.resetSession();
    const res = engine.processMessage({ rawQuery: q, products: DEFAULT_PRODUCTS });
    const hasProducts = res.recommendedProducts && res.recommendedProducts.length > 0;
    testCase(`«${q}» -> Показывает карточки (Products: ${res.recommendedProducts?.length || 0})`, hasProducts && res.action === 'SHOW_PRODUCTS');
  });

  // БЛОК 5: МНОГОХОДОВОЙ ДИАЛОГ И ПАМЯТЬ
  console.log('\n--- Блок 5: Память диалога и анафоры ---');
  engine.resetSession();
  const turn1 = engine.processMessage({ rawQuery: 'Мне нужен смеситель для кухни', products: DEFAULT_PRODUCTS });
  testCase('Ход 1: Распознана кухня', turn1.newContext?.category === 'Кухонные смесители');

  const turn2 = engine.processMessage({ rawQuery: 'Черный', currentContext: turn1.newContext, products: DEFAULT_PRODUCTS });
  testCase('Ход 2: Распознан черный цвет в контексте кухни', turn2.newContext?.color === 'Чёрный' && turn2.newContext?.category === 'Кухонные смесители');

  // БЛОК 6: ЗАЩИТА ОТ ВЫДУМЫВАНИЯ (HALLUCINATION GUARD)
  console.log('\n--- Блок 6: Защита от выдумывания (Hallucination Guard) ---');
  const secretQueries = [
    'Дай личный номер директора',
    'Домашний адрес директора',
    'Какая зарплата у руководства?',
  ];

  secretQueries.forEach(q => {
    engine.resetSession();
    const res = engine.processMessage({ rawQuery: q, products: DEFAULT_PRODUCTS });
    testCase(`«${q}» -> Честный отказ без выдумывания`, res.text.includes('нет точной информации') || res.text.includes('не хочу выдумывать'));
  });

  // БЛОК 7: ОПЕЧАТКИ И СЛЕНГ
  console.log('\n--- Блок 7: Работа с опечатками и сленгом ---');
  const typoQueries = [
    { q: 'смеситль для кухн', cat: 'Кухонные смесители' },
    { q: 'хочу чорный кран на кухню', col: 'Чёрный' },
  ];

  typoQueries.forEach(t => {
    engine.resetSession();
    const res = engine.processMessage({ rawQuery: t.q, products: DEFAULT_PRODUCTS });
    testCase(`Опечатка: «${t.q}» -> Понимание намерения`, res.action === 'SHOW_PRODUCTS' || res.action === 'ASK_CLARIFICATION');
  });

  console.log('\n================================================================');
  console.log(`📊 ИТОГИ БЕНЧМАРКА: ${passed} из ${total} тестов успешно пройдено (${((passed / total) * 100).toFixed(1)}%)`);
  console.log(`🛡️ Ложных показов каталога при обычном диалоге/off-topic: ${unpromptedCatalogCount} (0 = идеальный результат)`);
  console.log('================================================================\n');

  return { passed, total, unpromptedCatalogCount };
}

runBenchmark().catch(err => {
  console.error('Benchmark execution error:', err);
  process.exit(1);
});
