import React from 'react';
import { useApp } from '../context/AppContext';
import { getPublishedPage } from '../utils/pagePublication';
import { getCompanyBlocks } from '../data/factoryStory';
import { BlockRenderer } from '../components/builder/BlockRenderer';

export const CompanyPage = () => {
  const { pagesList = [] } = useApp();
  const page = getPublishedPage(pagesList.find(p => p.slug === 'company' || p.published?.slug === 'company'), true);
  const blocks = getCompanyBlocks(page?.blocks || []);
  return <div className="page-wrapper company-page-v2">{blocks.map((block, index) => <BlockRenderer key={block.id || index} block={block} index={index} totalBlocks={blocks.length} resolvePageLinks/>)}</div>;
};
export default CompanyPage;
