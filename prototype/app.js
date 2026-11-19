/* ================= Rettina app flow =================
   1 Connect → 2 parent dashboard → 3 review + confirm schedule → 4 hand over →
   5 Noa's mode + calibration → 6 Today → 7 Start learning → 8 lesson with the teacher (lesson.js).
   Everything on these screens is simulated demo data, in English and Hebrew (tr(en, he) from i18n.js). */
(() => {
const ADULTS = {
  parent:  { key:'parent',  em:ic('user-round'),    name:() => tr('Tamar','תמר'),           role:() => tr('Parent','הורה') },
  teacher: { key:'teacher', em:ic('graduation-cap'), name:() => tr('Ms. Cohen','המורה כהן'), role:() => tr('Teacher','מורה') },
};
const SUBJ = {
  history: { em:ic('castle'), name:['History','היסטוריה'],       topics:['Medieval castles','Knights','Kings and queens'] },
  english: { em:ic('book-a'), name:['English','אנגלית'],          topics:['Rhyming words','Story characters','Opposites'] },
  math:    { em:ic('calculator'), name:['Math','חשבון'],              topics:['Adding to 100','Shapes','Counting by 2s'] },
  science: { em:ic('sprout'), name:['Science','מדעים'],           topics:['How plants grow','Weather','The water cycle'] },
  free:    { em:ic('sparkles'), name:['Free choice','בחירה חופשית'], topics:['Noa picks'] },
};
/* topic ids are the English names; Hebrew display names below. In Hebrew, "English" lessons teach Hebrew rhymes. */
const TOPIC_HE = {
  'Medieval castles':'טירות בימי הביניים', 'Knights':'אבירים', 'Kings and queens':'מלכים ומלכות',
  'Rhyming words':'מילים מתחרזות', 'Story characters':'דמויות בסיפור', 'Opposites':'הפכים',
  'Adding to 100':'חיבור עד 100', 'Shapes':'צורות', 'Counting by 2s':'ספירה בקפיצות של 2',
  'How plants grow':'איך צמחים גדלים', 'Weather':'מזג אוויר', 'The water cycle':'מחזור המים',
  'Noa picks':'נועה בוחרת', 'Horses':'סוסים',
};
const sn = k => tr(...SUBJ[k].name);
const tp = id => Lang.cur==='he' ? (TOPIC_HE[id] || id) : id;
const minW = () => tr('min','דק׳');
const ltr = s => `<span dir="ltr">${s}</span>`;
const START = 16*60, CAL_MIN = 2;

const App = window.App = {
  SUBJ, sn, tp, adult: ADULTS.parent, confirmed:false, confirmedAt:'', input:'mouse', calErr:null, sound:true,
  settings: { breakMin:3, confirmStep:true, readAloud:true, notify:true },
  sched: [],
  view: null,                       // re-draws the screen on show (used by the language switch)
};
const defaultSched = () => [
    { subj:'history', topic:'Medieval castles', min:15, src:{ k:'class' } },
    { subj:'english', topic:'Rhyming words',    min:10, src:{ k:'class' } },
    { subj:'math',    topic:'Adding to 100',    min:15, src:{ k:'suggest' } },
    { subj:'free',    topic:'Noa picks',        min:10, src:{ k:'own' } },
  ].map((x,i) => ({ ...x, id:i+1, status:'todo', score:'' }));
App.sched = defaultSched();
App.today = { answers:[], said:[], breaks:0 };
/* fresh start for the autoplay tour */
App.reset = () => {
  Object.assign(App, { sched:defaultSched(), today:{ answers:[], said:[], breaks:0 }, confirmed:false, confirmedAt:'', calErr:null, input:'mouse', adult:ADULTS.parent });
  Object.assign(App.settings, { breakMin:3, confirmStep:true, readAloud:true, notify:true });
  if($('#inputMode').value!=='mouse'){ $('#inputMode').value='mouse'; window.Gaze?.setMode('mouse'); }
  state.dwellOn = true; $('#dwellOn').checked = true;
  updateNav();
};
App.adultName = () => App.adult.name();
const srcText = s => ({
  class:   () => tr('Class plan · Ms. Cohen','תוכנית הכיתה · המורה כהן'),
  suggest: () => tr('Rettina suggests a review (2 of 4 right yesterday)','רטינה מציעה חזרה (2 מתוך 4 נכונות אתמול)'),
  own:     () => tr("Noa's own choice",'הבחירה של נועה'),
  changed: () => tr(`Changed by ${ADULTS[s.who].name()}`, `שונה על ידי ${ADULTS[s.who].name()}`),
  added:   () => tr(`Added by ${ADULTS[s.who].name()}`, `נוסף על ידי ${ADULTS[s.who].name()}`),
})[s.k]();

/* ---------- simulated history ---------- */
const YDAY = {
  minutes:42, right:11, total:14, msgs:9, spm:3.1, spmPrev:3.8,
  lessons:[ [ic('castle'),'history','Knights',15,'3 / 3'], [ic('book-a'),'english','Story characters',10,'4 / 5'],
            [ic('calculator'),'math','Adding to 100',12,'2 / 4'], [ic('heart'),'own','Horses',5,'2 / 2'] ],
  quality:{ valid:12, uncertain:2, none:0 },
};
const YEAR = {
  pct:31, pace:22,
  subj:[ [ic('castle'),'history',38,4], [ic('book-a'),'english',33,4], [ic('calculator'),'math',24,3], [ic('sprout'),'science',27,4] ],
  spm:[ [['Sep','ספט׳'],4.6], [['Oct','אוק׳'],3.9], [['Nov','נוב׳'],3.2] ],
  days:41, own:23, streak:6,
};

/* ---------- helpers ---------- */
const hm = m => `${Math.floor(m/60)}:${String(m%60).padStart(2,'0')}`;
const nowHM = () => new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', hour12:false });
const totalMin = () => App.sched.reduce((s,x) => s + x.min, 0);
const topicLabel = it => it.subj==='free' ? (it.topicDone || tr('You pick!','את בוחרת!')) : tp(it.topic);
const nextItem = () => App.sched.find(x => x.status!=='done');
App.topicLabel = topicLabel; App.nextItem = nextItem;
App.markDone = (it, right, total) => { if(App.sched.includes(it)){ it.status='done'; it.score=`${right} / ${total}`; } updateNav(); };
function timeline(){
  let t = START; const rows = [{ t, kind:'cal' }]; t += CAL_MIN;
  App.sched.forEach((it,i) => {
    rows.push({ t, kind:'lesson', it }); t += it.min;
    if(i < App.sched.length-1 && App.settings.breakMin){ rows.push({ t, kind:'break' }); t += App.settings.breakMin; }
  });
  return { rows, end:t };
}
function setMode(m){
  document.body.dataset.mode = m;
  try{ speechSynthesis.cancel(); }catch(e){}
  closeDemo();
}
function updateNav(){
  const s = $('#schedNavSub'); if(s) s.textContent = App.confirmed ? tr(`Confirmed ✓ ${App.confirmedAt}`, `אושר ✓ ${App.confirmedAt}`) : tr('Needs your review','מחכה לבדיקה');
}
const whoami = () => { $('#whoami').innerHTML = `${App.adult.em} ${esc(App.adultName())} · ${App.adult.role()}`; };

/* ================= 1 · CONNECT ================= */
let cxPressed = false;
function renderConnect(keep){
  leaveStudent(); hideModal(); setMode('connect');
  if(!keep) cxPressed = false;
  App.view = () => renderConnect(true);
  const A = ADULTS;
  $('#connect').innerHTML = `
  <div class="cx-top"><button class="btn sm primary play-btn" id="cxPlay">${ic('play')} ${tr('Play demo','הפעלת הדגמה')}</button><button class="lang-sw" type="button"></button><button class="btn sm demo-open">${t('demo')}</button></div>
  <div class="cx">
    <div class="cx-brand"><i></i><div><b>${tr('Rettina','רטינה')}</b><span>${tr('Learning and conversation by eye gaze','למידה ושיחה במבט עיניים')}</span></div></div>
    <div><div class="eyebrow">${tr('Connect','התחברות')}</div><h2>${tr('Who is using Rettina?','מי משתמש ברטינה?')}</h2></div>
    <div class="cx-acct"><span class="shield">${ic('shield-check')}</span>
      <div><b>${tr("Noa's family account",'החשבון המשפחתי של נועה')}</b><span class="chip acc">${tr('Parent responsible','באחריות ההורה')}</span>
      <small>${tr(`<b style="margin:0">Tamar (parent) is the responsible adult.</b> Noa's sessions start from a parent's or teacher's sign-in, a parent confirms each day's plan, and everything Noa does is saved to this account's reports.`,
                  `<b style="margin:0">תמר (הורה) היא המבוגרת האחראית.</b> הסשנים של נועה מתחילים מהתחברות של הורה או מורה, הורה מאשר את תוכנית היום בכל יום, וכל מה שנועה עושה נשמר בדוחות של החשבון.`)}</small></div>
    </div>
    <div class="cx-roles">
      <button class="cx-role" id="roleStudent" data-sel="${tr('✓ Selected','✓ נבחר')}"><span class="em">${ic('smile')}</span><b>${tr('Student','תלמידה')}</b><span>${tr('Noa · Grade 3','נועה · כיתה ג׳')}</span><small>${tr('Learns and talks by looking. No typing, no clicking.','לומדת ומדברת במבט. בלי הקלדה ובלי לחיצות.')}</small></button>
      <button class="cx-role ${cxPressed?'pressed':''}" id="roleAdult" data-sel="${tr('✓ Selected','✓ נבחר')}"><span class="em">${ic('users')}</span><b>${tr('Parent / Teacher','הורה / מורה')}</b><span>${tr('Tamar · Ms. Cohen','תמר · המורה כהן')}</span><small>${tr('Plans the day, approves lessons and homework, sees reports.','מתכננים את היום, מאשרים שיעורים ושיעורי בית, ורואים דוחות.')}</small></button>
    </div>
    <div class="cx-note" id="cxNote"></div>
    <div class="cx-sign ${cxPressed?'on':''}" id="cxSign">
      <div class="cx-who">${['parent','teacher'].map(k => `<button class="cx-chip ${k==='parent'?'on':''}" data-who="${k}">${A[k].em} ${A[k].name()} <small>${A[k].role()}</small></button>`).join('')}</div>
      <label class="cx-pinl">${tr('PIN','קוד')} <input id="cxPin" class="cx-pin" type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="••••"></label>
      <button class="btn primary" id="cxGo">${tr('Sign in →','כניסה ←')}</button>
      <span class="hint">${tr('Prototype: any 4 digits','אב־טיפוס: כל 4 ספרות')}</span>
    </div>
    <div class="cx-foot">${tr('Prototype · all data on these screens is simulated','אב־טיפוס · כל הנתונים במסכים האלה מדומים')}</div>
  </div>`;
  applyStatic();
  $('#cxPlay').onclick = () => window.Tour?.start();
  let who = 'parent';
  $('#roleAdult').onclick = () => {
    cxPressed = true;
    $('#roleAdult').classList.add('pressed'); $('#roleStudent').classList.remove('pressed');
    $('#cxNote').classList.remove('on'); $('#cxSign').classList.add('on'); $('#cxPin').focus();
  };
  $('#roleStudent').onclick = () => {
    if(App.confirmed){ $('#roleStudent').classList.add('pressed'); return enterStudent(); }
    $('#cxNote').innerHTML = tr(`${ic('triangle-alert')} <b>A parent starts Noa's day.</b> Sign in as Parent / Teacher, confirm today's plan, then switch to Noa's mode.`,
                                `${ic('triangle-alert')} <b>היום של נועה מתחיל אצל הורה.</b> צריך להתחבר כהורה או כמורה, לאשר את תוכנית היום, ואז לעבור למצב של נועה.`);
    $('#cxNote').classList.add('on');
    const a = $('#roleAdult'); a.classList.remove('pulse'); void a.offsetWidth; a.classList.add('pulse');
  };
  $('#cxSign').querySelectorAll('[data-who]').forEach(b => b.onclick = () => {
    who = b.dataset.who; $('#cxSign').querySelectorAll('[data-who]').forEach(x => x.classList.toggle('on', x===b)); $('#cxPin').focus();
  });
  const go = () => {
    const p = $('#cxPin');
    if(!/^\d{4}$/.test(p.value)){ p.classList.remove('bad'); void p.offsetWidth; p.classList.add('bad'); p.focus(); return; }
    signIn(who);
  };
  $('#cxGo').onclick = go;
  $('#cxPin').onkeydown = e => { if(e.key==='Enter') go(); };
}
function signIn(key){
  App.adult = ADULTS[key];
  log('auth.sign_in', `${App.adultName()} (${key})`);
  toParent('dash');
}
function toParent(view){
  leaveStudent(); hideModal(); setMode('parent');
  App.view = null;
  whoami(); updateNav(); showView(view);
}

