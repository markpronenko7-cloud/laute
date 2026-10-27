import React from 'react';
import { ArrowUpRight, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { resolveMediaUrl } from '../services/adminApi';
import { isSafeActionLink } from './SiteAction';
import './factory-story.css';

export function FactoryFilm({ block, isEditor, onLink }) {
  const { lang } = useApp();
  const en = lang === 'en', kz = lang === 'kz';
  const [failed, setFailed] = React.useState(false);
  const [started, setStarted] = React.useState(false);
  const videoRef = React.useRef(null);
  const motionFilm = block.videoUrl === 'media/laute-factory-film.mp4';
  const documentary = block.videoUrl === 'media/laute-factory-documentary.mp4';
  React.useEffect(() => { setFailed(false); setStarted(false); }, [block.videoUrl, lang]);
  const videoUrl = documentary ? `${block.videoUrl}?v=director-cut-20261027-r2` : motionFilm ? `${block.videoUrl}?v=motion-20261022` : block.videoUrl;
  const poster = motionFilm && block.imageUrl === 'images/factory/robot.jpg' ? 'images/factory/motion-poster.jpg' : block.imageUrl;
  return <div className={`factory-film${motionFilm ? ' factory-film--motion' : ''}${documentary ? ' factory-film--documentary' : ''}`}>
    <div className="factory-film-copy">
      <span className="factory-eyebrow">{en ? 'LAUTE / INSIDE THE FACTORY' : kz ? 'LAUTE / ӨНДІРІС ІШІНДЕ' : block.badge}</span>
      <h1>{en ? 'Character begins in the details.' : kz ? 'Мінез бөлшектерден басталады.' : block.title}</h1>
      <p>{en ? 'Metal, precise processing and attention to the surface. A brief look at LAUTE production, alongside a visual study of materials.' : kz ? 'Металл, дәл өңдеу және бетке назар. LAUTE өндірісіне қысқаша шолу және материалдардың көркем бейнесі.' : block.subtitle}</p>
      <a className="btn btn-primary" href={isSafeActionLink(block.buttonLink) ? (block.buttonLink?.startsWith('/') ? resolveMediaUrl(block.buttonLink.slice(1)) : block.buttonLink || resolveMediaUrl('partners')) : '#'} onClick={onLink}><span>{en ? 'Become a partner' : kz ? 'Серіктес болу' : block.buttonText}</span><ArrowUpRight size={18}/></a>
      <div className="factory-film-index"><span>LAUTE / 01</span><span>{en ? 'MATERIAL / TECHNOLOGY / PEOPLE' : kz ? 'МАТЕРИАЛ / ТЕХНОЛОГИЯ / АДАМДАР' : 'МАТЕРИАЛ / ТЕХНОЛОГИИ / ЛЮДИ'}</span></div>
      {documentary && <p className="factory-film-note">{en ? '20 seconds. Sound from the factory floor.' : kz ? '20 секунд. Өндірістің дыбысы.' : '20 секунд. Звук производства.'}</p>}
    </div>
    <figure className="factory-film-player">
      <div className="factory-film-screen">
      <video ref={videoRef} key={`${videoUrl}-${lang}`} controls playsInline preload="metadata" poster={resolveMediaUrl(documentary ? `${poster}?v=director-cut-20261027-r2` : poster)} aria-label={en ? 'Inside LAUTE production' : kz ? 'LAUTE өндірісі' : 'Экскурсия по производству LAUTE'} onLoadedData={() => setFailed(false)} onPlay={() => { setStarted(true); setFailed(false); }} onEnded={() => setStarted(false)} onError={() => setFailed(true)}>
        {!isEditor && documentary && <source src={resolveMediaUrl('media/laute-factory-mobile.mp4?v=director-cut-20261027-r2')} media="(max-width: 600px)" type="video/mp4"/>}
        {!isEditor && <source src={resolveMediaUrl(videoUrl)} type="video/mp4"/>}
        {block.videoUrl === 'media/laute-factory-film.mp4' && <>
          <track kind="subtitles" src={resolveMediaUrl('media/laute-factory-ru.vtt')} srcLang="ru" label="Русский" default={!en}/>
          <track kind="subtitles" src={resolveMediaUrl('media/laute-factory-en.vtt')} srcLang="en" label="English" default={en}/>
        </>}

      </video>
      {!isEditor && !started && !failed && <button type="button" className="factory-film-play" onClick={() => videoRef.current?.play().catch(() => setFailed(true))}><Play size={22} aria-hidden="true"/><span>{en ? 'Watch the film' : kz ? 'Фильмді көру' : 'Смотреть фильм'}</span></button>}
      </div>
      <figcaption><Play size={13}/><span>{motionFilm ? (en ? 'BRAND FILM / ARTISTIC 3D VISUALIZATION' : 'БРЕНД-ФИЛЬМ / ХУДОЖЕСТВЕННАЯ 3D-ВИЗУАЛИЗАЦИЯ') : (en ? 'FACTORY JOURNAL' : kz ? 'ӨНДІРІС КҮНДЕЛІГІ' : 'КОРОТКИЙ ФИЛЬМ / РЕАЛЬНЫЕ СЪЁМКИ')}</span><span>{documentary ? '00:20' : 'RU / EN'}</span></figcaption>
      {documentary && /-study\.webp$/.test(poster || '') && <p className="factory-cover-note">{en ? 'Cover image: AI-generated conceptual illustration. The film contains actual footage.' : kz ? 'Мұқаба — ЖИ көмегімен жасалған көркем бейне. Фильмде шынайы кадрлар.' : 'Обложка — концептуальная AI-визуализация. В фильме — реальные съёмки.'}</p>}
      {failed && <p role="alert">{en ? 'Video unavailable.' : kz ? 'Бейне жүктелмеді.' : 'Видео не загрузилось.'} <a href={resolveMediaUrl(videoUrl)}>{en ? 'Open video file' : kz ? 'Бейнені ашу' : 'Открыть видеофайл'}</a></p>}
    </figure>
  </div>;
}

export function FactoryHistory({ block }) {
  const { lang } = useApp();
  const en = lang === 'en', kz = lang === 'kz';
  const translated = en ? [
    ['A new chapter for the flagship brand', '2025 marks a major expansion of the LAUTE collections. Solana, Ethereum and Bitcoin reference Web3 and express the brand’s interest in future technologies. Web3 and AI are part of LAUTE’s vision for the industry.'],
    ['Almaty. On the new Silk Road.', 'In 2026, LAUTE opens a warehouse in Almaty, a key point on the historic Silk Road. A new chapter for logistics and partnerships in Central Asia brings the factory closer to its partners and their projects.']
  ] : kz ? [
    ['Флагмандық брендтің жаңа кезеңі', '2025 жылы LAUTE флагмандық бренді коллекцияларын айтарлықтай кеңейтті. Solana, Ethereum және Bitcoin атаулары Web3 әлеміне сілтейді. Web3 пен AI брендтің болашаққа деген көзқарасының бір бөлігіне айналды.'],
    ['Алматы. Жаңа Жібек жолында.', '2026 жылы LAUTE тарихи Жібек жолының маңызды нүктелерінің бірі Алматыда қойма ашады. Бұл Орталық Азиядағы логистика мен серіктестіктің жаңа кезеңі.']
  ] : null;
  return <div className="factory-history">
    <span className="factory-eyebrow">{en ? 'A STORY STILL UNFOLDING' : kz ? 'ЖАЛҒАСЫП ЖАТҚАН ТАРИХ' : block.badge}</span>
    <h2>{en ? 'The next step. Closer to the future.' : kz ? 'Келесі қадам — болашаққа жақынырақ.' : block.title}</h2>
    <p className="factory-history-intro">{en ? 'New collections. New routes. The same LAUTE character.' : kz ? 'Жаңа коллекциялар. Жаңа бағыттар. Сол LAUTE мінезі.' : block.subtitle}</p>
    <div className="factory-history-grid">{(block.items || []).map((item, i) => <article key={i}>
      <span className="factory-history-year">{item.year}</span><span className="factory-history-note">{item.note}</span>
      <h3>{translated?.[i]?.[0] || item.title}</h3><p>{translated?.[i]?.[1] || item.desc}</p>
    </article>)}</div>
  </div>;
}

export function FactoryGallery({ block }) {
  const { lang } = useApp();
  const en = lang === 'en', kz = lang === 'kz';
  const visualStudy = (block.items || []).length > 0 && block.items.every(item => /-study\.webp$/.test(item.imageUrl || ''));
  const studyCaptions = en ? [
    ['It starts with the material.', 'Warm brass, the geometry of a blank and the trace of a tool. A visual exploration of form.'],
    ['Form meets precision.', 'The rhythm of machining and attention to the surface. A conceptual scene inspired by metalworking.']
  ] : kz ? [
    ['Бәрі материалдан басталады.', 'Жездің жылы реңкі, дайындаманың геометриясы және құрал ізі. Пішінді көркем зерттеу.'],
    ['Пішін дәлдікке ие болады.', 'Өңдеу ырғағы және бетке назар. Металмен жұмыс істеуден шабыт алған көркем көрініс.']
  ] : null;
  const captions = visualStudy ? studyCaptions : en ? [
    ['The first form', 'Brass blanks at the start of their production journey.'],
    ['Production tooling', 'Moulds and working parts of the factory equipment.'],
    ['Robotic polishing', 'Automation in surface finishing.'],
    ['Surface matters', 'Components on the polishing equipment.'],
    ['The human touch', 'Manual finishing on the factory floor.'],
    ['Complex geometry', 'Product bodies and internal structures before final finishing.']
  ] : kz ? [
    ['Алғашқы пішін', 'Өндіріс жолының басындағы жез дайындамалар.'],
    ['Өндірістік жабдық', 'Цехтағы қалыптар мен жабдықтың жұмыс бөліктері.'],
    ['Роботпен жылтырату', 'Бетті өңдеудегі автоматтандыру.'],
    ['Бетке назар', 'Жылтырату жабдығындағы бөлшектер.'],
    ['Шебердің еңбегі', 'Өндірістегі қолмен өңдеу.'],
    ['Күрделі геометрия', 'Соңғы өңдеуге дейінгі корпустар мен ішкі құрылымдар.']
  ] : null;
  if (block.isVisible === false) return null;
  return <section className="factory-production" id={block.anchor || block.id}>
    <div className="container">
      <div className="factory-production-heading">
        <span className="factory-eyebrow">{en ? (visualStudy ? 'MATERIAL STUDIES' : 'MATERIAL / PROCESS / PEOPLE') : kz ? (visualStudy ? 'МАТЕРИАЛДАРДЫҢ КӨРКЕМ БЕЙНЕСІ' : 'МАТЕРИАЛ / ҮДЕРІС / АДАМДАР') : block.badge}</span>
        <h2>{en ? (visualStudy ? 'Material and form.' : 'A closer look at production.') : kz ? (visualStudy ? 'Материал және пішін.' : 'Өндіріске жақынырақ.') : block.title}</h2>
        <p>{en ? (visualStudy ? 'An illustrative series about metal and machining. Images created with AI.' : 'Real moments from the factory floor, captured during production.') : kz ? (visualStudy ? 'Металл мен өңдеу туралы көркем серия. Суреттер ЖИ көмегімен жасалған.' : 'Өндіріс кезінде түсірілген шынайы кадрлар.') : block.subtitle}</p>
      </div>
      <div className="factory-production-grid">{(block.items || []).map((item, index) => <figure key={`${item.imageUrl}-${index}`}>
        <div className="factory-production-image"><img src={resolveMediaUrl(item.imageUrl)} alt={captions?.[index]?.[0] || item.title} loading="lazy" decoding="async" width="1672" height="941"/><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span></div>
        <figcaption><h3>{captions?.[index]?.[0] || item.title}</h3><p>{captions?.[index]?.[1] || item.desc}</p>{/-study\.webp$/.test(item.imageUrl || '') && <small>{en ? 'AI-generated conceptual illustration' : kz ? 'ЖИ көмегімен жасалған көркем бейне' : 'Концептуальная AI-визуализация'}</small>}</figcaption>
      </figure>)}</div>
    </div>
  </section>;
}
