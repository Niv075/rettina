/* ================= LEARN: "What would you like to learn?" ================= */
/* Topic index: [name, emoji, popularity 1-10]. In the product this is a curated, age-appropriate
   list synced to the device. No topic starts with X, so X stays dimmed on the keyboard. */
const TOPIC_INDEX = `Airplanes ✈️ 10|Animals 🐾 9|Astronauts 👩‍🚀 8|Art 🎨 7|Amusement parks 🎢 7|Ants 🐜 6|Ancient Egypt 🏺 6|Alligators 🐊 6|Aquariums 🐠 6|Apples 🍎 5|Africa 🌍 5|Australia 🦘 5|Autumn 🍂 4
Birds 🐦 8|Butterflies 🦋 8|Bees 🐝 7|Ballet 🩰 7|Bears 🐻 7|Baking 🧁 7|Boats ⛵ 6|Books 📚 6|Babies 👶 6|Beaches 🏖️ 6|Bicycles 🚲 5|Bridges 🌉 4
Cats 🐱 9|Castles 🏰 8|Cars 🚗 7|Colors 🌈 7|Chocolate 🍫 7|Cooking 🍳 6|Circus 🎪 6|Clouds ☁️ 5|Cows 🐄 5|Camels 🐫 5|Coral reefs 🪸 5
Dinosaurs 🦖 10|Dogs 🐶 10|Dolphins 🐬 8|Dancing 💃 8|Dragons 🐉 7|Ducks 🦆 5|Deserts 🏜️ 5|Doctors 🩺 5|Drums 🥁 5
Elephants 🐘 9|Earth 🌎 7|Emotions 😊 6|Eagles 🦅 5|Electricity ⚡ 5|Eggs 🥚 4
Football ⚽ 8|Frogs 🐸 7|Flowers 🌸 7|Farms 🚜 7|Fairies 🧚 7|Fish 🐟 6|Fire trucks 🚒 6|Forests 🌲 6|Flamingos 🦩 5
Giraffes 🦒 8|Gardens 🌻 6|Gorillas 🦍 6|Gymnastics 🤸 6|Ghosts 👻 5|Guitars 🎸 5
Horses 🐴 9|Hedgehogs 🦔 6|Helicopters 🚁 6|Holidays 🎉 6|Human body 🫀 6|Hippos 🦛 5|Hospitals 🏥 4
Ice cream 🍦 8|Insects 🐞 6|Islands 🏝️ 5|Inventions 💡 5|Ice skating ⛸️ 5
Jokes 😂 7|Jellyfish 🪼 6|Jungles 🌴 6|Jupiter 🪐 5
Kittens 🐈 7|Koalas 🐨 7|Kangaroos 🦘 6|Knights 🛡️ 6|Kites 🪁 5
Lions 🦁 8|Lego 🧱 7|Lizards 🦎 5|Ladybugs 🐞 5|Lighthouses 🗼 4
Music 🎵 9|Moon 🌙 8|Mermaids 🧜‍♀️ 8|Monkeys 🐒 7|Medieval times 🏰 6|Magic 🪄 6|Mountains ⛰️ 5|Museums 🏛️ 5|Mushrooms 🍄 4
Nature 🌿 6|Night sky 🌌 6|Nests 🪺 4
Ocean 🌊 9|Owls 🦉 7|Octopuses 🐙 7|Olympics 🏅 6
Planets 🪐 8|Puppies 🐶 8|Penguins 🐧 8|Princesses 👸 8|Pirates 🏴‍☠️ 7|Pandas 🐼 7|Pizza 🍕 7|Painting 🖌️ 6|Parrots 🦜 5
Queens and kings 👑 5|Quokkas 🐾 4
Rainbows 🌈 8|Robots 🤖 8|Rockets 🚀 8|Rabbits 🐰 7|Rain 🌧️ 5|Rivers 🏞️ 4
Space 🚀 10|Sharks 🦈 8|Snow ❄️ 7|Stars ⭐ 7|Singing 🎤 7|Seasons 🍂 6|Snakes 🐍 6|Swimming 🏊 6|Sun ☀️ 6|Sea turtles 🐢 6|Spiders 🕷️ 5
Trains 🚂 7|Tigers 🐯 7|Trees 🌳 6|Turtles 🐢 6|Teeth 🦷 5|Tractors 🚜 5|Tornadoes 🌪️ 5
Unicorns 🦄 8|Underwater animals 🐠 5|Umbrellas ☂️ 3
Volcanoes 🌋 8|Vegetables 🥕 5|Violins 🎻 4
Whales 🐋 8|Weather ⛅ 6|Wolves 🐺 6|Water 💧 5|Winter ☃️ 5|Witches 🧙 5
Yoga 🧘 4|Yaks 🐂 4
Zoo 🦓 7|Zebras 🦓 6`
  .split(/[|\n]/).map(s => { const m = s.trim().match(/^(.+?) (\S+) (\d+)$/); return { name:m[1], emoji:m[2], pop:+m[3] }; });

