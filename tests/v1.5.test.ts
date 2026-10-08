import assert from 'node:assert/strict';
import {test} from 'node:test';
import {defaults,exportBackup,validateBackup,migrateState,localDate,type State} from '../src/model';
import {parsePLN} from '../src/money';
import {emptyModules,saveIdea,deleteIdea,ideaToTask,saveWish,deleteWish,markWishPurchased,saveMeal,deleteMeal,saveMealTemplate,deleteMealTemplate,nutritionTotals,startTimer,pauseTimer,resumeTimer,stopTimer,discardTimer,manualSession,updateSession,deleteSession,activeSeconds,timeByDate,todayTime,weekTime,validateModules} from '../src/modules';
const clone=()=>structuredClone(defaults('2026-10-08'));
const at=(s:string)=>s;
function idea(){return {title:'Launch app',description:'Plan the launch',category:'Projects',status:'New' as const,complexity:'medium' as const,potential:'high' as const}}
function wish(){return {title:'Manga',priceMinor:parsePLN('24,90'),url:'https://example.com/book',category:'Books',priority:'high' as const,note:'Volume 1'}}
const lunch={date:'2026-10-08',type:'Lunch' as const,name:'Rice bowl',portion:'1 bowl',macros:{calories:500,protein:22,fat:10,carbs:70}};
test('v1.4 storage migration additive; no original records lost',()=>{const old=clone();old.modules=undefined;const preserved=JSON.stringify({tasks:old.tasks,days:old.days,measurements:old.measurements,life:old.life,money:old.money,quoteHistory:old.quoteHistory,settings:old.settings});const upgraded=migrateState(old);assert.deepEqual(upgraded.modules,emptyModules());assert.equal(JSON.stringify({tasks:upgraded.tasks,days:upgraded.days,measurements:upgraded.measurements,life:upgraded.life,money:upgraded.money,quoteHistory:upgraded.quoteHistory,settings:upgraded.settings}),preserved);});
test('ideas lifecycle, link only one school-independent task, and deletion',()=>{const s=clone();saveIdea(s,idea());const i=s.modules!.ideas[0];assert.equal(i.title,'Launch app');ideaToTask(s,i.id);assert.equal(s.life!.actions.length,1);assert.equal(s.life!.actions[0].kind,'personal');assert.throws(()=>ideaToTask(s,i.id),/Already linked/);saveIdea(s,{...idea(),status:'Active'},i.id);assert.equal(s.modules!.ideas[0].linkedActionId,s.life!.actions[0].id);deleteIdea(s,i.id);assert.equal(s.modules!.ideas.length,0);assert.equal(s.life!.actions.length,1);});
test('wishlist purchase posted exactly once to Money with integer grosz',()=>{const s=clone();saveWish(s,wish());const id=s.modules!.wishlist[0].id;markWishPurchased(s,id,true,'2026-10-08',at('2026-10-08T11:00:00.000Z'));assert.equal(s.money!.transactions.length,1);assert.equal(s.money!.transactions[0].amountMinor,2490);assert.equal(s.money!.transactions[0].category,'Shopping');assert.throws(()=>markWishPurchased(s,id,true),/Already/);deleteWish(s,id);assert.equal(s.money!.transactions.length,1);});
test('wishlist purchase without expense makes no Money entry; invalid URL rejected',()=>{const s=clone();saveWish(s,wish());markWishPurchased(s,s.modules!.wishlist[0].id,false);assert.equal(s.money!.transactions.length,0);assert.throws(()=>saveWish(s,{...wish(),url:'javascript:alert(1)'}),/URL/);});
test('meals and saved dish round trip, optional macros remain unknown',()=>{const s=clone();saveMeal(s,lunch);saveMeal(s,{...lunch,name:'Unmeasured snack',type:'Snack',macros:{}});let totals=nutritionTotals(s,'2026-10-08');assert.equal(totals.count,2);assert.equal(totals.totals.calories,500);assert.equal(totals.incomplete,true);saveMealTemplate(s,s.modules!.meals[0].id);assert.equal(s.modules!.mealTemplates.length,1);const id=s.modules!.meals[0].id;saveMeal(s,{...lunch,name:'Bigger bowl'},id);assert.equal(s.modules!.meals[0].name,'Bigger bowl');deleteMeal(s,id);deleteMealTemplate(s,s.modules!.mealTemplates[0].id);assert.equal(s.modules!.meals.length,1);assert.equal(s.modules!.mealTemplates.length,0);});
test('timer pause/reopen/resume yields correct exact elapsed time',()=>{const s=clone();startTimer(s,'Study','Math','2026-10-08T08:00:00.000Z');assert.equal(activeSeconds(s.modules!.activeTimer!,'2026-10-08T08:20:00.000Z'),1200);pauseTimer(s,'2026-10-08T08:20:00.000Z');assert.equal(activeSeconds(s.modules!.activeTimer!,'2026-10-08T10:20:00.000Z'),1200);const persisted=structuredClone(s);resumeTimer(persisted,'2026-10-08T10:20:00.000Z');stopTimer(persisted,'2026-10-08T10:30:00.000Z');assert.equal(persisted.modules!.sessions[0].seconds,1800);assert.equal(persisted.modules!.activeTimer,undefined);assert.equal(todayTime(persisted,'2026-10-08').seconds,1800);});
test('timer midnight split works in Warsaw',()=>{const s=clone();startTimer(s,'Coding','','2026-10-07T21:59:50.000Z');stopTimer(s,'2026-10-07T22:00:10.000Z');const times=timeByDate(s,'2026-10-07','2026-10-08');assert.equal(times['2026-10-07'].Coding,10);assert.equal(times['2026-10-08'].Coding,10);});
test('manual sessions are editable and deletable',()=>{const s=clone();manualSession(s,'2026-10-08','Reading',45,'Novel');const id=s.modules!.sessions[0].id;updateSession(s,id,{category:'Reading',note:'Manga',minutes:30});assert.equal(s.modules!.sessions[0].seconds,1800);assert.equal(s.modules!.sessions[0].note,'Manga');deleteSession(s,id);assert.equal(s.modules!.sessions.length,0);});
test('discard active timer never creates a recorded session',()=>{const s=clone();startTimer(s,'Training');discardTimer(s);assert.equal(s.modules!.activeTimer,undefined);assert.equal(s.modules!.sessions.length,0);});
test('backup v6 includes all modules; previous v5 imports safely',()=>{const s=clone();saveIdea(s,idea());saveWish(s,wish());saveMeal(s,lunch);manualSession(s,'2026-10-08','Study',90);const b=JSON.parse(exportBackup(s));assert.equal(b.version,6);const next=validateBackup(b);assert.deepEqual(next.modules,s.modules);const old=JSON.parse(exportBackup(s));old.version=5;delete old.data.modules;const previous=validateBackup(old);assert.deepEqual(previous.modules,emptyModules());assert.equal(previous.life?.subjects.length,s.life?.subjects.length);});
test('malformed v6 data rejected (atomic restore validates before writing)',()=>{const s=clone();saveWish(s,wish());const x=JSON.parse(exportBackup(s));x.data.modules.wishlist[0].url='javascript:bad';assert.throws(()=>validateBackup(x),/Invalid Ideas/);const y=JSON.parse(exportBackup(s));y.data.modules.activeTimer={id:'bad',category:'Other',note:'',startedAt:'yesterday',segments:[]};assert.throws(()=>validateBackup(y),/Invalid Ideas/);});
test('time summaries never invent missing sessions',()=>{const s=clone();assert.equal(weekTime(s,'2026-10-08').seconds,0);assert.equal(nutritionTotals(s,'2026-10-08').totals.calories,undefined);});
test('backup envelopes v1 to v6 all import with empty new modules when omitted',()=>{
 const base=clone();for(let v=1;v<=6;v++){
  const backup=JSON.parse(exportBackup(base));backup.version=v;
  if(v<6)delete backup.data.modules;
  if(v<5)delete backup.data.life;
  if(v<4)delete backup.data.money;
  if(v<3){delete backup.data.quoteHistory;delete backup.data.lastOpeningDate;}
  const restored=validateBackup(backup);
  assert.deepEqual(restored.modules,emptyModules());
  assert.equal(restored.days['2026-10-08'].date,'2026-10-08');
 }
});
test('unrecognised imported module fields are removed, not persisted',()=>{
 const state=clone();saveMeal(state,lunch);const backup=JSON.parse(exportBackup(state));backup.data.modules.meals[0].injected='not allowed';backup.data.modules.external='unknown';backup.data.modules.meals[0].macros.badValue=321;
 assert.throws(()=>validateBackup(backup),/Invalid Ideas/);
 delete backup.data.modules.meals[0].macros.badValue;
 const restored=validateBackup(backup);
 assert.equal((restored.modules as any).external,undefined);
 assert.equal((restored.modules!.meals[0] as any).injected,undefined);
});
test('Warsaw DST days allocate 23 and 25 actual hours without invented time',()=>{
 for(const [start,end,date,hours] of [['2026-03-28T23:00:00.000Z','2026-03-29T22:00:00.000Z','2026-03-29',23],['2026-10-24T22:00:00.000Z','2026-10-25T23:00:00.000Z','2026-10-25',25]] as const){const s=clone();startTimer(s,'Study','',start);stopTimer(s,end);assert.equal(todayTime(s,date).seconds,hours*3600);assert.equal(weekTime(s,date).seconds,hours*3600);assert.deepEqual(validateBackup(JSON.parse(exportBackup(s))).modules,s.modules);}
});
test('backwards clock refuses pause and resume without losing recorded segments',()=>{const s=clone();startTimer(s,'Study','','2026-10-08T10:00:00.000Z');assert.throws(()=>pauseTimer(s,'2026-10-08T09:59:59.000Z'),/backwards/);pauseTimer(s,'2026-10-08T10:10:00.000Z');assert.throws(()=>resumeTimer(s,'2026-10-08T10:09:59.000Z'),/backwards/);assert.equal(activeSeconds(s.modules!.activeTimer!),600);});
