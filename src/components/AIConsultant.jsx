import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Send, 
  Minus, 
  ArrowUpRight, 
  Eye, 
  Scale, 
  MapPin, 
  RotateCcw 
} from 'lucide-react';
import { withBrandWord } from '../utils/brandFormatter';
import { processConsultantMessage } from '../utils/aiConsultantEngine';
import { getLauteAIEngine } from '../ai/index.js';

export const AIConsultant = () => {
  const { 
    isAIConsultantOpen, 
    openAIConsultant, 
    closeAIConsultant, 
    products, 
    openProductModal, 
    startComparison, 
    lang 
  } = useApp();

  const baseUrl = import.meta.env.BASE_URL;

  const createInitialMessage = (currentLang) => ({
    id: 'welcome',
    sender: 'ai',
    text: currentLang === 'kz'
      ? 'Сәлеметсіз бе! Мен LAUTE ресми цифрлық AI-кеңесшісімін. Асүй, ванна араластырғыштарын таңдауға, техникалық ерекшеліктерді түсіндіруге және сұрақтарыңызға жауап беруге дайынмын. Сізге қандай көмек қажет?'
      : currentLang === 'en'
      ? 'Hello! I am the official digital AI consultant for LAUTE. I am here to help you navigate sanitary engineering, explain technical features, and select the right fittings. How can I assist you today?'
      : 'Здравствуйте! Я официальный цифровой AI-консультант LAUTE. Помогу разобраться в нюансах сантехники, просто объясню устройство оборудования и помогу подобрать надежные решения. О чём хотите поговорить?',
    quickChips: [
      'Мне нужен смеситель для кухни',
      'Как выбрать смеситель?',
      'Что такое картридж?',
      'Расскажи о компании LAUTE'
    ],
    recommendedProducts: []
  });

  // Persistent messages across component life and route transitions
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('laute_ai_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [createInitialMessage(lang)];
  });

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dialogContext, setDialogContext] = useState(() => {
    try {
      const saved = sessionStorage.getItem('laute_ai_context');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      step: 'idle',
      lastTopic: null,
      lastSubject: null,
      lastAiQuestion: null,
      category: null,
      budget: null,
      city: 'Алматы',
      requirements: [],
      lastProducts: []
    };
  });

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const isSubmittingRef = useRef(false);

  // Sync messages & context to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('laute_ai_messages', JSON.stringify(messages));
    } catch {
      // quota fallback
    }
  }, [messages]);

  useEffect(() => {
    try {
      sessionStorage.setItem('laute_ai_context', JSON.stringify(dialogContext));
    } catch {
      // quota fallback
    }
  }, [dialogContext]);

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
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [isAIConsultantOpen]);

  // Listen for partnership analysis CTA trigger
  useEffect(() => {
    const handlePartnerAnalysisEvent = () => {
      const promptText = lang === 'kz'
        ? 'LAUTE-мен серіктестік мүмкіндіктерін талдағым келеді'
        : lang === 'en'
        ? 'I would like to analyze partnership opportunities with LAUTE'
        : 'Здравствуйте! Я хочу проанализировать возможности сотрудничества с LAUTE для моей компании';
      setTimeout(() => {
        handleSendMessage(promptText);
      }, 150);
    };

    window.addEventListener('laute:ai:partner-analysis', handlePartnerAnalysisEvent);
    return () => window.removeEventListener('laute:ai:partner-analysis', handlePartnerAnalysisEvent);
  }, [lang]);

  const getImgUrl = (path) => {
    if (!path) return `${baseUrl}laute-logo.png`;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const clean = path.replace(/^\//, '');
    return `${baseUrl}${clean}`;
  };

  const handleSendMessage = (textToSend) => {
    const text = (textToSend !== undefined ? textToSend : inputValue).trim();
    if (!text || isTyping || isSubmittingRef.current) return;

    // Concurrency lock to prevent double-submit
    isSubmittingRef.current = true;

    // Immediately post user message & clear input
    const userMsg = {
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: 'user',
      text
    };

    setInputValue('');
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Realistic typing delay for natural conversation
    setTimeout(() => {
      try {
        const historySnapshot = [...messages, userMsg];
        let response;
        try {
          const engine = getLauteAIEngine();
          response = engine.processMessage({
            rawQuery: text,
            currentContext: dialogContext,
            products,
            history: historySnapshot,
            lang
          });
        } catch (engineErr) {
          console.warn('Fallback to legacy consultant engine:', engineErr);
          response = processConsultantMessage({
            rawQuery: text,
            currentContext: dialogContext,
            products,
            history: historySnapshot,
            lang
          });
        }

        if (response.newContext) {
          setDialogContext(response.newContext);
        }

        const aiMsg = {
          id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
        console.error('AI Consultant processing error:', err);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-err-${Date.now()}`,
            sender: 'ai',
            text: 'Я готов помочь вам с любыми вопросами по продукции и сантехнике LAUTE. О чём хотите узнать?',
            quickChips: ['Мне нужен смеситель для кухни', 'Как выбрать смеситель?', 'Что такое картридж?'],
            recommendedProducts: []
          }
        ]);
      } finally {
        setIsTyping(false);
        isSubmittingRef.current = false;
      }
    }, 240);
  };

  const handleFormSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    handleSendMessage();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    try {
      getLauteAIEngine().resetSession();
    } catch {
      // ignore
    }
    const freshInitial = createInitialMessage(lang);
    setMessages([freshInitial]);
    const emptyContext = {
      step: 'idle',
      lastTopic: null,
      lastSubject: null,
      lastAiQuestion: null,
      category: null,
      budget: null,
      city: 'Алматы',
      requirements: [],
      lastProducts: []
    };
    setDialogContext(emptyContext);
    try {
      sessionStorage.removeItem('laute_ai_messages');
      sessionStorage.removeItem('laute_ai_context');
    } catch {
      // ignore
    }
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
                {lang === 'kz' ? 'LAUTE Ядросы • Автономды' : lang === 'en' ? 'LAUTE Neural Core • Independent' : 'Ядро LAUTE • Автономно'}
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
            title="Начать новый диалог"
            aria-label="Начать новый диалог"
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

                      {/* City stock info */}
                      <div className="ai-prod-stock-info">
                        <MapPin size={11} color="#EA580C" />
                        <span>
                          {prod.cityStock?.['Алматы'] > 0 
                            ? `Алматы: ${prod.cityStock['Алматы']} шт. в наличии` 
                            : 'Алматы: склад LAUTE'}
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
                          <span>Подробнее</span>
                        </button>

                        <button
                          type="button"
                          className="btn-ai-action-outline"
                          onClick={() => {
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
                ? 'Сұрағыңызды жазыңыз…'
                : lang === 'en'
                ? 'Ask a question…'
                : 'Напишите сообщение (например: «Что такое картридж?»)...'
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
