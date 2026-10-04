import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight } from 'lucide-react';

export const CompanyPage = () => {
  const { openPartnerModal, lang, t } = useApp();
  const baseUrl = import.meta.env.BASE_URL;
  const cp = t.companyPage || {};

  const milestonesData = [
    {
      year: '1998',
      title: {
        ru: 'Основание в Ганновере (Германия)',
        kz: 'Ганноверде (Германия) құрылуы',
        en: 'Founded in Hanover (Germany)'
      },
      desc: {
        ru: 'Основание производственной компании Paul Frank в Ганновере (Нижняя Саксония). Запуск первых специализированных цехов с упором на надёжность инженерных узлов.',
        kz: 'Ганноверде (Төменгі Саксония) Paul Frank өндірістік компаниясының негізі қаланды. Инженерлік тораптардың сенімділігіне баса назар аударатын алғашқы мамандандырылған цехтардың іске қосылуы.',
        en: 'Establishment of the Paul Frank manufacturing company in Hanover (Lower Saxony). Launch of first specialized workshops focused on plumbing engineering reliability.'
      }
    },
    {
      year: '2003',
      title: {
        ru: 'Инвестиции в производство смесителей',
        kz: 'Араластырғыштар өндірісіне инвестициялар',
        en: 'Investment in Faucet Manufacturing'
      },
      desc: {
        ru: 'Создание специализированного завода смесителей в партнёрстве с производственной группой в провинции Чжэцзян (Вэньчжоу).',
        kz: 'Чжэцзян (Вэньчжоу) провинциясындағы өндірістік топпен серіктестікте мамандандырылған араластырғыштар зауытын құру.',
        en: 'Establishment of specialized mixer factory in partnership with manufacturing group in Zhejiang (Wenzhou).'
      }
    },
    {
      year: '2005',
      title: {
        ru: 'Открытие представительства и первого склада в Москве',
        kz: 'Мәскеуде өкілдік пен алғашқы қойманың ашылуы',
        en: 'Representative Office & First Warehouse in Moscow'
      },
      desc: {
        ru: 'Выход на рынок СНГ, открытие первого распределительного склада в Москве и формирование сети оптовых поставок.',
        kz: 'ТМД нарығына шығу, Мәскеуде алғашқы тарату қоймасын ашу және көтерме жеткізілімдер желісін құру.',
        en: 'Expansion into CIS market, opening of first regional logistics hub in Moscow and establishing wholesale distribution.'
      }
    },
    {
      year: '2015',
      title: {
        ru: 'Инженерная стандартизация и контроль качества',
        kz: 'Инженерлік стандарттау және сапаны бақылау',
        en: 'Engineering Standardization & Quality Control'
      },
      desc: {
        ru: 'Инвестиции в технологическое переоснащение производственных линий, внедрение строгих регламентов контроля качества на всех циклах выпуска.',
        kz: 'Өндірістік желілерді технологиялық қайта жарақтандыруға инвестициялар, шығарылымның барлық циклдерінде сапаны бақылаудың қатаң регламенттерін енгізу.',
        en: 'Investment in manufacturing line upgrades and strict QC protocols across all production cycles.'
      }
    },
    {
      year: '2016',
      title: {
        ru: 'Запуск линейки сантехники Rainsberg',
        kz: 'Rainsberg сантехника желісін іске қосу',
        en: 'Launch of Rainsberg Sanitary Line'
      },
      desc: {
        ru: 'Расширение портфеля брендов группы, выпуск серии смесителей Rainsberg, ориентированной на высокий рыночный спрос.',
        kz: 'Топ брендтерінің портфелін кеңейту, жоғары нарықтық сұранысқа бағытталған Rainsberg араластырғыштар сериясын шығару.',
        en: 'Expansion of brand portfolio, launch of high-demand Rainsberg faucet line.'
      }
    },
    {
      year: '2018',
      title: {
        ru: 'Корпорация «Laute LTD» и региональный склад в Сибири',
        kz: '«Laute LTD» корпорациясы және Сібірдегі өңірлік қойма',
        en: 'Laute LTD Corporation & Siberian Hub'
      },
      desc: {
        ru: 'Создание корпорации Laute LTD в Гонконге, запуск стратегического распределительного хаба в Новосибирске для обеспечения партнёров Сибири и Дальнего Востока.',
        kz: 'Гонконгта Laute LTD корпорациясын құру, Сібір және Қиыр Шығыс серіктестерін қамтамасыз ету үшін Новосібірде стратегиялық тарату хабын іске қосу.',
        en: 'Establishment of Laute LTD Corporation in Hong Kong, launch of strategic distribution hub in Novosibirsk for Siberia and Far East partners.'
      }
    },
    {
      year: '2022',
      title: {
        ru: 'Открытие представительства в Казахстане',
        kz: 'Қазақстанда өкілдіктің ашылуы',
        en: 'Representative Office in Kazakhstan'
      },
      desc: {
        ru: 'Расширение логистической инфраструктуры в Республике Казахстан, открытие представительства и локального распределения.',
        kz: 'Қазақстан Республикасында логистикалық инфрақұрылымды кеңейту, өкілдік пен жергілікті тарату орталығын ашу.',
        en: 'Expansion of logistics infrastructure in Kazakhstan, opening representative office and regional distribution hub.'
      }
    },
    {
      year: '2024',
      title: {
        ru: 'Международное развитие',
        kz: 'Халықаралық даму',
        en: 'International Expansion'
      },
      desc: {
        ru: 'Развитие офисно-складских мощностей и расширение географии дистрибуции сантехнической продукции.',
        kz: 'Кеңселік-қоймалық қуаттарды дамыту және сантехникалық өнімдер дистрибуциясының географиясын кеңейту.',
        en: 'Growth of office and warehousing capacity, broadening global distribution of plumbing fixtures.'
      }
    }
  ];

  const productionStepsData = [
    {
      step: '01',
      title: cp.step1Title || 'Литьё корпусов смесителей',
      desc: cp.step1Desc || 'Изготовление прочных латунных и металлических отливок с контролем однородности стенок и отсутствия скрытых раковин.',
      image: `${baseUrl}images/prod_casting.png`
    },
    {
      step: '02',
      title: cp.step2Title || 'Роботизированная механическая обработка',
      desc: cp.step2Desc || 'Точная обработка посадочных резьбовых соединений и каналов картриджа на автоматизированных линиях.',
      image: `${baseUrl}images/prod_machining.png`
    },
    {
      step: '03',
      title: cp.step3Title || 'Автоматическая полировка',
      desc: cp.step3Desc || 'Многоэтапная полировка поверхностей для достижения идеальной гладкости перед нанесением защитных слоёв.',
      image: `${baseUrl}images/prod_polishing.png`
    },
    {
      step: '04',
      title: lang === 'kz' ? 'ТБК бөлімінің бақылауы' : lang === 'en' ? 'QC Department Inspection' : 'Контроль отдела ОТК',
      desc: lang === 'kz' ? 'Құрастырудың аралық учаскелерінде геометрияны, өңдеу тазалығын және бөлшектерді кезең-кезеңімен бақылау.' : lang === 'en' ? 'Step-by-step inspection of geometry, surface finish and components across sub-assembly stages.' : 'Поэтапный контроль геометрии, чистоты обработки и комплектующих на промежуточных участках сборки.',
      image: `${baseUrl}images/prod_qc.png`
    },
    {
      step: '05',
      title: cp.step4Title || 'Защитные покрытия',
      desc: cp.step4Desc || 'Нанесение стойких защитно-декоративных покрытий (хром, никель, матированные и цветные варианты), устойчивых к бытовой нагрузке.',
      image: `${baseUrl}images/prod_coating.png`
    },
    {
      step: '06',
      title: cp.step5Title || 'Гидравлические и пневматические испытания 100%',
      desc: cp.step5Desc || 'Проверка каждого собранного смесителя на герметичность давлением воздуха и давлением воды перед упаковкой.',
      image: `${baseUrl}images/prod_testing.png`
    }
  ];

  return (
    <div className="page-wrapper company-page">
      {/* Header */}
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="section-badge">{cp.badge || 'О компании'}</span>
            <h1 className="page-title">{cp.title || 'Завод LAUTE и Международный Холдинг'}</h1>
            <p className="page-subtitle">
              {cp.subtitle || 'История развития, производственные мощности, подход к качеству и принципы надежного партнерства с 1998 года.'}
            </p>
          </div>
        </div>
      </section>

      {/* Brand Group Overview */}
      <section className="section bg-light-section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-badge">{lang === 'kz' ? 'Брендтер портфелі' : lang === 'en' ? 'Brand Portfolio' : 'Портфель брендов'}</span>
            <h2 className="section-title">{lang === 'kz' ? 'Өндірістік топтың брендтері' : lang === 'en' ? 'Manufacturing Group Brands' : 'Бренды производственной группы'}</h2>
            <p className="section-desc">
              {lang === 'kz' ? 'Топ өнімдері әртүрлі баға сегменттерін қамтиды, дилерлік желілердің жоғары маржиналдылығын және түпкі тұтынушылар үшін тұрақты сапаны қамтамасыз етеді.' : lang === 'en' ? 'The group products cover diverse price segments, ensuring high dealer margin and steady consumer quality.' : 'Продукция группы охватывает различные ценовые сегменты, обеспечивая высокую маржинальность дилерских сетей и стабильное качество для конечных потребителей.'}
            </p>
          </div>

          <div className="brand-group-grid">
            <div className="brand-card">
              <div className="brand-header">
                <span className="brand-title">LAUTE</span>
                <span className="brand-status">{lang === 'kz' ? 'Флагмандық бренд' : lang === 'en' ? 'Flagship Brand' : 'Флагманский бренд'}</span>
              </div>
              <p className="brand-desc">
                {lang === 'kz' ? 'Инженерлік сантехника, премиум және дизайн сегменттегі араластырғыштар, көпфункционалды жуғыштар және душ жүйелері. Төзімділікке және озық жобалық шешімдерге баса назар аудару.' : lang === 'en' ? 'Plumbing engineering, premium and designer mixers, multifunctional sinks and shower systems. Focus on durability and advanced project specifications.' : 'Инженерная сантехника, смесители премиального и дизайн-сегмента, многофункциональные мойки и душевые системы. Упор на долговечность и передовые проектные решения.'}
              </p>
            </div>

            <div className="brand-card">
              <div className="brand-header">
                <span className="brand-title">OUTE</span>
                <span className="brand-status">{lang === 'kz' ? 'Кең ассортимент' : lang === 'en' ? 'Broad Range' : 'Широкий ассортимент'}</span>
              </div>
              <p className="brand-desc">
                {lang === 'kz' ? 'РФ және ТМД көтерме нарығында жоғары танымалдылыққа ие сенімді араластырғыштар мен душ жиынтықтарының жаппай желісі. Уақытпен тексерілген классикалық және заманауи үлгілер.' : lang === 'en' ? 'Mass-market line of reliable mixers and shower sets with high popularity in wholesale markets. Proven classic and contemporary designs.' : 'Массовая линейка надежных смесителей и душевых комплектов с высокой популярностью на оптовом рынке РФ и СНГ. Проверенные временем классические и современные модели.'}
              </p>
            </div>

            <div className="brand-card">
              <div className="brand-header">
                <span className="brand-title">RAINSBERG</span>
                <span className="brand-status">{lang === 'kz' ? 'Оңтайлы бюджет' : lang === 'en' ? 'Optimal Budget' : 'Оптимальный бюджет'}</span>
              </div>
              <p className="brand-desc">
                {lang === 'kz' ? 'Құрылыс нысандарын, бөлшек дүкендерді және көтерме базаларды жасақтау үшін тұрақты сапасы бар қолжетімді араластырғыштардың мамандандырылған желісі.' : lang === 'en' ? 'Specialized line of cost-effective faucets with consistent build quality for developments, retail hardware stores, and wholesale depots.' : 'Специализированная линейка доступных смесителей со стабильным качеством для комплектации строительных объектов, розничных магазинов и оптовых баз.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Production Technology */}
      <section className="section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-badge">{cp.productionTitle || 'Производственный процесс'}</span>
            <h2 className="section-title">{cp.productionTitle || 'Производство и контроль качества'}</h2>
            <p className="section-desc">
              {cp.productionDesc || 'Реальные технологические участки заводского выпуска смесителей LAUTE: от первичного литья корпусов до финальных испытаний на герметичность.'}
            </p>
          </div>

          <div className="production-steps-grid">
            {productionStepsData.map((step) => (
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
            <span className="section-badge">{cp.historyTitle || 'Хронология'}</span>
            <h2 className="section-title">{cp.historyTitle || 'История развития'}</h2>
            <p className="section-desc">
              {cp.historyDesc || 'Ключевые этапы становления бренда LAUTE от локального немецкого производства до международного производственно-торгового холдинга.'}
            </p>
          </div>

          <div className="timeline-container">
            {milestonesData.map((item) => (
              <div key={item.year} className="timeline-item">
                <div className="timeline-marker">
                  <span className="timeline-year">{item.year}</span>
                </div>
                <div className="timeline-content">
                  <h3 className="timeline-title">{item.title[lang] || item.title.ru}</h3>
                  <p className="timeline-desc">{item.desc[lang] || item.desc.ru}</p>
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
              <h2>{cp.ctaTitle || 'Заинтересованы в прямых поставках с завода LAUTE?'}</h2>
              <p>{cp.ctaDesc || 'Оставьте запрос для обсуждения дилерских условий, логистики и резервирования складских объемов в вашем регионе.'}</p>
            </div>
            <button type="button" className="btn btn-primary" onClick={openPartnerModal}>
              <span>{cp.ctaBtn || 'Связаться с отделом оптовых продаж'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
