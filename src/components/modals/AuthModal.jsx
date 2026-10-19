import React from 'react';
import { useApp } from '../../context/AppContext';
import { PartnerLogin } from '../partners/PartnerLogin';
import '../../styles/partners.css';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, openPartnerModal } = useApp();
  if (!isAuthModalOpen) return null;
  return <div className="modal-overlay" onClick={closeAuthModal}><div className="modal-content" role="dialog" aria-modal="true" aria-label="Вход в кабинет" onClick={e => e.stopPropagation()}><button className="modal-close-btn" aria-label="Закрыть" onClick={closeAuthModal}>×</button><PartnerLogin /><button className="inline-link-btn" onClick={() => { closeAuthModal(); openPartnerModal(); }}>Стать партнёром →</button></div></div>;
}
