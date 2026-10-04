import React from 'react';
import { useApp } from '../context/AppContext';
import { Building2, ShieldCheck, Factory, Award, Globe, History, ArrowRight, CheckCircle2 } from 'lucide-react';

export const CompanyPage = () => {
  const { openPartnerModal } = useApp();
  const baseUrl = import.meta.env.BASE_URL;

  const milestones = [
    {
      year: '1998',
      title: 'Основание в Ганновере (Германия)',
      desc: 'Основание производственной компании Paul Frank в Ганновере (Нижняя Саксония). Запуск первых специализированных цехов с упором на надёжность инженерных узлов.'
    },
    {
      year: '2003',
      title: 'Инвестиции в производство смесителей',
      desc: 'Создание специализированного завода смесителей в партнёрстве с производственной группой в провинции Чжэцзян (Вэньчжоу).'
    },
    {
      year: '2005',
      title: 'Открытие представительства и первого склада в Москве',
      desc: 'Выход на рынок СНГ, открытие первого распределительного склада в Москве и формирование сети оптовых поставок.'
    },
    {
      year: '2015',
      title: 'Инженерная стандартизация и контроль качества',
      desc: 'Инвестиции в технологическое переоснащение производственных линий, внедрение строгих регламентов контроля качества на всех циклах выпуска.'
    },
    {
      year: '2016',
      title: 'Запуск линейки сантехники Rainsberg',
      desc: 'Расширение портфеля брендов группы, выпуск серии смесителей Rainsberg, ориентированной на высокий рыночный спрос.'
    },
    {
      year: '2018',
      title: 'Корпорация «Laute LTD» и региональный склад в Сибири',
      desc: 'Создание корпорации Laute LTD в Гонконге, запуск стратегического распределительного хаба в Новосибирске для обеспечения партнёров Сибири и Дальнего Востока.'
    },
    {
      year: '2022',
      title: 'Открытие представительства в Казахстане',
      desc: 'Расширение логистической инфраструктуры в Республике Казахстан, открытие представительства и локального распределения.'
    },
    {
      year: '2024',
      title: 'Международное развитие',
      desc: 'Развитие офисно-складских мощностей и расширение географии дистрибуции сантехнической продукции.'
    }
  ];

  const productionSteps = [
    {
      step: '01',
      title: 'Литьё корпусов смесителей',
      desc: 'Изготовление прочных латунных и металлических отливок с контролем однородности стенок и отсутствия скрытых раковин.',
      image: `${baseUrl}images/prod_casting.png`
    },
    {
      step: '02',
      title: 'Роботизированная механическая обработка',
      desc: 'Точная обработка посадочных резьбовых соединений и каналов картриджа на автоматизированных линиях.',
      image: `${baseUrl}images/prod_machining.png`
    },
    {
      step: '03',
      title: 'Автоматическая полировка',
      desc: 'Многоэтапная полировка поверхностей для достижения идеальной гладкости перед нанесением защитных слоёв.',
      image: `${baseUrl}images/prod_polishing.png`
    },
    {
      step: '04',
      title: 'Контроль отдела ОТК',
      desc: 'Поэтапный контроль геометрии, чистоты обработки и комплектующих на промежуточных участках сборки.',
      image: `${baseUrl}images/prod_qc.png`
    },
    {
      step: '05',
      title: 'Защитные покрытия',
      desc: 'Нанесение стойких защитно-декоративных покрытий (хром, никель, матированные и цветные варианты), устойчивых к бытовой нагрузке.',
      image: `${baseUrl}images/prod_coating.png`
    },
    {
      step: '06',
      title: 'Гидравлические и пневматические испытания',
      desc: 'Проверка каждого собранного смесителя на герметичность давлением воздуха и давлением воды перед упаковкой.',
      image: `${baseUrl}images/prod_testing.png`
    }
  ];

  return (
    <div className="page-wrapper company-page">
      {/* Header */}
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="section-badge">О компании</span>
            <h1 className="page-title">Завод LAUTE и Международный Холдинг</h1>
            <p className="page-subtitle">
              История развития, производственные мощности, подход к качеству и принципы надежного партнерства с 1998 года.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Group Overview */}
      <section className="section bg-light-section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-badge">Портфель брендов</span>
            <h2 className="section-title">Бренды производственной группы</h2>
            <p className="section-desc">
              Продукция группы охватывает различные ценовые сегменты, обеспечивая высокую маржинальность дилерских сетей и стабильное качество для конечных потребителей.
            </p>
          </div>

          <div className="brand-group-grid">
            <div className="brand-card">
              <div className="brand-header">
                <span className="brand-title">LAUTE</span>
                <span className="brand-status">Флагманский бренд</span>
              </div>
              <p className="brand-desc">
                Инженерная сантехника, смесители премиального и дизайн-сегмента, многофункциональные мойки и душевые системы. Упор на долговечность и передовые проектные решения.
              </p>
            </div>

            <div className="brand-card">
              <div className="brand-header">
                <span className="brand-title">OUTE</span>
                <span className="brand-status">Широкий ассортимент</span>
              </div>
              <p className="brand-desc">
                Массовая линейка надежных смесителей и душевых комплектов с высокой популярностью на оптовом рынке РФ и СНГ. Проверенные временем классические и современные модели.
              </p>
            </div>

            <div className="brand-card">
              <div className="brand-header">
                <span className="brand-title">RAINSBERG</span>
                <span className="brand-status">Оптимальный бюджет</span>
              </div>
              <p className="brand-desc">
                Специализированная линейка доступных смесителей со стабильным качеством для комплектации строительных объектов, розничных магазинов и оптовых баз.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Production Technology */}
      <section className="section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-badge">Производственный процесс</span>
            <h2 className="section-title">Производство и контроль качества</h2>
            <p className="section-desc">
              Реальные технологические участки заводского выпуска смесителей LAUTE: от первичного литья корпусов до финальных испытаний на герметичность.
            </p>
          </div>

          <div className="production-steps-grid">
            {productionSteps.map((step) => (
              <div key={step.step} className="prod-step-card">
                <div className="step-media">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="step-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <span className="step-number">{step.step}</span>
                </div>
                <div className="step-body">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="section bg-light-section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-badge">Хронология</span>
            <h2 className="section-title">История развития</h2>
            <p className="section-desc">
              Ключевые этапы становления бренда LAUTE от локального немецкого производства до международного производственно-торгового холдинга.
            </p>
          </div>

          <div className="timeline-container">
            {milestones.map((item, idx) => (
              <div key={item.year} className="timeline-item">
                <div className="timeline-marker">
                  <span className="timeline-year">{item.year}</span>
                </div>
                <div className="timeline-content">
                  <h3 className="timeline-title">{item.title}</h3>
                  <p className="timeline-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box">
            <div className="cta-content">
              <h2>Заинтересованы в прямых поставках с завода LAUTE?</h2>
              <p>Оставьте запрос для обсуждения дилерских условий, логистики и резервирования складских объемов в вашем регионе.</p>
            </div>
            <button type="button" className="btn btn-primary" onClick={openPartnerModal}>
              <span>Связаться с отделом оптовых продаж</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