/* ================= 2 · PARENT DASHBOARD ================= */
function renderDash(){
  const h = new Date().getHours();
  const greet = h<12 ? tr('Good morning','בוקר טוב') : h<18 ? tr('Good afternoon','צהריים טובים') : tr('Good evening','ערב טוב');
  $('#dashPg').innerHTML = `
  <div class="pg-head">
    <div><div class="eyebrow">${tr('Thursday 19 November','יום חמישי, 19 בנובמבר')}</div><h2>${greet}, ${esc(App.adultName())}</h2>
      <div class="sub">${tr('How Noa is doing: yesterday, today, and across the school year.','מה שלום נועה: אתמול, היום, ולאורך שנת הלימודים.')}</div></div>
    <span class="sp"></span>
    ${App.confirmed ? `<span class="chip ok">${tr(`✓ Today's plan confirmed ${App.confirmedAt}`, `✓ תוכנית היום אושרה ב־${App.confirmedAt}`)}</span>` : `<span class="chip warn">${ic('triangle-alert')} ${tr("Today's plan needs your review",'תוכנית היום מחכה לבדיקה')}</span>`}
    <button class="btn primary" data-act="switch">${ic('sparkles')} ${t('nav.switch')}</button>
  </div>
  <div class="cols3">
    <div class="col">${yesterdayHTML()}</div>
    <div class="col">${todayHTML()}</div>
    <div class="col">${yearHTML()}</div>
  </div>`;
}
function yesterdayHTML(){
  const Y = YDAY, q = Y.quality;
  const subjName = k => k==='own' ? tr('Her own pick','בחירה שלה') : sn(k);
  return `
  <div class="card">
    <h3>${ic('calendar-days')} ${tr('Yesterday','אתמול')} <span class="sp"></span><span class="hint">${tr('Wed 18 Nov','יום ד׳, 18 בנוב׳')}</span></h3>
    <div class="stats">
      <div class="stat"><small>${tr('Time learning','זמן למידה')}</small><b>${Y.minutes} ${minW()}</b><span class="d">${Y.lessons.length} ${tr('lessons','שיעורים')}</span></div>
      <div class="stat"><small>${tr('Answers right','תשובות נכונות')}</small><b>${ltr(`${Y.right} / ${Y.total}`)}</b><span class="d">${Math.round(Y.right/Y.total*100)}%</span></div>
      <div class="stat"><small>${tr('Messages she said','הודעות שאמרה')}</small><b>${Y.msgs}</b><span class="d">${tr('6 AI-completed · 3 exact','6 בהשלמת AI · 3 מדויקות')}</span></div>
      <div class="stat"><small>${tr('Looks per message','מבטים להודעה')}</small><b>${Y.spm}</b><span class="d ok">▼ ${(Y.spmPrev-Y.spm).toFixed(1)} ${tr('vs last week · faster','לעומת שבוע שעבר · מהר יותר')}</span></div>
    </div>
    <div class="rows">${Y.lessons.map(([em,s,id,m,sc]) => `<div class="rowi"><span class="em">${em}</span><div class="t"><b>${tp(id)}</b><small>${subjName(s)} · ${m} ${minW()}</small></div><span class="chip">${ltr(sc)}</span></div>`).join('')}</div>
  </div>
  <div class="card">
    <h3>${ic('message-circle')} ${tr('What Noa said','מה נועה אמרה')}</h3>
    <div class="quote">“${tr('Why did knights wear armor?','למה אבירים לבשו שריון?')}”<small>${tr('AI-completed · 3 looks · during History','השלמת AI · 3 מבטים · בשיעור היסטוריה')}</small></div>
    <div class="quote">“${tr('Horses again!','שוב סוסים!')}”<small>${tr('Her exact words · 2 looks · chose her own topic','המילים שלה בדיוק · 2 מבטים · בחרה נושא בעצמה')}</small></div>
  </div>
  <div class="card">
    <h3>${ic('gauge')} ${tr('How sure were her answers?','כמה בטוחות היו התשובות שלה?')}</h3>
    <div class="rows">
      <div class="rowi"><span class="em">${ic('circle-check')}</span><div class="t">${tr('Clear answers','תשובות ברורות')}<small>${tr('Counted toward her level','נספרות לחישוב הרמה')}</small></div><b>${q.valid}</b></div>
      <div class="rowi"><span class="em">${ic('rotate-ccw')}</span><div class="t">${tr('Hesitant answers','תשובות מהססות')}<small>${tr('Asked again with fewer choices','נשאלו שוב עם פחות אפשרויות')}</small></div><b>${q.uncertain}</b></div>
      <div class="rowi"><span class="em">${ic('circle-minus')}</span><div class="t">${tr('No answer','בלי תשובה')}<small>${tr('Tired or tracking lost, never counted as wrong','עייפות או איבוד מעקב, אף פעם לא נספר כטעות')}</small></div><b>${q.none}</b></div>
    </div>
    <div class="hint">${tr("Math: both hesitant answers were about adding with carrying, so there's a short review on today's plan.",'חשבון: שתי התשובות המהססות היו בחיבור עם העברה, ולכן יש חזרה קצרה בתוכנית של היום.')}</div>
  </div>`;
}
function todayHTML(){
  const tl = timeline(), T = App.today, calDone = App.calErr!=null;
  const row = r => {
    if(r.kind==='cal') return `<div class="tl-i ${calDone?'done':''}"><time>${hm(r.t)}</time><div class="t">${ic('crosshair')} ${tr('Eye calibration','כיול עיניים')}<small>${tr('With you · about 20 seconds','יחד איתך · כ־20 שניות')}</small></div><span class="chip ${calDone?'ok':''}">${calDone?tr('✓ done','✓ בוצע'):`${CAL_MIN} ${minW()}`}</span></div>`;
    if(r.kind==='break') return `<div class="tl-i brk"><time>${hm(r.t)}</time><div class="t">${ic('coffee')} ${tr('Break','הפסקה')}</div><span>${App.settings.breakMin} ${minW()}</span></div>`;
    const it = r.it, S = SUBJ[it.subj], done = it.status==='done';
    return `<div class="tl-i ${done?'done':''}"><time>${hm(r.t)}</time><div class="t">${S.em} <b>${sn(it.subj)}</b> · ${esc(topicLabel(it))}<small>${esc(srcText(it.src))}</small></div><span class="chip ${done?'ok':''}">${done?`✓ ${ltr(it.score)}`:`${it.min} ${minW()}`}</span></div>`;
  };
  const doneN = App.sched.filter(x => x.status==='done').length, right = T.answers.filter(x => x.ok).length;
  const progress = (doneN || T.answers.length || T.said.length) ? `
  <div class="card">
    <h3>${ic('sparkles')} ${tr('Today so far','היום עד עכשיו')}</h3>
    <div class="stats">
      <div class="stat"><small>${tr('Lessons done','שיעורים שהושלמו')}</small><b>${ltr(`${doneN} / ${App.sched.length}`)}</b></div>
      <div class="stat"><small>${tr('Answers right','תשובות נכונות')}</small><b>${ltr(`${right} / ${T.answers.length}`)}</b><span class="d">${T.answers.filter(x=>x.quality==='uncertain').length} ${tr('hesitant','מהססות')}</span></div>
      <div class="stat"><small>${tr('Said to Ollie','אמרה לינשופי')}</small><b>${T.said.length}</b></div>
      <div class="stat"><small>${tr('Breaks','הפסקות')}</small><b>${T.breaks}</b></div>
    </div>
    ${T.said.slice(-3).reverse().map(s => `<div class="quote">“${esc(s.text)}”<small>${esc(s.kind)}</small></div>`).join('')}
  </div>` : '';
  return `
  <div class="card">
    <h3>${ic('list-checks')} ${tr('Today','היום')} <span class="sp"></span><span class="hint">${tr('Thu 19 Nov','יום ה׳, 19 בנוב׳')} · ${ltr(`${hm(START)}–${hm(tl.end)}`)}</span></h3>
    ${App.confirmed
      ? `<div class="banner ok"><span>${ic('circle-check')}</span><div class="t"><b>${tr(`Confirmed by ${esc(App.adultName())} at ${App.confirmedAt}`, `אושר על ידי ${esc(App.adultName())} ב־${App.confirmedAt}`)}</b><small>${tr('Noa will see exactly this plan.','נועה תראה בדיוק את התוכנית הזאת.')}</small></div><button class="btn primary" data-act="switch">${tr("Switch to Noa's mode →",'מעבר למצב של נועה ←')}</button></div>`
      : `<div class="banner"><span>${ic('triangle-alert')}</span><div class="t"><b>${tr('Ready for your review','מוכנה לבדיקה שלך')}</b><small>${tr("Rettina drafted it from Ms. Cohen's class plan and yesterday's results.",'רטינה הכינה אותה מתוכנית הכיתה של המורה כהן ומהתוצאות של אתמול.')}</small></div><button class="btn primary" data-act="sched">${tr('Review & confirm','לבדוק ולאשר')}</button></div>`}
    <div>${tl.rows.map(row).join('')}</div>
    <div class="acts"><button class="btn" data-act="sched">${ic('pencil')} ${tr('Edit schedule','עריכת הלו״ז')}</button></div>
  </div>
  ${progress}
  <div class="card">
    <h3>${ic('bell')} ${tr('Needs your attention','דורש את תשומת לבך')}</h3>
    <div class="rows">
      <div class="rowi"><span class="em">${ic('file-text')}</span><div class="t"><b>${tr('New worksheet from Ms. Cohen','דף עבודה חדש מהמורה כהן')}</b><small>${tr('"The House in the Forest": questions need approval before Noa sees them','"הבית ביער": השאלות צריכות אישור לפני שנועה רואה אותן')}</small></div><button class="btn sm" data-act="hw">${tr('Review','לבדיקה')}</button></div>
      <div class="rowi"><span class="em">${ic('heart')}</span><div class="t"><b>${tr('Noa chose Horses 3 times this week','נועה בחרה בסוסים 3 פעמים השבוע')}</b><small>${tr("Her free-choice time is on today's plan",'זמן הבחירה החופשית שלה נמצא בתוכנית של היום')}</small></div></div>
    </div>
  </div>`;
}
function yearHTML(){
  const Y = YEAR, max = Math.max(...Y.spm.map(x => x[1]));
  return `
  <div class="card">
    <h3>${ic('trending-up')} ${tr('This school year','שנת הלימודים')} <span class="sp"></span><span class="hint">${tr('Sep – Jun','ספט׳ – יוני')}</span></h3>
    <div class="hero"><b>${Y.pct}%</b><span>${tr('of Grade 3 goals reached','מיעדי כיתה ג׳ הושגו')}</span></div>
    <div class="pbar" title="${tr(`${Y.pct}% reached · ${Y.pace}% expected by today`, `${Y.pct}% הושגו · ${Y.pace}% צפויים עד היום`)}"><s style="width:${Y.pct}%"></s><u style="inset-inline-start:${Y.pace}%"></u></div>
    <div class="pleg"><span><i></i>${tr('Reached','הושג')}</span><span><u></u>${tr(`Expected by today (${Y.pace}%)`, `צפוי עד היום (${Y.pace}%)`)}</span></div>
    <div><span class="chip ok">${tr('✓ On track · about 3 weeks ahead','✓ בקצב טוב · כ־3 שבועות לפני הצפוי')}</span></div>
  </div>
  <div class="card">
    <h3>${tr('By subject','לפי מקצוע')} <span class="sp"></span><span class="hint">${tr('Level','רמה')} ${ltr('1–7')}</span></h3>
    <div>${Y.subj.map(([em,k,p,lv]) => `<div class="sbar" title="${sn(k)}: ${p}% · ${tr(`level ${lv} of 7`, `רמה ${lv} מתוך 7`)}"><span>${em}</span><span>${sn(k)}</span><div class="pbar"><s style="width:${p}%"></s><u style="inset-inline-start:${Y.pace}%"></u></div><b>${p}%</b><span class="chip">${tr(`L${lv}`, `רמה ${lv}`)}</span></div>`).join('')}</div>
    <div class="hint">${tr('Math is closest to the expected line, so it gets extra review this week.','חשבון הכי קרוב לקו הצפוי, ולכן מקבל חזרה נוספת השבוע.')}</div>
  </div>
  <div class="card">
    <h3>${ic('zap')} ${tr('Looks per message','מבטים להודעה')} <span class="sp"></span><span class="hint">${tr('lower is faster','נמוך יותר = מהיר יותר')}</span></h3>
    <div class="mini-bars">${Y.spm.map(([m,v]) => `<div title="${tr(...m)}: ${v}"><b>${v}</b><i style="height:${v/max*82}%"></i></div>`).join('')}</div>
    <div class="mini-x">${Y.spm.map(([m]) => `<span>${tr(...m)}</span>`).join('')}</div>
    <div class="hint">${tr('A word-by-word board needs one look for every word.','בלוח של מילה אחר מילה צריך מבט אחד לכל מילה.')}</div>
  </div>
  <div class="card stats3">
    <div><b>${Y.days}</b><small>${tr('days learned','ימי למידה')}</small></div>
    <div><b>${Y.own}</b><small>${tr('topics she chose','נושאים שבחרה')}</small></div>
    <div><b>${Y.streak} ${ic('flame')}</b><small>${tr('day streak','ימים ברצף')}</small></div>
  </div>`;
}
$('#dashPg').addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if(!b) return;
  ({ sched:() => showView('sched'), switch:openSwitch, hw:() => showView('hw') })[b.dataset.act]?.();
});

