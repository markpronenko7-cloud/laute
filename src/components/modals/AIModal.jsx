import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Sparkles, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export const AIModal = () => {
  const { isAIModalOpen, closeAIModal, navigateTo, openPartnerModal, lang, t } = useApp();
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
        category: lang === 'kz' ? 'LAUTE асүй араластырғыштары' : lang === 'en' ? 'LAUTE Kitchen Mixers' : 'Кухонные смесители LAUTE',
        features: lang === 'kz' ? 'Биік бұрылмалы шүмегі және ауыз су сүзгісіне арналған қосымша арнасы бар модель ұсынылады. Керамикалық картридж бірқалыпты реттеуді қамтамасыз етеді.' : lang === 'en' ? 'A model with a high swivel spout and an integrated drinking filter channel is recommended. Ceramic disc cartridge ensures smooth operation.' : 'Рекомендуется модель с высоким поворотным изливом и дополнительным каналом под питьевой фильтр. Керамический картридж обеспечивает плавную регулировку.',
        route: 'catalog'
      };
    }
    if (targetType === 'bath') {
      return {
        category: lang === 'kz' ? 'LAUTE ванна мен қолжуғышқа арналған араластырғыштар' : lang === 'en' ? 'LAUTE Bath & Basin Mixers' : 'Смесители для ванны и раковины LAUTE',
        features: lang === 'kz' ? 'Ықшам санузелдер үшін ұзын 300–400 мм шүмегі бар әмбебап араластырғыш оңтайлы; бөлек аймақтар үшін — қабырғаға орнатылатын монолитті ванна араластырғыштары мен раковина араластырғыштары.' : lang === 'en' ? 'For compact bathrooms, universal mixers with 300-400 mm spout are ideal; for separated zones, wall-mounted monolithic bath mixers and basin taps.' : 'Для компактных санузлов оптимален универсальный смеситель с длинным изливом 300–400 мм; для раздельных зон — монолитные настенные смесители для ванны и смесители для раковины.',
        route: 'catalog'
      };
    }
    if (targetType === 'shower') {
      return {
        category: lang === 'kz' ? 'LAUTE душ жүйелері мен гарнитурлары' : lang === 'en' ? 'LAUTE Shower Systems & Sets' : 'Душевые системы и гарнитуры LAUTE',
        features: lang === 'kz' ? 'Биіктігі реттелетін (850–1250 мм) душ бағаны және әк қағынан оңай тазаланатын форсункалары бар үстіңгі тропикалық душ.' : lang === 'en' ? 'Shower column with height adjustment (850-1250 mm) and overhead rain shower with easy-clean silicone nozzles.' : 'Душевая стойка с регулировкой высоты (850–1250 мм) и верхним тропическим душем с форсунками лёгкой очистки от известкового налёта.',
        route: 'catalog'
      };
    }
    return {
      category: lang === 'kz' ? 'Құрылыс нысандарын LAUTE сантехникасымен жасақтау' : lang === 'en' ? 'Project Specification with LAUTE Fixtures' : 'Комплектация строительных объектов сантехникой LAUTE',
      features: lang === 'kz' ? 'Оңтайландырылған өзіндік құны бар жаппай құрылыс және қонақүй нысандарына арналған араластырғыштар мен бөлшектердің кең номенклатурасы.' : lang === 'en' ? 'Broad nomenclature of mixers and components optimized for mass residential developments and hospitality projects.' : 'Широкая номенклатура смесителей и комплектующих для массового строительства и гостиничных объектов с оптимизированной себестоимостью.',
      route: 'partners'
    };
  };

  const rec = getRecommendation();
  const aiT = t.modals?.ai || {};

  return (
    <div className="modal-overlay" onClick={closeAIModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeAIModal} aria-label={t.modals?.close || 'Закрыть'}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <div className="modal-category-tag">
            <Sparkles size={16} />
            <span>{lang === 'kz' ? 'Интерактивті кеңесші' : lang === 'en' ? 'Interactive Assistant' : 'Интерактивный консультант'}</span>
          </div>
          <h3 className="modal-title">{aiT.title || 'Помощь в подборе оборудования LAUTE'}</h3>
          <p className="modal-subtitle">
            {aiT.subtitle || 'Уточните параметры вашего проекта для выбора оптимальной серии и конфигурации из каталога производителя.'}
          </p>
        </div>

        {/* Step 1: Destination */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">{lang === 'kz' ? '1. Өнімнің мақсаты:' : lang === 'en' ? '1. Product application:' : '1. Назначение продукции:'}</label>
          <div className="chips-grid">
            <button
              type="button"
              className={`chip-btn ${targetType === 'kitchen' ? 'active' : ''}`}
              onClick={() => { setTargetType('kitchen'); setIsCalculated(false); }}
            >
              {lang === 'kz' ? 'Асүй / Жуғыш' : lang === 'en' ? 'Kitchen / Sink' : 'Кухня / Мойка'}
            </button>
            <button
              type="button"
              className={`chip-btn ${targetType === 'bath' ? 'active' : ''}`}
              onClick={() => { setTargetType('bath'); setIsCalculated(false); }}
            >
              {lang === 'kz' ? 'Жуынатын бөлме' : lang === 'en' ? 'Bathroom' : 'Ванная комната'}
            </button>
            <button
              type="button"
              className={`chip-btn ${targetType === 'shower' ? 'active' : ''}`}
              onClick={() => { setTargetType('shower'); setIsCalculated(false); }}
            >
              {lang === 'kz' ? 'Душ аймағы' : lang === 'en' ? 'Shower Area' : 'Душевая зона'}
            </button>
            <button
              type="button"
              className={`chip-btn ${targetType === 'contract' ? 'active' : ''}`}
              onClick={() => { setTargetType('contract'); setIsCalculated(false); }}
            >
              {lang === 'kz' ? 'Нысан / Көтерме' : lang === 'en' ? 'Project / Wholesale' : 'Объект / Опт'}
            </button>
          </div>
        </div>

        {/* Step 2: Mounting */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">{lang === 'kz' ? '2. Монтаждау тәсілі:' : lang === 'en' ? '2. Mounting method:' : '2. Способ монтажа:'}</label>
          <div className="chips-grid">
            <button
              type="button"
              className={`chip-btn ${mountingType === 'deck' ? 'active' : ''}`}
              onClick={() => { setMountingType('deck'); setIsCalculated(false); }}
            >
              {lang === 'kz' ? 'Жуғышқа / бортқа' : lang === 'en' ? 'Deck / Rim Mounted' : 'На раковину / мойку'}
            </button>
            <button
              type="button"
              className={`chip-btn ${mountingType === 'wall' ? 'active' : ''}`}
              onClick={() => { setMountingType('wall'); setIsCalculated(false); }}
            >
              {lang === 'kz' ? 'Қабырғалық орнату' : lang === 'en' ? 'Wall Mounted' : 'Настенный монтаж'}
            </button>
            <button
              type="button"
              className={`chip-btn ${mountingType === 'concealed' ? 'active' : ''}`}
              onClick={() => { setMountingType('concealed'); setIsCalculated(false); }}
            >
              {lang === 'kz' ? 'Кіріктірілетін / жасырын' : lang === 'en' ? 'Concealed / Built-in' : 'Встраиваемый / скрытый'}
            </button>
          </div>
        </div>

        {/* Step 3: Special requirement */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label">{lang === 'kz' ? '3. Қосымша талаптар:' : lang === 'en' ? '3. Additional options:' : '3. Дополнительные требования:'}</label>
          <div className="chips-grid">
            <button
              type="button"
              className={`chip-btn ${specialNeed === 'filter' ? 'active' : ''}`}
              onClick={() => { setSpecialNeed('filter'); setIsCalculated(false); }}
            >
              {lang === 'kz' ? 'Сүзгіні қосу' : lang === 'en' ? 'Filter connection' : 'Подключение фильтра'}
            </button>
            <button
              type="button"
              className={`chip-btn ${specialNeed === 'flex' ? 'active' : ''}`}
              onClick={() => { setSpecialNeed('flex'); setIsCalculated(false); }}
            >
              {lang === 'kz' ? 'Икемді шүмек / Лейка' : lang === 'en' ? 'Flexible spout / spray' : 'Гибкий излив / Лейка'}
            </button>
            <button
              type="button"
              className={`chip-btn ${specialNeed === 'budget' ? 'active' : ''}`}
              onClick={() => { setSpecialNeed('budget'); setIsCalculated(false); }}
            >
              {lang === 'kz' ? 'Оңтайлы баға' : lang === 'en' ? 'Cost effective' : 'Оптимальная цена'}
            </button>
          </div>
        </div>

        {!isCalculated ? (
          <button type="button" className="btn btn-primary btn-full" onClick={handleCalculate}>
            <span>{lang === 'kz' ? 'Сәйкес серияларды таңдау' : lang === 'en' ? 'Find matching series' : 'Подобрать подходящие серии'}</span>
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
                <span>{lang === 'kz' ? 'Каталогқа өту' : lang === 'en' ? 'Go to Catalog' : 'Перейти в каталог'}</span>
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
                <span>{lang === 'kz' ? 'Менеджерден спецификация сұрау' : lang === 'en' ? 'Request specification from manager' : 'Запросить спецификацию у менеджера'}</span>
              </button>
            </div>
          </div>
        )}

        <div className="modal-honest-footer">
          <div className="honest-badge">
            <ShieldCheck size={14} />
            <span>{lang === 'kz' ? 'Ресми зауыттық техникалық деректер' : lang === 'en' ? 'Official factory specifications' : 'Официальные заводские технические данные'}</span>
          </div>
          <p>
            {lang === 'kz' ? 'Барлық сипаттамалар зауыттың ресми номенклатуралық төлқұжаттарына сәйкес келеді.' : lang === 'en' ? 'All specifications conform to official factory technical datasheets.' : 'Все характеристики соответствуют официальным паспортам номенклатуры завода.'}
          </p>
        </div>
      </div>
    </div>
  );
};
