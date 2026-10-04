import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Sparkles, Check, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

export const AIModal = () => {
  const { isAIModalOpen, closeAIModal, t, openPartnerModal } = useApp();
  const [selectedType, setSelectedType] = useState(0);
  const [selectedSpec, setSelectedSpec] = useState(0);
  const [isCalculated, setIsCalculated] = useState(false);

  if (!isAIModalOpen) return null;

  const modalT = t.modals.aiModal;

  const recommendations = [
    {
      series: 'LAUTE Pro-Line Architectural',
      model: 'LT-ARC-302 Faucet System',
      badge: 'Рекомендуемое решение',
      specs: 'Латунный корпус CW617N / Керамический картридж 35мм / Аэратор Neoperl'
    },
    {
      series: 'LAUTE Contract Termo',
      model: 'LT-TRM-880 Thermostatic Unit',
      badge: 'Высокая износостойкость',
      specs: 'Защита от ожогов 38°C / Скрытый монтаж / 100% гидроиспытания'
    }
  ];

  return (
    <div className="modal-overlay" onClick={closeAIModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeAIModal} aria-label={t.modals.close}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#38BDF8', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '8px' }}>
            <Sparkles size={16} />
            <span>AI MATCHING ENGINE</span>
          </div>
          <h3 className="modal-title">{modalT.title}</h3>
          <p className="modal-subtitle">{modalT.subtitle}</p>
        </div>

        {/* Step 1: Select Type */}
        <div style={{ marginBottom: '20px' }}>
          <label className="form-label">{modalT.step1}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {modalT.options1.map((opt, i) => (
              <button
                key={i}
                type="button"
                className={`btn btn-sm ${selectedType === i ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setSelectedType(i); setIsCalculated(false); }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Key Specs */}
        <div style={{ marginBottom: '24px' }}>
          <label className="form-label">{modalT.step2}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {modalT.options2.map((opt, i) => (
              <button
                key={i}
                type="button"
                className={`btn btn-sm ${selectedSpec === i ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setSelectedSpec(i); setIsCalculated(false); }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        {!isCalculated ? (
          <button
            className="btn btn-primary"
            onClick={() => setIsCalculated(true)}
            style={{ width: '100%', marginBottom: '16px' }}
          >
            <Cpu size={16} />
            <span>Сформировать подборку по номенклатуре LAUTE</span>
          </button>
        ) : (
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-medium)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ color: '#38BDF8', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '12px' }}>
              {modalT.resultTitle}
            </div>

            {recommendations.map((rec, idx) => (
              <div key={idx} style={{ padding: '12px 0', borderBottom: idx === 0 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ color: '#FFFFFF', fontSize: '0.9375rem' }}>{rec.model}</strong>
                  <span style={{ fontSize: '0.6875rem', color: '#38BDF8', background: 'rgba(56,189,248,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                    {rec.badge}
                  </span>
                </div>
                <div style={{ color: '#94A3B8', fontSize: '0.75rem', marginBottom: '4px' }}>{rec.series}</div>
                <div style={{ color: '#CBD5E1', fontSize: '0.75rem' }}>{rec.specs}</div>
              </div>
            ))}

            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => { closeAIModal(); openPartnerModal(); }}
                style={{ flex: 1 }}
              >
                <span>Запросить спецификацию</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#64748B' }}>
          <ShieldCheck size={14} color="#38BDF8" />
          <span>{modalT.disclaimer}</span>
        </div>
      </div>
    </div>
  );
};
