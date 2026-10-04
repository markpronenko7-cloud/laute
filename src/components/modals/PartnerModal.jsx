import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, CheckCircle2 } from 'lucide-react';

export const PartnerModal = () => {
  const { isPartnerModalOpen, closePartnerModal, t } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    inn: '',
    city: '',
    contactPerson: '',
    phone: '',
    email: '',
    comment: ''
  });

  if (!isPartnerModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      // Auto close after 3s
      setTimeout(() => {
        setSubmitted(false);
        closePartnerModal();
      }, 2500);
    }, 500);
  };

  const modalT = t.modals.partnerModal;

  return (
    <div className="modal-overlay" onClick={closePartnerModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closePartnerModal} aria-label={t.modals.close}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <h3 className="modal-title">{modalT.title}</h3>
          <p className="modal-subtitle">{modalT.subtitle}</p>
        </div>

        {submitted ? (
          <div className="modal-alert" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px', textAlign: 'center', background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#0EA5E9', fontWeight: 600 }}>
              <CheckCircle2 size={22} />
              <span>{modalT.success}</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
              Заявка сформирована (Интерфейс подготовлен для интеграции с CRM).
            </p>
            <div style={{ fontSize: '0.78rem', color: '#CBD5E1', marginTop: '4px' }}>
              Прямой контакт: <a href="tel:+79833105626" style={{ color: '#F97316', fontWeight: 600 }}>+7 (983) 310-56-26</a> • <a href="mailto:opt@laute.ltd" style={{ color: '#38BDF8' }}>opt@laute.ltd</a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{modalT.companyName} *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="ТОО / ООО / ИП"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">{modalT.inn}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="БИН / ИНН"
                  value={formData.inn}
                  onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{modalT.city} *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Алматы, Новосибирск..."
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{modalT.contactPerson} *</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">{modalT.phone} *</label>
                <input
                  type="tel"
                  required
                  className="form-input"
                  placeholder="+7 (___) ___-__-__"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{modalT.email} *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="partner@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{modalT.comment}</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Смесители оптом, комплектация объекта..."
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              <Send size={16} />
              <span>{modalT.submit}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
