import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Send, 
  Minus, 
  ArrowUpRight, 
  ArrowRight, 
  Eye, 
  Scale, 
  MapPin, 
  Check, 
  RotateCcw 
} from 'lucide-react';
import { withBrandWord } from '../utils/brandFormatter';
import { processConsultantMessage } from '../utils/aiConsultantEngine';

export const AIConsultant = () => {
  const { 
    isAIConsultantOpen, 
    openAIConsultant, 
    closeAIConsultant, 
    navigateTo, 
    products, 
    openProductModal, 
    startComparison, 
    lang 
  } = useApp();

  const baseUrl = import.meta.env.BASE_URL;

  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      sender: 'ai',
      text: lang === 'kz'
        ? 'Сәлеметсіз бе! Мен LAUTE ресми цифрлық кеңесшісімін. Асүй, ванна араластырғыштарын және душ жүйелерін таңдауға көмектесемін. Қандай өнім іздеп жатырсыз?'
        : lang === 'en'
        ? 'Hello! I am the official LAUTE AI consultant. I can assist you with selecting kitchen faucets, bath mixers, or shower systems. What are you looking for today?'
        : 'Здравствуйте! Я официальный AI-консультант LAUTE. Помогу подобрать смесители, душевые решения и сантехнику под ваш проект. Что именно вы ищете?',
      quickChips: [
        'Мне нужен смеситель для кухни',
        'Смеситель для раковины',
        'Душевая система',
        'Что вы продаёте?'
      ],
      recommendedProducts: []
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dialogContext, setDialogContext] = useState({
    step: 'idle',
    category: null,
    budget: null,
    city: 'Алматы',
    requirements: [],
    lastProducts: []
  });

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (isAIConsultantOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isAIConsultantOpen, messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isAIConsultantOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isAIConsultantOpen]);

  const getImgUrl = (path) => {
    if (!path) return `${baseUrl}laute-logo.png`;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const clean = path.replace(/^\//, '');
    return `${baseUrl}${clean}`;
  };

  const handleSendMessage = (textToSend) => {
    const text = (textToSend !== undefined ? textToSend : inputValue).trim();
    if (!text || isTyping) return;

    // Immediately post user message & clear input
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Call intelligence engine with brief natural delay
    setTimeout(() => {
      try {
        const response = processConsultantMessage({
          rawQuery: text,
          currentContext: dialogContext,
          products,
          lang
        });

        setDialogContext(response.newContext);

        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: response.text,
          quickChips: response.quickChips || [],
          recommendedProducts: response.recommendedProducts || []
        };

        setMessages((prev) => [...prev, aiMsg]);

        // Auto trigger comparison modal if requested
        if (response.triggerComparison && response.triggerComparison.length >= 2) {
          startComparison(response.triggerComparison[0], response.triggerComparison[1]);
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: 'Произошла непредвиденная ошибка при обработке запроса. Пожалуйста, попробуйте переформулировать ваш вопрос.',
            quickChips: ['Показать каталог', 'Мне нужен смеситель'],
            recommendedProducts: []
          }
        ]);
      } finally {
        setIsTyping(false);
      }
    }, 280);
  };

  const handleFormSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    handleSendMessage();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: 'Диалог начат заново. Я готов помочь вам с подбором продукции LAUTE. Что вас интересует?',
        quickChips: [
          'Мне нужен смеситель для кухни',
          'Смесители для раковины',
          'Душевая система',
          'Что вы продаёте?'
        ],
        recommendedProducts: []
      }
    ]);
    setDialogContext({
      step: 'idle',
      category: null,
      budget: null,
      city: 'Алматы',
      requirements: [],
      lastProducts: []
    });
  };

  // 1. Minimized State: Sleek permanent floating pill button [ ✦ AI LAUTE ↗ ]
  if (!isAIConsultantOpen) {
    return (
      <button
        type="button"
        className="ai-consultant-floating-trigger"
        onClick={openAIConsultant}
        aria-label="Открыть AI-консультант LAUTE"
        title="Открыть AI-консультант LAUTE"
      >
        <Sparkles size={16} className="trigger-sparkle-icon" />
        <span className="trigger-label">
          ✦ AI <span className="brand-word">LAUTE</span>
        </span>
        <ArrowUpRight size={15} className="trigger-arrow-icon" />
      </button>
    );
  }

  // 2. Open State: Architectural intelligent assistant panel
  return (
    <aside 
      className="ai-consultant-floating-panel" 
      aria-label="AI-консультант LAUTE"
      role="dialog"
    >
      {/* Top Header Bar */}
      <div className="ai-panel-header">
        <div className="ai-panel-identity">
          <div className="ai-panel-avatar">
            <Sparkles size={14} className="ai-sparkle-icon" />
          </div>
          <div className="ai-panel-title-wrap">
            <div className="ai-panel-title">
              <span>AI-КОНСУЛЬТАНТ </span>
              <span className="brand-word">LAUTE</span>
            </div>
            <div className="ai-panel-status">
              <span className="ai-status-dot"></span>
              <span>
                {lang === 'kz' ? 'Онлайн • Каталог активен' : lang === 'en' ? 'Online • Catalog synced' : 'Онлайн • Каталог активен'}
              </span>
            </div>
          </div>
        </div>

        {/* Top Header Controls: Clear & Minimize */}
        <div className="ai-header-controls">
          <button
            type="button"
            className="btn-ai-header-icon"
            onClick={handleClearChat}
            title="Очистить диалог"
            aria-label="Очистить диалог"
          >
            <RotateCcw size={13} />
          </button>

          <button
            type="button"
            className="btn-ai-minimize"
            onClick={closeAIConsultant}
            title={lang === 'kz' ? 'Жию' : lang === 'en' ? 'Minimize' : 'Свернуть'}
            aria-label="Свернуть AI-консультант"
          >
            <Minus size={14} />
            <span className="minimize-label">{lang === 'kz' ? 'Жию' : lang === 'en' ? 'Minimize' : 'Свернуть'}</span>
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="ai-panel-body">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`ai-message-row ${msg.sender === 'user' ? 'msg-user' : 'msg-ai'}`}
          >
            <div className="ai-message-bubble">
              <div className="ai-message-text">{withBrandWord(msg.text)}</div>

              {/* Real Recommended Products Cards */}
              {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                <div className="ai-recommended-products-grid">
                  {msg.recommendedProducts.map((prod) => (
                    <div key={prod.article} className="ai-product-card">
                      <div className="ai-prod-thumb-row">
                        <img 
                          src={getImgUrl(prod.photo1)} 
                          alt={prod.name} 
                          className="ai-prod-thumb-img"
                          onError={(e) => { e.target.src = `${baseUrl}images/cat_laute_brand.jpg`; }}
                        />
                        <div className="ai-prod-meta">
                          <span className="ai-prod-art">Арт. {prod.article}</span>
                          <div className="ai-prod-title">{prod.name}</div>
                          <div className="ai-prod-price">
                            {prod.price?.toLocaleString('ru-RU')} {prod.currency || '₸'}
                          </div>
                        </div>
                      </div>

                      {/* City stock pill */}
                      <div className="ai-prod-stock-info">
                        <MapPin size={11} color="#EA580C" />
                        <span>
                          {prod.cityStock?.['Алматы'] > 0 
                            ? `Алматы: ${prod.cityStock['Алматы']} шт. в наличии` 
                            : 'Алматы: под заказ'}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="ai-prod-actions">
                        <button
                          type="button"
                          className="btn-ai-action-primary"
                          onClick={() => openProductModal(prod)}
                        >
                          <Eye size={12} />
                          <span>Посмотреть товар</span>
                        </button>

                        <button
                          type="button"
                          className="btn-ai-action-outline"
                          onClick={() => {
                            // Find comparison sibling
                            const other = msg.recommendedProducts.find(p => p.article !== prod.article) || products.find(p => p.category === prod.category && p.article !== prod.article);
                            if (other) startComparison(prod, other);
                          }}
                          title="Сравнить с другой моделью"
                        >
                          <Scale size={12} />
                          <span>Сравнить</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick interactive response chips */}
              {msg.quickChips && msg.quickChips.length > 0 && (
                <div className="ai-quick-chips-row">
                  {msg.quickChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="ai-quick-chip"
                      onClick={() => handleSendMessage(chip)}
                    >
                      <span>{chip}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="ai-message-row msg-ai">
            <div className="ai-message-bubble ai-typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Bar Footer */}
      <div className="ai-panel-footer">
        <form className="ai-input-form" onSubmit={handleFormSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="ai-text-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              lang === 'kz'
                ? 'Хабарлама жазыңыз…'
                : lang === 'en'
                ? 'Type your question…'
                : 'Напишите ваш вопрос (например: «Мне нужен смеситель для кухни»)...'
            }
            aria-label="Сообщение для AI-консультанта"
          />
          <button
            type="submit"
            className="ai-send-btn"
            disabled={!inputValue.trim() || isTyping}
            title="Отправить сообщение"
            aria-label="Отправить"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </aside>
  );
};

export default AIConsultant;
