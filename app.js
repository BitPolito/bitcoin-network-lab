const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
const sl=ms=>new Promise(r=>setTimeout(r,ms));
const h=s=>{let x=5381;for(const c of s)x=((x<<5)+x+c.charCodeAt(0))>>>0;return x.toString(16).padStart(8,'0')};
const N={W:{x:70,y:170,t:'spv',l:'Il tuo wallet'},F1:{x:210,y:60,t:'full'},F2:{x:210,y:280,t:'full'},F3:{x:400,y:170,t:'full'},F4:{x:590,y:60,t:'full'},F5:{x:590,y:280,t:'full'},M:{x:730,y:170,t:'full',l:'Miner'}};
const E=[['W','F1'],['W','F2'],['F1','F2'],['F1','F3'],['F2','F3'],['F3','F4'],['F3','F5'],['F4','F5'],['F4','M'],['F5','M']];
const S={tx:[],chain:[{i:0,h:h('g')}],step:-1,busy:false,n:0};
const nb=a=>E.filter(e=>e.includes(a)).map(e=>e[0]===a?e[1]:e[0]).filter(k=>!N[k].off);
const net=$('net');
function mk(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);(p||net).appendChild(e);return e}
E.forEach(([a,b])=>mk('line',{x1:N[a].x,y1:N[a].y,x2:N[b].x,y2:N[b].y}));
for(const k in N){const n=N[k];n.has=new Set();
 const og=mk('g',{transform:`translate(${n.x-24} ${n.y-24})`});n.g=mk('g',{class:'nd '+n.t},og);
 mk('rect',{width:48,height:48,rx:8},n.g);
 if(n.t==='full'){[[12,12],[30,12],[18,24],[12,33],[30,33]].forEach(([x,y])=>mk('rect',{class:'px',x,y,width:6,height:6,rx:0,style:'stroke:none;fill:var(--bg)'},n.g))}
 else mk('text',{x:24,y:31,style:'font-size:18px;fill:var(--mu)'},n.g).textContent='₿';
 mk('text',{x:24,y:68},n.g).textContent=n.l||k.replace('F','Full ');
 n.bd=mk('text',{x:24,y:-6,class:'bd'},n.g);n.ch=mk('text',{x:24,y:-22,class:'bd ch'},n.g);n.h=0}
function badges(){for(const k in N){const n=N[k];
 if(n.off){n.bd.textContent='offline';n.ch.textContent='';continue}
 if(n.t==='full'){const c=S.tx.filter(t=>n.has.has(t.id)).length;n.bd.textContent=c?c+' in mempool':''}else n.bd.textContent='';
 n.ch.textContent=S.chain.length>1?(n.t==='full'?'⛓ blocco #':'intestazioni #')+n.h:''}}
function fly(a,b,col){return new Promise(r=>{const c=mk('circle',{r:col==='blk'?9:6});c.style.fill=col==='bad'?'var(--rd)':'var(--fg)';c.style.stroke='var(--bg)';c.style.strokeWidth=2;
 c.animate([{transform:`translate(${N[a].x}px,${N[a].y}px)`},{transform:`translate(${N[b].x}px,${N[b].y}px)`}],{duration:600,easing:'ease-in-out',fill:'forwards'}).onfinish=()=>{c.remove();r()}})}
function pulse(k,cls){const g=N[k].g;g.classList.remove('hit','bad');void g.getBBox();g.classList.add(cls);setTimeout(()=>g.classList.remove(cls),800)}
function arrive(k,id,kind,ids,label){
 if(kind==='bad'){pulse(k,'bad');N[k].bd.textContent=label||'✕ rifiutata';setTimeout(badges,1400);return}
 if(kind==='blk'){ids.forEach(i=>N[k].has.delete(i));N[k].h=S.chain.length-1}else N[k].has.add(id);
 pulse(k,'hit');badges()}
async function gossip(from,id,kind,ids,label){const seen=new Set([from]);let lv=[from];
 while(lv.length){const nx=[],fl=[];
  for(const a of lv)for(const b of nb(a))if(!seen.has(b)){seen.add(b);nx.push(b);fl.push(fly(a,b,kind).then(()=>{if(N[b].t==='full')arrive(b,id,kind,ids,label)}))}
  await Promise.all(fl);if(kind==='bad')break;lv=nx}}
function addTx(mine,fee,inst,from){let id;do{id=h('t'+(++S.n)+Math.random()).slice(0,4)}while(S.tx.some(x=>x.id===id));const t={id,fee,mine,blk:null};S.tx.push(t);
 if(inst)for(const k in N)N[k].has.add(t.id);renderTray();badges();return t}
