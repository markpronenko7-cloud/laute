import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { REGIONS_CONFIG } from '../src/data/regionsData.js';
import { resolveInquiryRecipient, validateInquiryRouting, DEFAULT_INQUIRY_EMAIL } from '../src/utils/inquiryRouting.js';
import { getCompanyBlocks, COMPANY_BLOCKS, localizeCompanyBlock } from '../src/data/factoryStory.js';
import { getEditableBlocks } from '../src/utils/pagePublication.js';

const types = ['partner', 'service', 'order'];
const routing = { defaults: Object.fromEntries(types.map(t => [t, `${t}@example.com`])), regions: Object.fromEntries(REGIONS_CONFIG.map(r => [r.id, Object.fromEntries(types.map(t => [t, `${t}-${r.id}@example.com`]))])) };

test('Адреса: все регионы и направления, общий адрес, пустые поля и неверные email', () => {
  for (const r of REGIONS_CONFIG) for (const t of types) assert.equal(resolveInquiryRecipient(routing,t,r.id),`${t}-${r.id}@example.com`);
  for (const t of types) {
    assert.equal(resolveInquiryRecipient({defaults:routing.defaults},t,'unknown'),`${t}@example.com`);
    assert.equal(resolveInquiryRecipient({regions:{kz:{[t]:''}}},t,'kz'),DEFAULT_INQUIRY_EMAIL);
    assert.throws(() => validateInquiryRouting({regions:{kz:{[t]:'bad@example.com,other@example.com'}}}));
  }
  validateInquiryRouting(routing);
});

test('Заявки: опубликованные настройки управляют реальным запросом отправки, ошибки не создают ложного успеха', async () => {
  const compiled = await build({entryPoints:['src/services/adminApi.js'],bundle:true,packages:'external',write:false,format:'cjs',platform:'node',logLevel:'silent',define:{'import.meta.env.BASE_URL':'"/laute/"'}});
  const module={exports:{}};new Function('require','module','exports',compiled.outputFiles[0].text)(createRequire(import.meta.url),module,module.exports);const api=module.exports;
  const cache=new Map([['laute_admin_token','qa-isolated']]);const session=new Map();
  const old={fetch:globalThis.fetch,window:globalThis.window,localStorage:globalThis.localStorage,sessionStorage:globalThis.sessionStorage};
  globalThis.window={location:{href:'https://example.github.io/laute/',hostname:'example.github.io'}};
  globalThis.localStorage={getItem:k=>cache.get(k)??null,setItem:(k,v)=>cache.set(k,v),removeItem:k=>cache.delete(k)};
  globalThis.sessionStorage={getItem:k=>session.get(k)??null,setItem:(k,v)=>session.set(k,v)};
  let published={inquiryRouting:routing},draft={},mailResult={success:'true'},httpStatus=200,networkError=false,contentFailure=false;const sent=[];
  const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json'}});
  globalThis.fetch=async(url,options={})=>{
    if(String(url).includes('formsubmit.co/ajax/')){sent.push({recipient:decodeURIComponent(String(url).split('/').at(-1)),body:JSON.parse(options.body)});if(networkError)throw new Error('network');return json(mailResult,httpStatus);}
    if(String(url).includes('/rpc/laute_save_content_draft')){draft={...draft,...JSON.parse(options.body).p_updates};return json({success:true});}
    if(String(url).includes('/rpc/laute_get_admin_data'))return json({draft});
    if(String(url).includes('/rpc/laute_publish_content')){published=structuredClone(draft);return json({success:true});}
    if(String(url).includes('laute_site_content?'))return json([{data:structuredClone(published)}],contentFailure?503:200);
    return json({},404);
  };
  try {
    for(const r of REGIONS_CONFIG){cache.set('laute_region',r.id);
      for(const source of ['partner_modal','company_partner','home_b2b_lead','partner','service_modal','service_page']){
        const type=source.includes('service')?'service':'partner';await api.submitLeadInquiry({source,name:'QA',email:'qa@example.com'});
        assert.equal(sent.at(-1).recipient,`${type}-${r.id}@example.com`);assert.equal(sent.at(-1).body.email,'qa@example.com');assert.match(sent.at(-1).body.message,new RegExp(r.id));
      }
      session.clear();await api.submitCartOrderInquiry({customerName:'QA isolated',contact:'qa@example.com',city:'QA city',consent:true,items:[{article:'QA',title:'QA',quantity:1,price:100}]});
      assert.equal(sent.at(-1).recipient,`order-${r.id}@example.com`);
    }
    await api.submitLeadInquiry({source:'service_page',regionInquiry:'almaty'});assert.equal(sent.at(-1).recipient,'service-almaty@example.com');
    const sentBefore=sent.length;contentFailure=true;await assert.rejects(api.submitLeadInquiry({source:'service_page'}));assert.equal(sent.length,sentBefore);contentFailure=false;
    const before=cache.get('laute_leads_log');
    for(const response of [{success:false,message:'Please activate your email'},{success:'false'},{}]){mailResult=response;await assert.rejects(api.submitLeadInquiry({source:'partner_modal'}));assert.equal(cache.get('laute_leads_log'),before);}
    networkError=true;await assert.rejects(api.submitLeadInquiry({source:'service_modal'}));networkError=false;mailResult={success:true};httpStatus=500;await assert.rejects(api.submitLeadInquiry({source:'partner_modal'}));httpStatus=200;
    await api.saveSiteContentDraft({inquiryRouting:{defaults:{partner:'updated@example.com'}}});
    assert.equal(resolveInquiryRecipient((await api.fetchSiteContent(false)).inquiryRouting,'partner','usa'),'partner-usa@example.com');
    assert.equal((await api.fetchSiteContent(true)).inquiryRouting.defaults.partner,'updated@example.com');
    await api.publishSiteContent();await api.submitLeadInquiry({source:'partner_modal'});assert.equal(sent.at(-1).recipient,'updated@example.com');
    await assert.rejects(api.saveSiteContentDraft({inquiryRouting:{defaults:{service:'invalid'}}}));
  } finally {Object.assign(globalThis,old);}
});