const norm = s => s.toLowerCase().replace(/[^a-z]/g,'');
TOPIC_INDEX.forEach(t => {               // searchable from the start of the name or of any later word
  const words = t.name.split(/\s+/);
  t.keys = words.map((w,i) => i && /^(and|the|of|a)$/i.test(w) ? null : norm(words.slice(i).join(''))).filter(Boolean);
});

const LEARN_PROFILE = {                  // set by parents at setup + this week's class topic
  interests: ['Horses','Music'],
  classTopics: ['Medieval times'],
  popular: ['Space','Animals','Dinosaurs','Ocean'],
};
const KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/* built-in lessons (in the product: drawn from a vetted children's encyclopedia) */
const LESSONS = {
  'Airplanes': { sentences:[
    'Airplanes are machines that fly through the sky.',
    'They have two big wings that help them stay up in the air.',
    'Engines push the airplane forward very fast.',
    'The pilot sits in the front, in a room called the cockpit.',
    'Big airplanes can carry hundreds of people to faraway places.'],
    questions:[
      {q:'What helps an airplane stay up in the air?', options:['Its wings','Its wheels','Its windows'], answer:'Its wings'},
      {q:'Who flies the airplane?', options:['The pilot','The teacher','The baker'], answer:'The pilot'},
      {q:'What is the front room of the airplane called?', options:['The cockpit','The kitchen','The garden'], answer:'The cockpit'}]},
  'Dinosaurs': { sentences:[
    'Dinosaurs lived on Earth a very, very long time ago.',
    'Some dinosaurs were huge, and some were as small as a chicken.',
    'Tyrannosaurus rex had big sharp teeth and ate meat.',
    'Other dinosaurs, like Triceratops, ate only plants.',
    'We know about dinosaurs because people find their bones, called fossils.'],
    questions:[
      {q:'What do we call dinosaur bones found in the ground?', options:['Fossils','Feathers','Shells'], answer:'Fossils'},
      {q:'What did Triceratops eat?', options:['Plants','Meat','Pizza'], answer:'Plants'},
      {q:'Which dinosaur had big sharp teeth?', options:['Tyrannosaurus rex','Triceratops','A chicken'], answer:'Tyrannosaurus rex'}]},
  'Space': { sentences:[
    'Space is everything far above the sky.',
    'The Earth is a planet that goes around the Sun.',
    'The Sun is a star, and it gives us light and warmth.',
    'Astronauts travel to space in rockets.',
    'In space, astronauts float because they feel almost no weight.'],
    questions:[
      {q:'What is the Sun?', options:['A star','A planet','A cloud'], answer:'A star'},
      {q:'How do astronauts travel to space?', options:['In rockets','On bicycles','In boats'], answer:'In rockets'},
      {q:'What does the Earth go around?', options:['The Sun','The Moon','A tree'], answer:'The Sun'}]},
  'Horses': { sentences:[
    'Horses are big, strong animals with long legs.',
    'They eat grass and hay.',
    'A baby horse is called a foal.',
    'Horses can sleep standing up.',
    'People ride horses, and long ago knights rode them too.'],
    questions:[
      {q:'What is a baby horse called?', options:['A foal','A puppy','A calf'], answer:'A foal'},
      {q:'What do horses eat?', options:['Grass and hay','Fish','Chocolate'], answer:'Grass and hay'},
      {q:'How can horses sleep?', options:['Standing up','Upside down','In the water'], answer:'Standing up'}]},
  'Medieval times': { sentences:[
    'Medieval times happened a long, long time ago.',
    'Kings and queens lived in big stone castles.',
    'Knights wore metal armor and rode horses.',
    'Most people were farmers who grew food and kept animals.',
    'Many children helped their parents instead of going to school.'],
    questions:[
      {q:'Where did kings and queens live?', options:['In castles','In tents','In boats'], answer:'In castles'},
      {q:'What did knights wear?', options:['Metal armor','Swimsuits','Pajamas'], answer:'Metal armor'},
      {q:'What did most people do for work?', options:['Farming','Flying planes','Building robots'], answer:'Farming'}]},
};