/* ================= 3 · SCHEDULE REVIEW ================= */
function renderSched(){
  const tl = timeline(), tot = totalMin(), n = App.sched.length, over = tot > 50;
  const row = (it,i) => { const S = SUBJ[it.subj]; return `
    <div class="sc-row ${it.status==='done'?'done':''}">
      <div class="sc-move"><button class="icon-btn" data-act="up" data-i="${i}" ${i?'':'disabled'} aria-label="${tr('Move up','להזיז למעלה')}">▲</button><button class="icon-btn" data-act="down" data-i="${i}" ${i<n-1?'':'disabled'} aria-label="${tr('Move down','להזיז למטה')}">▼</button></div>
      <span class="sc-em">${S.em}</span>
      <div class="sc-mid">
        <div class="sc-sel">
          <select data-act="subj" data-i="${i}" aria-label="${tr('Subject','מקצוע')}">${Object.keys(SUBJ).map(k => `<option value="${k}" ${k===it.subj?'selected':''}>${sn(k)}</option>`).join('')}</select>
          ${it.subj==='free' ? `<span class="chip acc">${tr('Noa chooses any topic','נועה בוחרת כל נושא')}</span>` : `<select data-act="topic" data-i="${i}" aria-label="${tr('Topic','נושא')}">${S.topics.map(id => `<option value="${esc(id)}" ${id===it.topic?'selected':''}>${esc(tp(id))}</option>`).join('')}</select>`}
        </div>
        <small>${esc(srcText(it.src))}${it.status==='done'?` · ✓ ${tr('done','בוצע')} ${ltr(it.score)}`:''}</small>
      </div>
      <div class="step"><button data-act="minus" data-i="${i}" aria-label="${tr('Shorter','קצר יותר')}">−</button><span>${it.min} ${minW()}</span><button data-act="plus" data-i="${i}" aria-label="${tr('Longer','ארוך יותר')}">＋</button></div>
      <button class="icon-btn x" data-act="del" data-i="${i}" aria-label="${tr('Remove','הסרה')}">✕</button>
    </div>`; };
  const brk = App.settings.breakMin ? `<div class="sc-brk">${ic('coffee')} ${tr(`${App.settings.breakMin} min break`, `הפסקה של ${App.settings.breakMin} דק׳`)}</div>` : '';
  $('#schedPg').innerHTML = `
  <div class="pg-head">
    <div><div class="eyebrow">${tr('Thursday 19 November','יום חמישי, 19 בנובמבר')}</div><h2>${tr("Today's schedule",'הלו״ז של היום')}</h2>
      <div class="sub">${tr("Rettina drafted this from Ms. Cohen's class plan and yesterday's results. Change anything, then confirm.",'רטינה הכינה אותו מתוכנית הכיתה של המורה כהן ומהתוצאות של אתמול. אפשר לשנות כל דבר, ואז לאשר.')}</div></div>
    <span class="sp"></span>
    ${App.confirmed ? `<span class="chip ok">${tr(`✓ Confirmed ${App.confirmedAt}`, `✓ אושר ב־${App.confirmedAt}`)}</span>` : `<span class="chip warn">${ic('triangle-alert')} ${tr('Not confirmed yet','עוד לא אושר')}</span>`}
  </div>
  <div class="sc-wrap">
    <div class="card">
      <h3>${tr('Lessons','שיעורים')} <span class="sp"></span><span class="hint">${tr(`Starts ${hm(START)} after a ${CAL_MIN}-minute calibration`, `מתחיל ב־${hm(START)} אחרי כיול של ${CAL_MIN} דקות`)}</span></h3>
      <div class="sc-list">${App.sched.map((it,i) => row(it,i) + (i<n-1 ? brk : '')).join('')}</div>
      <div class="acts"><button class="btn" data-act="add">＋ ${tr('Add a lesson','הוספת שיעור')}</button></div>
    </div>
    <div class="col">
      <div class="card">
        <h3>${tr('Summary','סיכום')}</h3>
        <div class="stats">
          <div class="stat"><small>${tr('Learning time','זמן למידה')}</small><b>${tot} ${minW()}</b><span class="d">${n} ${tr('lessons','שיעורים')}</span></div>
          <div class="stat"><small>${tr('Ends at','מסתיים ב־')}</small><b>${hm(tl.end)}</b><span class="d">${tr('with breaks','כולל הפסקות')}</span></div>
        </div>
        ${over ? `<div class="banner"><span>${ic('triangle-alert')}</span><div class="t"><b>${tr("Longer than Noa's usual 50 minutes",'ארוך מ־50 הדקות הרגילות של נועה')}</b><small>${tr('Fatigue makes gaze less reliable. Consider a shorter lesson.','עייפות פוגעת באמינות המבט. כדאי לקצר שיעור.')}</small></div></div>`
               : `<div class="banner ok"><span>${ic('circle-check')}</span><div class="t"><b>${tr("Within Noa's 50-minute guide",'בתוך מסגרת 50 הדקות של נועה')}</b><small>${tr('Set with her therapist, based on fatigue.','נקבע עם המטפלת שלה, לפי עייפות.')}</small></div></div>`}
      </div>
      <div class="card">
        <h3>${tr('Session settings','הגדרות הסשן')}</h3>
        <label class="tg"><input type="checkbox" id="setConfirm" data-set="confirmStep" ${App.settings.confirmStep?'checked':''}><span><b>${tr('Confirm answers with a second look','אישור תשובות במבט שני')}</b><small>${tr('After Noa looks at an answer, a ✓ button appears under it. She looks at ✓ to lock in her choice, so a stray glance never counts.','אחרי שנועה מסתכלת על תשובה, מופיע מתחתיה כפתור ✓. היא מסתכלת עליו כדי לנעול את הבחירה, כך שמבט אקראי אף פעם לא נספר.')}</small></span></label>
        <label class="tg"><input type="checkbox" id="setRead" data-set="readAloud" ${App.settings.readAloud?'checked':''}><span><b>${tr('Read lessons aloud','הקראת השיעורים בקול')}</b><small>${tr("The teacher's words are spoken and highlighted.",'המילים של המורה מוקראות ומודגשות.')}</small></span></label>
        <label class="tg"><input type="checkbox" id="setNotify" data-set="notify" ${App.settings.notify?'checked':''}><span><b>${tr('Notify me','התראות אליי')}</b><small>${tr('When she asks for a break or for help.','כשהיא מבקשת הפסקה או עזרה.')}</small></span></label>
        <label class="tg"><span style="flex:1"><b>${tr('Break between lessons','הפסקה בין שיעורים')}</b></span><select id="setBreak" data-set="breakMin">${[0,3,5].map(v => `<option value="${v}" ${v===App.settings.breakMin?'selected':''}>${v} ${minW()}</option>`).join('')}</select></label>
        <label class="tg"><span style="flex:1"><b>${tr('Look time to select','זמן מבט לבחירה')}</b><small>${tr('How long Noa looks before a choice is made.','כמה זמן נועה מסתכלת עד שהבחירה נקלטת.')}</small></span><input type="range" id="setDwell" data-set="dwell" min="500" max="3000" step="100" value="${state.dwellMs}"><b class="mono" id="scDwell">${(state.dwellMs/1000).toFixed(1)}s</b></label>
      </div>
      <div class="card">
        ${App.confirmed
          ? `<div class="banner ok"><span>${ic('circle-check')}</span><div class="t"><b>${tr(`Confirmed at ${App.confirmedAt}`, `אושר ב־${App.confirmedAt}`)}</b><small>${tr('Noa will see exactly this plan. You can still change it, then confirm again.','נועה תראה בדיוק את התוכנית הזאת. עדיין אפשר לשנות ולאשר שוב.')}</small></div></div>
             <button class="btn primary sc-big" data-act="switch">${ic('sparkles')} ${tr("Switch to Noa's mode →",'מעבר למצב של נועה ←')}</button>`
          : `<button class="btn primary sc-big" data-act="confirm">${tr("✓ Confirm today's schedule",'✓ אישור הלו״ז של היום')}</button>
             <div class="hint">${tr('Noa will see exactly this plan, in this order.','נועה תראה בדיוק את התוכנית הזאת, בסדר הזה.')}</div>`}
      </div>
    </div>
  </div>`;
}
function schedChanged(){
  if(App.confirmed){ App.confirmed = false; toast(tr('Schedule changed. <small>Confirm it again when you are ready.</small>','הלו״ז השתנה. <small>אפשר לאשר שוב כשמוכנים.</small>')); }
  updateNav(); renderSched();
}
$('#schedPg').addEventListener('click', e => {
  const b = e.target.closest('button[data-act]'); if(!b) return;
  const i = +b.dataset.i, S = App.sched, it = S[i];
  switch(b.dataset.act){
    case 'up':    [S[i-1], S[i]] = [S[i], S[i-1]]; return schedChanged();
    case 'down':  [S[i+1], S[i]] = [S[i], S[i+1]]; return schedChanged();
    case 'minus': it.min = Math.max(5, it.min-5); return schedChanged();
    case 'plus':  it.min = Math.min(30, it.min+5); return schedChanged();
    case 'del':   S.splice(i,1); return schedChanged();
    case 'add': {
      const used = new Set(S.map(x => x.subj)), k = ['science','history','english','math'].find(x => !used.has(x)) || 'science';
      S.push({ id:Date.now(), subj:k, topic:SUBJ[k].topics[0], min:10, src:{ k:'added', who:App.adult.key }, status:'todo', score:'' });
      return schedChanged();
    }
    case 'confirm':
      App.confirmed = true; App.confirmedAt = nowHM();
      log('schedule.confirm', `${App.adultName()} · ${S.length} lessons · ${totalMin()} min`);
      toast(tr(`✓ <b>Today's schedule confirmed</b><small>${S.length} lessons · ${totalMin()} min · Noa will see exactly this plan</small>`,
               `✓ <b>הלו״ז של היום אושר</b><small>${S.length} שיעורים · ${totalMin()} דק׳ · נועה תראה בדיוק את התוכנית הזאת</small>`));
      updateNav(); return renderSched();
    case 'switch': return openSwitch();
  }
});
$('#schedPg').addEventListener('change', e => {
  const el = e.target, i = +el.dataset.i;
  if(el.dataset.act==='subj'){ const it = App.sched[i]; it.subj = el.value; it.topic = SUBJ[el.value].topics[0]; it.src = { k:'changed', who:App.adult.key }; return schedChanged(); }
  if(el.dataset.act==='topic'){ const it = App.sched[i]; it.topic = el.value; it.src = { k:'changed', who:App.adult.key }; return schedChanged(); }
  const k = el.dataset.set; if(!k) return;
  if(k==='breakMin'){ App.settings.breakMin = +el.value; return renderSched(); }
  if(k!=='dwell'){ App.settings[k] = el.checked; log('settings', `${k} = ${el.checked}`); }
});
$('#schedPg').addEventListener('input', e => {
  if(e.target.dataset.set!=='dwell') return;
  const v = +e.target.value; state.dwellMs = v; $('#dwellMs').value = v;
  $('#dwellVal').textContent = $('#scDwell').textContent = (v/1000).toFixed(1)+'s';
});
document.querySelector('.nav button[data-v="dash"]').addEventListener('click', renderDash);
document.querySelector('.nav button[data-v="sched"]').addEventListener('click', renderSched);

