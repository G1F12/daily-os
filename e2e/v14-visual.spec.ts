import {test,expect} from '@playwright/test';
import {boot,tab,state,noOverflow} from './helpers';
import {defaults,ensureDays,saveWeight,setCompletion,setRestDay} from '../src/model';
import {addAction,toggleAction} from '../src/life';
import {setStartingBalance,saveTransaction} from '../src/money';
test('Life School Review visual references in both themes',async({page})=>{
 await boot(page);const s=defaults('2026-09-28');ensureDays(s,'2026-10-07');
 saveWeight(s,76.2,'2026-09-28');saveWeight(s,76.8,'2026-10-04');saveWeight(s,77,'2026-10-07');
 for(const d of ['2026-09-28','2026-09-30'])for(const t of s.days[d].taskSnapshot.filter(t=>t.type==='checkbox'))setCompletion(s,t.id,true,d);setRestDay(s,true,'2026-09-29');
 setStartingBalance(s,100000);const stamp='2026-10-01T10:00:00.000Z';for(const [id,type,amountMinor,title] of [['expense','expense',2490,'Lunch'],['income','income',20000,'Sale']] as const)saveTransaction(s,{id,type,amountMinor,title,category:type==='expense'?'Food':'Income',date:'2026-10-01',createdAt:stamp,updatedAt:stamp});
 addAction(s,{kind:'personal',title:'Collect package',priority:'high',dueDate:'2026-10-07'});addAction(s,{kind:'personal',title:'Book appointment',priority:'medium',dueDate:'2026-10-09'});
 for(const [title,schoolType,dueDate] of [['Math exercises','homework','2026-10-06'],['Physics test','test','2026-10-09'],['English project','project','2026-10-12']] as const)addAction(s,{kind:'school',title,schoolType,dueDate,priority:'high',subject:schoolType==='test'?'Physics':schoolType==='project'?'English':'Mathematics'});
 addAction(s,{kind:'personal',title:'Completed last week',priority:'low'},stamp);toggleAction(s,s.life!.actions.at(-1)!.id,true,stamp);
 const before=await state(page);s.quoteHistory=before.quoteHistory;s.lastOpeningDate=before.lastOpeningDate;
 await page.evaluate(value=>new Promise<void>((resolve,reject)=>{const r=indexedDB.open('daily-os',1);r.onsuccess=()=>{const db=r.result,tx=db.transaction('state','readwrite');tx.objectStore('state').put(value,'main');tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)}}),s);await page.reload();await expect(page.getByTestId('daily-quote')).toBeVisible();
 for(const theme of ['dark','light']){
  await tab(page,'Settings');await page.getByLabel('Appearance').selectOption(theme);await tab(page,'Today');await page.locator('details.life-review summary').click();await noOverflow(page);await expect(page).toHaveScreenshot('life-today-'+theme+'.png',{fullPage:true});
  await page.getByRole('button',{name:'Open School'}).click();await noOverflow(page);await expect(page).toHaveScreenshot('school-'+theme+'.png',{fullPage:true});
  await page.getByRole('button',{name:'+ Add',exact:true}).click();await noOverflow(page);await expect(page).toHaveScreenshot('school-form-'+theme+'.png',{fullPage:false});await page.getByRole('button',{name:'Close dialog'}).click();
  await tab(page,'Progress');await noOverflow(page);await expect(page).toHaveScreenshot('weekly-report-'+theme+'.png',{fullPage:true});
 }
});
