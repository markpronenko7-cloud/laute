import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Eye, Minus, RotateCcw, Scale, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { withBrandWord } from '../utils/brandFormatter';
import { createConsultantCatalog } from '../utils/consultantCatalog.js';
import { getConsultantHelp } from '../utils/consultantHelp.js';

const labels = {
  ru: {
    title: 'Консультант LAUTE', open: 'Открыть консультант LAUTE', close: 'Свернуть', reset: 'Начать новый диалог',
    welcome: 'Здравствуйте! Подберу модели из каталога, сравню их и помогу разобраться с монтажом, ценой или гарантией.',
    prompts: ['Подбери смеситель для кухни под фильтр', 'Что такое картридж?', 'Что закупить для пробной партии?'],
    input: 'Напишите вопрос', send: 'Отправить', detail: 'Подробнее', compare: 'Сравнить',
    fallback: 'У меня нет подтверждённых данных, чтобы точно ответить на этот вопрос. Если он о конкретной модели, пришлите артикул.',
    error: 'Не удалось обработать вопрос. Попробуйте отправить его ещё раз.',
    partner: 'Помогите подобрать ассортимент для закупки LAUTE'
  },
  en: {
    title: 'LAUTE consultant', open: 'Open LAUTE consultant', close: 'Minimize', reset: 'Start a new chat',
    welcome: 'Hello! I can find and compare products and help with installation, pricing or warranty questions.',
    prompts: ['Find a kitchen faucet with a filter connection', 'What is a cartridge?', 'What should I buy for a trial order?'],
    input: 'Ask a question', send: 'Send', detail: 'Details', compare: 'Compare',
    fallback: 'I don’t have verified information to answer that precisely. For questions about a specific model, send its SKU.',
    error: 'Couldn’t process the question. Please try sending it again.',
    partner: 'Help me choose a LAUTE wholesale assortment'
  },
  kz: {
    title: 'LAUTE кеңесшісі', open: 'LAUTE кеңесшісін ашу', close: 'Жию', reset: 'Жаңа сұхбат бастау',
    welcome: 'Сәлеметсіз бе! Каталогтан үлгілерді таңдап, салыстырамын және монтаж, баға мен кепілдік сұрақтарына көмектесемін.',
    prompts: ['Сүзгісі бар асүй араластырғышын көрсетіңіз', 'Картридж деген не?', 'Сынақ үшін қандай ассортимент алайын?'],
    input: 'Сұрақ жазыңыз', send: 'Жіберу', detail: 'Толығырақ', compare: 'Салыстыру',
    fallback: 'Нақты жауап беруге расталған дерек жеткіліксіз. Сұрағыңыз белгілі бір үлгіге қатысты болса, артикулын жазыңыз.',
    error: 'Сұрақты өңдеу мүмкін болмады. Қайта жіберіп көріңіз.',
    partner: 'LAUTE көтерме ассортиментін таңдауға көмектесіңіз'
  }
};

const baseUrl = import.meta.env.BASE_URL;
const logo = baseUrl + 'official-laute-logo.png';

