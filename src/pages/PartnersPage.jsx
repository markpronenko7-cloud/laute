import React, { useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BlockRenderer } from '../components/builder/BlockRenderer';
import { InquiryFeedback } from '../components/InquiryFeedback';
import { partnership, ROLE_CODES, ROLE_EXPANSIONS } from '../data/partnership';
import { getRegionConfig, PARTNER_REGIONS, REGIONS_CONFIG } from '../data/regionsData';
import { submitLeadInquiry } from '../services/adminApi';
import { getPublishedPage } from '../utils/pagePublication';
import './partnership.css';

const base = import.meta.env.BASE_URL;
const photo = name => base + 'images/partnership/' + name + '.webp';
const models = [
  { article: 'ETH103D', collection: 'Ethereum', finish: 0 },
  { article: 'ETH163GQ', collection: 'Ethereum', finish: 1 },
  { article: 'A0163', collection: 'A01', finish: 2 }
];
const regions = [
  ...REGIONS_CONFIG,
  PARTNER_REGIONS.find(option => option.id === 'other')
];

function Jump({ target = 'partnership-form', children, secondary = false, onClick }) {
  return <a href={'#' + target} className={secondary ? 'partnership-jump partnership-jump-alt' : 'partnership-jump water-cta'} onClick={event => {
    event.preventDefault();
    onClick?.();
    const section = document.getElementById(target);
    section?.focus({ preventScroll: true });
    section?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }}>{children}<ArrowDown size={16} aria-hidden="true" /></a>;
}

function PartnershipForm({ copy, lang, role, setRole }) {
  const { region } = useApp();
  const [chosenRegion, setChosenRegion] = useState('');
  const [status, setStatus] = useState('idle');
  const pending = useRef(false);
  const currentRegion = chosenRegion || region || 'siberia';
  const contact = getRegionConfig(currentRegion);
  const email = currentRegion === 'other' ? 'opt@laute.ltd' : contact.primaryEmail;

  const submit = async event => {
    event.preventDefault();
    if (pending.current) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    pending.current = true;
    setStatus('sending');
    try {
      await submitLeadInquiry({ ...fields, region: currentRegion, role, source: 'partnership_page' });
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      pending.current = false;
    }
  };

  return <section className="partnership-form-wrap" id="partnership-form" tabIndex={-1}>
    <div className="container partnership-split">
      <div>
        <h2>{copy.form}</h2>
        <p>{copy.formText}</p>
        <div className="partnership-contacts">
          <a href={'mailto:' + email}>{email}</a>
          <a href={'tel:' + contact.primaryPhone.replace(/[^+\d]/g, '')}>{contact.primaryPhone}</a>
        </div>
      </div>
      <div className="partnership-form-card">
        {status === 'success' ? <p role="status">{copy.success}</p> : <form onSubmit={submit}>
          <fieldset disabled={status === 'sending'}>
            <label>{copy.name}<input className="form-input" name="fullName" autoComplete="name" required maxLength={200} /></label>
            <label>{copy.role}<select className="form-select" required value={role} onChange={event => setRole(event.target.value)}>
              <option value="">{copy.choose}</option>
              {ROLE_CODES.map((code, index) => <option key={code} value={code}>{copy.roles[index][0]} · {code}</option>)}
            </select></label>
            <label>{copy.region}<select className="form-select" required value={currentRegion} onChange={event => setChosenRegion(event.target.value)}>
              {regions.map(option => <option key={option.id} value={option.id}>{option.names[lang] || option.names.ru}</option>)}
            </select></label>
            <label>{copy.territory}<input className="form-input" name="territory" required={role === 'DAP' || currentRegion === 'other'} maxLength={250} /></label>
            <label>{copy.email}<input className="form-input" type="email" name="email" autoComplete="email" required maxLength={250} /></label>
            <label>{copy.phone}<input className="form-input" type="tel" name="phone" autoComplete="tel" required maxLength={50} /></label>
            <label className="partnership-form-wide">{copy.experience}<textarea className="form-input" name="comment" rows={4} maxLength={3000} required={role !== 'RAP'} placeholder={copy.comment} /></label>
          </fieldset>
          <InquiryFeedback sending={status === 'sending'} error={status === 'error' ? copy.error : ''} />
          <button type="submit" className="partnership-jump water-cta" disabled={status === 'sending'}>{copy.submit}<ArrowUpRight size={16} aria-hidden="true" /></button>
        </form>}
      </div>
    </div>
  </section>;
}

