import React, { useEffect, useState } from 'react';
import { ArrowRight, Plus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fetchCategories } from '../../services/adminApi';
import { classifyProductImages, formatProductDisplay } from '../../utils/imageHelper';

const fields = [
  ['Категория', 'category'],
  ['Материал', 'material'],
  ['Цвет', 'color'],
  ['Покрытие', 'finish'],
  ['Монтаж', 'installType'],
  ['Размеры', 'dimensions'],
  ['Вес', 'weight'],
  ['Объём', 'volume'],
  ['Характеристики', 'specs']
];

function Comparison({ initialItems }) {
  const {
    products, closeComparisonModal, openProductModal, getStockForSku,
    activeWarehouse, getProductPrice, isB2BAuthorized, adminSession
  } = useApp();
  const [items, setItems] = useState(() => [...new Map(initialItems.map(item => [item.article, item])).values()]);
  const [query, setQuery] = useState('');
  const [candidate, setCandidate] = useState('');
  const [hiddenCategories, setHiddenCategories] = useState([]);
  useEffect(() => {
    let active = true;
    fetchCategories().then(categories => {
      if (active) setHiddenCategories(categories.filter(category => category.isVisible === false).map(category => category.name));
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const onKey = event => { if (event.key === 'Escape') closeComparisonModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeComparisonModal]);

  const selected = new Set(items.map(item => item.article));
  const term = query.trim().toLowerCase();
  const choices = products.filter(item =>
    item.status !== 'СКРЫТ' && !hiddenCategories.includes(item.category) && !selected.has(item.article)
    && [item.article, item.name, item.collection, item.category].some(value => String(value || '').toLowerCase().includes(term))
  );
  const nextItem = choices.find(item => item.article === candidate);
  const baseUrl = import.meta.env.BASE_URL;
  const showStock = Boolean(isB2BAuthorized || adminSession);

  return (
    <div className="modal-overlay" onClick={closeComparisonModal}>
      <div className="modal-content comparison-modal" role="dialog" aria-modal="true" aria-labelledby="comparison-title"
        onClick={event => event.stopPropagation()}>
        <button className="modal-close-btn" type="button" onClick={closeComparisonModal} aria-label="Закрыть">
          <X size={20} />
        </button>
        <h2 id="comparison-title">Сравнение товаров</h2>
        <form className="comparison-picker" onSubmit={event => {
          event.preventDefault();
          if (!nextItem) return;
          setItems(current => [...current, nextItem]);
          setCandidate('');
          setQuery('');
        }}>
          <input autoFocus aria-label="Поиск товара для сравнения" placeholder="Артикул, название или коллекция"
            value={query} onChange={event => { setQuery(event.target.value); setCandidate(''); }} />
          <select aria-label="Товар для сравнения" value={nextItem ? candidate : ''} onChange={event => setCandidate(event.target.value)}>
            <option value="">{choices.length ? 'Выбрать товар' : 'Нет подходящих товаров'}</option>
            {choices.map(item => <option key={item.article} value={item.article}>{item.article} · {item.name}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" type="submit" disabled={!nextItem}><Plus size={16} /> Добавить</button>
        </form>
        <div className="comparison-table-wrapper" tabIndex={0} aria-label="Таблица сравнения">
          <table className="comparison-table">
            <thead>
              <tr>
                <th scope="col">Параметр</th>
                {items.map(item => {
                  const display = formatProductDisplay(item);
                  const { mainPhoto } = classifyProductImages(item, baseUrl);
                  const price = Number(getProductPrice(item));
                  return (
                    <th scope="col" key={item.article}>
                      <div className="compare-header-product">
                        {items.length > 1 && <button type="button" className="compare-remove"
                          aria-label={`Убрать ${item.article} из сравнения`}
                          onClick={() => setItems(current => current.filter(product => product.article !== item.article))}><X size={16} /></button>}
                        <img className="compare-th-img" src={mainPhoto} alt="" loading="lazy" />
                        <span className="compare-th-art">Арт. {item.article}</span>
                        <strong className="compare-th-title">{display.title}</strong>
                        {display.subtitle && <span className="compare-th-sub">{display.subtitle}</span>}
                        <span className="compare-th-price">{price > 0 ? `${price.toLocaleString('ru-RU')} ${item.currency || '₸'}` : 'По запросу'}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {fields.map(([label, field]) => (
                <tr key={field}>
                  <th scope="row">{label}</th>
                  {items.map(item => <td key={item.article}>{item[field] || '—'}</td>)}
                </tr>
              ))}
              {showStock && <tr>
                <th scope="row">{activeWarehouse ? `Наличие · ${activeWarehouse.name}` : 'Наличие на складе'}</th>
                {items.map(item => {
                  const stock = getStockForSku?.(item.article);
                  return <td key={item.article}>{stock?.status === 'in_stock' ? `${stock.quantity} шт.` : 'Под заказ'}</td>;
                })}
              </tr>}
              <tr>
                <th scope="row">Карточка товара</th>
                {items.map(item => <td key={item.article}><button type="button" className="btn btn-outline btn-sm"
                  onClick={() => { closeComparisonModal(); openProductModal(item); }}>Открыть <ArrowRight size={14} /></button></td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ProductComparisonModal() {
  const { comparisonItems } = useApp();
  return comparisonItems?.length ? <Comparison key={comparisonItems.map(item => item.article).join('|')} initialItems={comparisonItems} /> : null;
}