function ConsultantPanel({ app }) {
  const {
    isAIConsultantOpen, openAIConsultant, closeAIConsultant, products, region, lang, regionWarehouseMap,
    activeWarehouseId, getStockForSku, partnerAccount, partnerPrices, isB2BAuthorized, adminSession,
    openProductModal, startComparison,
  } = app;
  const ui = labels[lang] || labels.ru;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const context = useRef({});
  const nextId = useRef(1);
  const panelRef = useRef(null);
  const bodyRef = useRef(null);
  const triggerRef = useRef(null);
  const restoreFocus = useRef(false);

  const catalog = useMemo(() => createConsultantCatalog({
    products, region, lang, regionWarehouseMap, activeWarehouseId, getStockForSku,
    canSeeStock: isB2BAuthorized || !!adminSession,
    partnerPrices: isB2BAuthorized && partnerAccount.role === 'partner' ? partnerPrices : null
  }), [products, region, lang, regionWarehouseMap, activeWarehouseId, getStockForSku,
    isB2BAuthorized, adminSession, partnerAccount, partnerPrices]);

  const send = useCallback(message => {
    const text = message.trim();
    if (!text) return;
    const userId = nextId.current++;
    setInput('');
    let answer;
    try {
      answer = catalog.respond(text, context.current) || getConsultantHelp(text, { region, lang, baseUrl });
      if (answer?.newContext) context.current = answer.newContext;
    } catch (error) {
      console.error('LAUTE consultant:', error);
      answer = { text: ui.error };
    }
    setMessages(previous => [...previous,
      { id: userId, sender: 'user', text },
      { id: userId + '-answer', sender: 'ai', ...answer, text: answer?.text || ui.fallback }
    ]);
  }, [catalog, region, lang, ui]);

  useEffect(() => {
    const ask = () => send(ui.partner);
    window.addEventListener('laute:ai:partner-analysis', ask);
    return () => window.removeEventListener('laute:ai:partner-analysis', ask);
  }, [send, ui.partner]);

  useEffect(() => {
    if (isAIConsultantOpen) panelRef.current?.focus({ preventScroll: true });
    else if (restoreFocus.current) {
      triggerRef.current?.focus({ preventScroll: true });
      restoreFocus.current = false;
    }
  }, [isAIConsultantOpen]);

  useEffect(() => {
    const body = bodyRef.current;
    const reply = body?.lastElementChild;
    if (reply) body.scrollTop += reply.getBoundingClientRect().top - body.getBoundingClientRect().top - 14;
  }, [messages, isAIConsultantOpen]);

  const close = () => {
    restoreFocus.current = true;
    closeAIConsultant();
  };

  if (!isAIConsultantOpen) return (
    <button ref={triggerRef} type="button" className="ai-consultant-floating-trigger"
      onClick={openAIConsultant} aria-label={ui.open} title={ui.open} aria-haspopup="dialog">
      <img src={logo} alt="" width="50" height="16" />
    </button>
  );

  return (
    <aside ref={panelRef} tabIndex={-1} className="ai-consultant-floating-panel" role="dialog"
      aria-labelledby="laute-consultant-title" onKeyDown={event => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          close();
        }
      }}>
      <header className="ai-panel-header">
        <h2 id="laute-consultant-title" className="ai-panel-title">{withBrandWord(ui.title)}</h2>
        <div className="ai-header-controls">
          <button type="button" className="btn-ai-header-icon" onClick={() => {
            context.current = {};
            setInput('');
            setMessages([]);
          }} title={ui.reset} aria-label={ui.reset}>
            <RotateCcw size={16} />
          </button>
          <button type="button" className="btn-ai-minimize" onClick={close} title={ui.close} aria-label={ui.close}>
            <Minus size={20} />
          </button>
        </div>
      </header>

      <div className="ai-panel-body" ref={bodyRef} role="log" aria-live="polite" aria-relevant="additions">
        {!messages.length && <div className="ai-message-row msg-ai">
          <div className="ai-message-bubble">
            <div className="ai-message-text">{withBrandWord(ui.welcome)}</div>
            <div className="ai-quick-chips-row">
              {ui.prompts.map(prompt => <button key={prompt} type="button" className="ai-quick-chip"
                onClick={() => send(prompt)}>{prompt}</button>)}
            </div>
          </div>
        </div>}
        {messages.map(message => (
          <div key={message.id} className={'ai-message-row msg-' + message.sender}>
            <div className="ai-message-bubble">
              <div className="ai-message-text">{withBrandWord(message.text)}</div>
              {message.sources?.map(source => <a className="ai-market-source" key={source.url} href={source.url}
                target="_blank" rel="noopener noreferrer">{source.title}<ArrowUpRight size={13} aria-hidden="true" /></a>)}
              {message.recommendedProducts?.length > 0 && <div className="ai-recommended-products-grid">
                {message.recommendedProducts.map(product => (
                  <div key={product.article} className="ai-product-card">
                    <span className="ai-prod-art">{product.article}</span>
                    <div className="ai-prod-actions">
                      <button type="button" className="btn-ai-action-outline" onClick={() => openProductModal(product)}>
                        <Eye size={14} aria-hidden="true" />{ui.detail}
                      </button>
                    </div>
                  </div>
                ))}
                {message.recommendedProducts.length === 2 && <button type="button" className="btn-ai-action-primary"
                  onClick={() => startComparison(...message.recommendedProducts)}>
                  <Scale size={14} aria-hidden="true" />{ui.compare}
                </button>}
              </div>}
            </div>
          </div>
        ))}
      </div>

      <footer className="ai-panel-footer">
        <form className="ai-input-form" onSubmit={event => { event.preventDefault(); send(input); }}>
          <input type="text" className="ai-text-input" value={input} onChange={event => setInput(event.target.value)}
            placeholder={ui.input} aria-label={ui.input} />
          <button type="submit" className="ai-send-btn" disabled={!input.trim()} title={ui.send} aria-label={ui.send}>
            <Send size={17} />
          </button>
        </form>
      </footer>
    </aside>
  );
}

export const AIConsultant = () => {
  const app = useApp();
  const scope = app.isB2BAuthorized ? app.partnerAccount.id + ':' + app.partnerAccount.role
    : app.adminSession ? 'admin' : 'public';
  return <ConsultantPanel key={scope} app={app} />;
};

export default AIConsultant;
