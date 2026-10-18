// Browser QA: requires Playwright and installed Chrome/WebKit; see RESPONSIVE_QA.md.
const pw=require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const assert=require('assert/strict');const fs=require('fs');
fs.mkdirSync('.temp', {recursive:true});
async function assertDesktopMenu(page, scenario) {
 await page.waitForFunction(()=>{
  const nav=document.querySelector('header > .header-container .nav-desktop');
  return nav && getComputedStyle(nav).display!=='none';
 },null,{timeout:3000}).catch(()=>{throw Error(`${scenario}: desktop navigation is missing`)});
 const buttons=page.locator('header > .header-container .nav-link');
 assert.equal(await buttons.count(),7,scenario);
 for(const button of await buttons.all()){
  assert(await button.isVisible(),scenario);
  assert(await button.evaluate(e=>{
   const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
   return r.left>=0&&r.right<=innerWidth&&e.contains(hit);
  }),`${scenario}: navigation is obscured`);
 }
 assert(!(await page.locator('header > .header-container .mobile-toggle').isVisible()),scenario);
}
(async()=>{
 const engine=process.argv[2]||'chrome',base=process.argv[3]||'http://127.0.0.1:4173/laute/';
 const browser=engine==='webkit'?await pw.webkit.launch():await pw.chromium.launch({channel:'chrome'});
 const page=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);await page.locator('.btn-ai-minimize').click();
 // Independent acceptance criterion: a wide Kazakh desktop must show seven usable links.
 // A fit formula agreeing with itself cannot establish that the desktop menu is useful.
 await page.evaluate(()=>localStorage.setItem('laute_lang','kz'));await page.reload();
 await page.setViewportSize({width:2539,height:1200});
 await page.waitForFunction(()=>document.querySelector('header > .header-container .header-lang-dropdown .select-val')?.textContent==='КАЗ');
 await page.evaluate(async()=>{await document.fonts.load('600 14px Inter','Басты бет Қайдан сатып алуға болады');await document.fonts.ready});
 await page.waitForTimeout(200);
 await assertDesktopMenu(page,'KZ screenshot regression, 2539px');
 await page.locator('.btn-ai-minimize').click();
 const samples=[];
 for(const lang of ['ru','kz','en']){
  await page.locator('header > .header-container .header-lang-dropdown .select-trigger').click();
  await page.locator('.lang-panel .dropdown-option').nth(['ru','kz','en'].indexOf(lang)).click();
  for(let region=0;region<7;region++){
   await page.setViewportSize({width:1920,height:1080});
   await page.locator('header > .header-container .header-region-dropdown .select-trigger').click();await page.locator('.region-panel .dropdown-option').nth(region).click();
   let threshold=await page.locator('.header-measure').evaluate(e=>Math.ceil(e.getBoundingClientRect().width)+2);
   const widths=[959,960,961,1079,1080,1280,1366,1439,1440,1512,1559,1560,1679,1680,1799,1800,1820,1920,2031,2539,2560,threshold-1,threshold,threshold+1];
   for(const width of [...new Set(widths)].filter(w=>w>=320&&w<=2560)){
    await page.setViewportSize({width,height:982});
    await page.waitForFunction(()=>{
     const available=document.querySelector('header > .header-container').getBoundingClientRect().width;
     const needed=document.querySelector('.header-measure').getBoundingClientRect().width;
     return document.querySelector('header').classList.contains('header-desktop-mode') === (innerWidth>960&&available>=Math.ceil(needed)+2);
    });
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const sample=await page.evaluate(()=>{
     const h=document.querySelector('header > .header-container'),l=h.querySelector('.header-left').getBoundingClientRect(),r=h.querySelector('.header-right').getBoundingClientRect();
     const c=h.getBoundingClientRect(),s=getComputedStyle(h);
     return {mode:document.querySelector('header').className,overlap:l.right>r.left-2,outside:r.right>c.right-parseFloat(s.paddingRight)+1};
    });
    assert(!sample.overlap&&!sample.outside,JSON.stringify({lang,region,width,...sample}));
    if(width>=1512) await assertDesktopMenu(page,`${lang}, region ${region}, ${width}px`);
    samples.push({lang,region,width,mode:sample.mode});
   }
  }
 }
 // Small touch screens: drawer, all region chips, selectors, all slide captions.
 await page.setViewportSize({width:390,height:844});
 await page.locator('header > .header-container .mobile-toggle').click();
 assert.equal(await page.evaluate(()=>document.body.style.overflow),'hidden');
 const drawer=await page.locator('.mobile-nav-drawer').evaluate(e=>({w:e.clientWidth,sw:e.scrollWidth,h:e.clientHeight,sh:e.scrollHeight,b:e.getBoundingClientRect().bottom}));
 assert(drawer.sw<=drawer.w+1&&drawer.b<=844+1,JSON.stringify(drawer));
 await page.locator('.region-chip').last().scrollIntoViewIfNeeded();assert(await page.locator('.region-chip').last().isVisible());
 await page.locator('.region-chip').last().click();assert.equal(await page.locator('.mobile-nav-drawer').count(),0);
 await page.locator('header > .header-container .mobile-toggle').click();await page.keyboard.press('Escape');assert.equal(await page.locator('.mobile-nav-drawer').count(),0);
 await page.screenshot({path:`.temp/${engine}-mobile.png`});
 await page.setViewportSize({width:844,height:390});
 const heroHeights=[];
 for(let i=0;i<6;i++){
  await page.locator('.hero-indicator-btn').nth(i).click();
  assert(await page.locator('.hero-slide-caption:not(.is-active)').evaluateAll(es=>es.every(e=>getComputedStyle(e).visibility==='hidden')));
  const bounds=await page.locator('.hero-slide-caption.is-active').evaluate(e=>({t:e.getBoundingClientRect().top+scrollY,b:e.getBoundingClientRect().bottom+scrollY}));
  const hh=await page.locator('header').evaluate(e=>e.getBoundingClientRect().bottom);
  assert(bounds.t>=hh,JSON.stringify({i,bounds,hh}));
  heroHeights.push(await page.locator('.hero-carousel-section').evaluate(e=>e.getBoundingClientRect().height));
 }
 assert(Math.max(...heroHeights)-Math.min(...heroHeights)<1,'Hero height changes between slides');
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
 await page.screenshot({path:`.temp/${engine}-landscape.png`,fullPage:false});
 // Touch swipes must distinguish vertical scrolling from horizontal slide navigation.
 const swipe=async(dx,dy)=>page.locator('.hero-carousel-section').evaluate((e,{dx,dy})=>{
  const send=(type,points)=>{
   const event=new Event(type,{bubbles:true});
   Object.defineProperty(event,'targetTouches',{value:points});e.dispatchEvent(event);
  };
  send('touchstart',[{clientX:200,clientY:200}]);
  send('touchmove',[{clientX:200+dx,clientY:200+dy}]);
  send('touchend',[]);
 },{dx,dy});
 await page.locator('.hero-indicator-btn').first().click();
 await swipe(-80,-200);assert.equal(await page.locator('.hero-indicator-btn.is-active .indicator-num').textContent(),'01');
 await swipe(-100,10);assert.equal(await page.locator('.hero-indicator-btn.is-active .indicator-num').textContent(),'02');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.mouse.move(0,0);
 await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,1500)});await page.waitForTimeout(100);
 assert.equal(await page.locator('.hero-carousel-section').getAttribute('data-autoplay-paused'),'true');
 const active=await page.locator('.hero-indicator-btn.is-active .indicator-num').textContent();await page.waitForTimeout(3300);assert.equal(await page.locator('.hero-indicator-btn.is-active .indicator-num').textContent(),active);
 const mutations=await page.evaluate(async()=>{
  let root=0,header=0;const a=new MutationObserver(m=>root+=m.length),b=new MutationObserver(m=>header+=m.length);
  a.observe(document.documentElement,{attributes:true,attributeFilter:['style']});b.observe(document.querySelector('header'),{attributes:true,attributeFilter:['style','class']});
  for(let i=0;i<60;i++){window.scrollTo(0,1500+i*12);await new Promise(r=>requestAnimationFrame(r));}
  a.disconnect();b.disconnect();return {root,header};
 });assert.equal(mutations.root,0);assert.equal(mutations.header,0);
 await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(100);assert.equal(await page.locator('.hero-carousel-section').getAttribute('data-autoplay-paused'),'false');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>document.querySelector('.hero-carousel-section').dataset.autoplayPaused==='true');
 await page.setViewportSize({width:1440,height:900});await page.screenshot({path:`.temp/${engine}-desktop.png`});
 // Keep CMS login and its unobtrusive footer link intact. No login attempts or writes.
 assert.equal(await page.locator('.footer-admin-link').count(),1);
 await page.locator('.footer-admin-link').click();await page.locator('input[type=password]').waitFor();
 const login=await page.locator('input').evaluateAll(es=>es.filter(e=>e.type!=='hidden').map(e=>e.type));assert.deepEqual(login,['password']);
 assert.deepEqual(errors,[]);
 // Mobile browser profiles add DPR, touch input, mobile viewport and user agent emulation.
 const profile=engine==='webkit'?'iPhone 13':'Pixel 7';
 const mobileContext=await browser.newContext({...pw.devices[profile],reducedMotion:'reduce'});
 const mobile=await mobileContext.newPage();mobile.on('pageerror',e=>errors.push(e.message));
 await mobile.goto(base);await mobile.locator('.btn-ai-minimize').tap();
 await mobile.locator('header > .header-container .mobile-toggle').tap();
 await mobile.locator('.mobile-nav-link').nth(1).tap();
 await mobile.locator('.catalog-page').waitFor();
 assert(await mobile.locator('.catalog-page').isVisible());
 assert(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await mobile.screenshot({path:`.temp/${engine}-device-profile.png`});
 await mobileContext.close();assert.deepEqual(errors,[]);
 const coldLoads=[];
 for(const lang of ['ru','kz','en']){
  const cold=await browser.newContext({viewport:{width:2539,height:1200},reducedMotion:'reduce'});
  await cold.addInitScript(lang=>{localStorage.setItem('laute_lang',lang);localStorage.setItem('laute_region','siberia')},lang);
  await cold.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,async route=>{await new Promise(r=>setTimeout(r,250));await route.continue()});
  const tab=await cold.newPage();tab.on('pageerror',e=>errors.push(e.message));
  await tab.goto(base,{waitUntil:'domcontentloaded'});
  await assertDesktopMenu(tab,`${lang} cold load, pending fonts`);
  await tab.evaluate(()=>document.fonts.ready);
  for(const width of [1512,1799,1800,1920,2539,3200]){
   await tab.setViewportSize({width,height:1100});
   await assertDesktopMenu(tab,`${lang} cold load, ${width}px`);
  }
  for(let i=0;i<7;i++){
   await tab.locator('header > .header-container .nav-link').nth(i).click();
   await assertDesktopMenu(tab,`${lang} route ${i}`);
   assert(await tab.locator('header > .header-container .nav-link').nth(i).evaluate(e=>e.classList.contains('active')));
  }
  const stable=await tab.locator('header').evaluate(async e=>{
   const modes=new Set();for(let i=0;i<30;i++){modes.add(e.classList.contains('header-desktop-mode'));await new Promise(r=>requestAnimationFrame(r));}return [...modes];
  });assert.deepEqual(stable,[true],`${lang}: header oscillates after fonts or navigation`);
  await tab.reload();await tab.evaluate(()=>document.fonts.ready);await assertDesktopMenu(tab,`${lang} saved-language reload`);
  await tab.locator('.btn-ai-minimize').click();await tab.screenshot({path:`.temp/${engine}-${lang}-wide-header.png`});
  coldLoads.push({lang,stable});await cold.close();
 }
 // Chrome's own page zoom in isolated, disposable profiles; never touch a personal profile.
 const zoom=[];
 if(engine==='chrome'){
  const path=require('path'),tempRoot=path.resolve('.temp');
  for(const factor of [0.8,1,1.1,1.25,1.5,1.75,2]){
   const root=fs.mkdtempSync(path.join(tempRoot,'header-zoom-'));
   fs.mkdirSync(path.join(root,'Default'));
   const level=Math.log(factor)/Math.log(1.2);
   fs.writeFileSync(path.join(root,'Default','Preferences'),JSON.stringify({partition:{default_zoom_level:{x:level,'0':level}}}));
   const context=await pw.chromium.launchPersistentContext(root,{channel:'chrome',viewport:{width:2539,height:1200},reducedMotion:'reduce'});
   try{
    await context.addInitScript(()=>{localStorage.setItem('laute_lang','kz');localStorage.setItem('laute_region','siberia')});
    const tab=await context.newPage();tab.on('pageerror',e=>errors.push(e.message));
    await tab.goto(base);await tab.locator('.btn-ai-minimize').click();await tab.evaluate(()=>document.fonts.ready);
    const metrics=await tab.evaluate(()=>({width:innerWidth,dpr:devicePixelRatio,scale:visualViewport.scale}));
    assert(Math.abs(metrics.dpr-factor)<0.01,`Chrome zoom ${factor} not applied`);
    assert.equal(metrics.scale,1,'Page zoom must not be substituted with pinch zoom');
    if(metrics.width>=1512) await assertDesktopMenu(tab,`Chrome page zoom ${factor}`);
    else if(await tab.locator('header > .header-container .mobile-toggle').isVisible()){
     await tab.locator('header > .header-container .mobile-toggle').click();
     assert.equal(await tab.locator('.mobile-nav-link').count(),7);
     await tab.locator('.mobile-nav-link').nth(1).click();await tab.locator('.catalog-page').waitFor();
    }
    assert(await tab.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));zoom.push({factor,...metrics});
   }finally{
    await context.close();
    if(path.dirname(path.resolve(root))!==tempRoot||!path.basename(root).startsWith('header-zoom-'))throw Error('Unsafe QA cleanup path');
    fs.rmSync(root,{recursive:true,force:true});
   }
  }
 }
 assert.deepEqual(errors,[]);
 const result={engine,base,profile,headerSamples:samples.length,drawer,heroHeights,mutations,coldLoads,zoom,errors,status:'passed'};
 fs.writeFileSync(`.temp/interactions-${engine}.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
