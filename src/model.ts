import {emptyModules,validateModules,type ModulesData} from './modules';
import {defaultLife,validateLife,type LifeData} from './life';
import { emptyMoney, validateMoney, type Money } from './money';
export type Period = 'Morning' | 'Afternoon' | 'Evening' | 'Anytime';
export interface Task { id: string; title: string; period: Period; daysOfWeek: number[]; enabled: boolean; type: 'checkbox' | 'weight'; role?: 'gym' }
export interface DailyRecord { date: string; completedTaskIds: string[]; taskSnapshot: Task[]; completionPercent: number; restDay?: boolean }
export interface Measurement { date: string; kind: 'weight'; value: number; unit: 'kg' }
export interface WeightGoal { enabled: boolean; start: number; target: number; createdAt: string }
export interface QuoteHistoryEntry { quoteId:string; visualId:string }
export interface State { modules?:ModulesData; life?:LifeData; money?:Money; quoteHistory?:Record<string,QuoteHistoryEntry>; lastOpeningDate?:string; schemaVersion: 1; startedOn: string; tasks: Task[]; days: Record<string, DailyRecord>; measurements: Measurement[]; settings: { timezone: 'Europe/Warsaw'; weightUnit: 'kg'; theme: 'system' | 'light' | 'dark'; lastExportAt?: string; weightGoal?: WeightGoal } }
export const weekLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
export function localDate(now = new Date()) { const p = new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Warsaw',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now); return `${p.find(x=>x.type==='year')!.value}-${p.find(x=>x.type==='month')!.value}-${p.find(x=>x.type==='day')!.value}`; }
export function shiftDate(date:string, n:number) { const d = new Date(date+'T12:00:00Z'); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); }
export function weekday(date:string) { return (new Date(date+'T12:00:00Z').getUTCDay()+6)%7; }
export function displayDate(date:string, opts:Intl.DateTimeFormatOptions = {month:'long',day:'numeric'}) { return new Intl.DateTimeFormat('en-US',{...opts,timeZone:'UTC'}).format(new Date(date+'T12:00:00Z')); }
const every = [0,1,2,3,4,5,6];
export function defaults(date=localDate()):State { const tasks:Task[] = [
 {id:'face-am',title:'Wash face',period:'Morning',daysOfWeek:every,enabled:true,type:'checkbox'},
 {id:'weight',title:'Weight',period:'Morning',daysOfWeek:every,enabled:true,type:'weight'},
 {id:'omega',title:'Omega-3',period:'Morning',daysOfWeek:every,enabled:true,type:'checkbox'},
 {id:'vitamin-d',title:'Vitamin D',period:'Morning',daysOfWeek:every,enabled:true,type:'checkbox'},
 {id:'zinc',title:'Zinc',period:'Afternoon',daysOfWeek:every,enabled:true,type:'checkbox'},
 {id:'face-pm',title:'Wash face',period:'Evening',daysOfWeek:every,enabled:true,type:'checkbox'},
 {id:'magnesium',title:'Magnesium',period:'Evening',daysOfWeek:every,enabled:true,type:'checkbox'},
 {id:'gym',title:'Gym',period:'Anytime',daysOfWeek:[1,3,5],enabled:true,type:'checkbox',role:'gym'}];
 return ensureDays({schemaVersion:1,startedOn:date,tasks,days:{},measurements:[],settings:{timezone:'Europe/Warsaw',weightUnit:'kg',theme:'system'},money:emptyMoney(),life:defaultLife(),modules:emptyModules(),quoteHistory:{}},date); }
