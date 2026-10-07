import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Send, Minus, ArrowUpRight, ArrowRight } from 'lucide-react';
import { withBrandWord } from '../utils/brandFormatter';

export const AIConsultant = () => {
  const { isAIConsultantOpen, openAIConsultant, closeAIConsultant, navigateTo, openPartnerModal, lang } = useApp();

  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      sender: 'ai',
      text: lang === 'kz'
        ? 'Сәлеметсіз бе! Мен LAUTE цифрлық кеңесшісімін. Асүй, ванна араластырғыштарын және душ жүйелерін таңдауға көмектесемін. Қандай өнім іздеп жатырсыз?'
        : lang === 'en'
        ? 'Hello! I am the official LAUTE AI consultant. I will help you select kitchen or bath mixers and shower systems. What are you looking for?'
        : 'Здравствуйте! Я официальный AI-консультант LAUTE. Помогу подобрать смесители, душевые решения и сантехническое оборудование. Что именно вы ищете?',
      recommendation: null
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dialogContext, setDialogContext] = useState({ topic: null });

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to latest message when open
  useEffect(() => {
    if (isAIConsultantOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isAIConsultantOpen, messages, isTyping]);

  // Context-aware natural dialogue responder
  const generateDialogueResponse = (rawQuery, currentTopic) => {
    const q = rawQuery.trim().toLowerCase();

    // 1. Greetings
    if (/^(привет|здравствуй|добрый день|доброе утро|добрый вечер|салем|сәлем|hi|hello|hey)[\s!.,?]*$/i.test(q) || q === 'привет') {
      return {
        text: lang === 'kz'
          ? 'Сәлеметсіз бе! Мен LAUTE кеңесшісімін. Жобаңызға арналған араластырғыштар мен душ жүйелерін таңдауға көмектесемін. Қай өнім қызықтырады?'
          : lang === 'en'
          ? 'Hello! I am the LAUTE AI Consultant. I can assist you with kitchen faucets, bath mixers, and shower sets. What are you looking for today?'
          : 'Здравствуйте! Я AI-консультант LAUTE. Помогу подобрать смесители для кухни, ванной, душевые комплекты или сантехнику под ваш проект. Что именно вас интересует?',
        newTopic: currentTopic,
        recommendation: null
      };
    }

    // 2. Gratitude
    if (q.includes('спасибо') || q.includes('благодарю') || q.includes('рахмет') || q.includes('thanks') || q.includes('thank')) {
      return {
        text: lang === 'kz'
          ? 'Оқасы жоқ! Көмектесуге әрқашан дайынмын. LAUTE өнімдері бойынша сұрақтар болса — хабарласыңыз!'
          : lang === 'en'
          ? 'You are welcome! If you need any technical details or model selection, feel free to ask anytime.'
          : 'Пожалуйста! Рад помочь. Если понадобятся характеристики, способы монтажа или оптовые условия LAUTE — обращайтесь в любое время.',
        newTopic: currentTopic,
        recommendation: null
      };
    }

    // 3. Broad catalog / assortment inquiry: "Что вы продаёте?"
    if (q.includes('что вы продаете') || q.includes('что продаете') || q.includes('что есть') || q.includes('ассортимент') || q.includes('продукция') || q.includes('каталог') || q.includes('не сатасыздар') || q.includes('что продаёте')) {
      return {
        text: lang === 'kz'
          ? 'LAUTE зауыты еуропалық стандарттағы сантехникалық жабдықтарды өндіреді:\n• Асүй араластырғыштары (сүзгіге арналған қосымша арнамен)\n• Ванна мен раковина араластырғыштары (CW617N латунь)\n• Душ жүйелері мен гарнитурлары\n• Кіріктірілетін инженерлік тораптар\nҚай бағытты қарастырамыз?'
          : lang === 'en'
          ? 'LAUTE manufactures architectural European-standard sanitaryware:\n• Kitchen mixers (with filtered drinking water channel)\n• Bath & basin mixers (CW617N solid brass)\n• Shower columns & rain shower sets\n• Concealed engineering modules\nWhich category would you like to explore?'
          : 'LAUTE производит надежную сантехнику европейского стандарта:\n• Кухонные смесители (с поворотным изливом и каналом под фильтр)\n• Смесители для раковины и ванны из латуни CW617N\n• Душевые системы с тропическим душем\n• Скрытые инженерные боксы\nКакая категория вас интересует?',
        newTopic: 'assortment',
        recommendation: {
          title: 'Каталог продукции LAUTE',
          route: 'catalog',
          actionText: 'Открыть каталог'
        }
      };
    }

    // 4. Agreement / Affirmation: "Да", "Ок", "Хорошо", "Давай"
    if (/^(да|ок|хорошо|давай|конечно|именно|жақсы|иә|yes|ok)[\s!.,?]*$/i.test(q)) {
      if (currentTopic === 'mixer') {
        return {
          text: lang === 'kz'
            ? 'Тамаша! Орнату аймағын нақтылаңыз: асүй үшін бе, қолжуғыш немесе ванна үшін бе?'
            : lang === 'en'
            ? 'Great! Please specify the area: for kitchen, basin, or bathtub?'
            : 'Отлично! Уточните зону установки: для кухни, раковины или ванной комнаты?',
          newTopic: 'mixer',
          recommendation: null
        };
      }
      return {
        text: lang === 'kz'
          ? 'Тамаша! Қандай өнімді немесе қандай параметрлерді қарастырғыңыз келеді?'
          : lang === 'en'
          ? 'Great! Let me know what product or parameters you have in mind.'
          : 'Отлично! Опишите ваши пожелания по функционалу или монтажу, и я предложу подходящую серию LAUTE.',
        newTopic: currentTopic,
        recommendation: null
      };
    }

    // 5. Kitchen Mixer queries or context continuation
    if (q.includes('кухн') || q.includes('мойк') || q.includes('фильтр') || (currentTopic === 'mixer' && q.includes('кух')) || q.includes('асүй') || q.includes('kitchen')) {
      return {
        text: lang === 'kz'
          ? 'Асүй үшін біз биік 360° бұрылмалы шүмегі және ауыз су сүзгісіне арналған арнасы бар LAUTE үлгілерін ұсынамыз. Корпусы — CW617N латунь, 35 мм керамикалық картридж.'
          : lang === 'en'
          ? 'For the kitchen, we recommend LAUTE models with a high 360° swivel spout and drinking water filter channel. Solid CW617N brass body with 35mm ceramic disc cartridge.'
          : 'Для кухни рекомендуем смесители LAUTE с высоким поворотным изливом 360° и каналом под питьевой фильтр. Корпус — первичная латунь CW617N, картридж 35 мм с керамическими пластинами и аэратор Neoperl.',
        newTopic: 'kitchen',
        recommendation: {
          title: 'Кухонные смесители LAUTE',
          route: 'catalog',
          actionText: 'Смотреть кухонные смесители'
        }
      };
    }

    // 6. Bath / Basin Mixer queries or context continuation
    if (q.includes('ванн') || q.includes('раковин') || q.includes('умывальн') || (currentTopic === 'mixer' && (q.includes('ван') || q.includes('рак'))) || q.includes('bath') || q.includes('basin')) {
      return {
        text: lang === 'kz'
          ? 'Ванна мен қолжуғыш үшін LAUTE желісі монолитті латунь араластырғыштар мен 300–400 мм ұзын шүмегі бар әмбебап шешімдерді қамтиды.'
          : lang === 'en'
          ? 'For bathroom and basin, LAUTE provides monolithic brass faucets with Neoperl aerators, plus universal 300-400mm swivel spout models.'
          : 'Для раковины и ванной LAUTE предлагает монолитные латунные смесители с аэраторами Neoperl, а также универсальные модели с поворотным изливом 300–400 мм для совмещенных санузлов.',
        newTopic: 'bath',
        recommendation: {
          title: 'Смесители для ванны и раковины LAUTE',
          route: 'catalog',
          actionText: 'Смотреть смесители'
        }
      };
    }

    // 7. General Mixer query without category specified: "Мне нужен смеситель"
    if (q.includes('смесител') || q.includes('кран') || q.includes('араластырғыш') || q.includes('faucet') || q.includes('mixer')) {
      return {
        text: lang === 'kz'
          ? 'Әрине! Смесительді қай аймақ үшін іздеп жатырсыз: асүй, қолжуғыш немесе ванна бөлмесі үшін бе?'
          : lang === 'en'
          ? 'Certainly! Which zone do you need the mixer for: kitchen, washbasin, or bath?'
          : 'Конечно! Подскажите, для какой зоны нужен смеситель: для кухни, раковины или ванной комнаты?',
        newTopic: 'mixer',
        recommendation: null
      };
    }

    // 8. Shower Systems
    if (q.includes('душ') || q.includes('лейк') || q.includes('стойк') || q.includes('тропическ') || q.includes('гарнитур') || q.includes('shower')) {
      return {
        text: lang === 'kz'
          ? 'Душ аймағы үшін биіктігі реттелетін (850–1250 мм) бағанасы және қаққа қарсы силикон форсункалары бар тропикалық үстіңгі душы бар LAUTE жүйелері оңтайлы.'
          : lang === 'en'
          ? 'For showers, LAUTE systems feature an adjustable telescopic column (850-1250mm) and rain showerhead with silicone Easy-Clean nozzles.'
          : 'Душевые комплекты LAUTE оснащены телескопической штангой (850–1250 мм) и верхним тропическим душем с силиконовыми форсунками Easy Clean против известкового налета.',
        newTopic: 'shower',
        recommendation: {
          title: 'Душевые системы LAUTE',
          route: 'catalog',
          actionText: 'Смотреть душевые системы'
        }
      };
    }

    // 9. Built-in / Concealed engineering
    if (q.includes('встраиваем') || q.includes('скрыт') || q.includes('бокс') || q.includes('ibox') || q.includes('concealed')) {
      return {
        text: lang === 'kz'
          ? 'LAUTE жасырын жүйелері 16 бар қысыммен сынақтан өткен цельнолатунды бокстармен және ультражұқа сәндік накладкалармен жасақталған.'
          : lang === 'en'
          ? 'LAUTE concealed units include solid brass core units pressure-tested to 16 bar and ultra-slim architectural trim plates.'
          : 'Встраиваемые решения LAUTE комплектуются скрытыми латунными боксами, прошедшими заводское гидротестирование давлением 16 бар, и ультратонкими накладками.',
        newTopic: 'engineering',
        recommendation: {
          title: 'Инженерные и скрытые модули LAUTE',
          route: 'catalog',
          actionText: 'Инженерная линия'
        }
      };
    }

    // 10. Wholesale / B2B Partnership
    if (q.includes('опт') || q.includes('партнер') || q.includes('дистрибьютор') || q.includes('девелопер') || q.includes('скидк') || q.includes('прайс') || q.includes('цена') || q.includes('заказ')) {
      return {
        text: lang === 'kz'
          ? 'Көтерме серіктестер мен құрылыс салушылар үшін LAUTE зауыттан тікелей келісімшарт, нысандық жеңілдіктер мен сапа төлқұжаттарын ұсынады.'
          : lang === 'en'
          ? 'For wholesale distributors and developers, LAUTE offers direct manufacturer contracts, project specifications, and 5-year warranty.'
          : 'Для оптовых дистрибьюторов и застройщиков LAUTE предоставляет прямой контракт с производителем, коммерческое предложение, объектные партии и гарантию 5 лет.',
        newTopic: 'b2b',
        recommendation: {
          title: 'Партнёрская программа LAUTE',
          route: 'partners',
          actionText: 'Стать партнёром'
        }
      };
    }

    // 11. Helpful default response (never empty, never "Запрос принят")
    return {
      text: lang === 'kz'
        ? 'Сұранысыңыз түсінікті! Мен асүй, ванна, душ аймақтарына арналған смесительдер немесе көтерме жеткізу шарттары бойынша көмектесе аламын. Қай бағытты талқылаймыз?'
        : lang === 'en'
        ? 'Understood! I can help select kitchen faucets, bath mixers, shower systems, or wholesale terms. Which category can I tell you more about?'
        : 'Я могу подсказать по смесителям для кухни, раковины и ванны, душевым стойкам LAUTE или условиям оптовых поставок. О какой категории рассказать подробнее?',
      newTopic: currentTopic,
      recommendation: {
        title: 'Каталог продукции LAUTE',
        route: 'catalog',
        actionText: 'Перейти в каталог'
      }
    };
  };

  // Safe send message handler (strictly single message, no duplicates)
  const handleFormSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isTyping) return; // Prevent double trigger while waiting for AI

    const text = inputValue.trim();
    if (!text) return;

    // Immediately post user message & clear input
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // AI reply after brief realistic latency
    setTimeout(() => {
      const response = generateDialogueResponse(text, dialogContext.topic);
      setDialogContext({ topic: response.newTopic });

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        recommendation: response.recommendation
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 380);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
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
          AI <span className="brand-word">LAUTE</span>
        </span>
        <ArrowUpRight size={15} className="trigger-arrow-icon" />
      </button>
    );
  }

  // 2. Open State: Architectural compact assistant
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
                {lang === 'kz' ? 'Онлайн' : lang === 'en' ? 'Online' : 'Онлайн'}
              </span>
            </div>
          </div>
        </div>

        {/* Action: Minimize to permanent floating button */}
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

      {/* Messages Stream */}
      <div className="ai-panel-body">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`ai-message-row ${msg.sender === 'user' ? 'msg-user' : 'msg-ai'}`}
          >
            <div className="ai-message-bubble">
              <div className="ai-message-text">{withBrandWord(msg.text)}</div>

              {msg.recommendation && (
                <div className="ai-recommendation-card">
                  <div className="ai-rec-title">{withBrandWord(msg.recommendation.title)}</div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm ai-rec-btn"
                    onClick={() => {
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
                ? 'Type a message…'
                : 'Напишите сообщение…'
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
