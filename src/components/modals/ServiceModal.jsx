import { InquiryFeedback } from '../InquiryFeedback';
import { REGIONS_CONFIG } from '../../data/regionsData';
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, Clock, CheckCircle2 } from 'lucide-react';
import { submitLeadInquiry } from '../../services/adminApi';

export const ServiceModal = () => {
  const { isServiceModalOpen, closeServiceModal, t, lang, region } = useApp();
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const sendingRef = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [formData, setFormData] = useState({
    region: region || 'siberia',
    article: '',
    purchaseDate: '',
    clientType: 'B2B',
    name: '',
    contact: '',
    description: ''
  });

  useEffect(() => {
    if (isServiceModalOpen && !sendingRef.current) { setSubmitted(false); setSendError(''); setFormData(prev => ({ ...prev, region })); }
  }, [isServiceModalOpen, region]);

  if (!isServiceModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sendingRef.current) return;
    const generatedTicket = 'LT-SRV-' + Math.floor(100000 + Math.random() * 900000);
    setTicketId(generatedTicket);
    sendingRef.current = true;
    setIsSending(true);
    setSendError('');
    try {
      await submitLeadInquiry({
        source: 'service_modal',
        ticketId: generatedTicket,
        ...formData
      });
    } catch (err) {
      setSendError(err.message || 'Не удалось отправить обращение. Попробуйте ещё раз.');
      return;
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
    setSubmitted(true);
  };

  const modalT = t.modals.serviceModal;

  return (
    <div className="modal-overlay" onClick={closeServiceModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeServiceModal} aria-label={t.modals.close}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <h3 className="modal-title">{modalT.title}</h3>
          <p className="modal-subtitle" style={{ color: '#38BDF8', fontWeight: '500' }}>
            {modalT.subtitle}
          </p>
        </div>

        {submitted ? (
          <div>
            <div className="modal-alert" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                <CheckCircle2 size={20} />
                <span>{modalT.success}</span>
              </div>
              <div style={{ fontSize: '0.8125rem', marginTop: '6px' }}>
                Регистрационный номер заявки: <strong>{ticketId}</strong>
              </div>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => { setSubmitted(false); closeServiceModal(); }}
              style={{ width: '100%' }}
            >
              <span>{t.modals.close}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <InquiryFeedback sending={isSending} error={sendError} />
            <label className="form-group">{lang === 'en' ? 'Request region' : lang === 'kz' ? 'Өтініш өңірі' : 'Регион обращения'}
              <select className="form-select" value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value })}>
                {REGIONS_CONFIG.map(r => <option key={r.id} value={r.id}>{r.names[lang] || r.names.ru}</option>)}
              </select>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">{modalT.article} *</label>
                <input
                  type="text"
                  required
                  placeholder="Например, LT-MIX-401"
                  className="form-input"
                  value={formData.article}
                  onChange={(e) => setFormData({ ...formData, article: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{modalT.purchaseDate}</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{modalT.clientType}</label>
              <select
                className="form-select"
                value={formData.clientType}
                onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
              >
                <option value="B2B">Оптовый партнёр / Дилер / Монтажная организация</option>
                <option value="RETAIL">Розничный покупатель</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">{modalT.name} *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{modalT.contact} *</label>
                <input
                  type="text"
                  required
                  placeholder="Телефон или Email"
                  className="form-input"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{modalT.description} *</label>
              <textarea
                required
                className="form-textarea"
                rows={3}
                placeholder="Укажите характер вопроса или неисправности..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <button type="submit" disabled={isSending} aria-busy={isSending} className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              <Send size={16} />
              <span>{isSending ? (lang === 'en' ? 'Sending…' : lang === 'kz' ? 'Жіберілуде…' : 'Отправляем…') : (modalT.submit)}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
