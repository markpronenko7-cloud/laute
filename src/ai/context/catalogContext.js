/**
 * Адаптер каталога продукции LAUTE (Catalog Context Adapter)
 * Изолированный слой доступа к номенклатуре товаров, категориям и характеристикам.
 * Спроектирован с возможностью будущего подключения внешних баз данных,
 * 1С/ERP и Excel-таблиц без изменения AI-ядра.
 */

export class CatalogContext {
  constructor(products = []) {
    this.products = Array.isArray(products) ? products : [];
  }

  setProducts(products) {
    this.products = Array.isArray(products) ? products : [];
  }

  getAllCategories() {
    const cats = new Set();
    this.products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }

  findByCategory(category) {
    if (!category) return [];
    const clean = category.toLowerCase().trim();
    return this.products.filter(p => p.category && p.category.toLowerCase().includes(clean));
  }

  findByArticle(article) {
    if (!article) return null;
    const clean = String(article).toUpperCase().trim();
    return this.products.find(p => p.article && p.article.toUpperCase().includes(clean)) || null;
  }

  getPopularProducts(limit = 3) {
    return this.products
      .filter(p => p.isPopular)
      .slice(0, limit);
  }

  filterByCriteria(criteria = {}) {
    const { category, city, maxPrice, requirements = [] } = criteria;

    return this.products.filter(p => {
      if (category && p.category !== category && !p.category?.toLowerCase().includes(category.toLowerCase())) {
        return false;
      }
      if (maxPrice && p.price && p.price > maxPrice) {
        return false;
      }
      if (city && p.cityStock && (p.cityStock[city] || 0) <= 0) {
        // Не фильтруем жестко, если товар есть на центральном складе
      }
      if (requirements.length > 0) {
        const pTags = (p.tags || []).map(t => t.toLowerCase());
        const pDesc = (p.description || '').toLowerCase();
        const pSpecs = (p.specs || '').toLowerCase();
        const matchesAny = requirements.some(r => {
          const req = r.toLowerCase();
          return pTags.includes(req) || pDesc.includes(req) || pSpecs.includes(req);
        });
        if (!matchesAny) return false;
      }
      return true;
    });
  }
}

export default CatalogContext;
