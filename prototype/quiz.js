/* ================= LEVEL CHECK ================= */
/* ---- synthetic question bank: tagged by topic + difficulty (1–7) ---- */
const SYN_BANK = [
  ['Characters',1,'Who is the girl in the story?',['Maya','Lily','Dana']],
  ['Characters',2,'Who did Maya visit every Friday?',['her grandmother','her teacher','her friend']],
  ['Characters',3,'Which animal did Maya meet?',['a fox','a bear','a rabbit']],
  ['Characters',5,'How did Maya feel when she heard the noise?',['scared','bored','angry']],
  ['Characters',6,'Why did the fox look at the basket?',['it was hungry','it was lost','it was cold']],
  ['Characters',7,'What does sharing cake with the fox tell us about Maya?',['she is kind','she is greedy','she is lazy']],
  ['Setting',1,'Where did grandmother live?',['in the forest','in the city','by the sea']],
  ['Setting',2,"What was near Maya's village?",['a river','a mountain','a desert']],
  ['Setting',3,'What did Maya cross on the way?',['an old bridge','a big road','a wall']],
  ['Setting',4,"What was grandmother's house made of?",['wood','stone','glass']],
  ['Setting',5,'What was the forest like?',['dark and quiet','bright and loud','small and sunny']],
  ['Setting',6,'Where did they eat the cake?',['by the fireplace','in the garden','on the bridge']],
  ['Vocabulary',2,'A "basket" is…',['a thing to carry food in','a kind of cake','a small animal']],
  ['Vocabulary',3,'"Hungry" means…',['wanting food','wanting sleep','feeling cold']],
  ['Vocabulary',4,'"Suddenly" means…',['without warning','very slowly','every day']],
  ['Vocabulary',5,'"Strange" means…',['unusual','friendly','quiet']],
  ['Vocabulary',6,'"Deep in the forest" means…',['far inside the forest','under the ground','in the water']],
  ['Vocabulary',7,'Which word is the opposite of "scared"?',['brave','tired','hungry']],
  ['Sequence',2,'What did Maya do first?',['baked a cake','met a fox','ate with grandmother']],
  ['Sequence',3,'What happened after Maya heard a noise?',['a fox jumped out','she went home','it started to rain']],
  ['Sequence',4,'What happened at the end?',['they ate cake together','the fox took the basket','Maya got lost']],
  ['Sequence',5,'What happened right before Maya met the fox?',['she heard a noise','she arrived','she baked the cake']],
  ['Sequence',6,'Which came first?',['crossing the bridge','meeting the fox','hugging grandmother']],
  ['Sequence',7,'Which event is in the middle of the story?',['meeting the fox','baking the cake','eating by the fireplace']],
].map(([topic,diff,q,opts])=>({topic,diff,q,a:opts[0],opts,src:'synthetic bank'}));
const TOPICS = ['Characters','Setting','Vocabulary','Sequence'];

/* ---- synthetic student profiles (ground truth the quiz tries to recover) ---- */
const PROFILES = [
  {name:'Noa · at grade, tires late', desc:'Strong on characters, weak on sequence. Selection slows after ~6 items.',
   ab:{Characters:5.5,Setting:4.5,Vocabulary:4,Sequence:2.5}, base:3.5, jitter:.35, sw:.7, fatigue:.10, drop:.03},
  {name:'Strong reader, unreliable gaze', desc:'Knows the material but selects slowly and jumps between options. Tests "couldn\'t select ≠ doesn\'t know".',
   ab:{Characters:6.5,Setting:6,Vocabulary:6,Sequence:5.5}, base:5.5, jitter:.45, sw:1.6, fatigue:.05, drop:.05},
  {name:'Below grade, reliable gaze', desc:'Fast, clean selections, but the content is hard for her.',
   ab:{Characters:2.5,Setting:2,Vocabulary:1.5,Sequence:1}, base:2.5, jitter:.25, sw:.4, fatigue:.02, drop:.01},
  {name:'Bad day / fatigue', desc:'Long pauses and dropouts. Should stop early and not over-claim.',
   ab:{Characters:5,Setting:4.5,Vocabulary:4,Sequence:3}, base:6, jitter:.5, sw:1.4, fatigue:.35, drop:.22},
];
const gauss = () => Math.sqrt(-2*Math.log(1-Math.random()))*Math.cos(2*Math.PI*Math.random());
const poisson = l => { let k=0,p=1,L=Math.exp(-l); do{k++;p*=Math.random();}while(p>L); return k-1; };
const shuffle = a => a.sort(()=>Math.random()-.5);
const meanAb = p => TOPICS.reduce((s,t)=>s+p.ab[t],0)/TOPICS.length;

