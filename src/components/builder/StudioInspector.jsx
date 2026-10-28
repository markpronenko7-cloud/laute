import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { uploadSingleImage, resolveMediaUrl } from '../../services/adminApi';
import { Image as ImageIcon, X, Upload } from 'lucide-react';
import { localizeCompanyBlock } from '../../data/factoryStory';
const labels = {
  title: 'Заголовок',
  subtitle: 'Описание',
  badge: 'Надпись',
  content: 'Текст',
  col1Title: 'Заголовок слева',
  col1Text: 'Текст слева',
  col2Title: 'Заголовок справа',
  col2Text: 'Текст справа',
  buttonText: 'Кнопка',
  buttonLink: 'Ссылка',
  submitText: 'Кнопка отправки',
  city: 'Город',
  address: 'Адрес',
  phone: 'Телефон',
  altPhone: 'Второй телефон',
  email: 'Эл. почта',
  question: 'Вопрос',
  answer: 'Ответ',
  desc: 'Описание',
  step: 'Номер шага',
  year: 'Год', note: 'Короткая подпись'
};
const textKeys = ['badge', 'title', 'subtitle', 'content', 'col1Title', 'col1Text', 'col2Title', 'col2Text'];
function PhotoInput({
  value,
  onChange,
  onMedia
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return <div className="inspector-photo">
    {value && <img src={resolveMediaUrl(value)} alt="Выбранное фото" />}
    <div className="inspector-photo-actions"><button className="admin-btn admin-btn-outline" onClick={() => onMedia?.(onChange)}><ImageIcon size={14} />Медиатека</button>
      <label className="admin-btn admin-btn-outline"><Upload size={14} />{busy ? 'Загрузка…' : 'Загрузить'}<input type="file" accept="image/*" hidden disabled={busy} onChange={async e => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true);
          setError('');
          try {
            onChange((await uploadSingleImage(f)).url);
          } catch (err) {
            setError(err.message);
          } finally {
            setBusy(false);
          }
        }} /></label></div>
    <input aria-label="Адрес фото" value={value || ''} placeholder="Ссылка на фото" onChange={e => onChange(e.target.value)} />
    {error && <p role="alert" className="inspector-error">{error}</p>}
  </div>;
}
function LinkInput({ value, onChange, pages = [] }) {
  const known = pages.some(page => '/' + page.slug === value);
  return <div>
    <label className="studio-field"><span>Куда перейти</span><select value={known ? value : 'custom'} onChange={event => onChange(event.target.value === 'custom' ? 'https://' : event.target.value)}>
      {pages.map(page => <option key={page.id} value={'/' + page.slug} disabled={page.status === 'ЧЕРНОВИК' && !page.published}>{page.title}</option>)}
      <option value="custom">Своя ссылка</option>
    </select></label>
    {!known && <label className="studio-field"><span>Ссылка</span><input value={value || ''} placeholder="https://…" onChange={event => onChange(event.target.value)}/></label>}
  </div>;
}

