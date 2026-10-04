import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, ArrowRight, Info } from 'lucide-react';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, openPartnerModal, lang, t } = useApp();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setNotice(true);
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
          <h3 className="modal-title">{authT.title || 'Вход для авторизованных партнёров'}</h3>
          <p className="modal-subtitle">
            {authT.subtitle || 'Доступ к персональным скидкам от базового прайса, выгрузкам остатков по региональным складам и оформлению заказов.'}
          </p>
        </div>

        {notice ? (
          <div className="auth-notice-box">
            <Info size={24} color="#B45309" />
            <div>
              <h4>{lang === 'kz' ? 'Авторизация және қолжетімділік беру тәртібі' : lang === 'en' ? 'Authorization & Access Procedure' : 'Порядок авторизации и выдачи доступов'}</h4>
              <p>
                {lang === 'kz' ? 'LAUTE регламентіне сәйкес, есептік жазбаларды шартқа қол қойылғаннан кейін жауапты өңірлік менеджер жасайды. Егер сіз логин мен уақытша құпиясөзді әлі алмаған болсаңыз, серіктесті тіркеуге өтінім жіберіңіз.' : lang === 'en' ? 'According to LAUTE protocol, client accounts are provisioned by regional territory managers after agreement signing. If you have not received login credentials yet, please submit a partnership application.' : 'В соответствии с регламентом LAUTE, учетные записи создаются ответственным региональным менеджером после подписания договора. Если вы еще не получили логин и временный пароль, пожалуйста, отправьте заявку на регистрацию партнёра.'}
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
                  {lang === 'kz' ? 'B2B-кабинетке өтінім беру' : lang === 'en' ? 'Request B2B Portal Access' : 'Оформить заявку на B2B-кабинет'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setNotice(false)}
                >
                  {lang === 'kz' ? 'Артқа' : lang === 'en' ? 'Back' : 'Назад'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="b2b-form">
            <div className="form-group">
              <label>{lang === 'kz' ? 'Логин немесе жұмыс E-mail' : lang === 'en' ? 'Login or Work Email' : 'Логин или рабочий E-mail'} *</label>
              <input
                type="text"
                required
                placeholder="dealer@company.com"
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