/* one simulated response: IRT-style correctness + gaze timing/switch model */
function simAnswer(p, q, opts, k){
  const theta = p.ab[q.topic] ?? meanAb(p), g = 1/opts.length;
  const pc = g + (1-g)/(1+Math.exp(-1.3*(theta-q.diff)));
  const fat = 1 + p.fatigue*k;
  const sw = poisson(p.sw*fat);
  if(Math.random() < p.drop*fat) return {none:true, t:15, sw};
  const t = p.base*fat*Math.exp(gauss()*p.jitter)*(q.diff>theta?1.25:1);
  const correct = Math.random() < pc;
  return {o: correct ? q.a : shuffle(opts.filter(x=>x!==q.a))[0], t, sw};
}

const quiz = { active:false };
function renderQuizIntro(){
  quiz.runId = (quiz.runId||0)+1; quiz.active=false;
  const n = bank.length;
  $('#quizBox').innerHTML = `<div class="report">
    <div class="qtext" style="text-align:left">Level check</div>
    <p style="color:var(--muted);margin:0">${n?`${n} approved questions ready.`:`No approved homework questions yet, so the synthetic bank (24 items, 4 topics, difficulty 1–7) will be used.`}
    Difficulty adapts as she answers, and every answer is graded on <b>how cleanly it was selected</b>. Hesitations get re-asked, and no-response never counts as wrong.</p>
    <div class="big dw" id="startQ" style="width:320px">▶ Start (you play)</div>
    <div class="nav-label" style="padding-left:0">Simulate a synthetic student</div>
    <div class="profiles">${PROFILES.map((p,i)=>`<div class="kpi">
      <b style="font-size:16px">${p.name}</b><small>${p.desc}</small>
      <div class="hint mono" style="margin:6px 0">true ability · ${TOPICS.map(t=>`${t.slice(0,4)} ${p.ab[t]}`).join(' · ')}</div>
      <div class="acts" style="display:flex;gap:8px"><button class="btn primary" data-p="${i}" data-m="watch">▶ Watch it play</button><button class="btn" data-p="${i}" data-m="instant">⚡ Instant report</button></div>
    </div>`).join('')}</div></div>`;
  $('#startQ').onclick = ()=>startQuiz(null);
  $('#quizBox').querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>startQuiz(PROFILES[b.dataset.p], b.dataset.m));
}
function startQuiz(sim, mode){
  const pool = (bank.length && !sim ? bank : SYN_BANK).map(q=>({...q, opts:shuffle([...q.opts])}));
  Object.assign(quiz,{active:true,pool,level:4,hist:[],i:0,retry:null,validN:0,badRun:0,stop:'',sim,mode,cur:null,topicN:{}});
  quiz.runId++;
  log('quiz.start',`${sim?'SIM '+sim.name+' · ':''}${pool.length} items · start level 4 · staircase`);
  if(sim && mode==='instant') return instantRest();
  nextQ();
}
/* item selection + stopping rules (spec 4.3) */
function pick(){
  if(quiz.retry){ const q=quiz.retry; quiz.retry=null; return {q,retry:true}; }
  const vl = quiz.hist.filter(h=>h.cls==='valid').map(h=>h.level);
  if(quiz.badRun>=3){ quiz.stop='fatigue flag: 3 unclear answers in a row'; return null; }
  if(quiz.i>=12){ quiz.stop='12-item limit'; return null; }
  if(quiz.i>=8 && vl.length>=5){ const l=vl.slice(-3); if(Math.max(...l)-Math.min(...l)<=1){ quiz.stop='estimate stable (last 3 within ±1)'; return null; } }
  if(!quiz.pool.length){ quiz.stop='question bank exhausted'; return null; }
  quiz.pool.sort((a,b)=>(Math.abs(a.diff-quiz.level)+.6*(quiz.topicN[a.topic]||0))-(Math.abs(b.diff-quiz.level)+.6*(quiz.topicN[b.topic]||0)));
  const q = quiz.pool.shift(); quiz.i++; quiz.topicN[q.topic]=(quiz.topicN[q.topic]||0)+1;
  return {q,retry:false};
}
const optsFor = (q,retry) => retry ? shuffle([q.a, shuffle(q.opts.filter(o=>o!==q.a))[0]]) : q.opts;
function nextQ(){ const n=pick(); if(!n) return finish(); showQ(n.q,n.retry); }