/* ---------- state ---------- */
const LS_PICKS='rettina.picks', LS_SEEN='rettina.learnSeen';
const lsGet = k => { try{ return localStorage.getItem(k); }catch(e){ return null; } };
const lsSet = (k,v) => { try{ localStorage.setItem(k,v); }catch(e){} };
const Learn = { screen:'menu', typed:'', kbSel:0, topic:null, lesson:null, qi:0, score:0, via:'',
  picks: (()=>{ try{ return JSON.parse(lsGet(LS_PICKS))||{}; }catch(e){ return {}; } })() };
const byName = Object.fromEntries(TOPIC_INDEX.map(t=>[t.name,t]));
const box = () => $('#learnBox');

/* ---------- ranking + autocomplete ---------- */
function rankOf(t){
  return t.pop + 4*(Learn.picks[t.name]||0) + (LEARN_PROFILE.classTopics.includes(t.name)?5:0) + (LEARN_PROFILE.interests.includes(t.name)?3:0);
}
function searchIndex(p){
  const out=[];
  TOPIC_INDEX.forEach(t=>{
    let best=null;
    t.keys.forEach((k,i)=>{ if(k.startsWith(p)){ const s=rankOf(t)-(i?3:0); if(best===null||s>best) best=s; } });
    if(best!==null) out.push({t, score:best});
  });
  return out.sort((a,b)=>b.score-a.score);
}
function nextLetters(p){
  const s=new Set();
  TOPIC_INDEX.forEach(t=>t.keys.forEach(k=>{ if(k.length>p.length && k.startsWith(p)) s.add(k[p.length].toUpperCase()); }));
  return s;
}
function neighbours(ch){           // keys around ch on the 7-column keyboard (gaze slips land here)
  const i=KEYS.indexOf(ch.toUpperCase()), r=Math.floor(i/7), c=i%7, out=[];
  [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dr,dc])=>{ const rr=r+dr, cc=c+dc; if(cc>=0&&cc<7&&rr>=0){ const j=rr*7+cc; if(j<KEYS.length) out.push(KEYS[j].toLowerCase()); } });
  return out;
}
function suggestions(){
  const p=norm(Learn.typed);
  const exact=searchIndex(p);
  if(exact.length>=4 || !p) return exact.slice(0,4);
  const seen=new Set(exact.map(r=>r.t.name)), fuzzy=[];
  neighbours(p.at(-1)).forEach(n=>searchIndex(p.slice(0,-1)+n).forEach(r=>{ if(!seen.has(r.t.name)){ seen.add(r.t.name); fuzzy.push({...r, score:r.score-4, fuzzy:true}); } }));
  return [...exact, ...fuzzy.sort((a,b)=>b.score-a.score)].slice(0,4);
}