const cards={};
function renderTray(){const p=S.tx.filter(t=>!t.blk).sort((a,b)=>b.fee-a.fee),tr=$('tray');
 for(const id in cards)if(!p.find(t=>t.id===id)){const c=cards[id];c.style.top='-50px';c.style.opacity=0;c.style.transform='scale(.4)';setTimeout(()=>c.remove(),800);delete cards[id]}
 p.forEach((t,i)=>{let c=cards[t.id];if(!c){c=cards[t.id]=document.createElement('div');c.className='card'+(t.mine?' me':'');c.innerHTML=`<b>${t.id}</b><small>fee ${t.fee.toFixed(2)}</small>`;c.style.left=i*76+'px';c.style.top='-40px';c.style.opacity=0;tr.appendChild(c);c.getBoundingClientRect()}
  c.style.left=i*76+'px';c.style.top='0';c.style.opacity=1})}
function renderChain(){$('chain').innerHTML=S.chain.map((b,i)=>`<div class="blk${b.me?' me':''}" id="b${b.i}" ${i<S.chain.length-1?'style="animation:none"':''}><b>#${b.i}</b><small>${b.h.slice(0,6)}</small><small>${b.i?b.ids.length+' tx':'genesi'}</small></div>`).join('')}
async function mineBlock(anim){
 let p=S.tx.filter(t=>!t.blk);while(p.length<3){addTx(false,+(Math.random()*.4+.01).toFixed(2),true);p=S.tx.filter(t=>!t.blk)}
 const top=p.sort((a,b)=>b.fee-a.fee).slice(0,3),prev=S.chain[S.chain.length-1];
 const b={i:S.chain.length,ids:top.map(t=>t.id),root:h(top.map(t=>t.id).join('+')),me:top.some(t=>t.mine)};b.h='0000'+h(prev.h+b.root);
 if(anim){top.forEach(t=>cards[t.id].style.borderColor='var(--gr)');await sl(700)}
 top.forEach(t=>t.blk=b.i);S.chain.push(b);N.M.h=b.i;renderTray();renderChain();
 if(anim){await sl(500);N.M.has=new Set([...N.M.has].filter(i=>!b.ids.includes(i)));await gossip('M',b.h,'blk',b.ids);N.W.h=b.i}
 else for(const k in N){b.ids.forEach(i=>N[k].has.delete(i));if(!N[k].off)N[k].h=b.i}
 badges();return b}
function say(h,cls){const c=document.createElement('span');c.className='chip '+(cls||'');c.textContent=h;$('panel').appendChild(c)}
const STEPS=[
{t:'Chi c\'è nella rete?',d:'Ogni quadrato blu è un full node: scarica, valida e conserva tutta la timechain. Il tuo wallet è un nodo SPV (tratteggiato): porta con sé solo le intestazioni dei blocchi.',b:'Accendi i nodi',
 f:async()=>{for(const k of Object.keys(N)){pulse(k,'hit');await sl(250)}say('5 full node + 1 miner: verificano tutto da soli','g');say('SPV: si fida delle prove, non scarica i blocchi');say('Ogni full node valida, propaga e archivia la timechain')}},
{t:'Nasce una transazione',d:'Il wallet la firma e la invia ai vicini. Ogni full node controlla firma e fondi e, solo se è valida, la inoltra ai suoi vicini.',b:'Invia 1 ₿ ad Alice',
 f:async()=>{const t=addTx(true,0.2,false);say('Tx '+t.id+': 1 ₿ → Alice, fee 0.20');await gossip('W',t.id,'tx');say('✓ Tutti i full node l\'hanno validata e messa in mempool','g')}},
{t:'La mempool',d:'Le transazioni valide non ancora confermate aspettano in ogni nodo. Chi paga più fee passa davanti.',b:'Arriva altro traffico',
 f:async()=>{const ks=['F1','F2','F3','F4','F5'];const ps=[];for(let i=0;i<4;i++){const t=addTx(false,+(Math.random()*.4+.01).toFixed(2),false);N[ks[i]].has.add(t.id);ps.push(gossip(ks[i],t.id,'tx'));await sl(300)}await Promise.all(ps);say('Si riordinano per fee: quella del wallet è in cima?')}},
{t:'Il blocco',d:'Il miner prende le transazioni con la fee più alta, trova il blocco e lo propaga: ogni nodo lo valida e svuota la mempool.',b:'⛏ Mina un blocco',
 f:async()=>{const b=await mineBlock(true);say('Blocco #'+b.i+' con '+b.ids.length+' tx (le più ricche di fee)','g');if(!b.me)say('La tua tx non c\'era: fee troppo bassa, aspetta il prossimo!','r')}},
{t:'Il nodo leggero (SPV)',d:'Il wallet non ha il blocco intero: chiede a un full node la prova di Merkle e la confronta con l\'intestazione che già possiede.',b:'Verifica la mia tx',
 f:async()=>{let b=S.chain.find(x=>x.me);if(!b){addTx(true,5,true);b=await mineBlock(false);b.me=true;renderChain()}
  const id=S.tx.find(t=>t.mine&&t.blk===b.i).id;
  say('SPV: «Il blocco #'+b.i+' contiene '+id+'?»');await fly('W','F1','blk');await fly('F1','W','blk');
  const c=[['hash tx '+h(id).slice(-6),''],['+ fratello '+h(id+'x').slice(-6),''],['+ fratello '+h(id+'y').slice(-6),''],['= radice '+b.root,''],['✓ coincide con l\'intestazione','g']];
  for(const [x,k] of c){await sl(550);say(x,k)}await sl(550);say('Ti fidi di un solo nodo: con il tuo full node verificheresti da solo','r');document.getElementById('b'+b.i).scrollIntoView({inline:'center',block:'nearest'})}},
{t:'Provare a barare',d:'Gli stessi fondi spesi due volte: ogni full node controlla da solo e rifiuta la seconda. Nessuno si fida di nessuno.',b:'Spendi due volte',
 f:async()=>{const t=addTx(true,0.3,false);say('1ª tx: 1 ₿ → Alice');await gossip('W',t.id,'tx');say('✓ Accettata','g');await sl(500);
  say('2ª tx: gli stessi fondi → Bob','');await gossip('W','dbl','bad');say('✕ Rifiutata da tutti: l\'input è già speso','r')}},
{t:'Un blocco fuori dalle regole',d:'Il consenso è un insieme di regole condivise e ogni nodo le applica da solo. Se un miner si assegna più bitcoin del permesso, il suo blocco viene scartato, non importa quanto lavoro abbia fatto.',b:'Il miner bara sul sussidio',
 f:async()=>{say('Il miner costruisce un blocco che si assegna 100 ₿ invece di 3,125 ₿');await sl(500);await gossip('M','inv','bad',null,'✕ blocco rifiutato');
  say('✕ I full node lo rifiutano e non lo inoltrano: viola le regole di consenso','r');await sl(600);
  say('Sono i nodi, non i miner, a far rispettare le regole','g');await sl(500);say('Cambiarle (soft fork, hard fork) richiede che i nodi le adottino')}},
{t:'Se un nodo cade, la rete resta in piedi',d:'Nessun nodo è indispensabile: se uno si spegne, gli altri continuano a propagare transazioni e blocchi. Quando torna online si risincronizza dai vicini, come un amico che ritrova il quaderno aggiornato.',b:'Spegni il Full 1',
 f:async()=>{const f=N.F1;f.off=true;f.g.classList.add('off');badges();
  say('Full 1 è offline: guasto, censura o quaderno perso','r');await sl(700);
  const t=addTx(true,0.5,false);say('Tx '+t.id+': il wallet la invia ai nodi rimasti');await gossip('W',t.id,'tx');
  say('✓ La rete la propaga lo stesso, passando da Full 2','g');
  const b=await mineBlock(true);say('Blocco #'+b.i+' minato: la rete non si è fermata','g');await sl(800);
  f.off=false;f.g.classList.remove('off');say('Full 1 torna online e chiede ciò che gli manca');
  await fly('F2','F1','blk');f.has=new Set(N.F2.has);f.h=N.F2.h;pulse('F1','hit');badges();
  say('✓ Si è risincronizzato dai vicini: nessuno è indispensabile','g')}}];
