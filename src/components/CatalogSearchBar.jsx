import React from 'react';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

const searchLabels = {
  ru: ['Поиск товаров', 'Артикул, модель или коллекция', 'Обычный', 'Умный', 'Найти'],
  kz: ['Өнім іздеу', 'Артикул, модель немесе топтама', 'Қалыпты', 'Ақылды', 'Іздеу'],
  en: ['Product search', 'SKU, model or collection', 'Standard', 'Smart', 'Search'],
};

export function CatalogSearchBar({ query, mode, onQuery, onMode, onSearch }) {
  const { lang } = useApp();
  const [label, placeholder, standard, smart, submit] = searchLabels[lang] || searchLabels.ru;
  return (
    <form className="catalog-search-bar" role="search" aria-label={label} onSubmit={e => {
      e.preventDefault();
      onSearch();
    }}>
      <div className="search-box">
        <Search size={18} className="search-icon" aria-hidden="true" />
        <input className="search-input" type="search" aria-label={label} placeholder={placeholder}
          value={query} onChange={event => onQuery(event.target.value)} />
      </div>
      <div className="catalog-search-modes" role="group" aria-label={label}>
        <button type="button" aria-pressed={mode === 'standard'} onClick={() => onMode('standard')}>{standard}</button>
        <button type="button" aria-pressed={mode === 'smart'} onClick={() => onMode('smart')}>
          <Sparkles size={14} aria-hidden="true" />{smart}
        </button>
      </div>
      <button type="submit" className="btn btn-primary">{submit}<ArrowRight size={16} aria-hidden="true" /></button>
    </form>
  );
}
