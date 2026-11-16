import React from 'react';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

const searchLabels = {
  ru: ['Поиск товаров', 'Артикул, название или коллекция', 'Обычный', 'Умный', 'Найти', 'Например, графитовый смеситель для кухни под фильтр'],
  kz: ['Өнім іздеу', 'Артикул, атауы немесе топтама', 'Қалыпты', 'Ақылды', 'Іздеу', 'Мысалы, сүзгісі бар графит түсті асүй араластырғышы'],
  en: ['Product search', 'SKU, name or collection', 'Standard', 'Smart', 'Search', 'Try “graphite kitchen faucet with filter”'],
};

const smartSearchLabels = { ru: 'Умный поиск', kz: 'Ақылды іздеу', en: 'Smart search' };

export function CatalogSearchBar({ query, mode, onQuery, onMode, onSearch, smartOnly = false }) {
  const { lang } = useApp();
  const [label, placeholder, standard, smart, submit, example] = searchLabels[lang] || searchLabels.ru;
  const searchLabel = smartOnly ? smartSearchLabels[lang] || smartSearchLabels.ru : label;
  return (
    <form className="catalog-search-bar" data-search-mode={mode} role="search" aria-label={searchLabel} onSubmit={e => {
      e.preventDefault();
      onSearch();
    }}>
      <div className="search-box">
        <Search size={18} className="search-icon" aria-hidden="true" />
        <input className="search-input" type="search" aria-label={searchLabel} placeholder={mode === 'smart' ? example : placeholder}
          value={query} onChange={event => onQuery(event.target.value)} />
      </div>
      {!smartOnly && <div className="catalog-search-modes" role="group" aria-label={label}>
        <button type="button" aria-pressed={mode === 'standard'} onClick={() => onMode('standard')}>{standard}</button>
        <button type="button" aria-pressed={mode === 'smart'} onClick={() => onMode('smart')}>
          <Sparkles size={14} aria-hidden="true" />{smart}
        </button>
      </div>}
      <button type="submit" className="btn btn-primary">
        {smartOnly && <Sparkles size={16} aria-hidden="true" />}
        {smartOnly ? searchLabel : submit}<ArrowRight size={16} aria-hidden="true" />
      </button>
    </form>
  );
}
