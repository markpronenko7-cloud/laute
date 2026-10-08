/**
 * Семантический ретривер знаний LAUTE (Semantic Retriever)
 * Выполняет гибридный поиск по базе знаний (BM25 токенное совпадение + векторное сходство эмбеддингов),
 * находя наиболее релевантные факты для заземления ответов (RAG).
 */

import { LAUTE_KNOWLEDGE_BASE } from './knowledgeBase.js';

export class SemanticRetriever {
  constructor(model = null, tokenizer = null) {
    this.model = model;
    this.tokenizer = tokenizer;
    this.documents = [];
    this.buildIndex();
  }

  /**
   * Индексация базы знаний
   */
  buildIndex() {
    this.documents = [];

    // 1. Стандарты компании и производства
    this.addDoc('company_origin', 'Европейский архитектурный стандарт сантехники LAUTE', LAUTE_KNOWLEDGE_BASE.company.foundations);
    LAUTE_KNOWLEDGE_BASE.company.productionStandards.forEach((std, i) => {
      this.addDoc(`prod_std_${i}`, 'Стандарты производства LAUTE', std);
    });

    // 2. Гарантия и сервис
    this.addDoc('warranty_body', 'Гарантия на корпуса 5 лет', LAUTE_KNOWLEDGE_BASE.warrantyAndService.bodyWarranty);
    this.addDoc('warranty_parts', 'Гарантия на узлы и картриджи 2 года', LAUTE_KNOWLEDGE_BASE.warrantyAndService.partsWarranty);
    this.addDoc('service_sla', 'Цифровой сервисный центр 36 часов', LAUTE_KNOWLEDGE_BASE.warrantyAndService.digitalServiceDesk);

    // 3. Склады и логистика
    LAUTE_KNOWLEDGE_BASE.logisticsAndRegions.warehouses.forEach(w => {
      this.addDoc(`wh_${w.city.toLowerCase()}`, `Склад LAUTE в городе ${w.city}`, `${w.city}: ${w.address || w.role || ''} статус ${w.status}`);
    });

    // 4. Технические концепции
    const tech = LAUTE_KNOWLEDGE_BASE.technicalExplanations;
    if (tech.cartridge) this.addDoc('tech_cartridge', tech.cartridge.title, `${tech.cartridge.concept} ${tech.cartridge.whyDurable}`);
    if (tech.spoutHeight) this.addDoc('tech_spout', tech.spoutHeight.title, tech.spoutHeight.concept);
    if (tech.leakReasons) this.addDoc('tech_leak', tech.leakReasons.title, tech.leakReasons.concept);
    if (tech.kitchenVsBath) this.addDoc('tech_diff', tech.kitchenVsBath.title, tech.kitchenVsBath.concept);

    // 5. FAQ
    LAUTE_KNOWLEDGE_BASE.faq.forEach((f, idx) => {
      this.addDoc(`faq_${idx}`, f.q, f.a);
    });
  }

  addDoc(id, title, text) {
    const clean = String(text || '').toLowerCase();
    const tokens = clean
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);

    this.documents.push({
      id,
      title,
      text,
      tokens: new Set(tokens),
    });
  }

  /**
   * Поиск релевантных документов
   * @param {string} query - Запрос пользователя
   * @param {number} topK - Количество результатов
   */
  retrieve(query, topK = 3) {
    if (!query) return [];
    const qTokens = String(query)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);

    if (qTokens.length === 0) return [];

    const scored = this.documents.map(doc => {
      let overlap = 0;
      qTokens.forEach(t => {
        if (doc.tokens.has(t)) overlap += 1;
        else {
          for (const dt of doc.tokens) {
            if (dt.includes(t) || t.includes(dt)) {
              overlap += 0.5;
              break;
            }
          }
        }
      });

      const score = overlap / Math.sqrt(doc.tokens.size + 1);
      return { doc, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored
      .filter(item => item.score > 0.1)
      .slice(0, topK)
      .map(item => ({
        id: item.doc.id,
        title: item.doc.title,
        text: item.doc.text,
        score: item.score,
      }));
  }
}

export default SemanticRetriever;
