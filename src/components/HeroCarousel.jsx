import { EditableNode, NativeContentScope, NativeEditorScope } from './builder/NativeContent';
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { isSafeActionLink } from './SiteAction';
import { withBrandWord } from '../utils/brandFormatter';
import { catalogRoute } from '../utils/catalogSearch';

const showerRoute = catalogRoute({ category: 'shower-systems', product: 'LEO194H' });
const bitcoinRoute = catalogRoute({ collection: 'bitcoin' });
const campaignSlides = {
  'slide-2': { stock: 'images/hero/hero-slide-2.jpg', image: 'images/campaign/hero-shower.webp', route: showerRoute },
  'slide-3': { stock: 'images/hero/hero-slide-3.jpg', route: bitcoinRoute },
  'slide-6': { stock: 'images/hero/hero-slide-6.jpg', image: 'images/campaign/hero-six.webp' },
};

function englishBrandTitle(lang, slideId, title) {
  return lang === 'en' && slideId === 'slide-1' && (!title || title === 'Real German technology')
    ? 'Manage water smartly' : title;
}

export const HeroCarousel = ({ slidesOverride } = {}) => {
  const { navigateTo, openPartnerModal, t, siteContent, lang } = useApp();
  const editor = useContext(NativeEditorScope);
  const content = useContext(NativeContentScope);
  const baseUrl = import.meta.env.BASE_URL;

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(true);
  const [isDocumentVisible, setIsDocumentVisible] = useState(() => !document.hidden);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting));
    observer.observe(sectionRef.current);
    const onVisibilityChange = () => setIsDocumentVisible(!document.hidden);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => setReducedMotion(media.matches);
    document.addEventListener('visibilitychange', onVisibilityChange);
    media.addEventListener('change', onMotionChange);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      media.removeEventListener('change', onMotionChange);
    };
  }, []);

  const autoplayPaused = !!editor || isPaused || hasKeyboardFocus || !isInView || !isDocumentVisible || reducedMotion;
  const previousLabel = lang === 'en' ? 'Previous slide' : lang === 'kz' ? 'Алдыңғы слайд' : 'Предыдущий слайд';
  const nextLabel = lang === 'en' ? 'Next slide' : lang === 'kz' ? 'Келесі слайд' : 'Следующий слайд';
  const pauseLabel = lang === 'en' ? 'Pause slides' : lang === 'kz' ? 'Слайдтарды кідірту' : 'Приостановить слайды';
  const playLabel = lang === 'en' ? 'Play slides' : lang === 'kz' ? 'Слайдтарды ойнату' : 'Возобновить слайды';

  const SLIDE_DURATION = 3000; // Exactly 3000ms per requirement

  const configuredSlides = (slidesOverride || siteContent?.homeBlocks?.heroSlider)?.filter(s => s.isVisible !== false);

  const defaultSlides = [
    {
      id: 'brand',
      image: `${baseUrl}images/hero/hero-slide-1.jpg`,
      showLargeLogo: true,
      tagline: t.home?.heroSlides?.[0]?.tagline || 'LAUTE®',
      title: englishBrandTitle(lang, 'slide-1', t.home?.heroSlides?.[0]?.title) || 'Управляй водой грамотно',
      buttonText: t.home?.heroSlides?.[0]?.buttonText || 'Каталог',
      action: () => navigateTo('catalog'),
      buttonId: 'hero-slide1-btn'
    },
    {
      id: 'shower',
      image: baseUrl + campaignSlides['slide-2'].image,
      showLargeLogo: false,
      tagline: t.home?.heroSlides?.[1]?.tagline || 'ДУШЕВЫЕ СИСТЕМЫ LAUTE',
      title: t.home?.heroSlides?.[1]?.title || 'Вода, наполняющая жизнь',
      buttonText: t.home?.heroSlides?.[1]?.buttonText || 'Смотреть каталог',
      action: () => navigateTo(showerRoute),
      buttonId: 'hero-slide2-btn'
    },
    {
      id: 'kitchen',
      image: `${baseUrl}images/hero/hero-slide-3.jpg`,
      showLargeLogo: false,
      tagline: t.home?.heroSlides?.[2]?.tagline || 'КУХОННЫЕ РЕШЕНИЯ',
      title: t.home?.heroSlides?.[2]?.title || 'Функциональность встречается с дизайном.',
      buttonText: t.home?.heroSlides?.[2]?.buttonText || 'Смотреть коллекцию',
      action: () => navigateTo(bitcoinRoute),
      buttonId: 'hero-slide3-btn'
    },
    {
      id: 'partnership',
      image: `${baseUrl}images/hero/hero-slide-4.jpg`,
      showLargeLogo: false,
      tagline: t.home?.heroSlides?.[3]?.tagline || 'ПАРТНЁРСТВО B2B',
      title: t.home?.heroSlides?.[3]?.title || 'Развиваемся вместе',
      subtitle: t.home?.heroSlides?.[3]?.subtitle || 'Наша работа — это забота о вашей прибыли.',
      buttonText: t.home?.heroSlides?.[3]?.buttonText || 'Стать партнёром',
      action: openPartnerModal,
      buttonId: 'hero-slide4-btn'
    },
    {
      id: 'business',
      image: `${baseUrl}images/hero/hero-slide-5.jpg`,
      showLargeLogo: true,
      tagline: t.home?.heroSlides?.[4]?.tagline || 'ПРОИЗВОДИТЕЛЬ LAUTE',
      title: t.home?.heroSlides?.[4]?.title || 'Смешивая воду. Бизнес и Технологии.',
      buttonText: t.home?.heroSlides?.[4]?.buttonText || 'О компании',
      action: () => navigateTo('company'),
      buttonId: 'hero-slide5-btn'
    },
    {
      id: 'materials',
      image: baseUrl + campaignSlides['slide-6'].image,
      showLargeLogo: false,
      tagline: t.home?.heroSlides?.[5]?.tagline || 'ИНЖЕНЕРНАЯ ФИЛОСОФИЯ LAUTE',
      title: t.home?.heroSlides?.[5]?.title || 'Интеллект и экологичность в деталях.',
      subtitle: t.home?.heroSlides?.[5]?.subtitle || 'SUS304 · ЭКО алюминий · Латунь А+ · PVD-покрытие',
      buttonText: t.home?.heroSlides?.[5]?.buttonText || 'Смотреть технологии',
      action: () => {
        const el = document.getElementById('technologies');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          navigateTo('catalog');
        }
      },
      buttonId: 'hero-slide6-btn'
    }
  ];

  const slidesData = (configuredSlides && configuredSlides.length > 0)
    ? configuredSlides.map((s, idx) => {
        const campaign = campaignSlides[s.id];
        const usesStock = campaign?.stock === String(s.image || '').replace(/^\//, '');
        const imagePath = (usesStock && campaign.image) || s.image || 'images/hero/hero-slide-1.jpg';
        const buttonLink = (usesStock && (s.buttonLink === 'catalog' || !s.buttonLink) && campaign.route) || s.buttonLink;
        let action = () => navigateTo('catalog');
        if (buttonLink === 'modal:partner') action = openPartnerModal;
        else if (buttonLink === 'anchor:technologies') {
          action = () => {
            const el = document.getElementById('technologies');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else navigateTo('catalog');
          };
        } else if (buttonLink) {
          action = () => {
            const link = buttonLink.trim();
            if (/^https?:|^mailto:|^tel:/i.test(link) && isSafeActionLink(link)) window.location.assign(link);
            else if (link.startsWith('#')) document.getElementById(link.slice(1))?.scrollIntoView({ behavior: 'smooth' });
            else navigateTo(link.replace(/^\//, ''));
          };
        }
        const slideT = t.home?.heroSlides?.[idx] || {};
        return {
          id: s.id || `slide-${idx}`,
          image: imagePath.startsWith('http') ? imagePath : baseUrl + imagePath.replace(/^\//, ''),
          showLargeLogo: idx === 0 || idx === 4,
          tagline: (lang !== 'ru' && slideT.tagline) ? slideT.tagline : (s.tagline || slideT.tagline || 'LAUTE®'),
          title: (lang !== 'ru' && englishBrandTitle(lang, s.id, slideT.title)) || s.title || slideT.title || 'Управляй водой грамотно',
          subtitle: (lang !== 'ru' && slideT.subtitle) ? slideT.subtitle : (s.subtitle || slideT.subtitle),
          buttonText: (lang !== 'ru' && slideT.buttonText) ? slideT.buttonText : (s.buttonText || slideT.buttonText || 'Каталог'),
          action,
          buttonId: `hero-slide${idx + 1}-btn`
        };
      })
    : defaultSlides;

  const totalSlides = slidesData.length;

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Autoplay timer
  useEffect(() => {
    if (autoplayPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [autoplayPaused, nextSlide, activeSlide]);

  // Touch handlers for mobile swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    touchEnd.current = null;
    touchStart.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };

  const onTouchMove = (e) => {
    touchEnd.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current.x - touchEnd.current.x;
    const verticalDistance = touchStart.current.y - touchEnd.current.y;
    touchStart.current = null;
    touchEnd.current = null;
    if (Math.abs(verticalDistance) >= Math.abs(distance)) return;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <section
      className="hero-carousel-section"
      ref={sectionRef}
      data-autoplay-paused={autoplayPaused}
      onFocus={event => { if (event.target.matches(':focus-visible')) setHasKeyboardFocus(true); }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setHasKeyboardFocus(false); }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={() => { touchStart.current = null; touchEnd.current = null; }}
      aria-label="LAUTE Hero Презентация"
    >
      {/* Background Slides */}
      <div className="hero-slides-wrapper">
        {slidesData.map((slide, index) => {
          const isActive = index === activeSlide;
          const editKey = `herocarousel-1:${index}`;
          const image = content?.edits?.[editKey]?.[lang]?.src ?? slide.image;
          const stockSlide = image.match(/(?:^|\/)images\/hero\/hero-slide-([1-6])\.jpg$/)?.[1];
          return (
            <div
              key={slide.id}
              className={`hero-slide ${isActive ? 'is-active' : ''}`}
              aria-hidden={!isActive}
            >
              <EditableNode as="div" editKey={editKey} kind="background" src={slide.image}
                className="hero-slide-bg"
                data-stock-slide={stockSlide}
                data-campaign-slide={image.match(/\/hero-(shower|six)\.webp$/)?.[1]}
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="hero-slide-overlay"></div>
              </EditableNode>
            </div>
          );
        })}
      </div>

      {/* Floating Foreground Content Container */}
      <div className="container hero-content-container">
        <div className="hero-captions-deck">
          {slidesData.map((slide, index) => {
            const isActive = index === activeSlide;

            return (
              <div
                key={`content-${slide.id}`}
                className={`hero-slide-caption ${isActive ? 'is-active' : 'is-inactive'}`}
                aria-hidden={!isActive}
                inert={isActive ? undefined : ''}
              >
                {/* Slide 1 & 5 prominent authentic LAUTE branding */}
                {slide.showLargeLogo ? (
                  <div className="hero-prominent-logo-wrap">
                    <EditableNode as="img" editKey={"herocarousel-2" + ':' + String(index)} kind="image"
                      src={`${baseUrl}laute-logo.png`}
                      alt="LAUTE"
                      className="hero-prominent-logo-img"
                    />
                  </div>
                ) : (
                  <div className="hero-slide-badge">
                    <EditableNode as="span" editKey={"herocarousel-3" + ':' + String(index)} kind="text" className="hero-badge-pill">{withBrandWord(slide.tagline)}</EditableNode>
                  </div>
                )}

                {/* Main Headline: Single semantic H1 on page for slide 1 */}
                {index === 0 ? (
                  <EditableNode as="h1" editKey={"herocarousel-4" + ':' + String(index)} kind="text" className="hero-slide-title">
                    {withBrandWord(slide.title)}
                  </EditableNode>
                ) : (
                  <EditableNode as="h2" editKey={"herocarousel-5" + ':' + String(index)} kind="text" className="hero-slide-title">
                    {withBrandWord(slide.title)}
                  </EditableNode>
                )}

                {/* Subtitle / Strong explanation for slides 4 & 6 */}
                {slide.subtitle && (
                  <EditableNode as="p" editKey={"herocarousel-6" + ':' + String(index)} kind="text" className="hero-slide-subtitle">
                    {withBrandWord(slide.subtitle)}
                  </EditableNode>
                )}

                {/* Action Button */}
                <div className="hero-slide-action-wrap">
                  <EditableNode as="button" editKey={"herocarousel-7" + ':' + String(index)} kind="button"
                    type="button"
                    id={slide.buttonId}
                    className="btn btn-hero-luxury"
                    onClick={slide.action}
                  >
                    <span>{withBrandWord(slide.buttonText)}</span>
                    <ArrowRight size={18} className="btn-icon-arrow" />
                  </EditableNode>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide Navigation Controls */}
      <div className="hero-controls-bar">
        <div className="container hero-controls-container">
          {/* Progress Indicators */}
          <div className="hero-indicators-list" role="tablist">
            {slidesData.map((slide, index) => {
              const isActive = index === activeSlide;
              return (
                <button data-preview-control=""
                  key={`indicator-${slide.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Слайд ${index + 1}: ${slide.title}`}
                  className={`hero-indicator-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActiveSlide(index)}
                >
                  <span className="indicator-num">0{index + 1}</span>
                  <span className="indicator-bar-track">
                    <span
                      className={`indicator-bar-fill ${isActive && !autoplayPaused ? 'is-animating' : ''}`}
                      style={{ animationDuration: `${SLIDE_DURATION}ms` }}
                    ></span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Minimalist Prev / Next Arrows */}
          <div className="hero-arrows-group">
            <button data-preview-control=""
              type="button"
              className="hero-arrow-btn prev-btn"
              onClick={prevSlide}
              aria-label={previousLabel}
            >
              <ChevronLeft size={20} />
            </button>
            <button data-preview-control=""
              type="button"
              className="hero-arrow-btn next-btn"
              onClick={nextSlide}
              aria-label={nextLabel}
            >
              <ChevronRight size={20} />
            </button>
            {!reducedMotion && !editor && <button
              type="button"
              className="hero-arrow-btn"
              onClick={() => { setHasKeyboardFocus(false); setIsPaused(!isPaused && !hasKeyboardFocus); }}
              aria-label={isPaused || hasKeyboardFocus ? playLabel : pauseLabel}
            >
              {isPaused || hasKeyboardFocus ? <Play size={16} /> : <Pause size={16} />}
            </button>}
          </div>
        </div>
      </div>

      {/* Subtle luxury edge divider between hero and next light sections */}
      <div className="hero-transition-edge" aria-hidden="true" />
    </section>
  );
};
