import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Send, Minimize2, ArrowRight, ShieldCheck, CornerDownLeft } from 'lucide-react';
import { withBrandWord } from '../utils/brandFormatter';

export const AIConsultant = () => {
  const { isAIConsultantOpen, closeAIConsultant, navigateTo, openPartnerModal, lang } = useApp();

  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      sender: 'ai',
      text: lang === 'kz'
        ? 'Сәлеметсіз бе! Мен LAUTE ресми цифрлық AI-кеңесшісімін. Жобаңызға арналған асүй және ванна бөлмесі араластырғыштарын, душ жүйелерін немесе инженерлік шешімдерді таңдауға көмектесемін.'
        : lang === 'en'
          ? 'Hello! I am the official LAUTE AI Consultant. I will help you select kitchen and bath mixers, shower systems, or engineering fixtures for your project.'
          : 'Здравствуйте! Я официальный AI-консультант LAUTE. Помогу подобрать смесители для кухни, ванной, душевые комплекты или инженерное оборудование под ваш проект.',
      recommendation: null
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAIConsultantOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [isAIConsultantOpen, messages]);

  const quickPrompts = [
    {
      ru: 'Смеситель для кухни с фильтром',
      kz: 'Ауыз су сүзгісі бар асүй араластырғышы',
      en: 'Kitchen mixer with drinking filter'
    },
    {
      ru: 'Душевая стойка с тропическим душем',
      kz: 'Тропикалық душы бар душ бағаны',
      en: 'Shower column with rain head'
    },
    {
      ru: 'Смеситель для раковины',
      kz: 'Қолжуғышқа арналған араластырғыш',
      en: 'Basin mixer tap'
    },
    {
      ru: 'Встраиваемая сантехника',
      kz: 'Кіріктірілетін сантехника',
      en: 'Concealed / built-in fixtures'
    }
  ];

  const generateAnswer = (userQuery) => {
    const q = userQuery.toLowerCase();

    // 1. Kitchen
    if (q.includes('кухн') || q.includes('мойк') || q.includes('фильтр') || q.includes('асүй') || q.includes('kitchen') || q.includes('sink')) {
      return {
        text: lang === 'kz'
          ? 'Асүй үшін біз биік бұрылмалы шүмегі бар, ауыз су сүзгісін қосуға арналған қос арналы LAUTE модельдерін ұсынамыз. Корпусы — CW617N латунь, керамикалық картридж 35 мм.'
          : lang === 'en'
            ? 'For the kitchen, we recommend LAUTE models with a high 360° swivel spout and dual-channel connection for filtered drinking water. Body: CW617N brass, 35mm ceramic cartridge.'
            : 'Для кухни рекомендуются смесители LAUTE с высоким поворотным изливом и дополнительным каналом под питьевой фильтр. Корпус из первичной латуни марки CW617N, картридж 35 мм с керамическими дисками и аэратор Neoperl.',
        recommendation: {
          title: lang === 'kz' ? 'LAUTE асүй топтамасы' : lang === 'en' ? 'LAUTE Kitchen Collection' : 'Кухонные смесители LAUTE',
          route: 'catalog',
          actionText: lang === 'kz' ? 'Каталогты қарау' : lang === 'en' ? 'Explore in Catalog' : 'Смотреть в каталоге'
        }
      };
    }

    // 2. Shower
    if (q.includes('душ') || q.includes('лейк') || q.includes('стойк') || q.includes('shower') || q.includes('гарнитур')) {
      return {
        text: lang === 'kz'
          ? 'Душ аймағы үшін биіктігі реттелетін (850–1250 мм) бағанасы бар LAUTE душ жүйелері оңтайлы. Үстіңгі тропикалық душ форсункалары қақтан оңай тазаланатын силиконнан жасалған.'
          : lang === 'en'
            ? 'For the shower area, LAUTE shower systems featuring an adjustable column (850-1250 mm) and overhead rain shower with Easy-Clean silicone nozzles are optimal.'
            : 'Для душевой зоны оптимальны душевые системы LAUTE с телескопической регулировкой штанги (850–1250 мм) и верхним тропическим душем с силиконовыми форсунками Easy Clean против известкового налета.',
        recommendation: {
          title: lang === 'kz' ? 'LAUTE душ жүйелері' : lang === 'en' ? 'LAUTE Shower Systems' : 'Душевые системы LAUTE',
          route: 'catalog',
          actionText: lang === 'kz' ? 'Каталогты қарау' : lang === 'en' ? 'Explore in Catalog' : 'Смотреть в каталоге'
        }
      };
    }

    // 3. Bath / Basin
    if (q.includes('ванн') || q.includes('раковин') || q.includes('умывальн') || q.includes('bath') || q.includes('basin')) {
      return {
        text: lang === 'kz'
          ? 'Ванна мен раковинаға арналған LAUTE желісі монолитті корпустар мен ресурс үнемдейтін аэраторларды қамтиды. Ықшам кеңістіктер үшін 300–400 мм ұзын шүмегі бар әмбебап шешімдер қарастырылған.'
          : lang === 'en'
            ? 'The LAUTE bathroom lineup features monolithic solid brass mixer bodies with water-saving aerators, and universal 300-400 mm swivel spout configurations for compact spaces.'
            : 'Линейка LAUTE для раковины и ванны включает монолитные латунные смесители с аэраторами Neoperl, а также универсальные модели с поворотным изливом 300–400 мм для совмещенных узлов.',
        recommendation: {
          title: lang === 'kz' ? 'Ванна мен раковина шешімдері' : lang === 'en' ? 'Bath & Basin Solutions' : 'Смесители для ванны и раковины LAUTE',
          route: 'catalog',
          actionText: lang === 'kz' ? 'Каталогты қарау' : lang === 'en' ? 'Explore in Catalog' : 'Смотреть в каталоге'
        }
      };
    }

    // 4. Built-in / Concealed
    if (q.includes('встраиваем') || q.includes('скрыт') || q.includes('бокс') || q.includes('concealed') || q.includes('кіріктірілетін')) {
      return {
        text: lang === 'kz'
          ? 'LAUTE жасырын монтаждау жүйелері сенімді латунь монтаж блоктарымен және минималистік сыртқы басқару панельдерімен жасақталған. Зауыттық герметикалық сынақтан 100% өткен.'
          : lang === 'en'
            ? 'LAUTE concealed installation systems feature solid brass core units and architectural slim trim plates, 100% factory pressure-tested to 16 bar.'
            : 'Встраиваемые решения LAUTE комплектуются цельнолатунными скрытыми боксами и ультратонкими накладками. Все модули проходят 100% заводское гидротестирование давлением 16 бар.',
        recommendation: {
          title: lang === 'kz' ? 'LAUTE инженерлік бағыты' : lang === 'en' ? 'LAUTE Concealed Engineering' : 'Инженерные и скрытые системы LAUTE',
          route: 'catalog',
          actionText: lang === 'kz' ? 'Каталогты қарау' : lang === 'en' ? 'Explore in Catalog' : 'Смотреть в каталоге'
        }
      };
    }

    // 5. Wholesale / Partnership / Projects
    if (q.includes('опт') || q.includes('партнер') || q.includes('проект') || q.includes('объект') || q.includes('баға') || q.includes('цена') || q.includes('заказ') || q.includes('wholesale')) {
      return {
        text: lang === 'kz'
          ? 'LAUTE зауыты дистрибьюторлар мен құрылыс компанияларына тікелей өндіруші келісімшартын, техникалық төлқұжаттарды және дербес баға саясатын ұсынады.'
          : lang === 'en'
            ? 'LAUTE manufacturer offers direct supply contracts, full project specifications, and individual wholesale terms for distributors and developers.'
            : 'Для оптовых заказчиков и девелоперов LAUTE предоставляет прямой контракт с производителем, спецификации объектов, паспорта качества и персональные оптовые условия.',
        recommendation: {
          title: lang === 'kz' ? 'LAUTE серіктестік бағдарламасы' : lang === 'en' ? 'LAUTE Partnership Program' : 'Партнёрская программа LAUTE',
          route: 'partners',
          actionText: lang === 'kz' ? 'Серіктес болу' : lang === 'en' ? 'Become a Partner' : 'Стать партнёром'
        }
      };
    }

    // General fallback strictly based on LAUTE catalog
    return {
      text: lang === 'kz'
        ? 'Сұранысыңыз қабылданды. LAUTE каталогында асүй, ванна, душ аймақтарына арналған және инженерлік шешімдер ұсынылған. Қай бағыт сіздің міндетіңізге сәйкес келеді?'
        : lang === 'en'
          ? 'Your inquiry is received. The LAUTE catalog covers kitchen mixers, bath & basin taps, shower systems, and concealed engineering fixtures. Which application matches your project?'
          : 'Запрос принят. В каталоге LAUTE представлены смесители для кухни, раковин и ванн, душевые системы и скрытые инженерные узлы из первичной латуни CW617N. Уточните зону применения для точной спецификации.',
      recommendation: {
        title: lang === 'kz' ? 'LAUTE толық каталогы' : lang === 'en' ? 'LAUTE Full Catalog' : 'Каталог продукции LAUTE',
        route: 'catalog',
        actionText: lang === 'kz' ? 'Каталогқа өту' : lang === 'en' ? 'Open Catalog' : 'Перейти в каталог'
      }
    };
  };

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAnswer(text);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        recommendation: response.recommendation
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isAIConsultantOpen) return null;

  return (
    <aside
      className="ai-consultant-floating-panel"
      aria-label="AI-консультант LAUTE"
      role="dialog"
    >
      {/* Top Header Bar with Minimize Action */}
      <div className="ai-panel-header">
        <div className="ai-panel-identity">
          <div className="ai-panel-avatar">
            <Sparkles size={16} className="ai-sparkle-icon" />
          </div>
          <div>
            <div className="ai-panel-title">
              <span>AI-КОНСУЛЬТАНТ </span>
              <span className="brand-word">LAUTE</span>
            </div>
            <div className="ai-panel-status">
              <span className="ai-status-dot"></span>
              <span>
                {lang === 'kz' ? 'Онлайн · Ресми каталог' : lang === 'en' ? 'Online · Official Catalog' : 'Онлайн · Официальный каталог'}
              </span>
            </div>
          </div>
        </div>

        {/* Action: Minimize / Collapse */}
        <button
          type="button"
          className="btn-ai-minimize"
          onClick={closeAIConsultant}
          title={lang === 'kz' ? 'Жию' : lang === 'en' ? 'Minimize' : 'Свернуть'}
          aria-label="Свернуть AI-консультант"
        >
          <Minimize2 size={15} />
          <span className="minimize-label">{lang === 'kz' ? 'Жию' : lang === 'en' ? 'Minimize' : 'Свернуть'}</span>
        </button>
      </div>

      {/* Conversation Stream */}
      <div className="ai-panel-body">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`ai-message-row ${msg.sender === 'user' ? 'msg-user' : 'msg-ai'}`}
          >
            <div className="ai-message-bubble">
              <p className="ai-message-text">{withBrandWord(msg.text)}</p>

              {msg.recommendation && (
                <div className="ai-recommendation-card">
                  <div className="ai-rec-header">
                    <span className="ai-rec-badge">
                      {lang === 'kz' ? 'Ұсынылатын шешім' : lang === 'en' ? 'Recommended Selection' : 'Рекомендуемое решение'}
                    </span>
                    <h4 className="ai-rec-title">{withBrandWord(msg.recommendation.title)}</h4>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm ai-rec-btn"
                    onClick={() => {
                      closeAIConsultant();
                      if (msg.recommendation.route === 'partners') {
                        openPartnerModal();
                      } else {
                        navigateTo(msg.recommendation.route);
                      }
                    }}
                  >
                    <span>{msg.recommendation.actionText}</span>
                    <ArrowRight size={13} />
                  </button>
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

        {/* Quick Helper Chips */}
        {messages.length <= 2 && (
          <div className="ai-quick-prompts-wrap">
            <span className="ai-prompts-label">
              {lang === 'kz' ? 'Жылдам сұраныстар:' : lang === 'en' ? 'Suggested queries:' : 'Быстрый подбор:'}
            </span>
            <div className="ai-chips-list">
              {quickPrompts.map((prompt, idx) => {
                const label = prompt[lang] || prompt.ru;
                return (
                  <button
                    key={idx}
                    type="button"
                    className="ai-prompt-chip"
                    onClick={() => handleSendMessage(label)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Interactive Free-Text Input Bar */}
      <div className="ai-panel-footer">
        <form
          className="ai-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="ai-text-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              lang === 'kz'
                ? 'Нені іздеп жатырсыз, сипаттаңыз…'
                : lang === 'en'
                  ? 'Describe what you are looking for…'
                  : 'Опишите, что вы ищете…'
            }
            aria-label="Запрос к AI-консультанту"
          />
          <button
            type="submit"
            className="ai-send-btn"
            disabled={!inputValue.trim()}
            title="Отправить запрос"
            aria-label="Отправить"
          >
            <Send size={15} />
          </button>
        </form>

        <div className="ai-panel-disclaimer">
          <ShieldCheck size={12} className="ai-shield-icon" />
          <span>
            {lang === 'kz'
              ? 'Ресми зауыттық техникалық деректер'
              : lang === 'en'
                ? 'Official factory engineering specifications'
                : 'Официальные заводские спецификации LAUTE · Без вымышленных данных'}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default AIConsultant;
