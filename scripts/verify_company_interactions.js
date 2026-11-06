// Isolated component event/state checks; these do not replace browser visual QA.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import { transform } from 'esbuild';
import { getCompanyProcessMedia } from '../src/data/factoryStory.js';

async function harness(file, props) {
  const slots = [], effects = [], timers = [];
  let cursor = 0, tree, reduced = false, pointedIndex = null;
  const stats = { shown: 0, closed: 0, paused: 0, focused: 0, delay: null, markers: [], mapEvents: {}, tileEvents: {}, wheel: null };
  const native = { addEventListener: (name, fn) => { stats[name] = fn; }, removeEventListener() {}, showModal: () => stats.shown++, close: () => stats.closed++, focus: () => stats.focused++, querySelector: () => ({ pause: () => stats.paused++ }) };
  const document = { body: { style: { overflow: 'auto' } }, elementFromPoint: () => pointedIndex === null ? null : ({ closest: () => ({ dataset: { mapIndex: pointedIndex } }) }) };
  const React = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
    Fragment: 'fragment',
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value; }]; },
    useRef(initial) { const i = cursor++; return slots[i] ||= { current: initial }; },
    useId() { cursor++; return 'test-id'; },
    useEffect(fn, deps) { const i = cursor++; if (!slots[i] || deps.some((v, j) => v !== slots[i].deps[j])) { effects.push(() => { slots[i]?.cleanup?.(); slots[i] = { deps, cleanup: fn() }; }); } }
  };
  const icons = new Proxy({}, { get: (_, name) => name });
  const module = { exports: {} };
  const code = (await transform(fs.readFileSync(file, 'utf8').replace("await import('leaflet')", "await Promise.resolve(require('leaflet'))"), { loader: 'jsx', format: 'cjs' })).code;
  let mapZoom = 2;
  const instance = { fitBounds: (coords, options) => { stats.bounds = coords; stats.boundsOptions = options; }, flyTo: (coords, zoom, options) => { stats.fly = { coords, zoom, options }; }, getZoom: () => mapZoom, zoomIn: () => { mapZoom++; stats.mapEvents.zoomend?.(); }, zoomOut: () => { mapZoom--; stats.mapEvents.zoomend?.(); }, on: (name, fn) => { stats.mapEvents[name] = fn; }, remove: () => { stats.removed = true; }, invalidateSize() {}, mouseEventToLatLng: () => [1, 2], setZoomAround: (point, zoom) => { stats.wheelZoom = zoom; mapZoom = zoom; } };
  const Leaflet = { map: (node, options) => { stats.mapOptions = options; return instance; }, tileLayer: (url, options) => { stats.tiles = { url, options }; const layer = { on: (name, fn) => { stats.tileEvents[name] = fn; return layer; }, addTo: () => layer }; return layer; }, divIcon: x => x, marker: (coords, options) => { const record = { coords, options, attributes: {} }; const marker = { addTo: () => marker, on: (_, fn) => { record.click = fn; return marker; }, getElement: () => ({ setAttribute: (k, v) => { record.attributes[k] = v; }, classList: { toggle: (name, value) => { record[name] = value; } } }) }; stats.markers.push(record); return marker; } };
  vm.runInNewContext(code, { exports: module.exports, module, require: name => name === 'leaflet' ? Leaflet : name === 'react' ? React : name === 'react-dom' ? { createPortal: x => x } : name === 'lucide-react' ? icons : { resolveMediaUrl: x => '/laute/' + x }, document, IntersectionObserver: class { constructor(fn) { this.fn = fn; } observe() { this.fn([{ isIntersecting: true }]); } disconnect() {} }, ResizeObserver: class { observe() {} disconnect() {} }, window: { matchMedia: () => ({ matches: reduced }) }, setTimeout: (fn, delay) => { stats.delay = delay; timers.push(fn); return timers.length; }, clearTimeout: () => {} });
  const exports = module.exports;
  const Component = exports[Object.keys(exports).find(x => x.startsWith('Company'))];
  function walk(node) { if (!node || typeof node !== 'object') return []; return [node, ...(node.children || []).flatMap(walk)]; }
  const nodes = () => walk(tree);
  const render = () => { cursor = 0; tree = Component(props); nodes().forEach(n => { if (n.props.ref) n.props.ref.current = native; }); effects.splice(0).forEach(fn => fn()); return tree; };
  render();
  return { render, nodes, stats, document, exports, setReduced: v => { reduced = v; }, point: v => { pointedIndex = v; }, flush: () => timers.splice(0).forEach(fn => fn()), find: predicate => nodes().find(predicate), unmount: () => slots.forEach(s => s?.cleanup?.()) };
}
const locations = [
  { title: 'Томск / Tomsk', desc: 'Офис продаж / Sales office', lat: 56.4977, lng: 84.9744 },
  { title: 'Астана / Astana', desc: 'Офис продаж · просп. Тауелсиздик, 24, Астана', lat: 51.144297, lng: 71.462634 }
];
const byLabel = label => n => n.props['aria-label'] === label;

