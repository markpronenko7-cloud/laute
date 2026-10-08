/**
 * Экстрактор сущностей и параметров сантехники LAUTE (Entity Extractor)
 * Извлекает категорию, цвет, конструктивные особенности, город и бюджет
 * с устойчивостью к падежам, опечаткам и сокращениям.
 */

export class EntityExtractor {
  static extract(query = '', currentSlots = {}) {
    const q = (query || '').toLowerCase().trim();
    const entities = { ...currentSlots };

    // 1. Извлечение цвета
    if (q.includes('черн') || q.includes('чёрн') || q.includes('чорн') || q.includes('black') || q.includes('қара')) {
      entities.color = 'Чёрный';
    } else if (q.includes('бел') || q.includes('white') || q.includes('ақ')) {
      entities.color = 'Белый';
    } else if (q.includes('хром') || q.includes('chrome') || q.includes('хромир')) {
      entities.color = 'Хром';
    } else if (q.includes('золот') || q.includes('gold') || q.includes('алтын')) {
      entities.color = 'Золото';
    } else if (q.includes('сатин') || q.includes('satin') || q.includes('браш')) {
      entities.color = 'Сатин / Браш';
    } else if (q.includes('графит') || q.includes('graphite')) {
      entities.color = 'Графит';
    }

    // 2. Извлечение зоны / категории
    if (
      q.includes('кухн') || q.includes('асүй') || q.includes('kitchen') || q.includes('мойк') ||
      q.includes('гибк') || q.includes('фильтр') || q.includes('2в1') || q.includes('2-в-1')
    ) {
      entities.category = 'Кухонные смесители';
    } else if (q.includes('раковин') || q.includes('умывальн') || q.includes('қолжуғыш') || q.includes('basin')) {
      entities.category = 'Смесители для раковины';
    } else if (q.includes('ванн') || q.includes('bath') || q.includes('купани')) {
      entities.category = 'Смесители для ванны';
    } else if (q.includes('душ') || q.includes('shower') || q.includes('стойк') || q.includes('гарнитур')) {
      entities.category = 'Душевые системы и гарнитуры';
    }

    // 3. Конструктивные особенности
    if (!entities.requirements) entities.requirements = [];

    if (q.includes('фильтр') || q.includes('2в1') || q.includes('2-в-1') || q.includes('питьев') || q.includes('сүзгі')) {
      if (!entities.requirements.includes('под фильтр')) entities.requirements.push('под фильтр');
    }
    if (q.includes('гибк') || q.includes('силикон') || q.includes('икемді') || q.includes('flex')) {
      if (!entities.requirements.includes('гибкий излив')) entities.requirements.push('гибкий излив');
    }
    if (q.includes('компакт') || q.includes('маленьк') || q.includes('небольш') || q.includes('шағын')) {
      if (!entities.requirements.includes('компактный')) entities.requirements.push('компактный');
    }
    if (q.includes('высок') || q.includes('биік') || q.includes('чаш') || q.includes('vessel')) {
      if (!entities.requirements.includes('высокий корпус')) entities.requirements.push('высокий корпус');
    }

    // 4. Город
    if (q.includes('алмат') || q.includes('almaty')) entities.city = 'Алматы';
    else if (q.includes('астан') || q.includes('astana')) entities.city = 'Астана';
    else if (q.includes('новосиб') || q.includes('сибирь')) entities.city = 'Новосибирск';
    else if (q.includes('москв') || q.includes('moscow')) entities.city = 'Москва';
    else if (q.includes('шымкент')) entities.city = 'Шымкент';

    // 5. Бюджет
    if (q.includes('недорог') || q.includes('бюджетн') || q.includes('эконом') || q.includes('арзан')) {
      entities.budget = 'эконом';
    } else if (q.includes('премиум') || q.includes('люкс') || q.includes('топ')) {
      entities.budget = 'премиум';
    }

    return entities;
  }
}

export default EntityExtractor;
