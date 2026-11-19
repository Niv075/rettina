/* ================= LEARN: "What would you like to learn?" ================= */
/* Topic index per language: [name, emoji, popularity 1-10]. In the product this is a curated, age-appropriate
   list synced to the device. Letters that start no topic stay dimmed on the keyboard. */
const LEARN_DATA = {
en: {
  raw: `Airplanes ✈️ 10|Animals 🐾 9|Astronauts 👩‍🚀 8|Art 🎨 7|Amusement parks 🎢 7|Ants 🐜 6|Ancient Egypt 🏺 6|Alligators 🐊 6|Aquariums 🐠 6|Apples 🍎 5|Africa 🌍 5|Australia 🦘 5|Autumn 🍂 4
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
Zoo 🦓 7|Zebras 🦓 6`,
  keys: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  profile: { interests:['Horses','Music'], classTopics:['Medieval times'], popular:['Space','Animals','Dinosaurs','Ocean'] },
  lessons: {
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
  },
},
he: {
  raw: `אוקיינוס 🌊 9|אריות 🦁 8|אסטרונאוטים 👩‍🚀 8|אומנות 🎨 7|אגדות 🧚 7|ארנבים 🐰 7|אבירים 🛡️ 6|אופניים 🚲 5|אוטובוסים 🚌 5|אננס 🍍 4
בעלי חיים 🐾 9|בלט 🩰 7|בובות 🪆 6|ברווזים 🦆 5|בננות 🍌 5|ברקים ⚡ 5|בית חולים 🏥 4
גלידה 🍦 8|ג׳ירפות 🦒 8|גוף האדם 🫀 6|גינה 🌻 6|גורילות 🦍 6|גשם 🌧️ 5|גמלים 🐫 5|גיטרה 🎸 5
דינוזאורים 🦖 10|דולפינים 🐬 8|דבורים 🐝 7|דרקונים 🐉 7|דובים 🐻 7|דגים 🐟 6|דבש 🍯 4
הרי געש 🌋 8|הליקופטרים 🚁 6|הקרקס 🎪 6|הרים ⛰️ 5|היפופוטמים 🦛 5
ויקינגים ⚔️ 4|ורדים 🌹 4
זברות 🦓 6|זיקוקים 🎆 6|זאבים 🐺 6|זחלים 🐛 4
חלל 🚀 10|חתולים 🐱 9|חוות 🚜 7|חגים 🎉 6|חרקים 🐜 6|חורף ☃️ 5|חיפושיות 🐞 5|חלומות 💭 4
טירות 🏰 8|טיגריסים 🐯 7|טרקטורים 🚜 5|טלסקופים 🔭 4|טווסים 🦚 4
ים 🌊 8|ירח 🌙 8|ינשופים 🦉 7|ימי הביניים 🏰 6|יערות 🌲 6|יהלומים 💎 4
כלבים 🐶 10|כדורגל ⚽ 8|כוכבי לכת 🪐 8|כרישים 🦈 8|כוכבים ⭐ 7|כבאיות 🚒 6
לווייתנים 🐋 8|לגו 🧱 7|לטאות 🦎 5|לחם 🍞 4
מטוסים ✈️ 10|מוזיקה 🎵 9|מכוניות 🚗 7|מצרים העתיקה 🏺 6|מזג אוויר ⛅ 6|מכשפות 🧙 5|מדבר 🏜️ 5|מוזיאונים 🏛️ 5
נסיכות 👸 8|נחשים 🐍 6|נמלים 🐜 6|נמרים 🐆 5|נהרות 🏞️ 4
סוסים 🐴 9|ספרים 📚 6|סירות ⛵ 6|סנאים 🐿️ 5|סתיו 🍂 4
עוגות 🧁 7|עצים 🌳 6|עכבישים 🕷️ 5|עננים ☁️ 5
פילים 🐘 9|פרפרים 🦋 8|פינגווינים 🐧 8|פרחים 🌸 7|פיצה 🍕 7|פנדות 🐼 7|פיראטים 🏴‍☠️ 7|פירות 🍎 5
ציפורים 🐦 8|צבעים 🌈 7|צפרדעים 🐸 7|צבים 🐢 6|ציור 🖌️ 6|צוללות 🚢 4
קשת בענן 🌈 8|קופים 🐒 7|קואלות 🐨 7|קסמים 🪄 6|קנגורו 🦘 6|קרח 🧊 5
רובוטים 🤖 8|ריקוד 💃 8|רקטות 🚀 8|רכבות 🚂 7|רופאים 🩺 5
שוקולד 🍫 7|שלג ❄️ 7|שירה 🎤 7|שמש ☀️ 6|שחייה 🏊 6|שיניים 🦷 5|שועלים 🦊 5
תמנונים 🐙 7|תחפושות 🎭 6|תינוקות 👶 6|תנינים 🐊 6|תפוחים 🍎 5|תרנגולות 🐔 5`,
  keys: 'אבגדהוזחטיכלמנסעפצקרשת'.split(''),
  profile: { interests:['סוסים','מוזיקה'], classTopics:['ימי הביניים'], popular:['חלל','בעלי חיים','דינוזאורים','אוקיינוס'] },
  lessons: {
    'מטוסים': { sentences:[
      'מטוסים הם מכונות שעפות בשמיים.',
      'יש להם שתי כנפיים גדולות שעוזרות להם להישאר באוויר.',
      'מנועים דוחפים את המטוס קדימה מהר מאוד.',
      'הטייס יושב מקדימה, בחדר שנקרא תא הטייס.',
      'מטוסים גדולים יכולים להטיס מאות אנשים למקומות רחוקים.'],
      questions:[
        {q:'מה עוזר למטוס להישאר באוויר?', options:['הכנפיים','הגלגלים','החלונות'], answer:'הכנפיים'},
        {q:'מי מטיס את המטוס?', options:['הטייס','המורה','האופה'], answer:'הטייס'},
        {q:'איך קוראים לחדר שבחזית המטוס?', options:['תא הטייס','המטבח','הגינה'], answer:'תא הטייס'}]},
    'דינוזאורים': { sentences:[
      'דינוזאורים חיו על כדור הארץ לפני הרבה מאוד זמן.',
      'חלק מהדינוזאורים היו ענקיים, וחלק היו קטנים כמו תרנגולת.',
      'לטירנוזאורוס רקס היו שיניים גדולות וחדות, והוא אכל בשר.',
      'דינוזאורים אחרים, כמו הטריצרטופס, אכלו רק צמחים.',
      'אנחנו יודעים על דינוזאורים כי אנשים מוצאים את העצמות שלהם, שנקראות מאובנים.'],
      questions:[
        {q:'איך קוראים לעצמות דינוזאורים שמוצאים באדמה?', options:['מאובנים','נוצות','צדפים'], answer:'מאובנים'},
        {q:'מה אכל הטריצרטופס?', options:['צמחים','בשר','פיצה'], answer:'צמחים'},
        {q:'לאיזה דינוזאור היו שיניים גדולות וחדות?', options:['טירנוזאורוס רקס','טריצרטופס','תרנגולת'], answer:'טירנוזאורוס רקס'}]},
    'חלל': { sentences:[
      'החלל הוא כל מה שנמצא הרחק מעל השמיים.',
      'כדור הארץ הוא כוכב לכת שמסתובב סביב השמש.',
      'השמש היא כוכב, והיא נותנת לנו אור וחום.',
      'אסטרונאוטים טסים לחלל ברקטות.',
      'בחלל אסטרונאוטים מרחפים, כי הם כמעט לא מרגישים משקל.'],
      questions:[
        {q:'מה היא השמש?', options:['כוכב','כוכב לכת','ענן'], answer:'כוכב'},
        {q:'איך אסטרונאוטים טסים לחלל?', options:['ברקטות','באופניים','בסירות'], answer:'ברקטות'},
        {q:'סביב מה מסתובב כדור הארץ?', options:['השמש','הירח','עץ'], answer:'השמש'}]},
    'סוסים': { sentences:[
      'סוסים הם חיות גדולות וחזקות עם רגליים ארוכות.',
      'הם אוכלים עשב וחציר.',
      'סוס תינוק נקרא סייח.',
      'סוסים יכולים לישון בעמידה.',
      'אנשים רוכבים על סוסים, ולפני הרבה זמן גם אבירים רכבו עליהם.'],
      questions:[
        {q:'איך קוראים לסוס תינוק?', options:['סייח','גור','עגל'], answer:'סייח'},
        {q:'מה סוסים אוכלים?', options:['עשב וחציר','דגים','שוקולד'], answer:'עשב וחציר'},
        {q:'איך סוסים יכולים לישון?', options:['בעמידה','הפוך','במים'], answer:'בעמידה'}]},
    'ימי הביניים': { sentences:[
      'ימי הביניים היו לפני הרבה הרבה זמן.',
      'מלכים ומלכות גרו בטירות גדולות מאבן.',
      'אבירים לבשו שריון ממתכת ורכבו על סוסים.',
      'רוב האנשים היו חקלאים שגידלו אוכל וטיפלו בבעלי חיים.',
      'הרבה ילדים עזרו להורים שלהם במקום ללכת לבית הספר.'],
      questions:[
        {q:'איפה גרו מלכים ומלכות?', options:['בטירות','באוהלים','בסירות'], answer:'בטירות'},
        {q:'מה לבשו האבירים?', options:['שריון ממתכת','בגדי ים','פיג׳מה'], answer:'שריון ממתכת'},
        {q:'במה עבדו רוב האנשים?', options:['חקלאות','הטסת מטוסים','בניית רובוטים'], answer:'חקלאות'}]},
  },
},
};

