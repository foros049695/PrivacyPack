/* PrivacyPack PWA — all user data is local. Service worker caches only same-origin assets. */
const CACHE='privacypack-atlas-v3-20261122-r2';
const ESSENTIAL=['./','./index.html','./app.js','./style.css','./catalog.json','./categories.json','./manifest.webmanifest','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets-manifest.json'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await cache.addAll(ESSENTIAL);
 let assets=[];try{const response=await fetch('./assets-manifest.json',{cache:'no-store'});assets=await response.json()}catch{}
 for(let i=0;i<assets.length;i+=25){await Promise.all(assets.slice(i,i+25).map(url=>cache.add(url).catch(()=>{})))}
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('privacypack-atlas-')&&key!==CACHE).map(k=>caches.delete(k)));await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url);if(url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
 event.respondWith((async()=>{try{const response=await fetch(request);if(response.ok){const cache=await caches.open(CACHE);cache.put('./index.html',response.clone());return response}return response}catch{return (await caches.match('./index.html'))||Response.error()}})());return;
 }
 if(url.pathname.endsWith('/catalog.json')||url.pathname.endsWith('/categories.json')){
 event.respondWith((async()=>{const old=await caches.match(request);try{const resp=await fetch(request,{cache:'no-store'});if(resp.ok){const cache=await caches.open(CACHE);cache.put(request,resp.clone());return resp}return old||resp}catch{return old||Response.error()}})());return;
 }
 event.respondWith((async()=>{const cached=await caches.match(request);if(cached)return cached;try{const response=await fetch(request);if(response.ok){const cache=await caches.open(CACHE);cache.put(request,response.clone())}return response}catch{return Response.error()}})());
});
