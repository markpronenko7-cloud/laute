// Isolated component event/state checks; these do not replace browser visual QA.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import { transform } from 'esbuild';

async function harness(file, props) {
  const slots = [], effects = [], timers = [];
  let cursor = 0, tree, reduced = false, pointedIndex = null;
  const stats = { shown: 0, closed: 0, paused: 0, focused: 0, delay: null };
  const native = { showModal: () => stats.shown++, close: () => stats.closed++, focus: () => stats.focused++, querySelector: () => ({ pause: () => stats.paused++ }) };
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
  const code = (await transform(fs.readFileSync(file, 'utf8'), { loader: 'jsx', format: 'cjs' })).code;
  vm.runInNewContext(code, { exports: module.exports, module, require: name => name === 'react' ? React : name === 'react-dom' ? { createPortal: x => x } : name === 'lucide-react' ? icons : { resolveMediaUrl: x => '/laute/' + x }, document, window: { matchMedia: () => ({ matches: reduced }) }, setTimeout: (fn, delay) => { stats.delay = delay; timers.push(fn); return timers.length; }, clearTimeout: () => {} });
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

test('Map: zoom limits, reset, keyboard movement and bounded dragging', async () => {
  const h = await harness('src/components/CompanyMap.jsx', { items: locations, label: 'Network', lang: 'en' });
  for (let i = 0; i < 12; i++) { h.find(byLabel('Zoom in')).props.onClick(); h.render(); }
  assert.equal(h.find(n => n.type === 'output').children[0], 800);
  assert.equal(h.find(byLabel('Zoom in')).props.disabled, true);
  let canvas = h.find(n => n.type === 'svg');
  const before = h.find(n => n.type === 'g').props.transform;
  canvas.props.onKeyDown({ target: canvas, currentTarget: canvas, key: 'ArrowRight', preventDefault() {} }); h.render();
  assert.notEqual(h.find(n => n.type === 'g').props.transform, before);
  const target = { setPointerCapture() {}, getBoundingClientRect: () => ({ width: 500 }) };
  canvas = h.find(n => n.type === 'svg');
  canvas.props.onPointerDown({ isPrimary: true, button: 0, pointerId: 1, clientX: 0, clientY: 0, currentTarget: target });
  canvas.props.onPointerMove({ pointerId: 1, clientX: 100000, clientY: -100000, currentTarget: target }); h.render();
  assert.match(h.find(n => n.type === 'g').props.transform, /translate\(0 -2940\) scale\(8\)/);
  h.find(byLabel('Show the world')).props.onClick(); h.render();
  assert.equal(h.find(n => n.type === 'g').props.transform, 'translate(0 0) scale(1)');
  assert.equal(h.find(byLabel('Zoom out')).props.disabled, true);
});

test('Map: keyboard selection, honest city-only detail and address search links', async () => {
  const h = await harness('src/components/CompanyMap.jsx', { items: locations, label: 'Network', lang: 'en' });
  h.find(n => n.type === 'g' && n.props['data-map-index'] === 0).props.onKeyDown({ key: 'Enter', preventDefault() {} }); h.render();
  assert.ok(h.nodes().some(n => n.children?.includes('The source provides the city only; a street address is not published.')));
  assert.match(h.find(n => n.type === 'a' && n.props.href.includes('google.com')).props.href, /query=Tomsk$/);
  h.find(n => n.type === 'button' && n.children.includes('Astana')).props.onClick(); h.render();
  assert.ok(decodeURIComponent(h.find(n => n.type === 'a' && n.props.href.includes('google.com')).props.href).includes('Тауелсиздик, 24'));
  assert.equal(h.find(n => n.type === 'g' && n.props['data-map-index'] === 1).props['aria-pressed'], true);
});

test('Map: pointer tap selects a point; dragging does not select it', async () => {
  const h = await harness('src/components/CompanyMap.jsx', { items: locations, label: 'Network', lang: 'en' });
  h.point(1);
  const target = { setPointerCapture() {}, contains: () => true, getBoundingClientRect: () => ({ width: 1000 }) };
  let canvas = h.find(n => n.type === 'svg');
  canvas.props.onPointerDown({ isPrimary: true, button: 0, pointerId: 1, clientX: 20, clientY: 20, currentTarget: target });
  canvas.props.onPointerMove({ pointerId: 1, clientX: 100, clientY: 20, currentTarget: target });
  canvas.props.onPointerUp({ clientX: 100, clientY: 20, currentTarget: target }); h.render();
  assert.equal(h.find(n => n.props['data-map-index'] === 1).props['aria-pressed'], false);
  canvas = h.find(n => n.type === 'svg');
  canvas.props.onPointerDown({ isPrimary: true, button: 0, pointerId: 2, clientX: 20, clientY: 20, currentTarget: target });
  canvas.props.onPointerUp({ clientX: 20, clientY: 20, currentTarget: target }); h.render();
  assert.equal(h.find(n => n.props['data-map-index'] === 1).props['aria-pressed'], true);
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
