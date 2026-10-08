/**
 * Менеджер контекста LAUTE (Context Manager)
 * Объединяет бренд, каталог, сервисную информацию и память пользователя
 * в единый структурированный контекст для рассуждения AI.
 */

import { LAUTE_BRAND_CONTEXT } from './brandContext.js';
import { CatalogContext } from './catalogContext.js';
import { LAUTE_SERVICE_CONTEXT } from './serviceContext.js';

export class ContextManager {
  constructor(products = []) {
    this.brand = LAUTE_BRAND_CONTEXT;
    this.service = LAUTE_SERVICE_CONTEXT;
    this.catalog = new CatalogContext(products);
  }

  setCatalogProducts(products) {
    this.catalog.setProducts(products);
  }

  /**
   * Сборка объединенного контекста диалога
   */
  assembleContext(userQuery, workingMemory = {}, lang = 'ru') {
    return {
      lang,
      query: userQuery,
      brand: this.brand,
      service: this.service,
      activeSlot: {
        category: workingMemory.category || null,
        city: workingMemory.city || 'Алматы',
        budget: workingMemory.budget || null,
        requirements: workingMemory.requirements || [],
        lastTopic: workingMemory.lastTopic || null,
        lastSubject: workingMemory.lastSubject || null,
      },
      availableCategories: this.catalog.getAllCategories(),
      popularProducts: this.catalog.getPopularProducts(3),
    };
  }
}

export default ContextManager;
