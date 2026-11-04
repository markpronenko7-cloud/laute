// Real browser geometry checks; run against Vite or a published base URL.
// PLAYWRIGHT_MODULE_PATH points to the existing Playwright installation.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.argv[2] || 'http://127.0.0.1:4173/laute/';
const wait = page => page.waitForTimeout(1100);
async function geometry(page, locations) {
  await page.waitForFunction(()=>[...document.querySelectorAll('.leaflet-tile-loaded')].some(e=>e.naturalWidth && Math.abs(e.getBoundingClientRect().width-256)<.01),null,{timeout:20000});
  const result = await page.evaluate(locations => {
    const tiles = [...document.querySelectorAll('.leaflet-tile-loaded')].filter(e => e.naturalWidth && Math.abs(e.getBoundingClientRect().width-256)<.01);
    const tile = tiles.at(-1);
    if (!tile) return { error:'No loaded map tiles' };
    const [, z, tx, ty] = tile.src.match(/\/(\d+)\/(\d+)\/(\d+)\.png/).map(Number);
    const r = tile.getBoundingClientRect(), scale = 256 * 2 ** z;
    return [...document.querySelectorAll('.leaflet-marker-icon')].map((e, i) => {
      const { lat, lng } = locations[i], sin = Math.sin(lat * Math.PI / 180);
      const expectedX = r.left + (lng + 180) / 360 * scale - tx * 256;
      const expectedY = r.top + (.5 - Math.log((1 + sin)/(1 - sin)) / (4 * Math.PI)) * scale - ty * 256;
      const m = e.getBoundingClientRect();
      return { i, z, error:Math.hypot(m.x + m.width/2 - expectedX, m.y + m.height/2 - expectedY) };
    });
  }, locations);
  assert(Array.isArray(result), JSON.stringify(result));
  for (const item of result) assert(item.error < 2, `Marker ${item.i}, zoom ${item.z}: ${item.error}px from its geographic position`);
}
(async () => {
  const { COMPANY_BLOCKS } = await import('../src/data/factoryStory.js');
  const locations = COMPANY_BLOCKS.find(b => b.companySection === 'geography').items;
  const browser = await chromium.launch({ channel:'chrome' });
  fs.mkdirSync('.temp/company-qa-v5', { recursive:true });
  try {
    for (const mobile of [false, true]) {
      const context = await browser.newContext({viewport:mobile ? {width:390,height:844} : {width:1440,height:1000},isMobile:mobile,hasTouch:mobile});
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base);
      await page.evaluate(() => { history.pushState({},'',location.pathname.replace(/\/$/,'')+'/company'); dispatchEvent(new PopStateEvent('popstate')); });
      const minimize = page.locator('.btn-ai-minimize'); if (await minimize.isVisible()) await minimize.click();
      const triggers = page.locator('.company-process-trigger'); await triggers.first().waitFor();
      assert.equal(await triggers.count(), 7);
      // All seven independently open and close; a prior panel stays open.
      for (let i=0;i<7;i++) {
        const trigger=triggers.nth(i); await trigger.scrollIntoViewIfNeeded();
        if(await trigger.getAttribute('aria-expanded')!=='true') await trigger.click();
        await page.waitForTimeout(460);
        const panel=page.locator(`[id="${await trigger.getAttribute('aria-controls')}"]`);
        assert.equal(await panel.getAttribute('aria-hidden'),'false');
        assert(await panel.locator('.company-process-body').isVisible());
        assert.equal(await triggers.first().getAttribute('aria-expanded'),'true');
        await panel.locator('.company-media-film-trigger').click();
        const video=page.locator('dialog video'); await video.waitFor();
        await video.evaluate(v=>v.play());
        await page.waitForFunction(()=>{const v=document.querySelector('dialog video');return v?.currentTime>.1 && v.videoWidth===720;},null,{timeout:10000});
        await page.keyboard.press('Escape'); await page.waitForTimeout(240);
        assert.equal(await page.locator('dialog').count(),0);
        assert(await panel.locator('.company-media-film-trigger').evaluate(e=>e===document.activeElement));
      }
      await triggers.nth(3).focus(); await page.keyboard.press('End');
      assert(await triggers.last().evaluate(e=>e===document.activeElement));
      await page.keyboard.press('Home'); assert(await triggers.first().evaluate(e=>e===document.activeElement));
      await triggers.nth(1).click(); await page.waitForTimeout(460);
      const closed=page.locator('.company-process-reveal').nth(1);
      assert.equal(await closed.getAttribute('inert'),'');
      assert.equal(await closed.evaluate(e=>e.getBoundingClientRect().height),0);
      await page.locator('.company-process').first().screenshot({path:`.temp/company-qa-v5/production-${mobile?'mobile':'desktop'}.png`});
      console.log('media passed, moving to map'); await page.locator('.company-atlas').scrollIntoViewIfNeeded();
      await page.locator('.leaflet-tile-loaded').first().waitFor(); await wait(page);
      await geometry(page,locations); console.log('geometry passed');
      assert(await page.locator('.company-atlas-map').evaluate(map=>{
        const r=map.getBoundingClientRect();
        return [...map.querySelectorAll('.leaflet-marker-icon')].every(e=>{
          const m=e.getBoundingClientRect(),x=m.x+m.width/2,y=m.y+m.height/2;
          return x>=r.left && x<=r.right && y>=r.top && y<=r.bottom;
        });
      }), 'All locations must fit the initial overview, including mobile');
      // A city jump, repeated zoom, reset, and dragging share one projection.
      if(mobile) await page.locator('.company-atlas-select select').selectOption('0');
      else await page.locator('.company-atlas-cities button').first().click();
      await wait(page); await geometry(page,locations); console.log('geometry passed');
      const plus=page.locator('.company-atlas-controls button').nth(0),minus=page.locator('.company-atlas-controls button').nth(1);
      for(let i=0;i<4;i++) { await plus.click(); await page.waitForTimeout(300); }
      await wait(page); await geometry(page,locations); console.log('geometry passed');
      for(let i=0;i<6;i++) {await minus.click();await page.waitForTimeout(300);}
      await wait(page);await geometry(page,locations); console.log('geometry passed');
      const box=await page.locator('.company-atlas-map').boundingBox();
      await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.85,box.y+box.height*.65,{steps:15});await page.mouse.up();await wait(page);await geometry(page,locations); console.log('geometry passed');
      if(mobile) {
        const cdp=await context.newCDPSession(page);
        await cdp.send('Input.synthesizePinchGesture',{x:box.x+box.width/2,y:box.y+box.height/2,scaleFactor:1.8,gestureSourceType:'touch'});
        await wait(page);await geometry(page,locations); console.log('geometry passed');
      }
      await page.locator('.company-atlas-overview').click();await wait(page);await geometry(page,locations); console.log('geometry passed');
      await page.locator('.company-atlas-map').focus();
      for(let i=0;i<12;i++) await page.keyboard.press('ArrowRight');
      await wait(page);await geometry(page,locations);
      // Offscreen markers and tiles cannot intercept the surrounding page.
      assert(await page.locator('.company-atlas-stage').evaluate(e=>getComputedStyle(e).overflow==='hidden' && getComputedStyle(e).contain.includes('paint')));
      await page.locator('.company-atlas-overview').click();await wait(page);
      await page.locator('.company-atlas').screenshot({path:`.temp/company-qa-v5/map-${mobile?'mobile':'desktop'}.png`});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.emulateMedia({reducedMotion:'reduce'});
      assert.equal(await closed.evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
      assert.deepEqual(errors,[]);
      console.log(`${mobile?'Mobile + pinch':'Desktop'}: seven films, independent disclosure, focus, keyboard, geographic projection, zoom/pan/reset and reduced motion passed`);
      await context.close();
    }
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