/* ================= 4 · HAND OVER TO NOA ================= */
function openSwitch(){
  App.input = $('#inputMode').value;
  const n = App.sched.length, tot = totalMin();
  const inputs = [['gaze', `${ic('eye')} ${tr('Eye gaze (webcam)','מבט עיניים (מצלמה)')}`], ['head', `${ic('smile')} ${tr('Head pointer','הצבעה בראש')}`], ['mouse', `${ic('mouse-pointer-2')} ${tr('Mouse (demo)','עכבר (הדגמה)')}`]];
  const secs = (state.dwellMs/1000).toFixed(1);
  showModal(`
    <div class="sw-head"><span class="sw-em">${ic('sparkles')}</span><div><h2 style="margin:0">${tr("Switch to Noa's mode",'מעבר למצב של נועה')}</h2>
      <div class="hint">${tr("Noa's screen has big targets, everything works by looking, and there are no menus.",'במסך של נועה יש מטרות גדולות, הכול עובד במבט, ואין תפריטים.')}</div></div></div>
    <div class="sw-list">
      <div class="sw-i">${App.confirmed ? `<span class="ok">${ic('circle-check')}</span>` : `<span>${ic('triangle-alert')}</span>`}<div><b>${tr("Today's plan",'תוכנית היום')}</b><small>${tr(`${n} lessons · ${tot} min`, `${n} שיעורים · ${tot} דק׳`)} · ${App.confirmed ? tr(`confirmed at ${App.confirmedAt}`, `אושרה ב־${App.confirmedAt}`) : tr('not confirmed yet','עוד לא אושרה')}</small></div>${App.confirmed ? '' : `<button class="btn sm" data-sw="review">${tr('Review','לבדיקה')}</button>`}</div>
      <div class="sw-i"><span>${ic('eye')}</span><div><b>${tr('How Noa selects','איך נועה בוחרת')}</b><div class="seg">${inputs.map(([k,l]) => `<button class="${App.input===k?'on':''}" data-in="${k}">${l}</button>`).join('')}</div>
        <small>${tr(`She looks at a target for ${secs} s to select it`, `היא מסתכלת על מטרה ${secs} שנ׳ כדי לבחור`)} · ${App.settings.confirmStep ? tr('answers need a second look on ✓ to confirm','תשובות צריכות מבט שני על ✓ לאישור') : tr('answers lock in on the first look','תשובות ננעלות כבר במבט הראשון')}</small></div></div>
      <div class="sw-i"><span>${ic('crosshair')}</span><div><b>${tr('Calibration comes first','קודם כיול')}</b><small>${tr('Stay with Noa for about 20 seconds. After that she can carry on by herself.','כדאי להישאר עם נועה כ־20 שניות. אחרי זה היא יכולה להמשיך לבד.')}</small></div></div>
      <div class="sw-i"><span>${ic('lock')}</span><div><b>${tr('Coming back','חזרה')}</b><small>${tr(`Press “Parent” at the top of the screen and enter your PIN. Looking at the screen can't close Noa's mode.`,'לוחצים על "הורה" בראש המסך ומקלידים קוד. מבט במסך לא יכול לסגור את המצב של נועה.')}</small></div></div>
    </div>
    <div class="sw-acts"><button class="btn" data-sw="cancel">${tr('Cancel','ביטול')}</button><button class="btn primary" data-sw="go">${tr("Switch to Noa's mode →",'מעבר למצב של נועה ←')}</button></div>`);
  $('#modalCard').onclick = e => {
    const inp = e.target.closest('[data-in]');
    if(inp){ App.input = inp.dataset.in; $('#modalCard').querySelectorAll('[data-in]').forEach(b => b.classList.toggle('on', b===inp)); return; }
    const b = e.target.closest('[data-sw]'); if(!b) return;
    if(b.dataset.sw==='cancel'){ closeModal(); }
    if(b.dataset.sw==='review'){ closeModal(); showView('sched'); }
    if(b.dataset.sw==='go'){ closeModal(); enterStudent(); }
  };
}
function closeModal(){ $('#modalCard').onclick = null; hideModal(); }