/* Hebrew search ignores final-letter forms (ם→מ …) and a leading ה ("the") */
const FINALS = { 'ך':'כ', 'ם':'מ', 'ן':'נ', 'ף':'פ', 'ץ':'צ' };
const norm = s => Lang.cur==='he'
  ? s.replace(/[ךםןףץ]/g, c => FINALS[c]).replace(/[^א-ת]/g,'')
  : s.toLowerCase().replace(/[^a-z]/g,'');
function LD(){
  const d = LEARN_DATA[Lang.cur];
  if(!d.index){
    d.index = d.raw.split(/[|\n]/).map(s => { const m = s.trim().match(/^(.+?) (\S+) (\d+)$/); return { name:m[1], emoji:m[2], pop:+m[3] }; });
    d.index.forEach(t => {               // searchable from the start of the name or of any later word
      const words = t.name.split(/\s+/);
      t.keys = words.map((w,i) => i && /^(and|the|of|a)$/i.test(w) ? null : norm(words.slice(i).join(''))).filter(Boolean);
      if(Lang.cur==='he') t.keys.filter(k => k.startsWith('ה') && k.length > 3).forEach(k => t.keys.push(k.slice(1)));
    });
    d.byName = Object.fromEntries(d.index.map(t => [t.name, t]));
  }
  return d;
}
const L_ = (en, he) => tr(en, he);

