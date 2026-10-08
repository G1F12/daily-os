import type {State} from './model';
import {localDate,shiftDate} from './model';
import {saveTransaction} from './money';
import {addAction} from './life';

export type IdeaStatus='New'|'Researching'|'Active'|'Completed'|'Archived';
export type Complexity='low'|'medium'|'high';
export type Priority='low'|'medium'|'high';
export interface Idea {id:string;title:string;description:string;category:string;status:IdeaStatus;complexity:Complexity;potential:Priority;createdAt:string;updatedAt:string;linkedActionId?:string}
export interface Wish {id:string;title:string;priceMinor:number|null;url:string;category:string;priority:Priority;note:string;createdAt:string;updatedAt:string;purchasedAt?:string;expenseId?:string}
export type MealType='Breakfast'|'Lunch'|'Dinner'|'Snack';
export interface Macros {calories?:number;protein?:number;fat?:number;carbs?:number}
export interface Meal {id:string;date:string;type:MealType;name:string;portion:string;macros:Macros;createdAt:string;updatedAt:string}
export interface MealTemplate {id:string;name:string;portion:string;macros:Macros}
export interface Segment {start:string;end:string}
export interface TimeSession {id:string;category:string;note:string;date:string;seconds:number;createdAt:string;updatedAt:string;segments?:Segment[]}
export interface ActiveTimer {id:string;category:string;note:string;startedAt:string;segments:Segment[];runningSince?:string}
export interface ModulesData {ideas:Idea[];wishlist:Wish[];meals:Meal[];mealTemplates:MealTemplate[];sessions:TimeSession[];activeTimer?:ActiveTimer}
export const emptyModules=():ModulesData=>({ideas:[],wishlist:[],meals:[],mealTemplates:[],sessions:[]});
export const timeCategories=['Study','Coding','Work','Training','Gaming','Reading','Other'] as const;
const dateOK=(v:unknown):v is string=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&v>='2000-01-01'&&v<='2100-12-31'&&Number.isFinite(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
const stamp=(v:unknown):v is string=>typeof v==='string'&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString()===v;
const idOK=(x:unknown):x is string=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(x);
const field=(x:unknown,max=150,required=true):x is string=>typeof x==='string'&&x.length<=max&&(!required||x.trim().length>0);
const macroOK=(m:unknown):m is Macros=>!!m&&typeof m==='object'&&!Array.isArray(m)&&Object.entries(m).every(([k,v])=>['calories','protein','fat','carbs'].includes(k)&&typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=100000&&Math.round(v*10)===v*10);
const unique=<T extends {id:string}>(a:T[])=>new Set(a.map(i=>i.id)).size===a.length;
const validIdea=(x:Idea)=>!!x&&idOK(x.id)&&field(x.title,120)&&field(x.description,3000,false)&&field(x.category,60)&&['New','Researching','Active','Completed','Archived'].includes(x.status)&&['low','medium','high'].includes(x.complexity)&&['low','medium','high'].includes(x.potential)&&stamp(x.createdAt)&&stamp(x.updatedAt)&&x.updatedAt>=x.createdAt&&(x.linkedActionId===undefined||idOK(x.linkedActionId));
const wishOK=(x:Wish)=>!!x&&idOK(x.id)&&field(x.title,120)&&(x.priceMinor===null||(Number.isSafeInteger(x.priceMinor)&&x.priceMinor>=0&&x.priceMinor<=10_000_000_000))&&field(x.url,1200,false)&&(!x.url||/^https?:\/\/[^\s/]+(?:\/[^\s]*)?$/i.test(x.url))&&field(x.category,60)&&['low','medium','high'].includes(x.priority)&&field(x.note,1200,false)&&stamp(x.createdAt)&&stamp(x.updatedAt)&&x.updatedAt>=x.createdAt&&(x.purchasedAt===undefined||stamp(x.purchasedAt))&&(x.expenseId===undefined||idOK(x.expenseId))&&(!x.expenseId||!!x.purchasedAt);
const mealOK=(x:Meal)=>!!x&&idOK(x.id)&&dateOK(x.date)&&['Breakfast','Lunch','Dinner','Snack'].includes(x.type)&&field(x.name,120)&&field(x.portion,100,false)&&macroOK(x.macros)&&stamp(x.createdAt)&&stamp(x.updatedAt)&&x.updatedAt>=x.createdAt;
const templateOK=(x:MealTemplate)=>!!x&&idOK(x.id)&&field(x.name,120)&&field(x.portion,100,false)&&macroOK(x.macros);
const segOK=(x:Segment)=>!!x&&stamp(x.start)&&stamp(x.end)&&x.end>=x.start;
const sessionOK=(x:TimeSession)=>!!x&&idOK(x.id)&&field(x.category,60)&&field(x.note,300,false)&&dateOK(x.date)&&Number.isSafeInteger(x.seconds)&&x.seconds>0&&x.seconds<=7*86400&&stamp(x.createdAt)&&stamp(x.updatedAt)&&x.updatedAt>=x.createdAt&&(x.segments===undefined||(Array.isArray(x.segments)&&x.segments.length<=200&&x.segments.every(segOK)&&x.segments.every((seg,i)=>i===0||seg.start>=x.segments![i-1].end)&&x.segments.reduce((n,s)=>n+Math.max(0,Math.floor((Date.parse(s.end)-Date.parse(s.start))/1000)),0)===x.seconds));
const activeOK=(x:ActiveTimer)=>!!x&&idOK(x.id)&&field(x.category,60)&&field(x.note,300,false)&&stamp(x.startedAt)&&Array.isArray(x.segments)&&x.segments.length<=200&&x.segments.every(segOK)&&x.segments.every((seg,i)=>i===0||seg.start>=x.segments[i-1].end)&&(!x.segments.length||x.segments[0].start>=x.startedAt)&&(x.runningSince===undefined||(stamp(x.runningSince)&&x.runningSince>=x.startedAt&&(!x.segments.length||x.runningSince>=x.segments.at(-1)!.end)));
export function validateModules(value:unknown):ModulesData {
 const m=value as ModulesData;
 if(!m||!Array.isArray(m.ideas)||m.ideas.length>3000||!Array.isArray(m.wishlist)||m.wishlist.length>3000||!Array.isArray(m.meals)||m.meals.length>30000||!Array.isArray(m.mealTemplates)||m.mealTemplates.length>1000||!Array.isArray(m.sessions)||m.sessions.length>30000||!m.ideas.every(validIdea)||!m.wishlist.every(wishOK)||!m.meals.every(mealOK)||!m.mealTemplates.every(templateOK)||!m.sessions.every(sessionOK)||![m.ideas,m.wishlist,m.meals,m.mealTemplates,m.sessions].every(arr=>unique(arr as {id:string}[]))||(m.activeTimer!==undefined&&!activeOK(m.activeTimer)))throw new Error('Invalid Ideas, Wishlist, Nutrition or Time Tracking data in backup.');
 const ids=new Set([...m.ideas,...m.wishlist,...m.meals,...m.mealTemplates,...m.sessions,...(m.activeTimer?[m.activeTimer]:[])].map(x=>x.id));
 const total=m.ideas.length+m.wishlist.length+m.meals.length+m.mealTemplates.length+m.sessions.length+(m.activeTimer?1:0);
 if(ids.size!==total)throw new Error('Duplicate module IDs.');
 const cleanMacros=(x:Macros):Macros=>Object.fromEntries(Object.entries(x).filter(([k])=>['calories','protein','fat','carbs'].includes(k)));
 return {
 ideas:m.ideas.map(x=>({id:x.id,title:x.title,description:x.description,category:x.category,status:x.status,complexity:x.complexity,potential:x.potential,createdAt:x.createdAt,updatedAt:x.updatedAt,...(x.linkedActionId?{linkedActionId:x.linkedActionId}:{})})),
 wishlist:m.wishlist.map(x=>({id:x.id,title:x.title,priceMinor:x.priceMinor,url:x.url,category:x.category,priority:x.priority,note:x.note,createdAt:x.createdAt,updatedAt:x.updatedAt,...(x.purchasedAt?{purchasedAt:x.purchasedAt}:{}),...(x.expenseId?{expenseId:x.expenseId}:{})})),
 meals:m.meals.map(x=>({id:x.id,date:x.date,type:x.type,name:x.name,portion:x.portion,macros:cleanMacros(x.macros),createdAt:x.createdAt,updatedAt:x.updatedAt})),
 mealTemplates:m.mealTemplates.map(x=>({id:x.id,name:x.name,portion:x.portion,macros:cleanMacros(x.macros)})),
 sessions:m.sessions.map(x=>({id:x.id,category:x.category,note:x.note,date:x.date,seconds:x.seconds,createdAt:x.createdAt,updatedAt:x.updatedAt,...(x.segments?{segments:x.segments.map(y=>({start:y.start,end:y.end}))}:{})})),
 ...(m.activeTimer?{activeTimer:{id:m.activeTimer.id,category:m.activeTimer.category,note:m.activeTimer.note,startedAt:m.activeTimer.startedAt,segments:m.activeTimer.segments.map(y=>({start:y.start,end:y.end})),...(m.activeTimer.runningSince?{runningSince:m.activeTimer.runningSince}:{})}}:{})
 };
}
const iso=()=>new Date().toISOString();
const makeId=()=>crypto.randomUUID();
const get=(s:State)=>(s.modules??=emptyModules());
export function saveIdea(s:State,data:Pick<Idea,'title'|'description'|'category'|'status'|'complexity'|'potential'>,id?:string,now=iso()){
 const m=get(s);const prev=id?m.ideas.find(x=>x.id===id):undefined;if(id&&!prev)throw new Error('Idea not found.');if(!prev&&m.ideas.length>=3000)throw new Error('Idea limit reached.');const v:Idea={...data,id:prev?.id??makeId(),createdAt:prev?.createdAt??now,updatedAt:now,...(prev?.linkedActionId?{linkedActionId:prev.linkedActionId}:{})};if(!validIdea(v))throw new Error('Check idea fields.');m.ideas=id?m.ideas.map(x=>x.id===id?v:x):[v,...m.ideas];return s;
}
export function deleteIdea(s:State,id:string){get(s).ideas=get(s).ideas.filter(x=>x.id!==id);return s;}
export function ideaToTask(s:State,id:string){const idea=get(s).ideas.find(x=>x.id===id);if(!idea)throw new Error('Idea not found.');if(idea.linkedActionId&&s.life?.actions.some(x=>x.id===idea.linkedActionId))throw new Error('Already linked to a one-time task.');addAction(s,{kind:'personal',title:idea.title.slice(0,100),priority:idea.potential,note:idea.description.slice(0,500)});idea.linkedActionId=s.life!.actions.at(-1)!.id;idea.updatedAt=iso();return s;}
export function saveWish(s:State,data:Pick<Wish,'title'|'priceMinor'|'url'|'category'|'priority'|'note'>,id?:string,now=iso()){
 const m=get(s),prev=id?m.wishlist.find(x=>x.id===id):undefined;if(id&&!prev)throw new Error('Wish not found.');if(!prev&&m.wishlist.length>=3000)throw new Error('Wishlist limit reached.');const w:Wish={...data,id:prev?.id??makeId(),createdAt:prev?.createdAt??now,updatedAt:now,...(prev?.purchasedAt?{purchasedAt:prev.purchasedAt}:{}),...(prev?.expenseId?{expenseId:prev.expenseId}:{})};if(!wishOK(w))throw new Error('Check wishlist fields and URL.');m.wishlist=id?m.wishlist.map(x=>x.id===id?w:x):[w,...m.wishlist];return s;
}
export function deleteWish(s:State,id:string){get(s).wishlist=get(s).wishlist.filter(x=>x.id!==id);return s;}
export function markWishPurchased(s:State,id:string,addExpense:boolean,date=localDate(),now=iso()){
 const w=get(s).wishlist.find(x=>x.id===id);if(!w)throw new Error('Wish not found.');if(w.purchasedAt)throw new Error('Already marked purchased.');if(addExpense){if(w.priceMinor===null||w.priceMinor<=0)throw new Error('Set a positive price to record an expense.');const expenseId=makeId();saveTransaction(s,{id:expenseId,type:'expense',amountMinor:w.priceMinor,title:w.title,category:'Shopping',date,createdAt:now,updatedAt:now});w.expenseId=expenseId;}w.purchasedAt=now;w.updatedAt=now;return s;
}
export function saveMeal(s:State,data:Pick<Meal,'date'|'type'|'name'|'portion'|'macros'>,id?:string,now=iso()){
 const m=get(s),prev=id?m.meals.find(x=>x.id===id):undefined;if(id&&!prev)throw new Error('Meal not found.');if(!prev&&m.meals.length>=30000)throw new Error('Meal limit reached.');const meal={...data,id:prev?.id??makeId(),createdAt:prev?.createdAt??now,updatedAt:now};if(!mealOK(meal))throw new Error('Check meal date, portion or nutrition values.');m.meals=id?m.meals.map(x=>x.id===id?meal:x):[meal,...m.meals];return s;
}
export function deleteMeal(s:State,id:string){get(s).meals=get(s).meals.filter(x=>x.id!==id);return s;}
export function saveMealTemplate(s:State,id:string){const m=get(s),meal=m.meals.find(x=>x.id===id);if(!meal)throw new Error('Meal not found.');if(m.mealTemplates.length>=1000)throw new Error('Saved dishes limit reached.');const t={id:makeId(),name:meal.name,portion:meal.portion,macros:{...meal.macros}};if(!templateOK(t))throw new Error('Invalid meal template.');m.mealTemplates.push(t);return s;}
export function deleteMealTemplate(s:State,id:string){get(s).mealTemplates=get(s).mealTemplates.filter(x=>x.id!==id);return s;}
export function nutritionTotals(s:State,date:string){const meals=s.modules?.meals.filter(x=>x.date===date)??[];const keys=['calories','protein','fat','carbs'] as const;const totals:Macros={};for(const key of keys){const values=meals.map(m=>m.macros[key]).filter((v):v is number=>v!==undefined);if(values.length)(totals as Record<string,number>)[key]=Math.round(values.reduce((a,b)=>a+b,0)*10)/10;}return {count:meals.length,totals,incomplete:meals.some(m=>keys.some(k=>m.macros[k]===undefined))};}
const secondsBetween=(a:string,b:string)=>Math.max(0,Math.floor((Date.parse(b)-Date.parse(a))/1000));
export function activeSeconds(active:ActiveTimer,now=iso()){return active.segments.reduce((n,seg)=>n+secondsBetween(seg.start,seg.end),0)+(active.runningSince?secondsBetween(active.runningSince,now):0);}
export function startTimer(s:State,category:string,note='',now=iso()){
 const m=get(s);if(m.activeTimer)throw new Error('Finish the current timer first.');const t={id:makeId(),category,note,startedAt:now,segments:[],runningSince:now};if(!activeOK(t))throw new Error('Invalid timer.');m.activeTimer=t;return s;
}
export function pauseTimer(s:State,now=iso()){
 const a=get(s).activeTimer;if(!a?.runningSince)throw new Error('Timer is not running.');if(Date.parse(now)<Date.parse(a.runningSince))throw new Error('Device clock moved backwards.');a.segments.push({start:a.runningSince,end:now});delete a.runningSince;return s;
}
export function resumeTimer(s:State,now=iso()){
 const a=get(s).activeTimer;if(!a||a.runningSince)throw new Error('Timer cannot resume.');if(a.segments.length&&now<a.segments.at(-1)!.end)throw new Error('Device clock moved backwards.');a.runningSince=now;return s;
}
export function stopTimer(s:State,now=iso()){
 const m=get(s),a=m.activeTimer;if(!a)throw new Error('No active timer.');if(a.runningSince){if(now<a.runningSince)throw new Error('Device clock moved backwards.');a.segments.push({start:a.runningSince,end:now});}const sec=a.segments.reduce((n,seg)=>n+secondsBetween(seg.start,seg.end),0);if(sec>7*86400)throw new Error('Timer exceeded seven days; pause and record time in smaller sessions.');if(sec>0){if(m.sessions.length>=30000)throw new Error('Time history limit reached.');m.sessions.push({id:a.id,category:a.category,note:a.note,date:localDate(new Date(a.startedAt)),seconds:sec,createdAt:a.startedAt,updatedAt:now,segments:a.segments});}delete m.activeTimer;return s;
}
export function discardTimer(s:State){delete get(s).activeTimer;return s;}
export function manualSession(s:State,date:string,category:string,minutes:number,note='',now=iso()){
 const m=get(s);const v={id:makeId(),date,category,note,seconds:Math.round(minutes*60),createdAt:now,updatedAt:now};if(!sessionOK(v))throw new Error('Enter between 1 minute and 168 hours.');if(m.sessions.length>=30000)throw new Error('Time history limit reached.');m.sessions.push(v);return s;
}
export function deleteSession(s:State,id:string){get(s).sessions=get(s).sessions.filter(x=>x.id!==id);return s;}
// Allocate a running segment to Warsaw-local dates, including DST changes and midnight crossings.
export function timeByDate(s:State,start:string,end:string){const totals:Record<string,Record<string,number>>={};const add=(date:string,cat:string,n:number)=>{if(date<start||date>end||n<=0)return;totals[date]??={};totals[date][cat]=(totals[date][cat]??0)+n;};
 for(const item of s.modules?.sessions??[]){if(!item.segments?.length){add(item.date,item.category,item.seconds);continue;}
  for(const seg of item.segments){let p=Date.parse(seg.start),limit=Date.parse(seg.end);let loops=0;while(p<limit&&loops++<10){const d=localDate(new Date(p));if(d>end)break;const nextDate=shiftDate(d,1);let lo=p,hi=Math.min(limit,p+27*3600*1000);if(localDate(new Date(hi))<nextDate){add(d,item.category,Math.floor((limit-p)/1000));break;}while(hi-lo>1){const mid=Math.floor((hi+lo)/2);if(localDate(new Date(mid))<nextDate)lo=mid;else hi=mid;}const cut=Math.min(hi,limit);add(d,item.category,Math.floor((cut-p)/1000));p=cut;}}}
 return totals;
}
export function todayTime(s:State,date=localDate()){const cats=timeByDate(s,date,date)[date]??{};return {categories:cats,seconds:Object.values(cats).reduce((n,v)=>n+v,0)};}
export function weekTime(s:State,date=localDate()){const monday=shiftDate(date,-((new Date(date+'T12:00:00Z').getUTCDay()+6)%7));const dates=timeByDate(s,monday,shiftDate(monday,6));const cats:Record<string,number>={};for(const d of Object.values(dates))for(const [k,v] of Object.entries(d))cats[k]=(cats[k]??0)+v;return {categories:cats,seconds:Object.values(cats).reduce((n,v)=>n+v,0)};}
export function updateSession(s:State,id:string,changes:{category:string;note:string;minutes?:number},now=iso()){
 const m=get(s),prev=m.sessions.find(x=>x.id===id);if(!prev)throw new Error('Time entry not found.');
 if(changes.minutes!==undefined&&prev.segments?.length)throw new Error('Tracked sessions cannot have their measured duration edited.');
 const next:TimeSession={...prev,category:changes.category,note:changes.note,updatedAt:now,...(changes.minutes!==undefined?{seconds:Math.round(changes.minutes*60)}:{})};
 if(!sessionOK(next))throw new Error('Check time entry.');m.sessions=m.sessions.map(x=>x.id===id?next:x);return s;
}
