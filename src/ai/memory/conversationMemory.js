/**
 * Модуль кратковременной памяти диалога (Conversation Memory)
 * Хранит историю сообщений, роли, временные метки и обеспечивает
 * сохранение контекста в пределах активной сессии.
 */

export class ConversationMemory {
  constructor(maxTurns = 30) {
    this.maxTurns = maxTurns;
    this.messages = [];
  }

  /**
   * Добавление сообщения в память
   */
  addMessage(role, text, metadata = {}) {
    if (!text) return null;
    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      role: role === 'user' ? 'user' : 'assistant',
      text: String(text).trim(),
      timestamp: Date.now(),
      metadata: { ...metadata },
    };

    this.messages.push(msg);

    // Поддержание максимального окна контекста
    if (this.messages.length > this.maxTurns * 2) {
      // Сохраняем системное/первое приветствие и обрезаем старые промежуточные
      const first = this.messages[0];
      const recent = this.messages.slice(-this.maxTurns * 2 + 1);
      this.messages = [first, ...recent];
    }

    return msg;
  }

  addUserMessage(text, metadata = {}) {
    return this.addMessage('user', text, metadata);
  }

  addAssistantMessage(text, metadata = {}) {
    return this.addMessage('assistant', text, metadata);
  }

  /**
   * Получение истории сообщений
   */
  getHistory() {
    return [...this.messages];
  }

  /**
   * Получение последних N реплик для подачи в контекст
   */
  getRecentContext(n = 6) {
    return this.messages.slice(-n);
  }

  /**
   * Получение предыдущей реплики пользователя и ассистента
   */
  getLastTurn() {
    if (this.messages.length < 2) return null;
    return {
      user: this.messages[this.messages.length - 2],
      assistant: this.messages[this.messages.length - 1],
    };
  }

  clear() {
    this.messages = [];
  }

  toJSON() {
    return {
      messages: this.messages,
      maxTurns: this.maxTurns,
    };
  }

  static fromJSON(data) {
    const mem = new ConversationMemory(data?.maxTurns || 30);
    if (Array.isArray(data?.messages)) {
      mem.messages = [...data.messages];
    }
    return mem;
  }
}

export default ConversationMemory;
