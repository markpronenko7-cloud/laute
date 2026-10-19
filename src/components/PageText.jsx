import React from 'react';
import { useApp } from '../context/AppContext';
import { getPageSeo } from '../utils/contentSettings';

export function usePageIntro(route) {
  const { siteContent } = useApp();
  return getPageSeo(siteContent, route);
}

export function PageText({ route, field, as: Tag = 'p', children, ...props }) {
  const intro = usePageIntro(route);
  return <Tag {...props}>{intro[field] || children}</Tag>;
}
