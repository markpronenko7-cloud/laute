/**
 * Менеджер сессии памяти AI (Session Manager)
 * Обеспечивает сквозную сохранность диалога, контекста и фактов:
 * - При закрытии/сворачивании окна AI
 * - При переходе между страницами сайта
 * - При перезагрузке страницы
 */

import { ConversationMemory } from './conversationMemory.js';
import { WorkingMemory } from './workingMemory.js';
import { FactMemory } from './factMemory.js';

export class SessionManager {
  constructor(options = {}) {
    this.sessionKey = options.sessionKey || 'laute_ai_session_v2';
    this.conversation = new ConversationMemory(options.maxTurns || 30);
    this.working = new WorkingMemory();
    this.facts = new FactMemory(options.factsKey || 'laute_ai_facts_v2');

    this.restoreSession();
  }

  /**
   * Восстановление сессии из браузерного хранилища
   */
  restoreSession() {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const raw = sessionStorage.getItem(this.sessionKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.conversation) {
            this.conversation = ConversationMemory.fromJSON(parsed.conversation);
          }
          if (parsed.working) {
            this.working = WorkingMemory.fromJSON(parsed.working);
          }
        }
      }
    } catch (e) {
      console.warn('Could not restore AI session:', e.message);
    }
  }

  /**
   * Сохранение текущего состояния сессии
   */
  persistSession() {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const payload = JSON.stringify({
          conversation: this.conversation.toJSON(),
          working: this.working.toJSON(),
          savedAt: Date.now(),
        });
        sessionStorage.setItem(this.sessionKey, payload);
      }
    } catch (e) {
      // Игнорируем ограничения квоты
    }
  }

  /**
   * Полный сброс текущей беседы (по кнопке "Новый диалог")
   */
  resetSession() {
    this.conversation.clear();
    this.working.reset();
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(this.sessionKey);
      }
    } catch (e) {
      // ignore
    }
  }
}

export default SessionManager;
