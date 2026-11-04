import React, { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, Globe2, Minus, Plus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export const validLocation = item => item && item.lat !== null && item.lng !== null && item.lat !== '' && item.lng !== '' && Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lng)) && Math.abs(Number(item.lat)) <= 85 && Math.abs(Number(item.lng)) <= 180;
export const locationName = (item, lang) => item.title.split(' / ')[lang === 'en' ? 1 : lang === 'kz' && item.title.split(' / ')[2] ? 2 : 0] || item.title;
export const addressQuery = (item, lang) => item.desc.includes(' · ') ? item.desc.split(' · ').slice(1).join(' · ').replace(/\s*\(.*\)$/, '') : locationName(item, lang);
const copy = {
  ru: { index: 'LAUTE / МЕЖДУНАРОДНАЯ СЕТЬ', cities: 'Точки присутствия', choose: 'Выбери город', world: 'Вся сеть', plus: 'Приблизить', minus: 'Отдалить', route: 'Найти адрес', hint: 'Перетаскивай · Ctrl + колесо · два пальца на телефоне', select: 'От мира — к твоему городу.', detail: 'Выбери точку на карте или город в списке — здесь появятся сведения об офисе или складе.', missing: 'Точный уличный адрес в источнике не опубликован.', source: 'Адреса из материалов LAUTE', note: 'Положение точек — по исходной карте. Уточни адрес и режим работы перед визитом.', unavailable: 'Подложка карты недоступна. Адреса и поиск маршрута работают.', loading: 'Загружаем карту', map: 'Карта офисов и складов LAUTE' },
  en: { index: 'LAUTE / INTERNATIONAL NETWORK', cities: 'Our locations', choose: 'Choose a city', world: 'All locations', plus: 'Zoom in', minus: 'Zoom out', route: 'Find the address', hint: 'Drag · Ctrl + scroll · pinch on your phone', select: 'From the world to your city.', detail: 'Choose a map point or a city to see the office or warehouse details.', missing: 'The source does not publish a street address.', source: 'Addresses from LAUTE materials', note: 'Points follow the source map. Confirm the address and opening hours before visiting.', unavailable: 'Map tiles are unavailable. Addresses and route search still work.', loading: 'Loading map', map: 'LAUTE offices and warehouses map' },
  kz: { index: 'LAUTE / ХАЛЫҚАРАЛЫҚ ЖЕЛІ', cities: 'Біздің мекендер', choose: 'Қаланы таңдаңыз', world: 'Барлық мекендер', plus: 'Жақындату', minus: 'Алыстату', route: 'Мекенжайды табу', hint: 'Сүйреңіз · Ctrl + айналдыру · телефонда екі саусақ', select: 'Әлемнен сенің қалаңа дейін.', detail: 'Кеңсе немесе қойма мәліметін көру үшін карта нүктесін немесе қаланы таңдаңыз.', missing: 'Дереккөзде нақты көше мекенжайы жарияланбаған.', source: 'LAUTE материалдарындағы мекенжайлар', note: 'Нүктелер бастапқы картаға сәйкес. Бармас бұрын мекенжай мен жұмыс уақытын нақтылаңыз.', unavailable: 'Карта қабаты қолжетімсіз. Мекенжайлар мен бағыт іздеу жұмыс істейді.', loading: 'Карта жүктелуде', map: 'LAUTE кеңселері мен қоймаларының картасы' }
};

