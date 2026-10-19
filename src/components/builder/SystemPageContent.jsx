import React from 'react';
import { HomePage } from '../../pages/HomePage';
import { CatalogPage } from '../../pages/CatalogPage';
import { ContactsPage } from '../../pages/ContactsPage';
import { ServicePage } from '../../pages/ServicePage';
import { WhereToBuyPage } from '../../pages/WhereToBuyPage';
import { PageIntroScope } from '../PageText';
import { NativeContentScope } from './NativeContent';

// Preserve the live catalog, forms, cart and stock widgets when editing a main page.
export function SystemPageContent({ block }) {
  const route = block.route;
  const Page = { home: HomePage, catalog: CatalogPage, contacts: ContactsPage,
    service: ServicePage, 'where-to-buy': WhereToBuyPage }[route];
  return Page ? <NativeContentScope.Provider value={{ section: block.section, edits: block.nativeEdits, blockId: block.id }}><PageIntroScope.Provider value={{ route, intro: block.nativeIntro }}><Page heroSlidesOverride={block.nativeSlides}/></PageIntroScope.Provider></NativeContentScope.Provider> : null;
}
