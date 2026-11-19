/* ================= Autoplay tour: the demo plays itself, like a video =================
   It drives the real app: a mouse cursor clicks through the parent screens, and a gaze ring
   "looks" at Noa's tiles so the real dwell bar fills and selects. Captions explain each step.
   Click anywhere (or ⏸) to pause, ✕ to stop and explore by hand. */
(() => {
class Stopped extends Error {}
const T = { on:false, paused:false, stopped:false, ch:0, cap:null };
let cursor, cap, block;
const q = s => document.querySelector(s);

function ui(){
  if(cursor) return;
  block = Object.assign(document.createElement('div'), { className:'tour-block', title:'Pause / continue' });
  cursor = Object.assign(document.createElement('div'), { className:'tour-cursor mouse' });
  cap = Object.assign(document.createElement('div'), { className:'tour-cap', role:'status' });
  cap.setAttribute('aria-live', 'polite');
  document.body.append(block, cursor, cap);
  block.onclick = togglePause;
  cap.addEventListener('click', e => {
    const b = e.target.closest('[data-tc]'); if(!b) return;
    ({ pause:togglePause, stop, again:start, close:() => cap.classList.remove('on') })[b.dataset.tc]();
  });
}

/* ---------- timing that respects pause / stop ---------- */
async function w(ms){
  let left = ms;
  while(left > 0){
    if(T.stopped) throw new Stopped();
    if(T.paused){ await sleep(150); continue; }
    const step = Math.min(100, left); await sleep(step); left -= step;
  }
  if(T.stopped) throw new Stopped();
}
const visible = el => el && el.offsetParent !== null && el.getBoundingClientRect().width > 0;
async function waitFor(sel, max = 30000){
  for(let t = 0; t < max; t += 150){
    const el = typeof sel === 'function' ? sel() : [...document.querySelectorAll(sel)].find(visible);
    if(visible(el)) return el;
    await w(150);
  }
  throw new Error('tour: not found ' + sel);
}

/* ---------- actions ---------- */
async function moveTo(el, mode){
  cursor.className = 'tour-cursor ' + mode;
  const r = el.getBoundingClientRect();
  cursor.style.left = (r.left + r.width/2) + 'px';
  cursor.style.top  = (r.top + r.height/2) + 'px';
  await w(750);
}
async function bring(el){
  const r = el.getBoundingClientRect();
  if(r.top < 60 || r.bottom > innerHeight - 140){ el.scrollIntoView({ behavior:'smooth', block:'center' }); await w(650); }
}
async function click(sel){
  const el = await waitFor(sel); await bring(el); await moveTo(el, 'mouse');
  cursor.classList.add('press'); await w(200);
  el.click(); await w(250); cursor.classList.remove('press'); await w(400);
}
/* Noa looks at a tile: the real dwell engine fills the bar and selects it */
async function look(sel, extra = 450){
  const el = await waitFor(sel); await moveTo(el, 'gaze');
  window.Dwell.force(el);
  await w(state.dwellMs * (+el.dataset.dwell || 1) + extra);
}
async function typeInto(sel, text){
  const el = await waitFor(sel); await moveTo(el, 'mouse'); el.focus();
  el.value = '';
  for(const ch of text){ el.value += ch; await w(230); }
  await w(300);
}
async function hl(sel, ms){
  const el = await waitFor(sel); await bring(el); await moveTo(el, 'mouse');
  el.classList.add('tour-hl');
  try{ await w(ms); } finally { el.classList.remove('tour-hl'); }
}

/* ---------- captions ---------- */
function say(tEn, tHe, xEn, xHe){ T.cap = [tEn, tHe, xEn, xHe]; paint(); }
function paint(){
  if(!T.cap) return;
  const [tEn, tHe, xEn, xHe] = T.cap, n = CH.length;
  cap.classList.add('on');
  cap.innerHTML = `
    <div class="tc-top"><span class="tc-n">${T.ch + 1} / ${n}</span><b class="tc-t">${tr(tEn, tHe)}</b><span class="sp"></span>
      <button class="lang-sw" type="button"></button>
      <button class="btn sm" data-tc="pause">${T.paused ? `${ic('play')} ${tr('Continue','המשך')}` : `${ic('pause')} ${tr('Pause','השהיה')}`}</button>
      <button class="btn sm" data-tc="stop">${ic('x')} ${tr('Explore myself','לחקור לבד')}</button></div>
    <div class="tc-x">${T.paused ? tr('Paused. Click anywhere to continue.','מושהה. לחיצה בכל מקום ממשיכה.') : tr(xEn, xHe)}</div>
    <div class="tc-bar"><i style="width:${Math.round((T.ch + 1) / n * 100)}%"></i></div>`;
  applyStatic();
}
function togglePause(){ if(!T.on) return; T.paused = !T.paused; paint(); try{ T.paused ? speechSynthesis.pause() : speechSynthesis.resume(); }catch(e){} }
addEventListener('langchange', paint);

/* ---------- the script ---------- */
const CORE_ASK = () => CORE()[4];
const CH = [
  async () => {
    say('Connect','התחברות',
        'Rettina opens on the family account. The parent is the responsible adult, so a parent starts Noa\'s day.',
        'רטינה נפתחת בחשבון המשפחתי. ההורה הוא המבוגר האחראי, ולכן היום של נועה מתחיל אצל הורה.');
    App.go(1); await w(1400);
    await hl('.cx-acct', 3800);
    await hl('#roleStudent', 2200);
    await click('#roleAdult');
    say('Connect','התחברות', 'The parent card is pressed, and the parent signs in with a PIN.', 'כרטיס ההורה נבחר, וההורה נכנס עם קוד.');
    await typeInto('#cxPin', '1234');
    await click('#cxGo'); await w(900);
  },
  async () => {
    say('Parent dashboard','לוח הבקרה להורה',
        'The first thing the parent sees, in three columns. Left: a summary of what Noa learned yesterday, what she said, and how sure her answers were.',
        'הדבר הראשון שההורה רואה, בשלוש עמודות. ראשונה: סיכום של מה נועה למדה אתמול, מה היא אמרה, וכמה בטוחות היו התשובות שלה.');
    await hl('.cols3 > .col:nth-child(1) > .card:nth-child(1)', 4200);
    say('Parent dashboard','לוח הבקרה להורה', 'Middle: today\'s schedule, minute by minute, waiting for the parent to confirm.', 'באמצע: הלו״ז של היום, דקה אחר דקה, מחכה לאישור ההורה.');
    await hl('.cols3 > .col:nth-child(2) > .card:nth-child(1)', 4200);
    say('Parent dashboard','לוח הבקרה להורה', 'Right: progress across the school year, by subject, against where she is expected to be by now.', 'מצד שני: התקדמות לאורך שנת הלימודים, לפי מקצוע, מול המקום שבו היא צפויה להיות עכשיו.');
    await hl('.cols3 > .col:nth-child(3) > .card:nth-child(1)', 3200);
    await hl('.cols3 > .col:nth-child(3) > .card:nth-child(2)', 3000);
  },
  async () => {
    say('Review the schedule','בדיקת הלו״ז',
        'Rettina drafts the day from the class plan and yesterday\'s results. The parent can reorder lessons, change topics and adjust the time.',
        'רטינה מכינה את היום מתוכנית הכיתה ומהתוצאות של אתמול. ההורה יכול לשנות סדר, להחליף נושאים ולשנות זמנים.');
    await click('#dashPg [data-act=sched]'); await w(600);
    await hl('.sc-list', 2600);
    await click('#schedPg [data-act=plus][data-i="2"]');
    await click('#schedPg [data-act=minus][data-i="2"]');
    say('Review the schedule','בדיקת הלו״ז',
        'A safety setting for gaze: answers need a second look on ✓, so a stray glance never counts as an answer.',
        'הגדרת בטיחות למבט: תשובה צריכה מבט שני על ✓, כך שמבט אקראי אף פעם לא נספר כתשובה.');
    await hl('#schedPg .col > .card:nth-child(2)', 4200);
    say('Confirm','אישור', 'The parent confirms. Noa will see exactly this plan.', 'ההורה מאשר. נועה תראה בדיוק את התוכנית הזאת.');
    await click('#schedPg [data-act=confirm]'); await w(1800);
  },
  async () => {
    say('Sources','מקורות',
        'Lessons come only from approved sources. The Ministry of Education curriculum is the official backbone (sample entries in this demo).',
        'השיעורים מגיעים רק ממקורות מאושרים. תוכנית הלימודים של משרד החינוך היא הבסיס הרשמי (רשומות לדוגמה בהדגמה).');
    await click('.nav button[data-v="sources"]'); await w(600);
    await hl('#srcMinistry', 4200);
    say('Adding your own files','הוספת קבצים משלכם',
        'A parent can add a school worksheet or any PDF or Word file. It is read right here in the browser and checked for other children\'s names.',
        'הורה יכול להוסיף דף עבודה מבית הספר או כל קובץ PDF או Word. הקובץ נקרא כאן בדפדפן ונבדק לשמות של ילדים אחרים.');
    await hl('#srcDrop', 2600);
    await window.Sources.addSample(); await w(1000);
    await hl('.src-up', 4200);
    say('Approve before Noa sees it','אישור לפני שנועה רואה',
        'Nothing reaches Noa until the parent approves it. From now on her History lessons show both sources.',
        'שום דבר לא מגיע לנועה לפני שההורה מאשר. מעכשיו שיעורי ההיסטוריה שלה מראים את שני המקורות.');
    await click('.src-up [data-src=approve]'); await w(1800);
  },
  async () => {
    say('Hand over to Noa','העברה לנועה',
        'One click switches the screen to Noa\'s mode. The parent picks how she selects: webcam eye gaze, head pointer, or the mouse for this demo.',
        'לחיצה אחת מעבירה את המסך למצב של נועה. ההורה בוחר איך היא בוחרת: מבט עיניים במצלמה, הצבעה בראש, או עכבר בהדגמה הזאת.');
    await click('#toStudent'); await w(500);
    await hl('#modalCard .seg', 2800);
    await click('#modalCard [data-in=mouse]');
    await hl('#modalCard .sw-i:nth-child(4)', 2600);
    await click('#modalCard [data-sw=go]'); await w(1300);
  },
  async () => {
    say('Noa\'s screen','המסך של נועה',
        'Big targets and no menus. Everything works by looking: while Noa looks at a tile, a bar fills, and then it selects.',
        'מטרות גדולות ובלי תפריטים. הכול עובד במבט: כשנועה מסתכלת על משבצת, פס מתמלא, ואז היא נבחרת.');
    await waitFor('#calGo'); await w(2200);
    await look('#calGo');
    say('Calibration','כיול', 'Noa follows nine dots for about 20 seconds. The adult only needs to stay for this part.', 'נועה עוקבת אחרי תשע נקודות במשך כ־20 שניות. המבוגר צריך להישאר רק לחלק הזה.');
    await waitFor('#goToday', 30000);
    say('Noa carries on alone','נועה ממשיכה לבד',
        'Calibration done. The screen tells the adult they can step away: from here Noa learns independently, and the parent gets a notification if she asks for help.',
        'הכיול הושלם. המסך אומר למבוגר שאפשר לזוז הצידה: מכאן נועה לומדת לבד, וההורה מקבל התראה אם היא מבקשת עזרה.');
    await hl('.handoff', 4800);
    await look('#goToday');
  },
  async () => {
    say('Today\'s learning','הלמידה של היום',
        'The plan her parent confirmed, in order. Under it Noa can start learning, or learn something else she chooses.',
        'התוכנית שההורה אישר, לפי הסדר. מתחתיה נועה יכולה להתחיל ללמוד, או ללמוד משהו אחר שהיא בוחרת.');
    await hl('.st-plan', 3400);
    await look('#sStart');
  },
  async () => {
    say('Start learning','מתחילים ללמוד',
        'Lessons in History, English, Math and more, each with how long it takes. The next lesson in the plan is marked.',
        'שיעורים בהיסטוריה, אנגלית, חשבון ועוד, ולכל אחד כמה זמן הוא לוקח. השיעור הבא בתוכנית מסומן.');
    await hl('.st-grid', 3400);
    await look('#sStage [data-t="0"]');
  },
  async () => {
    say('Lesson with Ollie','שיעור עם ינשופי',
        'A simulated AI teacher explains in short paragraphs, read aloud. The middle of the screen is a quiet zone: Noa can read and rest her eyes there, and nothing gets selected.',
        'מורה AI מדומה מסביר בפסקאות קצרות, בהקראה. מרכז המסך הוא אזור שקט: נועה יכולה לקרוא ולהניח שם את העיניים, ושום דבר לא נבחר.');
    if(App.settings.frame){ await waitFor('.fr-center'); await hl('.fr-center', 3600);
      say('Actions live on the edges','הפעולות בשוליים',
          'Every action has a fixed place on the edge, so her eyes learn where to go: Today and Talk on one side, Again and Next on the other.',
          'לכל פעולה יש מקום קבוע בשוליים, כך שהעיניים לומדות לאן ללכת: "היום" ו"לדבר" בצד אחד, "שוב" ו"הבא" בצד השני.');
      await hl('.fr-start', 2400); await hl('.fr-end', 2400); }
    say('Every lesson shows its source','כל שיעור מראה את המקור שלו',
        'The badge shows where this lesson comes from: the Ministry curriculum plus the worksheet the parent approved.',
        'התג מראה מאיפה השיעור מגיע: תוכנית הלימודים של משרד החינוך ודף העבודה שההורה אישר.');
    await hl('.src-badge', 3200);
    await waitFor('#lzCont', 40000); await w(1500);
    await look('#lzCont');
    await waitFor('#lzCont', 40000); await w(800);
    say('Talking back with the word bank','לדבר עם המורה דרך בנק המילים',
        'Noa looks at Talk and a drawer opens with phrases and lesson words. She picks a word, then one of three ready sentences: a full question in two looks.',
        'נועה מסתכלת על "לדבר" ונפתחת מגירה עם משפטים ומילים מהשיעור. היא בוחרת מילה, ואז אחד משלושה משפטים מוכנים: שאלה שלמה בשני מבטים.');
    if(App.settings.frame) await look('#frTalk');
    await look('#bankB [data-w]:nth-child(3)');
    await look('#bankA [data-sq="1"]');
    await w(5200);
    await look('#lzCont');
  },
  async () => {
    say('Answering by looking','עונים במבט',
        'Ollie asks a question with three big answers. Noa first looks at a wrong one…',
        'ינשופי שואל שאלה עם שלוש תשובות גדולות. נועה מסתכלת קודם על תשובה לא נכונה…');
    await waitFor('[data-o]', 40000); await w(800);
    await look('[data-o="1"]');
    say('The second-look safety check','בדיקת הבטיחות של המבט השני',
        'Looking at an answer only marks it. A green ✓ appears, always in the same forward corner. Nothing counts until she looks at the ✓, so she can still change her mind.',
        'מבט על תשובה רק מסמן אותה. ✓ ירוק מופיע, תמיד באותה פינה קדימה. שום דבר לא נספר עד שהיא מסתכלת על ה־✓, כך שאפשר עדיין להתחרט.');
    await w(3200);
    await look('[data-o="0"]');
    await w(1500);
    await look('.cf.on');
    await waitFor('#lzCont', 30000); await w(1400);
  },
  async () => {
    say('Asking for a break','לבקש הפסקה',
        'One look at "I need a break" pauses the lesson and sends the parent a notification.',
        'מבט אחד על "אני צריכה הפסקה" עוצר את השיעור ושולח התראה להורה.');
    if(App.settings.frame) await look('#frTalk');
    await look('#bankA [data-ph=break]');
    await waitFor('#brkDone', 20000); await w(3000);
    await look('#brkDone');
    await waitFor('#lzCont', 30000); await w(800);
    say('Finishing the lesson','סיום השיעור', 'One more paragraph and one more question, then a summary for Noa.', 'עוד פסקה ועוד שאלה, ואז סיכום לנועה.');
    await look('#lzCont');
    await waitFor('#lzCont', 40000); await w(600);
    await look('#lzCont');
    await waitFor('[data-o]', 40000); await w(600);
    await look('[data-o="0"]');
    await look('.cf.on');
    await waitFor('#lzCont', 30000); await w(1000);
    await look('#lzCont');
    if(App.settings.frame){
      await waitFor('#frFwd .fr-go', 30000);
      say('Lesson done','השיעור הסתיים', 'Her score goes to the parent\'s report. Leaving the lesson needs a longer look on Today, so a passing glance never closes it.', 'הציון מגיע לדוח של ההורה. יציאה מהשיעור דורשת מבט ארוך יותר על "היום", כך שמבט חולף לא סוגר אותו.');
      await hl('#frFwd', 2400);
      await look('#frBack');
    } else {
      await waitFor('#lzHome', 30000);
      say('Lesson done','השיעור הסתיים', 'Her score and everything she said go straight to the parent\'s report.', 'הציון וכל מה שהיא אמרה מגיעים ישר לדוח של ההורה.');
      await hl('.lz-end', 2600);
      await look('#lzHome');
    }
  },
  async () => {
    say('Learn something else','ללמוד משהו אחר',
        'Noa can also pick her own topic. A gaze keyboard dims letters that lead nowhere, and the top match is ready after one letter.',
        'נועה יכולה גם לבחור נושא בעצמה. מקלדת המבט מעמעמת אותיות שלא מובילות לשום נושא, וההתאמה הראשונה מוכנה כבר אחרי אות אחת.');
    await look('#sElse');
    await look('#otherBtn');
    await look(`#learnBox [data-k="${tr('H','ס')}"]`);
    await hl('#searchBtn', 2200);
    await look('#searchBtn');
    await w(4500);
  },
  async () => {
    say('Back to the parent','חזרה להורה',
        'The parent unlocks with a PIN. Looking at the screen can never close Noa\'s mode by accident.',
        'ההורה פותח עם קוד. מבט במסך אף פעם לא יסגור את המצב של נועה בטעות.');
    await click('#sExit');
    await typeInto('#exitPin', '1234');
    await click('#modalCard [data-x=go]'); await w(800);
    say('Today so far','היום עד עכשיו', 'The dashboard now shows today\'s lessons, answers, breaks and what Noa said to her teacher.', 'לוח הבקרה מראה עכשיו את השיעורים של היום, התשובות, ההפסקות ומה נועה אמרה למורה.');
    await hl('.cols3 > .col:nth-child(2) > .card:nth-child(2)', 4800);
  },
  async () => {
    say('Conversation in class','שיחה בכיתה',
        'In class, speech runs in the background. Rettina keeps Noa\'s board full of the words she is likely to need right now.',
        'בכיתה, הדיבור רץ ברקע. רטינה ממלאת את הלוח של נועה במילים שהיא כנראה צריכה עכשיו.');
    await click('.nav button[data-v="convo"]');
    await click('#simBtn'); await w(7000);
    say('Conversation in class','שיחה בכיתה',
        'She picks two words, and three full sentences appear. One more look speaks the sentence: 3 looks instead of one per word.',
        'היא בוחרת שתי מילים, ומופיעים שלושה משפטים שלמים. עוד מבט אחד מקריא את המשפט: 3 מבטים במקום מבט לכל מילה.');
    await look(() => [...document.querySelectorAll('#words [data-w]')].find(e => e.dataset.w === CORE_ASK()));
    await w(900);
    await look(() => {
      const tiles = [...document.querySelectorAll('#words .tile.dw:not(.core)')];
      const pref = ['knights','castle','horses','king','knight','אבירים','טירה','סוסים','מלך','ימי הביניים'];
      return tiles.find(e => pref.includes(e.dataset.w)) || tiles[0];
    });
    await waitFor('#sents [data-s]'); await w(1000);
    await look('#sents [data-s]');
    await w(2600);
    q('#simBtn').click();
  },
  async () => {
    say('Accessible homework','שיעורי בית נגישים',
        'The teacher pastes an assignment. Rettina turns it into questions Noa can answer by gaze, and nothing reaches her until the teacher approves.',
        'המורה מדביקה מטלה. רטינה הופכת אותה לשאלות שנועה עונה עליהן במבט, ושום דבר לא מגיע אליה לפני שהמורה מאשרת.');
    await click('.nav button[data-v="hw"]');
    await click('#sampleBtn');
    await click('#genBtn'); await w(3400);
    await click('#thread .msg:last-child .body > .acts:last-child > .btn:first-child'); await w(1500);
  },
  async () => {
    say('Level check','בדיקת רמה',
        'A short adaptive quiz finds her level. It separates "doesn\'t know" from "couldn\'t select": hesitant answers are asked again, and no answer is never counted as wrong.',
        'שאלון קצר ומסתגל מוצא את הרמה שלה. הוא מבדיל בין "לא יודעת" ל"לא הצליחה לבחור": תשובות מהססות נשאלות שוב, ובלי תשובה אף פעם לא נספר כטעות.');
    await click('.nav button[data-v="quiz"]');
    await click('#quizBox [data-p="0"][data-m="watch"]');
    await w(14000);
  },
];

/* ---------- run ---------- */
async function start(){
  ui();
  if(T.on) stop();
  await sleep(60);
  Object.assign(T, { on:true, paused:false, stopped:false, ch:0 });
  document.body.classList.add('touring');
  window.Dwell.locked = true;
  App.reset();
  log('tour.start', Lang.cur);
  try{
    for(T.ch = 0; T.ch < CH.length; T.ch++) await CH[T.ch]();
    finish();
  }catch(e){
    if(!(e instanceof Stopped)){ console.error(e); log('tour.error', e.message); end(); }
  }
}
function end(){
  T.on = false; T.paused = false;
  document.body.classList.remove('touring');
  document.querySelectorAll('.tour-hl').forEach(el => el.classList.remove('tour-hl'));
  if(window.Dwell) window.Dwell.locked = false;
  try{ speechSynthesis.resume(); }catch(e){}
}
function finish(){
  end();
  T.cap = null;
  cap.classList.add('on');
  cap.innerHTML = `
    <div class="tc-top"><b class="tc-t">${tr('End of the demo','סוף ההדגמה')}</b><span class="sp"></span><button class="lang-sw" type="button"></button></div>
    <div class="tc-x">${tr('That was Rettina from sign-in to a full lesson, plus conversation, homework and level check. Everything stays clickable.','זו הייתה רטינה מההתחברות ועד שיעור מלא, ועוד שיחה, שיעורי בית ובדיקת רמה. הכול נשאר לחיץ.')}</div>
    <div class="tc-acts"><button class="btn primary" data-tc="again">${ic('rotate-ccw')} ${tr('Watch again','לצפות שוב')}</button><button class="btn" data-tc="close">${tr('Explore on my own','לחקור לבד')}</button></div>`;
  applyStatic();
}
function stop(){
  if(!T.on){ cap?.classList.remove('on'); return; }
  T.stopped = true; end();
  cap.classList.remove('on');
  hideModal();
}

window.Tour = { start, stop, get on(){ return T.on; } };
})();
