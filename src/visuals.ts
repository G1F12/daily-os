import type { Quote } from './quotes';
export const visualCategories=['gojo','toji','sukuna','yuji','megumi','yuta','maki','nanami','geto','todo','hakari','kashimo','choso','nobara','mahito','kenjaku','science','philosophy','warrior','sport','leadership','growth','focus','dark','discipline','resilience'] as const;
export const visualIds=visualCategories.flatMap(c=>[`${c}-1`,`${c}-2`]);
export const visualExists=(id:string)=>visualIds.includes(id);
export const visualPath=(id:string)=>`/visuals/${visualExists(id)?id:'philosophy-1'}.svg`;
export function visualFor(q:Quote){let category=q.visualCategory??q.category;if(!visualCategories.includes(category as typeof visualCategories[number]))category=q.category==='strength'?'sport':q.category==='ambition'?'leadership':'philosophy';const parity=[...q.id].reduce((n,c)=>n+c.charCodeAt(0),0)%2;return `${category}-${parity+1}`;}
