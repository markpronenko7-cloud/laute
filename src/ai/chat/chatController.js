/**
 * Контроллер чата LAUTE AI (Chat Controller)
 * Управляет асинхронным потоком сообщений между UI и ядром:
 * - Имитация естественной задержки набора текста (human-like typing delay)
 * - Управление блокировкой двойной отправки (concurrency lock)
 * - Форматирование интерактивных чипсов и карточек товаров
 * - Гарантия сохранности истории диалога
 */

import { getLauteAIEngine } from '../core/engine.js';

export class ChatController {
  constructor(engine = null) {
    this.engine = engine || getLauteAIEngine();
    this.isProcessing = false;
  }

  /**
   * Отправка сообщения в AI ядро
   */
  async sendMessage({
    message,
    context = {},
    products = [],
    history = [],
    lang = 'ru',
    onStart = null,
    onSuccess = null,
    onError = null,
  }) {
    if (this.isProcessing) return null;
    this.isProcessing = true;

    if (onStart) onStart();

    try {
      // Имитация естественного времени ответа (180-260 мс) без блокировки основного потока UI
      await new Promise(resolve => setTimeout(resolve, 200));

      const response = this.engine.processMessage({
        rawQuery: message,
        currentContext: context,
        products,
        history,
        lang,
      });

      if (onSuccess) {
        onSuccess(response);
      }

      return response;
    } catch (err) {
      console.error('ChatController error:', err);
      if (onError) onError(err);
      return null;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Сброс истории диалога
   */
  clearChat() {
    this.engine.resetSession();
  }

  /**
   * Получение истории текущей сессии
   */
  getHistory() {
    return this.engine.getSessionHistory();
  }
}

export default ChatController;
