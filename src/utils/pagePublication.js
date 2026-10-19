// A saved working copy must never replace a page visitors can already see.
export function getPublishedPage(page, allowSystem = false) {
  if (!page) return null;
  const visible = page.status === 'ЧЕРНОВИК' ? page.published : page;
  if (!visible || visible.status === 'ЧЕРНОВИК') return null;
  if (visible.isSystem && !visible.useBuilder && !allowSystem) return null;
  return visible;
}

export function getEditableBlocks(page) {
  const protectedRoutes = ['home', 'catalog', 'contacts', 'service', 'where-to-buy'];
  if (!page?.isSystem || !protectedRoutes.includes(page.slug)) return page?.blocks || [];
  const saved = page.useBuilder && (page.blocks || []).find(b => b.type === 'system_page');
  const native = { ...saved, id: `native-${page.slug}`, type: 'system_page', route: page.slug,
    title: page.title, isVisible: true };
  if (!page.useBuilder) return [native];
  const extras = (page.blocks || []).filter(b => b.type !== 'system_page');
  return saved ? page.blocks.map(b => b.type === 'system_page' ? native : b) : [native, ...extras];
}
