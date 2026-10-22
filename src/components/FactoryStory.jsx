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
  const motionFilm = block.videoUrl === 'media/laute-factory-film.mp4';
  const videoUrl = motionFilm ? `${block.videoUrl}?v=motion-20261022` : block.videoUrl;
  const poster = motionFilm && block.imageUrl === 'images/factory/robot.jpg' ? 'images/factory/motion-poster.jpg' : block.imageUrl;
  return <div className={`factory-film${motionFilm ? ' factory-film--motion' : ''}`}>
    <div className="factory-film-copy">
      <span className="factory-eyebrow">{en ? 'LAUTE / INSIDE THE FACTORY' : kz ? 'LAUTE / ӨНДІРІС ІШІНДЕ' : block.badge}</span>
      <div className="factory-wordmark" aria-hidden="true"><img src={resolveMediaUrl('official-laute-logo.png')} alt=""/></div>
      <h1>{en ? 'Precision. Character. LAUTE.' : kz ? 'Дәлдік. Мінез. LAUTE.' : block.title}</h1>
      <p>{en ? 'From the first blank to the final touch. See metal take shape, and engineering find its character.' : kz ? 'Алғашқы дайындамадан соңғы өңдеуге дейін. Металдың пішінге айналуын өз көзіңізбен көріңіз.' : block.subtitle}</p>
      <a className="btn btn-primary" href={isSafeActionLink(block.buttonLink) ? (block.buttonLink?.startsWith('/') ? resolveMediaUrl(block.buttonLink.slice(1)) : block.buttonLink || resolveMediaUrl('partners')) : '#'} onClick={onLink}><span>{en ? 'Become a partner' : kz ? 'Серіктес болу' : block.buttonText}</span><ArrowUpRight size={18}/></a>
      <div className="factory-film-index"><span>01 — 06</span><span>{en ? 'MATERIAL / ENGINEERING / WATER' : kz ? 'МАТЕРИАЛ / ИНЖЕНЕРИЯ / СУ' : 'МАТЕРИАЛ / ИНЖЕНЕРИЯ / ВОДА'}</span></div>
    </div>
    <figure className="factory-film-player">
      <video key={`${videoUrl}-${lang}`} controls playsInline preload="none" poster={resolveMediaUrl(poster)} aria-label={en ? 'LAUTE brand film' : 'Бренд-фильм LAUTE'} onError={() => setFailed(true)}>
        {!isEditor && <source src={resolveMediaUrl(videoUrl)} type="video/mp4"/>}
        {block.videoUrl === 'media/laute-factory-film.mp4' && <>
          <track kind="subtitles" src={resolveMediaUrl('media/laute-factory-ru.vtt')} srcLang="ru" label="Русский" default={!en}/>
          <track kind="subtitles" src={resolveMediaUrl('media/laute-factory-en.vtt')} srcLang="en" label="English" default={en}/>
        </>}
      </video>
      <figcaption><Play size={13}/><span>{motionFilm ? (en ? 'BRAND FILM / ARTISTIC 3D VISUALIZATION' : 'БРЕНД-ФИЛЬМ / ХУДОЖЕСТВЕННАЯ 3D-ВИЗУАЛИЗАЦИЯ') : (en ? 'LAUTE / VIDEO' : 'LAUTE / ВИДЕО')}</span><span>RU / EN</span></figcaption>
      {failed && <p role="alert">{en ? 'Video unavailable. Please try again later.' : 'Видео не загрузилось. Попробуйте открыть его позже.'}</p>}
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
