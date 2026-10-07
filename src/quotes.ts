import { localDate, type QuoteRecord } from './model';
import { realReflections, jjkReflections, otherReflections } from './reflections';
export interface Quote { id:string; text:string; author:string; category:string; type:'reflection'|'quote'; source?:string; universe?:string; visualCategory?:string }
// These are original editorial reflections inspired by each person's themes,
// NOT verbatim statements or claimed paraphrases of a particular passage.
// Append only; never repurpose an ID. Fictional entries are clearly labelled too.
const groups:[string,string,string[]][] = [
['Marcus Aurelius','philosophy',[
'Give your attention to the next action you can choose.','Meet a difficult morning with a deliberate first step.','Let your conduct carry the values you want to live by.','A quieter mind leaves more room for useful work.','Spend today on what remains within your control.','Do the small duty in front of you with care.','Your response is a place where you can begin again.']],
['Seneca','philosophy',[
'Make room in your day for what you say matters.','A short practice repeated beats a plan left untouched.','Use a pause to choose rather than merely react.','Protect a little time for learning each day.','Prepare carefully, then release the need for certainty.','Give an ordinary hour your undivided attention.','Let reflection turn experience into a better next choice.']],
['Epictetus','philosophy',[
'Begin with the part of the problem you can influence.','A setback can change your route without choosing your response.','Practice your values before explaining them.','Look at the event before accepting your first interpretation.','Choose one useful action before worrying about the outcome.','Let the standard be your effort, not another person’s applause.','Train the habit of returning to what you can do.']],
['Friedrich Nietzsche','philosophy',[
'Build a purpose that can carry ordinary difficult days.','Ask which of your limits are habits you have never examined.','Create a standard you are willing to practice.','Let struggle teach you something without making it your identity.','Give your ambitions a form in today’s actions.','You can revise an inherited rule after examining it.','Be an active participant in the life you are making.']],
['Albert Einstein','science',[
'Keep a question open long enough to understand it.','Curiosity is useful even before it becomes a result.','An elegant explanation still needs a test.','Try looking at a familiar problem from a new angle.','Make space for imagination and for checking your assumptions.','Understanding grows when you ask a more precise question.','Treat an unexpected result as an invitation to investigate.']],
['Richard Feynman','science',[
'Check the explanation you most want to believe.','Knowing a name is a beginning, not an understanding.','Try explaining the idea in your own plain words.','A useful question can start with something ordinary.','Keep the evidence separate from the story you prefer.','Enjoy finding out where your model stops working.','Leave enough room in your thinking to be surprised.']],
['Leonardo da Vinci','science',[
'Look closely before deciding what you have seen.','Let careful observation guide your next experiment.','Keep your curiosity wider than your current specialty.','A small sketch can make a vague idea concrete.','Practice seeing connections without assuming they are proof.','Study the details that others pass by.','Let making and learning help each other.']],
['Miyamoto Musashi','practice',[
'Practice the fundamentals until they become dependable.','Keep your attention on the situation, not your preferred plan.','A steady rhythm starts with a deliberate movement.','Prepare seriously and adapt when conditions change.','Look beyond the technique to the purpose it serves.','Make simplicity the result of practice.','Return to the basics when your effort becomes scattered.']],
['Bruce Lee','practice',[
'Adapt your method without forgetting your purpose.','Turn an idea into something you can practice today.','Remove the extra motion that adds no value.','Let attention lead before speed follows.','Use feedback to refine the next repetition.','A flexible approach can still have a clear direction.','Make your practice an honest test of your understanding.']],
['Muhammad Ali','sport',[
'Give your preparation as much attention as your ambition.','Confidence becomes more useful when it meets consistent work.','Let the next round of effort begin with a clear intention.','A public result rests on many private repetitions.','Carry your conviction into the work you can do today.','Make room for courage without skipping preparation.','Return to your goal after a difficult attempt.']],
['Arnold Schwarzenegger','sport',[
'Turn a distant goal into a repeatable daily practice.','Notice the work you can complete in this session.','A clear plan gives effort somewhere to go.','Take progress one deliberate repetition at a time.','Prepare the conditions that make tomorrow’s effort easier.','Use yesterday’s result to improve today’s plan.','A commitment becomes visible through repeated action.']],
['Kobe Bryant','sport',[
'Give the fundamentals the attention you give the big moments.','Practice with a purpose you can name.','Look for one detail to improve in the next repetition.','Preparation is a task for ordinary days too.','Use a mistake as specific feedback.','Be patient with learning while staying consistent with practice.','Make today’s work precise enough to learn from.']],
['Michael Jordan','sport',[
'An unsuccessful attempt can still be a useful lesson.','Choose the next action after the last result.','Let teamwork add perspective to individual effort.','A difficult practice is a chance to notice what needs work.','Keep the result separate from your willingness to try again.','Bring attention to the part you can improve today.','Make the next attempt informed by the previous one.']],
['David Goggins','practice',[
'Be honest about the effort you actually made.','Give a difficult task a clear and manageable next step.','Consistency starts where the excuse becomes visible.','Keep a record of actions rather than promises.','A challenge can be chosen deliberately, not pursued blindly.','Return to the commitment you made with a practical action.','Know when your plan needs effort and when it needs adjustment.']],
['Carl Sagan','science',[
'Wonder becomes stronger when it welcomes careful questions.','Let evidence earn the confidence you place in a claim.','A wider perspective can make a small concern easier to hold.','Stay curious about what remains unknown.','Make room for humility alongside your knowledge.','Look for a test that could challenge your favourite explanation.','You can appreciate a mystery while working to understand it.']],
['Theodore Roosevelt','leadership',[
'Take part in the work whose outcome you care about.','Make a useful contribution before waiting for ideal conditions.','A practical responsibility can give ambition its shape.','Let effort be visible in the task, not only in the intention.','Choose courage that is joined to careful judgement.','Work with the resources you can use today.','Accept that participation includes the possibility of error.']],
['Winston Churchill','leadership',[
'Name the difficulty clearly before deciding the next step.','A difficult stretch calls for a steady practical response.','Keep communication clear when pressure makes it tempting to rush.','Make preparation serve the decisions ahead.','Persistence is more useful with a plan you can revise.','Use the information available without pretending it is complete.','Find the next workable action when the larger path is uncertain.']],
['Steve Jobs','leadership',[
'Leave time for the work that holds your attention.','A setback can open a route your old plan did not include.','Explore a curiosity even before its use is obvious.','Choose work you are willing to keep learning about.','Let your priorities guide what you leave out.','Build something with care for the person who will use it.','A clear purpose can simplify many small decisions.']],
['Ralph Waldo Emerson','writing',[
'Give your own judgement the chance to develop through practice.','Notice what your experience can teach you directly.','Make a thoughtful choice instead of merely following momentum.','Let an ordinary day contain a little independent thought.','Express a value by acting on it.','Leave room to change your mind after learning.','Pay attention to the world outside your usual routine.']],
['Henry David Thoreau','writing',[
'Choose what belongs in your day with intention.','A simpler routine can make attention easier to protect.','Make time to notice where your hours are going.','Let a walk create room for a clearer thought.','Test whether an extra commitment serves your purpose.','Find a small way to live the priority you have named.','Give today a little more deliberate attention.']],
['Satoru Gojo','fictional',[
'Let confidence support the work, not replace it.','Strength can include helping someone else find their footing.']],
['Toji Fushiguro','fictional',[
'Prepare your tools before the moment you need them.','Observe the situation before making your move.']],
['Sukuna','fictional',[
'Study your capabilities without pretending you have reached their limit.','Let a clear objective focus the next action.']],
['Guts','fictional',[
'A difficult road can still be walked one step at a time.','Carry forward what matters without denying the weight of the journey.']],
['Thorfinn','fictional',[
'Choose a direction you can live with tomorrow.','A new purpose can begin with a different response today.']],
['Vegeta','fictional',[
'Let a stronger rival remind you that there is more to learn.','Keep refining your practice beyond the last achievement.']]
];
export const quotes:readonly Quote[]=groups.flatMap(([author,category,texts],g)=>texts.map((text,i)=>({id:`q-${g+1}-${i+1}`,text,author,category,type:'reflection' as const})));
// One verified short literal entry; editorial entries above are explicitly labelled.
export const verifiedQuotes:readonly Quote[]=[{id:'jobs-2005-1',text:'You’ve got to find what you love.',author:'Steve Jobs',category:'leadership',type:'quote',source:'Stanford commencement address, June 12, 2005'}];
const makeEntries=(groups:[string,string,string][],prefix:string,fictional=false,jjk=false)=>groups.flatMap(([author,category,lines],g)=>lines.split('\n').map((text,i)=>({id:`${prefix}-${g+1}-${i+1}`,text,author,category:jjk?'JJK':fictional?'fictional':category,type:'reflection' as const,visualCategory:fictional?category:category==='science'?'science':category==='philosophy'?'roman':author==='Miyamoto Musashi'?'warrior':'garden',...(jjk?{universe:'Jujutsu Kaisen'}:{})})));
const legacy=quotes.map(q=>({...q,...(['Satoru Gojo','Toji Fushiguro','Sukuna'].includes(q.author)?{universe:'Jujutsu Kaisen',visualCategory:q.author==='Satoru Gojo'?'infinity':q.author==='Sukuna'?'shrine':'hunter'}:{})}));
export const quotePool:readonly Quote[]=[...legacy,...verifiedQuotes,...makeEntries(realReflections,'real'),...makeEntries(jjkReflections,'jjk',true,true),...makeEntries(otherReflections,'fiction',true)];
export const visualThemes=['roman','science','warrior','garden','infinity','hunter','shrine','energy','shadows','moon','gold','night','violet','neon','electric'];
export const visuals=visualThemes.flatMap(t=>[1,2,3,4].map(i=>`${t}-${i}`));
export function visualForQuote(q:Quote){const theme=q.visualCategory??(q.category==='science'?'science':q.author==='Miyamoto Musashi'?'warrior':q.category==='philosophy'?'roman':'garden');return `${theme}-${hash(q.id)%4+1}`;}
export function visualPath(id:string){return `/openings/${visuals.includes(id)?id:'garden-1'}.svg`;}
function hash(text:string){let h=2166136261;for(const c of text)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
function random(seed:number){return ()=>{seed+=0x6D2B79F5;let t=seed;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
const authorKey=(q:Quote)=>q.author==='Sukuna'?'Ryomen Sukuna':q.author;
const cycles=new Map<number,Quote[]>();
function permutation(cycle:number,pool:readonly Quote[],previous:Quote[]=[]){
 for(let attempt=0;attempt<128;attempt++){
  const rng=random(hash(`daily-os-rotation-v2:${cycle}:${attempt}`)),bag=[...pool];
  for(let i=bag.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
  const result:Quote[]=[],recent=previous.slice(-7).map(authorKey);let failed=false;
  while(bag.length){const index=bag.findIndex(q=>!recent.includes(authorKey(q)));if(index<0){failed=true;break;}const q=bag.splice(index,1)[0];result.push(q);recent.push(authorKey(q));if(recent.length>7)recent.shift();}
  if(!failed&&result.slice(0,7).every((q,i)=>!result.slice(result.length-7+i).some(last=>authorKey(last)===authorKey(q))))return result;
 }
 // Tiny custom pools cannot always satisfy a seven-day author separation.
 const rng=random(hash(`daily-os-fallback:${cycle}`));return [...pool].map(q=>({q,n:rng()})).sort((a,b)=>a.n-b.n).map(x=>x.q);
}

export function quoteForDate(date=localDate(),pool=quotePool){
 const ordinal=Math.floor((Date.parse(date+'T12:00:00Z')-Date.parse('2000-01-01T12:00:00Z'))/86400000),cycle=Math.floor(ordinal/pool.length),offset=((ordinal%pool.length)+pool.length)%pool.length;
 if(pool!==quotePool||cycle<0)return permutation(cycle,pool)[offset];
 if(!cycles.has(0))cycles.set(0,permutation(0,pool));
 return cycles.get(0)![offset];
}
let memory:{date:string;id:string}|undefined;
export function dailyQuote(date=localDate(),history?:Record<string,QuoteRecord>):Quote{
 let pinned=memory;try{const raw=localStorage.getItem('daily-os-quote-v1');if(raw)pinned=JSON.parse(raw);}catch{}
 const id=history?.[date]?.quoteId??(pinned?.date===date?pinned.id:undefined);
 const q=quotePool.find(q=>q.id===id)??quoteForDate(date);memory={date,id:q.id};
 try{localStorage.setItem('daily-os-quote-v1',JSON.stringify(memory));}catch{}
 return q;
}
export function quoteRecord(date:string,history?:Record<string,QuoteRecord>){const q=dailyQuote(date,history);return {quoteId:q.id,visualId:history?.[date]?.visualId&&visuals.includes(history[date].visualId)?history[date].visualId:visualForQuote(q)};}
export function quoteShareText(q:Quote){return `${q.type==='quote'?`“${q.text}”`:q.text}\n— ${q.type==='reflection'?'Inspired by ':''}${q.author}${q.type==='reflection'?' (original reflection)':''}${q.universe?' · '+q.universe:''}\nDAILY OS`;}
export async function shareQuote(q:Quote,api:{share?:(data:{text:string})=>Promise<void>;clipboard?:{writeText:(text:string)=>Promise<void>}}=navigator){const text=quoteShareText(q);if(api.share){try{await api.share({text});return 'shared' as const;}catch(e){if(e instanceof DOMException&&e.name==='AbortError')return 'cancelled' as const;}}if(api.clipboard){await api.clipboard.writeText(text);return 'copied' as const;}return 'manual' as const;}
