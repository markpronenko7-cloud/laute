import React, { useId, useRef, useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { resolveMediaUrl } from '../services/adminApi';

export const clampMapView = ({ scale, x, y }) => {
  scale = Math.max(1, Math.min(8, scale));
  return { scale, x: Math.max(1000 * (1 - scale), Math.min(0, x)), y: Math.max(420 * (1 - scale), Math.min(0, y)) };
};
const position = item => ({ x: (Number(item.lng) + 180) / 360 * 1000, y: (90 - Number(item.lat)) / 180 * 420 });

export function CompanyMap({ items = [], label, lang }) {
  const [selected, setSelected] = useState(null), [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const drag = useRef(null), moved = useRef(false), id = useId();
  const w = lang === 'en' ? { zoomIn: 'Zoom in', zoomOut: 'Zoom out', reset: 'Show the world', hint: 'Drag to move · + / − to zoom · arrow keys to pan', select: 'Select a city or a point.', missing: 'The source provides the city only; a street address is not published.', source: 'Official source', map: 'Open in maps', approximate: 'Schematic map. Points indicate the city or area, not an exact entrance.' } : lang === 'kz' ? { zoomIn: 'Жақындату', zoomOut: 'Алыстату', reset: 'Әлем картасы', hint: 'Жылжыту үшін сүйреңіз · + / − масштаб · бағыт пернелері', select: 'Қаланы немесе нүктені таңдаңыз.', missing: 'Дереккөзде тек қала көрсетілген; көше мекенжайы жарияланбаған.', source: 'Ресми дереккөз', map: 'Картада ашу', approximate: 'Сызбалық карта. Нүктелер нақты кіреберісті емес, қаланы немесе ауданды көрсетеді.' } : { zoomIn: 'Приблизить', zoomOut: 'Отдалить', reset: 'Весь мир', hint: 'Перетаскивай карту · + / − — масштаб · стрелки — перемещение', select: 'Выбери город или точку на карте.', missing: 'В источнике указан только город; точный адрес не опубликован.', source: 'Официальный источник', map: 'Открыть в картах', approximate: 'Схема сети. Точки обозначают город или район, а не точный вход.' };
  const locationName = item => item.title.split(' / ')[lang === 'en' ? 1 : lang === 'kz' && item.title.split(' / ')[2] ? 2 : 0] || item.title;
  const zoom = factor => setView(v => { const scale = Math.max(1, Math.min(8, v.scale * factor)), ratio = scale / v.scale; return clampMapView({ scale, x: 500 - (500 - v.x) * ratio, y: 210 - (210 - v.y) * ratio }); });
  const select = i => { setSelected(i); const p = position(items[i]); setView(v => { const scale = Math.max(3, v.scale); return clampMapView({ scale, x: 500 - p.x * scale, y: 210 - p.y * scale }); }); };
  const active = items[selected];
  return <><div className="company-map" aria-label={label}>
    <div className="company-map-toolbar"><button type="button" aria-label={w.zoomIn} onClick={() => zoom(1.5)} disabled={view.scale >= 8}><Plus size={18}/></button><button type="button" aria-label={w.zoomOut} onClick={() => zoom(1 / 1.5)} disabled={view.scale <= 1}><Minus size={18}/></button><button type="button" aria-label={w.reset} onClick={() => setView({ scale: 1, x: 0, y: 0 })}><RotateCcw size={18}/></button><output aria-live="polite">{Math.round(view.scale * 100)}%</output></div>
    <svg className="company-map-canvas" viewBox="0 0 1000 420" role="group" aria-label={label} aria-describedby={id + '-hint'} tabIndex={0}
      onKeyDown={e => { if (e.target !== e.currentTarget) return; if (['+', '=', '-', 'Home', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault(); if (['+', '='].includes(e.key)) zoom(1.5); if (e.key === '-') zoom(1 / 1.5); if (e.key === 'Home') setView({ scale: 1, x: 0, y: 0 }); const d = { ArrowLeft: [60, 0], ArrowRight: [-60, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] }[e.key]; if (d) setView(v => clampMapView({ ...v, x: v.x + d[0], y: v.y + d[1] })); }}
      onPointerDown={e => { if (!e.isPrimary || e.button !== 0) return; moved.current = false; drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); }}
      onPointerMove={e => { const start = drag.current; if (!start || start.id !== e.pointerId) return; const dx = e.clientX - start.x, dy = e.clientY - start.y; if (!moved.current && Math.hypot(dx, dy) < 5) return; moved.current = true; const ratio = 1000 / e.currentTarget.getBoundingClientRect().width; setView(v => clampMapView({ ...v, x: v.x + dx * ratio, y: v.y + dy * ratio })); drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY }; }}
      onPointerUp={e => { const wasDrag = moved.current; drag.current = null; if (!wasDrag) { const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-map-index]'); if (target && e.currentTarget.contains(target)) select(Number(target.dataset.mapIndex)); } }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}>
      <defs><pattern id={id} width="83.333" height="70" patternUnits="userSpaceOnUse"><path d="M83.333 0H0V70" fill="none" stroke="#ffffff12"/></pattern></defs>
      <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}><rect width="1000" height="420" fill={`url(#${id})`}/><image href={resolveMediaUrl('images/factory/world-outline.svg')} width="1000" height="420"/>
        {items.map((item, i) => { const p = position(item); if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return null; return <g key={i} data-map-index={i} role="button" tabIndex={0} aria-label={locationName(item)} aria-pressed={selected === i} onClick={e => { if (e.detail === 0) select(i); }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(i); } }} transform={`translate(${p.x},${p.y})`}><circle r={22 / view.scale} fill="transparent"/><circle r={12 / view.scale} fill={selected === i ? '#d8bd9399' : '#c8a77433'}/><circle r={5 / view.scale} fill="#f0d7b2"/></g>; })}
      </g>
    </svg><p className="company-map-hint" id={id + '-hint'}>{w.hint}</p>
    <div className="company-map-address" aria-live="polite">{active ? <><h3>{locationName(active)}</h3><p>{active.desc}</p>{!active.desc.includes(' · ') && <p>{w.missing}</p>}<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(active.desc.includes(' · ') ? active.desc.split(' · ').slice(1).join(' · ').replace(/\s*\(.*\)$/, '') : locationName(active))}`} target="_blank" rel="noopener noreferrer">{w.map} ↗</a></> : <p>{w.select}</p>}</div>
    <p className="company-map-hint">{w.approximate} <a href="https://laute.ltd/company" target="_blank" rel="noopener noreferrer">{w.source} ↗</a></p>
  </div><div className="company-location-tags">{items.map((item, i) => <button type="button" key={i} aria-pressed={selected === i} onClick={() => select(i)}>{locationName(item)}</button>)}</div></>;
}
