import { NATIVE_SECTIONS } from '../data/nativeSections.js';
// A saved working copy must never replace a page visitors can already see.
export function getPublishedPage(page, allowSystem = false) {
  if (!page) return null;
  const visible = page.status === 'ЧЕРНОВИК' ? page.published : page;
  if (!visible || visible.status === 'ЧЕРНОВИК') return null;
  if (visible.isSystem && !visible.useBuilder && !allowSystem) return null;
  return visible;
}

export function getEditableBlocks(page) {
  const protectedRoutes = ['home', 'catalog', 'service', 'where-to-buy'];
  if (!page?.isSystem || !protectedRoutes.includes(page.slug)) return page?.blocks || [];
  const saved = page.useBuilder && (page.blocks || []).find(b => b.type === 'system_page');
  const sections = NATIVE_SECTIONS.filter(s => s.route === page.slug).map(s => ({ ...saved,
    id: `native-${s.id}`, type: 'system_section', route: page.slug, section: s.id,
    title: s.label, isVisible: true, protected: page.slug === 'catalog' || /form|lead/.test(s.id) }));
  if (!page.useBuilder) return sections;
  if (page.blocks?.some(b => b.type === 'system_section')) return page.blocks;
  return saved ? page.blocks.flatMap(b => b.type === 'system_page' ? sections : [b]) : [...sections, ...(page.blocks || [])];
}