export function tasksOn(tasks:Task[],date:string) { return tasks.filter(t=>t.enabled && t.daysOfWeek.includes(weekday(date))).map(t=>({...t,daysOfWeek:[...t.daysOfWeek]})); }
export function ensureDays(s:State,date=localDate()):State { const latest = Object.keys(s.days).sort().at(-1); let next = latest ? shiftDate(latest,1) : s.startedOn; while(next<=date) { s.days[next]={date:next,completedTaskIds:[],taskSnapshot:tasksOn(s.tasks,next),completionPercent:0}; next=shiftDate(next,1); } return s; }
export function percent(r:DailyRecord) { return r.taskSnapshot.length ? Math.round(r.completedTaskIds.length/r.taskSnapshot.length*100) : 0; }
export function isComplete(r?:DailyRecord) { return !!r && !r.restDay && r.taskSnapshot.length>0 && r.completedTaskIds.length===r.taskSnapshot.length; }
export function toggle(s:State,id:string,date=localDate()) { ensureDays(s,date); const r=s.days[date]; const task=r?.taskSnapshot.find(t=>t.id===id); if(!task || task.type==='weight') throw new Error('Task not available today.'); r.completedTaskIds=r.completedTaskIds.includes(id)?r.completedTaskIds.filter(x=>x!==id):[...r.completedTaskIds,id]; r.completionPercent=percent(r); return s; }
export function saveWeight(s:State,value:number,date=localDate()) { if(!Number.isFinite(value)||value<1||value>500) throw new Error('Enter a weight between 1 and 500 kg.'); ensureDays(s,date); value=Math.round(value*100)/100; s.measurements=s.measurements.filter(m=>m.date!==date||m.kind!=='weight'); s.measurements.push({date,kind:'weight',value,unit:'kg'}); s.measurements.sort((a,b)=>a.date.localeCompare(b.date)); const r=s.days[date]; for(const t of r.taskSnapshot.filter(t=>t.type==='weight')) if(!r.completedTaskIds.includes(t.id)) r.completedTaskIds.push(t.id); r.completionPercent=percent(r); return s; }
export function weightOn(s:State,date:string) { return s.measurements.find(m=>m.date===date&&m.kind==='weight')?.value; }
export function streaks(s:State,today=localDate()) {
 let best=0,run=0,previous='';
 for(const date of Object.keys(s.days).filter(d=>d<=today).sort()) {
  if(previous&&shiftDate(previous,1)!==date)run=0;
  const r=s.days[date];if(isComplete(r))run++;else if(!r.restDay)run=0;
  best=Math.max(best,run);previous=date;
 }
 let date=today,current=0;
 // An unfinished today is allowed; past unfinished days break the series.
 if(!isComplete(s.days[date])&&!s.days[date]?.restDay)date=shiftDate(date,-1);
 while(s.days[date]){const r=s.days[date];if(isComplete(r))current++;else if(!r.restDay)break;date=shiftDate(date,-1);}
 return {current,best};
}
export function weekStats(s:State,today=localDate()) { const monday=shiftDate(today,-weekday(today)); const dates=Array.from({length:7},(_,i)=>shiftDate(monday,i)); const elapsed=dates.filter(d=>d<=today); let done=0,total=0; for(const d of elapsed){ const r=s.days[d]; if(r&&!r.restDay){done+=r.completedTaskIds.length;total+=r.taskSnapshot.length;} } return {dates,percent:total?Math.round(done/total*100):0,done,total,completed:elapsed.filter(d=>isComplete(s.days[d])).length}; }
export type GraphPeriod = '7D' | '30D' | '90D' | '6M' | '1Y' | 'ALL';
export function graphRecords(s:State,period:GraphPeriod,today=localDate()) { const start=period==='ALL'?s.startedOn:period==='6M'?shiftMonths(today,-6):period==='1Y'?shiftMonths(today,-12):shiftDate(today,-(Number(period.slice(0,-1))-1)); return s.measurements.filter(m=>m.kind==='weight'&&m.date>=start&&m.date<=today).sort((a,b)=>a.date.localeCompare(b.date)); }
export function weightStats(s:State,today=localDate()) { const weights=graphRecords(s,'ALL',today); const latest=weights.at(-1); const recent=graphRecords(s,'7D',today); const average=recent.length?recent.reduce((n,m)=>n+m.value,0)/recent.length:undefined; const change=(old:number|undefined)=>latest&&old!==undefined?Math.round((latest.value-old)*100)/100:undefined; const yesterdayWeight=weightOn(s,shiftDate(today,-1)); return {weights,latest,average,averageCount:recent.length,yesterdayWeight,yesterday:latest?.date===today?change(yesterdayWeight):undefined,sevenDays:change(weightOn(s,shiftDate(today,-7))),thirtyDays:change(weightOn(s,shiftDate(today,-30))),first:change(weights[0]?.value),highest:weights.length>=2?Math.max(...weights.map(m=>m.value)):undefined,lowest:weights.length>=2?Math.min(...weights.map(m=>m.value)):undefined}; }
export function weightContext(s:State,today=localDate()) { const current=weightOn(s,today); const previous=graphRecords(s,'ALL',shiftDate(today,-1)); const last=previous.at(-1); const yesterday=weightOn(s,shiftDate(today,-1)); const baseline=previous.filter(m=>m.date>=shiftDate(today,-7)); const avg=baseline.length?baseline.reduce((n,m)=>n+m.value,0)/baseline.length:undefined; return {current,last,delta:current===undefined?undefined:yesterday!==undefined?Math.round((current-yesterday)*100)/100:avg===undefined?undefined:Math.round((current-avg)*100)/100,reference:yesterday!==undefined?'yesterday':'7d avg'}; }
export function calendarDays(s:State,today=localDate()) { return Array.from({length:30},(_,i)=>{const date=shiftDate(today,i-29);const r=s.days[date];return {date,record:r,status:r?.restDay?'rest':date>today||!r||!r.taskSnapshot.length?'neutral':isComplete(r)?'completed':r.completedTaskIds.length?'partial':'missed'} as const;}); }
export function monthStats(s:State,today=localDate()){const days=calendarDays(s,today).filter(d=>d.record&&!d.record.restDay&&d.date<=today);const total=days.reduce((n,d)=>n+d.record!.taskSnapshot.length,0);const done=days.reduce((n,d)=>n+d.record!.completedTaskIds.length,0);return {total,done,percent:total?Math.round(done/total*100):0,completed:days.filter(d=>d.status==='completed').length};}
export function dayDetails(r:DailyRecord){return {completed:r.taskSnapshot.filter(t=>r.completedTaskIds.includes(t.id)),incomplete:r.taskSnapshot.filter(t=>!r.completedTaskIds.includes(t.id))};}
export function setCompletion(s:State,id:string,done:boolean,date=localDate()){ const r=s.days[date];if(!r?.taskSnapshot.some(t=>t.id===id&&t.type==='checkbox'))throw new Error('Task no longer available.');r.completedTaskIds=r.completedTaskIds.filter(x=>x!==id);if(done)r.completedTaskIds.push(id);r.completionPercent=percent(r);return s; }
export function markExport(s:State,at=new Date().toISOString()){if(!validTimestamp(at))throw new Error('Invalid export time.');s.settings.lastExportAt=at;return s;}
const validTimestamp=(v:unknown):v is string=>typeof v==='string'&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString()===v;
// v1.3 retains database version 1 and state schema 1. Additive Money/quote fields
// need no destructive upgrade: old records and snapshots stay byte-for-byte intact.
export function migrateState(s:State):State { if(!s||s.schemaVersion!==1)throw new Error('This stored data needs a newer DAILY OS version.');if(!Array.isArray(s.tasks)||!Array.isArray(s.measurements)||!s.days||typeof s.days!=='object'||Array.isArray(s.days)||!s.settings||typeof s.startedOn!=='string')throw new Error('Saved data could not be read safely. Your records have not been overwritten.');s.money??=emptyMoney();s.life??=defaultLife();s.modules??=emptyModules();s.quoteHistory??={};validateMoney(s.money);validateLife(s.life);validateModules(s.modules);validateQuoteState(s);return s; }
const validDate=(v:unknown):v is string=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&v>='2000-01-01'&&v<='2100-12-31'&&Number.isFinite(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
function validTask(t:any):t is Task {return t&&typeof t.id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(t.id)&&typeof t.title==='string'&&t.title.trim().length>0&&t.title.length<=80&&['Morning','Afternoon','Evening','Anytime'].includes(t.period)&&Array.isArray(t.daysOfWeek)&&t.daysOfWeek.length>0&&t.daysOfWeek.length<=7&&new Set(t.daysOfWeek).size===t.daysOfWeek.length&&t.daysOfWeek.every((d:unknown)=>Number.isInteger(d)&&Number(d)>=0&&Number(d)<=6)&&typeof t.enabled==='boolean'&&['checkbox','weight'].includes(t.type)&&(t.role===undefined||(t.role==='gym'&&t.type==='checkbox'));}
function taskList(ts:any):ts is Task[]{ return Array.isArray(ts)&&ts.length<=100&&ts.every(validTask)&&new Set(ts.map(t=>t.id)).size===ts.length&&ts.filter(t=>t.role==='gym').length<=1; }
export function validateBackup(value:unknown):State { const raw=value as any; if(raw?.app!==undefined&&(raw.app!=='DAILY OS'||![1,2,3,4,5,6].includes(raw.version)||!validTimestamp(raw.exportedAt)))throw new Error('Unsupported DAILY OS backup version.'); const s=raw?.app==='DAILY OS'?raw.data:raw;
 if(!s||s.schemaVersion!==1||!validDate(s.startedOn)||s.startedOn>localDate()||!taskList(s.tasks)||!s.days||typeof s.days!=='object'||Array.isArray(s.days)||!Array.isArray(s.measurements)||s.measurements.length>40000||!s.settings||s.settings.timezone!=='Europe/Warsaw'||s.settings.weightUnit!=='kg'||!['system','light','dark'].includes(s.settings.theme)||(s.settings.lastExportAt!==undefined&&!validTimestamp(s.settings.lastExportAt))) throw new Error('This is not a valid DAILY OS backup.');
 if(s.settings.weightGoal!==undefined&&!validGoal(s.settings.weightGoal))throw new Error('Backup contains an invalid weight goal.');
 const entries=Object.entries(s.days); if(entries.length>40000) throw new Error('Backup is too large.');
 for(const [date,rawRecord] of entries){const r=rawRecord as any;if(!validDate(date)||date<s.startedOn||date>localDate()||!r||r.date!==date||!taskList(r.taskSnapshot)||!Array.isArray(r.completedTaskIds)||new Set(r.completedTaskIds).size!==r.completedTaskIds.length||!r.completedTaskIds.every((id:unknown)=>r.taskSnapshot.some((t:Task)=>t.id===id))||r.completionPercent!==percent(r)||(r.restDay!==undefined&&typeof r.restDay!=='boolean')) throw new Error('Backup contains an invalid daily record.');}
 if(new Set(s.measurements.map((m:any)=>m?.date+':'+m?.kind)).size!==s.measurements.length||!s.measurements.every((m:any)=>m&&validDate(m.date)&&m.date>=s.startedOn&&m.date<=localDate()&&m.kind==='weight'&&m.unit==='kg'&&Number.isFinite(m.value)&&m.value>=1&&m.value<=500)) throw new Error('Backup contains an invalid weight record.');
 for(const [date,r] of entries as [string,DailyRecord][]){if(r.taskSnapshot.some(t=>t.type==='weight'&&r.completedTaskIds.includes(t.id))&&!s.measurements.some((m:Measurement)=>m.date===date))throw new Error('Completed weight task has no measurement.');}
 const money=s.money===undefined?emptyMoney():validateMoney(s.money);const life=s.life===undefined?defaultLife():validateLife(s.life);const modules=s.modules===undefined?emptyModules():validateModules(s.modules);validateQuoteState(s);
 // Normalize into a fresh, known schema; never retain arbitrary imported fields.
 const cleanTask=(t:Task):Task=>({id:t.id,title:t.title.trim(),period:t.period,daysOfWeek:[...t.daysOfWeek],enabled:t.enabled,type:t.type,...(t.role?{role:t.role}:{})});
 return {money,life,modules,quoteHistory:structuredClone(s.quoteHistory??{}),...(s.lastOpeningDate?{lastOpeningDate:s.lastOpeningDate}:{}),schemaVersion:1,startedOn:s.startedOn,tasks:s.tasks.map(cleanTask),days:Object.fromEntries(entries.map(([date,r]:[string,any])=>[date,{date,completedTaskIds:[...r.completedTaskIds],taskSnapshot:r.taskSnapshot.map(cleanTask),completionPercent:r.completionPercent,...(r.restDay!==undefined?{restDay:r.restDay}:{})}])),measurements:s.measurements.map((m:Measurement)=>({date:m.date,kind:'weight',value:m.value,unit:'kg'})),settings:{timezone:'Europe/Warsaw',weightUnit:'kg',theme:s.settings.theme,...(s.settings.lastExportAt?{lastExportAt:s.settings.lastExportAt}:{}),...(s.settings.weightGoal?{weightGoal:{...s.settings.weightGoal}}:{})}}; }
export function exportBackup(s:State) { return JSON.stringify({app:'DAILY OS',version:6,exportedAt:new Date().toISOString(),data:s},null,2); }

export function shiftMonths(date:string,n:number){const d=new Date(date+'T12:00:00Z');const day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+n);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d.toISOString().slice(0,10);}
export function setRestDay(s:State,rest:boolean,date=localDate()){ensureDays(s,date);if(rest)s.days[date].restDay=true;else delete s.days[date].restDay;return s;}
function validGoal(g:any):g is WeightGoal{return !!g&&typeof g.enabled==='boolean'&&Number.isFinite(g.start)&&g.start>=1&&g.start<=500&&Number.isFinite(g.target)&&g.target>=1&&g.target<=500&&g.start!==g.target&&validTimestamp(g.createdAt);}
export function setWeightGoal(s:State,target:number,now=new Date().toISOString(),date=localDate()){
 const start=graphRecords(s,'ALL',date).at(-1)?.value;
 if(start===undefined)throw new Error('Log a weight before creating a goal.');
 const goal={enabled:true,start,target:Math.round(target*100)/100,createdAt:now};
 if(!validGoal(goal))throw new Error('Choose a different target between 1 and 500 kg.');s.settings.weightGoal=goal;return s;
}
export function goalStats(s:State,date=localDate()){
 const g=s.settings.weightGoal,current=graphRecords(s,'ALL',date).at(-1)?.value;
 if(!g?.enabled||current===undefined)return undefined;
 const direction=g.target>g.start?1:-1;
 return {...g,current,direction:direction===1?'gain':'loss',remaining:Math.max(0,Math.round((g.target-current)*direction*100)/100),percent:Math.max(0,Math.min(100,Math.round((current-g.start)/(g.target-g.start)*100)))};
}
export function completionStats(s:State,period:7|30|90,date=localDate()){
 const start=shiftDate(date,1-period),records=Object.values(s.days).filter(r=>r.date>=start&&r.date<=date);
 const active=records.filter(r=>!r.restDay),total=active.reduce((n,r)=>n+r.taskSnapshot.length,0),done=active.reduce((n,r)=>n+r.completedTaskIds.length,0);
 return {total,done,percent:total?Math.round(done/total*100):undefined,perfect:active.filter(isComplete).length,rest:records.filter(r=>r.restDay).length,missed:active.filter(r=>r.taskSnapshot.length&&!r.completedTaskIds.length).length};
}
export function perfectDays(s:State,date=localDate()){const records=Object.values(s.days).filter(r=>r.date<=date&&isComplete(r));return {month:records.filter(r=>r.date.slice(0,7)===date.slice(0,7)).length,all:records.length};}
export function historyStatus(r:DailyRecord){return r.restDay?'REST':`${r.completionPercent}%`;}

function validateQuoteState(s:any){if(s.lastOpeningDate!==undefined&&!validDate(s.lastOpeningDate))throw new Error('Invalid opening date.');if(s.quoteHistory!==undefined){if(!s.quoteHistory||typeof s.quoteHistory!=='object'||Array.isArray(s.quoteHistory)||Object.keys(s.quoteHistory).length>40000)throw new Error('Invalid quote history.');for(const [date,entry] of Object.entries(s.quoteHistory) as [string,any][]){if(!validDate(date)||!entry||typeof entry.quoteId!=='string'||!/^[-a-zA-Z0-9_]{1,100}$/.test(entry.quoteId)||typeof entry.visualId!=='string'||!/^[-a-zA-Z0-9_]{1,100}$/.test(entry.visualId))throw new Error('Invalid quote history entry.');}}}
