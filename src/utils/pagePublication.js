// A saved working copy must never replace a page visitors can already see.
export function getPublishedPage(page, allowSystem = false) {
  if (!page) return null;
  const visible = page.status === 'ЧЕРНОВИК' ? page.published : page;
  if (!visible || visible.status === 'ЧЕРНОВИК') return null;
  if (visible.isSystem && !visible.useBuilder && !allowSystem) return null;
  return visible;
}