/* ---------- screens ---------- */
function menuTopics(){
  const names=[...LEARN_PROFILE.interests, ...LEARN_PROFILE.classTopics, ...LEARN_PROFILE.popular];
  return names.map(n=>byName[n]).filter(Boolean).sort((a,b)=>(Learn.picks[b.name]||0)-(Learn.picks[a.name]||0));
}
const tag = n => LEARN_PROFILE.classTopics.includes(n)?'in class this week':LEARN_PROFILE.interests.includes(n)?'you love this':'';
function renderMenu(){
  Learn.screen='menu'; stopReading();
  const first = !lsGet(LS_SEEN);
  box().innerHTML = `<div class="lhead"><div class="ltitle">${first?'Hi Noa! ':''}What would you like to learn?</div>
    <div class="hint">Look at a topic to choose it.</div></div>
    <div class="lgrid">${menuTopics().map(t=>`<div class="ltile dw" data-topic="${esc(t.name)}"><span class="em">${t.emoji}</span>${esc(t.name)}${tag(t.name)?`<small>${tag(t.name)}</small>`:''}</div>`).join('')}
      <div class="ltile dw other" id="otherBtn"><span class="em">⌨️</span>Something else</div></div>`;
  box().querySelectorAll('[data-topic]').forEach(el=>el.onclick=()=>chooseTopic(el.dataset.topic,'menu',1));
  $('#otherBtn').onclick=()=>{ Learn.typed=''; Learn.kbSel=0; renderKeyboard(); };
}
function renderKeyboard(){
  Learn.screen='kb'; stopReading();
  const sug=suggestions(), top=sug[0], rest=sug.slice(1);
  const allowed=nextLetters(norm(Learn.typed));
  box().innerHTML = `
    <div class="sugrow">
      ${top?`<div class="ltile dw search" id="searchBtn"><span class="em">${top.t.emoji}</span><span>🔍 Search: <b>${esc(top.t.name)}</b>${top.fuzzy?'<small>did you mean?</small>':''}</span></div>`:`<div class="ltile search off">🔍 Search</div>`}
      ${rest.map(r=>`<div class="ltile dw" data-topic="${esc(r.t.name)}"><span class="em">${r.t.emoji}</span>${esc(r.t.name)}${r.fuzzy?'<small>did you mean?</small>':''}</div>`).join('')}
      ${Array(3-rest.length).fill('<div class="ltile off"></div>').join('')}
    </div>
    <div class="typed"><span class="mono">${esc(Learn.typed)}<i>_</i></span><span class="hint">${Learn.kbSel} selection${Learn.kbSel===1?'':'s'} · dimmed letters can't lead to a topic</span></div>
    <div class="kb">${KEYS.map(k=>allowed.has(k)?`<div class="key dw" data-k="${k}">${k}</div>`:`<div class="key off">${k}</div>`).join('')}
      <div class="key dw ctl" id="bsKey">⌫</div><div class="key dw ctl" id="backKey">↩ Topics</div></div>`;
  box().querySelectorAll('[data-k]').forEach(el=>el.onclick=()=>{ Learn.typed+=el.dataset.k; Learn.kbSel++; renderKeyboard(); });
  box().querySelectorAll('[data-topic]').forEach(el=>el.onclick=()=>chooseTopic(el.dataset.topic,'keyboard',Learn.kbSel+1));
  if(top) $('#searchBtn').onclick=()=>chooseTopic(top.t.name,'keyboard',Learn.kbSel+1);
  $('#bsKey').onclick=()=>{ if(Learn.typed){ Learn.typed=Learn.typed.slice(0,-1); Learn.kbSel++; renderKeyboard(); } };
  $('#backKey').onclick=renderMenu;
}
async function chooseTopic(name, via, selections){
  Learn.topic=name; Learn.via=via;
  Learn.picks[name]=(Learn.picks[name]||0)+1; lsSet(LS_PICKS, JSON.stringify(Learn.picks)); lsSet(LS_SEEN,'1');
  log('learn.pick', `"${name}" via ${via}${via==='keyboard'?` · typed "${Learn.typed}"`:''} · ${selections} selection${selections===1?'':'s'}`);
  const t=byName[name];
  box().innerHTML = `<div class="lhead"><div class="ltitle">${t.emoji} ${esc(name)}</div><div class="hint">Getting your lesson ready…</div></div>`;
  let l = LESSONS[name], src='built-in lesson';
  if(!l && window.LLM){ const r = await LLM.lesson(name, $('#lang').selectedOptions[0].text); if(r && r.sentences.length){ l=r; src=`${r.source} · ${r.ms} ms (AI draft, product uses vetted sources)`; } }
  if(!l){ src='placeholder (no API key)'; const others=TOPIC_INDEX.filter(x=>x.name!==name).sort(()=>Math.random()-.5).slice(0,2).map(x=>x.name);
    l={ sentences:[`Let's learn about ${name}!`, `${name} is a topic many children love.`, `In the full version, this lesson comes from a children's encyclopedia, read aloud to you.`],
        questions:[{q:'What are we learning about today?', options:[name,...others], answer:name}] }; }
  if(Learn.topic!==name) return;
  Learn.lesson={...l, src}; log('learn.lesson', `${name} · ${src}`);
  renderLesson();
}
function renderLesson(){
  Learn.screen='lesson';
  const t=byName[Learn.topic], l=Learn.lesson;
  box().innerHTML = `<div class="lhead"><div class="ltitle">${t.emoji} ${esc(Learn.topic)}</div><div class="hint">${esc(l.src)}</div></div>
    <div class="ltext">${l.sentences.map((s,i)=>`<span data-i="${i}">${esc(s)}</span>`).join(' ')}</div>
    <div class="lbtns">
      <div class="ltile dw" id="againBtn"><span class="em">🔁</span>Read again</div>
      <div class="ltile dw go" id="qBtn"><span class="em">❓</span>Questions</div>
      <div class="ltile dw" id="notBtn"><span class="em">↩</span>Not this</div>
      <div class="ltile dw" id="topicsBtn"><span class="em">🧭</span>Other topics</div>
    </div>`;
  $('#againBtn').onclick=()=>read(l.sentences);
  $('#qBtn').onclick=()=>{ stopReading(); Learn.qi=0; Learn.score=0; renderQuestion(); };
  $('#notBtn').onclick=()=>{ log('learn.not_this', Learn.topic); Learn.via==='keyboard' ? renderKeyboard() : renderMenu(); };
  $('#topicsBtn').onclick=renderMenu;
  read(l.sentences);
}
function renderQuestion(){
  Learn.screen='q';
  const qs=Learn.lesson.questions, q=qs[Learn.qi];
  if(!q) return renderDone();
  const opts=[...q.options].sort(()=>Math.random()-.5);
  box().innerHTML = `<div class="lhead"><div class="hint">${byName[Learn.topic].emoji} ${esc(Learn.topic)} · question ${Learn.qi+1} of ${qs.length}</div>
    <div class="ltitle">${esc(q.q)}</div></div>
    <div class="opts" style="grid-template-columns:repeat(${opts.length},1fr)">${opts.map(o=>`<div class="big dw" data-o="${esc(o)}">${esc(o)}</div>`).join('')}</div>`;
  speak(q.q);
  let done=false;
  box().querySelectorAll('[data-o]').forEach(el=>el.onclick=()=>{
    if(done) return; done=true;
    const ok = el.dataset.o===q.answer;
    el.classList.add(ok?'right':'wrong');
    if(!ok) box().querySelectorAll('[data-o]').forEach(x=>{ if(x.dataset.o===q.answer) x.classList.add('right'); });
    if(ok) Learn.score++;
    speak(ok?'Yes! Well done.':`Good try. It's ${q.answer}.`);
    log('learn.answer', `${ok?'correct':'wrong'} · "${q.q}"`);
    setTimeout(()=>{ Learn.qi++; renderQuestion(); }, 1800);
  });
}
function renderDone(){
  const n=Learn.lesson.questions.length;
  box().innerHTML = `<div class="lhead"><div class="ltitle">🎉 You got ${Learn.score} of ${n}!</div><div class="hint">Saved to the parent report: ${esc(Learn.topic)} · ${Learn.score}/${n}</div></div>
    <div class="lbtns">
      <div class="ltile dw go" id="moreBtn"><span class="em">🧭</span>Learn something else</div>
      <div class="ltile dw" id="sameBtn"><span class="em">🔁</span>${esc(Learn.topic)} again</div>
    </div>`;
  speak(`You got ${Learn.score} of ${n}!`);
  $('#moreBtn').onclick=renderMenu;
  $('#sameBtn').onclick=renderLesson;
}

/* ---------- read aloud with the current sentence highlighted ---------- */
function stopReading(){ try{ speechSynthesis.cancel(); }catch(e){} }
function read(sents){
  stopReading();
  try{
    sents.forEach((s,i)=>{
      const u=new SpeechSynthesisUtterance(s); u.lang=$('#lang').value; u.rate=.9;
      u.onstart=()=>box().querySelectorAll('.ltext span').forEach(x=>x.classList.toggle('reading', +x.dataset.i===i));
      if(i===sents.length-1) u.onend=()=>box().querySelectorAll('.ltext span').forEach(x=>x.classList.remove('reading'));
      speechSynthesis.speak(u);
    });
  }catch(e){}
}

/* open on first start-up, and every time Learn is opened */
Learn.open = renderMenu;
if(!lsGet(LS_SEEN)) setTimeout(()=>document.querySelector('.nav button[data-v="learn"]').click(), 0);