const LB=['Nodi','Transazione','Mempool','Blocco','SPV','Double spend','Regole','Resilienza'];
$('steps').innerHTML=STEPS.map((_,i)=>`<button class="sb" aria-label="${i+1}. ${LB[i]}" onclick="go(${i})"><span class="num">${i+1}</span><span class="lbl">${LB[i]}</span></button>`).join('');
async function act(){if(S.busy)return;S.busy=true;$('go').disabled=true;$('panel').innerHTML='';
 try{await STEPS[S.step].f()}finally{S.busy=false;$('go').disabled=false}}
async function go(i){if(S.busy)return;
 if(i<0||i>=STEPS.length)return;
 const t=$('t'),d=$('d');t.classList.add('sw');d.style.opacity=0;await sl(250);
 S.step=i;$('panel').innerHTML='';t.textContent=STEPS[i].t;d.textContent=STEPS[i].d;$('go').textContent=STEPS[i].b;
 t.classList.remove('sw');d.style.opacity=1;
 $('k').textContent='Passo '+(i+1)+' di '+STEPS.length;[...$('steps').children].forEach((x,j)=>{x.className='sb'+(j===i?' cur':j<i?' done':'');if(j===i)x.setAttribute('aria-current','step');else x.removeAttribute('aria-current')});$('prev').disabled=i===0;$('next').disabled=i===STEPS.length-1;
 $('bt').classList.toggle('show',i>=1);$('bc').classList.toggle('show',i>=3);}
addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;
 if(e.key==='ArrowRight'||e.key==='PageDown')go(S.step+1);if(e.key==='ArrowLeft'||e.key==='PageUp')go(S.step-1);
 if((e.key===' '||e.key==='Enter')&&!e.target.closest('#theme,.sb,a')){e.preventDefault();act()}});
renderChain();
$('theme').setAttribute('aria-checked',document.documentElement.classList.contains('dark'));
$('theme').onclick=()=>{const d=document.documentElement.classList.toggle('dark');$('theme').setAttribute('aria-checked',d);try{localStorage.setItem('theme',d?'dark':'light')}catch(e){}};
go(0);