/* ================= 5–7 · NOA'S MODE ================= */
const stage = () => $('#sStage');
function setTop(crumb, home){
  $('#sCrumb').textContent = crumb || '';
  $('#sTopActs').innerHTML = home ? `<div class="st-home dw" id="sHome">${ic('house')} ${tr('Today','היום')}</div>` : '';
  if(home) $('#sHome').onclick = sToday;
}
function clearStage(){
  window.Lesson?.stop();
  const lb = $('#learnBox');
  if(lb && stage().contains(lb)){ try{ stopReading(); }catch(e){} $('#learn').appendChild(lb); }
  stage().classList.remove('paused');
}
function leaveStudent(){
  if(document.body.dataset.mode!=='student') return;
  clearStage();
  if(window.Gaze && $('#inputMode').value!=='mouse'){ $('#inputMode').value = 'mouse'; window.Gaze.setMode('mouse'); }
}
async function enterStudent(direct){
  hideModal(); setMode('student');
  state.dwellOn = true; $('#dwellOn').checked = true;
  log('mode.student', `handed over by ${App.adultName()} · input ${App.input}`);
  if(direct) return;
  clearStage(); setTop('');
  App.view = sWelcome;
  stage().innerHTML = `<div class="st-center"><div class="st-spin"></div><div class="st-sub">${tr("Switching to Noa's mode…",'עוברים למצב של נועה…')}</div></div>`;
  await sleep(900);
  if(document.body.dataset.mode==='student' && App.view===sWelcome) sWelcome();
}

