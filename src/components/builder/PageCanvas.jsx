import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// A real viewport keeps responsive layouts and page styles separate from the CMS.
export function PageCanvas({
  device,
  children,
  onReady
}) {
  const frame = useRef(null);
  const [target, setTarget] = useState(null);
  const ready = () => {
    const doc = frame.current?.contentDocument;
    if (!doc?.body || doc.body.dataset.ready) return;
    doc.body.dataset.ready = 'true';
    doc.body.className = 'native-editor-surface';
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => {
      const clone = node.cloneNode(true);
      if (node.tagName === 'LINK') clone.href = node.href;
      doc.head.appendChild(clone);
    });
    setTarget(doc.body);
    onReady?.(doc);
  };
  useEffect(() => {
    ready();
  }, []);
  return <div className={'builder-canvas-frame frame-' + device} style={{
    width: device === 'mobile' ? 390 : device === 'tablet' ? 768 : '100%'
  }}>
    <iframe ref={frame} title="Макет страницы" onLoad={ready} srcDoc="<!doctype html><html lang='ru'><head><base target='_blank'></head><body></body></html>" />
    {target && createPortal(children, target)}
  </div>;
}
