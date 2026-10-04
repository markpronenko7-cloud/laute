import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, User, ArrowRight, ShieldCheck, Info } from 'lucide-react';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, openPartnerModal } = useApp();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setNotice(true);
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeAuthModal} aria-label="Закрыть">
          <X size={20} />
        </button>

        <div className="modal-header">
          <div className="modal-category-tag">
            <Lock size={15} />
            <span>Кабинет оптового клиента LAUTE</span>
          </div>
          <h3 className="modal-title">Вход для авторизованных партнёров</h3>
          <p className="modal-subtitle">
            Доступ к персональным скидкам от базового прайса, выгрузкам остатков по региональным складам и оформлению заказов.
          </p>
        </div>

        {notice ? (
          <div className="auth-notice-box">
            <Info size={24} color="#B45309" />
            <div>
              <h4>Порядок авторизации и выдачи доступов</h4>
              <p>
                В соответствии с регламентом LAUTE, учетные записи создаются ответственным региональным менеджером после подписания договора. Если вы еще не получили логин и временный пароль, пожалуйста, отправьте заявку на регистрацию партнёра.
              </p>
              <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    closeAuthModal();
                    openPartnerModal();
                  }}
                >
                  Оформить заявку на B2B-кабинет
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setNotice(false)}
                >
                  Назад
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="b2b-form">
            <div className="form-group">
              <label>Логин или рабочий E-mail *</label>
              <input
                type="text"
                required
                placeholder="dealer@company.ru"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Пароль *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full">
              <span>Войти в личный кабинет</span>
              <ArrowRight size={16} />
            </button>

            <div className="modal-honest-footer" style={{ marginTop: '16px' }}>
              <p>
                Ещё не являетесь оптовым партнёром LAUTE?{' '}
                <button
                  type="button"
                  className="inline-link-btn"
                  onClick={() => {
                    closeAuthModal();
                    openPartnerModal();
                  }}
                >
                  Подать заявку на сотрудничество →
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
