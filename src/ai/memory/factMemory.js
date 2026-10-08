/**
 * Долговременная память фактов (Fact Memory)
 * Хранит постоянные предпочтения пользователя, проектные данные
 * и важные факты, полученные во время диалога.
 */

export class FactMemory {
  constructor(storageKey = 'laute_ai_fact_memory_v1') {
    this.storageKey = storageKey;
    this.facts = new Map();
    this.load();
  }

  setFact(key, value) {
    if (!key) return;
    this.facts.set(key, {
      value,
      updatedAt: Date.now(),
    });
    this.save();
  }

  getFact(key) {
    const entry = this.facts.get(key);
    return entry ? entry.value : null;
  }

  hasFact(key) {
    return this.facts.has(key);
  }

  getAllFacts() {
    const result = {};
    for (const [k, v] of this.facts.entries()) {
      result[k] = v.value;
    }
    return result;
  }

  deleteFact(key) {
    this.facts.delete(key);
    this.save();
  }

  clear() {
    this.facts.clear();
    this.save();
  }

  save() {
    try {
      if (typeof localStorage !== 'undefined') {
        const payload = JSON.stringify(Array.from(this.facts.entries()));
        localStorage.setItem(this.storageKey, payload);
      }
    } catch (e) {
      // Игнорируем ограничения квоты
    }
  }

  load() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const entries = JSON.parse(raw);
          if (Array.isArray(entries)) {
            this.facts = new Map(entries);
          }
        }
      }
    } catch (e) {
      // Игнорируем ошибку чтения
    }
  }
}

export default FactMemory;