export function CompanyMap({ items = [], label, lang = 'ru' }) {
  const w = copy[lang] || copy.ru, id = useId();
  const canvas = useRef(null), map = useRef(null), markers = useRef([]);
  const [selected, setSelected] = useState(null), [ready, setReady] = useState(false), [tileError, setTileError] = useState(false), [zoom, setZoom] = useState(2);
  const active = selected !== null ? items[selected] : null;
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const overview = () => {
    setSelected(null);
    const coords = items.filter(validLocation).map(item => [Number(item.lat), Number(item.lng)]);
    if (map.current && coords.length) map.current.fitBounds(coords, { padding: [44, 44], maxZoom: 3, animate: !reduced() });
  };
  useEffect(() => {
    let disposed = false, instance, observer, resize;
    const node = canvas.current;
    setReady(false); setTileError(false);
    const wheel = e => {
      if (!e.ctrlKey || !map.current) return;
      e.preventDefault();
      map.current.setZoomAround(map.current.mouseEventToLatLng(e), Math.max(1, Math.min(18, map.current.getZoom() + (e.deltaY < 0 ? 1 : -1))));
    };
    const init = async () => {
      observer?.disconnect();
      try {
        const module = await import('leaflet');
        if (disposed) return;
        const L = module.default || module;
        instance = L.map(node, { center: [32, 20], zoom: 2, minZoom: 1, maxZoom: 18, zoomControl: false, scrollWheelZoom: false, dragging: true, touchZoom: true, keyboard: true, attributionControl: true, worldCopyJump: true, zoomAnimation: !reduced(), fadeAnimation: !reduced(), markerZoomAnimation: !reduced() });
        map.current = instance;
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors', updateWhenIdle: true, keepBuffer: 1 }).on('tileerror', () => { if (!disposed) setTileError(true); }).on('tileload', () => { if (!disposed) setTileError(false); }).addTo(instance);
        markers.current = items.map((item, index) => {
          if (!validLocation(item)) return null;
          const marker = L.marker([Number(item.lat), Number(item.lng)], { title: locationName(item, lang), alt: locationName(item, lang), keyboard: true, icon: L.divIcon({ className: 'company-atlas-pin', html: `<span>${String(index + 1).padStart(2, '0')}</span>`, iconSize: [44, 44], iconAnchor: [22, 22] }) }).addTo(instance).on('click', () => setSelected(index));
          marker.getElement()?.setAttribute('aria-label', locationName(item, lang));
          marker.getElement()?.setAttribute('aria-pressed', 'false');
          return marker;
        });
        const coords = items.filter(validLocation).map(item => [Number(item.lat), Number(item.lng)]);
        if (coords.length) instance.fitBounds(coords, { padding: [44, 44], maxZoom: 3, animate: false });
        instance.on('zoomend', () => { if (!disposed) setZoom(instance.getZoom()); });
        setZoom(instance.getZoom()); setReady(true);
        node.addEventListener('wheel', wheel, { passive: false });
        resize = new ResizeObserver(() => instance.invalidateSize({ animate: false })); resize.observe(node);
      } catch { if (!disposed) setTileError(true); }
    };
    observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) init(); }, { rootMargin: '240px' }); observer.observe(node);
    return () => { disposed = true; observer?.disconnect(); resize?.disconnect(); node.removeEventListener('wheel', wheel); instance?.remove(); map.current = null; markers.current = []; };
  }, [items, lang]);
  useEffect(() => {
    if (!ready || !map.current) return;
    markers.current.forEach((marker, index) => { const element = marker?.getElement(); element?.classList.toggle('is-selected', index === selected); element?.setAttribute('aria-pressed', String(index === selected)); });
    if (active && validLocation(active)) map.current.flyTo([Number(active.lat), Number(active.lng)], active.desc.includes(' · ') ? 12 : 10, { animate: !reduced(), duration: .85 });
  }, [selected, ready, items]);

  return <div className="company-atlas" aria-label={label}>
    <div className="company-atlas-top"><span>{w.index}</span><span>{String(items.length).padStart(2, '0')} / {w.cities}</span></div>
    <div className="company-atlas-layout"><div className="company-atlas-stage">
      <div ref={canvas} className={`company-atlas-map${zoom < 5 ? ' is-overview' : ''}`} role="region" aria-label={w.map} aria-describedby={id + '-hint'} tabIndex={0}/>
      {!ready && !tileError && <p className="company-atlas-loading" role="status">{w.loading}…</p>}
      <div className="company-atlas-controls"><button type="button" aria-label={w.plus} disabled={!ready || zoom >= 18} onClick={() => map.current?.zoomIn(undefined, { animate: !reduced() })}><Plus size={18}/></button><button type="button" aria-label={w.minus} disabled={!ready || zoom <= 1} onClick={() => map.current?.zoomOut(undefined, { animate: !reduced() })}><Minus size={18}/></button><button type="button" className="company-atlas-overview" onClick={overview}><Globe2 size={17}/><span>{w.world}</span></button></div>
      <div className="company-atlas-map-label" aria-hidden="true">LAUTE<span>GLOBAL / LOCAL</span></div>
    </div><aside className="company-atlas-sidebar">
      <label className="company-atlas-select" htmlFor={id + '-city'}>{w.choose}<select id={id + '-city'} value={selected ?? ''} onChange={e => e.target.value === '' ? overview() : setSelected(Number(e.target.value))}><option value="">{w.world}</option>{items.map((item, index) => <option key={index} value={index}>{locationName(item, lang)}</option>)}</select></label>
      <div className="company-atlas-cities" aria-label={w.cities}>{items.map((item, index) => <button type="button" key={index} aria-pressed={selected === index} onClick={() => setSelected(index)}><span>{String(index + 1).padStart(2, '0')}</span>{locationName(item, lang)}<ArrowUpRight size={13}/></button>)}</div>
      <div className="company-atlas-detail" aria-live="polite">{active ? <><span className="company-atlas-detail-number">{String(selected + 1).padStart(2, '0')} / LAUTE</span><h3>{locationName(active, lang)}</h3><p>{active.desc}</p>{!active.desc.includes(' · ') && <p>{w.missing}</p>}<a className="company-atlas-route" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery(active, lang))}`} target="_blank" rel="noopener noreferrer">{w.route}<ArrowUpRight size={17}/></a></> : <><h3>{w.select}</h3><p>{w.detail}</p></>}</div>
    </aside></div>
    <div className="company-atlas-footer"><p id={id + '-hint'}>{tileError ? w.unavailable : w.hint}</p><a href="https://laute.ltd/company" target="_blank" rel="noopener noreferrer">{w.source} ↗</a></div><p className="company-atlas-note">{w.note}</p>
  </div>;
}
