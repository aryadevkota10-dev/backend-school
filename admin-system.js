(function(){
'use strict';
const PAGE_KEY=location.pathname.split('/').pop()||'Devdaha.html';
const qs=new URLSearchParams(location.search);
const VISUAL_EDIT_MODE=qs.get('adminMode')==='1'||qs.get('visualEditor')==='1'||window.self!==window.top;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const api=async(path,options={})=>{
  if(location.protocol==='file:') throw new Error('Backend not running. Start the Devdaha CMS server, then open http://localhost:3000/admin-login.html');
  let r;
  try{r=await fetch(path,{credentials:'same-origin',cache:'no-store',...options});}catch(e){throw new Error('Cannot reach the CMS backend. Start the server and open the site through http://localhost:3000 (not by double-clicking the HTML file).');}
  let data={}; try{data=await r.json()}catch{}
  if(!r.ok) throw new Error(data.error||`Request failed (${r.status})`);
  return data;
};
const getJSON=path=>api(path);
const put=(path,data)=>api(path,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
const post=(path,data)=>api(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
const del=(path,data)=>api(path,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify(data||{})});
function cssPath(el){if(!el||el.nodeType!==1)return '';const parts=[];let n=el;while(n&&n.nodeType===1&&n!==document.body){let p=n.tagName.toLowerCase();if(n.id){p+='#'+CSS.escape(n.id);parts.unshift(p);break}const cls=[...n.classList].filter(Boolean).slice(0,2);if(cls.length)p+='.'+cls.map(CSS.escape).join('.');let sib=n,i=1;while((sib=sib.previousElementSibling))if(sib.tagName===n.tagName)i++;p+=`:nth-of-type(${i})`;parts.unshift(p);n=n.parentElement}return parts.join(' > ')}
function applyOverride(el,d){if('text'in d&&!['SCRIPT','STYLE'].includes(el.tagName))el.textContent=d.text;if('html'in d)el.innerHTML=d.html;if('href'in d&&el.tagName==='A')el.setAttribute('href',d.href);if('src'in d&&/^(IMG|VIDEO|SOURCE)$/.test(el.tagName))el.setAttribute('src',d.src);if('alt'in d&&el.tagName==='IMG')el.setAttribute('alt',d.alt);if('title'in d)el.setAttribute('title',d.title)}
function overrideAnchor(el){return {tag:el.tagName,id:el.id||'',classes:[...el.classList].slice(0,4),text:(el.textContent||'').replace(/\s+/g,' ').trim().slice(0,220)}}
function findOverrideTarget(selector,d){let el=null;try{el=document.querySelector(selector)}catch{}if(el)return el;const a=d&&d.__anchor;if(!a||!a.tag)return null;const candidates=[...document.querySelectorAll(a.tag.toLowerCase())];return candidates.find(x=>{if(a.id&&x.id===a.id)return true;if((a.text||'') && (x.textContent||'').replace(/\s+/g,' ').trim().slice(0,220)===(a.text||'')){if(a.classes?.length)return a.classes.every(c=>x.classList.contains(c));return true}return false})||null}
function injectStyle(){
  if(document.getElementById('devdaha-admin-system-style'))return;
  const st=document.createElement('style');
  st.id='devdaha-admin-system-style';
  st.textContent=`
  .devdaha-admin-link{display:inline-flex!important;align-items:center;justify-content:center;gap:.45rem;text-decoration:none!important;margin-left:.65rem;padding:.55rem .9rem!important;border:1px solid rgba(201,162,74,.6)!important;border-radius:999px!important;background:linear-gradient(135deg,rgba(201,162,74,.18),rgba(236,207,131,.08))!important;color:#eccf83!important;font:600 .72rem/1.1 Manrope,Arial,sans-serif!important;letter-spacing:.08em;text-transform:uppercase!important;white-space:nowrap;cursor:pointer;z-index:20}
  .devdaha-managed-blocks{max-width:1180px;margin:2rem auto;padding:0 4%;display:grid;gap:1rem}
  .devdaha-managed-block{padding:1.25rem;border-radius:20px;border:1px solid rgba(201,162,74,.35);background:linear-gradient(180deg,rgba(201,162,74,.09),rgba(255,255,255,.03));box-shadow:0 12px 35px rgba(0,0,0,.12)}
  .devdaha-managed-block h2{margin:.1rem 0 .5rem}
  .devdaha-managed-block p{margin:0;white-space:pre-wrap}
  .devdaha-managed-block a{display:inline-flex;margin-top:.85rem;padding:.5rem .8rem;border-radius:999px;text-decoration:none;border:1px solid rgba(201,162,74,.45)}
  .devdaha-managed-media{max-width:1180px;margin:2.5rem auto;padding:1rem 4%}
  .devdaha-gallery-managed-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
  .devdaha-gallery-managed-grid .photo-card{overflow:hidden;background:linear-gradient(145deg,#06335f,#0a4d82);border:2px solid var(--gold,#d4af37);border-radius:20px;box-shadow:0 16px 40px rgba(0,0,0,.28);transition:.4s ease}
  .devdaha-gallery-managed-grid .photo-card:hover{transform:translateY(-10px)}
  .devdaha-gallery-managed-grid .photo-wrap{height:240px;overflow:hidden;background:#082847}
  .devdaha-gallery-managed-grid .photo-wrap img,.devdaha-gallery-managed-grid .photo-wrap video{width:100%;height:100%;object-fit:cover;display:block}
  .devdaha-gallery-managed-grid .photo-info{padding:20px}
  .devdaha-gallery-managed-grid .photo-info span{color:var(--gold2,#f1cf5e);font-size:.72rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
  .devdaha-gallery-managed-grid .photo-info h2{margin:9px 0 7px;font-size:1.4rem}
  .devdaha-gallery-managed-grid .photo-info p{margin:0;color:var(--muted,#d6e4ee);line-height:1.65}
  .devdaha-notice-empty{margin:2rem auto;padding:2rem;border:1px dashed rgba(11,63,120,.22);border-radius:18px;background:linear-gradient(145deg,#fff,#f7fbff);color:#17324d;text-align:center;display:grid;gap:7px}
  .devdaha-notice-empty strong{font:600 1.15rem Fraunces,Georgia,serif;color:#0b3f78}
  .devdaha-notice-empty span{color:#687b8f}
  .devdaha-managed-magazines{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;margin-top:24px}
  .devdaha-managed-magazine{overflow:hidden;border:1px solid rgba(11,63,120,.13);border-radius:22px;background:#fff;box-shadow:0 18px 45px rgba(8,43,87,.09);transition:transform .35s ease,box-shadow .35s ease;border-top:4px solid #d4af37}
  .devdaha-managed-magazine:hover{transform:translateY(-8px);box-shadow:0 26px 55px rgba(8,43,87,.15)}
  .devdaha-managed-magazine>img{width:100%;height:250px;object-fit:cover;background:#eef4fa}
  .devdaha-mag-body{padding:20px}.devdaha-mag-body .tag{display:inline-block;margin-bottom:9px}.devdaha-mag-body h2{margin:0 0 6px;color:#0b3f78}.devdaha-mag-date{font-size:.8rem;color:#8b6a20;margin-bottom:9px}.devdaha-mag-body p{color:#687b8f;line-height:1.7}.devdaha-mag-body a{display:inline-flex;margin-top:10px;padding:9px 13px;border-radius:999px;background:#0b3f78;color:#fff;text-decoration:none}
  .magazine-empty-shell{padding:3rem 0 6rem}.magazine-empty{padding:2.5rem;border:1px solid rgba(11,63,120,.12);border-radius:26px;background:linear-gradient(145deg,#ffffff,#f5f8fc);box-shadow:0 18px 45px rgba(8,43,87,.08);text-align:center}.magazine-empty h2{color:#0b3f78;margin:.5rem 0}.magazine-empty p{color:#687b8f;max-width:620px;margin:0 auto}.magazine-empty-inline{padding:1rem 1.2rem;color:#687b8f;border-left:3px solid #d4af37;background:#fafcff;border-radius:10px}
  @media(max-width:900px){.devdaha-gallery-managed-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.devdaha-managed-magazines{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:620px){.devdaha-gallery-managed-grid{grid-template-columns:1fr}.devdaha-gallery-managed-grid .photo-wrap{height:230px}.devdaha-managed-magazines{grid-template-columns:1fr}}
  `;
  document.head.appendChild(st);
}
async function publicLoad(){try{const data=await getJSON('/api/public/content?page='+encodeURIComponent(PAGE_KEY));const ov=data.overrides||{};Object.keys(ov).forEach(p=>{const el=findOverrideTarget(p,ov[p]);if(el)applyOverride(el,ov[p])});const mm=data.marquee?.top;if(mm&&mm.active&&document.querySelector('#marquee-track')){const track=document.querySelector('#marquee-track');if(mm.text){track.dataset.marqueeText=mm.text;try{localStorage.setItem('devdahaTopMarqueeText',mm.text)}catch{}}}const nm=data.marquee?.notice;const wrap=document.querySelector('.notice-marquee-wrap');if(nm&&wrap){const label=wrap.querySelector('.notice-label'),track=wrap.querySelector('.notice-track');if(label)label.textContent=nm.label||'Notice';if(track&&nm.text){track.innerHTML='';const s=document.createElement('span');s.className='notice-item';s.textContent=nm.text;track.appendChild(s);const c=s.cloneNode(true);c.setAttribute('aria-hidden','true');track.appendChild(c)}if(!nm.active)wrap.style.display='none'}applyPublicNavigation(data);applyPublicSettings(data);renderPublicBlocks(data);renderPublicItems(data);renderPublicNotices(data);renderPublicDownloads(data)}catch(e){console.warn('Devdaha CMS unavailable; original static content remains active.',e)}}
function renderPublicBlocks(data){const arr=data.blocks||[];if(!arr.length)return;const old=document.getElementById('devdaha-managed-blocks');if(old)old.remove();const sec=document.createElement('section');sec.id='devdaha-managed-blocks';sec.className='devdaha-managed-blocks';arr.forEach(b=>{const el=document.createElement('article');el.className='devdaha-managed-block';el.innerHTML=`<h2>${esc(b.title)}</h2><p>${esc(b.body)}</p>${b.link?`<a href="${esc(b.link)}">${esc(b.link_text||'Learn More')}</a>`:''}`;sec.appendChild(el)});(document.querySelector('main')||document.body).appendChild(sec)}
function applyPublicNavigation(data){const items=(data.navigation||[]).filter(x=>Number(x.visible)!==0).sort((a,b)=>(a.sort_order??0)-(b.sort_order??0));if(!items.length)return;const page=PAGE_KEY.toLowerCase();function normalizeHref(href,label){let h=String(href||'#');if(page!=='devdaha.html'){if(h==='#hero')return 'Devdaha.html#hero';if(h==='#facilities')return 'Devdaha.html#facilities';if(h==='#magazine')return 'school-magazine.html';if(h==='#gallery')return 'Devdaha.html#gallery';if(h==='#suggestion-box')return 'Devdaha.html#suggestion-box';if(h==='#footer')return 'Devdaha.html#footer';}return h}function sync(root){if(!root)return;const links=[...root.querySelectorAll('a')].filter(a=>!a.closest('.devdaha-admin-link'));const used=new Set();items.forEach(item=>{const id=String(item.id);let a=links.find(x=>x.dataset.cmsNavId===id);if(!a)a=links.find(x=>!used.has(x)&&((x.getAttribute('href')||'')===(item.href||'')||(x.textContent||'').trim().toLowerCase()===(item.label||'').trim().toLowerCase()));if(a){a.dataset.cmsNavId=id;a.textContent=item.label||'';a.href=normalizeHref(item.href,item.label)||'#';used.add(a)}})}sync(document.querySelector('#site-nav .nav-links'));sync(document.querySelector('#mobile-menu'))} 

function applyPublicSettings(data){const s=data.settings||{};const map={schoolName:['.school-wordmark-single','.loader-school-name'],tagline:['[data-school-tagline]'],about:['[data-school-about]'],principal:['[data-school-principal]'],chairman:['[data-school-chairman]'],address:['[data-school-address]'],phone:['[data-school-phone]'],email:['[data-school-email]'],mission:['[data-school-mission]'],vision:['[data-school-vision]']};Object.entries(map).forEach(([k,selectors])=>{if(s[k]===undefined)return;selectors.forEach(sel=>document.querySelectorAll(sel).forEach(el=>{if(el.tagName==='INPUT'||el.tagName==='TEXTAREA')el.value=s[k];else el.textContent=s[k]}))})}
function ensureNoticeViewer(){
  if(document.getElementById('devdaha-notice-viewer')) return;
  const style=document.createElement('style');
  style.id='devdaha-notice-viewer-style';
  style.textContent=`
  .devdaha-notice-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:22px}
  .devdaha-notice-mini{display:flex;flex-direction:column;min-height:205px;padding:20px 20px 18px;border-radius:18px;background:linear-gradient(145deg,#fff,#f7fbff);border:1px solid rgba(18,82,143,.14);box-shadow:0 10px 28px rgba(8,43,85,.08);position:relative;overflow:hidden;transition:transform .3s ease,box-shadow .3s ease,border-color .3s ease}
  .devdaha-notice-mini::before{content:'';position:absolute;left:0;top:0;width:44%;height:3px;background:linear-gradient(90deg,#d4af37,transparent)}
  .devdaha-notice-mini:hover{transform:translateY(-5px);box-shadow:0 18px 38px rgba(8,43,85,.13);border-color:rgba(212,175,55,.45)}
  .devdaha-notice-mini .tag{align-self:flex-start;margin:0 0 10px;padding:5px 9px}
  .devdaha-notice-mini h2{font-size:1.18rem!important;line-height:1.25!important;margin:0 0 8px!important;color:#163a67!important}
  .devdaha-notice-summary{color:#53697c!important;font-size:.92rem;line-height:1.6;margin:0 0 16px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
  .devdaha-notice-meta{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:auto;color:#72869a;font-size:.76rem}
  .devdaha-notice-open{border:1px solid #c7a13a;background:#0b3f78;color:#fff;border-radius:999px;padding:8px 12px;font:700 .7rem/1 Manrope,Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
  .devdaha-notice-open:hover{background:#c7a13a;color:#17324d}
  #devdaha-notice-viewer{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(6,24,45,.58);backdrop-filter:blur(7px)}
  #devdaha-notice-viewer.open{display:flex}
  .devdaha-notice-modal{width:min(760px,100%);max-height:min(82vh,760px);overflow:auto;background:#fff;border-radius:24px;border:1px solid rgba(199,161,58,.45);box-shadow:0 28px 80px rgba(0,0,0,.28);padding:28px}
  .devdaha-notice-modal .tag{margin-bottom:12px}.devdaha-notice-modal h2{margin:0 0 8px;color:#163a67!important;font-size:clamp(1.7rem,3vw,2.4rem)!important}.devdaha-notice-modal .modal-date{color:#70849a;font-size:.8rem;margin-bottom:18px}.devdaha-notice-modal .modal-body{color:#294c73;white-space:pre-wrap;font-size:1rem;line-height:1.8}.devdaha-notice-close{float:right;border:0;background:#eef4fa;color:#163a67;border-radius:50%;width:38px;height:38px;font-size:20px;cursor:pointer}.devdaha-notice-link{display:inline-flex;margin-top:20px;padding:10px 15px;border-radius:999px;background:#0b3f78;color:#fff!important;text-decoration:none;font-weight:700}.devdaha-notice-link:hover{background:#c7a13a;color:#17324d!important}
  @media(max-width:900px){.devdaha-notice-list{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:620px){.devdaha-notice-list{grid-template-columns:1fr}.devdaha-notice-mini{min-height:190px}.devdaha-notice-modal{padding:22px;border-radius:18px}}
  .devdaha-notice-board{display:block!important;margin-top:24px}
  .devdaha-notice-latest{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(260px,.75fr);gap:0;background:linear-gradient(135deg,#062b55 0%,#0b4b82 58%,#0c6a9f 100%);border:1px solid rgba(212,175,55,.52);border-radius:26px;min-height:310px;box-shadow:0 24px 60px rgba(6,43,85,.22);margin-bottom:34px;isolation:isolate}
  .devdaha-notice-latest:before{content:'';position:absolute;inset:auto -80px -120px auto;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(212,175,55,.28),transparent 68%);pointer-events:none}
  .devdaha-notice-latest-copy{position:relative;z-index:2;padding:34px 34px 32px}
  .devdaha-notice-kicker{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px}.devdaha-notice-latest .tag{margin:0;background:rgba(255,255,255,.13);color:#ffe38a;border:1px solid rgba(255,255,255,.17)}
  .devdaha-latest-badge{display:inline-flex;align-items:center;border-radius:999px;padding:6px 10px;font-size:.68rem;line-height:1;text-transform:uppercase;letter-spacing:.09em;font-weight:800;background:#d4af37;color:#082b50}
  .devdaha-notice-latest h2{margin:0;color:#fff!important;font-size:clamp(1.8rem,3.4vw,3rem)!important;line-height:1.08!important;max-width:800px}
  .devdaha-notice-latest-date{margin-top:9px;color:rgba(255,255,255,.72);font-size:.8rem}.devdaha-notice-latest p{margin:18px 0 22px;color:rgba(255,255,255,.9)!important;max-width:780px;font-size:1rem;line-height:1.75}
  .devdaha-notice-open-latest{background:#fff;color:#0b3f78;border-color:#fff;font-size:.74rem;padding:11px 16px}.devdaha-notice-open-latest:hover{background:#d4af37;border-color:#d4af37;color:#082b50}
  .devdaha-notice-latest-media{min-height:100%;overflow:hidden;background:#0b355d}.devdaha-notice-latest-media img{width:100%;height:100%;min-height:310px;object-fit:cover;display:block;filter:saturate(1.02);transition:transform .6s ease}.devdaha-notice-latest:hover .devdaha-notice-latest-media img{transform:scale(1.04)}
  .devdaha-notice-archive-heading{display:flex;align-items:center;gap:14px;margin:8px 0 18px;color:#163a67;font-size:.8rem;font-weight:800;text-transform:uppercase;letter-spacing:.13em}.devdaha-notice-archive-heading i{height:1px;flex:1;background:linear-gradient(90deg,rgba(212,175,55,.6),transparent)}
  .devdaha-notice-archive{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
  .devdaha-notice-archive .devdaha-notice-mini{margin:0;min-height:220px}
  @media(max-width:900px){.devdaha-notice-latest{grid-template-columns:1fr}.devdaha-notice-latest-media{max-height:280px;order:-1}.devdaha-notice-latest-media img{min-height:220px}.devdaha-notice-archive{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:620px){.devdaha-notice-latest-copy{padding:26px 22px 24px}.devdaha-notice-latest{border-radius:20px}.devdaha-notice-latest-media img{min-height:210px}.devdaha-notice-archive{grid-template-columns:1fr}}
`;
  document.head.appendChild(style);
  const viewer=document.createElement('div');viewer.id='devdaha-notice-viewer';viewer.innerHTML='<div class="devdaha-notice-modal" role="dialog" aria-modal="true" aria-label="Notice details"><button class="devdaha-notice-close" type="button" aria-label="Close notice">×</button><div class="tag" data-v-category>Notice</div><h2 data-v-title></h2><div class="modal-date" data-v-date></div><div class="modal-body" data-v-body></div><div data-v-link></div></div>';
  document.body.appendChild(viewer);
  const close=()=>viewer.classList.remove('open');
  viewer.querySelector('.devdaha-notice-close').onclick=close;
  viewer.addEventListener('click',e=>{if(e.target===viewer)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  window.DEVDAHA_OPEN_NOTICE=(x)=>{viewer.querySelector('[data-v-category]').textContent=x.category||'Notice';viewer.querySelector('[data-v-title]').textContent=x.title||'Notice';viewer.querySelector('[data-v-date]').textContent=x.date||'';viewer.querySelector('[data-v-body]').textContent=x.body||x.description||'';const link=viewer.querySelector('[data-v-link]');link.innerHTML=x.link?`<a class="devdaha-notice-link" href="${esc(x.link)}" target="_blank" rel="noopener">${esc(x.link_text||'Open related link')}</a>`:'';viewer.classList.add('open')};
}
function renderPublicNotices(data){
  if(PAGE_KEY!=='notice.html')return;
  const items=(data.notices||[]).slice();
  const area=document.querySelector('.notice-area');
  if(!area)return;
  ensureNoticeViewer();
  let host=document.getElementById('devdaha-managed-notices');
  if(!host){host=document.createElement('div');host.id='devdaha-managed-notices';host.className='devdaha-notice-board';area.appendChild(host);}
  host.innerHTML='';

  // Newest CMS notice is always promoted to the top. Use creation/update timestamps
  // when available, then fall back to the numeric id without changing the stored data.
  const timeOf=x=>{
    for(const k of ['created_at','createdAt','published_at','date','updated_at','updatedAt']){
      const v=x?.[k]; if(!v) continue;
      const t=Date.parse(v); if(Number.isFinite(t)) return t;
      const n=Number(v); if(Number.isFinite(n)) return n;
    }
    const id=Number(x?.id); return Number.isFinite(id)?id:0;
  };
  items.sort((a,b)=>timeOf(b)-timeOf(a));

  const latest=items[0];
  if(latest){
    const featured=document.createElement('article');
    featured.className='devdaha-notice-latest';
    featured.dataset.devdahaItemId=String(latest.id);
    featured.dataset.devdahaItemType='notice';
    const summary=(latest.body||latest.description||'').trim();
    const media=latest.media?.url?`<div class="devdaha-notice-latest-media"><img src="${esc(latest.media.url)}" alt="${esc(latest.media.alt_text||latest.title||'Notice')}" loading="lazy"></div>`:'';
    featured.innerHTML=`<div class="devdaha-notice-latest-copy"><div class="devdaha-notice-kicker"><span class="tag">${esc(latest.category||'Notice')}</span><span class="devdaha-latest-badge">Latest notice</span></div><h2>${esc(latest.title||'Notice')}</h2><div class="devdaha-notice-latest-date">${esc(latest.date||latest.created_at||'')}</div><p>${esc(summary)}</p><button class="devdaha-notice-open devdaha-notice-open-latest" type="button">Open latest notice</button></div>${media}`;
    featured.querySelector('.devdaha-notice-open-latest').onclick=()=>window.DEVDAHA_OPEN_NOTICE(latest);
    host.appendChild(featured);
  }

  const older=items.slice(1);
  if(older.length){
    const heading=document.createElement('div');
    heading.className='devdaha-notice-archive-heading';
    heading.innerHTML='<span>Previous notices</span><i aria-hidden="true"></i>';
    host.appendChild(heading);
    const grid=document.createElement('div');
    grid.className='devdaha-notice-archive';
    older.forEach(x=>{
      const article=document.createElement('article');
      article.className='devdaha-notice-mini notice-card';
      article.dataset.devdahaItemId=String(x.id);article.dataset.devdahaItemType='notice';
      const summary=(x.body||x.description||'').trim();
      article.innerHTML=`<span class="tag">${esc(x.category||'Notice')}</span><h2>${esc(x.title||'Notice')}</h2><p class="devdaha-notice-summary">${esc(summary)}</p><div class="devdaha-notice-meta"><span>${esc(x.date||x.created_at||'')}</span><button class="devdaha-notice-open" type="button">View notice</button></div>`;
      article.querySelector('.devdaha-notice-open').onclick=()=>window.DEVDAHA_OPEN_NOTICE(x);
      grid.appendChild(article);
    });
    host.appendChild(grid);
  }

  if(!items.length){host.innerHTML='<div class="devdaha-notice-empty"><strong>No notices published yet.</strong><span>New notices will appear here as soon as the administration publishes them.</span></div>'; }
}
function renderPublicDownloads(data){if(PAGE_KEY!=='downloads.html')return;const arr=data.downloads||[];const host=document.getElementById('downloads-list')||document.querySelector('main');if(!host)return;host.innerHTML='';arr.forEach(x=>{const a=x.file_media?.url||x.media?.url||x.link||'';const card=document.createElement('article');card.className='download-card';card.innerHTML=`<div class=\"download-icon\" aria-hidden=\"true\">PDF</div><div class=\"download-body\"><h2>${esc(x.title||'Download')}</h2><p>${esc(x.description||x.body||'')}</p></div><a class=\"download-btn\" href=\"${esc(a)}\" target=\"_blank\" rel=\"noopener\" download>Download</a>`;host.appendChild(card)})}
function renderPublicMagazines(items){if(PAGE_KEY!=='school-magazine.html')return;const host=document.getElementById('magazine-list');if(!host)return;host.innerHTML='';if(!items.length){host.innerHTML='<div class="magazine-empty-inline">No magazine editions have been published yet.</div>';return;}const grid=document.createElement('div');grid.className='devdaha-managed-magazines';items.slice().sort((a,b)=>(Date.parse(b.created_at||b.updated_at||'')||0)-(Date.parse(a.created_at||a.updated_at||'')||0)).forEach(x=>{const card=document.createElement('article');card.className='devdaha-managed-magazine';card.dataset.devdahaItemId=String(x.id);card.dataset.devdahaItemType='magazine';const img=x.media?.url?`<img src="${esc(x.media.url)}" alt="${esc(x.media.alt_text||x.title||'Magazine cover')}" loading="lazy">`:'';const link=x.link||x.file_media?.url||x.media?.url||'';card.innerHTML=`${img}<div class="devdaha-mag-body"><span class="tag">Magazine</span><h2>${esc(x.title||'School Magazine')}</h2><div class="devdaha-mag-date">${esc(x.date||'')}</div><p>${esc(x.description||x.body||'')}</p>${link?`<a href="${esc(link)}" target="_blank" rel="noopener">Open edition</a>`:''}</div>`;grid.appendChild(card)});host.appendChild(grid)}
function renderPublicItems(data){
  const testimonials=data.testimonials||[];
  renderPublicMagazines(data.magazines||[]);
  if(PAGE_KEY==='school-magazine.html'||PAGE_KEY==='weekly-eca.html')return;
  const managedAll=[...(data.galleries||[]),...(data.events||[]),...(data.achievements||[]),...(data.eca||[])];
  if(PAGE_KEY==='testimonials.html'){
    renderPublicTestimonials(testimonials);
  }
  if(!managedAll.length)return;
  const old=document.getElementById('devdaha-managed-items');if(old)old.remove();
  const sec=document.createElement('section');sec.id='devdaha-managed-items';sec.className='devdaha-managed-media';
  const grid=document.createElement('div');grid.className='devdaha-gallery-managed-grid';
  managedAll.forEach(x=>{
    const card=document.createElement('article');card.className='photo-card';card.dataset.devdahaItemId=String(x.id);card.dataset.devdahaItemType=String(x.type||'');card.tabIndex=0;
    const media=x.media?.url?`<div class="photo-wrap"><img src="${esc(x.media.url)}" alt="${esc(x.media.alt_text||x.title||'School media')}"></div>`:'';
    card.innerHTML=`${media}<div class="photo-info"><span>${esc((x.type||'').replaceAll('-',' '))}</span><h2>${esc(x.title)}</h2><p>${esc(x.description||x.body||'')}</p>${x.link?`<a href="${esc(x.link)}">${esc(x.link_text||'Learn More')}</a>`:''}</div>`;
    grid.appendChild(card);
  });
  sec.appendChild(grid);(document.querySelector('.photo-grid,.gallery-grid')||document.querySelector('main')||document.body).appendChild(sec);
}
function renderPublicTestimonials(items){
  const grid=document.querySelector('.testimonial-grid');
  if(!grid)return;
  let host=document.getElementById('devdaha-managed-testimonials');
  if(!host){host=document.createElement('div');host.id='devdaha-managed-testimonials';host.className='devdaha-managed-testimonials';grid.insertAdjacentElement('afterend',host);}
  host.innerHTML='';
  if(!items.length)return;
  items.slice().sort((a,b)=>{const ta=Date.parse(a.created_at||a.updated_at||'')||0;const tb=Date.parse(b.created_at||b.updated_at||'')||0;return ta-tb}).forEach(x=>{
    const article=document.createElement('article');
    article.className='card devdaha-cms-testimonial';
    article.dataset.devdahaItemId=String(x.id);article.dataset.devdahaItemType='testimonial';
    const img=x.media?.url?`<img class="testimonial-card-photo devdaha-cms-testimonial-photo" src="${esc(x.media.url)}" alt="${esc(x.media.alt_text||x.title||'Testimonial photo')}" loading="lazy">`:'';
    article.innerHTML=`${img}<div class="quote">“</div><blockquote>${esc(x.body||x.description||'')}</blockquote><div class="person"><strong>${esc(x.title||'Name')}</strong><small>${esc(x.category||'School Community')}</small></div>`;
    host.appendChild(article);
  });
  if(!document.getElementById('devdaha-managed-testimonials-style')){
    const st=document.createElement('style');st.id='devdaha-managed-testimonials-style';st.textContent=`
      .devdaha-managed-testimonials{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6.5rem 1.25rem;max-width:1180px;margin:0 auto 7rem;padding:0 4%;}
      .devdaha-cms-testimonial{position:relative!important;overflow:visible!important;padding:2.25rem 2rem 2rem!important;min-height:300px!important;display:flex!important;flex-direction:column!important;}
      .devdaha-cms-testimonial blockquote{margin:1.1rem 0!important;line-height:1.8!important;color:var(--muted,#647789)!important;font-size:1rem!important;flex:1!important;}
      .devdaha-cms-testimonial .person{border-top:1px solid rgba(16,42,67,.1)!important;padding-top:1rem!important;}
      .devdaha-cms-testimonial-photo{position:absolute!important;left:16px!important;top:-56px!important;width:86px!important;height:112px!important;object-fit:cover!important;object-position:center top!important;border-radius:7px!important;border:4px solid #fff!important;box-shadow:0 12px 28px rgba(16,42,67,.24)!important;z-index:6!important;background:#eef2f6!important;}
      .devdaha-cms-testimonial .quote{position:relative!important;z-index:2!important;}
      @media(max-width:850px){.devdaha-managed-testimonials{grid-template-columns:repeat(2,minmax(0,1fr));}}
      @media(max-width:560px){.devdaha-managed-testimonials{grid-template-columns:1fr;gap:5.75rem;padding:2.5rem 4% 0;}.devdaha-cms-testimonial{padding:2rem 1.35rem 1.4rem!important;min-height:260px!important;}.devdaha-cms-testimonial-photo{left:14px!important;top:-52px!important;width:78px!important;height:102px!important;}}`;
    document.head.appendChild(st);
  }
}
async function adminMode(){if(!VISUAL_EDIT_MODE)return;makeEditable();try{const me=await getJSON('/api/auth/me');document.body.dataset.devdahaAuthenticated=me.authenticated?'1':'0'}catch{document.body.dataset.devdahaAuthenticated='0'}}
function editorStyle(){if(document.getElementById('devdaha-editor-style'))return;const st=document.createElement('style');st.id='devdaha-editor-style';st.textContent=`.devdaha-edit-active [data-devdaha-editable]{outline:2px dashed rgba(201,162,74,.85)!important;outline-offset:4px;cursor:pointer!important}.devdaha-edit-active [data-devdaha-item-id]{outline:2px solid rgba(201,162,74,.95)!important;outline-offset:5px;cursor:pointer!important;position:relative}.devdaha-edit-active [data-devdaha-item-id]::after{content:'EDIT';position:absolute;top:10px;right:10px;background:#0b3f78;color:#fff;border:1px solid #d5b45b;border-radius:999px;padding:5px 8px;font:700 10px/1 Manrope,Arial,sans-serif;letter-spacing:.08em;pointer-events:none}.devdaha-editor-mask{position:fixed;inset:0;background:rgba(8,43,87,.18);backdrop-filter:blur(2px);z-index:2147483644}.devdaha-editor-panel{position:fixed;right:18px;bottom:18px;width:min(460px,calc(100vw - 24px));max-height:88vh;overflow:auto;z-index:2147483646;background:#fff;color:#17324d;border:1px solid #dce5ef;border-radius:20px;padding:18px;box-shadow:0 25px 75px rgba(8,43,87,.22);font:14px/1.5 Manrope,Arial,sans-serif}.devdaha-editor-panel h3{margin:0 0 5px;color:#0b3f78;font:600 1.55rem/1.05 Fraunces,Georgia,serif}.devdaha-editor-panel .sub{color:#687b8f;font-size:12px;margin-bottom:12px}.devdaha-editor-panel label{display:block;margin:10px 0 5px;color:#5c7187;font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase}.devdaha-editor-panel input,.devdaha-editor-panel textarea,.devdaha-editor-panel select{width:100%;box-sizing:border-box;padding:10px 11px;border:1px solid #cfdbe7;border-radius:11px;background:#fff;color:#17324d;font:inherit;outline:none}.devdaha-editor-panel input:focus,.devdaha-editor-panel textarea:focus,.devdaha-editor-panel select:focus{border-color:#78a0c9;box-shadow:0 0 0 3px rgba(22,94,168,.10)}.devdaha-editor-panel button{padding:10px 13px;border:1px solid #d1ae45;border-radius:999px;background:#0b3f78;color:#fff;font:800 .72rem/1 Manrope,Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}.devdaha-editor-panel button.secondary{background:#fff;color:#0b3f78;border-color:#cfdbe7}.devdaha-editor-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:15px}.devdaha-editor-media{display:flex;align-items:center;gap:10px;margin-top:8px}.devdaha-editor-media img{width:74px;height:58px;object-fit:cover;border-radius:10px;border:1px solid #dce5ef}.devdaha-editor-note{margin-top:10px;padding:9px 11px;border-radius:11px;background:#f5f8fb;border:1px solid #e0e8f0;color:#687b8f;font-size:12px}@media(max-width:600px){.devdaha-editor-panel{right:8px;bottom:8px;width:calc(100vw - 16px);padding:15px}.devdaha-editor-row{grid-template-columns:1fr}.devdaha-edit-active [data-devdaha-item-id]::after{top:7px;right:7px}}`;document.head.appendChild(st)}
function closeEditor(){document.querySelectorAll('.devdaha-editor-panel,.devdaha-editor-mask').forEach(x=>x.remove())}
async function uploadEditorMedia(accept,title){const input=document.createElement('input');input.type='file';input.accept=accept||'image/*,video/*';input.style.display='none';document.body.appendChild(input);return new Promise(resolve=>{input.onchange=async()=>{const file=input.files?.[0];if(!file){input.remove();resolve(null);return}const fd=new FormData();fd.append('files',file);if(title)fd.append('title',title);fd.append('folder','general');try{const r=await fetch('/api/admin/media',{method:'POST',credentials:'same-origin',body:fd});const d=await r.json();if(!r.ok)throw new Error(d.error||'Upload failed');resolve(d[0]||null)}catch(e){alert(e.message);resolve(null)}finally{input.remove()}};input.click()})}
async function openCmsItemEdit(card){closeEditor();const id=card.dataset.devdahaItemId;const type=card.dataset.devdahaItemType;const xs=await getJSON('/api/admin/items?type='+encodeURIComponent(type));const x=xs.find(v=>String(v.id)===String(id));if(!x){alert('CMS item not found.');return}const media=await getJSON('/api/admin/media');const images=media.filter(v=>String(v.mime_type||'').startsWith('image/'));const mask=document.createElement('div');mask.className='devdaha-editor-mask';mask.onclick=closeEditor;const panel=document.createElement('div');panel.className='devdaha-editor-panel';panel.innerHTML=`<h3>Edit ${esc(type.replaceAll('-',' '))}</h3><div class="sub">This updates the same CMS record used by the Admin panel.</div><label>Title</label><input data-f="title" value="${esc(x.title||'')}"><label>Description / text</label><textarea data-f="body" rows="6">${esc(x.body||x.description||'')}</textarea><label>Category</label><input data-f="category" value="${esc(x.category||'')}"><label>Image</label><div style="display:flex;gap:8px"><select data-f="image_id" style="flex:1"><option value="">No image</option>${images.map(m=>`<option value="${esc(m.id)}" ${String(x.image_id||'')===String(m.id)?'selected':''}>${esc(m.title||m.original_name)}</option>`).join('')}</select><button type="button" data-upload>Upload</button></div><div class="devdaha-editor-media" data-preview></div><label>Link</label><input data-f="link" value="${esc(x.link||'')}"><label>Visible</label><select data-f="visible"><option value="1" ${x.visible!==0?'selected':''}>Visible</option><option value="0" ${x.visible===0?'selected':''}>Hidden</option></select><label>Published</label><select data-f="published"><option value="1" ${x.published!==0?'selected':''}>Published</option><option value="0" ${x.published===0?'selected':''}>Draft</option></select><div class="devdaha-editor-note">Changes are saved directly to the CMS. The page is refreshed after saving.</div><div class="devdaha-editor-row"><button type="button" data-save>Save changes</button><button type="button" class="secondary" data-cancel>Cancel</button></div>`;document.body.append(mask,panel);const map=new Map(images.map(m=>[String(m.id),m]));const preview=()=>{const m=map.get(String(panel.querySelector('[data-f=image_id]').value));panel.querySelector('[data-preview]').innerHTML=m?`<img src="${esc(m.url)}" alt="${esc(m.alt_text||m.title||'Selected image')}"><span class="sub">${esc(m.title||m.original_name)}</span>`:''};panel.querySelector('[data-f=image_id]').onchange=preview;panel.querySelector('[data-upload]').onclick=async()=>{const m=await uploadEditorMedia('image/*',panel.querySelector('[data-f=title]').value.trim());if(!m)return;map.set(String(m.id),m);panel.querySelector('[data-f=image_id]').insertAdjacentHTML('beforeend',`<option value="${esc(m.id)}">${esc(m.title||m.original_name)}</option>`);panel.querySelector('[data-f=image_id]').value=m.id;preview()};preview();panel.querySelector('[data-cancel]').onclick=closeEditor;panel.querySelector('[data-save]').onclick=async()=>{const val=k=>panel.querySelector(`[data-f="${k}"]`).value;try{await put('/api/admin/items/'+x.id,{type,page:x.page||PAGE_KEY,title:val('title').trim(),body:val('body').trim(),description:val('body').trim(),category:val('category').trim(),image_id:val('image_id')||null,link:val('link').trim(),visible:val('visible'),published:val('published'),featured:x.featured,sort_order:x.sort_order});closeEditor();const fresh=await getJSON('/api/public/content?page='+encodeURIComponent(PAGE_KEY));renderPublicBlocks(fresh);renderPublicItems(fresh);renderPublicNotices(fresh);makeEditable();editorToast('Saved to CMS')}catch(e){alert(e.message)}}}
function editorToast(msg){let t=document.getElementById('devdaha-editor-toast');if(!t){t=document.createElement('div');t.id='devdaha-editor-toast';t.style.cssText='position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:2147483647;background:#0b3f78;color:#fff;padding:10px 15px;border-radius:999px;font:700 12px Manrope,Arial,sans-serif;box-shadow:0 12px 30px rgba(8,43,87,.18)';document.body.appendChild(t)}t.textContent=msg;clearTimeout(t._timer);t._timer=setTimeout(()=>t.remove(),2400)}
function pickEditableTarget(node){let el=node&&node.nodeType===1?node:node?.parentElement;while(el&&el!==document.body){if(el.closest('.devdaha-editor-panel,.devdaha-editor-mask,.devdaha-admin-link,nav,footer'))return null;if(el.dataset.devdahaItemId||el.dataset.devdahaTestimonialId)return el;if(['IMG','VIDEO','A','BUTTON','H1','H2','H3','H4','H5','H6','P','LI','BLOCKQUOTE','FIGCAPTION'].includes(el.tagName))return el;if(['DIV','SPAN'].includes(el.tagName)&&el.textContent.trim()&&el.children.length<=2){const rect=el.getBoundingClientRect();if(rect.width>0&&rect.height>0)return el}el=el.parentElement}return null}
function editorHint(){let h=document.getElementById('devdaha-visual-editor-hint');if(h)return h;h=document.createElement('div');h.id='devdaha-visual-editor-hint';h.textContent='VISUAL EDIT MODE · Click any highlighted content to edit';h.style.cssText='position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:2147483640;padding:8px 13px;border-radius:999px;background:#0b3f78;color:#fff;border:1px solid #d4af37;box-shadow:0 10px 28px rgba(8,43,87,.18);font:800 11px/1 Manrope,Arial,sans-serif;letter-spacing:.06em;pointer-events:none';document.body.appendChild(h);return h}
function makeEditable(){if(document.body.dataset.devdahaVisualReady==='1')return;document.body.dataset.devdahaVisualReady='1';document.body.classList.add('devdaha-edit-active');editorStyle();editorHint();const targets=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,button,img,video,li,blockquote,figcaption')].filter(el=>{if(el.closest('.devdaha-editor-panel,.devdaha-editor-mask,.devdaha-admin-link,nav,footer,[aria-hidden="true"]'))return false;if(['SCRIPT','STYLE','HTML','BODY','HEAD'].includes(el.tagName))return false;if(el.closest('svg'))return false;return el.textContent.trim()||el.tagName==='IMG'||el.tagName==='VIDEO'});targets.forEach(el=>{el.dataset.devdahaEditable='1'});document.addEventListener('pointerover',e=>{if(!VISUAL_EDIT_MODE)return;const el=pickEditableTarget(e.target);if(!el)return;document.querySelectorAll('.devdaha-visual-hover').forEach(x=>x.classList.remove('devdaha-visual-hover'));el.classList.add('devdaha-visual-hover')},true);document.addEventListener('pointerout',e=>{const el=e.target?.closest?.('.devdaha-visual-hover');if(el)el.classList.remove('devdaha-visual-hover')},true);document.addEventListener('click',e=>{if(!VISUAL_EDIT_MODE)return;if(e.target.closest('.devdaha-editor-panel,.devdaha-editor-mask,.devdaha-admin-link'))return;const el=pickEditableTarget(e.target);if(!el)return;e.preventDefault();e.stopImmediatePropagation();if(el.dataset.devdahaItemId||el.dataset.devdahaTestimonialId){openCmsItemEdit(el)}else{openEdit(el)}},true)}
function openEdit(el){closeEditor();const panel=document.createElement('div');panel.className='devdaha-editor-panel';panel.dataset.modal='1';const img=el.tagName==='IMG',vid=el.tagName==='VIDEO',a=el.tagName==='A';let form='';if(img){form=`<label>Image</label><div style="display:flex;gap:8px"><input data-f="src" value="${esc(el.getAttribute('src')||'')}"><button type="button" data-upload>Upload</button></div><label>Alt text</label><input data-f="alt" value="${esc(el.alt||'')}">`}else if(vid){form=`<label>Video</label><div style="display:flex;gap:8px"><input data-f="src" value="${esc(el.currentSrc||el.getAttribute('src')||'')}"><button type="button" data-upload>Upload</button></div>`}else{form=`<label>Text</label><textarea data-f="text" rows="6">${esc(el.textContent)}</textarea>${a?`<label>Link</label><input data-f="href" value="${esc(el.getAttribute('href')||'')}">`:''}`}panel.innerHTML=`<h3>Edit ${el.tagName.toLowerCase()}</h3><div class="sub">This saves a page override for ${esc(PAGE_KEY)}.</div>${form}<div class="devdaha-editor-row"><button type="button" data-save>Save</button><button type="button" class="secondary" data-cancel>Cancel</button></div>`;document.body.appendChild(panel);const up=panel.querySelector('[data-upload]');if(up)up.onclick=async()=>{const m=await uploadEditorMedia(img?'image/*':'video/*',el.getAttribute('alt')||'');if(m)panel.querySelector('[data-f=src]').value=m.url};panel.querySelector('[data-cancel]').onclick=closeEditor;panel.querySelector('[data-save]').onclick=async()=>{const data={};if(img){data.src=panel.querySelector('[data-f=src]').value.trim();data.alt=panel.querySelector('[data-f=alt]').value}else if(vid){data.src=panel.querySelector('[data-f=src]').value.trim()}else{data.text=panel.querySelector('[data-f=text]').value;if(a)data.href=panel.querySelector('[data-f=href]').value.trim()}data.__anchor=overrideAnchor(el);const selector=cssPath(el);applyOverride(el,data);try{await put('/api/admin/overrides',{page:PAGE_KEY,selector,data});closeEditor();editorToast('Saved to server')}catch(e){alert(e.message)}}}
function injectAdminButton(){if(PAGE_KEY==='admin.html'||PAGE_KEY==='admin-login.html')return;if(document.querySelector('[data-devdaha-admin-link]'))return;const a=document.createElement('a');a.href='admin-login.html';a.textContent='ADMIN LOGIN';a.dataset.devdahaAdminLink='1';a.setAttribute('aria-label','Open school administration panel');a.className='devdaha-admin-link';const nav=document.querySelector('nav');if(nav){nav.appendChild(a);return}const header=document.querySelector('header');if(header)(header.querySelector('.nav-inner,.wrap,.topbar .wrap')||header).appendChild(a);else document.body.appendChild(a)}
window.DEVDAHA_ADMIN={api,getJSON,put,post,del,logout:async()=>{try{await post('/api/auth/logout',{})}finally{location.href='admin-login.html'}}};
document.addEventListener('DOMContentLoaded',()=>{if(PAGE_KEY!=='admin.html'&&PAGE_KEY!=='admin-login.html'){injectStyle();injectAdminButton();publicLoad().finally(()=>adminMode())}});
})();
