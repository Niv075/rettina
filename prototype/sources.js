/* ================= Sources: where lessons and questions come from =================
   Three trust levels: 1 Ministry of Education (official; SAMPLE entries in this demo),
   2 school / teacher uploads, 3 parent files. Parent PDF / Word / text files are read right here in
   the browser (PDF.js, Mammoth), checked for other people's names, and wait for approval.
   File contents are treated as reference text only, never as instructions. */
(() => {
const LIBS = {
  pdf:     'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  pdfWork: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  docx:    'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js',
};
/* sample curriculum entries: placeholders that show the shape of a real integration, not real Ministry documents */
const MINISTRY = {
  history: { units:4, title:['Grade 3 History: the Middle Ages: castles, knights and daily life','היסטוריה כיתה ג׳: ימי הביניים: טירות, אבירים וחיי היום־יום'] },
  english: { units:5, title:['Grade 3 Language: rhymes, sounds and word patterns','שפה כיתה ג׳: חריזה, צלילים ודפוסי מילים'] },
  math:    { units:6, title:['Grade 3 Math: addition and subtraction up to 100','חשבון כיתה ג׳: חיבור וחיסור עד 100'] },
  science: { units:3, title:['Grade 3 Science: plants and how they grow','מדע וטכנולוגיה כיתה ג׳: צמחים וגדילה'] },
};
const S = { uploads:[], seq:0 };
const box = () => $('#sourcesPg');

/* ---------- reading files in the browser ---------- */
const loaded = {};
function load(src){
  return loaded[src] ||= new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = src;
    s.onload = res; s.onerror = () => rej(new Error('could not load a file reader'));
    document.head.append(s);
  });
}
async function readFile(file){
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if(ext === 'pdf'){
    await load(LIBS.pdf); await load(LIBS.pdfWork);          // the worker script also runs on the page, so no separate worker is needed
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = LIBS.pdfWork;
    const doc = await window.pdfjsLib.getDocument({ data:new Uint8Array(await file.arrayBuffer()) }).promise;
    let text = '';
    for(let p = 1; p <= Math.min(doc.numPages, 40); p++){
      const c = await (await doc.getPage(p)).getTextContent();
      text += c.items.map(i => i.str).join(' ') + '\n';
    }
    return { kind:'PDF', text, pages:doc.numPages };
  }
  if(ext === 'docx'){
    await load(LIBS.docx);
    const r = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return { kind:'Word', text:r.value };
  }
  if(ext === 'txt' || ext === 'md') return { kind:'Text', text: await file.text() };
  throw new Error(tr('Use a PDF, Word (.docx) or text file.','אפשר להעלות קובץ PDF, Word ‏(docx) או טקסט.'));
}
/* a quick privacy check: names of other people that should be removed before Noa uses the file */
const HE_NAMES = ['דן','יעל','מאיה','תמר','יוסי','רון','נועם','אורי','שירה','איתי','עומר','מיכל','דניאל','אביגיל','נועה'];
const NOT_NAMES = new Set('The A An In On At Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April May June July August September October November December Grade Worksheet Class Ms Mr Mrs Look Read Write Answer Then When What Why How Who Where This That They She He It We You Our Their Middle Ages England Europe Around Question Questions Answer Answers Draw Circle Color Name Date Page Unit Lesson Story Reading Plants Animals'.split(' '));
function findNames(text){
  /* a capitalised word counts as a possible name unless it is a common word or also appears in lowercase ("Knights" / "knight") */
  const found = new Set(), lower = text.toLowerCase();
  (text.match(/\b[A-Z][a-z]{2,}\b/g) || []).forEach(w => {
    const l = w.toLowerCase(), stem = l.replace(/s$/, '');
    if(NOT_NAMES.has(w) || (typeof STOP !== 'undefined' && STOP.has(l))) return;
    if(new RegExp(`\\b${stem}s?\\b`).test(lower.replace(new RegExp(`\\b${l}\\b`, 'g'), ''))) return;
    found.add(w);
  });
  HE_NAMES.forEach(n => { if(new RegExp(`(^|[\\s"׳,.(])[והבלש]?${n}($|[\\s"׳,.!?)])`).test(text)) found.add(n); });
  return [...found].slice(0, 6);
}
const GUESS = [
  ['history', /castle|knight|medieval|king|queen|טיר|אביר|ימי הביניים|מלך/i],
  ['math',    /add|plus|sum|tens|ones|\d+\s*\+\s*\d+|חיבור|עשרות|יחידות|חשבון/i],
  ['english', /rhyme|poem|word|sound|חרוז|מתחרז|צליל|שיר/i],
  ['science', /plant|seed|root|leaf|grow|צמח|זרע|שורש|עלה/i],
];
const guess = text => (GUESS.find(([, re]) => re.test(text)) || [null])[0];

