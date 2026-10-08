/**
 * Спецификация действий (Actions) собственной AI-системы LAUTE
 * Определяет, что именно должен вернуть интерфейс клиенту:
 * обычный текст, уточняющий вопрос или карточки товаров.
 */

export const LAUTE_ACTIONS = {
  TEXT_RESPONSE: 'TEXT_RESPONSE',             // Только текстовый ответ (приветствия, о бренде, small talk)
  ASK_CLARIFICATION: 'ASK_CLARIFICATION',     // Уточняющий вопрос (недостаточно данных для выдачи товара)
  SHOW_PRODUCTS: 'SHOW_PRODUCTS',             // Показ подборки конкретных карточек товаров
  SHOW_PRODUCT: 'SHOW_PRODUCT',               // Детальный просмотр одной модели
  COMPARE_PRODUCTS: 'COMPARE_PRODUCTS',       // Сравнение двух или нескольких моделей
  SHOW_CATEGORY: 'SHOW_CATEGORY',             // Переход/показ категории каталога
  SHOW_CONTACTS: 'SHOW_CONTACTS',             // Блок контактов и адресов
  SHOW_SERVICE: 'SHOW_SERVICE',               // Блок гарантии и сервиса
  SHOW_PARTNERSHIP: 'SHOW_PARTNERSHIP',       // Блок условий для дилеров и партнеров
  NO_ACTION: 'NO_ACTION',                     // Действие не требуется
};

export const ACTION_LIST = Object.values(LAUTE_ACTIONS);

export const ACTION_TO_INDEX = {};
export const INDEX_TO_ACTION = {};

ACTION_LIST.forEach((action, idx) => {
  ACTION_TO_INDEX[action] = idx;
  INDEX_TO_ACTION[idx] = action;
});

export const NUM_ACTIONS = ACTION_LIST.length;

export default LAUTE_ACTIONS;
