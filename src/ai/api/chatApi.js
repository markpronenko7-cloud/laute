/**
 * Локальный и удаленный API-адаптер собственного AI LAUTE
 * Обеспечивает интерфейс эндпоинта /api/ai/chat:
 * - В текущем режиме: прямое синхронное/асинхронное выполнение в собственном AI-ядре
 * - В будущем режиме: бесшовное переключение на собственный выделенный сервер модели (self-hosted)
 * БЕЗ необходимости менять интерфейс сайта или клиентский код.
 */

import { getLauteAIEngine } from '../core/engine.js';
import { LAUTE_AI_CONFIG } from '../config/index.js';

export const API_MODES = {
  LOCAL_BROWSER_ENGINE: 'local',
  SELF_HOSTED_SERVER: 'self_hosted_server',
};

export class LauteChatApi {
  constructor(mode = LAUTE_AI_CONFIG.api.mode) {
    this.mode = mode;
    this.serverUrl = null;
  }

  setServerUrl(url) {
    this.serverUrl = url;
    this.mode = API_MODES.SELF_HOSTED_SERVER;
  }

  setLocalMode() {
    this.mode = API_MODES.LOCAL_BROWSER_ENGINE;
  }

  /**
   * Обработчик вызова эндпоинта /api/ai/chat
   * @param {Object} payload - { message, context, products, lang }
   */
  async handleChatRequest(payload = {}) {
    const {
      message = '',
      context = {},
      products = [],
      lang = 'ru',
    } = payload;

    // Режим 1: Выполнение в собственном локальном ядре LAUTE
    if (this.mode === API_MODES.LOCAL_BROWSER_ENGINE) {
      const engine = getLauteAIEngine();
      const response = engine.processMessage({
        rawQuery: message,
        currentContext: context,
        products,
        lang,
      });

      return {
        success: true,
        data: response,
        provider: 'LAUTE Proprietary Core (Local)',
        timestamp: Date.now(),
      };
    }

    // Режим 2: Выполнение на собственном сервере LAUTE (будущая большая модель)
    if (this.mode === API_MODES.SELF_HOSTED_SERVER) {
      if (!this.serverUrl) {
        throw new Error('Self-hosted server URL is not configured.');
      }

      const res = await fetch(`${this.serverUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context, products, lang }),
      });

      if (!res.ok) {
        throw new Error(`Self-hosted AI server returned error: ${res.status}`);
      }

      const data = await res.json();
      return {
        success: true,
        data,
        provider: 'LAUTE Dedicated Server Model',
        timestamp: Date.now(),
      };
    }

    throw new Error(`Unknown API mode: ${this.mode}`);
  }
}

export const chatApi = new LauteChatApi();

export const handleChatApiRequest = (payload) => chatApi.handleChatRequest(payload);

export default chatApi;