export const PartnersPage = () => {
  const { pagesList = [], lang, products, openProductModal, openAuthModal } = useApp();
  const copy = partnership[lang] || partnership.ru;
  const [expanded, setExpanded] = useState('');
  const [role, setRole] = useState('');
  const published = getPublishedPage(pagesList.find(page => page.slug === 'partners' || page.published?.slug === 'partners'), true);
  const customBlocks = (published?.blocks || []).filter(block => !['blk-part-hero', 'blk-part-features', 'blk-part-form'].includes(block.id));

  return <div className="partnership">
    <header className="partnership-hero">
      <div className="container partnership-hero-layout">
        <div className="partnership-hero-copy">
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
          <div className="partnership-actions">
            <Jump target="partnership-roles">{copy.choose}</Jump>
            <Jump secondary>{copy.discuss}</Jump>
          </div>
          <button type="button" className="partnership-account" onClick={openAuthModal}>{copy.account} <ArrowUpRight size={15} aria-hidden="true" /></button>
        </div>
        <figure className="partnership-hero-feature">
          <div className="partnership-hero-photo">
            <img src={photo('laute-showroom')} alt={copy.heroAlt} width="1536" height="864" fetchPriority="high" />
          </div>
          <figcaption><strong>LAUTE Leo</strong><span>LEO101Q · {copy.finishes[1]}</span></figcaption>
        </figure>
      </div>
    </header>

    <section className="partnership-role-wrap" id="partnership-roles" tabIndex={-1}>
      <div className="container partnership-section partnership-split">
        <div>
          <h2>{copy.rolesTitle}</h2>
          <p>{copy.rolesQuestion}</p>
        </div>
        <div className="partnership-role-list">
          {copy.roles.map(([name, tagline, description], index) => {
            const code = ROLE_CODES[index];
            const open = expanded === code;
            return <article className="partnership-role" data-open={open} key={code}>
              <h3><button type="button" aria-expanded={open} aria-controls={'partnership-role-' + code}
                onClick={() => { setExpanded(open ? '' : code); setRole(code); }}>
                <span className="partnership-role-code">{code}</span>
                <span>{name}<small>{tagline}</small></span>
                <ChevronDown size={19} aria-hidden="true" />
              </button></h3>
              <div id={'partnership-role-' + code} hidden={!open} className="partnership-role-details">
                <small lang="en">{ROLE_EXPANSIONS[index]}</small>
                <p>{description}</p>
                <Jump onClick={() => setRole(code)}>{copy.discussRole}</Jump>
              </div>
            </article>;
          })}
        </div>
      </div>
    </section>

    <section className="container partnership-section partnership-split partnership-story">
      <div>
        <h2>{copy.about}</h2>
        {copy.story.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </div>
      <figure>
        <img src={photo('design-study')} alt="" loading="lazy" />
        <figcaption>{copy.caption}</figcaption>
      </figure>
    </section>

    <section className="container partnership-section partnership-benefits">
      <h2>{copy.benefitsTitle}</h2>
      <ol className="partnership-grid partnership-three">
        {copy.benefits.map((benefit) => <li key={benefit}>
          <p>{benefit}</p>
        </li>)}
      </ol>
    </section>

    <section className="partnership-banner">
      <div className="container partnership-split">
        <div><h2>{copy.banner}</h2><p>{copy.bannerText}</p></div>
        <Jump>{copy.bannerCta}</Jump>
      </div>
    </section>

    <section className="container partnership-section">
      <h2>{copy.showcase}</h2>
      <div className="partnership-grid partnership-three">
        {models.map(({ article, collection, finish }) => {
          const product = products.find(item => item.article === article);
          return <article key={article} className="partnership-product">
            <img src={photo(article.toLowerCase())} alt={'LAUTE ' + collection + ' ' + article} loading="lazy" />
            <div>
              <span className="partnership-eyebrow">{article}</span>
              <h3>LAUTE {collection}</h3>
              <p>{copy.finishes[finish]}</p>
              <a href={base + 'catalog?product=' + article} onClick={event => {
                if (!product || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                openProductModal(product);
              }}>{copy.model} <ArrowUpRight size={16} aria-hidden="true" /></a>
            </div>
          </article>;
        })}
      </div>
      <a className="partnership-catalog-link" href={base + 'catalog'}>{copy.catalog} <ArrowUpRight size={16} aria-hidden="true" /></a>
    </section>

    <section className="container partnership-section">
      <h2>{copy.stagesTitle}</h2>
      <ol className="partnership-grid partnership-stages">
        {copy.stages.map(([title, description], index) => <li key={title}>
          <span className="partnership-eyebrow">{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{description}</p>
        </li>)}
      </ol>
      <Jump>{copy.firstStep}</Jump>
    </section>

    <PartnershipForm copy={copy} lang={lang} role={role} setRole={setRole} />
    {customBlocks.map((block, index) => <BlockRenderer key={block.id || index} block={block} index={index}
      totalBlocks={customBlocks.length} isEditor={false} />)}
  </div>;
};

export default PartnersPage;