/* 5 · welcome + calibration */
function sWelcome(){
  clearStage(); setTop(tr('Getting ready','מתכוננים')); App.view = sWelcome;
  stage().innerHTML = `
  <div class="st-center">
    <div class="st-big">${ic('hand')}</div>
    <div class="st-title">${tr('Hi Noa!','היי נועה!')}</div>
    <div class="st-sub">${tr("Let's get your eyes ready. Look at each dot until it gets small.",'בואי נכין את העיניים. תסתכלי על כל נקודה עד שהיא נהיית קטנה.')}</div>
    <div class="st-tile go dw" id="calGo"><span class="em">${ic('eye')}</span>${tr('Start','מתחילים')}</div>
    <div class="st-adult">${tr('For the adult: stay with Noa for this calibration (about 20 seconds). After that she can learn on her own.','למבוגר שליד נועה: כדאי להישאר איתה בזמן הכיול (כ־20 שניות). אחרי זה היא יכולה ללמוד לבד.')}</div>
  </div>`;
  $('#calGo').onclick = sCalibrate;
}
async function sCalibrate(){
  log('gaze.calibrate', `start · ${App.input}`);
  const err = App.input==='mouse' ? await simCalibrate() : await realCalibrate(App.input);
  App.calErr = err;
  sReady();
}
async function simCalibrate(){
  const ov = $('#calib'), pt = $('#calibDot'), msg = $('#calibMsg');
  ov.classList.add('on');
  msg.innerHTML = tr('Look at each dot until it gets small.<br><small>Demo with mouse input: this calibration is simulated.</small>','תסתכלי על כל נקודה עד שהיא נהיית קטנה.<br><small>הדגמה עם עכבר: הכיול הזה מדומה.</small>');
  const W = innerWidth, H = innerHeight, m = 70;
  await sleep(700);
  for(const [u,v] of [[.5,.5],[0,0],[.5,0],[1,0],[1,.5],[1,1],[.5,1],[0,1],[0,.5]]){
    pt.style.left = (m + u*(W-2*m)) + 'px'; pt.style.top = (m + v*(H-2*m)) + 'px';
    pt.classList.remove('shrink'); void pt.offsetWidth; pt.style.animationDuration = '850ms'; pt.classList.add('shrink');
    await sleep(850);
  }
  msg.innerHTML = tr('<b>Calibrated.</b>','<b>הכיול הושלם.</b>'); await sleep(700);
  ov.classList.remove('on'); pt.classList.remove('shrink');
  return 52 + Math.round(Math.random()*14);
}
async function realCalibrate(mode){
  try{
    await window.Gaze.calibrate();
    await window.Gaze.setMode(mode);
    $('#inputMode').value = mode;
    let c = null; try{ c = JSON.parse(localStorage.getItem('rettina.calib') || 'null'); }catch(_){}
    return c?.err?.[mode] ?? null;
  }catch(e){
    App.input = 'mouse'; $('#inputMode').value = 'mouse';
    try{ await window.Gaze.setMode('mouse'); }catch(_){}
    toast(tr(`Camera unavailable (${esc(e.message || e.name)}). <small>Continuing with the mouse.</small>`, `המצלמה לא זמינה (${esc(e.message || e.name)}). <small>ממשיכים עם העכבר.</small>`));
    return simCalibrate();
  }
}
function sReady(){
  clearStage(); setTop(tr('Ready','מוכנה')); App.view = sReady;
  const notify = App.settings.notify ? tr("You'll get a notification if she asks for a break or for help. ",'תקבלו התראה אם היא תבקש הפסקה או עזרה. ') : '';
  const cal = App.calErr!=null ? tr(` (±${App.calErr} px, targets are 140 px or more)`, ` (±${App.calErr} פיקסלים, והמטרות בגודל 140 פיקסלים ומעלה)`) : '';
  stage().innerHTML = `
  <div class="st-center">
    <div class="st-ok">✓</div>
    <div class="st-title">${tr('All set, Noa!','הכול מוכן, נועה!')}</div>
    <div class="st-sub">${tr('Your eyes are ready. You can learn on your own now.','העיניים מוכנות. עכשיו את יכולה ללמוד לבד.')}</div>
    <div class="st-tile go dw" id="goToday"><span class="em">${ic('play')}</span>${tr("Let's go",'יוצאים לדרך')}</div>
    <div class="handoff"><span class="em">${ic('circle-check')}</span><div><span class="tag">${tr('For the adult','למבוגר שליד נועה')}</span><b>${tr('You can step away. Noa can carry on by herself from here.','אפשר לזוז הצידה. מכאן נועה ממשיכה לבד.')}</b>
      ${tr(`Calibration is good${cal}. Every screen from now on works by looking, and nothing she picks is sent without her choosing it. `, `הכיול טוב${cal}. מעכשיו כל מסך עובד במבט, ושום דבר לא נשלח בלי שהיא בוחרת בו. `)}${notify}${tr('Her answers and messages go straight to your dashboard.','התשובות וההודעות שלה מגיעות ישר ללוח הבקרה שלכם.')}
      <small>${tr('To come back, press “Parent” at the top of the screen and enter your PIN.','כדי לחזור, לוחצים על "הורה" בראש המסך ומקלידים קוד.')}</small></div></div>
  </div>`;
  $('#goToday').onclick = sToday;
  log('handoff', `calibrated${App.calErr!=null?` ±${App.calErr}px`:''} · Noa continues independently`);
}