/* ---------- state ---------- */
const LS_PICKS='rettina.picks', LS_SEEN='rettina.learnSeen';
const lsGet = k => { try{ return localStorage.getItem(k); }catch(e){ return null; } };
const lsSet = (k,v) => { try{ localStorage.setItem(k,v); }catch(e){} };
const Learn = { screen:'menu', typed:'', kbSel:0, topic:null, lesson:null, qi:0, score:0, via:'',
  picks: (()=>{ try{ return JSON.parse(lsGet(LS_PICKS))||{}; }catch(e){ return {}; } })() };
const box = () => $('#learnBox');

/* ---------- ranking + autocomplete ---------- */
function rankOf(t){
  const P = LD().profile;
  return t.pop + 4*(Learn.picks[t.name]||0) + (P.classTopics.includes(t.name)?5:0) + (P.interests.includes(t.name)?3:0);
}
function searchIndex(p){
  const out=[];
  LD().index.forEach(t=>{
    let best=null;
    t.keys.forEach((k,i)=>{ if(k.startsWith(p)){ const s=rankOf(t)-(i?3:0); if(best===null||s>best) best=s; } });
    if(best!==null) out.push({t, score:best});
  });
  return out.sort((a,b)=>b.score-a.score);
}
function nextLetters(p){
  const s=new Set();
  LD().index.forEach(t=>t.keys.forEach(k=>{ if(k.length>p.length && k.startsWith(p)) s.add(k[p.length].toUpperCase()); }));
  return s;
}
function neighbours(ch){           // keys around ch on the 7-column keyboard (gaze slips land here)
  const KEYS = LD().keys, i=KEYS.indexOf(ch.toUpperCase()), r=Math.floor(i/7), c=i%7, out=[];
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
  const P = LD().profile, byName = LD().byName;
  const names=[...P.interests, ...P.classTopics, ...P.popular];
  return names.map(n=>byName[n]).filter(Boolean).sort((a,b)=>(Learn.picks[b.name]||0)-(Learn.picks[a.name]||0));
}
const tag = n => { const P = LD().profile; return P.classTopics.includes(n) ? L_('in class this week','בכיתה השבוע') : P.interests.includes(n) ? L_('you love this','את אוהבת את זה') : ''; };
function renderMenu(){
  Learn.screen='menu'; stopReading();
  const first = !lsGet(LS_SEEN);
  box().innerHTML = `<div class="lhead"><div class="ltitle">${first?L_('Hi Noa! ','היי נועה! '):''}${L_('What would you like to learn?','מה בא לך ללמוד?')}</div>
    <div class="hint">${L_('Look at a topic to choose it.','הסתכלי על נושא כדי לבחור אותו.')}</div></div>
    <div class="lgrid">${menuTopics().map(t=>`<div class="ltile dw" data-topic="${esc(t.name)}"><span class="em">${t.emoji}</span>${esc(t.name)}${tag(t.name)?`<small>${tag(t.name)}</small>`:''}</div>`).join('')}
      <div class="ltile dw other" id="otherBtn"><span class="em">${ic('keyboard')}</span>${L_('Something else','משהו אחר')}</div></div>`;
  box().querySelectorAll('[data-topic]').forEach(el=>el.onclick=()=>chooseTopic(el.dataset.topic,'menu',1));
  $('#otherBtn').onclick=()=>{ Learn.typed=''; Learn.kbSel=0; renderKeyboard(); };
}
function renderKeyboard(){
  Learn.screen='kb'; stopReading();
  const sug=suggestions(), top=sug[0], rest=sug.slice(1);
  const allowed=nextLetters(norm(Learn.typed)), mean = L_('did you mean?','התכוונת לזה?');
  box().innerHTML = `
    <div class="sugrow">
      ${top?`<div class="ltile dw search" id="searchBtn"><span class="em">${top.t.emoji}</span><span>${ic('search')} ${L_('Search','חיפוש')}: <b>${esc(top.t.name)}</b>${top.fuzzy?`<small>${mean}</small>`:''}</span></div>`:`<div class="ltile search off">${ic('search')} ${L_('Search','חיפוש')}</div>`}
      ${rest.map(r=>`<div class="ltile dw" data-topic="${esc(r.t.name)}"><span class="em">${r.t.emoji}</span>${esc(r.t.name)}${r.fuzzy?`<small>${mean}</small>`:''}</div>`).join('')}
      ${Array(3-rest.length).fill('<div class="ltile off"></div>').join('')}
    </div>
    <div class="typed"><span class="mono">${esc(Learn.typed)}<i>_</i></span><span class="hint">${Learn.kbSel} ${L_(Learn.kbSel===1?'selection':'selections','בחירות')} · ${L_("dimmed letters can't lead to a topic",'אותיות מעומעמות לא מובילות לשום נושא')}</span></div>
    <div class="kb">${LD().keys.map(k=>allowed.has(k)?`<div class="key dw" data-k="${k}">${k}</div>`:`<div class="key off">${k}</div>`).join('')}
      <div class="key dw ctl" id="bsKey">⌫</div><div class="key dw ctl" id="backKey">${ic('undo-2')} ${L_('Topics','נושאים')}</div></div>`;
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
  const t = LD().byName[name] || { emoji:'📘' }, lang = Lang.cur;
  box().innerHTML = `<div class="lhead"><div class="ltitle">${t.emoji} ${esc(name)}</div><div class="hint">${L_('Getting your lesson ready…','מכינים לך את השיעור…')}</div></div>`;
  let l = LD().lessons[name], src=L_('built-in lesson','שיעור מובנה');
  if(!l && window.LLM){ const r = await LLM.lesson(name, langName()); if(r && r.sentences.length){ l=r; src=`${r.source} · ${r.ms} ms (${L_('AI draft, product uses vetted sources','טיוטת AI; במוצר משתמשים במקורות בדוקים')})`; } }
  if(!l){
    src=L_('placeholder (no API key)','שיעור זמני (אין מפתח API)');
    const others=LD().index.filter(x=>x.name!==name).sort(()=>Math.random()-.5).slice(0,2).map(x=>x.name);
    l={ sentences: lang==='he'
          ? [`בואי נלמד על ${name}!`, `${name} הוא נושא שהרבה ילדים אוהבים.`, 'בגרסה המלאה, השיעור הזה מגיע מאנציקלופדיה לילדים, ומוקרא לך בקול.']
          : [`Let's learn about ${name}!`, `${name} is a topic many children love.`, `In the full version, this lesson comes from a children's encyclopedia, read aloud to you.`],
        questions:[{q:L_('What are we learning about today?','על מה אנחנו לומדים היום?'), options:[name,...others], answer:name}] };
  }
  if(Learn.topic!==name || Lang.cur!==lang) return;
  Learn.lesson={...l, src}; log('learn.lesson', `${name} · ${src}`);
  renderLesson();
}
function renderLesson(){
  Learn.screen='lesson';
  const t=LD().byName[Learn.topic] || { emoji:'📘' }, l=Learn.lesson;
  box().innerHTML = `<div class="lhead"><div class="ltitle">${t.emoji} ${esc(Learn.topic)}</div><div class="hint">${esc(l.src)}</div></div>
    <div class="ltext">${l.sentences.map((s,i)=>`<span data-i="${i}">${esc(s)}</span>`).join(' ')}</div>
    <div class="lbtns">
      <div class="ltile dw" id="againBtn"><span class="em">${ic('rotate-ccw')}</span>${L_('Read again','לקרוא שוב')}</div>
      <div class="ltile dw go" id="qBtn"><span class="em">${ic('circle-help')}</span>${L_('Questions','שאלות')}</div>
      <div class="ltile dw" id="notBtn"><span class="em">${ic('undo-2')}</span>${L_('Not this','לא את זה')}</div>
      <div class="ltile dw" id="topicsBtn"><span class="em">${ic('compass')}</span>${L_('Other topics','נושאים אחרים')}</div>
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
  const opts=[...q.options].sort(()=>Math.random()-.5), em=(LD().byName[Learn.topic]||{emoji:'📘'}).emoji;
  box().innerHTML = `<div class="lhead"><div class="hint">${em} ${esc(Learn.topic)} · ${L_(`question ${Learn.qi+1} of ${qs.length}`,`שאלה ${Learn.qi+1} מתוך ${qs.length}`)}</div>
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
    speak(ok ? L_('Yes! Well done.','כן! כל הכבוד.') : L_(`Good try. It's ${q.answer}.`,`ניסיון יפה. התשובה היא ${q.answer}.`));
    log('learn.answer', `${ok?'correct':'wrong'} · "${q.q}"`);
    setTimeout(()=>{ Learn.qi++; renderQuestion(); }, 1800);
  });
}
function renderDone(){
  const n=Learn.lesson.questions.length, got=L_(`You got ${Learn.score} of ${n}!`,`ענית נכון על ${Learn.score} מתוך ${n}!`);
  box().innerHTML = `<div class="lhead"><div class="ltitle">${ic('party-popper')} ${got}</div><div class="hint">${L_('Saved to the parent report','נשמר בדוח להורים')}: ${esc(Learn.topic)} · <span dir="ltr">${Learn.score}/${n}</span></div></div>
    <div class="lbtns">
      <div class="ltile dw go" id="moreBtn"><span class="em">${ic('compass')}</span>${L_('Learn something else','ללמוד משהו אחר')}</div>
      <div class="ltile dw" id="sameBtn"><span class="em">${ic('rotate-ccw')}</span>${L_(`${esc(Learn.topic)} again`,`${esc(Learn.topic)} שוב`)}</div>
    </div>`;
  speak(got);
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

/* opens every time Learn is opened (in Noa's mode: "Learn something else" and the Free choice lesson) */
Learn.open = renderMenu;
/* a language switch starts Learn over in the new language (topics and keyboard differ) */
addEventListener('langchange', () => { const b = box(); if(b && b.offsetParent!==null){ Learn.typed=''; Learn.kbSel=0; renderMenu(); } });
