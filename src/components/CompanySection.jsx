import React, { useId, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, CheckCircle2, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { resolveMediaUrl, submitLeadInquiry } from '../services/adminApi';
import { PARTNER_REGIONS, getPartnerRegion } from '../data/regionsData';
import { localizeCompanyBlock } from '../data/factoryStory';
import { InquiryFeedback } from './InquiryFeedback';
import { isSafeActionLink } from './SiteAction';
import './company-page.css';

const words = {
  ru: { partner: 'Обсудить сотрудничество', production: 'Увидеть производство', catalog: 'Перейти в каталог', contacts: 'Контакты команды', service: 'Обратиться в сервис', more: 'Офисы и склады · адреса из презентации', source: 'Материалы страницы', name: 'ФИО', business: 'Формат бизнеса · можно несколько', city: 'Город', email: 'Email', phone: 'Телефон', message: 'Ваш запрос', region: 'Регион обращения', send: 'Отправить заявку', success: 'Почтовый сервис принял заявку. Команда LAUTE свяжется с тобой.', notice: 'Отправляя заявку, вы передаёте эти данные команде LAUTE для ответа на обращение.', map: 'Международная сеть LAUTE', archive: 'Историческая ссылка на Amazon', range: 'В каталоге старого сайта: смесители для кухни и ванной, душевая программа, аксессуары, комплектующие, линия «Управляй водой» и многофункциональные мойки.', care: 'Гарантия конкретной модели определяется её талоном. Сохрани талон и упаковку. Для сервиса нужны описание неисправности, фото или видео изделия и дефекта, а также чек. Повреждения при неквалифицированной установке и применение агрессивных чистящих средств исключены из гарантийного обслуживания.', response: 'На исходной странице указан обратный звонок в течение дня. Точный срок ответа уточняется при обращении.' },
  en: { partner: 'Discuss a partnership', production: 'Explore production', catalog: 'Browse the catalog', contacts: 'Current contacts', service: 'Contact service', more: 'Offices and warehouses · presentation addresses', source: 'Page sources', name: 'Full name', business: 'Business type · select all that apply', city: 'City', email: 'Email', phone: 'Phone', message: 'Your enquiry', region: 'Enquiry region', send: 'Send enquiry', success: 'The mail service accepted your enquiry. The LAUTE team will contact you.', notice: 'By submitting, you share these details with the LAUTE team so they can respond to your enquiry.', map: 'LAUTE international network', archive: 'Historical Amazon link', range: 'The original catalog includes kitchen and bathroom faucets, shower products, accessories, spare parts, the “Control Water” component line and multifunctional sinks.', care: 'The warranty card defines the warranty for each model. Keep the card and packaging. For service, prepare a fault description, photos or video of the product and defect, and the receipt. Damage from unqualified installation and the use of aggressive cleaning agents are excluded from warranty service.', response: 'The source page mentions a callback within a day. Confirm the current response time when enquiring.' },
  kz: { partner: 'Серіктестікті талқылау', production: 'Өндірісті көру', catalog: 'Каталогқа өту', contacts: 'Қазіргі байланыс деректері', service: 'Сервиске хабарласу', more: 'Бастапқы картадағы мекенжайлар', source: 'Парақша дереккөздері', name: 'Аты-жөні', business: 'Бизнес түрі · бірнешеуін таңдауға болады', city: 'Қала', email: 'Email', phone: 'Телефон', message: 'Сұрағыңыз', region: 'Өтініш өңірі', send: 'Өтініш жіберу', success: 'Пошта қызметі өтінішті қабылдады. LAUTE тобы сізбен хабарласады.', notice: 'Өтініш жіберу арқылы жауап алу үшін осы деректерді LAUTE тобына бересіз.', map: 'laute.ltd картасындағы нүктелердің сызбасы', archive: 'Amazon-дағы бұрынғы сілтеме', range: 'Бастапқы каталогта асүй және ванна араластырғыштары, душ өнімдері, аксессуарлар, қосалқы бөлшектер, «Суды басқар» желісі және көпфункциялы жуғыштар бар.', care: 'Әр модельдің кепілдігі оның талонымен анықталады. Талон мен қаптаманы сақтаңыз. Сервиске ақау сипаттамасы, өнім мен ақаудың фотосы немесе бейнесі және чек қажет. Біліксіз орнатудан болған зақымдар мен агрессивті тазартқыштарды қолдану кепілдікке кірмейді.', response: 'Бастапқы парақшада бір күн ішінде кері қоңырау көрсетілген. Қазіргі жауап беру мерзімін өтініш бергенде нақтылаңыз.' }
};

function CompanyInquiry({ block, isEditor, w }) {
  const { region, lang } = useApp();
  const [values, setValues] = useState({ contactPerson: '', city: '', email: '', phone: '', comment: '', businessFormats: [], region: getPartnerRegion(region || 'siberia') });
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
  return <div className="company-inquiry-layout"><div><span className="company-kicker">{lang === 'en' ? 'PARTNERSHIP' : lang === 'kz' ? 'СЕРІКТЕСТІК' : 'СОТРУДНИЧЕСТВО'}</span><h2>{block.title}</h2><p>{block.subtitle}</p></div>
    {sent ? <div className="company-success" role="status"><CheckCircle2 size={32}/><p>{w.success}</p></div> : <form onSubmit={submit} className="company-form">
      <InquiryFeedback sending={sending} error={error}/>
      <label>{w.name} *<input autoComplete="name" required maxLength={160} value={values.contactPerson} onChange={e => set('contactPerson', e.target.value)}/></label>
      <fieldset><legend>{w.business}</legend><div className="company-choices">{(block.items || []).map((option, i) => {
        const value = option.id || `business-${i}`;
        const checked = values.businessFormats.some(x => x.id === value);
        return <label key={value}><input type="checkbox" checked={checked} onChange={e => set('businessFormats', e.target.checked ? [...values.businessFormats, { id: value, label: option.title }] : values.businessFormats.filter(x => x.id !== value))}/><span>{option.title}</span></label>;
      })}</div></fieldset>
      <div className="company-field-pair"><label>{w.region}<select value={values.region} onChange={e => set('region', e.target.value)}>{PARTNER_REGIONS.map(r => <option key={r.id} value={r.id}>{r.names[lang] || r.names.ru}</option>)}</select></label><label>{w.city} *<input required autoComplete="address-level2" maxLength={160} value={values.city} onChange={e => set('city', e.target.value)}/></label></div>
      <div className="company-field-pair"><label>{w.email} *<input required type="email" autoComplete="email" maxLength={254} value={values.email} onChange={e => set('email', e.target.value)}/></label><label>{w.phone} *<input required type="tel" autoComplete="tel" maxLength={50} value={values.phone} onChange={e => set('phone', e.target.value)}/></label></div>
      <label>{w.message}<textarea rows={4} maxLength={5000} value={values.comment} onChange={e => set('comment', e.target.value)}/></label>
      <p className="company-small">{w.notice}</p><button type="submit" className="btn btn-primary" disabled={sending || isEditor} aria-busy={sending}><span>{w.send}</span><ArrowUpRight size={18}/></button>
    </form>}
  </div>;
}

function CompanyProduction({ items = [], label, lang }) {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const active = selected === null ? null : Math.min(selected, Math.max(0, items.length - 1));
  if (!items.length) return null;
  const w = {
    ru: { photo: 'Деталь процесса', film: 'Процесс в движении', note: 'Заводская съёмка · без звука', index: 'Внутри производства', count: 'процессов', watch: 'Видео' },
    en: { photo: 'Process detail', film: 'The process in motion', note: 'Factory footage · no audio', index: 'Inside production', count: 'processes', watch: 'Video' },
    kz: { photo: 'Үдеріс бөлшегі', film: 'Үдеріс қозғалыста', note: 'Зауыт түсірілімі · дыбыссыз', index: 'Өндіріс ішінде', count: 'үдеріс', watch: 'Бейне' }
  }[lang] || { photo: 'Деталь процесса', film: 'Процесс в движении', note: 'Заводская съёмка · без звука', index: 'Внутри производства', count: 'процессов', watch: 'Видео' };
  return <div className="company-processes" aria-label={label}>
    <div className="company-processes-index"><span>{w.index}</span><span>{String(items.length).padStart(2, '0')} / {w.count}</span></div>
    {items.map((item, i) => <article className={`company-process${active === i ? ' is-open' : ''}`} key={item.processId || i}>
      <h3><button className="company-process-trigger" type="button" id={`${id}-trigger-${i}`} aria-expanded={active === i} aria-controls={`${id}-stage-${i}`} onClick={() => setSelected(active === i ? null : i)}>
        <span className="company-process-number">{String(i + 1).padStart(2, '0')}</span><span className="company-process-title">{item.title}</span>
        {item.videoUrl && <span className="company-process-length">{w.watch} · {item.durationLabel}</span>}<Plus size={20} aria-hidden="true"/>
      </button></h3>
      <div id={`${id}-stage-${i}`} role="region" aria-labelledby={`${id}-trigger-${i}`} hidden={active !== i}>
        {active === i && <div className="company-process-body">
          <div className="company-process-story"><span className="company-process-eyebrow">{w.photo}</span><p>{item.desc}</p>
            <figure><img src={resolveMediaUrl(item.imageUrl)} alt={item.title} loading="lazy" decoding="async" width="960" height="720"/><figcaption>{item.title}</figcaption></figure>
          </div>
          {item.videoUrl && <figure className="company-process-film"><div className="company-process-film-heading"><span>{w.film}</span><span>{item.durationLabel}</span></div>
            <video key={item.videoUrl} controls playsInline preload="none" poster={resolveMediaUrl(item.posterUrl || item.imageUrl)} aria-label={`${w.watch}: ${item.title}`}>
              <source src={resolveMediaUrl(item.videoUrl)} type="video/mp4"/>
            </video><figcaption>{w.note}</figcaption>
          </figure>}
        </div>}
      </div>
    </article>)}
  </div>;
}

function CompanyMap({ items = [], label, lang }) {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const locationName = item => item.title.split(' / ')[lang === 'en' ? 1 : lang === 'kz' && item.title.split(' / ')[2] ? 2 : 0] || item.title;
  return <><div className="company-map" aria-label={label}><svg viewBox="0 0 1000 420" role="group" aria-label={label}>
    <defs><pattern id={id} width="83.333" height="70" patternUnits="userSpaceOnUse"><path d="M83.333 0H0V70" fill="none" stroke="#ffffff12"/></pattern></defs><rect width="1000" height="420" fill={`url(#${id})`}/>
    <image href={resolveMediaUrl('images/factory/world-outline.svg')} width="1000" height="420"/>
    {items.map((item, i) => <g key={i} role="button" tabIndex={0} aria-label={locationName(item)} aria-pressed={selected === i} onClick={() => setSelected(i)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(i); } }} transform={`translate(${(item.lng + 180) / 360 * 1000},${(90 - item.lat) / 180 * 420})`}>
      <circle r="13" pointerEvents="none" fill={selected === i ? '#d8bd9377' : '#c8a77422'}/><circle r="5" fill="#d8bd93"/>
    </g>)}
    </svg><span>{label}</span><div className="company-map-address" aria-live="polite">{selected !== null && items[selected] ? <><h3>{locationName(items[selected])}</h3><p>{items[selected].desc}</p></> : <p>{lang === 'en' ? 'Select a point or a city to see its address.' : lang === 'kz' ? 'Мекенжайды көру үшін нүктені немесе қаланы таңдаңыз.' : 'Выбери точку или город, чтобы увидеть адрес.'}</p>}</div></div>
    <div className="company-location-tags">{items.map((item, i) => <button type="button" key={i} aria-pressed={selected === i} onClick={() => setSelected(i)}>{locationName(item)}</button>)}</div></>;
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
  const labels = { ru: { SCALE: 'МАСШТАБ', HISTORY: 'НАША ИСТОРИЯ', PRODUCTION: 'ПРОИЗВОДСТВО', 'PRODUCTS & CARE': 'КОЛЛЕКЦИИ И СЕРВИС', GEOGRAPHY: 'ГЕОГРАФИЯ' }, kz: { SCALE: 'АУҚЫМ', HISTORY: 'БІЗДІҢ ТАРИХ', PRODUCTION: 'ӨНДІРІС', 'PRODUCTS & CARE': 'КОЛЛЕКЦИЯЛАР ЖӘНЕ СЕРВИС', GEOGRAPHY: 'ГЕОГРАФИЯ' } };
  const heading = (number, label) => <div className="company-section-heading"><span className="company-kicker">{number} / {labels[lang]?.[label] || label}</span><h2>{block.title}</h2><p>{block.subtitle}</p></div>;
  const actionHref = isSafeActionLink(block.buttonLink) ? block.buttonLink : null;
  return <div className={`company-section company-section--${section}`}>
    {section === 'hero' && <div className="company-hero"><div className="company-hero-top"><span className="company-kicker">{lang === 'ru' ? block.badge : lang === 'kz' ? 'LAUTE ТУРАЛЫ' : 'ABOUT LAUTE'}</span><span className="company-edition">1998 — {new Date().getFullYear()}</span></div><div className="company-hero-copy"><h1>{block.title}</h1><div><p>{block.subtitle}</p><div className="company-actions">{actionHref && link(actionHref, block.buttonText || w.partner, true)}<a className="company-text-link" href="#company-v2-production" onClick={e => { e.preventDefault(); if (!isEditor) document.getElementById('company-v2-production')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{w.production}<ArrowDown size={16}/></a></div></div></div><figure><img src={resolveMediaUrl(block.imageUrl)} width="1376" height="768" fetchpriority="high" alt={lang === 'en' ? 'Faucet in a bathroom interior' : lang === 'kz' ? 'Ванна бөлмесіндегі араластырғыш' : 'Смеситель в интерьере ванной комнаты'}/><span className="company-wordmark" aria-hidden="true">Laute</span><figcaption>{lang === 'en' ? 'KITCHEN / BATHROOM / EVERY DAY' : lang === 'kz' ? 'АСҮЙ / ВАННА / КҮН САЙЫН' : 'КУХНЯ / ВАННАЯ / КАЖДЫЙ ДЕНЬ'}</figcaption></figure></div>}
    {section === 'scale' && <><div className="company-scale-intro">{heading('01', 'SCALE')}</div><div className="company-stats">{block.items?.map((x, i) => <article key={i}><strong>{x.title}</strong><p>{x.desc}</p></article>)}</div><p className="company-data-note">{lang === 'en' ? 'Figures from the LAUTE factory presentation.' : lang === 'kz' ? 'LAUTE зауыт таныстырылымындағы көрсеткіштер.' : 'Показатели из презентации завода LAUTE.'}</p></>}
    {section === 'history' && <>{heading('02', 'HISTORY')}<ol className="company-milestones">{block.items?.filter(x => ['1998', '2003', '2025', '2026'].includes(x.year)).map((x, i) => <li key={i}><span className="company-year">{x.year}</span><h3>{x.title}</h3><p>{x.desc}</p></li>)}</ol><div className="company-history-details"><h3>{lang === 'en' ? 'The full story' : lang === 'kz' ? 'Толық тарих' : 'Вся история LAUTE'}</h3><ol className="company-timeline">{block.items?.map((x, i) => <li key={i}><span className="company-year">{x.year}</span><div><h3>{x.title}</h3><p>{x.desc}</p></div></li>)}</ol></div></>}
    {section === 'production' && <>{heading('03', 'PRODUCTION')}<CompanyProduction items={block.items} label={block.title} lang={lang}/></>}
    {section === 'range' && <><div className="company-range-layout"><img className="company-range-image" src={resolveMediaUrl('images/collections/coll-bathroom.jpg')} alt={lang === 'en' ? 'Bathroom interior' : lang === 'kz' ? 'Ванна бөлмесінің интерьері' : 'Интерьер ванной комнаты'} loading="lazy" decoding="async" width="1200" height="896"/><div>{heading('04', 'PRODUCTS & CARE')}<div className="company-actions">{actionHref && link(actionHref, block.buttonText || w.catalog, true)}</div></div></div><section className="company-warranty"><h3 className="company-warranty-heading">{lang === 'en' ? 'Warranty and care' : lang === 'kz' ? 'Кепілдік және күтім' : 'Гарантия и уход'}</h3><div className="company-guarantees">{block.items?.map((x, i) => <article key={i}><h3>{x.title}</h3><p>{x.desc}</p></article>)}</div><div className="company-care"><p>{lang === 'ru' ? block.content?.slice(block.content.indexOf('Гарантия конкретной')) || w.care : w.care}</p><div className="company-actions">{link('/service', w.service)}</div></div></section></>}
    {section === 'geography' && <>{heading('05', 'GEOGRAPHY')}<CompanyMap items={block.items} label={w.map} lang={lang}/><details className="company-addresses"><summary>{w.more}</summary><div>{block.items?.map((x, i) => <article key={i}><h3>{x.title}</h3><p>{x.desc}</p></article>)}</div></details>{actionHref && link(actionHref, block.buttonText || w.contacts)}</>}
    {section === 'inquiry' && <><CompanyInquiry block={block} isEditor={isEditor} w={w}/><details className="company-sources"><summary>{w.source}</summary><a href="https://laute.ltd/company" target="_blank" rel="noopener noreferrer">LAUTE / COMPANY ↗</a><a href="https://laute.ltd/service" target="_blank" rel="noopener noreferrer">SERVICE ↗</a></details></>}
  </div>;
}
