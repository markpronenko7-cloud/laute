import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Expand, X } from 'lucide-react';
import { resolveMediaUrl } from '../services/adminApi';
import { isShippedProcessFilm } from '../data/factoryStory';

// Native dialog supplies focus containment, Escape handling and an inert background.
export function CompanyMedia({ children, title, lang = 'ru', imageUrl, video = false, videoUrl, posterUrl }) {
  const dialog = useRef(null), timer = useRef(null), trigger = useRef(null);
  const [open, setOpen] = useState(false), [closing, setClosing] = useState(false);
  const [failed, setFailed] = useState(false);
  const id = useId();
  const processFilm = isShippedProcessFilm(videoUrl);
  const closeLabel = lang === 'en' ? 'Close' : lang === 'kz' ? 'Жабу' : 'Закрыть';
  const openLabel = lang === 'en' ? 'Open media' : lang === 'kz' ? 'Медианы ашу' : 'Открыть медиа';
  const close = () => {
    if (closing) return;
    dialog.current?.querySelector('video')?.pause();
    setClosing(true);
    timer.current = setTimeout(() => { dialog.current?.close(); setOpen(false); setClosing(false); trigger.current?.focus(); }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180);
  };
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current.showModal();
    return () => { document.body.style.overflow = previous; clearTimeout(timer.current); };
  }, [open]);
  return <><button ref={trigger} type="button" className={`company-media-trigger${video ? ' company-media-film-trigger' : ''}`} aria-label={`${openLabel}: ${title}`} aria-haspopup="dialog" onClick={() => { setFailed(false); setOpen(true); }}>{children}<span className="company-media-expand" aria-hidden="true"><Expand size={18}/></span></button>
    {open && createPortal(<dialog ref={dialog} className={`company-media-dialog${closing ? ' is-closing' : ''}`} aria-labelledby={id} onCancel={e => { e.preventDefault(); close(); }} onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div className="company-media-panel"><header><img src={resolveMediaUrl('laute-logo.png')} alt="LAUTE" width="100"/><button type="button" onClick={close} aria-label={closeLabel} autoFocus><X size={24}/></button></header>
        {video ? <video controls playsInline preload="metadata" poster={resolveMediaUrl(posterUrl || imageUrl)} aria-labelledby={id} onError={() => setFailed(true)}>
          <source src={resolveMediaUrl(videoUrl)} type="video/mp4"/>
        </video> : <img className="company-media-full" src={resolveMediaUrl(imageUrl)} alt={title}/>}
        {failed && <p role="alert">{lang === 'en' ? 'Unable to load the video. Close and try again.' : lang === 'kz' ? 'Бейне жүктелмеді. Жауып, қайталап көріңіз.' : 'Не удалось загрузить видео. Закрой окно и попробуй ещё раз.'}</p>}
        <p id={id}>{title}</p>{video && <p>{lang === 'en' ? 'Supplied production footage, edited by LAUTE.' : lang === 'kz' ? 'Берілген өндіріс кадрлары, LAUTE монтажы.' : 'Предоставленная производственная съёмка · монтаж LAUTE.'}</p>}
        {video && processFilm && <p className="company-music-credit">{lang === 'en' ? 'Music' : lang === 'kz' ? 'Музыка' : 'Музыка'}: <a href="https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1300046" target="_blank" rel="noopener noreferrer">Dream Culture — Kevin MacLeod (incompetech.com)</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>. {lang === 'en' ? 'Excerpt, fades and mix.' : lang === 'kz' ? 'Үзінді, біртіндеп кіру/шығу және микс.' : 'Фрагмент, плавный вход/выход и сведение.'} <a href={resolveMediaUrl('media/music-credits.txt')} target="_blank" rel="noopener noreferrer">Credits ↗</a></p>}
      </div>
    </dialog>, document.body)}
  </>;
}
