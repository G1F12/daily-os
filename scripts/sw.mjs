import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const files=['/','/index.html','/manifest.json','/icon.svg','/icon-192.png','/icon-512.png',...readdirSync('dist/assets').map(f=>'/assets/'+f)];
const version=createHash('sha256').update(files.map(f=>readFileSync('dist'+(f==='/'?'/index.html':f))).join('')).digest('hex').slice(0,12);
writeFileSync('dist/sw.js',`const CACHE='daily-os-${version}'; const FILES=${JSON.stringify(files)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
 const current=await caches.open(CACHE);
 for(const key of await caches.keys())if(key.startsWith('daily-os-')&&key!==CACHE){
  const previous=await caches.open(key);
  // Keep the previous shell's hashed assets for tabs still running the old HTML.
  // Only that shell's references are retained, never an accumulating cache chain.
  const html=previous.match?await previous.match('/index.html'):undefined;
  if(html&&current.put)for(const path of (await html.text()).match(/\\/assets\\/[a-zA-Z0-9_.-]+\\.(?:js|css)/g)||[]){
   const response=await previous.match(path);if(response)await current.put(path,response);
  }
  await caches.delete(key);
 }
 await self.clients.claim();
})()));
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin)return;e.respondWith(caches.open(CACHE).then(async c=>{if(e.request.mode==='navigate')return (await c.match('/index.html'))||fetch(e.request);return (await c.match(e.request))||fetch(e.request);}));});
`);
console.log('Offline shell:',files.length,'files; cache',version);
