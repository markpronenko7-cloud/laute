// Browser QA: requires Playwright and installed Chrome/WebKit; see RESPONSIVE_QA.md.
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const fs = require('fs');
fs.mkdirSync('.temp', {recursive:true});
const routes=['home','catalog','company','partners','where-to-buy','service','contacts'];
(async()=>{
 const engine = process.argv[2] || 'chrome';
 const browser=engine === 'webkit' ? await webkit.launch({headless:true}) : await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.argv[3] || 'http://127.0.0.1:4173/laute/');
 const findings=[];
 for(const lang of ['ru','kz','en']) {
  await page.evaluate(lang=>localStorage.setItem('laute_lang',lang),lang);await page.reload();
  await page.evaluate(()=>document.fonts.ready); await page.locator('.btn-ai-minimize').click();
  for(const route of routes){
   await page.evaluate(route=>{history.pushState({},'',`/laute/${route==='home'?'':route}`);dispatchEvent(new PopStateEvent('popstate'));},route);
   await page.waitForTimeout(100);
   for(const [width,height] of [[320,568],[375,812],[390,844],[430,932],[768,1024],[820,1180],[1024,768],[1280,800],[1440,900],[1512,982],[1680,1050],[1920,1080],[844,390]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(55);
    const result=await page.evaluate(()=>{
     document.querySelectorAll('.reveal-on-scroll').forEach(e=>e.classList.add('is-visible'));
     const visible=e=>{const s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden'&&e.getBoundingClientRect().width>0&&!e.closest('[aria-hidden="true"]')};
     const overflow=[...document.querySelectorAll('main *,footer *,header > .header-container *')].filter(e=>{
      if(!visible(e))return false;
      const r=e.getBoundingClientRect(); if(r.left>=-2&&r.right<=innerWidth+2)return false;
      for(let p=e.parentElement;p&&p!==document.body;p=p.parentElement)if(/auto|scroll|hidden|clip/.test(getComputedStyle(p).overflowX))return false;
      return true;
     }).slice(0,10).map(e=>({tag:e.tagName,cl:typeof e.className==='string'?e.className:'svg',r:Math.round(e.getBoundingClientRect().right),w:Math.round(e.getBoundingClientRect().width)}));
     const h=document.querySelector('header > .header-container'),l=h.querySelector('.header-left').getBoundingClientRect(),r=h.querySelector('.header-right').getBoundingClientRect();
     const c=h.getBoundingClientRect(),s=getComputedStyle(h);
     const headerOverlap=l.right>r.left-2||r.right>c.right-parseFloat(s.paddingRight)+1;
     const hero=document.querySelector('.hero-slide-caption.is-active');
     const heroClip=hero&&hero.getBoundingClientRect().top<document.querySelector('header').getBoundingClientRect().bottom;
     const firstText=document.querySelector('main .section-badge, main h1');
     const pageTopClip=firstText&&firstText.getBoundingClientRect().top+scrollY<document.querySelector('header').getBoundingClientRect().bottom;
     return {overflow,headerOverlap,heroClip,pageTopClip};
    });
    if(result.overflow.length||result.headerOverlap||result.heroClip||result.pageTopClip)findings.push({lang,route,width,height,...result});
   }
  }
 }
 fs.writeFileSync(`.temp/audit-${engine}.json`,JSON.stringify({engine,cases:273,errors,findings},null,2)); console.log(JSON.stringify({engine,cases:273,errors,findings},null,2));
 await browser.close();
 if(errors.length || findings.length) process.exitCode=1;
})();
