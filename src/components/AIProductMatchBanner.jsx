import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowRight, SlidersHorizontal, CheckCircle2, ShieldCheck } from 'lucide-react';

export const AIProductMatchBanner = () => {
  const { openAIModal, t } = useApp();
  const h = t.home || {};

  return (
    <section className="ai-match-strip-section" id="ai-selector">
      <div className="container">
        <div className="ai-match-glass-card reveal-on-scroll">
          <div className="ai-match-glow-layer" aria-hidden="true"></div>
          
          <div className="ai-match-content-grid">
            <div className="ai-match-info-col">
              <div className="ai-match-badge-wrap">
                <span className="ai-match-badge">
                  <Sparkles size={14} className="ai-badge-sparkle" />
                  <span>{h.aiBannerBadge || 'ИНТЕЛЛЕКТУАЛЬНЫЙ ПОДБОР LAUTE'}</span>
                </span>
              </div>

              <h2 className="ai-match-title">
                {h.aiBannerTitle || 'Подобрать продукт с AI'}
              </h2>

              <p className="ai-match-desc">
                {h.aiBannerDesc || 'Ответьте на несколько вопросов — AI поможет подобрать подходящее решение LAUTE.'}
              </p>

              <div className="ai-match-tags-row">
                <div className="ai-match-pill">
                  <SlidersHorizontal size={13} />
                  <span>Подбор по параметрам монтажа</span>
                </div>
                <div className="ai-match-pill">
                  <CheckCircle2 size={13} />
                  <span>Решения для кухни, ванной и душа</span>
                </div>
                <div className="ai-match-pill">
                  <ShieldCheck size={13} />
                  <span>Заводские паспорта LAUTE</span>
                </div>
              </div>
            </div>

            <div className="ai-match-action-col">
              <button
                type="button"
                className="btn btn-ai-interactive"
                onClick={openAIModal}
                id="btn-start-ai-match"
              >
                <div className="btn-ai-icon-bubble">
                  <Sparkles size={18} />
                </div>
                <span className="btn-ai-text">{h.aiBannerBtn || 'Начать подбор'}</span>
                <ArrowRight size={18} className="btn-ai-arrow" />
              </button>
              <span className="ai-action-caption">
                Занимает менее 1 минуты • Без регистрации
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
