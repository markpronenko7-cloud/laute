import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, t, openPartnerModal } = useApp();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  if (!isAuthModalOpen) return null;

  const modalT = t.modals.authModal;

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Демо-режим авторизации B2B: на текущем этапе личные кабинеты настраиваются менеджером LAUTE. Пожалуйста, отправьте заявку на регистрацию оптового кабинета.');
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeAuthModal} aria-label={t.modals.close}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#38BDF8', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '8px' }}>
            <Lock size={16} />
            <span>B2B SECURE PORTAL</span>
          </div>
          <h3 className="modal-title">{modalT.title}</h3>
          <p className="modal-subtitle">{modalT.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{modalT.login} *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                className="form-input"
                placeholder="dealer@company.com"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{modalT.password} *</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '0.8125rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>{modalT.remember}</span>
            </label>
            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Для сброса пароля обратитесь к вашему закреплённому менеджеру LAUTE.'); }} style={{ color: '#38BDF8' }}>
              {modalT.forgot}
            </a>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '16px' }}>
            <span>{modalT.submit}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', fontSize: '0.8125rem', color: '#94A3B8', lineHeight: '1.5' }}>
          <p style={{ marginBottom: '8px' }}>{modalT.noAccount}</p>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => { closeAuthModal(); openPartnerModal(); }}
            style={{ width: '100%' }}
          >
            <span>{t.hero.ctaPartner}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
