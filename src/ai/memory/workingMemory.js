/**
 * Рабочая память (Working Memory / Dialogue State)
 * Хранит активные слоты текущей беседы: категорию, город, бюджет,
 * требования, предыдущие темы и товары для разрешения анафор.
 */

export class WorkingMemory {
  constructor(initialState = {}) {
    this.state = {
      step: 'idle',
      lastTopic: null,
      lastSubject: null,
      lastAiQuestion: null,
      category: null,
      style: null,
      budget: null,
      city: 'Алматы',
      requirements: [],
      lastProducts: [],
      turnCount: 0,
      ...initialState,
    };
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    this.state[key] = value;
  }

  update(updates = {}) {
    this.state = {
      ...this.state,
      ...updates,
      turnCount: (this.state.turnCount || 0) + 1,
    };
  }

  addRequirement(req) {
    if (!req) return;
    const clean = String(req).toLowerCase().trim();
    if (!this.state.requirements.includes(clean)) {
      this.state.requirements = [...this.state.requirements, clean];
    }
  }

  reset() {
    this.state = {
      step: 'idle',
      lastTopic: null,
      lastSubject: null,
      lastAiQuestion: null,
      category: null,
      style: null,
      budget: null,
      city: 'Алматы',
      requirements: [],
      lastProducts: [],
      turnCount: 0,
    };
  }

  snapshot() {
    return { ...this.state };
  }

  toJSON() {
    return this.snapshot();
  }

  static fromJSON(data) {
    return new WorkingMemory(data || {});
  }
}

export default WorkingMemory;
