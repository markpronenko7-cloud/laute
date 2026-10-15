import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, ArrowRight, Info, CheckCircle2, LogOut, Warehouse } from 'lucide-react';

export const AuthModal = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    openPartnerModal, 
    lang, 
    t,
    isB2BAuthorized,
    setIsB2BAuthorized,
    activeWarehouse
  } = useApp();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) return;
    setIsB2BAuthorized(true);
    setSuccessNotice(true);
    setTimeout(() => {
      setSuccessNotice(false);
      closeAuthModal();
    }, 1200);
  };

  const handleLogout = () => {
    setIsB2BAuthorized(false);
    closeAuthModal();
  };

  const authT = t.modals?.auth || {};

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeAuthModal} aria-label={t.modals?.close || 'Закрыть'}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <div className="modal-category-tag">
            <Lock size={15} />
            <span>{lang === 'kz' ? 'LAUTE көтерме клиентінің кабинеті' : lang === 'en' ? 'LAUTE Wholesale Client Portal' : 'Кабинет оптового клиента LAUTE'}</span>
          </div>
          <h3 className="modal-title">
            {isB2BAuthorized ? 'Партнёрский B2B-доступ активен' : (authT.title || 'Вход для авторизованных партнёров')}
          </h3>
          <p className="modal-subtitle">
            {isB2BAuthorized 
              ? `Вам открыт служебный просмотр складских остатков по текущему филиалу: «${activeWarehouse?.name || 'Склад не выбран'}».`
              : (authT.subtitle || 'Доступ к персональным скидкам от базового прайса, выгрузкам остатков по региональным складам и оформлению заказов.')
            }
          </p>
        </div>

        {isB2BAuthorized ? (
          <div className="auth-notice-box" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <CheckCircle2 size={24} color="#10B981" />
            <div>
              <h4 style={{ color: '#10B981' }}>Авторизация подтверждена</h4>
              <p>
                Текущий склад по умолчанию: <strong>{activeWarehouse?.name || 'Не выбран'}</strong> ({activeWarehouse?.city || activeWarehouse?.country || '—'}).
                Вы можете переключать склад в каталоге или личном кабинете.
              </p>
              <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={closeAuthModal}
                >
                  Перейти к каталогу с остатками
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleLogout}
                >
                  <LogOut size={14} />
                  <span>Выйти из кабинета</span>
                </button>
              </div>
            </div>
          </div>
        ) : successNotice ? (
          <div className="auth-notice-box" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <CheckCircle2 size={24} color="#10B981" />
            <div>
              <h4 style={{ color: '#10B981' }}>Успешный вход в систему</h4>
              <p>Остатки соответствующего склада активированы.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="b2b-form">
            <div className="form-group">
              <label>{lang === 'kz' ? 'Логин немесе жұмыс E-mail' : lang === 'en' ? 'Login or Work Email' : 'Логин или рабочий E-mail'} *</label>
              <input
                type="text"
                required
                placeholder="partner@company.com"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>{lang === 'kz' ? 'Құпиясөз' : lang === 'en' ? 'Password' : 'Пароль'} *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full">
              <span>{lang === 'kz' ? 'Жеке кабинетке кіру' : lang === 'en' ? 'Log in to Portal' : 'Войти в личный кабинет'}</span>
              <ArrowRight size={16} />
            </button>

            <div className="modal-honest-footer" style={{ marginTop: '16px' }}>
              <p>
                {lang === 'kz' ? 'Әлі LAUTE көтерме серіктесі емессіз бе? ' : lang === 'en' ? 'Not a LAUTE wholesale partner yet? ' : 'Ещё не являетесь оптовым партнёром LAUTE? '}
                <button
                  type="button"
                  className="inline-link-btn"
                  onClick={() => {
                    closeAuthModal();
                    openPartnerModal();
                  }}
                >
                  {lang === 'kz' ? 'Ынтымақтастыққа өтінім беру →' : lang === 'en' ? 'Apply for partnership →' : 'Подать заявку на сотрудничество →'}
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

