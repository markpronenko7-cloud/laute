import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Sliders,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus
} from 'lucide-react';
import { withBrandWord } from '../../utils/brandFormatter';
import { SystemPageContent } from './SystemPageContent';
import { isSafeActionLink } from '../SiteAction';
import { resolveMediaUrl, submitLeadInquiry } from '../../services/adminApi';

export const BlockRenderer = ({
  block,
  index = 0,
  totalBlocks = 1,
  isEditor = false,
  isSelected = false,
  onSelectBlock,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onAddBelow,
  onInlineUpdate
}) => {
  const { navigateTo, openPartnerModal, openServiceModal, catalogList = [], products = [] } = useApp();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', company: '', phone: '', email: '', message: '' });
  const [openFaqIndices, setOpenFaqIndices] = useState([0]);

  if (!block) return null;
  if (block.isVisible === false && block.type !== 'system_page' && !isEditor) return null;

  const baseUrl = import.meta.env.BASE_URL;

  // Resolve image URL (prepend baseUrl if relative and not http)
  const getImgSrc = resolveMediaUrl;

  const handleLinkClick = (e, link) => {
    if (isEditor) {
      e.preventDefault();
      return;
    }
    if (!link || !isSafeActionLink(link)) { e.preventDefault(); return; }
    if (link.startsWith('#')) {
      e.preventDefault();
      const targetId = link.slice(1);
      const el = document.getElementById(targetId) || document.getElementById('lead-form') || document.querySelector('.builder-form-block');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    if (link.startsWith('/')) {
      e.preventDefault();
      navigateTo(link.replace('/', '') || 'home');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isEditor) return;
    try {
      await submitLeadInquiry({
        source: block.formType || 'page_form',
        ...formData
      });
    } catch (err) {
      window.alert(err.message || 'Не удалось отправить заявку. Попробуйте ещё раз.');
      return;
    }
    setFormSubmitted(true);
  };

  const toggleFaq = (idx) => {
    setOpenFaqIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  // Determine section background & padding styles
  const bgStyle = block.style?.background || 'dark';
  let sectionBg = 'transparent';
  if (bgStyle === 'card') sectionBg = 'rgba(18, 23, 33, 0.7)';
  if (bgStyle === 'dark') sectionBg = '#0B0E14';
  if (bgStyle === 'deep') sectionBg = '#06080B';

  const paddingStyle = block.style?.padding || 'lg';
  let sectionPadding = '80px 0';
  if (paddingStyle === 'sm') sectionPadding = '36px 0';
  if (paddingStyle === 'md') sectionPadding = '60px 0';
  if (paddingStyle === 'lg') sectionPadding = '90px 0';

  const align = block.style?.alignment || 'left';

  // Sub-renderers for each block type
  const renderContent = () => {
    switch (block.type) {
      case 'system_page':
        return <div inert={isEditor ? '' : undefined} style={isEditor ? { pointerEvents: 'none' } : undefined}><SystemPageContent block={block}/></div>;
      // 1. HERO BLOCK
      case 'hero':
        return (
          <div className="builder-hero-block" style={{ textAlign: align, maxWidth: 960, margin: align === 'center' ? '0 auto' : '0' }}>
            {block.badge && (
              <span className="section-badge" style={{ marginBottom: 14, display: 'inline-block' }}>
                {block.badge}
              </span>
            )}
            <h1 className="page-title" style={{ fontSize: 'clamp(2rem, 3.8vw, 3.4rem)', lineHeight: 1.15, marginBottom: 18, fontWeight: 800 }}>
              {withBrandWord(block.title || 'Инженерное совершенство сантехники LAUTE')}
            </h1>
            {block.subtitle && (
              <p className="page-subtitle" style={{ fontSize: 'clamp(1rem, 1.25vw, 1.25rem)', color: 'var(--color-text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
                {withBrandWord(block.subtitle)}
              </p>
            )}
            {block.buttonText && (
              <div style={{ display: 'flex', gap: 14, justifyContent: align === 'center' ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
                <a
                  href={isSafeActionLink(block.buttonLink) ? block.buttonLink || '#' : '#'}
                  target={block.buttonNewTab && /^https?:/i.test(block.buttonLink || '') ? '_blank' : undefined}
                  rel={block.buttonNewTab ? 'noopener noreferrer' : undefined}
                  className={`btn ${block.buttonType === 'primary' ? 'btn-primary' : (block.buttonType === 'gold' ? 'btn-gold' : 'btn-outline')}`}
                  onClick={(e) => handleLinkClick(e, block.buttonLink)}
                >
                  <span>{block.buttonText}</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            )}
          </div>
        );

      // 2. TEXT BLOCK
      case 'text':
        return (
          <div className="builder-text-block" style={{ textAlign: align, maxWidth: 880, margin: align === 'center' ? '0 auto' : '0' }}>
            {block.badge && <span className="section-badge" style={{ marginBottom: 12, display: 'inline-block' }}>{block.badge}</span>}
            {block.title && <h2 className="section-title" style={{ marginBottom: 16 }}>{withBrandWord(block.title)}</h2>}
            {block.subtitle && <h3 style={{ fontSize: 18, color: 'var(--color-text-secondary)', marginBottom: 14 }}>{block.subtitle}</h3>}
            <div style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', whiteSpace: 'pre-line' }}>
              {withBrandWord(block.content || '')}
            </div>
          </div>
        );

      // 3. COLUMNS BLOCK
      case 'columns':
        return (
          <div className="builder-columns-block">
            {block.badge && <span className="section-badge" style={{ marginBottom: 12, display: 'inline-block' }}>{block.badge}</span>}
            {block.title && <h2 className="section-title" style={{ marginBottom: 24, textAlign: align }}>{withBrandWord(block.title)}</h2>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 32 }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                {block.col1Title && <h3 style={{ fontSize: 18, color: '#FFFFFF', marginBottom: 12 }}>{block.col1Title}</h3>}
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>{block.col1Text}</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                {block.col2Title && <h3 style={{ fontSize: 18, color: '#FFFFFF', marginBottom: 12 }}>{block.col2Title}</h3>}
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>{block.col2Text}</p>
              </div>
            </div>
          </div>
        );

      // 4. IMAGE + TEXT BLOCK
      case 'image_text': {
        const isRight = block.imagePosition === 'right';
        return (
          <div className="builder-image-text-block" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 40, alignItems: 'center' }}>
            {!isRight && (
              <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 12px 30px rgba(0,0,0,0.4)' }}>
                {block.imageUrl ? (
                  <img src={getImgSrc(block.imageUrl)} alt={block.title || 'LAUTE'} style={{ width: '100%', height: 380, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ height: 320, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--adm-text-muted)' }}>Фотография блока</div>
                )}
              </div>
            )}
            <div>
              {block.badge && <span className="section-badge" style={{ marginBottom: 12, display: 'inline-block' }}>{block.badge}</span>}
              <h2 className="section-title" style={{ marginBottom: 16 }}>{withBrandWord(block.title || '')}</h2>
              {block.subtitle && <h4 style={{ fontSize: 16, color: '#D4AF37', marginBottom: 14, fontWeight: 600 }}>{block.subtitle}</h4>}
              <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--color-text-secondary)', marginBottom: 24, whiteSpace: 'pre-line' }}>
                {withBrandWord(block.content || '')}
              </div>
              {block.buttonText && (
                <a
                  href={isSafeActionLink(block.buttonLink) ? block.buttonLink || '#' : '#'}
                  target={block.buttonNewTab && /^https?:/i.test(block.buttonLink || '') ? '_blank' : undefined}
                  rel={block.buttonNewTab ? 'noopener noreferrer' : undefined}
                  className={'btn btn-' + (block.buttonType || 'outline')}
                  onClick={(e) => handleLinkClick(e, block.buttonLink)}
                >
                  <span>{block.buttonText}</span>
                  <ArrowRight size={15} />
                </a>
              )}
            </div>
            {isRight && (
              <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 12px 30px rgba(0,0,0,0.4)' }}>
                {block.imageUrl ? (
                  <img src={getImgSrc(block.imageUrl)} alt={block.title || 'LAUTE'} style={{ width: '100%', height: 380, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ height: 320, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--adm-text-muted)' }}>Фотография блока</div>
                )}
              </div>
            )}
          </div>
        );
      }

      // 5. GALLERY BLOCK
      case 'gallery':
        return (
          <div className="builder-gallery-block">
            <div style={{ textAlign: align, marginBottom: 32 }}>
              {block.badge && <span className="section-badge" style={{ marginBottom: 10, display: 'inline-block' }}>{block.badge}</span>}
              <h2 className="section-title" style={{ marginBottom: 10 }}>{withBrandWord(block.title || '')}</h2>
              {block.subtitle && <p className="section-desc" style={{ maxWidth: 700, margin: align === 'center' ? '0 auto' : '0' }}>{block.subtitle}</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: 20 }}>
              {(block.items || []).map((item, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
                  {item.imageUrl && (
                    <img src={getImgSrc(item.imageUrl)} alt={item.title} style={{ width: '100%', height: 190, objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: 16, color: '#FFFFFF' }}>{item.title}</h4>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // 6. FEATURES BLOCK
      case 'features':
        return (
          <div className="builder-features-block">
            <div style={{ textAlign: align, marginBottom: 36 }}>
              {block.badge && <span className="section-badge" style={{ marginBottom: 10, display: 'inline-block' }}>{block.badge}</span>}
              <h2 className="section-title" style={{ marginBottom: 10 }}>{withBrandWord(block.title || '')}</h2>
              {block.subtitle && <p className="section-desc" style={{ maxWidth: 700, margin: align === 'center' ? '0 auto' : '0' }}>{block.subtitle}</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))', gap: 22 }}>
              {(block.items || []).map((item, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
                  {item.imageUrl && (
                    <img src={getImgSrc(item.imageUrl)} alt={item.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: 20, flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: 16, color: '#FFFFFF' }}>{item.title}</h4>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // 7. STEPS BLOCK
      case 'steps':
        return (
          <div className="builder-steps-block">
            <div style={{ textAlign: align, marginBottom: 36 }}>
              {block.badge && <span className="section-badge" style={{ marginBottom: 10, display: 'inline-block' }}>{block.badge}</span>}
              <h2 className="section-title" style={{ marginBottom: 10 }}>{withBrandWord(block.title || '')}</h2>
              {block.subtitle && <p className="section-desc" style={{ maxWidth: 700, margin: align === 'center' ? '0 auto' : '0' }}>{block.subtitle}</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 20 }}>
              {(block.items || []).map((item, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#D4AF37', opacity: 0.8, marginBottom: 12 }}>
                    {item.step || `0${idx + 1}`}
                  </div>
                  <h4 style={{ fontSize: 16, color: '#FFFFFF', margin: '0 0 8px 0' }}>{item.title}</h4>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      // 8. CONTACT CARDS BLOCK
      case 'contact_cards':
        return (
          <div className="builder-contacts-block">
            <div style={{ textAlign: align, marginBottom: 36 }}>
              {block.badge && <span className="section-badge" style={{ marginBottom: 10, display: 'inline-block' }}>{block.badge}</span>}
              <h2 className="section-title" style={{ marginBottom: 10 }}>{withBrandWord(block.title || 'Представительства и филиалы')}</h2>
              {block.subtitle && <p className="section-desc" style={{ maxWidth: 750, margin: align === 'center' ? '0 auto' : '0' }}>{block.subtitle}</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 290px), 1fr))', gap: 20 }}>
              {(block.items || []).map((hub, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: 22, borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h4 style={{ margin: 0, fontSize: 16, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={16} style={{ color: '#D4AF37' }} />
                    <span>{hub.title}</span>
                  </h4>
                  {hub.city && <div style={{ fontSize: 13, color: '#D4AF37', fontWeight: 600 }}>{hub.city}</div>}
                  {hub.address && <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{hub.address}</div>}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                    {hub.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FFFFFF' }}>
                        <Phone size={14} style={{ color: 'var(--adm-accent-blue)' }} />
                        <a href={`tel:${hub.phone.replace(/[^0-9+]/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }}>{hub.phone}</a>
                      </div>
                    )}
                    {hub.altPhone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FFFFFF' }}>
                        <Phone size={14} style={{ color: 'var(--adm-accent-blue)' }} />
                        <a href={`tel:${hub.altPhone.replace(/[^0-9+]/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }}>{hub.altPhone}</a>
                      </div>
                    )}
                    {hub.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FFFFFF' }}>
                        <Mail size={14} style={{ color: 'var(--adm-accent-blue)' }} />
                        <a href={`mailto:${hub.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{hub.email}</a>
                      </div>
                    )}
                    {hub.manager && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--adm-text-muted)', fontSize: 12, marginTop: 4 }}>
                        <User size={13} />
                        <span>{hub.manager}</span>
                      </div>
                    )}
                    {hub.hours && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--adm-text-muted)', fontSize: 12 }}>
                        <Clock size={13} />
                        <span>{hub.hours}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // 9. FORM BLOCK
      case 'form_lead': {
        const formAnchorId = block.anchorId || (block.formType === 'service' ? 'service-form' : block.formType === 'contact' ? 'feedback-form' : 'lead-form');
        return (
          <div className="builder-form-block" id="lead-form" style={{ maxWidth: 640, margin: '0 auto', background: 'rgba(255,255,255,0.02)', padding: '36px 30px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
            {formAnchorId !== 'lead-form' && <div id={formAnchorId} style={{ position: 'relative', top: -80 }} />}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              {block.badge && <span className="section-badge" style={{ marginBottom: 8, display: 'inline-block' }}>{block.badge}</span>}
              <h2 className="section-title" style={{ fontSize: 24, marginBottom: 8 }}>{withBrandWord(block.title || 'Оставить заявку')}</h2>
              {block.subtitle && <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>{block.subtitle}</p>}
            </div>

            {formSubmitted ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <CheckCircle2 size={44} style={{ color: 'var(--adm-accent-green)', margin: '0 auto 12px' }} />
                <h4 style={{ color: '#FFFFFF', margin: '0 0 6px 0', fontSize: 18 }}>Заявка успешно отправлена</h4>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: 0 }}>Менеджер завода свяжется с вами в ближайшее рабочее время.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input
                  type="text"
                  required
                  placeholder="Ваше имя или представитель"
                  className="admin-input"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', fontSize: 14 }}
                />
                <input
                  type="text"
                  placeholder="Название компании / Город"
                  className="admin-input"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', fontSize: 14 }}
                />
                <input
                  type="tel"
                  required
                  placeholder="Телефон для связи (+7 ...)"
                  className="admin-input"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', fontSize: 14 }}
                />
                <textarea
                  rows={3}
                  placeholder="Комментарий или интересующие позиции"
                  className="admin-input"
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', fontSize: 14, resize: 'vertical' }}
                />
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
                  <span>{block.submitText || 'Отправить заявку в отдел продаж'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        );
      }

      // 10. FAQ BLOCK
      case 'faq':
        return (
          <div className="builder-faq-block" style={{ maxWidth: 840, margin: align === 'center' ? '0 auto' : '0' }}>
            <div style={{ textAlign: align, marginBottom: 32 }}>
              {block.badge && <span className="section-badge" style={{ marginBottom: 10, display: 'inline-block' }}>{block.badge}</span>}
              <h2 className="section-title" style={{ marginBottom: 10 }}>{withBrandWord(block.title || 'Вопросы и ответы')}</h2>
              {block.subtitle && <p className="section-desc" style={{ maxWidth: 700, margin: align === 'center' ? '0 auto' : '0' }}>{block.subtitle}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(block.items || []).map((faqItem, idx) => {
                const isOpen = openFaqIndices.includes(idx);
                return (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                    <div
                      onClick={() => toggleFaq(idx)}
                      style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}
                    >
                      <h4 style={{ margin: 0, fontSize: 15, color: '#FFFFFF', fontWeight: 600 }}>{faqItem.question}</h4>
                      <ChevronDown size={18} style={{ color: '#D4AF37', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                    </div>
                    {isOpen && (
                      <div style={{ padding: '0 20px 18px', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        {faqItem.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      // 11. CATALOG PREVIEW BLOCK
      case 'catalog_preview': {
        const prods = (catalogList.length > 0 ? catalogList : products).slice(0, block.limit || 6);
        return (
          <div className="builder-catalog-block">
            <div style={{ textAlign: align, marginBottom: 32 }}>
              {block.badge && <span className="section-badge" style={{ marginBottom: 10, display: 'inline-block' }}>{block.badge}</span>}
              <h2 className="section-title" style={{ marginBottom: 10 }}>{withBrandWord(block.title || 'Популярная продукция')}</h2>
              {block.subtitle && <p className="section-desc" style={{ maxWidth: 700, margin: align === 'center' ? '0 auto' : '0' }}>{block.subtitle}</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', gap: 20 }}>
              {prods.map((prod, idx) => {
                const priceVal = prod.price || prod.priceRRC;
                const curr = prod.currency || '₸';
                return (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 8, marginBottom: 12, overflow: 'hidden' }}>
                      {prod.photo1 ? (
                        <img src={getImgSrc(prod.photo1)} alt={prod.name} style={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--adm-text-muted)' }}>Фото отсутствует</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#D4AF37', fontWeight: 600, marginBottom: 4 }}>{prod.article}</div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: 14, color: '#FFFFFF', flex: 1 }}>{prod.name}</h4>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', marginTop: 8 }}>
                      {priceVal ? `${Number(priceVal).toLocaleString('ru-RU')} ${curr}` : 'По запросу'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      // 12. CTA BANNER BLOCK
      case 'cta_banner':
        return (
          <div className="builder-cta-banner-block" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(18,23,33,0.9) 100%)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 16, padding: '48px 36px', textAlign: align, maxWidth: 980, margin: '0 auto' }}>
            {block.badge && <span className="section-badge" style={{ marginBottom: 12, display: 'inline-block' }}>{block.badge}</span>}
            <h2 className="section-title" style={{ fontSize: 'clamp(1.8rem, 2.8vw, 2.4rem)', marginBottom: 14 }}>{withBrandWord(block.title || '')}</h2>
            {block.subtitle && <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', maxWidth: 680, margin: align === 'center' ? '0 auto 26px' : '0 0 26px', lineHeight: 1.6 }}>{block.subtitle}</p>}
            {block.buttonText && (
              <a
                href={isSafeActionLink(block.buttonLink) ? block.buttonLink || '#' : '#'}
                  target={block.buttonNewTab && /^https?:/i.test(block.buttonLink || '') ? '_blank' : undefined}
                  rel={block.buttonNewTab ? 'noopener noreferrer' : undefined}
                className={'btn btn-' + (block.buttonType || 'gold')}
                onClick={(e) => handleLinkClick(e, block.buttonLink)}
              >
                <span>{block.buttonText}</span>
                <ArrowRight size={16} />
              </a>
            )}
          </div>
        );

      // 13. DIVIDER
      case 'divider':
        return (
          <div className="builder-divider-block" style={{ padding: '24px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)', width: '80%', maxWidth: 600 }}></div>
          </div>
        );

      default:
        return (
          <div style={{ padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 8, color: 'var(--adm-text-muted)' }}>
            Неизвестный тип блока: {block.type}
          </div>
        );
    }
  };

  return (
    <section
      id={block.anchor || (block.type === 'form_lead' ? 'lead-form' : block.id)}
      className={`builder-block-wrapper ${isEditor ? 'editor-mode' : ''} ${isSelected ? 'is-selected' : ''}`}
      style={{
        background: sectionBg,
        padding: block.type === 'system_page' ? 0 : sectionPadding,
        position: 'relative',
        transition: 'all 0.2s ease',
        outline: isEditor ? (isSelected ? '2px solid var(--adm-accent-blue)' : '1px dashed rgba(255,255,255,0.12)') : 'none',
        outlineOffset: -2
      }}
      onClick={(e) => {
        if (isEditor && onSelectBlock) {
          e.stopPropagation();
          onSelectBlock(block, index);
        }
      }}
    >
      {/* Floating Toolbar on Hover / Selection in Editor Mode */}
      {isEditor && (
        <div
          className="builder-block-toolbar"
          style={{
            position: 'absolute',
            top: 6,
            right: 12,
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'var(--adm-surface-card)',
            padding: '3px 6px',
            borderRadius: 6,
            border: '1px solid var(--adm-border)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            opacity: isSelected ? 1 : 0.85
          }}
          onClick={e => e.stopPropagation()}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--adm-accent-amber)', padding: '2px 6px', textTransform: 'uppercase' }}>
            #{index + 1} {block.type}
          </span>

          <button
            type="button"
            className="action-btn"
            disabled={index === 0}
            onClick={() => onMoveUp && onMoveUp(index)}
            title="Переместить выше"
            style={{ padding: 4, height: 24, width: 24 }}
          >
            <ArrowUp size={12} />
          </button>

          <button
            type="button"
            className="action-btn"
            disabled={index === totalBlocks - 1}
            onClick={() => onMoveDown && onMoveDown(index)}
            title="Переместить ниже"
            style={{ padding: 4, height: 24, width: 24 }}
          >
            <ArrowDown size={12} />
          </button>

          <button
            type="button"
            className="action-btn"
            disabled={block.type === 'system_page'}
            onClick={() => onDuplicate && onDuplicate(block, index)}
            title="Дублировать блок"
            style={{ padding: 4, height: 24, width: 24 }}
          >
            <Copy size={12} />
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={() => onAddBelow && onAddBelow(index)}
            title="Добавить блок ниже"
            style={{ padding: 4, height: 24, width: 24, color: 'var(--adm-accent-blue)' }}
          >
            <Plus size={12} />
          </button>

          <button
            type="button"
            className="action-btn"
            disabled={block.type === 'system_page'}
            onClick={() => {
              if (window.confirm(`Удалить блок #${index + 1} (${block.title || block.type})?`)) {
                onDelete && onDelete(index);
              }
            }}
            title="Удалить блок"
            style={{ padding: 4, height: 24, width: 24, color: 'var(--adm-accent-red)' }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      <div className={block.type === 'system_page' ? undefined : 'container'} style={{ position: 'relative' }}>
        {renderContent()}
      </div>
    </section>
  );
};
