import {test,expect} from '@playwright/test';
import {testServer} from '../scripts/test-server.mjs';
import {tab,state,weigh,noOverflow} from './helpers';
test('real v1.4 IndexedDB and 52 SVG survive v1.5 SW update and offline reload',async({page,context})=>{
 const server=await testServer('.test-fixtures/v14');
 try{
  await page.clock.setFixedTime(new Date('2026-10-05T10:00:00Z'));await page.goto(server.url);await expect(page.getByTestId('daily-quote')).toBeAttached();if(await page.locator('.opening').count())await page.getByRole('button',{name:'Tap to continue'}).click();await page.evaluate(()=>navigator.serviceWorker.ready);await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
  await weigh(page,'76.8');await page.locator('.task').filter({hasText:'Omega-3'}).click();
  await page.clock.setFixedTime(new Date('2026-10-07T10:00:00Z'));await page.reload();await expect(page.getByTestId('daily-quote')).toBeAttached();if(await page.locator('.opening').count())await page.getByRole('button',{name:'Tap to continue'}).click();await weigh(page,'77.0');
  await tab(page,'Settings');await expect(page.locator('.footer-note')).toContainText('1.4.0');await page.getByRole('switch',{name:'Enable weight goal',exact:true}).click();await page.getByLabel('Target weight in kilograms').fill('80');await page.getByRole('button',{name:'Save goal'}).click();await page.getByLabel('Appearance').selectOption('dark');
  await tab(page,'Money');await page.getByRole('button',{name:'Set starting balance',exact:true}).click();await page.getByLabel('Starting balance (zł)').fill('1000');await page.getByRole('button',{name:'Save starting balance'}).click();
  for(const [type,amount,title] of [['Expense','24.90','Lunch'],['Income','200','Sale']]){await page.getByRole('button',{name:new RegExp(type)}).click();await page.getByLabel('Amount (zł)').fill(amount);await page.getByLabel(type==='Expense'?'What for?':'From what?').fill(title);await page.getByRole('button',{name:'Save transaction'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);}
  await expect(page.locator('.money-balance')).toContainText('1,175.10');const before=await state(page);expect(before.life).toBeDefined();expect(Object.keys(before.quoteHistory).length).toBeGreaterThanOrEqual(2);const oldAsset=await page.locator('script[type="module"]').getAttribute('src');
  server.setRoot('dist');await page.evaluate(async()=>{await(await navigator.serviceWorker.getRegistration())!.update()});await expect(page.getByText('Update available',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Reload',exact:true}).click();await expect(page.getByTestId('daily-quote')).toBeVisible();await expect(page.locator('.opening')).toHaveCount(0);
  for(const key of Object.keys(before))expect((await state(page))[key]).toEqual(before[key]);expect((await state(page)).life.actions).toEqual([]);
  const cached=await page.evaluate(async asset=>({old:!!await caches.match(asset!),visuals:(await Promise.all((await caches.keys()).map(async key=>(await(await caches.open(key)).keys()).filter(r=>new URL(r.url).pathname.startsWith('/visuals/')).map(r=>r.url)))).flat()}),oldAsset);expect(cached.old).toBe(true);expect(new Set(cached.visuals).size).toBe(52);
  await context.setOffline(true);await page.reload();await expect(page.getByTestId('daily-quote')).toBeVisible();for(const key of Object.keys(before))expect((await state(page))[key]).toEqual(before[key]);await tab(page,'Settings');await expect(page.locator('.footer-note')).toContainText('1.5.0');await noOverflow(page);
 }finally{await context.setOffline(false);await server.close()}
});
