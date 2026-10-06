import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export const HeroCarousel = () => {
  const { navigateTo, openPartnerModal, t } = useApp();
  const baseUrl = import.meta.env.BASE_URL;

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const SLIDE_DURATION = 4000; // 4 seconds per requirement

  const slidesData = [
    {
      id: 'brand',
      image: `${baseUrl}images/hero/hero-slide-1.jpg`,
      showLargeLogo: true,
      tagline: 'LAUTE',
      title: t.home?.heroSlides?.[0]?.title || 'Смесители для современных пространств.',
      buttonText: t.home?.heroSlides?.[0]?.buttonText || 'Смотреть продукцию',
      action: () => navigateTo('catalog'),
      buttonId: 'hero-slide1-btn'
    },
    {
      id: 'shower',
      image: `${baseUrl}images/hero/hero-slide-2.jpg`,
      showLargeLogo: false,
      tagline: 'ДУШЕВЫЕ СИСТЕМЫ LAUTE',
      title: t.home?.heroSlides?.[1]?.title || 'Вода, продуманная иначе.',
      buttonText: t.home?.heroSlides?.[1]?.buttonText || 'Открыть LAUTE',
      action: () => navigateTo('catalog'),
      buttonId: 'hero-slide2-btn'
    },
    {
      id: 'kitchen',
      image: `${baseUrl}images/hero/hero-slide-3.jpg`,
      showLargeLogo: false,
      tagline: 'КУХОННЫЕ РЕШЕНИЯ',
      title: t.home?.heroSlides?.[2]?.title || 'Функциональность встречается с дизайном.',
      buttonText: t.home?.heroSlides?.[2]?.buttonText || 'Смотреть коллекцию',
      action: () => navigateTo('catalog'),
      buttonId: 'hero-slide3-btn'
    },
    {
      id: 'partnership',
      image: `${baseUrl}images/hero/hero-slide-4.jpg`,
      showLargeLogo: false,
      tagline: 'МЕЖДУНАРОДНОЕ СОТРУДНИЧЕСТВО',
      title: t.home?.heroSlides?.[3]?.title || 'Развиваем рынок вместе.',
      buttonText: t.home?.heroSlides?.[3]?.buttonText || 'Стать партнёром',
      action: openPartnerModal,
      buttonId: 'hero-slide4-btn'
    },
    {
      id: 'support',
      image: `${baseUrl}images/hero/hero-slide-5.jpg`,
      showLargeLogo: true,
      tagline: 'ПРОИЗВОДИТЕЛЬ LAUTE',
      title: t.home?.heroSlides?.[4]?.title || 'Продукция. Партнёрство. Поддержка.',
      buttonText: t.home?.heroSlides?.[4]?.buttonText || 'Узнать больше',
      action: () => navigateTo('company'),
      buttonId: 'hero-slide5-btn'
    }
  ];

  const totalSlides = slidesData.length;

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Autoplay timer
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide, activeSlide]);

  // Preload slides 2-5 after component mounts for instant transitions without initial lag
  useEffect(() => {
    const preloadImages = () => {
      slidesData.slice(1).forEach((slide) => {
        const img = new Image();
        img.src = slide.image;
      });
    };
    if (typeof window !== 'undefined') {
      const id = setTimeout(preloadImages, 500);
      return () => clearTimeout(id);
    }
  }, []);

  // Touch handlers for mobile swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
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
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-label="LAUTE Hero Презентация"
    >
      {/* Background Slides */}
      <div className="hero-slides-wrapper">
        {slidesData.map((slide, index) => {
          const isActive = index === activeSlide;
          return (
            <div
              key={slide.id}
              className={`hero-slide ${isActive ? 'is-active' : ''}`}
              aria-hidden={!isActive}
            >
              <div 
                className="hero-slide-bg"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="hero-slide-overlay"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Foreground Content Container */}
      <div className="container hero-content-container">
        {slidesData.map((slide, index) => {
          const isActive = index === activeSlide;
          if (!isActive) return null;

          return (
            <div 
              key={`content-${slide.id}`} 
              className="hero-slide-caption animate-slide-entry"
            >
              {/* Slide 1 & 5 prominent authentic LAUTE branding */}
              {slide.showLargeLogo ? (
                <div className="hero-prominent-logo-wrap animate-caption-logo">
                  <img 
                    src={`${baseUrl}laute-logo.png`} 
                    alt="LAUTE" 
                    className="hero-prominent-logo-img" 
                  />
                </div>
              ) : (
                <div className="hero-slide-badge animate-caption-badge">
                  <span className="hero-badge-pill">{slide.tagline}</span>
                </div>
              )}

              {/* Main Headline */}
              <h1 className="hero-slide-title animate-caption-title">
                {slide.title}
              </h1>

              {/* Action Button */}
              <div className="hero-slide-action-wrap animate-caption-cta">
                <button
                  type="button"
                  id={slide.buttonId}
                  className="btn btn-hero-luxury"
                  onClick={slide.action}
                >
                  <span>{slide.buttonText}</span>
                  <ArrowRight size={18} className="btn-icon-arrow" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide Navigation Controls */}
      <div className="hero-controls-bar">
        <div className="container hero-controls-container">
          {/* Progress Indicators */}
          <div className="hero-indicators-list" role="tablist">
            {slidesData.map((slide, index) => {
              const isActive = index === activeSlide;
              return (
                <button
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
                      className={`indicator-bar-fill ${isActive && !isPaused ? 'is-animating' : ''}`}
                      style={{ animationDuration: `${SLIDE_DURATION}ms` }}
                    ></span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Minimalist Prev / Next Arrows */}
          <div className="hero-arrows-group">
            <button
              type="button"
              className="hero-arrow-btn prev-btn"
              onClick={prevSlide}
              aria-label="Предыдущий слайд"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="hero-arrow-btn next-btn"
              onClick={nextSlide}
              aria-label="Следующий слайд"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Subtle luxury edge divider between hero and next light sections */}
      <div className="hero-transition-edge" aria-hidden="true" />
    </section>
  );
};