function showQ(q, retry){
  const opts = optsFor(q,retry), run = quiz.runId;
  quiz.cur = {q,retry,opts};
  const t0 = performance.now(); let switches=0, lastHover=null;
  $('#quizBox').innerHTML = `<div class="qmeta">${quiz.sim?`<span class="pill">SIMULATED · ${quiz.sim.name}</span>`:''}<span>Item ${quiz.i}${retry?' · re-ask with fewer options':''}</span><span>${q.topic||''}</span><span>difficulty ${q.diff}</span><span>level estimate <b>${quiz.level}</b></span><span id="simT"></span></div>
    <div class="qtext">${q.q}</div>
    <div class="opts" style="grid-template-columns:repeat(${opts.length},1fr)">${opts.map(o=>`<div class="big dw" data-o="${o}">${o}</div>`).join('')}</div>
    <div style="display:flex;gap:12px"><div class="big dw" id="noresp" style="min-height:50px;font-size:15px;width:260px;opacity:.7">😴 Need a break / skip</div>
    ${quiz.sim?`<button class="btn" id="skipRep">⏭ Skip to report</button>`:''}</div>`;
  if(quiz.sim){ $('#skipRep').onclick=instantRest; autoplay(q,opts,retry,run); return; }
  $('#quizBox').querySelectorAll('[data-o]').forEach(el=>{
    el.addEventListener('pointerenter',()=>{ if(lastHover && lastHover!==el) switches++; lastHover=el; });
    el.onclick=()=>{ record(q, el.dataset.o, (performance.now()-t0)/1000, switches, retry); nextQ(); };
  });
  $('#noresp').onclick=()=>{ recordNone(q,switches); nextQ(); };
}

function record(q, o, t, sw, retry){
  quiz.cur = null;
  const correct = o===q.a;
  let cls = (t>8 || sw>=3) ? 'uncertain' : 'valid';
  if(retry) cls = cls==='uncertain' ? 'none' : 'valid';
  if(cls==='valid'){ const step = quiz.validN<3 ? 2 : 1; quiz.validN++; quiz.level = Math.max(1,Math.min(7, quiz.level + (correct?step:-step))); }
  if(cls==='uncertain' && !retry) quiz.retry = q;
  quiz.badRun = cls==='valid' ? 0 : quiz.badRun+1;
  quiz.hist.push({q,cls,correct,t:t.toFixed(1),sw,retry,level:quiz.level});
  log('quiz.answer',`${correct?'correct':'wrong'} · ${t.toFixed(1)}s · ${sw} switches → ${cls}${cls==='valid'?` · level ${quiz.level}`:''}`);
}
function recordNone(q, sw){
  quiz.cur = null; quiz.badRun++;
  quiz.hist.push({q,cls:'none',correct:null,t:'—',sw,retry:false,level:quiz.level});
  log('quiz.answer','no response → excluded');
}

