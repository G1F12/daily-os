import {test,expect} from '@playwright/test';
import {boot,state,noOverflow,tab} from './helpers';

async function more(page:import('@playwright/test').Page){await tab(page,'Today');await page.getByRole('button',{name:'More →'}).click();await expect(page.getByRole('heading',{name:'More',exact:true})).toBeVisible();}
async function module(page:import('@playwright/test').Page,name:string){await more(page);await page.locator('.module-menu-item').filter({hasText:name}).click();await expect(page.getByRole('heading',{name,exact:true,level:1})).toBeVisible();}

test('Ideas CRUD and one-time conversion preserve original routines',async({page})=>{
 await boot(page);const initial=await state(page);await module(page,'Ideas');
 await page.getByRole('button',{name:'+ Add idea'}).click();await page.getByRole('dialog').getByLabel('Title').fill('Build a reading app');await page.getByRole('dialog').getByLabel('Description').fill('An offline reader');await page.getByRole('button',{name:'Save idea'}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.locator('.module-entry')).toContainText('Build a reading app');
 await page.getByRole('button',{name:'+ Task'}).click();const recorded=await state(page);expect(recorded.modules.ideas).toHaveLength(1);expect(recorded.life.actions.filter((a:any)=>a.title==='Build a reading app')).toHaveLength(1);expect(recorded.days).toEqual(initial.days);
 await page.reload();await module(page,'Ideas');await expect(page.locator('.module-entry')).toContainText('Build a reading app');await noOverflow(page);
});

test('Wishlist Money purchase confirmation creates exactly one Shopping transaction',async({page})=>{
 await boot(page);await module(page,'Wishlist');await page.getByRole('button',{name:'+ Add item'}).click();
 const d=page.getByRole('dialog');await d.getByLabel('Item').fill('Manga vol 1');await d.getByLabel('Estimated price').fill('24,90');await d.getByLabel('Product link').fill('https://example.com/manga');await d.getByRole('button',{name:'Save item'}).click();
 await page.getByRole('button',{name:'Bought'}).click();await page.getByRole('button',{name:'Mark + Money expense'}).click();await expect(page.locator('.module-entry')).toContainText('Manga vol 1 ✓');
 let saved=await state(page);expect(saved.money.transactions.filter((x:any)=>x.title==='Manga vol 1')).toHaveLength(1);expect(saved.money.transactions.at(-1).amountMinor).toBe(2490);
 await page.reload();saved=await state(page);expect(saved.money.transactions.filter((x:any)=>x.title==='Manga vol 1')).toHaveLength(1);await noOverflow(page);
});

test('Nutrition manual meals and saved dish survive reload',async({page})=>{
 await boot(page);await module(page,'Nutrition');await page.getByRole('button',{name:'+ Log meal'}).click();const d=page.getByRole('dialog');await d.getByLabel('Food / dish').fill('Rice bowl');await d.getByLabel('Portion / amount').fill('One bowl');await d.getByLabel('Calories').fill('500');await d.getByRole('button',{name:'Save meal'}).click();
 await expect(page.locator('.module-entry')).toContainText('Rice bowl');await page.getByRole('button',{name:'Save dish'}).click();await expect(page.getByText('Saved dishes',{exact:true})).toBeVisible();
 await page.reload();const saved=await state(page);expect(saved.modules.meals).toHaveLength(1);expect(saved.modules.mealTemplates).toHaveLength(1);await noOverflow(page);
});

test('Time Tracking active timer persists on PWA reload, pause/stop records time',async({page})=>{
 await boot(page);await module(page,'Time Tracking');await page.getByRole('button',{name:'Start timer'}).click();await expect(page.getByRole('button',{name:'Pause'})).toBeVisible();
 await page.reload();await module(page,'Time Tracking');await expect(page.getByRole('button',{name:'Pause'})).toBeVisible();
 await page.clock.setFixedTime(new Date('2026-10-07T10:30:00Z'));await page.getByRole('button',{name:'Pause'}).click();await expect(page.getByRole('button',{name:'Resume'})).toBeVisible();
 await page.getByRole('button',{name:'Stop & save'}).click();const saved=await state(page);expect(saved.modules.activeTimer).toBeUndefined();expect(saved.modules.sessions.length).toBe(1);expect(saved.modules.sessions[0].seconds).toBe(1800);await noOverflow(page);
});