async function addFile(file){
  const id = ++S.seq, up = { id, name:file.name, status:'reading', by:App.adultName() };
  S.uploads.unshift(up); render();
  try{
    const r = await readFile(file);
    const text = r.text.replace(/\s+\n/g, '\n').trim();
    Object.assign(up, r, { text, words:(text.match(/\S+/g) || []).length, names:findNames(text), subj:guess(text), status: text ? 'pending' : 'empty' });
    log('sources.upload', `${file.name} · ${r.kind} · ${up.words} words${up.pages?` · ${up.pages} pages`:''} · ${up.names.length} possible names · waiting for approval`);
  }catch(e){
    Object.assign(up, { status:'error', error:e.message });
    log('sources.error', `${file.name}: ${e.message}`);
  }
  render();
}
/* the demo's own sample "school worksheet" (used by the tour) goes through the same reader */
function addSample(){
  const he = Lang.cur === 'he';
  const text = he
    ? 'דף עבודה: טירות בימי הביניים (כיתה ג׳)\nבימי הביניים מלכים ומלכות גרו בטירות גדולות מאבן. לטירה היו חומות עבות, מגדלים וגשר זחיח שאפשר להרים. מסביב לטירה היה חפיר מלא במים. השבוע דן ויעל ציירו טירה עם ארבעה מגדלים. שאלה לדיון: למה הגשר הזחיח עזר לשמור על הטירה?'
    : 'Worksheet: Castles in the Middle Ages (Grade 3)\nIn the Middle Ages, kings and queens lived in big stone castles. A castle had thick walls, tall towers and a drawbridge that could be pulled up. Around the castle there was a moat full of water. This week Dan and Yael drew a castle with four towers. Question to discuss: why did the drawbridge help keep the castle safe?';
  return addFile(new File([text], he ? 'דף עבודה - טירות.txt' : 'Class worksheet - Castles.txt', { type:'text/plain' }));
}

