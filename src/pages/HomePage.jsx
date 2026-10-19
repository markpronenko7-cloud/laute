import { EditableNode, EditableSection, NativeSectionGate } from '../components/builder/NativeContent';
import { SiteAction } from '../components/SiteAction';
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowRight,
  Users,
  Store,
  HardHat,
  Wrench,
  PhoneCall,
  Mail,
  CheckCircle2,
  Clock,
  Headphones,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

import { HeroCarousel } from '../components/HeroCarousel';
import { CollectionsSection } from '../components/CollectionsSection';
import { withBrandWord } from '../utils/brandFormatter';
import { submitLeadInquiry } from '../services/adminApi';

export const HomePage = ({ heroSlidesOverride } = {}) => {
  const { navigateTo, openPartnerModal, openServiceModal, startAIPartnerAnalysis, t, siteContent, lang } = useApp();
  const baseUrl = import.meta.env.BASE_URL;

  const [leadForm, setLeadForm] = useState({
    name: '',
    company: '',
    phone: '',
    city: ''
  });
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitLeadInquiry({
        source: 'home_b2b_lead',
        ...leadForm
      });
    } catch (err) {
      window.alert(err.message || 'Не удалось отправить заявку. Попробуйте ещё раз.');
      return;
    }
    setLeadSubmitted(true);
  };

  const h = t.home || {};

  return (
    <div className="page-wrapper home-page-transformed">
      {/* 1. FULL-SCREEN HERO CAROUSEL — 5 СЛАЙДОВ (3 СЕКУНДЫ АВТОМАТИЧЕСКАЯ СМЕНА) */}
      <NativeSectionGate sectionKey="home-hero"><HeroCarousel slidesOverride={heroSlidesOverride}/></NativeSectionGate>

      {/* 2. ФОТОГРАФИЧЕСКАЯ ГАЛЕРЕЯ «КОЛЛЕКЦИИ LAUTE» */}
      <NativeSectionGate sectionKey="home-collections"><CollectionsSection /></NativeSectionGate>

      {/* 2.5. МАТЕРИАЛЫ И ТЕХНОЛОГИИ LAUTE — ИНЖЕНЕРНАЯ НАДЕЖНОСТЬ В КАЖДОЙ ДЕТАЛИ */}
      <EditableSection sectionKey="home-technologies" className="section visual-technologies-section" id="technologies">
        <div className="container">
          <div className="section-title-wrap reveal-on-scroll">
            <EditableNode as="span" editKey={"homepage-1"} kind="text" className="section-badge badge-refined">
              {(lang !== 'ru' && h.techBadge) ? h.techBadge : (siteContent?.homeBlocks?.materials?.badge || h.techBadge || 'ТЕХНОЛОГИИ & МАТЕРИАЛЫ')}
            </EditableNode>
            <EditableNode as="h2" editKey={"homepage-2"} kind="text" className="section-title visual-tech-title">
              {withBrandWord((lang !== 'ru' && h.techTitle) ? h.techTitle : (siteContent?.homeBlocks?.materials?.title || h.techTitle || 'Инженерная надежность в каждой детали'))}
            </EditableNode>
            <EditableNode as="p" editKey={"homepage-3"} kind="text" className="section-desc visual-tech-desc">
              {withBrandWord((lang !== 'ru' && h.techDesc) ? h.techDesc : (siteContent?.homeBlocks?.materials?.desc || h.techDesc || 'Никаких компромиссов: первичная конструкционная латунь, пищевая нержавеющая сталь SUS304, ЭКО алюминий, испанские картриджи Sedal и молекулярное вакуумное PVD-осаждение.'))}
            </EditableNode>
          </div>

          <div className="technologies-editorial-grid">
            {/* 1. Испанские картриджи Sedal — КРУПНЫЙ ВИЗУАЛЬНЫЙ ПЛАН (Featured Macro) */}
            <div className="tech-card tech-card-featured reveal-on-scroll">
              <div className="tech-media-frame">
                <EditableNode as="img" editKey={"homepage-4"} kind="image"
                  src={`${baseUrl}images/sedal_cartridge_macro.jpg`}
                  alt="Испанский керамический картридж Sedal для смесителей LAUTE"
                  className="tech-macro-img"
                  loading="lazy"
                />
                <div className="tech-media-overlay"></div>
                <div className="tech-floating-tag">
                  <EditableNode as="span" editKey={"homepage-5"} kind="text" className="tech-spec-pill">SEDAL GROUP · SPAIN · EST. 1974</EditableNode>
                </div>
              </div>
              <div className="tech-card-body">
                <div className="tech-card-header">
                  <span className="tech-num">01</span>
                  <EditableNode as="span" editKey={"homepage-6"} kind="text" className="tech-kicker">ЕВРОПЕЙСКИЙ СТАНДАРТ EN 817</EditableNode>
                </div>
                <EditableNode as="h3" editKey={"homepage-7"} kind="text" className="tech-heading">{h.sedalTitle || 'Испанские картриджи Sedal'}</EditableNode>
                <EditableNode as="p" editKey={"homepage-8"} kind="text" className="tech-text">
                  {h.sedalDesc || 'Керамические картриджи от европейского производителя Sedal (Испания, осн. 1974). Диски из спеченной керамики с микрозеркальной алмазной полировкой, тестирование до 500 000 рабочих циклов по европейскому стандарту EN 817. Плавный ход рычага и термостойкость до 90°C.'}
                </EditableNode>
                <div className="tech-spec-bullets">
                  <div className="tech-spec-item">
                    <span className="spec-item-bullet">•</span>
                    <EditableNode as="span" editKey={"homepage-9"} kind="text">{h.sedalBullet1 || 'Диски из оксида алюминия Al₂O₃ с алмазной притиркой'}</EditableNode>
                  </div>
                  <div className="tech-spec-item">
                    <span className="spec-item-bullet">•</span>
                    <EditableNode as="span" editKey={"homepage-10"} kind="text">{h.sedalBullet2 || 'Ресурс 500 000 циклов (EN 817) без капель и протечек'}</EditableNode>
                  </div>
                  <div className="tech-spec-item">
                    <span className="spec-item-bullet">•</span>
                    <EditableNode as="span" editKey={"homepage-11"} kind="text">{h.sedalBullet3 || 'Термостойкость до 90°C и гидротест 16 бар'}</EditableNode>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Сверхпрочные эксцентрики из латуни А+ */}
            <div className="tech-card tech-card-standard reveal-on-scroll reveal-delay-1">
              <div className="tech-media-frame">
                <EditableNode as="img" editKey={"homepage-12"} kind="image"
                  src={`${baseUrl}images/brass_eccentric_macro.jpg`}
                  alt="Сверхпрочные эксцентрики из первичной латуни А+"
                  className="tech-macro-img"
                  loading="lazy"
                />
                <div className="tech-media-overlay"></div>
                <div className="tech-floating-tag">
                  <EditableNode as="span" editKey={"homepage-13"} kind="text" className="tech-spec-pill">GRADE A+ CW617N BRASS</EditableNode>
                </div>
              </div>
              <div className="tech-card-body">
                <div className="tech-card-header">
                  <span className="tech-num">02</span>
                  <EditableNode as="span" editKey={"homepage-14"} kind="text" className="tech-kicker">ПРЕЦИЗИОННАЯ РЕЗЬБА 1/2" × 3/4"</EditableNode>
                </div>
                <EditableNode as="h3" editKey={"homepage-15"} kind="text" className="tech-heading">{h.brassEccentricTitle || 'Сверхпрочные эксцентрики из латуни А+'}</EditableNode>
                <EditableNode as="p" editKey={"homepage-16"} kind="text" className="tech-text">
                  {h.brassEccentricDesc || 'Массивные монтажные S-образные переходники из первичной конструкционной латуни марки А+. Прецизионная резьба 1/2" на 3/4" и плотная металлическая структура для надежного настенного монтажа смесителей.'}
                </EditableNode>
              </div>
            </div>

            {/* 3. PVD-покрытие */}
            <div className="tech-card tech-card-standard reveal-on-scroll reveal-delay-2">
              <div className="tech-media-frame">
                <EditableNode as="img" editKey={"homepage-17"} kind="image"
                  src={`${baseUrl}images/pvd_finish_macro.jpg`}
                  alt="PVD-покрытие сантехники LAUTE"
                  className="tech-macro-img"
                  loading="lazy"
                />
                <div className="tech-media-overlay"></div>
                <div className="tech-floating-tag">
                  <EditableNode as="span" editKey={"homepage-18"} kind="text" className="tech-spec-pill">VACUUM DEPOSITION</EditableNode>
                </div>
              </div>
              <div className="tech-card-body">
                <div className="tech-card-header">
                  <span className="tech-num">03</span>
                  <EditableNode as="span" editKey={"homepage-19"} kind="text" className="tech-kicker">МОЛЕКУЛЯРНАЯ СТОЙКОСТЬ</EditableNode>
                </div>
                <EditableNode as="h3" editKey={"homepage-20"} kind="text" className="tech-heading">{h.pvdTitle || 'PVD-покрытие'}</EditableNode>
                <EditableNode as="p" editKey={"homepage-21"} kind="text" className="tech-text">
                  {h.pvdDesc || 'PVD — технология нанесения прочного декоративно-защитного покрытия в вакууме на молекулярном уровне. Стойкость к истиранию и безупречная глубина цвета.'}
                </EditableNode>
              </div>
            </div>

            {/* 4. Нержавеющая сталь SUS304 */}
            <div className="tech-card tech-card-standard reveal-on-scroll reveal-delay-3">
              <div className="tech-media-frame">
                <EditableNode as="img" editKey={"homepage-22"} kind="image"
                  src={`${baseUrl}images/sus304_steel_macro.jpg`}
                  alt="Пищевая нержавеющая сталь SUS304 LAUTE"
                  className="tech-macro-img"
                  loading="lazy"
                />
                <div className="tech-media-overlay"></div>
                <div className="tech-floating-tag">
                  <EditableNode as="span" editKey={"homepage-23"} kind="text" className="tech-spec-pill">FOOD-GRADE SUS304</EditableNode>
                </div>
              </div>
              <div className="tech-card-body">
                <div className="tech-card-header">
                  <span className="tech-num">04</span>
                  <EditableNode as="span" editKey={"homepage-24"} kind="text" className="tech-kicker">ПИЩЕВОЙ СТАНДАРТ</EditableNode>
                </div>
                <EditableNode as="h3" editKey={"homepage-25"} kind="text" className="tech-heading">{h.sus304Title || 'Нержавеющая сталь SUS304'}</EditableNode>
                <EditableNode as="p" editKey={"homepage-26"} kind="text" className="tech-text">
                  {h.sus304Desc || 'Пищевая аустенитная нержавеющая сталь с высоким содержанием хрома и никеля. Абсолютная устойчивость к коррозии и благородная матовая сатинированная фактура.'}
                </EditableNode>
              </div>
            </div>

            {/* 5. ЭКО алюминий */}
            <div className="tech-card tech-card-standard reveal-on-scroll reveal-delay-4">
              <div className="tech-media-frame">
                <EditableNode as="img" editKey={"homepage-27"} kind="image"
                  src={`${baseUrl}images/eco_aluminum_macro.jpg`}
                  alt="Конструкционный ЭКО алюминий для душевых зон и кабин"
                  className="tech-macro-img"
                  loading="lazy"
                />
                <div className="tech-media-overlay"></div>
                <div className="tech-floating-tag">
                  <EditableNode as="span" editKey={"homepage-28"} kind="text" className="tech-spec-pill">ECO ANODIZED ALLOY</EditableNode>
                </div>
              </div>
              <div className="tech-card-body">
                <div className="tech-card-header">
                  <span className="tech-num">05</span>
                  <EditableNode as="span" editKey={"homepage-29"} kind="text" className="tech-kicker">РЕЦИКЛИНГ И ЖЕСТКОСТЬ</EditableNode>
                </div>
                <EditableNode as="h3" editKey={"homepage-30"} kind="text" className="tech-heading">{h.ecoAluTitle || 'ЭКО алюминий'}</EditableNode>
                <EditableNode as="p" editKey={"homepage-31"} kind="text" className="tech-text">
                  {h.ecoAluDesc || 'Конструкционный анодированный алюминиевый профиль. Экологичный и долговечный металл высокой жесткости для душевых перегородок и кабин.'}
                </EditableNode>
              </div>
            </div>
          </div>
        </div>
      </EditableSection>

      {/* 3. «РАЗВИВАЕМ РЫНОК ВМЕСТЕ С ПАРТНЁРАМИ» — КРЕАТИВНЫЙ АСИММЕТРИЧНЫЙ АРХИТЕКТУРНЫЙ БЛОК */}
      <EditableSection sectionKey="home-partners" className="section visual-partnership-section" id="partners">
        <div className="container">
          <div className="section-title-wrap reveal-on-scroll">
            <EditableNode as="span" editKey={"homepage-32"} kind="text" className="section-badge badge-refined">
              {h.audienceBadge || 'ПАРТНЁРСТВО'}
            </EditableNode>
            <EditableNode as="h2" editKey={"homepage-33"} kind="text" className="section-title visual-part-title">
              {withBrandWord(h.audienceTitle || 'Развиваем рынок вместе с партнёрами')}
            </EditableNode>
            <EditableNode as="p" editKey={"homepage-34"} kind="text" className="section-desc visual-part-desc">
              {withBrandWord(h.audienceDesc || 'Сотрудничаем с дистрибьюторами, торговыми сетями и профессионалами строительного рынка. Формируем предложение под ваш канал продаж, ассортимент и задачи проекта.')}
            </EditableNode>
          </div>

          <div className="partnership-asymmetric-stage reveal-on-scroll">
            {/* Left Column: Architectural Photo Canvas & Floating Overlay */}
            <div className="partnership-heroic-visual">
              <div className="partnership-media-frame">
                <EditableNode as="img" editKey={"homepage-35"} kind="image"
                  src={`${baseUrl}images/hero/hero-slide-4.jpg`}
                  alt="Партнёрство с LAUTE"
                  className="partnership-stage-img"
                  loading="lazy"
                />
                <div className="partnership-stage-gradient"></div>

                <div className="partnership-stage-badge">
                  <EditableNode as="span" editKey={"homepage-36"} kind="text" className="stage-badge-tag">B2B NETWORK</EditableNode>
                  <span className="stage-badge-brand">
                    <EditableNode as="span" editKey={"homepage-37"} kind="text" className="brand-word">LAUTE</EditableNode> COMMERCIAL SPECIFICATION
                  </span>
                </div>

                <div className="partnership-stage-overlay">
                  <div className="partnership-metric-tags">
                    <div className="glass-metric-pill">
                      <EditableNode as="span" editKey={"homepage-38"} kind="text" className="metric-index">01</EditableNode>
                      <EditableNode as="span" editKey={"homepage-39"} kind="text">Прямой контракт с производителем</EditableNode>
                    </div>
                    <div className="glass-metric-pill">
                      <EditableNode as="span" editKey={"homepage-40"} kind="text" className="metric-index">02</EditableNode>
                      <EditableNode as="span" editKey={"homepage-41"} kind="text">Персональные коммерческие условия</EditableNode>
                    </div>
                    <div className="glass-metric-pill">
                      <EditableNode as="span" editKey={"homepage-42"} kind="text" className="metric-index">03</EditableNode>
                      <EditableNode as="span" editKey={"homepage-43"} kind="text">Техническая поддержка объектов</EditableNode>
                    </div>
                  </div>

                  <div className="partnership-stage-cta">
                    <EditableNode as={SiteAction} editKey={"homepage-44"} kind="button" controlId="home-1"
                      type="button"
                      className="btn btn-primary btn-luxury"
                      onClick={openPartnerModal}
                      id="adv-btn-partner"
                    >
                      <span>{h.btnPartner || 'Стать партнёром'}</span>
                      <ArrowRight size={18} />
                    </EditableNode>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 4 Tiered Architectural Glass Cards */}
            <div className="partnership-cards-tier">
              <div className="tier-audience-card reveal-on-scroll reveal-delay-1">
                <div className="tier-card-top">
                  <div className="tier-icon-box">
                    <Users size={20} />
                  </div>
                  <span className="tier-index-num">01</span>
                </div>
                <EditableNode as="h3" editKey={"homepage-45"} kind="text" className="tier-card-title">
                  {withBrandWord(h.audienceGroup1Title || 'Дистрибьюторам и оптовым компаниям')}
                </EditableNode>
                <EditableNode as="p" editKey={"homepage-46"} kind="text" className="tier-card-desc">
                  {withBrandWord(h.audienceGroup1Desc || 'Развивайте региональные продажи с продукцией LAUTE. Обсудим ассортимент, коммерческие условия и организацию поставок для вашего рынка.')}
                </EditableNode>
              </div>

              <div className="tier-audience-card reveal-on-scroll reveal-delay-2">
                <div className="tier-card-top">
                  <div className="tier-icon-box">
                    <Store size={20} />
                  </div>
                  <span className="tier-index-num">02</span>
                </div>
                <EditableNode as="h3" editKey={"homepage-47"} kind="text" className="tier-card-title">
                  {withBrandWord(h.audienceGroup2Title || 'Торговым сетям и салонам')}
                </EditableNode>
                <EditableNode as="p" editKey={"homepage-48"} kind="text" className="tier-card-desc">
                  {withBrandWord(h.audienceGroup2Desc || 'Сформируйте предложение для кухни и ванной комнаты в едином каталоге. Подберём модели и коллекции под формат магазина и потребности покупателей.')}
                </EditableNode>
              </div>

              <div className="tier-audience-card reveal-on-scroll reveal-delay-3">
                <div className="tier-card-top">
                  <div className="tier-icon-box">
                    <HardHat size={20} />
                  </div>
                  <span className="tier-index-num">03</span>
                </div>
                <EditableNode as="h3" editKey={"homepage-49"} kind="text" className="tier-card-title">
                  {withBrandWord(h.audienceGroup3Title || 'Девелоперам и комплектовщикам')}
                </EditableNode>
                <EditableNode as="p" editKey={"homepage-50"} kind="text" className="tier-card-desc">
                  {withBrandWord(h.audienceGroup3Desc || 'Подбирайте сантехническое оборудование под требования объекта. Поможем согласовать ассортимент, комплектацию и параметры поставки.')}
                </EditableNode>
              </div>

              <div className="tier-audience-card reveal-on-scroll reveal-delay-4">
                <div className="tier-card-top">
                  <div className="tier-icon-box">
                    <Wrench size={20} />
                  </div>
                  <span className="tier-index-num">04</span>
                </div>
                <EditableNode as="h3" editKey={"homepage-51"} kind="text" className="tier-card-title">
                  {withBrandWord(h.audienceGroup4Title || 'Монтажным организациям')}
                </EditableNode>
                <EditableNode as="p" editKey={"homepage-52"} kind="text" className="tier-card-desc">
                  {withBrandWord(h.audienceGroup4Desc || 'Выбирайте оборудование по монтажным размерам, подключениям и комплектации. По вопросам установки и совместимости обращайтесь к специалистам LAUTE.')}
                </EditableNode>
              </div>
            </div>
          </div>

          {/* AI PARTNERSHIP CONSULTATION CTA BANNER */}
          <div className="partnership-ai-cta-banner reveal-on-scroll">
            <div className="ai-cta-banner-content">
              <div className="ai-cta-badge">
                <Sparkles size={16} className="ai-cta-icon-sparkle" />
                <span>ИНТЕЛЛЕКТУАЛЬНЫЙ АНАЛИЗ ВОЗМОЖНОСТЕЙ</span>
              </div>
              <h3 className="ai-cta-title">
                {withBrandWord(h.aiPartnershipTitle || 'Проанализируйте свои возможности с AI LAUTE')}
              </h3>
              <p className="ai-cta-desc">
                {withBrandWord(h.aiPartnershipDesc || 'Цифровой интеллект LAUTE задаст несколько уточняющих вопросов, поможет сформулировать профиль потребностей вашего бизнеса и определит формат взаимодействия без лишней бюрократии.')}
              </p>
            </div>
            <div className="ai-cta-banner-action">
              <button
                type="button"
                className="btn btn-primary btn-luxury btn-ai-start"
                onClick={startAIPartnerAnalysis}
                id="btn-partner-ai-analysis"
              >
                <Sparkles size={18} />
                <span>{h.aiPartnershipBtn || 'Начать анализ'}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </EditableSection>

      {/* 4. «ПЕРВЫЙ ЦИФРОВОЙ СЕРВИСНЫЙ ЦЕНТР LAUTE» — ПРЕМИАЛЬНЫЙ СЕРВИСНЫЙ БЛОК */}
      <EditableSection sectionKey="home-service-preview" className="section visual-service-section" id="service-preview">
        <div className="container">
          <div className="service-editorial-card reveal-on-scroll">
            <div className="service-editorial-grid">
              {/* Left Column: Service Details & SLA */}
              <div className="service-text-column">
                <EditableNode as="span" editKey={"homepage-53"} kind="text" className="section-badge badge-refined">
                  {h.serviceOverline || 'СЕРВИС ОТ ПРОИЗВОДИТЕЛЯ'}
                </EditableNode>
                <EditableNode as="h2" editKey={"homepage-54"} kind="text" className="service-editorial-title">
                  {withBrandWord(h.serviceTitle || 'Первый цифровой сервисный центр LAUTE')}
                </EditableNode>
                <EditableNode as="p" editKey={"homepage-55"} kind="text" className="service-editorial-desc">
                  {withBrandWord(h.serviceDesc || 'Поддержка LAUTE начинается с вашего обращения. Ознакомьтесь с гарантийными обязательствами и опишите вопрос в онлайн-форме. Ответ будет дан в течение 36 часов в рабочие дни.')}
                </EditableNode>

                {/* Service SLA & Online Support Badges */}
                <div className="service-stats-editorial-row">
                  <div className="service-stat-glass-pill">
                    <div className="stat-glass-icon-wrap">
                      <Clock size={20} />
                    </div>
                    <div>
                      <div className="stat-pill-num">{h.stat1Num || '36 часов'}</div>
                      <div className="stat-pill-label">{h.stat1Label || 'срок ответа в рабочие дни'}</div>
                    </div>
                  </div>

                  <div className="service-stat-glass-pill">
                    <div className="stat-glass-icon-wrap">
                      <Headphones size={20} />
                    </div>
                    <div>
                      <div className="stat-pill-num">{h.stat2Num || 'Онлайн'}</div>
                      <div className="stat-pill-label">{h.stat2Label || 'подача сервисного обращения'}</div>
                    </div>
                  </div>
                </div>

                <div className="service-editorial-actions">
                  <EditableNode as={SiteAction} editKey={"homepage-56"} kind="button" controlId="home-3"
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigateTo('service')}
                    id="btn-service-center"
                  >
                    <span>{h.serviceBtn || 'Обратиться в сервис'}</span>
                    <ArrowRight size={16} />
                  </EditableNode>
                  <EditableNode as={SiteAction} editKey={"homepage-57"} kind="button" controlId="home-4"
                    type="button"
                    className="btn btn-outline light-btn-outline"
                    onClick={() => navigateTo('partners')}
                    id="btn-partner-support"
                  >
                    <span>{h.servicePartnerBtn || 'Поддержка партнеров'}</span>
                  </EditableNode>
                </div>
              </div>

              {/* Right Column: Factory Quality Testing Photo */}
              <div className="service-visual-column">
                <div className="service-photo-frame">
                  <EditableNode as="img" editKey={"homepage-58"} kind="image"
                    src={`${baseUrl}images/prod_testing.png`}
                    alt="Контроль качества и сервис LAUTE"
                    className="service-photo-img"
                    loading="lazy"
                  />
                  <div className="service-photo-overlay"></div>
                  <div className="service-photo-caption-glass">
                    <ShieldCheck size={18} className="shield-icon" />
                    <EditableNode as="span" editKey={"homepage-59"} kind="text">Заводское гидро- и пневмотестирование 100% узлов</EditableNode>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </EditableSection>

      {/* 5. СОТРУДНИЧЕСТВО С LAUTE — ФОРМА СВЯЗИ С ВЫСОКИМ КОНТРАСТОМ И ЧИТАЕМОСТЬЮ */}
      <EditableSection sectionKey="home-b2b-lead-form" className="section light-cta-section" id="b2b-lead-form">
        <div className="container">
          <div className="light-cta-card reveal-on-scroll">
            <div className="cta-left-content">
              <EditableNode as="span" editKey={"homepage-60"} kind="text" className="section-badge badge-refined">
                {withBrandWord(h.formBadge || 'СОТРУДНИЧЕСТВО С LAUTE')}
              </EditableNode>
              <EditableNode as="h2" editKey={"homepage-61"} kind="text" className="cta-heading light-heading">
                {withBrandWord(h.formHeading || 'Ваш следующий шаг — партнёрство с LAUTE')}
              </EditableNode>
              <EditableNode as="p" editKey={"homepage-62"} kind="text" className="cta-subheading light-subheading">
                {withBrandWord(h.formSubheading || 'Расскажите о вашей компании и регионе работы. Представитель LAUTE свяжется с вами, поможет выбрать ассортимент и подготовит коммерческое предложение.')}
              </EditableNode>

              {/* High-Contrast Architectural Contact Panel */}
              <div className="cta-contact-summary-box">
                <div className="cta-contact-line">
                  <div className="cta-contact-icon-bubble">
                    <PhoneCall size={18} />
                  </div>
                  <div>
                    <EditableNode as="span" editKey={"homepage-63"} kind="text" className="cta-contact-label">{h.formDept || 'Отдел продаж и дистрибуции'}</EditableNode>
                    <EditableNode as="a" editKey={"homepage-64"} kind="link" href="tel:+79833105626" className="cta-contact-value">+7 (983) 310-56-26</EditableNode>
                  </div>
                </div>

                <div className="cta-contact-line">
                  <div className="cta-contact-icon-bubble">
                    <Mail size={18} />
                  </div>
                  <div>
                    <EditableNode as="span" editKey={"homepage-65"} kind="text" className="cta-contact-label">{h.formEmailLabel || 'Официальная электронная почта'}</EditableNode>
                    <EditableNode as="a" editKey={"homepage-66"} kind="link" href="mailto:opt@laute.ltd" className="cta-contact-value">opt@laute.ltd</EditableNode>
                  </div>
                </div>
              </div>

              <div className="cta-secondary-link-wrap">
                <EditableNode as={SiteAction} editKey={"homepage-67"} kind="button" controlId="home-5"
                  type="button"
                  className="btn btn-outline light-btn-outline btn-sm"
                  onClick={() => navigateTo('contacts')}
                  id="btn-all-contacts"
                >
                  <span>{h.formAllContacts || 'Контакты в вашем регионе'}</span>
                </EditableNode>
              </div>
            </div>

            <div className="cta-right-form-wrap">
              {leadSubmitted ? (
                <div className="form-success-card light-form-success">
                  <CheckCircle2 size={48} color="#0EA5E9" />
                  <EditableNode as="h3" editKey={"homepage-68"} kind="text">{h.formSuccessTitle || 'Запрос успешно отправлен!'}</EditableNode>
                  <EditableNode as="p" editKey={"homepage-69"} kind="text">{withBrandWord(h.formSuccessDesc || 'Представитель LAUTE свяжется с вами для отправки коммерческого предложения.')}</EditableNode>
                  <EditableNode as="button" editKey={"homepage-70"} kind="button"
                    type="button"
                    className="btn btn-outline light-btn-outline btn-sm"
                    style={{ marginTop: '16px' }}
                    onClick={() => setLeadSubmitted(false)}
                  >
                    {h.formSuccessAgain || 'Отправить ещё один запрос'}
                  </EditableNode>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="b2b-lead-form light-lead-form">
                  <div className="form-field-group">
                    <label htmlFor="lead-name" className="field-label light-field-label">
                      {h.fieldName || 'Ваше имя'} <span className="field-required">*</span>
                    </label>
                    <input
                      id="lead-name"
                      type="text"
                      required
                      placeholder="Иван Иванов"
                      className="form-input light-form-input"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-field-group">
                    <label htmlFor="lead-company" className="field-label light-field-label">
                      {h.fieldCompany || 'Компания или направление деятельности'} <span className="field-required">*</span>
                    </label>
                    <input
                      id="lead-company"
                      type="text"
                      required
                      placeholder="ООО / ИП / Торговая сеть / Комплектация"
                      className="form-input light-form-input"
                      value={leadForm.company}
                      onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                    />
                  </div>

                  <div className="form-fields-grid-2">
                    <div className="form-field-group">
                      <label htmlFor="lead-phone" className="field-label light-field-label">
                        {h.fieldPhone || 'Телефон'} <span className="field-required">*</span>
                      </label>
                      <input
                        id="lead-phone"
                        type="tel"
                        required
                        placeholder="+7 (___) ___-__-__"
                        className="form-input light-form-input"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      />
                    </div>

                    <div className="form-field-group">
                      <label htmlFor="lead-city" className="field-label light-field-label">
                        {h.fieldCity || 'Город и страна'} <span className="field-required">*</span>
                      </label>
                      <input
                        id="lead-city"
                        type="text"
                        required
                        placeholder="Например: Новосибирск"
                        className="form-input light-form-input"
                        value={leadForm.city}
                        onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-submit-wrap">
                    <EditableNode as={SiteAction} editKey={"homepage-71"} kind="submit" controlId="home-6" type="submit" className="btn btn-primary btn-lg btn-full" id="btn-submit-lead">
                      <span>{h.formSubmit || 'Получить предложение'}</span>
                      <ArrowRight size={18} />
                    </EditableNode>
                    <EditableNode as="p" editKey={"homepage-72"} kind="text" className="form-disclaimer light-disclaimer">
                      {h.formDisclaimer || 'Я согласен на обработку персональных данных на условиях Политики конфиденциальности'}
                    </EditableNode>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </EditableSection>
    </div>
  );
};

export default HomePage;
