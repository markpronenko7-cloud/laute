import React from 'react';

export const CategoryGraphic = ({ type, className = '' }) => {
  switch (type) {
    case 'kitchen-mixers':
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor">
          <path d="M40 100 V60 C40 35 70 30 75 50 V70" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M35 100 H45" strokeWidth="8" strokeLinecap="round" />
          <rect x="70" y="70" width="10" height="16" rx="2" fill="currentColor" />
          <path d="M28 72 H52" strokeWidth="4" strokeLinecap="round" />
          <path d="M75 86 V92" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      );
    case 'basin-mixers':
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor">
          <path d="M48 100 V52 C48 40 64 36 78 44" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M42 100 H54" strokeWidth="8" strokeLinecap="round" />
          <rect x="74" y="42" width="10" height="12" rx="2" fill="currentColor" transform="rotate(30 74 42)" />
          <path d="M38 60 H58" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'bath-mixers':
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor">
          <rect x="36" y="52" width="48" height="20" rx="3" strokeWidth="5" />
          <path d="M60 72 V92" strokeWidth="6" strokeLinecap="round" />
          <path d="M24 62 H36 M84 62 H96" strokeWidth="6" strokeLinecap="round" />
          <circle cx="60" cy="46" r="6" strokeWidth="4" />
          <path d="M78 42 L88 32" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'shower-mixers':
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor">
          <circle cx="60" cy="60" r="34" strokeWidth="5" />
          <circle cx="60" cy="60" r="14" fill="currentColor" />
          <path d="M60 46 V32" strokeWidth="4" strokeLinecap="round" />
          <path d="M46 60 H32" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'bidet-hygiene':
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor">
          <path d="M44 30 H66 V56 C66 66 54 74 54 84 V100" strokeWidth="5" strokeLinecap="round" />
          <path d="M66 38 H78" strokeWidth="6" strokeLinecap="round" />
          <path d="M38 40 L44 34" strokeWidth="4" strokeLinecap="round" />
          <path d="M48 94 C56 94 62 98 62 104" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'kitchen-sinks':
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor">
          <rect x="22" y="36" width="76" height="52" rx="4" strokeWidth="5" />
          <rect x="30" y="44" width="40" height="36" rx="3" strokeWidth="4" />
          <line x1="78" y1="44" x2="90" y2="44" strokeWidth="3" strokeLinecap="round" />
          <line x1="78" y1="52" x2="90" y2="52" strokeWidth="3" strokeLinecap="round" />
          <line x1="78" y1="60" x2="90" y2="60" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="62" r="5" strokeWidth="3" />
        </svg>
      );
    case 'shower-systems':
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor">
          <path d="M48 96 V34 C48 24 64 22 74 22 H80" strokeWidth="5" strokeLinecap="round" />
          <path d="M72 22 H92" strokeWidth="8" strokeLinecap="round" />
          <path d="M76 28 L76 34 M82 28 L82 34 M88 28 L88 34" strokeWidth="2" strokeLinecap="round" />
          <rect x="42" y="70" width="12" height="18" rx="2" strokeWidth="4" />
          <path d="M54 78 H70 V60" strokeWidth="4" strokeLinecap="round" />
          <circle cx="70" cy="56" r="6" strokeWidth="3" />
        </svg>
      );
    case 'cartridges':
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor">
          <rect x="42" y="46" width="36" height="48" rx="4" strokeWidth="5" />
          <rect x="52" y="24" width="16" height="22" rx="2" strokeWidth="4" />
          <line x1="42" y1="62" x2="78" y2="62" strokeWidth="4" />
          <circle cx="50" cy="78" r="4" fill="currentColor" />
          <circle cx="70" cy="78" r="4" fill="currentColor" />
        </svg>
      );
    case 'hoses':
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor">
          <path d="M30 40 C60 40 30 84 64 84 C84 84 94 70 94 48" strokeWidth="5" strokeLinecap="round" strokeDasharray="6 3" />
          <rect x="22" y="34" width="14" height="12" rx="2" strokeWidth="4" />
          <rect x="88" y="42" width="14" height="12" rx="2" strokeWidth="4" />
        </svg>
      );
    case 'shower-heads':
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor">
          <ellipse cx="60" cy="46" rx="26" ry="16" strokeWidth="5" />
          <path d="M60 62 V94" strokeWidth="5" strokeLinecap="round" />
          <circle cx="60" cy="46" r="3" fill="currentColor" />
          <circle cx="50" cy="44" r="2" fill="currentColor" />
          <circle cx="70" cy="44" r="2" fill="currentColor" />
          <circle cx="54" cy="50" r="2" fill="currentColor" />
          <circle cx="66" cy="50" r="2" fill="currentColor" />
        </svg>
      );
    case 'spouts-aerators':
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor">
          <path d="M36 84 V56 C36 44 48 36 68 36 H88" strokeWidth="6" strokeLinecap="round" />
          <rect x="82" y="36" width="12" height="16" rx="2" fill="currentColor" />
          <line x1="88" y1="52" x2="88" y2="60" strokeWidth="2" strokeDasharray="2 2" />
        </svg>
      );
    case 'diverters-fittings':
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor">
          <rect x="44" y="44" width="32" height="32" rx="2" strokeWidth="5" />
          <line x1="60" y1="26" x2="60" y2="44" strokeWidth="6" strokeLinecap="round" />
          <line x1="60" y1="76" x2="60" y2="94" strokeWidth="6" strokeLinecap="round" />
          <line x1="26" y1="60" x2="44" y2="60" strokeWidth="6" strokeLinecap="round" />
          <line x1="76" y1="60" x2="94" y2="60" strokeWidth="6" strokeLinecap="round" />
        </svg>
      );
    case 'shower-cabins':
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor">
          <rect x="30" y="24" width="60" height="68" rx="2" strokeWidth="4" />
          <path d="M26 92 H94 V98 H26 Z" strokeWidth="4" fill="currentColor" />
          <line x1="60" y1="24" x2="60" y2="92" strokeWidth="3" />
          <line x1="54" y1="54" x2="54" y2="66" strokeWidth="3" strokeLinecap="round" />
          <line x1="66" y1="54" x2="66" y2="66" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor">
          <circle cx="60" cy="60" r="36" strokeWidth="5" />
        </svg>
      );
  }
};