export function StudioInspector({
  block,
  selectedField,
  onChange,
  onOpenMediaPicker,
  onClearField,
  availablePages = []
}) {
  const {
    lang
  } = useApp();
  const [companyLang, setCompanyLang] = useState('ru');
  if (!block) return <div className="studio-inspector-empty"><ImageIcon size={28} /><h3>Выбери блок</h3></div>;
  const patch = (key, value) => onChange({
    ...block,
    [key]: value
  });
  const field = (key, value, change, label = labels[key] || key) => <label className="studio-field" key={key}><span>{label}</span>{/subtitle|content|Text|desc|answer|address/i.test(key) && key !== 'buttonText' ? <textarea rows={4} value={value || ''} onChange={e => change(e.target.value)} /> : <input value={value ?? ''} onChange={e => change(e.target.value)} />}</label>;
  if (block.companySection) {
    const view = localizeCompanyBlock(block, companyLang);
    const editText = (value, changes) => companyLang === 'ru' ? { ...value, ...changes } : { ...value, translations: { ...value.translations, [companyLang]: { ...value.translations?.[companyLang], ...changes } } };
    return <div className="studio-inspector-content"><h3>{view.title}</h3>
      <label className="studio-field"><span>Язык текста</span><select value={companyLang} onChange={e=>setCompanyLang(e.target.value)}><option value="ru">Русский</option><option value="en">English</option><option value="kz">Қазақша</option></select></label>
      {['title','subtitle', ...(block.content && companyLang==='ru' ? ['content'] : [])].map(key=>field(key, view[key], value=>onChange(editText(block,{[key]:value}))))}
      {block.imageUrl !== undefined && <PhotoInput value={block.imageUrl} onChange={v=>patch('imageUrl',v)} onMedia={onOpenMediaPicker}/>}
      {block.buttonText !== undefined && field('buttonText',view.buttonText,value=>onChange(editText(block,{buttonText:value})))}
      {block.buttonLink !== undefined && <LinkInput value={block.buttonLink} onChange={v=>patch('buttonLink',v)} pages={availablePages}/>}
      {block.items?.map((item,index)=><details key={index}><summary>{view.items[index].title}</summary>
        {block.companySection==='history' && field('year',item.year,value=>patch('items',block.items.map((x,i)=>i===index?{...x,year:value}:x)))}
        {['title','desc'].map(key=>field(key,view.items[index][key],value=>patch('items',block.items.map((x,i)=>i===index?editText(x,{[key]:value}):x))))}
        {item.imageUrl && <PhotoInput value={item.imageUrl} onChange={value=>patch('items',block.items.map((x,i)=>i===index?{...x,imageUrl:value}:x))} onMedia={onOpenMediaPicker}/>}
        {item.link !== undefined && <LinkInput value={item.link} onChange={value=>patch('items',block.items.map((x,i)=>i===index?{...x,link:value}:x))} pages={availablePages}/>}
        {['lat','lng'].filter(key=>item[key]!==undefined).map(key=>field(key,item[key],value=>patch('items',block.items.map((x,i)=>i===index?{...x,[key]:Number(value)}:x)),key==='lat'?'Широта':'Долгота'))}
        <button className="admin-btn admin-btn-danger" onClick={()=>patch('items',block.items.filter((_,i)=>i!==index))}>Удалить пункт</button>
      </details>)}
      {block.items && <button className="admin-btn admin-btn-outline" onClick={()=>patch('items',[...block.items,{...block.items[0],title:'Новый пункт',desc:'',year:'',translations:{}}])}>Добавить пункт</button>}
    </div>;
  }
  if (block.type === 'system_section' || block.type === 'system_page') {
    if (!selectedField || selectedField.blockId !== block.id) return <div className="studio-inspector-empty"><h3>{block.title}</h3><p>Нажми текст, кнопку или фото на странице.</p></div>;
    const stored = block.nativeEdits?.[selectedField.key]?.[lang] || {};
    const set = value => onChange({
      ...block,
      nativeEdits: {
        ...block.nativeEdits,
        [selectedField.key]: {
          ...block.nativeEdits?.[selectedField.key],
          [lang]: {
            ...stored,
            ...value
          }
        }
      }
    });
    const photo = ['image', 'background'].includes(selectedField.kind);
    const action = ['button', 'link'].includes(selectedField.kind);
    return <div className="studio-inspector-content"><div className="studio-inspector-heading"><h3>{photo ? 'Фотография' : action ? 'Кнопка' : 'Текст'}</h3><button className="admin-btn admin-btn-ghost" aria-label="Закрыть настройки элемента" onClick={onClearField}><X size={17} /></button></div>
      {photo ? <><PhotoInput value={stored.src ?? selectedField.src} onChange={src => set({
          src
        })} onMedia={onOpenMediaPicker} />{field('alt', stored.alt ?? selectedField.alt, alt => set({
          alt
        }), 'Описание фото')}</> : field('content', stored.text ?? selectedField.text, text => set({
        text
      }), 'Текст')}
      {action && <><label className="studio-field"><span>Действие</span><select value={stored.link === undefined ? 'original' : 'link'} onChange={e => {
            if (e.target.value === 'original') {
              const next = {
                ...stored
              };
              delete next.link;
              onChange({
                ...block,
                nativeEdits: {
                  ...block.nativeEdits,
                  [selectedField.key]: {
                    ...block.nativeEdits?.[selectedField.key],
                    [lang]: next
                  }
                }
              });
            } else set({
              link: selectedField.link || '/catalog'
            });
          }}><option value="original">Как сейчас</option><option value="link">Открыть ссылку</option></select></label>
        {stored.link !== undefined && <LinkInput value={stored.link} onChange={link=>set({link})} pages={availablePages}/>}
      </>}
      <button className="admin-btn admin-btn-ghost" onClick={() => {
        const edits = {
          ...block.nativeEdits
        };
        const languages = {
          ...edits[selectedField.key]
        };
        delete languages[lang];
        edits[selectedField.key] = languages;
        onChange({
          ...block,
          nativeEdits: edits
        });
      }}>Вернуть исходное</button>
    </div>;
  }
  return <div className="studio-inspector-content"><h3>{block.title || 'Блок'}</h3>
    {textKeys.filter(k => block[k] !== undefined || k === 'title').map(k => field(k, block[k], value => patch(k, value)))}
    {block.type === 'factory_film' && <>
      {field('videoUrl', block.videoUrl, v => patch('videoUrl', v), 'Ссылка на видео MP4')}
      {field('buttonText', block.buttonText, v => patch('buttonText', v))}
      <LinkInput value={block.buttonLink} onChange={v => patch('buttonLink', v)} pages={availablePages}/>
    </>}
    {['hero', 'image_text', 'cta_banner'].includes(block.type) && <details open={!!block.buttonText}><summary>Кнопка</summary>{field('buttonText', block.buttonText, v => patch('buttonText', v))}{<LinkInput value={block.buttonLink} onChange={v=>patch('buttonLink',v)} pages={availablePages}/>}</details>}
    {(block.imageUrl !== undefined || block.type === 'image_text') && <PhotoInput value={block.imageUrl} onChange={v => patch('imageUrl', v)} onMedia={onOpenMediaPicker} />}
    {block.type === 'form_lead' && field('submitText', block.submitText, v => patch('submitText', v))}
    {Array.isArray(block.items) && <div className="studio-items">{block.items.map((item, index) => <details key={index}><summary>{item.title || item.question || 'Пункт ' + (index + 1)}</summary>{Object.entries(item).filter(([key, value]) => typeof value === 'string' && key !== 'imageUrl' && key !== 'id' && key !== 'icon').map(([key, value]) => field(key, value, v => patch('items', block.items.map((row, i) => i === index ? {
          ...row,
          [key]: v
        } : row))))}{item.imageUrl !== undefined && <PhotoInput value={item.imageUrl} onChange={v => patch('items', block.items.map((row, i) => i === index ? {
          ...row,
          imageUrl: v
        } : row))} onMedia={onOpenMediaPicker} />}<button className="admin-btn admin-btn-danger" onClick={() => patch('items', block.items.filter((_, i) => i !== index))}>Удалить пункт</button></details>)}
      <button className="admin-btn admin-btn-outline" onClick={() => {
        const sample = block.items[0] || {
          title: '',
          desc: ''
        };
        patch('items', [...block.items, Object.fromEntries(Object.entries(sample).map(([key, value]) => [key, typeof value === 'string' ? '' : value]))]);
      }}>Добавить пункт</button></div>}
    <details><summary>Оформление</summary>
      <label className="studio-field"><span>Фон</span><select value={block.style?.background || 'dark'} onChange={e => patch('style', {
          ...block.style,
          background: e.target.value
        })}><option value="dark">Тёмный</option><option value="card">Карточка</option><option value="deep">Чёрный</option><option value="transparent">Прозрачный</option></select></label>
      <label className="studio-field"><span>Отступы</span><select value={block.style?.padding || 'lg'} onChange={e => patch('style', {
          ...block.style,
          padding: e.target.value
        })}><option value="sm">Маленькие</option><option value="md">Обычные</option><option value="lg">Большие</option></select></label>
      {block.type === 'image_text' && <label className="studio-field"><span>Фото</span><select value={block.imagePosition || 'right'} onChange={e => patch('imagePosition', e.target.value)}><option value="left">Слева</option><option value="right">Справа</option></select></label>}
      {['hero', 'image_text', 'cta_banner'].includes(block.type) && <label className="studio-field"><span>Вид кнопки</span><select value={block.buttonType || 'primary'} onChange={e => patch('buttonType', e.target.value)}><option value="primary">Основная</option><option value="gold">Акцентная</option><option value="outline">Контурная</option></select></label>}
      {block.type === 'catalog_preview' && <label className="studio-field"><span>Количество товаров</span><input type="number" min="1" max="50" value={block.limit || 6} onChange={e => patch('limit', Math.max(1, Math.min(50, Number(e.target.value) || 1)))} /></label>}<label className="studio-field"><span>Выравнивание</span><select value={block.style?.alignment || 'left'} onChange={e => patch('style', {
          ...block.style,
          alignment: e.target.value
        })}><option value="left">Слева</option><option value="center">По центру</option><option value="right">Справа</option></select></label></details>
  </div>;
}
