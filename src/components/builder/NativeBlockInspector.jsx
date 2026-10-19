import React from 'react';
import { useApp } from '../../context/AppContext';

export function NativeBlockInspector({ block, onChange, onOpenMediaPicker }) {
  const { siteContent } = useApp();
  const slides = block.nativeSlides || siteContent?.homeBlocks?.heroSlider || [];
  const patchSlide = (index, field, value) => onChange({ ...block,
    nativeSlides: slides.map((slide, i) => i === index ? { ...slide, [field]: value } : slide) });
  const patchIntro = (field, value) => onChange({ ...block, nativeIntro: { ...block.nativeIntro, [field]: value } });
  return <div className="native-block-inspector">
    <h4>Содержимое страницы</h4>
    <p>Изменения видны на макете. Каталог, корзина и формы сохраняют свою работу. Новые блоки можно добавить выше или ниже.</p>
    {block.route === 'home' ? slides.map((slide, index) => <section key={slide.id || index}>
      <h5>Слайд {index + 1}</h5>
      {[['tagline','Надпись над заголовком'],['title','Заголовок'],['subtitle','Описание'],['buttonText','Текст кнопки'],['buttonLink','Ссылка или действие'],['image','Фото']].map(([field,label]) => <label key={field}>{label}<input className="admin-input" value={slide[field] || ''} onChange={e => patchSlide(index, field, e.target.value)}/></label>)}
      {onOpenMediaPicker && <button className="admin-btn admin-btn-outline" onClick={() => onOpenMediaPicker(url => patchSlide(index, 'image', url))}>Выбрать фото из медиатеки</button>}
      <small>Ссылка: /catalog, https://… или modal:partner для заявки.</small>
    </section>) : <section>
      <label>Заголовок<input className="admin-input" placeholder="Текущий заголовок" value={block.nativeIntro?.h1 || ''} onChange={e => patchIntro('h1', e.target.value)}/></label>
      <label>Описание<textarea className="admin-input" rows={4} placeholder="Текущее описание" value={block.nativeIntro?.description || ''} onChange={e => patchIntro('description', e.target.value)}/></label>
    </section>}
    <p>Другие действия посетителей настраиваются в разделе «Кнопки сайта».</p>
  </div>;
}