export const HeroShowcaseGraphic = () => {
  return (
    <svg viewBox="0 0 380 240" className="showcase-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="metalChrome" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="35%" stopColor="#94A3B8" />
          <stop offset="65%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        <linearGradient id="waterFlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.1" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Modern High-End Mixer Vector Render */}
      {/* Base mounting flange */}
      <ellipse cx="140" cy="195" rx="36" ry="10" fill="#1E293B" stroke="#475569" strokeWidth="2" />
      <rect x="126" y="145" width="28" height="50" rx="3" fill="url(#metalChrome)" />

      {/* Main body pillar */}
      <path d="M126 150 V85 C126 50 175 42 220 54 L245 62" stroke="url(#metalChrome)" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />

      {/* Aerator nozzle head */}
      <rect x="238" y="62" width="22" height="34" rx="4" fill="url(#metalChrome)" transform="rotate(-15 238 62)" />
      <ellipse cx="258" cy="94" rx="10" ry="4" fill="#38BDF8" />

      {/* Water flow subtle stream */}
      <path d="M256 97 Q 260 145 264 210" stroke="url(#waterFlow)" strokeWidth="6" strokeLinecap="round" filter="url(#glow)" />

      {/* Precision Single-Lever Control Handle */}
      <path d="M102 120 L136 128" stroke="url(#metalChrome)" strokeWidth="10" strokeLinecap="round" />
      <circle cx="102" cy="120" r="8" fill="#38BDF8" />

      {/* Technical Spec Callout Overlays */}
      <g opacity="0.85">
        <line x1="280" y1="80" x2="330" y2="80" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="330" cy="80" r="3" fill="#38BDF8" />
        <text x="290" y="72" fill="#38BDF8" fontSize="10" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="700">AERATOR 24mm</text>

        <line x1="100" y1="160" x2="60" y2="160" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="60" cy="160" r="3" fill="#94A3B8" />
        <text x="35" y="152" fill="#94A3B8" fontSize="10" fontFamily="'Plus Jakarta Sans', sans-serif">BRASS CW617N</text>
      </g>
    </svg>
  );
};