/* 6 · Today */
function sToday(){
  clearStage(); setTop(tr('Today','היום')); App.view = sToday;
  const n = App.sched.length, next = nextItem(), doneN = App.sched.filter(x => x.status==='done').length, all = !next;
  stage().innerHTML = `
  <div class="st-headrow">
    <div><div class="st-title">${all ? `${tr('You did it, Noa!','הצלחת, נועה!')} ${ic('party-popper')}` : tr("Today's learning",'הלמידה של היום')}</div>
      <div class="st-sub">${tr(`Thursday · ${n} lessons · about ${totalMin()} minutes`, `יום חמישי · ${n} שיעורים · בערך ${totalMin()} דקות`)}</div></div>
    <div class="st-prog">${App.sched.map(x => `<i class="${x.status}"></i>`).join('')}<span>${tr(`${doneN} of ${n} done`, `${doneN} מתוך ${n} הושלמו`)}</span></div>
  </div>
  <div class="st-plan">${App.sched.map(it => { const S = SUBJ[it.subj]; return `
    <div class="st-item ${it.status==='done'?'done':''} ${it===next?'next':''}">
      <span class="em">${S.em}</span><div><small>${sn(it.subj)}</small><b>${esc(topicLabel(it))}</b></div>
      <span class="min">${it.status==='done' ? `✓ ${ltr(it.score)}` : it===next ? tr(`Up next · ${it.min} min`, `הבא בתור · ${it.min} דק׳`) : `${it.min} ${minW()}`}</span>
    </div>`; }).join('')}</div>
  <div class="st-acts">
    <div class="st-tile go dw" id="sStart"><span class="em">${ic('play')}</span>${all ? tr('Learn more','ללמוד עוד') : tr('Start learning','מתחילים ללמוד')}<small>${next ? `${tr('Up next','הבא בתור')}: ${SUBJ[next.subj].em} ${esc(topicLabel(next))}` : tr('Pick any lesson you like','בחרי איזה שיעור שבא לך')}</small></div>
    <div class="st-tile dw" id="sElse"><span class="em">${ic('compass')}</span>${tr('Learn something else','ללמוד משהו אחר')}<small>${tr('Choose any topic you like','בחרי כל נושא שבא לך')}</small></div>
  </div>`;
  $('#sStart').onclick = sSubjects;
  $('#sElse').onclick = () => sLearnElse('menu');
}

/* 7 · Start learning: pick a lesson */
function sSubjects(){
  clearStage(); setTop(tr('Start learning','מתחילים ללמוד'), true); App.view = sSubjects;
  const next = nextItem();
  const tiles = App.sched.map(it => ({ it }));
  if(!App.sched.some(x => x.subj==='science')) tiles.push({ it:{ subj:'science', topic:'How plants grow', min:10 }, extra:true });
  tiles.push({ fav:'Horses', em:ic('heart'), min:10 });
  const shown = tiles.slice(0, 6), left = App.sched.filter(x => x.status!=='done').reduce((s,x) => s+x.min, 0);
  const tile = (x,i) => {
    if(x.fav) return `<div class="st-tile st-subj dw" data-t="${i}">
      <div class="st-subj-top"><span class="em">${x.em}</span><span class="chip acc">${tr('You love this','את אוהבת את זה')}</span></div>
      <div class="st-subj-mid"><small>${tr('Your topic','הנושא שלך')}</small><b>${tp(x.fav)}</b></div>
      <div class="st-subj-foot"><span>${ic('timer')} ${x.min} ${minW()}</span><span class="more">${tr('Picked 3 times this week','נבחר 3 פעמים השבוע')}</span></div></div>`;
    const it = x.it, S = SUBJ[it.subj], done = it.status==='done', isNext = it===next;
    const chip = done ? `<span class="chip ok">✓ ${ltr(it.score)}</span>` : isNext ? `<span class="chip acc">${tr('Up next','הבא בתור')}</span>` : x.extra ? `<span class="chip">${tr('Extra','תוספת')}</span>` : '';
    const more = it.subj==='free' ? tr('Any topic you like','כל נושא שבא לך') : `${tr('Also','עוד')}: ${S.topics.filter(id => id!==it.topic).map(tp).join(' · ')}`;
    return `<div class="st-tile st-subj dw ${done?'done':''} ${isNext?'next':''}" data-t="${i}">
      <div class="st-subj-top"><span class="em">${S.em}</span>${chip}</div>
      <div class="st-subj-mid"><small>${sn(it.subj)}</small><b>${esc(topicLabel(it))}</b></div>
      <div class="st-subj-foot"><span>${ic('timer')} ${it.min} ${minW()}</span><span class="more">${esc(more)}</span></div></div>`;
  };
  stage().innerHTML = `
  <div class="st-headrow">
    <div><div class="st-title">${tr('Start learning','מתחילים ללמוד')}</div><div class="st-sub">${tr('Look at a lesson to start it. Ollie, your teacher, will teach you.','תסתכלי על שיעור כדי להתחיל. ינשופי, המורה שלך, ילמד אותך.')}</div></div>
    <div class="st-sess"><b>${left} ${minW()}</b><small>${tr("left on today's plan",'נשארו בתוכנית של היום')}</small></div>
  </div>
  <div class="st-grid">${shown.map(tile).join('')}</div>`;
  stage().querySelectorAll('[data-t]').forEach(el => el.onclick = () => {
    const x = shown[+el.dataset.t];
    if(x.fav) return sLearnElse(x.fav);
    openItem(x.it);
  });
}
function openItem(it, carry){
  if(it.subj==='free') return sLearnElse('menu');
  clearStage(); setTop(`${sn(it.subj)} · ${tp(it.topic)}`, true);
  App.view = () => openItem(it, window.Lesson.state());
  window.Lesson.start(it, { onNext:it2 => openItem(it2), onHome:sToday }, carry);
}
App.openItem = openItem;