/* watch mode: animate the synthetic gaze (sped up ~3x) */
async function fillTo(el, from, to, ms, run){
  const t0=performance.now();
  while(performance.now()-t0<ms){ if(run!==quiz.runId) return; el.style.setProperty('--p', from+(to-from)*(performance.now()-t0)/ms); await new Promise(requestAnimationFrame); }
  el.style.setProperty('--p', to);
}
async function autoplay(q, opts, retry, run){
  const r = simAnswer(quiz.sim, q, opts, quiz.hist.length);
  quiz.cur.sim = r;
  $('#simT').textContent = r.none ? 'sim: no response' : `sim: ${r.t.toFixed(1)}s · ${r.sw} switches`;
  const els = [...$('#quizBox').querySelectorAll('[data-o]')];
  const budget = Math.min(4500, (r.none?6:r.t)*1000/3);
  const hop = budget/(r.sw+2);
  await sleep(350);
  for(let i=0;i<r.sw;i++){
    const el = els[Math.floor(Math.random()*els.length)];
    el.classList.add('ghost'); await fillTo(el,0,.35+Math.random()*.3,hop,run); el.classList.remove('ghost'); el.style.setProperty('--p',0);
    if(run!==quiz.runId) return;
  }
  if(r.none){ await sleep(hop*2); if(run!==quiz.runId) return; flash($('#noresp')); await sleep(300); recordNone(q,r.sw); return nextQ(); }
  const el = els.find(e=>e.dataset.o===r.o);
  el.classList.add('ghost'); await fillTo(el,0,1,Math.max(500,hop*2),run);
  if(run!==quiz.runId) return;
  flash(el); el.classList.add(r.o===q.a?'right':'wrong'); await sleep(450);
  if(run!==quiz.runId) return;
  record(q, r.o, r.t, r.sw, retry); nextQ();
}
function instantRest(){
  quiz.runId++;
  if(quiz.cur){ const {q,retry,opts}=quiz.cur; const r = quiz.cur.sim || simAnswer(quiz.sim,q,opts,quiz.hist.length);
    r.none ? recordNone(q,r.sw) : record(q,r.o,r.t,r.sw,retry); }
  let n;
  while((n=pick())){ const opts=optsFor(n.q,n.retry), r=simAnswer(quiz.sim,n.q,opts,quiz.hist.length);
    r.none ? recordNone(n.q,r.sw) : record(n.q,r.o,r.t,r.sw,n.retry); }
  finish();
}

