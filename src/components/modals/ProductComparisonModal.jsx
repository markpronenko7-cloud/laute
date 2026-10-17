import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Scale, Check, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { classifyProductImages, formatProductDisplay } from '../../utils/imageHelper';
export const ProductComparisonModal = () => {
  const { comparisonItems, closeComparisonModal, openProductModal, openPartnerModal, getStockForSku, activeWarehouse } = useApp();

  if (!comparisonItems || comparisonItems.length < 2) return null;

  const [itemA, itemB] = comparisonItems;
  const baseUrl = import.meta.env.BASE_URL;

  const getImgUrl = (path) => {
    if (!path) return `${baseUrl}laute-logo.png`;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const clean = path.replace(/^\//, '');
    return `${baseUrl}${clean}`;
  };

  // Generate intelligent comparison advantages
  const getAdvantageA = () => {
    if (itemA.price < itemB.price) {
      return 'Более привлекательная цена, экономия бюджета при закупке партий';
    }
    if (itemA.specs?.includes('фильтр')) {
      return 'Подключение питьевого фильтра 2-в-1, отсутствие необходимости врезать второй кран';
    }
    return 'Компактные размеры, оптимизирован для ежедневного активного использования';
  };

  const getAdvantageB = () => {
    if (itemB.price < itemA.price) {
      return 'Выгодная цена, оптимальный выбор по соотношению функционал/стоимость';
    }
    if (itemB.specs?.includes('фильтр') || itemB.specs?.includes('гибкий')) {
      return 'Расширенный функционал излива и профессиональные режимы струи';
    }
    return 'Увеличенный вылет излива, комфорт для глубоких моек и габаритной посуды';
  };

  const stockA = getStockForSku ? getStockForSku(itemA.article) : null;
  const stockB = getStockForSku ? getStockForSku(itemB.article) : null;

  const getStockDisplay = (item, stock) => {
    if (stock && stock.status === 'in_stock') {
      return { inStock: true, text: `${stock.quantity} шт.` };
    }
    const citiesWithStock = Object.entries(item.cityStock || {}).filter(([_, q]) => q > 0);
    if (citiesWithStock.length > 0) {
      const [cityName, qty] = citiesWithStock[0];
      return { inStock: true, text: `${qty} шт. (${cityName})` };
    }
    return { inStock: false, text: 'Под заказ' };
  };

  const dispStockA = getStockDisplay(itemA, stockA);
  const dispStockB = getStockDisplay(itemB, stockB);

  return (
    <div className="modal-overlay" onClick={closeComparisonModal}>
      <div 
        className="modal-content comparison-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '920px', width: '95%' }}
      >
        <button className="modal-close-btn" onClick={closeComparisonModal} aria-label="Закрыть">
          <X size={20} />
        </button>

        <div className="modal-header">
          <div className="modal-category-tag" style={{ background: 'rgba(234, 88, 12, 0.1)', color: '#EA580C', border: '1px solid rgba(234, 88, 12, 0.25)' }}>
            <Scale size={15} />
            <span>Инженерное сравнение моделей LAUTE</span>
          </div>
          <h2 className="modal-title" style={{ fontSize: '1.4rem' }}>
            Сравнение характеристик и параметров
          </h2>
          <p className="modal-subtitle">
            Сопоставление двух моделей по ключевым критериям европейского стандарта сантехники LAUTE.
          </p>
        </div>

        {/* Side by side comparison cards */}
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th style={{ width: '24%' }}>Параметр</th>
                <th style={{ width: '38%' }}>
                  {(() => {
                    const dispA = formatProductDisplay(itemA);
                    const imgA = classifyProductImages(itemA, baseUrl);
                    return (
                      <div className="compare-header-product">
                        <img 
                          src={imgA.mainPhoto} 
                          alt={dispA.title} 
                          className="compare-th-img" 
                          onError={(e) => { e.target.src = `${baseUrl}images/cat_laute_brand.jpg`; }}
                        />
                        <span className="compare-th-art">Арт. {itemA.article}</span>
                        <strong className="compare-th-title">{dispA.title}</strong>
                        {dispA.subtitle && <span className="compare-th-sub">{dispA.subtitle}</span>}
                        <div className="compare-th-price">{itemA.price ? `${itemA.price.toLocaleString('ru-RU')} ${itemA.currency || '₸'}` : 'По запросу'}</div>
                      </div>
                    );
                  })()}
                </th>
                <th style={{ width: '38%' }}>
                  {(() => {
                    const dispB = formatProductDisplay(itemB);
                    const imgB = classifyProductImages(itemB, baseUrl);
                    return (
                      <div className="compare-header-product">
                        <img 
                          src={imgB.mainPhoto} 
                          alt={dispB.title} 
                          className="compare-th-img" 
                          onError={(e) => { e.target.src = `${baseUrl}images/cat_laute_brand.jpg`; }}
                        />
                        <span className="compare-th-art">Арт. {itemB.article}</span>
                        <strong className="compare-th-title">{dispB.title}</strong>
                        {dispB.subtitle && <span className="compare-th-sub">{dispB.subtitle}</span>}
                        <div className="compare-th-price">{itemB.price ? `${itemB.price.toLocaleString('ru-RU')} ${itemB.currency || '₸'}` : 'По запросу'}</div>
                      </div>
                    );
                  })()}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="cmp-label">Категория</td>
                <td>{itemA.category}</td>
                <td>{itemB.category}</td>
              </tr>
              <tr>
                <td className="cmp-label">Материал корпуса</td>
                <td><span className="cmp-highlight">Первичная латунь CW617N</span></td>
                <td><span className="cmp-highlight">Первичная латунь CW617N</span></td>
              </tr>
              <tr>
                <td className="cmp-label">Размеры</td>
                <td>{itemA.dimensions || 'Стандартные монтажные размеры'}</td>
                <td>{itemB.dimensions || 'Стандартные монтажные размеры'}</td>
              </tr>
              <tr>
                <td className="cmp-label">Вес / объём</td>
                <td>{itemA.weight} / {itemA.volume}</td>
                <td>{itemB.weight} / {itemB.volume}</td>
              </tr>
              <tr>
                <td className="cmp-label">Ключевые характеристики</td>
                <td>{itemA.specs}</td>
                <td>{itemB.specs}</td>
              </tr>
              <tr>
                <td className="cmp-label">{activeWarehouse ? `Наличие (${activeWarehouse.name})` : 'Наличие на складе'}</td>
                <td>
                  <span className={`stock-badge ${dispStockA.inStock ? 'in' : 'out'}`}>
                    {dispStockA.text}
                  </span>
                </td>
                <td>
                  <span className={`stock-badge ${dispStockB.inStock ? 'in' : 'out'}`}>
                    {dispStockB.text}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="cmp-label">Главное преимущество</td>
                <td><div className="adv-box adv-a"><Check size={14} color="#10B981" /><span>{getAdvantageA()}</span></div></td>
                <td><div className="adv-box adv-b"><Check size={14} color="#10B981" /><span>{getAdvantageB()}</span></div></td>
              </tr>
              <tr className="verdict-row">
                <td className="cmp-label">Рекомендация эксперта</td>
                <td className="verdict-cell">
                  {itemA.price <= itemB.price
                    ? 'Идеально подходит для практичных интерьеров, когда требуется максимум надёжности при разумных затратах.'
                    : 'Рекомендуется для просторных кухонь и пользователей с высокими требованиями к дизайну и функционалу.'}
                </td>
                <td className="verdict-cell">
                  {itemB.price > itemA.price
                    ? 'Премиальное решение с расширенными возможностями (гибкий излив / фильтр питьевой воды).'
                    : 'Оптимальное сочетание бюджета и проверенного европейского ресурса латуни.'}
                </td>
              </tr>
              <tr>
                <td className="cmp-label">Действие</td>
                <td>
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm btn-full"
                    onClick={() => {
                      closeComparisonModal();
                      openProductModal(itemA);
                    }}
                  >
                    Открыть карточку
                  </button>
                </td>
                <td>
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm btn-full"
                    onClick={() => {
                      closeComparisonModal();
                      openProductModal(itemB);
                    }}
                  >
                    Открыть карточку
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
