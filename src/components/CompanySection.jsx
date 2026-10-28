import React, { useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { resolveMediaUrl, submitLeadInquiry } from '../services/adminApi';
import { REGIONS_CONFIG } from '../data/regionsData';
import { localizeCompanyBlock } from '../data/factoryStory';
import { InquiryFeedback } from './InquiryFeedback';
import { isSafeActionLink } from './SiteAction';
import './company-page.css';

const words = {
  ru: { partner: 'Обсудить сотрудничество', production: 'Увидеть производство', catalog: 'Перейти в каталог', contacts: 'Действующие контакты', service: 'Обратиться в сервис', more: 'Адреса на исходной карте', source: 'Материалы страницы', name: 'ФИО', business: 'Формат бизнеса · можно несколько', city: 'Город', email: 'Email', phone: 'Телефон', message: 'Твой запрос', region: 'Регион обращения', send: 'Отправить заявку', success: 'Почтовый сервис принял заявку. Команда LAUTE свяжется с тобой.', notice: 'Отправляя заявку, ты передаёшь указанные данные команде LAUTE для ответа на обращение.', map: 'Схема присутствия по карте laute.ltd', archive: 'Историческая ссылка на Amazon', range: 'В каталоге старого сайта: смесители для кухни и ванной, душевая программа, аксессуары, комплектующие, линия «Управляй водой» и многофункциональные мойки.', care: 'Гарантия конкретной модели определяется её талоном. Сохрани талон и упаковку. Для сервиса нужны описание неисправности, фото или видео изделия и дефекта, а также чек. Повреждения при неквалифицированной установке и применение агрессивных чистящих средств исключены из гарантийного обслуживания.', response: 'На исходной странице указан обратный звонок в течение дня. Точный срок ответа уточняется при обращении.' },
  en: { partner: 'Discuss a partnership', production: 'Explore production', catalog: 'Browse the catalog', contacts: 'Current contacts', service: 'Contact service', more: 'Addresses on the source map', source: 'Page sources', name: 'Full name', business: 'Business type · select all that apply', city: 'City', email: 'Email', phone: 'Phone', message: 'Your enquiry', region: 'Enquiry region', send: 'Send enquiry', success: 'The mail service accepted your enquiry. The LAUTE team will contact you.', notice: 'By submitting, you share these details with the LAUTE team so they can respond to your enquiry.', map: 'Schematic locations from the laute.ltd map', archive: 'Historical Amazon link', range: 'The original catalog includes kitchen and bathroom faucets, shower products, accessories, spare parts, the “Control Water” component line and multifunctional sinks.', care: 'The warranty card defines the warranty for each model. Keep the card and packaging. For service, prepare a fault description, photos or video of the product and defect, and the receipt. Damage from unqualified installation and the use of aggressive cleaning agents are excluded from warranty service.', response: 'The source page mentions a callback within a day. Confirm the current response time when enquiring.' },
  kz: { partner: 'Серіктестікті талқылау', production: 'Өндірісті көру', catalog: 'Каталогқа өту', contacts: 'Қазіргі байланыс деректері', service: 'Сервиске хабарласу', more: 'Бастапқы картадағы мекенжайлар', source: 'Парақша дереккөздері', name: 'Аты-жөні', business: 'Бизнес түрі · бірнешеуін таңдауға болады', city: 'Қала', email: 'Email', phone: 'Телефон', message: 'Сұрағыңыз', region: 'Өтініш өңірі', send: 'Өтініш жіберу', success: 'Пошта қызметі өтінішті қабылдады. LAUTE тобы сізбен хабарласады.', notice: 'Өтініш жіберу арқылы жауап алу үшін осы деректерді LAUTE тобына бересіз.', map: 'laute.ltd картасындағы нүктелердің сызбасы', archive: 'Amazon-дағы бұрынғы сілтеме', range: 'Бастапқы каталогта асүй және ванна араластырғыштары, душ өнімдері, аксессуарлар, қосалқы бөлшектер, «Суды басқар» желісі және көпфункциялы жуғыштар бар.', care: 'Әр модельдің кепілдігі оның талонымен анықталады. Талон мен қаптаманы сақтаңыз. Сервиске ақау сипаттамасы, өнім мен ақаудың фотосы немесе бейнесі және чек қажет. Біліксіз орнатудан болған зақымдар мен агрессивті тазартқыштарды қолдану кепілдікке кірмейді.', response: 'Бастапқы парақшада бір күн ішінде кері қоңырау көрсетілген. Қазіргі жауап беру мерзімін өтініш бергенде нақтылаңыз.' }
};

function CompanyInquiry({ block, isEditor, w }) {
  const { region, lang } = useApp();
  const [values, setValues] = useState({ contactPerson: '', city: '', email: '', phone: '', comment: '', businessFormats: [], region: region || 'siberia' });
  const [sending, setSending] = useState(false), [error, setError] = useState(''), [sent, setSent] = useState(false);
  const guard = useRef(false);
  const set = (key, value) => setValues(v => ({ ...v, [key]: value }));
  const submit = async e => {
    e.preventDefault();
    if (isEditor || guard.current) return;
    guard.current = true; setSending(true); setError('');
    try { await submitLeadInquiry({ source: 'company_partner', ...values }); setSent(true); }
    catch (err) { setError(err.message || (lang === 'en' ? 'Please try again.' : lang === 'kz' ? 'Қайталап көріңіз.' : 'Повтори попытку.')); }
    finally { guard.current = false; setSending(false); }
  };
  return <div className="company-inquiry-layout"><div><span className="company-kicker">06 / PARTNERSHIP</span><h2>{block.title}</h2><p>{block.subtitle}</p><p className="company-small">{w.response}</p></div>
    {sent ? <div className="company-success" role="status"><CheckCircle2 size={32}/><p>{w.success}</p></div> : <form onSubmit={submit} className="company-form">
      <InquiryFeedback sending={sending} error={error}/>
      <label>{w.name} *<input autoComplete="name" required maxLength={160} value={values.contactPerson} onChange={e => set('contactPerson', e.target.value)}/></label>
      <fieldset><legend>{w.business}</legend><div className="company-choices">{(block.items || []).map((option, i) => {
        const value = option.id || `business-${i}`;
        const checked = values.businessFormats.some(x => x.id === value);
        return <label key={value}><input type="checkbox" checked={checked} onChange={e => set('businessFormats', e.target.checked ? [...values.businessFormats, { id: value, label: option.title }] : values.businessFormats.filter(x => x.id !== value))}/><span>{option.title}</span></label>;
      })}</div></fieldset>
      <div className="company-field-pair"><label>{w.region}<select value={values.region} onChange={e => set('region', e.target.value)}>{REGIONS_CONFIG.map(r => <option key={r.id} value={r.id}>{r.names[lang] || r.names.ru}</option>)}</select></label><label>{w.city} *<input required autoComplete="address-level2" maxLength={160} value={values.city} onChange={e => set('city', e.target.value)}/></label></div>
      <div className="company-field-pair"><label>{w.email} *<input required type="email" autoComplete="email" maxLength={254} value={values.email} onChange={e => set('email', e.target.value)}/></label><label>{w.phone} *<input required type="tel" autoComplete="tel" maxLength={50} value={values.phone} onChange={e => set('phone', e.target.value)}/></label></div>
      <label>{w.message}<textarea rows={4} maxLength={5000} value={values.comment} onChange={e => set('comment', e.target.value)}/></label>
      <p className="company-small">{w.notice}</p><button type="submit" className="btn btn-primary" disabled={sending || isEditor} aria-busy={sending}><span>{w.send}</span><ArrowUpRight size={18}/></button>
    </form>}
  </div>;
}

export function CompanySection({ block: source, isEditor = false }) {
  const { lang, navigateTo } = useApp();
  const block = localizeCompanyBlock(source, lang), w = words[lang] || words.ru;
  const section = block.companySection;
  const link = (href, label, primary = false) => <a className={`btn btn-${primary ? 'primary' : 'outline'}`} href={href.startsWith('/') ? resolveMediaUrl(href.slice(1)) : href} onClick={e => {
    if (isEditor) { e.preventDefault(); return; }
    if (href.startsWith('#')) { e.preventDefault(); document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (href.startsWith('/') && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) { e.preventDefault(); navigateTo(href.slice(1)); }
  }}><span>{label}</span><ArrowUpRight size={18}/></a>;
  const heading = (number, label) => <div className="company-section-heading"><span className="company-kicker">{number} / {label}</span><h2>{block.title}</h2><p>{block.subtitle}</p></div>;
  const actionHref = isSafeActionLink(block.buttonLink) ? block.buttonLink : null;
  return <div className={`company-section company-section--${section}`}>
    {section === 'hero' && <div className="company-hero"><div className="company-hero-copy"><span className="company-kicker">{block.badge}</span><h1>{block.title}</h1><p>{block.subtitle}</p><div className="company-actions">{actionHref && link(actionHref, block.buttonText || w.partner, true)}<a className="company-text-link" href="#company-v2-production" onClick={e => { e.preventDefault(); if (!isEditor) document.getElementById('company-v2-production')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{w.production}<ArrowDown size={16}/></a></div><div className="company-hero-foot"><span>1998 — 2024</span><span>HANNOVER → WENZHOU → WORLD</span></div></div><figure><img src={resolveMediaUrl(block.imageUrl)} width="939" height="623" fetchpriority="high" alt={lang === 'en' ? 'Casting a faucet body, from LAUTE company materials' : lang === 'kz' ? 'Араластырғыш корпусын құю, LAUTE материалдарынан' : 'Литьё корпуса смесителя, материалы LAUTE'}/><figcaption>LAUTE / {lang === 'ru' ? 'ИСТОКИ ПРОИЗВОДСТВА' : lang === 'kz' ? 'ӨНДІРІС БАСТАУЫ' : 'PRODUCTION ORIGINS'}</figcaption></figure></div>}
    {section === 'scale' && <>{heading('01', 'SCALE')}<div className="company-stats">{block.items?.map((x, i) => <article key={i}><strong>{x.title}</strong><p>{x.desc}</p></article>)}</div></>}
    {section === 'history' && <>{heading('02', 'HISTORY')}<ol className="company-timeline">{block.items?.map((x, i) => <li key={i}><span className="company-year">{x.year}</span><div><h3>{x.title}</h3><p>{x.desc}</p>{x.link && /^https:\/\//.test(x.link) && <a href={x.link} target="_blank" rel="noopener noreferrer">{w.archive} ↗</a>}</div></li>)}</ol></>}
    {section === 'production' && <>{heading('03', 'PRODUCTION')}<div className="company-process">{block.items?.map((x, i) => <figure key={i}><div className="company-process-photo"><img src={resolveMediaUrl(x.imageUrl)} alt={x.title} loading="lazy" decoding="async" width="939" height="623"/><span>{String(i + 1).padStart(2, '0')}</span></div><figcaption><h3>{x.title}</h3><p>{x.desc}</p></figcaption></figure>)}</div></>}
    {section === 'range' && <>{heading('04', 'PRODUCTS & CARE')}<div className="company-guarantees">{block.items?.map((x, i) => <article key={i}><h3>{x.title}</h3><p>{x.desc}</p></article>)}</div><div className="company-care"><p>{w.range}</p><p>{lang === 'ru' ? block.content?.slice(block.content.indexOf('Гарантия конкретной')) || w.care : w.care}</p><div className="company-actions">{actionHref && link(actionHref, block.buttonText || w.catalog, true)}{link('/service', w.service)}</div></div></>}
    {section === 'geography' && <>{heading('05', 'GEOGRAPHY')}<div className="company-map" role="img" aria-label={w.map}><svg viewBox="0 0 1000 420" aria-hidden="true"><defs><pattern id="company-map-grid" width="83.333" height="70" patternUnits="userSpaceOnUse"><path d="M83.333 0H0V70" fill="none" stroke="#ffffff12"/></pattern></defs><rect width="1000" height="420" fill="url(#company-map-grid)"/>
      <image href={resolveMediaUrl('images/factory/world-outline.svg')} width="1000" height="420"/>
      {block.items?.map((x, i) => <g key={i} transform={`translate(${(x.lng + 180) / 360 * 1000},${(90 - x.lat) / 180 * 420})`}><circle r="10" fill="#c8a77422"/><circle r="4" fill="#d8bd93"/><title>{x.title}</title></g>)}
    </svg><span>{w.map}</span></div><div className="company-location-tags">{block.items?.map((x, i) => <span key={i}>{x.title.split(' / ')[lang === 'en' ? 1 : lang === 'kz' && x.title.split(' / ')[2] ? 2 : 0] || x.title}</span>)}</div><details className="company-addresses"><summary>{w.more}</summary><div>{block.items?.map((x, i) => <article key={i}><h3>{x.title}</h3><p>{x.desc}</p></article>)}</div></details>{actionHref && link(actionHref, block.buttonText || w.contacts)}</>}
    {section === 'inquiry' && <><CompanyInquiry block={block} isEditor={isEditor} w={w}/><div className="company-sources"><span>{w.source}</span><a href="https://laute.ltd/company" target="_blank" rel="noopener noreferrer">LAUTE / COMPANY ↗</a><a href="https://laute.ltd/catalog" target="_blank" rel="noopener noreferrer">CATALOG ↗</a><a href="https://laute.ltd/partner" target="_blank" rel="noopener noreferrer">PARTNERSHIP ↗</a><a href="https://laute.ltd/service" target="_blank" rel="noopener noreferrer">SERVICE ↗</a></div></>}
  </div>;
}
