import React from 'react';

/**
 * Formats any string or React child, replacing occurrences of "LAUTE"
 * with the official Roman serif brand typography <span className="brand-word">LAUTE</span>.
 */
export const withBrandWord = (content) => {
  if (typeof content !== 'string') return content;
  if (!content.includes('LAUTE')) return content;

  const parts = content.split(/(LAUTE)/g);
  return parts.map((part, index) =>
    part === 'LAUTE' ? (
      <span key={index} className="brand-word">
        LAUTE
      </span>
    ) : (
      part
    )
  );
};

export const BrandWord = ({ children = 'LAUTE' }) => (
  <span className="brand-word">{children}</span>
);

export default withBrandWord;
