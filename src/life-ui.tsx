import React,{useMemo,useState} from 'react';
import type {State} from './model';
import {displayDate,localDate,shiftDate} from './model';
import {addAction,addSubject,deleteAction,deleteSubject,renameSubject,toggleAction,updateAction,activeToday,actionStatus,dailyReview,weeklyReview,mondayOf,type ActionItem,type ActionKind,type SchoolWorkType,type Priority} from './life';

type ModalType=React.ComponentType<{title:string;onClose:()=>void;children:React.ReactNode}>;
export type LifeProps={s:State;date:string;busy:boolean;apply:(fn:(state:State)=>State)=>Promise<boolean>;Modal:ModalType};
const short=(date?:string)=>date?displayDate(date,{month:'short',day:'numeric'}):'Any day';
const money=(minor:number)=>(minor/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})+' zł';

function ItemForm({kind,item,subjects,busy,onSave,onCancel,onDelete}:{kind:ActionKind;item?:ActionItem;subjects:string[];busy:boolean;onSave:(v:{title:string;kind:ActionKind;priority:Priority;dueDate?:string;subject?:string;schoolType?:SchoolWorkType;note?:string})=>void;onCancel:()=>void;onDelete?:()=>void}){
 const [title,setTitle]=useState(item?.title??'');const [priority,setPriority]=useState<Priority>(item?.priority??'medium');const [dueDate,setDueDate]=useState(item?.dueDate??(kind==='school'?localDate():''));const [subject,setSubject]=useState(item?.subject??subjects[0]??'');const [schoolType,setSchoolType]=useState<SchoolWorkType>(item?.schoolType??'homework');const [note,setNote]=useState(item?.note??'');
 return <form className="life-form" onSubmit={e=>{e.preventDefault();onSave({title:title.trim(),kind,priority,dueDate:dueDate||undefined,...(kind==='school'?{subject,schoolType}:{}),note:note.trim()||undefined})}}>
  <label>What needs doing?<input aria-label="Task title" maxLength={100} required placeholder={kind==='school'?'e.g. Maths exercises':'e.g. Buy manga'} value={title} onChange={e=>setTitle(e.target.value)}/></label>
  {kind==='school'&&<><label>Subject<select aria-label="Subject" value={subject} onChange={e=>setSubject(e.target.value)} required>{subjects.map(t=><option key={t}>{t}</option>)}</select></label><label>School task type<select aria-label="School task type" value={schoolType} onChange={e=>setSchoolType(e.target.value as SchoolWorkType)}><option value="homework">Homework</option><option value="test">Test</option><option value="project">Project</option></select></label></>}
  <label>Due date{kind==='personal'?' (optional)':''}<input aria-label="Due date" type="date" min="2000-01-01" max="2100-12-31" required={kind==='school'} value={dueDate} onChange={e=>setDueDate(e.target.value)}/></label>
  <label>Priority<select aria-label="Priority" value={priority} onChange={e=>setPriority(e.target.value as Priority)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
  <label>Notes (optional)<textarea aria-label="Task notes" maxLength={500} rows={3} value={note} onChange={e=>setNote(e.target.value)}/></label>
  <button className="primary-button" disabled={busy||!title.trim()||(kind==='school'&&!subject)} type="submit">{item?'Save changes':'Add task'}</button>
  <div className="life-form-footer"><button type="button" className="soft-button" onClick={onCancel}>Cancel</button>{item&&onDelete&&<button type="button" className="text-danger" onClick={onDelete}>Delete task</button>}</div>
 </form>;
}
function ActionRow({item,date,busy,onToggle,onEdit}:{item:ActionItem;date:string;busy:boolean;onToggle:(a:ActionItem)=>void;onEdit:(a:ActionItem)=>void}){
 const status=actionStatus(item,date);return <div className={`life-item ${item.completedAt?'life-completed':''}`}>
  <button aria-label={`${item.completedAt?'Mark incomplete':'Complete'} ${item.title}`} aria-pressed={!!item.completedAt} className={`life-checkbox ${item.completedAt?'checked':''}`} disabled={busy} onClick={()=>onToggle(item)}>{item.completedAt?'✓':''}</button>
  <button className="life-item-main" onClick={()=>onEdit(item)}><b>{item.title}</b><small>{item.kind==='school'?`${item.subject} · ${item.schoolType}`:'One-time'} · {item.dueDate?short(item.dueDate):'No due date'} · {item.priority}</small></button>
  {status==='overdue'&&<span className="life-flag overdue">Overdue</span>}{status==='today'&&<span className="life-flag today">Today</span>}
 </div>;
}
export function ActionManager({s,date,busy,apply,Modal,kind,compact=false}:{kind:ActionKind;compact?:boolean}&LifeProps){
 const [showAll,setShowAll]=useState(false);const [form,setForm]=useState<'new'|ActionItem|null>(null);const [confirm,setConfirm]=useState<ActionItem|null>(null);
 const actions=s.life?.actions??[];const shownToday=(a:ActionItem)=>!a.completedAt?(!a.dueDate||a.dueDate<=date):localDate(new Date(a.completedAt))===date;const filtered=kind==='school'?(compact?actions.filter(a=>a.kind==='school'&&shownToday(a)):actions.filter(a=>a.kind==='school')):actions.filter(a=>a.kind==='personal'&&(!compact||showAll||shownToday(a)));
 const ordered=[...filtered].sort((a,b)=>Number(!!a.completedAt)-Number(!!b.completedAt)||(a.dueDate??date).localeCompare(b.dueDate??date)||({high:0,medium:1,low:2}[a.priority]-{high:0,medium:1,low:2}[b.priority]));
 const subjects=s.life?.subjects??[];
 async function save(v:Parameters<typeof addAction>[1]){const ok=await apply(st=>typeof form==='object'&&form!==null?updateAction(st,form.id,v):addAction(st,v));if(ok)setForm(null);}
 async function toggle(a:ActionItem){await apply(st=>toggleAction(st,a.id,!a.completedAt))}
 return <section className={`life-panel ${compact?'life-panel-compact':''}`}><div className="section-heading"><h2>{kind==='school'?'School work':'One-time tasks'}</h2>{kind==='personal'&&compact&&<button className="life-add" aria-pressed={showAll} onClick={()=>setShowAll(v=>!v)}>{showAll?'Due today':'All tasks'}</button>}<button className="life-add" onClick={()=>setForm('new')} disabled={busy||(kind==='school'&&!subjects.length)}>+ Add</button></div>
 {kind==='school'&&<p className="small-note">Homework, tests and projects stay separate from recurring routines.</p>}
 {ordered.length?<div className="card life-items">{ordered.map(a=><ActionRow key={a.id} item={a} date={date} busy={busy} onToggle={toggle} onEdit={setForm}/>)}</div>:<div className="card life-empty">{kind==='school'?'No school work yet.':'No one-time tasks in this view.'}</div>}
 {form!==null&&<Modal title={typeof form==='object'?'Edit task':kind==='school'?'New school task':'New one-time task'} onClose={()=>setForm(null)}><ItemForm key={typeof form==='object'?form.id:'new'} kind={kind} item={typeof form==='object'?form:undefined} subjects={subjects} busy={busy} onSave={v=>void save(v)} onCancel={()=>setForm(null)} onDelete={typeof form==='object'?()=>{setConfirm(form);setForm(null)}:undefined}/></Modal>}
 {confirm&&<Modal title="Delete one-time task?" onClose={()=>setConfirm(null)}><p>“{confirm.title}” will be removed from your task history. Recurring routines are not affected.</p><div className="modal-actions"><button className="soft-button" onClick={()=>setConfirm(null)}>Cancel</button><button className="danger-button" disabled={busy} onClick={async()=>{if(await apply(st=>deleteAction(st,confirm.id)))setConfirm(null)}}>Delete</button></div></Modal>}
 </section>;
}
export function SchoolScreen(props:LifeProps&{onBack:()=>void}){
 const {s,date,busy,apply,onBack}=props;const [newSubject,setNewSubject]=useState('');const [manage,setManage]=useState(false);const [rename,setRename]=useState('');const [name,setName]=useState('');const subjects=s.life?.subjects??[];
 const items=s.life?.actions.filter(a=>a.kind==='school')??[];
 const upcoming=items.filter(a=>!a.completedAt&&a.dueDate&&a.dueDate>date).sort((a,b)=>a.dueDate!.localeCompare(b.dueDate!));
 const completed=items.filter(a=>a.completedAt).sort((a,b)=>b.completedAt!.localeCompare(a.completedAt!)).slice(0,20);
 return <><button className="life-back" onClick={onBack}>← Back to Today</button><section className="card school-overview"><strong>{items.filter(a=>!a.completedAt).length}</strong><span>open school tasks</span><small>{items.filter(a=>!a.completedAt&&a.dueDate&&a.dueDate<date).length} overdue · {upcoming.length} upcoming</small></section>
 <ActionManager {...props} kind="school"/>
 {!!upcoming.length&&<section className="life-panel"><h2>Upcoming</h2><div className="card life-items">{upcoming.map(a=><div className="life-upcoming" key={a.id}><b>{a.title}</b><small>{a.subject} · {a.schoolType} · {short(a.dueDate)}</small></div>)}</div></section>}
 {!!completed.length&&<section className="life-panel"><h2>Recently completed</h2><div className="card life-items">{completed.map(a=><div className="life-upcoming" key={a.id}><b>{a.title}</b><small>{a.subject} · finished {short(localDate(new Date(a.completedAt!)))}</small></div>)}</div></section>}
 <section className="life-panel"><div className="section-heading"><h2>Subjects</h2><button className="life-add" onClick={()=>setManage(v=>!v)}>{manage?'Done':'Manage'}</button></div><div className="card school-subjects">{subjects.map(subject=><div key={subject} className="school-subject"><span>{subject}</span>{manage&&<><button onClick={()=>{setRename(subject);setName(subject)}}>Rename</button><button disabled={busy} onClick={()=>{void apply(st=>deleteSubject(st,subject))}} aria-label={`Delete ${subject}`}>×</button></>}</div>)}{manage&&<form onSubmit={e=>{e.preventDefault();void apply(st=>addSubject(st,newSubject)).then(ok=>{if(ok)setNewSubject('')})}}><input aria-label="New subject" maxLength={60} placeholder="Add subject" value={newSubject} onChange={e=>setNewSubject(e.target.value)}/><button disabled={busy||!newSubject.trim()} className="soft-button">Add</button></form>}</div></section>
 {rename&&<props.Modal title="Rename subject" onClose={()=>setRename('')}><form onSubmit={e=>{e.preventDefault();void apply(st=>renameSubject(st,rename,name)).then(ok=>{if(ok)setRename('')})}}><label>Subject name<input aria-label="Subject name" value={name} maxLength={60} onChange={e=>setName(e.target.value)} required/></label><button className="primary-button" disabled={busy||!name.trim()}>Save</button></form></props.Modal>}
 </>;
}
export function DailyReview({s,date}:{s:State;date:string}){const d=dailyReview(s,date);return <div className="life-review-grid"><span>Routines <b>{d.rest?'Rest Day':`${d.routinesDone}/${d.routinesTotal}`}</b></span><span>One-time <b>{d.personalCompleted} done</b></span><span>School <b>{d.schoolCompleted} done</b></span><span>Income <b>{money(d.income)}</b></span><span>Spent <b>{money(d.expenses)}</b></span><span>Net <b>{money(d.net)}</b></span><span>Weight <b>{d.weight===undefined?'No entry':`${d.weight.toFixed(1)} kg`}</b></span><span>Vs previous entry <b>{d.weightChange===undefined?'Not enough data':`${d.weightChange>0?'+':''}${d.weightChange.toFixed(1)} kg`}</b></span></div>}
export function DailyReviewCard({s,date}:{s:State;date:string}){return <details className="card life-review"><summary>Daily Review <span>Today’s summary</span></summary><DailyReview s={s} date={date}/></details>}
export function WeeklyReport({s,date}:{s:State;date:string}){
 const latest=mondayOf(shiftDate(date,-7));const [week,setWeek]=useState(latest);const actual=week>latest?latest:week;const w=useMemo(()=>weeklyReview(s,actual),[s,actual]);
 const pace=w.routinesTotal?Math.round(w.routinesDone/w.routinesTotal*100):undefined;
 return <section className="card life-weekly"><div className="section-heading"><h2>Weekly Report</h2><span>Completed weeks</span></div><div className="life-week-picker"><button aria-label="Previous week" onClick={()=>setWeek(shiftDate(actual,-7))}>←</button><b>{short(w.weekStart)} – {short(w.weekEnd)}</b><button aria-label="Next week" disabled={actual>=latest} onClick={()=>setWeek(shiftDate(actual,7))}>→</button></div><div className="life-review-grid"><span>Routines <b>{pace===undefined?'—':`${pace}%`}</b><small>{w.routinesDone}/{w.routinesTotal}</small></span><span>Rest days <b>{w.restDays}</b></span><span>One-time done <b>{w.taskCompleted-w.schoolCompleted}</b></span><span>School done <b>{w.schoolCompleted}</b><small>{w.schoolScheduled} due</small></span><span>Income <b>{money(w.income)}</b></span><span>Spent <b>{money(w.expenses)}</b></span><span>Net <b>{money(w.net)}</b></span><span>Weight trend <b>{w.weightSamples<2?'Not enough data':`${((w.weightEnd??0)-(w.weightStart??0)).toFixed(1)} kg`}</b></span></div><p className="small-note">Calculated from saved records. Rest days are neutral; missing weight data is not estimated.</p></section>;
}
