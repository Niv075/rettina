/* ================= HOMEWORK (chat harness) ================= */
const SAMPLE = `Worksheet — The House in the Forest (Grade 3)
Maya lived in a small village near a river. Every Friday she visited her grandmother, who lived in a wooden house in the forest. One morning Maya baked an apple cake and put it in a basket. On the way she crossed an old bridge. In the forest she met a hungry fox. Maya gave the fox a piece of cake, and the fox ran away. At the end, Maya and her grandmother ate the cake together by the fireplace.`;
const bank = [];   // approved questions
const thread = $('#thread');
function addMsg(role, html){
  const m = document.createElement('div'); m.className='msg '+role;
  m.innerHTML = `<div class="av">${role==='user'?'T':'R'}</div><div class="body">${html}</div>`;
  thread.appendChild(m); thread.scrollTop = thread.scrollHeight; return m.querySelector('.body');
}
addMsg('ai',`Hi! Paste an assignment and I'll turn it into multiple-choice questions Noa can answer by gaze.<br><span class="hint">I only use what's in your text, no outside facts. Nothing reaches the student until you approve it.</span>`);
$('#sampleBtn').onclick = ()=>{ $('#hwInput').value = SAMPLE; };
$('#genBtn').onclick = generate;
$('#hwInput').addEventListener('keydown',e=>{ if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)) generate(); });

async function generate(){
  const text = $('#hwInput').value.trim(); if(!text) return;
  $('#hwInput').value='';
  addMsg('user', text.length>400 ? text.slice(0,400)+'…' : text);
  const body = addMsg('ai','');
  const step = async (name, detail, ms) => { const d=document.createElement('div'); d.className='tool run'; d.innerHTML=`<b>${name}</b> ${detail}`; body.appendChild(d); thread.scrollTop=thread.scrollHeight; await sleep(ms); d.classList.remove('run'); d.innerHTML += ' ✓'; };
  const sents = text.replace(/\n/g,' ').split(/(?<=[.?!])\s+/).filter(s=>s.split(' ').length>=5);
  await step('parse_document',`${text.split(/\s+/).length} words · ${sents.length} sentences`,700);
  await step('extract_facts','grounded in uploaded text only',900);
  const qs = makeQuestions(text, sents);
  await step('generate_mcq',`${qs.length} items · 3 options each (selection reliability: medium)`,1000);
  log('llm.question_gen',`${qs.length} questions drafted from teacher upload`);
  const p=document.createElement('p'); p.innerHTML=`Here are <b>${qs.length} draft questions</b>. Approve the ones you want Noa to see.`; body.appendChild(p);
  qs.forEach(q=>{
    const c=document.createElement('div'); c.className='qcard';
    c.innerHTML=`<b>${q.q}</b><ol>${q.opts.map(o=>`<li class="${o===q.a?'c':''}">${o}${o===q.a?' ✓':''}</li>`).join('')}</ol>
      <div class="src">Source: "${q.src}"</div>
      <div class="acts"><button class="btn primary">Approve</button><button class="btn">Delete</button></div>`;
    const [ap,del]=c.querySelectorAll('button');
    ap.onclick=()=>{ if(c.classList.contains('ok')) return; c.classList.add('ok'); ap.textContent='Approved ✓'; bank.push(q); log('teacher.approve',`"${q.q.slice(0,50)}…" · bank=${bank.length}`); };
    del.onclick=()=>{ c.classList.add('gone'); c.querySelector('.acts').remove(); };
    body.appendChild(c);
  });
  const all=document.createElement('div'); all.className='acts';
  all.innerHTML=`<button class="btn">Approve all</button> <button class="btn primary">Send to Level Check →</button>`;
  all.children[0].onclick=()=>body.querySelectorAll('.qcard:not(.ok):not(.gone) .btn.primary').forEach(b=>b.click());
  all.children[1].onclick=()=>document.querySelector('.nav button[data-v="quiz"]').click();
  body.appendChild(all); thread.scrollTop=thread.scrollHeight;
}
/* mock "LLM": cloze questions built only from the uploaded text */
function makeQuestions(text, sents){
  const vocab = [...new Set(text.toLowerCase().match(/[a-z']+/g).filter(w=>w.length>3&&!STOP.has(w)))];
  const out=[];
  sents.slice(0,8).forEach((s,ix)=>{
    const ws = s.match(/[A-Za-z']+/g).filter(w=>w.length>3 && !STOP.has(w.toLowerCase()));
    if(!ws.length) return;
    const ans = ws.sort((a,b)=>b.length-a.length)[ix%Math.min(2,ws.length)];
    const distract = vocab.filter(v=>v!==ans.toLowerCase() && !s.toLowerCase().includes(v)).sort(()=>Math.random()-.5).slice(0,2);
    if(distract.length<2) return;
    const opts=[ans.toLowerCase(),...distract].sort(()=>Math.random()-.5);
    out.push({ q: s.replace(new RegExp(`\\b${ans}\\b`),'_____'), a: ans.toLowerCase(), opts, src: s.length>90?s.slice(0,90)+'…':s, diff: Math.min(7, 1+Math.round(ans.length/2)+ (ix%3)) });
  });
  return out;
}

