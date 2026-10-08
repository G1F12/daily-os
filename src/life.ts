import type { State } from './model';
import { localDate, shiftDate, weekday, weightOn } from './model';

export type Priority = 'low' | 'medium' | 'high';
export type ActionKind = 'personal' | 'school';
export type SchoolWorkType = 'homework' | 'test' | 'project';
export interface ActionItem {
  id:string; title:string; kind:ActionKind; priority:Priority; dueDate?:string;
  subject?:string; schoolType?:SchoolWorkType; note?:string;
  createdAt:string; updatedAt:string; completedAt?:string;
}
export interface LifeData { actions:ActionItem[]; subjects:string[]; }
export function defaultLife():LifeData {return {actions:[],subjects:['Mathematics','Polish','English','Physics']};}
const dateOK = (v:unknown):v is string => typeof v==='string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v+'T12:00:00Z')) && new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v && v>='2000-01-01' && v<='2100-12-31';
const isoOK = (v:unknown):v is string => typeof v==='string' && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString()===v;
const textOK = (v:unknown,max:number) => typeof v==='string' && v.trim().length>0 && v.length<=max;
export function validateLife(value:unknown):LifeData {
  const x=value as LifeData;
  if(!x || !Array.isArray(x.actions) || x.actions.length>2000 || !Array.isArray(x.subjects) || x.subjects.length>80)throw new Error('Invalid personal tasks or school data.');
  if(x.subjects.some(s=>!textOK(s,60))||new Set(x.subjects.map(s=>s.trim().toLocaleLowerCase())).size!==x.subjects.length)throw new Error('Invalid school subjects.');
  const seen=new Set<string>();
  for(const a of x.actions){
    if(!a || typeof a.id!=='string'|| !/^[\w-]{1,80}$/.test(a.id) ||seen.has(a.id)||!textOK(a.title,100)||!['personal','school'].includes(a.kind)||!['low','medium','high'].includes(a.priority)||!isoOK(a.createdAt)||!isoOK(a.updatedAt)|| (a.completedAt!==undefined&&!isoOK(a.completedAt))||(a.dueDate!==undefined&&!dateOK(a.dueDate))||(a.note!==undefined&&(typeof a.note!=='string'||a.note.length>500)))throw new Error('Invalid one-time task in backup.');
    if(a.kind==='school'&&(!dateOK(a.dueDate)||!textOK(a.subject,60)||!['homework','test','project'].includes(a.schoolType??'')))throw new Error('Invalid school work.');
    if(a.kind==='personal'&&(a.subject!==undefined||a.schoolType!==undefined))throw new Error('Invalid personal task type.');
    seen.add(a.id);
  }
  return {actions:x.actions.map(a=>{const cleaned={...a,title:a.title.trim()};if(cleaned.dueDate===undefined)delete cleaned.dueDate;if(cleaned.subject===undefined)delete cleaned.subject;else cleaned.subject=cleaned.subject.trim();if(cleaned.schoolType===undefined)delete cleaned.schoolType;if(cleaned.note===undefined||!cleaned.note.trim())delete cleaned.note;else cleaned.note=cleaned.note.trim();return cleaned;}),subjects:x.subjects.map(s=>s.trim())};
}
export function addAction(s:State,item:Omit<ActionItem,'id'|'createdAt'|'updatedAt'|'completedAt'>,now=new Date().toISOString()):State{
 const life=s.life??=defaultLife();if(life.actions.length>=2000)throw new Error('Too many one-time tasks.');
 const next:ActionItem={...item,id:crypto.randomUUID(),title:item.title.trim(),createdAt:now,updatedAt:now};
 life.actions.push(validateLife({ ...life,actions:[next]}).actions[0]);return s;
}
export function updateAction(s:State,id:string,change:Partial<Pick<ActionItem,'title'|'dueDate'|'priority'|'subject'|'schoolType'|'note'>>,now=new Date().toISOString()):State{
 const life=s.life??=defaultLife();const a=life.actions.find(i=>i.id===id);if(!a)throw new Error('Task not found.');
 const next={...a,...change,updatedAt:now};const cleaned=validateLife({...life,actions:[next]}).actions[0];
 life.actions=life.actions.map(i=>i.id===id?cleaned:i);return s;
}
export function toggleAction(s:State,id:string,done:boolean,now=new Date().toISOString()):State{
 const a=(s.life??=defaultLife()).actions.find(i=>i.id===id);if(!a)throw new Error('Task not found.');
 if(!isoOK(now))throw new Error('Invalid task timestamp.');a.updatedAt=now;
 if(done)a.completedAt=now;else delete a.completedAt;return s;
}
export function deleteAction(s:State,id:string):State{const life=s.life??=defaultLife();if(!life.actions.some(a=>a.id===id))throw new Error('Task not found.');life.actions=life.actions.filter(a=>a.id!==id);return s;}
export function addSubject(s:State,name:string):State{const life=s.life??=defaultLife();validateLife({...life,subjects:[...life.subjects,name]});life.subjects.push(name.trim());return s;}
export function renameSubject(s:State,original:string,name:string):State{const life=s.life??=defaultLife();if(!life.subjects.includes(original))throw new Error('Subject not found.');const subjects=life.subjects.map(x=>x===original?name.trim():x);validateLife({...life,subjects});life.subjects=subjects;life.actions.forEach(a=>{if(a.subject===original)a.subject=name.trim()});return s;}
export function deleteSubject(s:State,name:string):State{const life=s.life??=defaultLife();if(life.actions.some(a=>a.kind==='school'&&a.subject===name))throw new Error('Reassign or delete this subject’s school work first.');life.subjects=life.subjects.filter(x=>x!==name);return s;}
export function actionStatus(a:ActionItem,today=localDate()):'completed'|'overdue'|'today'|'upcoming'|'unscheduled'{if(a.completedAt)return 'completed';return !a.dueDate?'unscheduled':a.dueDate<today?'overdue':a.dueDate===today?'today':'upcoming';}
export function activeToday(s:State,today=localDate()):ActionItem[]{return (s.life?.actions??[]).filter(a=>!a.completedAt&&(!a.dueDate||a.dueDate<=today)).sort((a,b)=>{const rank={high:0,medium:1,low:2};return (a.dueDate??today).localeCompare(b.dueDate??today)||rank[a.priority]-rank[b.priority]||a.createdAt.localeCompare(b.createdAt);});}
export function dailyReview(s:State,date=localDate()){
 const routine=s.days[date];const actions=s.life?.actions??[];
 // The daily count is derived from the completion timestamp, rather than from the current status only.
 const completed=actions.filter(a=>a.completedAt&&localDate(new Date(a.completedAt))===date);
 const due=actions.filter(a=>a.dueDate===date);
 const schoolCompleted=completed.filter(a=>a.kind==='school').length;
 const schoolDue=due.filter(a=>a.kind==='school').length;
 const tx=s.money?.transactions.filter(t=>t.date===date)??[];
 const income=tx.filter(t=>t.type==='income').reduce((v,t)=>v+t.amountMinor,0);
 const expenses=tx.filter(t=>t.type==='expense').reduce((v,t)=>v+t.amountMinor,0);
 const previous=s.measurements.filter(m=>m.kind==='weight'&&m.date<date).sort((a,b)=>b.date.localeCompare(a.date))[0];
 const weight=weightOn(s,date);
 return {date,rest:!!routine?.restDay,routinesDone:routine?.completedTaskIds.length??0,routinesTotal:routine?.taskSnapshot.length??0,completed:completed.length,schoolCompleted,schoolDue,personalCompleted:completed.length-schoolCompleted,actionsDue:due.length,income,expenses,net:income-expenses,weight,weightChange:weight!==undefined&&previous?Math.round((weight-previous.value)*100)/100:undefined};
}
export function mondayOf(date:string){return shiftDate(date,-weekday(date));}
export function weeklyReview(s:State,weekStart:string){if(weekday(weekStart)!==0)throw new Error('Week must begin on Monday.');const weekEnd=shiftDate(weekStart,6);let routinesDone=0,routinesTotal=0,restDays=0,daysWithRoutines=0;
 for(let d=weekStart;d<=weekEnd;d=shiftDate(d,1)){const day=s.days[d];if(!day)continue;if(day.restDay){restDays++;continue;}routinesDone+=day.completedTaskIds.length;routinesTotal+=day.taskSnapshot.length;if(day.taskSnapshot.length)daysWithRoutines++;}
 const a=s.life?.actions??[];const done=a.filter(t=>t.completedAt&&localDate(new Date(t.completedAt))>=weekStart&&localDate(new Date(t.completedAt))<=weekEnd);
 const scheduled=a.filter(t=>t.dueDate&&t.dueDate>=weekStart&&t.dueDate<=weekEnd);
 const transactions=s.money?.transactions.filter(t=>t.date>=weekStart&&t.date<=weekEnd)??[];
 const income=transactions.filter(t=>t.type==='income').reduce((n,t)=>n+t.amountMinor,0);
 const expenses=transactions.filter(t=>t.type==='expense').reduce((n,t)=>n+t.amountMinor,0);
 const measurements=s.measurements.filter(m=>m.kind==='weight'&&m.date>=weekStart&&m.date<=weekEnd).sort((x,y)=>x.date.localeCompare(y.date));
 return {weekStart,weekEnd,routinesDone,routinesTotal,restDays,daysWithRoutines,taskCompleted:done.length,taskScheduled:scheduled.length,schoolCompleted:done.filter(t=>t.kind==='school').length,schoolScheduled:scheduled.filter(t=>t.kind==='school').length,income,expenses,net:income-expenses,weightStart:measurements[0]?.value,weightEnd:measurements.at(-1)?.value,weightSamples:measurements.length};
}
