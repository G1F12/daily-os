import { useState } from 'react';
import { calendarDays, monthStats, displayDate, graphRecords, localDate, type GraphPeriod, type State } from './model';

export function WeightChart({s,date=localDate()}:{s:State;date?:string}) {
 const [period,setPeriod]=useState<GraphPeriod>('30D');
 const [selected,setSelected]=useState<string>();
 const data=graphRecords(s,period,date);
 const active=data.find(m=>m.date===selected);
 const average=data.length?data.reduce((n,m)=>n+m.value,0)/data.length:undefined;
 const min=data.length?Math.min(...data.map(m=>m.value))-.3:0;
 const max=data.length?Math.max(...data.map(m=>m.value))+.3:1;
 const start=data.length?Date.parse(data[0].date):0;
 const end=data.length?Date.parse(data.at(-1)!.date):0;
 const points=data.map(m=>({x:data.length===1?160:16+(Date.parse(m.date)-start)/(end-start)*288,y:140-(m.value-min)/(max-min)*116}));
 return <div className="weight-chart"><div className="period-picker" aria-label="Weight chart period">{(['7D','30D','90D','ALL'] as GraphPeriod[]).map(p=><button key={p} aria-pressed={period===p} onClick={()=>{setPeriod(p);setSelected(undefined)}}>{p}</button>)}</div>
 {data.length?<><p className="chart-reading" aria-live="polite">{active?<><b>{displayDate(active.date)}</b> · {active.value.toFixed(1)} kg</>:<>Average {average!.toFixed(1)} kg · {data.length} measurements</>}</p><svg className="chart" viewBox="0 0 320 164" aria-label={`Weight records for ${period}; tap a point for details`}>
 {[40,90,140].map(y=><path key={y} d={`M16 ${y}H304`} stroke="var(--line)" strokeDasharray="3 5"/>)}
 <path d={`M16 ${140-(average!-min)/(max-min)*116}H304`} stroke="var(--muted)" strokeDasharray="5 5" strokeWidth="1"/>
 {points.length>1&&<polyline points={points.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round"/>}
 {points.map((p,i)=><g key={data[i].date} role="button" tabIndex={0} aria-label={`${displayDate(data[i].date)}: ${data[i].value.toFixed(1)} kg`} aria-pressed={selected===data[i].date} onClick={()=>setSelected(data[i].date)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(data[i].date)}}}><circle cx={p.x} cy={p.y} r="23" fill="transparent"/><circle cx={p.x} cy={p.y} r={selected===data[i].date?5:3.5} fill="var(--accent)" stroke="var(--card)" strokeWidth="1.5"/><title>{data[i].date}: {data[i].value} kg</title></g>)}
 </svg><div className="chart-labels"><span>{displayDate(data[0].date,{month:'short',day:'numeric'})}</span><span>{displayDate(data.at(-1)!.date,{month:'short',day:'numeric'})}</span></div><p className="small-note">Dots are measured values; lines connect entries. Missing dates have no estimated weights. Dashed line: period average.</p></>:<div className="empty-chart"><p>No measurements in this period.</p></div>}
 </div>;
}
export function Calendar({s,date,onSelect}:{s:State;date:string;onSelect:(d:string)=>void}) {const score=monthStats(s,date);return <section className="card calendar-card"><div className="section-heading"><h2>Last 30 days</h2><span>Daily completion</span></div><p className="small-note">{score.percent}% · {score.done} / {score.total} tasks · {score.completed} / 30 days complete</p><div className="calendar-grid">{calendarDays(s,date).map(day=><button key={day.date} className={`calendar-cell ${day.status}`} aria-label={`${displayDate(day.date)}: ${day.record?.taskSnapshot.length?`${day.record.completionPercent}%, ${day.record.completedTaskIds.length} of ${day.record.taskSnapshot.length} tasks`:'No data'}`} onClick={()=>onSelect(day.date)}><span>{Number(day.date.slice(-2))}</span><small>{displayDate(day.date,{month:'short'})}</small></button>)}</div><div className="calendar-legend"><span>● Complete</span><span>◐ Partial</span><span>○ Missed</span><span>· No data</span></div></section>}