/* ---- report ---- */
function trajectory(){
  const H=quiz.hist, W=Math.max(1,H.length-1), y=l=>8+(7-l)*12, x=i=>14+i*(472/W);
  const truth = quiz.sim ? `<line x1="14" x2="486" y1="${y(meanAb(quiz.sim))}" y2="${y(meanAb(quiz.sim))}" stroke="var(--ok)" stroke-dasharray="4 4"/><text x="486" y="${y(meanAb(quiz.sim))-4}" text-anchor="end" font-size="10" fill="var(--ok)">true ability ${meanAb(quiz.sim).toFixed(1)}</text>` : '';
  const grid = [1,4,7].map(l=>`<text x="0" y="${y(l)+3}" font-size="10" fill="var(--muted)">${l}</text><line x1="14" x2="486" y1="${y(l)}" y2="${y(l)}" stroke="var(--line)"/>`).join('');
  const pts = H.map((h,i)=>`${x(i)},${y(h.level)}`).join(' ');
  const dots = H.map((h,i)=>{ const c = h.cls==='valid'?'var(--accent)':h.cls==='uncertain'?'var(--warn)':'var(--muted)';
    return `<circle cx="${x(i)}" cy="${y(h.level)}" r="5" fill="${h.correct?c:'var(--panel)'}" stroke="${c}" stroke-width="2"><title>${h.q.q} · ${h.cls}${h.correct===null?'':h.correct?' · correct':' · wrong'}</title></circle>`; }).join('');
  return `<svg viewBox="0 0 500 92" style="width:100%;height:auto">${grid}${truth}<polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2"/>${dots}</svg>
    <div class="hint">● filled = correct · ○ hollow = wrong · <span style="color:var(--accent)">valid</span> · <span style="color:var(--warn)">uncertain</span> · <span>no response</span></div>`;
}
function finish(){
  quiz.active=false; quiz.runId++;
  const valid = quiz.hist.filter(h=>h.cls==='valid'), right = valid.filter(h=>h.correct).length;
  const enough = valid.length>=4, pct = valid.length? right/valid.length : 0;
  // final estimate: max-likelihood over all valid answers, guessing-corrected, weak prior at 4
  let best=4, bestLL=-Infinity;
  for(let th=1; th<=7.001; th+=.1){
    let ll = -((th-4)**2)/8;
    valid.forEach(h=>{ const g=1/(h.retry?2:h.q.opts.length), p=g+(1-g)/(1+Math.exp(-1.3*(th-h.q.diff))); ll += Math.log(h.correct?p:1-p); });
    if(ll>bestLL){ bestLL=ll; best=th; }
  }
  quiz.est = best; quiz.level = Math.round(best);
  const verdict = !enough ? 'Not enough data' : best>=6 ? 'Too easy' : best<=2.5 ? 'Too hard' : 'Appropriate';
  const conf = valid.length>=7 ? 'high' : enough ? 'medium' : 'low';
  // per-topic estimate on the 1–7 scale from valid answers
  const tmap = TOPICS.map(t=>{
    const v = valid.filter(h=>h.q.topic===t);
    const est = v.length ? Math.max(1,Math.min(7, v.reduce((s,h)=>s+(h.correct?h.q.diff+.5:h.q.diff-1.5),0)/v.length)) : null;
    return {t, est, n:v.length, ok:v.filter(h=>h.correct).length, truth: quiz.sim?.ab[t]};
  });
  log('quiz.report',`level ${quiz.level} · ${verdict} · ${valid.length} valid of ${quiz.hist.length} · stop: ${quiz.stop}`);
  $('#quizBox').innerHTML = `<div class="report">
    <div class="qtext" style="text-align:left">Report for teacher & parents</div>
    ${quiz.sim?`<div class="hint"><span class="pill">SIMULATED</span> ${quiz.sim.name}. Green marks show the synthetic student's <b>true</b> ability, so you can see how well the quiz recovered it.</div>`:''}
    <div class="kpis">
      <div class="kpi"><small>Level estimate</small><b>${quiz.est.toFixed(1)} / 7</b><small>±1 · ${conf} confidence${quiz.sim?` · <span style="color:var(--ok)">true ${meanAb(quiz.sim).toFixed(1)}</span>`:''}</small></div>
      <div class="kpi"><small>This assignment is</small><b>${verdict}</b><small>${right}/${valid.length} valid answers correct</small></div>
      <div class="kpi"><small>Selection quality</small><b>${valid.length}/${quiz.hist.length}</b><small>clean selections · stopped: ${quiz.stop}</small></div>
    </div>
    <div class="kpi"><small>Level over the quiz</small>${trajectory()}</div>
    <div class="kpi"><small>Knowledge map: estimated level per topic (1–7)${quiz.sim?' · <span style="color:var(--ok)">| true</span>':''}</small><div class="bars">${tmap.map(m=>`<div><span>${m.t}</span><i>${m.est?`<s style="width:${m.est/7*100}%"></s>`:''}${m.truth?`<u style="left:${m.truth/7*100}%"></u>`:''}</i><span class="mono">${m.est?m.est.toFixed(1):'n/a'} <span class="hint">${m.ok}/${m.n}</span></span></div>`).join('')}</div></div>
    <div class="kpi"><small>Answer log</small><table class="qlog"><tr><th>#</th><th>Question</th><th>Topic</th><th>Diff</th><th>Result</th><th>Time</th><th>Switches</th><th>Class</th><th>Level</th></tr>
      ${quiz.hist.map((h,i)=>`<tr><td>${i+1}</td><td>${h.q.q.length>44?h.q.q.slice(0,44)+'…':h.q.q}${h.retry?' <i>(re-ask)</i>':''}</td><td>${h.q.topic||'—'}</td><td>${h.q.diff}</td><td>${h.correct===null?'—':h.correct?'✓':'✗'}</td><td>${h.t}${h.t==='—'?'':'s'}</td><td>${h.sw}</td><td><span class="tag ${h.cls}">${h.cls==='none'?'no response':h.cls}</span></td><td>${h.level}</td></tr>`).join('')}</table></div>
    <p class="hint">Placement and learning-support tool. Not an IQ score or a diagnosis.</p>
    <div style="display:flex;gap:8px">${quiz.sim?`<button class="btn primary" id="again">↻ Re-run same profile</button>`:''}<button class="btn" id="back">← All profiles</button></div>
  </div>`;
  const sim = quiz.sim, mode = quiz.mode;
  if(sim) $('#again').onclick=()=>startQuiz(sim, mode);
  $('#back').onclick=renderQuizIntro;
}
