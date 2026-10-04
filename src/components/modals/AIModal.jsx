import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Sparkles, Check, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export const AIModal = () => {
  const { isAIModalOpen, closeAIModal, navigateTo, openPartnerModal } = useApp();
  const [targetType, setTargetType] = useState('kitchen');
  const [mountingType, setMountingType] = useState('deck');
  const [specialNeed, setSpecialNeed] = useState('filter');
  const [isCalculated, setIsCalculated] = useState(false);

  if (!isAIModalOpen) return null;

  const handleCalculate = () => {
    setIsCalculated(true);
  };

  const getRecommendation = () => {
    if (targetType === 'kitchen') {
      return {
        category: 'Кухонные смесители LAUTE',
        features: 'Рекомендуется модель с высоким поворотным изливом и дополнительным каналом под питьевой фильтр. Керамический картридж обеспечивает плавную регулировку.',
        route: 'catalog'
      };
    }
    if (targetType === 'bath') {
      return {
        category: 'Смесители для ванны и раковины LAUTE',
        features: 'Для компактных санузлов оптимален универсальный смеситель с длинным изливом 300–400 мм; для раздельных зон — монолитные настенные смесители для ванны и смесители для раковины.',
        route: 'catalog'
      };
    }
    if (targetType === 'shower') {
      return {
        category: 'Душевые системы и гарнитуры LAUTE',
        features: 'Душевая стойка с регулировкой высоты (850–1250 мм) и верхним тропическим душем с форсунками лёгкой очистки от известкового налёта.',
        route: 'catalog'
      };
    }
    return {
      category: 'Комплектация строительных объектов сантехникой LAUTE',
      features: 'Широкая номенклатура смесителей и комплектующих для массового строительства и гостиничных объектов с оптимизированной себестоимостью.',
      route: 'partners'
    };
  };

  const rec = getRecommendation();

  return (
    <div className="modal-overlay" onClick={closeAIModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeAIModal} aria-label="Закрыть">
          <X size={20} />
        </button>

        <div className="modal-header">
          <div className="modal-category-tag">
            <Sparkles size={16} />
            <span>Интерактивный консультант</span>
          </div>
          <h3 className="modal-title">Помощь в подборе оборудования LAUTE</h3>
          <p className="modal-subtitle">
            Уточните параметры вашего проекта для выбора оптимальной серии и конфигурации из каталога производителя.
          </p>
        </div>

        {/* Step 1: Destination */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">1. Назначение продукции:</label>
          <div className="chips-grid">
            <button
              type="button"
              className={`chip-btn ${targetType === 'kitchen' ? 'active' : ''}`}
              onClick={() => { setTargetType('kitchen'); setIsCalculated(false); }}
            >
              Кухня / Мойка
            </button>
            <button
              type="button"
              className={`chip-btn ${targetType === 'bath' ? 'active' : ''}`}
              onClick={() => { setTargetType('bath'); setIsCalculated(false); }}
            >
              Ванная комната
            </button>
            <button
              type="button"
              className={`chip-btn ${targetType === 'shower' ? 'active' : ''}`}
              onClick={() => { setTargetType('shower'); setIsCalculated(false); }}
            >
              Душевая зона
            </button>
            <button
              type="button"
              className={`chip-btn ${targetType === 'contract' ? 'active' : ''}`}
              onClick={() => { setTargetType('contract'); setIsCalculated(false); }}
            >
              Объект / Опт
            </button>
          </div>
        </div>

        {/* Step 2: Mounting */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">2. Способ монтажа:</label>
          <div className="chips-grid">
            <button
              type="button"
              className={`chip-btn ${mountingType === 'deck' ? 'active' : ''}`}
              onClick={() => { setMountingType('deck'); setIsCalculated(false); }}
            >
              На раковину / мойку
            </button>
            <button
              type="button"
              className={`chip-btn ${mountingType === 'wall' ? 'active' : ''}`}
              onClick={() => { setMountingType('wall'); setIsCalculated(false); }}
            >
              Настенный монтаж
            </button>
            <button
              type="button"
              className={`chip-btn ${mountingType === 'concealed' ? 'active' : ''}`}
              onClick={() => { setMountingType('concealed'); setIsCalculated(false); }}
            >
              Встраиваемый / скрытый
            </button>
          </div>
        </div>

        {/* Step 3: Special requirement */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label">3. Дополнительные требования:</label>
          <div className="chips-grid">
            <button
              type="button"
              className={`chip-btn ${specialNeed === 'filter' ? 'active' : ''}`}
              onClick={() => { setSpecialNeed('filter'); setIsCalculated(false); }}
            >
              Подключение фильтра
            </button>
            <button
              type="button"
              className={`chip-btn ${specialNeed === 'flex' ? 'active' : ''}`}
              onClick={() => { setSpecialNeed('flex'); setIsCalculated(false); }}
            >
              Гибкий излив / Лейка
            </button>
            <button
              type="button"
              className={`chip-btn ${specialNeed === 'budget' ? 'active' : ''}`}
              onClick={() => { setSpecialNeed('budget'); setIsCalculated(false); }}
            >
              Оптимальная цена
            </button>
          </div>
        </div>

        {!isCalculated ? (
          <button type="button" className="btn btn-primary btn-full" onClick={handleCalculate}>
            <span>Подобрать подходящие серии</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <div className="ai-result-box">
            <h4 className="rec-title">{rec.category}</h4>
            <p className="rec-desc">{rec.features}</p>
            <div className="rec-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  closeAIModal();
                  navigateTo(rec.route);
                }}
              >
                <span>Перейти в каталог</span>
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  closeAIModal();
                  openPartnerModal();
                }}
              >
                <span>Запросить спецификацию у менеджера</span>
              </button>
            </div>
          </div>
        )}

        <div className="modal-honest-footer">
          <HelpCircle size={14} />
          <span>
            Подбор основан на проверенных характеристиках номенклатуры LAUTE. Для детального согласования проектных чертежей и сертификатов обратитесь к региональному менеджеру.
          </span>
        </div>
      </div>
    </div>
  );
};
