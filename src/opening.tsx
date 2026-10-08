import {useEffect,useRef,useState} from 'react';
import type {Quote} from './quotes';
import {visualPath} from './visuals';
export function Opening({q,visualId,onClose}:{q:Quote;visualId:string;onClose:()=>void}){const [leaving,setLeaving]=useState(false),[missing,setMissing]=useState(false);const ref=useRef<HTMLButtonElement>(null),closed=useRef(false),fadeTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const close=()=>{if(closed.current)return;closed.current=true;if(reduced){onClose();return;}setLeaving(true);fadeTimer.current=setTimeout(onClose,180);};
 useEffect(()=>{ref.current?.focus();const timer=setTimeout(close,2800);return()=>{clearTimeout(timer);clearTimeout(fadeTimer.current)}},[]);
 return <section className={`opening ${leaving?'opening-leaving':''}`} role="dialog" aria-modal="true" aria-label="Daily opening moment" onKeyDown={e=>{if(e.key==='Escape')close();if(e.key==='Tab'){e.preventDefault();ref.current?.focus()}}}>
 {!missing&&<img src={visualPath(visualId)} alt="Original thematic artwork" onError={()=>setMissing(true)} className="opening-art"/>}{missing&&<div className="opening-fallback" aria-label="Abstract artwork fallback">◯</div>}
 <div className="opening-vignette"/><div className="opening-copy"><span className="opening-brand">DAILY OS</span><p className="opening-text" data-testid="opening-quote">{q.type==='quote'?`“${q.text}”`:q.text}</p><p className="opening-author">{q.type==='reflection'?'Inspired by ':''}{q.author}</p><p className="opening-source">{q.universe??q.category}{q.type==='reflection'?' · Original reflection':''}</p><button ref={ref} onClick={close}>Tap to continue</button><div className="opening-progress" aria-hidden="true"><span/></div></div>
 </section>;
}