/* ---------- the page ---------- */
function render(){
  const el = box(); if(!el) return;
  const planned = new Set(App.sched.map(x => x.subj));
  el.innerHTML = `
  <div class="pg-head">
    <div><div class="eyebrow">${tr('Parent','הורה')}</div><h2>${tr('Sources','מקורות')}</h2>
      <div class="sub">${tr("Where Noa's lessons and questions come from. Rettina only uses the sources listed here, and every lesson shows which one it used.",'מאיפה מגיעים השיעורים והשאלות של נועה. רטינה משתמשת רק במקורות שמופיעים כאן, וכל שיעור מראה באיזה מקור השתמש.')}</div></div>
  </div>
  <div class="src-wrap">
    <div class="col">
      <div class="card" id="srcMinistry">
        <h3>${ic('landmark')} ${tr('Official: Ministry of Education','רשמי: משרד החינוך')} <span class="sp"></span><span class="chip ok">${ic('badge-check')} ${tr('Connected','מחובר')}</span></h3>
        <div class="banner"><span>${ic('triangle-alert')}</span><div class="t"><b>${tr('Sample entries in this prototype','רשומות לדוגמה באב־הטיפוס')}</b><small>${tr("These show how curriculum units would appear. A real integration needs the Ministry's permission and terms of use.",'הן מראות איך יחידות מתוכנית הלימודים יופיעו. חיבור אמיתי דורש אישור ותנאי שימוש של משרד החינוך.')}</small></div></div>
        <div class="rows">${Object.entries(MINISTRY).map(([k, m]) => `
          <div class="rowi"><span class="em">${App.SUBJ[k].em}</span><div class="t"><b>${tr(...m.title)}</b><small>${tr(`Curriculum · ${m.units} units`, `תוכנית לימודים · ${m.units} יחידות`)}</small></div>
          ${planned.has(k) ? `<span class="chip acc">${tr("In today's plan",'בתוכנית של היום')}</span>` : `<span class="chip">${tr('Available','זמין')}</span>`}</div>`).join('')}</div>
      </div>
      <div class="card">
        <h3>${ic('layers')} ${tr('How Rettina uses sources','איך רטינה משתמשת במקורות')}</h3>
        <div class="rows">
          <div class="rowi"><span class="em">1</span><div class="t"><b>${tr('Ministry of Education','משרד החינוך')}</b><small>${tr('Facts and grade level. Wins when sources disagree on a fact.','עובדות ורמת כיתה. גובר כשמקורות חלוקים על עובדה.')}</small></div></div>
          <div class="rowi"><span class="em">2</span><div class="t"><b>${tr("School and teacher files",'קבצים מבית הספר ומהמורה')}</b><small>${tr('What the class is learning this week. Approved by the teacher.','מה הכיתה לומדת השבוע. באישור המורה.')}</small></div></div>
          <div class="rowi"><span class="em">3</span><div class="t"><b>${tr('Your files','הקבצים שלכם')}</b><small>${tr('Extra context and her interests. Nothing reaches Noa until you approve it.','הקשר נוסף ותחומי העניין שלה. שום דבר לא מגיע לנועה לפני שאתם מאשרים.')}</small></div></div>
        </div>
        <div class="hint">${ic('shield-check')} ${tr('Rettina answers only from these sources and treats file text as reference, never as instructions.','רטינה עונה רק מתוך המקורות האלה, ומתייחסת לטקסט בקבצים כחומר עזר בלבד, אף פעם לא כהוראות.')}</div>
      </div>
    </div>
    <div class="col">
      <div class="card">
        <h3>${ic('file-up')} ${tr('Add a school or custom file','הוספת קובץ מבית הספר או קובץ משלכם')}</h3>
        <label class="src-drop" id="srcDrop">
          <input type="file" id="srcFile" accept=".pdf,.docx,.txt,.md" multiple hidden>
          <span class="src-drop-ic">${ic('upload')}</span>
          <b>${tr('Drop a PDF or Word file here, or choose a file','גררו לכאן קובץ PDF או Word, או בחרו קובץ')}</b>
          <small>${tr('Worksheets, class readings, a page from a book she loves','דפי עבודה, קטעי קריאה מהכיתה, עמוד מספר שהיא אוהבת')}</small>
        </label>
        <div class="hint">${ic('lock')} ${tr("Files are read here in the browser and kept in the family account. They are never used to train AI. (In this prototype they stay in this browser only.)",'הקבצים נקראים כאן בדפדפן ונשמרים בחשבון המשפחתי. הם אף פעם לא משמשים לאימון AI. (באב־הטיפוס הם נשארים רק בדפדפן הזה.)')}</div>
      </div>
      ${S.uploads.map(upHTML).join('') || `<div class="card src-none"><div class="hint">${tr('No files yet. Approved files appear on the lessons they are used in.','עדיין אין קבצים. קבצים מאושרים מופיעים בשיעורים שבהם משתמשים בהם.')}</div></div>`}
    </div>
  </div>`;
  const inp = $('#srcFile'), drop = $('#srcDrop');
  inp.onchange = () => { [...inp.files].forEach(addFile); inp.value = ''; };
  drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = () => drop.classList.remove('over');
  drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); [...e.dataTransfer.files].forEach(addFile); };
}
function upHTML(u){
  const subj = u.subj ? `<span class="chip">${App.SUBJ[u.subj].em} ${App.sn(u.subj)}</span>` : '';
  if(u.status === 'reading') return `<div class="card src-up"><h3>${ic('file-text')} ${esc(u.name)}</h3><div class="hint">${tr('Reading the file…','קורא את הקובץ…')}</div></div>`;
  if(u.status === 'error' || u.status === 'empty') return `<div class="card src-up"><h3>${ic('file-text')} ${esc(u.name)} <span class="sp"></span><button class="btn sm" data-src="remove" data-id="${u.id}">${ic('trash-2')}</button></h3>
    <div class="banner"><span>${ic('triangle-alert')}</span><div class="t"><b>${tr("Couldn't read this file",'לא הצלחתי לקרוא את הקובץ')}</b><small>${esc(u.error || tr('No text found. Scanned pages need a version with real text.','לא נמצא טקסט. עמודים סרוקים צריכים גרסה עם טקסט אמיתי.'))}</small></div></div></div>`;
  const ok = u.status === 'approved';
  return `<div class="card src-up ${ok ? 'ok' : ''}">
    <h3>${ic('file-text')} <span class="src-name">${esc(u.name)}</span> <span class="sp"></span>${ok ? `<span class="chip ok">${ic('badge-check')} ${tr('Approved for Noa','מאושר לנועה')}</span>` : `<span class="chip warn">${tr('Waiting for you','מחכה לאישור')}</span>`}</h3>
    <div class="src-meta">${esc(u.kind)} · ${u.words} ${tr('words','מילים')}${u.pages ? ` · ${u.pages} ${tr(u.pages === 1 ? 'page' : 'pages', u.pages === 1 ? 'עמוד' : 'עמודים')}` : ''} · ${tr('added by','הוסף על ידי')} ${esc(u.by)} ${subj}</div>
    ${u.names.length ? `<div class="banner"><span>${ic('shield-alert')}</span><div class="t"><b>${tr('Check for other children\'s names','כדאי לבדוק שמות של ילדים אחרים')}</b><small>${tr('Found','נמצאו')}: ${u.names.map(esc).join(', ')}. ${tr('Remove them from the file if they should not be shared.','כדאי להסיר אותם מהקובץ אם אין לשתף אותם.')}</small></div></div>` : ''}
    <div class="src-text" dir="auto">${esc(u.text.slice(0, 700))}${u.text.length > 700 ? '…' : ''}</div>
    <div class="acts">
      ${ok ? '' : `<button class="btn primary" data-src="approve" data-id="${u.id}">${ic('check')} ${tr('Approve for Noa','אישור לנועה')}</button>`}
      <button class="btn" data-src="questions" data-id="${u.id}">${ic('sparkles')} ${tr('Make questions from it','יצירת שאלות ממנו')}</button>
      <button class="btn" data-src="remove" data-id="${u.id}">${ic('trash-2')} ${tr('Remove','הסרה')}</button>
    </div>
  </div>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('#sourcesPg [data-src]'); if(!b) return;
  const u = S.uploads.find(x => x.id === +b.dataset.id); if(!u) return;
  if(b.dataset.src === 'approve'){ u.status = 'approved'; log('sources.approve', `${u.name} · approved by ${App.adultName()}`);
    toast(`${ic('badge-check')} <b>${tr('Approved for Noa','אושר לנועה')}</b><small>${esc(u.name)}${u.subj ? ` · ${App.sn(u.subj)}` : ''}</small>`); }
  if(b.dataset.src === 'remove'){ S.uploads = S.uploads.filter(x => x !== u); log('sources.remove', u.name); }
  if(b.dataset.src === 'questions'){ showView('hw'); $('#hwInput').value = u.text; $('#genBtn').click(); return; }
  render();
});
document.querySelector('.nav button[data-v="sources"]').addEventListener('click', render);

/* the source badge on a lesson: the Ministry unit, plus approved files on the same subject */
function badge(subj){
  const m = MINISTRY[subj]; if(!m) return '';
  const files = S.uploads.filter(u => u.status === 'approved' && (!u.subj || u.subj === subj));
  const tip = [tr(...m.title) + ` (${tr('sample','לדוגמה')})`, ...files.map(f => `${f.name} · ${tr('added by','הוסף על ידי')} ${f.by}`)].join(' · ');
  return `<span class="src-badge" title="${esc(tip)}">${ic('landmark')} ${tr('Ministry of Education','משרד החינוך')}${files.length ? ` <span class="src-plus">+ ${ic('paperclip')} ${files.length === 1 ? esc(files[0].name.replace(/\.[a-z]+$/i, '')) : `${files.length} ${tr('files','קבצים')}`}</span>` : ''}</span>`;
}
const pending = () => S.uploads.filter(u => u.status === 'pending').length;
function reset(){ S.uploads = []; render(); }

window.Sources = { render, addFile, addSample, badge, pending, reset };
})();
