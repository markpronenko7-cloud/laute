import React, { createContext, forwardRef, useContext } from 'react';
import { resolveMediaUrl } from '../../services/adminApi';
import { isSafeActionLink } from '../SiteAction';
import { useApp } from '../../context/AppContext';
import { usePageIntro } from '../PageText';
export const NativeContentScope = createContext(null);
export const NativeEditorScope = createContext(null);
export const EditableSection = forwardRef(function EditableSection({
  sectionKey,
  children,
  ...props
}, ref) {
  const scope = useContext(NativeContentScope);
  if (scope?.section && scope.section !== sectionKey) return null;
  return <section {...props} ref={ref} data-content-section={sectionKey}>{children}</section>;
});
export function NativeSectionGate({
  sectionKey,
  children
}) {
  const scope = useContext(NativeContentScope);
  return !scope?.section || scope.section === sectionKey ? children : null;
}
export function EditableNode({
  as: Tag = 'span',
  editKey,
  kind = 'text',
  introRoute,
  introField,
  children,
  ...props
}) {
  const scope = useContext(NativeContentScope);
  const editor = useContext(NativeEditorScope);
  const {
    lang,
    navigateTo
  } = useApp();
  const intro = usePageIntro(introRoute);
  const saved = scope?.edits?.[editKey]?.[lang] || {};
  const editing = !!editor && !!scope;
  const select = e => {
    if (!editing) return;
    e.preventDefault();
    e.stopPropagation();
    editor.onSelect({
      blockId: scope.blockId,
      key: editKey,
      kind,
      text: e.currentTarget.textContent?.trim() || '',
      src: saved.src ?? props.src ?? '',
      alt: saved.alt ?? props.alt ?? '',
      link: saved.link ?? props.href ?? '',
      newTab: saved.newTab ?? props.target === '_blank'
    });
  };
  const click = e => {
    if (editing) return;
    if (saved.link !== undefined && kind !== 'submit') {
      const link = saved.link.trim();
      e.preventDefault();
      e.stopPropagation();
      if (!isSafeActionLink(link) || !link) return;
      if (link.startsWith('/')) return navigateTo(link.slice(1) || 'home');
      if (link.startsWith('#')) return document.getElementById(link.slice(1))?.scrollIntoView({
        behavior: 'smooth'
      });
      if (saved.newTab && /^https?:/i.test(link)) window.open(link, '_blank', 'noopener,noreferrer');else window.location.assign(link);
      return;
    }
    props.onClick?.(e);
  };
  const label = saved.text;
  let content = introField && intro[introField] ? intro[introField] : children;
  if (label !== undefined && !(kind === 'submit' && props['aria-busy'])) {
    let replaced = false;
    // Keep button icons and replace its label only.
    content = ['button', 'link', 'submit'].includes(kind) ? React.Children.map(children, child => {
      if (!replaced && React.isValidElement(child) && child.type === 'span') {
        replaced = true;
        return React.cloneElement(child, {}, label);
      }
      if (!replaced && typeof child === 'string' && child.trim()) {
        replaced = true;
        return label;
      }
      return child;
    }) : label;
    if (['button', 'link', 'submit'].includes(kind) && !replaced) content = label;
  }
  const imageProps = kind === 'image' ? {
    src: resolveMediaUrl(saved.src ?? props.src),
    alt: saved.alt ?? props.alt
  } : kind === 'background' ? {
    src: undefined,
    style: {
      ...props.style,
      backgroundImage: `url("${resolveMediaUrl(saved.src ?? props.src)}")`
    }
  } : {};
  const actionProps = kind === 'link' && saved.link !== undefined ? {
    href: isSafeActionLink(saved.link) ? saved.link : '#',
    target: saved.newTab ? '_blank' : undefined,
    rel: saved.newTab ? 'noopener noreferrer' : undefined
  } : {};
  return <Tag {...props} {...imageProps} {...actionProps} data-native-field={editing ? editKey : undefined} data-native-kind={editing ? kind : undefined} data-native-selected={editing && editor.selected?.blockId === scope.blockId && editor.selected?.key === editKey ? '' : undefined} onClickCapture={editing ? select : props.onClickCapture} onClick={click}>{kind === 'image' ? undefined : content}</Tag>;
}