/* "Learn something else" and free choice reuse the Learn module (topic menu + gaze keyboard) */
function sLearnElse(what){
  clearStage(); setTop(tr('Learn something else','ללמוד משהו אחר'), true);
  App.view = () => sLearnElse('menu');
  stage().innerHTML = '';
  const lb = $('#learnBox'); stage().appendChild(lb);
  if(what==='menu') Learn.open(); else chooseTopic(tp(what), 'menu', 1);
}
const origDone = window.renderDone;
window.renderDone = function(){
  origDone();
  if(document.body.dataset.mode!=='student') return;
  const f = App.sched.find(x => x.subj==='free' && x.status!=='done');
  if(f){ f.topicDone = Learn.topic; App.markDone(f, Learn.score, Learn.lesson.questions.length); }
};

/* parent exit (PIN) and sound */
$('#sExit').onclick = () => {
  showModal(`<h2 style="margin:0">${ic('lock')} ${tr('Back to parent mode','חזרה למצב הורה')}</h2>
    <div class="hint">${tr("Enter your PIN. Noa's progress is saved.",'מקלידים קוד. ההתקדמות של נועה נשמרת.')}</div>
    <div class="acts" style="align-items:center"><input id="exitPin" class="cx-pin" type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="••••">
    <span class="hint">${tr('Prototype: any 4 digits','אב־טיפוס: כל 4 ספרות')}</span></div>
    <div class="sw-acts"><button class="btn" data-x="cancel">${tr('Cancel','ביטול')}</button><button class="btn primary" data-x="go">${tr('Unlock','פתיחה')}</button></div>`);
  const pin = $('#exitPin'); pin.focus();
  const go = () => {
    if(!/^\d{4}$/.test(pin.value)){ pin.classList.remove('bad'); void pin.offsetWidth; pin.classList.add('bad'); return; }
    closeModal(); log('mode.parent', `${App.adultName()} unlocked with PIN`); toParent('dash');
  };
  pin.onkeydown = e => { if(e.key==='Enter') go(); if(e.key==='Escape') closeModal(); };
  $('#modalCard').onclick = e => { const b = e.target.closest('[data-x]'); if(!b) return; b.dataset.x==='go' ? go() : closeModal(); };
};
$('#sSound').onclick = () => {
  App.sound = !App.sound;
  const k = App.sound ? 'stu.sound' : 'stu.muted';
  $('#sSound').innerHTML = `${ic(App.sound ? 'volume-2' : 'volume-x')} <span data-i18n="${k}">${t(k)}</span>`;
  if(!App.sound) try{ speechSynthesis.cancel(); }catch(e){}
};
$('#toStudent').onclick = openSwitch;
$('#signOut').onclick = () => { log('auth.sign_out', App.adultName()); renderConnect(); };

/* ================= demo navigator (for presenting the flow) ================= */
const lessonItem = () => App.sched.find(x => x.subj==='history') || App.sched.find(x => x.subj!=='free') || { subj:'history', topic:'Medieval castles', min:15 };
const DEMO = [
  [() => `${ic('play')} ${tr('Play the whole demo','הפעלת ההדגמה המלאה')}`, () => window.Tour?.start()],
  [() => tr('Connect: who is using Rettina','התחברות: מי משתמש ברטינה'), () => renderConnect()],
  [() => tr('Parent dashboard','לוח בקרה להורה'),                      () => toParent('dash')],
  [() => tr('Review and confirm the schedule','בדיקה ואישור של הלו״ז'), () => toParent('sched')],
  [() => tr("Switch to Noa's mode",'מעבר למצב של נועה'),                () => { toParent('dash'); openSwitch(); }],
  [() => tr("Noa's screen + calibration",'המסך של נועה + כיול'),       () => { enterStudent(true); sWelcome(); }],
  [() => tr("Today's learning",'הלמידה של היום'),                     () => { enterStudent(true); sToday(); }],
  [() => tr('Start learning: pick a lesson','מתחילים ללמוד: בחירת שיעור'), () => { enterStudent(true); sSubjects(); }],
  [() => tr('Lesson with Ollie (AI teacher)','שיעור עם ינשופי (מורה AI)'), () => { enterStudent(true); openItem(lessonItem()); }],
];
function closeDemo(){ $('#demoMenu').classList.remove('on'); }
document.addEventListener('click', e => {
  const open = e.target.closest('.demo-open');
  if(open){
    const m = $('#demoMenu');
    if(m.classList.contains('on')) return closeDemo();
    m.innerHTML = `<div class="eyebrow">${tr('Jump to screen','מעבר למסך')}</div>` + DEMO.map((d,i) => `<button data-d="${i}" ${i?'':'class="play-btn"'}><b>${i||''}</b>${d[0]()}</button>`).join('');
    const r = open.getBoundingClientRect();
    m.style.top = (r.bottom + 6) + 'px';
    m.style.left = Math.max(8, Math.min(innerWidth - 298, Lang.cur==='he' ? r.left : r.right - 290)) + 'px';
    m.classList.add('on'); return;
  }
  const d = e.target.closest('#demoMenu [data-d]');
  if(d){ closeDemo(); closeModal(); if(+d.dataset.d) window.Tour?.stop(); DEMO[+d.dataset.d][1](); return; }
  if(!e.target.closest('#demoMenu')) closeDemo();
});

/* ================= language switch: redraw whatever is on screen ================= */
addEventListener('langchange', () => {
  closeDemo();
  const modalOpen = $('#modal').classList.contains('on');
  const mode = document.body.dataset.mode;
  if(mode==='parent'){ whoami(); updateNav(); if(modalOpen && $('#modalCard .sw-head')) openSwitch(); }
  else if(mode==='student'){
    if(modalOpen) closeModal();
    if(App.view) App.view();
  }
  else renderConnect(true);
});

/* start at the Connect screen, or jump to a screen: #3, #he-8 … (or ?screen=3 when served locally) */
renderDash(); updateNav(); renderConnect();
App.go = n => { closeModal(); DEMO[n][1](); };     // n = screen 1…8
const hashN = (location.hash.match(/\d/) || [])[0];
const jump = +(new URLSearchParams(location.search).get('screen') || hashN || 0);
if(jump >= 1 && jump <= 8) addEventListener('DOMContentLoaded', () => DEMO[jump][1]());   // after lesson.js has loaded
/* plays by itself on open, like a video; #manual (or a screen number) opens it for clicking around */
else if(!/manual/.test(location.hash)) addEventListener('load', () => setTimeout(() => window.Tour?.start(), 900));
addEventListener('hashchange', () => {
  const h = location.hash.slice(1).toLowerCase();
  const l = /(^|-)he(-|$)/.test(h) ? 'he' : /(^|-)en(-|$)/.test(h) ? 'en' : null;
  if(l) setLang(l);
  const n = +((h.match(/\d/) || [])[0] || 0);
  if(n >= 1 && n <= 8){ window.Tour?.stop(); closeModal(); DEMO[n][1](); }
});
})();