test('Advertising cache refresh preserves custom employee films, posters and text', () => {
  const custom = { title: 'Employee text', videoUrl: 'media/custom.mp4', posterUrl: 'images/custom.webp', durationLabel: '0:42' };
  assert.equal(getCompanyProcessMedia(custom), custom);
  const shipped = getCompanyProcessMedia({ ...custom, videoUrl: 'media/processes/casting.mp4?cut=3' });
  assert.equal(shipped.title, custom.title); assert.equal(shipped.posterUrl, custom.posterUrl);
  assert.equal(shipped.durationLabel, '0:13'); assert.equal(shipped.videoUrl, 'media/processes/casting.mp4?edit=6');
  const packing = getCompanyProcessMedia({ videoUrl: 'media/processes/packing.mp4?edit=6', posterUrl: 'images/factory/processes/packing-poster.webp?edit=6' });
  assert.equal(packing.videoUrl, 'media/processes/packing.mp4?brand=8');
  assert.equal(packing.durationLabel, '0:10');
  assert.equal(packing.posterUrl, 'images/factory/processes/packing-poster.webp?brand=8');
  const robot = getCompanyProcessMedia({ videoUrl: 'media/processes/robot-polishing.mp4?edit=6' });
  assert.equal(robot.videoUrl, 'media/processes/robot-polishing.mp4?brand=8');
  assert.equal(robot.durationLabel, '0:13');
});

test('Employee films do not inherit the shipped soundtrack attribution', async () => {
  const h = await harness('src/components/CompanyMedia.jsx', { video: true, videoUrl: 'media/employee-film.mp4', title: 'Employee film', lang: 'en' });
  h.find(n => n.type === 'button').props.onClick(); h.render();
  assert.equal(h.find(n => n.props.className === 'company-music-credit'), undefined);
  h.unmount();
});

test('Atlas: real tiles, source coordinates, zoom controls and teardown', async () => {
  const h = await harness('src/components/CompanyAtlas.jsx', { items: locations, label: 'Network', lang: 'en' });
  assert.equal(h.stats.tiles.url, 'https://tile.openstreetmap.org/{z}/{x}/{y}.png');
  assert.match(h.stats.tiles.options.attribution, /OpenStreetMap/);
  assert.equal(h.stats.mapOptions.touchZoom, true); assert.equal(h.stats.mapOptions.dragging, true); assert.equal(h.stats.mapOptions.keyboard, true);
  assert.equal(h.stats.mapOptions.worldCopyJump, false);
  assert.equal(h.stats.tiles.options.noWrap, true);
  assert.deepEqual(Array.from(h.stats.mapOptions.maxBounds[1]), [85, 180]);
  assert.equal(h.stats.markers.length, 2); assert.equal(h.stats.markers[0].coords[0], locations[0].lat);
  h.find(byLabel('Zoom in')).props.onClick(); h.render(); assert.equal(h.find(byLabel('Zoom out')).props.disabled, false);
  h.stats.wheel({ ctrlKey: false, preventDefault() { throw Error('Page scrolling was captured'); } });
  h.stats.wheel({ ctrlKey: true, deltaY: -1, preventDefault() {} }); assert.equal(h.stats.wheelZoom, 4);
  h.unmount(); assert.equal(h.stats.removed, true);
});

test('Atlas: point selection, address search, reset and unavailable tile fallback', async () => {
  const h = await harness('src/components/CompanyAtlas.jsx', { items: locations, label: 'Network', lang: 'en' });
  h.setReduced(true); h.stats.markers[0].click(); h.render();
  assert.equal(h.stats.fly.options.animate, false);
  assert.equal(h.stats.fly.zoom, 10); assert.ok(h.nodes().some(n => n.children?.includes('The source does not publish a street address.')));
  assert.match(h.find(n => n.type === 'a' && n.props.href.includes('google.com')).props.href, /query=Tomsk$/);
  h.find(n => n.type === 'select').props.onChange({ target: { value: '1' } }); h.render();
  assert.equal(h.stats.fly.zoom, 12); assert.equal(h.stats.markers[1].attributes['aria-pressed'], 'true');
  assert.ok(decodeURIComponent(h.find(n => n.type === 'a' && n.props.href.includes('google.com')).props.href).includes('Тауелсиздик, 24'));
  h.stats.tileEvents.tileerror(); h.render(); assert.ok(h.nodes().some(n => n.children?.includes('Map tiles are unavailable. Addresses and route search still work.')));
  h.find(n => n.type === 'button' && n.children.some(c => c?.children?.includes('All locations'))).props.onClick(); h.render();
  assert.equal(h.stats.markers[1].attributes['aria-pressed'], 'false');
  assert.equal(h.exports.validLocation({ lat: null, lng: 1 }), false);
  assert.equal(h.exports.validLocation({ lat: 100, lng: 1 }), false);
  h.unmount();
});

for (const reduced of [false, true]) test(`Media: open, Escape, pause, focus and scroll restoration (reduced motion: ${reduced})`, async () => {
  const h = await harness('src/components/CompanyMedia.jsx', { video: true, videoUrl: 'media/processes/casting.mp4?cut=3', posterUrl: 'images/factory/processes/casting-poster.webp', title: 'Footage', lang: 'en' }); h.setReduced(reduced);
  h.find(n => n.type === 'button').props.onClick(); h.render();
  assert.equal(h.stats.shown, 1); assert.equal(h.document.body.style.overflow, 'hidden');
  assert.deepEqual(h.nodes().filter(n => n.type === 'source').map(n => n.props.src), ['/laute/media/processes/casting.mp4?cut=3']);
  h.find(n => n.type === 'dialog').props.onCancel({ preventDefault() {} }); h.render();
  assert.equal(h.stats.paused, 1); assert.equal(h.stats.delay, reduced ? 0 : 180);
  h.flush(); h.render();
  assert.equal(h.stats.closed, 1); assert.equal(h.stats.focused, 1);
  assert.equal(h.document.body.style.overflow, 'auto'); assert.equal(h.find(n => n.type === 'dialog'), undefined);
});
