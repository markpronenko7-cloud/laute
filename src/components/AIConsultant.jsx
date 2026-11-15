import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Eye, MessageCircle, Minus, RotateCcw, Scale, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { withBrandWord } from '../utils/brandFormatter';
import { createConsultantCatalog } from '../utils/consultantCatalog.js';
import { getConsultantHelp } from '../utils/consultantHelp.js';
import { requestConsultantAnswer } from '../services/consultantApi.js';
import { formatCatalogPrice, getRegionalCurrency, getRegionalProductPrice } from '../utils/catalogPrice.js';
import { DEFAULT_PRODUCTS } from '../data/catalogData.js';
import { getRegionName } from '../data/regionsData.js';

const labels = {
  ru: {
    title: 'Консультант LAUTE', open: 'Открыть консультант LAUTE', close: 'Свернуть', reset: 'Начать новый диалог',
    welcome: 'Здравствуйте! Подберу модели из каталога, сравню их и помогу разобраться с монтажом, ценой или гарантией.',
    prompts: ['Подбери смеситель для кухни под фильтр', 'Что такое картридж?', 'Что закупить для пробной партии?'],
    input: 'Напишите вопрос', send: 'Отправить', detail: 'Подробнее', compare: 'Сравнить',
    fallback: 'Расширенная консультация сейчас недоступна. Если вопрос касается заказа, наши менеджеры могут уточнить его условия.',
    error: 'Не удалось обработать вопрос. Попробуйте отправить его ещё раз.',
    partner: 'Помогите подобрать ассортимент для закупки LAUTE', working: 'Готовлю ответ…',
    accountPrice: 'Цена по аккаунту', onRequest: 'Цена по запросу', stock: 'Остаток'
  },
  en: {
    title: 'LAUTE consultant', open: 'Open LAUTE consultant', close: 'Minimize', reset: 'Start a new chat',
    welcome: 'Hello! I can find and compare products and help with installation, pricing or warranty questions.',
    prompts: ['Find a kitchen faucet with a filter connection', 'What is a cartridge?', 'What should I buy for a trial order?'],
    input: 'Ask a question', send: 'Send', detail: 'Details', compare: 'Compare',
    fallback: 'Extended consultation is currently unavailable. For order terms, contact our sales team.',
    error: 'Couldn’t process the question. Please try sending it again.',
    partner: 'Help me choose a LAUTE wholesale assortment', working: 'Preparing an answer…',
    accountPrice: 'Account price', onRequest: 'Price on request', stock: 'Stock'
  },
  kz: {
    title: 'LAUTE кеңесшісі', open: 'LAUTE кеңесшісін ашу', close: 'Жию', reset: 'Жаңа сұхбат бастау',
    welcome: 'Сәлеметсіз бе! Каталогтан үлгілерді таңдап, салыстырамын және монтаж, баға мен кепілдік сұрақтарына көмектесемін.',
    prompts: ['Сүзгісі бар асүй араластырғышын көрсетіңіз', 'Картридж деген не?', 'Сынақ үшін қандай ассортимент алайын?'],
    input: 'Сұрақ жазыңыз', send: 'Жіберу', detail: 'Толығырақ', compare: 'Салыстыру',
    fallback: 'Кеңейтілген кеңес қазір қолжетімсіз. Тапсырыс талаптарын сату бөлімінен нақтылауға болады.',
    error: 'Сұрақты өңдеу мүмкін болмады. Қайта жіберіп көріңіз.',
    partner: 'LAUTE көтерме ассортиментін таңдауға көмектесіңіз', working: 'Жауап дайындалуда…',
    accountPrice: 'Аккаунттағы баға', onRequest: 'Бағасы сұрау бойынша', stock: 'Қалдық'
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
  const [pending, setPending] = useState(false);
  const context = useRef({});
  const remoteHistory = useRef([]);
  const requestRef = useRef(null);
  const nextId = useRef(1);
  const panelRef = useRef(null);
  const bodyRef = useRef(null);
  const triggerRef = useRef(null);
  const restoreFocus = useRef(false);
  const canSeeStock = isB2BAuthorized || !!adminSession;
  const accountPricing = isB2BAuthorized && partnerAccount.role === 'partner';

  const catalog = useMemo(() => createConsultantCatalog({
    products: products === DEFAULT_PRODUCTS ? [] : products,
    region, lang, regionWarehouseMap, activeWarehouseId, getStockForSku,
    canSeeStock, partnerPrices: accountPricing ? partnerPrices : null
  }), [products, region, lang, regionWarehouseMap, activeWarehouseId, getStockForSku,
    canSeeStock, accountPricing, partnerPrices]);

  const byArticle = useMemo(() => new Map((products === DEFAULT_PRODUCTS ? [] : products)
    .filter(product => product.status !== 'СКРЫТ').map(product => [product.article, product])), [products]);

  const send = useCallback(async message => {
    const text = message.trim();
    if (!text || requestRef.current) return;
    const userId = nextId.current++;
    const controller = new AbortController();
    requestRef.current = controller;
    const userMessage = { role: 'user', content: text };
    remoteHistory.current = [...remoteHistory.current.slice(-8), userMessage];
    setInput('');
    setMessages(items => [...items, { id: userId, sender: 'user', text }]);
    setPending(true);
    let answer;
    try {
      answer = await requestConsultantAnswer({ messages: remoteHistory.current, region, lang, signal: controller.signal });
    } catch {
      // The public catalog can still answer bounded questions while the model is unavailable.
    }
    if (controller.signal.aborted) return;
    try {
      if (answer?.provider === 'openai') {
        remoteHistory.current.push({ role: 'assistant', content: answer.text.slice(0, 2500) });
        if (answer.articles.length) context.current = { selection: { articles: answer.articles, region: answer.region } };
      } else {
        answer = catalog.respond(text, context.current) || getConsultantHelp(text, { region, lang, baseUrl });
        if (answer?.newContext) context.current = answer.newContext;
      }
    } catch {
      answer = { text: ui.error };
    } finally {
      requestRef.current = null;
      setPending(false);
    }
    setMessages(previous => [...previous,
      { id: userId + '-answer', sender: 'ai', ...answer, text: answer?.text || ui.fallback,
        provider: answer?.provider || (answer?.text && answer.text !== ui.error ? 'catalog' : 'unavailable') }
    ]);
  }, [catalog, region, lang, ui]);

  useEffect(() => () => requestRef.current?.abort(), []);

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

  const reset = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    context.current = {};
    remoteHistory.current = [];
    setPending(false);
    setInput('');
    setMessages([]);
  };

  if (!isAIConsultantOpen) return (
    <button ref={triggerRef} type="button" className="ai-consultant-floating-trigger"
      onClick={openAIConsultant} aria-label={ui.open} title={ui.open} aria-haspopup="dialog">
      <MessageCircle size={24} aria-hidden="true" />
      <img src={logo} alt="" width="59" height="19" />
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
          <button type="button" className="btn-ai-header-icon" onClick={reset} title={ui.reset} aria-label={ui.reset}>
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
        {messages.map(message => {
          const cards = message.provider === 'openai'
            ? message.articles.map(article => byArticle.get(article)).filter(Boolean)
            : message.recommendedProducts || [];
          const targetRegion = message.region || region;
          return <div key={message.id} className={'ai-message-row msg-' + message.sender} data-response-source={message.provider}>
            <div className="ai-message-bubble">
              <div className="ai-message-text">{withBrandWord(message.text)}</div>
              {message.sources?.map(source => <a className="ai-market-source" key={source.url} href={source.url}
                target="_blank" rel="noopener noreferrer">{source.title}<ArrowUpRight size={13} aria-hidden="true" /></a>)}
              {cards.length > 0 && <div className="ai-recommended-products-grid">
                {cards.map(product => {
                  const price = accountPricing ? partnerPrices[product.article] : {
                    price: getRegionalProductPrice(product, targetRegion), currency: getRegionalCurrency(targetRegion)
                  };
                  const stock = canSeeStock && message.provider === 'openai' ? getStockForSku(product.article,
                    (targetRegion === region ? activeWarehouseId : regionWarehouseMap[targetRegion]) ?? null) : null;
                  const priceLabel = accountPricing ? ui.accountPrice : getRegionName(targetRegion, lang);
                  return <div key={product.article} className="ai-product-card">
                    <div>
                      <span className="ai-prod-art">{product.article}</span>
                      {message.provider === 'openai' && <div className="ai-product-facts">
                        {price?.price > 0 && price.currency ? priceLabel + ' · ' + formatCatalogPrice(price.price, price.currency) : ui.onRequest}
                        {stock?.quantity != null && <><br />{ui.stock} · {stock.warehouseName} · {stock.quantity}</>}
                      </div>}
                    </div>
                    <div className="ai-prod-actions">
                      <button type="button" className="btn-ai-action-outline" onClick={() => openProductModal(product)}>
                        <Eye size={14} aria-hidden="true" />{ui.detail}
                      </button>
                    </div>
                  </div>;
                })}
                {cards.length === 2 && <button type="button" className="btn-ai-action-primary"
                  onClick={() => startComparison(...cards)}>
                  <Scale size={14} aria-hidden="true" />{ui.compare}
                </button>}
              </div>}
            </div>
          </div>;
        })}
        {pending && <div className="ai-consultant-pending" role="status">{ui.working}</div>}
      </div>

      <footer className="ai-panel-footer">
        <form className="ai-input-form" onSubmit={event => { event.preventDefault(); send(input); }}>
          <input type="text" className="ai-text-input" value={input} onChange={event => setInput(event.target.value)} maxLength={1600}
            placeholder={ui.input} aria-label={ui.input} />
          <button type="submit" className="ai-send-btn" disabled={pending || !input.trim()} title={ui.send} aria-label={ui.send}>
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