test('Завод: сохранённые блоки остаются редактируемыми, история не дублируется, прежние блоки сохраняются', () => {
 const story={id:'old-story',type:'text',content:'История завода'};
 const blocks=getCompanyBlocks([{id:'blk-comp-hero',type:'hero'},story,{id:'cta',type:'cta_banner'}]);
 assert.equal(blocks[0].companySection,'hero');assert.equal(blocks.filter(b=>b.type==='factory_history').length,1);assert.equal(blocks.find(b=>b.id==='old-story'),story);
 assert.equal(blocks.some(b=>b.type==='factory_film'),false);
 assert.equal(blocks.find(b=>b.companySection==='hero').buttonLink,'#'+blocks.find(b=>b.companySection==='inquiry').anchor);
 assert.equal(getCompanyBlocks(blocks),blocks);
 const edited=COMPANY_BLOCKS.map(b=>b.companySection==='hero'?{...b,title:'Свой заголовок',isVisible:false}:b);
 assert.equal(getCompanyBlocks(edited),edited);assert.equal(getEditableBlocks({slug:'company',blocks:edited}),edited);
 const legacy={id:'laute-factory-film',type:'factory_film',videoUrl:'media/laute-factory-film.mp4',title:'Старый фильм',isVisible:false};
 const upgraded=getCompanyBlocks([legacy,story]);
 assert.equal(upgraded[0].companySection,'hero');
 assert.equal(upgraded.some(b=>b.type==='factory_film'),false);
 assert.equal(legacy.videoUrl,'media/laute-factory-film.mp4');
 assert.equal(upgraded.filter(b=>b.type==='factory_history').length,1);
 assert.equal(getCompanyBlocks(upgraded),upgraded);
 for(const lang of ['ru','en','kz']) {
   const localized=COMPANY_BLOCKS.map(b=>localizeCompanyBlock(b,lang));
   assert.equal(localized.find(b=>b.companySection==='history').items.length,11);
   assert.equal(localized.find(b=>b.companySection==='production').items.length,6);
   assert.equal(localized.find(b=>b.companySection==='geography').items.length,10);
   assert.equal(localized.find(b=>b.companySection==='inquiry').items.length,12);
   assert.ok(localized.every(b=>b.title&&b.subtitle));
 }
});

test('Завод: миграция реальной штатной страницы убирает фильм и иллюстрации, затем сохраняет правки CMS', () => {
 const source=createRequire(import.meta.url)('../public/data/custom_pages.json').find(page=>page.slug==='company');
 const result=getCompanyBlocks(source.blocks);
 assert.equal(result.some(block=>block.type==='factory_film'),false);
 const gallery=result.find(block=>block.companySection==='production');
 assert.equal(gallery.items.length,6);
 assert.ok(gallery.items.every(item=>item.imageUrl.startsWith('images/factory/laute-')));
 const edited=result.map(block=>block.companySection==='history'?{...block,title:'История сотрудника',isVisible:false}:block);
 assert.equal(getCompanyBlocks(edited),edited);
 assert.equal(getEditableBlocks({slug:'company',blocks:edited}),edited);
});
