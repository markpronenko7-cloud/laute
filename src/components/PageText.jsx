import React, { createContext, useContext } from 'react';
import { useApp } from '../context/AppContext';
import { getPageSeo } from '../utils/contentSettings';

export const PageIntroScope = createContext(null);

export function usePageIntro(route) {
  const { siteContent } = useApp();
  const override = useContext(PageIntroScope);
  const fields = override?.route === route ? Object.fromEntries(Object.entries(override.intro || {}).filter(([, value]) => value)) : {};
  return { ...getPageSeo(siteContent, route), ...fields };
}

export function PageText({ route, field, as: Tag = 'p', children, ...props }) {
  const intro = usePageIntro(route);
  return <Tag {...props}>{intro[field] || children}</Tag>;
}
