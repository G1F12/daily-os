import {test,expect} from '@playwright/test';
import {boot,tab,weigh,rest,allDone,noOverflow,fixedTime} from './helpers';
import {testServer} from '../scripts/test-server.mjs';
import {mkdtemp,cp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
test('mobile visual baselines: ten key states',async({page,context},info)=>{
 test.skip(info.project.name!=='iphone-390','Three viewports are covered by interaction/overflow tests; visual reference uses 390 × 844.');
 const dir=await mkdtemp(join(tmpdir(),'daily-os-update-'));const server=await testServer('dist');
 try{await page.clock.setFixedTime(fixedTime);await page.goto(server.url);await page.evaluate(()=>navigator.serviceWorker.ready);await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);await weigh(page,'76.7');
 const snap=async(name:string)=>{await noOverflow(page);await expect(page).toHaveScreenshot(name+'.png',{fullPage:name!=='weight-modal'});};
 await tab(page,'Settings');await page.getByLabel('Appearance').selectOption('dark');await tab(page,'Today');await snap('today-dark');await tab(page,'Progress');await snap('progress-dark');
 await tab(page,'Settings');await page.getByLabel('Appearance').selectOption('light');await tab(page,'Today');await snap('today-light');await tab(page,'Progress');await snap('progress-light');await tab(page,'History');await snap('history');await tab(page,'Settings');await snap('settings');
 await tab(page,'Today');await page.locator('.task').filter({hasText:'Weight'}).click();await snap('weight-modal');await page.getByRole('button',{name:'Close dialog'}).click();await allDone(page);await expect(page.locator('.undo-toast')).toHaveCount(0,{timeout:10000});await snap('complete');await rest(page);await snap('rest-day');
 await cp('dist',dir,{recursive:true});const sw=await readFile(join(dir,'sw.js'),'utf8');await writeFile(join(dir,'sw.js'),sw+'\n// browser regression update fixture\n');server.setRoot(dir);await page.evaluate(async()=>{await(await navigator.serviceWorker.getRegistration())!.update()});await expect(page.getByText('Update available',{exact:true})).toBeVisible();await snap('update-available');await page.getByRole('button',{name:'Later',exact:true}).click();await expect(page.getByText('Update available',{exact:true})).toHaveCount(0);await page.reload();await expect(page.getByText('Update available',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Reload',exact:true}).click();await expect(page.locator('.hero-label')).toHaveText('REST DAY');await expect(page.getByText('Update available',{exact:true})).toHaveCount(0);
 }finally{await context.setOffline(false);await server.close();await rm(dir,{recursive:true,force:true});}
});
